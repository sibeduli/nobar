import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { coreApi } from '@/lib/midtrans';

// Called after successful payment to confirm and activate license
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const body = await request.json();
    const { orderId } = body;

    // Find the license with venue info
    const license = await prisma.license.findUnique({
      where: { id },
      include: { venue: true },
    });

    if (!license) {
      return NextResponse.json(
        { success: false, error: 'License tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check ownership
    if (session?.user?.email && license.venue.email !== session.user.email) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Verify with Midtrans that payment is actually successful
    try {
      const statusResponse = await coreApi.transaction.status(orderId);
      
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
          where: { id },
          data: paymentData,
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
