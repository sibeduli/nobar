'use client';

import { AlertTriangle } from 'lucide-react';

export default function TermsAndConditionsContent() {
  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      {/* Template Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 not-prose">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Pemberitahuan</p>
            <p className="text-sm text-blue-700 mt-1">
              Dokumen ini merupakan template Syarat dan Ketentuan yang akan diperbarui dengan versi final oleh tim kami. Dengan menyetujui, Anda memahami bahwa ketentuan ini dapat berubah sewaktu-waktu.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-900 mt-0">Syarat dan Ketentuan Umum</h2>
      <p className="text-sm text-gray-500 mb-4">Nonton Bareng Bola Gembira Piala Dunia 2026</p>

      <p>
        Selamat datang di aplikasi resmi pendaftaran lisensi Nonton Bareng Bola Gembira Piala Dunia 2026 oleh TVRI. Berikut adalah syarat dan ketentuan umum bagi pelaku usaha atau publik lainnya yang ingin melakukan pendaftaran Nonton Bareng Bola Gembira Piala Dunia 2026.
      </p>

      <h3 className="text-base font-semibold text-gray-900 mt-6">Ketentuan Umum</h3>
      <ol>
        <li>Pendaftar wajib memiliki izin usaha atau izin penyelenggaraan kegiatan yang sah sesuai ketentuan yang berlaku.</li>
        <li>Pendaftar bertanggung jawab penuh atas keamanan, ketertiban, dan kenyamanan pengunjung selama acara berlangsung.</li>
        <li>Penayangan hanya diperbolehkan melalui siaran resmi TVRI.</li>
        <li>Dilarang melakukan perekaman ulang atau redistribusi siaran dalam bentuk apapun.</li>
        <li>Pendaftar wajib menampilkan QR Code lisensi yang valid di lokasi venue.</li>
        <li>TVRI berhak mencabut lisensi jika terjadi pelanggaran terhadap ketentuan yang berlaku.</li>
      </ol>

      <h3 className="text-base font-semibold text-gray-900 mt-6">Lisensi Non-Komersial</h3>
      <p>Ketentuan khusus untuk lisensi non-komersial:</p>
      <ol>
        <li>Hanya berlaku untuk Usaha Mikro dan Kecil sesuai definisi peraturan perundang-undangan yang berlaku.</li>
        <li>Tidak diizinkan menggunakan atribut produk sebagai sponsor dalam bentuk apapun.</li>
        <li>Tidak diizinkan menggunakan nama, logo, atau merek dagang FIFA.</li>
        <li>Tidak diizinkan memungut biaya masuk atau tiket kepada pengunjung.</li>
        <li>Tidak diizinkan melakukan kegiatan promosi berbayar terkait acara.</li>
        <li>Kapasitas venue maksimal sesuai dengan tier lisensi yang dipilih.</li>
      </ol>

      <h3 className="text-base font-semibold text-gray-900 mt-6">Lisensi Komersial</h3>
      <p>Ketentuan khusus untuk lisensi komersial:</p>
      <ol>
        <li>Berlaku untuk Usaha Menengah dan Besar sesuai definisi peraturan perundang-undangan yang berlaku.</li>
        <li>Tidak diizinkan menggunakan nama, logo, atau merek dagang FIFA tanpa izin resmi dari FIFA.</li>
        <li>Diizinkan memungut biaya masuk atau tiket kepada pengunjung dengan ketentuan yang berlaku.</li>
        <li>Diizinkan melakukan kegiatan promosi dengan batasan tertentu.</li>
        <li>Wajib menyertakan logo TVRI dalam materi promosi.</li>
        <li>Kapasitas venue sesuai dengan tier lisensi yang dipilih.</li>
      </ol>

      <h3 className="text-base font-semibold text-gray-900 mt-6">Larangan Umum</h3>
      <ol>
        <li>Dilarang menayangkan siaran di luar jadwal yang telah ditentukan.</li>
        <li>Dilarang mengubah, memodifikasi, atau menambahkan konten pada siaran.</li>
        <li>Dilarang menggunakan lisensi untuk venue atau lokasi selain yang terdaftar.</li>
        <li>Dilarang memindahtangankan lisensi kepada pihak lain.</li>
        <li>Dilarang melakukan kegiatan yang melanggar hukum atau ketertiban umum.</li>
      </ol>

      <h3 className="text-base font-semibold text-gray-900 mt-6">Sanksi Pelanggaran</h3>
      <p>
        Pelanggaran terhadap syarat dan ketentuan ini dapat mengakibatkan:
      </p>
      <ol>
        <li>Pembekuan lisensi sementara.</li>
        <li>Pencabutan lisensi secara permanen.</li>
        <li>Tuntutan hukum sesuai peraturan perundang-undangan yang berlaku.</li>
        <li>Larangan pendaftaran lisensi di masa mendatang.</li>
      </ol>

      <h3 className="text-base font-semibold text-gray-900 mt-6">Kontak</h3>
      <p>
        Untuk informasi lebih lanjut, silakan hubungi:
      </p>
      <ul>
        <li><strong>Email:</strong> nobar@tvri.go.id</li>
        <li><strong>WhatsApp:</strong> +62 812-3456-7890</li>
      </ul>

      <p className="mt-6 text-sm text-gray-500">
        Dengan mengakses dan menggunakan aplikasi ini, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh Syarat dan Ketentuan di atas. Ketentuan ini dapat berubah sewaktu-waktu dan perubahan akan diinformasikan melalui aplikasi atau email terdaftar.
      </p>
    </div>
  );
}
