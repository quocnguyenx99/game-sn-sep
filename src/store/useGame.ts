import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Screen = 'loading' | 'menu' | 'setup' | 'caro' | 'oaq' | 'leaderboard';
export type GameId = 'caro' | 'oaq';
export type CatColor = 'gold' | 'orange';
export type Track = 'chiptune' | 'birthday' | 'off';
export type Theme = 'day' | 'sunset';
export type Winner = 0 | 1 | 'draw';

export interface PlayerInfo {
  name: string;
  color: CatColor;
}

export interface Settings {
  musicVolume: number; // 0..1
  sfxVolume: number; // 0..1
  muted: boolean;
  track: Track;
  theme: Theme;
  reduceMotion: boolean;
  sowDelay: number; // ms cho mỗi bước rải sỏi
  quanNon: boolean;
}

export interface MatchScore {
  wins: [number, number];
  draws: number;
  round: number; // số ván đã chơi, dùng để luân phiên người đi trước
}

export interface LeaderRow {
  name: string;
  wins: number;
  losses: number;
  draws: number;
  caro: number;
  oaq: number;
}

export const DEFAULT_SETTINGS: Settings = {
  musicVolume: 0.5,
  sfxVolume: 0.8,
  muted: false,
  track: 'birthday',
  theme: 'day',
  reduceMotion: false,
  sowDelay: 450,
  quanNon: false,
};

const emptyMatch = (): MatchScore => ({ wins: [0, 0], draws: 0, round: 0 });

interface GameStore {
  screen: Screen;
  pendingGame: GameId;
  players: [PlayerInfo, PlayerInfo];
  settings: Settings;
  match: Record<GameId, MatchScore>;
  leaderboard: Record<string, LeaderRow>;
  settingsOpen: boolean;

  go: (screen: Screen) => void;
  openSetup: (game: GameId) => void;
  startGame: (players: [PlayerInfo, PlayerInfo]) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setPlayers: (players: [PlayerInfo, PlayerInfo]) => void;
  setSettingsOpen: (open: boolean) => void;
  recordResult: (game: GameId, winner: Winner) => void;
  resetLeaderboard: () => void;
}

const keyOf = (name: string) => name.trim().toLocaleLowerCase('vi');

export const useGame = create<GameStore>()(
  persist(
    (set, get) => ({
      screen: 'loading',
      pendingGame: 'caro',
      players: [
        { name: 'Bé Mèo Vàng', color: 'gold' },
        { name: 'Bé Mèo Cam', color: 'orange' },
      ],
      settings: DEFAULT_SETTINGS,
      match: { caro: emptyMatch(), oaq: emptyMatch() },
      leaderboard: {},
      settingsOpen: false,

      go: (screen) => set({ screen }),
      openSetup: (game) => set({ pendingGame: game, screen: 'setup' }),
      startGame: (players) => {
        const game = get().pendingGame;
        set((s) => ({ players, screen: game, match: { ...s.match, [game]: emptyMatch() } }));
      },
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      setPlayers: (players) => set({ players }),
      setSettingsOpen: (settingsOpen) => set({ settingsOpen }),

      recordResult: (game, winner) =>
        set((s) => {
          const m = s.match[game];
          const wins: [number, number] = [...m.wins];
          if (winner !== 'draw') wins[winner] += 1;
          const match = {
            ...s.match,
            [game]: { wins, draws: m.draws + (winner === 'draw' ? 1 : 0), round: m.round + 1 },
          };

          const leaderboard = { ...s.leaderboard };
          s.players.forEach((p, i) => {
            const k = keyOf(p.name);
            if (!k) return;
            const row = { ...(leaderboard[k] ?? { name: p.name.trim(), wins: 0, losses: 0, draws: 0, caro: 0, oaq: 0 }) };
            row.name = p.name.trim();
            if (winner === 'draw') row.draws += 1;
            else if (winner === i) {
              row.wins += 1;
              row[game] += 1;
            } else row.losses += 1;
            leaderboard[k] = row;
          });
          return { match, leaderboard };
        }),

      resetLeaderboard: () => set({ leaderboard: {} }),
    }),
    {
      name: 'hanh-trinh-tuoi-tho',
      version: 2,
      partialize: (s) => ({ settings: s.settings, players: s.players, leaderboard: s.leaderboard }),
      // v1 → v2: nhạc nền mặc định đổi sang Happy Birthday 8-bit; máy đã lưu cài đặt cũ cũng chuyển theo một lần
      migrate: (persisted, version) => {
        const p = (persisted ?? {}) as Partial<GameStore>;
        if (version < 2 && p.settings) p.settings = { ...p.settings, track: 'birthday' };
        return p as GameStore;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameStore>;
        return { ...current, ...p, settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) } };
      },
    },
  ),
);

/** Người đi trước của ván hiện tại: luân phiên theo số ván đã chơi. */
export const firstPlayerOf = (m: MatchScore): 0 | 1 => (m.round % 2) as 0 | 1;
