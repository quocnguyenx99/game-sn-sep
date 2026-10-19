# Nhiệm vụ cho Codex: tạo asset hình ảnh cho game

> Đây là file giao việc. Khi giao cho Codex, chỉ cần nói: *"Đọc và làm theo `asset-prompts/CODEX-TASK.md`"*.

## Bối cảnh

Đây là project game React + Vite "Hành trình quay về tuổi thơ", gồm Cờ caro và Ô ăn quan, dùng cho tiệc sinh nhật. Game đã chạy hoàn chỉnh với hình vẽ tạm. Nhiệm vụ của bạn là **tạo ảnh thật** để thay hình tạm. Game tự nạp ảnh nếu file đặt đúng tên, đúng thư mục.

## Quy tắc bắt buộc

1. **KHÔNG sửa bất kỳ file code nào** trong `src/` (`.ts`, `.tsx`, `.css`), `package.json` hay các file cấu hình. Chỉ được thêm file ảnh.
2. Làm trên nhánh git hiện tại là `feat/codex-assets`. Không đổi nhánh, không push.
3. Đọc kỹ `asset-prompts/00-style-guide.md` trước. **Mọi prompt tạo ảnh** đều phải bắt đầu bằng `STYLE BLOCK` trong file đó.
4. Với linh vật, **luôn dùng `linh-vat-nkc.png` (thư mục gốc) làm ảnh tham chiếu**. Phải giữ đúng mặt mèo, kính chữ "AI", tai nghe chữ "N" và áo chữ "B". Các chữ này không được ngược hay sai.
5. Mọi ảnh, **trừ background**, phải có **nền trong suốt thật** (PNG có kênh alpha), không có nền ca-rô giả hay nền trắng.
6. Không chèn chữ, watermark hay logo nào khác vào ảnh, trừ chữ AI / N / B của linh vật.

## Quy trình

### Bước 1: Tạo phương án nháp

- Với mỗi asset, tạo **3 phương án**, lưu vào `asset-candidates/<tên-file-không-đuôi>/v1.png`, `v2.png`, `v3.png`. Thư mục này đã được gitignore.
- Nếu công cụ tạo ảnh chỉ hỗ trợ một số kích thước cố định (vd 1024×1024, 1024×1536, 1536×1024), hãy tạo ở kích thước gần nhất rồi **dùng script (Python Pillow) để cắt hoặc chỉnh về đúng kích thước** ghi trong `00-style-guide.md`, mục 5:
  - **Linh vật** 1000×1200: cắt bỏ lề trong suốt thừa, co cho vừa khung, chân chạm đáy, chừa lề khoảng 4%, căn giữa theo chiều ngang.
  - **Quân cờ / sỏi / quan**: ảnh vuông, vật thể chiếm khoảng 80–85% khung, căn giữa.
  - **Background** 1920×1080: tạo ở tỉ lệ ngang (1536×1024), phóng lên rồi cắt bớt trên/dưới để thành 16:9. Không làm méo hình.

### Bước 2: Chọn bản đẹp nhất

- Chấm từng phương án theo **checklist ở mục 7 của `00-style-guide.md`**.
- Chép bản tốt nhất vào đúng vị trí: `src/assets/images/<nhóm>/<tên-file>.png`.

### Bước 3: Kiểm tra và báo cáo

- Chạy `npm run build` để chắc chắn build vẫn thành công.
- Viết báo cáo ngắn vào `asset-candidates/REPORT.md` theo mẫu:
  - Asset → bản đã chọn (v1/v2/v3) → lý do chọn
  - Asset nào chưa đạt hoặc cần người dùng xem lại
- Commit **chỉ các ảnh đã chọn** trong `src/assets/images/`, kèm message: `assets: thêm ảnh <nhóm> do Codex tạo`.

## Thứ tự làm và danh sách file

Làm theo từng đợt. **Xong đợt 1 thì dừng lại cho người dùng duyệt** linh vật chuẩn rồi mới làm tiếp.

| Đợt | File | Prompt ở |
|---|---|---|
| 1 | `mascot/cat-gold-wave.png` (bản chuẩn của linh vật) | `01-mascot.md` |
| 2 | 9 file `mascot/cat-{gold,orange}-{wave,think,win,lose,cake}.png` còn lại. Dùng thêm `cat-gold-wave.png` đã duyệt làm ảnh tham chiếu thứ hai để giữ đồng bộ | `01-mascot.md` |
| 3 | `caro/piece-x.png`, `caro/piece-o.png` | `02-caro-pieces.md` |
| 4 | `oaq/stone-a.png` … `oaq/stone-e.png`, `oaq/quan.png` | `03-oaq-pieces.md` |
| 5 | `bg/menu.png`, `bg/caro-desk.png`, `bg/oaq-banyan.png` | `04-backgrounds.md` |
| 6 (tuỳ chọn) | `ui/cake.png`, `ui/card-caro.png`, `ui/card-oaq.png`, `ui/logo-title.png`, `oaq/board.png` | `05-ui.md`, `03-oaq-pieces.md` |

> `ui/logo-title.png`: chỉ chép vào `src/assets` nếu **mọi dấu tiếng Việt đều đúng**. Nếu sai dấu thì bỏ qua, game đã có tiêu đề bằng font.
> `oaq/board.png`: chỉ dùng nếu tỉ lệ bàn khớp với mô tả (nửa tròn mỗi đầu khoảng 13% chiều rộng). Nếu không khớp thì bỏ qua.
