import { useState, useRef } from 'react';
import AgentLayout from '@/Layouts/AgentLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import { router } from '@inertiajs/react';
import {
    AlertTriangle, Camera, QrCode, Store, Users, X, Check, Loader2,
    Navigation, ShieldCheck, ShieldX, ShoppingBag, CheckCircle, ArrowLeft, Scan,
} from 'lucide-react';

const violationTypes = [
    { value: 'capacity_exceeded', label: 'Melebihi Kapasitas', desc: 'Pengunjung melebihi batas' },
    { value: 'ads_violation', label: 'Pelanggaran Iklan', desc: 'Iklan/sponsor tidak resmi' },
    { value: 'other', label: 'Lainnya', desc: 'Pelanggaran lain' },
];

// Mock QR scan result
const mockScanQR = (qrData) => {
    if (qrData === 'LICENSED_001') {
        return { type: 'licensed', venue: { id: 1, name: 'Warkop Bola Mania', area: 'Jakarta Selatan', licenseId: 'LIC-2026-001', capacityLimit: 50 }, existingReport: null };
    } else if (qrData === 'LICENSED_002') {
        return { type: 'licensed', venue: { id: 2, name: 'Resto Piala Dunia', area: 'Jakarta Barat', licenseId: 'LIC-2026-002', capacityLimit: 100 }, existingReport: { date: '2026-02-25' } };
    }
    return { type: 'not_found' };
};

