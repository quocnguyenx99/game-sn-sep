# 04 · Background / bối cảnh (1920 × 1080, không trong suốt)

Background nằm **phía sau** giao diện, vì vậy cần:

- **Chừa vùng an toàn (safe zone)** ở giữa thật thoáng, ít chi tiết, để bàn cờ và chữ nổi bật.
- Độ tương phản vừa phải, màu tươi nhưng không gắt.
- Không có nhân vật, không có chữ.

Dán `STYLE BLOCK` từ `00-style-guide.md` vào trước. Với background, thêm câu:
`wide 16:9 game background illustration, 1920x1080, soft depth of field on far elements`.

## 1. `menu.png`: màn hình chính và chọn người chơi

```
[STYLE BLOCK]
Wide 16:9 game background illustration, 1920x1080. A bright sunny Vietnamese countryside
childhood scene: rolling bright green hills, a few fluffy white clouds, a warm round sun in the
top-right, a colorful paper kite flying on the right side, a festive line of triangle bunting flags
(yellow, royal blue, orange, teal, pink) hanging across the very top edge for a birthday party feel,
small flowers on the grass at the bottom. Candy-colored, cheerful, nostalgic.
Keep the center area (from 30% to 85% height, 20% to 80% width) simple: mostly sky and soft hills,
because UI cards will be placed there. No characters, no text.
```

Vùng giao diện: tiêu đề ở khoảng 12–25% chiều cao, 2 thẻ game ở 37–85%, linh vật ở 2 góc dưới.

## 2. `caro-desk.png`: bàn học cho cờ caro

```
[STYLE BLOCK]
Wide 16:9 top-down view of a warm honey-colored wooden school desk (#E3A868) with soft wood grain,
lit by warm afternoon light. Childhood school items placed ONLY near the edges and corners:
a yellow pencil with pink eraser bottom-left, a mint plastic ruler top-right, a blue-and-white eraser
bottom-right, a white paper airplane top-left, a few cute star stickers. The center 50% width x 85% height
must be empty plain wood, because a notebook game board is placed there. Cozy, nostalgic, cute. No text.
```

Vùng giao diện: bàn caro ở chính giữa (khoảng 920 × 920 px), thẻ người chơi ở 2 bên (x 70–450 và 1470–1850).

## 3. `oaq-banyan.png`: sân đất dưới gốc đa cho Ô ăn quan

```
[STYLE BLOCK]
Wide 16:9 game background: a Vietnamese village yard on a sunny afternoon. A big old banyan tree
(cây đa) on the top-left with a lush round green canopy and hanging aerial roots, casting a soft shadow.
A light blue sky with a couple of clouds, far away small houses with red-tiled roofs on the right horizon.
Most of the image (from 32% height down to the bottom) is a wide smooth packed-earth ground (#E3B57A to #C88E52)
with a few tiny pebbles and some grass tufts along the bottom edge. Keep the ground in the center
(10%–90% width, 28%–75% height) smooth and plain because the game board is drawn there. Nostalgic, warm, cute. No people, no text.
```

Vùng giao diện: bàn ô ăn quan ở 210–1710 (x), 318–798 (y). Thẻ người chơi trên ở y 120–290, dưới ở y 860–1030.

## Lưu ý chọn

- Thử đặt ảnh vào game (`npm run dev`) để kiểm tra bàn cờ và chữ có đọc rõ không.
- Nếu ảnh quá rực làm chìm bàn cờ, giảm độ bão hòa khoảng 10–15% trước khi dùng.
- Chép vào `src/assets/images/bg/`.
- Ảnh nặng thì xuất sang WebP chất lượng 85 (cùng tên, đuôi `.webp`).
