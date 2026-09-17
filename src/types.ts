export type PillarTypeEnum = 'PHYSICAL' | 'FAMILY' | 'FINANCE' | 'MENTAL';

export type CorePillar =
  | 'Physical Conditioning'
  | 'Household/Family Ops'
  | 'Financial Health'
  | 'Mental Wellness';

export type PillarType = PillarTypeEnum | CorePillar;

// For backward-compatibility with any legacy references
export type Category =
  | PillarType
  | 'Physical'
  | 'Mental'
  | 'Social'
  | 'Recovery'
  | 'Mental Health'
  | 'Finance';

export type TaskWeight = 1 | 2 | 3;

export type Frequency = 'daily' | 'weekdays' | 'weekends';

export interface Task {
  id: string;
  title: string;
  description: string;
  pillarType: PillarType;
  weight: TaskWeight; // Integer 1-3
  isCompleted: boolean; // Defaults to false daily

  // Backward and extended compatibility fields
  name?: string; // Fallback alias for title
  notes?: string; // Fallback alias for description
  category?: Category;
  frequency?: Frequency;
  icon?: string;
  isNonNegotiable?: boolean;
  completedDates?: string[]; // ISO Date strings 'YYYY-MM-DD'
  createdAt?: string;
  targetMetric?: string; // e.g. "180g protein", "5km Run", "$0 spend"
  timeOfDay?: 'Morning' | 'Daytime' | 'Evening';
}

// Synonymous with Task for backwards compatibility
export type Habit = Task;

export type ScreenType = 'dashboard' | 'add-habit' | 'progress';

export interface PillarScore {
  pillar: CorePillar;
  completedWeight: number;
  totalWeight: number;
  percentage: number;
  tasksCount: number;
  completedCount: number;
}

export interface DayProgress {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g., 'Mon'
  dayNumber: number; // e.g., 14
  isToday: boolean;
  totalHabits: number;
  completedHabits: number;
  nonNegotiableTotal: number;
  nonNegotiableCompleted: number;
  percentage: number;
  allNonNegotiableCompleted: boolean;
  pillarScores?: Record<CorePillar, PillarScore>;
}

export interface ResilienceStats {
  currentMomentumDays: number;
  bestMomentumDays: number;
  totalCompletions: number;
  sevenDayRate: number;
  recoveryMilestone: string;
  lifeInfrastructureIndex: number; // 0 - 100 overall weighted readiness
  // Legacy aliases for internal components
  currentStreak?: number;
  longestStreak?: number;
}

export type StreakStats = ResilienceStats;

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
  sponsorName?: string;
  sponsorPhone?: string;
}
