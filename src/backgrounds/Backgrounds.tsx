import type { ReactNode } from 'react';
import { img } from '../assets/registry';

/** Dùng ảnh `bg/{key}.png` nếu có, nếu chưa có thì dùng hình vẽ SVG thay thế. */
function BgLayer({ asset, children }: { asset: string; children: ReactNode }) {
  const src = img(`bg/${asset}`);
  return <div className="bg-layer">{src ? <img src={src} alt="" draggable={false} /> : children}</div>;
}

const Cloud = ({ x, y, s, dur, delay }: { x: number; y: number; s: number; dur: number; delay: number }) => (
  <g style={{ animation: `drift ${dur}s linear ${delay}s infinite` }}>
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity="0.95">
      <ellipse cx="0" cy="20" rx="90" ry="34" />
      <circle cx="-34" cy="4" r="38" />
      <circle cx="22" cy="-10" r="50" />
      <circle cx="64" cy="10" r="32" />
    </g>
  </g>
);

const Bunting = ({ y, colors }: { y: number; colors: string[] }) => (
  <g>
    <path d={`M-20 ${y} Q960 ${y + 120} 1940 ${y}`} stroke="#8a6a4a" strokeWidth="4" fill="none" />
    {Array.from({ length: 22 }, (_, i) => {
      const t = (i + 0.5) / 22;
      const x = -20 + t * 1960;
      const yy = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y + 120) + t * t * y;
      return (
        <path
          key={i}
          d={`M${x - 30} ${yy} L${x + 30} ${yy} L${x} ${yy + 62}z`}
          fill={colors[i % colors.length]}
          stroke="#fff"
          strokeWidth="3"
          style={{ transformOrigin: `${x}px ${yy}px`, animation: `sway ${2 + (i % 3) * 0.4}s ease-in-out ${i * 0.1}s infinite` }}
        />
      );
    })}
  </g>
);

