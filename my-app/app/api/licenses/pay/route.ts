import { NextRequest, NextResponse } from 'next/server';
import { snap } from '@/lib/midtrans';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { licenseId, venueName, amount, tier } = body;

    // Generate unique order ID
    const orderId = `NOBAR-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Update license with midtrans order ID
    await prisma.license.update({
      where: { id: licenseId },
      data: { midtransId: orderId },
    });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: session.user.name || 'Customer',
        email: session.user.email || '',
      },
      item_details: [
        {
          id: `license-tier-${tier}`,
          price: amount,
          quantity: 1,
          name: `Lisensi Nobar Tier ${tier} - ${venueName}`,
        },
      ],
      callbacks: {
        finish: `${process.env.NEXTAUTH_URL}/dashboard/payments?order_id=${orderId}`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_id: orderId,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
