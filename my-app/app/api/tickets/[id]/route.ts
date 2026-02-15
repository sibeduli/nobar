import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/tickets/[id] - Get ticket details with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        userEmail: session.user.email,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

// PATCH /api/tickets/[id] - Update ticket status (user can resolve their own ticket)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Users can only set status to 'resolved'
    if (status !== 'resolved') {
      return NextResponse.json(
        { error: 'Invalid status. Users can only resolve tickets.' },
        { status: 400 }
      );
    }

    // Verify ticket belongs to user
    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        userEmail: session.user.email,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check if ticket is already closed
    if (ticket.status === 'closed' || ticket.status === 'resolved') {
      return NextResponse.json(
        { error: 'Ticket is already closed' },
        { status: 400 }
      );
    }

    // Update ticket status
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: 'resolved',
      },
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}
