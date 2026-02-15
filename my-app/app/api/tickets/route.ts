import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Generate ticket number: TKT-YYYYMMDD-XXX
async function generateTicketNo(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `TKT-${dateStr}-`;
  
  // Find the last ticket of today
  const lastTicket = await prisma.ticket.findFirst({
    where: {
      ticketNo: {
        startsWith: prefix,
      },
    },
    orderBy: {
      ticketNo: 'desc',
    },
  });

  let nextNum = 1;
  if (lastTicket) {
    const lastNum = parseInt(lastTicket.ticketNo.split('-').pop() || '0', 10);
    nextNum = lastNum + 1;
  }

  return `${prefix}${nextNum.toString().padStart(3, '0')}`;
}

// Check if error is a Prisma unique constraint violation
function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2002'
  );
}

// GET /api/tickets - List user's tickets
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: { userEmail: string; status?: string } = {
      userEmail: session.user.email,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            sender: true,
            message: true,
            createdAt: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

// POST /api/tickets - Create new ticket
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, category, priority, message } = body;

    if (!subject || !category || !message) {
      return NextResponse.json(
        { error: 'Subject, category, and message are required' },
        { status: 400 }
      );
    }

    // Server-side validation
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (trimmedSubject.length > 100) {
      return NextResponse.json(
        { error: 'Subject must be 100 characters or less' },
        { status: 400 }
      );
    }

    if (trimmedMessage.length < 20) {
      return NextResponse.json(
        { error: 'Message must be at least 20 characters' },
        { status: 400 }
      );
    }

    // Retry logic to handle race condition on ticket number
    const MAX_RETRIES = 3;
    let ticket = null;
    let lastError: unknown = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const ticketNo = await generateTicketNo();

        ticket = await prisma.ticket.create({
          data: {
            ticketNo,
            userEmail: session.user.email,
            subject: trimmedSubject,
            category,
            priority: priority || 'normal',
            status: 'waiting_admin',
            messages: {
              create: {
                sender: 'user',
                senderEmail: session.user.email,
                message: trimmedMessage,
              },
            },
          },
          include: {
            messages: true,
          },
        });

        break; // Success, exit loop
      } catch (error) {
        lastError = error;
        if (isUniqueConstraintError(error) && attempt < MAX_RETRIES - 1) {
          // Retry on unique constraint violation
          continue;
        }
        throw error;
      }
    }

    if (!ticket) {
      throw lastError || new Error('Failed to create ticket');
    }

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
