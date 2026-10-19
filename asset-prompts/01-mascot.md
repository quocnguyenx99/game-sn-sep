# 01 · Linh vật mèo NKC (2 phiên bản màu × 5 tư thế = 10 ảnh)

> **Bắt buộc:** đính kèm `linh-vat-nkc.png` làm ảnh tham chiếu và dán `STYLE BLOCK` từ `00-style-guide.md` vào đầu prompt.

## 1. Mô tả nhân vật gốc (CHARACTER BLOCK — dán sau STYLE BLOCK)

```
Character: the NKC company mascot — a chibi kitten, big round head (about 45% of body height),
golden-yellow fur (#FFC21F) with white muzzle and white tail tip, large glossy blue eyes with
white sparkle highlights, small pink nose, happy open mouth with tiny fangs, thin whiskers.
Pointed ears with blue inner ear. Wears translucent blue VR/AR goggles pushed up on the forehead
with the white letters "AI" on the lens. Round over-ear headphones, one on each side,
each cup marked with the letter "N". Wears a puffy varsity jacket and a navy backpack,
cargo shorts, chunky sneakers. Friendly, smart, energetic personality.
Full body, standing, centered, feet touching the bottom with small margin,
transparent background, canvas 1000x1200.
```

## 2. Hai phiên bản màu

| Mã | Dành cho | Áo khoác | Viền/tay áo | Quần | Kính | Chữ B |
|---|---|---|---|---|---|---|
| `gold` | Người chơi 1 (mặc định) | vàng `#FFD43B` | xanh `#1E4FD8` | xanh `#1E4FD8` | xanh dương trong | xanh |
| `orange` | Người chơi 2 (mặc định) | cam `#FF8A3D` | đỏ `#E5402F` | đỏ `#C9302A` | đỏ hồng trong | kem `#FFF3D6` |

> **Lông mèo giữ nguyên màu vàng** ở cả 2 phiên bản. Chỉ đổi **trang phục và kính**.

Đoạn thêm vào prompt:

- **gold:** `Outfit colors: yellow varsity jacket with royal-blue (#1E4FD8) trim and a blue letter "B" on the chest, royal-blue cargo shorts, white sneakers with blue and yellow accents, light-blue translucent goggles.`
- **orange:** `Outfit colors: orange varsity jacket with red (#E5402F) trim and a cream letter "B" on the chest, red cargo shorts, white sneakers with red and orange accents, pinkish-red translucent goggles.`

## 3. Năm tư thế

| Pose | Tên file | Dùng ở đâu | Prompt pose |
|---|---|---|---|
| `wave` | `cat-{color}-wave.png` | Menu, chọn người chơi, bên không có lượt | `Pose: cheerful greeting, one paw raised high waving hello, other paw relaxed, big smile, slight head tilt.` |
| `think` | `cat-{color}-think.png` | Bên đang tới lượt suy nghĩ | `Pose: thinking, one paw touching chin, eyes looking up to the side, small "o" mouth, three small white thought bubbles floating above the head.` |
| `win` | `cat-{color}-win.png` | Thắng ván | `Pose: jumping for joy mid-air, both arms raised, eyes closed happily (^ ^), wide open laughing mouth, small golden sparkles and stars around.` |
| `lose` | `cat-{color}-lose.png` | Thua ván | `Pose: cute sad pouting, shoulders drooping, arms down, teary glossy eyes with small tear drops, wobbly frown, one sweat drop on the head — sad but still adorable, not depressing.` |
| `cake` | `cat-{color}-cake.png` | Menu, khi hòa | `Pose: proudly holding a small round birthday cake with pink frosting and one lit blue candle in both paws in front of the chest, joyful smile. No text on the cake.` |

## 4. Prompt mẫu hoàn chỉnh (cat-gold-wave)

```
[STYLE BLOCK]
[CHARACTER BLOCK]
Outfit colors: yellow varsity jacket with royal-blue (#1E4FD8) trim and a blue letter "B" on the chest,
royal-blue cargo shorts, white sneakers with blue and yellow accents, light-blue translucent goggles.
Pose: cheerful greeting, one paw raised high waving hello, other paw relaxed, big smile, slight head tilt.
Transparent background, full body, centered, 1000x1200.
```

Ghép tương tự cho 10 tổ hợp: `gold` / `orange` × `wave` / `think` / `win` / `lose` / `cake`.

## 5. Lưu ý khi chọn ảnh

- Tất cả 10 ảnh phải **cùng tỉ lệ đầu/thân, cùng kích thước nhân vật trong khung** (đỉnh tai cách mép trên khoảng 5%).
- Chữ **AI**, **N**, **B** không bị ngược. Game **không lật gương** linh vật.
- Nên chọn tư thế `wave` của bản `gold` trước làm "bản chuẩn", sau đó dùng chính ảnh đó làm ảnh tham chiếu thứ hai cho 9 ảnh còn lại.
- Chép vào `src/assets/images/mascot/`.
