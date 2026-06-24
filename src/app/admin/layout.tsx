import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top bar */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-lg">管理画面</span>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin" className="text-slate-300 hover:text-white transition-colors">
                ダッシュボード
              </Link>
              <Link href="/admin/categories" className="text-slate-300 hover:text-white transition-colors">
                カテゴリ管理
              </Link>
              <Link href="/admin/products" className="text-slate-300 hover:text-white transition-colors">
                商材管理
              </Link>
              <Link href="/admin/settings" className="text-slate-300 hover:text-white transition-colors">
                サイト設定
              </Link>
            </nav>
          </div>
          <Link href="/" className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            カタログを見る
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>
    </div>
  );
}
