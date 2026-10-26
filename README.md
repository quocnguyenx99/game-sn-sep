# Hành trình quay về tuổi thơ 🎂 & Cờ Tỷ Phú NKC 🏰

Trang game cho tiệc sinh nhật gồm 3 trò chơi hấp dẫn đối kháng trên cùng 1 máy hoặc đấu với máy:
1. **Cờ caro**: Đấu trí 5 quân truyền thống.
2. **Ô ăn quan**: Rải sỏi dân quan tính điểm tuổi thơ.
3. **Cờ tỷ phú NKC** *(Cover phong cách VNG / 360mobi)*: Đổ xúc xắc 3D, mua bán các phòng ban NKC, nâng cấp Landmark, thâu tóm bất động sản, tổ chức lễ hội và du lịch công tác (hỗ trợ 2 - 4 người chơi & Bot AI thông minh).

Linh vật đại diện là mèo NKC với 4 sắc áo (Vàng, Cam, Xanh, Hồng).

## Chạy thử

```bash
npm install
npm run dev        # mở http://localhost:5173
npm test           # chạy toàn bộ test logic (Caro, Ô ăn quan, Cờ tỷ phú)
npm run build      # đóng gói vào dist/
npm run preview    # chạy thử bản đóng gói (offline)
```

Khi trình chiếu, bấm nút **toàn màn hình** ở góc phải trên hoặc phím **F11**. Giao diện được thiết kế ở khung 1920×1080 và tự co giãn vừa mọi màn hình (kể cả điện thoại).

## Điều khiển

| Game | Thao tác |
|---|---|
| Cờ caro | Bấm vào ô để đặt quân. Nút ↶ để **đi lại**, nút ⟳ để chơi lại ván, nút ? để xem luật |
| Ô ăn quan | Bấm ô dân có sỏi, rồi chọn mũi tên ←/→. Phím ← → để chọn hướng, **Space** để tạm dừng, Esc để bỏ chọn |
| Cờ tỷ phú | Giữ/thả nút **ĐỔ XÚC XẮC** để nạp lực gieo xúc xắc 3D (Đổ đôi được đi tiếp). Mua đất, nâng nhà cấp 1-3 và **Landmark**. Thâu tóm đất đối thủ gấp đôi giá trị. Bay tự do từ Sân bay công tác, cắm cờ Lễ hội x2 tiền thuê. Thắng nhanh với Độc quyền 3 bộ màu / 1 hàng cạnh / 4 tuyến giao thông! |

## Cấu trúc source code

```
src/
  games/
    caro/        logic.ts (+ test), CaroScreen.tsx
    oaq/         engine.ts (+ test), OaqBoard.tsx, OaqScreen.tsx, OaqRules.tsx, Stone.tsx
    monopoly/    boardData.ts, chances.ts, types.ts, engine.ts (+ test), Dice3D.tsx, MonopolyBoard.tsx, MonopolyModals.tsx, MonopolyRulesModal.tsx, MonopolyScreen.tsx
  audio/         engine.ts (WebAudio SFX: dice, cash, landmark, build, siren, festival...), songs.ts (nhạc 8-bit)
  assets/        registry.ts (tự nạp ảnh/nhạc), images/, audio/
  backgrounds/   background SVG thay thế
  screens/       Loading, Menu, Setup (2-4 người & Bot), Leaderboard
  store/         useGame.ts (zustand + lưu localStorage)
  ui/            Mascot (4 màu mèo), nút kẹo, modal, Stage (1920x1080 tự xoay mobile)...
```
