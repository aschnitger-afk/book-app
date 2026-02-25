import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { phase, completed } = await request.json();
    
    const updateData: any = {
      currentPhase: phase,
    };
    
    // Mark phase as completed
    switch (phase) {
      case 'concept':
        updateData.conceptCompleted = completed;
        break;
      case 'worldbuilding':
        updateData.worldbuildingCompleted = completed;
        break;
      case 'plotting':
        updateData.plottingCompleted = completed;
        break;
      case 'drafting':
        updateData.draftingCompleted = completed;
        break;
      case 'editing':
        updateData.editingCompleted = completed;
        break;
    }
    
    // If all phases complete, mark as ready for publishing
    if (completed && phase === 'editing') {
      updateData.status = 'publishing';
    }
    
    const book = await prisma.book.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json(book);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update phase' }, { status: 500 });
  }
}
