import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const worldSettingsId = searchParams.get('worldSettingsId');
    
    if (!worldSettingsId) {
      return NextResponse.json({ error: 'World Settings ID required' }, { status: 400 });
    }
    
    const locations = await prisma.location.findMany({
      where: { worldSettingsId },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(locations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const location = await prisma.location.create({
      data
    });
    
    return NextResponse.json(location);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    
    const location = await prisma.location.update({
      where: { id },
      data
    });
    
    return NextResponse.json(location);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Location ID required' }, { status: 400 });
    }
    
    await prisma.location.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
  }
}
