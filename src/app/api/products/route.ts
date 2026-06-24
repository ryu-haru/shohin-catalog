import { NextRequest, NextResponse } from 'next/server';
import { db, Product } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');

  if (categoryId) return NextResponse.json(await db.products.getByCategory(categoryId));
  return NextResponse.json(await db.products.getAll());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, categoryId } = body;

  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });
  if (!categoryId) return NextResponse.json({ error: 'categoryId is required' }, { status: 400 });

  const id = name
    .toLowerCase()
    .replace(/[^\w]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Date.now().toString(36);

  const all = await db.products.getAll();
  const now = new Date().toISOString();

  const product: Product = {
    id,
    categoryId,
    name,
    tagline: body.tagline || '',
    description: body.description || '',
    images: body.images || [],
    features: body.features || [],
    details: body.details || [],
    order: body.order ?? (all.filter(p => p.categoryId === categoryId).length + 1),
    isActive: body.isActive !== undefined ? body.isActive : true,
    createdAt: now,
    updatedAt: now,
  };

  return NextResponse.json(await db.products.create(product), { status: 201 });
}
