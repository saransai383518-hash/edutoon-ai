export type ScreenType = 'welcome' | 'home' | 'camera' | 'upload' | 'settings' | 'processing' | 'result' | 'language' | 'parent';

export type AppTheme = 'sky' | 'meadow' | 'bubblegum' | 'sunshine';

export type AppLanguage = 'en' | 'ta';

export type CartoonCharacterType = 'animal' | 'plant' | 'astronaut' | 'scientist' | 'teacher';

export interface CartoonCharacterInfo {
  type: CartoonCharacterType;
  name: string;
  role: string;
  explanation: string;
}

export interface IdentifiedElements {
  objects: string[];
  animals: string[];
  plants: string[];
  people: string[];
  places: string[];
  diagrams: string[];
  educationalContent: string[];
  textFound: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  encouragement: string;
}

export interface AIAnalysisResult {
  detectedSubject?: string;
  subjectType?: string;
  characterType?: CartoonCharacterType;
  characterName?: string;
  childFriendlyExplanation?: string;
  funFacts?: string[];
  suggestedVoiceStyle?: string;
  headline: string;
  mainSubject: string;
  primaryCategory: string;
  childDescription: string;
  funFact: string;
  cartoonCharacter?: CartoonCharacterInfo;
  identified: IdentifiedElements;
  quizQuestions?: QuizQuestion[];
}

export interface UserProfile {
  name: string;
  avatar: string;
  soundEnabled: boolean;
  theme: AppTheme;
  starsCollected: number;
  language: AppLanguage;
}

export interface ActivityCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  borderColor: string;
  shadowColor: string;
  sampleObjects: string[];
}

export interface SampleImage {
  id: string;
  title: string;
  category: string;
  emoji: string;
  imageUrl: string;
  color: string;
}

export interface LearningRecord {
  id: string;
  timestamp: number;
  subject: string;
  category: string;
  characterType: CartoonCharacterType;
  characterName: string;
  imageUrl?: string;
  thumbnailEmoji?: string;
  timeSpentSeconds: number;
  quizScore?: number;
  quizTotalQuestions?: number;
  quizPercentage?: number;
  language: AppLanguage;
}

export interface TopicSummary {
  category: string;
  count: number;
  percentage: number;
  color: string;
  icon: string;
  lastLearned: string;
}

export interface ParentDashboardStats {
  totalPicturesAnalyzed: number;
  totalQuizzesTaken: number;
  totalQuizQuestionsAnswered: number;
  totalCorrectAnswers: number;
  correctAnswerPercentage: number;
  totalTimeSpentMinutes: number;
  todayTimeSpentMinutes: number;
  topicsLearnedCount: number;
  topSubjects: TopicSummary[];
  recentHistory: LearningRecord[];
}
