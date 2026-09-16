import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Camera, RefreshCw, ArrowLeft, Sparkles, Check, SwitchCamera, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { ScreenType } from '../types';
import { playCameraClick, playChime, playBubblePop } from '../utils/audio';

interface CameraScreenProps {
  soundEnabled: boolean;
  onNavigate: (screen: ScreenType) => void;
  onPhotoCaptured?: (dataUrl: string) => void;
  onContinueToProcessing: (dataUrl: string) => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({
  soundEnabled,
  onNavigate,
  onPhotoCaptured,
  onContinueToProcessing,
}) => {
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'none' | 'stars' | 'bear' | 'rainbow'>('stars');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera
  useEffect(() => {
    let isMounted = true;

    async function setupCamera() {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: facingMode,
              width: { ideal: 640 },
              height: { ideal: 640 },
            },
            audio: false,
          });

          if (isMounted) {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => {});
            }
            setHasCameraAccess(true);
          }
        } else {
          if (isMounted) setHasCameraAccess(false);
        }
      } catch (err) {
        console.warn('Camera access not granted or unavailable, using simulation viewfinder:', err);
        if (isMounted) setHasCameraAccess(false);
      }
    }

    if (!capturedImage) {
      setupCamera();
    }

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode, capturedImage]);

  const handleCapture = () => {
    playCameraClick(soundEnabled);

    if (hasCameraAccess && videoRef.current) {
      // Capture from real video
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 640;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (facingMode === 'user') {
            // Mirror image for front camera
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedImage(dataUrl);
          if (onPhotoCaptured) onPhotoCaptured(dataUrl);
          playChime(soundEnabled);
          return;
        }
      } catch (e) {
        console.warn('Capture canvas error:', e);
      }
    }

    // Fallback simulation photo capture (for environments without physical camera)
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw colorful cheerful simulation graphic
      ctx.fillStyle = '#FEF3C7';
      ctx.fillRect(0, 0, 500, 500);

      // Cute sunflower / apple illustration
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(250, 260, 140, 0, Math.PI * 2);
      ctx.fill();

      // Leaf
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.ellipse(280, 110, 50, 25, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Stem
      ctx.fillStyle = '#78350F';
      ctx.fillRect(242, 90, 16, 50);

      const simUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(simUrl);
      if (onPhotoCaptured) onPhotoCaptured(simUrl);
      playChime(soundEnabled);
    }
  };

  const handleRetake = () => {
    playBubblePop(soundEnabled);
    setCapturedImage(null);
  };

  const toggleCameraFacing = () => {
    playBubblePop(soundEnabled);
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-4 pb-6 overflow-y-auto">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <motion.button
          id="camera-back-button"
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

        <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-100 border-2 border-sky-300 rounded-2xl text-sky-900 font-black text-xs">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>EduToon Camera</span>
        </div>

        {/* Flip Camera Button */}
        {!capturedImage && hasCameraAccess && (
          <motion.button
            id="camera-flip-button"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleCameraFacing}
            title="Switch front/back camera"
            className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-300 flex items-center justify-center text-slate-700 cursor-pointer shadow-sm"
          >
            <SwitchCamera className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Main Viewfinder / Captured Image Display */}
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-[340px] max-w-sm mx-auto w-full">
        {capturedImage ? (
          /* Captured Image Success Screen */
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full bg-transparent rounded-3xl p-4 border-4 border-amber-400 shadow-lg text-center flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs mb-3 border border-emerald-300">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>Great Picture Captured! 🎉</span>
            </div>

            <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-3 border-amber-300 shadow-inner bg-transparent flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Captured EduToon"
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
              {/* Fun Cartoon Frame Overlay */}
              <div className="absolute top-2 left-2 text-2xl">⭐</div>
              <div className="absolute top-2 right-2 text-2xl">✨</div>
              <div className="absolute bottom-2 left-2 text-2xl">🌟</div>
              <div className="absolute bottom-2 right-2 text-2xl">🎈</div>
            </div>

            {/* Action buttons: Retake, Choose Another Image, and Continue */}
            <div className="mt-4 w-full space-y-2.5">
              {/* Primary Continue Button */}
              <motion.button
                id="camera-continue-button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.96, y: 2 }}
                onClick={() => {
                  playChime(soundEnabled);
                  if (capturedImage) {
                    onContinueToProcessing(capturedImage);
                  }
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-3 border-emerald-600 text-white font-black text-base flex items-center justify-center gap-2 cursor-pointer shadow-[0_5px_0_#047857] active:shadow-none"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </motion.button>

              {/* Secondary Options: Retake & Choose Another Image */}
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  id="camera-retake-button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRetake}
                  className="py-2.5 px-3 rounded-2xl bg-sky-100 hover:bg-sky-200 border-2 border-sky-400 text-sky-900 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-4 h-4 text-sky-600" />
                  <span>Retake</span>
                </motion.button>

                <motion.button
                  id="camera-choose-another-button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    playBubblePop(soundEnabled);
                    onNavigate('upload');
                  }}
                  className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-800 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <ImageIcon className="w-4 h-4 text-slate-600" />
                  <span>Choose Another</span>
                </motion.button>
              </div>
            </div>

            <p className="mt-3 text-xs text-amber-800 font-bold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              💡 Ready for EduToon AI exploration!
            </p>
          </motion.div>
        ) : (
          /* Live Camera Viewfinder */
          <div className="relative w-full aspect-square max-w-[340px] rounded-3xl overflow-hidden border-4 border-sky-400 bg-slate-900 shadow-xl flex items-center justify-center">
            {hasCameraAccess ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />
            ) : (
              /* Playful Simulation Viewfinder if physical camera unavailable */
              <div className="w-full h-full bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100 flex flex-col items-center justify-center p-6 text-center relative">
                <div className="text-6xl mb-2 animate-bounce-slow">🍎</div>
                <div className="font-black text-sky-950 text-base">
                  Interactive Viewfinder Ready!
                </div>
                <p className="text-xs text-sky-800 font-bold mt-1 max-w-[200px]">
                  Point at toys, fruits, or pets and tap the big button below!
                </p>
                <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-white/80 text-sky-700 font-bold text-[10px] border border-sky-300">
                  {hasCameraAccess === false ? '📷 Simulator Mode Active' : 'Loading lens...'}
                </span>
              </div>
            )}

            {/* Viewfinder Target Reticle / Cartoon Crosshairs */}
            <div className="absolute inset-8 pointer-events-none border-2 border-white/40 border-dashed rounded-2xl flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-white/70 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              </div>

              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-yellow-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-yellow-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-yellow-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-yellow-400 rounded-br-lg" />
            </div>

            {/* Fun Cartoon Frame Filter Stickers */}
            {activeFilter === 'stars' && (
              <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between">
                <div className="flex justify-between text-2xl">
                  <span>⭐</span>
                  <span>🌟</span>
                </div>
                <div className="flex justify-between text-2xl">
                  <span>✨</span>
                  <span>💫</span>
                </div>
              </div>
            )}
            {activeFilter === 'bear' && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none text-4xl">
                🐻
              </div>
            )}
            {activeFilter === 'rainbow' && (
              <div className="absolute top-2 right-2 pointer-events-none text-3xl">
                🌈
              </div>
            )}
          </div>
        )}
      </div>

      {/* Viewfinder Filters / Stickers Toolbar */}
      {!capturedImage && (
        <div className="my-3 flex items-center justify-center gap-2">
          <span className="text-xs font-black text-slate-600 mr-1">Frame:</span>
          {(['stars', 'bear', 'rainbow', 'none'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                playBubblePop(soundEnabled);
                setActiveFilter(filter);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold border-2 cursor-pointer transition-all ${
                activeFilter === filter
                  ? 'bg-amber-400 border-amber-600 text-amber-950 scale-105 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {filter === 'stars' && '⭐ Stars'}
              {filter === 'bear' && '🐻 Bear'}
              {filter === 'rainbow' && '🌈 Rainbow'}
              {filter === 'none' && 'Plain'}
            </button>
          ))}
        </div>
      )}

      {/* Shutter Button Bar (Large, Tactile, Colorful) */}
      {!capturedImage && (
        <div className="flex flex-col items-center justify-center pt-2">
          <motion.button
            id="camera-shutter-button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9, y: 4 }}
            onClick={handleCapture}
            aria-label="Take Photo"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-sky-400 to-sky-600 border-4 border-white shadow-[0_8px_0_#0369a1] active:shadow-[0_2px_0_#0369a1] flex items-center justify-center cursor-pointer relative"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-3 border-sky-100 flex items-center justify-center bg-white/20">
              <Camera className="w-8 h-8 sm:w-9 sm:h-9 text-white stroke-[2.5]" />
            </div>
          </motion.button>
          <span className="mt-2 text-xs font-black text-sky-900 bg-sky-100 px-3 py-0.5 rounded-full border border-sky-300">
            Tap Big Button to Snap! 📸
          </span>
        </div>
      )}
    </div>
  );
};
