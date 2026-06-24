import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  return NextResponse.json(await db.settings.get());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = await db.settings.save(body);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
