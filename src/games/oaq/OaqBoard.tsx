import { AnimatePresence, motion } from 'framer-motion';
import { memo } from 'react';
import { img } from '../../assets/registry';
import { IconArrow } from '../../ui/Icons';
import { audio } from '../../audio/engine';
import { Stone } from './Stone';
import { PIT_COUNT, isQuan, type OaqState, type Pit, type Player } from './engine';

export const BOARD_W = 1500;
export const BOARD_H = 480;
const QUAN_W = 200;
const DAN_W = 220;
const ROW_H = 240;
const STONE = 30;

/** Tâm của từng ô trên bàn (tọa độ trong bàn). */
export function pitCenter(pit: number): { x: number; y: number } {
  if (pit === 0) return { x: 118, y: ROW_H };
  if (pit === 6) return { x: BOARD_W - 118, y: ROW_H };
  if (pit < 6) return { x: QUAN_W + DAN_W / 2 + (pit - 1) * DAN_W, y: ROW_H * 1.5 };
  return { x: QUAN_W + DAN_W / 2 + (11 - pit) * DAN_W, y: ROW_H / 2 };
}

/** Hướng rải (+1/-1) khi người chơi chọn mũi tên trái/phải trên màn hình. */
export const dirFromSide = (pit: number, side: 'left' | 'right'): 1 | -1 =>
  pit < 6 ? (side === 'right' ? 1 : -1) : side === 'right' ? -1 : 1;

// Vị trí sỏi trong ô: xếp xoắn ốc theo góc vàng, ổn định theo chỉ số viên
function stoneOffset(pit: number, k: number) {
  const quan = isQuan(pit);
  const n = quan ? k + 5 : k;
  const r = Math.min(quan ? 78 : 80, 14 * Math.sqrt(n + 0.6));
  const a = n * 2.39996 + pit * 1.3;
  const jitter = ((pit * 31 + k * 17) % 7) - 3;
  return {
    x: Math.cos(a) * r * (quan ? 0.7 : 1.05) + jitter,
    y: Math.sin(a) * r * (quan ? 1.9 : 0.95) - jitter,
  };
}

export type ExitMode = 'pick' | 'cap0' | 'cap1';
const stoneVariants = {
  hidden: { scale: 0, y: -70, opacity: 0 },
  shown: { scale: 1, y: 0, opacity: 1 },
  exit: (mode: ExitMode) =>
    mode === 'pick'
      ? { scale: 0.4, y: -60, opacity: 0, transition: { duration: 0.25 } }
      : { scale: 0.6, y: mode === 'cap0' ? 420 : -420, opacity: 0, transition: { duration: 0.6, ease: 'easeIn' } },
};

