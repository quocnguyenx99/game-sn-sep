import type { ReactNode } from 'react';
import { useGame } from '../store/useGame';
import { Button } from './Button';
import { IconBack, IconFull, IconGear, IconSound } from './Icons';

export function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen?.().catch(() => undefined);
}

interface Props {
  title?: ReactNode;
  center?: ReactNode;
  actions?: ReactNode;
  onBack?: () => void;
}

export function TopBar({ title, center, actions, onBack }: Props) {
  const muted = useGame((s) => s.settings.muted);
  const updateSettings = useGame((s) => s.updateSettings);
  const setSettingsOpen = useGame((s) => s.setSettingsOpen);
  return (
    <div className="topbar">
      {onBack && (
        <Button variant="white" size="icon" onClick={onBack} title="Về menu">
          <IconBack />
        </Button>
      )}
      {title && <div className="candy-text game-title">{title}</div>}
      <div className="spacer" />
      {center}
      <div className="spacer" />
      {actions}
      <Button variant="white" size="icon" onClick={() => updateSettings({ muted: !muted })} title={muted ? 'Bật tiếng' : 'Tắt tiếng'}>
        <IconSound on={!muted} />
      </Button>
      <Button variant="white" size="icon" onClick={toggleFullscreen} title="Toàn màn hình">
        <IconFull />
      </Button>
      <Button variant="blue" size="icon" onClick={() => setSettingsOpen(true)} title="Cài đặt">
        <IconGear />
      </Button>
    </div>
  );
}
