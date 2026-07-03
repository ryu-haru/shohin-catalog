import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

// ── File helpers (development) ─────────────────────────────────────────────

function readFile<T>(filename: string, fallback: T): T {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  } catch {
    return fallback;
  }
}

function writeFile<T>(filename: string, data: T): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

// ── Blob helpers (production) ──────────────────────────────────────────────

async function readBlob<T>(key: string, fallback: T): Promise<T> {
  const { head, put } = await import('@vercel/blob');
  const pathname = `data/${key}.json`;
  let meta;
  try {
    meta = await head(pathname);
  } catch {
    await put(pathname, JSON.stringify(fallback), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      cacheControlMaxAge: 60,
    });
    return fallback;
  }
  // Blob URLs are served through a CDN that keeps serving the old file for a
  // while after an overwrite, so bust the cache key using the blob's own etag.
  const bustUrl = `${meta.url}?v=${meta.etag.replace(/"/g, '')}`;
  const res = await fetch(bustUrl, { cache: 'no-store' });
  if (!res.ok) return fallback;
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

async function writeBlob<T>(key: string, data: T): Promise<void> {
  const { put } = await import('@vercel/blob');
  await put(`data/${key}.json`, JSON.stringify(data), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });
}

// ── Unified storage ────────────────────────────────────────────────────────

async function readJson<T>(key: string, fallback: T): Promise<T> {
  if (USE_BLOB) return readBlob(key, readFile<T>(key + '.json', fallback));
  return readFile(key + '.json', fallback);
}

async function writeJson<T>(key: string, data: T): Promise<void> {
  if (USE_BLOB) return writeBlob(key, data);
  writeFile(key + '.json', data);
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  createdAt: string;
}

export interface DetailItem {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  tagline: string;
  description: string;
  images: string[];
  features: string[];
  details: DetailItem[];
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  siteTitle: string;
  heroHeadline: string;
  heroSubtext: string;
  footerText: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteTitle: 'SYS サービスカタログ',
  heroHeadline: '暮らしをもっとお得に、便利に。',
  heroSubtext: '光回線・ウォーターサーバー・電力など、生活に役立つサービスをご案内します。',
  footerText: '© 2026 SYS株式会社',
};

// ── DB ─────────────────────────────────────────────────────────────────────

export const db = {
  categories: {
    getAll: async (): Promise<Category[]> =>
      (await readJson<Category[]>('categories', [])).sort((a, b) => a.order - b.order),
    getById: async (id: string): Promise<Category | undefined> =>
      (await readJson<Category[]>('categories', [])).find(c => c.id === id),
    create: async (cat: Category): Promise<Category> => {
      const cats = await readJson<Category[]>('categories', []);
      cats.push(cat);
      await writeJson('categories', cats);
      return cat;
    },
    update: async (id: string, data: Partial<Category>): Promise<Category | null> => {
      const cats = await readJson<Category[]>('categories', []);
      const idx = cats.findIndex(c => c.id === id);
      if (idx === -1) return null;
      cats[idx] = { ...cats[idx], ...data };
      await writeJson('categories', cats);
      return cats[idx];
    },
    delete: async (id: string): Promise<void> => {
      const cats = await readJson<Category[]>('categories', []);
      await writeJson('categories', cats.filter(c => c.id !== id));
    },
  },
  products: {
    getAll: async (): Promise<Product[]> =>
      (await readJson<Product[]>('products', [])).sort((a, b) => a.order - b.order),
    getByCategory: async (categoryId: string): Promise<Product[]> =>
      (await readJson<Product[]>('products', []))
        .filter(p => p.categoryId === categoryId && p.isActive)
        .sort((a, b) => a.order - b.order),
    getById: async (id: string): Promise<Product | undefined> =>
      (await readJson<Product[]>('products', [])).find(p => p.id === id),
    create: async (product: Product): Promise<Product> => {
      const products = await readJson<Product[]>('products', []);
      products.push(product);
      await writeJson('products', products);
      return product;
    },
    update: async (id: string, data: Partial<Product>): Promise<Product | null> => {
      const products = await readJson<Product[]>('products', []);
      const idx = products.findIndex(p => p.id === id);
      if (idx === -1) return null;
      products[idx] = { ...products[idx], ...data, updatedAt: new Date().toISOString() };
      await writeJson('products', products);
      return products[idx];
    },
    delete: async (id: string): Promise<void> => {
      const products = await readJson<Product[]>('products', []);
      await writeJson('products', products.filter(p => p.id !== id));
    },
  },
  settings: {
    get: async (): Promise<SiteSettings> =>
      readJson<SiteSettings>('settings', DEFAULT_SETTINGS),
    save: async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
      const current = await readJson<SiteSettings>('settings', DEFAULT_SETTINGS);
      const updated = { ...current, ...data };
      await writeJson('settings', updated);
      return updated;
    },
  },
};
