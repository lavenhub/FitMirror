import { motion } from 'motion/react';
import type { ReactNode } from 'react';

interface ViewTransitionProps {
  children: ReactNode;
  viewKey: string;
}

export function ViewTransition({ children, viewKey }: ViewTransitionProps) {
  return (
    <motion.div
      key={viewKey}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
