import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { coreApi } from '@/lib/midtrans';
import { logActivity } from '@/lib/activity';

// Server-side pricing for license creation
const LICENSE_TIERS: Record<number, { price: number }> = {
  1: { price: 5000000 },
  2: { price: 10000000 },
  3: { price: 20000000 },
  4: { price: 40000000 },
  5: { price: 100000000 },
};

const APPLICATION_FEE = 5000;
const VAT_RATE = 0.12;

const calculateTotalPrice = (tier: number) => {
  const tierData = LICENSE_TIERS[tier];
  if (!tierData) return null;
  const basePrice = tierData.price;
  const ppn = Math.round(basePrice * VAT_RATE);
  const total = basePrice + ppn + APPLICATION_FEE;
  return total;
};

// Parse order_id format: NOBAR-{venueId}-{tier}-{timestamp}
const parseOrderId = (orderId: string) => {
  const parts = orderId.split('-');
  if (parts.length < 4 || parts[0] !== 'NOBAR') return null;
  return {
    venueId: parts[1],
    tier: parseInt(parts[2], 10),
  };
};

// Check Midtrans status and create license if payment succeeded
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID required' },
        { status: 400 }
      );
    }

    // Parse order_id to get venueId and tier
    const orderData = parseOrderId(orderId);
    if (!orderData) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    // Find venue
    const venue = await prisma.merchant.findUnique({
      where: { id: orderData.venueId },
      include: { license: true },
    });

    if (!venue) {
      return NextResponse.json(
        { success: false, error: 'Venue tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check ownership
    if (venue.email !== session.user.email) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // If license already exists, return it
    if (venue.license) {
      return NextResponse.json({ 
        success: true, 
        license: venue.license,
        message: 'License already exists'
      });
    }

    // Check status with Midtrans
    try {
      const statusResponse = await coreApi.transaction.status(orderId);
      console.log('Midtrans status:', statusResponse);

      if (
        statusResponse.transaction_status === 'capture' ||
        statusResponse.transaction_status === 'settlement'
      ) {
        const price = calculateTotalPrice(orderData.tier);
        if (!price) {
          return NextResponse.json({ success: false, error: 'Invalid tier' }, { status: 400 });
        }

        // Create license (handle race condition with unique constraint)
        let license;
        try {
          license = await prisma.license.create({
            data: {
              venueId: venue.id,
              tier: orderData.tier,
              price,
              paidAt: new Date(),
              midtransId: orderId,
              transactionId: statusResponse.transaction_id,
              paymentType: statusResponse.payment_type,
              transactionStatus: statusResponse.transaction_status,
              transactionTime: statusResponse.transaction_time ? new Date(statusResponse.transaction_time) : null,
              grossAmount: statusResponse.gross_amount,
              bank: statusResponse.va_numbers?.[0]?.bank || (statusResponse.permata_va_number ? 'permata' : null),
              vaNumber: statusResponse.va_numbers?.[0]?.va_number || statusResponse.permata_va_number || null,
              cardType: statusResponse.card_type || null,
              maskedCard: statusResponse.masked_card || null,
            },
          });
        } catch (createError: unknown) {
          // Handle race condition - license already created by webhook/another request
          if (createError && typeof createError === 'object' && 'code' in createError && createError.code === 'P2002') {
            const existingLicense = await prisma.license.findUnique({ where: { venueId: venue.id } });
            return NextResponse.json({ success: true, license: existingLicense, message: 'License already exists', midtransStatus: statusResponse.transaction_status });
          }
          throw createError;
        }

        // Log activity
        await logActivity({
          userEmail: venue.email,
          action: 'PAYMENT_SUCCESS',
          description: `Pembayaran berhasil untuk venue: ${venue.businessName}`,
          metadata: { venueId: venue.id, venueName: venue.businessName, licenseId: license.id, orderId },
        });

        return NextResponse.json({ 
          success: true, 
          license,
          midtransStatus: statusResponse.transaction_status 
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Payment not yet confirmed',
          midtransStatus: statusResponse.transaction_status,
        });
      }
    } catch (midtransError) {
      console.error('Midtrans error:', midtransError);
      return NextResponse.json(
        { success: false, error: 'Failed to check Midtrans status' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error checking license status:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memeriksa status' },
      { status: 500 }
    );
  }
}
