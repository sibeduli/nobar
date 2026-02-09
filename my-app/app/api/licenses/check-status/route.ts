import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { coreApi } from '@/lib/midtrans';

// Check and update license status based on Midtrans order ID
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID required' },
        { status: 400 }
      );
    }

    // Find license by midtransId
    const license = await prisma.license.findFirst({
      where: { midtransId: orderId },
    });

    if (!license) {
      return NextResponse.json(
        { success: false, error: 'License tidak ditemukan untuk order ini' },
        { status: 404 }
      );
    }

    // Check status with Midtrans
    try {
      const statusResponse = await coreApi.transaction.status(orderId);
      console.log('Midtrans status:', statusResponse);

      if (
        statusResponse.transaction_status === 'capture' ||
        statusResponse.transaction_status === 'settlement'
      ) {
        // Payment confirmed - activate license
        const updatedLicense = await prisma.license.update({
          where: { id: license.id },
          data: {
            status: 'paid',
            paidAt: new Date(),
          },
        });

        return NextResponse.json({ 
          success: true, 
          license: updatedLicense,
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
