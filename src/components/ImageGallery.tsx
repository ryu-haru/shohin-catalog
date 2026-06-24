'use client';

import { useState } from 'react';

export default function ImageGallery({ images, fallbackIcon, fallbackColor }: {
  images: string[];
  fallbackIcon: string;
  fallbackColor: string;
}) {
  const [selected, setSelected] = useState(0);

  return (
    <div>
      <div style={{
        background: '#F5F5F5',
        overflow: 'hidden',
        aspectRatio: '4/5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {images.length > 0 ? (
          <img src={images[selected]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 100, opacity: 0.15 }}>{fallbackIcon}</span>
        )}
      </div>
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              style={{
                width: 72,
                height: 72,
                overflow: 'hidden',
                border: selected === i ? '2px solid #111' : '2px solid transparent',
                cursor: 'pointer',
                padding: 0,
                background: '#F5F5F5',
              }}
            >
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
