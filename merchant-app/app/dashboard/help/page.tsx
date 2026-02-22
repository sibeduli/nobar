'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageCircle, AlertTriangle, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base">Pengaduan</CardTitle>
                <CardDescription>Laporkan masalah atau keluhan</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/pengaduan">
              <Button variant="outline" size="sm">
                Buka Halaman Pengaduan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
          <CardDescription>Pertanyaan yang sering diajukan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900">Bagaimana cara mendaftar venue?</h4>
            <p className="text-sm text-gray-500 mt-1">
              Klik menu &quot;Venue Saya&quot; lalu pilih &quot;Daftar Venue&quot;. Isi formulir dengan lengkap termasuk data venue, kapasitas, dan lokasi. Setelah submit, venue Anda akan terdaftar dan siap untuk diaktifkan lisensinya.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Bagaimana cara mengaktifkan lisensi?</h4>
            <p className="text-sm text-gray-500 mt-1">
              Setelah venue terdaftar, buka menu &quot;Lisensi&quot; dan pilih venue yang ingin diaktifkan. Klik &quot;Bayar Lisensi&quot;, pilih metode pembayaran, dan selesaikan pembayaran. Lisensi akan langsung aktif setelah pembayaran berhasil.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Berapa biaya lisensi nobar?</h4>
            <p className="text-sm text-gray-500 mt-1">
              Biaya lisensi berdasarkan kapasitas venue:<br />
              • Tier 1 (≤50 orang): Rp 5.000.000<br />
              • Tier 2 (51-100 orang): Rp 10.000.000<br />
              • Tier 3 (101-250 orang): Rp 20.000.000<br />
              • Tier 4 (251-500 orang): Rp 40.000.000<br />
              • Tier 5 (501-1000 orang): Rp 100.000.000<br />
              Ditambah PPN 12% dan biaya aplikasi Rp 5.000.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Metode pembayaran apa saja yang tersedia?</h4>
            <p className="text-sm text-gray-500 mt-1">
              Kami menerima berbagai metode pembayaran melalui Midtrans, termasuk transfer bank (BCA, BNI, BRI, Mandiri, Permata), kartu kredit/debit, e-wallet (GoPay, ShopeePay, DANA), dan gerai retail (Alfamart, Indomaret).
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Bagaimana cara mendapatkan invoice?</h4>
            <p className="text-sm text-gray-500 mt-1">
              Setelah pembayaran berhasil, Anda dapat mengunduh invoice melalui menu &quot;Pembayaran&quot;. Klik pada transaksi yang diinginkan, lalu pilih &quot;Unduh Invoice&quot;. Invoice juga dapat diakses melalui halaman detail lisensi.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Bagaimana cara menggunakan QR Code lisensi?</h4>
            <p className="text-sm text-gray-500 mt-1">
              Setelah lisensi aktif, QR Code dapat diakses melalui menu &quot;Lisensi&quot; lalu klik &quot;Lihat QR&quot;. QR Code ini dapat ditampilkan di venue Anda sebagai bukti lisensi resmi. Petugas dapat memindai QR Code untuk memverifikasi keabsahan lisensi.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <CardTitle className="text-orange-800">Informasi Pembekuan Lisensi</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-orange-700">
            Lisensi dapat dibekukan oleh admin jika terjadi pelanggaran ketentuan atau masalah lainnya. Jika lisensi Anda dibekukan, Anda akan dihubungi oleh tim kami melalui:
          </p>
          <ul className="text-sm text-orange-700 list-disc list-inside space-y-1">
            <li><strong>WhatsApp</strong> - Tim admin akan menghubungi nomor yang terdaftar</li>
            <li><strong>Halaman Pengaduan</strong> - Pesan akan dikirim melalui sistem pengaduan</li>
          </ul>
          <p className="text-sm text-orange-700">
            Untuk informasi lebih lanjut atau mengajukan banding, silakan hubungi tim kami melalui WhatsApp atau buat tiket pengaduan baru.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-100 w-full sm:w-auto">
                <MessageCircle className="w-4 h-4 mr-2" />
                Hubungi via WhatsApp
              </Button>
            </a>
            <Link href="/dashboard/pengaduan/new">
              <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-100 w-full sm:w-auto">
                <FileText className="w-4 h-4 mr-2" />
                Buat Pengaduan
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
