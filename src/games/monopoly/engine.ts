import { BOARD_SIZE, COLOR_GROUPS, TILES, TRANSPORT_TILE_IDS } from './boardData';
import type {
  ActionLog,
  GamePhase,
  MonopolyPlayer,
  TileState,
  VictoryReason,
} from './types';
import type { PlayerInfo } from '../../store/useGame';

export interface MonopolyGameState {
  players: MonopolyPlayer[];
  tileStates: TileState[];
  currentTurn: number;           // Index của người chơi hiện tại (0..players.length - 1)
  round: number;                 // Số vòng cờ đã qua
  maxRounds: number;             // Giới hạn vòng chơi (mặc định 30)
  phase: GamePhase;
  lastDice: [number, number];
  consecutiveDoubles: number;    // Đổ đôi liên tiếp (nếu = 3 -> vào tù)
  pendingBuyout: {
    tileId: number;
    cost: number;
    ownerId: number;
  } | null;
  winner: number | null;
  victoryReason: VictoryReason | null;
  logs: ActionLog[];
}

/** Tính tổng tài sản của 1 người chơi (Tiền mặt + Giá trị tất cả nhà đất đã đầu tư) */
export function calculateNetWorth(playerIndex: number, players: MonopolyPlayer[], tileStates: TileState[]): number {
  const p = players[playerIndex];
  if (p.isBankrupt) return 0;
  let total = p.money;

  tileStates.forEach((state, tileId) => {
    if (state.ownerId === playerIndex) {
      const tile = TILES[tileId];
      if (tile.type === 'transport') {
        total += tile.cost ?? 300;
      } else if (tile.type === 'property') {
        const baseCost = tile.cost ?? 0;
        const housesCost = state.level * (tile.houseCost ?? 0);
        total += baseCost + housesCost;
      }
    }
  });

  return total;
}

/** Kiểm tra xem 1 người chơi có sở hữu trọn bộ màu nào không */
export function hasColorMonopoly(playerIndex: number, tileStates: TileState[], color: string): boolean {
  const group = COLOR_GROUPS[color as keyof typeof COLOR_GROUPS];
  if (!group) return false;
  return group.tileIds.every((id) => tileStates[id].ownerId === playerIndex);
}

/** Đếm số lượng bộ màu trọn vẹn mà người chơi sở hữu */
export function countColorMonopolies(playerIndex: number, tileStates: TileState[]): number {
  return Object.keys(COLOR_GROUPS).filter((c) => hasColorMonopoly(playerIndex, tileStates, c)).length;
}

/** Tính tiền thuê hiện tại của một ô đất */
export function calculateRent(tileId: number, tileStates: TileState[]): number {
  const tile = TILES[tileId];
  const state = tileStates[tileId];
  if (state.ownerId === null) return 0;

  let rent = 0;
  if (tile.type === 'transport') {
    // Đếm số lượng trạm giao thông người này sở hữu
    const count = TRANSPORT_TILE_IDS.filter((id) => tileStates[id].ownerId === state.ownerId).length;
    const tierIdx = Math.max(0, Math.min(3, count - 1));
    rent = tile.rentTiers ? tile.rentTiers[tierIdx] : 100 * Math.pow(2, tierIdx);
  } else if (tile.type === 'property') {
    if (state.level === 0) {
      rent = tile.baseRent ?? 50;
    } else {
      const tierIdx = state.level - 1;
      rent = tile.rentTiers ? tile.rentTiers[tierIdx] : (tile.baseRent ?? 50) * Math.pow(2, state.level);
    }

    // Nếu sở hữu trọn bộ màu: Nhân đôi tiền thuê (Monopoly bonus x2)
    if (tile.color && hasColorMonopoly(state.ownerId, tileStates, tile.color)) {
      rent *= 2;
    }
  }

  // Nếu có Lễ Hội cắm cờ: Nhân đôi tiền thuê (Festival bonus x2)
  if (state.isFestival) {
    rent *= 2;
  }

  return rent;
}

/** Giá trị mua lại (Buyout cost) = 2x tổng tiền đầu tư của ô đất đó */
export function calculateBuyoutCost(tileId: number, tileStates: TileState[]): number {
  const tile = TILES[tileId];
  const state = tileStates[tileId];
  if (state.ownerId === null || state.level >= 4) return Infinity; // Landmark không thể mua lại!

  const baseCost = tile.cost ?? 0;
  const buildCost = state.level * (tile.houseCost ?? 0);
  return (baseCost + buildCost) * 2;
}

/** Khởi tạo trạng thái ban đầu của bàn cờ */
export function createInitialState(playerInfos: PlayerInfo[], startingCash = 3000): MonopolyGameState {
  const players: MonopolyPlayer[] = playerInfos.map((p, idx) => ({
    id: idx,
    name: p.name,
    color: p.color,
    isBot: Boolean(p.isBot),
    money: startingCash,
    position: 0,
    inJail: false,
    jailTurns: 0,
    isBankrupt: false,
    freePassCount: 0,
    hasTravelPass: false,
  }));

  const tileStates: TileState[] = Array.from({ length: BOARD_SIZE }, () => ({
    ownerId: null,
    level: 0,
    isFestival: false,
  }));

  return {
    players,
    tileStates,
    currentTurn: 0,
    round: 1,
    maxRounds: 30,
    phase: 'ready',
    lastDice: [1, 1],
    consecutiveDoubles: 0,
    pendingBuyout: null,
    winner: null,
    victoryReason: null,
    logs: [
      {
        id: 'start_log',
        turn: 0,
        text: 'Trận đại chiến Cờ Tỷ Phú NKC chính thức bắt đầu! Chúc các tài phiệt may mắn!',
        type: 'info',
      },
    ],
  };
}

