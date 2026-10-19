# 02 · Quân cờ caro (X và O)

Tham chiếu phong cách: ảnh icon caro gốc (O cam bóng, X xanh ngọc viền vàng, hình "kẹo dẻo").
Trên bàn 15×15, quân hiển thị khoảng **50 px**, nên hình phải **cực kỳ đơn giản, khối to, viền rõ**.

Dán `STYLE BLOCK` từ `00-style-guide.md` vào trước.

## piece-x.png (512 × 512)

```
[STYLE BLOCK]
A single chunky letter "X" game piece made of glossy teal-green jelly candy (#1BB7A6),
two thick rounded capsule-shaped bars crossing, soft squishy gummy look, darker teal edge,
surrounded by a thick bright yellow (#FFD21A) outline, strong white specular highlight on the
upper-left bar ends, viewed from the front slightly from above, centered, fills 85% of the canvas,
transparent background, 512x512, no text, no shadow outside the object.
```

## piece-o.png (512 × 512)

```
[STYLE BLOCK]
A single chunky letter "O" ring game piece made of glossy orange hard candy (#FF7A1A),
thick donut ring slightly oval, darker burnt-orange outline (#9E3500), shiny white curved highlight
on the upper-left of the ring and a small sparkle dot, looks like a candy ring, front view slightly from above,
centered, fills 85% of the canvas, transparent background, 512x512, no text.
```

## Lưu ý chọn

- Thu nhỏ còn 48 px mà vẫn nhận ra ngay X và O.
- Hai quân **cùng độ to và cùng độ bóng**.
- Lỗ ở giữa quân O phải trong suốt.
- Chép vào `src/assets/images/caro/`.
