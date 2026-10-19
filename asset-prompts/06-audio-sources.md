# 06 · Âm nhạc và hiệu ứng âm thanh

## Hiện trạng

Game đã có sẵn **nhạc và SFX 8-bit tổng hợp bằng WebAudio** (code trong `src/audio/`). Vì vậy game chạy offline và không vướng bản quyền:

- **Tuổi thơ 8-bit**: giai điệu gốc tự soạn, vòng hòa âm C – Am – F – G.
- **Happy Birthday 8-bit**: giai điệu "Happy Birthday to You" (public domain), phối theo kiểu chiptune.
- Đoạn **Happy Birthday ngắn** phát khi có người thắng ván.
- SFX: đặt quân, bốc sỏi, rơi sỏi, ăn điểm, rải lại, đi lại, lỗi, click, hover.

Nếu muốn dùng **file nhạc thật**, chép file đúng tên vào `src/assets/audio/`. Game tự ưu tiên file thật thay cho bản tổng hợp.

## Tên file game nhận

| File | Vai trò | Gợi ý tìm kiếm |
|---|---|---|
| `bgm-chiptune.mp3` | Nhạc nền "Tuổi thơ 8-bit", phát lặp | `chiptune happy`, `8-bit cheerful`, `retro game kids` |
| `bgm-birthday.mp3` | Nhạc nền "Happy Birthday", phát lặp | `happy birthday 8 bit`, `happy birthday chiptune instrumental` |
| `sfx-win.mp3` | Thắng ván (≤ 5 giây) | `win jingle`, `level complete 8-bit`, `fanfare cartoon` |
| `sfx-place.mp3` | Đặt quân caro | `pop`, `bubble pop`, `cartoon boing short` |
| `sfx-pick.mp3` | Bốc sỏi | `pebble pick`, `marbles grab` |
| `sfx-drop.mp3` | Rơi 1 viên sỏi | `pebble drop`, `marble click`, `wood tick` |
| `sfx-capture.mp3` | Ăn sỏi | `coin collect 8-bit`, `bling` |
| `sfx-reseed.mp3` | Rải lại 5 viên | `magic sparkle short` |
| `sfx-undo.mp3` | Đi lại | `whoosh reverse short` |
| `sfx-error.mp3` | Bấm ô không hợp lệ hoặc mất lượt | `soft error cartoon` |
| `sfx-click.mp3` | Bấm nút | `ui click soft` |
| `sfx-hover.mp3` | Rê chuột qua nút (rất nhỏ) | `ui tick` |

Định dạng chấp nhận: `.mp3`, `.ogg`, `.m4a`, `.wav`. Nên dùng mp3 128–192 kbps, nhạc nền dài 1–3 phút, cắt sao cho lặp lại liền mạch.

## Nguồn miễn phí bản quyền

| Nguồn | Trang tìm kiếm | Giấy phép |
|---|---|---|
| Pixabay Music | https://pixabay.com/music/search/chiptune/ | Pixabay Content License: dùng miễn phí, không bắt buộc ghi nguồn |
| Pixabay Sound Effects | https://pixabay.com/sound-effects/search/pop/ | Như trên |
| OpenGameArt | https://opengameart.org/art-search-advanced?field_art_type_tid%5B%5D=12 | Chọn bài **CC0**. CC-BY cần ghi nguồn |
| Freesound | https://freesound.org/search/?f=license:%22Creative+Commons+0%22 | Chọn bài **CC0** |

> Theo kế hoạch, bạn **nghe và duyệt** trước khi đưa nhạc vào. Khi chọn xong, ghi lại link và giấy phép vào bảng dưới để lưu vết.

## Nhật ký bài đã chọn

| File | Tên bài / tác giả | Link | Giấy phép |
|---|---|---|---|
| | | | |
