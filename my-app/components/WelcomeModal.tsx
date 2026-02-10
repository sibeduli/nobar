'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserCircle, Store, CreditCard, ArrowRight } from 'lucide-react';

interface UserProfile {
  phone: string | null;
  billingAddress: string | null;
  companyName: string | null;
  companyRole: string | null;
}

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: <UserCircle className="w-8 h-8 text-blue-600" />,
    title: 'Lengkapi Profil',
    description: 'Isi data diri dan informasi perusahaan Anda untuk keperluan penagihan.',
  },
  {
    icon: <Store className="w-8 h-8 text-green-600" />,
    title: 'Daftarkan Venue',
    description: 'Tambahkan venue Anda yang akan menayangkan siaran Piala Dunia 2026.',
  },
  {
    icon: <CreditCard className="w-8 h-8 text-purple-600" />,
    title: 'Aktivasi Lisensi',
    description: 'Pilih tier lisensi sesuai kapasitas venue dan lakukan pembayaran.',
  },
];

export default function WelcomeModal() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [profileComplete, setProfileComplete] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Check if user profile is complete
      checkProfileComplete();
    }
  }, [status, session]);

  const checkProfileComplete = async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      if (data.success && data.user) {
        const isComplete = data.user.phone && data.user.billingAddress && 
                          data.user.companyName && data.user.companyRole;
        setProfileComplete(!!isComplete);
        // Show modal if profile is not complete
        if (!isComplete) {
          setIsOpen(true);
        }
      } else {
        // No profile yet, show modal
        setProfileComplete(false);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleGetStarted = () => {
    setIsOpen(false);
    router.push('/dashboard/settings?highlight=profile');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <DialogTitle className="text-xl">
            Selamat Datang di TVRI Nobar!
          </DialogTitle>
          <DialogDescription className="text-base">
            Portal lisensi resmi untuk penayangan Piala Dunia 2026
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Step indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-blue-600 w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Current step content */}
          <div className="text-center px-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {steps[currentStep].icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Langkah {currentStep + 1}: {steps[currentStep].title}
            </h3>
            <p className="text-sm text-gray-600">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Navigation arrows */}
          <div className="flex justify-between items-center mt-6 px-4">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`text-sm ${
                currentStep === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ← Sebelumnya
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep === steps.length - 1}
              className={`text-sm ${
                currentStep === steps.length - 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Selanjutnya →
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={handleGetStarted} className="w-full">
            Mulai Lengkapi Profil
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="ghost" onClick={handleClose} className="w-full text-gray-500">
            Nanti Saja
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
