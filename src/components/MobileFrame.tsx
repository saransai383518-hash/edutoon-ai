import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';
import { AppTheme } from '../types';

interface MobileFrameProps {
  children: React.ReactNode;
  theme: AppTheme;
  isFrameActive: boolean;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  theme,
  isFrameActive,
}) => {
  const themeBgMap: Record<AppTheme, string> = {
    sunshine: 'bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-50',
    sky: 'bg-gradient-to-b from-sky-50 via-cyan-50 to-blue-50',
    meadow: 'bg-gradient-to-b from-emerald-50 via-teal-50 to-green-50',
    bubblegum: 'bg-gradient-to-b from-pink-50 via-rose-50 to-amber-50',
  };

  const currentBg = themeBgMap[theme] || themeBgMap.sunshine;

  if (!isFrameActive) {
    return (
      <div className={`w-full h-screen overflow-hidden ${currentBg} flex flex-col`}>
        {children}
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-900/90 sm:bg-slate-900/95 flex items-center justify-center p-0 sm:p-4 md:p-6 select-none">
      {/* Mobile Device Mockup */}
      <div className="relative w-full sm:max-w-[420px] h-[100dvh] sm:h-[860px] max-h-[95vh] bg-slate-950 sm:rounded-[48px] sm:border-[10px] sm:border-slate-800 shadow-[0_25px_60px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden sm:ring-1 sm:ring-white/20">
        
        {/* Mobile Top Speaker Notch & Status Bar */}
        <div className="w-full bg-black/10 backdrop-blur-xs px-6 pt-2 pb-1.5 flex items-center justify-between z-50 text-[11px] font-black text-slate-700">
          <div className="flex items-center gap-1">
            <span>9:41</span>
          </div>

          {/* Center Speaker Notch */}
          <div className="w-24 h-4 bg-slate-800 rounded-full flex items-center justify-center gap-2 px-2">
            <div className="w-2 h-2 rounded-full bg-slate-900" />
            <div className="w-8 h-1 rounded-full bg-slate-700" />
          </div>

          {/* Right Status Icons */}
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3 text-slate-700" />
            <Wifi className="w-3 h-3 text-slate-700" />
            <BatteryMedium className="w-3.5 h-3.5 text-slate-700" />
          </div>
        </div>

        {/* Screen Content Container */}
        <div className={`flex-1 flex flex-col overflow-hidden ${currentBg} relative`}>
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="w-full bg-transparent py-1.5 flex justify-center z-50 pointer-events-none">
          <div className="w-32 h-1 bg-slate-400/40 rounded-full" />
        </div>
      </div>
    </div>
  );
};
