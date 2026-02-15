import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity';
import crypto from 'crypto';

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

// Midtrans webhook notification handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Midtrans webhook received:', JSON.stringify(body, null, 2));

    const {
      order_id,
      transaction_status,
      fraud_status,
      signature_key,
      status_code,
      gross_amount,
      transaction_id,
      payment_type,
      transaction_time,
      bank,
      va_numbers,
      card_type,
      masked_card,
    } = body;

    // Verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    if (signature_key !== expectedSignature) {
      console.error('Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Parse order_id to get venueId and tier
    const orderData = parseOrderId(order_id);
    if (!orderData) {
      console.error('Invalid order_id format:', order_id);
      return NextResponse.json({ error: 'Invalid order_id format' }, { status: 400 });
    }

    // Fetch venue
    const venue = await prisma.merchant.findUnique({
      where: { id: orderData.venueId },
      include: { license: true },
    });

    if (!venue) {
      console.error('Venue not found for order_id:', order_id);
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Determine if payment is successful
    const isSuccess =
      (transaction_status === 'capture' && fraud_status === 'accept') ||
      transaction_status === 'settlement';

    // Extract VA number if available
    const vaNumber = va_numbers?.[0]?.va_number || null;

    // Create license on successful payment
    if (isSuccess) {
      // Check if license already exists (idempotency)
      if (venue.license) {
        console.log('License already exists for venue:', venue.id);
        return NextResponse.json({ success: true, message: 'License already exists' });
      }

      const price = calculateTotalPrice(orderData.tier);
      if (!price) {
        console.error('Invalid tier:', orderData.tier);
        return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
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
            midtransId: order_id,
            transactionId: transaction_id,
            paymentType: payment_type,
            transactionStatus: transaction_status,
            transactionTime: transaction_time ? new Date(transaction_time) : null,
            grossAmount: gross_amount,
            bank: bank || null,
            vaNumber: vaNumber,
            cardType: card_type || null,
            maskedCard: masked_card || null,
          },
        });

        // Log activity
        await logActivity({
          userEmail: venue.email,
          action: 'PAYMENT_SUCCESS',
          description: `Pembayaran berhasil untuk venue: ${venue.businessName}`,
          metadata: {
            venueId: venue.id,
            venueName: venue.businessName,
            licenseId: license.id,
            orderId: order_id,
            paymentType: payment_type,
          },
        });

        console.log('License created for venue:', venue.id, 'license:', license.id);
      } catch (createError: unknown) {
        // Handle race condition - license already created by client-side check
        if (createError && typeof createError === 'object' && 'code' in createError && createError.code === 'P2002') {
          console.log('License already exists for venue (race condition):', venue.id);
        } else {
          throw createError;
        }
      }
    } else {
      console.log('Payment not successful, status:', transaction_status);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Still return 200 to prevent Midtrans from retrying
    return NextResponse.json({ success: true });
  }
}
