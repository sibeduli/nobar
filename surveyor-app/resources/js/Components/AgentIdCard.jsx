import { useState, useEffect } from 'react';
import { useTheme } from '@/Contexts/ThemeContext';
import QRCode from 'qrcode';
import { Download, X } from 'lucide-react';
import Button from '@/Components/Button';
import Modal from '@/Components/Modal';

export default function AgentIdCard({ agent, company, isOpen, onClose }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [qrDataUrl, setQrDataUrl] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (agent?.qr_code && isOpen) {
            QRCode.toDataURL(agent.qr_code, {
                width: 200,
                margin: 1,
                color: {
                    dark: '#0d9488',
                    light: '#ffffff',
                },
                errorCorrectionLevel: 'H',
            }).then(url => {
                setQrDataUrl(url);
                generateCardPreview(url);
            }).catch(console.error);
        }
    }, [agent?.qr_code, isOpen]);

    // Helper function to draw rounded rectangles
    const roundRect = (ctx, x, y, w, h, r) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    };

    const generateCardPreview = (qrUrl) => {
        if (!agent) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Credit card size at 300 DPI (85.6mm x 53.98mm)
        const width = 1012;
        const height = 638;
        canvas.width = width;
        canvas.height = height;

        // Load TVRI logo first
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.onload = () => drawCard(ctx, canvas, width, height, qrUrl, logoImg);
        logoImg.onerror = () => drawCard(ctx, canvas, width, height, qrUrl, null);
        logoImg.src = '/TVRI-logo.png';
    };

    const drawCard = (ctx, canvas, width, height, qrUrl, logoImg) => {
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#0d9488');
        gradient.addColorStop(1, '#065f46');
        ctx.fillStyle = gradient;
        roundRect(ctx, 0, 0, width, height, 24);
        ctx.fill();

        // Guilloche pattern (money/certificate texture)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        
        // Wavy horizontal lines
        for (let y = 0; y < height; y += 8) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x < width; x += 4) {
                ctx.lineTo(x, y + Math.sin(x * 0.02 + y * 0.01) * 3);
            }
            ctx.stroke();
        }

        // Concentric circles pattern (bottom right)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        for (let r = 50; r < 500; r += 12) {
            ctx.beginPath();
            ctx.arc(width - 100, height + 50, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Concentric circles pattern (top left)
        for (let r = 30; r < 300; r += 10) {
            ctx.beginPath();
            ctx.arc(-50, -50, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Fine diagonal crosshatch
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 0.5;
        for (let i = -height; i < width + height; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + height, height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(i + height, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }

        // Tilted repeating "TVRI 2026" watermark text (like money)
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.rotate(-25 * Math.PI / 180); // Tilt -25 degrees
        
        const watermarkText = 'TVRI 2026';
        const spacingX = 180;
        const spacingY = 80;
        
        for (let row = -5; row < 15; row++) {
            for (let col = -2; col < 12; col++) {
                const x = col * spacingX + (row % 2) * (spacingX / 2); // Offset every other row
                const y = row * spacingY;
                ctx.fillText(watermarkText, x, y);
            }
        }
        ctx.restore();

        // Decorative circle (larger, more visible)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.arc(width + 50, -100, 400, 0, Math.PI * 2);
        ctx.fill();

        // Logo
        if (logoImg) {
            const logoHeight = 70;
            const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
            ctx.drawImage(logoImg, 40, 35, logoWidth, logoHeight);
            
            // Company name (positioned after logo)
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(company?.name || 'Nobar Surveyor', 40 + logoWidth + 16, 65);

            // Subtitle
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = '18px Arial';
            ctx.fillText('KARTU IDENTITAS AGEN SURVEY NOBAR TVRI 2026', 40 + logoWidth + 16, 95);
        } else {
            // Fallback: text logo
            ctx.fillStyle = '#ffffff';
            roundRect(ctx, 40, 40, 80, 80, 12);
            ctx.fill();
            ctx.fillStyle = '#0d9488';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('TVRI', 80, 90);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(company?.name || 'Nobar Surveyor', 140, 70);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '18px Arial';
            ctx.fillText('KARTU IDENTITAS AGEN SURVEY NOBAR TVRI 2026', 140, 100);
        }

        // QR Code background (bigger: 280x280)
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, 40, 130, 300, 300, 16);
        ctx.fill();

        // Load and draw QR code
        const qrImg = new Image();
        qrImg.onload = () => {
            ctx.drawImage(qrImg, 50, 140, 280, 280);

            // Agent name
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 42px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(agent?.name || '', 370, 200);

            // QR Code ID
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '18px monospace';
            ctx.fillText(agent?.qr_code || '', 370, 250);

            // Phone
            ctx.fillStyle = '#ffffff';
            ctx.font = '28px Arial';
            ctx.fillText(agent?.phone || '', 370, 310);

            // Areas badge
            if (agent?.areas?.length > 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                roundRect(ctx, 370, 340, 580, 40, 8);
                ctx.fill();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.font = '18px Arial';
                ctx.fillText(`Area: ${agent.areas.slice(0, 2).join(', ')}${agent.areas.length > 2 ? '...' : ''}`, 385, 368);
            }

            // Footer
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Kartu ini adalah identitas resmi agen survey. Harap dijaga dan tidak dipindahtangankan.', width / 2, height - 30);

            // Set preview
            setPreviewUrl(canvas.toDataURL('image/png'));
        };
        qrImg.src = qrUrl;
    };

    const handleDownload = () => {
        if (!previewUrl || !agent) return;

        const link = document.createElement('a');
        link.download = `ID-Card-${agent?.name?.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
        link.href = previewUrl;
        link.click();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Kartu ID Agen">
            <div className="space-y-4">
                {/* Card Preview */}
                <div className="flex justify-center">
                    {previewUrl ? (
                        <img 
                            src={previewUrl} 
                            alt="ID Card Preview" 
                            className="rounded-xl shadow-lg"
                            style={{ maxWidth: '100%', height: 'auto', maxHeight: '300px' }}
                        />
                    ) : (
                        <div 
                            className="rounded-xl flex items-center justify-center"
                            style={{ 
                                width: '340px', 
                                height: '214px',
                                background: 'linear-gradient(135deg, #0d9488 0%, #065f46 100%)',
                            }}
                        >
                            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-3">
                    <Button variant="secondary" onClick={onClose}>
                        <X className="w-4 h-4" />
                        Tutup
                    </Button>
                    <Button onClick={handleDownload} disabled={!previewUrl}>
                        <Download className="w-4 h-4" />
                        Unduh PNG
                    </Button>
                </div>

                <p className={`text-xs text-center ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                    Ukuran kartu: 85.6mm x 53.98mm (standar kartu kredit) • 300 DPI
                </p>
            </div>
        </Modal>
    );
}
