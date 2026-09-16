import React from 'react';
import { motion } from 'motion/react';

interface ToonyMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  pose?: 'happy' | 'waving' | 'camera' | 'curious';
  showSpeechBubble?: boolean;
  speechText?: string;
  className?: string;
  onClick?: () => void;
}

export const ToonyMascot: React.FC<ToonyMascotProps> = ({
  size = 'md',
  pose = 'happy',
  showSpeechBubble = false,
  speechText = "Hi! I'm Toony! Let's explore together!",
  className = '',
  onClick
}) => {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48',
  };

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`} onClick={onClick}>
      {/* Cartoon Speech Bubble */}
      {showSpeechBubble && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className="mb-2 max-w-xs relative bg-white border-3 border-amber-300 rounded-2xl px-4 py-2 text-center shadow-lg shadow-amber-200/50"
        >
          <p className="text-amber-900 font-bold text-sm sm:text-base leading-snug">
            {speechText}
          </p>
          {/* Bubble Pointer Arrow */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-amber-300" />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-white" />
        </motion.div>
      )}

      {/* Mascot Animated Character */}
      <motion.div
        whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
        whileTap={{ scale: 0.95 }}
        animate={{
          y: [0, -6, 0],
          rotate: pose === 'waving' ? [0, 4, -4, 0] : [0, 1.5, -1.5, 0],
        }}
        transition={{
          y: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' },
          rotate: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
        }}
        className={`${sizeMap[size]} cursor-pointer filter drop-shadow-md`}
      >
        <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Friendly Star / Sparkle Halo Antenna */}
          <g>
            <path
              d="M80 34V16M80 16L74 24M80 16L86 24"
              stroke="#F59E0B"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="80" cy="14" r="10" fill="#FBBF24" stroke="#D97706" strokeWidth="3" />
            <circle cx="82" cy="12" r="3" fill="#FEF3C7" />
          </g>

          {/* Ears / Side Puffs */}
          <circle cx="36" cy="74" r="18" fill="#FBBF24" stroke="#D97706" strokeWidth="4" />
          <circle cx="36" cy="74" r="10" fill="#FDE68A" />
          <circle cx="124" cy="74" r="18" fill="#FBBF24" stroke="#D97706" strokeWidth="4" />
          <circle cx="124" cy="74" r="10" fill="#FDE68A" />

          {/* Main Round Friendly Head */}
          <rect
            x="32"
            y="36"
            width="96"
            height="90"
            rx="45"
            fill="#FEF08A"
            stroke="#D97706"
            strokeWidth="5"
          />

          {/* Cheerful Forehead Highlights */}
          <path
            d="M52 48C58 43 68 41 80 41"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Eyes - Big & Expressive */}
          <g>
            {/* Left Eye */}
            <circle cx="62" cy="78" r="12" fill="#1E293B" />
            <circle cx="58" cy="74" r="4" fill="#FFFFFF" />
            <circle cx="65" cy="82" r="2" fill="#FFFFFF" />

            {/* Right Eye */}
            <circle cx="98" cy="78" r="12" fill="#1E293B" />
            <circle cx="94" cy="74" r="4" fill="#FFFFFF" />
            <circle cx="101" cy="82" r="2" fill="#FFFFFF" />
          </g>

          {/* Rosy Cartoon Cheeks */}
          <ellipse cx="48" cy="89" rx="8" ry="5" fill="#F87171" opacity="0.65" />
          <ellipse cx="112" cy="89" rx="8" ry="5" fill="#F87171" opacity="0.65" />

          {/* Big Warm Smile */}
          <path
            d="M66 94C72 106 88 106 94 94"
            stroke="#78350F"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Cute Tongue */}
          <path
            d="M74 100C76 105 84 105 86 100"
            fill="#F43F5E"
          />

          {/* Little Star Badge / Tie */}
          <g transform="translate(70, 118)">
            <path
              d="M10 0L13 6L20 7L15 12L16 19L10 16L4 19L5 12L0 7L7 6L10 0Z"
              fill="#38BDF8"
              stroke="#0284C7"
              strokeWidth="2"
            />
          </g>
        </svg>
      </motion.div>
    </div>
  );
};
