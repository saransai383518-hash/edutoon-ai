import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CartoonCharacterType } from '../types';

interface CartoonCharacterProps {
  type: CartoonCharacterType;
  name: string;
  role: string;
  isTalking?: boolean;
  onToggleTalking?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CartoonCharacter: React.FC<CartoonCharacterProps> = ({
  type,
  name,
  role,
  isTalking = true,
  onToggleTalking,
  size = 'md',
  className = '',
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [talkingTick, setTalkingTick] = useState(0);

  // Periodic eye blink every 3.6 seconds
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3600);
    return () => clearInterval(blinkInterval);
  }, []);

  // Talking mouth tick when isTalking is true
  useEffect(() => {
    if (!isTalking) return;
    const talkInterval = setInterval(() => {
      setTalkingTick((prev) => (prev + 1) % 4);
    }, 240);
    return () => clearInterval(talkInterval);
  }, [isTalking]);

  const sizeClasses = {
    sm: 'w-24 h-28',
    md: 'w-36 h-44 sm:w-40 sm:h-48',
    lg: 'w-48 h-56',
  };

  // Mouth animation frames based on talking state
  // 0: closed smile, 1: small open, 2: wide open, 3: round 'oh'
  const mouthState = isTalking ? talkingTick : 0;

  return (
    <div
      className={`relative flex flex-col items-center select-none cursor-pointer group ${className}`}
      onClick={onToggleTalking}
      title={`Tap ${name} to make them talk or pause!`}
    >
      {/* Cartoon Speech Waves/Notes when talking */}
      <AnimatePresence>
        {isTalking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-3 right-0 sm:right-2 flex items-center gap-1 bg-amber-200/90 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300 text-[10px] font-black shadow-sm pointer-events-none z-10"
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              💬
            </motion.span>
            <span>Talking!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Animated SVG Container with idle movement */}
      <motion.div
        animate={{
          y: type === 'astronaut' ? [0, -8, 0, 8, 0] : [0, -5, 0],
          rotate: type === 'plant' ? [-2, 2, -2] : [0, 1.2, -1.2, 0],
        }}
        transition={{
          y: { repeat: Infinity, duration: type === 'astronaut' ? 3.5 : 2.5, ease: 'easeInOut' },
          rotate: { repeat: Infinity, duration: type === 'plant' ? 3 : 4, ease: 'easeInOut' },
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`${sizeClasses[size]} relative filter drop-shadow-md`}
      >
        {type === 'animal' && (
          <AnimalCharacterSVG
            isBlinking={isBlinking}
            mouthState={mouthState}
            isTalking={isTalking}
            speciesName={name}
          />
        )}

        {type === 'plant' && (
          <PlantCharacterSVG
            isBlinking={isBlinking}
            mouthState={mouthState}
            isTalking={isTalking}
          />
        )}

        {type === 'astronaut' && (
          <AstronautCharacterSVG
            isBlinking={isBlinking}
            mouthState={mouthState}
            isTalking={isTalking}
          />
        )}

        {type === 'scientist' && (
          <ScientistCharacterSVG
            isBlinking={isBlinking}
            mouthState={mouthState}
            isTalking={isTalking}
          />
        )}

        {type === 'teacher' && (
          <TeacherCharacterSVG
            isBlinking={isBlinking}
            mouthState={mouthState}
            isTalking={isTalking}
          />
        )}
      </motion.div>

      {/* Character Identity Badge */}
      <div className="mt-1 text-center">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-950 font-black text-xs shadow-xs">
          <span>{getCharacterIcon(type)}</span>
          <span>{name}</span>
        </div>
        <p className="text-[10px] font-bold text-amber-700 tracking-tight mt-0.5">{role}</p>
      </div>
    </div>
  );
};

function getCharacterIcon(type: CartoonCharacterType): string {
  switch (type) {
    case 'animal': return '🐾';
    case 'plant': return '🌿';
    case 'astronaut': return '🚀';
    case 'scientist': return '🧪';
    case 'teacher': return '📚';
  }
}

/* =========================================================================
   1. CARTOON ANIMAL (Barnaby Bear / Friendly Animal Guide)
   Features: Round teddy ears, soft honey coat, waving furry paw, blinking eyes,
   friendly animated mouth, cute snout with wet nose.
   ========================================================================= */
