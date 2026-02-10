import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { coreApi } from '@/lib/midtrans';

// Check and update license status based on Midtrans order ID
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID required' },
        { status: 400 }
      );
    }

    // Find license by midtransId with venue info
    const license = await prisma.license.findFirst({
      where: { midtransId: orderId },
      include: { venue: true },
    });

    if (!license) {
      return NextResponse.json(
        { success: false, error: 'License tidak ditemukan untuk order ini' },
        { status: 404 }
      );
    }

    // Check ownership
    if (license.venue.email !== session.user.email) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
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

        // Payment confirmed - activate license with details
        const updatedLicense = await prisma.license.update({
          where: { id: license.id },
          data: paymentData,
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
