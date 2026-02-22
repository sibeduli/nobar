import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

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

// POST /api/licenses - Get pricing info for a venue (no longer creates License)
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

    // Check if already licensed
    if (venue.license) {
      return NextResponse.json(
        { success: false, error: 'Venue sudah memiliki lisensi aktif' },
        { status: 400 }
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

    // Return pricing info only - License is created on payment success
    return NextResponse.json({ 
      success: true, 
      venueId,
      tier,
      pricing,
    });
  } catch (error) {
    console.error('Error getting license pricing:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mendapatkan harga lisensi' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    // Status filter removed - all licenses are active by definition

    const skip = (page - 1) * limit;

    // Build where clause
    type WhereClause = {
      venue: {
        email: string;
        businessName?: { contains: string; mode: 'insensitive' };
      };
    };

    const whereClause: WhereClause = {
      venue: {
        email: session.user.email,
      },
    };

    // Search filter
    if (search) {
      whereClause.venue.businessName = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // No status filter needed - all licenses are active

    // Get total count for pagination
    const total = await prisma.license.count({
      where: whereClause,
    });

    // Get paginated licenses
    const licenses = await prisma.license.findMany({
      where: whereClause,
      include: {
        venue: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      licenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data' },
      { status: 500 }
    );
  }
}
