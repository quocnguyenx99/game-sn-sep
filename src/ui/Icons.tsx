// Icon SVG tối giản, nét tròn, dùng trong nút kẹo.
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 3.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const IconBack = () => (
  <svg viewBox="0 0 32 32" {...base}><path d="M19 7l-9 9 9 9" /></svg>
);
export const IconGear = () => (
  <svg viewBox="0 0 32 32" {...base}>
    <circle cx="16" cy="16" r="4.5" />
    <path d="M16 3.5v4M16 24.5v4M3.5 16h4M24.5 16h4M7.2 7.2l2.8 2.8M22 22l2.8 2.8M7.2 24.8l2.8-2.8M22 10l2.8-2.8" />
  </svg>
);
export const IconHelp = () => (
  <svg viewBox="0 0 32 32" {...base}>
    <path d="M11.5 12a4.5 4.5 0 1 1 6.6 4c-1.4.8-2.1 1.7-2.1 3.2V20" />
    <circle cx="16" cy="25.5" r="0.6" strokeWidth="3" />
  </svg>
);
export const IconUndo = () => (
  <svg viewBox="0 0 32 32" {...base}><path d="M10 9l-5 5 5 5" /><path d="M5 14h14a7 7 0 0 1 0 14h-5" /></svg>
);
export const IconRestart = () => (
  <svg viewBox="0 0 32 32" {...base}><path d="M25 16a9 9 0 1 1-3-6.7" /><path d="M23 4v6h-6" /></svg>
);
export const IconSound = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 32 32" {...base}>
    <path d="M5 12h5l7-6v20l-7-6H5z" />
    {on ? <path d="M21 11a6 6 0 0 1 0 10M24.5 7.5a11 11 0 0 1 0 17" /> : <path d="M21 12l7 8M28 12l-7 8" />}
  </svg>
);
export const IconFull = () => (
  <svg viewBox="0 0 32 32" {...base}><path d="M5 12V5h7M27 12V5h-7M5 20v7h7M27 20v7h-7" /></svg>
);
export const IconPause = ({ paused }: { paused: boolean }) => (
  <svg viewBox="0 0 32 32" {...base}>
    {paused ? <path d="M10 6l15 10-15 10z" fill="currentColor" /> : <path d="M11 7v18M21 7v18" strokeWidth="4.5" />}
  </svg>
);
export const IconTrophy = () => (
  <svg viewBox="0 0 32 32" {...base}>
    <path d="M10 5h12v6a6 6 0 0 1-12 0zM10 8H5a5 5 0 0 0 5 6M22 8h5a5 5 0 0 1-5 6M16 17v5M11 27h10M13 22h6v5h-6z" />
  </svg>
);
export const IconArrow = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg viewBox="0 0 32 32" {...base} strokeWidth={4.5}>
    {dir === 'left' ? <path d="M26 16H7M14 8l-8 8 8 8" /> : <path d="M6 16h19M18 8l8 8-8 8" />}
  </svg>
);
