import { useState, useRef } from 'react';
import AgentLayout from '@/Layouts/AgentLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import { router } from '@inertiajs/react';
import {
    Camera,
    MapPin,
    Store,
    Users,
    Phone,
    User,
    FileText,
    X,
    Check,
    Loader2,
    Navigation,
    Image as ImageIcon,
} from 'lucide-react';

const venueTypes = [
    'Cafe/Warkop',
    'Restoran',
    'Bar',
    'Hotel/Penginapan',
    'Venue Olahraga',
    'Balai Warga/Komunitas',
    'Lainnya',
];

const capacityTiers = [
    { value: '≤50', label: '≤50 orang' },
    { value: '51-100', label: '51-100 orang' },
    { value: '101-250', label: '101-250 orang' },
    { value: '251-500', label: '251-500 orang' },
    { value: '501-1000', label: '501-1000 orang' },
];

export default function AgentSurveysCreate() {
    const { theme } = useTheme();
    const toast = useToast();
    const isDark = theme === 'dark';
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        venueName: '',
        venueType: '',
        contactPerson: '',
        phone: '',
        address: '',
        capacityTier: '',
        notes: '',
    });
    const [errors, setErrors] = useState({});
    const [photos, setPhotos] = useState([]);
    const [location, setLocation] = useState(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handlePhotoCapture = (e) => {
        const files = Array.from(e.target.files);
        if (photos.length + files.length > 5) {
            toast.error('Maksimal 5 foto');
            return;
        }

        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Ukuran foto maksimal 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotos(prev => [...prev, { file, preview: e.target.result }]);
            };
            reader.readAsDataURL(file);
        });

        if (errors.photos) {
            setErrors(prev => ({ ...prev, photos: null }));
        }
    };

    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation tidak didukung browser Anda');
            return;
        }

        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
                setIsGettingLocation(false);
                if (errors.location) {
                    setErrors(prev => ({ ...prev, location: null }));
                }
                toast.success('Lokasi berhasil didapatkan');
            },
            (error) => {
                setIsGettingLocation(false);
                toast.error('Gagal mendapatkan lokasi: ' + error.message);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.venueName.trim()) newErrors.venueName = 'Nama venue wajib diisi';
        if (!formData.venueType) newErrors.venueType = 'Jenis venue wajib dipilih';
        if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Nama kontak wajib diisi';
        if (!formData.phone.trim()) {
            newErrors.phone = 'Nomor telepon wajib diisi';
        } else if (!/^08\d{8,12}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Format nomor telepon tidak valid';
        }
        if (!formData.address.trim()) newErrors.address = 'Alamat wajib diisi';
        if (!formData.capacityTier) newErrors.capacityTier = 'Kapasitas wajib dipilih';
        if (photos.length === 0) newErrors.photos = 'Minimal 1 foto venue';
        if (!location) newErrors.location = 'Lokasi GPS wajib diambil';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Mohon lengkapi semua field yang wajib diisi');
            return;
        }

        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        toast.success('Survey berhasil dikirim!');
        router.visit('/agent/surveys');
    };

    const FormInput = ({ label, name, type = 'text', value, onChange, error, placeholder, required, icon: Icon }) => (
        <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                {Icon && <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`} />}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2
                        ${error
                            ? 'border-red-500 focus:ring-red-500/50'
                            : isDark 
                                ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100 placeholder:text-emerald-500/40 focus:ring-emerald-500/50' 
                                : 'bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-teal-500'
                        }
                    `}
                />
            </div>
            {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        </div>
    );

    return (
        <AgentLayout>
            <form onSubmit={handleSubmit} className="space-y-6 pb-4">
                {/* Header */}
                <div>
                    <h1 className={`text-xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                        Survey Baru
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}`}>
                        Tambahkan venue baru untuk lisensi Nobar
                    </p>
                </div>

                {/* Venue Info */}
                <div className={`rounded-xl p-4 space-y-4 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <h2 className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                        Informasi Venue
                    </h2>

                    <FormInput
                        label="Nama Venue"
                        name="venueName"
                        value={formData.venueName}
                        onChange={handleChange}
                        error={errors.venueName}
                        placeholder="Contoh: Warkop Bola Mania"
                        required
                        icon={Store}
                    />

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                            Jenis Venue <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {venueTypes.map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, venueType: type }));
                                        if (errors.venueType) setErrors(prev => ({ ...prev, venueType: null }));
                                    }}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                                        ${formData.venueType === type
                                            ? isDark ? 'bg-emerald-500 text-white' : 'bg-teal-600 text-white'
                                            : isDark ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50' : 'bg-gray-100 text-gray-700'
                                        }
                                    `}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        {errors.venueType && <p className="mt-1.5 text-xs text-red-500">{errors.venueType}</p>}
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                            Kapasitas <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {capacityTiers.map(tier => (
                                <button
                                    key={tier.value}
                                    type="button"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, capacityTier: tier.value }));
                                        if (errors.capacityTier) setErrors(prev => ({ ...prev, capacityTier: null }));
                                    }}
                                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1
                                        ${formData.capacityTier === tier.value
                                            ? isDark ? 'bg-emerald-500 text-white' : 'bg-teal-600 text-white'
                                            : isDark ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50' : 'bg-gray-100 text-gray-700'
                                        }
                                    `}
                                >
                                    <Users className="w-3 h-3" />
                                    {tier.label}
                                </button>
                            ))}
                        </div>
                        {errors.capacityTier && <p className="mt-1.5 text-xs text-red-500">{errors.capacityTier}</p>}
                    </div>
                </div>

                {/* Contact Info */}
                <div className={`rounded-xl p-4 space-y-4 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <h2 className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                        Kontak Venue
                    </h2>

                    <FormInput
                        label="Nama Kontak"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        error={errors.contactPerson}
                        placeholder="Nama pemilik/pengelola"
                        required
                        icon={User}
                    />

                    <FormInput
                        label="Nomor Telepon"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        error={errors.phone}
                        placeholder="08xxxxxxxxxx"
                        required
                        icon={Phone}
                    />

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                            Alamat <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Alamat lengkap venue"
                            rows={2}
                            className={`w-full px-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 resize-none
                                ${errors.address
                                    ? 'border-red-500 focus:ring-red-500/50'
                                    : isDark 
                                        ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100 placeholder:text-emerald-500/40 focus:ring-emerald-500/50' 
                                        : 'bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-teal-500'
                                }
                            `}
                        />
                        {errors.address && <p className="mt-1.5 text-xs text-red-500">{errors.address}</p>}
                    </div>
                </div>

                {/* Location */}
                <div className={`rounded-xl p-4 space-y-4 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <h2 className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                        Lokasi GPS <span className="text-red-500">*</span>
                    </h2>

                    {location ? (
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
                            <div className="flex items-center gap-2">
                                <Check className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                <div>
                                    <p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                                        Lokasi Didapatkan
                                    </p>
                                    <p className={`text-xs ${isDark ? 'text-emerald-400/70' : 'text-emerald-600'}`}>
                                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={getLocation}
                            disabled={isGettingLocation}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-colors
                                ${errors.location ? 'border-red-500' : ''}
                                ${isDark 
                                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                                    : 'bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100'
                                }
                            `}
                        >
                            {isGettingLocation ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Navigation className="w-5 h-5" />
                            )}
                            {isGettingLocation ? 'Mendapatkan lokasi...' : 'Ambil Lokasi Saat Ini'}
                        </button>
                    )}
                    {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
                </div>

                {/* Photos */}
                <div className={`rounded-xl p-4 space-y-4 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                        <h2 className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                            Foto Venue <span className="text-red-500">*</span>
                        </h2>
                        <span className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                            {photos.length}/5
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {photos.map((photo, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                <img src={photo.preview} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removePhoto(index)}
                                    className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        {photos.length < 5 && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors
                                    ${errors.photos ? 'border-red-500' : ''}
                                    ${isDark 
                                        ? 'border-emerald-900/50 text-emerald-500/60 hover:border-emerald-500/50 hover:text-emerald-400' 
                                        : 'border-gray-300 text-gray-400 hover:border-teal-400 hover:text-teal-600'
                                    }
                                `}
                            >
                                <Camera className="w-6 h-6" />
                                <span className="text-[10px]">Tambah</span>
                            </button>
                        )}
                    </div>
                    {errors.photos && <p className="text-xs text-red-500">{errors.photos}</p>}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        onChange={handlePhotoCapture}
                        className="hidden"
                    />
                </div>

                {/* Notes */}
                <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                        Catatan (Opsional)
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Catatan tambahan tentang venue..."
                        rows={3}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 resize-none
                            ${isDark 
                                ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100 placeholder:text-emerald-500/40 focus:ring-emerald-500/50' 
                                : 'bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-teal-500'
                            }
                        `}
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium transition-all
                        ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
                        ${isDark 
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-white' 
                            : 'bg-teal-600 hover:bg-teal-500 text-white'
                        }
                    `}
                >
                    {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Check className="w-5 h-5" />
                    )}
                    {isSubmitting ? 'Mengirim...' : 'Kirim Survey'}
                </button>
            </form>
        </AgentLayout>
    );
}
