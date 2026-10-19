import type { CSSProperties } from 'react';
import { img } from '../../assets/registry';

// 5 màu sỏi dân kiểu kẹo bóng + viên quan to màu vàng-đỏ
const HUES: [string, string][] = [
  ['#FF8FB8', '#D9477F'], // hồng
  ['#7FE3C4', '#21A57F'], // bạc hà
  ['#8DC4FF', '#2F6FD8'], // xanh trời
  ['#FFE27A', '#E0A500'], // vàng chanh
  ['#C9A8FF', '#7B4FD8'], // tím
];
const STONE_KEYS = ['stone-a', 'stone-b', 'stone-c', 'stone-d', 'stone-e'];

interface Props {
  size: number;
  hue?: number;
  quan?: boolean;
  style?: CSSProperties;
}

/** Viên sỏi; có ảnh `oaq/stone-a..e.png` hoặc `oaq/quan.png` thì dùng ảnh. */
export function Stone({ size, hue = 0, quan, style }: Props) {
  const src = img(`oaq/${quan ? 'quan' : STONE_KEYS[hue % 5]}`);
  if (src) {
    return <img src={src} alt="" draggable={false} style={{ width: size, height: size, objectFit: 'contain', display: 'block', ...style }} />;
  }
  const [light, deep] = quan ? ['#FFD15C', '#D9480F'] : HUES[hue % 5];
  return (
    <div
      style={{
        width: size,
        height: size * (quan ? 0.92 : 0.86),
        borderRadius: quan ? '48% 52% 46% 54% / 55% 50% 50% 45%' : '50%',
        background: `radial-gradient(circle at 34% 28%, #fff 0 ${quan ? 9 : 12}%, ${light} ${quan ? 26 : 30}%, ${deep} 100%)`,
        boxShadow: `0 ${size * 0.08}px ${size * 0.12}px rgba(60,30,0,.35), inset 0 -${size * 0.08}px ${size * 0.1}px rgba(0,0,0,.18)`,
        border: quan ? `${Math.max(2, size * 0.05)}px solid #fff6d6` : undefined,
        ...style,
      }}
    />
  );
}