const AnimalCharacterSVG: React.FC<{ isBlinking: boolean; mouthState: number; isTalking: boolean; speciesName: string }> = ({
  isBlinking,
  mouthState,
  isTalking,
  speciesName,
}) => {
  const isTiger = /tiger/i.test(speciesName);
  const isLion = /lion/i.test(speciesName);
  return (
    <svg viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Fluffy Round Ears */}
      <circle cx="38" cy="42" r="22" fill="#D97706" stroke="#92400E" strokeWidth="4" />
      <circle cx="38" cy="42" r="13" fill="#FDE68A" />
      <circle cx="122" cy="42" r="22" fill="#D97706" stroke="#92400E" strokeWidth="4" />
      <circle cx="122" cy="42" r="13" fill="#FDE68A" />

      {/* Animal Body */}
      <ellipse cx="80" cy="130" rx="46" ry="42" fill="#D97706" stroke="#92400E" strokeWidth="4" />
      {/* Belly Patch */}
      <ellipse cx="80" cy="134" rx="30" ry="28" fill="#FEF3C7" />

      {/* Right Arm (Waving Paw Gesture!) */}
      <motion.g
        animate={{
          rotate: isTalking ? [0, 18, -10, 18, 0] : [0, 8, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: isTalking ? 1.4 : 2.5,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '120px 115px' }}
      >
        <rect x="114" y="95" width="34" height="20" rx="10" fill="#D97706" stroke="#92400E" strokeWidth="4" />
        {/* Paw Pads */}
        <circle cx="138" cy="105" r="5" fill="#FDE68A" />
        <circle cx="132" cy="98" r="2.5" fill="#FDE68A" />
        <circle cx="144" cy="98" r="2.5" fill="#FDE68A" />
      </motion.g>

      {/* Left Arm Resting/Greeting */}
      <rect x="14" y="112" width="28" height="18" rx="9" fill="#D97706" stroke="#92400E" strokeWidth="4" />
      <circle cx="22" cy="121" r="4" fill="#FDE68A" />

      {/* Animal Head */}
      {isLion && <circle cx="80" cy="74" r="54" fill="#A16207" stroke="#78350F" strokeWidth="5" />}
      <circle cx="80" cy="74" r="48" fill="#F59E0B" stroke="#92400E" strokeWidth="5" />

      {/* Subject-aware details make a tiger or lion feel like the picture's own guide. */}
      {isTiger && (
        <g stroke="#78350F" strokeWidth="4" strokeLinecap="round">
          <path d="M57 34L63 48M80 27V43M103 34L97 48M48 78L62 76M112 78L98 76" />
        </g>
      )}
      {isLion && <path d="M62 32Q80 20 98 32" stroke="#FDE68A" strokeWidth="4" fill="none" strokeLinecap="round" />}

      {/* Friendly Eyebrows */}
      <path d="M52 48C56 44 64 45 68 49" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M108 48C104 44 96 45 92 49" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />

      {/* Expressive Cartoon Eyes */}
      {!isBlinking ? (
        <g>
          {/* Left Eye */}
          <circle cx="60" cy="62" r="10" fill="#1E293B" />
          <circle cx="57" cy="59" r="3.5" fill="#FFFFFF" />
          <circle cx="63" cy="65" r="1.5" fill="#FFFFFF" />

          {/* Right Eye */}
          <circle cx="100" cy="62" r="10" fill="#1E293B" />
          <circle cx="97" cy="59" r="3.5" fill="#FFFFFF" />
          <circle cx="103" cy="65" r="1.5" fill="#FFFFFF" />
        </g>
      ) : (
        <g>
          {/* Blinking / Wink lines */}
          <path d="M52 64C56 68 64 68 68 64" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
          <path d="M92 64C96 68 104 68 108 64" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}

      {/* Rosy Cheeks */}
      <ellipse cx="48" cy="74" rx="8" ry="5" fill="#F87171" opacity="0.65" />
      <ellipse cx="112" cy="74" rx="8" ry="5" fill="#F87171" opacity="0.65" />

      {/* Cute Snout / Muzzle */}
      <ellipse cx="80" cy="82" rx="22" ry="16" fill="#FEF3C7" stroke="#92400E" strokeWidth="3" />

      {/* Heart/Oval Wet Nose */}
      <path
        d="M74 74C74 72 76 71 80 71C84 71 86 72 86 74C86 78 80 82 80 82C80 82 74 78 74 74Z"
        fill="#78350F"
      />
      <circle cx="78" cy="73" r="1.5" fill="#FFFFFF" />

      {/* Talking Animated Mouth */}
      {mouthState === 0 && (
        // Gentle Happy Smile
        <path d="M72 85C76 90 84 90 88 85" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
      )}
      {mouthState === 1 && (
        // Small Open Talking
        <ellipse cx="80" cy="87" rx="6" ry="5" fill="#78350F" />
      )}
      {mouthState === 2 && (
        // Wide Open Talking with Tongue
        <g>
          <path d="M72 85C72 94 88 94 88 85Z" fill="#78350F" />
          <path d="M76 90C78 93 82 93 84 90Z" fill="#F43F5E" />
        </g>
      )}
      {mouthState === 3 && (
        // Round 'Oh' Sound Shape
        <circle cx="80" cy="87" r="5" fill="#78350F" stroke="#F43F5E" strokeWidth="1.5" />
      )}
    </svg>
  );
};

/* =========================================================================
   2. CARTOON PLANT (Sprout the Blossom / Plant Friend)
   Features: Cheerful sunny petals, friendly green stem, waving leaf arms pointing
   towards the picture, smiling flower face, gentle stem swaying.
   ========================================================================= */
const PlantCharacterSVG: React.FC<{ isBlinking: boolean; mouthState: number; isTalking: boolean }> = ({
  isBlinking,
  mouthState,
  isTalking,
}) => {
  return (
    <svg viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Flower Pot */}
      <polygon points="50,140 110,140 102,175 58,175" fill="#EA580C" stroke="#9A3412" strokeWidth="4" />
      <rect x="46" y="132" width="68" height="12" rx="4" fill="#F97316" stroke="#9A3412" strokeWidth="3" />

      {/* Plant Stem */}
      <path d="M80 132C78 115 82 95 80 82" stroke="#15803D" strokeWidth="8" strokeLinecap="round" />

      {/* Left Leaf Arm (Resting/Curled) */}
      <path
        d="M76 112C50 112 40 98 44 94C58 92 72 104 76 108"
        fill="#22C55E"
        stroke="#15803D"
        strokeWidth="3.5"
      />

      {/* Right Leaf Arm (Pointing / Waving Gesture towards content) */}
      <motion.g
        animate={{
          rotate: isTalking ? [-5, 15, -5] : [0, 8, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: isTalking ? 1.5 : 2.5,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '82px 105px' }}
      >
        <path
          d="M82 105C108 95 125 78 132 80C128 95 105 110 82 112"
          fill="#22C55E"
          stroke="#15803D"
          strokeWidth="3.5"
        />
        {/* Leaf Vein */}
        <path d="M84 107C104 98 120 86 128 83" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
      </motion.g>

      {/* Flower Petals (Radiating around head) */}
      <g>
        {/* 8 Sunny Flower Petals */}
        <circle cx="80" cy="22" r="16" fill="#FBBF24" stroke="#D97706" strokeWidth="3.5" />
        <circle cx="118" cy="38" r="16" fill="#FBBF24" stroke="#D97706" strokeWidth="3.5" />
        <circle cx="132" cy="74" r="16" fill="#FBBF24" stroke="#D97706" strokeWidth="3.5" />
        <circle cx="118" cy="110" r="16" fill="#FBBF24" stroke="#D97706" strokeWidth="3.5" />
        <circle cx="80" cy="124" r="16" fill="#FBBF24" stroke="#D97706" strokeWidth="3.5" />
        <circle cx="42" cy="110" r="16" fill="#FBBF24" stroke="#D97706" strokeWidth="3.5" />
        <circle cx="28" cy="74" r="16" fill="#FBBF24" stroke="#D97706" strokeWidth="3.5" />
        <circle cx="42" cy="38" r="16" fill="#FBBF24" stroke="#D97706" strokeWidth="3.5" />
      </g>

      {/* Center Flower Face */}
      <circle cx="80" cy="74" r="42" fill="#FEF08A" stroke="#D97706" strokeWidth="4.5" />

      {/* Cheerful Eyebrows */}
      <path d="M56 52C60 48 66 49 70 53" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
      <path d="M104 52C100 48 94 49 90 53" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />

      {/* Big Sparkling Eyes */}
      {!isBlinking ? (
        <g>
          <circle cx="64" cy="65" r="9" fill="#1E293B" />
          <circle cx="61" cy="62" r="3.5" fill="#FFFFFF" />
          <circle cx="66" cy="68" r="1.5" fill="#FFFFFF" />

          <circle cx="96" cy="65" r="9" fill="#1E293B" />
          <circle cx="93" cy="62" r="3.5" fill="#FFFFFF" />
          <circle cx="98" cy="68" r="1.5" fill="#FFFFFF" />
        </g>
      ) : (
        <g>
          <path d="M58 66C62 70 68 70 72 66" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
          <path d="M88 66C92 70 98 70 102 66" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}

      {/* Rosy Cheeks */}
      <ellipse cx="52" cy="76" rx="7" ry="5" fill="#F87171" opacity="0.65" />
      <ellipse cx="108" cy="76" rx="7" ry="5" fill="#F87171" opacity="0.65" />

      {/* Talking Animated Mouth */}
      {mouthState === 0 && (
        <path d="M68 85C74 94 86 94 92 85" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
      )}
      {mouthState === 1 && (
        <ellipse cx="80" cy="87" rx="6" ry="5" fill="#78350F" />
      )}
      {mouthState === 2 && (
        <g>
          <path d="M70 85C70 95 90 95 90 85Z" fill="#78350F" />
          <path d="M75 90C77 93 83 93 85 90Z" fill="#F43F5E" />
        </g>
      )}
      {mouthState === 3 && (
        <circle cx="80" cy="88" r="5" fill="#78350F" stroke="#F43F5E" strokeWidth="1.5" />
      )}
    </svg>
  );
};

/* =========================================================================
   3. CARTOON ASTRONAUT (Cosmo the Astronaut / Space Explorer)
   Features: Cute space helmet with reflections, flashing antenna star, waving
   spacesuit glove with thumbs-up gesture, zero-gravity backpack thrusters.
   ========================================================================= */
const AstronautCharacterSVG: React.FC<{ isBlinking: boolean; mouthState: number; isTalking: boolean }> = ({
  isBlinking,
  mouthState,
  isTalking,
}) => {
  return (
    <svg viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Spacesuit Backpack */}
      <rect x="36" y="85" width="88" height="65" rx="16" fill="#CBD5E1" stroke="#475569" strokeWidth="4" />
      {/* Mini Thruster Nozzles */}
      <rect x="48" y="148" width="16" height="12" rx="4" fill="#94A3B8" stroke="#475569" strokeWidth="3" />
      <rect x="96" y="148" width="16" height="12" rx="4" fill="#94A3B8" stroke="#475569" strokeWidth="3" />

      {/* Spacesuit Body */}
      <rect x="46" y="90" width="68" height="60" rx="24" fill="#F1F5F9" stroke="#334155" strokeWidth="4.5" />

      {/* Space Mission Chest Badge */}
      <rect x="62" y="105" width="36" height="22" rx="8" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />
      <circle cx="70" cy="116" r="3" fill="#F43F5E" />
      <circle cx="80" cy="116" r="3" fill="#FACC15" />
      <circle cx="90" cy="116" r="3" fill="#4ADE80" />

      {/* Right Arm: Waving Astronaut Glove Gesture */}
      <motion.g
        animate={{
          rotate: isTalking ? [0, 20, -10, 20, 0] : [0, 10, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: isTalking ? 1.4 : 2.5,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '110px 105px' }}
      >
        <rect x="108" y="92" width="32" height="20" rx="10" fill="#F1F5F9" stroke="#334155" strokeWidth="4" />
        {/* Blue Grip Glove */}
        <circle cx="138" cy="102" r="10" fill="#0284C7" stroke="#0369A1" strokeWidth="2.5" />
        <rect x="136" y="90" width="8" height="10" rx="4" fill="#0284C7" />
      </motion.g>

      {/* Left Arm: Steady/Holding Floating Compass */}
      <rect x="20" y="102" width="30" height="18" rx="9" fill="#F1F5F9" stroke="#334155" strokeWidth="4" />
      <circle cx="22" cy="111" r="8" fill="#0284C7" stroke="#0369A1" strokeWidth="2.5" />

      {/* Helmet Antenna */}
      <line x1="80" y1="24" x2="80" y2="12" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
      <motion.circle
        cx="80"
        cy="10"
        r="6"
        fill="#F43F5E"
        stroke="#BE123C"
        strokeWidth="2"
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ repeat: Infinity, duration: 1 }}
      />

      {/* Big Round Space Helmet */}
      <circle cx="80" cy="62" r="46" fill="#F8FAFC" stroke="#334155" strokeWidth="5" />

      {/* Helmet Visor (Glossy & Reflective Cyan) */}
      <ellipse cx="80" cy="64" rx="36" ry="30" fill="#0F172A" stroke="#38BDF8" strokeWidth="3.5" />

      {/* Explorer Face Inside Visor */}
      <circle cx="80" cy="66" r="24" fill="#FED7AA" />

      {/* Expressive Eyes inside helmet */}
      {!isBlinking ? (
        <g>
          <circle cx="71" cy="63" r="5.5" fill="#1E293B" />
          <circle cx="69" cy="61" r="2" fill="#FFFFFF" />

          <circle cx="89" cy="63" r="5.5" fill="#1E293B" />
          <circle cx="87" cy="61" r="2" fill="#FFFFFF" />
        </g>
      ) : (
        <g>
          <path d="M66 64C69 67 74 67 76 64" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <path d="M84 64C87 67 92 67 94 64" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {/* Rosy Cheeks */}
      <ellipse cx="64" cy="71" rx="4" ry="2.5" fill="#F87171" opacity="0.6" />
      <ellipse cx="96" cy="71" rx="4" ry="2.5" fill="#F87171" opacity="0.6" />

      {/* Mouth Talking */}
      {mouthState === 0 && (
        <path d="M74 74C77 78 83 78 86 74" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {mouthState === 1 && (
        <ellipse cx="80" cy="75" rx="4" ry="3" fill="#78350F" />
      )}
      {mouthState === 2 && (
        <g>
          <path d="M74 74C74 80 86 80 86 74Z" fill="#78350F" />
          <path d="M77 77C78 79 82 79 83 77Z" fill="#F43F5E" />
        </g>
      )}
      {mouthState === 3 && (
        <circle cx="80" cy="76" r="3.5" fill="#78350F" stroke="#F43F5E" strokeWidth="1" />
      )}

      {/* Visor Glass Gloss Highlight */}
      <path
        d="M56 46C64 40 76 38 88 38"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
};

/* =========================================================================
   4. CARTOON SCIENTIST (Dr. Spark the Scientist / Science Buddy)
   Features: Science safety goggles, crisp white lab coat with colorful pocket pens,
   holding a bubbling conical flask with rising magic bubbles, excited gesture.
   ========================================================================= */
const ScientistCharacterSVG: React.FC<{ isBlinking: boolean; mouthState: number; isTalking: boolean }> = ({
  isBlinking,
  mouthState,
  isTalking,
}) => {
  return (
    <svg viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Scientist Body / Lab Coat */}
      <rect x="42" y="96" width="76" height="65" rx="20" fill="#FFFFFF" stroke="#0284C7" strokeWidth="4" />
      {/* Blue Shirt Collar & Tie */}
      <path d="M68 96L80 114L92 96" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />
      <polygon points="76,114 84,114 82,135 78,135" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />

      {/* Lab Coat Pocket with Pens */}
      <rect x="52" y="120" width="20" height="18" rx="4" fill="#F0F9FF" stroke="#0284C7" strokeWidth="2" />
      <rect x="55" y="114" width="3" height="8" rx="1" fill="#10B981" />
      <rect x="60" y="112" width="3" height="10" rx="1" fill="#8B5CF6" />
      <rect x="65" y="115" width="3" height="7" rx="1" fill="#F59E0B" />

      {/* Left Hand: Gesturing / Pointing */}
      <rect x="20" y="115" width="28" height="18" rx="9" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3.5" />
      <circle cx="22" cy="124" r="5" fill="#FED7AA" />

      {/* Right Hand: Holding Bubbling Flask with Rising Animated Bubbles! */}
      <g transform="translate(105, 95)">
        {/* Arm holding flask */}
        <rect x="0" y="15" width="26" height="18" rx="9" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3.5" />
        <circle cx="24" cy="24" r="5" fill="#FED7AA" />

        {/* Conical Flask */}
        <path
          d="M26 22L30 12H38L42 22L50 44C52 48 48 52 44 52H24C20 52 16 48 18 44L26 22Z"
          fill="#ECFEFF"
          stroke="#0891B2"
          strokeWidth="3"
        />
        {/* Bubbling Potion Liquid (Emerald/Teal) */}
        <path
          d="M20 42C24 40 30 44 34 41C38 39 44 43 48 42L49 44C51 48 47 51 43 51H25C21 51 17 48 19 44Z"
          fill="#10B981"
        />

        {/* Rising Bubbles */}
        <motion.circle
          cx="34"
          cy="28"
          r="3"
          fill="#34D399"
          animate={{ y: [0, -18, -26], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut' }}
        />
        <motion.circle
          cx="38"
          cy="32"
          r="2.5"
          fill="#6EE7B7"
          animate={{ y: [0, -15, -24], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, delay: 0.5, ease: 'easeOut' }}
        />
      </g>

      {/* Scientist Head */}
      <circle cx="80" cy="62" r="42" fill="#FED7AA" stroke="#9A3412" strokeWidth="4.5" />

      {/* Fluffy Scientist Hair */}
      <g>
        <circle cx="44" cy="40" r="14" fill="#64748B" />
        <circle cx="62" cy="26" r="16" fill="#64748B" />
        <circle cx="80" cy="24" r="16" fill="#64748B" />
        <circle cx="98" cy="26" r="16" fill="#64748B" />
        <circle cx="116" cy="40" r="14" fill="#64748B" />
      </g>

      {/* Round Scientist Safety Goggles */}
      <g>
        <circle cx="63" cy="58" r="16" fill="#E0F2FE" stroke="#0284C7" strokeWidth="4" />
        <circle cx="97" cy="58" r="16" fill="#E0F2FE" stroke="#0284C7" strokeWidth="4" />
        {/* Bridge */}
        <line x1="79" y1="58" x2="81" y2="58" stroke="#0284C7" strokeWidth="4" />
        {/* Goggle Strap */}
        <line x1="38" y1="58" x2="47" y2="58" stroke="#0284C7" strokeWidth="4" />
        <line x1="113" y1="58" x2="122" y2="58" stroke="#0284C7" strokeWidth="4" />
      </g>

      {/* Expressive Eyes inside Goggles */}
      {!isBlinking ? (
        <g>
          <circle cx="63" cy="58" r="7" fill="#1E293B" />
          <circle cx="60" cy="55" r="2.5" fill="#FFFFFF" />

          <circle cx="97" cy="58" r="7" fill="#1E293B" />
          <circle cx="94" cy="55" r="2.5" fill="#FFFFFF" />
        </g>
      ) : (
        <g>
          <path d="M57 60C60 63 66 63 69 60" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <path d="M91 60C94 63 100 63 103 60" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {/* Rosy Cheeks */}
      <ellipse cx="50" cy="72" rx="7" ry="4.5" fill="#F87171" opacity="0.65" />
      <ellipse cx="110" cy="72" rx="7" ry="4.5" fill="#F87171" opacity="0.65" />

      {/* Talking Animated Mouth */}
      {mouthState === 0 && (
        <path d="M70 78C74 85 86 85 90 78" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
      )}
      {mouthState === 1 && (
        <ellipse cx="80" cy="80" rx="6" ry="5" fill="#78350F" />
      )}
      {mouthState === 2 && (
        <g>
          <path d="M72 78C72 87 88 87 88 78Z" fill="#78350F" />
          <path d="M76 83C78 86 82 86 84 83Z" fill="#F43F5E" />
        </g>
      )}
      {mouthState === 3 && (
        <circle cx="80" cy="80" r="5" fill="#78350F" stroke="#F43F5E" strokeWidth="1.5" />
      )}
    </svg>
  );
};

/* =========================================================================
   5. CARTOON TEACHER (Miss Sunny the Teacher / Classroom Guide)
   Features: Cheerful teacher glasses, holding a yellow chalkboard pointer stick
   and storybook, neat cheerful hair, encouraging friendly smile, welcoming gesture.
   ========================================================================= */
const TeacherCharacterSVG: React.FC<{ isBlinking: boolean; mouthState: number; isTalking: boolean }> = ({
  isBlinking,
  mouthState,
  isTalking,
}) => {
  return (
    <svg viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Teacher Body / Cheerful Polka-dot Outfit */}
      <rect x="44" y="96" width="72" height="65" rx="20" fill="#F43F5E" stroke="#BE123C" strokeWidth="4" />
      {/* White Peter Pan Collar */}
      <path d="M60 96C66 106 74 106 80 98C86 106 94 106 100 96" fill="#FFFFFF" stroke="#BE123C" strokeWidth="2.5" />

      {/* Left Hand holding an open Storybook */}
      <g transform="translate(18, 108)">
        <rect x="0" y="8" width="22" height="16" rx="8" fill="#F43F5E" stroke="#BE123C" strokeWidth="3" />
        <circle cx="18" cy="16" r="5" fill="#FED7AA" />
        {/* Open Book */}
        <polygon points="6,4 18,2 18,22 6,24" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
        <polygon points="18,2 30,4 30,24 18,22" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2" />
      </g>

      {/* Right Hand holding yellow chalkboard pointer gesture */}
      <motion.g
        animate={{
          rotate: isTalking ? [0, 16, -8, 16, 0] : [0, 6, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: isTalking ? 1.5 : 2.5,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '115px 115px' }}
      >
        <rect x="110" y="106" width="24" height="16" rx="8" fill="#F43F5E" stroke="#BE123C" strokeWidth="3" />
        <circle cx="130" cy="114" r="5" fill="#FED7AA" />
        {/* Wooden/Yellow Pointer Stick */}
        <line x1="128" y1="116" x2="148" y2="82" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
        <circle cx="148" cy="82" r="3.5" fill="#EF4444" />
      </motion.g>

      {/* Teacher Head */}
      <circle cx="80" cy="62" r="42" fill="#FED7AA" stroke="#9A3412" strokeWidth="4.5" />

      {/* Neat Hair with Cute Bow */}
      <g>
        <circle cx="46" cy="46" r="14" fill="#78350F" />
        <circle cx="114" cy="46" r="14" fill="#78350F" />
        <path d="M42 54C46 32 114 32 118 54C108 40 52 40 42 54Z" fill="#78350F" />
        {/* Red Bow on Hair */}
        <circle cx="48" cy="34" r="5" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
        <polygon points="40,30 48,34 40,38" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
        <polygon points="56,30 48,34 56,38" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
      </g>

      {/* Friendly Round Teacher Glasses */}
      <g>
        <circle cx="64" cy="60" r="14" fill="#FEF08A" fillOpacity="0.25" stroke="#D97706" strokeWidth="3.5" />
        <circle cx="96" cy="60" r="14" fill="#FEF08A" fillOpacity="0.25" stroke="#D97706" strokeWidth="3.5" />
        <line x1="78" y1="60" x2="82" y2="60" stroke="#D97706" strokeWidth="3.5" />
      </g>

      {/* Cheerful Eyes */}
      {!isBlinking ? (
        <g>
          <circle cx="64" cy="60" r="6.5" fill="#1E293B" />
          <circle cx="61" cy="57" r="2.5" fill="#FFFFFF" />

          <circle cx="96" cy="60" r="6.5" fill="#1E293B" />
          <circle cx="93" cy="57" r="2.5" fill="#FFFFFF" />
        </g>
      ) : (
        <g>
          <path d="M58 61C61 64 67 64 70 61" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <path d="M90 61C93 64 99 64 102 61" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {/* Rosy Cheeks */}
      <ellipse cx="50" cy="71" rx="7" ry="4.5" fill="#F87171" opacity="0.65" />
      <ellipse cx="110" cy="71" rx="7" ry="4.5" fill="#F87171" opacity="0.65" />

      {/* Talking Animated Mouth */}
      {mouthState === 0 && (
        <path d="M70 77C74 84 86 84 90 77" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
      )}
      {mouthState === 1 && (
        <ellipse cx="80" cy="79" rx="6" ry="5" fill="#78350F" />
      )}
      {mouthState === 2 && (
        <g>
          <path d="M72 77C72 86 88 86 88 77Z" fill="#78350F" />
          <path d="M76 82C78 85 82 85 84 82Z" fill="#F43F5E" />
        </g>
      )}
      {mouthState === 3 && (
        <circle cx="80" cy="79" r="5" fill="#78350F" stroke="#F43F5E" strokeWidth="1.5" />
      )}
    </svg>
  );
};
