import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../lib/store';

interface AvatarEngineProps {
  className?: string;
  mode?: 'idle' | 'scanning' | 'transition';
}

/**
 * A fully procedural, code-driven mannequin simulation.
 * Replicates the "motion style" and "presence" of the references
 * using pure geometry, interpolation, and mathematical oscillators.
 */
export const AvatarEngine: React.FC<AvatarEngineProps> = ({
  className = '',
  mode = 'idle',
}) => {
  const { state } = useStore();
  const { userBody, avatarGender } = state;

  // 1. Procedural Proportions (Normalized to reference values)
  const proportions = useMemo(() => {
    return {
      heightFactor: userBody.height / 175,
      widthFactor: userBody.weight / 70,
      shoulderFactor: userBody.shoulders / 45,
      waistFactor: userBody.waist / 80,
      hipFactor: userBody.hips / 95,
      // Gender specific morph targets
      isMale: avatarGender === 'male',
    };
  }, [userBody, avatarGender]);

  // 2. Procedural Path Logic
  const bodyPath = useMemo(() => {
    const s = proportions.shoulderFactor * 60;
    const wa = proportions.waistFactor * 45;
    const hi = proportions.hipFactor * 55;
    const curves = proportions.isMale ? 5 : 25;
    
    return `
      M ${100 - s} 80
      C ${100 - s} 70, ${100 - s/2} 70, 100 70
      C ${100 + s/2} 70, ${100 + s} 70, ${100 + s} 80
      L ${100 + wa} 160
      C ${100 + hi + curves} 200, ${100 + hi} 240, ${100 + hi} 280
      L ${100 + 15} 380
      L ${100 - 15} 380
      L ${100 - hi} 280
      C ${100 - hi} 240, ${100 - hi - curves} 200, ${100 - wa} 160
      Z
    `;
  }, [proportions]);

  // 3. No animations - static pose
  // Removed breathing and posture animations for static display

  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-transparent ${className}`}>
      <svg
        viewBox="0 0 200 450"
        className="w-full h-full drop-shadow-[0_40px_80px_rgba(0,0,0,0.1)]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="mannequinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>
          
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <mask id="bodyMask">
            <motion.path d={bodyPath} fill="white" />
          </mask>
        </defs>

        {/* The Living Body */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main Geometry */}
          <motion.path
            d={bodyPath}
            fill="url(#mannequinGrad)"
            stroke="#e2e8f0"
            strokeWidth="0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="transition-all duration-700 ease-out"
          />

          {/* Head & Neck (Procedural) */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
             <ellipse cx="100" cy="45" rx="18" ry="24" fill="url(#mannequinGrad)" stroke="#e2e8f0" strokeWidth="0.5" />
             <path d="M 92 65 Q 100 70 108 65" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </motion.g>

          {/* Dynamic Light/Depth Simulation */}
          <motion.path
            d={bodyPath}
            fill="none"
            stroke="white"
            strokeWidth="2"
            opacity="0.5"
            className="pointer-events-none"
            style={{ filter: 'blur(4px)' }}
          />
        </motion.g>

        {/* Scan Interaction Overlay (Procedural) */}
        <AnimatePresence>
          {mode === 'scanning' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.path
                d={bodyPath}
                fill="rgba(99,102,241,0.03)"
                stroke="rgba(99,102,241,0.4)"
                strokeWidth="1"
                strokeDasharray="10 5"
                animate={{ strokeDashoffset: [0, -50] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Animated Scan Line */}
              <motion.line
                x1="0" x2="200"
                y1="0" y2="0"
                stroke="#4f46e5"
                strokeWidth="1"
                animate={{ y1: [70, 400, 70], y2: [70, 400, 70] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: 'drop-shadow(0 0 8px rgba(79, 70, 229, 0.8))' }}
              />
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {/* Face Projection Integration */}
      {userBody.faceImageUrl && mode !== 'scanning' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 0.5 }}
          className="absolute top-[8%] left-1/2 -translate-x-1/2 w-14 h-18 z-20 pointer-events-none"
          style={{ 
            maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 100%)'
          }}
        >
          <img
            src={userBody.faceImageUrl}
            alt="Face Proxy"
            className="w-full h-full object-cover mix-blend-multiply grayscale"
          />
        </motion.div>
      )}
    </div>
  );
};

