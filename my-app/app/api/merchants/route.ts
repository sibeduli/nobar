import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const merchant = await prisma.merchant.create({
      data: {
        businessName: body.businessName,
        ownerName: body.ownerName,
        email: body.email,
        phone: body.phone,
        contactPerson: body.contactPerson || null,
        venueType: body.venueType,
        capacity: parseInt(body.capacity) || 0,
        provinsi: body.provinsi,
        kabupaten: body.kabupaten,
        kecamatan: body.kecamatan || null,
        kelurahan: body.kelurahan || null,
        alamatLengkap: body.alamatLengkap,
        kodePos: body.kodePos || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        openingHour: body.openingHour || null,
        closingHour: body.closingHour || null,
      },
    });

    return NextResponse.json({ success: true, merchant }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating merchant:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Gagal mendaftar. Silakan coba lagi.' },
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
    const status = searchParams.get('status') || 'all'; // all, licensed, unpaid, unlicensed

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: {
      email: string;
      businessName?: { contains: string; mode: 'insensitive' };
      license?: { status: string } | { isNot: null } | null;
    } = {
      email: session.user.email,
    };

    // Search filter
    if (search) {
      whereClause.businessName = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Status filter
    if (status === 'licensed') {
      whereClause.license = { status: 'paid' };
    } else if (status === 'unpaid') {
      whereClause.license = { status: 'pending' };
    } else if (status === 'unlicensed') {
      whereClause.license = null;
    }

    // Get total count for pagination
    const total = await prisma.merchant.count({
      where: whereClause,
    });

    // Get paginated merchants
    const merchants = await prisma.merchant.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        license: true,
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      merchants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching merchants:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data' },
      { status: 500 }
    );
  }
}
