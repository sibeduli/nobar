'use client';

import { useState } from 'react';
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

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

export default function DaftarPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    venueType: '',
    capacity: '',
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
  const [useMap, setUseMap] = useState(false);

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
    console.log('Submit:', formData);
    setTimeout(() => setIsSubmitting(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Daftar Venue Nobar</h1>
          <p className="text-gray-500 mt-2">Dapatkan lisensi resmi TVRI untuk Piala Dunia 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Informasi Bisnis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Bisnis</CardTitle>
              <CardDescription>Data usaha dan kontak pemilik venue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Nama Pemilik</Label>
                  <Input
                    id="ownerName"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="Nama lengkap"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@contoh.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
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
            </CardContent>
          </Card>

          {/* Section 3: Alamat */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Alamat Venue</CardTitle>
                  <CardDescription>Lokasi lengkap tempat usaha</CardDescription>
                </div>
                <Button
                  type="button"
                  variant={useMap ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseMap(!useMap)}
                >
                  {useMap ? '📍 Peta Aktif' : '🗺️ Pilih di Peta'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {useMap && (
                <div className="space-y-2">
                  <Label>Klik pada peta untuk memilih lokasi</Label>
                  <MapPicker onLocationSelect={handleLocationSelect} />
                  {formData.latitude !== 0 && (
                    <p className="text-sm text-green-600">
                      ✓ Lokasi dipilih: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
              )}
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
      </div>
    </div>
  );
}
