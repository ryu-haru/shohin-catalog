import Link from 'next/link';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [categories, products] = await Promise.all([
    db.categories.getAll(),
    db.products.getAll(),
  ]);
  const activeProducts = products.filter(p => p.isActive);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-8">ダッシュボード</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">カテゴリ数</p>
          <p className="text-3xl font-bold text-slate-900">{categories.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">商材数（公開中）</p>
          <p className="text-3xl font-bold text-slate-900">{activeProducts.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">商材数（合計）</p>
          <p className="text-3xl font-bold text-slate-900">{products.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/categories" className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-2xl">🗂️</div>
            <div>
              <h2 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">カテゴリ管理</h2>
              <p className="text-sm text-slate-500">カテゴリの追加・編集・削除</p>
            </div>
          </div>
        </Link>
        <Link href="/admin/products" className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 text-2xl">📦</div>
            <div>
              <h2 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">商材管理</h2>
              <p className="text-sm text-slate-500">商材の追加・編集・削除・画像</p>
            </div>
          </div>
        </Link>
        <Link href="/admin/settings" className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 text-2xl">⚙️</div>
            <div>
              <h2 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">サイト設定</h2>
              <p className="text-sm text-slate-500">タイトル・見出し・テキスト編集</p>
            </div>
          </div>
        </Link>
      </div>

      {categories.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">カテゴリ一覧</h2>
            <Link href="/admin/categories" className="text-sm text-blue-600 hover:underline">すべて管理</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {categories.map(cat => {
              const count = products.filter(p => p.categoryId === cat.id).length;
              return (
                <div key={cat.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="font-medium text-slate-800">{cat.name}</p>
                      <p className="text-xs text-slate-400">{cat.description}</p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-500">{count}件</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
