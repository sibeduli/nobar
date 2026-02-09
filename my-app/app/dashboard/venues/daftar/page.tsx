'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, CreditCard, Clock } from 'lucide-react';
import Link from 'next/link';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

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

export default function DaftarVenuePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    phone: '',
    venueType: '',
    capacity: '',
    openingHour: '',
    closingHour: '',
    provinsi: '',
    kabupaten: '',
    kecamatan: '',
    kelurahan: '',
    alamatLengkap: '',
    kodePos: '',
    latitude: 0,
    longitude: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [registeredVenueId, setRegisteredVenueId] = useState<string | null>(null);
  const [registeredCapacity, setRegisteredCapacity] = useState<number>(0);

  const handleLocationSelect = (lat: number, lng: number, addressData: {
    alamatLengkap: string;
    kelurahan: string;
    kecamatan: string;
    kabupaten: string;
    provinsi: string;
    kodePos: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      alamatLengkap: addressData.alamatLengkap,
      kelurahan: addressData.kelurahan,
      kecamatan: addressData.kecamatan,
      kabupaten: addressData.kabupaten,
      provinsi: addressData.provinsi,
      kodePos: addressData.kodePos,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Include Google account data
      const submitData = {
        ...formData,
        ownerName: session?.user?.name || '',
        email: session?.user?.email || '',
      };
      
      const res = await fetch('/api/merchants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setRegisteredVenueId(data.merchant.id);
        setRegisteredCapacity(parseInt(formData.capacity) || 0);
        setShowPaymentModal(true);
      } else {
        alert(data.error || 'Gagal mendaftar. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayNow = () => {
    if (registeredVenueId) {
      const tier = getTierByCapacity(registeredCapacity);
      router.push(`/dashboard/licenses/pay?venueId=${registeredVenueId}&tier=${tier.tier}`);
    }
  };

  const handlePayLater = () => {
    setShowPaymentModal(false);
    router.push('/dashboard/venues');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <Link
        href="/dashboard/venues"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Kembali ke Venue Saya
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Venue Baru</h1>
        <p className="text-gray-500 mt-1">Dapatkan lisensi resmi TVRI untuk Piala Dunia 2026</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Informasi Bisnis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informasi Venue</CardTitle>
            <CardDescription>Data usaha dan kontak venue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Nama Usaha/Venue</Label>
              <Input
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Warung Bola Sejahtera"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Nama Contact Person</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Nama penanggung jawab venue"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon (Whatsapp Aktif)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Detail Venue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detail Venue</CardTitle>
            <CardDescription>Informasi tentang tempat usaha</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="venueType">Jenis Venue</Label>
                <Select value={formData.venueType} onValueChange={(v) => handleSelectChange('venueType', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis venue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cafe">Cafe/Warkop</SelectItem>
                    <SelectItem value="restaurant">Restoran</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="hotel">Hotel/Penginapan</SelectItem>
                    <SelectItem value="sports_venue">Venue Olahraga</SelectItem>
                    <SelectItem value="community">Balai Warga/Komunitas</SelectItem>
                    <SelectItem value="other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Kapasitas Pengunjung</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="Jumlah maksimal"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="openingHour">Jam Buka (opsional)</Label>
                <Input
                  id="openingHour"
                  name="openingHour"
                  type="time"
                  value={formData.openingHour}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closingHour">Jam Tutup (opsional)</Label>
                <Input
                  id="closingHour"
                  name="closingHour"
                  type="time"
                  value={formData.closingHour}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Alamat */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alamat Venue</CardTitle>
            <CardDescription>Cari atau klik pada peta untuk memilih lokasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <MapPicker onLocationSelect={handleLocationSelect} />
              {formData.latitude !== 0 && (
                <p className="text-sm text-green-600">
                  ✓ Lokasi dipilih: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="provinsi">Provinsi</Label>
                <Input
                  id="provinsi"
                  name="provinsi"
                  value={formData.provinsi}
                  onChange={handleChange}
                  placeholder="Provinsi"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kabupaten">Kabupaten/Kota</Label>
                <Input
                  id="kabupaten"
                  name="kabupaten"
                  value={formData.kabupaten}
                  onChange={handleChange}
                  placeholder="Kabupaten/Kota"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="kecamatan">Kecamatan</Label>
                <Input
                  id="kecamatan"
                  name="kecamatan"
                  value={formData.kecamatan}
                  onChange={handleChange}
                  placeholder="Kecamatan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kelurahan">Kelurahan</Label>
                <Input
                  id="kelurahan"
                  name="kelurahan"
                  value={formData.kelurahan}
                  onChange={handleChange}
                  placeholder="Kelurahan"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alamatLengkap">Alamat Lengkap</Label>
              <Input
                id="alamatLengkap"
                name="alamatLengkap"
                value={formData.alamatLengkap}
                onChange={handleChange}
                placeholder="Jl. Nama Jalan No. XX, RT/RW"
                required
              />
            </div>
            <div className="w-32">
              <div className="space-y-2">
                <Label htmlFor="kodePos">Kode Pos</Label>
                <Input
                  id="kodePos"
                  name="kodePos"
                  value={formData.kodePos}
                  onChange={handleChange}
                  placeholder="12345"
                  maxLength={5}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Mendaftar...' : 'Daftar Sekarang'}
        </Button>

        <p className="text-center text-sm text-gray-500">
          Dengan mendaftar, Anda menyetujui syarat dan ketentuan yang berlaku.
        </p>
      </form>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Venue Berhasil Didaftarkan! 🎉</DialogTitle>
            <DialogDescription>
              Venue <strong>{formData.businessName}</strong> telah terdaftar. Pilih opsi pembayaran lisensi:
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Lisensi yang disarankan:</strong>
              </p>
              <p className="text-lg font-bold text-blue-900">
                {getTierByCapacity(registeredCapacity).label}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatPrice(getTierByCapacity(registeredCapacity).price)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Berlaku untuk seluruh event Piala Dunia 2026
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handlePayNow} className="w-full">
              <CreditCard className="w-4 h-4 mr-2" />
              Bayar Sekarang
            </Button>
            <Button variant="outline" onClick={handlePayLater} className="w-full">
              <Clock className="w-4 h-4 mr-2" />
              Bayar Nanti
            </Button>
          </div>
          
          <p className="text-xs text-center text-gray-500 mt-2">
            Anda dapat membayar kapan saja melalui menu Lisensi
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
