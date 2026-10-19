import { motion } from 'framer-motion';
import { useState } from 'react';
import { MenuBackground } from '../backgrounds/Backgrounds';
import { useGame, type CatColor, type PlayerInfo } from '../store/useGame';
import { Button } from '../ui/Button';
import { Mascot } from '../ui/Mascot';
import { Seg } from '../ui/SettingsModal';
import { TopBar } from '../ui/TopBar';

const GAME_NAME = { caro: 'Cờ caro', oaq: 'Ô ăn quan' };

export function SetupScreen() {
  const game = useGame((s) => s.pendingGame);
  const stored = useGame((s) => s.players);
  const leaderboard = useGame((s) => s.leaderboard);
  const startGame = useGame((s) => s.startGame);
  const go = useGame((s) => s.go);
  const [players, setPlayers] = useState<[PlayerInfo, PlayerInfo]>([{ ...stored[0] }, { ...stored[1] }]);

  const knownNames = Object.values(leaderboard)
    .sort((a, b) => b.wins - a.wins)
    .map((r) => r.name)
    .slice(0, 12);

  const setName = (i: 0 | 1, name: string) =>
    setPlayers((p) => {
      const n: typeof p = [{ ...p[0] }, { ...p[1] }];
      n[i].name = name.slice(0, 20);
      return n;
    });
  const setColor = (i: 0 | 1, color: CatColor) =>
    setPlayers((p) => {
      const n: typeof p = [{ ...p[0] }, { ...p[1] }];
      n[i].color = color;
      n[i === 0 ? 1 : 0].color = color === 'gold' ? 'orange' : 'gold';
      return n;
    });

  const names = players.map((p) => p.name.trim());
  const valid = names[0] && names[1] && names[0].toLocaleLowerCase('vi') !== names[1].toLocaleLowerCase('vi');

  return (
    <div className="screen">
      <MenuBackground />
      <TopBar onBack={() => go('menu')} title={GAME_NAME[game]} />
      <div className="candy-text" style={{ position: 'absolute', top: 140, width: '100%', textAlign: 'center', fontSize: 70 }}>
        Ai sẽ thi đấu nào?
      </div>

      <div style={{ position: 'absolute', top: 260, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 50 }}>
        {([0, 1] as const).map((i) => (
          <motion.div
            key={i}
            className="panel"
            initial={{ x: i === 0 ? -120 : 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{ width: 640, padding: '26px 40px 34px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}
          >
            <div style={{ fontSize: 30, fontWeight: 800, color: i === 0 ? 'var(--blue)' : 'var(--orange-deep)' }}>
              Người chơi {i + 1} {game === 'caro' && (i === 0 ? '· quân X' : '· quân O')}
              {game === 'oaq' && (i === 0 ? '· hàng dưới' : '· hàng trên')}
            </div>
            <Mascot color={players[i].color} pose="wave" size={240} />
            <div style={{ width: '100%' }}>
              <label className="field-label">Tên</label>
              <input
                className="text-input"
                value={players[i].name}
                maxLength={20}
                placeholder="Nhập tên…"
                list="known-names"
                onChange={(e) => setName(i, e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && valid && startGame(players)}
              />
            </div>
            <Seg<CatColor>
              value={players[i].color}
              options={[
                ['gold', 'Mèo Vàng'],
                ['orange', 'Mèo Cam'],
              ]}
              onChange={(c) => setColor(i, c)}
            />
          </motion.div>
        ))}
        <div className="candy-text" style={{ position: 'absolute', fontSize: 90, pointerEvents: 'none' }}>
          VS
        </div>
      </div>
      <datalist id="known-names">
        {knownNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      <div style={{ position: 'absolute', bottom: 50, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', background: 'rgba(255,255,255,.8)', padding: '4px 20px', borderRadius: 999 }}>
          {valid ? 'Người đi trước sẽ đổi luân phiên mỗi ván — ván đầu: Người chơi 1' : 'Hãy nhập 2 tên khác nhau nhé!'}
        </div>
        <Button variant="gold" disabled={!valid} style={{ fontSize: 44, padding: '18px 80px 24px' }} onClick={() => startGame([{ ...players[0], name: names[0] }, { ...players[1], name: names[1] }])}>
          Vào chơi!
        </Button>
      </div>
    </div>
  );
}
