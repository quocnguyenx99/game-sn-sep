import { motion } from 'framer-motion';
import { MenuBackground } from '../backgrounds/Backgrounds';
import { useGame } from '../store/useGame';
import { TopBar } from '../ui/TopBar';

const MEDAL = ['#FFC61A', '#C9D3E6', '#E39A5B'];

export function LeaderboardScreen() {
  const go = useGame((s) => s.go);
  const board = useGame((s) => s.leaderboard);
  const rows = Object.values(board).sort((a, b) => b.wins - a.wins || a.losses - b.losses || a.name.localeCompare(b.name, 'vi'));

  return (
    <div className="screen">
      <MenuBackground />
      <TopBar onBack={() => go('menu')} title="Bảng xếp hạng" />
      <div className="panel" style={{ position: 'absolute', top: 150, left: 260, right: 260, bottom: 60, padding: '30px 44px', overflow: 'auto' }}>
        {rows.length === 0 ? (
          <div style={{ height: '100%', display: 'grid', placeItems: 'center', fontSize: 40, fontWeight: 800, color: 'var(--ink-soft)' }}>
            Chưa có ai thi đấu. Vào chơi ngay nào!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px', fontSize: 32, fontWeight: 700 }}>
            <thead>
              <tr style={{ color: 'var(--ink-soft)', fontSize: 24, textAlign: 'center' }}>
                <th style={{ width: 90 }}>Hạng</th>
                <th style={{ textAlign: 'left' }}>Tên</th>
                <th>Thắng</th>
                <th>Hòa</th>
                <th>Thua</th>
                <th>Thắng caro</th>
                <th>Thắng ô ăn quan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <motion.tr
                  key={r.name}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i, 12) * 0.05 }}
                  style={{ background: i < 3 ? '#FFF6D6' : '#F7F3FF', textAlign: 'center' }}
                >
                  <td style={{ padding: '10px 0', borderRadius: '20px 0 0 20px' }}>
                    <span
                      style={{
                        display: 'inline-grid',
                        placeItems: 'center',
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: MEDAL[i] ?? '#E8E0F7',
                        border: '4px solid #fff',
                        fontWeight: 800,
                      }}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td style={{ textAlign: 'left', fontWeight: 800 }}>{r.name}</td>
                  <td style={{ color: 'var(--blue)', fontWeight: 800, fontSize: 40 }}>{r.wins}</td>
                  <td>{r.draws}</td>
                  <td>{r.losses}</td>
                  <td>{r.caro}</td>
                  <td style={{ borderRadius: '0 20px 20px 0' }}>{r.oaq}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
