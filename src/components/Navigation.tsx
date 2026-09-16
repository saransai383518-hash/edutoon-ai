import React from 'react';
import { motion } from 'motion/react';
import { Home, Camera, ImagePlus, Settings } from 'lucide-react';
import { ScreenType, AppLanguage } from '../types';
import { playBubblePop } from '../utils/audio';

interface NavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  soundEnabled: boolean;
  language?: AppLanguage;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate,
  soundEnabled,
  language = 'en',
}) => {
  // Don't render navigation on the welcome screen, processing screen, or parent dashboard
  if (currentScreen === 'welcome' || currentScreen === 'processing' || currentScreen === 'parent') return null;

  const isTamil = language === 'ta';

  const navItems = [
    {
      id: 'home' as ScreenType,
      label: isTamil ? 'முகப்பு' : 'Home',
      icon: Home,
      color: 'bg-amber-400 text-amber-950 border-amber-500',
      activeColor: 'bg-amber-400 text-amber-950 shadow-[0_4px_0_#d97706]',
      inactiveColor: 'text-slate-500 hover:text-amber-700 hover:bg-amber-50',
      ringColor: 'ring-amber-300',
    },
    {
      id: 'camera' as ScreenType,
      label: isTamil ? 'கேமரா' : 'Camera',
      icon: Camera,
      color: 'bg-sky-400 text-sky-950 border-sky-500',
      activeColor: 'bg-sky-400 text-sky-950 shadow-[0_4px_0_#0284c7]',
      inactiveColor: 'text-slate-500 hover:text-sky-700 hover:bg-sky-50',
      ringColor: 'ring-sky-300',
      isHero: true,
    },
    {
      id: 'upload' as ScreenType,
      label: isTamil ? 'படங்கள்' : 'Pictures',
      icon: ImagePlus,
      color: 'bg-emerald-400 text-emerald-950 border-emerald-500',
      activeColor: 'bg-emerald-400 text-emerald-950 shadow-[0_4px_0_#059669]',
      inactiveColor: 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50',
      ringColor: 'ring-emerald-300',
    },
    {
      id: 'settings' as ScreenType,
      label: isTamil ? 'அமைப்புகள்' : 'Settings',
      icon: Settings,
      color: 'bg-purple-400 text-purple-950 border-purple-500',
      activeColor: 'bg-purple-400 text-purple-950 shadow-[0_4px_0_#7e22ce]',
      inactiveColor: 'text-slate-500 hover:text-purple-700 hover:bg-purple-50',
      ringColor: 'ring-purple-300',
    },
  ];

  const handleNav = (screen: ScreenType) => {
    playBubblePop(soundEnabled);
    onNavigate(screen);
  };

  return (
    <nav className="w-full max-w-md mx-auto px-4 pb-4 pt-2 z-40">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-2.5 border-3 border-amber-200 shadow-[0_8px_20px_rgba(245,158,11,0.18)] flex items-center justify-around gap-1">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const IconComponent = item.icon;

          return (
            <motion.button
              key={item.id}
              id={`nav-button-${item.id}`}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleNav(item.id)}
              aria-label={`Go to ${item.label}`}
              className={`relative flex flex-col items-center justify-center py-2 px-3 sm:px-4 rounded-2xl transition-all font-bold text-xs sm:text-sm cursor-pointer select-none ${
                isActive
                  ? `${item.activeColor} border-2 border-white/60`
                  : `${item.inactiveColor}`
              }`}
            >
              {/* Highlight dot or badge for hero button */}
              {item.isHero && !isActive && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500" />
                </span>
              )}

              <IconComponent
                className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform ${
                  isActive ? 'scale-110' : ''
                }`}
                strokeWidth={isActive ? 2.6 : 2.2}
              />
              <span className="mt-1 tracking-wide font-extrabold whitespace-nowrap">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
