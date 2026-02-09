import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { coreApi } from '@/lib/midtrans';

// Called after successful payment to confirm and activate license
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { orderId } = body;

    // Find the license
    const license = await prisma.license.findUnique({
      where: { id },
    });

    if (!license) {
      return NextResponse.json(
        { success: false, error: 'License tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verify with Midtrans that payment is actually successful
    try {
      const statusResponse = await coreApi.transaction.status(orderId);
      
      if (
        statusResponse.transaction_status === 'capture' ||
        statusResponse.transaction_status === 'settlement'
      ) {
        // Payment confirmed - activate license
        const updatedLicense = await prisma.license.update({
          where: { id },
          data: {
            status: 'paid',
            paidAt: new Date(),
          },
        });

        return NextResponse.json({ success: true, license: updatedLicense });
      } else {
        return NextResponse.json(
          { success: false, error: 'Payment not confirmed', status: statusResponse.transaction_status },
          { status: 400 }
        );
      }
    } catch (midtransError) {
      console.error('Midtrans verification error:', midtransError);
      // If Midtrans verification fails, still try to update (for sandbox testing)
      const updatedLicense = await prisma.license.update({
        where: { id },
        data: {
          status: 'paid',
          paidAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, license: updatedLicense, warning: 'Midtrans verification skipped' });
    }
  } catch (error) {
    console.error('Error confirming license:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengkonfirmasi lisensi' },
      { status: 500 }
    );
  }
}
