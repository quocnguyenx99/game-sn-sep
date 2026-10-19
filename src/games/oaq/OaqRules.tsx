import { AnimatePresence, motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { useGame } from '../../store/useGame';
import { Button } from '../../ui/Button';
import { IconArrow } from '../../ui/Icons';
import { Modal } from '../../ui/Modal';
import { Stone } from './Stone';

type Tone = 'sel' | 'last' | 'next' | 'cap' | 'empty' | 'stop';
interface MiniPit {
  n: number;
  quan?: boolean;
  tone?: Tone;
  tag?: string;
  order?: number;
}

const TONE_BG: Record<Tone, string> = {
  sel: 'rgba(255, 220, 90, .65)',
  last: 'rgba(255, 111, 168, .45)',
  next: 'rgba(79, 124, 255, .35)',
  cap: 'rgba(27, 183, 166, .45)',
  empty: 'rgba(255,255,255,.25)',
  stop: 'rgba(229, 64, 47, .35)',
};

function MiniRow({ pits, arrow }: { pits: MiniPit[]; arrow?: 'right' | 'both' }) {
  return (
    <div style={{ position: 'relative', display: 'flex', gap: 0, padding: '46px 0 10px', justifyContent: 'center' }}>
      {pits.map((p, i) => (
        <div key={i} style={{ position: 'relative' }}>
          {p.tag && (
            <div style={{ position: 'absolute', top: -42, left: 0, right: 0, textAlign: 'center', fontSize: 21, fontWeight: 800, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{p.tag}</div>
          )}
          <div
            style={{
              width: p.quan ? 104 : 118,
              height: 118,
              borderRadius: p.quan ? (i === 0 ? '60px 0 0 60px' : '0 60px 60px 0') : 0,
              border: '5px solid #FFF9EC',
              marginLeft: i ? -5 : 0,
              background: p.tone ? TONE_BG[p.tone] : 'transparent',
              display: 'flex',
              flexWrap: 'wrap',
              alignContent: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: 8,
              position: 'relative',
            }}
          >
            {p.quan && p.n >= 0 && <Stone size={44} quan />}
            {Array.from({ length: Math.min(p.n, 9) }, (_, k) => (
              <Stone key={k} size={20} hue={(k + i) % 5} />
            ))}
            {p.order && (
              <div style={{ position: 'absolute', right: -8, bottom: -8, width: 36, height: 36, borderRadius: '50%', background: p.tone === 'last' ? 'var(--pink)' : 'var(--blue)', color: '#fff', border: '3px solid #fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 19 }}>
                {p.order}
              </div>
            )}
          </div>
        </div>
      ))}
      {arrow && (
        <div style={{ position: 'absolute', bottom: -40, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 20, color: 'var(--blue)' }}>
          {arrow === 'both' && (
            <span style={{ width: 54, height: 54 }}>
              <IconArrow dir="left" />
            </span>
          )}
          <span style={{ width: 54, height: 54 }}>
            <IconArrow dir="right" />
          </span>
        </div>
      )}
    </div>
  );
}

const Ground = ({ children }: { children: ReactNode }) => (
  <div style={{ borderRadius: 32, padding: '18px 26px 52px', background: 'radial-gradient(circle at 50% 40%, #DFAE74, #C08549)', display: 'flex', flexDirection: 'column', gap: 30, alignItems: 'center' }}>
    {children}
  </div>
);

interface Slide {
  title: string;
  body: ReactNode;
  pic: ReactNode;
}

function buildSlides(quanNon: boolean): Slide[] {
  const dan5 = Array.from({ length: 5 }, () => ({ n: 5 }));
  return [
    {
      title: '1. Bàn chơi',
      body: (
        <>
          Bàn có <b>10 ô dân</b> và <b>2 ô quan</b> ở hai đầu. Mỗi người sở hữu <b>5 ô dân</b> ở hàng của mình (Người chơi 1: hàng dưới, Người chơi 2: hàng trên), mỗi ô có sẵn 5 sỏi.
          <br />
          Tính điểm: <b>1 sỏi dân = 1 điểm</b>, <b>1 viên quan = 10 điểm</b>.
        </>
      ),
      pic: (
        <Ground>
          <MiniRow pits={[{ n: 0, quan: true, tag: 'Quan' }, ...dan5, { n: 0, quan: true, tag: 'Quan' }]} />
        </Ground>
      ),
    },
    {
      title: '2. Chọn ô và hướng rải',
      body: (
        <>
          Đến lượt, chọn <b>1 ô dân có sỏi</b> ở hàng của bạn (ô đang nhấp nháy vàng), rồi bấm mũi tên <b>trái</b> hoặc <b>phải</b>.
          <br />
          Rê chuột lên mũi tên để xem trước đường rải được đánh số 1, 2, 3… Bạn cũng có thể bấm phím ← →.
        </>
      ),
      pic: (
        <Ground>
          <MiniRow arrow="both" pits={[{ n: 2 }, { n: 3, tone: 'sel', tag: 'Chọn ô này' }, { n: 1 }, { n: 4 }]} />
        </Ground>
      ),
    },
    {
      title: '3. Rải sỏi',
      body: (
        <>
          Bốc hết sỏi trong ô đã chọn, rồi <b>rải lần lượt mỗi ô 1 viên</b> theo hướng đã chọn, rải cả vào ô quan. Bạn chỉnh được tốc độ rải ở góc phải dưới, hoặc bấm <b>Tạm dừng</b> để xem kỹ.
        </>
      ),
      pic: (
        <Ground>
          <MiniRow arrow="right" pits={[{ n: 0, tone: 'sel', tag: 'Bốc 3' }, { n: 3, order: 1, tone: 'next' }, { n: 2, order: 2, tone: 'next' }, { n: 5, order: 3, tone: 'last', tag: 'Viên cuối' }, { n: 2 }]} />
        </Ground>
      ),
    },
    {
      title: '4. Bốc tiếp',
      body: (
        <>
          Rải hết sỏi trên tay, nhìn <b>ô kế tiếp</b>: nếu đó là ô dân còn sỏi thì <b>bốc hết lên và rải tiếp</b> theo cùng hướng.
        </>
      ),
      pic: (
        <Ground>
          <MiniRow arrow="right" pits={[{ n: 2 }, { n: 4, tone: 'last', tag: 'Viên cuối' }, { n: 3, tone: 'next', tag: 'Bốc tiếp!' }, { n: 1 }]} />
        </Ground>
      ),
    },
    {
      title: '5. Ăn sỏi',
      body: (
        <>
          Nếu ô kế tiếp <b>trống</b> và ô sau đó <b>có sỏi</b> → bạn <b>ĂN</b> hết sỏi ô đó, kể cả viên quan.
          <br />
          Sau khi ăn, nếu tiếp tục là <b>1 ô trống rồi 1 ô có sỏi</b> → <b>ăn liên tiếp</b>!
        </>
      ),
      pic: (
        <Ground>
          <MiniRow arrow="right" pits={[{ n: 3, tone: 'last', tag: 'Viên cuối' }, { n: 0, tone: 'empty', tag: 'Trống' }, { n: 6, tone: 'cap', tag: 'Ăn +6' }, { n: 0, tone: 'empty', tag: 'Trống' }, { n: 2, tone: 'cap', tag: 'Ăn tiếp +2' }]} />
        </Ground>
      ),
    },
    {
      title: '6. Khi nào mất lượt?',
      body: (
        <>
          Lượt của bạn kết thúc khi:
          <br />• Gặp <b>2 ô trống liền nhau</b>.
          <br />• Ô kế tiếp là <b>ô quan</b> (không được bốc ô quan để rải).
          <br />• Đã ăn xong và ô tiếp theo không trống.
          {quanNon && (
            <>
              <br />• <b>Quan non</b> (đang bật): ô quan còn dưới 5 sỏi dân thì chưa được ăn.
            </>
          )}
        </>
      ),
      pic: (
        <Ground>
          <MiniRow pits={[{ n: 2, tone: 'last', tag: 'Viên cuối' }, { n: 0, tone: 'stop', tag: 'Trống' }, { n: 0, tone: 'stop', tag: 'Trống' }, { n: 3 }]} />
          <MiniRow pits={[{ n: 1 }, { n: 2, tone: 'last', tag: 'Viên cuối' }, { n: 0, quan: true, tone: 'stop', tag: 'Ô quan' }]} />
        </Ground>
      ),
    },
    {
      title: '7. Hàng của mình hết sỏi',
      body: (
        <>
          Đến lượt mà cả 5 ô dân của bạn đều trống: dùng <b>5 điểm đã ăn</b> rải lại mỗi ô 1 viên (máy tự làm giúp).
          <br />
          Nếu <b>không đủ 5 điểm</b> → <b>thua ngay</b> ván đó!
        </>
      ),
      pic: (
        <Ground>
          <MiniRow pits={Array.from({ length: 5 }, (_, i) => ({ n: 1, tone: 'next' as const, tag: i === 2 ? '−5 điểm, rải lại' : undefined }))} />
        </Ground>
      ),
    },
    {
      title: '8. Kết thúc và tính điểm',
      body: (
        <>
          Khi <b>cả 2 ô quan đã bị ăn hết</b>: "hết quan, tàn dân, thu quân kéo về". Sỏi còn lại ở hàng của ai thì về người đó.
          <br />
          <b>Điểm = số dân × 1 + số quan × 10</b>. Ai nhiều điểm hơn sẽ thắng! Bảng điểm hai bên luôn cập nhật trực tiếp trong ván.
        </>
      ),
      pic: (
        <div className="panel" style={{ padding: '24px 34px', fontSize: 30, fontWeight: 800, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Stone size={30} hue={1} /> 23 dân × 1 = 23
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Stone size={36} quan /> 1 quan × 10 = 10
          </div>
          <div style={{ borderTop: '4px dashed #e2d8f5', paddingTop: 10, color: 'var(--blue)', fontSize: 40 }}>Tổng: 33 điểm</div>
        </div>
      ),
    },
  ];
}

export function OaqRules({ open, onClose }: { open: boolean; onClose: () => void }) {
  const quanNon = useGame((s) => s.settings.quanNon);
  const slides = buildSlides(quanNon);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const goTo = (n: number) => {
    setDir(n > i ? 1 : -1);
    setI(Math.max(0, Math.min(slides.length - 1, n)));
  };
  const s = slides[i];

  return (
    <Modal open={open} onClose={onClose} title="Cách chơi Ô ăn quan" width={1500}>
      <div style={{ position: 'relative', height: 520, overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={i}
            custom={dir}
            initial={{ x: dir * 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: dir * -120, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ position: 'absolute', inset: 0, display: 'flex', gap: 46, alignItems: 'center' }}
          >
            <div style={{ flex: '0 0 760px', display: 'grid', placeItems: 'center' }}>{s.pic}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--blue)', marginBottom: 12 }}>{s.title}</div>
              <div style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.4 }}>{s.body}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, marginTop: 20 }}>
        <Button variant="white" size="small" disabled={i === 0} onClick={() => goTo(i - 1)}>
          Trước
        </Button>
        <div style={{ display: 'flex', gap: 10 }}>
          {slides.map((_, k) => (
            <button
              key={k}
              onClick={() => goTo(k)}
              aria-label={`Trang ${k + 1}`}
              style={{ width: k === i ? 44 : 18, height: 18, borderRadius: 999, border: 0, cursor: 'pointer', background: k === i ? 'var(--blue)' : '#d9d0ea', transition: 'all .25s' }}
            />
          ))}
        </div>
        {i < slides.length - 1 ? (
          <Button variant="gold" size="small" onClick={() => goTo(i + 1)}>
            Tiếp
          </Button>
        ) : (
          <Button variant="teal" size="small" onClick={onClose}>
            Đã hiểu, chơi thôi!
          </Button>
        )}
      </div>
    </Modal>
  );
}
