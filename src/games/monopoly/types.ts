import type { CatColor } from '../../store/useGame';

export type TileType =
  | 'start'      // Ô Xuất Phát (GO)
  | 'property'   // Bất động sản (Phòng ban/chi nhánh NKC)
  | 'chance'     // Thẻ Cơ Hội / Vận May
  | 'jail'       // Kho Lưu Trữ (Côn Đảo / Đảo Hoang)
  | 'festival'   // Tổ chức Lễ Hội NKC (x2 tiền thuê)
  | 'travel'     // Sân Bay Du Lịch Công Tác (Chọn bay tự do)
  | 'tax'        // Nộp thuế / Quỹ Công Đoàn
  | 'transport'; // Tuyến Giao Thông (Xe Bus, Cao Tốc, Sân Bay, Du Thuyền)

export type PropertyColor =
  | 'brown'   // Tuyển dụng & Đào tạo
  | 'sky'     // Hành chính & CSVC
  | 'pink'    // Công nghệ số & IT
  | 'orange'  // Data Center & R&D
  | 'red'     // Marketing & Sales
  | 'yellow'  // Thị trường quốc tế & Cơ khí
  | 'green'   // Dự án & Kế toán
  | 'purple'; // Tài chính & CEO Tower

export interface TileData {
  id: number; // 0..31
  name: string;
  shortName: string;
  type: TileType;
  color?: PropertyColor;
  cost?: number;             // Giá mua ban đầu (K VND / NKC Coin)
  houseCost?: number;        // Giá nâng cấp mỗi cấp (Cấp 1..3, Landmark)
  baseRent?: number;         // Tiền thuê đất trống
  rentTiers?: [number, number, number, number]; // Tiền thuê ở cấp 1, 2, 3, và Landmark
  taxAmount?: number | '10percent';
  desc?: string;
  icon?: string;
}

export type BuildingLevel = 0 | 1 | 2 | 3 | 4; // 0: Đất trống, 1: Nhà cấp 1, 2: Cấp 2, 3: Cấp 3, 4: LANDMARK

export interface TileState {
  ownerId: number | null; // index của người chơi (0..3)
  level: BuildingLevel;
  isFestival: boolean;    // Đang có lễ hội -> x2 tiền thuê
}

export interface MonopolyPlayer {
  id: number;
  name: string;
  color: CatColor;
  isBot: boolean;
  money: number;
  position: number;       // 0..31
  inJail: boolean;
  jailTurns: number;      // Số hiệp đã ở trong tù (tối đa 3)
  isBankrupt: boolean;
  freePassCount: number;  // Thẻ miễn phí tiền thuê đất 1 lần
  hasTravelPass: boolean; // Được quyền bay tự do ở lượt tiếp theo
}

export interface ChanceCard {
  id: string;
  title: string;
  description: string;
  type: 'money' | 'move' | 'teleport' | 'freepass' | 'jail' | 'festival';
  amount?: number;        // Dương: nhận tiền, Âm: trừ tiền
  targetTile?: number;
  collectFromAll?: number; // Mời/thu tiền từ tất cả người chơi
}

export type GamePhase =
  | 'ready'               // Chờ người chơi hiện tại gieo xúc xắc
  | 'rolling'             // Đang lắc và quay xúc xắc
  | 'moving'              // Nhân vật đang nhảy từng bước trên bàn cờ
  | 'action_prompt'       // Đang hiện popup (Mua đất, nâng nhà, mua lại, rút thẻ...)
  | 'travel_select'       // Đang ở chế độ chọn ô để bay tới (từ Sân Bay Du Lịch)
  | 'festival_select'     // Đang ở chế độ chọn đất để cắm Lễ Hội
  | 'turn_end'            // Chuẩn bị kết thúc lượt
  | 'game_over';          // Ván đấu kết thúc

export type VictoryReason =
  | 'bankruptcy'          // Tất cả đối thủ phá sản
  | 'triple_monopoly'     // Độc quyền 3 bộ màu
  | 'line_monopoly'       // Độc quyền trọn vẹn 1 hàng cạnh bàn cờ
  | 'tourism_monopoly'    // Sở hữu tất cả 4 tuyến giao thông
  | 'round_limit';        // Hết số lượt quy định, so sánh tổng tài sản

export interface ActionLog {
  id: string;
  turn: number;
  text: string;
  playerId?: number;
  type?: 'info' | 'buy' | 'rent' | 'jail' | 'travel' | 'chance' | 'win' | 'festival';
}
