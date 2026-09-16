import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, MessageSquare } from 'lucide-react';
import { SpokenWord } from '../hooks/useCartoonTTS';
import { playBubblePop } from '../utils/audio';

interface CartoonSpeechPanelProps {
  characterName: string;
  role: string;
  explanation: string;
  words: SpokenWord[];
  currentWordIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  isSupported: boolean;
  soundEnabled: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReplay: () => void;
}

export const CartoonSpeechPanel: React.FC<CartoonSpeechPanelProps> = ({
  characterName,
  role,
  words,
  currentWordIndex,
  isPlaying,
  isPaused,
  isSupported,
  soundEnabled,
  onPlay,
  onPause,
  onReplay,
}) => {
  return (
    <div
      id="cartoon-explanation-box"
      className="relative w-full rounded-3xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50/70 border-3 border-amber-300 p-4 sm:p-5 shadow-[0_4px_0_#f59e0b] space-y-3.5"
    >
      {/* Cartoon Speech Bubble Pointer pointing to the character above */}
      <div className="absolute -top-3 right-1/2 md:right-1/4 translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-amber-300" />
      <div className="absolute -top-2 right-1/2 md:right-1/4 translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-b-6 border-b-amber-50" />

      {/* Top Header: Character Voice Badge + Waveform + CC Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-amber-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-400 border border-amber-500 flex items-center justify-center text-amber-950 font-black text-xs shadow-2xs">
            🎙️
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-amber-950">{characterName}</span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-200/80 px-2 py-0.5 rounded-full">
                {role}
              </span>
            </div>
            <p className="text-[11px] font-bold text-amber-800/80">Child-Friendly Audio Guide</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Waveform Animation when Speaking */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100/90 border border-amber-300">
            {isPlaying ? (
              <div className="flex items-center gap-0.5 h-3.5">
                <motion.span
                  animate={{ height: ['4px', '14px', '6px', '12px', '4px'] }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
                  className="w-1 bg-amber-600 rounded-full inline-block"
                />
                <motion.span
                  animate={{ height: ['8px', '4px', '14px', '6px', '8px'] }}
                  transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut', delay: 0.1 }}
                  className="w-1 bg-amber-500 rounded-full inline-block"
                />
                <motion.span
                  animate={{ height: ['12px', '6px', '4px', '14px', '10px'] }}
                  transition={{ repeat: Infinity, duration: 0.7, ease: 'easeInOut', delay: 0.2 }}
                  className="w-1 bg-amber-600 rounded-full inline-block"
                />
                <motion.span
                  animate={{ height: ['6px', '12px', '8px', '4px', '6px'] }}
                  transition={{ repeat: Infinity, duration: 0.55, ease: 'easeInOut', delay: 0.15 }}
                  className="w-1 bg-amber-500 rounded-full inline-block"
                />
              </div>
            ) : (
              <div className="flex items-center gap-0.5 h-3.5 opacity-40">
                <span className="w-1 h-1.5 bg-amber-800 rounded-full inline-block" />
                <span className="w-1 h-2 bg-amber-800 rounded-full inline-block" />
                <span className="w-1 h-1.5 bg-amber-800 rounded-full inline-block" />
              </div>
            )}
            <span className="text-[11px] font-black text-amber-900 ml-1">
              {isPlaying ? 'Speaking' : isPaused ? 'Paused' : 'Ready'}
            </span>
          </div>

          {/* Subtitles (CC) Badge */}
          <span className="px-2 py-0.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-extrabold text-[10px] shadow-2xs flex items-center gap-1">
            <span>CC</span>
            <span className="hidden sm:inline">Subtitles</span>
          </span>
        </div>
      </div>

      {/* Subtitles Area with Dynamic Real-Time Word Highlighting */}
      <div
        id="cartoon-subtitles-display"
        className="p-3.5 sm:p-4 rounded-2xl bg-white/90 border-2 border-amber-200/90 shadow-inner min-h-[72px] flex items-center"
      >
        <div className="w-full">
          <p className="text-base sm:text-lg font-bold text-amber-950 leading-relaxed sm:leading-loose tracking-wide">
            {words.map((w, idx) => {
              const isCurrent = isPlaying && idx === currentWordIndex;
              const isSpoken = idx < currentWordIndex || (currentWordIndex >= words.length && !isPlaying);

              return (
                <span
                  key={idx}
                  className={`inline-block mx-0.5 transition-all duration-150 ${
                    isCurrent
                      ? 'bg-gradient-to-r from-amber-300 to-yellow-300 text-amber-950 font-black px-1.5 py-0.5 rounded-lg shadow-sm scale-110 -translate-y-0.5 ring-2 ring-amber-400'
                      : isSpoken
                      ? 'text-amber-950 font-extrabold'
                      : 'text-amber-900/60 font-semibold'
                  }`}
                >
                  {w.word}
                </span>
              );
            })}
          </p>
        </div>
      </div>

      {/* Control Buttons: Play, Pause, Replay */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        {/* Playback action group */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Play Button */}
          <motion.button
            id="tts-play-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playBubblePop(soundEnabled);
              onPlay();
            }}
            disabled={isPlaying}
            className={`px-3.5 sm:px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              isPlaying
                ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 opacity-70 cursor-default'
                : 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white border-2 border-emerald-600 shadow-[0_3px_0_#047857]'
            }`}
            title="Play cartoon speech"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Play</span>
          </motion.button>

          {/* Pause Button */}
          <motion.button
            id="tts-pause-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playBubblePop(soundEnabled);
              onPause();
            }}
            disabled={!isPlaying}
            className={`px-3.5 sm:px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              !isPlaying
                ? 'bg-amber-100 text-amber-800 border-2 border-amber-300 opacity-60 cursor-default'
                : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white border-2 border-amber-600 shadow-[0_3px_0_#d97706]'
            }`}
            title="Pause cartoon speech"
          >
            <Pause className="w-4 h-4 fill-current" />
            <span>Pause</span>
          </motion.button>

          {/* Replay Button */}
          <motion.button
            id="tts-replay-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playBubblePop(soundEnabled);
              onReplay();
            }}
            className="px-3.5 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-black text-xs sm:text-sm border-2 border-sky-600 flex items-center gap-1.5 cursor-pointer shadow-[0_3px_0_#0284c7] active:shadow-none"
            title="Replay explanation from the beginning"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay</span>
          </motion.button>
        </div>

        {/* Child helper status hint */}
        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800">
          {isPlaying ? (
            <span className="text-emerald-700 font-extrabold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Listening now!
            </span>
          ) : isPaused ? (
            <span className="text-amber-700">Paused. Tap Play to continue!</span>
          ) : (
            <span className="text-slate-600">Finished! Tap Replay to hear again.</span>
          )}
        </div>
      </div>

      {/* Muted Warning if sound is disabled */}
      {!soundEnabled && (
        <div className="p-2 rounded-xl bg-amber-100/90 border border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <VolumeX className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Sound is turned off in Settings. Subtitles are still highlighted!</span>
          </div>
        </div>
      )}

      {/* Browser Speech API notice if unavailable */}
      {!isSupported && (
        <div className="p-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs">
          Text-to-speech audio is not supported on this browser, but subtitles are available above.
        </div>
      )}
    </div>
  );
};
