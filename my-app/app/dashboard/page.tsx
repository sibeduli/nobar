'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, FileText, CreditCard, Clock, Activity, Loader2, ChevronRight, Pencil, Trash2, User } from 'lucide-react';

interface Venue {
  id: string;
  businessName: string;
  kabupaten: string;
  createdAt: string;
}

interface License {
  id: string;
  tier: number;
  price: number;
  frozen: boolean;
  createdAt: string;
  venue: {
    businessName: string;
  };
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  createdAt: string;
}

interface DashboardData {
  venues: Venue[];
  licenses: License[];
  recentActivities: ActivityLog[];
  stats: {
    totalVenues: number;
    activeLicenses: number;
    totalPaid: number;
    pendingLicenses: number;
  };
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  VENUE_CREATE: Store,
  VENUE_UPDATE: Pencil,
  VENUE_DELETE: Trash2,
  LICENSE_CREATE: FileText,
  PAYMENT_SUCCESS: CreditCard,
  PAYMENT_PENDING: Clock,
  PROFILE_UPDATE: User,
};

const ACTION_COLORS: Record<string, string> = {
  VENUE_CREATE: 'bg-green-100 text-green-700',
  VENUE_UPDATE: 'bg-blue-100 text-blue-700',
  VENUE_DELETE: 'bg-red-100 text-red-700',
  LICENSE_CREATE: 'bg-purple-100 text-purple-700',
  PAYMENT_SUCCESS: 'bg-emerald-100 text-emerald-700',
  PAYMENT_PENDING: 'bg-yellow-100 text-yellow-700',
  PROFILE_UPDATE: 'bg-indigo-100 text-indigo-700',
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard');
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat datang, {session?.user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-500 mt-1">
          Kelola venue dan lisensi nobar Anda di sini.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Venue</CardTitle>
            <Store className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.totalVenues || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Venue terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lisensi Aktif</CardTitle>
            <FileText className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.activeLicenses || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Lisensi berlaku</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pembayaran</CardTitle>
            <CreditCard className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data?.stats.totalPaid || 0)}</div>
            <p className="text-xs text-gray-500 mt-1">Total dibayar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lisensi Belum Aktif</CardTitle>
            <Clock className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.pendingLicenses || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Lisensi belum dibayar</p>
          </CardContent>
        </Card>
      </div>

      {/* Venue and License Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Venues */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Venue Terbaru</CardTitle>
              <CardDescription>3 venue terakhir yang didaftarkan</CardDescription>
            </div>
            <Link href="/dashboard/venues" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Lihat semua <ChevronRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {data?.venues && data.venues.length > 0 ? (
              <div className="space-y-3">
                {data.venues.map((venue) => (
                  <Link
                    key={venue.id}
                    href={`/dashboard/venues/${venue.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Store className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{venue.businessName}</p>
                        <p className="text-sm text-gray-500">{venue.kabupaten}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{formatRelativeTime(venue.createdAt)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Store className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Belum ada venue terdaftar</p>
                <Link
                  href="/dashboard/venues/daftar"
                  className="inline-flex items-center mt-3 text-sm text-blue-600 hover:text-blue-700"
                >
                  Daftar venue baru <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Licenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Lisensi Terbaru</CardTitle>
              <CardDescription>3 lisensi terakhir yang dibuat</CardDescription>
            </div>
            <Link href="/dashboard/licenses" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Lihat semua <ChevronRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {data?.licenses && data.licenses.length > 0 ? (
              <div className="space-y-3">
                {data.licenses.map((license) => (
                  <Link
                    key={license.id}
                    href={`/dashboard/licenses/${license.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{license.venue.businessName}</p>
                        <p className="text-sm text-gray-500">Tier {license.tier} • {formatCurrency(license.price)}</p>
                      </div>
                    </div>
                    <Badge variant="default">
                      Berlisensi
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Belum ada lisensi</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
            <CardDescription>3 aktivitas terakhir Anda</CardDescription>
          </div>
          <Link href="/dashboard/activity" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Lihat semua <ChevronRight className="w-4 h-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {data?.recentActivities && data.recentActivities.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivities.map((activity) => {
                const Icon = ACTION_ICONS[activity.action] || Activity;
                const colorClass = ACTION_COLORS[activity.action] || 'bg-gray-100 text-gray-700';
                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.description}</p>
                        <p className="text-sm text-gray-500">{formatRelativeTime(activity.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <Activity className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Belum ada aktivitas</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
