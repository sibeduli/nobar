'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreditCard, CheckCircle, Clock, AlertCircle, FileText, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAlert } from '@/components/AlertModal';

interface License {
  id: string;
  tier: number;
  price: number;
  frozen: boolean;
  paidAt: string | null;
  midtransId: string | null;
  transactionId: string | null;
  paymentType: string | null;
  transactionStatus: string | null;
  transactionTime: string | null;
  grossAmount: string | null;
  bank: string | null;
  vaNumber: string | null;
  cardType: string | null;
  maskedCard: string | null;
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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showSuccess, showError } = useAlert();
  const status = searchParams.get('status');
  const orderId = searchParams.get('order_id');

  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const hasConfirmedRef = useRef(false);
  
  // Pagination and filter state
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Handle payment confirmation when redirected from Midtrans
  useEffect(() => {
    const confirmPayment = async () => {
      // Only attempt confirmation if we have an orderId and status is processing/pending
      if (!orderId || hasConfirmedRef.current) return;
      if (status !== 'processing' && status !== 'pending') return;

      hasConfirmedRef.current = true;
      setIsConfirming(true);

      try {
        console.log('[PAYMENTS] Confirming payment for orderId:', orderId);
        const res = await fetch('/api/licenses/check-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
        const data = await res.json();
        console.log('[PAYMENTS] Check-status response:', data);

        if (data.success && data.license) {
          showSuccess('Pembayaran berhasil! Lisensi telah aktif.');
          // Redirect to invoice page
          router.replace(`/dashboard/payments/invoice/${data.license.id}?status=success`);
          return;
        } else if (data.error) {
          console.error('[PAYMENTS] Confirmation error:', data.error);
        }
      } catch (error) {
        console.error('[PAYMENTS] Failed to confirm payment:', error);
      } finally {
        setIsConfirming(false);
      }
    };

    confirmPayment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, status]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchLicenses = useCallback(async (page: number, search: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
      });
      const res = await fetch(`/api/licenses?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setLicenses(data.licenses);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching licenses:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLicenses(pagination.page, debouncedSearch);
  }, [pagination.page, debouncedSearch, fetchLicenses]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // All licenses are active (License only exists after payment succeeds)
  const activeLicenses = licenses;

  // Show loading state while confirming payment
  if (isConfirming) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 font-medium">Mengkonfirmasi pembayaran...</p>
        <p className="text-gray-400 text-sm mt-1">Mohon tunggu sebentar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pembayaran</h1>
        <p className="text-gray-500 mt-1">
          {pagination.total > 0 
            ? `${pagination.total} transaksi`
            : 'Riwayat pembayaran dan tagihan'}
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari nama venue..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>
      </Card>

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

      {(status === 'pending' || status === 'processing') && (
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
          {/* All Licenses (all are paid/active) */}
          {activeLicenses.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Riwayat Pembayaran</h2>
              <div className="space-y-3">
                {activeLicenses.map((license: License) => (
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
                        <div className="text-right flex items-center gap-3">
                          <p className="font-bold text-green-600">{formatPrice(license.price)}</p>
                          <Link href={`/dashboard/payments/invoice/${license.id}`}>
                            <Button variant="outline" size="sm">
                              <FileText className="w-4 h-4 mr-1" />
                              Lihat Invoice
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.total > 0 && (
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  <p>
                    Menampilkan <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> - <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> dari <span className="font-medium">{pagination.total}</span> transaksi
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Halaman {pagination.page} dari {pagination.totalPages} • {pagination.limit} per halaman
                  </p>
                </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      const current = pagination.page;
                      return page === 1 || page === pagination.totalPages || Math.abs(page - current) <= 1;
                    })
                    .map((page, index, arr) => (
                      <span key={page} className="flex items-center">
                        {index > 0 && arr[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <Button
                          variant={pagination.page === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={pagination.page === page ? 'bg-[#1c316b] hover:bg-[#1c316b]/90' : ''}
                        >
                          {page}
                        </Button>
                      </span>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
