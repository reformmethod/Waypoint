import { Task, PillarType } from '../types';
import { formatDateOffset } from '../utils/dateUtils';

// Seed dates for past 3 days for baseline demonstration
const d1 = formatDateOffset(-1);
const d2 = formatDateOffset(-2);
const d3 = formatDateOffset(-3);

/**
 * V2 Life Infrastructure Default Seed Tasks
 * Conforms strictly to schema: id, title, description, pillarType, weight, isCompleted: false
 */
export const INITIAL_HABITS: Task[] = [
  {
    id: 'phys-001',
    title: 'Hit 180g Protein Target',
    name: 'Hit 180g Protein Target',
    description: 'Log daily macronutrient goal including any post-workout whey or hydrolysate.',
    notes: 'Log daily macronutrient goal including any post-workout whey or hydrolysate.',
    pillarType: 'PHYSICAL',
    category: 'Physical Conditioning',
    weight: 2,
    isCompleted: false,
    frequency: 'daily',
    icon: 'Dumbbell',
    isNonNegotiable: false,
    completedDates: [d3, d2, d1],
    createdAt: d3,
    targetMetric: '180g Lean Protein Target',
    timeOfDay: 'Daytime',
  },
  {
    id: 'phys-002',
    title: 'Log Primary Session',
    name: 'Log Primary Session',
    description: 'Track main conditioning block (Hyrox prep, interval run, or heavy lift).',
    notes: 'Track main conditioning block (Hyrox prep, interval run, or heavy lift).',
    pillarType: 'PHYSICAL',
    category: 'Physical Conditioning',
    weight: 3,
    isCompleted: false,
    frequency: 'daily',
    icon: 'Flame',
    isNonNegotiable: true,
    completedDates: [d3, d2, d1],
    createdAt: d3,
    targetMetric: 'Hyrox Prep / Interval Run / Heavy Lift',
    timeOfDay: 'Morning',
  },
  {
    id: 'fam-001',
    title: 'The Evening Reset',
    name: 'The Evening Reset',
    description: '15-minute sweep of core living spaces to find calm in the chaos before tomorrow.',
    notes: '15-minute sweep of core living spaces to find calm in the chaos before tomorrow.',
    pillarType: 'FAMILY',
    category: 'Household/Family Ops',
    weight: 2,
    isCompleted: false,
    frequency: 'daily',
    icon: 'Sparkles',
    isNonNegotiable: false,
    completedDates: [d3, d2, d1],
    createdAt: d3,
    targetMetric: '15-min core space sweep',
    timeOfDay: 'Evening',
  },
  {
    id: 'fam-002',
    title: 'Schedule Sync',
    name: 'Schedule Sync',
    description: 'Review tomorrow\'s calendar: school drop-offs, practitioner shifts, and training blocks.',
    notes: 'Review tomorrow\'s calendar: school drop-offs, practitioner shifts, and training blocks.',
    pillarType: 'FAMILY',
    category: 'Household/Family Ops',
    weight: 2,
    isCompleted: false,
    frequency: 'daily',
    icon: 'Users',
    isNonNegotiable: false,
    completedDates: [d3, d2, d1],
    createdAt: d3,
    targetMetric: 'Review tomorrow\'s schedule & training blocks',
    timeOfDay: 'Evening',
  },
  {
    id: 'fin-001',
    title: 'Zero-Spend Day',
    name: 'Zero-Spend Day',
    description: 'Successfully avoided any non-essential discretionary spending today.',
    notes: 'Successfully avoided any non-essential discretionary spending today.',
    pillarType: 'FINANCE',
    category: 'Financial Health',
    weight: 3,
    isCompleted: false,
    frequency: 'daily',
    icon: 'Wallet',
    isNonNegotiable: true,
    completedDates: [d3, d2, d1],
    createdAt: d3,
    targetMetric: '$0 discretionary spend',
    timeOfDay: 'Daytime',
  },
  {
    id: 'fin-002',
    title: 'Check Accounts',
    name: 'Check Accounts',
    description: 'Log in and review balances for 60 seconds to prevent financial avoidance.',
    notes: 'Log in and review balances for 60 seconds to prevent financial avoidance.',
    pillarType: 'FINANCE',
    category: 'Financial Health',
    weight: 1,
    isCompleted: false,
    frequency: 'daily',
    icon: 'Activity',
    isNonNegotiable: false,
    completedDates: [d3, d2, d1],
    createdAt: d3,
    targetMetric: '60s balance review',
    timeOfDay: 'Morning',
  },
  {
    id: 'men-001',
    title: 'Daily Psychosocial Check-in',
    name: 'Daily Psychosocial Check-in',
    description: 'Log current mood, stress, and behavioral triggers on a 1-10 scale.',
    notes: 'Log current mood, stress, and behavioral triggers on a 1-10 scale.',
    pillarType: 'MENTAL',
    category: 'Mental Wellness',
    weight: 3,
    isCompleted: false,
    frequency: 'daily',
    icon: 'Brain',
    isNonNegotiable: true,
    completedDates: [d3, d2, d1],
    createdAt: d3,
    targetMetric: '1-10 mood & trigger log',
    timeOfDay: 'Morning',
  },
  {
    id: 'men-002',
    title: 'Unstructured Downtime',
    name: 'Unstructured Downtime',
    description: '15 minutes of intentional nothingness. No screens, no podcasts.',
    notes: '15 minutes of intentional nothingness. No screens, no podcasts.',
    pillarType: 'MENTAL',
    category: 'Mental Wellness',
    weight: 2,
    isCompleted: false,
    frequency: 'daily',
    icon: 'Sun',
    isNonNegotiable: false,
    completedDates: [d3, d2, d1],
    createdAt: d3,
    targetMetric: '15 min zero-screen stillness',
    timeOfDay: 'Evening',
  },
];

