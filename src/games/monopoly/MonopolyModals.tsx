import { motion } from 'framer-motion';
import { audio } from '../../audio/engine';
import { COLOR_GROUPS, TILES } from './boardData';
import type { BuildingLevel, ChanceCard, MonopolyPlayer, TileState, VictoryReason } from './types';

// Palette màu của 4 người chơi
export const PLAYER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  gold: { bg: '#FEF08A', text: '#854D0E', border: '#FACC15' },
  orange: { bg: '#FED7AA', text: '#9A3412', border: '#FB923C' },
  cyan: { bg: '#BAE6FD', text: '#0369A1', border: '#38BDF8' },
  pink: { bg: '#FBCFE8', text: '#9D174D', border: '#F472B6' },
};

/** Popup Mua Đất hoặc Nâng Cấp Công Trình */
export function BuyPropertyModal({
  tileId,
  tileState,
  player,
  onBuy,
  onSkip,
}: {
  tileId: number;
  tileState: TileState;
  player: MonopolyPlayer;
  onBuy: (level: BuildingLevel) => void;
  onSkip: () => void;
}) {
  const tile = TILES[tileId];
  const isOwner = tileState.ownerId === player.id;
  const currentLevel = tileState.level;
  const isTransport = tile.type === 'transport';

  // Chi phí nâng cấp
  const buyCost = isTransport ? (tile.cost ?? 300) : currentLevel === 0 ? (tile.cost ?? 200) : (tile.houseCost ?? 150);
  const nextLevel: BuildingLevel = isTransport ? 0 : ((currentLevel + 1) as BuildingLevel);
  const canAfford = player.money >= buyCost;
  const isLandmark = nextLevel === 4;

  const colorGroup = tile.color ? COLOR_GROUPS[tile.color] : null;

  return (
    <div className="modal-backdrop">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="panel"
        style={{
          width: 500,
          padding: '24px 30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          border: isLandmark ? '4px solid #F59E0B' : '3px solid #3B82F6',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}
      >
        {/* Banner màu nhóm */}
        {colorGroup && (
          <div
            style={{
              background: colorGroup.hex,
              color: '#fff',
              fontSize: 14,
              fontWeight: 800,
              padding: '4px 16px',
              borderRadius: 999,
              textTransform: 'uppercase',
            }}
          >
            {colorGroup.name}
          </div>
        )}

        <div style={{ fontSize: 44 }}>{tile.icon}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--ink)' }}>{tile.name}</div>

        <div
          style={{
            background: 'rgba(0,0,0,0.04)',
            padding: '12px 20px',
            borderRadius: 16,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
            <span>Loại công trình:</span>
            <strong>
              {isTransport
                ? 'Tuyến Giao Thông'
                : isLandmark
                  ? '🏰 LANDMARK NKC'
                  : currentLevel === 0
                    ? 'Khu Đất Trống'
                    : `Trụ Sở Cấp ${nextLevel}`}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
            <span>Chi phí đầu tư:</span>
            <strong style={{ color: '#EF4444' }}>{buyCost.toLocaleString()}K NKC Coin</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
            <span>Tiền mặt hiện tại:</span>
            <strong>{player.money.toLocaleString()}K NKC Coin</strong>
          </div>
          {tile.rentTiers && !isTransport && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: '#059669' }}>
              <span>Thu tiền thuê khi đối thủ vào:</span>
              <strong>{tile.rentTiers[nextLevel === 0 ? 0 : nextLevel - 1].toLocaleString()}K NKC</strong>
            </div>
          )}
        </div>

        {isLandmark && (
          <div style={{ fontSize: 14, fontWeight: 700, color: '#D97706', textAlign: 'center' }}>
            ⭐ Khi lên Landmark, công trình sẽ trở thành Biểu Tượng và KHÔNG THỂ BỊ MUA LẠI!
          </div>
        )}

        {/* Nút hành động */}
        <div style={{ display: 'flex', gap: 14, width: '100%', marginTop: 8 }}>
          <button
            onClick={() => {
              audio.sfx('click');
              onSkip();
            }}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 16,
              border: '2px solid #CBD5E1',
              background: '#F1F5F9',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Bỏ qua
          </button>
          <button
            disabled={!canAfford}
            onClick={() => {
              audio.sfx(isLandmark ? 'landmark' : 'build');
              onBuy(nextLevel);
            }}
            style={{
              flex: 1.5,
              padding: '12px',
              borderRadius: 16,
              border: 'none',
              background: canAfford
                ? isLandmark
                  ? 'linear-gradient(135deg, #F59E0B, #EF4444)'
                  : 'linear-gradient(135deg, #10B981, #059669)'
                : '#94A3B8',
              color: '#fff',
              fontSize: 18,
              fontWeight: 800,
              cursor: canAfford ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              boxShadow: canAfford ? '0 4px 12px rgba(16,185,129,0.35)' : 'none',
            }}
          >
            {canAfford ? (isOwner ? 'Nâng Cấp Ngay' : 'Mua Đất Ngay') : 'Không Đủ Tiền'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/** Popup Thâu Tóm (Buyout) Bất Động Sản Đối Thủ */
export function BuyoutModal({
  tileId,
  cost,
  owner,
  buyer,
  onBuyout,
  onSkip,
}: {
  tileId: number;
  cost: number;
  owner: MonopolyPlayer;
  buyer: MonopolyPlayer;
  onBuyout: () => void;
  onSkip: () => void;
}) {
  const tile = TILES[tileId];
  const canAfford = buyer.money >= cost;

  return (
    <div className="modal-backdrop">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="panel"
        style={{
          width: 520,
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          border: '3px solid #8B5CF6',
          boxShadow: '0 20px 40px rgba(139,92,246,0.3)',
        }}
      >
        <div style={{ fontSize: 44 }}>⚔️</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--ink)' }}>THÂU TÓM BẤT ĐỘNG SẢN!</div>
        <div style={{ textAlign: 'center', fontSize: 17, color: 'var(--ink-soft)' }}>
          Bạn vừa bước vào <strong>{tile.name}</strong> của <strong>{owner.name}</strong>. Bạn có muốn bỏ ra gấp đôi giá
          trị để thâu tóm khu đất này không?
        </div>

        <div
          style={{
            background: '#F5F3FF',
            border: '2px solid #DDD6FE',
            padding: '14px 20px',
            borderRadius: 16,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
            <span>Giá mua lại (x2):</span>
            <strong style={{ color: '#7C3AED' }}>{cost.toLocaleString()}K NKC</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
            <span>Tiền của bạn:</span>
            <strong>{buyer.money.toLocaleString()}K NKC</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, width: '100%', marginTop: 8 }}>
          <button
            onClick={() => {
              audio.sfx('click');
              onSkip();
            }}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 16,
              border: '2px solid #CBD5E1',
              background: '#F1F5F9',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Bỏ qua
          </button>
          <button
            disabled={!canAfford}
            onClick={() => {
              audio.sfx('landmark');
              onBuyout();
            }}
            style={{
              flex: 1.5,
              padding: '12px',
              borderRadius: 16,
              border: 'none',
              background: canAfford ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : '#94A3B8',
              color: '#fff',
              fontSize: 18,
              fontWeight: 800,
              cursor: canAfford ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
            }}
          >
            {canAfford ? 'Thâu Tóm Luôn' : 'Không Đủ Tiền'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/** Popup Thẻ Cơ Hội / Vận May */
export function ChanceCardModal({ card, onClose }: { card: ChanceCard; onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <motion.div
        initial={{ rotateY: 90, scale: 0.6, opacity: 0 }}
        animate={{ rotateY: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="panel"
        style={{
          width: 480,
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          background: 'linear-gradient(145deg, #FFFBEB, #FEF3C7)',
          border: '4px solid #F59E0B',
          boxShadow: '0 20px 50px rgba(245,158,11,0.4)',
        }}
      >
        <div style={{ fontSize: 52 }}>🎁</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#92400E', textAlign: 'center' }}>{card.title}</div>
        <div
          style={{
            fontSize: 18,
            color: '#78350F',
            textAlign: 'center',
            lineHeight: 1.5,
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.7)',
            borderRadius: 14,
            width: '100%',
          }}
        >
          {card.description}
        </div>

        {card.amount !== undefined && (
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: card.amount > 0 ? '#10B981' : '#EF4444',
            }}
          >
            {card.amount > 0 ? `+${card.amount.toLocaleString()}K NKC` : `${card.amount.toLocaleString()}K NKC`}
          </div>
        )}

        <button
          onClick={() => {
            audio.sfx('click');
            onClose();
          }}
          style={{
            marginTop: 10,
            padding: '12px 40px',
            borderRadius: 999,
            border: 'none',
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            color: '#fff',
            fontSize: 18,
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 4px 14px rgba(217,119,6,0.4)',
          }}
        >
          Đồng ý
        </button>
      </motion.div>
    </div>
  );
}

/** Popup Chiến Thắng Vang Dội (Game Over) */
export function VictoryModal({
  winner,
  reason,
  players,
  onPlayAgain,
  onExit,
}: {
  winner: MonopolyPlayer;
  reason: VictoryReason | null;
  players: MonopolyPlayer[];
  onPlayAgain: () => void;
  onExit: () => void;
}) {
  const reasonText: Record<VictoryReason, string> = {
    bankruptcy: 'Đối thủ đã cạn kiệt tài chính và phá sản!',
    triple_monopoly: 'Chiến thắng Độc Quyền 3 Bộ Màu (Triple Monopoly)!',
    line_monopoly: 'Chiến thắng Độc Quyền 1 Cạnh Bàn Cờ (Line Monopoly)!',
    tourism_monopoly: 'Chiến thắng Độc Quyền 4 Tuyến Giao Thông NKC (Tourism)!',
    round_limit: 'Đạt giới hạn số hiệp chơi — Soán ngôi nhờ tổng tài sản cao nhất!',
  };

  return (
    <div className="modal-backdrop">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="panel"
        style={{
          width: 560,
          padding: '34px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          border: '4px solid #EAB308',
          boxShadow: '0 25px 60px rgba(234,179,8,0.45)',
        }}
      >
        <div style={{ fontSize: 64 }}>👑</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--ink)' }}>TÂN TÀI PHIỆT NKC!</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#EAB308' }}>{winner.name}</div>
        <div style={{ fontSize: 17, color: 'var(--ink-soft)', textAlign: 'center' }}>
          {reason ? reasonText[reason] : 'Đã giành chiến thắng thuyết phục!'}
        </div>

        {/* Bảng xếp hạng tài sản cuối trận */}
        <div
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.03)',
            borderRadius: 16,
            padding: '12px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {players.map((p, i) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 16,
                fontWeight: p.id === winner.id ? 800 : 600,
                color: p.id === winner.id ? '#D97706' : 'var(--ink)',
              }}
            >
              <span>
                {p.id === winner.id ? '🥇' : `${i + 1}.`} {p.name} {p.isBankrupt && '(Phá sản)'}
              </span>
              <span>{p.money.toLocaleString()}K NKC</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16, width: '100%', marginTop: 10 }}>
          <button
            onClick={onExit}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 16,
              border: '2px solid #CBD5E1',
              background: '#F1F5F9',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Về Menu
          </button>
          <button
            onClick={onPlayAgain}
            style={{
              flex: 1.5,
              padding: '14px',
              borderRadius: 16,
              border: 'none',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#fff',
              fontSize: 18,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 6px 18px rgba(16,185,129,0.4)',
            }}
          >
            Chơi Ván Mới
          </button>
        </div>
      </motion.div>
    </div>
  );
}
