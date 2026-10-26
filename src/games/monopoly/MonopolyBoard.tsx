import { motion } from 'framer-motion';
import { COLOR_GROUPS, TILES } from './boardData';
import { calculateRent } from './engine';
import { PLAYER_COLORS } from './MonopolyModals';
import type { MonopolyPlayer, TileState } from './types';

/* ─── Tọa độ [col, row] trong lưới 9×9 ─── */
export const TILE_COORDS: Record<number, [number, number]> = {
  0: [0, 8], 1: [1, 8], 2: [2, 8], 3: [3, 8], 4: [4, 8], 5: [5, 8], 6: [6, 8], 7: [7, 8],
  8: [8, 8],
  9: [8, 7], 10: [8, 6], 11: [8, 5], 12: [8, 4], 13: [8, 3], 14: [8, 2], 15: [8, 1],
  16: [8, 0],
  17: [7, 0], 18: [6, 0], 19: [5, 0], 20: [4, 0], 21: [3, 0], 22: [2, 0], 23: [1, 0],
  24: [0, 0],
  25: [0, 1], 26: [0, 2], 27: [0, 3], 28: [0, 4], 29: [0, 5], 30: [0, 6], 31: [0, 7],
};

const CORNER_IDS = new Set([0, 8, 16, 24]);

/* ─── 3D depth colours for tile sides ─── */
const DEPTH = 18; // px thickness

/** Hàng nhà nhỏ 3D trên ô đất (VNG-style) */
function TileBuildings({ level, ownerColor }: { level: number; ownerColor: string }) {
  if (level === 0) return null;
  if (level === 4) {
    return (
      <div style={{
        position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%) rotateX(-50deg) rotateZ(-45deg)',
        fontSize: 22, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))', zIndex: 20,
        animation: 'landmarkPulse 2s ease-in-out infinite',
      }}>
        🏰
      </div>
    );
  }
  return (
    <div style={{
      position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%) rotateX(-50deg) rotateZ(-45deg)',
      display: 'flex', gap: 2, zIndex: 15,
    }}>
      {Array.from({ length: level }).map((_, i) => (
        <div key={i} style={{
          width: 10, height: 14, borderRadius: '2px 2px 0 0',
          background: `linear-gradient(180deg, ${ownerColor}, ${ownerColor}dd)`,
          border: '1px solid rgba(0,0,0,0.3)',
          boxShadow: `0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)`,
          position: 'relative',
        }}>
          {/* Mái nhà tam giác */}
          <div style={{
            position: 'absolute', top: -6, left: -1, width: 0, height: 0,
            borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
            borderBottom: `6px solid ${ownerColor}`,
            filter: 'brightness(1.2)',
          }} />
        </div>
      ))}
    </div>
  );
}

