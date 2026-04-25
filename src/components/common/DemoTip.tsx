import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { X, Lightbulb } from 'lucide-react';

interface DemoTipProps {
  id: string;
  message: string;
}

export function DemoTip({ id, message }: DemoTipProps) {
  const storageKey = `fitmirror-tip-${id}`;
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem(storageKey) === 'dismissed';
  });

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem(storageKey, 'dismissed');
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl
            bg-primary-soft border border-primary/10 text-sm text-text"
        >
          <Lightbulb size={16} className="text-primary flex-shrink-0" />
          <span className="flex-1">{message}</span>
          <button
            onClick={dismiss}
            className="p-1 rounded-lg hover:bg-primary/10 text-text-muted hover:text-text transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
