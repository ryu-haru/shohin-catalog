'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Category } from '@/lib/db';

export default function CategoryCard({ cat, count }: { cat: Category; count: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/category/${cat.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          aspectRatio: '4/5',
          overflow: 'hidden',
          background: '#F5F5F5',
          cursor: 'pointer',
          outline: hovered ? '1px solid #111' : '1px solid transparent',
          transition: 'outline 0.2s',
        }}
      >
        {/* Background image or placeholder */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.5s ease',
          transform: hovered ? 'scale(1.04)' : 'scale(1)',
        }}>
          <span style={{ fontSize: 72, opacity: 0.15 }}>{cat.icon}</span>
        </div>

        {/* Overlay text */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '20px 20px 24px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
        }}>
          <p style={{ margin: '0 0 4px', fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>{count} items</p>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>{cat.name}</h3>
        </div>

        {/* Arrow */}
        <div style={{
          position: 'absolute', top: 16, right: 16,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.2s, transform 0.2s',
          transform: hovered ? 'translate(0, 0)' : 'translate(-4px, 4px)',
        }}>
          <span style={{ fontSize: 14, color: '#fff' }}>→</span>
        </div>
      </div>
    </Link>
  );
}
