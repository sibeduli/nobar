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
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }) + ' WIB';
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
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
  invoiceNumber: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  statusPaid: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusUnpaid: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
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
    backgroundColor: '#f9fafb',
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
  paymentDetails: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  paymentTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  paymentLabel: {
    flex: 1,
    fontSize: 9,
    color: '#6b7280',
  },
  paymentValue: {
    flex: 2,
    fontSize: 9,
    color: '#111827',
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

interface InvoiceDocumentProps {
  license: {
    id: string;
    tier: number;
    price: number;
    status: string;
    paidAt: string | null;
    midtransId: string | null;
    transactionId: string | null;
    paymentType: string | null;
    transactionTime: string | null;
    bank: string | null;
    maskedCard: string | null;
    createdAt: string;
    venue: {
      businessName: string;
      ownerName: string;
      email: string;
      phone: string;
      alamatLengkap: string;
      kabupaten: string;
      provinsi: string;
    };
  };
  userProfile?: {
    name: string | null;
    email: string;
    companyName: string | null;
    billingAddress: string | null;
  };
}

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  credit_card: 'Kartu Kredit',
  bank_transfer: 'Transfer Bank',
  gopay: 'GoPay',
  shopeepay: 'ShopeePay',
  qris: 'QRIS',
};

const InvoiceDocument = ({ license, userProfile }: InvoiceDocumentProps) => {
  const breakdown = calculateBreakdown(license.tier);
  const isPaid = license.status === 'paid';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>TVRI Nobar</Text>
            <Text style={styles.logoSubtitle}>Merchant Licensing Portal</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>
              #{license.midtransId || license.id.slice(-8).toUpperCase()}
            </Text>
            <View style={[styles.statusBadge, isPaid ? styles.statusPaid : styles.statusUnpaid]}>
              <Text style={{ fontSize: 9, fontWeight: 'bold' }}>
                {isPaid ? 'LUNAS' : 'BELUM BAYAR'}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer & Venue Info */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Ditagihkan Kepada</Text>
            <Text style={styles.valueBold}>{userProfile?.companyName || license.venue.ownerName}</Text>
            <Text style={styles.value}>{userProfile?.name || license.venue.ownerName}</Text>
            <Text style={styles.value}>{userProfile?.email || license.venue.email}</Text>
            {userProfile?.billingAddress && (
              <Text style={styles.value}>{userProfile.billingAddress}</Text>
            )}
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Venue</Text>
            <Text style={styles.valueBold}>{license.venue.businessName}</Text>
            <Text style={styles.value}>{license.venue.alamatLengkap}</Text>
            <Text style={styles.value}>{license.venue.kabupaten}, {license.venue.provinsi}</Text>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Tanggal Invoice</Text>
            <Text style={styles.value}>{formatDate(license.createdAt)}</Text>
          </View>
          {isPaid && license.paidAt && (
            <View style={styles.column}>
              <Text style={styles.label}>Tanggal Pembayaran</Text>
              <Text style={styles.value}>{formatDate(license.paidAt)}</Text>
            </View>
          )}
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
              <Text style={{ fontSize: 9, color: '#6b7280' }}>Venue: {license.venue.businessName}</Text>
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
              {formatPrice(breakdown?.total || license.price)}
            </Text>
          </View>
        </View>

        {/* Payment Details (if paid) */}
        {isPaid && (
          <View style={styles.paymentDetails}>
            <Text style={styles.paymentTitle}>Detail Pembayaran</Text>
            {license.paymentType && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Metode Pembayaran</Text>
                <Text style={styles.paymentValue}>
                  {PAYMENT_TYPE_LABELS[license.paymentType] || license.paymentType}
                </Text>
              </View>
            )}
            {license.transactionId && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Transaction ID</Text>
                <Text style={styles.paymentValue}>{license.transactionId}</Text>
              </View>
            )}
            {license.bank && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Bank</Text>
                <Text style={styles.paymentValue}>{license.bank.toUpperCase()}</Text>
              </View>
            )}
            {license.maskedCard && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Nomor Kartu</Text>
                <Text style={styles.paymentValue}>{license.maskedCard}</Text>
              </View>
            )}
            {license.transactionTime && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Waktu Transaksi</Text>
                <Text style={styles.paymentValue}>{formatDate(license.transactionTime)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Terima kasih telah menggunakan layanan TVRI Nobar</Text>
          <Text style={styles.footerText}>Untuk pertanyaan, hubungi support@tvrinobar.id</Text>
        </View>
      </Page>
    </Document>
  );
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const license = await prisma.license.findUnique({
      where: { id },
      include: {
        venue: true,
      },
    });

    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }

    // Check ownership - only allow invoice download for own licenses
    if (license.venue.email !== session.user.email) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch user profile by venue email
    const user = await prisma.user.findUnique({
      where: { email: license.venue.email },
    });

    const userProfile = user ? {
      name: user.name,
      email: user.email || '',
      companyName: user.companyName,
      billingAddress: user.billingAddress,
    } : undefined;

    const pdfBuffer = await renderToBuffer(
      <InvoiceDocument 
        license={{
          id: license.id,
          tier: license.tier,
          price: license.price,
          status: license.status,
          paidAt: license.paidAt?.toISOString() || null,
          midtransId: license.midtransId,
          transactionId: license.transactionId,
          paymentType: license.paymentType,
          transactionTime: license.transactionTime?.toISOString() || null,
          bank: license.bank,
          maskedCard: license.maskedCard,
          createdAt: license.createdAt.toISOString(),
          venue: {
            businessName: license.venue.businessName,
            ownerName: license.venue.ownerName,
            email: license.venue.email,
            phone: license.venue.phone,
            alamatLengkap: license.venue.alamatLengkap,
            kabupaten: license.venue.kabupaten,
            provinsi: license.venue.provinsi,
          },
        }}
        userProfile={userProfile}
      />
    );

    const invoiceNumber = license.midtransId || license.id.slice(-8).toUpperCase();
    
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
