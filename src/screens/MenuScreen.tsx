import { motion } from 'framer-motion';
import { audio } from '../audio/engine';
import { img } from '../assets/registry';
import { MenuBackground } from '../backgrounds/Backgrounds';
import { Stone } from '../games/oaq/Stone';
import { useGame, type GameId } from '../store/useGame';
import { Button } from '../ui/Button';
import { CandyPiece } from '../ui/CandyPiece';
import { IconTrophy } from '../ui/Icons';
import { Mascot } from '../ui/Mascot';
import { TopBar } from '../ui/TopBar';

function GameCard({ game, title, subtitle, delay }: { game: GameId; title: string; subtitle: string; delay: number }) {
  const openSetup = useGame((s) => s.openSetup);
  const cover = img(`ui/card-${game}`);
  const rot = game === 'caro' ? -3 : game === 'oaq' ? 0 : 3;

  return (
    <motion.button
      className="panel"
      onMouseEnter={() => audio.sfx('hover')}
      onClick={() => {
        audio.sfx('click');
        openSetup(game);
      }}
      initial={{ y: 80, opacity: 0, rotate: rot * 1.5 }}
      animate={{ y: 0, opacity: 1, rotate: rot }}
      whileHover={{ y: -16, rotate: 0, scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay }}
      style={{
        width: 440,
        height: 520,
        padding: 22,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          width: '100%',
          height: 310,
          borderRadius: 24,
          overflow: 'hidden',
          display: 'grid',
          placeItems: 'center',
          background:
            game === 'caro'
              ? 'repeating-linear-gradient(0deg, #fffdf5 0 39px, #c8d8ff 39px 41px), #fffdf5'
              : game === 'oaq'
                ? 'radial-gradient(circle at 50% 40%, #EBC48F, #C88E52)'
                : 'linear-gradient(135deg, #1E293B, #0F172A)',
        }}
      >
        {cover ? (
          <img src={cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : game === 'caro' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 84px)', gap: 8 }}>
            {['o', 'x', '', 'x', 'o', '', '', 'x', 'o'].map((m, i) => (
              <div
                key={i}
                style={{
                  width: 84,
                  height: 84,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 14,
                  background: 'rgba(255,255,255,.75)',
                  border: '3px solid #d6e0ff',
                }}
              >
                {m && <CandyPiece mark={m as 'x' | 'o'} size={68} />}
              </div>
            ))}
          </div>
        ) : game === 'oaq' ? (
          <svg viewBox="0 0 420 220" width="380">
            <path
              d="M80 20 H340 V200 H80 Z M80 20 A70 90 0 0 0 80 200 M340 20 A70 90 0 0 1 340 200 M80 110 H340 M132 20 V200 M184 20 V200 M236 20 V200 M288 20 V200"
              fill="none"
              stroke="#fff"
              strokeWidth="6"
              strokeLinejoin="round"
              opacity="0.9"
            />
            {[106, 158, 210, 262, 314].flatMap((x, i) =>
              [65, 155].map((y, j) => (
                <foreignObject key={`${i}-${j}`} x={x - 22} y={y - 22} width="44" height="44">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: 44, justifyContent: 'center' }}>
                    {Array.from({ length: 5 }, (_, k) => (
                      <Stone key={k} size={11} hue={(i + j + k) % 5} />
                    ))}
                  </div>
                </foreignObject>
              )),
            )}
            <foreignObject x="30" y="90" width="44" height="44">
              <Stone size={36} quan />
            </foreignObject>
            <foreignObject x="346" y="90" width="44" height="44">
              <Stone size={36} quan />
            </foreignObject>
          </svg>
        ) : (
          /* Monopoly 3D style preview */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 72 }}>🏰🎲</div>
            <div
              style={{
                background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 900,
                padding: '4px 14px',
                borderRadius: 999,
                letterSpacing: 1,
              }}
            >
              PHONG CÁCH VNG
            </div>
          </div>
        )}
      </div>

      <div className="candy-text" style={{ fontSize: 48, lineHeight: 1 }}>
        {title}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink-soft)', textAlign: 'center' }}>{subtitle}</div>
    </motion.button>
  );
}

export function MenuScreen() {
  const go = useGame((s) => s.go);
  const players = useGame((s) => s.players);
  const cake = img('ui/cake');
  const logo = img('ui/logo-title');

  return (
    <div className="screen">
      <MenuBackground />
      <TopBar
        actions={
          <Button
            variant="white"
            size="small"
            onClick={() => go('leaderboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <span style={{ width: 34, height: 34, display: 'inline-block' }}>
              <IconTrophy />
            </span>
            Bảng xếp hạng
          </Button>
        }
      />
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 14 }}
        style={{ position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center' }}
      >
        {logo ? (
          <img src={logo} alt="Hành trình quay về tuổi thơ" style={{ height: 180 }} />
        ) : (
          <>
            <div className="candy-text" style={{ fontSize: 96, lineHeight: 1 }}>
              Hành trình quay về tuổi thơ
            </div>
            <div style={{ marginTop: 14, fontSize: 30, fontWeight: 800, color: 'var(--blue-deep)' }}>
              Happy Birthday · Cùng chơi trò tuổi thơ &amp; thử tài triệu phú!
            </div>
          </>
        )}
      </motion.div>

      <div
        style={{
          position: 'absolute',
          top: 380,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        <GameCard game="caro" title="Cờ caro" subtitle="Ai xếp đủ 5 quân trước sẽ thắng" delay={0.1} />
        <GameCard game="oaq" title="Ô ăn quan" subtitle="Rải sỏi, ăn quan, tính điểm" delay={0.18} />
        <GameCard
          game="monopoly"
          title="Cờ Tỷ Phú"
          subtitle="Đổ xúc xắc, mua đất &amp; xây Landmark NKC"
          delay={0.26}
        />
      </div>

      <div style={{ position: 'absolute', left: 40, bottom: 20 }}>
        <Mascot color={players[0].color} pose="wave" size={280} />
      </div>
      <div style={{ position: 'absolute', right: 40, bottom: 20 }}>
        {cake ? <img src={cake} alt="" style={{ height: 260 }} /> : <Mascot color={players[1].color} pose="cake" size={280} />}
      </div>
    </div>
  );
}
