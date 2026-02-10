'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, LogOut, Save, Loader2 } from 'lucide-react';

interface UserProfile {
  phone: string;
  billingAddress: string;
  companyName: string;
  companyRole: string;
  lastLoginAt: string | null;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const profileCardRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [shouldHighlight, setShouldHighlight] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    phone: '',
    billingAddress: '',
    companyName: '',
    companyRole: '',
    lastLoginAt: null,
  });

  useEffect(() => {
    fetchProfile();
    
    // Check if we should highlight the profile card
    if (searchParams.get('highlight') === 'profile') {
      setShouldHighlight(true);
      // Scroll to profile card after a short delay
      setTimeout(() => {
        profileCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      // Remove highlight after animation
      setTimeout(() => {
        setShouldHighlight(false);
      }, 2500);
    }
  }, [searchParams]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      if (data.success && data.user) {
        setProfile({
          phone: data.user.phone || '',
          billingAddress: data.user.billingAddress || '',
          companyName: data.user.companyName || '',
          companyRole: data.user.companyRole || '',
          lastLoginAt: data.user.lastLoginAt,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isProfileComplete = () => {
    return profile.phone && profile.billingAddress && profile.companyName && profile.companyRole;
  };

  const handleSave = async () => {
    // Validate all required fields
    if (!profile.phone || !profile.billingAddress || !profile.companyName || !profile.companyRole) {
      alert('Semua field wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success) {
        alert('Profil berhasil disimpan');
      } else {
        alert(data.error || 'Gagal menyimpan profil');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Gagal menyimpan profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const formatLastLogin = (dateStr: string | null) => {
    if (!dateStr) return 'Belum pernah login';
    const date = new Date(dateStr);
    return date.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-500 mt-1">Kelola akun dan preferensi Anda</p>
      </div>

      {/* Google Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Akun Google</CardTitle>
          <CardDescription>Informasi dari akun Google Anda (tidak dapat diubah)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{session?.user?.name}</p>
              <p className="text-sm text-gray-500">{session?.user?.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                Login terakhir: {formatLastLogin(profile.lastLoginAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable Profile */}
      <Card 
        ref={profileCardRef}
        className={shouldHighlight ? 'animate-pulse ring-2 ring-blue-500 ring-offset-2' : ''}
      >
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Informasi tambahan untuk akun Anda. Semua field wajib diisi sebelum melakukan pembayaran.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon (Whatsapp Aktif) <span className="text-red-500">*</span></Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyRole">Jabatan/Peran <span className="text-red-500">*</span></Label>
                  <Input
                    id="companyRole"
                    name="companyRole"
                    value={profile.companyRole}
                    onChange={handleChange}
                    placeholder="Contoh: Pemilik, Manager, dll"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Nama Perusahaan <span className="text-red-500">*</span></Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={profile.companyName}
                  onChange={handleChange}
                  placeholder="PT/CV Nama Perusahaan"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingAddress">Alamat Penagihan <span className="text-red-500">*</span></Label>
                <Input
                  id="billingAddress"
                  name="billingAddress"
                  value={profile.billingAddress}
                  onChange={handleChange}
                  placeholder="Alamat lengkap untuk penagihan"
                  required
                />
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Simpan Profil
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardHeader>
          <CardTitle>Akun</CardTitle>
          <CardDescription>Kelola sesi login Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar dari Akun
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
