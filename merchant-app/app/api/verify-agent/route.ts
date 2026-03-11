import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      { error: 'Kode QR tidak ditemukan' },
      { status: 400 }
    );
  }

  // Validate QR code format: AGENT-COMPANY-YEAR-XXXX-NAME
  if (!code.startsWith('AGENT-')) {
    return NextResponse.json(
      { error: 'Format QR code tidak valid' },
      { status: 400 }
    );
  }

  try {
    const agent = await prisma.agent.findUnique({
      where: { qrCode: code },
      include: { company: true },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agen tidak ditemukan dalam sistem' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      agent: {
        id: Number(agent.id),
        name: agent.name,
        phone: agent.phone,
        areas: agent.areas ?? [],
        company: {
          name: agent.company.name,
          code: agent.company.code,
        },
        status: agent.status,
        qr_code: agent.qrCode,
      },
    });
  } catch (error) {
    console.error('Error verifying agent:', error);
    return NextResponse.json(
      { error: `Gagal memverifikasi agen: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
