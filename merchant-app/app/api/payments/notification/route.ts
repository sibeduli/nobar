import { NextRequest, NextResponse } from 'next/server';
import { coreApi } from '@/lib/midtrans';
import { prisma } from '@/lib/prisma';

// Midtrans will call this webhook when payment status changes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id } = body;

    // Verify transaction status with Midtrans
    const statusResponse = await coreApi.transaction.status(order_id);

    let paymentStatus = 'pending';

    if (statusResponse.transaction_status === 'capture') {
      if (statusResponse.fraud_status === 'accept') {
        paymentStatus = 'paid';
      }
    } else if (statusResponse.transaction_status === 'settlement') {
      paymentStatus = 'paid';
    } else if (
      statusResponse.transaction_status === 'cancel' ||
      statusResponse.transaction_status === 'deny' ||
      statusResponse.transaction_status === 'expire'
    ) {
      paymentStatus = 'failed';
    } else if (statusResponse.transaction_status === 'pending') {
      paymentStatus = 'pending';
    }

    // Update license status if payment is successful
    if (paymentStatus === 'paid') {
      // Extract payment details from Midtrans response
      const paymentData: Record<string, unknown> = {
        status: 'paid',
        paidAt: new Date(),
        transactionId: statusResponse.transaction_id,
        paymentType: statusResponse.payment_type,
        transactionStatus: statusResponse.transaction_status,
        transactionTime: statusResponse.transaction_time ? new Date(statusResponse.transaction_time) : null,
        grossAmount: statusResponse.gross_amount,
      };

      // Add bank transfer details
      if (statusResponse.va_numbers && statusResponse.va_numbers.length > 0) {
        paymentData.bank = statusResponse.va_numbers[0].bank;
        paymentData.vaNumber = statusResponse.va_numbers[0].va_number;
      }
      
      // Add permata VA
      if (statusResponse.permata_va_number) {
        paymentData.bank = 'permata';
        paymentData.vaNumber = statusResponse.permata_va_number;
      }

      // Add credit card details
      if (statusResponse.card_type) {
        paymentData.cardType = statusResponse.card_type;
      }
      if (statusResponse.masked_card) {
        paymentData.maskedCard = statusResponse.masked_card;
      }

      await prisma.license.updateMany({
        where: { midtransId: order_id },
        data: paymentData,
      });
    }

    console.log(`Payment ${order_id} status: ${paymentStatus}`);

    return NextResponse.json({ success: true, status: paymentStatus });
  } catch (error) {
    console.error('Payment notification error:', error);
    return NextResponse.json(
      { error: 'Failed to process notification' },
      { status: 500 }
    );
  }
}
