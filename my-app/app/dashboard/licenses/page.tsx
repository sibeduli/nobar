'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Store, CreditCard, CheckCircle, Users } from 'lucide-react';
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
  capacity: number;
  venueType: string;
  kabupaten: string;
  provinsi: string;
  license: License | null;
}

const LICENSE_TIERS = [
  { tier: 1, maxCapacity: 50, price: 5000000, label: 'Tier 1 (≤50 orang)' },
  { tier: 2, maxCapacity: 100, price: 10000000, label: 'Tier 2 (51-100 orang)' },
  { tier: 3, maxCapacity: 250, price: 20000000, label: 'Tier 3 (101-250 orang)' },
  { tier: 4, maxCapacity: 500, price: 40000000, label: 'Tier 4 (251-500 orang)' },
  { tier: 5, maxCapacity: 1000, price: 100000000, label: 'Tier 5 (501-1000 orang)' },
];

const getTierByCapacity = (capacity: number) => {
  if (capacity <= 50) return LICENSE_TIERS[0];
  if (capacity <= 100) return LICENSE_TIERS[1];
  if (capacity <= 250) return LICENSE_TIERS[2];
  if (capacity <= 500) return LICENSE_TIERS[3];
  return LICENSE_TIERS[4];
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

export default function LicensesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const licensedVenues = venues.filter(v => v.license?.status === 'paid');
  const unlicensedVenues = venues.filter(v => !v.license || v.license.status !== 'paid');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lisensi</h1>
          <p className="text-gray-500 mt-1">Kelola lisensi nobar venue Anda</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lisensi</h1>
        <p className="text-gray-500 mt-1">Kelola lisensi nobar venue Anda</p>
      </div>

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
              const suggestedTier = getTierByCapacity(venue.capacity);
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
                            {venueTypeLabels[venue.venueType] || venue.venueType} • {venue.capacity} orang
                          </p>
                          <p className="text-sm text-blue-600">
                            Disarankan: {suggestedTier.label} - {formatPrice(suggestedTier.price)}
                          </p>
                        </div>
                      </div>
                      <Link href={`/dashboard/licenses/pay?venueId=${venue.id}&tier=${suggestedTier.tier}`}>
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

      {/* No Venues */}
      {venues.length === 0 && (
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
              <Button>Daftar Venue</Button>
            </Link>
          </CardContent>
        </Card>
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
    </div>
  );
}
