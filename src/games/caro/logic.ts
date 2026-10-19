// Logic Cờ caro thuần (không phụ thuộc React) — bàn 15x15, 5 quân liên tiếp là thắng.

export const SIZE = 15;
export const WIN_LENGTH = 5;

/** 0 = trống, 1 = người chơi 1 (X), 2 = người chơi 2 (O) */
export type Cell = 0 | 1 | 2;
export type Mark = 1 | 2;

export interface CaroState {
  board: Cell[];
  history: number[]; // chỉ số ô theo thứ tự đã đi
  turn: Mark;
  firstPlayer: Mark;
  winner: Mark | null;
  winLine: number[] | null;
  draw: boolean;
}

export function createCaro(firstPlayer: Mark = 1): CaroState {
  return {
    board: Array(SIZE * SIZE).fill(0),
    history: [],
    turn: firstPlayer,
    firstPlayer,
    winner: null,
    winLine: null,
    draw: false,
  };
}

const DIRECTIONS: [number, number][] = [
  [0, 1], // ngang
  [1, 0], // dọc
  [1, 1], // chéo xuống
  [1, -1], // chéo lên
];

/** Trả về các ô tạo thành đường thắng đi qua `idx`, hoặc null. */
export function checkWin(board: Cell[], idx: number, size = SIZE, need = WIN_LENGTH): number[] | null {
  const mark = board[idx];
  if (!mark) return null;
  const r0 = Math.floor(idx / size);
  const c0 = idx % size;
  for (const [dr, dc] of DIRECTIONS) {
    const line = [idx];
    for (const sign of [1, -1]) {
      let r = r0 + dr * sign;
      let c = c0 + dc * sign;
      while (r >= 0 && r < size && c >= 0 && c < size && board[r * size + c] === mark) {
        if (sign === 1) line.push(r * size + c);
        else line.unshift(r * size + c);
        r += dr * sign;
        c += dc * sign;
      }
    }
    if (line.length >= need) {
      // Nếu dài hơn 5, lấy đúng 5 ô có chứa nước vừa đi để vẽ vệt sáng
      const pos = line.indexOf(idx);
      const start = Math.max(0, Math.min(pos - Math.floor(need / 2), line.length - need));
      return line.slice(start, start + need);
    }
  }
  return null;
}

export function play(state: CaroState, idx: number): CaroState {
  if (state.winner || state.draw || state.board[idx] !== 0) return state;
  const board = state.board.slice();
  board[idx] = state.turn;
  const history = [...state.history, idx];
  const winLine = checkWin(board, idx);
  const draw = !winLine && history.length === board.length;
  return {
    ...state,
    board,
    history,
    winner: winLine ? state.turn : null,
    winLine,
    draw,
    turn: winLine || draw ? state.turn : state.turn === 1 ? 2 : 1,
  };
}

/** Đi lại 1 nước (chỉ khi ván chưa kết thúc). */
export function undo(state: CaroState): CaroState {
  if (state.winner || state.draw || state.history.length === 0) return state;
  const history = state.history.slice(0, -1);
  const last = state.history[state.history.length - 1];
  const board = state.board.slice();
  const mark = board[last] as Mark;
  board[last] = 0;
  return { ...state, board, history, turn: mark };
}
