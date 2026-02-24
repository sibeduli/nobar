import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import { ConfirmModal } from '@/Components/Modal';
import FormInput, { FormTextarea, FormSelect } from '@/Components/FormInput';
import Button from '@/Components/Button';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, UserPlus, Upload, X, CreditCard } from 'lucide-react';

const areaOptions = [
    { value: 'Jakarta Selatan', label: 'Jakarta Selatan' },
    { value: 'Jakarta Barat', label: 'Jakarta Barat' },
    { value: 'Jakarta Timur', label: 'Jakarta Timur' },
    { value: 'Jakarta Pusat', label: 'Jakarta Pusat' },
    { value: 'Jakarta Utara', label: 'Jakarta Utara' },
    { value: 'Tangerang', label: 'Tangerang' },
    { value: 'Bekasi', label: 'Bekasi' },
    { value: 'Depok', label: 'Depok' },
    { value: 'Bogor', label: 'Bogor' },
];

const statusOptions = [
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Nonaktif' },
    { value: 'pending', label: 'Pending' },
];

const initialFormData = {
    name: '',
    email: '',
    phone: '',
    nik: '',
    address: '',
    area: '',
    status: 'pending',
    notes: '',
    ktpPhoto: null,
};

export default function AgentsCreate() {
    const { theme } = useTheme();
    const toast = useToast();
    const isDark = theme === 'dark';

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [ktpPreview, setKtpPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFileChange = (file) => {
        if (!file) return;
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            toast.error('Format file harus JPG atau PNG');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ukuran file maksimal 5MB');
            return;
        }
        
        setFormData(prev => ({ ...prev, ktpPhoto: file }));
        setKtpPreview(URL.createObjectURL(file));
        if (errors.ktpPhoto) {
            setErrors(prev => ({ ...prev, ktpPhoto: null }));
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileChange(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const removeKtpPhoto = () => {
        setFormData(prev => ({ ...prev, ktpPhoto: null }));
        setKtpPreview(null);
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) newErrors.name = 'Nama lengkap wajib diisi';
        if (!formData.email.trim()) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Nomor telepon wajib diisi';
        } else if (!/^08\d{8,12}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Format nomor telepon tidak valid';
        }
        if (!formData.nik.trim()) {
            newErrors.nik = 'NIK wajib diisi';
        } else if (formData.nik.length !== 16) {
            newErrors.nik = 'NIK harus 16 digit';
        }
        if (!formData.address.trim()) newErrors.address = 'Alamat wajib diisi';
        if (!formData.area) newErrors.area = 'Area tugas wajib dipilih';
        if (!formData.ktpPhoto) newErrors.ktpPhoto = 'Foto KTP wajib diunggah';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Mohon lengkapi semua field yang wajib diisi');
            return;
        }
        setShowSaveModal(true);
    };

    const confirmSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        toast.success('Agen baru berhasil didaftarkan');
        router.visit('/agents');
    };

    const handleCancel = () => {
        const hasChanges = Object.keys(formData).some(key => formData[key] !== initialFormData[key]);
        if (hasChanges) {
            setShowCancelModal(true);
        } else {
            router.visit('/agents');
        }
    };

    const confirmCancel = () => {
        router.visit('/agents');
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link
                        href="/agents"
                        className={`p-2 rounded-lg transition-colors
                            ${isDark 
                                ? 'text-emerald-500/60 hover:text-emerald-400 hover:bg-emerald-500/10' 
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }
                        `}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className={`text-2xl font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                            Daftar Agen Baru
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                            Tambahkan agen lapangan baru ke tim Anda
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className={`rounded-xl overflow-hidden
                        ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}
                    `}>
                        {/* Personal Info */}
                        <div className={`p-6 border-b ${isDark ? 'border-emerald-900/30' : 'border-gray-100'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                                    ${isDark ? 'bg-emerald-500/10' : 'bg-teal-50'}
                                `}>
                                    <UserPlus className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                                </div>
                                <h2 className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                                    Informasi Pribadi
                                </h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label="Nama Lengkap"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    error={errors.name}
                                    placeholder="Masukkan nama lengkap"
                                    required
                                />
                                <FormInput
                                    label="NIK"
                                    name="nik"
                                    value={formData.nik}
                                    onChange={handleChange}
                                    error={errors.nik}
                                    placeholder="16 digit NIK"
                                    required
                                />
                                
                                {/* KTP Photo Upload */}
                                <div className="md:col-span-2">
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                                        Foto KTP <span className="text-red-500">*</span>
                                    </label>
                                    
                                    {!ktpPreview ? (
                                        <div
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
                                                ${isDragging
                                                    ? isDark ? 'border-emerald-500 bg-emerald-500/10' : 'border-teal-500 bg-teal-50'
                                                    : errors.ktpPhoto
                                                        ? 'border-red-500/50'
                                                        : isDark ? 'border-emerald-900/50 hover:border-emerald-500/50' : 'border-gray-300 hover:border-teal-400'
                                                }
                                            `}
                                        >
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png"
                                                onChange={(e) => handleFileChange(e.target.files[0])}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-3
                                                ${isDark ? 'bg-emerald-500/10' : 'bg-teal-50'}
                                            `}>
                                                <CreditCard className={`w-7 h-7 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                                            </div>
                                            <p className={`text-sm font-medium ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                                                Drag & drop foto KTP di sini
                                            </p>
                                            <p className={`text-xs mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                                atau klik untuk memilih file
                                            </p>
                                            <p className={`text-xs mt-2 ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`}>
                                                Format: JPG, PNG • Maks: 5MB
                                            </p>
                                        </div>
                                    ) : (
                                        <div className={`relative rounded-xl overflow-hidden
                                            ${isDark ? 'bg-emerald-950/30 border border-emerald-900/30' : 'bg-gray-50 border border-gray-200'}
                                        `}>
                                            <img
                                                src={ktpPreview}
                                                alt="Preview KTP"
                                                className="w-full h-48 object-contain"
                                            />
                                            <div className={`p-3 flex items-center justify-between border-t
                                                ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}
                                            `}>
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                                                    <span className={`text-sm truncate max-w-[200px] ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                                                        {formData.ktpPhoto?.name}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={removeKtpPhoto}
                                                    className={`p-1.5 rounded-lg transition-colors
                                                        ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}
                                                    `}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {errors.ktpPhoto && (
                                        <p className="mt-1.5 text-sm text-red-500">{errors.ktpPhoto}</p>
                                    )}
                                </div>
                                <FormInput
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                    placeholder="email@example.com"
                                    required
                                />
                                <FormInput
                                    label="Nomor Telepon"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    error={errors.phone}
                                    placeholder="08xxxxxxxxxx"
                                    required
                                />
                                <FormTextarea
                                    label="Alamat"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    error={errors.address}
                                    placeholder="Alamat lengkap agen"
                                    required
                                    className="md:col-span-2"
                                />
                            </div>
                        </div>

                        {/* Assignment Info */}
                        <div className={`p-6 border-b ${isDark ? 'border-emerald-900/30' : 'border-gray-100'}`}>
                            <h2 className={`text-sm font-semibold mb-4 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                                Penugasan
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormSelect
                                    label="Area Tugas"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                    options={areaOptions}
                                    error={errors.area}
                                    placeholder="Pilih area tugas"
                                    required
                                />
                                <FormSelect
                                    label="Status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    options={statusOptions}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="p-6">
                            <h2 className={`text-sm font-semibold mb-4 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                                Catatan Tambahan
                            </h2>
                            
                            <FormTextarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Catatan atau informasi tambahan tentang agen (opsional)"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={handleCancel}>
                            Batal
                        </Button>
                        <Button type="submit" loading={isSaving}>
                            <Save className="w-4 h-4" />
                            Simpan Agen
                        </Button>
                    </div>
                </form>
            </div>

            {/* Cancel Confirmation Modal */}
            <ConfirmModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={confirmCancel}
                title="Batalkan Pendaftaran?"
                message="Anda memiliki data yang belum disimpan. Apakah Anda yakin ingin membatalkan?"
                confirmText="Ya, Batalkan"
                cancelText="Kembali"
                variant="warning"
            />

            {/* Save Confirmation Modal */}
            <ConfirmModal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                onConfirm={confirmSave}
                title="Daftarkan Agen?"
                message={`Apakah Anda yakin ingin mendaftarkan "${formData.name}" sebagai agen baru?`}
                confirmText="Ya, Daftarkan"
                cancelText="Batal"
                variant="primary"
            />
        </DashboardLayout>
    );
}
