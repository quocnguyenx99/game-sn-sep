import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { audio } from '../../audio/engine';
import { BanyanBackground } from '../../backgrounds/Backgrounds';
import { firstPlayerOf, useGame, type PlayerInfo, type Winner } from '../../store/useGame';
import { Button } from '../../ui/Button';
import { celebrate } from '../../ui/confetti';
import { IconHelp, IconPause, IconRestart } from '../../ui/Icons';
import { Mascot, type Pose } from '../../ui/Mascot';
import { ResultOverlay } from '../../ui/ResultOverlay';
import { SpeedSlider, speedLabel } from '../../ui/SettingsModal';
import { SpeechBubble } from '../../ui/SpeechBubble';
import { TopBar } from '../../ui/TopBar';
import { BOARD_W, OaqBoard, dirFromSide, type ExitMode, type Floater } from './OaqBoard';
import { OaqRules } from './OaqRules';
import { Stone } from './Stone';
import {
  INITIAL_DAN,
  PLAYER_PITS,
  QUAN_POINTS,
  applyStep,
  canPick,
  createOaq,
  planMove,
  points,
  previewPath,
  runSteps,
  type OaqState,
  type Player,
  type Step,
} from './engine';

type Phase = 'select' | 'animating' | 'over';

interface Hint {
  player: Player;
  text: React.ReactNode;
  key: number;
}

let hintSeq = 0;
let floaterSeq = 0;

function ScoreLine({ state, player }: { state: OaqState; player: Player }) {
  const s = state.scores[player];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 25, fontWeight: 700 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Stone size={24} hue={1} /> Dân <b>{s.dan}</b> × 1
      </span>
      <span>+</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Stone size={28} quan /> Quan <b>{s.quan}</b> × {QUAN_POINTS}
      </span>
      <span>=</span>
      <motion.span
        key={points(s)}
        initial={{ scale: 1.6, color: '#FF6FA8' }}
        animate={{ scale: 1, color: player === 0 ? '#1E4FD8' : '#D24F00' }}
        transition={{ type: 'spring', stiffness: 400, damping: 14 }}
        style={{ fontSize: 44, fontWeight: 800, minWidth: 60 }}
      >
        {points(s)}
      </motion.span>
      <span style={{ color: 'var(--ink-soft)' }}>điểm</span>
    </div>
  );
}

function PlayerStrip({
  info,
  player,
  state,
  active,
  pose,
  hint,
  top,
}: {
  info: PlayerInfo;
  player: Player;
  state: OaqState;
  active: boolean;
  pose: Pose;
  hint: Hint | null;
  top: number;
}) {
  return (
    <>
      <div
        className={`player-card ${active ? 'active' : 'idle'}`}
        style={{ position: 'absolute', left: 150, top, width: 780, height: 170, flexDirection: 'row', alignItems: 'center', padding: '30px 28px 10px 200px', gap: 18 }}
      >
        {active && <div className="turn-tag" style={{ left: 200 }}>Lượt của {info.name}</div>}
        <div style={{ position: 'absolute', left: 10, bottom: 8 }}>
          <Mascot color={info.color} pose={pose} size={200} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <div className="player-name" style={{ textAlign: 'left' }}>
            {info.name} <span style={{ fontSize: 22, color: 'var(--ink-soft)' }}>· hàng {player === 0 ? 'dưới' : 'trên'}</span>
          </div>
          <ScoreLine state={state} player={player} />
        </div>
      </div>
      <SpeechBubble
        text={hint && hint.player === player ? hint.text : null}
        textKey={hint?.key ?? 0}
        tail="left"
        style={{ left: 958, top: top + 18, maxWidth: 500 }}
      />
    </>
  );
}

