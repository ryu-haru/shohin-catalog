import { NextRequest, NextResponse } from 'next/server';
import { db, Category } from '@/lib/db';

export async function GET() {
  return NextResponse.json(await db.categories.getAll());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, icon, color, order } = body;

  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  const id = name
    .toLowerCase()
    .replace(/[^\w぀-鿿]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Date.now().toString(36);

  const all = await db.categories.getAll();
  const cat: Category = {
    id,
    name,
    description: description || '',
    icon: icon || '📦',
    color: color || '#6B7280',
    order: order ?? (all.length + 1),
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(await db.categories.create(cat), { status: 201 });
}
