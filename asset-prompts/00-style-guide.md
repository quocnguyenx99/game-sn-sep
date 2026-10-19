# 00 · Style guide chung — "Hành trình quay về tuổi thơ"

Đọc file này **trước** khi tạo bất kỳ asset nào. Mọi prompt trong các file 01–05 đều phải tuân theo chuẩn này để các hình ăn khớp với nhau.

---

## 1. Cách dùng bộ prompt với Codex

1. Mỗi lần tạo ảnh, **dán khối `STYLE BLOCK` ở mục 3 vào đầu prompt**, sau đó mới dán prompt riêng của asset.
2. Với linh vật, **luôn đính kèm ảnh tham chiếu `linh-vat-nkc.png`** (ở thư mục gốc project) để giữ đúng nhân vật.
3. Mỗi asset nên tạo **3–4 phương án**, rồi chọn 1 theo checklist ở mục 7.
4. Đặt đúng tên file và chép vào đúng thư mục (mục 5). Game **tự nhận ảnh mới** mà không cần sửa code: chạy `npm run dev` là thấy ngay. Khi một ảnh chưa có, game tự dùng hình vẽ tạm.

## 2. Tinh thần thiết kế

| Từ khóa | Ý nghĩa |
|---|---|
| **Candy 3D** | Khối tròn, mập, bóng như kẹo dẻo hoặc kẹo cứng, có vệt sáng trắng ở góc trên-trái |
| **Tuổi thơ Việt Nam** | Vở ô li, bút chì, sân đất, gốc đa, diều giấy, nhà mái ngói |
| **Vui nhộn, sinh nhật** | Màu tươi, confetti, dây cờ tam giác, bánh kem. **Không** ghi tên hay vẽ mặt người thật |
| **Đọc rõ trên màn chiếu** | Hình khối to và rõ, viền đậm, tương phản cao, ít chi tiết vụn |

## 3. STYLE BLOCK (dán vào đầu mọi prompt)

```
Style: cute 3D cartoon render, glossy candy / soft-vinyl toy material, chunky rounded shapes,
soft studio lighting from top-left, bright specular highlight on top-left of every object,
gentle ambient occlusion, subtle soft drop shadow, clean thick darker outline of the object's own color,
vivid saturated playful palette, Pixar / Nintendo-like charm, kid-friendly, high detail but uncluttered,
crisp edges, no text unless specified, no watermark, no signature.
```

**Negative prompt** (nếu công cụ hỗ trợ):

```
realistic, photographic, gritty, horror, dark mood, thin lines, flat vector, pixel art, noisy texture,
blurry, low resolution, extra limbs, deformed hands, cropped body, text artifacts, watermark, logo of other brands
```

## 4. Bảng màu (bám theo linh vật NKC)

| Tên | Hex | Dùng cho |
|---|---|---|
| Vàng NKC | `#FFC61A` | Lông mèo, nút chính, điểm nhấn |
| Vàng nhạt | `#FFE27A` | Vệt sáng, highlight |
| Xanh NKC | `#1E4FD8` | Áo khoác/viền mèo vàng, chữ tiêu đề, quần |
| Xanh đậm | `#12318F` | Bóng đổ của xanh |
| Cam O | `#FF7A1A` | Quân O, áo mèo cam |
| Đỏ | `#E5402F` | Viền/quần mèo cam |
| Xanh ngọc X | `#1BB7A6` | Quân X |
| Hồng | `#FF6FA8` | Confetti, bánh kem, nhãn |
| Kem giấy | `#FFFDF5` | Giấy vở, panel |
| Mực | `#2B2340` | Viền tối, chữ |

## 5. Quy ước file

- **Định dạng:** PNG nền trong suốt (trừ background). Có thể dùng WebP. Game ưu tiên `.webp` > `.png` > `.svg` nếu có nhiều file trùng tên.
- **Tên file:** chữ thường, gạch nối, **đúng y như bảng dưới**.
- **Thư mục:** `src/assets/images/<nhóm>/`

| Nhóm | Thư mục | File | Kích thước khuyến nghị |
|---|---|---|---|
| Linh vật | `mascot/` | `cat-gold-wave.png` … (10 file, xem 01) | 1000 × 1200, nhân vật đứng, chân chạm đáy |
| Quân caro | `caro/` | `piece-x.png`, `piece-o.png` | 512 × 512 |
| Ô ăn quan | `oaq/` | `stone-a..e.png`, `quan.png`, `board.png` (tuỳ chọn) | 256 × 256 (sỏi), 512 × 512 (quan), 1560 × 540 (bàn) |
| Background | `bg/` | `menu.png`, `caro-desk.png`, `oaq-banyan.png` | **1920 × 1080**, không trong suốt |
| UI | `ui/` | `logo-title.png`, `cake.png`, `card-caro.png`, `card-oaq.png` | xem 05 |

## 6. Quy tắc nhất quán

1. **Ánh sáng luôn từ trên-trái**, vệt sáng trắng ở góc trên-trái của mọi vật.
2. **Góc nhìn:** nhân vật nhìn thẳng (3/4 nhẹ cũng được); quân cờ và sỏi nhìn từ trên xuống, hơi nghiêng khoảng 15°.
3. **Viền:** đậm hơn màu gốc 2 tông, dày vừa. Không dùng viền đen tuyền, trừ vùng mắt.
4. **Không đổ bóng ra ngoài canvas** (trừ background). Bóng đổ tách riêng là không cần, vì game tự vẽ bóng.
5. **Chừa lề trong suốt** khoảng 4% mỗi cạnh để animation nảy không bị cắt.
6. Không chèn chữ vào ảnh, **trừ** chữ AI / N / B trên linh vật và logo tiêu đề.

## 7. Checklist chọn ảnh đẹp

- [ ] Giống `linh-vat-nkc.png`: mặt, kính AI, tai nghe N, áo chữ B (với linh vật)
- [ ] Nền trong suốt sạch, không viền trắng lem (zoom 200% để kiểm tra)
- [ ] Nhìn rõ khi thu nhỏ còn 25% (giả lập màn chiếu ở xa)
- [ ] Màu khớp bảng màu, không ngả xám hay quá tối
- [ ] Ánh sáng từ trên-trái
- [ ] Không có chữ lạ, ngón tay dị dạng, chi tiết thừa
- [ ] Đặt cạnh các asset đã chọn trước đó, trông như cùng một bộ
