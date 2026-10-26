import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { audio } from '../../audio/engine';
import { MenuBackground } from '../../backgrounds/Backgrounds';
import { useGame } from '../../store/useGame';
import { Button } from '../../ui/Button';
import { IconTrophy } from '../../ui/Icons';
import { Mascot } from '../../ui/Mascot';
import { TopBar } from '../../ui/TopBar';
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
  const [activeBuyout, setActiveBuyout] = useState<{ tileId: number; cost: number; ownerId: number } | null>(null);

  const movingRef = useRef(false);

  const currPlayer = state.players[state.currentTurn];
  const isBot = currPlayer?.isBot ?? false;

  // Xử lý tự động di chuyển từng bước (Step-by-step token walking)
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

        // Đi qua ô Bắt Đầu nhận lương 500K
        if (newPos === 0 || (oldPos > newPos && newPos > 0)) {
          p.money += SALARY_AMOUNT;
          audio.sfx('cash');
          addLog(next, `💵 ${p.name} đi qua Xuất Phát và nhận ${SALARY_AMOUNT}K lương!`, 'info', playerId);
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
    }, 240);
  };

  // Xử lý sau khi người chơi đáp chân vào 1 ô (Land on Tile)
  const handleLandOnTile = (tileId: number, playerIdx: number) => {
    const tile = TILES[tileId];
    const s = { ...state };
    const p = s.players[playerIdx];
    const tileState = s.tileStates[tileId];

    addLog(s, `📍 ${p.name} đã dừng tại ${tile.name}`, 'info', playerIdx);

    // 1. Ô Xuất Phát
    if (tile.type === 'start') {
      p.money += SALARY_AMOUNT;
      audio.sfx('cash');
      addLog(s, `🎉 ${p.name} đáp trúng Xuất Phát, nhận thêm ${SALARY_AMOUNT}K thưởng!`, 'info', playerIdx);
      finishAction(s);
      return;
    }

    // 2. Ô Thuế / Phí Công Đoàn
    if (tile.type === 'tax') {
      let tax = 0;
      if (tile.taxAmount === '10percent') {
        tax = Math.floor(p.money * 0.1);
      } else {
        tax = typeof tile.taxAmount === 'number' ? tile.taxAmount : 150;
      }

      if (p.money < tax) {
        handleBankruptcy(s, playerIdx, null);
      } else {
        p.money -= tax;
        audio.sfx('error');
        addLog(s, `💸 ${p.name} nộp ${tax.toLocaleString()}K tiền thuế/công đoàn!`, 'jail', playerIdx);
      }
      finishAction(s);
      return;
    }

    // 3. Ô Kho Lưu Trữ (Côn Đảo / Vào Tù)
    if (tile.type === 'jail') {
      p.inJail = true;
      p.jailTurns = 0;
      audio.sfx('siren');
      addLog(s, `🔒 ${p.name} phải vào Kho Lưu Trữ kiểm kê tài liệu!`, 'jail', playerIdx);
      finishAction(s);
      return;
    }

    // 4. Ô Sân Bay Du Lịch Công Tác
    if (tile.type === 'travel') {
      p.hasTravelPass = true;
      audio.sfx('festival');
      addLog(s, `✈️ ${p.name} đã đến Sân Bay! Lượt sau sẽ được chọn bay tự do!`, 'travel', playerIdx);
      finishAction(s);
      return;
    }

    // 5. Ô Lễ Hội NKC
    if (tile.type === 'festival') {
      // Tìm các đất người này đang sở hữu
      const owned = s.tileStates
        .map((ts, idx) => ({ ...ts, id: idx }))
        .filter((ts) => ts.ownerId === playerIdx);

      if (owned.length > 0) {
        // Chọn đất có tiền thuê cao nhất để gắn cờ Lễ Hội
        const best = owned.sort((a, b) => calculateRent(b.id, s.tileStates) - calculateRent(a.id, s.tileStates))[0];
        s.tileStates.forEach((ts) => (ts.isFestival = false));
        s.tileStates[best.id].isFestival = true;
        audio.sfx('festival');
        addLog(s, `🎉 ${p.name} tổ chức Lễ Hội tại ${TILES[best.id].name} (x2 tiền thuê)!`, 'festival', playerIdx);
      } else {
        addLog(s, `🎉 ${p.name} vào Lễ Hội nhưng chưa sở hữu khu đất nào!`, 'info', playerIdx);
      }
      finishAction(s);
      return;
    }

    // 6. Ô Thẻ May Mắn (Cơ Hội)
    if (tile.type === 'chance') {
      const card = {
        id: 'bonus',
        title: 'Thưởng KPI Xuất Sắc',
        description: 'Dự án của bạn vượt chỉ tiêu quý! Nhận 300K tiền thưởng.',
        type: 'money' as const,
        amount: 300,
      };
      setActiveChance(card);
      applyChanceCard(card, playerIdx, s);
      return;
    }

    // 7. Ô Bất Động Sản hoặc Tuyến Giao Thông
    if (tile.type === 'property' || tile.type === 'transport') {
      // Chưa có ai sở hữu
      if (tileState.ownerId === null) {
        if (p.isBot) {
          // Bot logic: mua nếu còn tiền
          const cost = tile.cost ?? 200;
          if (p.money >= cost + 200) {
            p.money -= cost;
            tileState.ownerId = playerIdx;
            tileState.level = 0;
            audio.sfx('build');
            addLog(s, `🏢 Bot ${p.name} đã mua ${tile.name} (${cost}K)!`, 'buy', playerIdx);
          }
          finishAction(s);
        } else {
          // Người thật: Mở popup hỏi mua
          setState(s);
          setActiveBuyTile(tileId);
        }
        return;
      }

      // Đất của chính mình: Nâng cấp nhà
      if (tileState.ownerId === playerIdx) {
        if (tile.type === 'property' && tileState.level < 4) {
          if (p.isBot) {
            const hCost = tile.houseCost ?? 150;
            if (p.money >= hCost + 300) {
              p.money -= hCost;
              tileState.level = (tileState.level + 1) as BuildingLevel;
              audio.sfx(tileState.level === 4 ? 'landmark' : 'build');
              addLog(s, `🏰 Bot ${p.name} nâng cấp ${tile.name} lên cấp ${tileState.level}!`, 'buy', playerIdx);
            }
            finishAction(s);
          } else {
            setState(s);
            setActiveBuyTile(tileId);
          }
          return;
        } else {
          finishAction(s);
          return;
        }
      }

      // Đất của đối thủ: Trả tiền thuê
      if (tileState.ownerId !== playerIdx) {
        const owner = s.players[tileState.ownerId];
        let rent = calculateRent(tileId, s.tileStates);

        // Kiểm tra Thẻ Miễn Phí Tiền Thuê
        if (p.freePassCount > 0) {
          p.freePassCount -= 1;
          audio.sfx('reseed');
          addLog(s, `🛡️ ${p.name} sử dụng Vé Miễn Phí Thuê Nhà tại ${tile.name}!`, 'info', playerIdx);
          finishAction(s);
          return;
        }

        // Trả tiền thuê
        if (p.money < rent) {
          // Phá sản
          owner.money += p.money;
          handleBankruptcy(s, playerIdx, owner.id);
          finishAction(s);
          return;
        } else {
          p.money -= rent;
          owner.money += rent;
          audio.sfx('cash');
          addLog(s, `💸 ${p.name} trả ${rent.toLocaleString()}K tiền thuê cho ${owner.name}!`, 'rent', playerIdx);

          // Cơ chế THÂU TÓM (Buyout) nếu chưa phải Landmark
          const buyoutCost = calculateBuyoutCost(tileId, s.tileStates);
          if (tileState.level < 4 && p.money >= buyoutCost) {
            if (p.isBot) {
              // Bot quyết định mua lại nếu nhiều tiền
              if (p.money >= buyoutCost + 600) {
                p.money -= buyoutCost;
                owner.money += buyoutCost;
                tileState.ownerId = playerIdx;
                audio.sfx('landmark');
                addLog(s, `⚔️ Bot ${p.name} đã THÂU TÓM ${tile.name} từ ${owner.name}!`, 'buy', playerIdx);
              }
              finishAction(s);
            } else {
              setState(s);
              setActiveBuyout({ tileId, cost: buyoutCost, ownerId: owner.id });
              return;
            }
          } else {
            finishAction(s);
            return;
          }
        }
      }
    }

    finishAction(s);
  };

  const applyChanceCard = (card: ChanceCard, playerIdx: number, s: MonopolyGameState) => {
    const p = s.players[playerIdx];
    if (card.amount) {
      if (card.amount < 0 && p.money < Math.abs(card.amount)) {
        handleBankruptcy(s, playerIdx, null);
      } else {
        p.money += card.amount;
        if (card.amount > 0) audio.sfx('cash');
        else audio.sfx('error');
      }
    }
    setState({ ...s });
  };

  const finishAction = (s: MonopolyGameState) => {
    setState({ ...s });
    setTimeout(() => {
      setState((prev) => {
        const next = { ...prev };
        nextTurn(next);
        return next;
      });
    }, 400);
  };

  // Người chơi gieo xúc xắc
  const handleRollDice = (_total: number, d1: number, d2: number, isDouble: boolean) => {
    if (state.phase !== 'ready' || movingRef.current) return;

    const s = { ...state };
    const p = s.players[s.currentTurn];
    s.lastDice = [d1, d2];

    // Nếu đang ở trong tù (Kho Lưu Trữ)
    if (p.inJail) {
      if (isDouble) {
        p.inJail = false;
        p.jailTurns = 0;
        audio.sfx('reseed');
        addLog(s, `🔓 ${p.name} gieo đôi ${d1}-${d2} và được ra tù tự do!`, 'info', p.id);
      } else {
        p.jailTurns += 1;
        if (p.jailTurns >= 3 && p.money >= JAIL_BAIL_COST) {
          p.money -= JAIL_BAIL_COST;
          p.inJail = false;
          p.jailTurns = 0;
          audio.sfx('cash');
          addLog(s, `🔓 ${p.name} nộp ${JAIL_BAIL_COST}K bảo lãnh để ra tù!`, 'info', p.id);
        } else {
          addLog(s, `🔒 ${p.name} chưa gieo được đôi, tiếp tục ở lại Kho Lưu Trữ (${p.jailTurns}/3)!`, 'jail', p.id);
          finishAction(s);
          return;
        }
      }
    }

    // Xử lý đếm đổ đôi
    if (isDouble) {
      s.consecutiveDoubles += 1;
      if (s.consecutiveDoubles >= 3) {
        p.inJail = true;
        p.position = 8; // Đưa thẳng vào ô tù
        s.consecutiveDoubles = 0;
        audio.sfx('siren');
        addLog(s, `🚨 ${p.name} đổ đôi 3 lần liên tiếp! Bị đưa vào Kho Lưu Trữ!`, 'jail', p.id);
        finishAction(s);
        return;
      }
    } else {
      s.consecutiveDoubles = 0;
    }

    setState(s);
    const steps = d1 + d2;
    movePlayerSteps(p.id, steps, () => {
      const targetPos = (p.position + steps) % BOARD_SIZE;
      handleLandOnTile(targetPos, p.id);
    });
  };

  // Chọn bay tự do từ Sân Bay
  const handleSelectTravelTile = (targetTileId: number) => {
    if (state.phase !== 'travel_select') return;
    const s = { ...state };
    const p = s.players[s.currentTurn];
    p.hasTravelPass = false;
    p.position = targetTileId;
    audio.sfx('festival');
    addLog(s, `✈️ ${p.name} đã bay thẳng tới ${TILES[targetTileId].name}!`, 'travel', p.id);
    setState(s);
    handleLandOnTile(targetTileId, p.id);
  };

  // Bot tự động chọn ô khi ở Sân Bay
  useEffect(() => {
    if (state.phase === 'travel_select' && currPlayer?.isBot) {
      const timer = setTimeout(() => {
        // Ưu tiên bay tới CEO Tower (31) hoặc ô Bắt Đầu (0)
        const target = currPlayer.money > 2000 ? 31 : 0;
        handleSelectTravelTile(target);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.phase, currPlayer]);

  // Xử lý khi có người chiến thắng
  useEffect(() => {
    if (state.winner !== null && state.phase === 'game_over') {
      audio.sfx('win');
      celebrate(reduceMotion);
      recordMonopolyResult(state.winner, state.players);
    }
  }, [state.winner, state.phase, reduceMotion, recordMonopolyResult, state.players]);

  return (
    <div className="screen" style={{ overflow: 'hidden' }}>
      <MenuBackground />

      <TopBar
        onBack={() => go('menu')}
        title="Cờ Tỷ Phú NKC"
        actions={
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="white" size="small" onClick={() => setShowRules(true)}>
              📖 Luật Chơi
            </Button>
            <Button variant="white" size="small" onClick={() => go('leaderboard')}>
              <span style={{ width: 22, height: 22, display: 'inline-block', marginRight: 6 }}>
                <IconTrophy />
              </span>
              BXH
            </Button>
          </div>
        }
      />

      {/* KHUNG GAMEPLAY CHÍNH 1920x1080 */}
      <div
        style={{
          position: 'absolute',
          top: 100,
          left: 40,
          right: 40,
          bottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {/* PANEL TRÁI: NGƯỜI CHƠI 1 & 2 */}
        <div style={{ width: 440, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {state.players.slice(0, 2).map((p) => (
            <PlayerHUDCard
              key={p.id}
              player={p}
              isCurrentTurn={state.currentTurn === p.id}
              tileStates={state.tileStates}
            />
          ))}

          {/* NHẬT KÝ VÁN ĐẤU (ACTION LOG TICKER) */}
          <div
            className="panel"
            style={{
              height: 220,
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              background: 'rgba(255,255,255,0.92)',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--ink)' }}>📜 Diễn biến trận đấu</div>
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                fontSize: 13,
                color: 'var(--ink-soft)',
              }}
            >
              {state.logs.map((log) => (
                <div key={log.id} style={{ lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 800, color: '#3B82F6' }}>[Vòng {log.turn}]</span> {log.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BÀN CỜ TRUNG TÂM (864x864) */}
        <MonopolyBoard
          tileStates={state.tileStates}
          players={state.players}
          onTileClick={state.phase === 'travel_select' ? handleSelectTravelTile : undefined}
          centerContent={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              {/* Hiển thị vòng & người chơi hiện tại */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '6px 20px',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#94A3B8',
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                VÒNG {state.round} / {state.maxRounds}
              </div>

              <div style={{ color: '#F8FAFC', fontSize: 24, fontWeight: 900, textAlign: 'center' }}>
                Lượt của <span style={{ color: '#38BDF8' }}>{currPlayer?.name}</span>
              </div>

              {state.phase === 'travel_select' ? (
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{
                    background: 'linear-gradient(135deg, #0284C7, #0369A1)',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: 16,
                    fontSize: 18,
                    fontWeight: 800,
                    textAlign: 'center',
                    boxShadow: '0 4px 16px rgba(2,132,199,0.4)',
                  }}
                >
                  ✈️ Click vào ô bất kỳ trên bàn cờ để bay tới!
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

        {/* PANEL PHẢI: NGƯỜI CHƠI 3 & 4 */}
        <div style={{ width: 440, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {state.players.slice(2, 4).map((p) => (
            <PlayerHUDCard
              key={p.id}
              player={p}
              isCurrentTurn={state.currentTurn === p.id}
              tileStates={state.tileStates}
            />
          ))}

          {/* HƯỚNG DẪN NHANH */}
          <div
            className="panel"
            style={{
              padding: '18px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              background: 'linear-gradient(145deg, #EFF6FF, #DBEAFE)',
              border: '2px solid #93C5FD',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1E40AF' }}>💡 Mẹo thắng nhanh kiểu VNG</div>
            <div style={{ fontSize: 13, color: '#1E3A8A', lineHeight: 1.5 }}>
              • Gom trọn <strong>3 Bộ Màu</strong> hoặc <strong>1 Hàng Cạnh</strong> để thắng ngay lập tức!
              <br />• Xây lên <strong>Landmark</strong> để bảo vệ bất động sản vĩnh viễn không bị mua lại.
              <br />• Cắm cờ <strong>Lễ Hội</strong> vào ô VIP để nhân đôi tiền phạt của đối thủ.
            </div>
          </div>
        </div>
      </div>

      {/* CÁC MODAL TƯƠNG TÁC */}
      <AnimatePresence>
        {activeBuyTile !== null && (
          <BuyPropertyModal
            tileId={activeBuyTile}
            tileState={state.tileStates[activeBuyTile]}
            player={currPlayer}
            onBuy={(level) => {
              const tile = TILES[activeBuyTile];
              const s = { ...state };
              const p = s.players[s.currentTurn];
              const cost = level === 0 ? (tile.cost ?? 200) : (tile.houseCost ?? 150);
              p.money -= cost;
              s.tileStates[activeBuyTile].ownerId = p.id;
              s.tileStates[activeBuyTile].level = level;
              addLog(s, `🏢 ${p.name} đã đầu tư ${tile.name} (Cấp ${level})!`, 'buy', p.id);
              setActiveBuyTile(null);
              finishAction(s);
            }}
            onSkip={() => {
              setActiveBuyTile(null);
              finishAction(state);
            }}
          />
        )}

        {activeBuyout !== null && (
          <BuyoutModal
            tileId={activeBuyout.tileId}
            cost={activeBuyout.cost}
            owner={state.players[activeBuyout.ownerId]}
            buyer={currPlayer}
            onBuyout={() => {
              const s = { ...state };
              const p = s.players[s.currentTurn];
              const owner = s.players[activeBuyout.ownerId];
              p.money -= activeBuyout.cost;
              owner.money += activeBuyout.cost;
              s.tileStates[activeBuyout.tileId].ownerId = p.id;
              addLog(s, `⚔️ ${p.name} đã THÂU TÓM ${TILES[activeBuyout.tileId].name} từ ${owner.name}!`, 'buy', p.id);
              setActiveBuyout(null);
              finishAction(s);
            }}
            onSkip={() => {
              setActiveBuyout(null);
              finishAction(state);
            }}
          />
        )}

        {activeChance !== null && (
          <ChanceCardModal
            card={activeChance}
            onClose={() => {
              setActiveChance(null);
              finishAction(state);
            }}
          />
        )}

        {state.phase === 'game_over' && state.winner !== null && (
          <VictoryModal
            winner={state.players[state.winner]}
            reason={state.victoryReason}
            players={state.players}
            onPlayAgain={() => {
              setState(createInitialState(monopolyPlayers, startingCash));
            }}
            onExit={() => go('menu')}
          />
        )}

        {showRules && <MonopolyRulesModal onClose={() => setShowRules(false)} />}
      </AnimatePresence>
    </div>
  );
}

/** Thẻ hiển thị thông tin người chơi ở hai bên bàn cờ */
function PlayerHUDCard({
  player,
  isCurrentTurn,
  tileStates,
}: {
  player: MonopolyPlayer;
  isCurrentTurn: boolean;
  tileStates: TileState[];
}) {
  const pColor = PLAYER_COLORS[player.color];
  const ownedCount = tileStates.filter((ts) => ts.ownerId === player.id).length;
  const landmarkCount = tileStates.filter((ts) => ts.ownerId === player.id && ts.level === 4).length;

  return (
    <motion.div
      animate={
        isCurrentTurn && !player.isBankrupt
          ? { scale: [1, 1.02, 1], borderColor: ['#38BDF8', '#818CF8', '#38BDF8'] }
          : { scale: 1 }
      }
      transition={{ duration: 2, repeat: Infinity }}
      className="panel"
      style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: player.isBankrupt ? '#F1F5F9' : '#FFFFFF',
        border: isCurrentTurn ? '3px solid #38BDF8' : `2px solid ${pColor.border}`,
        opacity: player.isBankrupt ? 0.6 : 1,
        boxShadow: isCurrentTurn ? '0 8px 24px rgba(56,189,248,0.3)' : '0 4px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* Mascot Avatar */}
      <div style={{ position: 'relative' }}>
        <Mascot
          color={player.color}
          pose={player.isBankrupt ? 'lose' : isCurrentTurn ? 'win' : 'wave'}
          size={84}
        />
        {player.isBot && (
          <span
            style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              background: '#475569',
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: 6,
            }}
          >
            BOT
          </span>
        )}
      </div>

      {/* Thông tin tiền & tài sản */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)' }}>{player.name}</div>
          {player.inJail && (
            <span style={{ fontSize: 11, background: '#FEE2E2', color: '#DC2626', padding: '2px 6px', borderRadius: 6, fontWeight: 800 }}>
              🔒 Ở Tù ({player.jailTurns}/3)
            </span>
          )}
          {player.isBankrupt && (
            <span style={{ fontSize: 11, background: '#CBD5E1', color: '#475569', padding: '2px 6px', borderRadius: 6, fontWeight: 800 }}>
              💥 Phá Sản
            </span>
          )}
        </div>

        <div style={{ fontSize: 22, fontWeight: 900, color: '#059669' }}>
          {player.money.toLocaleString()}K <span style={{ fontSize: 13 }}>NKC</span>
        </div>

        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--ink-soft)' }}>
          <span>🏢 Đất: {ownedCount}</span>
          <span>🏰 Landmark: {landmarkCount}</span>
          {player.freePassCount > 0 && <span>🎟️ Vé miễn phí: {player.freePassCount}</span>}
        </div>
      </div>
    </motion.div>
  );
}
