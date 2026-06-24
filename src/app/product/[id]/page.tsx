import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import ImageGallery from '@/components/ImageGallery';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.products.getById(id);
  if (!product) notFound();
  const category = await db.categories.getById(product.categoryId);

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
        <nav style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 48, fontSize: 12, color: '#999' }}>
          <Link href="/" style={{ color: '#999', textDecoration: 'none' }}>HOME</Link>
          <span>/</span>
          {category && <Link href={`/category/${category.id}`} style={{ color: '#999', textDecoration: 'none' }}>{category.name.toUpperCase()}</Link>}
          {category && <span>/</span>}
          <span style={{ color: '#111' }}>{product.name.toUpperCase()}</span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            {product.images.length > 0 ? (
              <ImageGallery images={product.images} fallbackIcon={category?.icon || '📦'} fallbackColor={category?.color || '#999'} />
            ) : (
              <div style={{ aspectRatio: '4/5', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 80, opacity: 0.15 }}>{category?.icon || '📦'}</span>
              </div>
            )}
          </div>

          <div style={{ paddingTop: 8 }}>
            {category && (
              <p style={{ margin: '0 0 12px', fontSize: 10, letterSpacing: '0.2em', color: '#999', textTransform: 'uppercase' }}>{category.name}</p>
            )}
            <h1 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: '#111', margin: '0 0 16px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{product.name}</h1>
            {product.tagline && (
              <p style={{ fontSize: 14, color: '#555', margin: '0 0 24px', lineHeight: 1.7, borderLeft: '2px solid #111', paddingLeft: 14 }}>{product.tagline}</p>
            )}
            {product.description && (
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.9, margin: '0 0 32px' }}>{product.description}</p>
            )}

            {product.details.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontSize: 10, letterSpacing: '0.2em', color: '#999', textTransform: 'uppercase', marginBottom: 12 }}>Details</p>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {product.details.map((d, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #E5E5E5' }}>
                        <td style={{ padding: '10px 0', fontSize: 12, color: '#999', width: '45%', verticalAlign: 'top' }}>{d.key}</td>
                        <td style={{ padding: '10px 0', fontSize: 13, color: '#111', fontWeight: 600 }}>{d.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {product.features.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <p style={{ fontSize: 10, letterSpacing: '0.2em', color: '#999', textTransform: 'uppercase', marginBottom: 12 }}>Features</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {product.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', gap: 12, fontSize: 13, color: '#333', alignItems: 'flex-start' }}>
                      <span style={{ color: '#111', fontSize: 10, marginTop: 4, flexShrink: 0 }}>—</span>
                      <span style={{ lineHeight: 1.6 }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link href={`/category/${product.categoryId}`} style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: '#111',
              color: '#fff',
              textDecoration: 'none',
              fontSize: 13,
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}>
              ← カテゴリに戻る
            </Link>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid #E5E5E5', padding: '24px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 12, color: '#999' }}>© 2026 SYS株式会社</p>
      </footer>
    </div>
  );
}
