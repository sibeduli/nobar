'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Mail, Phone, MessageCircle } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bantuan</h1>
        <p className="text-gray-500 mt-1">Pusat bantuan dan dukungan</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">WhatsApp</CardTitle>
                <CardDescription>Chat langsung dengan tim kami</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              +62 812-3456-7890
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base">Email</CardTitle>
                <CardDescription>Kirim pertanyaan via email</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <a
              href="mailto:nobar@tvri.go.id"
              className="text-blue-600 hover:underline"
            >
              nobar@tvri.go.id
            </a>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
          <CardDescription>Pertanyaan yang sering diajukan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Bagaimana cara mendaftar venue?</h4>
            <p className="text-sm text-gray-500 mt-1">
              Klik menu "Venue Saya" lalu pilih "Daftar Venue". Isi formulir dengan lengkap dan submit.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Berapa biaya lisensi nobar?</h4>
            <p className="text-sm text-gray-500 mt-1">
              Biaya lisensi bervariasi tergantung kapasitas venue. Tim kami akan menghubungi Anda setelah pendaftaran.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Berapa lama proses verifikasi?</h4>
            <p className="text-sm text-gray-500 mt-1">
              Proses verifikasi membutuhkan waktu 3-5 hari kerja setelah dokumen lengkap.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
