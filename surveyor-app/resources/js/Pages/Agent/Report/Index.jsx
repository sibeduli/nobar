import { useState, useRef } from 'react';
import AgentLayout from '@/Layouts/AgentLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import { router } from '@inertiajs/react';
import {
    QrCode, X, Camera, MapPin, Store, Users, Check, Loader2, Navigation,
    ShieldCheck, ShieldX, AlertTriangle, ArrowLeft, Scan, FileText, Image,
    ChevronRight, Ban, Megaphone, HelpCircle,
} from 'lucide-react';

// Mock QR validation
const mockValidateQR = (qrData) => {
    if (qrData === 'VALID_HANDLED') {
        return {
            valid: true,
            alreadyHandled: true,
            handledDate: '2026-02-25',
            venue: {
                id: 2,
                name: 'Resto Piala Dunia',
                address: 'Jl. Gatot Subroto No. 12, Jakarta Barat',
                capacityLimit: 100,
                contactPerson: 'Bu Siti',
                phone: '08198765432',
                licensePurchaseDate: '2026-02-01',
                licenseId: 'LIC-2026-002',
            }
        };
    }
    if (qrData?.startsWith('VALID_')) {
        return {
            valid: true,
            alreadyHandled: false,
            venue: {
                id: 1,
                name: 'Warkop Bola Mania',
                address: 'Jl. Sudirman No. 45, Jakarta Selatan',
                capacityLimit: 50,
                contactPerson: 'Pak Joko',
                phone: '08123456789',
                licensePurchaseDate: '2026-01-15',
                licenseId: 'LIC-2026-001',
            }
        };
    }
    return { valid: false };
};

const REPORT_TYPES = {
    approved: { label: 'Disetujui', color: 'emerald', icon: Check },
    offering: { label: 'Penawaran', color: 'blue', icon: FileText },
    violation_invalid_qr: { label: 'Pelanggaran - QR Invalid', color: 'red', icon: ShieldX },
    violation_quota: { label: 'Pelanggaran - Melebihi Kapasitas', color: 'red', icon: Users },
    violation_ads: { label: 'Pelanggaran - Iklan Ilegal', color: 'red', icon: Megaphone },
    violation_no_license: { label: 'Pelanggaran - Tanpa Lisensi', color: 'red', icon: Ban },
    violation_invalid_venue: { label: 'Pelanggaran - Venue Invalid', color: 'red', icon: Store },
    other: { label: 'Lainnya', color: 'gray', icon: HelpCircle },
};