export function OaqScreen() {
  const players = useGame((s) => s.players);
  const match = useGame((s) => s.match.oaq);
  const settings = useGame((s) => s.settings);
  const recordResult = useGame((s) => s.recordResult);
  const go = useGame((s) => s.go);

  const [display, setDisplay] = useState<OaqState>(() => createOaq(firstPlayerOf(match)));
  const [phase, setPhase] = useState<Phase>('select');
  const [selected, setSelected] = useState<number | null>(null);
  const [hoverSide, setHoverSide] = useState<'left' | 'right' | null>(null);
  const [hand, setHand] = useState<{ pit: number; count: number } | null>(null);
  const [focusPit, setFocusPit] = useState<number | null>(null);
  const [exitModes, setExitModes] = useState<Record<number, ExitMode>>({});
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [hint, setHint] = useState<Hint | null>(null);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<Winner | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);

  const queue = useRef<Step[]>([]);
  const finalState = useRef<OaqState>(display);
  const cursor = useRef<OaqState>(display); // trạng thái đang hiển thị, tiến theo từng bước
  const timer = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const delayRef = useRef(settings.sowDelay);
  delayRef.current = settings.sowDelay;
  const capturesThisTurn = useRef(0);

  const name = (p: Player) => players[p].name;
  const say = useCallback((player: Player, text: React.ReactNode) => setHint({ player, text, key: ++hintSeq }), []);

  const promptSelect = useCallback(
    (s: OaqState) => say(s.turn, <>Chọn 1 ô dân <b>có sỏi</b> ở hàng {s.turn === 0 ? 'dưới' : 'trên'} của bạn nhé!</>),
    [say],
  );

  useEffect(() => {
    promptSelect(display);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // chỉ chạy khi vào màn hình
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishGame = useCallback(
    (s: OaqState) => {
      setPhase('over');
      setHand(null);
      setFocusPit(null);
      const winner = s.winner as Winner;
      window.setTimeout(() => {
        audio.sfx('win');
        if (winner !== 'draw') celebrate(settings.reduceMotion);
        recordResult('oaq', winner);
        setResult(winner);
      }, 900);
    },
    [recordResult, settings.reduceMotion],
  );

  /** Hiệu ứng (âm thanh, lời nhắc, bàn tay) cho 1 bước và thời gian chờ trước bước kế tiếp. */
  const presentStep = useCallback(
    (step: Step, before: OaqState): number => {
      const d = delayRef.current;
      const mover = before.turn;
      switch (step.type) {
        case 'pick':
          audio.sfx('pick');
          setExitModes((m) => ({ ...m, [step.pit]: 'pick' }));
          setHand({ pit: step.pit, count: step.count });
          setFocusPit(step.pit);
          say(
            mover,
            step.first ? (
              <>Bốc <b>{step.count} viên</b>, rải lần lượt mỗi ô 1 viên…</>
            ) : (
              <>Ô kế tiếp còn sỏi → <b>bốc {step.count} viên</b> lên rải tiếp!</>
            ),
          );
          return d * (step.first ? 1.4 : 1.8);
        case 'drop':
          audio.sfx('drop');
          setHand(step.inHand > 0 ? { pit: step.pit, count: step.inHand } : { pit: step.pit, count: 0 });
          setFocusPit(step.pit);
          return d;
        case 'capture': {
          audio.sfx('capture');
          capturesThisTurn.current += 1;
          setHand(null);
          setFocusPit(step.pit);
          setExitModes((m) => ({ ...m, [step.pit]: step.player === 0 ? 'cap0' : 'cap1' }));
          const pts = step.dan + step.quan * QUAN_POINTS;
          const id = ++floaterSeq;
          setFloaters((f) => [...f, { id, pit: step.pit, text: `+${pts}`, player: step.player }]);
          window.setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 1300);
          const parts = [step.dan ? `${step.dan} dân` : '', step.quan ? `${step.quan} quan (${step.quan * QUAN_POINTS} điểm)` : ''].filter(Boolean).join(' + ');
          say(
            mover,
            <>
              {capturesThisTurn.current > 1 ? 'Ăn liên tiếp! ' : 'Ô trống, rồi tới ô có sỏi → '}
              <b>ĂN {parts}</b> = +{pts} điểm!
            </>,
          );
          return Math.max(1000, d * 2.4);
        }
        case 'stop': {
          setHand(null);
          setFocusPit(step.pit);
          const msg = {
            quan: <>Ô kế tiếp là <b>ô quan</b> → không được bốc, hết lượt.</>,
            twoEmpty: <>Gặp <b>2 ô trống liền nhau</b> → mất lượt.</>,
            quanNon: <>Ô quan còn <b>quan non</b> (dưới 5 dân) → chưa được ăn, hết lượt.</>,
            captured: <>Ăn xong! Ô tiếp theo không trống nên <b>dừng lượt</b>.</>,
            loop: <>Rải quá lâu → dừng lượt.</>,
          }[step.reason];
          say(mover, msg);
          if (step.reason === 'twoEmpty' || step.reason === 'quan') audio.sfx('error');
          return Math.max(1100, d * 2.6);
        }
        case 'collect':
          audio.sfx('pick');
          setExitModes((m) => ({ ...m, [step.pit]: step.player === 0 ? 'cap0' : 'cap1' }));
          setFocusPit(step.pit);
          say(step.player, <>Hết quan, tàn dân, <b>thu quân kéo về</b>: +{step.dan}</>);
          return Math.max(500, d * 1.2);
        case 'reseed':
          audio.sfx('reseed');
          setFocusPit(null);
          say(step.player, <>Hàng của bạn hết dân rồi! Lấy <b>{INITIAL_DAN} điểm</b> rải lại, mỗi ô 1 viên.</>);
          return Math.max(1800, d * 3.5);
        case 'turn':
          setFocusPit(null);
          capturesThisTurn.current = 0;
          return 250;
        case 'gameOver':
          if (step.reason === 'noStones') {
            const loser = step.winner === 0 ? 1 : 0;
            say(loser as Player, <>Hết sỏi mà <b>không đủ {INITIAL_DAN} điểm</b> để rải lại → thua ván!</>);
          }
          return 0;
      }
    },
    [say],
  );

  const runNext = useCallback(() => {
    timer.current = null;
    if (pausedRef.current) return;
    const step = queue.current.shift();
    if (!step) {
      const s = finalState.current;
      setDisplay(s);
      setHand(null);
      setFocusPit(null);
      if (s.over) finishGame(s);
      else {
        setPhase('select');
        promptSelect(s);
      }
      return;
    }
    const before = cursor.current;
    cursor.current = applyStep(before, step);
    setDisplay(cursor.current);
    const wait = presentStep(step, before);
    timer.current = window.setTimeout(runNext, wait);
  }, [finishGame, presentStep, promptSelect]);

  const startMove = (pit: number, side: 'left' | 'right') => {
    if (phase !== 'select' || !canPick(display, pit)) return;
    const dir = dirFromSide(pit, side);
    const steps = planMove(display, pit, dir, { quanNon: settings.quanNon });
    if (!steps.length) return;
    audio.sfx('click');
    queue.current = steps;
    cursor.current = display;
    finalState.current = runSteps(display, steps);
    capturesThisTurn.current = 0;
    setSelected(null);
    setHoverSide(null);
    setPhase('animating');
    runNext();
  };

  const togglePause = () => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    if (!next && phase === 'animating' && timer.current === null) runNext();
  };

  /** Tua nhanh: bỏ qua phần rải còn lại, hiện ngay kết quả của lượt. */
  const skip = () => {
    if (phase !== 'animating') return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    queue.current = [];
    pausedRef.current = false;
    setPaused(false);
    runNext();
  };

  const newRound = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    queue.current = [];
    pausedRef.current = false;
    setPaused(false);
    const m = useGame.getState().match.oaq;
    // recordResult đã tăng m.round khi ván kết thúc, nên chơi lại giữa chừng vẫn giữ người đi trước
    const s = createOaq(firstPlayerOf(m));
    finalState.current = s;
    cursor.current = s;
    setDisplay(s);
    setPhase('select');
    setSelected(null);
    setHand(null);
    setFocusPit(null);
    setExitModes({});
    setFloaters([]);
    setResult(null);
    promptSelect(s);
  };

  // Phím tắt: ← → để rải, Esc bỏ chọn, Space tạm dừng
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === 'Space' && phase === 'animating') {
        e.preventDefault();
        togglePause();
      } else if (selected !== null && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        startMove(selected, e.key === 'ArrowLeft' ? 'left' : 'right');
      } else if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const selectable = new Set(phase === 'select' ? PLAYER_PITS[display.turn].filter((p) => display.pits[p].dan > 0) : []);
  const preview = selected !== null && hoverSide ? previewPath(display, selected, dirFromSide(selected, hoverSide)) : [];

  const onPitClick = (pit: number) => {
    if (!selectable.has(pit)) {
      audio.sfx('error');
      return;
    }
    audio.sfx('click');
    if (selected === pit) {
      setSelected(null);
      promptSelect(display);
      return;
    }
    setSelected(pit);
    say(display.turn, <>Rải sang <b>trái</b> hay <b>phải</b>? Rê chuột vào mũi tên để xem đường đi của {display.pits[pit].dan} viên sỏi.</>);
  };

  const poseOf = (p: Player): Pose => {
    if (phase === 'over' || display.over) return display.winner === 'draw' ? 'cake' : display.winner === p ? 'win' : 'lose';
    return display.turn === p ? 'think' : 'wave';
  };

  const total = [points(display.scores[0]), points(display.scores[1])];

  return (
    <div className="screen">
      <BanyanBackground />
      <TopBar
        onBack={() => go('menu')}
        title="Ô ăn quan"
        center={
          <div className="scorebox">
            <span>Tỉ số ván</span>
            <span className="num">{match.wins[0]}</span>
            <span>:</span>
            <span className="num" style={{ color: 'var(--orange-deep)' }}>
              {match.wins[1]}
            </span>
            <span className="round">Ván {match.round + (result === null ? 1 : 0)}</span>
          </div>
        }
        actions={
          <>
            <Button variant="white" size="icon" title="Chơi lại ván này" onClick={newRound}>
              <IconRestart />
            </Button>
            <Button variant="orange" size="icon" title="Cách chơi" onClick={() => setRulesOpen(true)}>
              <IconHelp />
            </Button>
          </>
        }
      />

      <PlayerStrip info={players[1]} player={1} state={display} active={phase !== 'over' && display.turn === 1} pose={poseOf(1)} hint={hint} top={122} />

      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 18 }}
        style={{ position: 'absolute', left: (1920 - BOARD_W) / 2, top: 318 }}
      >
        <OaqBoard
          state={display}
          selectable={selectable}
          selected={selected}
          preview={preview}
          hand={hand}
          focusPit={focusPit}
          exitModes={exitModes}
          floaters={floaters}
          reduce={settings.reduceMotion}
          onPitClick={onPitClick}
          onArrow={(side) => selected !== null && startMove(selected, side)}
          onArrowHover={setHoverSide}
        />
      </motion.div>

      <PlayerStrip info={players[0]} player={0} state={display} active={phase !== 'over' && display.turn === 0} pose={poseOf(0)} hint={hint} top={862} />

      {/* bảng điều khiển tốc độ rải */}
      <div className="panel" style={{ position: 'absolute', right: 40, bottom: 26, width: 380, padding: '14px 22px 18px', display: 'flex', flexDirection: 'column', gap: 10, zIndex: 15 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, fontWeight: 800 }}>
          <span>Tốc độ rải</span>
          <span style={{ color: 'var(--blue)' }}>{speedLabel(settings.sowDelay)}</span>
        </div>
        <SpeedSlider />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Button variant={paused ? 'gold' : 'white'} size="small" disabled={phase !== 'animating'} onClick={togglePause} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 26, height: 26, display: 'inline-block' }}>
              <IconPause paused={paused} />
            </span>
            {paused ? 'Tiếp tục' : 'Tạm dừng'}
          </Button>
          <Button variant="white" size="small" disabled={phase !== 'animating'} onClick={skip}>
            Tua nhanh
          </Button>
        </div>
      </div>

      <ResultOverlay
        open={result !== null}
        winner={result}
        players={players}
        detail={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {([0, 1] as const).map((p) => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 28, fontWeight: 800 }}>
                <span style={{ width: 260, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{players[p].name}</span>
                <ScoreLine state={display} player={p} />
              </div>
            ))}
            {display.endReason === 'noStones' && display.winner !== 'draw' && display.winner !== null && (
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink-soft)' }}>
                {name(display.winner === 0 ? 1 : 0)} hết sỏi và không đủ {INITIAL_DAN} điểm để rải lại.
              </div>
            )}
            {display.endReason === 'quanGone' && (
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink-soft)' }}>
                Hết quan, tàn dân: {total[0]} – {total[1]} điểm
              </div>
            )}
          </div>
        }
        onNext={newRound}
        onMenu={() => go('menu')}
      />
      <OaqRules open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  );
}
