'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Store, Check, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
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

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess: (result: any) => void;
        onPending: (result: any) => void;
        onError: (result: any) => void;
        onClose: () => void;
      }) => void;
    };
  }
}

const LICENSE_TIERS = [
  { tier: 1, maxCapacity: 50, price: 5000000, label: 'Tier 1', description: '≤50 orang' },
  { tier: 2, maxCapacity: 100, price: 10000000, label: 'Tier 2', description: '51-100 orang' },
  { tier: 3, maxCapacity: 250, price: 20000000, label: 'Tier 3', description: '101-250 orang' },
  { tier: 4, maxCapacity: 500, price: 40000000, label: 'Tier 4', description: '251-500 orang' },
  { tier: 5, maxCapacity: 1000, price: 100000000, label: 'Tier 5', description: '501-1000 orang' },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

interface Venue {
  id: string;
  businessName: string;
  capacity: number;
  venueType: string;
  kabupaten: string;
  provinsi: string;
}

interface UserProfile {
  phone: string | null;
  billingAddress: string | null;
  companyName: string | null;
  companyRole: string | null;
}

export default function LicensePayPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const venueId = searchParams.get('venueId');
  const tierParam = searchParams.get('tier');

  const [venue, setVenue] = useState<Venue | null>(null);
  const [selectedTier, setSelectedTier] = useState<number>(parseInt(tierParam || '1'));
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snapLoaded, setSnapLoaded] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Load Midtrans Snap script
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', 'Mid-client-Tchqe6F5X8Z7Vnh-');
    script.onload = () => setSnapLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (venueId) {
      fetchVenue(venueId);
    }
    fetchUserProfile();
  }, [venueId]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      if (data.success && data.user) {
        setUserProfile(data.user);
        const isComplete = data.user.phone && data.user.billingAddress && 
                          data.user.companyName && data.user.companyRole;
        setProfileComplete(!!isComplete);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchVenue = async (id: string) => {
    try {
      const res = await fetch(`/api/merchants/${id}`);
      const data = await res.json();
      if (data.success) {
        setVenue(data.merchant);
      } else {
        router.push('/dashboard/licenses');
      }
    } catch (error) {
      console.error('Error fetching venue:', error);
      router.push('/dashboard/licenses');
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = () => {
    setDeleteConfirmText('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteVenue = async () => {
    if (!venue || deleteConfirmText !== 'HAPUS') return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/merchants/${venue.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard/venues');
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

  const handlePayment = async () => {
    if (!venue || !snapLoaded) return;

    // Check if profile is complete
    if (!profileComplete) {
      alert('Silakan lengkapi profil Anda terlebih dahulu sebelum melakukan pembayaran.');
      router.push('/dashboard/settings');
      return;
    }

    const tier = LICENSE_TIERS.find(t => t.tier === selectedTier);
    if (!tier) return;

    setIsProcessing(true);

    try {
      // Create license record first
      const licenseRes = await fetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId: venue.id,
          tier: tier.tier,
          price: tier.price,
        }),
      });

      const licenseData = await licenseRes.json();
      if (!licenseData.success) {
        alert(licenseData.error || 'Gagal membuat lisensi');
        setIsProcessing(false);
        return;
      }

      // Create payment
      const paymentRes = await fetch('/api/licenses/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseId: licenseData.license.id,
          venueName: venue.businessName,
          amount: tier.price,
          tier: tier.tier,
        }),
      });

      const paymentData = await paymentRes.json();

      if (paymentData.success && paymentData.token) {
        window.snap.pay(paymentData.token, {
          onSuccess: async (result) => {
            console.log('Payment success:', result);
            // Confirm and activate license
            try {
              await fetch(`/api/licenses/${licenseData.license.id}/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: paymentData.order_id }),
              });
            } catch (e) {
              console.error('Failed to confirm license:', e);
            }
            router.push(`/dashboard/payments?status=success&order_id=${paymentData.order_id}`);
          },
          onPending: (result) => {
            console.log('Payment pending:', result);
            router.push(`/dashboard/payments?status=pending&order_id=${paymentData.order_id}`);
          },
          onError: (result) => {
            console.log('Payment error:', result);
            alert('Pembayaran gagal. Silakan coba lagi.');
            setIsProcessing(false);
          },
          onClose: () => {
            console.log('Payment popup closed');
            setIsProcessing(false);
          },
        });
      } else {
        alert(paymentData.error || 'Gagal membuat pembayaran');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
      setIsProcessing(false);
    }
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
        <Link href="/dashboard/licenses">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>
    );
  }

  const selectedTierData = LICENSE_TIERS.find(t => t.tier === selectedTier);

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard/licenses"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Kembali ke Lisensi
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Beli Lisensi</h1>
        <p className="text-gray-500 mt-1">Pilih tier lisensi untuk venue Anda</p>
      </div>

      {/* Profile Incomplete Warning */}
      {!profileComplete && (
        <Card className="mb-6 border-yellow-300 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800">Profil Belum Lengkap</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Anda harus melengkapi profil terlebih dahulu sebelum melakukan pembayaran.
                </p>
                <Link href="/dashboard/settings">
                  <Button variant="outline" size="sm" className="mt-3 border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                    Lengkapi Profil
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Venue Info */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{venue.businessName}</h3>
                <p className="text-sm text-gray-500">
                  Kapasitas: {venue.capacity} orang • {venue.kabupaten}, {venue.provinsi}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
                onClick={openDeleteDialog}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Hapus
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Selection */}
      <div className="space-y-3 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Pilih Tier Lisensi</h2>
        {LICENSE_TIERS.map((tier) => (
          <Card
            key={tier.tier}
            className={`cursor-pointer transition-all ${
              selectedTier === tier.tier
                ? 'ring-2 ring-blue-500 border-blue-500'
                : 'hover:border-gray-300'
            }`}
            onClick={() => setSelectedTier(tier.tier)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedTier === tier.tier ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {selectedTier === tier.tier && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tier.label}</p>
                    <p className="text-sm text-gray-500">{tier.description}</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-blue-600">{formatPrice(tier.price)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="mb-6 bg-gray-50">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Pembayaran</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(selectedTierData?.price || 0)}
              </p>
            </div>
            <p className="text-sm text-gray-500 text-right">
              Berlaku untuk seluruh<br />Piala Dunia 2026
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="w-full"
        disabled={isProcessing || !snapLoaded || !profileComplete}
        onClick={handlePayment}
      >
        <CreditCard className="w-4 h-4 mr-2" />
        {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
      </Button>

      <p className="text-center text-sm text-gray-500 mt-4">
        Pembayaran diproses secara aman melalui Midtrans
      </p>

      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-800 text-center">
          <strong>Perhatian:</strong> Setelah pembayaran berhasil dan sertifikat diterbitkan, 
          data venue tidak dapat diubah atau dihapus.
        </p>
      </div>

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
              Anda akan menghapus venue <strong>{venue?.businessName}</strong>. 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirmDeletePay">
                Ketik <strong>HAPUS</strong> untuk mengkonfirmasi
              </Label>
              <Input
                id="confirmDeletePay"
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
              onClick={handleDeleteVenue}
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
