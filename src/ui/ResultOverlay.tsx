import type { ReactNode } from 'react';
import type { PlayerInfo, Winner } from '../store/useGame';
import { Button } from './Button';
import { Mascot } from './Mascot';
import { Modal } from './Modal';

interface Props {
  open: boolean;
  winner: Winner | null;
  players: [PlayerInfo, PlayerInfo];
  detail?: ReactNode;
  onNext: () => void;
  onMenu: () => void;
}

export function ResultOverlay({ open, winner, players, detail, onNext, onMenu }: Props) {
  const title = winner === null ? '' : winner === 'draw' ? 'Hòa nhau rồi!' : `${players[winner].name} thắng!`;
  return (
    <Modal open={open} title={title} width={1180}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 80 }}>
        {([0, 1] as const).map((i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 30, fontWeight: 800 }}>
            <Mascot
              color={players[i].color}
              pose={winner === 'draw' ? 'cake' : winner === i ? 'win' : 'lose'}
              size={winner === i ? 330 : 260}
            />
            <div>{players[i].name}</div>
          </div>
        ))}
      </div>
      {detail && <div style={{ marginTop: 18 }}>{detail}</div>}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginTop: 34 }}>
        <Button variant="white" onClick={onMenu}>
          Về menu
        </Button>
        <Button variant="gold" onClick={onNext}>
          Chơi ván tiếp!
        </Button>
      </div>
    </Modal>
  );
}