/** Thêm 1 dòng nhật ký trận đấu */
export function addLog(state: MonopolyGameState, text: string, type: ActionLog['type'] = 'info', playerId?: number): void {
  const newLog: ActionLog = {
    id: `${Date.now()}_${Math.random()}`,
    turn: state.round,
    text,
    type,
    playerId: playerId ?? state.currentTurn,
  };
  state.logs = [newLog, ...state.logs.slice(0, 49)];
}

/** Kiểm tra các điều kiện chiến thắng chuẩn phong cách VNG */
export function checkVictory(state: MonopolyGameState): { winner: number; reason: VictoryReason } | null {
  const activePlayers = state.players.filter((p) => !p.isBankrupt);

  // 1. Phá sản: Chỉ còn 1 người sống sót
  if (activePlayers.length === 1) {
    return { winner: activePlayers[0].id, reason: 'bankruptcy' };
  }

  for (const player of activePlayers) {
    const pid = player.id;

    // 2. Thắng Du Lịch (Tourism Monopoly): Sở hữu tất cả 4 trạm giao thông
    const ownAllTransports = TRANSPORT_TILE_IDS.every((id) => state.tileStates[id].ownerId === pid);
    if (ownAllTransports) {
      return { winner: pid, reason: 'tourism_monopoly' };
    }

    // 3. Thắng Độc Quyền Bộ (Triple Monopoly): Sở hữu trọn vẹn 3 bộ màu
    if (countColorMonopolies(pid, state.tileStates) >= 3) {
      return { winner: pid, reason: 'triple_monopoly' };
    }

    // 4. Thắng Độc Quyền Hàng (Line Monopoly): Sở hữu toàn bộ các ô có thể mua trên 1 cạnh bàn cờ
    const sides = [
      [1, 3, 5, 6, 7],         // Cạnh dưới
      [9, 10, 12, 13, 14, 15],  // Cạnh phải
      [17, 19, 21, 22, 23],    // Cạnh trên
      [25, 27, 28, 29, 30, 31], // Cạnh trái
    ];
    for (const side of sides) {
      if (side.every((id) => state.tileStates[id].ownerId === pid)) {
        return { winner: pid, reason: 'line_monopoly' };
      }
    }
  }

  // 5. Hết số vòng quy định: So sánh tổng tài sản
  if (state.round > state.maxRounds) {
    let topPlayer = activePlayers[0].id;
    let maxWorth = -1;
    for (const p of activePlayers) {
      const worth = calculateNetWorth(p.id, state.players, state.tileStates);
      if (worth > maxWorth) {
        maxWorth = worth;
        topPlayer = p.id;
      }
    }
    return { winner: topPlayer, reason: 'round_limit' };
  }

  return null;
}

/** Chuyển sang lượt của người tiếp theo */
export function nextTurn(state: MonopolyGameState): void {
  // Kiểm tra thắng thua trước
  const victory = checkVictory(state);
  if (victory) {
    state.winner = victory.winner;
    state.victoryReason = victory.reason;
    state.phase = 'game_over';
    const winPlayer = state.players[victory.winner];
    addLog(state, `🏆 CHÚC MỪNG ${winPlayer.name} đã chiến thắng vang dội! (${victory.reason})`, 'win', victory.winner);
    return;
  }

  // Tìm người chơi tiếp theo chưa bị phá sản
  const numPlayers = state.players.length;
  let nextIdx = (state.currentTurn + 1) % numPlayers;
  let loops = 0;
  while (state.players[nextIdx].isBankrupt && loops < numPlayers) {
    nextIdx = (nextIdx + 1) % numPlayers;
    loops++;
  }

  if (nextIdx <= state.currentTurn) {
    state.round += 1;
  }

  state.currentTurn = nextIdx;
  state.consecutiveDoubles = 0;
  state.pendingBuyout = null;

  const nextPlayer = state.players[nextIdx];
  if (nextPlayer.hasTravelPass) {
    state.phase = 'travel_select';
    addLog(state, `✈️ ${nextPlayer.name} đang ở Sân Bay và có thể chọn điểm bay tự do!`, 'travel', nextIdx);
  } else {
    state.phase = 'ready';
  }
}

/** Xử lý phá sản khi không đủ tiền trả nợ */
export function handleBankruptcy(state: MonopolyGameState, debtorId: number, creditorId: number | null): void {
  const debtor = state.players[debtorId];
  debtor.isBankrupt = true;
  debtor.money = 0;

  // Chuyển toàn bộ đất và tài sản cho chủ nợ (nếu có), hoặc trả về ngân hàng
  state.tileStates.forEach((tileState) => {
    if (tileState.ownerId === debtorId) {
      if (creditorId !== null) {
        tileState.ownerId = creditorId;
      } else {
        tileState.ownerId = null;
        tileState.level = 0;
        tileState.isFestival = false;
      }
    }
  });

  const creditorName = creditorId !== null ? state.players[creditorId].name : 'Ngân hàng NKC';
  addLog(state, `💥 ${debtor.name} đã tuyên bố PHÁ SẢN trước ${creditorName}!`, 'jail', debtorId);

  // Kiểm tra xem ván đấu kết thúc chưa
  const victory = checkVictory(state);
  if (victory) {
    state.winner = victory.winner;
    state.victoryReason = victory.reason;
    state.phase = 'game_over';
  }
}
