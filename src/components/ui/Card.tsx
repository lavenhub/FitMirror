import { motion, type HTMLMotionProps } from 'motion/react';
import type { ReactNode } from 'react';

interface CardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  glass?: boolean;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  glass = false,
  hover = false,
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`
        rounded-2xl border border-slate-200 bg-white shadow-sm
        ${paddingClasses[padding]}
        ${hover ? 'cursor-pointer hover:shadow-md hover:border-slate-300 transition-all duration-200' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
