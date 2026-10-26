import { motion } from 'framer-motion';
import { COLOR_GROUPS, TILES } from './boardData';
import { calculateRent } from './engine';
import { PLAYER_COLORS } from './MonopolyModals';
import type { MonopolyPlayer, TileState } from './types';

// Tọa độ [col, row] trong lưới 9x9 (0..8)
export const TILE_COORDS: Record<number, [number, number]> = {
  // Cạnh dưới (Đi từ Trái sang Phải)
  0: [0, 8],
  1: [1, 8],
  2: [2, 8],
  3: [3, 8],
  4: [4, 8],
  5: [5, 8],
  6: [6, 8],
  7: [7, 8],
  // Góc phải dưới
  8: [8, 8],
  // Cạnh phải (Đi từ Dưới lên Trên)
  9: [8, 7],
  10: [8, 6],
  11: [8, 5],
  12: [8, 4],
  13: [8, 3],
  14: [8, 2],
  15: [8, 1],
  // Góc phải trên
  16: [8, 0],
  // Cạnh trên (Đi từ Phải sang Trái)
  17: [7, 0],
  18: [6, 0],
  19: [5, 0],
  20: [4, 0],
  21: [3, 0],
  22: [2, 0],
  23: [1, 0],
  // Góc trái trên
  24: [0, 0],
  // Cạnh trái (Đi từ Trên xuống Dưới)
  25: [0, 1],
  26: [0, 2],
  27: [0, 3],
  28: [0, 4],
  29: [0, 5],
  30: [0, 6],
  31: [0, 7],
};

const CORNER_IDS = new Set([0, 8, 16, 24]);

interface Props {
  tileStates: TileState[];
  players: MonopolyPlayer[];
  currentTurn?: number;
  highlightedTile?: number | null;
  onTileClick?: (tileId: number) => void;
  centerContent?: React.ReactNode;
}

export function MonopolyBoard({
  tileStates,
  players,
  highlightedTile,
  onTileClick,
  centerContent,
}: Props) {
  return (
    <div
      style={{
        position: 'relative',
        width: 864,
        height: 864,
        background: 'linear-gradient(135deg, #1E293B, #0F172A)',
        borderRadius: 36,
        padding: 12,
        boxShadow: '0 24px 60px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)',
        display: 'grid',
        gridTemplateColumns: '106px repeat(7, 90px) 106px',
        gridTemplateRows: '106px repeat(7, 90px) 106px',
        gap: 6,
        userSelect: 'none',
      }}
    >
      {/* 32 Ô Bàn Cờ */}
      {TILES.map((tile) => {
        const [col, row] = TILE_COORDS[tile.id];
        const isCorner = CORNER_IDS.has(tile.id);
        const state = tileStates[tile.id];
        const isOwner = state.ownerId !== null;
        const owner = isOwner ? players[state.ownerId!] : null;
        const ownerColor = owner ? PLAYER_COLORS[owner.color] : null;
        const colorGroup = tile.color ? COLOR_GROUPS[tile.color] : null;
        const isHighlighted = highlightedTile === tile.id;
        const standingPlayers = players.filter((p) => !p.isBankrupt && p.position === tile.id);

        const rent = calculateRent(tile.id, tileStates);

        return (
          <motion.div
            key={tile.id}
            onClick={() => onTileClick?.(tile.id)}
            whileHover={onTileClick ? { scale: 1.04, zIndex: 10 } : {}}
            style={{
              gridColumn: col + 1,
              gridRow: row + 1,
              borderRadius: isCorner ? 22 : 14,
              background: isHighlighted
                ? 'linear-gradient(135deg, #FEF08A, #FDE047)'
                : isCorner
                  ? 'linear-gradient(135deg, #334155, #1E293B)'
                  : '#FFFFFF',
              boxShadow: isHighlighted ? '0 0 20px #EAB308' : '0 4px 10px rgba(0,0,0,0.15)',
              border: isOwner
                ? `3px solid ${ownerColor?.border}`
                : isCorner
                  ? '2px solid #475569'
                  : '2px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              cursor: onTileClick ? 'pointer' : 'default',
            }}
          >
            {/* Header màu nhóm bất động sản */}
            {colorGroup && !isCorner && (
              <div
                style={{
                  height: 14,
                  background: colorGroup.hex,
                  width: '100%',
                }}
              />
            )}

            {/* Nội dung ô */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px 4px',
                textAlign: 'center',
                color: isCorner ? '#F8FAFC' : '#1E293B',
              }}
            >
              {/* Icon */}
              <div style={{ fontSize: isCorner ? 26 : 20, lineHeight: 1 }}>{tile.icon}</div>

              {/* Tên ngắn */}
              <div
                style={{
                  fontSize: isCorner ? 13 : 11,
                  fontWeight: 800,
                  marginTop: 2,
                  lineHeight: 1.15,
                  maxWidth: 82,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {tile.shortName}
              </div>

              {/* Hiển thị Giá hoặc Tiền Thuê */}
              {!isCorner && (
                <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2 }}>
                  {isOwner ? (
                    <span style={{ color: '#059669' }}>Thuê: {rent}K</span>
                  ) : tile.cost ? (
                    <span style={{ color: '#64748B' }}>{tile.cost}K</span>
                  ) : tile.taxAmount ? (
                    <span style={{ color: '#EF4444' }}>Thuế</span>
                  ) : null}
                </div>
              )}
            </div>

            {/* Cấp độ nhà / Landmark */}
            {isOwner && state.level > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  left: 2,
                  display: 'flex',
                  gap: 1,
                  background: 'rgba(0,0,0,0.65)',
                  padding: '1px 3px',
                  borderRadius: 4,
                }}
              >
                {state.level === 4 ? (
                  <span style={{ fontSize: 10 }}>🏰</span>
                ) : (
                  Array.from({ length: state.level }).map((_, i) => (
                    <span key={i} style={{ fontSize: 9 }}>
                      🏠
                    </span>
                  ))
                )}
              </div>
            )}

            {/* Cờ Lễ Hội nếu đang active */}
            {state.isFestival && (
              <div
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  fontSize: 12,
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
                }}
              >
                🚩
              </div>
            )}

            {/* Chủ sở hữu badge */}
            {isOwner && (
              <div
                style={{
                  height: 4,
                  background: ownerColor?.border ?? '#3B82F6',
                  width: '100%',
                }}
              />
            )}

            {/* Hiển thị Avatar Người chơi đang đứng tại ô này */}
            {standingPlayers.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 2,
                  left: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 2,
                  pointerEvents: 'none',
                }}
              >
                {standingPlayers.map((p) => {
                  const pCol = PLAYER_COLORS[p.color];
                  return (
                    <motion.div
                      key={p.id}
                      layoutId={`player_token_${p.id}`}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 999,
                        background: pCol.border,
                        border: '2px solid #fff',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 10,
                        fontWeight: 900,
                        color: pCol.text,
                      }}
                    >
                      {p.id + 1}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        );
      })}

      {/* VÙNG TRUNG TÂM BÀN CỜ */}
      <div
        style={{
          gridColumn: '2 / 9',
          gridRow: '2 / 9',
          background: 'radial-gradient(circle at center, #1E293B, #0F172A)',
          borderRadius: 24,
          border: '2px solid #334155',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: 24,
          overflow: 'hidden',
        }}
      >
        {/* Background watermark logo */}
        <div
          style={{
            position: 'absolute',
            fontSize: 160,
            opacity: 0.04,
            fontWeight: 900,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          NKC
        </div>

        {centerContent}
      </div>
    </div>
  );
}
