// Nạp asset tự động: chỉ cần chép file đúng tên vào src/assets/images/... hoặc src/assets/audio/
// (xem asset-prompts/00-style-guide.md). Nếu chưa có file, giao diện tự vẽ hình tạm bằng SVG/CSS
// và âm thanh tự tổng hợp bằng WebAudio, nên game luôn chạy được.

const imageModules = import.meta.glob('./images/**/*.{png,webp,jpg,jpeg,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const audioModules = import.meta.glob('./audio/*.{mp3,ogg,wav,m4a}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const PRIORITY: Record<string, number> = { webp: 4, png: 3, jpg: 2, jpeg: 2, svg: 1, mp3: 3, ogg: 2, m4a: 2, wav: 1 };

function index(modules: Record<string, string>, base: string) {
  const out: Record<string, { url: string; rank: number }> = {};
  for (const [path, url] of Object.entries(modules)) {
    const m = path.slice(base.length).match(/^(.*)\.(\w+)$/);
    if (!m) continue;
    const [, key, ext] = m;
    const rank = PRIORITY[ext.toLowerCase()] ?? 0;
    if (!out[key] || out[key].rank < rank) out[key] = { url, rank };
  }
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.url]));
}

const images = index(imageModules, './images/');
const audios = index(audioModules, './audio/');

/** URL ảnh theo khóa (vd "mascot/cat-gold-wave"), hoặc undefined nếu chưa có file. */
export const img = (key: string): string | undefined => images[key];
export const audioFile = (key: string): string | undefined => audios[key];
export const allImageUrls = (): string[] => Object.values(images);
