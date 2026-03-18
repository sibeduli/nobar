'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Download, Share2, Check, QrCode } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import QRCode from 'qrcode';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url?: string;
  title?: string;
}

export default function ShareModal({ open, onOpenChange, url, title }: ShareModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (open) {
      const currentUrl = url || window.location.href;
      setShareUrl(currentUrl);
      generateQR(currentUrl);
    }
  }, [open, url]);

  const generateQR = async (urlToEncode: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(urlToEncode, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1c316b',
          light: '#ffffff',
        },
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `${APP_NAME.replace(/\s+/g, '-')}-QR.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || APP_NAME,
          text: `Daftar lisensi ${APP_NAME} untuk venue Anda!`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5" />
            Bagikan Link Pendaftaran
          </DialogTitle>
          <DialogDescription className="text-center">
            Scan QR code atau bagikan link untuk mendaftar
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm mb-4">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                <QrCode className="w-12 h-12 text-gray-300 animate-pulse" />
              </div>
            )}
          </div>

          {/* URL Display */}
          <div className="w-full bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-500 text-center truncate">{shareUrl}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 w-full justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="flex-1 min-w-[120px]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Tersalin!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Salin Link
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadQR}
              disabled={!qrDataUrl}
              className="flex-1 min-w-[120px]"
            >
              <Download className="w-4 h-4 mr-2" />
              Unduh QR
            </Button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <Button
                variant="default"
                size="sm"
                onClick={handleNativeShare}
                className="flex-1 min-w-[120px]"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Bagikan
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