const PitStones = memo(function PitStones({ pit, data, exitMode, reduce }: { pit: number; data: Pit; exitMode: ExitMode; reduce: boolean }) {
  const shown = Math.min(data.dan, 36);
  return (
    <AnimatePresence custom={exitMode}>
      {data.quan > 0 && (
        <motion.div
          key="quan"
          custom={exitMode}
          variants={stoneVariants}
          initial="shown"
          animate="shown"
          exit="exit"
          style={{ position: 'absolute', left: -38, top: -36, zIndex: 2 }}
        >
          <Stone size={76} quan />
        </motion.div>
      )}
      {Array.from({ length: shown }, (_, k) => {
        const o = stoneOffset(pit, k);
        return (
          <motion.div
            key={k}
            custom={exitMode}
            variants={stoneVariants}
            initial={reduce ? 'shown' : 'hidden'}
            animate="shown"
            exit="exit"
            transition={{ type: 'spring', stiffness: 520, damping: 17 }}
            style={{ position: 'absolute', left: o.x - STONE / 2, top: o.y - STONE / 2, zIndex: 3 }}
          >
            <Stone size={STONE} hue={(k + pit) % 5} />
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
});

export interface Floater {
  id: number;
  pit: number;
  text: string;
  player: Player;
}

interface Props {
  state: OaqState;
  selectable: Set<number>;
  selected: number | null;
  preview: number[];
  hand: { pit: number; count: number } | null;
  focusPit: number | null;
  exitModes: Record<number, ExitMode>;
  floaters: Floater[];
  reduce: boolean;
  onPitClick: (pit: number) => void;
  onArrow: (side: 'left' | 'right') => void;
  onArrowHover: (side: 'left' | 'right' | null) => void;
}

export function OaqBoard({ state, selectable, selected, preview, hand, focusPit, exitModes, floaters, reduce, onPitClick, onArrow, onArrowHover }: Props) {
  const boardImg = img('oaq/board');
  const previewIndex = new Map(preview.map((p, i) => [p, i + 1]));
  const lastPreview = preview[preview.length - 1];

  return (
    <div style={{ position: 'relative', width: BOARD_W, height: BOARD_H }}>
      {/* đường kẻ phấn trên sân đất */}
      {boardImg ? (
        <img src={boardImg} alt="" style={{ position: 'absolute', inset: -30, width: BOARD_W + 60, height: BOARD_H + 60, objectFit: 'fill' }} />
      ) : (
        <svg width={BOARD_W} height={BOARD_H} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs>
            <radialGradient id="oaq-dirt" cx="0.5" cy="0.5" r="0.6">
              <stop offset="0" stopColor="#D9A469" />
              <stop offset="1" stopColor="#BE8248" />
            </radialGradient>
          </defs>
          <path
            d={`M${QUAN_W} 0 H${BOARD_W - QUAN_W} A180 ${ROW_H} 0 0 1 ${BOARD_W - QUAN_W} ${BOARD_H} H${QUAN_W} A180 ${ROW_H} 0 0 1 ${QUAN_W} 0z`}
            fill="url(#oaq-dirt)"
            stroke="rgba(110,60,20,.35)"
            strokeWidth="18"
            transform="translate(0 8)"
          />
          <g fill="none" stroke="#FFF9EC" strokeLinecap="round" strokeLinejoin="round">
            <path
              d={`M${QUAN_W} 0 H${BOARD_W - QUAN_W} A180 ${ROW_H} 0 0 1 ${BOARD_W - QUAN_W} ${BOARD_H} H${QUAN_W} A180 ${ROW_H} 0 0 1 ${QUAN_W} 0z M${QUAN_W} 0 V${BOARD_H} M${BOARD_W - QUAN_W} 0 V${BOARD_H} M${QUAN_W} ${ROW_H} H${BOARD_W - QUAN_W}`}
              strokeWidth="9"
              opacity="0.92"
            />
            {[1, 2, 3, 4].map((i) => (
              <path key={i} d={`M${QUAN_W + i * DAN_W} 0 V${BOARD_H}`} strokeWidth="8" opacity="0.92" />
            ))}
          </g>
        </svg>
      )}

      {/* vùng ô có thể chọn + ô đang được xử lý */}
      {Array.from({ length: PIT_COUNT }, (_, pit) => {
        if (isQuan(pit)) return null;
        const c = pitCenter(pit);
        const can = selectable.has(pit);
        const isSel = selected === pit;
        const inPreview = previewIndex.has(pit);
        return (
          <button
            key={pit}
            onClick={() => onPitClick(pit)}
            onMouseEnter={() => can && audio.sfx('hover')}
            disabled={!can}
            style={{
              position: 'absolute',
              left: c.x - DAN_W / 2 + 10,
              top: c.y - ROW_H / 2 + 10,
              width: DAN_W - 20,
              height: ROW_H - 20,
              border: 0,
              borderRadius: 28,
              cursor: can ? 'pointer' : 'default',
              background: isSel ? 'rgba(255, 230, 120, .45)' : inPreview ? 'rgba(255,255,255,.22)' : 'transparent',
              animation: can && !isSel ? 'pulse-glow 1.6s ease-in-out infinite' : undefined,
              boxShadow: isSel ? '0 0 0 6px #FFC61A, 0 0 40px 12px rgba(255,198,26,.6)' : undefined,
              transition: 'background .2s',
            }}
          />
        );
      })}
      {focusPit !== null && (
        <motion.div
          style={{
            position: 'absolute',
            width: isQuan(focusPit) ? 170 : DAN_W - 24,
            height: isQuan(focusPit) ? 420 : ROW_H - 24,
            borderRadius: isQuan(focusPit) ? 120 : 26,
            border: '6px dashed rgba(255,255,255,.95)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
          animate={{ left: pitCenter(focusPit).x - (isQuan(focusPit) ? 85 : (DAN_W - 24) / 2), top: pitCenter(focusPit).y - (isQuan(focusPit) ? 210 : (ROW_H - 24) / 2) }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}

      {/* sỏi */}
      {state.pits.map((p, pit) => {
        const c = pitCenter(pit);
        return (
          <div key={pit} style={{ position: 'absolute', left: c.x, top: c.y, pointerEvents: 'none' }}>
            <PitStones pit={pit} data={p} exitMode={exitModes[pit] ?? 'pick'} reduce={reduce} />
          </div>
        );
      })}

      {/* số sỏi mỗi ô */}
      {state.pits.map((p, pit) => {
        const c = pitCenter(pit);
        const q = isQuan(pit);
        const top = q ? c.y + 168 : pit < 6 ? c.y + 76 : c.y - 112;
        const left = q ? c.x - 46 : c.x + 52;
        return (
          <motion.div
            key={`${pit}-${p.dan}-${p.quan}`}
            initial={{ scale: 1.35 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute',
              left,
              top,
              minWidth: q ? 92 : 46,
              height: 40,
              padding: '0 10px',
              borderRadius: 999,
              display: 'grid',
              placeItems: 'center',
              background: p.dan + p.quan > 0 ? '#fff' : 'rgba(255,255,255,.55)',
              border: '3px solid #8A5A34',
              fontSize: 24,
              fontWeight: 800,
              color: '#6E4325',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          >
            {q ? (p.quan > 0 ? `Quan${p.dan ? ` +${p.dan}` : ''}` : p.dan) : p.dan}
          </motion.div>
        );
      })}

      {/* số thứ tự đường rải (preview) */}
      {preview.map((pit, i) => {
        const c = pitCenter(pit);
        const lastOne = pit === lastPreview && i === preview.length - 1;
        return (
          <motion.div
            key={`${pit}-${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 600, damping: 20 }}
            style={{
              position: 'absolute',
              left: c.x - 24 + (i >= PIT_COUNT ? 30 : 0),
              top: c.y - 24 + (i >= PIT_COUNT ? 30 : 0),
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              background: lastOne ? 'var(--pink)' : 'var(--blue)',
              color: '#fff',
              border: '4px solid #fff',
              fontSize: 24,
              fontWeight: 800,
              zIndex: 8,
              pointerEvents: 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,.25)',
            }}
          >
            {i + 1}
          </motion.div>
        );
      })}

      {/* mũi tên chọn hướng */}
      <AnimatePresence>
        {selected !== null &&
          (['left', 'right'] as const).map((side) => {
            const c = pitCenter(selected);
            return (
              <motion.button
                key={`${selected}-${side}`}
                className="candy-btn blue icon"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                onMouseEnter={() => onArrowHover(side)}
                onMouseLeave={() => onArrowHover(null)}
                onClick={() => onArrow(side)}
                title={side === 'left' ? 'Rải sang trái' : 'Rải sang phải'}
                style={{ position: 'absolute', left: c.x + (side === 'left' ? -DAN_W / 2 - 46 : DAN_W / 2 - 46), top: c.y - 46, width: 92, height: 92, zIndex: 12 }}
              >
                <IconArrow dir={side} />
              </motion.button>
            );
          })}
      </AnimatePresence>

      {/* bàn tay đang cầm sỏi */}
      <AnimatePresence>
        {hand && (
          <motion.div
            key="hand"
            initial={{ opacity: 0, scale: 0.4, x: pitCenter(hand.pit).x, y: pitCenter(hand.pit).y - 90 }}
            animate={{ opacity: 1, scale: 1, x: pitCenter(hand.pit).x, y: pitCenter(hand.pit).y - 90 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 26 }}
            style={{ position: 'absolute', left: 0, top: 0, zIndex: 20, pointerEvents: 'none' }}
          >
            <div
              style={{
                position: 'absolute',
                left: -62,
                top: -40,
                width: 124,
                height: 80,
                borderRadius: '50px 50px 40px 40px',
                background: 'radial-gradient(circle at 40% 30%, #FFE7A8, #FFC21F 60%, #F29A00)',
                border: '5px solid #fff',
                boxShadow: '0 12px 24px rgba(60,30,0,.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                flexWrap: 'wrap',
                padding: 8,
              }}
            >
              {Array.from({ length: Math.min(hand.count, 6) }, (_, k) => (
                <Stone key={k} size={22} hue={k} />
              ))}
            </div>
            {hand.count > 0 && <div
              style={{
                position: 'absolute',
                left: 36,
                top: -62,
                minWidth: 52,
                height: 52,
                borderRadius: 999,
                background: 'var(--blue)',
                color: '#fff',
                border: '4px solid #fff',
                display: 'grid',
                placeItems: 'center',
                fontSize: 28,
                fontWeight: 800,
                padding: '0 8px',
              }}
            >
              {hand.count}
            </div>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* chữ +điểm bay lên */}
      <AnimatePresence>
        {floaters.map((f) => {
          const c = pitCenter(f.pit);
          return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -110, scale: 1.2 }}
              exit={{ opacity: 0, y: -170 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="candy-text"
              style={{
                position: 'absolute',
                left: c.x - 80,
                top: c.y - 40,
                width: 160,
                textAlign: 'center',
                fontSize: 58,
                zIndex: 30,
                pointerEvents: 'none',
                WebkitTextStrokeColor: f.player === 0 ? 'var(--blue)' : 'var(--orange-deep)',
              }}
            >
              {f.text}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
