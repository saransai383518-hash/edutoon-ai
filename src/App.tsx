/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenType, UserProfile, AIAnalysisResult } from './types';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HomeScreen } from './components/HomeScreen';
import { CameraScreen } from './components/CameraScreen';
import { UploadScreen } from './components/UploadScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { LanguageScreen } from './components/LanguageScreen';
import { AIProcessingScreen } from './components/AIProcessingScreen';
import { AIResultScreen } from './components/AIResultScreen';
import { Navigation } from './components/Navigation';
import { MobileFrame } from './components/MobileFrame';
import { playBubblePop } from './utils/audio';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('welcome');
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [isMobileFrameActive, setIsMobileFrameActive] = useState<boolean>(true);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Explorer',
    avatar: '🦁',
    soundEnabled: true,
    theme: 'sunshine',
    starsCollected: 5,
    language: 'en',
  });

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updated }));
  };

  const handleToggleSound = () => {
    setUserProfile((prev) => {
      const nextSound = !prev.soundEnabled;
      if (nextSound) playBubblePop(true);
      return { ...prev, soundEnabled: nextSound };
    });
  };

  const handleNavigate = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  const handlePhotoCaptured = (dataUrl: string) => {
    setActiveImage(dataUrl);
    setUserProfile((prev) => ({ ...prev, starsCollected: prev.starsCollected + 1 }));
  };

  const handleSelectImage = (url: string) => {
    setActiveImage(url);
    setUserProfile((prev) => ({ ...prev, starsCollected: prev.starsCollected + 1 }));
  };

  const handleContinueToProcessing = (image: string) => {
    setActiveImage(image);
    setCurrentScreen('processing');
  };

  const handleAnalysisComplete = (result: AIAnalysisResult) => {
    setAiResult(result);
    setUserProfile((prev) => ({ ...prev, starsCollected: prev.starsCollected + 1 }));
    setCurrentScreen('result');
  };

  return (
    <MobileFrame
      theme={userProfile.theme}
      isFrameActive={isMobileFrameActive}
    >
      {/* Main Screen Content with Smooth Animated Screen Transitions */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
          {currentScreen === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              <WelcomeScreen
                userProfile={userProfile}
                onUpdateProfile={handleUpdateProfile}
                onStart={() => setCurrentScreen('home')}
              />
            </motion.div>
          )}

          {currentScreen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              <HomeScreen
                userProfile={userProfile}
                onNavigate={handleNavigate}
                onToggleSound={handleToggleSound}
              />
            </motion.div>
          )}

          {currentScreen === 'camera' && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              <CameraScreen
                soundEnabled={userProfile.soundEnabled}
                onNavigate={handleNavigate}
                onPhotoCaptured={handlePhotoCaptured}
                onContinueToProcessing={handleContinueToProcessing}
              />
            </motion.div>
          )}

          {currentScreen === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              <UploadScreen
                soundEnabled={userProfile.soundEnabled}
                onNavigate={handleNavigate}
                activeImage={activeImage}
                onSelectImage={handleSelectImage}
                onContinueToProcessing={handleContinueToProcessing}
              />
            </motion.div>
          )}

          {currentScreen === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              <AIProcessingScreen
                image={activeImage}
                soundEnabled={userProfile.soundEnabled}
                language={userProfile.language || 'en'}
                onNavigate={handleNavigate}
                onRetake={() => setCurrentScreen('camera')}
                onChooseAnother={() => setCurrentScreen('upload')}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </motion.div>
          )}

          {currentScreen === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              <AIResultScreen
                image={activeImage}
                result={aiResult}
                soundEnabled={userProfile.soundEnabled}
                language={userProfile.language || 'en'}
                onNavigate={handleNavigate}
                onRetake={() => setCurrentScreen('camera')}
                onChooseAnother={() => setCurrentScreen('upload')}
                onAwardStars={(stars) =>
                  setUserProfile((prev) => ({
                    ...prev,
                    starsCollected: prev.starsCollected + stars,
                  }))
                }
              />
            </motion.div>
          )}

          {currentScreen === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              <SettingsScreen
                userProfile={userProfile}
                onUpdateProfile={handleUpdateProfile}
                onNavigate={handleNavigate}
                isMobileFrameActive={isMobileFrameActive}
                onToggleMobileFrame={() => setIsMobileFrameActive((prev) => !prev)}
              />
            </motion.div>
          )}

          {currentScreen === 'language' && (
            <motion.div
              key="language"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              <LanguageScreen
                currentLanguage={userProfile.language || 'en'}
                onSelectLanguage={(lang) => handleUpdateProfile({ language: lang })}
                onNavigate={handleNavigate}
                soundEnabled={userProfile.soundEnabled}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Child-friendly bottom navigation bar */}
      <Navigation
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        soundEnabled={userProfile.soundEnabled}
        language={userProfile.language || 'en'}
      />
    </MobileFrame>
  );
}
