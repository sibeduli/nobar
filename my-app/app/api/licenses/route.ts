import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { venueId, tier, price } = body;

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

    // Check if license already exists
    if (venue.license) {
      // Update existing license
      const license = await prisma.license.update({
        where: { id: venue.license.id },
        data: {
          tier,
          price,
          status: 'unpaid',
        },
      });
      return NextResponse.json({ success: true, license });
    }

    // Create new license
    const license = await prisma.license.create({
      data: {
        venueId,
        tier,
        price,
        status: 'unpaid',
      },
    });

    return NextResponse.json({ success: true, license }, { status: 201 });
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
    const licenses = await prisma.license.findMany({
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
