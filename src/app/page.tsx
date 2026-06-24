import Link from 'next/link';
import { db } from '@/lib/db';
import CategoryCard from '@/components/CategoryCard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categories, products, settings] = await Promise.all([
    db.categories.getAll(),
    db.products.getAll(),
    db.settings.get(),
  ]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #E5E5E5', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '0.05em' }}>{settings.siteTitle}</span>
          </Link>
          <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <Link href="/admin" style={{ fontSize: 12, color: '#888', textDecoration: 'none', letterSpacing: '0.08em' }}>ADMIN</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '80px 24px 64px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', color: '#999', marginBottom: 20, textTransform: 'uppercase' }}>Service Catalog</p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, color: '#111', lineHeight: 1.2, margin: '0 0 20px', letterSpacing: '-0.02em', whiteSpace: 'pre-line' }}>
          {settings.heroHeadline}
        </h1>
        <p style={{ fontSize: 15, color: '#666', maxWidth: 480, lineHeight: 1.8, margin: 0 }}>
          {settings.heroSubtext}
        </p>
      </section>

      {/* Categories */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px', flex: 1, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.2em', color: '#999', textTransform: 'uppercase' }}>Category</span>
          <div style={{ flex: 1, height: 1, background: '#E5E5E5' }} />
        </div>
        {categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
            <p style={{ marginBottom: 16 }}>カテゴリがありません</p>
            <Link href="/admin/categories" style={{ color: '#111', fontSize: 13 }}>管理画面でカテゴリを追加する →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
            {categories.map((cat) => {
              const count = products.filter(p => p.categoryId === cat.id && p.isActive).length;
              return <CategoryCard key={cat.id} cat={cat} count={count} />;
            })}
          </div>
        )}
      </main>

      <footer style={{ borderTop: '1px solid #E5E5E5', padding: '24px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 12, color: '#999', letterSpacing: '0.05em' }}>{settings.footerText}</p>
      </footer>
    </div>
  );
}