/** Token người chơi – quân cờ tròn đứng trên mặt ô */
function PlayerTokens({ players, tileId }: { players: MonopolyPlayer[]; tileId: number }) {
  const standing = players.filter(p => !p.isBankrupt && p.position === tileId);
  if (standing.length === 0) return null;
  return (
    <div style={{
      position: 'absolute', bottom: 4, left: '50%',
      transform: 'translateX(-50%) rotateX(-50deg) rotateZ(-45deg)',
      display: 'flex', gap: 3, zIndex: 30,
    }}>
      {standing.map(p => {
        const col = PLAYER_COLORS[p.color];
        return (
          <motion.div
            key={p.id}
            layoutId={`pawn_${p.id}`}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            style={{
              width: 22, height: 22, borderRadius: '50%',
              background: `radial-gradient(circle at 40% 35%, ${col.border}ee, ${col.border}88)`,
              border: '2.5px solid #fff',
              boxShadow: `0 3px 8px rgba(0,0,0,0.5), 0 0 12px ${col.border}66`,
              display: 'grid', placeItems: 'center',
              fontSize: 10, fontWeight: 900, color: '#fff',
            }}
          >
            {p.id + 1}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MonopolyBoard  –  Isometric 3D Diamond (phong cách VNG)
   ════════════════════════════════════════════════════════ */
interface Props {
  tileStates: TileState[];
  players: MonopolyPlayer[];
  currentTurn?: number;
  highlightedTile?: number | null;
  onTileClick?: (tileId: number) => void;
  centerContent?: React.ReactNode;
}

export function MonopolyBoard({ tileStates, players, highlightedTile, onTileClick, centerContent }: Props) {
  return (
    <div style={{
      /* Outer wrapper – holds perspective for the 3-D tilt */
      width: 920, height: 920,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      perspective: '1200px',
      perspectiveOrigin: '50% 30%',
    }}>
      {/* ── 3-D tilted container ── */}
      <div style={{
        width: 780, height: 780,
        transform: 'rotateX(52deg) rotateZ(45deg)',
        transformStyle: 'preserve-3d',
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '100px repeat(7, 82px) 100px',
        gridTemplateRows: '100px repeat(7, 82px) 100px',
        gap: 4,
      }}>
        {/* ── 32 Tiles ── */}
        {TILES.map(tile => {
          const [col, row] = TILE_COORDS[tile.id];
          const isCorner = CORNER_IDS.has(tile.id);
          const st = tileStates[tile.id];
          const owned = st.ownerId !== null;
          const owner = owned ? players[st.ownerId!] : null;
          const ownerCol = owner ? PLAYER_COLORS[owner.color] : null;
          const colorGrp = tile.color ? COLOR_GROUPS[tile.color] : null;
          const isHL = highlightedTile === tile.id;
          const rent = calculateRent(tile.id, tileStates);

          /* Side colour = darken the top colour */
          const topBg = isCorner
            ? 'linear-gradient(135deg, #2D3748, #1A202C)'
            : '#F7FAFC';
          const sideBg = isCorner ? '#1A202C' : '#CBD5E0';

          return (
            <div
              key={tile.id}
              onClick={() => onTileClick?.(tile.id)}
              style={{
                gridColumn: col + 1, gridRow: row + 1,
                position: 'relative',
                transformStyle: 'preserve-3d',
                cursor: onTileClick ? 'pointer' : 'default',
                /* subtle hover lift */
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => { if (onTileClick) (e.currentTarget.style.transform = `translateZ(4px)`); }}
              onMouseLeave={e => { if (onTileClick) (e.currentTarget.style.transform = ''); }}
            >
              {/* ══ TOP FACE ══ */}
              <div style={{
                width: '100%', height: '100%',
                borderRadius: isCorner ? 14 : 8,
                background: isHL
                  ? 'linear-gradient(135deg, #FDE68A, #F59E0B)'
                  : topBg,
                border: owned
                  ? `3px solid ${ownerCol?.border}`
                  : isCorner ? '2px solid #4A5568' : '2px solid #E2E8F0',
                boxShadow: isHL
                  ? '0 0 20px #F59E0B88'
                  : owned
                    ? `0 0 10px ${ownerCol?.border}44`
                    : '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 2,
              }}>
                {/* Colour bar */}
                {colorGrp && !isCorner && (
                  <div style={{ height: 12, background: colorGrp.hex, width: '100%', flexShrink: 0 }} />
                )}

                {/* Content */}
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '2px 3px', textAlign: 'center',
                  color: isCorner ? '#E2E8F0' : '#1A202C',
                }}>
                  <div style={{ fontSize: isCorner ? 22 : 18, lineHeight: 1 }}>{tile.icon}</div>
                  <div style={{
                    fontSize: isCorner ? 11 : 9, fontWeight: 800,
                    marginTop: 1, lineHeight: 1.1,
                    maxWidth: '90%', whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {tile.shortName}
                  </div>
                  {!isCorner && (
                    <div style={{ fontSize: 8, fontWeight: 700, marginTop: 1 }}>
                      {owned
                        ? <span style={{ color: '#059669' }}>{rent}K</span>
                        : tile.cost
                          ? <span style={{ color: '#718096' }}>{tile.cost}K</span>
                          : tile.taxAmount
                            ? <span style={{ color: '#E53E3E' }}>Thuế</span>
                            : null}
                    </div>
                  )}
                </div>

                {/* Festival flag */}
                {st.isFestival && (
                  <div style={{ position: 'absolute', top: 1, right: 2, fontSize: 10, zIndex: 5 }}>🚩</div>
                )}

                {/* Owner strip at bottom */}
                {owned && (
                  <div style={{ height: 4, background: ownerCol?.border ?? '#3182CE', width: '100%', flexShrink: 0 }} />
                )}
              </div>

              {/* ══ RIGHT SIDE FACE (3D depth) ══ */}
              <div style={{
                position: 'absolute',
                width: '100%', height: DEPTH,
                bottom: -DEPTH, left: 0,
                background: sideBg,
                borderRadius: '0 0 4px 4px',
                transform: 'rotateX(-90deg)',
                transformOrigin: 'top',
                borderTop: owned ? `2px solid ${ownerCol?.border}88` : '1px solid rgba(0,0,0,0.1)',
                boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.2)',
                zIndex: 1,
              }} />

              {/* ══ BOTTOM SIDE FACE ══ */}
              <div style={{
                position: 'absolute',
                width: DEPTH, height: '100%',
                top: 0, right: -DEPTH,
                background: isCorner ? '#151B28' : '#A0AEC0',
                borderRadius: '0 4px 4px 0',
                transform: 'rotateY(90deg)',
                transformOrigin: 'left',
                borderLeft: owned ? `2px solid ${ownerCol?.border}66` : '1px solid rgba(0,0,0,0.08)',
                boxShadow: 'inset -4px 0 8px rgba(0,0,0,0.2)',
                zIndex: 1,
              }} />

              {/* ══ BUILDINGS on top ══ */}
              <TileBuildings level={st.level} ownerColor={ownerCol?.border ?? '#3182CE'} />

              {/* ══ PLAYER TOKENS ══ */}
              <PlayerTokens players={players} tileId={tile.id} />
            </div>
          );
        })}

        {/* ═══ CENTER AREA ═══ */}
        <div style={{
          gridColumn: '2 / 9', gridRow: '2 / 9',
          borderRadius: 16,
          background: 'linear-gradient(145deg, #1A202C, #0F1623)',
          border: '2px solid #2D3748',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
          /* Un-tilt text so it's readable */
          transformStyle: 'preserve-3d',
        }}>
          {/* Watermark */}
          <div style={{
            position: 'absolute', fontSize: 80, opacity: 0.03,
            fontWeight: 900, color: '#fff',
            pointerEvents: 'none', userSelect: 'none',
          }}>
            NKC
          </div>

          {/* Title banner */}
          <div style={{
            background: 'linear-gradient(90deg, #B7791F, #D69E2E, #B7791F)',
            padding: '4px 28px', borderRadius: 999,
            color: '#fff', fontWeight: 900, fontSize: 14,
            letterSpacing: 2, textTransform: 'uppercase',
            boxShadow: '0 2px 12px rgba(214,158,46,0.4)',
            marginBottom: 14,
          }}>
            ⭐ CỜ TỶ PHÚ NKC ⭐
          </div>

          {/* Content from parent (dice, round info) rendered un-tilted */}
          <div style={{
            transform: 'rotateZ(-45deg) rotateX(-52deg)',
            transformStyle: 'preserve-3d',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 10,
          }}>
            {centerContent}
          </div>
        </div>
      </div>
    </div>
  );
}