export default function AgentViolationsReport() {
    const { theme } = useTheme();
    const toast = useToast();
    const isDark = theme === 'dark';
    const fileInputRef = useRef(null);

    const [scanState, setScanState] = useState('idle');
    const [scanResult, setScanResult] = useState(null);
    const [formData, setFormData] = useState({ violationType: '', actualCount: '', description: '' });
    const [errors, setErrors] = useState({});
    const [photos, setPhotos] = useState([]);
    const [location, setLocation] = useState(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const startScan = () => {
        setScanState('scanning');
        setTimeout(() => {
            const scenarios = ['LICENSED_001', 'LICENSED_002', 'UNKNOWN'];
            const result = mockScanQR(scenarios[Math.floor(Math.random() * scenarios.length)]);
            setScanResult(result);
            setScanState('result');
        }, 2000);
    };

    const resetScan = () => {
        setScanState('idle');
        setScanResult(null);
        setFormData({ violationType: '', actualCount: '', description: '' });
        setPhotos([]);
        setLocation(null);
        setErrors({});
    };

    const handlePhotoCapture = (e) => {
        const files = Array.from(e.target.files);
        if (photos.length + files.length > 3) { toast.error('Maksimal 3 foto'); return; }
        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) { toast.error('Maks 5MB'); return; }
            const reader = new FileReader();
            reader.onload = (e) => setPhotos(prev => [...prev, { file, preview: e.target.result }]);
            reader.readAsDataURL(file);
        });
    };

    const getLocation = () => {
        if (!navigator.geolocation) { toast.error('Geolocation tidak didukung'); return; }
        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setIsGettingLocation(false); toast.success('Lokasi didapat'); },
            () => { setIsGettingLocation(false); toast.error('Gagal dapat lokasi'); },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const validate = () => {
        const newErrors = {};
        const isUnlicensed = scanResult?.type === 'unlicensed_violation';
        if (!isUnlicensed && !formData.violationType) newErrors.violationType = 'Pilih jenis pelanggaran';
        if (formData.violationType === 'capacity_exceeded' && !formData.actualCount) newErrors.actualCount = 'Wajib diisi';
        if (!formData.description.trim()) newErrors.description = 'Deskripsi wajib diisi';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) { toast.error('Lengkapi semua field'); return; }
        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 2000));
        setIsSubmitting(false);
        toast.success('Laporan berhasil dikirim!');
        router.visit('/agent');
    };

    // IDLE STATE
    if (scanState === 'idle') {
        return (
            <AgentLayout>
                <div className="space-y-6">
                    <div className="text-center pt-8">
                        <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-emerald-500/10' : 'bg-teal-50'}`}>
                            <QrCode className={`w-10 h-10 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                        </div>
                        <h1 className={`text-xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Scan QR Venue</h1>
                        <p className={`text-sm mt-2 ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}`}>Scan QR lisensi untuk verifikasi atau lapor pelanggaran</p>
                    </div>
                    <button onClick={startScan} className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-medium ${isDark ? 'bg-emerald-500 text-white' : 'bg-teal-600 text-white'}`}>
                        <Scan className="w-6 h-6" /> Mulai Scan QR
                    </button>
                    <div className="space-y-3 pt-4">
                        <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                            <div className="flex items-start gap-3">
                                <ShieldCheck className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                <div>
                                    <p className={`text-sm font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Venue Berlisensi</p>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>QR valid = bisa lapor pelanggaran</p>
                                </div>
                            </div>
                        </div>
                        <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                            <div className="flex items-start gap-3">
                                <ShieldX className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                                <div>
                                    <p className={`text-sm font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Tidak Ada Lisensi?</p>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Tawarkan lisensi. Nobar tanpa lisensi = pelanggaran!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AgentLayout>
        );
    }

    // SCANNING STATE
    if (scanState === 'scanning') {
        return (
            <AgentLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                    <div className={`w-48 h-48 rounded-2xl flex items-center justify-center relative ${isDark ? 'bg-emerald-500/10 border-2 border-emerald-500/30' : 'bg-teal-50 border-2 border-teal-200'}`}>
                        <QrCode className={`w-20 h-20 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                        <div className={`absolute inset-0 border-2 rounded-2xl animate-pulse ${isDark ? 'border-emerald-400' : 'border-teal-500'}`} />
                    </div>
                    <p className={`text-lg font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Memindai QR Code...</p>
                    <button onClick={resetScan} className={`px-4 py-2 rounded-lg text-sm ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}>Batal</button>
                </div>
            </AgentLayout>
        );
    }

    // NOT FOUND (No License)
    if (scanState === 'result' && scanResult?.type === 'not_found') {
        return (
            <AgentLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <button onClick={resetScan} className={`p-2 rounded-lg ${isDark ? 'text-emerald-500/60 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100'}`}><ArrowLeft className="w-5 h-5" /></button>
                        <h1 className={`text-lg font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Hasil Scan</h1>
                    </div>
                    <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                        <ShieldX className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                        <h2 className={`text-lg font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>Lisensi Tidak Ditemukan</h2>
                        <p className={`text-sm mt-2 ${isDark ? 'text-amber-400/70' : 'text-amber-600'}`}>QR tidak terdaftar dalam sistem</p>
                    </div>
                    <div className="space-y-3">
                        <a href="/merchant" target="_blank" className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-teal-50 border border-teal-200'}`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-teal-100'}`}>
                                <ShoppingBag className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                            </div>
                            <div><p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Tawarkan Lisensi</p><p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Buka halaman merchant</p></div>
                        </a>
                        <button onClick={() => setScanResult({ type: 'unlicensed_violation' })} className={`w-full flex items-center gap-4 p-4 rounded-xl text-left ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                                <AlertTriangle className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                            </div>
                            <div><p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Laporkan Pelanggaran</p><p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Venue nobar tanpa lisensi</p></div>
                        </button>
                    </div>
                    <button onClick={resetScan} className={`w-full py-3 rounded-xl text-sm font-medium ${isDark ? 'bg-emerald-950/50 text-emerald-400' : 'bg-gray-100 text-gray-700'}`}>Scan QR Lain</button>
                </div>
            </AgentLayout>
        );
    }

    // ALREADY REPORTED
    if (scanState === 'result' && scanResult?.type === 'licensed' && scanResult?.existingReport) {
        return (
            <AgentLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <button onClick={resetScan} className={`p-2 rounded-lg ${isDark ? 'text-emerald-500/60 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100'}`}><ArrowLeft className="w-5 h-5" /></button>
                        <h1 className={`text-lg font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Hasil Scan</h1>
                    </div>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <Store className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                            <div>
                                <div className="flex items-center gap-2"><p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{scanResult.venue.name}</p><ShieldCheck className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} /></div>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{scanResult.venue.area}</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                        <CheckCircle className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <h2 className={`text-lg font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Sudah Ditangani</h2>
                        <p className={`text-sm mt-2 ${isDark ? 'text-blue-400/70' : 'text-blue-600'}`}>Laporan sudah ada dan sedang diproses</p>
                        <p className={`text-xs mt-3 ${isDark ? 'text-blue-400/50' : 'text-blue-500'}`}>Dilaporkan {new Date(scanResult.existingReport.date).toLocaleDateString('id-ID')}</p>
                    </div>
                    <p className={`text-xs text-center ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`}>Hubungi PIC untuk info lebih lanjut</p>
                    <button onClick={resetScan} className={`w-full py-3 rounded-xl font-medium ${isDark ? 'bg-emerald-500 text-white' : 'bg-teal-600 text-white'}`}>Scan QR Lain</button>
                </div>
            </AgentLayout>
        );
    }

    // REPORT FORM (Licensed or Unlicensed violation)
    const isUnlicensed = scanResult?.type === 'unlicensed_violation';
    return (
        <AgentLayout>
            <form onSubmit={handleSubmit} className="space-y-6 pb-4">
                <div className="flex items-center gap-3">
                    <button type="button" onClick={resetScan} className={`p-2 rounded-lg ${isDark ? 'text-emerald-500/60 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100'}`}><ArrowLeft className="w-5 h-5" /></button>
                    <div>
                        <h1 className={`text-lg font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Lapor Pelanggaran</h1>
                        <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{isUnlicensed ? 'Venue tanpa lisensi' : scanResult?.venue?.name}</p>
                    </div>
                </div>

                {!isUnlicensed && scanResult?.venue && (
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <Store className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                            <div>
                                <div className="flex items-center gap-2"><p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{scanResult.venue.name}</p><ShieldCheck className="w-4 h-4 text-emerald-500" /></div>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Kapasitas: {scanResult.venue.capacityLimit} orang</p>
                            </div>
                        </div>
                    </div>
                )}

                {isUnlicensed && (
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-center gap-3">
                            <ShieldX className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                            <div><p className={`text-sm font-medium ${isDark ? 'text-red-300' : 'text-red-700'}`}>Nobar Tanpa Lisensi</p></div>
                        </div>
                    </div>
                )}

                {!isUnlicensed && (
                    <div className={`rounded-xl p-4 space-y-3 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <h2 className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>Jenis Pelanggaran *</h2>
                        {violationTypes.map(type => (
                            <button key={type.value} type="button" onClick={() => { setFormData(p => ({ ...p, violationType: type.value })); setErrors(p => ({ ...p, violationType: null })); }}
                                className={`w-full p-3 rounded-lg text-left ${formData.violationType === type.value ? (isDark ? 'bg-red-500/20 border border-red-500/30' : 'bg-red-50 border border-red-200') : (isDark ? 'bg-emerald-950/30 border border-emerald-900/50' : 'bg-gray-50 border border-gray-200')}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border-2 ${formData.violationType === type.value ? 'border-red-500 bg-red-500' : 'border-gray-400'}`} />
                                    <div><p className={`text-sm font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{type.label}</p><p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{type.desc}</p></div>
                                </div>
                            </button>
                        ))}
                        {errors.violationType && <p className="text-xs text-red-500">{errors.violationType}</p>}
                        {formData.violationType === 'capacity_exceeded' && (
                            <div className="relative">
                                <Users className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`} />
                                <input type="number" name="actualCount" value={formData.actualCount} onChange={handleChange} placeholder="Jumlah pengunjung aktual"
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm ${isDark ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100' : 'bg-white border border-gray-200'}`} />
                                {errors.actualCount && <p className="text-xs text-red-500 mt-1">{errors.actualCount}</p>}
                            </div>
                        )}
                    </div>
                )}

                <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <h2 className={`text-sm font-semibold mb-3 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>Deskripsi {isUnlicensed && '& Lokasi'} *</h2>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder={isUnlicensed ? "Lokasi, nama venue, detail pelanggaran..." : "Detail pelanggaran..."}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm resize-none ${isDark ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100' : 'bg-white border border-gray-200'}`} />
                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                </div>

                <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <div className="flex justify-between mb-3"><h2 className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>Foto Bukti</h2><span className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{photos.length}/3</span></div>
                    <div className="grid grid-cols-3 gap-2">
                        {photos.map((p, i) => (<div key={i} className="relative aspect-square rounded-lg overflow-hidden"><img src={p.preview} className="w-full h-full object-cover" /><button type="button" onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white"><X className="w-3 h-3" /></button></div>))}
                        {photos.length < 3 && (<button type="button" onClick={() => fileInputRef.current?.click()} className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center ${isDark ? 'border-emerald-900/50 text-emerald-500/60' : 'border-gray-300 text-gray-400'}`}><Camera className="w-6 h-6" /><span className="text-[10px]">Tambah</span></button>)}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" capture="environment" multiple onChange={handlePhotoCapture} className="hidden" />
                </div>

                <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <h2 className={`text-sm font-semibold mb-3 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>Lokasi GPS</h2>
                    {location ? (
                        <div className={`p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                            <Check className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <div><p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Lokasi Didapat</p><p className={`text-xs ${isDark ? 'text-emerald-400/70' : 'text-emerald-600'}`}>{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p></div>
                        </div>
                    ) : (
                        <button type="button" onClick={getLocation} disabled={isGettingLocation} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-teal-50 border border-teal-200 text-teal-700'}`}>
                            {isGettingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                            {isGettingLocation ? 'Mendapatkan...' : 'Ambil Lokasi'}
                        </button>
                    )}
                </div>

                <button type="submit" disabled={isSubmitting} className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium ${isSubmitting ? 'opacity-70' : ''} ${isDark ? 'bg-red-500 text-white' : 'bg-red-600 text-white'}`}>
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertTriangle className="w-5 h-5" />}
                    {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
            </form>
        </AgentLayout>
    );
}
