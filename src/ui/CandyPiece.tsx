import { useId } from 'react';
import { img } from '../assets/registry';

/**
 * Quân X (xanh ngọc viền vàng) và O (cam bóng) giống ảnh tham khảo.
 * Có ảnh `caro/piece-x.png` / `caro/piece-o.png` thì dùng ảnh.
 */
export function CandyPiece({ mark, size = 52 }: { mark: 'x' | 'o'; size?: number }) {
  const id = useId().replace(/:/g, '');
  const src = img(`caro/piece-${mark}`);
  if (src) return <img src={src} alt="" width={size} height={size} draggable={false} style={{ objectFit: 'contain' }} />;

  if (mark === 'o') {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`o${id}`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor="#FFB45E" />
            <stop offset="0.5" stopColor="#FF7A1A" />
            <stop offset="1" stopColor="#C94400" />
          </linearGradient>
        </defs>
        <ellipse cx="52" cy="56" rx="34" ry="35" fill="none" stroke="rgba(80,30,0,0.25)" strokeWidth="22" />
        <ellipse cx="50" cy="50" rx="34" ry="35" fill="none" stroke="#9E3500" strokeWidth="26" />
        <ellipse cx="50" cy="50" rx="34" ry="35" fill="none" stroke={`url(#o${id})`} strokeWidth="20" />
        <path d="M28 34 q10 -16 28 -18" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.9" />
        <circle cx="70" cy="26" r="3.5" fill="#fff" opacity="0.85" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`x${id}`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#5FE3CF" />
          <stop offset="0.5" stopColor="#1BB7A6" />
          <stop offset="1" stopColor="#0B7568" />
        </linearGradient>
      </defs>
      <g strokeLinecap="round">
        <path d="M24 22 L78 80 M78 22 L24 80" stroke="rgba(0,60,50,0.25)" strokeWidth="30" transform="translate(2 5)" />
        <path d="M22 20 L78 80 M78 20 L22 80" stroke="#FFD21A" strokeWidth="34" />
        <path d="M22 20 L78 80 M78 20 L22 80" stroke="#0B6B5F" strokeWidth="25" />
        <path d="M22 20 L78 80 M78 20 L22 80" stroke={`url(#x${id})`} strokeWidth="20" />
        <path d="M24 24 L36 37 M74 24 L66 33" stroke="#fff" strokeWidth="5" opacity="0.85" />
      </g>
    </svg>
  );
}
