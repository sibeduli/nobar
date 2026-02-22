'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Inbox,
  Filter,
  Search,
  CreditCard,
  FileText,
  Wrench,
  HelpCircle,
  Shield,
  User,
} from 'lucide-react';
import { useAlert } from '@/components/AlertModal';
import { Input } from '@/components/ui/input';

interface Ticket {
  id: string;
  ticketNo: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: { id: string; sender: string; message: string; createdAt: string }[];
  _count: { messages: number };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  open: {
    label: 'Dibuka',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: <AlertCircle className="w-4 h-4" />,
  },
  waiting_admin: {
    label: 'Menunggu Respon',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: <Clock className="w-4 h-4" />,
  },
  admin_replied: {
    label: 'Ada Balasan',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    icon: <MessageSquare className="w-4 h-4" />,
  },
  waiting_user: {
    label: 'Perlu Balasan Anda',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    icon: <Clock className="w-4 h-4" />,
  },
  resolved: {
    label: 'Selesai',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-200',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  closed: {
    label: 'Ditutup',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 border-gray-200',
    icon: <CheckCircle className="w-4 h-4" />,
  },
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  payment: { label: 'Pembayaran', icon: <CreditCard className="w-4 h-4" />, color: 'text-emerald-600' },
  license: { label: 'Lisensi', icon: <FileText className="w-4 h-4" />, color: 'text-blue-600' },
  technical: { label: 'Teknis', icon: <Wrench className="w-4 h-4" />, color: 'text-purple-600' },
  other: { label: 'Lainnya', icon: <HelpCircle className="w-4 h-4" />, color: 'text-gray-600' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  low: { label: 'Rendah', color: 'text-gray-500', dot: 'bg-gray-400' },
  normal: { label: 'Normal', color: 'text-blue-600', dot: 'bg-blue-500' },
  high: { label: 'Tinggi', color: 'text-orange-600', dot: 'bg-orange-500' },
  urgent: { label: 'Mendesak', color: 'text-red-600', dot: 'bg-red-500' },
};

const FILTER_TABS = [
  { value: 'all', label: 'Semua', icon: <Inbox className="w-4 h-4" /> },
  { value: 'waiting_admin', label: 'Menunggu Respon', icon: <Clock className="w-4 h-4" /> },
  { value: 'admin_replied', label: 'Ada Balasan', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'resolved', label: 'Selesai', icon: <CheckCircle className="w-4 h-4" /> },
];

export default function PengaduanPage() {
  const router = useRouter();
  const { showError } = useAlert();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tickets?status=${filter}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tickets');
      }
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      showError('Gagal memuat tiket');
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.ticketNo.toLowerCase().includes(query) ||
      ticket.subject.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getTicketStats = () => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'waiting_admin' || t.status === 'open').length;
    const needsReply = tickets.filter((t) => t.status === 'admin_replied').length;
    const resolved = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
    return { total, open, needsReply, resolved };
  };

  const stats = getTicketStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pusat Bantuan</h1>
          <p className="text-gray-500 mt-1">Kelola tiket dan pantau status pengaduan Anda</p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/pengaduan/new')}
          className="gap-2 shadow-sm"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          Buat Tiket Baru
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tiket</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Inbox className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Menunggu</p>
                <p className="text-2xl font-bold text-amber-600">{stats.open}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ada Balasan</p>
                <p className="text-2xl font-bold text-green-600">{stats.needsReply}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Selesai</p>
                <p className="text-2xl font-bold text-gray-600">{stats.resolved}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === tab.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari tiket..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'Tidak ada hasil' : 'Belum ada tiket'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {searchQuery
                ? `Tidak ditemukan tiket dengan kata kunci "${searchQuery}"`
                : filter === 'all'
                ? 'Buat tiket pertama Anda untuk memulai percakapan dengan tim support kami.'
                : 'Tidak ada tiket dengan status ini.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => router.push('/dashboard/pengaduan/new')} className="gap-2">
                <Plus className="w-4 h-4" />
                Buat Tiket Baru
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
            const priorityConfig = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.normal;
            const categoryConfig = CATEGORY_CONFIG[ticket.category] || CATEGORY_CONFIG.other;
            const hasUnread = ticket.status === 'admin_replied';

            return (
              <Card
                key={ticket.id}
                className={`border-0 shadow-sm cursor-pointer transition-all hover:shadow-md group ${
                  hasUnread ? 'ring-2 ring-green-200 bg-green-50/30' : ''
                }`}
                onClick={() => router.push(`/dashboard/pengaduan/${ticket.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Category Icon */}
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        hasUnread ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                    >
                      <span className={hasUnread ? 'text-green-600' : categoryConfig.color}>
                        {categoryConfig.icon}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                          {ticket.ticketNo}
                        </span>
                        <div className={`flex items-center gap-1 text-xs font-medium ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </div>
                        {ticket.priority !== 'normal' && (
                          <div className={`flex items-center gap-1 text-xs ${priorityConfig.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`}></span>
                            {priorityConfig.label}
                          </div>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {ticket.subject}
                      </h3>

                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          {categoryConfig.icon}
                          {categoryConfig.label}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {ticket._count.messages}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span>{formatDate(ticket.updatedAt)}</span>
                      </div>

                      {/* Last Message Preview */}
                      {ticket.messages[0] && (
                        <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                          <div className="flex items-start gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                              ticket.messages[0].sender === 'admin'
                                ? 'bg-blue-100'
                                : 'bg-gray-200'
                            }`}>
                              {ticket.messages[0].sender === 'admin' ? (
                                <Shield className="w-3 h-3 text-blue-600" />
                              ) : (
                                <User className="w-3 h-3 text-gray-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-xs font-medium ${
                                  ticket.messages[0].sender === 'admin' ? 'text-blue-600' : 'text-gray-600'
                                }`}>
                                  {ticket.messages[0].sender === 'admin' ? 'Tim Support' : 'Anda'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatDate(ticket.messages[0].createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {ticket.messages[0].message}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
