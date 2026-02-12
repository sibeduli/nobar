'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Store, Plus, MapPin, Users, Eye, Pencil, Trash2, AlertTriangle, Search, ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

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
  ownerName: string;
  email: string;
  phone: string;
  venueType: string;
  capacity: number;
  provinsi: string;
  kabupaten: string;
  kecamatan: string | null;
  kelurahan: string | null;
  alamatLengkap: string;
  createdAt: string;
  updatedAt: string;
  license: License | null;
}

const venueTypeLabels: Record<string, string> = {
  cafe: 'Cafe/Warkop',
  restaurant: 'Restoran',
  bar: 'Bar',
  hotel: 'Hotel/Penginapan',
  sports_venue: 'Venue Olahraga',
  community: 'Balai Warga/Komunitas',
  other: 'Lainnya',
};

const capacityTierLabels: Record<number, string> = {
  1: '≤50 orang',
  2: '51-100 orang',
  3: '101-250 orang',
  4: '251-500 orang',
  5: '501-1000 orang',
};

const getLicenseBadge = (license: License | null) => {
  if (!license) {
    return { label: 'Belum Berlisensi', variant: 'outline' as const };
  }
  if (license.status === 'paid') {
    return { label: 'Berlisensi', variant: 'default' as const };
  }
  return { label: 'Belum Bayar', variant: 'secondary' as const };
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function VenuesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
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

  const openDeleteDialog = (venue: Venue) => {
    setVenueToDelete(venue);
    setDeleteConfirmText('');
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!venueToDelete || deleteConfirmText !== 'HAPUS') return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/merchants/${venueToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setDeleteDialogOpen(false);
        setVenueToDelete(null);
        // Refresh current page
        fetchVenues(pagination.page, debouncedSearch, statusFilter);
      } else {
        alert(data.error || 'Gagal menghapus venue');
      }
    } catch (error) {
      console.error('Error deleting venue:', error);
      alert('Gagal menghapus venue');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Venue Saya</h1>
          <p className="text-gray-500 mt-1">
            {pagination.total > 0 
              ? `${pagination.total} venue terdaftar`
              : 'Kelola semua venue yang terdaftar'}
          </p>
        </div>
        <Link href="/dashboard/venues/daftar">
          <Button className="bg-[#1c316b] hover:bg-[#1c316b]/90">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Venue
          </Button>
        </Link>
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
            <CardDescription>Anda belum mendaftarkan venue apapun</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Store className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-center mb-4">
              Daftarkan venue Anda untuk mendapatkan lisensi nobar resmi TVRI
            </p>
            <Link href="/dashboard/venues/daftar">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Daftar Venue Pertama
              </Button>
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
          <div className="grid gap-4">
            {venues.map((venue) => (
              <Card key={venue.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-[#1c316b]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Store className="w-6 h-6 text-[#1c316b]" />
                      </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{venue.businessName}</h3>
                        <Badge variant={getLicenseBadge(venue.license).variant}>
                          {getLicenseBadge(venue.license).label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {venueTypeLabels[venue.venueType] || venue.venueType}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {venue.kabupaten}, {venue.provinsi}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {capacityTierLabels[venue.capacity] || `Tier ${venue.capacity}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Dibuat: {formatDate(venue.createdAt)}
                        </span>
                        {venue.updatedAt !== venue.createdAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Diedit: {formatDate(venue.updatedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/venues/${venue.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Detail
                      </Button>
                    </Link>
                    {(!venue.license || venue.license.status !== 'paid') && (
                      <>
                        <Link href={`/dashboard/venues/${venue.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => openDeleteDialog(venue)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Hapus
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>

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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <DialogTitle>Hapus Venue</DialogTitle>
            </div>
            <DialogDescription>
              Anda akan menghapus venue <strong>{venueToDelete?.businessName}</strong>. 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirmDelete">
                Ketik <strong>HAPUS</strong> untuk mengkonfirmasi
              </Label>
              <Input
                id="confirmDelete"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                placeholder="HAPUS"
                className="uppercase"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteConfirmText !== 'HAPUS' || isDeleting}
            >
              {isDeleting ? 'Menghapus...' : 'Hapus Venue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
