import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { audio } from '../../audio/engine';
import { useGame } from '../../store/useGame';
import { Mascot } from '../../ui/Mascot';
import { celebrate } from '../../ui/confetti';
import { BOARD_SIZE, JAIL_BAIL_COST, SALARY_AMOUNT, TILES } from './boardData';
import { Dice3D } from './Dice3D';
import {
  addLog,
  calculateBuyoutCost,
  calculateRent,
  createInitialState,
  handleBankruptcy,
  nextTurn,
  type MonopolyGameState,
} from './engine';
import { MonopolyBoard } from './MonopolyBoard';
import {
  BuyPropertyModal,
  BuyoutModal,
  ChanceCardModal,
  PLAYER_COLORS,
  VictoryModal,
} from './MonopolyModals';
import { MonopolyRulesModal } from './MonopolyRulesModal';
import type { BuildingLevel, ChanceCard, MonopolyPlayer, TileState } from './types';

/* ═══════════════════════════════════════════════════════════════
   MonopolyScreen  –  Dark VNG-style Layout
   ═══════════════════════════════════════════════════════════════ */
export function MonopolyScreen() {
  const go = useGame((s) => s.go);
  const monopolyPlayers = useGame((s) => s.monopolyPlayers);
  const startingCash = useGame((s) => s.settings.monopolyStartingCash ?? 3000);
  const reduceMotion = useGame((s) => s.settings.reduceMotion);
  const recordMonopolyResult = useGame((s) => s.recordMonopolyResult);

  const [state, setState] = useState<MonopolyGameState>(() =>
    createInitialState(monopolyPlayers, startingCash),
  );
  const [showRules, setShowRules] = useState(false);
  const [activeChance, setActiveChance] = useState<ChanceCard | null>(null);
  const [activeBuyTile, setActiveBuyTile] = useState<number | null>(null);
  const [activeBuyout, setActiveBuyout] = useState<{
    tileId: number; cost: number; ownerId: number;
  } | null>(null);

  const movingRef = useRef(false);
  const currPlayer = state.players[state.currentTurn];
  const isBot = currPlayer?.isBot ?? false;

  /* ─── Move player step-by-step ─── */
  const movePlayerSteps = (playerId: number, steps: number, onComplete: () => void) => {
    movingRef.current = true;
    setState((s) => ({ ...s, phase: 'moving' }));
    let count = 0;
    const interval = setInterval(() => {
      setState((prev) => {
        const next = { ...prev };
        const p = { ...next.players[playerId] };
        const oldPos = p.position;
        const newPos = (oldPos + 1) % BOARD_SIZE;
        p.position = newPos;
        if (newPos === 0 || (oldPos > newPos && newPos > 0)) {
          p.money += SALARY_AMOUNT;
          audio.sfx('cash');
          addLog(next, `💵 ${p.name} đi qua Xuất Phát → +${SALARY_AMOUNT}K`, 'info', playerId);
        } else {
          audio.sfx('drop');
        }
        next.players = next.players.map((item, idx) => (idx === playerId ? p : item));
        return next;
      });
      count++;
      if (count >= steps) {
        clearInterval(interval);
        movingRef.current = false;
        onComplete();
      }
    }, 220);
  };

  /* ─── Land on tile ─── */
  const handleLandOnTile = (tileId: number, playerIdx: number) => {
    const tile = TILES[tileId];
    const s = { ...state };
    const p = s.players[playerIdx];
    const tileState = s.tileStates[tileId];
    addLog(s, `📍 ${p.name} dừng tại ${tile.name}`, 'info', playerIdx);

    if (tile.type === 'start') {
      p.money += SALARY_AMOUNT;
      audio.sfx('cash');
      addLog(s, `🎉 ${p.name} đáp trúng Xuất Phát → +${SALARY_AMOUNT}K`, 'info', playerIdx);
      finishAction(s); return;
    }
    if (tile.type === 'tax') {
      let tax = tile.taxAmount === '10percent' ? Math.floor(p.money * 0.1) : (typeof tile.taxAmount === 'number' ? tile.taxAmount : 150);
      if (p.money < tax) { handleBankruptcy(s, playerIdx, null); }
      else { p.money -= tax; audio.sfx('error'); addLog(s, `💸 ${p.name} nộp ${tax}K thuế`, 'jail', playerIdx); }
      finishAction(s); return;
    }
    if (tile.type === 'jail') {
      p.inJail = true; p.jailTurns = 0;
      audio.sfx('siren');
      addLog(s, `🔒 ${p.name} vào Kho Lưu Trữ!`, 'jail', playerIdx);
      finishAction(s); return;
    }
    if (tile.type === 'travel') {
      p.hasTravelPass = true; audio.sfx('festival');
      addLog(s, `✈️ ${p.name} đến Sân Bay — lượt sau bay tự do!`, 'travel', playerIdx);
      finishAction(s); return;
    }
    if (tile.type === 'festival') {
      const owned = s.tileStates.map((ts, idx) => ({ ...ts, id: idx })).filter(ts => ts.ownerId === playerIdx);
      if (owned.length > 0) {
        const best = owned.sort((a, b) => calculateRent(b.id, s.tileStates) - calculateRent(a.id, s.tileStates))[0];
        s.tileStates.forEach(ts => (ts.isFestival = false));
        s.tileStates[best.id].isFestival = true;
        audio.sfx('festival');
        addLog(s, `🎉 ${p.name} cắm Lễ Hội tại ${TILES[best.id].name} (x2)!`, 'festival', playerIdx);
      } else {
        addLog(s, `🎉 ${p.name} chưa có đất để tổ chức Lễ Hội!`, 'info', playerIdx);
      }
      finishAction(s); return;
    }
    if (tile.type === 'chance') {
      const card: ChanceCard = {
        id: 'bonus', title: 'Thưởng KPI Xuất Sắc',
        description: 'Dự án vượt chỉ tiêu quý! Nhận 300K.', type: 'money', amount: 300,
      };
      setActiveChance(card);
      applyChanceCard(card, playerIdx, s); return;
    }
    if (tile.type === 'property' || tile.type === 'transport') {
      if (tileState.ownerId === null) {
        if (p.isBot) {
          const cost = tile.cost ?? 200;
          if (p.money >= cost + 200) { p.money -= cost; tileState.ownerId = playerIdx; audio.sfx('build'); addLog(s, `🏢 Bot ${p.name} mua ${tile.name} (${cost}K)`, 'buy', playerIdx); }
          finishAction(s);
        } else { setState(s); setActiveBuyTile(tileId); }
        return;
      }
      if (tileState.ownerId === playerIdx) {
        if (tile.type === 'property' && tileState.level < 4) {
          if (p.isBot) {
            const hCost = tile.houseCost ?? 150;
            if (p.money >= hCost + 300) { p.money -= hCost; tileState.level = (tileState.level + 1) as BuildingLevel; audio.sfx(tileState.level === 4 ? 'landmark' : 'build'); addLog(s, `🏰 Bot ${p.name} nâng cấp ${tile.name} lên cấp ${tileState.level}`, 'buy', playerIdx); }
            finishAction(s);
          } else { setState(s); setActiveBuyTile(tileId); }
          return;
        }
        finishAction(s); return;
      }
      if (tileState.ownerId !== playerIdx) {
        const owner = s.players[tileState.ownerId];
        const rent = calculateRent(tileId, s.tileStates);
        if (p.freePassCount > 0) { p.freePassCount -= 1; audio.sfx('reseed'); addLog(s, `🛡️ ${p.name} dùng Vé Miễn Phí!`, 'info', playerIdx); finishAction(s); return; }
        if (p.money < rent) { owner.money += p.money; handleBankruptcy(s, playerIdx, owner.id); finishAction(s); return; }
        p.money -= rent; owner.money += rent; audio.sfx('cash');
        addLog(s, `💸 ${p.name} trả ${rent}K thuê cho ${owner.name}`, 'rent', playerIdx);
        const buyoutCost = calculateBuyoutCost(tileId, s.tileStates);
        if (tileState.level < 4 && p.money >= buyoutCost) {
          if (p.isBot) {
            if (p.money >= buyoutCost + 600) { p.money -= buyoutCost; owner.money += buyoutCost; tileState.ownerId = playerIdx; audio.sfx('landmark'); addLog(s, `⚔️ Bot ${p.name} THÂU TÓM ${tile.name}!`, 'buy', playerIdx); }
            finishAction(s);
          } else { setState(s); setActiveBuyout({ tileId, cost: buyoutCost, ownerId: owner.id }); return; }
        } else { finishAction(s); return; }
      }
    }
    finishAction(s);
  };

  const applyChanceCard = (card: ChanceCard, playerIdx: number, s: MonopolyGameState) => {
    const p = s.players[playerIdx];
    if (card.amount) {
      if (card.amount < 0 && p.money < Math.abs(card.amount)) handleBankruptcy(s, playerIdx, null);
      else { p.money += card.amount; audio.sfx(card.amount > 0 ? 'cash' : 'error'); }
    }
    setState({ ...s });
  };

  const finishAction = (s: MonopolyGameState) => {
    setState({ ...s });
    setTimeout(() => { setState(prev => { const next = { ...prev }; nextTurn(next); return next; }); }, 400);
  };

  /* ─── Roll dice ─── */
  const handleRollDice = (_total: number, d1: number, d2: number, isDouble: boolean) => {
    if (state.phase !== 'ready' || movingRef.current) return;
    const s = { ...state }; const p = s.players[s.currentTurn]; s.lastDice = [d1, d2];
    if (p.inJail) {
      if (isDouble) { p.inJail = false; p.jailTurns = 0; audio.sfx('reseed'); addLog(s, `🔓 ${p.name} gieo đôi → Ra tù!`, 'info', p.id); }
      else {
        p.jailTurns += 1;
        if (p.jailTurns >= 3 && p.money >= JAIL_BAIL_COST) { p.money -= JAIL_BAIL_COST; p.inJail = false; p.jailTurns = 0; audio.sfx('cash'); addLog(s, `🔓 ${p.name} nộp ${JAIL_BAIL_COST}K bảo lãnh`, 'info', p.id); }
        else { addLog(s, `🔒 ${p.name} ở tù (${p.jailTurns}/3)`, 'jail', p.id); finishAction(s); return; }
      }
    }
    if (isDouble) { s.consecutiveDoubles += 1; if (s.consecutiveDoubles >= 3) { p.inJail = true; p.position = 8; s.consecutiveDoubles = 0; audio.sfx('siren'); addLog(s, `🚨 ${p.name} đổ đôi 3 lần → Vào tù!`, 'jail', p.id); finishAction(s); return; } }
    else s.consecutiveDoubles = 0;
    setState(s);
    const steps = d1 + d2;
    movePlayerSteps(p.id, steps, () => { handleLandOnTile((p.position + steps) % BOARD_SIZE, p.id); });
  };

  const handleSelectTravelTile = (targetTileId: number) => {
    if (state.phase !== 'travel_select') return;
    const s = { ...state }; const p = s.players[s.currentTurn];
    p.hasTravelPass = false; p.position = targetTileId; audio.sfx('festival');
    addLog(s, `✈️ ${p.name} bay tới ${TILES[targetTileId].name}!`, 'travel', p.id);
    setState(s); handleLandOnTile(targetTileId, p.id);
  };

  useEffect(() => {
    if (state.phase === 'travel_select' && currPlayer?.isBot) {
      const t = setTimeout(() => handleSelectTravelTile(currPlayer.money > 2000 ? 31 : 0), 1000);
      return () => clearTimeout(t);
    }
  }, [state.phase, currPlayer]);

  useEffect(() => {
    if (state.winner !== null && state.phase === 'game_over') {
      audio.sfx('win'); celebrate(reduceMotion);
      recordMonopolyResult(state.winner, state.players);
    }
  }, [state.winner, state.phase]);

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <div className="screen" style={{
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at 50% 40%, #1a2744 0%, #0c1220 60%, #060a12 100%)',
    }}>
      {/* ── Top-left glow accent ── */}
      <div style={{
        position: 'absolute', top: -200, left: -200, width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Top bar ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 70,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 30px', zIndex: 50,
      }}>
        <button onClick={() => go('menu')} style={{
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#E2E8F0', padding: '8px 20px', borderRadius: 999,
          fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          ← Menu
        </button>
        <div style={{
          color: '#D69E2E', fontSize: 28, fontWeight: 900,
          textShadow: '0 0 20px rgba(214,158,46,0.4)',
          letterSpacing: 2,
        }}>
          ⭐ CỜ TỶ PHÚ NKC ⭐
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowRules(true)} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#E2E8F0', padding: '8px 16px', borderRadius: 999,
            fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            📖 Luật
          </button>
        </div>
      </div>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div style={{
        position: 'absolute', top: 70, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* ── Left Panel: Players 1 & 2 ── */}
        <div style={{
          position: 'absolute', left: 20, top: 20,
          display: 'flex', flexDirection: 'column', gap: 14, width: 350, zIndex: 40,
        }}>
          {state.players.slice(0, 2).map(p => (
            <VNGPlayerCard key={p.id} player={p} isCurrentTurn={state.currentTurn === p.id} tileStates={state.tileStates} />
          ))}
        </div>

        {/* ── Right Panel: Players 3 & 4 + Log ── */}
        <div style={{
          position: 'absolute', right: 20, top: 20,
          display: 'flex', flexDirection: 'column', gap: 14, width: 350, zIndex: 40,
        }}>
          {state.players.slice(2, 4).map(p => (
            <VNGPlayerCard key={p.id} player={p} isCurrentTurn={state.currentTurn === p.id} tileStates={state.tileStates} />
          ))}
        </div>

        {/* ── BOARD (center) ── */}
        <MonopolyBoard
          tileStates={state.tileStates}
          players={state.players}
          onTileClick={state.phase === 'travel_select' ? handleSelectTravelTile : undefined}
          centerContent={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              {/* Round & stats bar */}
              <div style={{
                display: 'flex', gap: 16, alignItems: 'center',
              }}>
                <div style={{
                  background: 'rgba(255,255,255,0.08)', padding: '4px 16px',
                  borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)',
                  color: '#A0AEC0', fontSize: 13, fontWeight: 700,
                }}>
                  Vòng <span style={{ color: '#E2E8F0', fontWeight: 900 }}>{state.round}</span>/{state.maxRounds}
                </div>
              </div>

              {/* Current player name */}
              <div style={{
                color: '#E2E8F0', fontSize: 20, fontWeight: 900, textAlign: 'center',
                textShadow: '0 0 12px rgba(56,189,248,0.3)',
              }}>
                Lượt: <span style={{ color: PLAYER_COLORS[currPlayer?.color]?.border ?? '#38BDF8' }}>
                  {currPlayer?.name}
                </span>
              </div>

              {/* Dice or travel select */}
              {state.phase === 'travel_select' ? (
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{
                    background: 'linear-gradient(135deg, #0284C7, #0369A1)',
                    color: '#fff', padding: '10px 20px', borderRadius: 14,
                    fontSize: 16, fontWeight: 800, textAlign: 'center',
                    boxShadow: '0 4px 16px rgba(2,132,199,0.4)',
                  }}
                >
                  ✈️ Click ô bất kỳ để bay tới!
                </motion.div>
              ) : (
                <Dice3D
                  disabled={state.phase !== 'ready' || currPlayer?.isBankrupt}
                  isBot={isBot}
                  onRoll={handleRollDice}
                />
              )}
            </div>
          }
        />

        {/* ── Bottom: Action Log ── */}
        <div style={{
          position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
          width: 700, maxHeight: 130,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
          padding: '10px 18px', zIndex: 40,
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <div style={{ color: '#A0AEC0', fontSize: 12, fontWeight: 800 }}>📜 Diễn biến</div>
          <div style={{
            flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3,
            fontSize: 12, color: '#CBD5E0',
          }}>
            {state.logs.slice(0, 6).map(log => (
              <div key={log.id} style={{ lineHeight: 1.3 }}>
                <span style={{ color: '#63B3ED', fontWeight: 700 }}>[{log.turn}]</span> {log.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ MODALS ═══ */}
      <AnimatePresence>
        {activeBuyTile !== null && (
          <BuyPropertyModal tileId={activeBuyTile} tileState={state.tileStates[activeBuyTile]} player={currPlayer}
            onBuy={(level) => { const tile = TILES[activeBuyTile]; const s = { ...state }; const p = s.players[s.currentTurn]; const cost = level === 0 ? (tile.cost ?? 200) : (tile.houseCost ?? 150); p.money -= cost; s.tileStates[activeBuyTile].ownerId = p.id; s.tileStates[activeBuyTile].level = level; addLog(s, `🏢 ${p.name} đầu tư ${tile.name} (Cấp ${level})`, 'buy', p.id); setActiveBuyTile(null); finishAction(s); }}
            onSkip={() => { setActiveBuyTile(null); finishAction(state); }}
          />
        )}
        {activeBuyout !== null && (
          <BuyoutModal tileId={activeBuyout.tileId} cost={activeBuyout.cost} owner={state.players[activeBuyout.ownerId]} buyer={currPlayer}
            onBuyout={() => { const s = { ...state }; const p = s.players[s.currentTurn]; const owner = s.players[activeBuyout.ownerId]; p.money -= activeBuyout.cost; owner.money += activeBuyout.cost; s.tileStates[activeBuyout.tileId].ownerId = p.id; addLog(s, `⚔️ ${p.name} THÂU TÓM ${TILES[activeBuyout.tileId].name}!`, 'buy', p.id); setActiveBuyout(null); finishAction(s); }}
            onSkip={() => { setActiveBuyout(null); finishAction(state); }}
          />
        )}
        {activeChance !== null && (
          <ChanceCardModal card={activeChance} onClose={() => { setActiveChance(null); finishAction(state); }} />
        )}
        {state.phase === 'game_over' && state.winner !== null && (
          <VictoryModal winner={state.players[state.winner]} reason={state.victoryReason} players={state.players}
            onPlayAgain={() => setState(createInitialState(monopolyPlayers, startingCash))}
            onExit={() => go('menu')}
          />
        )}
        {showRules && <MonopolyRulesModal onClose={() => setShowRules(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   VNG-style Player Card  (avatar + stats, dark glass)
   ═══════════════════════════════════════════════════════ */
function VNGPlayerCard({ player, isCurrentTurn, tileStates }: {
  player: MonopolyPlayer; isCurrentTurn: boolean; tileStates: TileState[];
}) {
  const pColor = PLAYER_COLORS[player.color];
  const ownedCount = tileStates.filter(ts => ts.ownerId === player.id).length;
  const landmarkCount = tileStates.filter(ts => ts.ownerId === player.id && ts.level === 4).length;

  return (
    <motion.div
      animate={isCurrentTurn && !player.isBankrupt
        ? { boxShadow: ['0 0 0 rgba(56,189,248,0)', '0 0 24px rgba(56,189,248,0.5)', '0 0 0 rgba(56,189,248,0)'] }
        : {}
      }
      transition={{ duration: 2, repeat: Infinity }}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px', borderRadius: 18,
        background: player.isBankrupt
          ? 'rgba(0,0,0,0.4)'
          : 'linear-gradient(135deg, rgba(26,32,44,0.9), rgba(45,55,72,0.85))',
        backdropFilter: 'blur(12px)',
        border: isCurrentTurn
          ? `2px solid ${pColor.border}`
          : '1px solid rgba(255,255,255,0.1)',
        opacity: player.isBankrupt ? 0.5 : 1,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Turn badge */}
      {isCurrentTurn && !player.isBankrupt && (
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{
            position: 'absolute', top: -6, right: -6,
            width: 34, height: 34, borderRadius: '50%',
            background: `linear-gradient(135deg, ${pColor.border}, ${pColor.bg})`,
            border: '3px solid #fff',
            display: 'grid', placeItems: 'center',
            fontSize: 16, fontWeight: 900, color: pColor.text,
            boxShadow: `0 4px 14px ${pColor.border}88`,
            zIndex: 5,
          }}
        >
          {player.id + 1}
        </motion.div>
      )}

      {/* Avatar */}
      <div style={{ flexShrink: 0, position: 'relative' }}>
        <Mascot
          color={player.color}
          pose={player.isBankrupt ? 'lose' : isCurrentTurn ? 'win' : 'wave'}
          size={72}
        />
        {player.isBot && (
          <span style={{
            position: 'absolute', bottom: -2, right: -2,
            background: '#7C3AED', color: '#fff',
            fontSize: 8, fontWeight: 900, padding: '1px 5px',
            borderRadius: 4, border: '1px solid rgba(255,255,255,0.3)',
          }}>BOT</span>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
        <div style={{
          fontSize: 16, fontWeight: 900, color: '#E2E8F0',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {player.name}
        </div>

        {/* Status badges */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {player.inJail && (
            <span style={{ fontSize: 10, background: 'rgba(239,68,68,0.3)', color: '#FCA5A5', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
              🔒 Tù ({player.jailTurns}/3)
            </span>
          )}
          {player.isBankrupt && (
            <span style={{ fontSize: 10, background: 'rgba(100,116,139,0.4)', color: '#94A3B8', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
              💥 Phá sản
            </span>
          )}
        </div>

        {/* Money */}
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 6,
        }}>
          <span style={{ fontSize: 9, color: '#A0AEC0', fontWeight: 700 }}>Tiền mặt</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#48BB78' }}>
            {player.money.toLocaleString()}
          </span>
          <span style={{ fontSize: 10, color: '#68D391', fontWeight: 700 }}>K</span>
        </div>

        {/* Assets row */}
        <div style={{ display: 'flex', gap: 10, fontSize: 10, color: '#A0AEC0', fontWeight: 600 }}>
          <span>🏢{ownedCount}</span>
          <span>🏰{landmarkCount}</span>
          {player.freePassCount > 0 && <span>🎟️{player.freePassCount}</span>}
        </div>
      </div>
    </motion.div>
  );
}
