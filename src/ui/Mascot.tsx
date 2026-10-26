import { motion } from 'framer-motion';
import { useId } from 'react';
import { img } from '../assets/registry';
import { useGame, type CatColor } from '../store/useGame';

export type Pose = 'wave' | 'think' | 'win' | 'lose' | 'cake';

interface Props {
  color: CatColor;
  pose: Pose;
  size?: number; // chiều cao px
  className?: string;
}

/**
 * Linh vật mèo NKC. Dùng ảnh `mascot/cat-{color}-{pose}.png` nếu đã có (ảnh do Codex tạo),
 * nếu chưa thì vẽ hình tạm bằng SVG.
 */
export function Mascot({ color, pose, size = 260, className }: Props) {
  const reduce = useGame((s) => s.settings.reduceMotion);
  const src = img(`mascot/cat-${color}-${pose}`);
  const anim =
    reduce
      ? undefined
      : pose === 'win'
        ? { y: [0, -34, 0], rotate: [0, -4, 4, 0] }
        : pose === 'lose'
          ? { y: [0, 3, 0], rotate: [0, -1.5, 0] }
          : { y: [0, -8, 0] };
  return (
    <motion.div
      className={className}
      style={{ height: size, width: size * (5 / 6), transformOrigin: '50% 100%' }}
      animate={anim}
      transition={{ duration: pose === 'win' ? 0.7 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* không lật gương: linh vật có chữ AI / N / B sẽ bị ngược */}
      <div style={{ width: '100%', height: '100%' }}>
        {src ? (
          <img src={src} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <CatSvg color={color} pose={pose} />
        )}
      </div>
    </motion.div>
  );
}

const PALETTE = {
  gold: { jacket: '#FFD43B', jacketDeep: '#F0B400', trim: '#1E4FD8', pants: '#1E4FD8', pantsDeep: '#12318F', goggle: '#3FA9FF', goggleDeep: '#1E4FD8', letter: '#1E4FD8' },
  orange: { jacket: '#FF8A3D', jacketDeep: '#E0601A', trim: '#E5402F', pants: '#C9302A', pantsDeep: '#8E1D19', goggle: '#FF7B7B', goggleDeep: '#E5402F', letter: '#FFF3D6' },
  cyan: { jacket: '#06B6D4', jacketDeep: '#0891B2', trim: '#0284C7', pants: '#0369A1', pantsDeep: '#075985', goggle: '#67E8F9', goggleDeep: '#0284C7', letter: '#E0F2FE' },
  pink: { jacket: '#F472B6', jacketDeep: '#DB2777', trim: '#9D174D', pants: '#831843', pantsDeep: '#500724', goggle: '#F9A8D4', goggleDeep: '#DB2777', letter: '#FDF2F8' },
};
const FUR = '#FFC21F';
const FUR_DEEP = '#F29A00';

function CatSvg({ color, pose }: { color: CatColor; pose: Pose }) {
  const id = useId().replace(/:/g, '');
  const c = PALETTE[color];
  const happy = pose === 'win';
  const sad = pose === 'lose';

  const arm = (side: 'L' | 'R', kind: 'down' | 'up' | 'wave' | 'chin' | 'front') => {
    const sx = side === 'L' ? 1 : -1;
    const ox = side === 'L' ? 62 : 138;
    const paths: Record<typeof kind, { d: string; paw: [number, number] }> = {
      down: { d: `M${ox} 150 q${-14 * sx} 22 ${-8 * sx} 46`, paw: [ox - 8 * sx, 198] },
      up: { d: `M${ox} 148 q${-22 * sx} -20 ${-18 * sx} -54`, paw: [ox - 18 * sx, 92] },
      wave: { d: `M${ox} 148 q${-26 * sx} -14 ${-30 * sx} -46`, paw: [ox - 30 * sx, 100] },
      chin: { d: `M${ox} 150 q${8 * sx} 6 ${20 * sx} -22`, paw: [ox + 22 * sx, 126] },
      front: { d: `M${ox} 150 q${6 * sx} 18 ${22 * sx} 30`, paw: [ox + 24 * sx, 182] },
    };
    const p = paths[kind];
    return (
      <g>
        <path d={p.d} stroke={c.jacketDeep} strokeWidth="25" strokeLinecap="round" fill="none" />
        <path d={p.d} stroke={c.jacket} strokeWidth="19" strokeLinecap="round" fill="none" />
        <circle cx={p.paw[0]} cy={p.paw[1]} r="12" fill={`url(#fur${id})`} stroke={FUR_DEEP} strokeWidth="2.5" />
      </g>
    );
  };

  const arms = {
    wave: [arm('L', 'down'), arm('R', 'wave')],
    think: [arm('L', 'down'), arm('R', 'chin')],
    win: [arm('L', 'up'), arm('R', 'up')],
    lose: [arm('L', 'down'), arm('R', 'down')],
    cake: [arm('L', 'front'), arm('R', 'front')],
  }[pose];

  return (
    <svg viewBox="0 0 200 240" width="100%" height="100%" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`fur${id}`} cx="38%" cy="30%" r="75%">
          <stop offset="0" stopColor="#FFE58A" />
          <stop offset="0.55" stopColor={FUR} />
          <stop offset="1" stopColor={FUR_DEEP} />
        </radialGradient>
        <linearGradient id={`jk${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.jacket} />
          <stop offset="1" stopColor={c.jacketDeep} />
        </linearGradient>
        <linearGradient id={`gg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="0.35" stopColor={c.goggle} />
          <stop offset="1" stopColor={c.goggleDeep} />
        </linearGradient>
        <radialGradient id={`eye${id}`} cx="45%" cy="40%" r="60%">
          <stop offset="0" stopColor="#5BB6FF" />
          <stop offset="0.7" stopColor="#1E4FD8" />
          <stop offset="1" stopColor="#0B1E66" />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="232" rx="58" ry="8" fill="rgba(0,0,0,0.18)" />

      {/* đuôi */}
      <path d="M140 196 q42 -6 40 -46" stroke={FUR_DEEP} strokeWidth="20" strokeLinecap="round" fill="none" />
      <path d="M140 196 q42 -6 40 -46" stroke={`url(#fur${id})`} strokeWidth="15" strokeLinecap="round" fill="none" />
      <circle cx="180" cy="150" r="9" fill="#fff" />

      {/* chân + giày */}
      <rect x="72" y="192" width="22" height="28" rx="8" fill={c.pants} stroke={c.pantsDeep} strokeWidth="2.5" />
      <rect x="106" y="192" width="22" height="28" rx="8" fill={c.pants} stroke={c.pantsDeep} strokeWidth="2.5" />
      <path d="M64 230 q0 -14 18 -14 h12 q6 0 6 8 v6z" fill="#fff" stroke={c.trim} strokeWidth="3" />
      <path d="M136 230 q0 -14 -18 -14 h-12 q-6 0 -6 8 v6z" fill="#fff" stroke={c.trim} strokeWidth="3" />

      {/* balo */}
      <rect x="56" y="140" width="88" height="52" rx="18" fill={c.trim} />

      {/* áo khoác */}
      <path d="M64 150 q0 -22 36 -22 q36 0 36 22 v38 q0 10 -10 10 h-52 q-10 0 -10 -10z" fill={`url(#jk${id})`} stroke={c.jacketDeep} strokeWidth="3" />
      <path d="M100 132 v64" stroke={c.trim} strokeWidth="3.5" />
      <path d="M66 188 h68" stroke={c.trim} strokeWidth="6" strokeLinecap="round" />
      <text x="80" y="172" fontSize="20" fontWeight="900" fill={c.letter} fontFamily="Baloo 2, sans-serif">B</text>

      {arms[0]}
      {arms[1]}

      {/* bánh kem */}
      {pose === 'cake' && (
        <g transform="translate(100 172)">
          <rect x="-30" y="-8" width="60" height="26" rx="6" fill="#FFF3F7" stroke="#E86A9A" strokeWidth="3" />
          <path d="M-30 0 q7 8 15 0 t15 0 t15 0 t15 0" fill="none" stroke="#FF6FA8" strokeWidth="5" strokeLinecap="round" />
          <rect x="-34" y="16" width="68" height="6" rx="3" fill="#C9B6FF" />
          <rect x="-2.5" y="-24" width="5" height="16" rx="2" fill="#4F7CFF" />
          <motion.path d="M0 -36 q6 7 0 12 q-6 -5 0 -12z" fill="#FFB020" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />
        </g>
      )}

      {/* tai */}
      <path d="M48 70 L50 18 L88 44z" fill={`url(#fur${id})`} stroke={FUR_DEEP} strokeWidth="3" strokeLinejoin="round" />
      <path d="M58 58 L59 32 L78 46z" fill={c.trim} />
      <path d="M152 70 L150 18 L112 44z" fill={`url(#fur${id})`} stroke={FUR_DEEP} strokeWidth="3" strokeLinejoin="round" />
      <path d="M142 58 L141 32 L122 46z" fill={c.trim} />

      {/* đầu */}
      <ellipse cx="100" cy="88" rx="62" ry="54" fill={`url(#fur${id})`} stroke={FUR_DEEP} strokeWidth="3" />
      <ellipse cx="100" cy="110" rx="36" ry="24" fill="#FFF6E5" />

      {/* tai nghe */}
      <circle cx="40" cy="92" r="13" fill={c.trim} stroke="#fff" strokeWidth="2" />
      <circle cx="160" cy="92" r="13" fill={c.trim} stroke="#fff" strokeWidth="2" />
      <text x="35.5" y="98" fontSize="15" fontWeight="900" fill={c.jacket}>N</text>
      <text x="155.5" y="98" fontSize="15" fontWeight="900" fill={c.jacket}>N</text>

      {/* kính AI */}
      <rect x="56" y="34" width="88" height="26" rx="13" fill={`url(#gg${id})`} stroke={c.goggleDeep} strokeWidth="3" />
      <text x="88" y="53" fontSize="15" fontWeight="900" fill="#fff">AI</text>

      {/* mắt */}
      {happy ? (
        <g stroke="#2B2340" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M66 86 q11 -14 22 0" />
          <path d="M112 86 q11 -14 22 0" />
        </g>
      ) : (
        <g>
          {[78, 122].map((x) => (
            <g key={x} transform={pose === 'think' ? 'translate(4 -3)' : undefined}>
              <ellipse cx={x} cy="86" rx="15" ry="17" fill="#fff" stroke="#2B2340" strokeWidth="2.5" />
              <circle cx={x + 1} cy="88" r="11" fill={`url(#eye${id})`} />
              <circle cx={x + 5} cy="83" r="4.5" fill="#fff" />
              <circle cx={x - 3} cy="93" r="2" fill="#fff" />
            </g>
          ))}
          {sad && (
            <g stroke="#2B2340" strokeWidth="3.5" strokeLinecap="round">
              <path d="M64 64 l18 6" />
              <path d="M136 64 l-18 6" />
            </g>
          )}
        </g>
      )}
      {sad && (
        <g fill="#7CC8FF" stroke="#3E8FE0" strokeWidth="1.5">
          <path d="M66 102 q-5 10 0 14 q5 -4 0 -14z" />
          <path d="M134 102 q-5 10 0 14 q5 -4 0 -14z" />
        </g>
      )}

      {/* má hồng */}
      <ellipse cx="62" cy="106" rx="9" ry="5" fill="#FF8FB3" opacity="0.6" />
      <ellipse cx="138" cy="106" rx="9" ry="5" fill="#FF8FB3" opacity="0.6" />

      {/* mũi + miệng */}
      <path d="M95 101 q5 -3 10 0 q-5 6 -10 0z" fill="#FF6F8E" />
      {sad ? (
        <path d="M88 122 q12 -9 24 0" stroke="#2B2340" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      ) : pose === 'think' ? (
        <ellipse cx="104" cy="118" rx="5" ry="4" fill="#B5374F" />
      ) : (
        <g>
          <path d="M86 112 q14 22 28 0z" fill="#B5374F" stroke="#2B2340" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M93 118 q7 6 14 0" fill="#FF8FA6" />
          <path d="M90 112 l3 4 l3 -4M104 112 l3 4 l3 -4" fill="#fff" />
        </g>
      )}

      {/* ria */}
      <g stroke="#E39A00" strokeWidth="1.6" strokeLinecap="round">
        <path d="M52 106 l-16 -3M52 112 l-16 3M148 106 l16 -3M148 112 l16 3" />
      </g>

      {/* phụ kiện theo tư thế */}
      {pose === 'think' && (
        <g fill="#fff" stroke="#2B2340" strokeWidth="2.5">
          <circle cx="166" cy="40" r="5" />
          <circle cx="178" cy="24" r="8" />
          <ellipse cx="190" cy="0" rx="16" ry="12" />
        </g>
      )}
      {happy &&
        [
          [24, 40, 1],
          [178, 30, 0.8],
          [186, 120, 0.6],
          [14, 130, 0.7],
        ].map(([x, y, s], i) => (
          <motion.path
            key={i}
            d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3z"
            fill="#FFE27A"
            stroke="#F0A800"
            strokeWidth="1.5"
            transform={`translate(${x} ${y}) scale(${s})`}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      {sad && <path d="M150 52 q-6 10 0 14 q6 -4 0 -14z" fill="#9FD8FF" stroke="#3E8FE0" strokeWidth="1.5" />}
    </svg>
  );
}
