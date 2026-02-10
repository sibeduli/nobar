import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get single license by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const license = await prisma.license.findUnique({
      where: { id },
      include: {
        venue: {
          select: {
            id: true,
            businessName: true,
            ownerName: true,
            email: true,
            phone: true,
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

    return NextResponse.json({ success: true, license });
  } catch (error) {
    console.error('Error fetching license:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data lisensi' },
      { status: 500 }
    );
  }
}
