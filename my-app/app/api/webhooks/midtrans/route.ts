import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity';
import crypto from 'crypto';

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

    // Find license by midtransId (order_id)
    const license = await prisma.license.findFirst({
      where: { midtransId: order_id },
      include: { venue: true },
    });

    if (!license) {
      console.error('License not found for order_id:', order_id);
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }

    // Determine if payment is successful
    const isSuccess =
      (transaction_status === 'capture' && fraud_status === 'accept') ||
      transaction_status === 'settlement';

    const isPending =
      transaction_status === 'pending';

    const isFailed =
      transaction_status === 'deny' ||
      transaction_status === 'cancel' ||
      transaction_status === 'expire';

    // Extract VA number if available
    const vaNumber = va_numbers?.[0]?.va_number || null;

    // Update license based on status
    if (isSuccess) {
      await prisma.license.update({
        where: { id: license.id },
        data: {
          status: 'paid',
          paidAt: new Date(),
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
        userEmail: license.venue.email,
        action: 'PAYMENT_SUCCESS',
        description: `Pembayaran berhasil untuk venue: ${license.venue.businessName}`,
        metadata: {
          venueId: license.venueId,
          venueName: license.venue.businessName,
          licenseId: license.id,
          orderId: order_id,
          paymentType: payment_type,
        },
      });

      console.log('Payment success for license:', license.id);
    } else if (isPending) {
      await prisma.license.update({
        where: { id: license.id },
        data: {
          transactionId: transaction_id,
          paymentType: payment_type,
          transactionStatus: transaction_status,
          bank: bank || null,
          vaNumber: vaNumber,
        },
      });

      console.log('Payment pending for license:', license.id);
    } else if (isFailed) {
      await prisma.license.update({
        where: { id: license.id },
        data: {
          transactionStatus: transaction_status,
          midtransId: null, // Clear so user can retry
          transactionId: null,
        },
      });

      console.log('Payment failed/cancelled for license:', license.id);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Still return 200 to prevent Midtrans from retrying
    return NextResponse.json({ success: true });
  }
}
