import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Screen = 'loading' | 'menu' | 'setup' | 'caro' | 'oaq' | 'monopoly' | 'leaderboard';
export type GameId = 'caro' | 'oaq' | 'monopoly';
export type CatColor = 'gold' | 'orange' | 'cyan' | 'pink';
export type Track = 'chiptune' | 'birthday' | 'off';
export type Theme = 'day' | 'sunset';
export type Winner = 0 | 1 | 'draw';

export interface PlayerInfo {
  name: string;
  color: CatColor;
  isBot?: boolean;
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
  monopolyStartingCash: number; // Tiền khởi điểm cờ tỷ phú (mặc định 3000K)
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
  monopoly?: number;
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
  monopolyStartingCash: 3000,
};

const emptyMatch = (): MatchScore => ({ wins: [0, 0], draws: 0, round: 0 });

interface GameStore {
  screen: Screen;
  pendingGame: GameId;
  players: [PlayerInfo, PlayerInfo];
  monopolyPlayers: PlayerInfo[];
  settings: Settings;
  match: Record<Exclude<GameId, 'monopoly'>, MatchScore>;
  leaderboard: Record<string, LeaderRow>;
  settingsOpen: boolean;

  go: (screen: Screen) => void;
  openSetup: (game: GameId) => void;
  startGame: (players: [PlayerInfo, PlayerInfo]) => void;
  startMonopolyGame: (players: PlayerInfo[]) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setPlayers: (players: [PlayerInfo, PlayerInfo]) => void;
  setMonopolyPlayers: (players: PlayerInfo[]) => void;
  setSettingsOpen: (open: boolean) => void;
  recordResult: (game: Exclude<GameId, 'monopoly'>, winner: Winner) => void;
  recordMonopolyResult: (winnerIndex: number, players: PlayerInfo[]) => void;
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
      monopolyPlayers: [
        { name: 'Mèo Vàng (Bạn)', color: 'gold', isBot: false },
        { name: 'Mèo Cam (Bot)', color: 'orange', isBot: true },
        { name: 'Mèo Xanh (Bot)', color: 'cyan', isBot: true },
        { name: 'Mèo Hồng (Bot)', color: 'pink', isBot: true },
      ],
      settings: DEFAULT_SETTINGS,
      match: { caro: emptyMatch(), oaq: emptyMatch() },
      leaderboard: {},
      settingsOpen: false,

      go: (screen) => set({ screen }),
      openSetup: (game) => set({ pendingGame: game, screen: 'setup' }),
      startGame: (players) => {
        const game = get().pendingGame;
        if (game === 'monopoly') {
          set({ monopolyPlayers: players, screen: 'monopoly' });
        } else {
          set((s) => ({ players, screen: game, match: { ...s.match, [game]: emptyMatch() } }));
        }
      },
      startMonopolyGame: (players) => {
        set({ monopolyPlayers: players, screen: 'monopoly' });
      },
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      setPlayers: (players) => set({ players }),
      setMonopolyPlayers: (monopolyPlayers) => set({ monopolyPlayers }),
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
            const row = { ...(leaderboard[k] ?? { name: p.name.trim(), wins: 0, losses: 0, draws: 0, caro: 0, oaq: 0, monopoly: 0 }) };
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

      recordMonopolyResult: (winnerIndex, players) =>
        set((s) => {
          const leaderboard = { ...s.leaderboard };
          players.forEach((p, i) => {
            if (p.isBot) return; // Don't track bots on human leaderboard
            const k = keyOf(p.name);
            if (!k) return;
            const row = { ...(leaderboard[k] ?? { name: p.name.trim(), wins: 0, losses: 0, draws: 0, caro: 0, oaq: 0, monopoly: 0 }) };
            row.name = p.name.trim();
            if (i === winnerIndex) {
              row.wins += 1;
              row.monopoly = (row.monopoly ?? 0) + 1;
            } else {
              row.losses += 1;
            }
            leaderboard[k] = row;
          });
          return { leaderboard };
        }),

      resetLeaderboard: () => set({ leaderboard: {} }),
    }),
    {
      name: 'hanh-trinh-tuoi-tho',
      version: 3,
      partialize: (s) => ({ settings: s.settings, players: s.players, monopolyPlayers: s.monopolyPlayers, leaderboard: s.leaderboard }),
      migrate: (persisted, version) => {
        const p = (persisted ?? {}) as Partial<GameStore>;
        if (version < 2 && p.settings) p.settings = { ...p.settings, track: 'birthday' };
        return p as GameStore;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameStore>;
        return {
          ...current,
          ...p,
          settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) },
          monopolyPlayers: p.monopolyPlayers && p.monopolyPlayers.length >= 2 ? p.monopolyPlayers : current.monopolyPlayers,
        };
      },
    },
  ),
);

/** Người đi trước của ván hiện tại: luân phiên theo số ván đã chơi. */
export const firstPlayerOf = (m: MatchScore): 0 | 1 => (m.round % 2) as 0 | 1;
