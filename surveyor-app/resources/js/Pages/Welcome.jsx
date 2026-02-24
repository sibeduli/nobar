import DashboardLayout from '@/Layouts/DashboardLayout';
import StatCard from '@/Components/StatCard';
import ContentCard from '@/Components/ContentCard';
import { Building2, FileCheck, CreditCard, Clock, Activity } from 'lucide-react';

export default function Welcome() {
    return (
        <DashboardLayout>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total Venue"
                    value="0"
                    subtitle="Venue terdaftar"
                    icon={Building2}
                />
                <StatCard
                    title="Lisensi Aktif"
                    value="0"
                    subtitle="Lisensi berlaku"
                    icon={FileCheck}
                    iconBg="bg-cyan-500/20"
                    iconColor="text-cyan-400"
                />
                <StatCard
                    title="Pembayaran"
                    value="Rp 0"
                    subtitle="Total dibayar"
                    icon={CreditCard}
                    iconBg="bg-teal-500/20"
                    iconColor="text-teal-400"
                />
                <StatCard
                    title="Lisensi Belum Aktif"
                    value="0"
                    subtitle="Lisensi belum dibayar"
                    icon={Clock}
                    iconBg="bg-amber-500/20"
                    iconColor="text-amber-400"
                />
            </div>

            {/* Content Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ContentCard
                    title="Venue Terbaru"
                    subtitle="3 venue terakhir yang didaftarkan"
                    emptyIcon={Building2}
                    emptyText="Belum ada venue terdaftar"
                    emptyAction="#"
                    emptyActionText="Daftar venue baru"
                />
                <ContentCard
                    title="Lisensi Terbaru"
                    subtitle="3 lisensi terakhir yang dibuat"
                    emptyIcon={FileCheck}
                    emptyText="Belum ada lisensi"
                />
            </div>

            {/* Activity Section */}
            <ContentCard
                title="Aktivitas Terbaru"
                subtitle="3 aktivitas terakhir Anda"
                emptyIcon={Activity}
                emptyText="Belum ada aktivitas"
            />
        </DashboardLayout>
    );
}
