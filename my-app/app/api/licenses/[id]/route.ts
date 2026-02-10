import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Get single license by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const license = await prisma.license.findUnique({
      where: { id },
      include: {
        venue: {
          select: {
            id: true,
            businessName: true,
            venueType: true,
            ownerName: true,
            email: true,
            phone: true,
            contactPerson: true,
            alamatLengkap: true,
            kabupaten: true,
            provinsi: true,
          },
        },
      },
    });

    if (!license) {
      return NextResponse.json(
        { success: false, error: 'License tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if the current user owns this license
    const isOwner = session?.user?.email === license.venue.email;

    return NextResponse.json({ 
      success: true, 
      license: {
        ...license,
        isOwner,
      }
    });
  } catch (error) {
    console.error('Error fetching license:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data lisensi' },
      { status: 500 }
    );
  }
}
