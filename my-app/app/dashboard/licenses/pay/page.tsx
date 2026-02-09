'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Store, Check } from 'lucide-react';
import Link from 'next/link';

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
  }, [venueId]);

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

  const handlePayment = async () => {
    if (!venue || !snapLoaded) return;

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

      {/* Venue Info */}
      <Card className="mb-6">
        <CardContent className="p-4">
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
        disabled={isProcessing || !snapLoaded}
        onClick={handlePayment}
      >
        <CreditCard className="w-4 h-4 mr-2" />
        {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
      </Button>

      <p className="text-center text-sm text-gray-500 mt-4">
        Pembayaran diproses secara aman melalui Midtrans
      </p>
    </div>
  );
}
