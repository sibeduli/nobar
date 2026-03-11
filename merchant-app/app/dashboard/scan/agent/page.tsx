'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserCheck, Phone, MapPin, Building2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface AgentData {
  id: number;
  name: string;
  phone: string;
  areas: string[];
  company: {
    name: string;
    code: string;
  };
  status: 'active' | 'inactive';
  qr_code: string;
}

export default function AgentVerificationPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      verifyAgent(code);
    } else {
      setError('Kode QR tidak ditemukan');
      setLoading(false);
    }
  }, [code]);

  const verifyAgent = async (qrCode: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/verify-agent?code=${encodeURIComponent(qrCode)}`);
      const data = await response.json();
      
      if (response.ok && data.agent) {
        setAgent(data.agent);
      } else {
        setError(data.error || 'Agen tidak ditemukan');
      }
    } catch (err) {
      console.error('Error verifying agent:', err);
      setError('Gagal memverifikasi agen. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/scan">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verifikasi Agen</h1>
          <p className="text-gray-500 mt-1">Hasil scan QR code agen surveyor</p>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
              <p className="text-gray-500">Memverifikasi agen...</p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Verifikasi Gagal</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
              <Link href="/dashboard/scan">
                <Button variant="outline">
                  Scan Ulang
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : agent ? (
        <>
          {/* Verification Status */}
          <Card className={agent.status === 'active' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  agent.status === 'active' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {agent.status === 'active' ? (
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  ) : (
                    <XCircle className="w-7 h-7 text-yellow-600" />
                  )}
                </div>
                <div>
                  <h3 className={`font-semibold ${
                    agent.status === 'active' ? 'text-green-900' : 'text-yellow-900'
                  }`}>
                    {agent.status === 'active' ? 'Agen Terverifikasi' : 'Agen Tidak Aktif'}
                  </h3>
                  <p className={`text-sm ${
                    agent.status === 'active' ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {agent.status === 'active' 
                      ? 'Agen ini adalah surveyor resmi yang terdaftar'
                      : 'Agen ini terdaftar tetapi saat ini tidak aktif'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-600" />
                Detail Agen
              </CardTitle>
              <CardDescription>
                Informasi lengkap agen surveyor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <UserCheck className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Nama Agen</p>
                  <p className="font-semibold text-gray-900">{agent.name}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Nomor Telepon</p>
                  <p className="font-semibold text-gray-900">{agent.phone}</p>
                </div>
              </div>

              {/* Company */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Perusahaan</p>
                  <p className="font-semibold text-gray-900">{agent.company.name}</p>
                  <p className="text-xs text-gray-500">Kode: {agent.company.code}</p>
                </div>
              </div>

              {/* Areas */}
              {agent.areas && agent.areas.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Area Kerja</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {agent.areas.map((area, index) => (
                        <span 
                          key={index}
                          className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* QR Code */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Kode QR</p>
                <p className="font-mono text-xs text-gray-600 mt-1">{agent.qr_code}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/dashboard/scan" className="flex-1">
              <Button variant="outline" className="w-full">
                Scan Lagi
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full">
                Kembali ke Dashboard
              </Button>
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
