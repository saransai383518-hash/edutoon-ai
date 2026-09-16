import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RefreshCw, Image as ImageIcon, Home, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { AIAnalysisResult, ScreenType, AppLanguage } from '../types';
import { ToonyMascot } from './ToonyMascot';
import { playChime, playBubblePop } from '../utils/audio';

interface AIProcessingScreenProps {
  image: string | null;
  soundEnabled: boolean;
  language: AppLanguage;
  onNavigate: (screen: ScreenType) => void;
  onRetake: () => void;
  onChooseAnother: () => void;
  onAnalysisComplete: (result: AIAnalysisResult) => void;
}

export const AIProcessingScreen: React.FC<AIProcessingScreenProps> = ({
  image,
  soundEnabled,
  language,
  onNavigate,
  onRetake,
  onChooseAnother,
  onAnalysisComplete,
}) => {
  const [progress, setProgress] = useState(20);
  const [phase, setPhase] = useState<'scanning' | 'analyzing' | 'complete' | 'error'>('scanning');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const requestInFlightRef = useRef(false);
  const hasTriggeredRef = useRef(false);
  const completionTimerRef = useRef<number | null>(null);

  const isTamil = language === 'ta';

  const startAnalysis = async () => {
    if (requestInFlightRef.current) {
      return;
    }

    if (!image || !image.trim()) {
      setPhase('error');
      setErrorMessage(isTamil ? 'படம் எதுவும் தேர்ந்தெடுக்கப்படவில்லை!' : 'No picture was selected! Please take or upload a picture first.');
      return;
    }

    requestInFlightRef.current = true;
    setIsLoading(true);
    setPhase('scanning');
    setErrorMessage(null);
    setProgress(25);

    // Progress tick intervals for kid friendly feedback
    const pTimer1 = setTimeout(() => {
      setProgress(55);
      setPhase('analyzing');
    }, 1200);

    const pTimer2 = setTimeout(() => {
      setProgress(85);
    }, 2400);

    const controller = new AbortController();
    const requestTimeout = window.setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image, language }),
        signal: controller.signal,
      });

      const responseText = await response.text();
      let data: { success?: boolean; result?: AIAnalysisResult; error?: string; developerMessage?: string; providerStatus?: number; category?: string; model?: string };

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(isTamil ? 'சேவையிலிருந்து தவறான பதில் வந்தது.' : 'The analysis service returned an invalid response.');
      }

      if (!response.ok || !data.success || !data.result) {
        if (data.developerMessage) {
          console.error('Gemini image analysis diagnostic:', {
            status: data.providerStatus,
            category: data.category,
            model: data.model,
            message: data.developerMessage,
          });
        }
        throw new Error(data.error || (isTamil ? 'படத்தைப் புரிந்துகொள்வதில் சிக்கல்' : 'Failed to understand image'));
      }

      setProgress(100);
      setPhase('complete');
      playChime(soundEnabled);

      // Brief moment for the child to see the completed status, then show the result.
      completionTimerRef.current = window.setTimeout(() => {
        onAnalysisComplete(data.result as AIAnalysisResult);
      }, 750);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setPhase('error');
      const message = err instanceof Error ? err.message : '';
      setErrorMessage(
        err?.name === 'AbortError'
          ? isTamil
            ? 'படத்தைப் பகுப்பாய்வு செய்ய அதிக நேரம் எடுத்தது. மீண்டும் முயற்சிக்கவும்.'
            : 'The analysis took too long. Please try again.'
          : message ||
              (isTamil
                ? 'இந்தப் படத்தைப் பகுப்பாய்வு செய்ய முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
                : "We couldn't analyze this picture. Please try again."),
      );
    } finally {
      window.clearTimeout(requestTimeout);
      clearTimeout(pTimer1);
      clearTimeout(pTimer2);
      requestInFlightRef.current = false;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      startAnalysis();
    }

    return () => {
      if (completionTimerRef.current !== null) {
        window.clearTimeout(completionTimerRef.current);
      }
    };
  }, [image]);

  const messages: Record<string, string> = isTamil
    ? {
        scanning: "உங்கள் படம் ஆராயப்படுகிறது... 🔍",
        analyzing: "கார்ட்டூன் விளக்கம் மற்றும் வினாடி-வினா தயாராகிறது... 🎨",
        complete: "முடிந்தது! கார்ட்டூன் நண்பர் வந்துவிட்டார்! 🎉",
        error: "மன்னிக்கவும்! இந்தப் படத்தில் ஏதோ சிக்கல் ஏற்பட்டது.",
      }
    : {
        scanning: "Scanning your picture... 🔍",
        analyzing: "Identifying objects, animals, and plants... 🎨",
        complete: "All Done! Here is what EduToon AI found! 🎉",
        error: "Oh no! Toony had trouble with this picture.",
      };

  return (
    <div className="min-h-full flex flex-col justify-between p-4 pb-6 overflow-y-auto space-y-4 bg-transparent">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2">
        <motion.button
          id="processing-back-button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            playBubblePop(soundEnabled);
            onNavigate('home');
          }}
          className="px-3.5 py-2 rounded-2xl bg-white border-2 border-amber-300 text-amber-900 font-extrabold text-sm flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Home</span>
        </motion.button>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 border-2 border-purple-300 rounded-2xl text-purple-900 font-black text-xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>AI Understanding</span>
        </div>

        <div className="w-16" />
      </div>

      {/* Main Processing Presentation Card */}
      <div className="max-w-sm mx-auto w-full flex-1 flex flex-col items-center justify-center text-center">
        {/* Cartoon Mascot */}
        <div className="mb-2">
          <ToonyMascot
            size="md"
            pose={phase === 'complete' ? 'happy' : phase === 'error' ? 'curious' : 'thinking'}
            showSpeechBubble={true}
            speechText={messages[phase]}
          />
        </div>

        {/* Scanned Image Container with Animated Cartoon Scanner Line */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border-4 border-amber-400 shadow-xl bg-transparent flex items-center justify-center">
          {image ? (
            <img
              src={image}
              alt="Subject for processing"
              className="max-w-full max-h-full w-auto h-auto object-contain"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50 text-amber-800">
              <span className="text-5xl mb-2">🖼️</span>
              <span className="font-bold text-sm">No image loaded</span>
            </div>
          )}

          {/* Animated Cartoon Scan Line & Sparkles during scanning */}
          {phase !== 'complete' && phase !== 'error' && (
            <motion.div
              animate={{
                top: ['0%', '85%', '0%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute left-0 right-0 h-2 bg-gradient-to-r from-sky-400 via-amber-300 to-rose-400 shadow-[0_0_15px_rgba(56,189,248,0.9)] pointer-events-none"
            >
              <div className="absolute right-2 -top-3 text-lg animate-spin">✨</div>
            </motion.div>
          )}

          {/* Fun Cartoon Frame Stickers */}
          <div className="absolute top-2 left-2 text-2xl pointer-events-none">⭐</div>
          <div className="absolute top-2 right-2 text-2xl pointer-events-none">🌟</div>
          <div className="absolute bottom-2 left-2 text-2xl pointer-events-none">✨</div>
          <div className="absolute bottom-2 right-2 text-2xl pointer-events-none">🎈</div>

          {/* Completed Badge Overlay */}
          {phase === 'complete' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-emerald-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-400 border-3 border-white flex items-center justify-center text-white shadow-lg mb-2">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <span className="bg-white/95 px-3 py-1 rounded-full font-black text-emerald-900 text-xs border border-emerald-300 shadow-sm">
                Analysis Complete!
              </span>
            </motion.div>
          )}

          {/* Error Badge Overlay */}
          {phase === 'error' && (
            <div className="absolute inset-0 bg-rose-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-white">
              <AlertCircle className="w-12 h-12 text-rose-300 mb-2" />
              <p className="font-bold text-xs max-w-[200px] text-center text-rose-100">
                {errorMessage || "Couldn't reach AI service."}
              </p>
            </div>
          )}
        </div>

        {/* Progress or Error Details */}
        {phase !== 'error' ? (
          <div className="w-full max-w-xs mt-4 bg-amber-50/90 rounded-2xl p-3 border-2 border-amber-300 shadow-sm">
            <div className="flex justify-between items-center text-xs font-black text-amber-950 mb-1">
              <span>{phase === 'complete' ? 'Success!' : isLoading ? '🔍 Analyzing your picture...' : 'EduToon AI is thinking...'}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden p-0.5 border border-amber-300">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
                className="h-full bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 rounded-full"
              />
            </div>

            <p className="mt-2 text-[11px] font-bold text-slate-500">
              {phase === 'complete'
                ? 'Opening your AI Discovery Card...'
                : isLoading
                ? 'Our cartoon friend is preparing your lesson!'
                : 'Identifying objects, animals, plants, and educational details...'}
            </p>
          </div>
        ) : (
          <div className="w-full max-w-xs mt-4 bg-rose-50 rounded-2xl p-3 border-2 border-rose-300 shadow-sm text-center">
            <p className="text-xs font-bold text-rose-800 mb-2">
              Don't worry, let's try again or pick another photo!
            </p>
            <button
              onClick={() => startAnalysis()}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs cursor-pointer shadow-sm"
            >
              Try Again 🔄
            </button>
          </div>
        )}
      </div>

      {/* Bottom Action Options (Retake, Choose Another, Home) */}
      <div className="max-w-sm mx-auto w-full space-y-2 pt-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Retake Button */}
          <motion.button
            id="processing-retake-button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playBubblePop(soundEnabled);
              onRetake();
            }}
            className="py-3 px-3 rounded-2xl bg-sky-100 hover:bg-sky-200 border-2 border-sky-400 text-sky-900 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-sky-600" />
            <span>Retake Picture</span>
          </motion.button>

          {/* Choose Another Image Button */}
          <motion.button
            id="processing-choose-another-button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playBubblePop(soundEnabled);
              onChooseAnother();
            }}
            className="py-3 px-3 rounded-2xl bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-400 text-emerald-900 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <span>Choose Another</span>
          </motion.button>
        </div>

        {/* Back to Home Button */}
        <motion.button
          id="processing-home-button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            playBubblePop(soundEnabled);
            onNavigate('home');
          }}
          className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-amber-50 border-2 border-amber-300 text-amber-900 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Home className="w-4 h-4 text-amber-600" />
          <span>Back to Home Screen</span>
        </motion.button>
      </div>
    </div>
  );
};
