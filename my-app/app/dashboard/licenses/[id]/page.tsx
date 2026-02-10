'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle, Store, MapPin, User, Calendar, CreditCard, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface LicenseDetail {
  id: string;
  tier: number;
  price: number;
  status: string;
  paidAt: string | null;
  midtransId: string | null;
  venue: {
    id: string;
    businessName: string;
    venueType: string;
    kabupaten: string;
    provinsi: string;
    contactPerson: string | null;
    ownerName: string;
  };
  isOwner: boolean;
}

const LICENSE_TIERS: Record<number, { label: string; description: string }> = {
  1: { label: 'Tier 1', description: '≤50 orang' },
  2: { label: 'Tier 2', description: '51-100 orang' },
  3: { label: 'Tier 3', description: '101-250 orang' },
  4: { label: 'Tier 4', description: '251-500 orang' },
  5: { label: 'Tier 5', description: '501-1000 orang' },
};

const VENUE_TYPE_LABELS: Record<string, string> = {
  cafe: 'Kafe',
  restaurant: 'Restoran',
  bar: 'Bar',
  hotel: 'Hotel',
  sports_venue: 'Venue Olahraga',
  entertainment: 'Tempat Hiburan',
  community: 'Balai Warga/Komunitas',
  other: 'Lainnya',
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function LicenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [license, setLicense] = useState<LicenseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLicense();
  }, [id]);

  const fetchLicense = async () => {
    try {
      const res = await fetch(`/api/licenses/${id}`);
      const data = await res.json();
      
      if (data.success) {
        setLicense(data.license);
      } else {
        setError(data.error || 'Lisensi tidak ditemukan');
      }
    } catch (err) {
      console.error('Error fetching license:', err);
      setError('Gagal memuat data lisensi');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Memuat...</p>
      </div>
    );
  }

  if (error || !license) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/scan">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Scanner
          </Button>
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Lisensi Tidak Ditemukan</h2>
            <p className="text-gray-500 mb-4">{error || 'Lisensi yang Anda cari tidak ada dalam sistem.'}</p>
            <Link href="/dashboard/scan">
              <Button>Scan Ulang</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Block access if not owner
  if (!license.isOwner) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/scan">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Scanner
          </Button>
        </Link>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-8 text-center">
            <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Akses Ditolak</h2>
            <p className="text-gray-600 mb-4">
              Anda tidak memiliki akses untuk melihat detail lisensi ini.
            </p>
            <div className="bg-white rounded-lg p-4 text-left text-sm text-gray-600 mb-6">
              <p className="font-medium text-gray-900 mb-2">Kemungkinan penyebab:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Anda login dengan akun merchant yang salah</li>
                <li>Lisensi ini terdaftar pada akun merchant lain</li>
              </ul>
              <p className="mt-4 font-medium text-gray-900 mb-2">Untuk melihat detail lisensi ini:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Gunakan akun merchant yang terkait dengan lisensi ini</li>
                <li>Atau gunakan akun surveyor untuk verifikasi resmi</li>
              </ul>
              <p className="mt-4 text-xs text-gray-500">
                Informasi lisensi mengandung data sensitif dan dilindungi sesuai ketentuan hukum yang berlaku.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard/scan">
                <Button variant="outline">Scan Ulang</Button>
              </Link>
              <Link href="/dashboard/licenses">
                <Button>Lisensi Saya</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tierData = LICENSE_TIERS[license.tier];
  const isValid = license.status === 'paid';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/licenses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detail Lisensi</h1>
          <p className="text-gray-500 mt-1">
            {license.isOwner ? 'Lisensi venue Anda' : 'Lisensi venue lain'}
          </p>
        </div>
      </div>

      {/* Status Card */}
      <Card className={isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isValid ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isValid ? 'LISENSI VALID' : 'LISENSI TIDAK VALID'}
                </h2>
                <p className={isValid ? 'text-green-600' : 'text-red-600'}>
                  {isValid ? 'Lisensi aktif untuk Piala Dunia 2026' : 'Pembayaran belum selesai'}
                </p>
              </div>
            </div>
            <Badge 
              variant="default" 
              className={`text-lg px-4 py-2 ${isValid ? 'bg-green-600' : 'bg-red-600'}`}
            >
              {tierData?.label || `Tier ${license.tier}`}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Venue Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{license.venue.businessName}</h3>
              <p className="text-gray-500">
                {VENUE_TYPE_LABELS[license.venue.venueType] || license.venue.venueType}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Lokasi</p>
                <p className="text-gray-900">{license.venue.kabupaten}, {license.venue.provinsi}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Penanggung Jawab</p>
                <p className="text-gray-900">{license.venue.contactPerson || license.venue.ownerName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Kapasitas Lisensi</p>
                <p className="text-gray-900">{tierData?.description || `Tier ${license.tier}`}</p>
              </div>
            </div>

            {license.paidAt && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Tanggal Aktivasi</p>
                  <p className="text-gray-900">{formatDate(license.paidAt)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* License ID */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">ID Lisensi</p>
              <p className="font-mono text-gray-900">
                {license.midtransId || license.id}
              </p>
            </div>
            {license.isOwner && isValid && (
              <Link href={`/dashboard/payments/invoice/${license.id}`}>
                <Button variant="outline" size="sm">
                  Lihat Invoice
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
