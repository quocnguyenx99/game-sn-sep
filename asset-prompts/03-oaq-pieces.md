# 03 · Ô ăn quan: sỏi dân, viên quan, bàn chơi

Sỏi dân hiển thị khoảng **30 px**, mỗi ô có thể chứa tới 30 viên chồng lên nhau. Vì vậy sỏi cần **bóng, tròn, rõ màu và không nhiều chi tiết**.

Dán `STYLE BLOCK` từ `00-style-guide.md` vào trước.

## 1. Sỏi dân: 5 màu (256 × 256 mỗi file)

Prompt gốc:

```
[STYLE BLOCK]
A single small smooth pebble shaped like a glossy candy bead, slightly flattened oval,
color: {COLOR}, big soft white highlight on the upper-left, subtle darker rim at the bottom,
tiny contact shadow under it, top-down view tilted 20 degrees, centered, fills 80% of canvas,
transparent background, 256x256.
```

| File | {COLOR} |
|---|---|
| `stone-a.png` | `bubblegum pink (#FF8FB8 to #D9477F)` |
| `stone-b.png` | `mint green (#7FE3C4 to #21A57F)` |
| `stone-c.png` | `sky blue (#8DC4FF to #2F6FD8)` |
| `stone-d.png` | `lemon yellow (#FFE27A to #E0A500)` |
| `stone-e.png` | `lavender purple (#C9A8FF to #7B4FD8)` |

Phương án khác (tuỳ chọn): dùng **hạt sỏi cuội thật nhưng phủ màu kẹo**. Giữ cùng một phương án cho cả 5 file.

## 2. Viên quan: `quan.png` (512 × 512)

```
[STYLE BLOCK]
One big special "Quan" (mandarin) stone for the Vietnamese game O An Quan: a large glossy rounded
river stone in warm gold-to-red gradient (#FFD15C to #D9480F), smooth irregular egg shape,
a thin cream (#FFF6D6) outline, a tiny golden crown sparkle highlight on top,
looks precious and important, about 2.5x bigger in feel than normal pebbles,
top-down view tilted 20 degrees, centered, transparent background, 512x512.
```

## 3. Bàn chơi (tuỳ chọn): `board.png` (1560 × 540)

Mặc định game tự vẽ đường kẻ phấn. Nếu muốn bàn đẹp hơn:

```
[STYLE BLOCK]
Top-down view of an O An Quan game board drawn with thick white chalk on smooth packed brown earth (#D9A469):
a long rectangle divided into 2 rows x 5 columns of square pits, with a large half-circle at each short end
(left and right) for the two "quan" pits. The chalk lines are slightly hand-drawn, chunky and soft.
Pits are gently pressed into the ground with soft inner shadows. No stones, no text.
Transparent background outside the board, 1560x540, board fills the canvas edge to edge.
```

**Quan trọng:** tỉ lệ các phần phải đúng để khớp vị trí sỏi: phần nửa tròn mỗi bên rộng khoảng **13%**, 5 cột ô dân rộng bằng nhau ở giữa, 2 hàng cao bằng nhau.

Chép tất cả vào `src/assets/images/oaq/`.
