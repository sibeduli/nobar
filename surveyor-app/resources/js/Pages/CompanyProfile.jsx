import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import Modal, { ConfirmModal } from '@/Components/Modal';
import FormInput, { FormTextarea, FormSelect } from '@/Components/FormInput';
import Button from '@/Components/Button';
import { Building2, MapPin, Phone, Mail, Globe, Edit3, Save, X } from 'lucide-react';

const initialCompanyData = {
    name: 'PT Surveyor Indonesia',
    legalName: 'PT Surveyor Indonesia Tbk',
    npwp: '01.234.567.8-901.000',
    businessType: 'surveyor',
    address: 'Jl. Gatot Subroto Kav. 56, Jakarta Selatan',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    postalCode: '12950',
    phone: '021-5551234',
    email: 'info@surveyor.co.id',
    website: 'https://surveyor.co.id',
    description: 'Perusahaan surveyor terkemuka yang menyediakan layanan survei dan inspeksi untuk berbagai industri.',
    picName: 'Ahmad Sudrajat',
    picPhone: '08123456789',
    picEmail: 'ahmad.sudrajat@surveyor.co.id',
};

const businessTypeOptions = [
    { value: 'surveyor', label: 'Surveyor' },
    { value: 'inspector', label: 'Inspector' },
    { value: 'auditor', label: 'Auditor' },
    { value: 'consultant', label: 'Konsultan' },
];

const provinceOptions = [
    { value: 'DKI Jakarta', label: 'DKI Jakarta' },
    { value: 'Jawa Barat', label: 'Jawa Barat' },
    { value: 'Jawa Tengah', label: 'Jawa Tengah' },
    { value: 'Jawa Timur', label: 'Jawa Timur' },
    { value: 'Banten', label: 'Banten' },
];

