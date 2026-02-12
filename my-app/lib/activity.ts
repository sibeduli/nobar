import { prisma } from './prisma';

export type ActivityAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'VENUE_CREATE'
  | 'VENUE_UPDATE'
  | 'VENUE_DELETE'
  | 'LICENSE_CREATE'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_PENDING'
  | 'PROFILE_UPDATE';

interface LogActivityParams {
  userEmail: string;
  action: ActivityAction;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

const ACTION_DESCRIPTIONS: Record<ActivityAction, string> = {
  LOGIN: 'Masuk ke akun',
  LOGOUT: 'Keluar dari akun',
  VENUE_CREATE: 'Mendaftarkan venue baru',
  VENUE_UPDATE: 'Memperbarui data venue',
  VENUE_DELETE: 'Menghapus venue',
  LICENSE_CREATE: 'Membuat lisensi baru',
  PAYMENT_SUCCESS: 'Pembayaran berhasil',
  PAYMENT_PENDING: 'Pembayaran tertunda',
  PROFILE_UPDATE: 'Memperbarui profil',
};

export async function logActivity({
  userEmail,
  action,
  description,
  metadata,
  ipAddress,
  userAgent,
}: LogActivityParams) {
  try {
    await prisma.activityLog.create({
      data: {
        userEmail,
        action,
        description,
        metadata: metadata || undefined,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });
  } catch (error) {
    // Log error but don't throw - activity logging should not break main flow
    console.error('Failed to log activity:', error);
  }
}

export function getActionDescription(action: ActivityAction): string {
  return ACTION_DESCRIPTIONS[action] || action;
}
