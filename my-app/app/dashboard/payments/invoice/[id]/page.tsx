'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Clock, CreditCard, Building2, Download } from 'lucide-react';
import Link from 'next/link';
import { useAlert } from '@/components/AlertModal';

interface License {
  id: string;
  tier: number;
  price: number;
  status: string;
  paidAt: string | null;
  midtransId: string | null;
  transactionId: string | null;
  paymentType: string | null;
  transactionStatus: string | null;
  transactionTime: string | null;
  grossAmount: string | null;
  bank: string | null;
  vaNumber: string | null;
  cardType: string | null;
  maskedCard: string | null;
  createdAt: string;
  venue: {
    id: string;
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    alamatLengkap: string;
    kabupaten: string;
    provinsi: string;
  };
}

interface UserProfile {
  name: string | null;
  email: string;
  phone: string | null;
  billingAddress: string | null;
  companyName: string | null;
  companyRole: string | null;
}

const LICENSE_TIERS: Record<number, { label: string; basePrice: number }> = {
  1: { label: 'Tier 1 (≤50 orang)', basePrice: 5000000 },
  2: { label: 'Tier 2 (51-100 orang)', basePrice: 10000000 },
  3: { label: 'Tier 3 (101-250 orang)', basePrice: 20000000 },
  4: { label: 'Tier 4 (251-500 orang)', basePrice: 40000000 },
  5: { label: 'Tier 5 (501-1000 orang)', basePrice: 100000000 },
};

const APPLICATION_FEE = 5000;
const VAT_RATE = 0.12;

