import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Star, Globe } from 'lucide-react';
import { ToonyMascot } from './ToonyMascot';
import { AVATAR_OPTIONS } from '../data/samples';
import { UserProfile, AppLanguage } from '../types';
import { playChime, playBubblePop } from '../utils/audio';

interface WelcomeScreenProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  userProfile,
  onUpdateProfile,
  onStart,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatar);
  const [kidName, setKidName] = useState(userProfile.name);
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>(userProfile.language || 'en');

  const isTamil = selectedLanguage === 'ta';

  const handleStartAdventure = () => {
    playChime(userProfile.soundEnabled);
    onUpdateProfile({
      name: kidName.trim() || (isTamil ? 'ஆய்வாளர்' : 'Explorer'),
      avatar: selectedAvatar,
      language: selectedLanguage,
    });
    onStart();
  };

  const handleSelectAvatar = (emoji: string) => {
    playBubblePop(userProfile.soundEnabled);
    setSelectedAvatar(emoji);
  };

  const handleSelectLang = (lang: AppLanguage) => {
    playBubblePop(userProfile.soundEnabled);
    setSelectedLanguage(lang);
    onUpdateProfile({ language: lang });
  };

  return (
    <div className="relative min-h-full flex flex-col justify-between p-4 sm:p-6 overflow-y-auto text-center">
      {/* Playful Floating Background Stars and Clouds */}
      <div className="absolute top-4 left-4 text-yellow-400 animate-bounce-slow text-2xl select-none pointer-events-none">
        ⭐
      </div>
      <div className="absolute top-12 right-6 text-pink-400 animate-float text-3xl select-none pointer-events-none">
        ✨
      </div>
      <div className="absolute top-36 left-8 text-sky-400 animate-pulse-glow text-xl select-none pointer-events-none">
        🎨
      </div>
      <div className="absolute top-48 right-10 text-amber-400 animate-bounce-slow text-2xl select-none pointer-events-none">
        🌟
      </div>

      {/* Header with App Title */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="pt-4 z-10"
      >
        {/* Playful App Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-200 border-2 border-amber-400 text-amber-900 font-extrabold text-xs sm:text-sm shadow-sm mb-3">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>{isTamil ? 'சுட்டி குழந்தைகளுக்கான கல்வி ஆப்!' : 'For Little Explorers & Curious Minds!'}</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-amber-950 flex items-center justify-center gap-2 drop-shadow-sm">
          EduToon
          <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent underline decoration-wavy decoration-yellow-400">
            AI
          </span>
        </h1>
        <p className="mt-2 text-slate-700 font-bold text-base sm:text-lg max-w-xs mx-auto leading-tight">
          {isTamil
            ? 'புகைப்படம் எடுங்கள், சுவாரசியங்களைக் கற்று மகிழுங்கள்! 🎈'
            : 'Snap photos, discover wondrous things, and have fun! 🎈'}
        </p>

        {/* Quick Language Toggle on Welcome Screen */}
        <div className="mt-3 inline-flex items-center p-1 rounded-2xl bg-white/90 border-2 border-amber-300 shadow-xs">
          <button
            onClick={() => handleSelectLang('en')}
            className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedLanguage === 'en'
                ? 'bg-amber-400 text-amber-950 shadow-xs scale-105'
                : 'text-slate-600 hover:text-amber-900'
            }`}
          >
            <span>🇬🇧</span>
            <span>English</span>
          </button>
          <button
            onClick={() => handleSelectLang('ta')}
            className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedLanguage === 'ta'
                ? 'bg-amber-400 text-amber-950 shadow-xs scale-105'
                : 'text-slate-600 hover:text-amber-900'
            }`}
          >
            <span>🇮🇳</span>
            <span>தமிழ் (Tamil)</span>
          </button>
        </div>
      </motion.div>

      {/* Center Cartoon Mascot Card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
        className="my-4 z-10 flex flex-col items-center"
      >
        <ToonyMascot
          size="lg"
          pose="waving"
          showSpeechBubble={true}
          speechText={
            isTamil
              ? 'வரவேற்கிறோம்! நண்பனைத் தேர்ந்தெடுத்து விளையாடலாம்! 🎉'
              : "Welcome! Tap a buddy and let's go on an adventure! 🎉"
          }
        />

        {/* Child Avatar Selector */}
        <div className="mt-4 w-full max-w-xs bg-white/90 backdrop-blur-sm rounded-3xl p-3 border-3 border-amber-300 shadow-md">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />{' '}
              {isTamil ? 'உன் நண்பனைத் தேர்ந்தெடு:' : 'Pick Your Buddy:'}
            </span>
            <span className="text-xs text-slate-500 font-bold">{isTamil ? 'தொடு!' : 'Tap one!'}</span>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {AVATAR_OPTIONS.map((item) => (
              <motion.button
                key={item.id}
                id={`avatar-choice-${item.id}`}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSelectAvatar(item.emoji)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all cursor-pointer border-2 ${
                  selectedAvatar === item.emoji
                    ? 'bg-amber-400 border-amber-600 scale-110 shadow-[0_3px_0_#d97706]'
                    : 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                }`}
                title={item.label}
              >
                {item.emoji}
              </motion.button>
            ))}
          </div>

          {/* Optional Kid Name Input */}
          <div className="mt-3">
            <input
              type="text"
              id="welcome-kid-name-input"
              value={kidName}
              onChange={(e) => setKidName(e.target.value)}
              placeholder={isTamil ? 'உன் பெயர் என்ன? (எ.கா: கதிர்)' : 'What is your name? (e.g. Leo)'}
              maxLength={18}
              className="w-full text-center py-2 px-3 bg-amber-50/70 border-2 border-amber-300 rounded-xl font-bold text-amber-950 placeholder:text-amber-400 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* Big Tactile Start Button */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, type: 'spring' }}
        className="pb-4 z-10 w-full max-w-xs mx-auto"
      >
        <motion.button
          id="welcome-start-button"
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.94, y: 3 }}
          onClick={handleStartAdventure}
          className="w-full py-4 px-6 rounded-3xl bg-gradient-to-b from-amber-400 to-amber-500 border-3 border-amber-600 text-amber-950 font-black text-xl shadow-[0_8px_0_#b45309] active:shadow-[0_2px_0_#b45309] flex items-center justify-center gap-3 transition-transform cursor-pointer"
        >
          <span>{isTamil ? 'விளையாடி மகிழ்வோம்!' : "Let's Play & Learn!"}</span>
          <ArrowRight className="w-6 h-6 stroke-[3]" />
        </motion.button>

        <p className="text-xs text-slate-500 font-bold mt-2.5">
          {isTamil ? 'பாதுகாப்பானது • குழந்தைகளுக்கான எளிய அமைப்பு' : 'Safe & Kid-Friendly • Simple Tap Navigation'}
        </p>
      </motion.div>
    </div>
  );
};
