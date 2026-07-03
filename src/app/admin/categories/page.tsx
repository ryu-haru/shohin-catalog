'use client';

import { useState, useEffect } from 'react';
import type { Category } from '@/lib/db';

const COLORS = [
  '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#F97316', '#6366F1', '#14B8A6',
];
const ICONS = ['📶', '💧', '⚡', '📦', '🏠', '🚗', '💻', '📱', '🔥', '❄️', '🌿', '💰', '🎯', '📡', '🛡️', '🎪', '🎓', '🚿', '🛁', '📺'];

const empty = { name: '', description: '', icon: '📦', color: '#3B82F6', order: 1 };

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch('/api/categories').then(r => r.json()).then(d => { setCategories(d); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({ ...empty, order: categories.length + 1 });
    setEditTarget(null);
    setDrawerOpen(true);
  };

  const openEdit = (cat: Category) => {
    setForm({ name: cat.name, description: cat.description, icon: cat.icon, color: cat.color, order: cat.order });
    setEditTarget(cat);
    setDrawerOpen(true);
  };

  const closeDrawer = () => { setDrawerOpen(false); setEditTarget(null); };

  const save = async () => {
    if (!form.name.trim()) return alert('カテゴリ名を入力してください');
    setSaving(true);
    const res = editTarget
      ? await fetch(`/api/categories/${editTarget.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      : await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const saved: Category = await res.json();
    setCategories(prev => (editTarget ? prev.map(c => c.id === saved.id ? saved : c) : [...prev, saved]).sort((a, b) => a.order - b.order));
    setSaving(false);
    closeDrawer();
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const moveOrder = async (cat: Category, dir: -1 | 1) => {
    const res = await fetch(`/api/categories/${cat.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: cat.order + dir }) });
    const updated: Category = await res.json();
    setCategories(prev => prev.map(c => c.id === updated.id ? updated : c).sort((a, b) => a.order - b.order));
  };

  if (loading) return <div style={{ color: '#9CA3AF', padding: 32, textAlign: 'center' }}>読み込み中...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>カテゴリ管理</h1>
        <button onClick={openAdd} style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> カテゴリを追加
        </button>
      </div>

      {categories.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '60px 0', textAlign: 'center', color: '#9CA3AF' }}>
          <p style={{ marginBottom: 16 }}>カテゴリがありません</p>
          <button onClick={openAdd} style={{ color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>最初のカテゴリを追加する</button>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          {categories.map((cat, idx) => (
            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderTop: idx > 0 ? '1px solid #F3F4F6' : undefined, gap: 16 }}>
              {/* Color & Icon */}
              <div style={{ width: 44, height: 44, borderRadius: 10, background: cat.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2px solid ${cat.color}40` }}>
                <span style={{ fontSize: 24 }}>{cat.icon}</span>
              </div>
              {/* Name + desc */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontWeight: 700, color: '#111827', fontSize: 15 }}>{cat.name}</p>
                <p style={{ margin: 0, fontSize: 13, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.description || '説明なし'}</p>
              </div>
              {/* Color chip */}
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
              {/* Order controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button onClick={() => moveOrder(cat, -1)} disabled={idx === 0}
                  style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 4, width: 28, height: 22, cursor: 'pointer', color: '#6B7280', fontSize: 12, padding: 0, opacity: idx === 0 ? 0.3 : 1 }}>▲</button>
                <button onClick={() => moveOrder(cat, 1)} disabled={idx === categories.length - 1}
                  style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 4, width: 28, height: 22, cursor: 'pointer', color: '#6B7280', fontSize: 12, padding: 0, opacity: idx === categories.length - 1 ? 0.3 : 1 }}>▼</button>
              </div>
              {/* Actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEdit(cat)}
                  style={{ background: '#F3F4F6', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer', color: '#374151', fontWeight: 500 }}>
                  編集
                </button>
                <button onClick={() => remove(cat.id, cat.name)}
                  style={{ background: '#FEF2F2', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer', color: '#DC2626', fontWeight: 500 }}>
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer overlay */}
      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
          {/* Backdrop */}
          <div onClick={closeDrawer} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }} />
          {/* Panel */}
          <div style={{ position: 'relative', width: 420, height: '100%', background: '#fff', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>
                {editTarget ? 'カテゴリを編集' : 'カテゴリを追加'}
              </h2>
              <button onClick={closeDrawer} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 20, padding: 4, lineHeight: 1 }}>✕</button>
            </div>

            {/* Preview */}
            <div style={{ padding: '16px 24px', background: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>プレビュー</p>
              <div style={{ background: form.color, borderRadius: 12, padding: '16px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: 8, top: 8, fontSize: 40, opacity: 0.2 }}>{form.icon}</div>
                <div style={{ fontSize: 32, marginBottom: 6 }}>{form.icon}</div>
                <p style={{ color: '#fff', fontWeight: 800, fontSize: 16, margin: '0 0 4px', textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>{form.name || 'カテゴリ名'}</p>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, margin: 0 }}>{form.description || '説明文'}</p>
              </div>
            </div>

            {/* Form */}
            <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>カテゴリ名 <span style={{ color: '#EF4444' }}>*</span></label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="例: Wi-Fi・光回線"
                  style={{ width: '100%', border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>説明文</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="例: 各社の光回線プランを比較"
                  style={{ width: '100%', border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>アイコン（絵文字）</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {ICONS.map(icon => (
                    <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                      style={{ width: 40, height: 40, borderRadius: 8, fontSize: 20, border: form.icon === icon ? `2px solid ${form.color}` : '2px solid #E5E7EB', background: form.icon === icon ? form.color + '15' : '#F9FAFB', cursor: 'pointer', padding: 0 }}>
                      {icon}
                    </button>
                  ))}
                </div>
                <input type="text" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  placeholder="または絵文字を直接入力"
                  style={{ width: '100%', border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>カラー</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {COLORS.map(color => (
                    <button key={color} onClick={() => setForm(f => ({ ...f, color }))}
                      style={{ width: 32, height: 32, borderRadius: '50%', background: color, border: form.color === color ? '3px solid #111827' : '3px solid transparent', cursor: 'pointer', padding: 0, transition: 'transform 0.1s', transform: form.color === color ? 'scale(1.15)' : 'scale(1)' }}>
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    style={{ width: 44, height: 36, borderRadius: 8, border: '1.5px solid #D1D5DB', cursor: 'pointer', padding: 2 }} />
                  <span style={{ fontSize: 13, color: '#6B7280' }}>カスタムカラー</span>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{form.color}</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>表示順</label>
                <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                  style={{ width: 80, border: '1.5px solid #D1D5DB', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none' }} />
              </div>
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
