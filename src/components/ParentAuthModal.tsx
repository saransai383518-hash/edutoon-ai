import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, Delete, ArrowLeft, KeyRound, Calculator, HelpCircle } from 'lucide-react';
import { getParentPIN, setParentPIN } from '../utils/learningTracker';
import { playBubblePop, playChime } from '../utils/audio';
import { AppLanguage } from '../types';

interface ParentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  soundEnabled?: boolean;
  language?: AppLanguage;
}

export const ParentAuthModal: React.FC<ParentAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  soundEnabled = true,
  language = 'en',
}) => {
  const isTamil = language === 'ta';
  const [pinInput, setPinInput] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [useMathGate, setUseMathGate] = useState<boolean>(false);
  const [mathAnswerInput, setMathAnswerInput] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);

  // Generate a random dynamic math problem for the parent challenge (e.g. 13 × 7 or 28 + 47)
  const mathChallenge = useMemo(() => {
    const num1 = Math.floor(Math.random() * 8) + 12; // 12 - 19
    const num2 = Math.floor(Math.random() * 7) + 6;  // 6 - 12
    return {
      num1,
      num2,
      operator: '×',
      correctAnswer: num1 * num2,
    };
  }, [useMathGate]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setIsError(false);
      setErrorMessage('');
      setUseMathGate(false);
      setMathAnswerInput('');
      setShowHint(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (digit: string) => {
    playBubblePop(soundEnabled);
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setIsError(false);
      setErrorMessage('');

      // Auto-validate when 4 digits reached
      if (nextPin.length === 4) {
        validatePin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    playBubblePop(soundEnabled);
    setPinInput((prev) => prev.slice(0, -1));
    setIsError(false);
  };

  const validatePin = (input: string) => {
    const actualPin = getParentPIN();
    if (input === actualPin) {
      playChime(soundEnabled);
      onSuccess();
    } else {
      setIsError(true);
      setErrorMessage(
        isTamil
          ? 'தவறான பின் எண்! மீண்டும் முயற்சி செய்யவும்.'
          : 'Incorrect PIN. Try again or use Math Challenge.'
      );
      setTimeout(() => {
        setPinInput('');
      }, 550);
    }
  };

  const handleValidateMathChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(mathAnswerInput.trim(), 10);
    if (parsed === mathChallenge.correctAnswer) {
      playChime(soundEnabled);
      // Reset PIN back to default 1234 on math solve
      setParentPIN('1234');
      onSuccess();
    } else {
      setIsError(true);
      setErrorMessage(
        isTamil
          ? 'தவறான விடை. தயவுசெய்து மீண்டும் கணக்கிடவும்.'
          : 'Incorrect answer. Please calculate again.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-sm bg-white rounded-3xl border-4 border-amber-300 shadow-2xl p-6 text-center overflow-hidden"
      >
        {/* Top Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              playBubblePop(soundEnabled);
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer transition-colors"
            aria-label="Back to App"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>{isTamil ? 'பெற்றோர் பகுதி' : 'Parent Zone'}</span>
          </div>

          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Mascot & Lock Icon */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-100 border-2 border-amber-400 flex items-center justify-center shadow-inner text-amber-800">
          <ShieldCheck className="w-8 h-8 text-amber-600" />
        </div>

        <h3 className="text-xl font-black text-slate-800 leading-tight">
          {isTamil ? 'பெற்றோர் சரிபார்ப்பு' : 'Parental Verification'}
        </h3>
        <p className="text-xs text-slate-600 font-bold mt-1 px-2">
          {useMathGate
            ? isTamil
              ? 'பெற்றோர்களுக்கான கணக்கீடு: விடையை உள்ளிடவும்'
              : 'Adults only: Solve the math challenge below'
            : isTamil
            ? 'தொடர உங்கள் 4-இலக்க பின் எண்ணை உள்ளிடவும்'
            : 'Enter your 4-digit Parent PIN to open the dashboard'}
        </p>

        {/* PIN MODE */}
        {!useMathGate ? (
          <div className="mt-5">
            {/* PIN Dots Display */}
            <motion.div
              animate={isError ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex justify-center items-center gap-3.5 mb-4"
            >
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pinInput.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
                      isFilled
                        ? 'bg-amber-500 border-amber-600 scale-110 shadow-sm'
                        : 'bg-slate-100 border-slate-300'
                    } ${isError ? 'border-red-400 bg-red-400' : ''}`}
                  />
                );
              })}
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-black text-red-600 mb-3 bg-red-50 py-1.5 px-3 rounded-xl border border-red-200"
                >
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Number Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto mb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <motion.button
                  key={digit}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleKeyPress(digit)}
                  className="h-12 rounded-2xl bg-slate-100 hover:bg-amber-100 border-2 border-slate-200 hover:border-amber-400 text-slate-800 font-black text-lg cursor-pointer transition-all shadow-xs flex items-center justify-center"
                >
                  {digit}
                </motion.button>
              ))}
              {/* Math Gate Shortcut */}
              <button
                type="button"
                onClick={() => {
                  playBubblePop(soundEnabled);
                  setUseMathGate(true);
                }}
                className="h-12 rounded-2xl bg-sky-50 hover:bg-sky-100 border-2 border-sky-200 hover:border-sky-400 text-sky-700 font-bold text-xs cursor-pointer flex flex-col items-center justify-center p-1"
                title="Math Challenge"
              >
                <Calculator className="w-4 h-4" />
                <span className="text-[9px] font-black">Math</span>
              </button>

              {/* Zero */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleKeyPress('0')}
                className="h-12 rounded-2xl bg-slate-100 hover:bg-amber-100 border-2 border-slate-200 hover:border-amber-400 text-slate-800 font-black text-lg cursor-pointer transition-all shadow-xs flex items-center justify-center"
              >
                0
              </motion.button>

              {/* Backspace */}
              <button
                type="button"
                onClick={handleDelete}
                className="h-12 rounded-2xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 hover:border-rose-400 text-rose-700 font-bold text-sm cursor-pointer flex items-center justify-center"
                aria-label="Delete"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Default PIN Hint Banner */}
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-bold">
                {isTamil ? 'இயல்புநிலை பின்: 1234' : 'Default PIN: 1234'}
              </span>
              <button
                type="button"
                onClick={() => {
                  playBubblePop(soundEnabled);
                  setShowHint(!showHint);
                }}
                className="text-amber-700 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHint ? 'Hide' : 'Hint'}</span>
              </button>
            </div>
            {showHint && (
              <p className="text-[11px] font-bold text-slate-500 bg-amber-50 p-2 rounded-xl mt-2 border border-amber-200">
                {isTamil
                  ? 'முதல் முறை பயன்படுத்த இயல்புநிலை பின் 1234 ஆகும். நீங்கள் இதை பெற்றோர் அமைப்புகளில் மாற்றிக் கொள்ளலாம்.'
                  : 'The default security PIN is 1234. You can change this code anytime inside the Parent Dashboard settings.'}
              </p>
            )}
          </div>
        ) : (
          /* MATH GATE MODE (Fallback for forgot PIN) */
          <form onSubmit={handleValidateMathChallenge} className="mt-5">
            <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-4 mb-4">
              <div className="text-xs font-black text-sky-800 uppercase tracking-wider mb-1">
                {isTamil ? 'பெற்றோர் கணக்குச் சோதனை' : 'Parent Verification Math'}
              </div>
              <div className="text-2xl font-black text-sky-950 my-2 tracking-wide">
                {mathChallenge.num1} {mathChallenge.operator} {mathChallenge.num2} = ?
              </div>
              <input
                type="number"
                pattern="[0-9]*"
                autoFocus
                value={mathAnswerInput}
                onChange={(e) => setMathAnswerInput(e.target.value)}
                placeholder="Answer"
                className="w-32 mx-auto text-center py-2 px-3 bg-white border-2 border-sky-400 rounded-xl font-black text-xl text-sky-950 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {errorMessage && (
              <div className="text-xs font-black text-red-600 mb-3 bg-red-50 py-1.5 px-3 rounded-xl border border-red-200">
                {errorMessage}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUseMathGate(false)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                {isTamil ? 'பின் எண் மூலம்' : 'Back to PIN'}
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs cursor-pointer shadow-sm"
              >
                {isTamil ? 'உள்நுழை' : 'Verify'}
              </button>
            </div>
          </form>
        )}

        {/* Back to kid mode */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => {
              playBubblePop(soundEnabled);
              onClose();
            }}
            className="text-xs font-extrabold text-slate-500 hover:text-amber-800 transition-colors cursor-pointer"
          >
            {isTamil ? '← குழந்தை முகப்புக்குத் திரும்பு' : '← Return to Kid Adventure'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
