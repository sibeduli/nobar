'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, CheckCircle, Store } from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';

interface LicenseDetail {
  id: string;
  tier: number;
  frozen: boolean;
  paidAt: string | null;
  midtransId: string | null;
  venue: {
    id: string;
    businessName: string;
    venueType: string;
    kabupaten: string;
    provinsi: string;
  };
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

export default function LicenseQRPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [license, setLicense] = useState<LicenseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchLicense();
  }, [id]);

  const fetchLicense = async () => {
    try {
      const res = await fetch(`/api/licenses/${id}`);
      const data = await res.json();
      
      if (data.success && data.license) {
        setLicense(data.license);
        generateQR(data.license.id);
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

  const generateQR = async (licenseId: string) => {
    try {
      // QR contains just the license ID - each app handles it internally
      const qrContent = licenseId;
      
      const dataUrl = await QRCode.toDataURL(qrContent, {
        width: 400,
        margin: 2,
        color: {
          dark: '#1c316b',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });
      
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('Error generating QR:', err);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl || !license) return;

    // Load TVRI logo first
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.onload = () => {
      drawCertificate(logoImg);
    };
    logoImg.onerror = () => {
      // Fallback: draw without logo
      drawCertificate(null);
    };
    logoImg.src = '/TVRI-logo.svg';
  };

  const drawCertificate = (logoImg: HTMLImageElement | null) => {
    if (!qrDataUrl || !license) return;

    // Create a canvas with the full certificate design
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 400;
    const height = 520;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Top blue bar
    ctx.fillStyle = '#1c316b';
    ctx.fillRect(0, 0, width, 8);

    // Border
    ctx.strokeStyle = '#1c316b';
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, width - 3, height - 3);

    // Logo section
    if (logoImg) {
      // Draw TVRI logo (scale to fit height of 36px)
      const logoHeight = 36;
      const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
      ctx.drawImage(logoImg, 20, 24, logoWidth, logoHeight);
      
      ctx.fillStyle = '#1c316b';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Nobar', 20 + logoWidth + 8, 40);
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px Arial';
      ctx.fillText('Lisensi Resmi', 20 + logoWidth + 8, 54);
    } else {
      // Fallback text logo
      ctx.fillStyle = '#1c316b';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('TVRI Nobar', 20, 40);
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px Arial';
      ctx.fillText('Lisensi Resmi', 20, 54);
    }

    // Licensed badge
    ctx.fillStyle = '#dcfce7';
    roundRect(ctx, 300, 30, 80, 24, 4);
    ctx.fill();
    ctx.fillStyle = '#166534';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BERLISENSI', 340, 46);

    // Venue name
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(license.venue.businessName, width / 2, 100);

    // License ID
    const certNumber = license.midtransId || license.id.slice(-8).toUpperCase();
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Arial';
    ctx.fillText(`ID: ${certNumber}`, width / 2, 118);

    // Venue type
    ctx.fillText(VENUE_TYPE_LABELS[license.venue.venueType] || license.venue.venueType, width / 2, 134);

    // QR Code background
    ctx.fillStyle = '#1c316b';
    ctx.fillRect(0, 150, width, 220);

    // Load and draw QR code
    const qrImg = new Image();
    qrImg.onload = () => {
      // White background for QR
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, (width - 180) / 2, 165, 180, 180, 8);
      ctx.fill();
      
      // Draw QR
      ctx.drawImage(qrImg, (width - 160) / 2, 175, 160, 160);

      // Scan text
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Scan untuk verifikasi', width / 2, 360);

      // Info section
      ctx.fillStyle = '#6b7280';
      ctx.font = '9px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('LOKASI', 30, 395);
      ctx.fillStyle = '#111827';
      ctx.font = '12px Arial';
      ctx.fillText(`${license.venue.kabupaten}, ${license.venue.provinsi}`, 30, 412);

      // Tier section - use TVRI brand color with 10% opacity approximation
      ctx.fillStyle = '#e8ebf2';
      roundRect(ctx, 20, 430, width - 40, 40, 6);
      ctx.fill();
      
      const tierData = LICENSE_TIERS[license.tier];
      ctx.fillStyle = '#6b7280';
      ctx.font = '9px Arial';
      ctx.fillText('KAPASITAS LISENSI', 30, 448);
      ctx.fillStyle = '#1c316b';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(tierData?.label || `Tier ${license.tier}`, 30, 464);
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(tierData?.description || '', width - 30, 458);

      // Footer
      ctx.fillStyle = '#9ca3af';
      ctx.font = '8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Berlaku untuk Piala Dunia FIFA 2026', width / 2, 500);

      // Download
      const link = document.createElement('a');
      link.download = `QR-Lisensi-${license.venue.businessName.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    qrImg.src = qrDataUrl;
  };

  // Helper function to draw rounded rectangles
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

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
        <Link href="/dashboard/licenses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">QR Tidak Tersedia</h2>
            <p className="text-gray-500">{error || 'QR code hanya tersedia untuk lisensi yang sudah dibayar.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tierData = LICENSE_TIERS[license.tier];

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/licenses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Lisensi</h1>
          <p className="text-gray-500 mt-1">Unduh dan cetak untuk ditampilkan di venue</p>
        </div>
      </div>

      {/* QR Card Preview */}
      <Card className="overflow-hidden border-2 border-[#1c316b]">
        {/* Top bar */}
        <div className="h-2 bg-[#1c316b]" />
        
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img src="/TVRI-logo.svg" alt="TVRI" className="h-9 w-auto" />
              <div>
                <p className="font-bold text-[#1c316b] text-sm">Nobar</p>
                <p className="text-xs text-gray-500">Lisensi Resmi</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              BERLISENSI
            </Badge>
          </div>

          {/* Venue Info */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">{license.venue.businessName}</h2>
            <p className="text-xs text-gray-500">
              ID: {license.midtransId || license.id.slice(-8).toUpperCase()}
            </p>
            <p className="text-sm text-gray-500">
              {VENUE_TYPE_LABELS[license.venue.venueType] || license.venue.venueType}
            </p>
          </div>

          {/* QR Code */}
          <div className="bg-[#1c316b] -mx-5 py-5 mb-4">
            <div className="flex justify-center">
              <div className="bg-white p-2 rounded-lg">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-40 h-40" />
                ) : (
                  <div className="w-40 h-40 bg-gray-100 animate-pulse rounded" />
                )}
              </div>
            </div>
            <p className="text-center text-white text-sm mt-3">Scan untuk verifikasi</p>
          </div>

          {/* Location */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 uppercase">Lokasi</p>
            <p className="text-sm text-gray-900">{license.venue.kabupaten}, {license.venue.provinsi}</p>
          </div>

          {/* Tier */}
          <div className="bg-[#1c316b]/10 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Kapasitas Lisensi</p>
              <p className="font-bold text-[#1c316b]">{tierData?.label}</p>
            </div>
            <p className="text-[#1c316b]">{tierData?.description}</p>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Berlaku untuk Piala Dunia FIFA 2026
          </p>
        </CardContent>
      </Card>

      {/* Download Button */}
      <Button onClick={handleDownload} size="lg" className="w-full bg-[#1c316b] hover:bg-[#1c316b]/90">
        <Download className="w-4 h-4 mr-2" />
        Unduh QR Lisensi
      </Button>

      <p className="text-center text-sm text-gray-500">
        Cetak dan tempelkan di tempat yang mudah terlihat di venue Anda
      </p>
    </div>
  );
}
