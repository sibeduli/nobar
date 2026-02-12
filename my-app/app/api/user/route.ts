import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity';

// Get or create user profile
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || null,
          image: session.user.image || null,
          lastLoginAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {
        phone: body.phone || null,
        billingAddress: body.billingAddress || null,
        companyName: body.companyName || null,
        companyRole: body.companyRole || null,
      },
      create: {
        email: session.user.email,
        name: session.user.name || null,
        image: session.user.image || null,
        phone: body.phone || null,
        billingAddress: body.billingAddress || null,
        companyName: body.companyName || null,
        companyRole: body.companyRole || null,
        lastLoginAt: new Date(),
      },
    });

    // Log activity
    await logActivity({
      userEmail: session.user.email,
      action: 'PROFILE_UPDATE',
      description: 'Memperbarui profil pengguna',
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
