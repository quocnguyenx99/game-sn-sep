import confetti from 'canvas-confetti';

const COLORS = ['#FFC61A', '#1E4FD8', '#FF7A1A', '#1BB7A6', '#FF6FA8', '#ffffff'];

/** Pháo giấy bắn từ hai bên màn hình. */
export function celebrate(reduce: boolean) {
  if (reduce) {
    void confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 }, colors: COLORS, disableForReducedMotion: false });
    return;
  }
  const end = Date.now() + 1800;
  const frame = () => {
    void confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0, y: 0.75 }, colors: COLORS, scalar: 1.3 });
    void confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1, y: 0.75 }, colors: COLORS, scalar: 1.3 });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
  void confetti({ particleCount: 160, spread: 120, startVelocity: 55, origin: { y: 0.55 }, colors: COLORS, shapes: ['circle', 'square', 'star'], scalar: 1.4 });
}
