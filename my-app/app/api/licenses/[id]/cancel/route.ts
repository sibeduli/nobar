import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { orderId } = await request.json();

    // Get license and verify ownership
    const license = await prisma.license.findUnique({
      where: { id },
      include: { venue: true },
    });

    if (!license) {
      return NextResponse.json({ success: false, error: 'License not found' }, { status: 404 });
    }

    if (license.venue.email !== session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // Only cancel if still unpaid
    if (license.status === 'paid') {
      return NextResponse.json({ success: false, error: 'License already paid' }, { status: 400 });
    }

    // Cancel transaction in Midtrans
    if (orderId) {
      try {
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const authString = Buffer.from(`${serverKey}:`).toString('base64');

        const response = await fetch(
          `https://api.sandbox.midtrans.com/v2/${orderId}/cancel`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${authString}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const result = await response.json();
        console.log('Midtrans cancel response:', result);
      } catch (midtransError) {
        // Log but don't fail - transaction might already be expired/cancelled
        console.error('Midtrans cancel error:', midtransError);
      }
    }

    // Clear the midtrans ID from license
    await prisma.license.update({
      where: { id },
      data: {
        midtransId: null,
        transactionId: null,
        transactionStatus: null,
      },
    });

    return NextResponse.json({ success: true, message: 'Payment cancelled' });
  } catch (error) {
    console.error('Error cancelling payment:', error);
    return NextResponse.json({ success: false, error: 'Failed to cancel payment' }, { status: 500 });
  }
}
