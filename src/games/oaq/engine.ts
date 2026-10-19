// Engine Ô ăn quan thuần (không phụ thuộc React).
//
// Bàn có 12 ô, đánh số theo vòng:
//
//        11  10   9   8   7          ← dân của Người chơi 2 (hàng trên)
//   [0]                     [6]      ← ô quan trái / quan phải
//         1   2   3   4   5          ← dân của Người chơi 1 (hàng dưới)
//
// Đi theo chiều +1 là: hàng dưới sang phải → quan phải → hàng trên sang trái → quan trái.
//
// Engine không cập nhật trạng thái một lần cho cả nước đi. `planMove` trả về một DANH SÁCH BƯỚC
// (bốc, thả, ăn, dừng…). Giao diện phát lại từng bước bằng `applyStep` theo tốc độ người chơi
// chọn, nên rải sỏi chậm rãi và tạm dừng được mà logic vẫn chính xác.

export type Player = 0 | 1;
export type Dir = 1 | -1;

export interface Pit {
  dan: number; // số sỏi dân (1 điểm/viên)
  quan: number; // số viên quan (10 điểm/viên), chỉ có ở ô 0 và 6
}

export interface Score {
  dan: number;
  quan: number;
}

export interface OaqState {
  pits: Pit[];
  scores: [Score, Score];
  turn: Player;
  over: boolean;
  winner: Player | 'draw' | null;
  endReason: 'quanGone' | 'noStones' | null;
}

export interface OaqOptions {
  /** Quan non: ô quan còn ít hơn 5 sỏi dân thì chưa được ăn */
  quanNon: boolean;
}

export type StopReason = 'quan' | 'twoEmpty' | 'quanNon' | 'captured' | 'loop';

export type Step =
  | { type: 'pick'; pit: number; count: number; first: boolean }
  | { type: 'drop'; pit: number; inHand: number }
  | { type: 'capture'; pit: number; dan: number; quan: number; player: Player }
  | { type: 'stop'; pit: number; reason: StopReason }
  | { type: 'collect'; pit: number; dan: number; player: Player }
  | { type: 'reseed'; player: Player }
  | { type: 'turn'; player: Player }
  | { type: 'gameOver'; winner: Player | 'draw'; reason: 'quanGone' | 'noStones' };

export const PIT_COUNT = 12;
export const QUAN_PITS = [0, 6] as const;
export const QUAN_POINTS = 10;
export const INITIAL_DAN = 5;
export const QUAN_NON_MIN = 5;
export const PLAYER_PITS: [number[], number[]] = [
  [1, 2, 3, 4, 5],
  [7, 8, 9, 10, 11],
];

export const isQuan = (pit: number) => pit === 0 || pit === 6;
export const next = (pit: number, dir: Dir) => (pit + dir + PIT_COUNT) % PIT_COUNT;
export const pitTotal = (p: Pit) => p.dan + p.quan;
export const points = (s: Score) => s.dan + s.quan * QUAN_POINTS;
export const ownerOf = (pit: number): Player | null =>
  isQuan(pit) ? null : pit < 6 ? 0 : 1;

export function createOaq(firstPlayer: Player = 0): OaqState {
  const pits: Pit[] = Array.from({ length: PIT_COUNT }, (_, i) =>
    isQuan(i) ? { dan: 0, quan: 1 } : { dan: INITIAL_DAN, quan: 0 },
  );
  return {
    pits,
    scores: [
      { dan: 0, quan: 0 },
      { dan: 0, quan: 0 },
    ],
    turn: firstPlayer,
    over: false,
    winner: null,
    endReason: null,
  };
}

export function cloneState(s: OaqState): OaqState {
  return {
    ...s,
    pits: s.pits.map((p) => ({ ...p })),
    scores: [{ ...s.scores[0] }, { ...s.scores[1] }],
  };
}

/** Áp dụng 1 bước lên trạng thái (trả về trạng thái mới, không sửa bản gốc). */
export function applyStep(state: OaqState, step: Step): OaqState {
  const s = cloneState(state);
  switch (step.type) {
    case 'pick':
      s.pits[step.pit].dan = 0;
      break;
    case 'drop':
      s.pits[step.pit].dan += 1;
      break;
    case 'capture':
      s.pits[step.pit] = { dan: 0, quan: 0 };
      s.scores[step.player].dan += step.dan;
      s.scores[step.player].quan += step.quan;
      break;
    case 'collect':
      s.pits[step.pit].dan = 0;
      s.scores[step.player].dan += step.dan;
      break;
    case 'reseed': {
      const sc = s.scores[step.player];
      if (sc.dan < INITIAL_DAN && sc.quan > 0) {
        // "Đổi" 1 quan thành 10 dân để có đủ sỏi rải lại
        sc.quan -= 1;
        sc.dan += QUAN_POINTS;
      }
      sc.dan -= INITIAL_DAN;
      for (const p of PLAYER_PITS[step.player]) s.pits[p].dan = 1;
      break;
    }
    case 'turn':
      s.turn = step.player;
      break;
    case 'gameOver':
      s.over = true;
      s.winner = step.winner;
      s.endReason = step.reason;
      break;
    case 'stop':
      break;
  }
  return s;
}

