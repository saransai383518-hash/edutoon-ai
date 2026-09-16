import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Volume2, VolumeX, Sparkles, Heart, Smartphone, Monitor, Globe, ChevronRight, ShieldCheck, Lock } from 'lucide-react';
import { ScreenType, UserProfile, AppTheme, AppLanguage } from '../types';
import { AVATAR_OPTIONS } from '../data/samples';
import { playBubblePop, playChime } from '../utils/audio';

interface SettingsScreenProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onNavigate: (screen: ScreenType) => void;
  isMobileFrameActive: boolean;
  onToggleMobileFrame: () => void;
  onRequestParentMode?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userProfile,
  onUpdateProfile,
  onNavigate,
  isMobileFrameActive,
  onToggleMobileFrame,
  onRequestParentMode,
}) => {
  const themes: { id: AppTheme; label: string; bg: string; border: string }[] = [
    { id: 'sunshine', label: 'Sunshine', bg: 'bg-amber-100', border: 'border-amber-400' },
    { id: 'sky', label: 'Sky Blue', bg: 'bg-sky-100', border: 'border-sky-400' },
    { id: 'meadow', label: 'Meadow', bg: 'bg-emerald-100', border: 'border-emerald-400' },
    { id: 'bubblegum', label: 'Bubblegum', bg: 'bg-pink-100', border: 'border-pink-400' },
  ];

  const handleSoundToggle = () => {
    const nextSound = !userProfile.soundEnabled;
    onUpdateProfile({ soundEnabled: nextSound });
    if (nextSound) playChime(true);
  };

  const handleSelectAvatar = (emoji: string) => {
    playBubblePop(userProfile.soundEnabled);
    onUpdateProfile({ avatar: emoji });
  };

  const handleSelectTheme = (theme: AppTheme) => {
    playBubblePop(userProfile.soundEnabled);
    onUpdateProfile({ theme });
  };

  const handleSelectLanguage = (language: AppLanguage) => {
    playBubblePop(userProfile.soundEnabled);
    onUpdateProfile({ language });
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-4 pb-6 overflow-y-auto space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2">
        <motion.button
          id="settings-back-button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            playBubblePop(userProfile.soundEnabled);
            onNavigate('home');
          }}
          className="px-3.5 py-2 rounded-2xl bg-white border-2 border-amber-300 text-amber-900 font-extrabold text-sm flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Home</span>
        </motion.button>

        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-100 border-2 border-purple-300 rounded-2xl text-purple-900 font-black text-xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>App Settings</span>
        </div>

        <div className="w-16" /> {/* Balance spacer */}
      </div>

      <div className="space-y-3.5 max-w-sm mx-auto w-full">
        {/* Explorer Buddy & Name Card */}
        <div className="bg-white rounded-3xl p-4 border-3 border-amber-300 shadow-sm">
          <div className="text-xs font-black text-amber-900 uppercase tracking-wider mb-2">
            Explorer Profile
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-inner">
              {userProfile.avatar}
            </div>
            <div className="flex-1">
              <label htmlFor="settings-kid-name" className="text-xs font-bold text-slate-500">
                Explorer Name:
              </label>
              <input
                id="settings-kid-name"
                type="text"
                value={userProfile.name}
                onChange={(e) => onUpdateProfile({ name: e.target.value })}
                maxLength={20}
                className="w-full mt-0.5 py-1.5 px-3 bg-amber-50/70 border-2 border-amber-300 rounded-xl font-black text-amber-950 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Quick Avatar Row */}
          <div className="flex items-center justify-between gap-1 pt-1">
            {AVATAR_OPTIONS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectAvatar(item.emoji)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border-2 cursor-pointer transition-all ${
                  userProfile.avatar === item.emoji
                    ? 'bg-amber-400 border-amber-600 scale-110 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
                title={item.label}
              >
                {item.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Cheerful Sound Effects Card */}
        <div className="bg-white rounded-3xl p-4 border-3 border-sky-300 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 border-2 border-sky-400 flex items-center justify-center text-sky-700">
              {userProfile.soundEnabled ? (
                <Volume2 className="w-6 h-6" />
              ) : (
                <VolumeX className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div>
              <div className="text-sm font-black text-slate-800">
                Playful Sounds
              </div>
              <div className="text-xs font-bold text-slate-500">
                Fun pops, chimes & camera clicks
              </div>
            </div>
          </div>

          <motion.button
            id="settings-sound-switch"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSoundToggle}
            className={`w-14 h-8 rounded-full p-1 border-2 transition-colors cursor-pointer flex items-center ${
              userProfile.soundEnabled
                ? 'bg-sky-500 border-sky-600 justify-end'
                : 'bg-slate-200 border-slate-300 justify-start'
            }`}
          >
            <motion.div
              layout
              className="w-6 h-6 rounded-full bg-white shadow-md"
            />
          </motion.button>
        </div>

        {/* Language Selection Card */}
        <div className="bg-white rounded-3xl p-4 border-3 border-amber-300 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-amber-950 uppercase tracking-wider">
                  Story & Quiz Language
                </div>
                <div className="text-[11px] font-bold text-amber-800">
                  {userProfile.language === 'ta' ? 'தமிழ் (Tamil) தெரிவு செய்யப்பட்டுள்ளது' : 'English is selected'}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                playBubblePop(userProfile.soundEnabled);
                onNavigate('language');
              }}
              className="text-xs font-black text-amber-800 hover:text-amber-950 flex items-center gap-0.5 underline cursor-pointer"
            >
              <span>Change</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleSelectLanguage('en')}
              className={`py-2 px-3 rounded-2xl border-2 flex items-center justify-between text-xs font-black cursor-pointer transition-all ${
                userProfile.language === 'en'
                  ? 'bg-amber-100 border-amber-400 text-amber-950 ring-2 ring-amber-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-amber-50/50'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base">🇬🇧</span>
                <span>English</span>
              </div>
              {userProfile.language === 'en' && <span className="text-amber-700">✓</span>}
            </button>

            <button
              onClick={() => handleSelectLanguage('ta')}
              className={`py-2 px-3 rounded-2xl border-2 flex items-center justify-between text-xs font-black cursor-pointer transition-all ${
                userProfile.language === 'ta'
                  ? 'bg-amber-100 border-amber-400 text-amber-950 ring-2 ring-amber-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-amber-50/50'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base">🇮🇳</span>
                <span>தமிழ் (Tamil)</span>
              </div>
              {userProfile.language === 'ta' && <span className="text-amber-700">✓</span>}
            </button>
          </div>
        </div>

        {/* App Theme Color Card */}
        <div className="bg-white rounded-3xl p-4 border-3 border-purple-300 shadow-sm">
          <div className="text-xs font-black text-purple-900 uppercase tracking-wider mb-2.5">
            App Color Theme
          </div>

          <div className="grid grid-cols-2 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTheme(t.id)}
                className={`py-2.5 px-3 rounded-2xl border-3 flex items-center justify-between text-xs font-black cursor-pointer transition-all ${
                  t.bg
                } ${t.border} ${
                  userProfile.theme === t.id
                    ? 'ring-4 ring-purple-400 shadow-sm scale-[1.02]'
                    : 'opacity-80 hover:opacity-100'
                }`}
              >
                <span>{t.label}</span>
                {userProfile.theme === t.id && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Preview Frame Viewport Toggle */}
        <div className="bg-white rounded-3xl p-4 border-3 border-emerald-300 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-700">
              {isMobileFrameActive ? (
                <Smartphone className="w-5 h-5" />
              ) : (
                <Monitor className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-sm font-black text-slate-800">
                Mobile Phone Frame
              </div>
              <div className="text-xs font-bold text-slate-500">
                {isMobileFrameActive ? 'Cute phone mockup active' : 'Expanded full screen'}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playBubblePop(userProfile.soundEnabled);
              onToggleMobileFrame();
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs cursor-pointer"
          >
            {isMobileFrameActive ? 'Full Screen' : 'Phone Mode'}
          </button>
        </div>

        {/* Parent Dashboard Access Section */}
        {onRequestParentMode && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-4 border-3 border-amber-300 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-amber-900 shadow-inner">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <span>{userProfile.language === 'ta' ? 'பெற்றோர் பகுப்பாய்வு' : 'Parent Dashboard'}</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-black">
                    🔒 PIN
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-500">
                  {userProfile.language === 'ta'
                    ? 'கற்றல் வரலாறு, வினாடி வினா மதிப்பெண்கள் & நேரம்'
                    : 'Learning history, quiz accuracy, and analytics'}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                playBubblePop(userProfile.soundEnabled);
                onRequestParentMode();
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer shadow-xs"
            >
              {userProfile.language === 'ta' ? 'திறக்கவும்' : 'Open'}
            </button>
          </div>
        )}

        {/* EduToon AI Information Card */}
        <div className="bg-amber-50/80 rounded-3xl p-4 border-2 border-amber-300 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black text-amber-900">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-400" />
            <span>EduToon AI • Basic Structure Ready</span>
          </div>
          <p className="text-[11px] text-amber-800 font-bold mt-1">
            Built for young children • Clean navigation between screens • Ready for future AI learning
          </p>
        </div>
      </div>
    </div>
  );
};
