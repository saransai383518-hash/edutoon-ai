import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, CheckCircle2, XCircle, Award, RotateCcw, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { QuizQuestion, CartoonCharacterType, AppLanguage } from '../types';
import { playBubblePop, playCorrectChime, playTryAgainSound, playCelebrationFanfare } from '../utils/audio';

interface CartoonQuizSectionProps {
  questions: QuizQuestion[];
  characterName: string;
  characterType: CartoonCharacterType;
  soundEnabled: boolean;
  language?: AppLanguage;
  onAwardStars?: (stars: number) => void;
  onQuizComplete?: (score: number, total: number) => void;
  isUnlockedByDefault?: boolean;
}

export const CartoonQuizSection: React.FC<CartoonQuizSectionProps> = ({
  questions,
  characterName,
  soundEnabled,
  language = 'en',
  onAwardStars,
  onQuizComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [starsEarned, setStarsEarned] = useState<number>(0);
  const [isQuizComplete, setIsQuizComplete] = useState<boolean>(false);
  const [showStarAnimation, setShowStarAnimation] = useState<boolean>(false);

  const isTamil = language === 'ta';

  if (!questions || questions.length === 0) {
    return null;
  }

  const currentQ = questions[currentQuestionIndex] || questions[0];
  const optionLetters = ['A', 'B', 'C', 'D'];

  const handleSelectOption = (index: number) => {
    if (hasAnswered) return;

    setSelectedAnswerIndex(index);
    setHasAnswered(true);

    if (index === currentQ.correctAnswerIndex) {
      setStarsEarned((prev) => prev + 1);
      setShowStarAnimation(true);
      playCorrectChime(soundEnabled);
      if (onAwardStars) {
        onAwardStars(1);
      }
      setTimeout(() => setShowStarAnimation(false), 1400);
    } else {
      playTryAgainSound(soundEnabled);
    }
  };

  const handleNext = () => {
    playBubblePop(soundEnabled);
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswerIndex(null);
      setHasAnswered(false);
    } else {
      setIsQuizComplete(true);
      playCelebrationFanfare(soundEnabled);
      if (onQuizComplete) {
        onQuizComplete(starsEarned, questions.length);
      }
    }
  };

  const handleRestart = () => {
    playBubblePop(soundEnabled);
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setHasAnswered(false);
    setStarsEarned(0);
    setIsQuizComplete(false);
  };

  // Feedback text and styling
  const isSelectedCorrect = selectedAnswerIndex === currentQ.correctAnswerIndex;

  return (
    <div
      id="cartoon-quiz-container"
      className="w-full rounded-3xl bg-gradient-to-b from-amber-50/90 via-orange-50/50 to-amber-100/60 border-3 border-amber-300 p-4 sm:p-6 shadow-md relative overflow-hidden"
    >
      {/* Decorative cartoon top accent */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b-2 border-amber-200/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400 border-2 border-amber-500 flex items-center justify-center text-white shadow-xs">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-amber-950 flex items-center gap-1.5">
              <span>{isTamil ? `${characterName} அவர்களின் வினாடி-வினா!` : `${characterName}'s Fun Quiz!`}</span>
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            </h3>
            <p className="text-[11px] sm:text-xs font-bold text-amber-800">
              {isTamil
                ? 'கற்றுக்கொண்டதை சோதித்து நட்சத்திரங்களை வெல்லுங்கள்!'
                : 'Test what you learned and win sparkling stars!'}
            </p>
          </div>
        </div>

        {/* Live stars badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border-2 border-amber-300 shadow-xs">
          <Star className="w-4 h-4 text-amber-500 fill-amber-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-black text-amber-900">
            {starsEarned} / {questions.length} {isTamil ? 'நட்சத்திரங்கள்' : 'Stars'}
          </span>
        </div>
      </div>

      {/* Floating Animated Star on Correct Answer */}
      <AnimatePresence>
        {showStarAnimation && (
          <motion.div
            initial={{ scale: 0, y: 20, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], y: -40, opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-30 flex flex-col items-center"
          >
            <Star className="w-16 h-16 text-yellow-400 fill-yellow-400 drop-shadow-[0_4px_10px_rgba(234,179,8,0.6)]" />
            <span className="text-base font-black text-amber-900 bg-white/95 px-3 py-1 rounded-full border-2 border-amber-400 shadow-md">
              {isTamil ? '+1 நட்சத்திரம்! ⭐' : '+1 Star! ⭐'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {!isQuizComplete ? (
        <div className="space-y-4">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs font-black text-amber-900 px-1">
            <span>
              {isTamil
                ? `கேள்வி ${currentQuestionIndex + 1} / ${questions.length}`
                : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
            </span>
            <span className="text-amber-700">
              {isTamil ? 'சரியான விடையைத் தேர்ந்தெடுக்கவும்' : 'Tap the best answer below'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-amber-200/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300 rounded-full"
              style={{
                width: `${((currentQuestionIndex + (hasAnswered ? 1 : 0)) / questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-amber-200 shadow-xs">
            <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {currentQ.question}
            </h4>
          </div>

          {/* 3 Child-Friendly Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswerIndex === idx;
              const isCorrect = idx === currentQ.correctAnswerIndex;

              let buttonStyle = 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 text-slate-800';
              let badgeStyle = 'bg-amber-100 border-amber-300 text-amber-900';

              if (hasAnswered) {
                if (isCorrect) {
                  buttonStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300';
                  badgeStyle = 'bg-emerald-500 border-emerald-600 text-white';
                } else if (isSelected && !isCorrect) {
                  buttonStyle = 'bg-rose-50 border-rose-400 text-rose-950 opacity-90';
                  badgeStyle = 'bg-rose-500 border-rose-600 text-white';
                } else {
                  buttonStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <motion.button
                  key={idx}
                  whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 text-left flex items-center justify-between gap-3 transition-all cursor-pointer shadow-xs ${buttonStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-2xs ${badgeStyle}`}
                    >
                      {optionLetters[idx] || `${idx + 1}`}
                    </span>
                    <span className="font-extrabold text-sm sm:text-base leading-tight">
                      {option}
                    </span>
                  </div>

                  {hasAnswered && isCorrect && (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  )}
                  {hasAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Answer Feedback Banner & Encouragement */}
          <AnimatePresence>
            {hasAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3 pt-1"
              >
                {/* Encouraging Character Banner */}
                <div
                  className={`p-4 rounded-2xl border-2 flex items-start gap-3 shadow-xs ${
                    isSelectedCorrect
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300'
                      : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white border border-amber-200 shrink-0 text-xl">
                    {isSelectedCorrect ? '🌟' : '💡'}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-black text-amber-950 uppercase tracking-wide mb-0.5">
                      {isSelectedCorrect
                        ? isTamil
                          ? `🎉 ${characterName} அவர்களின் பாராட்டு!`
                          : `🎉 Awesome Job from ${characterName}!`
                        : isTamil
                        ? `💛 ${characterName} தரும் உதவிக் குறிப்பு:`
                        : `💛 Helpful Clue from ${characterName}:`}
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800 leading-relaxed">
                      {currentQ.encouragement}
                    </p>
                  </div>
                </div>

                {/* Continue / Next Button */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleNext}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 border-3 border-amber-600 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_0_#b45309] active:shadow-none active:translate-y-1 transition-all"
                >
                  <span>
                    {currentQuestionIndex + 1 < questions.length
                      ? isTamil
                        ? 'அடுத்த கேள்வி'
                        : 'Next Question'
                      : isTamil
                      ? 'இறுதி மதிப்பெண் பார்க்க! 🏆'
                      : 'Show Final Score! 🏆'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Final Score & Celebration View */
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4 px-2 space-y-4"
        >
          <div className="relative inline-block mx-auto">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-3 border-amber-500 flex items-center justify-center mx-auto shadow-md">
              <Award className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 text-2xl animate-bounce">
              ⭐
            </div>
          </div>

          <div>
            <h4 className="text-xl sm:text-2xl font-black text-amber-950">
              {isTamil ? 'வினாடி-வினா முடிந்தது! வாழ்த்துகள்!' : 'Quiz Completed! Hooray!'}
            </h4>
            <p className="text-xs sm:text-sm font-bold text-amber-800 mt-1">
              {isTamil
                ? 'நீங்கள் மிக அழகாகக் கவனித்துப் பதிலளித்தீர்கள்!'
                : 'You explored, listened, and answered wonderfully!'}
            </p>
          </div>

          {/* Big Score Card */}
          <div className="p-5 rounded-3xl bg-white border-3 border-amber-300 shadow-sm max-w-sm mx-auto space-y-2">
            <div className="text-xs font-black text-amber-800 uppercase tracking-wider">
              {isTamil ? 'உங்கள் இறுதி மதிப்பெண்' : 'Your Final Score'}
            </div>
            <div className="flex items-center justify-center gap-2 text-3xl sm:text-4xl font-black text-amber-950">
              <span>{starsEarned}</span>
              <span className="text-amber-400">/</span>
              <span>{questions.length}</span>
              <span className="text-2xl">{isTamil ? 'நட்சத்திரங்கள்' : 'Stars'}</span>
            </div>

            <div className="flex justify-center gap-1.5 pt-1">
              {Array.from({ length: questions.length }).map((_, idx) => (
                <Star
                  key={idx}
                  className={`w-7 h-7 ${
                    idx < starsEarned
                      ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow'
                      : 'text-gray-300 fill-gray-100'
                  }`}
                />
              ))}
            </div>

            <div className="mt-2 pt-2 border-t border-amber-100 text-xs sm:text-sm font-bold text-amber-900">
              {starsEarned === questions.length
                ? isTamil
                  ? `🌟 முழு மதிப்பெண்! நீங்கள் ஒரு சிறந்த ஆய்வாளர்!`
                  : `🌟 Perfect score! You're a true ${characterName} Master Explorer!`
                : starsEarned > 0
                ? isTamil
                  ? `👏 மிகச் சிறப்பு! உங்கள் சேகரிப்பில் ${starsEarned} நட்சத்திரங்கள் சேர்ந்தன!`
                  : `👏 Terrific effort! You earned ${starsEarned} stars for your explorer collection!`
                : isTamil
                  ? `🌱 நல்ல முயற்சி! தினமும் பயிற்சி செய்வது நம்மை அறிவாளியாக்கும்!`
                  : `🌱 Great try! Practice makes us better and smarter every day!`}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 max-w-sm mx-auto">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleRestart}
              className="flex-1 py-3 px-4 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 text-amber-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isTamil ? 'மீண்டும் விளையாடு' : 'Try Quiz Again'}</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
