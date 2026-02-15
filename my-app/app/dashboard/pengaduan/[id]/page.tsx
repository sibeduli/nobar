'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Send,
  User,
  Shield,
  Clock,
  CheckCircle,
  CreditCard,
  FileText,
  Wrench,
  HelpCircle,
  AlertCircle,
  MessageSquare,
  MoreVertical,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAlert } from '@/components/AlertModal';

interface TicketMessage {
  id: string;
  sender: string;
  senderEmail: string;
  message: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  ticketNo: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
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

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { showSuccess, showError } = useAlert();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolving, setResolving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tickets/${params.id}`);
      if (!res.ok) {
        if (res.status === 404) {
          showError('Tiket tidak ditemukan');
          router.push('/dashboard/pengaduan');
          return;
        }
        throw new Error('Failed to fetch ticket');
      }
      const data = await res.json();
      setTicket(data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      showError('Gagal memuat tiket');
    } finally {
      setLoading(false);
    }
  }, [params.id, showError, router]);

  useEffect(() => {
    if (params.id) {
      fetchTicket();
    }
  }, [params.id, fetchTicket]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleResolveTicket = async () => {
    try {
      setResolving(true);
      const res = await fetch(`/api/tickets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Gagal menyelesaikan tiket');
      }

      showSuccess('Tiket berhasil diselesaikan');
      setShowResolveModal(false);
      fetchTicket();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Gagal menyelesaikan tiket');
    } finally {
      setResolving(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      showError('Pesan tidak boleh kosong');
      return;
    }

    try {
      setSending(true);
      const res = await fetch(`/api/tickets/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Gagal mengirim pesan');
      }

      setNewMessage('');
      showSuccess('Pesan terkirim');
      fetchTicket();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Gagal mengirim pesan');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const priorityConfig = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.normal;
  const categoryConfig = CATEGORY_CONFIG[ticket.category] || CATEGORY_CONFIG.other;
  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard/pengaduan')}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="text-gray-400">Kembali ke daftar tiket</span>
      </div>

      {/* Ticket Info Card */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className={`h-1 ${statusConfig.bgColor.split(' ')[0]}`}></div>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  {ticket.ticketNo}
                </span>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.bgColor} ${statusConfig.color}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </div>
                {ticket.priority !== 'normal' && (
                  <div className={`flex items-center gap-1 text-xs ${priorityConfig.color}`}>
                    <span className={`w-2 h-2 rounded-full ${priorityConfig.dot}`}></span>
                    {priorityConfig.label}
                  </div>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">{ticket.subject}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className={`flex items-center gap-1.5 ${categoryConfig.color}`}>
                  {categoryConfig.icon}
                  {categoryConfig.label}
                </span>
                <span className="text-gray-300">•</span>
                <span>Dibuat {formatDate(ticket.createdAt)}</span>
              </div>
            </div>
            {!isClosed && (
              <Button
                variant="outline"
                onClick={() => setShowResolveModal(true)}
                className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
              >
                <CheckCircle className="w-4 h-4" />
                Tandai Selesai
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conversation */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {/* Messages Header */}
          <div className="px-6 py-4 border-b bg-gray-50/50">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MessageSquare className="w-4 h-4" />
              Percakapan ({ticket.messages.length} pesan)
            </div>
          </div>

          {/* Messages List */}
          <div className="max-h-[500px] overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/30 to-white">
            {ticket.messages.map((msg, index) => {
              const isAdmin = msg.sender === 'admin';
              const isFirst = index === 0;
              return (
                <div key={msg.id} className={`flex gap-4 ${isAdmin ? '' : 'flex-row-reverse'}`}>
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isAdmin
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}
                  >
                    {isAdmin ? (
                      <Shield className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex-1 max-w-[75%] ${isAdmin ? '' : 'flex flex-col items-end'}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-sm font-semibold ${isAdmin ? 'text-blue-600' : 'text-gray-700'}`}>
                        {isAdmin ? 'Tim Support' : 'Anda'}
                      </span>
                      {isFirst && !isAdmin && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          Pesan Awal
                        </span>
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        isAdmin
                          ? 'bg-blue-50 border border-blue-100 rounded-tl-sm'
                          : 'bg-white border border-gray-200 rounded-tr-sm shadow-sm'
                      }`}
                    >
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 mt-1.5 px-1">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Form */}
          {!isClosed ? (
            <form onSubmit={handleSendMessage} className="border-t bg-white p-6">
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    placeholder="Tulis balasan Anda di sini..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm leading-relaxed placeholder:text-gray-400 bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-xs text-gray-400">
                    {newMessage.length > 0 && `${newMessage.length} karakter`}
                  </span>
                  <Button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="gap-2 px-6"
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Kirim Balasan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="border-t p-8 bg-gray-50 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Tiket {ticket.status === 'resolved' ? 'Diselesaikan' : 'Ditutup'}
              </p>
              <p className="text-xs text-gray-500">
                Tiket ini tidak dapat menerima balasan lagi
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolve Modal */}
      <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selesaikan Tiket?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menyelesaikan tiket ini? Setelah diselesaikan, Anda tidak dapat mengirim pesan lagi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveModal(false)}>
              Batal
            </Button>
            <Button onClick={handleResolveTicket} disabled={resolving} className="gap-2">
              {resolving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Ya, Selesaikan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
