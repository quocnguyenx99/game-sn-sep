import { describe, expect, it } from 'vitest';
import {
  PLAYER_PITS,
  createOaq,
  planMove,
  points,
  runSteps,
  totalStones,
  type OaqState,
  type Player,
  type Step,
} from './engine';

const OFF = { quanNon: false };
const ON = { quanNon: true };

/** dan: 12 số sỏi dân theo chỉ số ô; quan: [ô 0, ô 6] còn viên quan hay không */
function makeState(dan: number[], quan: [number, number] = [1, 1], turn: Player = 0, scores?: OaqState['scores']): OaqState {
  const s = createOaq(turn);
  s.pits = dan.map((d, i) => ({ dan: d, quan: i === 0 ? quan[0] : i === 6 ? quan[1] : 0 }));
  if (scores) s.scores = scores;
  return s;
}

const types = (steps: Step[]) => steps.map((s) => s.type);
const stopOf = (steps: Step[]) => steps.find((s) => s.type === 'stop') as Extract<Step, { type: 'stop' }>;

describe('planMove', () => {
  it('nước đầu tiên: rải qua ô quan, bốc tiếp, rồi ăn', () => {
    const s0 = createOaq(0);
    const steps = planMove(s0, 1, 1, OFF);
    expect(steps[0]).toEqual({ type: 'pick', pit: 1, count: 5, first: true });
    const cap = steps.find((s) => s.type === 'capture');
    expect(cap).toMatchObject({ pit: 2, dan: 6, player: 0 });
    const s1 = runSteps(s0, steps);
    expect(points(s1.scores[0])).toBe(6);
    expect(s1.turn).toBe(1);
    expect(totalStones(s1)).toBe(70);
  });

  it('không cho bốc ô của đối thủ hoặc ô trống', () => {
    const s0 = createOaq(0);
    expect(planMove(s0, 7, 1, OFF)).toEqual([]);
    expect(planMove(makeState([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0]), 1, 1, OFF)).toEqual([]);
  });

  it('dừng khi ô kế tiếp là ô quan còn sỏi', () => {
    const s0 = makeState([0, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0]);
    expect(stopOf(planMove(s0, 4, 1, OFF))).toMatchObject({ pit: 6, reason: 'quan' });
  });

  it('mất lượt khi gặp hai ô trống liền nhau', () => {
    const s0 = makeState([0, 0, 1, 0, 0, 0, 0, 0, 0, 3, 0, 0]);
    expect(stopOf(planMove(s0, 2, 1, OFF))).toMatchObject({ reason: 'twoEmpty' });
    expect(types(planMove(s0, 2, 1, OFF))).not.toContain('capture');
  });

  it('ăn liên tiếp, kể cả ô quan (khi tắt quan non)', () => {
    const s0 = makeState([0, 1, 0, 0, 2, 0, 0, 0, 3, 4, 0, 0]);
    const steps = planMove(s0, 1, 1, OFF);
    const caps = steps.filter((s) => s.type === 'capture');
    expect(caps.map((c) => c.pit)).toEqual([4, 6, 8]);
    const s1 = runSteps(s0, steps);
    expect(points(s1.scores[0])).toBe(2 + 10 + 3);
    expect(stopOf(steps)).toMatchObject({ pit: 9, reason: 'captured' });
  });

  it('bật quan non: không ăn được ô quan còn ít dân', () => {
    const s0 = makeState([0, 1, 0, 0, 2, 0, 0, 0, 3, 4, 0, 0]);
    const steps = planMove(s0, 1, 1, ON);
    expect(steps.filter((s) => s.type === 'capture').map((c) => c.pit)).toEqual([4]);
    expect(stopOf(steps)).toMatchObject({ pit: 6, reason: 'quanNon' });
  });

  it('bật quan non: ô quan đủ 5 dân thì ăn được', () => {
    const s0 = makeState([0, 1, 0, 0, 2, 0, 5, 0, 3, 4, 0, 0]);
    const caps = planMove(s0, 1, 1, ON).filter((s) => s.type === 'capture');
    expect(caps.map((c) => c.pit)).toEqual([4, 6, 8]);
  });

  it('hết dân nhưng đủ điểm → tự rải lại 5 viên', () => {
    const s0 = makeState([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3], [1, 1], 1, [{ dan: 7, quan: 0 }, { dan: 0, quan: 0 }]);
    const steps = planMove(s0, 7, 1, OFF);
    expect(types(steps).slice(-2)).toEqual(['turn', 'reseed']);
    const s1 = runSteps(s0, steps);
    expect(PLAYER_PITS[0].map((p) => s1.pits[p].dan)).toEqual([1, 1, 1, 1, 1]);
    expect(s1.scores[0].dan).toBe(2);
    expect(s1.over).toBe(false);
  });

  it('rải lại bằng cách đổi 1 quan khi dân không đủ', () => {
    const s0 = makeState([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3], [1, 1], 1, [{ dan: 2, quan: 1 }, { dan: 0, quan: 0 }]);
    const s1 = runSteps(s0, planMove(s0, 7, 1, OFF));
    expect(s1.scores[0]).toEqual({ dan: 7, quan: 0 });
    expect(totalStones(s1)).toBe(totalStones(s0));
  });

  it('hết dân và không đủ 5 điểm → thua ngay', () => {
    const s0 = makeState([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3], [1, 1], 1, [{ dan: 3, quan: 0 }, { dan: 0, quan: 0 }]);
    const s1 = runSteps(s0, planMove(s0, 7, 1, OFF));
    expect(s1.over).toBe(true);
    expect(s1.winner).toBe(1);
    expect(s1.endReason).toBe('noStones');
  });

  it('hết quan → thu dân còn lại về mỗi bên và kết thúc ván', () => {
    const s0 = makeState([0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0], [0, 1], 0, [{ dan: 0, quan: 0 }, { dan: 5, quan: 0 }]);
    const steps = planMove(s0, 3, 1, OFF);
    expect(types(steps)).toContain('collect');
    const s1 = runSteps(s0, steps);
    expect(s1.over).toBe(true);
    expect(points(s1.scores[0])).toBe(10 + 1);
    expect(points(s1.scores[1])).toBe(5 + 2);
    expect(s1.winner).toBe(0);
    expect(s1.endReason).toBe('quanGone');
  });
});

describe('chơi ngẫu nhiên', () => {
  function rng(seed: number) {
    return () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
  }

  it.each([1, 2, 3, 42, 99, 2024, 31337, 777])('bảo toàn tổng sỏi = 70 và luôn kết thúc (seed %i)', (seed) => {
    for (const opts of [OFF, ON]) {
      const rand = rng(seed);
      let s = createOaq(0);
      let moves = 0;
      while (!s.over && moves < 1000) {
        const legal = PLAYER_PITS[s.turn].filter((p) => s.pits[p].dan > 0);
        expect(legal.length).toBeGreaterThan(0);
        const pit = legal[Math.floor(rand() * legal.length)];
        const dir = rand() < 0.5 ? 1 : -1;
        s = runSteps(s, planMove(s, pit, dir, opts));
        expect(totalStones(s)).toBe(70);
        moves++;
      }
      expect(s.over).toBe(true);
    }
  });
});
