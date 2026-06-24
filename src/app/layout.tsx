import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "商材カタログ",
  description: "自社商材一覧・カタログ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50">{children}</body>
    </html>
  );
}
