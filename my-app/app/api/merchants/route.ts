import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

export async function GET() {
  try {
    const merchants = await prisma.merchant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        license: true,
      },
    });
    return NextResponse.json({ success: true, merchants });
  } catch (error) {
    console.error('Error fetching merchants:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data' },
      { status: 500 }
    );
  }
}
