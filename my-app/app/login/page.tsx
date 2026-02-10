'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleGoogleAuth = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TVRI Nobar</h1>
          <p className="text-gray-500 mt-1">Lisensi Resmi Piala Dunia 2026</p>
        </div>

        <Card>
          <CardHeader className="text-center pb-2">
            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  mode === 'login'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  mode === 'signup'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Daftar
              </button>
            </div>
            <CardTitle className="text-xl">
              {mode === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
            </CardTitle>
            <CardDescription>
              {mode === 'login'
                ? 'Masuk untuk mengelola venue Anda'
                : 'Daftar untuk mendapatkan lisensi nobar'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleAuth}
              variant="outline"
              className="w-full h-12"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {mode === 'login' ? 'Masuk dengan Google' : 'Daftar dengan Google'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">atau</span>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500">
              {mode === 'login' ? (
                <>
                  Belum punya akun?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Daftar sekarang
                  </button>
                </>
              ) : (
                <>
                  Sudah punya akun?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Masuk
                  </button>
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan dan Kebijakan Privasi kami.
        </p>
      </div>
    </div>
  );
}
