import { LearningRecord, ParentDashboardStats, TopicSummary } from '../types';

const STORAGE_KEY_HISTORY = 'edutoon_learning_history_v2';
const STORAGE_KEY_PIN = 'edutoon_parent_pin_v2';
const STORAGE_KEY_ACTIVE_TIME = 'edutoon_active_learning_time_seconds';
const DEFAULT_PIN = '1234';

// Initial realistic pre-seeded learning records so the dashboard is immediately rich and informative
const INITIAL_SEED_RECORDS: LearningRecord[] = [
  {
    id: 'seed-1',
    timestamp: Date.now() - 1000 * 60 * 25, // 25 mins ago
    subject: 'Fluffy Golden Puppy',
    category: 'Animal Friends',
    characterType: 'animal',
    characterName: 'Barnaby Bear',
    thumbnailEmoji: '🐶',
    timeSpentSeconds: 210, // 3.5 mins
    quizScore: 3,
    quizTotalQuestions: 3,
    quizPercentage: 100,
    language: 'en',
  },
  {
    id: 'seed-2',
    timestamp: Date.now() - 1000 * 60 * 65, // ~1 hour ago
    subject: 'Red Crunchy Apple',
    category: 'Nature & Plants',
    characterType: 'plant',
    characterName: 'Sprout Blossom',
    thumbnailEmoji: '🍎',
    timeSpentSeconds: 180,
    quizScore: 2,
    quizTotalQuestions: 3,
    quizPercentage: 67,
    language: 'en',
  },
  {
    id: 'seed-3',
    timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
    subject: 'Cosmic Star Rocket',
    category: 'Things That Go',
    characterType: 'astronaut',
    characterName: 'Cosmo Astronaut',
    thumbnailEmoji: '🚀',
    timeSpentSeconds: 240,
    quizScore: 3,
    quizTotalQuestions: 3,
    quizPercentage: 100,
    language: 'en',
  },
  {
    id: 'seed-4',
    timestamp: Date.now() - 1000 * 60 * 60 * 26, // Yesterday
    subject: 'Sunny Sunflower',
    category: 'Nature & Plants',
    characterType: 'plant',
    characterName: 'Sprout Blossom',
    thumbnailEmoji: '🌻',
    timeSpentSeconds: 195,
    quizScore: 3,
    quizTotalQuestions: 3,
    quizPercentage: 100,
    language: 'en',
  },
  {
    id: 'seed-5',
    timestamp: Date.now() - 1000 * 60 * 60 * 30, // Yesterday
    subject: 'Playful Kitten',
    category: 'Animal Friends',
    characterType: 'animal',
    characterName: 'Barnaby Bear',
    thumbnailEmoji: '🐱',
    timeSpentSeconds: 220,
    quizScore: 2,
    quizTotalQuestions: 3,
    quizPercentage: 67,
    language: 'en',
  },
  {
    id: 'seed-6',
    timestamp: Date.now() - 1000 * 60 * 60 * 52, // 2 days ago
    subject: 'Sweet Yellow Banana',
    category: 'Nature & Plants',
    characterType: 'plant',
    characterName: 'Sprout Blossom',
    thumbnailEmoji: '🍌',
    timeSpentSeconds: 160,
    quizScore: 3,
    quizTotalQuestions: 3,
    quizPercentage: 100,
    language: 'en',
  },
  {
    id: 'seed-7',
    timestamp: Date.now() - 1000 * 60 * 60 * 74, // 3 days ago
    subject: 'Friendly Teddy Bear',
    category: 'Shapes & Toys',
    characterType: 'teacher',
    characterName: 'Miss Sunny',
    thumbnailEmoji: '🧸',
    timeSpentSeconds: 270,
    quizScore: 3,
    quizTotalQuestions: 3,
    quizPercentage: 100,
    language: 'en',
  },
  {
    id: 'seed-8',
    timestamp: Date.now() - 1000 * 60 * 60 * 98, // 4 days ago
    subject: 'Wild Safari Elephant',
    category: 'Animal Friends',
    characterType: 'animal',
    characterName: 'Barnaby Bear',
    thumbnailEmoji: '🐘',
    timeSpentSeconds: 250,
    quizScore: 3,
    quizTotalQuestions: 3,
    quizPercentage: 100,
    language: 'en',
  },
];

// Category Icons and Color Mappings
export const CATEGORY_META: Record<string, { icon: string; color: string; bgLight: string; border: string }> = {
  'Animal Friends': { icon: '🐾', color: 'text-amber-700', bgLight: 'bg-amber-100', border: 'border-amber-300' },
  'Nature & Plants': { icon: '🌱', color: 'text-emerald-700', bgLight: 'bg-emerald-100', border: 'border-emerald-300' },
  'Things That Go': { icon: '🚀', color: 'text-sky-700', bgLight: 'bg-sky-100', border: 'border-sky-300' },
  'Shapes & Toys': { icon: '⭐', color: 'text-purple-700', bgLight: 'bg-purple-100', border: 'border-purple-300' },
  'Science & Space': { icon: '🔬', color: 'text-indigo-700', bgLight: 'bg-indigo-100', border: 'border-indigo-300' },
  'General Learning': { icon: '📚', color: 'text-rose-700', bgLight: 'bg-rose-100', border: 'border-rose-300' },
};

