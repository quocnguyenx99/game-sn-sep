import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Button } from './Button';

interface Props {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  width?: number;
  children: ReactNode;
}

export function Modal({ open, onClose, title, width = 1200, children }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onPointerDown={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            className="modal panel"
            style={{ width }}
            initial={{ scale: 0.7, y: 60, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          >
            {onClose && (
              <Button variant="white" size="icon" className="modal-close" onClick={onClose} aria-label="Đóng">
                <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
                  <path d="M9 9l14 14M23 9L9 23" />
                </svg>
              </Button>
            )}
            {title && <h2 className="modal-title candy-text">{title}</h2>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
