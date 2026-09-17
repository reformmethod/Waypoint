import { Task, DayProgress, StreakStats, CorePillar, PillarScore } from '../types';

export const CORE_PILLARS: CorePillar[] = [
  'Physical Conditioning',
  'Household/Family Ops',
  'Financial Health',
  'Mental Wellness',
];

export function normalizePillar(task: Task): CorePillar {
  const p = (task.pillarType as string) || '';
  if (p === 'PHYSICAL' || p === 'Physical Conditioning' || p === 'Physical') {
    return 'Physical Conditioning';
  }
  if (p === 'FAMILY' || p === 'Household/Family Ops' || p === 'Social') {
    return 'Household/Family Ops';
  }
  if (p === 'FINANCE' || p === 'Financial Health' || p === 'Finance') {
    return 'Financial Health';
  }
  if (p === 'MENTAL' || p === 'Mental Wellness' || p === 'Mental' || p === 'Mental Health') {
    return 'Mental Wellness';
  }
  const cat = (task.category || '') as string;
  if (cat === 'Physical' || cat === 'Recovery') return 'Physical Conditioning';
  if (cat === 'Social') return 'Household/Family Ops';
  if (cat === 'Mental' || cat === 'Mental Health') return 'Mental Wellness';
  if (cat === 'Finance') return 'Financial Health';
  return 'Physical Conditioning';
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getDayLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function isHabitScheduledForDate(task: Task, dateStr: string): boolean {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  if (task.frequency === 'daily') return true;
  if (task.frequency === 'weekdays') return !isWeekend;
  if (task.frequency === 'weekends') return isWeekend;
  return true;
}

export function getLast7Days(): string[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    dates.push(formatDateOffset(-i));
  }
  return dates;
}

export function calculatePillarScores(tasks: Task[], dateStr: string): Record<CorePillar, PillarScore> {
  const result: Record<CorePillar, PillarScore> = {
    'Physical Conditioning': {
      pillar: 'Physical Conditioning',
      completedWeight: 0,
      totalWeight: 0,
      percentage: 0,
      tasksCount: 0,
      completedCount: 0,
    },
    'Household/Family Ops': {
      pillar: 'Household/Family Ops',
      completedWeight: 0,
      totalWeight: 0,
      percentage: 0,
      tasksCount: 0,
      completedCount: 0,
    },
    'Financial Health': {
      pillar: 'Financial Health',
      completedWeight: 0,
      totalWeight: 0,
      percentage: 0,
      tasksCount: 0,
      completedCount: 0,
    },
    'Mental Wellness': {
      pillar: 'Mental Wellness',
      completedWeight: 0,
      totalWeight: 0,
      percentage: 0,
      tasksCount: 0,
      completedCount: 0,
    },
  };

  tasks.forEach((task) => {
    if (isHabitScheduledForDate(task, dateStr)) {
      const pillar = normalizePillar(task);
      const weight = task.weight || 1;
      const isDone = task.completedDates.includes(dateStr);

      result[pillar].totalWeight += weight;
      result[pillar].tasksCount += 1;
      if (isDone) {
        result[pillar].completedWeight += weight;
        result[pillar].completedCount += 1;
      }
    }
  });

  CORE_PILLARS.forEach((p) => {
    const item = result[p];
    item.percentage = item.totalWeight > 0 ? Math.round((item.completedWeight / item.totalWeight) * 100) : 0;
  });

  return result;
}

export function calculateCumulativePillarScores(tasks: Task[], dates: string[]): Record<CorePillar, PillarScore> {
  const result: Record<CorePillar, PillarScore> = {
    'Physical Conditioning': {
      pillar: 'Physical Conditioning',
      completedWeight: 0,
      totalWeight: 0,
      percentage: 0,
      tasksCount: 0,
      completedCount: 0,
    },
    'Household/Family Ops': {
      pillar: 'Household/Family Ops',
      completedWeight: 0,
      totalWeight: 0,
      percentage: 0,
      tasksCount: 0,
      completedCount: 0,
    },
    'Financial Health': {
      pillar: 'Financial Health',
      completedWeight: 0,
      totalWeight: 0,
      percentage: 0,
      tasksCount: 0,
      completedCount: 0,
    },
    'Mental Wellness': {
      pillar: 'Mental Wellness',
      completedWeight: 0,
      totalWeight: 0,
      percentage: 0,
      tasksCount: 0,
      completedCount: 0,
    },
  };

  dates.forEach((dateStr) => {
    tasks.forEach((task) => {
      if (isHabitScheduledForDate(task, dateStr)) {
        const pillar = normalizePillar(task);
        const weight = task.weight || 1;
        const isDone = task.completedDates.includes(dateStr);

        result[pillar].totalWeight += weight;
        result[pillar].tasksCount += 1;
        if (isDone) {
          result[pillar].completedWeight += weight;
          result[pillar].completedCount += 1;
        }
      }
    });
  });

  CORE_PILLARS.forEach((p) => {
    const item = result[p];
    item.percentage = item.totalWeight > 0 ? Math.round((item.completedWeight / item.totalWeight) * 100) : 0;
  });

  return result;
}