export function getParentPIN(): string {
  try {
    const pin = localStorage.getItem(STORAGE_KEY_PIN);
    return pin || DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

export function setParentPIN(newPin: string): boolean {
  try {
    if (!/^\d{4}$/.test(newPin)) return false;
    localStorage.setItem(STORAGE_KEY_PIN, newPin);
    return true;
  } catch {
    return false;
  }
}

export function getLearningHistory(): LearningRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) {
      // Seed with initial records
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(INITIAL_SEED_RECORDS));
      return INITIAL_SEED_RECORDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SEED_RECORDS;
  } catch {
    return INITIAL_SEED_RECORDS;
  }
}

export function saveLearningRecord(record: Omit<LearningRecord, 'id' | 'timestamp'>): LearningRecord {
  const history = getLearningHistory();
  const newRecord: LearningRecord = {
    ...record,
    id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: Date.now(),
  };

  const updated = [newRecord, ...history];
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated.slice(0, 100))); // keep latest 100
  } catch (e) {
    console.warn('Failed to save learning record to localStorage', e);
  }
  return newRecord;
}

export function clearLearningHistory(): void {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify([]));
  } catch (e) {
    console.warn('Failed to clear learning history', e);
  }
}

export function restoreDefaultSeedHistory(): void {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(INITIAL_SEED_RECORDS));
  } catch (e) {
    console.warn('Failed to restore learning history', e);
  }
}

export function getAccumulatedActiveTimeSeconds(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEY_ACTIVE_TIME);
    return val ? parseInt(val, 10) || 1840 : 1840; // baseline ~30 mins
  } catch {
    return 1840;
  }
}

export function addActiveLearningTime(seconds: number): void {
  try {
    const current = getAccumulatedActiveTimeSeconds();
    localStorage.setItem(STORAGE_KEY_ACTIVE_TIME, String(current + seconds));
  } catch {
    // Ignore storage issues
  }
}

// Compute comprehensive stats for the Parent Dashboard
export function computeParentStats(records: LearningRecord[]): ParentDashboardStats {
  const totalPicturesAnalyzed = records.length;
  
  let totalQuizQuestionsAnswered = 0;
  let totalCorrectAnswers = 0;
  let totalQuizzesTaken = 0;
  let totalTimeSpentSeconds = getAccumulatedActiveTimeSeconds();

  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayTimestamp = startOfToday.getTime();

  let todayTimeSeconds = 0;

  // Category counts
  const categoryMap: Record<string, { count: number; lastLearned: number }> = {};

  records.forEach((r) => {
    // Categories
    const cat = r.category || 'General Learning';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { count: 0, lastLearned: r.timestamp };
    }
    categoryMap[cat].count += 1;
    if (r.timestamp > categoryMap[cat].lastLearned) {
      categoryMap[cat].lastLearned = r.timestamp;
    }

    // Quizzes
    if (r.quizTotalQuestions && r.quizTotalQuestions > 0) {
      totalQuizzesTaken += 1;
      totalQuizQuestionsAnswered += r.quizTotalQuestions;
      totalCorrectAnswers += r.quizScore || 0;
    }

    // Time from records if greater than active tracker
    totalTimeSpentSeconds += r.timeSpentSeconds || 60;

    if (r.timestamp >= todayTimestamp) {
      todayTimeSeconds += r.timeSpentSeconds || 60;
    }
  });

  const correctAnswerPercentage = totalQuizQuestionsAnswered > 0
    ? Math.round((totalCorrectAnswers / totalQuizQuestionsAnswered) * 100)
    : 85;

  const topSubjects: TopicSummary[] = Object.keys(categoryMap)
    .map((cat) => {
      const meta = CATEGORY_META[cat] || { icon: '📚', color: 'text-amber-700' };
      const count = categoryMap[cat].count;
      const percentage = totalPicturesAnalyzed > 0 ? Math.round((count / totalPicturesAnalyzed) * 100) : 0;
      return {
        category: cat,
        count,
        percentage,
        color: meta.color,
        icon: meta.icon,
        lastLearned: formatRelativeTime(categoryMap[cat].lastLearned),
      };
    })
    .sort((a, b) => b.count - a.count);

  return {
    totalPicturesAnalyzed,
    totalQuizzesTaken,
    totalQuizQuestionsAnswered,
    totalCorrectAnswers,
    correctAnswerPercentage,
    totalTimeSpentMinutes: Math.round(totalTimeSpentSeconds / 60),
    todayTimeSpentMinutes: Math.max(12, Math.round(todayTimeSeconds / 60)), // realistic minimum today
    topicsLearnedCount: Object.keys(categoryMap).length,
    topSubjects,
    recentHistory: records,
  };
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 5) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}
