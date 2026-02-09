'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Store, MapPin, Users, Phone, Calendar, CreditCard } from 'lucide-react';
import Link from 'next/link';

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
  contactPerson: string | null;
  venueType: string;
  capacity: number;
  provinsi: string;
  kabupaten: string;
  kecamatan: string | null;
  kelurahan: string | null;
  alamatLengkap: string;
  kodePos: string | null;
  latitude: number | null;
  longitude: number | null;
  openingHour: string | null;
  closingHour: string | null;
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

export default function VenueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchVenue(params.id as string);
    }
  }, [params.id]);

  const fetchVenue = async (id: string) => {
    try {
      const res = await fetch(`/api/merchants/${id}`);
      const data = await res.json();
      if (data.success) {
        setVenue(data.merchant);
      } else {
        router.push('/dashboard/venues');
      }
    } catch (error) {
      console.error('Error fetching venue:', error);
      router.push('/dashboard/venues');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Memuat...</p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 mb-4">Venue tidak ditemukan</p>
        <Link href="/dashboard/venues">
          <Button variant="outline">Kembali ke Daftar Venue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/dashboard/venues"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Kembali ke Venue Saya
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Store className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{venue.businessName}</h1>
              <Badge variant={getLicenseBadge(venue.license).variant}>
                {getLicenseBadge(venue.license).label}
              </Badge>
            </div>
            <p className="text-gray-500">{venueTypeLabels[venue.venueType] || venue.venueType}</p>
          </div>
        </div>
        {(!venue.license || venue.license.status !== 'paid') && (
          <Link href="/dashboard/licenses">
            <Button>
              <CreditCard className="w-4 h-4 mr-2" />
              Aktifkan Lisensi
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-6">
        {/* Info Venue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informasi Venue</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {venue.contactPerson && (
              <div>
                <p className="text-sm text-gray-500">Contact Person</p>
                <p className="font-medium">{venue.contactPerson}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Telepon</p>
              <p className="font-medium flex items-center gap-1">
                <Phone className="w-4 h-4 text-gray-400" />
                {venue.phone}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Kapasitas</p>
              <p className="font-medium flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-400" />
                {venue.capacity} orang
              </p>
            </div>
            {(venue.openingHour || venue.closingHour) && (
              <div>
                <p className="text-sm text-gray-500">Jam Operasional</p>
                <p className="font-medium">
                  {venue.openingHour || '00:00'} - {venue.closingHour || '24:00'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alamat */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alamat Venue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Alamat Lengkap</p>
              <p className="font-medium">{venue.alamatLengkap}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Kelurahan</p>
                <p className="font-medium">{venue.kelurahan || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Kecamatan</p>
                <p className="font-medium">{venue.kecamatan || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Kabupaten/Kota</p>
                <p className="font-medium">{venue.kabupaten}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Provinsi</p>
                <p className="font-medium">{venue.provinsi}</p>
              </div>
            </div>
            {venue.kodePos && (
              <div>
                <p className="text-sm text-gray-500">Kode Pos</p>
                <p className="font-medium">{venue.kodePos}</p>
              </div>
            )}
            {venue.latitude && venue.longitude && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Lokasi di Peta</p>
                <a
                  href={`https://www.google.com/maps?q=${venue.latitude},${venue.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:underline"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Lihat di Google Maps
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Pendaftaran */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informasi Pendaftaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Terdaftar pada {formatDate(venue.createdAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
