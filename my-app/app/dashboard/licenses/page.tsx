'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Store, CreditCard, CheckCircle, Users, QrCode, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface License {
  id: string;
  tier: number;
  price: number;
  status: string;
  paidAt: string | null;
}

interface Venue {
  id: string;
  businessName: string;
  capacity: number;
  venueType: string;
  kabupaten: string;
  provinsi: string;
  license: License | null;
}

const LICENSE_TIERS = [
  { tier: 1, price: 5000000, label: 'Tier 1', description: '≤50 orang' },
  { tier: 2, price: 10000000, label: 'Tier 2', description: '51-100 orang' },
  { tier: 3, price: 20000000, label: 'Tier 3', description: '101-250 orang' },
  { tier: 4, price: 40000000, label: 'Tier 4', description: '251-500 orang' },
  { tier: 5, price: 100000000, label: 'Tier 5', description: '501-1000 orang' },
];

const getTierByValue = (tier: number) => {
  return LICENSE_TIERS.find(t => t.tier === tier) || LICENSE_TIERS[0];
};

const APPLICATION_FEE = 5000;
const VAT_RATE = 0.12; // 12% PPN

const calculateTotal = (basePrice: number) => {
  const ppn = Math.round(basePrice * VAT_RATE);
  const total = basePrice + ppn + APPLICATION_FEE;
  return { basePrice, ppn, applicationFee: APPLICATION_FEE, total };
};

const capacityTierLabels: Record<number, string> = {
  1: '≤50 orang',
  2: '51-100 orang',
  3: '101-250 orang',
  4: '251-500 orang',
  5: '501-1000 orang',
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

const venueTypeLabels: Record<string, string> = {
  cafe: 'Cafe/Warkop',
  restaurant: 'Restoran',
  bar: 'Bar',
  hotel: 'Hotel/Penginapan',
  sports_venue: 'Venue Olahraga',
  community: 'Balai Warga/Komunitas',
  other: 'Lainnya',
};

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function LicensesPage() {
  const searchParams = useSearchParams();
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination and filter state
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchVenues = useCallback(async (page: number, search: string, status: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        status,
      });
      const res = await fetch(`/api/merchants?${params}`);
      const data = await res.json();
      if (data.success) {
        setVenues(data.merchants);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVenues(pagination.page, debouncedSearch, statusFilter);
  }, [pagination.page, debouncedSearch, statusFilter, fetchVenues]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const licensedVenues = venues.filter(v => v.license?.status === 'paid');
  const unlicensedVenues = venues.filter(v => !v.license || v.license.status !== 'paid');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lisensi</h1>
        <p className="text-gray-500 mt-1">
          {pagination.total > 0 
            ? `${pagination.total} venue terdaftar`
            : 'Kelola lisensi nobar venue Anda'}
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
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="licensed">Berlisensi</SelectItem>
              <SelectItem value="unpaid">Belum Bayar</SelectItem>
              <SelectItem value="unlicensed">Belum Berlisensi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Memuat...</p>
        </div>
      ) : venues.length === 0 && !searchQuery && statusFilter === 'all' ? (
        <Card>
          <CardHeader>
            <CardTitle>Belum Ada Venue</CardTitle>
            <CardDescription>Daftarkan venue terlebih dahulu untuk membeli lisensi</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-center mb-4">
              Anda perlu mendaftarkan venue sebelum dapat membeli lisensi
            </p>
            <Link href="/dashboard/venues/daftar">
              <Button className="bg-[#1c316b] hover:bg-[#1c316b]/90">Daftar Venue</Button>
            </Link>
          </CardContent>
        </Card>
      ) : venues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Search className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada hasil</h3>
            <p className="text-gray-500 text-center">
              Tidak ditemukan venue dengan kriteria pencarian tersebut
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Licensed Venues */}
          {licensedVenues.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Venue Berlisensi</h2>
          <div className="grid gap-4">
            {licensedVenues.map((venue) => (
              <Card key={venue.id} className="border-green-200 bg-green-50/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{venue.businessName}</h3>
                          <Badge variant="default" className="bg-green-600">
                            {LICENSE_TIERS.find(t => t.tier === venue.license?.tier)?.label || `Tier ${venue.license?.tier}`}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {venueTypeLabels[venue.venueType] || venue.venueType} • {venue.kabupaten}
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          Lisensi aktif untuk Piala Dunia 2026
                        </p>
                      </div>
                    </div>
                    <Link href={`/dashboard/licenses/${venue.license?.id}/qr`}>
                      <Button variant="outline" size="sm">
                        <QrCode className="w-4 h-4 mr-2" />
                        Lihat QR
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Unlicensed Venues */}
      {unlicensedVenues.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Venue Belum Berlisensi</h2>
          <div className="grid gap-4">
            {unlicensedVenues.map((venue) => {
              const venueTier = getTierByValue(venue.capacity);
              return (
                <Card key={venue.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Store className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{venue.businessName}</h3>
                            {venue.license?.status === 'unpaid' && (
                              <Badge variant="secondary">Belum Bayar</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {venueTypeLabels[venue.venueType] || venue.venueType} • {capacityTierLabels[venue.capacity] || `Tier ${venue.capacity}`}
                          </p>
                          <p className="text-sm text-blue-600">
                            {venueTier.label} ({venueTier.description}) - Total: {formatPrice(calculateTotal(venueTier.price).total)}
                          </p>
                        </div>
                      </div>
                      <Link href={`/dashboard/licenses/pay?venueId=${venue.id}&tier=${venueTier.tier}`}>
                        <Button>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Beli Lisensi
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

          {/* All Licensed */}
          {venues.length > 0 && unlicensedVenues.length === 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="flex items-center gap-4 py-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Semua venue sudah berlisensi!</p>
                  <p className="text-sm text-green-600">Anda siap untuk Piala Dunia 2026</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {pagination.total > 0 && (
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  <p>
                    Menampilkan <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> - <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> dari <span className="font-medium">{pagination.total}</span> venue
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Halaman {pagination.page} dari {pagination.totalPages} • {pagination.limit} per halaman
                  </p>
                </div>
                {pagination.totalPages > 1 && (
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
                )}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
