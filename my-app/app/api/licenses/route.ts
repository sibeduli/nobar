import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Server-side pricing - cannot be tampered with
const LICENSE_TIERS: Record<number, { price: number }> = {
  1: { price: 5000000 },
  2: { price: 10000000 },
  3: { price: 20000000 },
  4: { price: 40000000 },
  5: { price: 100000000 },
};

const APPLICATION_FEE = 5000;
const VAT_RATE = 0.12;

const calculateTotalPrice = (tier: number) => {
  const tierData = LICENSE_TIERS[tier];
  if (!tierData) return null;
  
  const basePrice = tierData.price;
  const ppn = Math.round(basePrice * VAT_RATE);
  const total = basePrice + ppn + APPLICATION_FEE;
  
  return { basePrice, ppn, applicationFee: APPLICATION_FEE, total };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { venueId } = body;

    // Check if venue exists
    const venue = await prisma.merchant.findUnique({
      where: { id: venueId },
      include: { license: true },
    });

    if (!venue) {
      return NextResponse.json(
        { success: false, error: 'Venue tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get tier from venue's capacity (which stores the tier number)
    const tier = venue.capacity;
    
    // Calculate price server-side - ignore any price sent from client
    const pricing = calculateTotalPrice(tier);
    if (!pricing) {
      return NextResponse.json(
        { success: false, error: 'Tier tidak valid' },
        { status: 400 }
      );
    }

    // Check if license already exists
    if (venue.license) {
      // Update existing license
      const license = await prisma.license.update({
        where: { id: venue.license.id },
        data: {
          tier,
          price: pricing.total, // Server-calculated total
          status: 'unpaid',
        },
      });
      return NextResponse.json({ success: true, license, pricing });
    }

    // Create new license
    const license = await prisma.license.create({
      data: {
        venueId,
        tier,
        price: pricing.total, // Server-calculated total
        status: 'unpaid',
      },
    });

    return NextResponse.json({ success: true, license, pricing }, { status: 201 });
  } catch (error) {
    console.error('Error creating license:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat lisensi' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only return licenses for venues owned by the current user
    const licenses = await prisma.license.findMany({
      where: {
        venue: {
          email: session.user.email,
        },
      },
      include: {
        venue: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, licenses });
  } catch (error) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data' },
      { status: 500 }
    );
  }
}
