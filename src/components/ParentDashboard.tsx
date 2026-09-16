import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Camera,
  Clock,
  Award,
  BookOpen,
  PieChart,
  Calendar,
  Sparkles,
  Lock,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Star,
  Search,
  Filter,
  KeyRound,
  BarChart3,
  HelpCircle,
  BrainCircuit,
  ExternalLink,
} from 'lucide-react';
import {
  LearningRecord,
  ParentDashboardStats,
  UserProfile,
  ScreenType,
  AppLanguage,
} from '../types';
import {
  getLearningHistory,
  computeParentStats,
  setParentPIN,
  getParentPIN,
  restoreDefaultSeedHistory,
  clearLearningHistory,
  CATEGORY_META,
} from '../utils/learningTracker';
import { playBubblePop, playChime } from '../utils/audio';

interface ParentDashboardProps {
  userProfile: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  onLock: () => void;
  soundEnabled?: boolean;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  userProfile,
  onNavigate,
  onLock,
  soundEnabled = true,
}) => {
  const isTamil = userProfile.language === 'ta';
  const [records, setRecords] = useState<LearningRecord[]>([]);
  const [stats, setStats] = useState<ParentDashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'history' | 'settings'>('overview');
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'today'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // PIN Change State
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [currentPinInput, setCurrentPinInput] = useState<string>('');
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [confirmPinInput, setConfirmPinInput] = useState<string>('');
  const [pinChangeStatus, setPinChangeStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load records and compute stats
  const refreshData = () => {
    const data = getLearningHistory();
    setRecords(data);
    setStats(computeParentStats(data));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleExitToKidMode = () => {
    playBubblePop(soundEnabled);
    onLock();
    onNavigate('home');
  };

  const handleResetDemoData = () => {
    if (window.confirm(isTamil ? 'மாதிரி தரவை மீட்டமைக்க விரும்புகிறீர்களா?' : 'Reset to initial sample learning history?')) {
      restoreDefaultSeedHistory();
      refreshData();
      playChime(soundEnabled);
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm(isTamil ? 'அனைத்து கற்றல் வரலாற்றையும் அழிக்க விரும்புகிறீர்களா?' : 'Clear all learning history?')) {
      clearLearningHistory();
      refreshData();
      playBubblePop(soundEnabled);
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    const actualPin = getParentPIN();
    if (currentPinInput !== actualPin) {
      setPinChangeStatus({
        type: 'error',
        message: isTamil ? 'தற்போதைய பின் எண் தவறானது' : 'Current PIN does not match',
      });
      return;
    }
    if (!/^\d{4}$/.test(newPinInput)) {
      setPinChangeStatus({
        type: 'error',
        message: isTamil ? 'புதிய பின் 4 இலக்க எண்களாக இருக்க வேண்டும்' : 'New PIN must be exactly 4 digits',
      });
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinChangeStatus({
        type: 'error',
        message: isTamil ? 'புதிய பின் எண்கள் பொருந்தவில்லை' : 'New PIN and confirmation do not match',
      });
      return;
    }

    const success = setParentPIN(newPinInput);
    if (success) {
      setPinChangeStatus({
        type: 'success',
        message: isTamil ? 'பின் எண் வெற்றிகரமாக மாற்றப்பட்டது!' : 'Parent PIN changed successfully!',
      });
      playChime(soundEnabled);
      setTimeout(() => {
        setShowPinModal(false);
        setCurrentPinInput('');
        setNewPinInput('');
        setConfirmPinInput('');
        setPinChangeStatus(null);
      }, 1200);
    }
  };

  // Filtered history
  const filteredRecords = records.filter((r) => {
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesSearch = !searchQuery || r.subject.toLowerCase().includes(searchQuery.toLowerCase()) || r.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Mock days for 7-day activity bar chart
  const weeklyDays = [
    { day: 'Mon', count: 2, mins: 12 },
    { day: 'Tue', count: 3, mins: 18 },
    { day: 'Wed', count: 1, mins: 8 },
    { day: 'Thu', count: 4, mins: 24 },
    { day: 'Fri', count: 3, mins: 19 },
    { day: 'Sat', count: 5, mins: 32 },
    { day: 'Sun (Today)', count: stats?.totalPicturesAnalyzed ? Math.min(stats.totalPicturesAnalyzed, 4) : 3, mins: stats?.todayTimeSpentMinutes || 18, isToday: true },
  ];
  const maxWeeklyMins = Math.max(...weeklyDays.map((d) => d.mins), 30);

  if (!stats) return null;

  return (
    <div className="min-h-full flex flex-col bg-slate-50 text-slate-800 overflow-y-auto pb-10">
      {/* Top Professional Header Bar for Parents */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Exit to Kid Mode & Title */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExitToKidMode}
              className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              title="Return to Child Explorer"
            >
              <ArrowLeft className="w-4 h-4 text-amber-700" />
              <span>{isTamil ? 'குழந்தை முகப்பு' : 'Kid Mode'}</span>
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-slate-900">
                  {isTamil ? 'பெற்றோர் பகுப்பாய்வு' : 'Parent Dashboard'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-wide">
                  Protected
                </span>
              </div>
              <div className="text-[11px] font-bold text-slate-500">
                {isTamil ? `${userProfile.name} இன் கற்றல் முன்னேற்றம்` : `Learning progress for ${userProfile.name} ${userProfile.avatar}`}
              </div>
            </div>
          </div>

          {/* Right: Lock Session & PIN Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playBubblePop(soundEnabled);
                setShowPinModal(true);
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer transition-colors"
              title="Change PIN"
              aria-label="Parent PIN Settings"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            <button
              onClick={handleExitToKidMode}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer transition-colors flex items-center gap-1 text-xs font-bold"
              title="Lock and Return"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isTamil ? 'பூட்டு' : 'Lock'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-0.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{isTamil ? 'கண்ணோட்டம்' : 'Overview & Charts'}</span>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'subjects'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isTamil ? 'தலைப்புகள்' : 'Topics & Subjects'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px]">
              {stats.topicsLearnedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isTamil ? 'வரலாறு' : 'Learning History'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px]">
              {records.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isTamil ? 'பாதுகாப்பு & அமைப்புகள்' : 'Parent Settings'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 sm:p-5 max-w-4xl mx-auto w-full space-y-4">
        {/* TAB 1: OVERVIEW & CHARTS */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Card 1: Pictures Analyzed */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-bold">{isTamil ? 'படங்கள்' : 'Photos Analyzed'}</span>
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {stats.totalPicturesAnalyzed}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{Math.min(stats.totalPicturesAnalyzed, 3)} {isTamil ? 'இன்று' : 'today'}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Time Spent Learning */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-bold">{isTamil ? 'கற்றல் நேரம்' : 'Time Spent'}</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {stats.totalTimeSpentMinutes >= 60
                      ? `${(stats.totalTimeSpentMinutes / 60).toFixed(1)}h`
                      : `${stats.totalTimeSpentMinutes}m`}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                    {stats.todayTimeSpentMinutes} {isTamil ? 'நிமிடம் இன்று' : 'mins today'}
                  </div>
                </div>
              </div>

              {/* Card 3: Quiz Scores & Accuracy */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-bold">{isTamil ? 'சரியான விடை %' : 'Quiz Accuracy'}</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-700">
                    {stats.correctAnswerPercentage}%
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                    {stats.totalCorrectAnswers}/{stats.totalQuizQuestionsAnswered} {isTamil ? 'சரியானது' : 'correct'}
                  </div>
                </div>
              </div>

              {/* Card 4: Topics Explored */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-bold">{isTamil ? 'தலைப்புகள்' : 'Topics Mastered'}</span>
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {stats.topicsLearnedCount}
                  </div>
                  <div className="text-[11px] font-bold text-purple-600 mt-0.5">
                    {stats.topSubjects[0]?.category || 'Various'}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section: 2 Charts Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Chart 1: Most Frequently Learned Subjects Progress Indicators */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-slate-600" />
                    <h3 className="text-sm font-black text-slate-800">
                      {isTamil ? 'அடிக்கடி கற்றுக்கொண்ட பாடங்கள்' : 'Most Frequently Learned Subjects'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">
                    {stats.totalPicturesAnalyzed} {isTamil ? 'மொத்தம்' : 'total'}
                  </span>
                </div>

                <div className="space-y-3 my-1">
                  {stats.topSubjects.length > 0 ? (
                    stats.topSubjects.map((sub) => (
                      <div key={sub.category} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-extrabold">
                          <span className="flex items-center gap-1.5 text-slate-800">
                            <span>{sub.icon}</span>
                            <span>{sub.category}</span>
                          </span>
                          <span className="text-slate-600 font-black">
                            {sub.count} {isTamil ? 'படங்கள்' : 'items'} ({sub.percentage}%)
                          </span>
                        </div>
                        {/* Simple Horizontal Progress Bar */}
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(sub.percentage, 6)}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full ${
                              sub.category === 'Animal Friends'
                                ? 'bg-amber-400'
                                : sub.category === 'Nature & Plants'
                                ? 'bg-emerald-400'
                                : sub.category === 'Things That Go'
                                ? 'bg-sky-400'
                                : 'bg-purple-400'
                            }`}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      {isTamil ? 'இன்னும் படங்கள் எதுவும் இல்லை' : 'No subjects analyzed yet'}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>{isTamil ? 'முக்கிய ஆர்வம்:' : 'Top Focus Area:'}</span>
                  <span className="text-amber-900 font-extrabold flex items-center gap-1">
                    <span>{stats.topSubjects[0]?.icon}</span>
                    <span>{stats.topSubjects[0]?.category || 'Animals & Nature'}</span>
                  </span>
                </div>
              </div>

              {/* Chart 2: Daily Learning Time & Activity Chart */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <h3 className="text-sm font-black text-slate-800">
                      {isTamil ? 'வாராந்திர கற்றல் நேரம் (நிமிடங்கள்)' : 'Weekly Learning Activity (Minutes)'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {stats.todayTimeSpentMinutes}m today
                  </span>
                </div>

                {/* 7-Day Bar Chart */}
                <div className="h-36 flex items-end justify-between gap-1.5 pt-4 pb-1 px-1">
                  {weeklyDays.map((col) => {
                    const heightPercent = Math.min(100, Math.max(15, (col.mins / maxWeeklyMins) * 100));
                    return (
                      <div key={col.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="text-[9px] font-black text-slate-600">
                          {col.mins}m
                        </span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ duration: 0.6 }}
                          className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                            col.isToday
                              ? 'bg-amber-500 shadow-xs ring-2 ring-amber-300'
                              : 'bg-slate-200 hover:bg-slate-300'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-bold ${
                            col.isToday ? 'text-amber-900 font-black' : 'text-slate-400'
                          }`}
                        >
                          {col.day.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>{isTamil ? 'தினசரி சராசரி நேரம்:' : 'Daily Average Time:'}</span>
                  <span className="font-extrabold text-slate-800">~18 mins / day</span>
                </div>
              </div>
            </div>

            {/* Quiz Performance Gauge & Star Progress Indicator */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>{isTamil ? 'வினாடி வினா மதிப்பெண்கள் & தேர்ச்சி' : 'Quiz Mastery & Comprehension'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">
                    {isTamil
                      ? 'AI கார்ட்டூன் கதாபாத்திரங்களின் வினாக்களுக்கு குழந்தை அளித்த பதில்கள்'
                      : 'Comprehension scores after listening to cartoon character explanations'}
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span className="text-xs font-black text-amber-900">
                    {userProfile.starsCollected} {isTamil ? 'நட்சத்திரங்கள்' : 'Total Stars'}
                  </span>
                </div>
              </div>

              {/* Progress Ring & Breakdown Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                {/* Visual Circular Gauge */}
                <div className="flex flex-col items-center justify-center p-2">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#f1f5f9"
                        strokeWidth="10"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="10"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 * (1 - stats.correctAnswerPercentage / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-black text-slate-900 leading-none">
                        {stats.correctAnswerPercentage}%
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-400 mt-1 uppercase">
                        {isTamil ? 'துல்லியம்' : 'Accuracy'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Cards */}
                <div className="sm:col-span-2 space-y-2.5">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between text-xs font-black text-slate-700 mb-1">
                      <span>{isTamil ? 'முதல் முயற்சியில் சரியானது' : 'First-Try Correct Answers'}</span>
                      <span className="text-emerald-600 font-extrabold">{stats.totalCorrectAnswers} questions</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${stats.correctAnswerPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between text-xs font-black text-slate-700 mb-1">
                      <span>{isTamil ? 'முழுமையான வினாடி வினாக்கள்' : 'Completed Quizzes'}</span>
                      <span className="text-slate-800 font-extrabold">
                        {stats.totalQuizzesTaken} {isTamil ? 'தேர்வுகள்' : 'sessions'}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{ width: `${Math.min(100, stats.totalQuizzesTaken * 12)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-amber-50/60 p-2 rounded-xl border border-amber-200/60">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      {isTamil
                        ? 'அற்புதமான செயல்திறன்! குழந்தை புதிய கருத்துக்களை விரைவாக கிரகித்துக்கொள்கிறது.'
                        : 'Great retention! The child demonstrates high engagement with audio explanations.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Learning History Preview */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900">
                  {isTamil ? 'சமீபத்திய கற்றல் வரலாறு' : 'Recent Learning Sessions'}
                </h3>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs font-extrabold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>{isTamil ? 'அனைத்தும் காண்க' : 'View Full History'}</span>
                  <span>→</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {records.slice(0, 3).map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shrink-0">
                        {item.thumbnailEmoji || '📷'}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 leading-tight">
                          {item.subject}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="text-amber-700 font-extrabold">{item.category}</span>
                          <span>•</span>
                          <span>{item.characterName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-emerald-600 flex items-center gap-1 justify-end">
                        <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-600" />
                        <span>{item.quizScore || 3}/{item.quizTotalQuestions || 3}</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400">
                        {Math.round(item.timeSpentSeconds / 60)}m spent
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TOPICS & SUBJECTS DETAIL */}
        {activeTab === 'subjects' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-base font-black text-slate-900 mb-1">
                {isTamil ? 'ஆராய்ந்த கல்வித் தலைப்புகள்' : 'Curriculum & Explored Topics'}
              </h3>
              <p className="text-xs text-slate-500 font-bold mb-4">
                {isTamil
                  ? 'குழந்தை புகைப்படங்கள் எடுத்து கண்டறிந்த பிரிவுகளின் விவரம்'
                  : 'Breakdown of topics identified through real photo captures and interactive lessons'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stats.topSubjects.map((subject) => {
                  const meta = CATEGORY_META[subject.category] || {
                    icon: '📚',
                    color: 'text-amber-700',
                    bgLight: 'bg-amber-100',
                    border: 'border-amber-300',
                  };
                  return (
                    <div
                      key={subject.category}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-amber-300 transition-colors bg-white shadow-xs flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-11 h-11 rounded-xl ${meta.bgLight} ${meta.border} border flex items-center justify-center text-2xl shadow-inner`}
                          >
                            {meta.icon}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900">{subject.category}</h4>
                            <span className="text-[11px] font-bold text-slate-500">
                              Last active: {subject.lastLearned}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
                          {subject.count} {isTamil ? 'படங்கள்' : 'items'}
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                          <span>{isTamil ? 'ஆர்வம் வீதம்' : 'Engagement Rate'}</span>
                          <span className="font-black text-slate-800">{subject.percentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${subject.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COMPLETE LEARNING HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Search and Filters Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-2.5 justify-between">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isTamil ? 'பொருளைத் தேடுங்கள்...' : 'Search subjects (e.g. puppy, apple)...'}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                {['all', 'Animal Friends', 'Nature & Plants', 'Things That Go', 'Shapes & Toys'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                      categoryFilter === cat
                        ? 'bg-amber-400 text-amber-950 shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat === 'all' ? (isTamil ? 'அனைத்தும்' : 'All') : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List of History Records */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => {
                  const dateStr = new Date(rec.timestamp).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <div key={rec.id} className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100/70 border border-amber-300 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                          {rec.thumbnailEmoji || '📸'}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-tight">
                            {rec.subject}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-500 mt-1">
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                              {rec.category}
                            </span>
                            <span>•</span>
                            <span>Guide: {rec.characterName}</span>
                            <span>•</span>
                            <span className="text-slate-400">{dateStr}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quiz Score & Time */}
                      <div className="text-right shrink-0">
                        <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg text-xs font-black text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {rec.quizScore || 3}/{rec.quizTotalQuestions || 3}
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 mt-1">
                          ⏱️ {Math.round((rec.timeSpentSeconds || 120) / 60)}m learning
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs font-bold">
                  {isTamil ? 'பொருத்தமான கற்றல் பதிவுகள் இல்லை' : 'No learning history matches your search.'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PARENT SETTINGS & PIN MANAGEMENT */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* PIN Security Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      {isTamil ? 'பெற்றோர் பாதுகாப்பு பின்' : 'Parent Security PIN'}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold">
                      {isTamil ? 'பெற்றோர் பகுதி அணுகலை பாதுகாக்கவும்' : 'Protect parent dashboard from curious little hands'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowPinModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black cursor-pointer shadow-xs"
                >
                  {isTamil ? 'பின் மாற்றவும்' : 'Change PIN'}
                </button>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 flex items-center justify-between">
                <span>{isTamil ? 'தற்போதைய பாதுகாப்பு நிலை:' : 'Current PIN Status:'}</span>
                <span className="font-black text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isTamil ? 'செயலில் உள்ளது' : 'Active (4 Digits)'}
                </span>
              </div>
            </div>

            {/* Demo & Data Management Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900">
                {isTamil ? 'தரவு மேலாண்மை' : 'Data & Sample Records'}
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                {isTamil
                  ? 'பகுப்பாய்வுகளை சோதிக்க மாதிரி தரவை மீண்டும் ஏற்றலாம் அல்லது அழிக்கலாம்.'
                  : 'You can restore realistic demonstration data or clear the learning log to start fresh.'}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleResetDemoData}
                  className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isTamil ? 'மாதிரி தரவை மீட்டமை' : 'Restore Sample Data'}</span>
                </button>

                <button
                  onClick={handleClearAllHistory}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors border border-rose-200"
                >
                  <span>{isTamil ? 'வரலாற்றை அழி' : 'Clear All History'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CHANGE PIN MODAL */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 border-3 border-amber-300 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-amber-800">
                <KeyRound className="w-6 h-6 text-amber-700" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {isTamil ? 'புதிய பின்னை அமைக்கவும்' : 'Set New Parent PIN'}
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  {isTamil ? '4 இலக்க எண்களை உள்ளிடவும்' : 'Enter a 4-digit code you will remember'}
                </p>
              </div>

              {pinChangeStatus && (
                <div
                  className={`p-2 rounded-xl text-xs font-black ${
                    pinChangeStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {pinChangeStatus.message}
                </div>
              )}

              <form onSubmit={handleSaveNewPin} className="space-y-2.5 text-left">
                <div>
                  <label className="text-[11px] font-black text-slate-700">
                    {isTamil ? 'தற்போதைய பின்:' : 'Current PIN (default 1234):'}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value)}
                    placeholder="••••"
                    className="w-full mt-1 py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl font-black text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-700">
                    {isTamil ? 'புதிய 4-இலக்க பின்:' : 'New 4-digit PIN:'}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="••••"
                    className="w-full mt-1 py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl font-black text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-700">
                    {isTamil ? 'புதிய பின் உறுதிப்படுத்தல்:' : 'Confirm New PIN:'}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value)}
                    placeholder="••••"
                    className="w-full mt-1 py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl font-black text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    {isTamil ? 'ரத்து' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer shadow-sm"
                  >
                    {isTamil ? 'சேமி' : 'Save PIN'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
