'use client';

import { useEffect, useState } from 'react';
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
import { Store, Plus, MapPin, Users, Eye, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

const getLicenseBadge = (license: License | null) => {
  if (!license) {
    return { label: 'Belum Berlisensi', variant: 'outline' as const };
  }
  if (license.status === 'paid') {
    return { label: 'Berlisensi', variant: 'default' as const };
  }
  return { label: 'Belum Bayar', variant: 'secondary' as const };
};

export default function VenuesPage() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const res = await fetch('/api/merchants');
      const data = await res.json();
      if (data.success) {
        setVenues(data.merchants);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setIsLoading(false);
    }
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
        setVenues(venues.filter(v => v.id !== venueToDelete.id));
        setDeleteDialogOpen(false);
        setVenueToDelete(null);
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Venue Saya</h1>
            <p className="text-gray-500 mt-1">Kelola semua venue yang terdaftar</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Venue Saya</h1>
          <p className="text-gray-500 mt-1">
            {venues.length > 0 
              ? `${venues.length} venue terdaftar`
              : 'Kelola semua venue yang terdaftar'}
          </p>
        </div>
        <Link href="/dashboard/venues/daftar">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Venue
          </Button>
        </Link>
      </div>

      {venues.length === 0 ? (
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
      ) : (
        <div className="grid gap-4">
          {venues.map((venue) => (
            <Card key={venue.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Store className="w-6 h-6 text-blue-600" />
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
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {venue.kabupaten}, {venue.provinsi}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {venue.capacity} orang
                        </span>
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
