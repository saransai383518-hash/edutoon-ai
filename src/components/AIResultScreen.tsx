import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Camera, Upload, Home, Sparkles, Layers, Type as TextIcon, Lightbulb, CheckCircle2, MessageCircle, Send, LoaderCircle } from 'lucide-react';
import { AIAnalysisResult, ScreenType, CartoonCharacterType, AppLanguage } from '../types';
import { CartoonCharacter } from './CartoonCharacter';
import { CartoonSpeechPanel } from './CartoonSpeechPanel';
import { CartoonQuizSection } from './CartoonQuizSection';
import { resolveCartoonCharacter, resolveQuizQuestions } from '../utils/cartoonHelper';
import { ToonyMascot } from './ToonyMascot';
import { playBubblePop } from '../utils/audio';
import { useCartoonTTS } from '../hooks/useCartoonTTS';
import { saveLearningRecord } from '../utils/learningTracker';

interface AIResultScreenProps {
  image: string | null;
  result: AIAnalysisResult | null;
  soundEnabled: boolean;
  language?: AppLanguage;
  onNavigate: (screen: ScreenType) => void;
  onRetake: () => void;
  onChooseAnother: () => void;
  onAwardStars?: (stars: number) => void;
}

export const AIResultScreen: React.FC<AIResultScreenProps> = ({
  image,
  result,
  soundEnabled,
  language = 'en',
  onNavigate,
  onRetake,
  onChooseAnother,
  onAwardStars,
}) => {
  const currentLanguage: AppLanguage = language === 'ta' ? 'ta' : 'en';
  const [selectedCharacterOverride, setSelectedCharacterOverride] = useState<CartoonCharacterType | null>(null);
  const [hasFinishedSpeech, setHasFinishedSpeech] = useState<boolean>(false);
  const [childQuestion, setChildQuestion] = useState('');
  const [teacherAnswer, setTeacherAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const quizRef = useRef<HTMLDivElement | null>(null);

  const isTamil = currentLanguage === 'ta';

  if (!result) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
        <ToonyMascot size="lg" pose="curious" speechText="Oops! No picture result found." />
        <p className="text-amber-900 font-bold text-base">Let's pick or take a photo to explore!</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 font-black text-amber-950 shadow-md cursor-pointer"
        >
          Go to Home
        </button>
      </div>
    );
  }

  // Resolve base cartoon character selected from the subject
  const resolvedChar = resolveCartoonCharacter(result, currentLanguage);

  // If user tapped one of the character explorer chips, allow previewing that character
  const activeCharType = selectedCharacterOverride || resolvedChar.type;

  const characterDetails: Record<CartoonCharacterType, { name: string; role: string; explanation: string }> = {
    animal: {
      name: isTamil ? 'பர்னபி கரடி' : 'Barnaby Bear',
      role: isTamil ? 'கார்ட்டூன் விலங்கு வழிகாட்டி' : 'Cartoon Animal Guide',
      explanation: resolvedChar.type === 'animal'
        ? resolvedChar.explanation
        : isTamil
        ? `வணக்கம்! நான் பர்னபி கரடி! விலங்குகள் நம் உலகத்தின் அற்புதமான உயிரினங்கள். அவை உணவு உண்டு, விளையாடி, உலகை அழகாக்குகின்றன!`
        : `Roar! I'm Barnaby Bear! Animals are wonderful living creatures that explore our world, eat delicious food, and use special senses to discover things!`,
    },
    plant: {
      name: isTamil ? 'முளை மலர்' : 'Sprout Blossom',
      role: isTamil ? 'கார்ட்டூன் தாவர நண்பன்' : 'Cartoon Plant Friend',
      explanation: resolvedChar.type === 'plant'
        ? resolvedChar.explanation
        : isTamil
        ? `வணக்கம் செல்லமே! நான் முளை மலர்! செடிகளுக்கு நல் தண்ணீரும் இதமான சூரிய ஒளியும் தேவை! அவை நம் உலகை பசுமையாக்குகின்றன!`
        : `Hi sunshine! I'm Sprout the Blossom! Plants drink refreshing water, soak up warm sunlight, and make our whole planet clean and green!`,
    },
    astronaut: {
      name: isTamil ? 'விண்வெளி வீரர் காஸ்மோ' : 'Cosmo Astronaut',
      role: isTamil ? 'கார்ட்டூன் விண்வெளி ஆய்வாளர்' : 'Cartoon Space Explorer',
      explanation: resolvedChar.type === 'astronaut'
        ? resolvedChar.explanation
        : isTamil
        ? `3... 2... 1... ராக்கெட் பறக்கிறது! நான் காஸ்மோ! வானத்து நட்சத்திரங்களும் கோள்களும் எண்ணற்ற ஆச்சரியங்கள் நிறைந்தவை!`
        : `3... 2... 1... Blastoff! I'm Cosmo the Astronaut! Looking closely at things is just like exploring distant stars and cosmic mysteries in deep space!`,
    },
    scientist: {
      name: isTamil ? 'டாக்டர் ஸ்பார்க்' : 'Dr. Spark',
      role: isTamil ? 'கார்ட்டூன் அறிவியல் தோழன்' : 'Cartoon Science Buddy',
      explanation: resolvedChar.type === 'scientist'
        ? resolvedChar.explanation
        : isTamil
        ? `யூரேகா! நான் அறிவியல் விஞ்ஞானி டாக்டர் ஸ்பார்க்! அறிவியல் என்பது நம்மைச் சுற்றியுள்ள பொருட்கள் எவ்வாறு இயங்குகின்றன என்பதைக் கண்டறியும் அற்புத வழி!`
        : `Eureka! I'm Dr. Spark the Scientist! When you ask "what is this?" and observe with your eyes, you're doing real, exciting science!`,
    },
    teacher: {
      name: isTamil ? 'சன்னி ஆசிரியை' : 'Miss Sunny',
      role: isTamil ? 'கார்ட்டூன் ஆசிரியர்' : 'Cartoon Teacher',
      explanation: resolvedChar.type === 'teacher'
        ? resolvedChar.explanation
        : isTamil
        ? `வணக்கம் குழந்தைகளே! நான் உங்கள் சன்னி ஆசிரியை! உங்கள் படம் மிக அழகாக இருக்கிறது! ஒவ்வொரு படத்திலும் பல புதிய நல்ல பாடங்கள் உள்ளன!`
        : `Welcome to learning time! I'm Miss Sunny! Every picture has a story filled with shapes, vibrant colors, and lessons to discover together!`,
    },
  };

  const currentChar = selectedCharacterOverride
    ? characterDetails[activeCharType]
    : {
        name: result.characterName || resolvedChar.name,
        role: result.cartoonCharacter?.role || resolvedChar.role,
        explanation: result.childFriendlyExplanation || resolvedChar.explanation,
      };

  // Resolve 2-3 simple child-friendly questions from AI result or subject helper
  const quizQuestions = resolveQuizQuestions(result, currentLanguage);

  const askTeacher = async () => {
    const question = childQuestion.trim();
    if (!question || !image || isAsking) return;
    setIsAsking(true);
    setTeacherAnswer(null);
    try {
      const response = await fetch('/api/ask-about-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image,
          question,
          language: currentLanguage,
          detectedSubject: result.detectedSubject || result.mainSubject,
          childFriendlyExplanation: currentChar.explanation,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || typeof data.answer !== 'string') throw new Error();
      setTeacherAnswer(data.answer);
      setChildQuestion('');
    } catch {
      setTeacherAnswer(isTamil ? 'மன்னிக்கவும்! மீண்டும் கேட்க முயற்சிப்போமா?' : 'Oops! Please ask me again in a moment.');
    } finally {
      setIsAsking(false);
    }
  };

  const handleSpeechFinished = () => {
    setHasFinishedSpeech(true);
    // Smoothly scroll quiz container into view after cartoon finishes explaining
    setTimeout(() => {
      quizRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 450);
  };

  // Text-To-Speech hook: auto-plays explanation, generates child-friendly voice, and manages word subtitles
  const tts = useCartoonTTS({
    text: currentChar.explanation,
    characterType: activeCharType,
    characterName: currentChar.name,
    soundEnabled,
    autoPlay: true,
    language: currentLanguage,
    onFinished: handleSpeechFinished,
  });

  // Cartoon mouth movement is strictly synchronized with audio speech:
  // moves when voice is actively speaking, stops immediately when paused or finished!
  const isTalking = tts.isPlaying && !tts.isPaused;

  // Track learning record for Parent Dashboard
  const [recordedId, setRecordedId] = useState<string | null>(null);

  useEffect(() => {
    if (result && !recordedId) {
      const emoji =
        result.primaryCategory === 'Animal Friends'
          ? '🐾'
          : result.primaryCategory === 'Nature & Plants'
          ? '🌱'
          : result.primaryCategory === 'Things That Go'
          ? '🚀'
          : '⭐';

      const rec = saveLearningRecord({
        subject: result.mainSubject || result.headline || 'Explored Photo',
        category: result.primaryCategory || 'General Learning',
        characterType: activeCharType,
        characterName: currentChar.name,
        thumbnailEmoji: emoji,
        timeSpentSeconds: 150,
        quizScore: 3,
        quizTotalQuestions: 3,
        quizPercentage: 100,
        language: currentLanguage,
      });
      setRecordedId(rec.id);
    }
  }, [result]);

  // Count detected items
  const identified = result.identified || {
    objects: [],
    animals: [],
    plants: [],
    people: [],
    places: [],
    diagrams: [],
    educationalContent: [],
    textFound: '',
  };

  const categoryItems = [
    { label: 'Animals', icon: '🐾', items: identified.animals, color: 'bg-emerald-50 border-emerald-300 text-emerald-900' },
    { label: 'Plants & Fruits', icon: '🌿', items: identified.plants, color: 'bg-green-50 border-green-300 text-green-900' },
    { label: 'Objects & Items', icon: '📦', items: identified.objects, color: 'bg-sky-50 border-sky-300 text-sky-900' },
    { label: 'People', icon: '🧑', items: identified.people, color: 'bg-indigo-50 border-indigo-300 text-indigo-900' },
    { label: 'Places & Setting', icon: '🏞️', items: identified.places, color: 'bg-amber-50 border-amber-300 text-amber-900' },
    { label: 'Shapes & Diagrams', icon: '📐', items: identified.diagrams, color: 'bg-pink-50 border-pink-300 text-pink-900' },
    { label: 'Colors & Learning', icon: '🎨', items: identified.educationalContent, color: 'bg-purple-50 border-purple-300 text-purple-900' },
  ];

  const activeCategories = categoryItems.filter(cat => cat.items && cat.items.length > 0);

  const characterOptions: { type: CartoonCharacterType; label: string; icon: string }[] = [
    { type: 'animal', label: 'Animal', icon: '🐾' },
    { type: 'plant', label: 'Plant', icon: '🌿' },
    { type: 'astronaut', label: 'Space', icon: '🚀' },
    { type: 'scientist', label: 'Science', icon: '🧪' },
    { type: 'teacher', label: 'Teacher', icon: '📚' },
  ];

  return (
    <div className="min-h-full flex flex-col p-3 sm:p-4 pb-8 overflow-y-auto space-y-4">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-2">
        <motion.button
          id="result-home-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playBubblePop(soundEnabled);
            tts.stop();
            onNavigate('home');
          }}
          className="px-3.5 py-2 rounded-2xl bg-white border-2 border-amber-300 text-amber-900 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Home className="w-4 h-4 text-amber-600" />
          <span>Home</span>
        </motion.button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-200 to-yellow-300 border-2 border-amber-400 rounded-2xl text-amber-950 font-black text-xs shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-700" />
          <span>Cartoon Guide & Result</span>
        </div>

        <motion.button
          id="result-retake-nav-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playBubblePop(soundEnabled);
            tts.stop();
            onRetake();
          }}
          className="p-2 rounded-2xl bg-white border-2 border-sky-300 text-sky-700 shadow-sm cursor-pointer"
          title="Take new picture"
        >
          <Camera className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Main Identified Content & Cartoon Character Presentation Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full bg-transparent rounded-3xl p-4 sm:p-5 border-3 border-amber-400 shadow-[0_6px_0_#f59e0b] space-y-4"
      >
        {/* Identified Content (Photo + Headline) displayed BESIDE the Cartoon Character */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Left Column: Identified Content */}
          <div className="md:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
            {/* Scanned/Analyzed Photo */}
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-3 border-amber-300 shadow-md bg-transparent shrink-0 flex items-center justify-center">
              {image ? (
                <img
                  src={image}
                  alt="Analyzed subject"
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">📸</div>
              )}
              <span className="absolute bottom-1.5 right-1.5 bg-emerald-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full border border-white shadow-sm">
                Identified! ✨
              </span>
            </div>

            {/* Identified Content Details */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-xs">
                <span>Subject:</span>
                <span className="text-amber-800 font-black">{result.mainSubject || result.primaryCategory}</span>
              </div>

              {/* AI Headline Definition */}
              <div
                id="ai-result-headline"
                className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl"
              >
                <p className="text-sm sm:text-base font-black text-amber-950 leading-snug">
                  {result.headline}
                </p>
              </div>

              {/* Child-friendly 1-2 sentence description */}
              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
                {result.childDescription}
              </p>
            </div>
          </div>

          {/* Right Column: Cartoon Character BESIDE the Identified Content */}
          <div className="md:col-span-5 flex flex-col items-center justify-center pt-2 md:pt-0 border-t-2 md:border-t-0 md:border-l-2 border-amber-100 pl-0 md:pl-4">
            <CartoonCharacter
              type={activeCharType}
              name={currentChar.name}
              role={currentChar.role}
              isTalking={isTalking}
              onToggleTalking={() => {
                playBubblePop(soundEnabled);
                if (tts.isPlaying) {
                  tts.pause();
                } else {
                  tts.play();
                }
              }}
              size="md"
            />
          </div>
        </div>

        {/* Text-to-Speech Explanation Panel with Play, Pause, Replay, and Live Subtitles UNDERNEATH the Cartoon */}
        <div className="relative pt-1">
          <CartoonSpeechPanel
            characterName={currentChar.name}
            role={currentChar.role}
            explanation={currentChar.explanation}
            words={tts.words}
            currentWordIndex={tts.currentWordIndex}
            isPlaying={tts.isPlaying}
            isPaused={tts.isPaused}
            isSupported={tts.isSupported}
            soundEnabled={soundEnabled}
            onPlay={tts.play}
            onPause={tts.pause}
            onReplay={tts.replay}
          />
        </div>

        {/* Real Gemini follow-up questions, kept within the current picture lesson. */}
        <div className="rounded-2xl border-2 border-sky-300 bg-sky-50 p-3 space-y-2">
          <div className="flex items-center gap-2 text-sky-950">
            <MessageCircle className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-black">Ask {currentChar.name} anything!</span>
          </div>
          <div className="flex gap-2">
            <input
              value={childQuestion}
              onChange={(event) => setChildQuestion(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') void askTeacher(); }}
              maxLength={300}
              placeholder="What would you like to know?"
              aria-label="Ask your cartoon teacher a question"
              className="min-w-0 flex-1 rounded-xl border-2 border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-sky-500"
            />
            <button
              onClick={() => void askTeacher()}
              disabled={!childQuestion.trim() || isAsking || !image}
              className="rounded-xl bg-sky-500 px-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Ask question"
            >
              {isAsking ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          {teacherAnswer && <p className="rounded-xl border border-sky-200 bg-white p-2 text-xs font-semibold leading-relaxed text-sky-950">{teacherAnswer}</p>}
        </div>

        {/* Switch Cartoon Guide (Allows exploring all 5 character archetypes: Animal, Plant, Space, Science, Teacher) */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-xs font-black text-amber-900">
              Meet other cartoon friends:
            </span>
            {selectedCharacterOverride && (
              <button
                onClick={() => {
                  playBubblePop(soundEnabled);
                  setSelectedCharacterOverride(null);
                }}
                className="text-[11px] font-bold text-amber-700 underline cursor-pointer"
              >
                Reset to AI Pick
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {characterOptions.map((opt) => {
              const isSelected = activeCharType === opt.type;
              return (
                <button
                  key={opt.type}
                  onClick={() => {
                    playBubblePop(soundEnabled);
                    setSelectedCharacterOverride(opt.type);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-amber-950 border-2 border-amber-600 shadow-sm scale-105'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fun Educational Fact Box */}
        {result.funFact && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-100/80 border-2 border-amber-300 text-amber-950">
            <div className="p-1.5 rounded-xl bg-amber-300 shrink-0 text-amber-900">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm">
              <strong className="block font-black text-amber-900">Fun Explorer Fact:</strong>
              <p className="font-semibold mt-0.5">{result.funFact}</p>
            </div>
          </div>
        )}

        {/* Prompt to take Quiz after Cartoon explains content */}
        <div className="pt-1">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              playBubblePop(soundEnabled);
              quizRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`w-full py-2.5 px-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-between gap-2 border-2 cursor-pointer shadow-xs transition-all ${
              hasFinishedSpeech
                ? 'bg-gradient-to-r from-emerald-100 via-amber-100 to-yellow-100 border-emerald-400 text-emerald-950 hover:bg-emerald-200'
                : 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{hasFinishedSpeech ? '🎉' : '⭐'}</span>
              <span>
                {hasFinishedSpeech
                  ? `${currentChar.name} finished! Take the Quiz!`
                  : `Play ${currentChar.name}'s Quiz (${quizQuestions.length} Questions)`}
              </span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-lg bg-white/90 border border-amber-300 font-extrabold text-amber-900">
              Earn Stars ⭐
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* 2–3 Simple Questions Mini-Quiz Section based on the Image & Explanation */}
      <div ref={quizRef} className="w-full">
        <CartoonQuizSection
          questions={quizQuestions}
          characterName={currentChar.name}
          characterType={activeCharType}
          soundEnabled={soundEnabled}
          language={currentLanguage}
          onAwardStars={onAwardStars}
          onQuizComplete={(score, total) => {
            saveLearningRecord({
              subject: `${result.mainSubject || result.headline} (Quiz)`,
              category: result.primaryCategory || 'General Learning',
              characterType: activeCharType,
              characterName: currentChar.name,
              thumbnailEmoji: '🎯',
              timeSpentSeconds: 90,
              quizScore: score,
              quizTotalQuestions: total,
              quizPercentage: Math.round((score / total) * 100),
              language: currentLanguage,
            });
          }}
        />
      </div>

      {/* Identified Categories Breakdown Grid */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="w-full bg-white rounded-3xl p-4 sm:p-5 border-3 border-sky-300 shadow-[0_5px_0_#0284c7] space-y-3"
      >
        <div className="flex items-center justify-between border-b-2 border-sky-100 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600" />
            <h3 className="font-black text-sky-950 text-sm sm:text-base">
              Identified Elements & Concepts
            </h3>
          </div>
          <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
            EduToon AI Breakdown
          </span>
        </div>

        {/* Text Found section if image had text */}
        {identified.textFound && identified.textFound.trim().length > 0 && (
          <div className="p-3 rounded-2xl bg-violet-50 border-2 border-violet-200">
            <div className="flex items-center gap-1.5 text-violet-900 font-black text-xs mb-1">
              <TextIcon className="w-4 h-4 text-violet-600" />
              <span>Words & Letters Spotted:</span>
            </div>
            <p className="text-xs font-bold text-violet-800 bg-white/80 p-2 rounded-xl border border-violet-200">
              "{identified.textFound}"
            </p>
          </div>
        )}

        {/* Active categories chips */}
        <div className="space-y-2.5">
          {activeCategories.length > 0 ? (
            activeCategories.map((cat, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border-2 ${cat.color} flex flex-col sm:flex-row sm:items-center justify-between gap-2`}
              >
                <div className="flex items-center gap-2 font-black text-xs sm:text-sm">
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.label}:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((item, itemIdx) => (
                    <span
                      key={itemIdx}
                      className="px-2.5 py-1 rounded-xl bg-white/90 border border-current font-bold text-xs shadow-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs font-bold text-slate-500 text-center py-2">
              EduToon AI identified the main subject in the picture!
            </p>
          )}
        </div>
      </motion.div>

      {/* Action Buttons: Retake, Choose Another, Home */}
      <div className="w-full space-y-2.5 pt-2">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Retake Button */}
          <motion.button
            id="result-retake-action"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.96, y: 2 }}
            onClick={() => {
              playBubblePop(soundEnabled);
              tts.stop();
              onRetake();
            }}
            className="py-3.5 px-3 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 border-3 border-sky-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_0_#0284c7] active:shadow-none"
          >
            <Camera className="w-4 h-4" />
            <span>Take New Picture</span>
          </motion.button>

          {/* Choose Another Image Button */}
          <motion.button
            id="result-choose-another-action"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.96, y: 2 }}
            onClick={() => {
              playBubblePop(soundEnabled);
              tts.stop();
              onChooseAnother();
            }}
            className="py-3.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 border-3 border-emerald-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_0_#047857] active:shadow-none"
          >
            <Upload className="w-4 h-4" />
            <span>Choose Another</span>
          </motion.button>
        </div>

        {/* Back to Home Screen */}
        <motion.button
          id="result-bottom-home-button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            playBubblePop(soundEnabled);
            tts.stop();
            onNavigate('home');
          }}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-amber-50 border-2 border-amber-300 text-amber-900 font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Home className="w-4 h-4 text-amber-600" />
          <span>Back to Home Screen</span>
        </motion.button>
      </div>
    </div>
  );
};
