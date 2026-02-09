'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle, Clock, AlertCircle, Store } from 'lucide-react';
import Link from 'next/link';

interface License {
  id: string;
  tier: number;
  price: number;
  status: string;
  paidAt: string | null;
  midtransId: string | null;
  createdAt: string;
  venue: {
    id: string;
    businessName: string;
  };
}

const LICENSE_TIERS: Record<number, string> = {
  1: 'Tier 1 (≤50 orang)',
  2: 'Tier 2 (51-100 orang)',
  3: 'Tier 3 (101-250 orang)',
  4: 'Tier 4 (251-500 orang)',
  5: 'Tier 5 (501-1000 orang)',
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const orderId = searchParams.get('order_id');

  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    syncAndFetchLicenses();
  }, []);

  const syncAndFetchLicenses = async () => {
    try {
      // First, fetch all licenses
      const res = await fetch('/api/licenses');
      const data = await res.json();
      
      if (data.success) {
        // Check for unpaid licenses with midtransId and try to sync their status
        const unpaidWithOrderId = data.licenses.filter(
          (l: License) => l.status === 'unpaid' && l.midtransId
        );
        
        // Sync each unpaid license with Midtrans
        for (const license of unpaidWithOrderId) {
          try {
            await fetch('/api/licenses/check-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: license.midtransId }),
            });
          } catch (e) {
            console.error('Failed to sync license:', e);
          }
        }
        
        // Re-fetch to get updated statuses
        if (unpaidWithOrderId.length > 0) {
          const refreshRes = await fetch('/api/licenses');
          const refreshData = await refreshRes.json();
          if (refreshData.success) {
            setLicenses(refreshData.licenses);
          }
        } else {
          setLicenses(data.licenses);
        }
      }
    } catch (error) {
      console.error('Error fetching licenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const paidLicenses = licenses.filter(l => l.status === 'paid');
  const unpaidLicenses = licenses.filter(l => l.status === 'unpaid');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pembayaran</h1>
        <p className="text-gray-500 mt-1">Riwayat pembayaran dan tagihan</p>
      </div>

      {/* Payment Status Alert */}
      {status === 'success' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-4 py-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Pembayaran Berhasil!</p>
              <p className="text-sm text-green-600">Order ID: {orderId}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'pending' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-4 py-4">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Menunggu Pembayaran</p>
              <p className="text-sm text-yellow-600">Order ID: {orderId}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'error' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Pembayaran Gagal</p>
              <p className="text-sm text-red-600">Silakan coba lagi</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Memuat...</p>
        </div>
      ) : licenses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Belum Ada Pembayaran</CardTitle>
            <CardDescription>Anda belum memiliki riwayat pembayaran</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-center">
              Pembayaran akan muncul setelah Anda membeli lisensi
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Paid Licenses */}
          {paidLicenses.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Pembayaran Lunas</h2>
              <div className="space-y-3">
                {paidLicenses.map((license) => (
                  <Card key={license.id} className="border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{license.venue.businessName}</p>
                              <Badge variant="default" className="bg-green-600">Lunas</Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              {LICENSE_TIERS[license.tier]} • {license.paidAt && formatDate(license.paidAt)}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-green-600">{formatPrice(license.price)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Unpaid Licenses */}
          {unpaidLicenses.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Menunggu Pembayaran</h2>
              <div className="space-y-3">
                {unpaidLicenses.map((license) => (
                  <Card key={license.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{license.venue.businessName}</p>
                              <Badge variant="secondary">Belum Bayar</Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              {LICENSE_TIERS[license.tier]} • Dibuat {formatDate(license.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatPrice(license.price)}</p>
                          <Link
                            href={`/dashboard/licenses/pay?venueId=${license.venue.id}&tier=${license.tier}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Bayar Sekarang
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
