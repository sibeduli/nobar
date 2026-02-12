import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email;

    // Fetch all data in parallel
    const [
      venues,
      licenses,
      recentActivities,
      stats,
    ] = await Promise.all([
      // Last 3 venues
      prisma.merchant.findMany({
        where: { email: userEmail },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          businessName: true,
          kabupaten: true,
          createdAt: true,
        },
      }),
      // Last 3 licenses with venue info
      prisma.license.findMany({
        where: { venue: { email: userEmail } },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: {
          venue: {
            select: {
              businessName: true,
            },
          },
        },
      }),
      // Last 3 activities (excluding LOGIN/LOGOUT)
      prisma.activityLog.findMany({
        where: {
          userEmail,
          action: {
            notIn: ['LOGIN', 'LOGOUT'],
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      // Stats
      Promise.all([
        prisma.merchant.count({ where: { email: userEmail } }),
        prisma.license.count({ where: { venue: { email: userEmail }, status: 'paid' } }),
        prisma.license.aggregate({
          where: { venue: { email: userEmail }, status: 'paid' },
          _sum: { price: true },
        }),
        prisma.license.count({ where: { venue: { email: userEmail }, status: 'unpaid' } }),
      ]),
    ]);

    const [totalVenues, activeLicenses, totalPaid, pendingLicenses] = stats;

    return NextResponse.json({
      success: true,
      data: {
        venues,
        licenses,
        recentActivities,
        stats: {
          totalVenues,
          activeLicenses,
          totalPaid: totalPaid._sum.price || 0,
          pendingLicenses,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
