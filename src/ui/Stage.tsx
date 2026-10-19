import { useEffect, useState, type ReactNode } from 'react';

export const STAGE_W = 1920;
export const STAGE_H = 1080;

/** Khung 1920×1080 cố định, co giãn vừa mọi màn hình (TV, máy chiếu, laptop) mà không lệch bố cục. */
export function Stage({ children, className }: { children: ReactNode; className?: string }) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return (
    <div className="stage-viewport">
      <div
        className={`stage ${className ?? ''}`}
        style={{ transform: `scale(${scale}) translate(-50%, -50%)` }}
      >
        {children}
      </div>
    </div>
  );
}
