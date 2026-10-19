import type { CSSProperties, ReactNode } from 'react';
import { Mascot, type Pose } from './Mascot';
import type { PlayerInfo } from '../store/useGame';

interface Props {
  player: PlayerInfo;
  active: boolean;
  pose: Pose;
  mascotSize?: number;
  children?: ReactNode;
  style?: CSSProperties;
  turnLabel?: string;
}

export function PlayerCard({ player, active, pose, mascotSize = 240, children, style, turnLabel = 'Đến lượt!' }: Props) {
  return (
    <div className={`player-card ${active ? 'active' : 'idle'}`} style={style}>
      {active && <div className="turn-tag">{turnLabel}</div>}
      <Mascot color={player.color} pose={pose} size={mascotSize} />
      <div className="player-name" title={player.name}>{player.name}</div>
      {children}
    </div>
  );
}
