import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
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

    // Check ownership
    if (merchant.email !== session.user.email) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
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
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Check if venue exists and belongs to user
    const existingMerchant = await prisma.merchant.findUnique({
      where: { id },
      include: { license: true },
    });

    if (!existingMerchant) {
      return NextResponse.json(
        { success: false, error: 'Venue tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check ownership
    if (existingMerchant.email !== session.user.email) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    if (existingMerchant.license?.status === 'paid') {
      return NextResponse.json(
        { success: false, error: 'Venue dengan lisensi aktif tidak dapat diedit' },
        { status: 403 }
      );
    }

    const merchant = await prisma.merchant.update({
      where: { id },
      data: body,
    });

    // Log activity
    await logActivity({
      userEmail: session.user.email,
      action: 'VENUE_UPDATE',
      description: `Memperbarui venue: ${merchant.businessName}`,
      metadata: { venueId: merchant.id, venueName: merchant.businessName },
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
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if venue exists and belongs to user
    const existingMerchant = await prisma.merchant.findUnique({
      where: { id },
      include: { license: true },
    });

    if (!existingMerchant) {
      return NextResponse.json(
        { success: false, error: 'Venue tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check ownership
    if (existingMerchant.email !== session.user.email) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    if (existingMerchant.license?.status === 'paid') {
      return NextResponse.json(
        { success: false, error: 'Venue dengan lisensi aktif tidak dapat dihapus' },
        { status: 403 }
      );
    }

    const venueName = existingMerchant.businessName;

    await prisma.merchant.delete({
      where: { id },
    });

    // Log activity
    await logActivity({
      userEmail: session.user.email,
      action: 'VENUE_DELETE',
      description: `Menghapus venue: ${venueName}`,
      metadata: { venueId: id, venueName },
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
