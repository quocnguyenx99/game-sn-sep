import { motion } from 'framer-motion';
import { useState } from 'react';
import { MenuBackground } from '../backgrounds/Backgrounds';
import { useGame, type CatColor, type PlayerInfo } from '../store/useGame';
import { Button } from '../ui/Button';
import { Mascot } from '../ui/Mascot';
import { Seg } from '../ui/SettingsModal';
import { TopBar } from '../ui/TopBar';

const GAME_NAME = { caro: 'Cờ caro', oaq: 'Ô ăn quan', monopoly: 'Cờ Tỷ Phú NKC' };

const ALL_COLORS: [CatColor, string][] = [
  ['gold', 'Vàng'],
  ['orange', 'Cam'],
  ['cyan', 'Xanh'],
  ['pink', 'Hồng'],
];

export function SetupScreen() {
  const game = useGame((s) => s.pendingGame);
  const storedPlayers = useGame((s) => s.players);
  const storedMonopoly = useGame((s) => s.monopolyPlayers);
  const leaderboard = useGame((s) => s.leaderboard);
  const startGame = useGame((s) => s.startGame);
  const startMonopolyGame = useGame((s) => s.startMonopolyGame);
  const go = useGame((s) => s.go);

  // 2-player state for Caro / OAQ
  const [players2, setPlayers2] = useState<[PlayerInfo, PlayerInfo]>([
    { ...storedPlayers[0] },
    { ...storedPlayers[1] },
  ]);

  // Monopoly state (2 to 4 players)
  const [monopolyCount, setMonopolyCount] = useState<number>(storedMonopoly.length >= 2 ? storedMonopoly.length : 4);
  const [mPlayers, setMPlayers] = useState<PlayerInfo[]>(() => {
    const defaults: PlayerInfo[] = [
      { name: 'Mèo Vàng (Bạn)', color: 'gold', isBot: false },
      { name: 'Mèo Cam (Bot)', color: 'orange', isBot: true },
      { name: 'Mèo Xanh (Bot)', color: 'cyan', isBot: true },
      { name: 'Mèo Hồng (Bot)', color: 'pink', isBot: true },
    ];
    return storedMonopoly.length >= 2 ? storedMonopoly : defaults;
  });

  const knownNames = Object.values(leaderboard)
    .sort((a, b) => b.wins - a.wins)
    .map((r) => r.name)
    .slice(0, 12);

  // 2-player handlers
  const setName2 = (i: 0 | 1, name: string) =>
    setPlayers2((p) => {
      const n: typeof p = [{ ...p[0] }, { ...p[1] }];
      n[i].name = name.slice(0, 20);
      return n;
    });

  const setColor2 = (i: 0 | 1, color: CatColor) =>
    setPlayers2((p) => {
      const n: typeof p = [{ ...p[0] }, { ...p[1] }];
      n[i].color = color;
      n[i === 0 ? 1 : 0].color = color === 'gold' ? 'orange' : 'gold';
      return n;
    });

  // Monopoly handlers
  const setMName = (idx: number, name: string) => {
    setMPlayers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], name: name.slice(0, 20) };
      return next;
    });
  };

  const setMColor = (idx: number, color: CatColor) => {
    setMPlayers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], color };
      return next;
    });
  };

  const toggleMBot = (idx: number, isBot: boolean) => {
    setMPlayers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], isBot };
      return next;
    });
  };

  // Validation
  const isMonopoly = game === 'monopoly';
  const activeMPlayers = mPlayers.slice(0, monopolyCount);
  const valid2 =
    players2[0].name.trim() &&
    players2[1].name.trim() &&
    players2[0].name.trim().toLocaleLowerCase('vi') !== players2[1].name.trim().toLocaleLowerCase('vi');
  const validM = activeMPlayers.every((p) => p.name.trim().length > 0);

  return (
    <div className="screen">
      <MenuBackground />
      <TopBar onBack={() => go('menu')} title={GAME_NAME[game]} />

      <div
        className="candy-text"
        style={{ position: 'absolute', top: 110, width: '100%', textAlign: 'center', fontSize: 62 }}
      >
        {isMonopoly ? 'Chọn Số Người Chơi & Linh Vật' : 'Ai sẽ thi đấu nào?'}
      </div>

      {isMonopoly ? (
        /* SETUP CHO CỜ TỶ PHÚ (2 - 4 NGƯỜI) */
        <div
          style={{
            position: 'absolute',
            top: 200,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
          }}
        >
          {/* Chọn số lượng người chơi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)' }}>Số lượng đấu thủ:</span>
            <div style={{ display: 'flex', gap: 10 }}>
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => setMonopolyCount(count)}
                  style={{
                    padding: '8px 24px',
                    borderRadius: 999,
                    border: 'none',
                    fontSize: 20,
                    fontWeight: 800,
                    cursor: 'pointer',
                    background: monopolyCount === count ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' : '#FFFFFF',
                    color: monopolyCount === count ? '#FFFFFF' : 'var(--ink)',
                    boxShadow: monopolyCount === count ? '0 4px 12px rgba(59,130,246,0.35)' : '0 2px 6px rgba(0,0,0,0.1)',
                    fontFamily: 'inherit',
                  }}
                >
                  {count} Người
                </button>
              ))}
            </div>
          </div>

          {/* Danh sách các thẻ người chơi */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, width: '100%', maxWidth: 1720 }}>
            {activeMPlayers.map((p, i) => (
              <motion.div
                key={i}
                className="panel"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  flex: 1,
                  maxWidth: 380,
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>Đấu thủ {i + 1}</div>

                <Mascot color={p.color} pose="wave" size={170} />

                {/* Chế độ: Người thật hoặc Bot AI */}
                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                  <button
                    onClick={() => toggleMBot(i, false)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: 10,
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: !p.isBot ? '#3B82F6' : '#F1F5F9',
                      color: !p.isBot ? '#fff' : '#64748B',
                      fontFamily: 'inherit',
                    }}
                  >
                    👤 Người thật
                  </button>
                  <button
                    onClick={() => toggleMBot(i, true)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: 10,
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: 'pointer',
                      background: p.isBot ? '#8B5CF6' : '#F1F5F9',
                      color: p.isBot ? '#fff' : '#64748B',
                      fontFamily: 'inherit',
                    }}
                  >
                    🤖 Máy (Bot AI)
                  </button>
                </div>

                {/* Nhập tên */}
                <div style={{ width: '100%' }}>
                  <label className="field-label">Tên</label>
                  <input
                    className="text-input"
                    value={p.name}
                    maxLength={20}
                    placeholder="Nhập tên…"
                    onChange={(e) => setMName(i, e.target.value)}
                  />
                </div>

                {/* Chọn màu mèo */}
                <div style={{ width: '100%' }}>
                  <label className="field-label">Màu Mèo</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {ALL_COLORS.map(([c, label]) => (
                      <button
                        key={c}
                        onClick={() => setMColor(i, c)}
                        style={{
                          flex: 1,
                          padding: '6px 2px',
                          borderRadius: 8,
                          border: p.color === c ? '2px solid #000' : '1px solid #CBD5E1',
                          background: p.color === c ? '#F8FAFC' : '#FFFFFF',
                          fontWeight: p.color === c ? 800 : 500,
                          fontSize: 13,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Nút Bắt đầu */}
          <div style={{ marginTop: 12 }}>
            <Button
              variant="gold"
              size="normal"
              disabled={!validM}
              onClick={() => {
                startMonopolyGame(activeMPlayers);
              }}
            >
              🎲 Vào Bàn Cờ Tỷ Phú!
            </Button>
          </div>
        </div>
      ) : (
        /* SETUP CHO CARO & Ô ĂN QUAN (2 NGƯỜI) */
        <>
          <div
            style={{
              position: 'absolute',
              top: 260,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 50,
            }}
          >
            {([0, 1] as const).map((i) => (
              <motion.div
                key={i}
                className="panel"
                initial={{ x: i === 0 ? -120 : 120, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                style={{
                  width: 640,
                  padding: '26px 40px 34px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 18,
                }}
              >
                <div style={{ fontSize: 30, fontWeight: 800, color: i === 0 ? 'var(--blue)' : 'var(--orange-deep)' }}>
                  Người chơi {i + 1} {game === 'caro' && (i === 0 ? '· quân X' : '· quân O')}
                  {game === 'oaq' && (i === 0 ? '· hàng dưới' : '· hàng trên')}
                </div>
                <Mascot color={players2[i].color} pose="wave" size={240} />
                <div style={{ width: '100%' }}>
                  <label className="field-label">Tên</label>
                  <input
                    className="text-input"
                    value={players2[i].name}
                    maxLength={20}
                    placeholder="Nhập tên…"
                    list="known-names"
                    onChange={(e) => setName2(i, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && valid2 && startGame(players2)}
                  />
                </div>
                <Seg<CatColor>
                  value={players2[i].color}
                  options={[
                    ['gold', 'Mèo Vàng'],
                    ['orange', 'Mèo Cam'],
                  ]}
                  onChange={(c) => setColor2(i, c)}
                />
              </motion.div>
            ))}
            <div className="candy-text" style={{ position: 'absolute', fontSize: 90, pointerEvents: 'none' }}>
              VS
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 50,
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--ink)',
                background: 'rgba(255,255,255,.8)',
                padding: '4px 20px',
                borderRadius: 999,
              }}
            >
              {valid2 ? 'Người đi trước sẽ đổi luân phiên mỗi ván' : 'Hãy nhập 2 tên khác nhau nhé!'}
            </div>
            <Button variant="gold" size="normal" disabled={!valid2} onClick={() => startGame(players2)}>
              Vào trận thôi!
            </Button>
          </div>
        </>
      )}

      <datalist id="known-names">
        {knownNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
    </div>
  );
}
