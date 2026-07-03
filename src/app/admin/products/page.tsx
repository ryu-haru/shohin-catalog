'use client';

import { useState, useEffect } from 'react';
import type { Product, Category, DetailItem } from '@/lib/db';

const emptyForm = {
  name: '', categoryId: '', tagline: '', description: '',
  images: [] as string[], features: [''], details: [{ key: '', value: '' }] as DetailItem[],
  order: 1, isActive: true,
};

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'details'>('basic');

  const load = async () => {
    const [p, c] = await Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]);
    setProducts(p); setCategories(c); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({ ...emptyForm, categoryId: filterCat || categories[0]?.id || '', order: products.length + 1 });
    setEditTarget(null);
    setActiveTab('basic');
    setDrawerOpen(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, categoryId: p.categoryId, tagline: p.tagline, description: p.description,
      images: [...p.images],
      features: p.features.length ? [...p.features] : [''],
      details: p.details.length ? [...p.details] : [{ key: '', value: '' }],
      order: p.order, isActive: p.isActive,
    });
    setEditTarget(p);
    setActiveTab('basic');
    setDrawerOpen(true);
  };

  const closeDrawer = () => { setDrawerOpen(false); setEditTarget(null); };

  const save = async () => {
    if (!form.name.trim()) return alert('商材名を入力してください');
    if (!form.categoryId) return alert('カテゴリを選択してください');
    setSaving(true);
    const payload = {
      ...form,
      features: form.features.filter(f => f.trim()),
      details: form.details.filter(d => d.key.trim()),
    };
    const res = editTarget
      ? await fetch(`/api/products/${editTarget.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const saved: Product = await res.json();
    setProducts(prev => (editTarget ? prev.map(p => p.id === saved.id ? saved : p) : [...prev, saved]).sort((a, b) => a.order - b.order));
    setSaving(false);
    closeDrawer();
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleActive = async (p: Product) => {
    const res = await fetch(`/api/products/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !p.isActive }) });
    const updated: Product = await res.json();
    setProducts(prev => prev.map(x => x.id === updated.id ? updated : x));
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setUploadError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setForm(f => ({ ...f, images: [...f.images, data.url] }));
      } else {
        setUploadError(data.error || data.detail || '不明なエラー');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('通信エラー。もう一度試してください。');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) uploadImage(file);
  };

  const filteredProducts = filterCat ? products.filter(p => p.categoryId === filterCat) : products;

  if (loading) return <div style={{ color: '#9CA3AF', padding: 32, textAlign: 'center' }}>読み込み中...</div>;

  return (
    <div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>商材管理</h1>
        <button onClick={openAdd} style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18 }}>+</span> 商材を追加
        </button>
      </div>

      {/* Category filter tabs */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          <button onClick={() => setFilterCat('')}
            style={{ padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: !filterCat ? '#111827' : '#F3F4F6', color: !filterCat ? '#fff' : '#6B7280' }}>
            すべて ({products.length})
          </button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setFilterCat(c.id)}
              style={{ padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: filterCat === c.id ? c.color : '#F3F4F6', color: filterCat === c.id ? '#fff' : '#6B7280' }}>
              {c.icon} {c.name} ({products.filter(p => p.categoryId === c.id).length})
            </button>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '60px 0', textAlign: 'center', color: '#9CA3AF' }}>
          <p style={{ marginBottom: 16 }}>商材がありません</p>
          <button onClick={openAdd} style={{ color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>最初の商材を追加する</button>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          {filteredProducts.map((p, idx) => {
            const cat = categories.find(c => c.id === p.categoryId);
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderTop: idx > 0 ? '1px solid #F3F4F6' : undefined, gap: 14 }}>
                {/* Thumbnail */}
                <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', background: cat ? cat.color + '15' : '#F3F4F6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E5E7EB' }}>
                  {p.images.length > 0
                    ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 26 }}>{cat?.icon || '📦'}</span>
                  }
                </div>
                {/* Name + cat */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: 15 }}>{p.name}</p>
                    {cat && (
                      <span style={{ background: cat.color, color: '#fff', borderRadius: 12, padding: '2px 8px', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                        {cat.icon} {cat.name}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.tagline || '—'}</p>
                </div>
                {/* Active toggle */}
                <button onClick={() => toggleActive(p)}
                  style={{ padding: '5px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: p.isActive ? '#DCFCE7' : '#F3F4F6', color: p.isActive ? '#16A34A' : '#6B7280', flexShrink: 0 }}>
                  {p.isActive ? '公開中' : '非公開'}
                </button>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => openEdit(p)}
                    style={{ background: '#F3F4F6', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer', color: '#374151', fontWeight: 500 }}>
                    編集
                  </button>
                  <button onClick={() => remove(p.id, p.name)}
                    style={{ background: '#FEF2F2', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer', color: '#DC2626', fontWeight: 500 }}>
                    削除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={closeDrawer} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'relative', zIndex: 1, width: 520, height: '100%', background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>{editTarget ? '商材を編集' : '商材を追加'}</h2>
              <button onClick={closeDrawer} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 20, padding: 4 }}>✕</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', background: '#F8FAFC', position: 'sticky', top: 61, zIndex: 1 }}>
              {(['basic', 'images', 'details'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ flex: 1, padding: '12px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: activeTab === tab ? '#111827' : '#6B7280', borderBottom: activeTab === tab ? '2px solid #111827' : '2px solid transparent' }}>
                  {tab === 'basic' ? '基本情報' : tab === 'images' ? '画像' : '詳細情報'}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Basic tab */}
              {activeTab === 'basic' && (
                <>
                  <div>
                    <label style={labelStyle}>商材名 <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="例: au光" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>カテゴリ <span style={{ color: '#EF4444' }}>*</span></label>
                    <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} style={inputStyle}>
                      <option value="">-- カテゴリを選択 --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>キャッチコピー</label>
                    <input type="text" value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                      placeholder="例: 最大10Gbps！安定した高速光回線" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>説明文</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={5} placeholder="プランの説明を入力..."
                      style={{ ...inputStyle, resize: 'vertical' as const }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ ...labelStyle, margin: 0 }}>特長・メリット</label>
                      <button onClick={() => setForm(f => ({ ...f, features: [...f.features, ''] }))}
                        style={{ fontSize: 12, color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ 追加</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {form.features.map((feat, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ color: '#10B981', fontWeight: 800 }}>✓</span>
                          <input type="text" value={feat} onChange={e => setForm(f => ({ ...f, features: f.features.map((x, j) => j === i ? e.target.value : x) }))}
                            placeholder={`特長 ${i + 1}`} style={{ flex: 1, border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none' }} />
                          <button onClick={() => setForm(f => ({ ...f, features: f.features.filter((_, j) => j !== i) }))}
                            style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 16, padding: 4 }}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div>
                      <label style={labelStyle}>表示順</label>
                      <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                        style={{ width: 80, border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none' }} />
                    </div>
                    <div>
                      <label style={labelStyle}>公開設定</label>
                      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                        <button onClick={() => setForm(f => ({ ...f, isActive: true }))}
                          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: form.isActive ? '#DCFCE7' : '#F3F4F6', color: form.isActive ? '#16A34A' : '#6B7280' }}>
                          公開
                        </button>
                        <button onClick={() => setForm(f => ({ ...f, isActive: false }))}
                          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: !form.isActive ? '#FEE2E2' : '#F3F4F6', color: !form.isActive ? '#DC2626' : '#6B7280' }}>
                          非公開
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Images tab */}
              {activeTab === 'images' && (
                <>
                  <label
                    htmlFor="img-upload"
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      border: `2px dashed ${uploadError ? '#EF4444' : '#D1D5DB'}`,
                      borderRadius: 12, padding: '32px 16px', width: '100%', boxSizing: 'border-box' as const,
                      cursor: uploading ? 'default' : 'pointer',
                      color: '#9CA3AF', fontSize: 14,
                      opacity: uploading ? 0.7 : 1,
                      userSelect: 'none' as const,
                    }}
                  >
                    <input
                      id="img-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                      style={{ position: 'fixed', left: '-9999px', top: '-9999px', width: 1, height: 1 }}
                    />
                    <span style={{ fontSize: 36 }}>{uploading ? '⏳' : '🖼️'}</span>
                    <span style={{ fontWeight: 600, color: '#374151' }}>{uploading ? 'アップロード中...' : 'クリックして画像を追加'}</span>
                    <span style={{ fontSize: 12 }}>JPG・PNG・WebP・GIF、最大10MB</span>
                  </label>
                  {uploadError && (
                    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', color: '#DC2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>⚠️</span> {uploadError}
                    </div>
                  )}
                  {form.images.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {form.images.map((img, i) => (
                        <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: '#F3F4F6' }}>
                          <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                            style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            ✕
                          </button>
                          {i === 0 && (
                            <span style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>メイン</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', margin: 0 }}>画像がまだありません</p>
                  )}
                </>
              )}

              {/* Details tab */}
              {activeTab === 'details' && (
                <>
                  <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>商材詳細の表に表示される項目を設定します。</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {form.details.map((d, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="text" value={d.key} onChange={e => setForm(f => ({ ...f, details: f.details.map((x, j) => j === i ? { ...x, key: e.target.value } : x) }))}
                          placeholder="項目名（例: 月額料金）" style={{ width: 160, border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none', flexShrink: 0 }} />
                        <input type="text" value={d.value} onChange={e => setForm(f => ({ ...f, details: f.details.map((x, j) => j === i ? { ...x, value: e.target.value } : x) }))}
                          placeholder="内容（例: 5,610円〜）" style={{ flex: 1, border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none' }} />
                        <button onClick={() => setForm(f => ({ ...f, details: f.details.filter((_, j) => j !== i) }))}
                          style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 16, padding: 4 }}>✕</button>
                      </div>
                    ))}
                    <button onClick={() => setForm(f => ({ ...f, details: [...f.details, { key: '', value: '' }] }))}
                      style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: 13, color: '#374151', cursor: 'pointer', fontWeight: 600, marginTop: 4 }}>
                      + 項目を追加
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Drawer footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 10, position: 'sticky', bottom: 0, background: '#fff' }}>
              <button onClick={save} disabled={saving}
                style={{ flex: 1, background: '#111827', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? '保存中...' : '保存する'}
              </button>
              <button onClick={closeDrawer}
                style={{ flex: 1, background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
