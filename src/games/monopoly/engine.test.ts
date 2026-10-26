import { describe, expect, it } from 'vitest';
import {
  calculateBuyoutCost,
  calculateNetWorth,
  calculateRent,
  checkVictory,
  countColorMonopolies,
  createInitialState,
  handleBankruptcy,
  hasColorMonopoly,
} from './engine';
import type { PlayerInfo } from '../../store/useGame';

const TEST_PLAYERS: PlayerInfo[] = [
  { name: 'Mèo Vàng', color: 'gold' },
  { name: 'Mèo Cam', color: 'orange' },
];

describe('Monopoly Game Engine', () => {
  it('initializes game state with starting money and correct tile count', () => {
    const state = createInitialState(TEST_PLAYERS, 3000);
    expect(state.players.length).toBe(2);
    expect(state.players[0].money).toBe(3000);
    expect(state.players[1].money).toBe(3000);
    expect(state.tileStates.length).toBe(32);
    expect(state.phase).toBe('ready');
  });

  it('calculates rent correctly for base, houses, monopoly, and festival', () => {
    const state = createInitialState(TEST_PLAYERS, 3000);
    // Tile 1: Phòng Tuyển Dụng (Brown, baseRent: 20, tiers: [60, 180, 450, 900])
    state.tileStates[1].ownerId = 0;
    state.tileStates[1].level = 0;
    expect(calculateRent(1, state.tileStates)).toBe(20);

    state.tileStates[1].level = 1;
    expect(calculateRent(1, state.tileStates)).toBe(60);

    state.tileStates[1].level = 4; // Landmark
    expect(calculateRent(1, state.tileStates)).toBe(900);

    // Complete brown monopoly (Tile 1 and Tile 3)
    state.tileStates[3].ownerId = 0;
    expect(hasColorMonopoly(0, state.tileStates, 'brown')).toBe(true);
    // Rent should double due to color monopoly
    expect(calculateRent(1, state.tileStates)).toBe(1800);

    // Host festival on Tile 1
    state.tileStates[1].isFestival = true;
    // Rent should double again: 1800 * 2 = 3600
    expect(calculateRent(1, state.tileStates)).toBe(3600);
  });

  it('calculates transport station rents progressively', () => {
    const state = createInitialState(TEST_PLAYERS, 3000);
    // Tile 5 (Bus)
    state.tileStates[5].ownerId = 0;
    expect(calculateRent(5, state.tileStates)).toBe(100);

    // Tile 13 (Cao tốc)
    state.tileStates[13].ownerId = 0;
    expect(calculateRent(5, state.tileStates)).toBe(200);

    // Tile 21 (Cảng bay)
    state.tileStates[21].ownerId = 0;
    expect(calculateRent(5, state.tileStates)).toBe(400);

    // Tile 29 (Du thuyền)
    state.tileStates[29].ownerId = 0;
    expect(calculateRent(5, state.tileStates)).toBe(800);
  });

  it('calculates buyout cost as 2x total invested property value, and protects Landmark', () => {
    const state = createInitialState(TEST_PLAYERS, 3000);
    // Tile 1: Cost 160, HouseCost 100
    state.tileStates[1].ownerId = 1;
    state.tileStates[1].level = 0;
    expect(calculateBuyoutCost(1, state.tileStates)).toBe(160 * 2); // 320

    state.tileStates[1].level = 2; // 160 + 2 * 100 = 360 -> Buyout: 720
    expect(calculateBuyoutCost(1, state.tileStates)).toBe(720);

    state.tileStates[1].level = 4; // Landmark!
    expect(calculateBuyoutCost(1, state.tileStates)).toBe(Infinity);
  });

  it('detects Tourism Monopoly victory when 1 player owns all 4 transports', () => {
    const state = createInitialState(TEST_PLAYERS, 3000);
    state.tileStates[5].ownerId = 0;
    state.tileStates[13].ownerId = 0;
    state.tileStates[21].ownerId = 0;
    state.tileStates[29].ownerId = 0;

    const victory = checkVictory(state);
    expect(victory).not.toBeNull();
    expect(victory?.winner).toBe(0);
    expect(victory?.reason).toBe('tourism_monopoly');
  });

  it('detects Line Monopoly victory when 1 player owns all properties on a side', () => {
    const state = createInitialState(TEST_PLAYERS, 3000);
    // Bottom side properties: 1, 3, 5, 6, 7
    [1, 3, 5, 6, 7].forEach((id) => {
      state.tileStates[id].ownerId = 1;
    });

    const victory = checkVictory(state);
    expect(victory).not.toBeNull();
    expect(victory?.winner).toBe(1);
    expect(victory?.reason).toBe('line_monopoly');
  });

  it('detects Triple Monopoly victory when 1 player owns 3 color sets', () => {
    const state = createInitialState(TEST_PLAYERS, 3000);
    // Brown: 1, 3
    state.tileStates[1].ownerId = 0;
    state.tileStates[3].ownerId = 0;

    // Sky: 6, 7
    state.tileStates[6].ownerId = 0;
    state.tileStates[7].ownerId = 0;

    // Pink: 9, 10
    state.tileStates[9].ownerId = 0;
    state.tileStates[10].ownerId = 0;

    expect(countColorMonopolies(0, state.tileStates)).toBe(3);
    const victory = checkVictory(state);
    expect(victory).not.toBeNull();
    expect(victory?.winner).toBe(0);
    expect(victory?.reason).toBe('triple_monopoly');
  });

  it('handles bankruptcy and transfers assets to creditor', () => {
    const state = createInitialState(TEST_PLAYERS, 3000);
    state.tileStates[1].ownerId = 1;
    state.tileStates[1].level = 2;

    handleBankruptcy(state, 1, 0);

    expect(state.players[1].isBankrupt).toBe(true);
    expect(state.tileStates[1].ownerId).toBe(0); // Transferred to player 0
    const victory = checkVictory(state);
    expect(victory?.winner).toBe(0);
    expect(victory?.reason).toBe('bankruptcy');
  });

  it('calculates net worth accurately', () => {
    const state = createInitialState(TEST_PLAYERS, 3000);
    // Player 0 has 2000 cash, tile 1 (cost 160 + level 2 houses = 160 + 200 = 360)
    state.players[0].money = 2000;
    state.tileStates[1].ownerId = 0;
    state.tileStates[1].level = 2;

    expect(calculateNetWorth(0, state.players, state.tileStates)).toBe(2360);
  });
});
