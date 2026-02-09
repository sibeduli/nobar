import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const merchant = await prisma.merchant.findUnique({
      where: { id },
      include: { license: true },
    });

    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Venue tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, merchant });
  } catch (error) {
    console.error('Error fetching merchant:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const merchant = await prisma.merchant.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, merchant });
  } catch (error) {
    console.error('Error updating merchant:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate data' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.merchant.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting merchant:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus data' },
      { status: 500 }
    );
  }
}
