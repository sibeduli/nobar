'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, QrCode, X } from 'lucide-react';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';

export default function ScanPage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanning = async () => {
    setError(null);
    setIsScanning(true);

    // Wait for DOM element to be rendered
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const element = document.getElementById('qr-reader');
      if (!element) {
        throw new Error('QR reader element not found');
      }

      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR code scanned successfully
          handleScanResult(decodedText);
        },
        () => {
          // QR code scan error (ignore, keep scanning)
        }
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin kamera.');
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const handleScanResult = async (result: string) => {
    await stopScanning();
    
    // Extract license ID from the scanned URL or raw ID
    let licenseId = result;
    
    // If it's a URL, extract the ID from the path
    if (result.includes('/verify/')) {
      const parts = result.split('/verify/');
      licenseId = parts[parts.length - 1];
    } else if (result.includes('/license/')) {
      const parts = result.split('/license/');
      licenseId = parts[parts.length - 1];
    }
    
    // Clean up the ID (remove any query params or trailing slashes)
    licenseId = licenseId.split('?')[0].split('#')[0].replace(/\/$/, '');
    
    // Navigate to the license detail page
    router.push(`/dashboard/licenses/${licenseId}`);
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scan QR Lisensi</h1>
          <p className="text-gray-500 mt-1">Scan QR code untuk melihat detail lisensi</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Scanner
          </CardTitle>
          <CardDescription>
            Arahkan kamera ke QR code pada sertifikat lisensi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {!isScanning ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Camera className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-center">
                Klik tombol di bawah untuk mulai scan
              </p>
              <Button onClick={startScanning} size="lg">
                <Camera className="w-4 h-4 mr-2" />
                Mulai Scan
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div 
                id="qr-reader" 
                className="w-full max-w-md mx-auto rounded-lg overflow-hidden"
              />
              <div className="flex justify-center">
                <Button variant="outline" onClick={stopScanning}>
                  <X className="w-4 h-4 mr-2" />
                  Batal
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <QrCode className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Tentang QR Lisensi</h3>
              <p className="text-sm text-gray-500 mt-1">
                Setiap sertifikat lisensi memiliki QR code unik yang dapat di-scan 
                untuk memverifikasi keaslian lisensi. QR code berisi ID lisensi 
                yang terhubung dengan data venue di sistem kami.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
