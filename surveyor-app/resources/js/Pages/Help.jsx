import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { 
    Send, 
    Paperclip, 
    Image as ImageIcon, 
    Smile, 
    MoreVertical,
    Check,
    CheckCheck,
    Clock,
    Headphones
} from 'lucide-react';

// Mock conversation data
const initialMessages = [
    {
        id: 1,
        sender: 'admin',
        name: 'Admin Support',
        message: 'Selamat datang di Pusat Bantuan TVRI Nobar! 👋',
        timestamp: '2024-03-10 09:00',
        status: 'read'
    },
    {
        id: 2,
        sender: 'admin',
        name: 'Admin Support',
        message: 'Ada yang bisa kami bantu hari ini? Silakan sampaikan pertanyaan atau kendala yang Anda alami.',
        timestamp: '2024-03-10 09:00',
        status: 'read'
    },
    {
        id: 3,
        sender: 'user',
        name: 'Abdullah Said',
        message: 'Halo, saya ingin bertanya tentang cara menambahkan agen baru ke sistem.',
        timestamp: '2024-03-10 09:05',
        status: 'read'
    },
    {
        id: 4,
        sender: 'admin',
        name: 'Admin Support',
        message: 'Tentu! Untuk menambahkan agen baru, silakan ikuti langkah berikut:\n\n1. Buka menu "Agen Survey" di sidebar\n2. Klik "Daftar Agen"\n3. Isi formulir pendaftaran dengan lengkap\n4. Upload foto KTP agen\n5. Klik "Simpan Agen"\n\nApakah ada yang ingin ditanyakan lagi?',
        timestamp: '2024-03-10 09:08',
        status: 'read'
    },
    {
        id: 5,
        sender: 'user',
        name: 'Abdullah Said',
        message: 'Terima kasih! Sangat membantu. Satu lagi, bagaimana cara melihat aktivitas agen?',
        timestamp: '2024-03-10 09:10',
        status: 'read'
    },
    {
        id: 6,
        sender: 'admin',
        name: 'Admin Support',
        message: 'Untuk melihat aktivitas agen:\n\n1. Buka menu "Agen Survey"\n2. Pilih "Aktivitas Agen"\n3. Anda bisa filter berdasarkan nama agen menggunakan search box\n4. Gunakan filter tambahan untuk tipe aktivitas dan status\n\nSemua log aktivitas akan ditampilkan dalam tabel yang bisa di-export ke CSV.',
        timestamp: '2024-03-10 09:12',
        status: 'read'
    },
];

