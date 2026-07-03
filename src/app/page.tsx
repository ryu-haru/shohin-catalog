import Link from 'next/link';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categories, products, settings] = await Promise.all([
    db.categories.getAll(),
    db.products.getAll(),
    db.settings.get(),
  ]);

  const activeProducts = products.filter(p => p.isActive);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>

      {/* Announcement Bar */}
      <div style={{
        background: '#111', color: '#fff', textAlign: 'center',
        padding: '9px 24px', fontSize: 11, letterSpacing: '0.12em', lineHeight: 1,
      }}>
        全プランご相談・お見積もり無料でご案内しています
      </div>

      {/* Header */}
      <header style={{
        background: '#fff', borderBottom: '1px solid #E5E5E5',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 40px',
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#111', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {settings.siteTitle}
            </span>
          </Link>
          <nav style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
            {categories.map(cat => (
              <Link key={cat.id} href={`/category/${cat.id}`}
                style={{ fontSize: 11, color: '#333', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {cat.name}
              </Link>
            ))}
          </nav>
          <Link href="/admin" style={{ fontSize: 11, color: '#999', textDecoration: 'none', letterSpacing: '0.1em' }}>
            ADMIN
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        background: '#F5F1EB', minHeight: '62vh',
        display: 'flex', alignItems: 'center', overflow: 'hidden',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '80px 40px',
          width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center',
        }}>
          {/* Text */}
          <div>
            <p style={{ margin: '0 0 20px', fontSize: 10, letterSpacing: '0.3em', color: '#999', textTransform: 'uppercase' }}>
              Service Catalog
            </p>
            <h1 style={{
              margin: '0 0 24px', fontSize: 'clamp(32px, 4.5vw, 60px)',
              fontWeight: 800, color: '#111', lineHeight: 1.18, letterSpacing: '-0.02em',
            }}>
              {settings.heroHeadline}
            </h1>
            <p style={{ margin: '0 0 44px', fontSize: 14, color: '#666', lineHeight: 1.9, maxWidth: 380 }}>
              {settings.heroSubtext}
            </p>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {categories.filter(c => activeProducts.some(p => p.categoryId === c.id)).slice(0, 2).map(cat => (
                <Link key={cat.id} href={`/category/${cat.id}`} style={{
                  textDecoration: 'none', fontSize: 11, letterSpacing: '0.15em',
                  color: '#111', textTransform: 'uppercase',
                  borderBottom: '1px solid #111', paddingBottom: 3,
                }}>
                  {cat.name}を見る
                </Link>
              ))}
            </div>
          </div>

          {/* Editorial Visual */}
          <div style={{ display: 'flex', gap: 3, height: 420 }}>
            {categories.slice(0, 3).map((cat, i) => (
              <Link key={cat.id} href={`/category/${cat.id}`} style={{
                flex: i === 0 ? 1.6 : 1, textDecoration: 'none',
                background: i === 0
                  ? `linear-gradient(150deg, ${cat.color}28 0%, ${cat.color}50 100%)`
                  : i === 1
                    ? `linear-gradient(150deg, ${cat.color}18 0%, ${cat.color}38 100%)`
                    : 'linear-gradient(150deg, #E8E4DF 0%, #D8D3CC 100%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                padding: 20, position: 'relative', overflow: 'hidden',
              }}>
                <span style={{
                  position: 'absolute', top: '42%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: i === 0 ? 80 : 60, opacity: 0.2, lineHeight: 1,
                }}>
                  {cat.icon}
                </span>
                <p style={{ margin: '0 0 2px', fontSize: 9, letterSpacing: '0.2em', color: '#555', textTransform: 'uppercase' }}>
                  {activeProducts.filter(p => p.categoryId === cat.id).length} Plans
                </p>
                <p style={{ margin: 0, fontSize: i === 0 ? 14 : 12, fontWeight: 600, color: '#222', letterSpacing: '0.04em' }}>
                  {cat.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New In – Products */}
      {activeProducts.length > 0 && (
        <section style={{ padding: '72px 40px', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 36 }}>
            <h2 style={{ margin: 0, fontSize: 11, fontWeight: 400, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#111' }}>
              サービス一覧
            </h2>
            <span style={{ fontSize: 11, letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase' }}>
              {activeProducts.length} プラン
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(activeProducts.length, 4)}, 1fr)`,
            gap: 2,
          }}>
            {activeProducts.slice(0, 4).map(product => {
              const cat = categories.find(c => c.id === product.categoryId);
              return (
                <Link key={product.id} href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{
                    aspectRatio: '3/4',
                    background: cat
                      ? `linear-gradient(145deg, ${cat.color}14 0%, ${cat.color}32 100%)`
                      : '#F5F5F5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 56, marginBottom: 14,
                    transition: 'opacity 0.2s',
                  }}>
                    <span style={{ opacity: 0.35 }}>{cat?.icon || '📦'}</span>
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: 10, color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {cat?.name}
                  </p>
                  <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#111', letterSpacing: '0.01em' }}>
                    {product.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{product.tagline}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Editorial 3-Panel */}
      {categories.length >= 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', height: 440 }}>
          {categories.slice(0, 3).map((cat, i) => {
            const count = activeProducts.filter(p => p.categoryId === cat.id).length;
            const bgs = [
              `linear-gradient(155deg, #cdd9cc 0%, #a8c0a4 100%)`,
              `linear-gradient(155deg, #d9cfc4 0%, #c0b09a 100%)`,
              `linear-gradient(155deg, #d0d4d9 0%, #aab4c0 100%)`,
            ];
            return (
              <Link key={cat.id} href={`/category/${cat.id}`} style={{
                textDecoration: 'none', display: 'flex', flexDirection: 'column',
                justifyContent: 'flex-end', padding: 36,
                background: bgs[i % bgs.length], position: 'relative', overflow: 'hidden',
              }}>
                <span style={{
                  position: 'absolute', top: '50%', right: 32,
                  transform: 'translateY(-60%)',
                  fontSize: 100, opacity: 0.18, lineHeight: 1,
                }}>
                  {cat.icon}
                </span>
                <p style={{ margin: '0 0 6px', fontSize: 9, letterSpacing: '0.25em', color: 'rgba(30,30,30,0.6)', textTransform: 'uppercase' }}>
                  {count} PLANS
                </p>
                <h3 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 700, color: '#1a1a1a', letterSpacing: '0.02em' }}>
                  {cat.name}
                </h3>
                <span style={{ fontSize: 10, letterSpacing: '0.18em', color: '#333', textTransform: 'uppercase', borderBottom: '1px solid #444', paddingBottom: 2, display: 'inline-block' }}>
                  詳しく見る
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Shop by Category */}
      <section style={{ padding: '80px 40px', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        <h2 style={{ margin: '0 0 44px', fontSize: 11, fontWeight: 400, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#111' }}>
          カテゴリから選ぶ
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(categories.length, 4)}, 1fr)`,
          gap: 2,
        }}>
          {categories.map(cat => {
            const count = activeProducts.filter(p => p.categoryId === cat.id).length;
            return (
              <Link key={cat.id} href={`/category/${cat.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  aspectRatio: '4/5',
                  background: `linear-gradient(160deg, ${cat.color}18 0%, ${cat.color}38 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', marginBottom: 14,
                }}>
                  <span style={{ fontSize: 72, opacity: 0.25 }}>{cat.icon}</span>
                </div>
                <p style={{ margin: '0 0 3px', fontSize: 12, fontWeight: 700, color: '#111', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {cat.name}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: '#aaa', letterSpacing: '0.04em' }}>
                  {count} プラン
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #E5E5E5', background: '#FAFAF8', padding: '64px 40px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 56 }}>
            <div>
              <p style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 800, color: '#111', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {settings.siteTitle}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: '#888', lineHeight: 1.9 }}>
                暮らしに役立つサービスを<br />わかりやすくご提案します。
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 20px', fontSize: 10, letterSpacing: '0.2em', color: '#aaa', textTransform: 'uppercase' }}>サービス</p>
              {categories.map(cat => (
                <Link key={cat.id} href={`/category/${cat.id}`}
                  style={{ display: 'block', margin: '0 0 10px', fontSize: 12, color: '#555', textDecoration: 'none' }}>
                  {cat.name}
                </Link>
              ))}
            </div>
            <div>
              <p style={{ margin: '0 0 20px', fontSize: 10, letterSpacing: '0.2em', color: '#aaa', textTransform: 'uppercase' }}>サポート</p>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: '#555' }}>お問い合わせ</p>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: '#555' }}>よくある質問</p>
            </div>
            <div>
              <p style={{ margin: '0 0 20px', fontSize: 10, letterSpacing: '0.2em', color: '#aaa', textTransform: 'uppercase' }}>管理</p>
              <Link href="/admin" style={{ display: 'block', margin: '0 0 10px', fontSize: 12, color: '#555', textDecoration: 'none' }}>
                管理画面
              </Link>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #E5E5E5', paddingTop: 28 }}>
            <p style={{ margin: 0, fontSize: 11, color: '#bbb', letterSpacing: '0.05em' }}>{settings.footerText}</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
