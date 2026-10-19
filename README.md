# Hành trình quay về tuổi thơ 🎂

Trang game cho tiệc sinh nhật gồm 2 trò chơi đối kháng 2 người trên cùng 1 máy: **Cờ caro** và **Ô ăn quan**. Linh vật là mèo NKC.

## Chạy thử

```bash
npm install
npm run dev        # mở http://localhost:5173
npm test           # chạy test logic caro và ô ăn quan
npm run build      # đóng gói vào dist/
npm run preview    # chạy thử bản đóng gói (offline)
```

Khi trình chiếu, bấm nút **toàn màn hình** ở góc phải trên hoặc phím **F11**. Giao diện được thiết kế ở khung 1920×1080 và tự co giãn vừa mọi màn hình.

## Điều khiển

| Game | Thao tác |
|---|---|
| Cờ caro | Bấm vào ô để đặt quân. Nút ↶ để **đi lại**, nút ⟳ để chơi lại ván, nút ? để xem luật |
| Ô ăn quan | Bấm ô dân có sỏi, rồi chọn mũi tên ←/→. Rê chuột lên mũi tên sẽ thấy đường rải. Phím ← → để chọn hướng, **Space** để tạm dừng, Esc để bỏ chọn. Góc phải dưới có thanh chỉnh tốc độ rải và nút tua nhanh |

Settings (bánh răng): âm thanh, người chơi, hình ảnh, luật chơi (tốc độ rải, quan non, xoá bảng xếp hạng). Settings và bảng xếp hạng được lưu trong trình duyệt của máy đang chạy (localStorage).

## Thay hình và nhạc

Xem thư mục [`asset-prompts/`](asset-prompts/) để lấy prompt và chuẩn thiết kế cho Codex. Chép ảnh hoặc nhạc **đúng tên file** vào `src/assets/images/...` hoặc `src/assets/audio/`, game sẽ tự dùng. Khi chưa có file, game dùng hình vẽ SVG và nhạc 8-bit tổng hợp sẵn.

## Cấu trúc

```
src/
  games/caro/    logic.ts (+ test), CaroScreen.tsx
  games/oaq/     engine.ts (+ test), OaqBoard.tsx, OaqScreen.tsx, OaqRules.tsx, Stone.tsx
  audio/         engine.ts (WebAudio), songs.ts (nhạc 8-bit)
  assets/        registry.ts (tự nạp ảnh/nhạc), images/, audio/
  backgrounds/   background SVG thay thế
  screens/       Loading, Menu, Setup, Leaderboard
  store/         useGame.ts (zustand + lưu localStorage)
  ui/            nút kẹo, modal, linh vật, settings, kết quả…
```

## Deploy Vercel

Repo đã có sẵn `vercel.json`. Import project vào Vercel (framework Vite) hoặc chạy `npx vercel --prod`. Toàn bộ font, ảnh và nhạc đều đóng gói kèm, không gọi CDN ngoài.
