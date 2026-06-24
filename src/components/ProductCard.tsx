'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Product, Category } from '@/lib/db';

export default function ProductCard({ product, category }: { product: Product; category: Category }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#fff',
          cursor: 'pointer',
          outline: hovered ? '1px solid #111' : '1px solid transparent',
          transition: 'outline 0.2s',
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: '#F5F5F5' }}>
          {product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease', transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 48, opacity: 0.2 }}>{category.icon}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '14px 16px 20px' }}>
          <p style={{ margin: '0 0 6px', fontSize: 10, letterSpacing: '0.15em', color: '#999', textTransform: 'uppercase' }}>{category.name}</p>
          <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#111', letterSpacing: '0.01em' }}>{product.name}</h3>
          {product.tagline && <p style={{ margin: 0, fontSize: 12, color: '#666', lineHeight: 1.5 }}>{product.tagline}</p>}
        </div>
      </div>
    </Link>
  );
}
