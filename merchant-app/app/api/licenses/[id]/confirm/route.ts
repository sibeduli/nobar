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
// venueId is a cuid which doesn't contain dashes, so we can safely split
const parseOrderId = (orderId: string) => {
  // Format: NOBAR-{venueId}-{tier}-{timestamp}
  // Example: NOBAR-cmlniy0se0005ogsonwo22siw-2-1739612345678
  const match = orderId.match(/^NOBAR-([a-z0-9]+)-(\d+)-(\d+)$/);
  if (!match) return null;
  return {
    venueId: match[1],
    tier: parseInt(match[2], 10),
  };
};

// Called after successful payment to confirm and create license
// The {id} param is now venueId for consistency
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: venueId } = await params;
    const session = await auth();
    const body = await request.json();
    const { orderId } = body;

    console.log('[CONFIRM] Starting confirmation for venueId:', venueId, 'orderId:', orderId);

    // Parse order_id to verify it matches the venue
    const orderData = parseOrderId(orderId);
    console.log('[CONFIRM] Parsed orderData:', orderData);
    
    if (!orderData || orderData.venueId !== venueId) {
      console.log('[CONFIRM] Order validation failed. orderData.venueId:', orderData?.venueId, 'expected venueId:', venueId);
      return NextResponse.json(
        { success: false, error: 'Invalid order' },
        { status: 400 }
      );
    }

    // Find the venue
    const venue = await prisma.merchant.findUnique({
      where: { id: venueId },
      include: { license: true },
    });

    if (!venue) {
      return NextResponse.json(
        { success: false, error: 'Venue tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check ownership - require auth
    if (!session?.user?.email || venue.email !== session.user.email) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if license already exists (idempotency)
    if (venue.license) {
      return NextResponse.json({ success: true, license: venue.license, message: 'License already exists' });
    }

    // Verify with Midtrans that payment is actually successful
    try {
      const statusResponse = await coreApi.transaction.status(orderId);
      
      // Accept 'capture', 'settlement', or 'pending' - onSuccess callback fires before Midtrans fully settles
      // In sandbox, credit card payments return 'capture', VA returns 'pending' then 'settlement'
      const isSuccessful = 
        statusResponse.transaction_status === 'capture' ||
        statusResponse.transaction_status === 'settlement' ||
        statusResponse.transaction_status === 'pending';
      
      if (isSuccessful) {
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
            return NextResponse.json({ success: true, license: existingLicense, message: 'License already exists' });
          }
          throw createError;
        }

        // Log payment success activity
        await logActivity({
          userEmail: venue.email,
          action: 'PAYMENT_SUCCESS',
          description: `Pembayaran berhasil untuk venue: ${venue.businessName}`,
          metadata: { venueId: venue.id, venueName: venue.businessName, licenseId: license.id, orderId },
        });

        return NextResponse.json({ success: true, license });
      } else {
        return NextResponse.json(
          { success: false, error: 'Payment not confirmed', status: statusResponse.transaction_status },
          { status: 400 }
        );
      }
    } catch (midtransError) {
      console.error('Midtrans verification error:', midtransError);
      return NextResponse.json(
        { success: false, error: 'Failed to verify payment with Midtrans' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error confirming license:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengkonfirmasi lisensi' },
      { status: 500 }
    );
  }
}
