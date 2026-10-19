import { describe, expect, it } from 'vitest';
import { SIZE, checkWin, createCaro, play, undo, type Cell } from './logic';

const at = (r: number, c: number) => r * SIZE + c;

function boardWith(cells: [number, number][], mark: Cell = 1): Cell[] {
  const b: Cell[] = Array(SIZE * SIZE).fill(0);
  for (const [r, c] of cells) b[at(r, c)] = mark;
  return b;
}

describe('checkWin', () => {
  it('thắng hàng ngang', () => {
    const b = boardWith([[7, 3], [7, 4], [7, 5], [7, 6], [7, 7]]);
    expect(checkWin(b, at(7, 5))).toEqual([at(7, 3), at(7, 4), at(7, 5), at(7, 6), at(7, 7)]);
  });
  it('thắng hàng dọc ở mép bàn', () => {
    const b = boardWith([[10, 14], [11, 14], [12, 14], [13, 14], [14, 14]]);
    expect(checkWin(b, at(14, 14))).toHaveLength(5);
  });
  it('thắng đường chéo xuống và chéo lên', () => {
    expect(checkWin(boardWith([[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]]), at(2, 2))).toHaveLength(5);
    expect(checkWin(boardWith([[4, 0], [3, 1], [2, 2], [1, 3], [0, 4]]), at(0, 4))).toHaveLength(5);
  });
  it('4 quân chưa thắng, không nối vòng qua mép bàn', () => {
    expect(checkWin(boardWith([[7, 3], [7, 4], [7, 5], [7, 6]]), at(7, 6))).toBeNull();
    expect(checkWin(boardWith([[0, 12], [0, 13], [0, 14], [1, 0], [1, 1]]), at(0, 14))).toBeNull();
  });
  it('hàng 6 quân vẫn trả về đúng 5 ô có chứa nước vừa đi', () => {
    const b = boardWith([[3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5]]);
    const line = checkWin(b, at(3, 0))!;
    expect(line).toHaveLength(5);
    expect(line).toContain(at(3, 0));
  });
});

describe('play / undo', () => {
  it('đổi lượt, không cho đi vào ô đã có quân', () => {
    let s = createCaro(1);
    s = play(s, 0);
    expect(s.turn).toBe(2);
    expect(play(s, 0)).toBe(s);
  });
  it('phát hiện thắng và khóa bàn', () => {
    let s = createCaro(2);
    const moves = [at(0, 0), at(5, 0), at(0, 1), at(5, 1), at(0, 2), at(5, 2), at(0, 3), at(5, 3), at(0, 4)];
    for (const m of moves) s = play(s, m);
    expect(s.winner).toBe(2);
    expect(s.winLine).toHaveLength(5);
    expect(play(s, at(9, 9))).toBe(s);
    expect(undo(s)).toBe(s);
  });
  it('undo trả lại ô và lượt', () => {
    let s = createCaro(1);
    s = play(s, 10);
    s = play(s, 20);
    s = undo(s);
    expect(s.board[20]).toBe(0);
    expect(s.turn).toBe(2);
    expect(s.history).toEqual([10]);
  });
  it('hòa khi kín bàn', () => {
    // Mẫu (c + 2r) mod 4: ngang 1122.., dọc 1212.., chéo 1221.., chéo ngược 1122.. → không có 5 liên tiếp
    const markAt = (i: number): 1 | 2 => ((i % SIZE) + 2 * Math.floor(i / SIZE)) % 4 < 2 ? 1 : 2;
    const full: Cell[] = Array.from({ length: SIZE * SIZE }, (_, i) => markAt(i));
    expect(full.some((_, i) => checkWin(full, i))).toBe(false);
    const last = SIZE * SIZE - 1;
    const board = full.slice();
    board[last] = 0;
    let s = { ...createCaro(1), board, history: Array.from({ length: last }, (_, i) => i), turn: markAt(last) };
    s = play(s, last);
    expect(s.draw).toBe(true);
    expect(s.winner).toBeNull();
  });
});
