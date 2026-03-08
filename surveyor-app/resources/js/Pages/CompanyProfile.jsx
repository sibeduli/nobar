import { useState, useEffect } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import Modal, { ConfirmModal } from '@/Components/Modal';
import FormInput, { FormTextarea, FormSelect } from '@/Components/FormInput';
import AddressInput from '@/Components/AddressInput';
import Button from '@/Components/Button';
import { Building2, MapPin, Phone, Mail, Globe, Edit3, Save, X, Settings, ExternalLink } from 'lucide-react';

const businessTypeOptions = [
    { value: 'surveyor', label: 'Surveyor' },
    { value: 'inspector', label: 'Inspector' },
    { value: 'auditor', label: 'Auditor' },
    { value: 'consultant', label: 'Konsultan' },
];


const emptyCompanyData = {
    name: '',
    legalName: '',
    npwp: '',
    businessType: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    description: '',
};

export default function CompanyProfile({ company, pic }) {
    const { theme } = useTheme();
    const toast = useToast();
    const isDark = theme === 'dark';
    const { flash } = usePage().props;

    const initialData = company || emptyCompanyData;
    
    const [isEditing, setIsEditing] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);

    const { data: formData, setData: setFormData, put, processing, errors, reset } = useForm(initialData);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
            setIsEditing(false);
            setShowSaveModal(false);
        }
    }, [flash?.success]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(name, value);
    };

    const handleSave = () => {
        setShowSaveModal(true);
    };

    const confirmSave = () => {
        put('/company-profile', {
            onSuccess: () => {
                setShowSaveModal(false);
                setIsEditing(false);
            },
            onError: () => {
                setShowSaveModal(false);
                toast.error('Gagal menyimpan perubahan');
            },
        });
    };

    const handleCancel = () => {
        if (JSON.stringify(formData) !== JSON.stringify(initialData)) {
            setShowCancelModal(true);
        } else {
            setIsEditing(false);
        }
    };

    const confirmCancel = () => {
        reset();
        setIsEditing(false);
        setShowCancelModal(false);
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
            <div className={`max-w-4xl mx-auto ${isEditing ? 'pb-24 sm:pb-0' : ''}`}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className={`text-2xl font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                            Profil Perusahaan
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                            Kelola informasi perusahaan surveyor Anda
                        </p>
                    </div>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto justify-center">
                            <Edit3 className="w-4 h-4" />
                            Edit Profil
                        </Button>
                    ) : (
                        <div className="hidden sm:flex gap-2">
                            <Button variant="ghost" onClick={handleCancel}>
                                <X className="w-4 h-4" />
                                Batal
                            </Button>
                            <Button onClick={handleSave} loading={processing}>
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
                                    Alamat
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                    <div className="md:col-span-2">
                                        <InfoRow icon={MapPin} label="Alamat Lengkap" value={formData.address} />
                                    </div>
                                    <InfoRow icon={MapPin} label="Provinsi" value={formData.province} />
                                    <InfoRow icon={MapPin} label="Kota/Kabupaten" value={formData.city} />
                                    <InfoRow icon={MapPin} label="Kode Pos" value={formData.postalCode} />
                                </div>
                            </div>

                            {/* PIC Section */}
                            <div className="p-6">
                                <h2 className={`text-sm font-semibold mb-4 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                                    Person In Charge (PIC)
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                    <InfoRow icon={Building2} label="Nama PIC" value={pic?.name} />
                                    <InfoRow icon={Phone} label="Telepon PIC" value={pic?.phone} />
                                    <InfoRow icon={Mail} label="Email PIC" value={pic?.email} />
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
                                    Alamat
                                </h2>
                                <AddressInput
                                    province={formData.province}
                                    city={formData.city}
                                    postalCode={formData.postalCode}
                                    address={formData.address}
                                    onChange={(field, value) => setFormData(field, value)}
                                    errors={errors}
                                    required
                                />
                            </div>


                            {/* PIC Section - Read Only with link to Pengaturan */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                                        Person In Charge (PIC)
                                    </h2>
                                    <Link
                                        href="/settings"
                                        className={`flex items-center gap-1.5 text-xs font-medium ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-teal-600 hover:text-teal-700'}`}
                                    >
                                        <Settings className="w-3.5 h-3.5" />
                                        Ubah di Pengaturan
                                        <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-emerald-950/30 border border-emerald-900/30' : 'bg-gray-50 border border-gray-200'}`}>
                                    <p className={`text-xs mb-3 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                        Data PIC dikelola melalui halaman Pengaturan akun Anda
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Nama PIC</p>
                                            <p className={`text-sm font-medium mt-0.5 ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>{pic?.name || '-'}</p>
                                        </div>
                                        <div>
                                            <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Telepon PIC</p>
                                            <p className={`text-sm font-medium mt-0.5 ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>{pic?.phone || '-'}</p>
                                        </div>
                                        <div>
                                            <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Email PIC</p>
                                            <p className={`text-sm font-medium mt-0.5 ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>{pic?.email || '-'}</p>
                                        </div>
                                    </div>
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

            {/* Mobile Sticky Action Bar */}
            {isEditing && (
                <div className={`fixed bottom-0 left-0 right-0 p-4 sm:hidden z-40 border-t
                    ${isDark ? 'bg-[#0d1414] border-emerald-900/30' : 'bg-white border-gray-200'}
                `}>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={handleCancel} className="flex-1 justify-center">
                            <X className="w-4 h-4" />
                            Batal
                        </Button>
                        <Button onClick={handleSave} loading={processing} className="flex-1 justify-center">
                            <Save className="w-4 h-4" />
                            Simpan
                        </Button>
                    </div>
                </div>
            )}

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
