import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { audio } from '../../audio/engine';

interface Props {
  onRoll: (total: number, d1: number, d2: number, isDouble: boolean) => void;
  disabled: boolean;
  isBot?: boolean;
}

const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[30, 30], [70, 70]],
  3: [[30, 30], [50, 50], [70, 70]],
  4: [[30, 30], [30, 70], [70, 30], [70, 70]],
  5: [[30, 30], [30, 70], [50, 50], [70, 30], [70, 70]],
  6: [[30, 25], [30, 50], [30, 75], [70, 25], [70, 50], [70, 75]],
};

function DieFace({ value, rolling }: { value: number; rolling: boolean }) {
  const dots = DOT_POSITIONS[value] ?? DOT_POSITIONS[1];
  return (
    <motion.div
      animate={
        rolling
          ? {
              rotate: [0, 90, 180, 270, 360],
              scale: [1, 1.15, 0.9, 1.1, 1],
              x: [0, -12, 12, -8, 0],
              y: [0, -20, 8, -14, 0],
            }
          : { rotate: 0, scale: 1, x: 0, y: 0 }
      }
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      style={{
        width: 68,
        height: 68,
        borderRadius: 16,
        background: 'linear-gradient(145deg, #ffffff, #f0f4ff)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.18), inset 0 2px 4px #ffffff, inset 0 -3px 4px rgba(0,0,0,0.12)',
        border: '3px solid #d4e0fc',
        position: 'relative',
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {dots.map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={value === 1 ? 14 : 9}
            fill={value === 1 ? '#EF4444' : '#1E293B'}
            filter="drop-shadow(0 1px 1px rgba(0,0,0,0.25))"
          />
        ))}
      </svg>
    </motion.div>
  );
}

export function Dice3D({ onRoll, disabled, isBot }: Props) {
  const [d1, setD1] = useState(1);
  const [d2, setD2] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [power, setPower] = useState(0);
  const [charging, setCharging] = useState(false);
  const powerRef = useRef(0);
  const animRef = useRef<number | null>(null);

  // Xử lý giữ nút để nạp lực đổ xúc xắc
  const startCharging = () => {
    if (disabled || rolling || isBot) return;
    setCharging(true);
    let dir = 1;
    let val = 0;
    const step = () => {
      val += dir * 2.5;
      if (val >= 100) {
        val = 100;
        dir = -1;
      } else if (val <= 0) {
        val = 0;
        dir = 1;
      }
      powerRef.current = val;
      setPower(val);
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  };

  const releaseAndRoll = () => {
    if (!charging && !isBot) return;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setCharging(false);
    triggerRoll();
  };

  const triggerRoll = () => {
    if (rolling || disabled) return;
    setRolling(true);
    audio.sfx('dice');

    // Random xúc xắc
    const res1 = Math.floor(Math.random() * 6) + 1;
    const res2 = Math.floor(Math.random() * 6) + 1;
    const isDouble = res1 === res2;

    // Giả lập nảy xúc xắc
    let count = 0;
    const interval = setInterval(() => {
      setD1(Math.floor(Math.random() * 6) + 1);
      setD2(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 6) {
        clearInterval(interval);
        setD1(res1);
        setD2(res2);
        setRolling(false);
        setPower(0);
        powerRef.current = 0;
        onRoll(res1 + res2, res1, res2, isDouble);
      }
    }, 80);
  };

  // Bot tự động đổ khi đến lượt
  useEffect(() => {
    if (isBot && !disabled && !rolling) {
      const timer = setTimeout(() => {
        triggerRoll();
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [isBot, disabled, rolling]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* 2 Viên xúc xắc */}
      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        <DieFace value={d1} rolling={rolling} />
        <DieFace value={d2} rolling={rolling} />
      </div>

      {/* Hiển thị Đổ Đôi nếu có */}
      {!rolling && d1 === d2 && d1 > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
            color: '#fff',
            fontWeight: 800,
            fontSize: 16,
            padding: '3px 14px',
            borderRadius: 999,
            boxShadow: '0 4px 10px rgba(239,68,68,0.4)',
          }}
        >
          ✨ ĐỔ ĐÔI! ĐƯỢC ĐI TIẾP ✨
        </motion.div>
      )}

      {/* Thanh đo lực lắc xúc xắc (Power Bar) */}
      <div
        style={{
          width: 180,
          height: 10,
          background: 'rgba(0,0,0,0.1)',
          borderRadius: 999,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.4)',
        }}
      >
        <div
          style={{
            width: `${power}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3B82F6, #10B981, #F59E0B, #EF4444)',
            borderRadius: 999,
            transition: charging ? 'none' : 'width 0.2s',
          }}
        />
      </div>

      {/* Nút bấm lắc xúc xắc */}
      <motion.button
        disabled={disabled || rolling || isBot}
        onMouseDown={startCharging}
        onMouseUp={releaseAndRoll}
        onMouseLeave={releaseAndRoll}
        onTouchStart={startCharging}
        onTouchEnd={releaseAndRoll}
        whileHover={!disabled && !isBot ? { scale: 1.05 } : {}}
        whileTap={!disabled && !isBot ? { scale: 0.95 } : {}}
        style={{
          padding: '12px 32px',
          fontSize: 20,
          fontWeight: 800,
          borderRadius: 999,
          border: 'none',
          cursor: disabled || isBot ? 'not-allowed' : 'pointer',
          background: disabled
            ? '#CBD5E1'
            : isBot
              ? '#94A3B8'
              : 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
          color: '#ffffff',
          boxShadow: disabled ? 'none' : '0 6px 16px rgba(255,107,107,0.4)',
          letterSpacing: 0.5,
          fontFamily: 'inherit',
          userSelect: 'none',
        }}
      >
        {isBot ? '🤖 Bot đang tính...' : charging ? 'Thả tay để ĐỔ!' : '🎲 ĐỔ XÚC XẮC'}
      </motion.button>
    </div>
  );
}
