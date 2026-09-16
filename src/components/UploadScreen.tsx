import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Upload, ArrowLeft, Trash2, Camera, Sparkles, CheckCircle2, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { ScreenType, SampleImage } from '../types';
import { SAMPLE_CHILDREN_IMAGES } from '../data/samples';
import { playBubblePop, playChime } from '../utils/audio';

interface UploadScreenProps {
  soundEnabled: boolean;
  onNavigate: (screen: ScreenType) => void;
  activeImage: string | null;
  onSelectImage: (url: string) => void;
  onContinueToProcessing: (url: string) => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({
  soundEnabled,
  onNavigate,
  activeImage,
  onSelectImage,
  onContinueToProcessing,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(activeImage);
  const [selectedTitle, setSelectedTitle] = useState<string>('Selected Picture');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (activeImage) {
      setSelectedPhoto(activeImage);
    }
  }, [activeImage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
      if (!supportedTypes.includes(file.type)) {
        setUploadError('Please choose a JPEG, PNG, WEBP, GIF, HEIC, or HEIF picture.');
        e.target.value = '';
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setUploadError('This picture is too large. Please choose one smaller than 20 MB.');
        e.target.value = '';
        return;
      }

      setUploadError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setSelectedPhoto(result);
          setSelectedTitle(file.name.replace(/\.[^/.]+$/, ''));
          onSelectImage(result);
          playChime(soundEnabled);
        }
      };
      reader.onerror = () => setUploadError('We could not read that picture. Please choose it again.');
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample: SampleImage) => {
    setUploadError(null);
    playBubblePop(soundEnabled);
    setSelectedPhoto(sample.imageUrl);
    setSelectedTitle(sample.title);
    onSelectImage(sample.imageUrl);
  };

  const handleClear = () => {
    playBubblePop(soundEnabled);
    setSelectedPhoto(null);
    setSelectedTitle('');
    setUploadError(null);
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-4 pb-6 overflow-y-auto space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2">
        <motion.button
          id="upload-back-button"
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

        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border-2 border-emerald-300 rounded-2xl text-emerald-900 font-black text-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Pictures & Upload</span>
        </div>

        {selectedPhoto && (
          <motion.button
            id="upload-clear-button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClear}
            className="w-10 h-10 rounded-2xl bg-rose-100 hover:bg-rose-200 border-2 border-rose-300 flex items-center justify-center text-rose-700 cursor-pointer shadow-sm"
            title="Clear picture"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Main Content Area: Selected Picture Preview OR Big Upload Zone */}
      {selectedPhoto ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-transparent rounded-3xl p-4 border-4 border-emerald-400 shadow-md text-center flex flex-col items-center max-w-sm mx-auto w-full"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs mb-2 border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{selectedTitle}</span>
          </div>

          {/* Picture in Cute Wooden / Rainbow Cartoon Frame */}
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-4 border-amber-300 shadow-inner bg-transparent flex items-center justify-center">
            <img
              src={selectedPhoto}
              alt="Selected for EduToon"
              className="max-w-full max-h-full w-auto h-auto object-contain"
            />
            {/* Cute Frame Badges */}
            <div className="absolute top-2 left-2 text-2xl">⭐</div>
            <div className="absolute top-2 right-2 text-2xl">🎈</div>
            <div className="absolute bottom-2 right-2 text-2xl">✨</div>
          </div>

          <p className="mt-3 text-xs text-slate-600 font-bold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            🎉 Great picture loaded! Ready for exploration.
          </p>

          {/* Action buttons: Continue, Retake, and Choose Another */}
          <div className="mt-4 w-full space-y-2.5">
            {/* Primary Continue Button */}
            <motion.button
              id="upload-continue-button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.96, y: 2 }}
              onClick={() => {
                playChime(soundEnabled);
                if (selectedPhoto) {
                  onContinueToProcessing(selectedPhoto);
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
                id="upload-retake-button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playBubblePop(soundEnabled);
                  onNavigate('camera');
                }}
                className="py-2.5 px-3 rounded-2xl bg-sky-100 hover:bg-sky-200 border-2 border-sky-400 text-sky-900 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Camera className="w-4 h-4 text-sky-600" />
                <span>Retake</span>
              </motion.button>

              <motion.button
                id="upload-choose-another-button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-800 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Upload className="w-4 h-4 text-slate-600" />
                <span>Choose Another</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Big Cartoon Upload Card */
        <div className="max-w-sm mx-auto w-full">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="p-6 rounded-3xl border-3 border-dashed border-emerald-400 bg-emerald-50/70 hover:bg-emerald-100/70 flex flex-col items-center text-center cursor-pointer transition-colors shadow-sm"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-400 border-2 border-emerald-600 flex items-center justify-center text-white shadow-[0_4px_0_#059669] mb-3">
              <Upload className="w-8 h-8 stroke-[2.5]" />
            </div>

            <h3 className="text-xl font-black text-emerald-950">
              Upload Any Picture!
            </h3>
            <p className="text-xs text-emerald-800 font-bold mt-1">
              Tap here to choose a photo from your phone, tablet, or computer.
            </p>

            <span className="mt-3 px-4 py-2 rounded-2xl bg-emerald-500 text-white font-black text-xs shadow-sm inline-flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Select Photo File
            </span>
          </motion.div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
        id="file-upload-input"
      />

      {uploadError && (
        <p role="alert" className="max-w-sm mx-auto w-full rounded-xl border-2 border-rose-300 bg-rose-50 p-3 text-center text-xs font-bold text-rose-800">
          {uploadError}
        </p>
      )}

      {/* Child-Friendly One-Tap Sample Photo Tray */}
      <div className="max-w-sm mx-auto w-full">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wide flex items-center gap-1">
            <span>✨</span> Or Tap a Sample Picture:
          </span>
          <span className="text-[11px] font-bold text-slate-500">
            Instant Test Images
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {SAMPLE_CHILDREN_IMAGES.map((sample) => (
            <motion.button
              key={sample.id}
              id={`sample-image-${sample.id}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectSample(sample)}
              className="flex flex-col items-center p-2 rounded-2xl bg-white border-2 border-amber-300 hover:border-emerald-400 shadow-sm cursor-pointer transition-all text-center"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden mb-1.5 bg-slate-100">
                <img
                  src={sample.imageUrl}
                  alt={sample.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="text-xs font-black text-slate-800 truncate w-full">
                {sample.emoji} {sample.title.split(' ')[0]}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
