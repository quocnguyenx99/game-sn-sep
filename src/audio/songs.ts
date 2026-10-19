// Nhạc 8-bit tổng hợp bằng WebAudio (dùng khi chưa có file mp3 trong src/assets/audio).
// Ký hiệu: [nốt | null (nghỉ), số phách]. "Happy Birthday to You" là giai điệu public domain.

export type Wave = OscillatorType | 'noise';
export type Note = [string | null, number];

export interface Voice {
  wave: Wave;
  gain: number;
  notes: Note[];
  /** độ dài nốt thực sự so với phách (staccato < 1) */
  legato?: number;
}

export interface Song {
  bpm: number;
  voices: Voice[];
}

const rep = <T,>(arr: T[], n: number): T[] => Array.from({ length: n }, () => arr).flat();

// ── "Tuổi thơ 8-bit": vòng hòa âm C – Am – F – G, 8 ô nhịp ───────────────────
const melody: Note[] = [
  ['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['E5', 0.5], ['C6', 1], ['G5', 1],
  ['A5', 0.5], ['G5', 0.5], ['E5', 0.5], ['C5', 0.5], ['E5', 1], ['A4', 1],
  ['F5', 0.5], ['A5', 0.5], ['C6', 0.5], ['A5', 0.5], ['G5', 0.5], ['F5', 0.5], ['E5', 0.5], ['D5', 0.5],
  ['D5', 0.5], ['E5', 0.5], ['F5', 0.5], ['G5', 0.5], ['B5', 1], [null, 1],
  ['G5', 0.5], ['E5', 0.5], ['C5', 0.5], ['E5', 0.5], ['G5', 1], ['C6', 1],
  ['C6', 0.5], ['B5', 0.5], ['A5', 0.5], ['E5', 0.5], ['A5', 1], ['C6', 1],
  ['A5', 0.5], ['G5', 0.5], ['F5', 0.5], ['A5', 0.5], ['C6', 1], ['A5', 1],
  ['G5', 0.5], ['F5', 0.5], ['E5', 0.5], ['D5', 0.5], ['C5', 1.5], [null, 0.5],
];

const bassBar = (root: string, low: string): Note[] => rep<Note>([[low, 0.5], [root, 0.5]], 4);
const bass: Note[] = rep(
  [...bassBar('C3', 'C2'), ...bassBar('A2', 'A1'), ...bassBar('F2', 'F1'), ...bassBar('G2', 'G1')],
  2,
);

const arpBar = (a: string, b: string, c: string): Note[] => rep<Note>([[a, 0.25], [b, 0.25], [c, 0.25], [b, 0.25]], 4);
const arp: Note[] = rep(
  [...arpBar('C4', 'E4', 'G4'), ...arpBar('A3', 'C4', 'E4'), ...arpBar('F3', 'A3', 'C4'), ...arpBar('G3', 'B3', 'D4')],
  2,
);

const hats: Note[] = rep<Note>([[null, 0.5], ['hat', 0.5]], 32);

export const CHIPTUNE: Song = {
  bpm: 132,
  voices: [
    { wave: 'square', gain: 0.16, notes: melody, legato: 0.85 },
    { wave: 'triangle', gain: 0.32, notes: bass, legato: 0.7 },
    { wave: 'square', gain: 0.05, notes: arp, legato: 0.6 },
    { wave: 'noise', gain: 0.05, notes: hats, legato: 0.15 },
  ],
};

// ── "Happy Birthday 8-bit" (nhịp 3/4, 8 ô nhịp + phần nghỉ) ───────────────────
const hbMelody: Note[] = [
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
  ['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 1],
  ['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2], [null, 1],
];
// tổng = 26 phách (1 phách đảo phách + 8 ô nhịp 3/4 + 1 nghỉ) → đệm bass theo nhịp 3
const waltz = (root: string, c1: string, c2: string): Note[] => [[root, 1], [c1, 1], [c2, 1]];
const hbBass: Note[] = [
  [null, 1],
  ...waltz('C3', 'E3', 'G3'), ...waltz('G2', 'D3', 'F3'),
  ...waltz('G2', 'D3', 'F3'), ...waltz('C3', 'E3', 'G3'),
  ...waltz('C3', 'E3', 'G3'), ...waltz('F2', 'A2', 'C3'),
  ...waltz('C3', 'G3', 'E3'), ...waltz('C3', 'E3', 'G3'),
  [null, 1],
];
const hbHats: Note[] = rep<Note>([['hat', 1]], 26);

export const BIRTHDAY: Song = {
  bpm: 150,
  voices: [
    { wave: 'square', gain: 0.17, notes: hbMelody, legato: 0.9 },
    { wave: 'triangle', gain: 0.3, notes: hbBass, legato: 0.6 },
    { wave: 'noise', gain: 0.04, notes: hbHats, legato: 0.12 },
  ],
};

/** Đoạn ngắn phát khi thắng ván: 2 câu đầu Happy Birthday, nhanh hơn. */
export const BIRTHDAY_JINGLE: Song = {
  bpm: 190,
  voices: [
    { wave: 'square', gain: 0.2, notes: [...hbMelody.slice(0, 12), ['C6', 2]], legato: 0.9 },
    { wave: 'triangle', gain: 0.3, notes: [[null, 1], ...hbBass.slice(1, 13), ['C3', 2]], legato: 0.6 },
  ],
};

const NOTE_INDEX: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export function noteFreq(note: string): number {
  const m = note.match(/^([A-G])(#|b)?(-?\d)$/);
  if (!m) return 0;
  const semis = NOTE_INDEX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) + 1) * 12;
  return 440 * Math.pow(2, (semis - 69) / 12);
}

export const songBeats = (s: Song) => Math.max(...s.voices.map((v) => v.notes.reduce((n, [, b]) => n + b, 0)));