const calculateBreakdown = (tier: number) => {
  const tierData = LICENSE_TIERS[tier];
  if (!tierData) return null;
  
  const basePrice = tierData.basePrice;
  const ppn = Math.round(basePrice * VAT_RATE);
  const total = basePrice + ppn + APPLICATION_FEE;
  
  return { basePrice, ppn, applicationFee: APPLICATION_FEE, total };
};

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  credit_card: 'Kartu Kredit',
  bank_transfer: 'Transfer Bank',
  gopay: 'GoPay',
  shopeepay: 'ShopeePay',
  qris: 'QRIS',
  cstore: 'Convenience Store',
  echannel: 'Mandiri Bill',
  bca_klikpay: 'BCA KlikPay',
  bca_klikbca: 'KlikBCA',
  bri_epay: 'BRI e-Pay',
  cimb_clicks: 'CIMB Clicks',
  danamon_online: 'Danamon Online',
  akulaku: 'Akulaku',
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }) + ' WIB';
};

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showError, showSuccess, showInfo } = useAlert();
  const [license, setLicense] = useState<License | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Track if status modal has been shown to prevent double-trigger
  const hasShownStatus = useRef(false);

  // Show status modal if redirected from payment
  useEffect(() => {
    const status = searchParams.get('status');
    if (status && !hasShownStatus.current) {
      hasShownStatus.current = true;
      if (status === 'success') {
        showSuccess('Pembayaran berhasil! Terima kasih telah melakukan pembayaran.');
      } else if (status === 'processing') {
        showInfo('Pembayaran diterima, sedang diproses. Status akan diperbarui dalam beberapa saat.');
      }
      // Remove the query param from URL without reload
      router.replace(`/dashboard/payments/invoice/${params.id}`, { scroll: false });
    }
  }, [searchParams, params.id, router, showSuccess, showInfo]);

  useEffect(() => {
    if (params.id) {
      fetchLicense(params.id as string);
    }
    fetchUserProfile();
  }, [params.id]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      if (data.success && data.user) {
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchLicense = async (id: string) => {
    try {
      const res = await fetch(`/api/licenses/${id}`);
      const data = await res.json();
      if (data.success) {
        setLicense(data.license);
      } else {
        router.push('/dashboard/payments');
      }
    } catch (error) {
      console.error('Error fetching license:', error);
      router.push('/dashboard/payments');
    } finally {
      setIsLoading(false);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!license) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/licenses/${license.id}/invoice`);
      if (!response.ok) throw new Error('Failed to download invoice');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${license.midtransId || license.id.slice(-8).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showError('Gagal mengunduh invoice. Silakan coba lagi.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Memuat...</p>
      </div>
    );
  }

  if (!license) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Invoice tidak ditemukan</p>
      </div>
    );
  }

  const isPaid = license.status === 'paid';

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/dashboard/payments"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 print:hidden"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Kembali ke Pembayaran
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Invoice</h1>
        <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
          <Download className="w-4 h-4 mr-2" />
          {isDownloading ? 'Mengunduh...' : 'Unduh PDF'}
        </Button>
      </div>

      {/* Invoice Card */}
      <Card className="print:shadow-none print:border-0">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">TVRI Nobar</h2>
                  <p className="text-xs text-gray-500">Merchant Licensing Portal</p>
                </div>
              </div>
              <CardTitle className="text-lg">Invoice #{license.midtransId || license.id.slice(-8).toUpperCase()}</CardTitle>
            </div>
            <Badge variant={isPaid ? 'default' : 'secondary'} className={isPaid ? 'bg-green-600' : ''}>
              {isPaid ? 'Lunas' : 'Belum Bayar'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Customer Info */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Ditagihkan Kepada</h3>
              <p className="font-medium text-gray-900">{userProfile?.companyName || license.venue.ownerName}</p>
              <p className="text-sm text-gray-600">{userProfile?.name || license.venue.ownerName}</p>
              <p className="text-sm text-gray-600">{userProfile?.email || license.venue.email}</p>
              <p className="text-sm text-gray-600">{userProfile?.phone || license.venue.phone}</p>
              {userProfile?.billingAddress && (
                <p className="text-sm text-gray-600 mt-1">{userProfile.billingAddress}</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Venue</h3>
              <p className="font-medium text-gray-900">{license.venue.businessName}</p>
              <p className="text-sm text-gray-600">{license.venue.alamatLengkap}</p>
              <p className="text-sm text-gray-600">{license.venue.kabupaten}, {license.venue.provinsi}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid gap-6 sm:grid-cols-2 border-t pt-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Tanggal Invoice</h3>
              <p className="text-gray-900">{formatDate(license.createdAt)}</p>
            </div>
            {isPaid && license.paidAt && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Tanggal Pembayaran</h3>
                <p className="text-gray-900">{formatDate(license.paidAt)}</p>
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">Deskripsi</th>
                  <th className="text-right text-sm font-medium text-gray-500 px-4 py-3">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">Lisensi TVRI Piala Dunia 2026</p>
                    <p className="text-sm text-gray-500">{LICENSE_TIERS[license.tier]?.label}</p>
                    <p className="text-sm text-gray-500">Venue: {license.venue.businessName}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatPrice(calculateBreakdown(license.tier)?.basePrice || 0)}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">
                    <p className="text-gray-700">PPN (12%)</p>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatPrice(calculateBreakdown(license.tier)?.ppn || 0)}
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">
                    <p className="text-gray-700">Biaya Aplikasi</p>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatPrice(APPLICATION_FEE)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-gray-50">
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium text-gray-900">Total</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900 text-lg">
                    {formatPrice(calculateBreakdown(license.tier)?.total || license.price)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Details (if paid) */}
          {isPaid && (
            <div className="border rounded-lg p-4 bg-green-50">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-800">Detail Pembayaran</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                {license.paymentType && (
                  <div>
                    <p className="text-gray-500">Metode Pembayaran</p>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      {PAYMENT_TYPE_LABELS[license.paymentType] || license.paymentType}
                    </p>
                  </div>
                )}
                {license.transactionId && (
                  <div>
                    <p className="text-gray-500">Transaction ID</p>
                    <p className="font-medium text-gray-900 font-mono text-xs">{license.transactionId}</p>
                  </div>
                )}
                {license.bank && (
                  <div>
                    <p className="text-gray-500">Bank</p>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {license.bank.toUpperCase()}
                    </p>
                  </div>
                )}
                {license.vaNumber && (
                  <div>
                    <p className="text-gray-500">Nomor VA</p>
                    <p className="font-medium text-gray-900 font-mono">{license.vaNumber}</p>
                  </div>
                )}
                {license.cardType && (
                  <div>
                    <p className="text-gray-500">Tipe Kartu</p>
                    <p className="font-medium text-gray-900">{license.cardType}</p>
                  </div>
                )}
                {license.maskedCard && (
                  <div>
                    <p className="text-gray-500">Nomor Kartu</p>
                    <p className="font-medium text-gray-900 font-mono">{license.maskedCard}</p>
                  </div>
                )}
                {license.transactionTime && (
                  <div>
                    <p className="text-gray-500">Waktu Transaksi</p>
                    <p className="font-medium text-gray-900">{formatDate(license.transactionTime)}</p>
                  </div>
                )}
                {license.transactionStatus && (
                  <div>
                    <p className="text-gray-500">Status Transaksi</p>
                    <p className="font-medium text-gray-900 capitalize">{license.transactionStatus}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unpaid Notice */}
          {!isPaid && (
            <div className="border rounded-lg p-4 bg-yellow-50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <h3 className="font-medium text-yellow-800">Menunggu Pembayaran</h3>
              </div>
              <p className="text-sm text-yellow-700 mb-4">
                Invoice ini belum dibayar. Silakan lakukan pembayaran untuk mengaktifkan lisensi.
              </p>
              <Link href={`/dashboard/licenses/pay?venueId=${license.venue.id}&tier=${license.tier}`}>
                <Button className="print:hidden">
                  Bayar Sekarang
                </Button>
              </Link>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>Terima kasih telah menggunakan layanan TVRI Nobar</p>
            <p>Untuk pertanyaan, hubungi support@tvrinobar.id</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
