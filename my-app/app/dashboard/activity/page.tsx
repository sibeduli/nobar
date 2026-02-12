'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Activity, 
  LogIn, 
  LogOut, 
  Store, 
  Pencil, 
  Trash2, 
  FileText, 
  CreditCard, 
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search
} from 'lucide-react';

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ACTION_ICONS: Record<string, typeof Activity> = {
  LOGIN: LogIn,
  LOGOUT: LogOut,
  VENUE_CREATE: Store,
  VENUE_UPDATE: Pencil,
  VENUE_DELETE: Trash2,
  LICENSE_CREATE: FileText,
  PAYMENT_SUCCESS: CreditCard,
  PAYMENT_PENDING: Clock,
  PROFILE_UPDATE: User,
};

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-green-100 text-green-700',
  LOGOUT: 'bg-gray-100 text-gray-700',
  VENUE_CREATE: 'bg-blue-100 text-blue-700',
  VENUE_UPDATE: 'bg-yellow-100 text-yellow-700',
  VENUE_DELETE: 'bg-red-100 text-red-700',
  LICENSE_CREATE: 'bg-purple-100 text-purple-700',
  PAYMENT_SUCCESS: 'bg-green-100 text-green-700',
  PAYMENT_PENDING: 'bg-orange-100 text-orange-700',
  PROFILE_UPDATE: 'bg-indigo-100 text-indigo-700',
};

const ACTION_LABELS: Record<string, string> = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  VENUE_CREATE: 'Venue Baru',
  VENUE_UPDATE: 'Edit Venue',
  VENUE_DELETE: 'Hapus Venue',
  LICENSE_CREATE: 'Lisensi Baru',
  PAYMENT_SUCCESS: 'Pembayaran',
  PAYMENT_PENDING: 'Pending',
  PROFILE_UPDATE: 'Profil',
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
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
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ACTION_OPTIONS = [
  { value: 'all', label: 'Semua Aktivitas' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'VENUE_CREATE', label: 'Venue Baru' },
  { value: 'VENUE_UPDATE', label: 'Edit Venue' },
  { value: 'VENUE_DELETE', label: 'Hapus Venue' },
  { value: 'LICENSE_CREATE', label: 'Lisensi Baru' },
  { value: 'PAYMENT_SUCCESS', label: 'Pembayaran Berhasil' },
  { value: 'PAYMENT_PENDING', label: 'Pembayaran Pending' },
  { value: 'PROFILE_UPDATE', label: 'Update Profil' },
];

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  // Valid items per page options
  const VALID_ITEMS_PER_PAGE = [5, 10, 15, 20];
  const DEFAULT_ITEMS_PER_PAGE = 10;
  const STORAGE_KEY = 'activity_items_per_page';

  // Initialize items per page from localStorage with fallback
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_ITEMS_PER_PAGE;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved);
        // Validate that saved value exists in current options
        if (VALID_ITEMS_PER_PAGE.includes(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
    }
    return DEFAULT_ITEMS_PER_PAGE;
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchActivities = useCallback(async (page: number, search: string, action: string, limit: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        action,
      });
      const res = await fetch(`/api/activities?${params}`);
      const data = await res.json();
      if (data.success) {
        setActivities(data.activities);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities(1, debouncedSearch, actionFilter, itemsPerPage);
  }, [fetchActivities, debouncedSearch, actionFilter, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchActivities(newPage, debouncedSearch, actionFilter, itemsPerPage);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    const newLimit = parseInt(value);
    setItemsPerPage(newLimit);
    // Save preference to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Aktivitas</h1>
        <p className="text-gray-500 mt-1">Riwayat aktivitas akun Anda</p>
      </div>

      {/* Search and Filter */}
      <Card className="bg-white py-2 mb-4">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari aktivitas..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-white">
                <SelectValue placeholder="Filter aktivitas" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {debouncedSearch || actionFilter !== 'all' ? 'Tidak ada hasil' : 'Belum ada aktivitas'}
              </h3>
              <p className="text-gray-500">
                {debouncedSearch || actionFilter !== 'all' 
                  ? 'Coba ubah kata kunci atau filter pencarian' 
                  : 'Aktivitas Anda akan muncul di sini'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = ACTION_ICONS[activity.action] || Activity;
              const colorClass = ACTION_COLORS[activity.action] || 'bg-gray-100 text-gray-700';
              const label = ACTION_LABELS[activity.action] || activity.action;

              return (
                <Card key={activity.id} className="hover:shadow-md transition-shadow py-1">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={colorClass}>
                            {label}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDate(activity.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-900">{activity.description}</p>
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="mt-2 text-sm text-gray-500">
                            {activity.metadata.venueName && (
                              <span className="inline-flex items-center gap-1">
                                <Store className="w-3 h-3" />
                                {activity.metadata.venueName}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination Info */}
          <Card className="bg-white">
            <CardContent className="py-1">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    <span>Menampilkan </span>
                    <strong>{((pagination.page - 1) * pagination.limit) + 1}</strong>
                    <span> - </span>
                    <strong>{Math.min(pagination.page * pagination.limit, pagination.total)}</strong>
                    <span> dari </span>
                    <strong>{pagination.total}</strong>
                    <span> aktivitas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Halaman </span>
                    <strong>{pagination.page}</strong>
                    <span> dari </span>
                    <strong>{pagination.totalPages}</strong>
                    <span> • </span>
                    <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                      <SelectTrigger className="w-[80px] h-7 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                      </SelectContent>
                    </Select>
                    <span> per halaman</span>
                  </div>
                </div>
                {pagination.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600 px-2">
                      Halaman {pagination.page} dari {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
