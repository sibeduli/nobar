'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, QrCode, X, Store, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';

type ScanMode = 'license' | 'agent';

export default function ScanPage() {
  const router = useRouter();
  const [scanMode, setScanMode] = useState<ScanMode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanning = async (mode: ScanMode) => {
    setScanMode(mode);
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
          handleScanResult(decodedText, mode);
        },
        () => {
          // QR code scan error (ignore, keep scanning)
        }
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin kamera.');
      setIsScanning(false);
      setScanMode(null);
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
    setScanMode(null);
  };

  const handleScanResult = async (result: string, mode: ScanMode) => {
    await stopScanning();
    
    if (mode === 'license') {
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
    } else if (mode === 'agent') {
      // Agent QR format: AGENT-COMPANY-YEAR-XXXX-NAME
      if (result.startsWith('AGENT-')) {
        // Navigate to agent verification page with the QR code
        router.push(`/dashboard/scan/agent?code=${encodeURIComponent(result)}`);
      } else {
        setError('QR code tidak valid. Pastikan Anda scan QR code dari kartu ID agen surveyor.');
      }
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Scan QR Code</h1>
          <p className="text-gray-500 mt-1">Pilih jenis QR code yang ingin di-scan</p>
        </div>
      </div>

      {!isScanning ? (
        <>
          {/* Scan Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* License QR Scan */}
            <Card className="cursor-pointer hover:border-blue-300 transition-colors" onClick={() => startScanning('license')}>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Store className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Scan Lisensi Venue</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Scan QR code pada sertifikat lisensi untuk melihat detail venue
                    </p>
                  </div>
                  <Button className="w-full">
                    <Camera className="w-4 h-4 mr-2" />
                    Scan Lisensi
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Agent QR Scan */}
            <Card className="cursor-pointer hover:border-teal-300 transition-colors" onClick={() => startScanning('agent')}>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center">
                    <UserCheck className="w-8 h-8 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Scan Agen Surveyor</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Scan QR code pada kartu ID agen untuk verifikasi identitas
                    </p>
                  </div>
                  <Button variant="outline" className="w-full border-teal-200 text-teal-700 hover:bg-teal-50">
                    <Camera className="w-4 h-4 mr-2" />
                    Scan Agen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <QrCode className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">QR Lisensi</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      QR code pada sertifikat lisensi berisi ID unik yang terhubung dengan data venue.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">QR Agen</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      QR code pada kartu ID agen untuk memverifikasi identitas surveyor resmi.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {scanMode === 'license' ? (
                <Store className="w-5 h-5 text-blue-600" />
              ) : (
                <UserCheck className="w-5 h-5 text-teal-600" />
              )}
              {scanMode === 'license' ? 'Scan Lisensi Venue' : 'Scan Agen Surveyor'}
            </CardTitle>
            <CardDescription>
              {scanMode === 'license' 
                ? 'Arahkan kamera ke QR code pada sertifikat lisensi'
                : 'Arahkan kamera ke QR code pada kartu ID agen'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
