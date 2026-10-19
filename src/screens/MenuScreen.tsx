import { motion } from 'framer-motion';
import { img } from '../assets/registry';
import { MenuBackground } from '../backgrounds/Backgrounds';
import { useGame, type GameId } from '../store/useGame';
import { Button } from '../ui/Button';
import { CandyPiece } from '../ui/CandyPiece';
import { IconTrophy } from '../ui/Icons';
import { Mascot } from '../ui/Mascot';
import { Stone } from '../games/oaq/Stone';
import { TopBar } from '../ui/TopBar';
import { audio } from '../audio/engine';

function GameCard({ game, title, subtitle, delay }: { game: GameId; title: string; subtitle: string; delay: number }) {
  const openSetup = useGame((s) => s.openSetup);
  const cover = img(`ui/card-${game}`);
  return (
    <motion.button
      className="panel"
      onMouseEnter={() => audio.sfx('hover')}
      onClick={() => {
        audio.sfx('click');
        openSetup(game);
      }}
      initial={{ y: 80, opacity: 0, rotate: game === 'caro' ? -4 : 4 }}
      animate={{ y: 0, opacity: 1, rotate: game === 'caro' ? -2 : 2 }}
      whileHover={{ y: -16, rotate: 0, scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay }}
      style={{ width: 520, height: 520, padding: 26, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, fontFamily: 'inherit' }}
    >
      <div
        style={{
          width: '100%',
          height: 330,
          borderRadius: 26,
          overflow: 'hidden',
          display: 'grid',
          placeItems: 'center',
          background: game === 'caro' ? 'repeating-linear-gradient(0deg, #fffdf5 0 39px, #c8d8ff 39px 41px), #fffdf5' : 'radial-gradient(circle at 50% 40%, #EBC48F, #C88E52)',
        }}
      >
        {cover ? (
          <img src={cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : game === 'caro' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 96px)', gap: 8 }}>
            {['o', 'x', '', 'x', 'o', '', '', 'x', 'o'].map((m, i) => (
              <div key={i} style={{ width: 96, height: 96, display: 'grid', placeItems: 'center', borderRadius: 14, background: 'rgba(255,255,255,.75)', border: '3px solid #d6e0ff' }}>
                {m && <CandyPiece mark={m as 'x' | 'o'} size={78} />}
              </div>
            ))}
          </div>
        ) : (
          <svg viewBox="0 0 420 220" width="440">
            <path d="M80 20 H340 V200 H80 Z M80 20 A70 90 0 0 0 80 200 M340 20 A70 90 0 0 1 340 200 M80 110 H340 M132 20 V200 M184 20 V200 M236 20 V200 M288 20 V200" fill="none" stroke="#fff" strokeWidth="6" strokeLinejoin="round" opacity="0.9" />
            {[106, 158, 210, 262, 314].flatMap((x, i) =>
              [65, 155].map((y, j) => (
                <foreignObject key={`${i}-${j}`} x={x - 22} y={y - 22} width="44" height="44">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: 44, justifyContent: 'center' }}>
                    {Array.from({ length: 5 }, (_, k) => (
                      <Stone key={k} size={13} hue={(i + j + k) % 5} />
                    ))}
                  </div>
                </foreignObject>
              )),
            )}
            <foreignObject x="30" y="90" width="44" height="44">
              <Stone size={40} quan />
            </foreignObject>
            <foreignObject x="346" y="90" width="44" height="44">
              <Stone size={40} quan />
            </foreignObject>
          </svg>
        )}
      </div>
      <div className="candy-text" style={{ fontSize: 58, lineHeight: 1 }}>
        {title}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink-soft)' }}>{subtitle}</div>
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
          <Button variant="white" size="small" onClick={() => go('leaderboard')} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
        style={{ position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center' }}
      >
        {logo ? (
          <img src={logo} alt="Hành trình quay về tuổi thơ" style={{ height: 220 }} />
        ) : (
          <>
            <div className="candy-text" style={{ fontSize: 112, lineHeight: 1 }}>
              Hành trình quay về tuổi thơ
            </div>
            <div style={{ marginTop: 18, fontSize: 34, fontWeight: 800, color: 'var(--blue-deep)' }}>Happy Birthday · Cùng chơi trò ngày xưa nào!</div>
          </>
        )}
      </motion.div>

      <div style={{ position: 'absolute', top: 400, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 80 }}>
        <GameCard game="caro" title="Cờ caro" subtitle="Ai xếp đủ 5 quân trước sẽ thắng" delay={0.1} />
        <GameCard game="oaq" title="Ô ăn quan" subtitle="Rải sỏi, ăn quan, ai nhiều điểm hơn thắng" delay={0.2} />
      </div>

      <div style={{ position: 'absolute', left: 40, bottom: 20 }}>
        <Mascot color={players[0].color} pose="wave" size={330} />
      </div>
      <div style={{ position: 'absolute', right: 40, bottom: 20 }}>
        {cake ? <img src={cake} alt="" style={{ height: 300 }} /> : <Mascot color={players[1].color} pose="cake" size={330} />}
      </div>
    </div>
  );
}
