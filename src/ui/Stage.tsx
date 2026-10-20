import { useEffect, useState, type ReactNode } from 'react';

export const STAGE_W = 1920;
export const STAGE_H = 1080;

/** Màn hình cảm ứng (điện thoại / máy tính bảng). */
export const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;

/**
 * Khung 1920×1080 cố định, co giãn vừa mọi màn hình (TV, máy chiếu, laptop, điện thoại).
 * Điện thoại cầm dọc → tự xoay khung 90° để luôn chơi ngang, kể cả khi máy đang khóa xoay.
 */
export function Stage({ children, className }: { children: ReactNode; className?: string }) {
  const [fit, setFit] = useState({ scale: 1, rotate: false });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const rotate = h > w && isTouchDevice();
      const scale = rotate ? Math.min(h / STAGE_W, w / STAGE_H) : Math.min(w / STAGE_W, h / STAGE_H);
      setFit({ scale, rotate });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.visualViewport?.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);
  return (
    <div className="stage-viewport">
      <div
        className={`stage ${className ?? ''}`}
        style={{ transform: `${fit.rotate ? 'rotate(90deg) ' : ''}scale(${fit.scale}) translate(-50%, -50%)` }}
      >
        {children}
      </div>
    </div>
  );
}

/** Android: vào toàn màn hình rồi khóa hướng ngang. iOS không hỗ trợ → bỏ qua, khung sẽ tự xoay. */
export async function enterLandscapeFullscreen() {
  if (!isTouchDevice()) return;
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
    await orientation.lock?.('landscape');
  } catch {
    // trình duyệt không cho phép → giữ nguyên, Stage vẫn xoay bằng CSS
  }
}
