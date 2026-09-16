import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, ImagePlus, Settings, Volume2, VolumeX, Sparkles, Star, ChevronRight, Globe, ShieldCheck, Lock } from 'lucide-react';
import { ScreenType, UserProfile, ActivityCategory } from '../types';
import { LEARNING_CATEGORIES } from '../data/samples';
import { ToonyMascot } from './ToonyMascot';
import { playBubblePop, playChime } from '../utils/audio';

interface HomeScreenProps {
  userProfile: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  onToggleSound: () => void;
  onRequestParentMode?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  onNavigate,
  onToggleSound,
  onRequestParentMode,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | null>(null);
  const isTamil = userProfile.language === 'ta';

  const handleCameraClick = () => {
    playChime(userProfile.soundEnabled);
    onNavigate('camera');
  };

  const handleUploadClick = () => {
    playChime(userProfile.soundEnabled);
    onNavigate('upload');
  };

  const handleSettingsClick = () => {
    playBubblePop(userProfile.soundEnabled);
    onNavigate('settings');
  };

  const handleLanguageClick = () => {
    playBubblePop(userProfile.soundEnabled);
    onNavigate('language');
  };

  const handleCategorySelect = (cat: ActivityCategory) => {
    playBubblePop(userProfile.soundEnabled);
    setSelectedCategory(selectedCategory?.id === cat.id ? null : cat);
  };