export default function Help() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!newMessage.trim()) return;

        const userMsg = {
            id: messages.length + 1,
            sender: 'user',
            name: 'Abdullah Said',
            message: newMessage.trim(),
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
            status: 'sent'
        };

        setMessages(prev => [...prev, userMsg]);
        setNewMessage('');
        inputRef.current?.focus();

        // Simulate admin typing
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            const adminReply = {
                id: messages.length + 2,
                sender: 'admin',
                name: 'Admin Support',
                message: 'Terima kasih atas pertanyaannya. Tim kami akan segera membantu Anda. Mohon tunggu sebentar ya! 🙏',
                timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
                status: 'read'
            };
            setMessages(prev => [...prev, adminReply]);
        }, 2000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hari ini';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Kemarin';
        }
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const MessageStatus = ({ status }) => {
        if (status === 'sent') return <Clock className="w-3.5 h-3.5 text-gray-400" />;
        if (status === 'delivered') return <Check className="w-3.5 h-3.5 text-gray-400" />;
        if (status === 'read') return <CheckCheck className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-teal-500'}`} />;
        return null;
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = message.timestamp.split(' ')[0];
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {});

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)]">
                <div className={`h-full flex flex-col rounded-xl overflow-hidden
                    ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}
                `}>
                    {/* Chat Header */}
                    <div className={`flex items-center justify-between px-4 py-3 border-b
                        ${isDark ? 'border-emerald-900/30 bg-emerald-950/30' : 'border-gray-100 bg-gray-50'}
                    `}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                ${isDark ? 'bg-emerald-500/20' : 'bg-teal-100'}
                            `}>
                                <Headphones className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                            </div>
                            <div>
                                <h2 className={`font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                    Admin Support
                                </h2>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span className={`text-xs ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}`}>
                                        Online
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button className={`p-2 rounded-lg transition-colors
                            ${isDark ? 'text-emerald-500/60 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}
                        `}>
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className={`flex-1 overflow-y-auto p-4 space-y-4
                        ${isDark ? 'bg-[#080c0c]' : 'bg-gray-50'}
                    `}>
                        {Object.entries(groupedMessages).map(([date, msgs]) => (
                            <div key={date}>
                                {/* Date Separator */}
                                <div className="flex items-center justify-center mb-4">
                                    <span className={`px-3 py-1 text-xs rounded-full
                                        ${isDark ? 'bg-emerald-950/50 text-emerald-500/70' : 'bg-gray-200 text-gray-500'}
                                    `}>
                                        {formatDate(date)}
                                    </span>
                                </div>

                                {/* Messages */}
                                {msgs.map((msg, idx) => {
                                    const isUser = msg.sender === 'user';
                                    const showAvatar = idx === 0 || msgs[idx - 1]?.sender !== msg.sender;

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex gap-2 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {!isUser && showAvatar && (
                                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                                                    ${isDark ? 'bg-emerald-500/20' : 'bg-teal-100'}
                                                `}>
                                                    <Headphones className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                                                </div>
                                            )}
                                            {!isUser && !showAvatar && <div className="w-8" />}

                                            <div className={`max-w-[70%] ${isUser ? 'order-first' : ''}`}>
                                                <div className={`px-4 py-2.5 rounded-2xl whitespace-pre-wrap
                                                    ${isUser
                                                        ? isDark 
                                                            ? 'bg-emerald-600 text-white rounded-br-md' 
                                                            : 'bg-teal-600 text-white rounded-br-md'
                                                        : isDark 
                                                            ? 'bg-emerald-950/50 text-emerald-100 rounded-bl-md border border-emerald-900/30' 
                                                            : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                                                    }
                                                `}>
                                                    <p className="text-sm">{msg.message}</p>
                                                </div>
                                                <div className={`flex items-center gap-1 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                                    <span className={`text-xs ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`}>
                                                        {formatTime(msg.timestamp)}
                                                    </span>
                                                    {isUser && <MessageStatus status={msg.status} />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex gap-2">
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                                    ${isDark ? 'bg-emerald-500/20' : 'bg-teal-100'}
                                `}>
                                    <Headphones className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                                </div>
                                <div className={`px-4 py-3 rounded-2xl rounded-bl-md
                                    ${isDark ? 'bg-emerald-950/50 border border-emerald-900/30' : 'bg-white border border-gray-200'}
                                `}>
                                    <div className="flex gap-1">
                                        <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-emerald-400' : 'bg-teal-500'}`} style={{ animationDelay: '0ms' }}></span>
                                        <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-emerald-400' : 'bg-teal-500'}`} style={{ animationDelay: '150ms' }}></span>
                                        <span className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-emerald-400' : 'bg-teal-500'}`} style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className={`px-4 py-3 border-t
                        ${isDark ? 'border-emerald-900/30 bg-emerald-950/20' : 'border-gray-100 bg-white'}
                    `}>
                        <div className="flex items-end gap-2">
                            <div className="flex gap-1">
                                <button className={`p-2 rounded-lg transition-colors
                                    ${isDark ? 'text-emerald-500/60 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}
                                `}>
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <button className={`p-2 rounded-lg transition-colors
                                    ${isDark ? 'text-emerald-500/60 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}
                                `}>
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 relative">
                                <textarea
                                    ref={inputRef}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ketik pesan..."
                                    rows={1}
                                    className={`w-full px-4 py-2.5 pr-10 text-sm rounded-xl resize-none transition-colors focus:outline-none focus:ring-2
                                        ${isDark 
                                            ? 'bg-emerald-950/50 border border-emerald-900/50 text-emerald-100 placeholder:text-emerald-500/40 focus:ring-emerald-500/50' 
                                            : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-teal-500'
                                        }
                                    `}
                                    style={{ maxHeight: '120px' }}
                                />
                                <button className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors
                                    ${isDark ? 'text-emerald-500/60 hover:text-emerald-400' : 'text-gray-400 hover:text-gray-600'}
                                `}>
                                    <Smile className="w-5 h-5" />
                                </button>
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={!newMessage.trim()}
                                className={`p-2.5 rounded-xl transition-colors
                                    ${newMessage.trim()
                                        ? isDark 
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-500' 
                                            : 'bg-teal-600 text-white hover:bg-teal-500'
                                        : isDark 
                                            ? 'bg-emerald-950/50 text-emerald-500/40' 
                                            : 'bg-gray-100 text-gray-400'
                                    }
                                `}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>

                        <p className={`text-xs text-center mt-2 ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`}>
                            Tim support kami biasanya merespons dalam 5-10 menit
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
