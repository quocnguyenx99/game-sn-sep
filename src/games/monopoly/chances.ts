import type { ChanceCard } from './types';

export const CHANCE_CARDS: ChanceCard[] = [
  {
    id: 'kpi_bonus',
    title: 'Thưởng KPI Xuất Sắc',
    description: 'Dự án của bạn vượt chỉ tiêu quý! Tập đoàn NKC thưởng nóng 300K.',
    type: 'money',
    amount: 300,
  },
  {
    id: 'ceo_bonus',
    title: 'Khen Thưởng Từ Tổng Giám Đốc',
    description: 'Sáng kiến đổi mới của bạn được CEO biểu dương. Nhận 500K tiền thưởng.',
    type: 'money',
    amount: 500,
  },
  {
    id: 'teambuilding',
    title: 'Đại Tiệc Teambuilding NKC',
    description: 'Bạn hào phóng mời tất cả người chơi bữa trà sữa chúc mừng sinh nhật! Mỗi người nhận 50K từ bạn.',
    type: 'money',
    collectFromAll: -50,
  },
  {
    id: 'late_meeting',
    title: 'Đi Trễ Họp Giao Ban',
    description: 'Tắc đường nên trễ giờ họp tổng kết sáng thứ Hai. Nộp phạt 150K vào quỹ liên hoan.',
    type: 'money',
    amount: -150,
  },
  {
    id: 'free_pass',
    title: 'Thẻ Đặc Quyền VIP NKC',
    description: 'Bạn nhận được 01 Vé Miễn Phí Tiền Thuê Nhà! Tự động sử dụng khi bước vào ô đất đắt đỏ của đối thủ.',
    type: 'freepass',
  },
  {
    id: 'fly_to_start',
    title: 'Vé Tàu Tốc Hành Về Đích',
    description: 'Di chuyển ngay về ô XUẤT PHÁT và nhận lương 500K.',
    type: 'teleport',
    targetTile: 0,
  },
  {
    id: 'fly_to_travel',
    title: 'Vé Máy Bay Công Tác',
    description: 'Được cử đi công tác khẩn cấp! Bay thẳng đến SÂN BAY CÔNG TÁC để sẵn sàng du lịch vòng quanh.',
    type: 'teleport',
    targetTile: 24,
  },
  {
    id: 'fly_to_ceo',
    title: 'Triệu Tập Đến CEO Tower',
    description: 'Chủ tịch mời bạn lên tầng cao nhất của CEO Tower đàm phán hợp đồng lớn!',
    type: 'teleport',
    targetTile: 31,
  },
  {
    id: 'audit_check',
    title: 'Thanh Tra Kiểm Toán Kho',
    description: 'Có tài liệu mật cần lưu trữ gấp! Bạn phải vào Kho Lưu Trữ để kiểm kê.',
    type: 'jail',
  },
  {
    id: 'host_festival',
    title: 'Đăng Cai Lễ Hội Công Ty',
    description: 'Bạn được trao quyền tổ chức Lễ Hội NKC ngay lập tức!',
    type: 'festival',
  },
  {
    id: 'dividend',
    title: 'Chia Cổ Tức Doanh Nghiệp',
    description: 'Cổ phần nội bộ sinh lời vượt bậc! Nhận 400K lợi nhuận chia.',
    type: 'money',
    amount: 400,
  },
  {
    id: 'server_down',
    title: 'Bảo Trì Hệ Thống Đột Xuất',
    description: 'Đóng góp 100K chi phí nâng cấp đường truyền cáp quang nội bộ.',
    type: 'money',
    amount: -100,
  },
];

export function drawChanceCard(): ChanceCard {
  const index = Math.floor(Math.random() * CHANCE_CARDS.length);
  return CHANCE_CARDS[index];
}