interface PillarMeta {
  name: PillarType;
  shortName: string;
  description: string;
  colorHex: string;
  accent: string;
  bg: string;
  text: string;
  border: string;
  badge: string;
  glow: string;
  icon: string;
}

const physicalMeta: PillarMeta = {
  name: 'Physical Conditioning',
  shortName: 'Physical',
  description: 'Conditioning blocks, protein targets, aerobic threshold & recovery',
  colorHex: '#00f0ff',
  accent: 'cyan',
  bg: 'bg-cyan-500/10',
  text: 'text-cyan-400',
  border: 'border-cyan-500/30',
  badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
  glow: 'rgba(6,182,212,0.4)',
  icon: 'Dumbbell',
};

const familyMeta: PillarMeta = {
  name: 'Household/Family Ops',
  shortName: 'Family Ops',
  description: 'Evening resets, schedule syncs, presence & domestic stability',
  colorHex: '#10b981',
  accent: 'emerald',
  bg: 'bg-emerald-500/10',
  text: 'text-emerald-400',
  border: 'border-emerald-500/30',
  badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
  glow: 'rgba(16,185,129,0.4)',
  icon: 'Users',
};

const financeMeta: PillarMeta = {
  name: 'Financial Health',
  shortName: 'Financial',
  description: 'Zero-spend discipline, balance audits & avoidance defense',
  colorHex: '#f59e0b',
  accent: 'amber',
  bg: 'bg-amber-500/10',
  text: 'text-amber-400',
  border: 'border-amber-500/30',
  badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
  glow: 'rgba(245,158,11,0.4)',
  icon: 'Wallet',
};

const mentalMeta: PillarMeta = {
  name: 'Mental Wellness',
  shortName: 'Mental',
  description: 'Psychosocial check-ins, unstructured downtime & clarity',
  colorHex: '#818cf8',
  accent: 'indigo',
  bg: 'bg-indigo-500/10',
  text: 'text-indigo-400',
  border: 'border-indigo-500/30',
  badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 shadow-[0_0_12px_rgba(129,140,248,0.2)]',
  glow: 'rgba(129,140,248,0.4)',
  icon: 'Sun',
};

export const PILLAR_METADATA: Record<PillarType, PillarMeta> = {
  'Physical Conditioning': physicalMeta,
  PHYSICAL: physicalMeta,
  'Household/Family Ops': familyMeta,
  FAMILY: familyMeta,
  'Financial Health': financeMeta,
  FINANCE: financeMeta,
  'Mental Wellness': mentalMeta,
  MENTAL: mentalMeta,
};

// Fallback lookup for legacy code
export const CATEGORY_COLORS: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
    badge: string;
    accent: string;
    ring: string;
  }
> = {
  'Physical Conditioning': {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
    accent: 'cyan',
    ring: 'focus:ring-cyan-500',
  },
  PHYSICAL: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
    accent: 'cyan',
    ring: 'focus:ring-cyan-500',
  },
  'Household/Family Ops': {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    accent: 'emerald',
    ring: 'focus:ring-emerald-500',
  },
  FAMILY: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    accent: 'emerald',
    ring: 'focus:ring-emerald-500',
  },
  'Financial Health': {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    accent: 'amber',
    ring: 'focus:ring-amber-500',
  },
  FINANCE: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    accent: 'amber',
    ring: 'focus:ring-amber-500',
  },
  'Mental Wellness': {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 shadow-[0_0_12px_rgba(129,140,248,0.2)]',
    accent: 'indigo',
    ring: 'focus:ring-indigo-500',
  },
  MENTAL: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 shadow-[0_0_12px_rgba(129,140,248,0.2)]',
    accent: 'indigo',
    ring: 'focus:ring-indigo-500',
  },
  Physical: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    accent: 'cyan',
    ring: 'focus:ring-cyan-500',
  },
  Mental: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    accent: 'indigo',
    ring: 'focus:ring-indigo-500',
  },
  Social: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    accent: 'emerald',
    ring: 'focus:ring-emerald-500',
  },
  Finance: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    accent: 'amber',
    ring: 'focus:ring-amber-500',
  },
  Recovery: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    accent: 'cyan',
    ring: 'focus:ring-cyan-500',
  },
};
