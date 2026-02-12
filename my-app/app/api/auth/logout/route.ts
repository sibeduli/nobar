import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function POST() {
  try {
    const session = await auth();
    
    if (session?.user?.email) {
      await logActivity({
        userEmail: session.user.email,
        action: 'LOGOUT',
        description: 'Keluar dari akun',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging logout:', error);
    return NextResponse.json({ success: true }); // Don't fail logout if logging fails
  }
}
