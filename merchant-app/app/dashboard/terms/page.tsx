'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TermsAndConditionsContent from '@/components/TermsAndConditionsContent';

export default function TermsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Syarat dan Ketentuan</h1>
        <p className="text-gray-500 mt-1">Ketentuan penggunaan layanan TVRI Nobar</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Syarat dan Ketentuan Layanan</CardTitle>
        </CardHeader>
        <CardContent>
          <TermsAndConditionsContent />
        </CardContent>
      </Card>
    </div>
  );
}
