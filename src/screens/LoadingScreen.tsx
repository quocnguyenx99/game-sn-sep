import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { allImageUrls } from '../assets/registry';
import { audio } from '../audio/engine';
import { MenuBackground } from '../backgrounds/Backgrounds';
import { useGame } from '../store/useGame';
import { Button } from '../ui/Button';
import { Mascot } from '../ui/Mascot';
import { enterLandscapeFullscreen } from '../ui/Stage';

/** Nạp trước ảnh + font để vào game không bị giật, rồi chờ người dùng bấm để mở khóa âm thanh. */
export function LoadingScreen() {
  const go = useGame((s) => s.go);
  const players = useGame((s) => s.players);
  const [progress, setProgress] = useState(0);
  const ready = progress >= 1;

  useEffect(() => {
    const urls = allImageUrls();
    const total = urls.length + 1;
    let done = 0;
    const tick = () => setProgress(++done / total);
    urls.forEach((u) => {
      const im = new Image();
      im.onload = im.onerror = tick;
      im.src = u;
      void im.decode?.().catch(() => undefined);
    });
    // đợi font + tối thiểu 0.9s để thanh tiến trình kịp hiện
    void Promise.all([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(tick);
  }, []);

  return (
    <div className="screen">
      <MenuBackground />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }}>
          <Mascot color={players[0].color} pose="wave" size={360} />
        </motion.div>
        <div className="candy-text" style={{ fontSize: 96, textAlign: 'center', lineHeight: 1.05 }}>
          Hành trình
          <br />
          quay về tuổi thơ
        </div>
        <div style={{ height: 110, display: 'grid', placeItems: 'center' }}>
          {ready ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
              <Button
                variant="gold"
                style={{ fontSize: 46, padding: '20px 70px 26px' }}
                onClick={() => {
                  audio.unlock();
                  void enterLandscapeFullscreen();
                  go('menu');
                }}
              >
                Bắt đầu hành trình!
              </Button>
            </motion.div>
          ) : (
            <div style={{ width: 640, height: 34, borderRadius: 999, background: '#fff', border: '5px solid #fff', boxShadow: '0 8px 20px rgba(0,0,0,.2)', overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, var(--gold), var(--orange))' }}
                animate={{ width: `${Math.max(8, progress * 100)}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
