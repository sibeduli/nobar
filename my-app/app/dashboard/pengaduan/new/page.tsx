'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Send,
  CreditCard,
  FileText,
  Wrench,
  HelpCircle,
  AlertTriangle,
  Info,
  AlertCircle,
  Zap,
  CheckCircle,
} from 'lucide-react';
import { useAlert } from '@/components/AlertModal';

const CATEGORIES = [
  {
    value: 'payment',
    label: 'Pembayaran',
    description: 'Invoice, refund, atau masalah transaksi',
    icon: <CreditCard className="w-5 h-5" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200',
    selectedBg: 'bg-emerald-100',
  },
  {
    value: 'license',
    label: 'Lisensi',
    description: 'Aktivasi, perpanjangan, atau venue',
    icon: <FileText className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    selectedBg: 'bg-blue-100',
  },
  {
    value: 'technical',
    label: 'Teknis',
    description: 'Bug, error, atau masalah aplikasi',
    icon: <Wrench className="w-5 h-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    selectedBg: 'bg-purple-100',
  },
  {
    value: 'other',
    label: 'Lainnya',
    description: 'Pertanyaan umum atau saran',
    icon: <HelpCircle className="w-5 h-5" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-200',
    selectedBg: 'bg-gray-100',
  },
];

const PRIORITIES = [
  {
    value: 'low',
    label: 'Rendah',
    description: 'Tidak mendesak',
    icon: <Info className="w-4 h-4" />,
    color: 'text-gray-600',
    dot: 'bg-gray-400',
  },
  {
    value: 'normal',
    label: 'Normal',
    description: 'Standar',
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-blue-600',
    dot: 'bg-blue-500',
  },
  {
    value: 'high',
    label: 'Tinggi',
    description: 'Penting',
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'text-orange-600',
    dot: 'bg-orange-500',
  },
  {
    value: 'urgent',
    label: 'Mendesak',
    description: 'Kritis',
    icon: <Zap className="w-4 h-4" />,
    color: 'text-red-600',
    dot: 'bg-red-500',
  },
];

export default function NewTicketPage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    priority: 'normal',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      showError('Pilih kategori tiket');
      return;
    }

    if (!formData.subject.trim()) {
      showError('Subjek tidak boleh kosong');
      return;
    }

    if (!formData.message.trim()) {
      showError('Pesan tidak boleh kosong');
      return;
    }

    if (formData.message.trim().length < 20) {
      showError('Pesan minimal 20 karakter');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Gagal membuat tiket');
      }

      const ticket = await res.json();
      showSuccess('Tiket berhasil dibuat! Tim kami akan segera merespons.');
      router.push(`/dashboard/pengaduan/${ticket.id}`);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Gagal membuat tiket');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = CATEGORIES.find((c) => c.value === formData.category);
  const selectedPriority = PRIORITIES.find((p) => p.value === formData.priority);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="text-gray-400">Kembali</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Buat Tiket Baru</h1>
        <p className="text-gray-500 mt-1">
          Sampaikan pertanyaan atau masalah Anda, tim support kami siap membantu
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Category */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Pilih Kategori</h2>
                <p className="text-sm text-gray-500">Apa jenis masalah yang Anda alami?</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => {
                const isSelected = formData.category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? `${cat.bgColor} border-current ${cat.color}`
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? cat.selectedBg : 'bg-gray-100'
                      }`}
                    >
                      <span className={isSelected ? cat.color : 'text-gray-400'}>
                        {cat.icon}
                      </span>
                    </div>
                    <div>
                      <div className={`font-medium ${isSelected ? cat.color : 'text-gray-900'}`}>
                        {cat.label}
                      </div>
                      <div className="text-sm text-gray-500">{cat.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Details */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Detail Tiket</h2>
                <p className="text-sm text-gray-500">Jelaskan masalah Anda dengan lengkap</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                  Subjek <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  placeholder="Contoh: Tidak bisa melakukan pembayaran"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  maxLength={100}
                  className="h-12"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Ringkasan singkat masalah Anda</span>
                  <span>{formData.subject.length}/100</span>
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Prioritas</Label>
                <div className="flex gap-2 flex-wrap">
                  {PRIORITIES.map((pri) => {
                    const isSelected = formData.priority === pri.value;
                    return (
                      <button
                        key={pri.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: pri.value })}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm transition-all ${
                          isSelected
                            ? `border-current ${pri.color} bg-opacity-10`
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                        style={isSelected ? { backgroundColor: `${pri.dot.replace('bg-', '')}10` } : {}}
                      >
                        <span className={`w-2 h-2 rounded-full ${pri.dot}`}></span>
                        <span className={isSelected ? pri.color : ''}>{pri.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                  Pesan <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="message"
                  placeholder="Jelaskan masalah Anda secara detail...

Contoh:
- Apa yang terjadi?
- Kapan masalah ini mulai terjadi?
- Langkah apa yang sudah Anda coba?
- Sertakan nomor invoice/referensi jika ada"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm leading-relaxed placeholder:text-gray-400 bg-gray-50 focus:bg-white transition-colors"
                />
                <div className="flex justify-between text-xs">
                  <span className={formData.message.length < 20 ? 'text-amber-600' : 'text-gray-400'}>
                    {formData.message.length < 20
                      ? `Minimal ${20 - formData.message.length} karakter lagi`
                      : 'Deskripsi sudah cukup'}
                  </span>
                  <span className="text-gray-400">{formData.message.length} karakter</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary & Submit */}
        <Card className="border-0 shadow-sm bg-gray-50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4 text-sm">
                {selectedCategory && (
                  <div className={`flex items-center gap-1.5 ${selectedCategory.color}`}>
                    {selectedCategory.icon}
                    {selectedCategory.label}
                  </div>
                )}
                {selectedPriority && (
                  <div className={`flex items-center gap-1.5 ${selectedPriority.color}`}>
                    <span className={`w-2 h-2 rounded-full ${selectedPriority.dot}`}></span>
                    {selectedPriority.label}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.category || !formData.subject.trim() || formData.message.length < 20}
                  className="gap-2 px-6"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Kirim Tiket
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
