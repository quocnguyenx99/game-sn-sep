import { AnimatePresence, motion } from 'framer-motion';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { audio } from '../../audio/engine';
import { DeskBackground } from '../../backgrounds/Backgrounds';
import { firstPlayerOf, useGame, type Winner } from '../../store/useGame';
import { Button } from '../../ui/Button';
import { CandyPiece } from '../../ui/CandyPiece';
import { celebrate } from '../../ui/confetti';
import { IconHelp, IconRestart, IconUndo } from '../../ui/Icons';
import { Modal } from '../../ui/Modal';
import { PlayerCard } from '../../ui/PlayerCard';
import { ResultOverlay } from '../../ui/ResultOverlay';
import { TopBar } from '../../ui/TopBar';
import { SIZE, createCaro, play, undo, type Cell as CellValue, type Mark } from './logic';

const CELL = 58;
const BOARD = CELL * SIZE;
const markOf = (m: Mark) => (m === 1 ? 'x' : 'o');
const center = (idx: number) => ({ x: (idx % SIZE) * CELL + CELL / 2, y: Math.floor(idx / SIZE) * CELL + CELL / 2 });

const Cell = memo(function Cell({
  idx,
  value,
  last,
  inWin,
  disabled,
  onPlay,
  onHover,
}: {
  idx: number;
  value: CellValue;
  last: boolean;
  inWin: boolean;
  disabled: boolean;
  onPlay: (i: number) => void;
  onHover: (i: number | null) => void;
}) {
  return (
    <button
      onClick={() => onPlay(idx)}
      onMouseEnter={() => onHover(value || disabled ? null : idx)}
      disabled={disabled && !value}
      style={{
        width: CELL,
        height: CELL,
        padding: 0,
        border: 0,
        background: last ? 'rgba(255, 198, 26, 0.28)' : 'transparent',
        borderRadius: 10,
        cursor: value || disabled ? 'default' : 'pointer',
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
      }}
    >
      {value !== 0 && (
        <motion.div
          initial={{ scale: 0, rotate: -40 }}
          animate={inWin ? { scale: [1, 1.25, 1], rotate: 0 } : { scale: 1, rotate: 0 }}
          transition={inWin ? { duration: 0.6, repeat: Infinity, delay: 0.5 } : { type: 'spring', stiffness: 520, damping: 13 }}
        >
          <CandyPiece mark={markOf(value)} size={CELL - 8} />
        </motion.div>
      )}
      {last && !inWin && (
        <motion.div
          style={{ position: 'absolute', inset: 3, borderRadius: 12, border: '4px solid var(--gold)', pointerEvents: 'none' }}
          animate={{ opacity: [1, 0.35, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
      )}
    </button>
  );
});

function CaroRules({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items: [string, string][] = [
    ['Mỗi người một quân', 'Người chơi 1 cầm quân X, người chơi 2 cầm quân O. Hai bên lần lượt đặt 1 quân vào 1 ô trống.'],
    ['Đủ 5 là thắng', 'Ai xếp được 5 quân liền nhau theo hàng ngang, hàng dọc hoặc đường chéo trước sẽ thắng ván.'],
    ['Lỡ tay?', 'Bấm nút "Đi lại" để rút lại nước vừa đi.'],
    ['Đổi lượt đi trước', 'Sau mỗi ván, người đi trước được đổi luân phiên cho công bằng.'],
  ];
  return (
    <Modal open={open} onClose={onClose} title="Cách chơi Cờ caro" width={1100}>
      <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
        <div style={{ flex: 'none', display: 'grid', gridTemplateColumns: 'repeat(5, 70px)', gap: 6, padding: 16, borderRadius: 24, background: 'repeating-linear-gradient(0deg,#fffdf5 0 34px,#c8d8ff 34px 36px)' }}>
          {Array.from({ length: 25 }, (_, i) => {
            const diag = i % 6 === 0;
            const o = [3, 8, 13, 22].includes(i);
            return (
              <div key={i} style={{ width: 70, height: 70, display: 'grid', placeItems: 'center', borderRadius: 12, background: diag ? 'rgba(255,198,26,.35)' : 'rgba(255,255,255,.7)' }}>
                {diag ? <CandyPiece mark="x" size={56} /> : o ? <CandyPiece mark="o" size={56} /> : null}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {items.map(([t, d], i) => (
            <div key={t}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--blue)' }}>
                {i + 1}. {t}
              </div>
              <div style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.3 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export function CaroScreen() {
  const players = useGame((s) => s.players);
  const match = useGame((s) => s.match.caro);
  const recordResult = useGame((s) => s.recordResult);
  const reduce = useGame((s) => s.settings.reduceMotion);
  const go = useGame((s) => s.go);

  const [state, setState] = useState(() => createCaro((firstPlayerOf(match) + 1) as Mark));
  const [hover, setHover] = useState<number | null>(null);
  const [result, setResult] = useState<Winner | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const recorded = useRef(false);

  const over = !!state.winner || state.draw;

  const stateRef = useRef(state);
  stateRef.current = state;
  const onPlay = useCallback((i: number) => {
    const s = stateRef.current;
    if (s.winner || s.draw || s.board[i] !== 0) return;
    audio.sfx('place');
    setState(play(s, i));
    setHover(null);
  }, []);

  useEffect(() => {
    if (!over || recorded.current) return;
    recorded.current = true;
    const winner: Winner = state.draw ? 'draw' : ((state.winner! - 1) as 0 | 1);
    const t = window.setTimeout(() => {
      audio.sfx('win');
      if (winner !== 'draw') celebrate(reduce);
      recordResult('caro', winner);
      setResult(winner);
    }, 1100);
    return () => window.clearTimeout(t);
  }, [over, state.draw, state.winner, recordResult, reduce]);

  const newRound = (countRound: boolean) => {
    // `match.round` đã tăng trong recordResult nếu ván vừa kết thúc
    const m = useGame.getState().match.caro;
    const first = countRound ? firstPlayerOf(m) : ((state.firstPlayer - 1) as 0 | 1);
    recorded.current = false;
    setResult(null);
    setHover(null);
    setState(createCaro((first + 1) as Mark));
  };

  const last = state.history[state.history.length - 1];
  const winSet = new Set(state.winLine ?? []);
  const turnPlayer = (state.turn - 1) as 0 | 1;
  const poseOf = (i: 0 | 1) => {
    if (state.draw) return 'cake' as const;
    if (state.winner) return state.winner - 1 === i ? ('win' as const) : ('lose' as const);
    return turnPlayer === i ? ('think' as const) : ('wave' as const);
  };
  const line = state.winLine ? [center(state.winLine[0]), center(state.winLine[state.winLine.length - 1])] : null;

  return (
    <div className="screen">
      <DeskBackground />
      <TopBar
        onBack={() => go('menu')}
        title="Cờ caro"
        center={
          <div className="scorebox">
            <span style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{players[0].name}</span>
            <span className="num">{match.wins[0]}</span>
            <span>:</span>
            <span className="num" style={{ color: 'var(--orange-deep)' }}>
              {match.wins[1]}
            </span>
            <span style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{players[1].name}</span>
            <span className="round">Ván {match.round + (result === null ? 1 : 0)}</span>
          </div>
        }
        actions={
          <>
            <Button
              variant="white"
              size="icon"
              title="Đi lại"
              silent
              disabled={over || state.history.length === 0}
              onClick={() => {
                audio.sfx('undo');
                setState(undo);
              }}
            >
              <IconUndo />
            </Button>
            <Button variant="white" size="icon" title="Chơi lại ván này" onClick={() => newRound(false)}>
              <IconRestart />
            </Button>
            <Button variant="orange" size="icon" title="Cách chơi" onClick={() => setRulesOpen(true)}>
              <IconHelp />
            </Button>
          </>
        }
      />

      {([0, 1] as const).map((i) => (
        <PlayerCard
          key={i}
          player={players[i]}
          active={!over && turnPlayer === i}
          pose={poseOf(i)}
          mascotSize={300}
         
          style={{ position: 'absolute', top: 300, [i === 0 ? 'left' : 'right']: 70, width: 380 }}
        >
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, fontSize: 26, fontWeight: 700, color: 'var(--ink-soft)' }}>
            Quân <CandyPiece mark={i === 0 ? 'x' : 'o'} size={54} />
          </div>
        </PlayerCard>
      ))}

      {/* Bàn cờ vở ô li */}
      <motion.div
        initial={{ y: 40, opacity: 0, rotate: -1 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 140, damping: 18 }}
        style={{
          position: 'absolute',
          left: (1920 - BOARD - 48) / 2,
          top: 128,
          padding: 24,
          borderRadius: 28,
          background: '#fffdf5',
          boxShadow: '0 14px 0 #e8dcc0, 0 30px 60px rgba(70,40,10,.4)',
        }}
      >
        <div
          onMouseLeave={() => setHover(null)}
          style={{
            position: 'relative',
            width: BOARD,
            height: BOARD,
            display: 'grid',
            gridTemplateColumns: `repeat(${SIZE}, ${CELL}px)`,
            backgroundImage: [
              `linear-gradient(90deg, #7f9cf5 2px, transparent 2px)`,
              `linear-gradient(0deg, #7f9cf5 2px, transparent 2px)`,
              `repeating-linear-gradient(0deg, transparent 0 ${CELL / 4 - 1}px, rgba(127,156,245,.28) ${CELL / 4 - 1}px ${CELL / 4}px)`,
            ].join(','),
            backgroundSize: `${CELL}px ${CELL}px, ${CELL}px ${CELL}px, ${CELL}px ${CELL}px`,
            backgroundPosition: '-1px -1px, -1px -1px, 0 0',
            outline: '3px solid #7f9cf5',
          }}
        >
          {state.board.map((v, i) => (
            <Cell key={i} idx={i} value={v} last={i === last} inWin={winSet.has(i)} disabled={over} onPlay={onPlay} onHover={setHover} />
          ))}

          {/* quân mờ báo trước vị trí sẽ đặt */}
          {hover !== null && !over && state.board[hover] === 0 && (
            <div style={{ position: 'absolute', left: center(hover).x - (CELL - 8) / 2, top: center(hover).y - (CELL - 8) / 2, opacity: 0.35, pointerEvents: 'none' }}>
              <CandyPiece mark={markOf(state.turn)} size={CELL - 8} />
            </div>
          )}

          <AnimatePresence>
            {line && (
              <svg width={BOARD} height={BOARD} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
                <motion.line
                  x1={line[0].x}
                  y1={line[0].y}
                  x2={line[1].x}
                  y2={line[1].y}
                  stroke="#FFC61A"
                  strokeWidth="22"
                  strokeLinecap="round"
                  opacity="0.55"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
                <motion.line
                  x1={line[0].x}
                  y1={line[0].y}
                  x2={line[1].x}
                  y2={line[1].y}
                  stroke="#fff"
                  strokeWidth="7"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              </svg>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <ResultOverlay
        open={result !== null}
        winner={result}
        players={players}
        detail={
          <div style={{ textAlign: 'center', fontSize: 30, fontWeight: 700 }}>
            Tỉ số: {players[0].name} <b style={{ color: 'var(--blue)', fontSize: 40 }}>{match.wins[0]}</b> –{' '}
            <b style={{ color: 'var(--orange-deep)', fontSize: 40 }}>{match.wins[1]}</b> {players[1].name}
            {match.draws > 0 && <span style={{ color: 'var(--ink-soft)' }}> · {match.draws} ván hòa</span>}
          </div>
        }
        onNext={() => newRound(true)}
        onMenu={() => go('menu')}
      />
      <CaroRules open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  );
}
