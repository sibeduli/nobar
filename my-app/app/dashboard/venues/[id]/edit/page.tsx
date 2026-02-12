'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAlert } from '@/components/AlertModal';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

const CAPACITY_TIERS = [
  { tier: 1, label: '≤50 orang', price: 5000000, priceLabel: 'Rp 5.000.000' },
  { tier: 2, label: '51-100 orang', price: 10000000, priceLabel: 'Rp 10.000.000' },
  { tier: 3, label: '101-250 orang', price: 20000000, priceLabel: 'Rp 20.000.000' },
  { tier: 4, label: '251-500 orang', price: 40000000, priceLabel: 'Rp 40.000.000' },
  { tier: 5, label: '501-1000 orang', price: 100000000, priceLabel: 'Rp 100.000.000' },
];

export default function EditVenuePage() {
  const { showError } = useAlert();
  const router = useRouter();
  const params = useParams();
  const venueId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  useEffect(() => {
    fetchVenue();
  }, [venueId]);

  const fetchVenue = async () => {
    try {
      const res = await fetch(`/api/merchants/${venueId}`);
      const data = await res.json();
      if (data.success && data.merchant) {
        const m = data.merchant;
        setFormData({
          businessName: m.businessName || '',
          contactPerson: m.contactPerson || '',
          phone: m.phone || '',
          venueType: m.venueType || '',
          capacity: m.capacity?.toString() || '',
          openingHour: m.openingHour || '',
          closingHour: m.closingHour || '',
          provinsi: m.provinsi || '',
          kabupaten: m.kabupaten || '',
          kecamatan: m.kecamatan || '',
          kelurahan: m.kelurahan || '',
          alamatLengkap: m.alamatLengkap || '',
          kodePos: m.kodePos || '',
          latitude: m.latitude || 0,
          longitude: m.longitude || 0,
        });
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
    setIsSaving(true);
    
    try {
      const res = await fetch(`/api/merchants/${venueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity) || 0,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        router.push(`/dashboard/venues/${venueId}`);
      } else {
        showError(data.error || 'Gagal menyimpan. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/dashboard/venues/${venueId}`}
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Kembali ke Detail Venue
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Venue</h1>
        <p className="text-gray-500 mt-1">Perbarui informasi venue Anda</p>
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
                <Select 
                  value={formData.capacity} 
                  onValueChange={(v) => handleSelectChange('capacity', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kapasitas venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAPACITY_TIERS.map((tier) => (
                      <SelectItem key={tier.tier} value={tier.tier.toString()}>
                        <span className="flex justify-between items-center gap-4">
                          <span>{tier.label}</span>
                          <span className="text-gray-500">({tier.priceLabel})</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <MapPicker 
                onLocationSelect={handleLocationSelect}
                initialLat={formData.latitude}
                initialLng={formData.longitude}
              />
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
        <div className="flex gap-3">
          <Link href={`/dashboard/venues/${venueId}`} className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Batal
            </Button>
          </Link>
          <Button type="submit" className="flex-1" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
