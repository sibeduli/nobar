'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import TermsAndConditionsContent from './TermsAndConditionsContent';

interface TermsAndConditionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

export default function TermsAndConditionsModal({
  open,
  onOpenChange,
  onAccept,
}: TermsAndConditionsModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset scroll state when modal opens
  useEffect(() => {
    if (open) {
      setHasScrolledToBottom(false);
      // Reset scroll position
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [open]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    onAccept();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Syarat dan Ketentuan</DialogTitle>
          <DialogDescription>
            Silakan baca dan scroll hingga akhir untuk menyetujui
          </DialogDescription>
        </DialogHeader>

        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 max-h-[50vh] border-y border-gray-100"
        >
          <div className="py-4">
            <TermsAndConditionsContent />
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          {!hasScrolledToBottom ? (
            <p className="text-sm text-amber-600 text-center">
              ↓ Scroll ke bawah untuk melanjutkan ↓
            </p>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Anda telah membaca seluruh syarat dan ketentuan</span>
            </div>
          )}

          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!hasScrolledToBottom}
            >
              Setuju dan Lanjutkan
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
