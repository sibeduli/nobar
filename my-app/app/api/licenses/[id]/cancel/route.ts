import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Cancel a pending Midtrans transaction
// Note: License doesn't exist until payment succeeds, so this just cancels the Midtrans transaction
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: venueId } = await params;
    const { orderId } = await request.json();

    // Cancel transaction in Midtrans if orderId provided
    if (orderId) {
      try {
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const authString = Buffer.from(`${serverKey}:`).toString('base64');
        const baseUrl = process.env.MIDTRANS_IS_PRODUCTION === 'true' 
          ? 'https://api.midtrans.com' 
          : 'https://api.sandbox.midtrans.com';

        const response = await fetch(
          `${baseUrl}/v2/${orderId}/cancel`,
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

    return NextResponse.json({ success: true, message: 'Payment cancelled', venueId });
  } catch (error) {
    console.error('Error cancelling payment:', error);
    return NextResponse.json({ success: false, error: 'Failed to cancel payment' }, { status: 500 });
  }
}
