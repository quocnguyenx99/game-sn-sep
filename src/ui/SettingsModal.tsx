import { useState, type ReactNode } from 'react';
import { useGame, type CatColor, type Track } from '../store/useGame';
import { Button } from './Button';
import { Modal } from './Modal';
import { Mascot } from './Mascot';
import { toggleFullscreen } from './TopBar';

type Tab = 'sound' | 'players' | 'visual' | 'rules';
const TABS: [Tab, string][] = [
  ['sound', 'Âm thanh'],
  ['players', 'Người chơi'],
  ['visual', 'Hình ảnh'],
  ['rules', 'Luật chơi'],
];

const Row = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 32, padding: '18px 0', borderBottom: '3px dashed #eee7fa' }}>
    <div style={{ width: 380, flex: 'none' }}>
      <div style={{ fontSize: 30, fontWeight: 800 }}>{label}</div>
      {hint && <div style={{ fontSize: 21, color: 'var(--ink-soft)', lineHeight: 1.25 }}>{hint}</div>}
    </div>
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 20 }}>{children}</div>
  </div>
);

function Slider({ value, min, max, step, onChange }: { value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <input
      className="slider"
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      style={{ ['--p' as string]: `${p}%` }}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

export function Seg<T extends string | number>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="seg">
      {options.map(([v, label]) => (
        <button key={String(v)} className={v === value ? 'on' : ''} onClick={() => onChange(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}

const Toggle = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => (
  <button className={`toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)} aria-pressed={on} />
);

export const speedLabel = (ms: number) => (ms >= 900 ? 'Rất chậm' : ms >= 600 ? 'Chậm' : ms >= 350 ? 'Vừa' : ms >= 200 ? 'Nhanh' : 'Rất nhanh');

/** Thanh trượt tốc độ rải sỏi (đảo chiều: kéo sang phải là nhanh hơn). */
export function SpeedSlider() {
  const sowDelay = useGame((s) => s.settings.sowDelay);
  const update = useGame((s) => s.updateSettings);
  return <Slider value={1350 - sowDelay} min={150} max={1200} step={50} onChange={(v) => update({ sowDelay: 1350 - v })} />;
}

export function SettingsModal() {
  const open = useGame((s) => s.settingsOpen);
  const setOpen = useGame((s) => s.setSettingsOpen);
  const settings = useGame((s) => s.settings);
  const update = useGame((s) => s.updateSettings);
  const players = useGame((s) => s.players);
  const setPlayers = useGame((s) => s.setPlayers);
  const resetLeaderboard = useGame((s) => s.resetLeaderboard);
  const [tab, setTab] = useState<Tab>('sound');
  const [confirmReset, setConfirmReset] = useState(false);

  const setName = (i: 0 | 1, name: string) => {
    const next: typeof players = [{ ...players[0] }, { ...players[1] }];
    next[i].name = name.slice(0, 20);
    setPlayers(next);
  };
  const setColor = (i: 0 | 1, color: CatColor) => {
    const next: typeof players = [{ ...players[0] }, { ...players[1] }];
    next[i].color = color;
    next[i === 0 ? 1 : 0].color = color === 'gold' ? 'orange' : 'gold';
    setPlayers(next);
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Cài đặt" width={1280}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
        <Seg value={tab} options={TABS} onChange={setTab} />
      </div>
      <div style={{ minHeight: 520 }}>
        {tab === 'sound' && (
          <>
            <Row label="Nhạc nền" hint="Nhạc phát xuyên suốt trò chơi">
              <Seg<Track>
                value={settings.track}
                options={[
                  ['chiptune', 'Tuổi thơ 8-bit'],
                  ['birthday', 'Happy Birthday 8-bit'],
                  ['off', 'Tắt nhạc'],
                ]}
                onChange={(track) => update({ track })}
              />
            </Row>
            <Row label={`Âm lượng nhạc · ${Math.round(settings.musicVolume * 100)}%`}>
              <Slider value={settings.musicVolume} min={0} max={1} step={0.05} onChange={(musicVolume) => update({ musicVolume })} />
            </Row>
            <Row label={`Hiệu ứng âm thanh · ${Math.round(settings.sfxVolume * 100)}%`} hint="Tiếng đặt quân, tiếng sỏi, tiếng ăn điểm…">
              <Slider value={settings.sfxVolume} min={0} max={1} step={0.05} onChange={(sfxVolume) => update({ sfxVolume })} />
            </Row>
            <Row label="Tắt toàn bộ âm thanh">
              <Toggle on={settings.muted} onChange={(muted) => update({ muted })} />
            </Row>
          </>
        )}

        {tab === 'players' && (
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', paddingTop: 10 }}>
            {([0, 1] as const).map((i) => (
              <div key={i} className="panel" style={{ width: 520, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <Mascot color={players[i].color} pose="wave" size={200} />
                <div style={{ width: '100%' }}>
                  <label className="field-label">Tên người chơi {i + 1}</label>
                  <input className="text-input" value={players[i].name} maxLength={20} onChange={(e) => setName(i, e.target.value)} />
                </div>
                <Seg<CatColor>
                  value={players[i].color}
                  options={[
                    ['gold', 'Mèo Vàng'],
                    ['orange', 'Mèo Cam'],
                  ]}
                  onChange={(c) => setColor(i, c)}
                />
              </div>
            ))}
          </div>
        )}

        {tab === 'visual' && (
          <>
            <Row label="Bầu trời" hint="Đổi tông màu của bối cảnh">
              <Seg
                value={settings.theme}
                options={[
                  ['day', 'Ban ngày'],
                  ['sunset', 'Hoàng hôn'],
                ]}
                onChange={(theme) => update({ theme })}
              />
            </Row>
            <Row label="Giảm hiệu ứng" hint="Tắt chuyển động trang trí, dùng khi máy yếu hoặc màn chiếu bị giật">
              <Toggle on={settings.reduceMotion} onChange={(reduceMotion) => update({ reduceMotion })} />
            </Row>
            <Row label="Toàn màn hình" hint="Phím tắt: F11">
              <Button variant="teal" size="small" onClick={toggleFullscreen}>
                Bật / tắt toàn màn hình
              </Button>
            </Row>
          </>
        )}

        {tab === 'rules' && (
          <>
            <Row label={`Tốc độ rải sỏi · ${speedLabel(settings.sowDelay)}`} hint="Ô ăn quan: thời gian cho mỗi viên sỏi rơi">
              <span style={{ fontSize: 22, fontWeight: 700 }}>Chậm</span>
              <SpeedSlider />
              <span style={{ fontSize: 22, fontWeight: 700 }}>Nhanh</span>
            </Row>
            <Row label="Luật quan non" hint="Ô quan còn ít hơn 5 sỏi dân thì chưa được ăn">
              <Toggle on={settings.quanNon} onChange={(quanNon) => update({ quanNon })} />
            </Row>
            <Row label="Bảng xếp hạng" hint="Xoá toàn bộ thành tích đã lưu trên máy này">
              {confirmReset ? (
                <>
                  <Button
                    variant="orange"
                    size="small"
                    onClick={() => {
                      resetLeaderboard();
                      setConfirmReset(false);
                    }}
                  >
                    Chắc chắn xoá
                  </Button>
                  <Button variant="white" size="small" onClick={() => setConfirmReset(false)}>
                    Thôi
                  </Button>
                </>
              ) : (
                <Button variant="white" size="small" onClick={() => setConfirmReset(true)}>
                  Xoá bảng xếp hạng
                </Button>
              )}
            </Row>
          </>
        )}
      </div>
    </Modal>
  );
}