  return (
    <div className="min-h-full flex flex-col p-4 sm:p-5 overflow-y-auto pb-6 space-y-4">
      {/* Top Header Bar with Avatar, Greeting, Language, Sound, and Settings Button */}
      <div className="flex items-center justify-between gap-2 bg-white/90 backdrop-blur-sm p-3 rounded-3xl border-3 border-amber-300 shadow-sm">
        {/* Left: Avatar & Kid Greeting */}
        <div className="flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-2xl shadow-inner">
            {userProfile.avatar}
          </div>
          <div>
            <div className="text-xs font-black text-amber-700 uppercase tracking-wide">
              {isTamil ? 'ஆய்வாளர்' : 'Explorer'}
            </div>
            <div className="text-lg font-black text-slate-800 leading-none flex items-center gap-1">
              {isTamil ? `வணக்கம், ${userProfile.name}! 👋` : `Hi, ${userProfile.name}! 👋`}
            </div>
          </div>
        </div>

        {/* Right: Quick Stars + Language + Audio Toggle + Settings Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Star Counter */}
          <div className="flex items-center gap-1 bg-amber-100 border-2 border-amber-300 px-2 sm:px-2.5 py-1 rounded-2xl">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="font-black text-amber-900 text-xs sm:text-sm">
              {userProfile.starsCollected}
            </span>
          </div>

          {/* Quick Language Switcher Button */}
          <motion.button
            id="home-language-button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleLanguageClick}
            aria-label="Change Language"
            className="h-10 px-2.5 rounded-2xl bg-teal-100 hover:bg-teal-200 border-2 border-teal-400 flex items-center gap-1 text-teal-950 font-black text-xs cursor-pointer shadow-xs"
          >
            <Globe className="w-4 h-4 text-teal-700" />
            <span>{isTamil ? 'தமிழ்' : 'EN'}</span>
          </motion.button>

          {/* Sound Mute Toggle */}
          <motion.button
            id="home-sound-toggle"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleSound}
            aria-label={userProfile.soundEnabled ? 'Mute sound' : 'Enable sound'}
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-slate-700 cursor-pointer"
          >
            {userProfile.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-amber-600" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
          </motion.button>

          {/* Parent Zone Quick Access (Lock Icon) */}
          {onRequestParentMode && (
            <motion.button
              id="home-parent-zone-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playBubblePop(userProfile.soundEnabled);
                onRequestParentMode();
              }}
              aria-label="Parent Zone"
              title="Parent Dashboard (Protected)"
              className="h-10 px-2 sm:px-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 flex items-center gap-1 text-amber-900 font-extrabold text-xs cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span className="hidden sm:inline font-black text-[11px]">
                {isTamil ? 'பெற்றோர் 🔒' : 'Parents 🔒'}
              </span>
            </motion.button>
          )}

          {/* Settings Button (Top Quick Access) */}
          <motion.button
            id="home-settings-button"
            whileHover={{ scale: 1.1, rotate: 20 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSettingsClick}
            aria-label="Open Settings"
            className="w-10 h-10 rounded-2xl bg-purple-100 hover:bg-purple-200 border-2 border-purple-400 flex items-center justify-center text-purple-700 cursor-pointer shadow-sm"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Cheerful Mascot Speech Banner */}
      <div className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 border-3 border-amber-400 rounded-3xl p-4 shadow-sm relative overflow-hidden flex items-center justify-between">
        <div className="max-w-[70%] z-10">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 border border-amber-300 text-amber-900 font-extrabold text-xs mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            {isTamil ? 'இன்றைய இலக்கு!' : "Today's Mission!"}
          </div>
          <h2 className="text-lg font-black text-amber-950 leading-tight">
            {isTamil ? 'மஞ்சள் அல்லது மென்மையான ஒன்றை கண்டறியுங்கள்!' : 'Find something yellow or furry!'}
          </h2>
          <p className="text-xs text-amber-800 font-bold mt-1">
            {isTamil
              ? 'கேமரா அல்லது பதிவேற்றத்தைத் தட்டி உங்கள் ஆய்வைத் தொடங்குங்கள்!'
              : 'Tap Camera or Upload to start your discovery!'}
          </p>
        </div>
        <div className="relative -mr-2">
          <ToonyMascot size="sm" pose="happy" />
        </div>
      </div>

      {/* Hero Buttons: Camera & Upload Image (Big, Tactile, Cartoon) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* CAMERA BUTTON */}
        <motion.button
          id="hero-camera-button"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.95, y: 3 }}
          onClick={handleCameraClick}
          className="group relative flex flex-col items-center justify-center p-5 rounded-3xl bg-gradient-to-b from-sky-400 to-sky-500 border-3 border-sky-600 shadow-[0_8px_0_#0284c7] active:shadow-[0_2px_0_#0284c7] text-white cursor-pointer transition-all overflow-hidden"
        >
          {/* Sparkle background element */}
          <div className="absolute top-2 right-3 text-sky-200 text-xl pointer-events-none">✨</div>
          <div className="absolute bottom-2 left-3 text-sky-200 text-lg pointer-events-none">⭐</div>

          <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/50 flex items-center justify-center mb-3 shadow-inner group-hover:rotate-6 transition-transform">
            <Camera className="w-9 h-9 text-white stroke-[2.5]" />
          </div>

          <span className="text-2xl font-black text-white tracking-wide drop-shadow-sm">
            {isTamil ? 'கேமரா' : 'Camera'}
          </span>
          <span className="text-xs font-extrabold text-sky-100 mt-1 bg-sky-600/50 px-3 py-1 rounded-full border border-sky-300/40">
            {isTamil ? 'படம் பிடிக்கவும்! 📸' : 'Snap a Photo! 📸'}
          </span>
        </motion.button>

        {/* UPLOAD IMAGE BUTTON */}
        <motion.button
          id="hero-upload-button"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.95, y: 3 }}
          onClick={handleUploadClick}
          className="group relative flex flex-col items-center justify-center p-5 rounded-3xl bg-gradient-to-b from-emerald-400 to-emerald-500 border-3 border-emerald-600 shadow-[0_8px_0_#059669] active:shadow-[0_2px_0_#059669] text-white cursor-pointer transition-all overflow-hidden"
        >
          {/* Sparkle background element */}
          <div className="absolute top-2 right-3 text-emerald-200 text-xl pointer-events-none">🎨</div>
          <div className="absolute bottom-2 left-3 text-emerald-200 text-lg pointer-events-none">✨</div>

          <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/50 flex items-center justify-center mb-3 shadow-inner group-hover:-rotate-6 transition-transform">
            <ImagePlus className="w-9 h-9 text-white stroke-[2.5]" />
          </div>

          <span className="text-2xl font-black text-white tracking-wide drop-shadow-sm">
            {isTamil ? 'படம் ஏற்று' : 'Upload Image'}
          </span>
          <span className="text-xs font-extrabold text-emerald-100 mt-1 bg-emerald-600/50 px-3 py-1 rounded-full border border-emerald-300/40">
            {isTamil ? 'ஒரு படத்தைத் தேர்வு செய்! 🖼️' : 'Choose a Picture! 🖼️'}
          </span>
        </motion.button>
      </div>

      {/* Language Selection Card Link */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLanguageClick}
        className="p-3.5 rounded-2xl bg-teal-50 hover:bg-teal-100 border-2 border-teal-300 flex items-center justify-between cursor-pointer transition-colors shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-200 border border-teal-400 flex items-center justify-center text-teal-800">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-teal-950 flex items-center gap-2">
              <span>{isTamil ? 'மொழித் தேர்வு (Language)' : 'Language Selection'}</span>
              <span className="px-2 py-0.5 rounded-full bg-teal-200 text-[10px] font-extrabold text-teal-900">
                {isTamil ? 'தமிழ் (Tamil)' : 'English'}
              </span>
            </div>
            <div className="text-xs font-bold text-teal-700">
              {isTamil
                ? 'தமிழ் மற்றும் ஆங்கிலம் இடையே மொழியை மாற்றவும்'
                : 'Switch between English and Tamil for speech & quiz'}
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-teal-600" />
      </motion.div>

      {/* Educational Theme Cards: "Things to Learn & Find" */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🌟</span>
            <h3 className="text-base font-black text-slate-800">
              {isTamil ? 'ஆராய்ச்சி தலைப்புகள்' : 'Fun Discovery Topics'}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {isTamil ? 'ஆராய்வோம்' : 'Tap to explore'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {LEARNING_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory?.id === cat.id;
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategorySelect(cat)}
                className={`p-3 rounded-2xl border-3 flex flex-col items-center text-center transition-all cursor-pointer ${
                  isSelected
                    ? `${cat.color} scale-105 shadow-md ring-2 ring-amber-400`
                    : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 shadow-xs'
                }`}
              >
                <span className="text-3xl mb-1">{cat.icon}</span>
                <span className="font-black text-xs sm:text-sm text-slate-800 leading-tight">
                  {cat.title}
                </span>
                <span className="text-[10px] font-bold text-slate-500 mt-0.5">
                  {cat.sampleObjects.length} {isTamil ? 'உதாரணங்கள்' : 'items'}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Category Expansion Panel */}
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 p-4 rounded-2xl border-2 ${selectedCategory.color} shadow-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedCategory.icon}</span>
                <div>
                  <h4 className="font-black text-sm text-slate-800">
                    {selectedCategory.title}
                  </h4>
                  <p className="text-xs font-bold text-slate-600">
                    {selectedCategory.subtitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {selectedCategory.sampleObjects.map((obj) => (
                <span
                  key={obj}
                  className="px-2.5 py-1 bg-white/80 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
                >
                  ✨ {obj}
                </span>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleCameraClick}
                className="flex-1 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" /> {isTamil ? 'புகைப்படம் எடு' : `Snap ${selectedCategory.title}`}
              </button>
              <button
                onClick={handleUploadClick}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <ImagePlus className="w-3.5 h-3.5" /> {isTamil ? 'மாதிரி படங்கள்' : 'Browse Sample Photos'}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Settings Direct Shortcut Card */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSettingsClick}
        className="p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border-2 border-purple-300 flex items-center justify-between cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-200 border border-purple-400 flex items-center justify-center text-purple-700">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-purple-950">
              {isTamil ? 'அமைப்புகள் மற்றும் தோற்றங்கள்' : 'App Settings & Themes'}
            </div>
            <div className="text-xs font-bold text-purple-700">
              {isTamil ? 'நிறங்கள், படம் மற்றும் ஒலிகளை மாற்றவும்' : 'Change colors, explorer avatar & sounds'}
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-purple-500" />
      </motion.div>
    </div>
  );
};
