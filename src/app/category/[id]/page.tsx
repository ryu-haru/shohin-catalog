import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [category, products] = await Promise.all([
    db.categories.getById(id),
    db.products.getByCategory(id),
  ]);
  if (!category) notFound();

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #E5E5E5', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '0.05em' }}>SYS サービスカタログ</span>
          </Link>
          <nav>
            <Link href="/admin" style={{ fontSize: 12, color: '#888', textDecoration: 'none', letterSpacing: '0.08em' }}>ADMIN</Link>
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
        <nav style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 40, fontSize: 12, color: '#999' }}>
          <Link href="/" style={{ color: '#999', textDecoration: 'none' }}>HOME</Link>
          <span>/</span>
          <span style={{ color: '#111' }}>{category.name.toUpperCase()}</span>
        </nav>

        <div style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid #E5E5E5' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', color: '#999', margin: '0 0 12px', textTransform: 'uppercase' }}>Category</p>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#111', margin: '0 0 12px', letterSpacing: '-0.02em' }}>{category.name}</h1>
          {category.description && <p style={{ fontSize: 14, color: '#666', margin: 0, lineHeight: 1.7 }}>{category.description}</p>}
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
            <p style={{ marginBottom: 16 }}>このカテゴリにプランがありません</p>
            <Link href="/admin/products" style={{ color: '#111', fontSize: 13 }}>管理画面でプランを追加する →</Link>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 24, letterSpacing: '0.05em' }}>{products.length} ITEMS</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} category={category} />
              ))}
            </div>
          </>
        )}
      </div>

      <footer style={{ borderTop: '1px solid #E5E5E5', padding: '24px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 12, color: '#999' }}>© 2026 SYS株式会社</p>
      </footer>
    </div>
  );
}
