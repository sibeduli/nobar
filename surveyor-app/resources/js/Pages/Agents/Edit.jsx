import { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import { ConfirmModal } from '@/Components/Modal';
import FormInput, { FormTextarea, FormSelect } from '@/Components/FormInput';
import MultiSelect from '@/Components/MultiSelect';
import Button from '@/Components/Button';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';

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
];

export default function AgentsEdit({ agent }) {
    const { theme } = useTheme();
    const toast = useToast();
    const isDark = theme === 'dark';
    const { flash } = usePage().props;

    const [formData, setFormData] = useState({
        name: agent?.name || '',
        phone: agent?.phone || '',
        email: agent?.email || '',
        nik: agent?.nik || '',
        address: agent?.address || '',
        areas: agent?.areas || [],
        status: agent?.status || 'active',
        notes: agent?.notes || '',
    });
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) newErrors.name = 'Nama lengkap wajib diisi';
        if (!formData.phone.trim()) {
            newErrors.phone = 'Nomor telepon wajib diisi';
        } else if (!/^08\d{8,12}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Format nomor telepon tidak valid';
        }
        if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }
        if (!formData.nik.trim()) {
            newErrors.nik = 'NIK wajib diisi';
        } else if (formData.nik.length !== 16) {
            newErrors.nik = 'NIK harus 16 digit';
        }
        if (!formData.areas || formData.areas.length === 0) newErrors.areas = 'Minimal pilih 1 area tugas';

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

    const confirmSave = () => {
        setIsSaving(true);
        setShowSaveModal(false);

        router.put(`/agents/${agent.id}`, formData, {
            onSuccess: () => {
                setIsSaving(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setIsSaving(false);
                toast.error('Gagal menyimpan perubahan');
            },
        });
    };

    const handleCancel = () => {
        const hasChanges = Object.keys(formData).some(key => {
            if (Array.isArray(formData[key])) {
                return JSON.stringify(formData[key]) !== JSON.stringify(agent[key] || []);
            }
            return formData[key] !== (agent[key] || '');
        });
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
                            Edit Agen
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                            Perbarui informasi agen {agent?.name}
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
                                <FormInput
                                    label="Nomor Telepon"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    error={errors.phone}
                                    placeholder="08xxxxxxxxxx"
                                    required
                                />
                                <FormInput
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                    placeholder="email@example.com (opsional)"
                                />
                                <FormTextarea
                                    label="Alamat"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    error={errors.address}
                                    placeholder="Alamat lengkap agen (opsional)"
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
                                <MultiSelect
                                    label="Area Tugas"
                                    options={areaOptions}
                                    value={formData.areas}
                                    onChange={(areas) => {
                                        setFormData(prev => ({ ...prev, areas }));
                                        if (errors.areas) setErrors(prev => ({ ...prev, areas: null }));
                                    }}
                                    error={errors.areas}
                                    placeholder="Pilih area tugas"
                                    searchPlaceholder="Cari area..."
                                    maxItems={3}
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
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </div>

            {/* Cancel Confirmation Modal */}
            <ConfirmModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={confirmCancel}
                title="Batalkan Perubahan?"
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
                title="Simpan Perubahan?"
                message={`Apakah Anda yakin ingin menyimpan perubahan untuk "${formData.name}"?`}
                confirmText="Ya, Simpan"
                cancelText="Batal"
                variant="primary"
            />
        </DashboardLayout>
    );
}
