import { CorePillar, Task } from '../types';
import { normalizePillar } from './dateUtils';

export interface DeepFocusConfig {
  enabled: boolean; // Manual toggle override
  autoDuringWorkHours: boolean; // Automatically engage during 9am-5pm Mon-Fri
  workHoursStart: number; // 9 = 9:00 AM
  workHoursEnd: number; // 17 = 5:00 PM
  collapsedPillars: Partial<Record<CorePillar, boolean>>; // Per-pillar collapsed state
}

export const DEEP_FOCUS_STORAGE_KEY = 'v2_life_infra_deep_focus_config';

/**
 * Default non-essential habit categories during typical workday hours
 * Household/Family Ops and discretionary Financial Health reviews add distraction
 * during focused work blocks, whereas Physical & Mental anchors protect vitality.
 */
export const DEFAULT_NON_ESSENTIAL_PILLARS: CorePillar[] = [
  'Household/Family Ops',
  'Financial Health',
];

export const DEFAULT_DEEP_FOCUS_CONFIG: DeepFocusConfig = {
  enabled: true, // Default to enabled so toggle is immediately active and perceptible
  autoDuringWorkHours: true,
  workHoursStart: 9,
  workHoursEnd: 17,
  collapsedPillars: {
    'Household/Family Ops': true,
    'Financial Health': true,
    'Physical Conditioning': false,
    'Mental Wellness': false,
  },
};

/**
 * Checks if current local time is within work hours (Mon-Fri 09:00 - 17:00 by default)
 */
export function isCurrentlyWorkHours(startHour = 9, endHour = 17): boolean {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 6 = Sat
  const isWeekday = day >= 1 && day <= 5;
  const hour = now.getHours();
  return isWeekday && hour >= startHour && hour < endHour;
}

/**
 * Formats work hours for human-readable display (e.g., "09:00 - 17:00 (Mon-Fri)")
 */
export function formatWorkHoursString(startHour = 9, endHour = 17): string {
  const formatH = (h: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12} ${ampm}`;
  };
  return `${formatH(startHour)} – ${formatH(endHour)} (M–F)`;
}

/**
 * Loads saved deep focus configuration with fallback to default
 */
export function loadDeepFocusConfig(): DeepFocusConfig {
  try {
    const raw = localStorage.getItem(DEEP_FOCUS_STORAGE_KEY);
    if (!raw) return DEFAULT_DEEP_FOCUS_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_DEEP_FOCUS_CONFIG,
      ...parsed,
      collapsedPillars: {
        ...DEFAULT_DEEP_FOCUS_CONFIG.collapsedPillars,
        ...(parsed.collapsedPillars || {}),
      },
    };
  } catch {
    return DEFAULT_DEEP_FOCUS_CONFIG;
  }
}

/**
 * Saves deep focus configuration to localStorage
 */
export function saveDeepFocusConfig(config: DeepFocusConfig): void {
  try {
    localStorage.setItem(DEEP_FOCUS_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save deep focus config:', err);
  }
}

/**
 * Evaluates whether Deep Focus mode is currently active based on manual toggle or work hours schedule
 */
export function isDeepFocusActive(config: DeepFocusConfig): boolean {
  if (config.enabled) return true;
  if (config.autoDuringWorkHours && isCurrentlyWorkHours(config.workHoursStart, config.workHoursEnd)) {
    return true;
  }
  return false;
}

/**
 * Identifies whether a habit is considered non-essential during work hours
 */
export function isTaskNonEssentialDuringWork(task: Task): boolean {
  // Non-negotiables are NEVER non-essential (they are core daily anchors)
  if (task.isNonNegotiable) return false;
  if (task.weight === 3) return false;

  const pillar = normalizePillar(task);

  // Household/Family Ops is inherently domestic/evening oriented
  if (pillar === 'Household/Family Ops') return true;

  // Discretionary finance reviews can be deferred outside of work focus blocks
  if (pillar === 'Financial Health' && (task.weight || 1) < 3) return true;

  // Evening-designated tasks are non-essential during work hours
  if (task.timeOfDay === 'Evening') return true;

  return false;
}
