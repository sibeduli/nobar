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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { licenseId } = body;

    // Fetch license with venue to get tier and venue name
    const license = await prisma.license.findUnique({
      where: { id: licenseId },
      include: { venue: true },
    });

    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }

    // Check ownership
    if (license.venue.email !== session.user.email) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Calculate price server-side based on license tier - ignore any amount from client
    const pricing = calculateTotalPrice(license.tier);
    if (!pricing) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Verify sum matches total (for debugging)
    const itemSum = pricing.basePrice + pricing.ppn + pricing.applicationFee;
    console.log('Payment pricing:', { 
      basePrice: pricing.basePrice, 
      ppn: pricing.ppn, 
      applicationFee: pricing.applicationFee, 
      total: pricing.total,
      itemSum,
      match: itemSum === pricing.total
    });

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
        gross_amount: pricing.total, // Server-calculated total
      },
      customer_details: {
        first_name: session.user.name || 'Customer',
        email: session.user.email || '',
      },
      item_details: [
        {
          id: `license-tier-${license.tier}`,
          price: pricing.basePrice,
          quantity: 1,
          name: `Lisensi Tier ${license.tier}`.substring(0, 50),
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
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