export function canPick(state: OaqState, pit: number): boolean {
  return (
    !state.over &&
    PLAYER_PITS[state.turn].includes(pit) &&
    state.pits[pit].dan > 0
  );
}

/** Các ô sẽ được rải ở lượt đầu tiên (để vẽ preview đường rải). */
export function previewPath(state: OaqState, pit: number, dir: Dir): number[] {
  const path: number[] = [];
  let pos = pit;
  for (let i = 0; i < state.pits[pit].dan; i++) {
    pos = next(pos, dir);
    path.push(pos);
  }
  return path;
}

const MAX_STEPS = 4000;

/**
 * Lập toàn bộ các bước của một nước đi, gồm cả bước kết thúc lượt: đổi lượt,
 * rải lại khi hết dân, hoặc kết thúc ván.
 */
export function planMove(state: OaqState, pit: number, dir: Dir, opts: OaqOptions): Step[] {
  if (!canPick(state, pit)) return [];
  const steps: Step[] = [];
  let s = state;
  const push = (step: Step) => {
    steps.push(step);
    s = applyStep(s, step);
  };
  const player = state.turn;

  let pos = pit;
  let hand = s.pits[pit].dan;
  push({ type: 'pick', pit, count: hand, first: true });

  sowing: while (steps.length < MAX_STEPS) {
    while (hand > 0) {
      pos = next(pos, dir);
      hand -= 1;
      push({ type: 'drop', pit: pos, inHand: hand });
    }

    const nxt = next(pos, dir);
    const nxtPit = s.pits[nxt];
    if (pitTotal(nxtPit) > 0) {
      if (isQuan(nxt)) {
        push({ type: 'stop', pit: nxt, reason: 'quan' });
        break;
      }
      // Ô kế tiếp còn dân → bốc lên rải tiếp
      hand = nxtPit.dan;
      pos = nxt;
      push({ type: 'pick', pit: nxt, count: hand, first: false });
      continue;
    }

    // Ô kế tiếp trống → xét ô sau đó để ăn (có thể ăn liên tiếp)
    let empty = nxt;
    let capturedAny = false;
    while (steps.length < MAX_STEPS) {
      const target = next(empty, dir);
      const t = s.pits[target];
      if (pitTotal(t) === 0) {
        push({ type: 'stop', pit: target, reason: capturedAny ? 'captured' : 'twoEmpty' });
        break sowing;
      }
      if (opts.quanNon && isQuan(target) && t.quan > 0 && t.dan < QUAN_NON_MIN) {
        push({ type: 'stop', pit: target, reason: 'quanNon' });
        break sowing;
      }
      push({ type: 'capture', pit: target, dan: t.dan, quan: t.quan, player });
      capturedAny = true;
      const after = next(target, dir);
      if (pitTotal(s.pits[after]) !== 0) {
        push({ type: 'stop', pit: after, reason: 'captured' });
        break sowing;
      }
      empty = after;
    }
  }
  if (steps.length >= MAX_STEPS) steps.push({ type: 'stop', pit: pos, reason: 'loop' });

  return [...steps, ...planEndOfTurn(s, player === 0 ? 1 : 0)];
}

/** Các bước sau khi rải xong: kết thúc ván, đổi lượt, rải lại hoặc thua vì hết sỏi. */
export function planEndOfTurn(state: OaqState, nextPlayer: Player): Step[] {
  const steps: Step[] = [];
  let s = state;
  const push = (step: Step) => {
    steps.push(step);
    s = applyStep(s, step);
  };

  // Hết quan, tàn dân, thu quân kéo về
  if (QUAN_PITS.every((q) => pitTotal(s.pits[q]) === 0)) {
    for (const player of [0, 1] as Player[]) {
      for (const p of PLAYER_PITS[player]) {
        if (s.pits[p].dan > 0) push({ type: 'collect', pit: p, dan: s.pits[p].dan, player });
      }
    }
    const a = points(s.scores[0]);
    const b = points(s.scores[1]);
    push({ type: 'gameOver', winner: a === b ? 'draw' : a > b ? 0 : 1, reason: 'quanGone' });
    return steps;
  }

  push({ type: 'turn', player: nextPlayer });

  const sideEmpty = PLAYER_PITS[nextPlayer].every((p) => s.pits[p].dan === 0);
  if (sideEmpty) {
    if (points(s.scores[nextPlayer]) >= INITIAL_DAN) {
      push({ type: 'reseed', player: nextPlayer });
    } else {
      push({ type: 'gameOver', winner: nextPlayer === 0 ? 1 : 0, reason: 'noStones' });
    }
  }
  return steps;
}

export function runSteps(state: OaqState, steps: Step[]): OaqState {
  return steps.reduce(applyStep, state);
}

export function totalStones(s: OaqState): number {
  const onBoard = s.pits.reduce((n, p) => n + p.dan + p.quan * QUAN_POINTS, 0);
  return onBoard + points(s.scores[0]) + points(s.scores[1]);
}