export default function CompanyProfile() {
    const { theme } = useTheme();
    const toast = useToast();
    const isDark = theme === 'dark';

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(initialCompanyData);
    const [errors, setErrors] = useState({});
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Nama perusahaan wajib diisi';
        if (!formData.legalName.trim()) newErrors.legalName = 'Nama legal wajib diisi';
        if (!formData.npwp.trim()) newErrors.npwp = 'NPWP wajib diisi';
        if (!formData.address.trim()) newErrors.address = 'Alamat wajib diisi';
        if (!formData.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi';
        if (!formData.email.trim()) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }
        if (!formData.picName.trim()) newErrors.picName = 'Nama PIC wajib diisi';
        if (!formData.picPhone.trim()) newErrors.picPhone = 'Nomor telepon PIC wajib diisi';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
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
        setIsEditing(false);
        toast.success('Profil perusahaan berhasil disimpan');
    };

    const handleCancel = () => {
        if (JSON.stringify(formData) !== JSON.stringify(initialCompanyData)) {
            setShowCancelModal(true);
        } else {
            setIsEditing(false);
        }
    };

    const confirmCancel = () => {
        setFormData(initialCompanyData);
        setErrors({});
        setIsEditing(false);
        toast.info('Perubahan dibatalkan');
    };

    const InfoRow = ({ icon: Icon, label, value }) => (
        <div className="flex items-start gap-3 py-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                ${isDark ? 'bg-emerald-500/10' : 'bg-teal-50'}
            `}>
                <Icon className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{label}</p>
                <p className={`text-sm mt-0.5 ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{value || '-'}</p>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className={`text-2xl font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                            Profil Perusahaan
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                            Kelola informasi perusahaan surveyor Anda
                        </p>
                    </div>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                            <Edit3 className="w-4 h-4" />
                            Edit Profil
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={handleCancel}>
                                <X className="w-4 h-4" />
                                Batal
                            </Button>
                            <Button onClick={handleSave} loading={isSaving}>
                                <Save className="w-4 h-4" />
                                Simpan
                            </Button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className={`rounded-xl overflow-hidden
                    ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}
                `}>
                    {!isEditing ? (
                        /* View Mode */
                        <div className="divide-y divide-emerald-900/20">
                            {/* Company Info Section */}
                            <div className="p-6">
                                <h2 className={`text-sm font-semibold mb-4 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                                    Informasi Perusahaan
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                    <InfoRow icon={Building2} label="Nama Perusahaan" value={formData.name} />
                                    <InfoRow icon={Building2} label="Nama Legal" value={formData.legalName} />
                                    <InfoRow icon={Building2} label="NPWP" value={formData.npwp} />
                                    <InfoRow icon={Building2} label="Jenis Usaha" value={businessTypeOptions.find(o => o.value === formData.businessType)?.label} />
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="p-6">
                                <h2 className={`text-sm font-semibold mb-4 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                                    Alamat & Kontak
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                    <div className="md:col-span-2">
                                        <InfoRow icon={MapPin} label="Alamat Lengkap" value={formData.address} />
                                    </div>
                                    <InfoRow icon={MapPin} label="Kota" value={formData.city} />
                                    <InfoRow icon={MapPin} label="Provinsi" value={formData.province} />
                                    <InfoRow icon={Phone} label="Telepon" value={formData.phone} />
                                    <InfoRow icon={Mail} label="Email" value={formData.email} />
                                    <InfoRow icon={Globe} label="Website" value={formData.website} />
                                </div>
                            </div>

                            {/* PIC Section */}
                            <div className="p-6">
                                <h2 className={`text-sm font-semibold mb-4 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                                    Person In Charge (PIC)
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                    <InfoRow icon={Building2} label="Nama PIC" value={formData.picName} />
                                    <InfoRow icon={Phone} label="Telepon PIC" value={formData.picPhone} />
                                    <InfoRow icon={Mail} label="Email PIC" value={formData.picEmail} />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="p-6">
                                <h2 className={`text-sm font-semibold mb-4 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                                    Deskripsi Perusahaan
                                </h2>
                                <p className={`text-sm ${isDark ? 'text-emerald-100/70' : 'text-gray-600'}`}>
                                    {formData.description || '-'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Edit Mode */
                        <div className={`divide-y ${isDark ? 'divide-emerald-900/20' : 'divide-gray-100'}`}>
                            {/* Company Info Section */}
                            <div className="p-6">
                                <h2 className={`text-sm font-semibold mb-4 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                                    Informasi Perusahaan
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput
                                        label="Nama Perusahaan"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        error={errors.name}
                                        required
                                    />
                                    <FormInput
                                        label="Nama Legal"
                                        name="legalName"
                                        value={formData.legalName}
                                        onChange={handleChange}
                                        error={errors.legalName}
                                        required
                                    />
                                    <FormInput
                                        label="NPWP"
                                        name="npwp"
                                        value={formData.npwp}
                                        onChange={handleChange}
                                        error={errors.npwp}
                                        required
                                    />
                                    <FormSelect
                                        label="Jenis Usaha"
                                        name="businessType"
                                        value={formData.businessType}
                                        onChange={handleChange}
                                        options={businessTypeOptions}
                                    />
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="p-6">
                                <h2 className={`text-sm font-semibold mb-4 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                                    Alamat & Kontak
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormTextarea
                                        label="Alamat Lengkap"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        error={errors.address}
                                        required
                                        className="md:col-span-2"
                                    />
                                    <FormInput
                                        label="Kota"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                    />
                                    <FormSelect
                                        label="Provinsi"
                                        name="province"
                                        value={formData.province}
                                        onChange={handleChange}
                                        options={provinceOptions}
                                    />
                                    <FormInput
                                        label="Kode Pos"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                    />
                                    <FormInput
                                        label="Telepon"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        error={errors.phone}
                                        required
                                    />
                                    <FormInput
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        error={errors.email}
                                        required
                                    />
                                    <FormInput
                                        label="Website"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="https://"
                                    />
                                </div>
                            </div>

                            {/* PIC Section */}
                            <div className="p-6">
                                <h2 className={`text-sm font-semibold mb-4 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                                    Person In Charge (PIC)
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput
                                        label="Nama PIC"
                                        name="picName"
                                        value={formData.picName}
                                        onChange={handleChange}
                                        error={errors.picName}
                                        required
                                    />
                                    <FormInput
                                        label="Telepon PIC"
                                        name="picPhone"
                                        value={formData.picPhone}
                                        onChange={handleChange}
                                        error={errors.picPhone}
                                        required
                                    />
                                    <FormInput
                                        label="Email PIC"
                                        name="picEmail"
                                        type="email"
                                        value={formData.picEmail}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="p-6">
                                <h2 className={`text-sm font-semibold mb-4 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                                    Deskripsi Perusahaan
                                </h2>
                                <FormTextarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Deskripsi singkat tentang perusahaan..."
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            <ConfirmModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={confirmCancel}
                title="Batalkan Perubahan?"
                message="Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin membatalkan?"
                confirmText="Ya, Batalkan"
                cancelText="Kembali"
                variant="warning"
            />

            {/* Save Confirmation Modal */}
            <ConfirmModal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                onConfirm={confirmSave}
                title="Simpan Perubahan?"
                message="Apakah Anda yakin ingin menyimpan perubahan profil perusahaan?"
                confirmText="Ya, Simpan"
                cancelText="Batal"
                variant="primary"
            />
        </DashboardLayout>
    );
}
