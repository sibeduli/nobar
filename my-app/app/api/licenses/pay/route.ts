import { NextRequest, NextResponse } from 'next/server';
import { snap } from '@/lib/midtrans';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Server-side pricing - cannot be tampered with
const LICENSE_TIERS: Record<number, { price: number; label: string }> = {
  1: { price: 5000000, label: '≤50 orang' },
  2: { price: 10000000, label: '51-100 orang' },
  3: { price: 20000000, label: '101-250 orang' },
  4: { price: 40000000, label: '251-500 orang' },
  5: { price: 100000000, label: '501-1000 orang' },
};

const APPLICATION_FEE = 5000;
const VAT_RATE = 0.12;

const calculateTotalPrice = (tier: number) => {
  const tierData = LICENSE_TIERS[tier];
  if (!tierData) return null;
  
  const basePrice = tierData.price;
  const ppn = Math.round(basePrice * VAT_RATE);
  const total = basePrice + ppn + APPLICATION_FEE;
  
  return { basePrice, ppn, applicationFee: APPLICATION_FEE, total, label: tierData.label };
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { venueId } = body;

    // Fetch venue to get tier
    const venue = await prisma.merchant.findUnique({
      where: { id: venueId },
      include: { license: true },
    });

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Check ownership
    if (venue.email !== session.user.email) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if already licensed
    if (venue.license) {
      return NextResponse.json({ error: 'Venue sudah memiliki lisensi aktif' }, { status: 400 });
    }

    const tier = venue.capacity;

    // Calculate price server-side based on tier - ignore any amount from client
    const pricing = calculateTotalPrice(tier);
    if (!pricing) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Generate unique order ID that encodes venueId and tier for webhook processing
    const orderId = `NOBAR-${venueId}-${tier}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: pricing.total, // Server-calculated total
      },
      customer_details: {
        first_name: session.user.name || 'Customer',
        email: session.user.email || '',
      },
      item_details: [
        {
          id: `license-tier-${tier}`,
          price: pricing.basePrice,
          quantity: 1,
          name: `Lisensi Tier ${tier}`.substring(0, 50),
        },
        {
          id: 'ppn',
          price: pricing.ppn,
          quantity: 1,
          name: 'PPN 12%',
        },
        {
          id: 'app-fee',
          price: pricing.applicationFee,
          quantity: 1,
          name: 'Biaya Aplikasi',
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
      venueId,
      tier,
      pricing,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