export default function AgentReport() {
    const { theme } = useTheme();
    const toast = useToast();
    const isDark = theme === 'dark';
    const fileInputRef = useRef(null);

    // Flow state
    const [step, setStep] = useState('start'); // start, scan, qr_valid, qr_invalid, no_qr_check, form
    const [hasQR, setHasQR] = useState(null);
    const [venueData, setVenueData] = useState(null);
    const [reportType, setReportType] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        actualQuota: '',
        merchantName: '',
        estimatedQuota: '',
        description: '',
    });
    const [photos, setPhotos] = useState([]);
    const [location, setLocation] = useState(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handlers
    const handlePhotoCapture = (e) => {
        const files = Array.from(e.target.files);
        if (photos.length + files.length > 5) { toast.error('Maksimal 5 foto'); return; }
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

    const resetFlow = () => {
        setStep('start');
        setHasQR(null);
        setVenueData(null);
        setReportType(null);
        setFormData({ actualQuota: '', merchantName: '', estimatedQuota: '', description: '' });
        setPhotos([]);
        setLocation(null);
    };

    const handleSubmit = async () => {
        if (!reportType) { toast.error('Tipe laporan tidak valid'); return; }
        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 2000));
        setIsSubmitting(false);
        toast.success('Laporan berhasil dikirim!');
        router.visit('/agent/surveys');
    };

    // Simulate QR scan
    const simulateScan = (type) => {
        const qrMap = { valid: 'VALID_001', invalid: 'INVALID', handled: 'VALID_HANDLED' };
        const result = mockValidateQR(qrMap[type]);
        if (result.valid) {
            setVenueData(result.venue);
            if (result.alreadyHandled) {
                setStep('already_handled');
            } else {
                setStep('qr_valid');
            }
        } else {
            setReportType('violation_invalid_qr');
            setStep('qr_invalid');
        }
    };

    // ==================== STEP: START ====================
    if (step === 'start') {
        return (
            <AgentLayout>
                <div className="space-y-6 pt-4">
                    <div className="text-center">
                        <h1 className={`text-xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Laporan Baru</h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}`}>Apakah venue memiliki QR lisensi?</p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => { setHasQR(true); setStep('scan'); }}
                            className={`w-full flex items-center gap-4 p-5 rounded-xl transition-colors ${isDark ? 'bg-[#0d1414] border border-emerald-900/30 hover:border-emerald-500/50' : 'bg-white border border-gray-200 hover:border-teal-400'}`}
                        >
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10' : 'bg-teal-50'}`}>
                                <QrCode className={`w-7 h-7 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className={`font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Ada QR</p>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Scan QR lisensi venue</p>
                            </div>
                            <ChevronRight className={`w-5 h-5 ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`} />
                        </button>

                        <button
                            onClick={() => { setHasQR(false); setStep('no_qr_check'); }}
                            className={`w-full flex items-center gap-4 p-5 rounded-xl transition-colors ${isDark ? 'bg-[#0d1414] border border-emerald-900/30 hover:border-emerald-500/50' : 'bg-white border border-gray-200 hover:border-teal-400'}`}
                        >
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                                <ShieldX className={`w-7 h-7 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className={`font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Tidak Ada QR</p>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Venue tidak punya QR lisensi</p>
                            </div>
                            <ChevronRight className={`w-5 h-5 ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`} />
                        </button>
                    </div>
                </div>
            </AgentLayout>
        );
    }

    // ==================== STEP: SCAN QR ====================
    if (step === 'scan') {
        return (
            <AgentLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <button onClick={resetFlow} className={`p-2 rounded-lg ${isDark ? 'text-emerald-500/60 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100'}`}>
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className={`text-lg font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Scan QR Lisensi</h1>
                    </div>

                    {/* Camera viewfinder placeholder */}
                    <div className={`relative aspect-square rounded-2xl overflow-hidden ${isDark ? 'bg-black' : 'bg-gray-900'}`}>
                        {/* Simulated camera feed */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`w-3/4 h-3/4 relative`}>
                                {/* Scan frame corners */}
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                                {/* Scan line animation */}
                                <div className="absolute inset-x-4 h-0.5 bg-emerald-400/80 animate-pulse top-1/2" />
                            </div>
                        </div>
                        <div className="absolute bottom-4 inset-x-4 text-center">
                            <p className="text-white/80 text-sm">Arahkan kamera ke QR Code</p>
                        </div>
                    </div>

                    {/* Demo buttons - in production this would be automatic */}
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                        <p className={`text-xs text-center mb-3 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Demo: Pilih hasil scan</p>
                        <div className="flex gap-2">
                            <button onClick={() => simulateScan('valid')} className={`flex-1 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white'}`}>
                                Valid
                            </button>
                            <button onClick={() => simulateScan('handled')} className={`flex-1 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'}`}>
                                Ditangani
                            </button>
                            <button onClick={() => simulateScan('invalid')} className={`flex-1 py-2 rounded-lg text-xs font-medium ${isDark ? 'bg-red-500 text-white' : 'bg-red-600 text-white'}`}>
                                Invalid
                            </button>
                        </div>
                    </div>

                    <button onClick={resetFlow} className={`w-full py-3 rounded-xl text-sm font-medium ${isDark ? 'bg-emerald-950/50 text-emerald-400' : 'bg-gray-100 text-gray-700'}`}>
                        Batal
                    </button>
                </div>
            </AgentLayout>
        );
    }

    // ==================== STEP: ALREADY HANDLED ====================
    if (step === 'already_handled') {
        return (
            <AgentLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <button onClick={resetFlow} className={`p-2 rounded-lg ${isDark ? 'text-emerald-500/60 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100'}`}>
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className={`text-lg font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Sudah Ditangani</h1>
                    </div>

                    {/* Already Handled Notice */}
                    <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                        <Check className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <h2 className={`text-lg font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Sudah Ditangani</h2>
                        <p className={`text-sm mt-2 ${isDark ? 'text-blue-400/70' : 'text-blue-600'}`}>
                            Venue ini sudah dicek oleh agen lain dan sedang dalam proses.
                        </p>
                    </div>

                    <p className={`text-xs text-center ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`}>
                        Hubungi PIC untuk informasi lebih lanjut
                    </p>

                    <button onClick={resetFlow} className={`w-full py-3.5 rounded-xl font-medium ${isDark ? 'bg-emerald-500 text-white' : 'bg-teal-600 text-white'}`}>
                        Kembali
                    </button>
                </div>
            </AgentLayout>
        );
    }

    // ==================== STEP: QR VALID - Check venue ====================
    if (step === 'qr_valid') {
        return (
            <AgentLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <button onClick={resetFlow} className={`p-2 rounded-lg ${isDark ? 'text-emerald-500/60 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100'}`}>
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className={`text-lg font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Venue Terverifikasi</h1>
                    </div>

                    {/* Venue Info Card */}
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <span className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Lisensi Valid</span>
                        </div>
                        <h2 className={`text-lg font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{venueData?.name}</h2>
                        <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/70' : 'text-gray-600'}`}>{venueData?.address}</p>
                        <div className={`mt-3 pt-3 border-t ${isDark ? 'border-emerald-500/20' : 'border-emerald-200'} grid grid-cols-2 gap-3 text-sm`}>
                            <div><span className={isDark ? 'text-emerald-500/60' : 'text-gray-500'}>Kapasitas:</span> <span className={isDark ? 'text-emerald-100' : 'text-gray-900'}>{venueData?.capacityLimit} orang</span></div>
                            <div><span className={isDark ? 'text-emerald-500/60' : 'text-gray-500'}>Kontak:</span> <span className={isDark ? 'text-emerald-100' : 'text-gray-900'}>{venueData?.contactPerson}</span></div>
                            <div><span className={isDark ? 'text-emerald-500/60' : 'text-gray-500'}>Telepon:</span> <span className={isDark ? 'text-emerald-100' : 'text-gray-900'}>{venueData?.phone}</span></div>
                            <div><span className={isDark ? 'text-emerald-500/60' : 'text-gray-500'}>Lisensi:</span> <span className={isDark ? 'text-emerald-100' : 'text-gray-900'}>{new Date(venueData?.licensePurchaseDate).toLocaleDateString('id-ID')}</span></div>
                        </div>
                    </div>

                    {/* Quota Check */}
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                            Berapa jumlah pengunjung saat ini? <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Users className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`} />
                            <input
                                type="number"
                                value={formData.actualQuota}
                                onChange={(e) => setFormData(p => ({ ...p, actualQuota: e.target.value }))}
                                placeholder="Masukkan jumlah"
                                className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm ${isDark ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
                            />
                        </div>
                        <p className={`text-xs mt-2 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Batas kapasitas: {venueData?.capacityLimit} orang</p>
                    </div>

                    <button
                        onClick={() => {
                            const actual = parseInt(formData.actualQuota);
                            if (!actual) { toast.error('Masukkan jumlah pengunjung'); return; }
                            if (actual > venueData?.capacityLimit) {
                                setReportType('violation_quota');
                                setStep('form');
                            } else {
                                setStep('qr_valid_ads');
                            }
                        }}
                        className={`w-full py-3.5 rounded-xl font-medium ${isDark ? 'bg-emerald-500 text-white' : 'bg-teal-600 text-white'}`}
                    >
                        Lanjutkan
                    </button>
                </div>
            </AgentLayout>
        );
    }

    // ==================== STEP: QR INVALID - Capture evidence ====================
    if (step === 'qr_invalid') {
        return (
            <AgentLayout>
                <div className="space-y-6 pb-4">
                    <div className="flex items-center gap-3">
                        <button onClick={resetFlow} className={`p-2 rounded-lg ${isDark ? 'text-emerald-500/60 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100'}`}>
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className={`text-lg font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>QR Tidak Valid</h1>
                            <p className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>Pelanggaran: QR Palsu/Invalid</p>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-center gap-3">
                            <ShieldX className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                            <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                                QR code tidak terdaftar dalam sistem. Ambil foto QR sebagai bukti.
                            </p>
                        </div>
                    </div>

                    {/* Photo of QR */}
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex justify-between mb-3">
                            <h2 className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>Foto QR Code *</h2>
                            <span className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{photos.length}/5</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {photos.map((p, i) => (
                                <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                                    <img src={p.preview} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white"><X className="w-3 h-3" /></button>
                                </div>
                            ))}
                            {photos.length < 5 && (
                                <button type="button" onClick={() => fileInputRef.current?.click()} className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center ${isDark ? 'border-emerald-900/50 text-emerald-500/60' : 'border-gray-300 text-gray-400'}`}>
                                    <Camera className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" multiple onChange={handlePhotoCapture} className="hidden" />
                    </div>

                    {/* Description */}
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>Situasi/Keterangan *</label>
                        <textarea 
                            value={formData.description} 
                            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} 
                            rows={3} 
                            placeholder="Jelaskan situasi di venue, dimana QR ditemukan, dll..."
                            className={`w-full px-4 py-3 rounded-xl text-sm resize-none ${isDark ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100' : 'bg-gray-50 border border-gray-200'}`} 
                        />
                    </div>

                    {/* Location */}
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <h2 className={`text-sm font-semibold mb-3 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>Lokasi</h2>
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

                    {/* Submit */}
                    <button 
                        onClick={() => {
                            if (photos.length === 0) { toast.error('Ambil foto QR sebagai bukti'); return; }
                            if (!formData.description.trim()) { toast.error('Jelaskan situasi'); return; }
                            setStep('form');
                        }} 
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium ${isDark ? 'bg-red-500 text-white' : 'bg-red-600 text-white'}`}
                    >
                        <AlertTriangle className="w-5 h-5" />
                        Lanjutkan Laporan
                    </button>
                </div>
            </AgentLayout>
        );
    }

    // ==================== STEP: QR VALID - Ads Check ====================
    if (step === 'qr_valid_ads') {
        return (
            <AgentLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setStep('qr_valid')} className={`p-2 rounded-lg ${isDark ? 'text-emerald-500/60 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100'}`}>
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className={`text-lg font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Cek Iklan/Sponsor</h1>
                    </div>

                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <p className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                            Apakah ada iklan atau sponsor ilegal/tidak resmi di venue ini?
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => { setReportType('violation_ads'); setStep('form'); }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}
                        >
                            <Megaphone className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                            <div className="flex-1 text-left">
                                <p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Ya, Ada Iklan Ilegal</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Laporkan pelanggaran iklan</p>
                            </div>
                        </button>

                        <button
                            onClick={() => { setReportType('approved'); setStep('form'); }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}
                        >
                            <Check className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <div className="flex-1 text-left">
                                <p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Tidak, Semua Sesuai</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Venue sesuai ketentuan</p>
                            </div>
                        </button>

                        <button
                            onClick={() => { setReportType('violation_invalid_venue'); setStep('form'); }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}
                        >
                            <Store className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                            <div className="flex-1 text-left">
                                <p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Venue Tidak Valid</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Tutup/tidak ada/alamat salah</p>
                            </div>
                        </button>

                        <button
                            onClick={() => { setReportType('other'); setStep('form'); }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-gray-500/10 border border-gray-500/20' : 'bg-gray-50 border border-gray-200'}`}
                        >
                            <HelpCircle className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                            <div className="flex-1 text-left">
                                <p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Lainnya</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Masalah lain yang perlu dilaporkan</p>
                            </div>
                        </button>
                    </div>
                </div>
            </AgentLayout>
        );
    }

    // ==================== STEP: NO QR - Check if Nobar ====================
    if (step === 'no_qr_check') {
        return (
            <AgentLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <button onClick={resetFlow} className={`p-2 rounded-lg ${isDark ? 'text-emerald-500/60 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100'}`}>
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className={`text-lg font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Cek Aktivitas Nobar</h1>
                    </div>

                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <p className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                            Apakah saat ini sedang ada kegiatan Nobar di venue ini?
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => { setReportType('violation_no_license'); setStep('form'); }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}
                        >
                            <AlertTriangle className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                            <div className="flex-1 text-left">
                                <p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Ya, Sedang Nobar</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Nobar tanpa lisensi = pelanggaran</p>
                            </div>
                        </button>

                        <button
                            onClick={() => { setReportType('offering'); setStep('form'); }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}
                        >
                            <FileText className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                            <div className="flex-1 text-left">
                                <p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Tidak, Belum Nobar</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Tawarkan lisensi ke merchant</p>
                            </div>
                        </button>
                    </div>
                </div>
            </AgentLayout>
        );
    }

    // ==================== STEP: FORM ====================
    const reportConfig = REPORT_TYPES[reportType] || REPORT_TYPES.other;
    const isViolation = reportType?.startsWith('violation_');
    const needsVenueInfo = !venueData && (reportType === 'violation_no_license' || reportType === 'offering' || reportType === 'violation_invalid_qr');

    return (
        <AgentLayout>
            <div className="space-y-6 pb-4">
                <div className="flex items-center gap-3">
                    <button onClick={resetFlow} className={`p-2 rounded-lg ${isDark ? 'text-emerald-500/60 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100'}`}>
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className={`text-lg font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Laporan Survey</h1>
                        <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{reportConfig.label}</p>
                    </div>
                </div>

                {/* Report Type Badge */}
                <div className={`p-4 rounded-xl flex items-center gap-3 ${
                    isViolation ? (isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200')
                    : reportType === 'approved' ? (isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200')
                    : (isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200')
                }`}>
                    <reportConfig.icon className={`w-6 h-6 ${
                        isViolation ? (isDark ? 'text-red-400' : 'text-red-600')
                        : reportType === 'approved' ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                        : (isDark ? 'text-blue-400' : 'text-blue-600')
                    }`} />
                    <div>
                        <p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{reportConfig.label}</p>
                        {venueData && <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{venueData.name}</p>}
                    </div>
                </div>

                {/* Venue Info for No QR cases */}
                {needsVenueInfo && (
                    <div className={`p-4 rounded-xl space-y-4 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <h2 className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>Info Venue</h2>
                        <div>
                            <label className={`block text-sm mb-2 ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>Nama Merchant/Venue *</label>
                            <input type="text" value={formData.merchantName} onChange={(e) => setFormData(p => ({ ...p, merchantName: e.target.value }))} placeholder="Nama venue"
                                className={`w-full px-4 py-3 rounded-xl text-sm ${isDark ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100' : 'bg-gray-50 border border-gray-200'}`} />
                        </div>
                        <div>
                            <label className={`block text-sm mb-2 ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>Estimasi Kapasitas</label>
                            <input type="number" value={formData.estimatedQuota} onChange={(e) => setFormData(p => ({ ...p, estimatedQuota: e.target.value }))} placeholder="Perkiraan kapasitas"
                                className={`w-full px-4 py-3 rounded-xl text-sm ${isDark ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100' : 'bg-gray-50 border border-gray-200'}`} />
                        </div>
                    </div>
                )}

                {/* Description */}
                <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>Catatan</label>
                    <textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Tambahkan catatan..."
                        className={`w-full px-4 py-3 rounded-xl text-sm resize-none ${isDark ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100' : 'bg-gray-50 border border-gray-200'}`} />
                </div>

                {/* Photos */}
                <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <div className="flex justify-between mb-3">
                        <h2 className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>Foto {isViolation && '*'}</h2>
                        <span className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{photos.length}/5</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {photos.map((p, i) => (
                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                                <img src={p.preview} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white"><X className="w-3 h-3" /></button>
                            </div>
                        ))}
                        {photos.length < 5 && (
                            <button type="button" onClick={() => fileInputRef.current?.click()} className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center ${isDark ? 'border-emerald-900/50 text-emerald-500/60' : 'border-gray-300 text-gray-400'}`}>
                                <Camera className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" capture="environment" multiple onChange={handlePhotoCapture} className="hidden" />
                </div>

                {/* Location */}
                <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <h2 className={`text-sm font-semibold mb-3 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>Lokasi</h2>
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

                {/* Submit */}
                <button onClick={handleSubmit} disabled={isSubmitting} className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium ${isSubmitting ? 'opacity-70' : ''} ${
                    isViolation ? (isDark ? 'bg-red-500 text-white' : 'bg-red-600 text-white')
                    : reportType === 'approved' ? (isDark ? 'bg-emerald-500 text-white' : 'bg-teal-600 text-white')
                    : (isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                }`}>
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
            </div>
        </AgentLayout>
    );
}
