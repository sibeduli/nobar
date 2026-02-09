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
      await prisma.license.updateMany({
        where: { midtransId: order_id },
        data: {
          status: 'paid',
          paidAt: new Date(),
        },
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
