import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Volume2, Globe, Sparkles } from 'lucide-react';
import { AppLanguage, ScreenType } from '../types';
import { ToonyMascot } from './ToonyMascot';
import { playBubblePop, playCorrectChime } from '../utils/audio';

interface LanguageScreenProps {
  currentLanguage: AppLanguage;
  soundEnabled: boolean;
  onSelectLanguage: (lang: AppLanguage) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const LanguageScreen: React.FC<LanguageScreenProps> = ({
  currentLanguage,
  soundEnabled,
  onSelectLanguage,
  onNavigate,
}) => {
  const handleTestVoice = (lang: AppLanguage, sampleText: string) => {
    if (!soundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sampleText);
      utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-US';
      utterance.rate = lang === 'ta' ? 0.88 : 0.92;
      utterance.pitch = 1.15;

      const voices = window.speechSynthesis.getVoices();
      if (lang === 'ta') {
        const tamilVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith('ta') ||
            v.name.toLowerCase().includes('tamil') ||
            v.name.includes('தமிழ்')
        );
        if (tamilVoice) utterance.voice = tamilVoice;
      } else {
        const enVoice = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech test failed:', e);
    }
  };

  const languages: {
    id: AppLanguage;
    name: string;
    nativeName: string;
    flag: string;
    badge: string;
    sample: string;
    description: string;
    color: string;
    border: string;
    bgSelected: string;
  }[] = [
    {
      id: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇬🇧',
      badge: 'Default',
      sample: 'Hello little explorer! Let us learn with fun cartoons!',
      description: 'Simple, child-friendly English explanations, voices, and quizzes.',
      color: 'from-sky-400 to-blue-500',
      border: 'border-sky-300',
      bgSelected: 'bg-sky-50 border-sky-500 ring-4 ring-sky-200',
    },
    {
      id: 'ta',
      name: 'Tamil',
      nativeName: 'தமிழ்',
      flag: '🇮🇳',
      badge: 'தமிழ் குரல்',
      sample: 'வணக்கம் குட்டி நண்பா! கார்ட்டூன் நண்பர்களுடன் சேர்ந்து கற்றுக்கொள்வோம்!',
      description: 'குழந்தைகளுக்கான எளிய தமிழ் விளக்கம், கார்ட்டூன் பேச்சு மற்றும் வினாடி-வினா.',
      color: 'from-amber-400 to-orange-500',
      border: 'border-amber-300',
      bgSelected: 'bg-amber-50 border-amber-500 ring-4 ring-amber-200',
    },
  ];

  return (
    <div className="min-h-full flex flex-col justify-between p-4 pb-6 overflow-y-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            playBubblePop(soundEnabled);
            onNavigate('home');
          }}
          className="p-2.5 rounded-2xl bg-white border-2 border-amber-200 text-amber-950 hover:bg-amber-50 shadow-xs cursor-pointer flex items-center gap-1.5 font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-amber-200 text-amber-950 text-xs font-black shadow-2xs">
          <Globe className="w-3.5 h-3.5 text-amber-600" />
          <span>Language / மொழி</span>
        </div>
      </div>

      {/* Mascot & Intro */}
      <div className="flex flex-col items-center text-center space-y-2 pt-1">
        <ToonyMascot
          size="md"
          pose="happy"
          speechText={
            currentLanguage === 'ta'
              ? 'உங்கள் மொழியைத் தேர்ந்தெடுங்கள்! 🗣️✨'
              : 'Choose your learning language! 🗣️✨'
          }
        />
        <h2 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight">
          {currentLanguage === 'ta' ? 'மொழி தேர்வு (Language)' : 'Select App Language'}
        </h2>
        <p className="text-xs sm:text-sm font-bold text-amber-800 max-w-xs">
          {currentLanguage === 'ta'
            ? 'கார்ட்டூன் விளக்கங்கள், குரல் மற்றும் வினாடி-வினா இந்த மொழியில் இருக்கும்.'
            : 'Cartoon explanations, character voices, quizzes, and subtitles will use this language.'}
        </p>
      </div>

      {/* Language Selection Cards */}
      <div className="space-y-3.5 max-w-md mx-auto w-full">
        {languages.map((item) => {
          const isSelected = currentLanguage === item.id;
          return (
            <motion.div
              key={item.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                playCorrectChime(soundEnabled);
                onSelectLanguage(item.id);
              }}
              className={`p-4 rounded-3xl border-3 transition-all cursor-pointer shadow-sm relative ${
                isSelected
                  ? item.bgSelected
                  : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Flag and Titles */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl p-2 rounded-2xl bg-white shadow-2xs border border-slate-100 shrink-0">
                    {item.flag}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        {item.name}
                      </h3>
                      <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        {item.nativeName}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-600 mt-0.5 leading-snug">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Selection Radio Circle */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {/* Sample Voice Test Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-500 italic truncate">
                  "{item.sample}"
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playBubblePop(soundEnabled);
                    handleTestVoice(item.id, item.sample);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 font-black text-[11px] text-amber-900 flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer"
                  title="Listen to sample voice"
                >
                  <Volume2 className="w-3 h-3 text-amber-600" />
                  <span>Listen / கேள்</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Confirmation & Continue Button */}
      <div className="pt-2 max-w-md mx-auto w-full">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            playBubblePop(soundEnabled);
            onNavigate('home');
          }}
          className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 font-black text-amber-950 text-base shadow-[0_4px_0_#d97706] flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-amber-800" />
          <span>
            {currentLanguage === 'ta'
              ? 'சேமித்து தொடரவும் (Continue)'
              : 'Save & Start Exploring'}
          </span>
        </motion.button>
      </div>
    </div>
  );
};
