import { useState, useRef } from 'react';
import AgentLayout from '@/Layouts/AgentLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import { router } from '@inertiajs/react';
import axios from 'axios';
import {
    QrCode, X, Camera, MapPin, Store, Users, Check, Loader2, Navigation,
    ShieldCheck, ShieldX, AlertTriangle, ArrowLeft, Scan, FileText, Image,
    ChevronRight, Ban, Megaphone, HelpCircle,
} from 'lucide-react';

// Demo QR codes for testing (will be replaced by real scanner)
const DEMO_QR_CODES = {
    valid: 'DEMO_COMMERCIAL_001',
    valid_nc: 'DEMO_NON_COMMERCIAL_001',
    invalid: 'INVALID_QR_CODE',
    handled: 'DEMO_HANDLED_001',
};

const REPORT_TYPES = {
    // Verified (from QR scan)
    verified: { label: 'Terverifikasi', color: 'emerald', icon: ShieldCheck },
    verified_non_commercial: { label: 'Terverifikasi (Non-Komersial)', color: 'emerald', icon: ShieldCheck },
    // Violations (commercial only)
    violation_invalid_qr: { label: 'Pelanggaran - QR Invalid', color: 'red', icon: ShieldX },
    violation_capacity: { label: 'Pelanggaran - Melebihi Kapasitas', color: 'red', icon: Users },
    violation_ads: { label: 'Pelanggaran - Iklan Ilegal', color: 'red', icon: Megaphone },
    violation_no_license: { label: 'Pelanggaran - Tanpa Lisensi', color: 'red', icon: Ban },
    violation_venue: { label: 'Pelanggaran - Venue Tidak Sesuai', color: 'red', icon: Store },
    // No QR paths
    lead: { label: 'Penawaran Lisensi', color: 'blue', icon: FileText },
    documentation: { label: 'Dokumentasi Non-Komersial', color: 'blue', icon: FileText },
    other: { label: 'Lainnya', color: 'gray', icon: HelpCircle },
};

