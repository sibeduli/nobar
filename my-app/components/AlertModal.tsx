'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertState {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
}

interface AlertContextType {
  showAlert: (type: AlertType, title: string, message: string) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

const alertConfig: Record<AlertType, { icon: typeof AlertCircle; color: string; bgColor: string; title: string }> = {
  error: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    title: 'Error',
  },
  success: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    title: 'Berhasil',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    title: 'Peringatan',
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    title: 'Informasi',
  },
};

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showAlert = useCallback((type: AlertType, title: string, message: string) => {
    setAlert({ isOpen: true, type, title, message });
  }, []);

  const showError = useCallback((message: string) => {
    showAlert('error', 'Error', message);
  }, [showAlert]);

  const showSuccess = useCallback((message: string) => {
    showAlert('success', 'Berhasil', message);
  }, [showAlert]);

  const showWarning = useCallback((message: string) => {
    showAlert('warning', 'Peringatan', message);
  }, [showAlert]);

  const showInfo = useCallback((message: string) => {
    showAlert('info', 'Informasi', message);
  }, [showAlert]);

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  };

  const config = alertConfig[alert.type];
  const Icon = config.icon;

  return (
    <AlertContext.Provider value={{ showAlert, showError, showSuccess, showWarning, showInfo }}>
      {children}
      <Dialog open={alert.isOpen} onOpenChange={closeAlert}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${config.bgColor} rounded-full flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <DialogTitle>{alert.title}</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              {alert.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={closeAlert} className="bg-[#1c316b] hover:bg-[#1c316b]/90">
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AlertContext.Provider>
  );
}
