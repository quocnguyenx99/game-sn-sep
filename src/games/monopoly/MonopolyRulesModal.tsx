import { motion } from 'framer-motion';

export function MonopolyRulesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 780,
          maxHeight: 700,
          overflowY: 'auto',
          padding: '30px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="candy-text" style={{ fontSize: 44, color: 'var(--ink)' }}>
            Luật Chơi Cờ Tỷ Phú NKC
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 32,
              cursor: 'pointer',
              color: 'var(--ink-soft)',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 18, lineHeight: 1.6 }}>
          <div style={{ background: '#EFF6FF', padding: '16px 20px', borderRadius: 16 }}>
            <strong style={{ color: '#1D4ED8', fontSize: 20 }}>🎲 1. Đổ Xúc Xắc &amp; Di Chuyển</strong>
            <p style={{ margin: '8px 0 0' }}>
              Mỗi lượt người chơi gieo 2 viên xúc xắc. Nếu đổ được <strong>Đôi</strong> (hai số bằng nhau), bạn được gieo
              tiếp thêm một lượt! Nhưng hãy cẩn thận: nếu gieo đôi <strong>3 lần liên tiếp</strong>, bạn sẽ bị đưa thẳng vào
              Kho Lưu Trữ (Ở tù)!
            </p>
          </div>

          <div style={{ background: '#F0FDF4', padding: '16px 20px', borderRadius: 16 }}>
            <strong style={{ color: '#15803D', fontSize: 20 }}>🏰 2. Mua Đất, Nâng Nhà &amp; Xây Landmark</strong>
            <p style={{ margin: '8px 0 0' }}>
              Khi dừng chân tại ô đất trống, bạn có thể mua lại quyền sử dụng. Các lượt tiếp theo khi ghé thăm, bạn có thể
              nâng cấp lên Cấp 1, Cấp 2, Cấp 3 và đỉnh cao là <strong>LANDMARK NKC</strong>! Khi đã xây thành Landmark, đối
              thủ <em>hoàn toàn không thể thâu tóm</em> công trình của bạn!
            </p>
          </div>

          <div style={{ background: '#FAF5FF', padding: '16px 20px', borderRadius: 16 }}>
            <strong style={{ color: '#7E22CE', fontSize: 20 }}>⚔️ 3. Thâu Tóm (Buyout) Bất Động Sản Đối Thủ</strong>
            <p style={{ margin: '8px 0 0' }}>
              Nếu bạn bước vào ô đất của đối phương và ô đó <em>chưa lên Landmark</em>, sau khi trả tiền thuê, bạn có quyền
              bỏ ra <strong>gấp đôi (x2)</strong> giá trị công trình để mua đứt khu đất đó và chuyển quyền sở hữu sang mình!
            </p>
          </div>

          <div style={{ background: '#FFFBEB', padding: '16px 20px', borderRadius: 16 }}>
            <strong style={{ color: '#B45309', fontSize: 20 }}>👑 4. Các Cách Chiến Thắng Nhanh (Phong Cách VNG)</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
              <li>
                <strong>Độc Quyền 3 Bộ Màu (Triple Monopoly):</strong> Sở hữu toàn bộ các ô trong 3 nhóm màu khác nhau → Thắng ngay!
              </li>
              <li>
                <strong>Độc Quyền 1 Hàng (Line Monopoly):</strong> Sở hữu toàn bộ bất động sản trên cùng 1 cạnh bàn cờ → Thắng ngay!
              </li>
              <li>
                <strong>Độc Quyền Du Lịch (Tourism Monopoly):</strong> Sở hữu cả 4 Tuyến Giao Thông NKC (Bus, Cao Tốc, Sân Bay, Du Thuyền) → Thắng ngay!
              </li>
              <li>
                <strong>Làm Đối Thủ Phá Sản:</strong> Khi tất cả đối thủ đều hết tiền và nợ nần.
              </li>
            </ul>
          </div>

          <div style={{ background: '#FEF2F2', padding: '16px 20px', borderRadius: 16 }}>
            <strong style={{ color: '#B91C1C', fontSize: 20 }}>✈️ 5. Các Ô Đặc Biệt</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
              <li>
                <strong>Sân Bay Công Tác:</strong> Lượt tới bạn được quyền bay tự do đến bất kỳ ô nào trên bàn cờ!
              </li>
              <li>
                <strong>Lễ Hội NKC:</strong> Chọn 1 khu đất của bạn để nhân đôi (x2) tiền thuê đối thủ!
              </li>
              <li>
                <strong>Kho Lưu Trữ:</strong> Giam 3 lượt. Có thể gieo đôi, hoặc trả 200K để ra ngay.
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            alignSelf: 'center',
            padding: '12px 36px',
            borderRadius: 999,
            border: 'none',
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            color: '#fff',
            fontSize: 18,
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Đã Hiểu, Quay Lại Bàn Cờ
        </button>
      </motion.div>
    </div>
  );
}
