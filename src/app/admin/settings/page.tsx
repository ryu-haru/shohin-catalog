'use client';
import { useState, useEffect } from 'react';

interface SiteSettings {
  siteTitle: string;
  heroHeadline: string;
  heroSubtext: string;
  footerText: string;
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SiteSettings>({
    siteTitle: '',
    heroHeadline: '',
    heroSubtext: '',
    footerText: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setForm);
  }, []);

  const handleChange = (key: keyof SiteSettings, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: keyof SiteSettings; label: string; hint: string; multiline?: boolean }[] = [
    { key: 'siteTitle', label: 'サイトタイトル', hint: 'ヘッダーとタブに表示される名前' },
    { key: 'heroHeadline', label: 'トップ見出し', hint: 'ホームページのメインキャッチコピー', multiline: true },
    { key: 'heroSubtext', label: 'トップ説明文', hint: '見出し下のサブテキスト', multiline: true },
    { key: 'footerText', label: 'フッターテキスト', hint: 'ページ最下部のテキスト' },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">サイト設定</h1>
          <p className="text-sm text-slate-500 mt-1">HPのタイトルや見出しを編集できます</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg disabled:opacity-50"
        >
          {saving ? '保存中…' : saved ? '✓ 保存しました' : '保存する'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {fields.map((f, i) => (
          <div key={f.key} className={`p-6 ${i < fields.length - 1 ? 'border-b border-slate-100' : ''}`}>
            <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
            <p className="text-xs text-slate-400 mb-3">{f.hint}</p>
            {f.multiline ? (
              <textarea
                value={form[f.key]}
                onChange={e => handleChange(f.key, e.target.value)}
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400 resize-none"
              />
            ) : (
              <input
                type="text"
                value={form[f.key]}
                onChange={e => handleChange(f.key, e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-xs text-slate-500 font-medium mb-3">プレビュー</p>
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Service Catalog</p>
          <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mb-3 whitespace-pre-line">{form.heroHeadline || '（未入力）'}</h2>
          <p className="text-sm text-slate-500">{form.heroSubtext || '（未入力）'}</p>
        </div>
      </div>
    </div>
  );
}
