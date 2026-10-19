import { AnimatePresence, motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

interface Props {
  text: ReactNode;
  textKey: string | number;
  tail?: 'left' | 'right' | 'down';
  style?: CSSProperties;
}

/** Bong bóng thoại của linh vật, nảy ra mỗi khi nội dung thay đổi. */
export function SpeechBubble({ text, textKey, tail = 'left', style }: Props) {
  return (
    <AnimatePresence mode="wait">
      {text && (
        <motion.div
          key={textKey}
          className={`bubble tail-${tail}`}
          style={style}
          initial={{ opacity: 0, scale: 0.6, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.12 } }}
          transition={{ type: 'spring', stiffness: 520, damping: 24 }}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
