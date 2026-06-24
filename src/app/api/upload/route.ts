import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: `ファイル形式が非対応です (${file.type})` }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    if (USE_BLOB) {
      const { put } = await import('@vercel/blob');
      const blob = await put(`uploads/${filename}`, file, { access: 'public' });
      return NextResponse.json({ url: blob.url, filename });
    }

    // ── Local filesystem (development) ──
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(bytes));
    return NextResponse.json({ url: `/uploads/${filename}`, filename });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[upload] error:', msg);
    return NextResponse.json({ error: 'Upload failed', detail: msg }, { status: 500 });
  }
}
