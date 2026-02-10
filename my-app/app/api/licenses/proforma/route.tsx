import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

// Server-side pricing
const LICENSE_TIERS: Record<number, { label: string; basePrice: number }> = {
  1: { label: 'Tier 1 (≤50 orang)', basePrice: 5000000 },
  2: { label: 'Tier 2 (51-100 orang)', basePrice: 10000000 },
  3: { label: 'Tier 3 (101-250 orang)', basePrice: 20000000 },
  4: { label: 'Tier 4 (251-500 orang)', basePrice: 40000000 },
  5: { label: 'Tier 5 (501-1000 orang)', basePrice: 100000000 },
};

const APPLICATION_FEE = 5000;
const VAT_RATE = 0.12;

const calculateBreakdown = (tier: number) => {
  const tierData = LICENSE_TIERS[tier];
  if (!tierData) return null;
  
  const basePrice = tierData.basePrice;
  const ppn = Math.round(basePrice * VAT_RATE);
  const total = basePrice + ppn + APPLICATION_FEE;
  
  return { basePrice, ppn, applicationFee: APPLICATION_FEE, total, label: tierData.label };
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  watermark: {
    position: 'absolute',
    top: '40%',
    left: '20%',
    fontSize: 60,
    color: '#e5e7eb',
    transform: 'rotate(-30deg)',
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#f59e0b',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  logoSubtitle: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  invoiceSubtitle: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: 'bold',
    marginTop: 2,
  },
  invoiceNumber: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    color: '#111827',
  },
  valueBold: {
    fontSize: 10,
    color: '#111827',
    fontWeight: 'bold',
  },
  valueSmall: {
    fontSize: 8,
    color: '#6b7280',
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableRowLast: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableFooter: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tableColDesc: {
    flex: 3,
  },
  tableColAmount: {
    flex: 1,
    textAlign: 'right',
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'right',
  },
  notice: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  noticeTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 9,
    color: '#92400e',
    marginBottom: 4,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 4,
  },
});

interface ProformaDocumentProps {
  venue: {
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    contactPerson: string | null;
    alamatLengkap: string;
    kabupaten: string;
    provinsi: string;
    capacity: number;
  };
  userProfile?: {
    name: string | null;
    email: string;
    companyName: string | null;
    billingAddress: string | null;
  };
  createdAt: string;
}

const ProformaDocument = ({ venue, userProfile, createdAt }: ProformaDocumentProps) => {
  const breakdown = calculateBreakdown(venue.capacity);
  const proformaNumber = `PRO-${Date.now().toString(36).toUpperCase()}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>PROFORMA</Text>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>TVRI Nobar</Text>
            <Text style={styles.logoSubtitle}>Merchant Licensing Portal</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.invoiceTitle}>PROFORMA</Text>
            <Text style={styles.invoiceSubtitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{proformaNumber}</Text>
          </View>
        </View>

        {/* Venue & Billing Info */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Venue</Text>
            <Text style={styles.valueBold}>{venue.businessName}</Text>
            <Text style={styles.value}>{venue.alamatLengkap}</Text>
            <Text style={styles.value}>{venue.kabupaten}, {venue.provinsi}</Text>
            <Text style={{ ...styles.value, marginTop: 8 }}>Contact Person:</Text>
            <Text style={styles.value}>{venue.contactPerson || venue.ownerName}</Text>
            <Text style={styles.value}>{venue.phone}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Ditagihkan Kepada</Text>
            <Text style={styles.valueBold}>{userProfile?.companyName || venue.ownerName}</Text>
            <Text style={styles.valueSmall}>a.n. {venue.ownerName}</Text>
            <Text style={styles.value}>{userProfile?.email || venue.email}</Text>
            {userProfile?.billingAddress ? (
              <Text style={{ ...styles.value, marginTop: 8 }}>{userProfile.billingAddress}</Text>
            ) : (
              <>
                <Text style={{ ...styles.value, marginTop: 8 }}>{venue.alamatLengkap}</Text>
                <Text style={styles.value}>{venue.kabupaten}, {venue.provinsi}</Text>
              </>
            )}
          </View>
        </View>

        {/* Date */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Tanggal Proforma</Text>
            <Text style={styles.value}>{formatDate(createdAt)}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Berlaku Hingga</Text>
            <Text style={styles.value}>Piala Dunia 2026</Text>
          </View>
        </View>

        {/* Item Details Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.tableColDesc]}>Deskripsi</Text>
            <Text style={[styles.tableHeaderText, styles.tableColAmount]}>Jumlah</Text>
          </View>
          
          <View style={styles.tableRow}>
            <View style={styles.tableColDesc}>
              <Text style={styles.valueBold}>Lisensi TVRI Piala Dunia 2026</Text>
              <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>{breakdown?.label}</Text>
              <Text style={{ fontSize: 9, color: '#6b7280' }}>Venue: {venue.businessName}</Text>
            </View>
            <Text style={[styles.value, styles.tableColAmount]}>
              {formatPrice(breakdown?.basePrice || 0)}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.value, styles.tableColDesc]}>PPN (12%)</Text>
            <Text style={[styles.value, styles.tableColAmount]}>
              {formatPrice(breakdown?.ppn || 0)}
            </Text>
          </View>

          <View style={styles.tableRowLast}>
            <Text style={[styles.value, styles.tableColDesc]}>Biaya Aplikasi</Text>
            <Text style={[styles.value, styles.tableColAmount]}>
              {formatPrice(APPLICATION_FEE)}
            </Text>
          </View>

          <View style={styles.tableFooter}>
            <Text style={[styles.totalLabel, styles.tableColDesc]}>Total</Text>
            <Text style={[styles.totalAmount, styles.tableColAmount]}>
              {formatPrice(breakdown?.total || 0)}
            </Text>
          </View>
        </View>

        {/* Notice */}
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Catatan Penting</Text>
          <Text style={styles.noticeText}>• Dokumen ini adalah Proforma Invoice dan bukan bukti pembayaran.</Text>
          <Text style={styles.noticeText}>• Harga dapat berubah sewaktu-waktu sebelum pembayaran dilakukan.</Text>
          <Text style={styles.noticeText}>• Lisensi akan aktif setelah pembayaran berhasil dikonfirmasi.</Text>
          <Text style={styles.noticeText}>• Untuk melakukan pembayaran, silakan login ke portal merchant TVRI Nobar.</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Terima kasih telah menggunakan layanan TVRI Nobar</Text>
          <Text style={styles.footerText}>Untuk pertanyaan, hubungi support@tvrinobar.id</Text>
        </View>
      </Page>
    </Document>
  );
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { venueId } = body;

    const venue = await prisma.merchant.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Fetch user profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email || '' },
    });

    const userProfile = user ? {
      name: user.name,
      email: user.email || '',
      companyName: user.companyName,
      billingAddress: user.billingAddress,
    } : undefined;

    const pdfBuffer = await renderToBuffer(
      <ProformaDocument 
        venue={{
          businessName: venue.businessName,
          ownerName: venue.ownerName,
          email: venue.email,
          phone: venue.phone,
          contactPerson: venue.contactPerson,
          alamatLengkap: venue.alamatLengkap,
          kabupaten: venue.kabupaten,
          provinsi: venue.provinsi,
          capacity: venue.capacity,
        }}
        userProfile={userProfile}
        createdAt={new Date().toISOString()}
      />
    );

    const filename = `Proforma-${venue.businessName.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
    
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating proforma PDF:', error);
    return NextResponse.json({ error: 'Failed to generate proforma' }, { status: 500 });
  }
}