export default function AgentReport() {
    const { theme } = useTheme();
    const toast = useToast();
    const isDark = theme === 'dark';
    const fileInputRef = useRef(null);

    // Flow state - New flow: QR first, then commercial/non-commercial if no QR
    // Steps: start -> scan -> (qr_valid_commercial | qr_valid_non_commercial | qr_invalid | already_handled)
    //        start -> no_qr -> no_qr_type -> (no_qr_commercial | no_qr_non_commercial) -> form
    const [step, setStep] = useState('start');
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
    const [showVenueMismatchConfirm, setShowVenueMismatchConfirm] = useState(false);

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
        setVenueData(null);
        setReportType(null);
        setFormData({ actualQuota: '', merchantName: '', estimatedQuota: '', description: '' });
        setPhotos([]);
        setLocation(null);
    };

    const handleSubmit = async () => {
        if (!reportType) { toast.error('Tipe laporan tidak valid'); return; }
        
        // Validate required fields for certain report types
        const needsVenueInfo = !venueData && (reportType === 'violation_no_license' || reportType === 'lead' || reportType === 'documentation');
        if (needsVenueInfo && !formData.merchantName) {
            toast.error('Nama venue wajib diisi');
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Prepare photo data (base64)
            const photoData = photos.map(p => p.preview);

            const response = await axios.post('/agent/report/submit', {
                report_type: reportType,
                license_id: venueData?.licenseId || null,
                merchant_id: venueData?.id || null,
                venue_name: venueData?.name || formData.merchantName || null,
                venue_address: venueData?.address || null,
                venue_contact: venueData?.contactPerson || null,
                venue_phone: venueData?.phone || null,
                actual_visitors: formData.actualQuota ? parseInt(formData.actualQuota) : null,
                capacity_limit: venueData?.capacityLimit || (formData.estimatedQuota ? parseInt(formData.estimatedQuota) : null),
                description: formData.description || null,
                latitude: location?.lat || null,
                longitude: location?.lng || null,
                photos: photoData,
            });

            if (response.data.success) {
                toast.success('Laporan berhasil dikirim!');
                router.visit('/agent');
            } else {
                toast.error(response.data.message || 'Gagal mengirim laporan');
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Gagal mengirim laporan');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Validate QR code via API
    const validateQrCode = async (qrCode) => {
        try {
            const response = await axios.post('/agent/report/validate-qr', { qr_code: qrCode });
            return response.data;
        } catch (error) {
            console.error('QR validation error:', error);
            return { valid: false, message: 'Gagal memvalidasi QR' };
        }
    };

    // Simulate QR scan - in production this would use camera scanner
    const simulateScan = async (type) => {
        const qrCode = DEMO_QR_CODES[type];
        
        // For demo, use mock data since we don't have real licenses yet
        // In production, this would call validateQrCode(qrCode)
        const mockResults = {
            valid: {
                valid: true,
                alreadyHandled: false,
                venue: {
                    id: 'demo-1',
                    name: 'Warkop Bola Mania',
                    address: 'Jl. Sudirman No. 45, Jakarta Selatan',
                    type: 'commercial',
                    capacityLimit: 50,
                    contactPerson: 'Pak Joko',
                    phone: '08123456789',
                    licensePurchaseDate: '2026-01-15',
                    licenseId: 'LIC-DEMO-001',
                }
            },
            valid_nc: {
                valid: true,
                alreadyHandled: false,
                venue: {
                    id: 'demo-2',
                    name: 'RT 05 RW 02 Kelurahan Menteng',
                    address: 'Balai Warga RT 05, Menteng, Jakarta Pusat',
                    type: 'non_commercial',
                    capacityLimit: null,
                    contactPerson: 'Pak RT Budi',
                    phone: '08111222333',
                    licensePurchaseDate: '2026-02-10',
                    licenseId: 'NC-DEMO-001',
                }
            },
            handled: {
                valid: true,
                alreadyHandled: true,
                handledDate: new Date().toISOString().split('T')[0],
                venue: {
                    id: 'demo-3',
                    name: 'Resto Piala Dunia',
                    address: 'Jl. Gatot Subroto No. 12, Jakarta Barat',
                    type: 'commercial',
                    capacityLimit: 100,
                    contactPerson: 'Bu Siti',
                    phone: '08198765432',
                    licensePurchaseDate: '2026-02-01',
                    licenseId: 'LIC-DEMO-002',
                }
            },
            invalid: { valid: false }
        };

        const result = mockResults[type] || { valid: false };
        
        if (result.valid) {
            setVenueData(result.venue);
            if (result.alreadyHandled) {
                setStep('already_handled');
            } else if (result.venue.type === 'non_commercial') {
                setReportType('verified_non_commercial');
                setStep('qr_valid_non_commercial');
            } else {
                setStep('qr_valid_commercial');
            }
        } else {
            setReportType('violation_invalid_qr');
            setStep('qr_invalid');
        }
    };

    // ==================== STEP: START - QR First ====================
    if (step === 'start') {
        return (
            <AgentLayout>
                <div className="space-y-6 pt-4">
                    <div className="text-center">
                        <h1 className={`text-xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Laporan Baru</h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}`}>Apakah venue memiliki QR Lisensi?</p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => setStep('scan')}
                            className={`w-full flex items-center gap-4 p-5 rounded-xl transition-colors ${isDark ? 'bg-[#0d1414] border border-emerald-900/30 hover:border-emerald-500/50' : 'bg-white border border-gray-200 hover:border-teal-400'}`}
                        >
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10' : 'bg-teal-50'}`}>
                                <QrCode className={`w-7 h-7 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className={`font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Ada QR Lisensi</p>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Scan QR untuk verifikasi</p>
                            </div>
                            <ChevronRight className={`w-5 h-5 ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`} />
                        </button>

                        <button
                            onClick={() => setStep('no_qr_type')}
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

    // ==================== STEP: NO QR - Ask Commercial or Non-Commercial ====================
    if (step === 'no_qr_type') {
        return (
            <AgentLayout>
                <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setStep('start')} className={`p-2 rounded-lg ${isDark ? 'text-emerald-500/60 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100'}`}>
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className={`text-lg font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Jenis Venue</h1>
                            <p className={`text-xs ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}`}>Venue tanpa QR - jenis apa?</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => setStep('no_qr_commercial')}
                            className={`w-full flex items-center gap-4 p-5 rounded-xl transition-colors ${isDark ? 'bg-[#0d1414] border border-emerald-900/30 hover:border-emerald-500/50' : 'bg-white border border-gray-200 hover:border-teal-400'}`}
                        >
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                                <Store className={`w-7 h-7 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className={`font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Komersial</p>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Warkop, cafe, resto, dll (berbayar)</p>
                            </div>
                            <ChevronRight className={`w-5 h-5 ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`} />
                        </button>

                        <button
                            onClick={() => { setReportType('documentation'); setStep('form'); }}
                            className={`w-full flex items-center gap-4 p-5 rounded-xl transition-colors ${isDark ? 'bg-[#0d1414] border border-emerald-900/30 hover:border-emerald-500/50' : 'bg-white border border-gray-200 hover:border-teal-400'}`}
                        >
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                                <Users className={`w-7 h-7 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className={`font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Non-Komersial</p>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Komunitas, RT/RW, gratis</p>
                            </div>
                            <ChevronRight className={`w-5 h-5 ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`} />
                        </button>
                    </div>

                    <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                        <p className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                            💡 Non-komersial tanpa QR = dokumentasi saja, bukan pelanggaran
                        </p>
                    </div>
                </div>
            </AgentLayout>
        );
    }

    // ==================== STEP: NO QR COMMERCIAL - Is Nobar Happening? ====================
    if (step === 'no_qr_commercial') {
        return (
            <AgentLayout>
                <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setStep('no_qr_type')} className={`p-2 rounded-lg ${isDark ? 'text-emerald-500/60 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100'}`}>
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className={`text-lg font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Venue Komersial</h1>
                            <p className={`text-xs ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}`}>Apakah sedang ada nobar?</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => { setReportType('violation_no_license'); setStep('form'); }}
                            className={`w-full flex items-center gap-4 p-5 rounded-xl transition-colors ${isDark ? 'bg-red-500/10 border border-red-500/30 hover:border-red-500/50' : 'bg-red-50 border border-red-200 hover:border-red-400'}`}
                        >
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                                <AlertTriangle className={`w-7 h-7 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className={`font-semibold ${isDark ? 'text-red-300' : 'text-red-700'}`}>Ya, Sedang Nobar</p>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-red-400/70' : 'text-red-600'}`}>⚠️ Pelanggaran - tanpa lisensi</p>
                            </div>
                            <ChevronRight className={`w-5 h-5 ${isDark ? 'text-red-500/40' : 'text-red-400'}`} />
                        </button>

                        <button
                            onClick={() => { setReportType('lead'); setStep('form'); }}
                            className={`w-full flex items-center gap-4 p-5 rounded-xl transition-colors ${isDark ? 'bg-[#0d1414] border border-emerald-900/30 hover:border-emerald-500/50' : 'bg-white border border-gray-200 hover:border-teal-400'}`}
                        >
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                                <FileText className={`w-7 h-7 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className={`font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Tidak Ada Nobar</p>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Catat sebagai lead/penawaran</p>
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
                        <button onClick={() => setStep('start')} className={`p-2 rounded-lg ${isDark ? 'text-emerald-500/60 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100'}`}>
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
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => simulateScan('valid')} className={`py-2.5 rounded-lg text-xs font-medium ${isDark ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white'}`}>
                                ✓ Komersial Valid
                            </button>
                            <button onClick={() => simulateScan('valid_nc')} className={`py-2.5 rounded-lg text-xs font-medium ${isDark ? 'bg-teal-500 text-white' : 'bg-teal-600 text-white'}`}>
                                ✓ Non-Komersial Valid
                            </button>
                            <button onClick={() => simulateScan('handled')} className={`py-2.5 rounded-lg text-xs font-medium ${isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'}`}>
                                ↻ Sudah Ditangani
                            </button>
                            <button onClick={() => simulateScan('invalid')} className={`py-2.5 rounded-lg text-xs font-medium ${isDark ? 'bg-red-500 text-white' : 'bg-red-600 text-white'}`}>
                                ✗ QR Invalid
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
                        <button onClick={() => setStep('scan')} className={`p-2 rounded-lg ${isDark ? 'text-emerald-500/60 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100'}`}>
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

    // ==================== STEP: QR VALID NON-COMMERCIAL - Auto verified ====================
    if (step === 'qr_valid_non_commercial') {
        return (
            <AgentLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setStep('scan')} className={`p-2 rounded-lg ${isDark ? 'text-emerald-500/60 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100'}`}>
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className={`text-lg font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Non-Komersial Terverifikasi</h1>
                    </div>

                    {/* Success Card */}
                    <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
                        <ShieldCheck className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <h2 className={`text-lg font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Lisensi Valid ✓</h2>
                        <p className={`text-sm mt-2 ${isDark ? 'text-emerald-400/70' : 'text-emerald-600'}`}>
                            Venue non-komersial dengan lisensi valid
                        </p>
                    </div>

                    {/* Venue Info Card */}
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <h2 className={`text-lg font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{venueData?.name}</h2>
                        <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/70' : 'text-gray-600'}`}>{venueData?.address}</p>
                        <div className={`mt-3 pt-3 border-t ${isDark ? 'border-emerald-900/30' : 'border-gray-200'} grid grid-cols-2 gap-3 text-sm`}>
                            <div><span className={isDark ? 'text-emerald-500/60' : 'text-gray-500'}>Kontak:</span> <span className={isDark ? 'text-emerald-100' : 'text-gray-900'}>{venueData?.contactPerson}</span></div>
                            <div><span className={isDark ? 'text-emerald-500/60' : 'text-gray-500'}>Telepon:</span> <span className={isDark ? 'text-emerald-100' : 'text-gray-900'}>{venueData?.phone}</span></div>
                            <div className="col-span-2"><span className={isDark ? 'text-emerald-500/60' : 'text-gray-500'}>ID Lisensi:</span> <span className={isDark ? 'text-emerald-100' : 'text-gray-900'}>{venueData?.licenseId}</span></div>
                        </div>
                    </div>

                    <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                        <p className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                            💡 Non-komersial tidak memerlukan pemeriksaan kapasitas atau iklan
                        </p>
                    </div>

                    <button
                        onClick={() => setStep('form')}
                        className={`w-full py-3.5 rounded-xl font-medium ${isDark ? 'bg-emerald-500 text-white' : 'bg-teal-600 text-white'}`}
                    >
                        Lanjutkan ke Dokumentasi
                    </button>
                </div>
            </AgentLayout>
        );
    }

    // ==================== STEP: QR VALID COMMERCIAL - Check compliance ====================
    if (step === 'qr_valid_commercial') {
        return (
            <AgentLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setStep('scan')} className={`p-2 rounded-lg ${isDark ? 'text-emerald-500/60 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100'}`}>
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className={`text-lg font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Venue Komersial Terverifikasi</h1>
                    </div>

                    {/* Venue Info Card */}
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <span className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Lisensi Komersial Valid</span>
                        </div>
                        <h2 className={`text-lg font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{venueData?.name}</h2>
                        <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/70' : 'text-gray-600'}`}>{venueData?.address}</p>
                        <div className={`mt-3 pt-3 border-t ${isDark ? 'border-emerald-500/20' : 'border-emerald-200'} grid grid-cols-2 gap-3 text-sm`}>
                            <div><span className={isDark ? 'text-emerald-500/60' : 'text-gray-500'}>Kapasitas:</span> <span className={isDark ? 'text-emerald-100' : 'text-gray-900'}>{venueData?.capacityLimit} orang</span></div>
                            <div><span className={isDark ? 'text-emerald-500/60' : 'text-gray-500'}>Kontak:</span> <span className={isDark ? 'text-emerald-100' : 'text-gray-900'}>{venueData?.contactPerson}</span></div>
                            <div><span className={isDark ? 'text-emerald-500/60' : 'text-gray-500'}>Telepon:</span> <span className={isDark ? 'text-emerald-100' : 'text-gray-900'}>{venueData?.phone}</span></div>
                            <div><span className={isDark ? 'text-emerald-500/60' : 'text-gray-500'}>Lisensi:</span> <span className={isDark ? 'text-emerald-100' : 'text-gray-900'}>{new Date(venueData?.licensePurchaseDate).toLocaleDateString('id-ID')}</span></div>
                        </div>
                        
                        {/* Venue Mismatch Button */}
                        <button
                            onClick={() => setShowVenueMismatchConfirm(true)}
                            className={`w-full mt-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 ${isDark ? 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20' : 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'}`}
                        >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Klik Disini jika Venue/Alamat Tidak Sesuai
                        </button>
                    </div>

                    {/* Venue Mismatch Confirmation Modal */}
                    {showVenueMismatchConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                            <div className={`w-full max-w-sm rounded-2xl p-5 ${isDark ? 'bg-[#0a0f0f] border border-emerald-900/50' : 'bg-white'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-2 rounded-full ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                                        <AlertTriangle className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                                    </div>
                                    <h3 className={`text-lg font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Konfirmasi Pelanggaran</h3>
                                </div>
                                
                                <p className={`text-sm mb-4 ${isDark ? 'text-emerald-300' : 'text-gray-700'}`}>
                                    Apakah Anda yakin venue/alamat ini <strong>tidak sesuai</strong> dengan data lisensi?
                                </p>
                                
                                <div className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                                    <p className={`text-xs ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                                        ⚠️ Laporan pelanggaran akan dikirim ke PIC untuk ditindaklanjuti. Pastikan data sudah benar.
                                    </p>
                                </div>
                                
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowVenueMismatchConfirm(false)}
                                        className={`flex-1 py-2.5 rounded-xl font-medium ${isDark ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50' : 'bg-gray-100 text-gray-700'}`}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowVenueMismatchConfirm(false);
                                            setReportType('violation_venue');
                                            setStep('form');
                                        }}
                                        className={`flex-1 py-2.5 rounded-xl font-medium ${isDark ? 'bg-red-500 text-white' : 'bg-red-600 text-white'}`}
                                    >
                                        Ya, Laporkan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

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
                                setReportType('violation_capacity');
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
                        <button onClick={() => setStep('scan')} className={`p-2 rounded-lg ${isDark ? 'text-emerald-500/60 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100'}`}>
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
                            <div className="space-y-3">
                                <div className={`p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                                    <Check className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                    <div><p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Lokasi Didapat</p><p className={`text-xs ${isDark ? 'text-emerald-400/70' : 'text-emerald-600'}`}>{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p></div>
                                </div>
                                {/* Map Preview */}
                                <div className="rounded-lg overflow-hidden border border-emerald-900/30">
                                    <iframe
                                        src={`https://www.google.com/maps?q=${location.lat},${location.lng}&z=17&output=embed`}
                                        width="100%"
                                        height="150"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={getLocation}
                                    disabled={isGettingLocation}
                                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs ${isDark ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    {isGettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                                    {isGettingLocation ? 'Mendapatkan...' : 'Perbarui Lokasi'}
                                </button>
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

    // ==================== STEP: QR VALID COMMERCIAL - Ads Check ====================
    if (step === 'qr_valid_ads') {
        return (
            <AgentLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setStep('qr_valid_commercial')} className={`p-2 rounded-lg ${isDark ? 'text-emerald-500/60 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100'}`}>
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
                            onClick={() => { setReportType('verified'); setStep('form'); }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}
                        >
                            <Check className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <div className="flex-1 text-left">
                                <p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Tidak, Semua Sesuai</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Venue sesuai ketentuan</p>
                            </div>
                        </button>

                        <button
                            onClick={() => { setReportType('violation_venue'); setStep('form'); }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}
                        >
                            <Store className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                            <div className="flex-1 text-left">
                                <p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Venue Tidak Sesuai</p>
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

    // ==================== STEP: FORM ====================
    const reportConfig = REPORT_TYPES[reportType] || REPORT_TYPES.other;
    const isViolation = reportType?.startsWith('violation_');
    const isVerified = reportType === 'verified' || reportType === 'verified_non_commercial';
    const needsVenueInfo = !venueData && (reportType === 'violation_no_license' || reportType === 'lead' || reportType === 'documentation');

    // Determine back step based on report type
    const getFormBackStep = () => {
        if (reportType === 'verified' || reportType === 'violation_ads' || reportType === 'other') return 'qr_valid_ads';
        if (reportType === 'violation_capacity' || reportType === 'violation_venue') return 'qr_valid_commercial';
        if (reportType === 'verified_non_commercial') return 'qr_valid_non_commercial';
        if (reportType === 'violation_invalid_qr') return 'qr_invalid';
        if (reportType === 'violation_no_license' || reportType === 'lead') return 'no_qr_commercial';
        if (reportType === 'documentation') return 'no_qr_type';
        return 'start';
    };

    return (
        <AgentLayout>
            <div className="space-y-6 pb-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => setStep(getFormBackStep())} className={`p-2 rounded-lg ${isDark ? 'text-emerald-500/60 hover:bg-emerald-500/10' : 'text-gray-400 hover:bg-gray-100'}`}>
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
                    : isVerified ? (isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200')
                    : (isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200')
                }`}>
                    <reportConfig.icon className={`w-6 h-6 ${
                        isViolation ? (isDark ? 'text-red-400' : 'text-red-600')
                        : isVerified ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
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
                        <div className="space-y-3">
                            <div className={`p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                                <Check className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                <div><p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Lokasi Didapat</p><p className={`text-xs ${isDark ? 'text-emerald-400/70' : 'text-emerald-600'}`}>{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p></div>
                            </div>
                            {/* Map Preview */}
                            <div className="rounded-lg overflow-hidden border border-emerald-900/30">
                                <iframe
                                    src={`https://www.google.com/maps?q=${location.lat},${location.lng}&z=17&output=embed`}
                                    width="100%"
                                    height="150"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={getLocation}
                                disabled={isGettingLocation}
                                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs ${isDark ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50' : 'bg-gray-100 text-gray-600'}`}
                            >
                                {isGettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                                {isGettingLocation ? 'Mendapatkan...' : 'Perbarui Lokasi'}
                            </button>
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
                    : isVerified ? (isDark ? 'bg-emerald-500 text-white' : 'bg-teal-600 text-white')
                    : (isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                }`}>
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
            </div>
        </AgentLayout>
    );
}