export function MenuBackground() {
  return (
    <BgLayer asset="menu">
      <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="mb-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5EC8FF" />
            <stop offset="0.6" stopColor="#B4E8FF" />
            <stop offset="1" stopColor="#FFF4C9" />
          </linearGradient>
          <radialGradient id="mb-sun" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFF6B0" />
            <stop offset="0.5" stopColor="#FFD84A" />
            <stop offset="1" stopColor="#FFD84A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#mb-sky)" />
        <circle cx="1650" cy="200" r="190" fill="url(#mb-sun)" />
        <Cloud x={200} y={180} s={1.2} dur={90} delay={-30} />
        <Cloud x={600} y={300} s={0.8} dur={120} delay={-80} />
        <Cloud x={1000} y={140} s={1} dur={100} delay={-10} />
        {/* diều */}
        <g style={{ transformOrigin: '1480px 420px', animation: 'sway 4s ease-in-out infinite' }}>
          <path d="M1480 330 L1540 420 L1480 520 L1420 420z" fill="#FF6FA8" stroke="#fff" strokeWidth="5" />
          <path d="M1480 330 L1480 520 M1420 420 L1540 420" stroke="#fff" strokeWidth="3" />
          <path d="M1480 520 q-30 60 10 110 q40 50 0 120" stroke="#8a6a4a" strokeWidth="3" fill="none" />
          {[560, 620, 680].map((y, i) => (
            <path key={y} d={`M${1470 + (i % 2) * 20} ${y} l-14 -10 v20z`} fill={['#FFC61A', '#1E4FD8', '#1BB7A6'][i]} />
          ))}
        </g>
        {/* đồi */}
        <path d="M0 820 Q300 650 700 780 T1400 740 T1920 760 V1080 H0z" fill="#8EDB6E" />
        <path d="M0 900 Q400 780 900 880 T1920 850 V1080 H0z" fill="#5CC25A" />
        <path d="M0 980 Q500 900 1100 970 T1920 950 V1080 H0z" fill="#43A84B" />
        {/* hoa */}
        {Array.from({ length: 18 }, (_, i) => (
          <g key={i} transform={`translate(${60 + i * 107} ${960 + (i % 3) * 30})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 9} cy={Math.sin((a * Math.PI) / 180) * 9} r="7" fill={['#FF6FA8', '#FFF', '#FFC61A'][i % 3]} />
            ))}
            <circle r="6" fill="#FF9A1A" />
          </g>
        ))}
        <Bunting y={-10} colors={['#FFC61A', '#1E4FD8', '#FF7A1A', '#1BB7A6', '#FF6FA8']} />
      </svg>
    </BgLayer>
  );
}

export function DeskBackground() {
  return (
    <BgLayer asset="caro-desk">
      <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="dk-wood" x1="0" y1="0" x2="1" y2="0.2">
            <stop offset="0" stopColor="#E3A868" />
            <stop offset="0.5" stopColor="#D69455" />
            <stop offset="1" stopColor="#C98446" />
          </linearGradient>
          <pattern id="dk-grain" width="420" height="90" patternUnits="userSpaceOnUse">
            <path d="M0 30 q105 -16 210 0 t210 0" stroke="#B87436" strokeWidth="3" fill="none" opacity="0.35" />
            <path d="M0 72 q140 12 280 0 t280 0" stroke="#F1BE82" strokeWidth="2" fill="none" opacity="0.5" />
          </pattern>
          <radialGradient id="dk-light" cx="0.5" cy="0.45" r="0.7">
            <stop offset="0" stopColor="#FFF4D6" stopOpacity="0.45" />
            <stop offset="1" stopColor="#5a3214" stopOpacity="0.35" />
          </radialGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#dk-wood)" />
        <rect width="1920" height="1080" fill="url(#dk-grain)" />
        <rect width="1920" height="1080" fill="url(#dk-light)" />
        {/* bút chì */}
        <g transform="translate(150 840) rotate(-28)">
          <rect x="0" y="0" width="300" height="34" rx="4" fill="#FFC61A" stroke="#D99A00" strokeWidth="3" />
          <rect x="-34" y="0" width="38" height="34" rx="8" fill="#FF8FB3" />
          <rect x="-4" y="0" width="14" height="34" fill="#BFC6D6" />
          <path d="M300 0 L350 17 L300 34z" fill="#F6D7A7" />
          <path d="M335 12 L350 17 L335 22z" fill="#2B2340" />
        </g>
        {/* gôm */}
        <g transform="translate(1640 860) rotate(12)">
          <rect width="130" height="64" rx="14" fill="#fff" stroke="#E3DDF0" strokeWidth="4" />
          <rect width="58" height="64" rx="14" fill="#4F7CFF" />
        </g>
        {/* thước */}
        <g transform="translate(1560 120) rotate(18)">
          <rect width="330" height="56" rx="6" fill="#9FE6DA" opacity="0.9" stroke="#59BDAE" strokeWidth="3" />
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d={`M${14 + i * 20} 0 v${i % 5 === 0 ? 24 : 14}`} stroke="#2E8C7F" strokeWidth="2.5" />
          ))}
        </g>
        {/* máy bay giấy */}
        <g transform="translate(130 150) rotate(-12)" style={{ animation: 'float-y 4s ease-in-out infinite' }}>
          <path d="M0 40 L170 0 L90 70z" fill="#fff" stroke="#C9C1DE" strokeWidth="3" />
          <path d="M90 70 L80 44 L170 0z" fill="#EDE8F7" stroke="#C9C1DE" strokeWidth="3" />
        </g>
        {/* nhãn dán ngôi sao */}
        {[
          [260, 540, '#FFC61A'],
          [1690, 560, '#FF6FA8'],
          [1760, 420, '#1BB7A6'],
        ].map(([x, y, c], i) => (
          <path
            key={i}
            transform={`translate(${x} ${y}) scale(2.2)`}
            d="M0 -20 L6 -6 L21 -6 L9 3 L13 18 L0 9 L-13 18 L-9 3 L-21 -6 L-6 -6z"
            fill={c as string}
            stroke="#fff"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </BgLayer>
  );
}

export function BanyanBackground() {
  return (
    <BgLayer asset="oaq-banyan">
      <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="bn-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7FD3FF" />
            <stop offset="1" stopColor="#FFF0C2" />
          </linearGradient>
          <linearGradient id="bn-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E3B57A" />
            <stop offset="1" stopColor="#C88E52" />
          </linearGradient>
          <radialGradient id="bn-shade" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#6b3f17" stopOpacity="0.28" />
            <stop offset="1" stopColor="#6b3f17" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#bn-sky)" />
        <Cloud x={900} y={90} s={0.9} dur={110} delay={-40} />
        <Cloud x={1400} y={170} s={0.7} dur={140} delay={-90} />
        {/* làng xa */}
        <g fill="#B5643A" opacity="0.85">
          <path d="M1250 300 l70 -50 l70 50z" />
          <path d="M1420 300 l60 -44 l60 44z" />
          <path d="M1600 300 l80 -56 l80 56z" />
        </g>
        <g fill="#F4E3C1" opacity="0.9">
          <rect x="1262" y="300" width="116" height="40" />
          <rect x="1430" y="300" width="100" height="40" />
          <rect x="1612" y="300" width="136" height="40" />
        </g>
        <path d="M0 330 Q480 290 960 320 T1920 310 V380 H0z" fill="#7CC768" />
        {/* sân đất */}
        <rect y="350" width="1920" height="730" fill="url(#bn-ground)" />
        {Array.from({ length: 70 }, (_, i) => (
          <ellipse key={i} cx={(i * 397) % 1920} cy={380 + ((i * 211) % 690)} rx={4 + (i % 4) * 2} ry={3 + (i % 3)} fill="#A9763F" opacity="0.45" />
        ))}
        {/* cây đa */}
        <ellipse cx="260" cy="560" rx="560" ry="200" fill="url(#bn-shade)" />
        <path d="M200 560 q-20 -170 30 -330 h70 q40 160 20 330z" fill="#8A5A34" stroke="#6E4325" strokeWidth="5" />
        <path d="M180 560 q60 -40 160 0" fill="#7a4d2b" />
        <g style={{ transformOrigin: '260px 230px', animation: 'sway 7s ease-in-out infinite' }}>
          {[
            [100, 170, 150],
            [260, 110, 170],
            [430, 170, 150],
            [180, 260, 130],
            [360, 260, 140],
            [540, 230, 110],
            [0, 250, 120],
          ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={['#3F9B4A', '#4FB257', '#5CC363'][i % 3]} />
          ))}
          {[[150, 120], [330, 80], [470, 170], [60, 220]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="36" fill="#7FD67F" opacity="0.6" />
          ))}
          {/* rễ phụ */}
          {[120, 170, 380, 430, 520].map((x, i) => (
            <path key={x} d={`M${x} 300 q${(i % 2 ? 1 : -1) * 10} 120 0 ${180 + (i % 3) * 40}`} stroke="#8A5A34" strokeWidth="5" fill="none" opacity="0.8" />
          ))}
        </g>
        {/* cỏ */}
        {Array.from({ length: 26 }, (_, i) => (
          <path
            key={i}
            transform={`translate(${(i * 173) % 1920} ${1000 + (i % 4) * 22})`}
            d="M0 0 q-6 -30 -18 -40 M0 0 q2 -34 8 -48 M0 0 q10 -26 24 -34"
            stroke="#5EA847"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </svg>
    </BgLayer>
  );
}