export function calculateProgressForDays(tasks: Task[], dates: string[]): DayProgress[] {
  const today = getTodayDateString();

  return dates.map((dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.getDate();

    const scheduledTasks = tasks.filter((h) => isHabitScheduledForDate(h, dateStr));
    const completedTasks = scheduledTasks.filter((h) => h.completedDates.includes(dateStr));

    const nonNegotiables = scheduledTasks.filter((h) => h.isNonNegotiable);
    const nonNegotiablesCompleted = nonNegotiables.filter((h) => h.completedDates.includes(dateStr));

    const totalHabitsCount = scheduledTasks.length;
    const completedCount = completedTasks.length;
    const nnCount = nonNegotiables.length;
    const nnCompletedCount = nonNegotiablesCompleted.length;

    // Weighted percentage
    const totalWeight = scheduledTasks.reduce((acc, t) => acc + (t.weight || 1), 0);
    const completedWeight = completedTasks.reduce((acc, t) => acc + (t.weight || 1), 0);

    const percentage = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
    const allNonNegotiableCompleted = nnCount > 0 && nnCompletedCount === nnCount;

    return {
      date: dateStr,
      dayLabel,
      dayNumber,
      isToday: dateStr === today,
      totalHabits: totalHabitsCount,
      completedHabits: completedCount,
      nonNegotiableTotal: nnCount,
      nonNegotiableCompleted: nnCompletedCount,
      percentage,
      allNonNegotiableCompleted,
    };
  });
}

export function calculateStreakStats(tasks: Task[]): StreakStats {
  const today = getTodayDateString();
  const nonNegotiables = tasks.filter((h) => h.isNonNegotiable);

  // Total completions across all habits
  const totalCompletions = tasks.reduce((acc, h) => acc + h.completedDates.length, 0);

  // Check past 60 days to compute continuous streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Check if today is already completed
  const todayScheduledNN = nonNegotiables.filter((h) => isHabitScheduledForDate(h, today));
  const todayCompletedNN = todayScheduledNN.filter((h) => h.completedDates.includes(today));
  const todayAllDone = todayScheduledNN.length > 0 && todayCompletedNN.length === todayScheduledNN.length;

  // Check backwards from today or yesterday
  let checkOffset = todayAllDone ? 0 : -1;
  while (checkOffset >= -90) {
    const checkDate = formatDateOffset(checkOffset);
    const scheduledNN = nonNegotiables.filter((h) => isHabitScheduledForDate(h, checkDate));
    if (scheduledNN.length === 0) {
      checkOffset--;
      continue;
    }
    const allDone = scheduledNN.every((h) => h.completedDates.includes(checkDate));
    if (allDone) {
      currentStreak++;
      checkOffset--;
    } else {
      break;
    }
  }

  // Longest streak
  for (let offset = -90; offset <= 0; offset++) {
    const checkDate = formatDateOffset(offset);
    const scheduledNN = nonNegotiables.filter((h) => isHabitScheduledForDate(h, checkDate));
    if (scheduledNN.length === 0) continue;
    const allDone = scheduledNN.every((h) => h.completedDates.includes(checkDate));
    if (allDone) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // 7-day rate based on weighted completion
  const last7 = getLast7Days();
  let totalScheduled7Weight = 0;
  let totalCompleted7Weight = 0;
  last7.forEach((d) => {
    tasks.forEach((h) => {
      if (isHabitScheduledForDate(h, d)) {
        const w = h.weight || 1;
        totalScheduled7Weight += w;
        if (h.completedDates.includes(d)) {
          totalCompleted7Weight += w;
        }
      }
    });
  });
  const sevenDayRate =
    totalScheduled7Weight > 0 ? Math.round((totalCompleted7Weight / totalScheduled7Weight) * 100) : 0;

  // Life Infrastructure Index for today
  const todayPillars = calculatePillarScores(tasks, today);
  const pillarPercents = CORE_PILLARS.map((p) => todayPillars[p].percentage);
  const lifeInfrastructureIndex = Math.round(
    pillarPercents.reduce((a, b) => a + b, 0) / CORE_PILLARS.length
  );

  let recoveryMilestone = 'Day 1 Starter';
  if (currentStreak >= 90) recoveryMilestone = '90-Day Sovereign Protocol';
  else if (currentStreak >= 60) recoveryMilestone = '60-Day Resilient Engine';
  else if (currentStreak >= 30) recoveryMilestone = '30-Day High Performance';
  else if (currentStreak >= 14) recoveryMilestone = '2-Week Anchor Discipline';
  else if (currentStreak >= 7) recoveryMilestone = '7-Day Kinetic Momentum';
  else if (currentStreak >= 3) recoveryMilestone = '3-Day Foundation Build';
  else if (currentStreak >= 1) recoveryMilestone = 'Day 1 Executed';

  return {
    currentMomentumDays: currentStreak,
    bestMomentumDays: Math.max(longestStreak, currentStreak),
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalCompletions,
    sevenDayRate,
    recoveryMilestone,
    lifeInfrastructureIndex,
  };
}
