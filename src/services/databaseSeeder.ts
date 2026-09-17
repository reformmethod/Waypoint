import { Task, PillarType, TaskWeight } from '../types';
import { getTodayDateString, formatDateOffset } from '../utils/dateUtils';

/**
 * Raw Seed Data JSON from V2 Life Infrastructure specification
 */
export const V2_SEED_DATA = [
  {
    id: 'phys-001',
    title: 'Hit 180g Protein Target',
    description: 'Log daily macronutrient goal including any post-workout whey or hydrolysate.',
    pillarType: 'PHYSICAL' as PillarType,
    weight: 2 as TaskWeight,
  },
  {
    id: 'phys-002',
    title: 'Log Primary Session',
    description: 'Track main conditioning block (Hyrox prep, interval run, or heavy lift).',
    pillarType: 'PHYSICAL' as PillarType,
    weight: 3 as TaskWeight,
  },
  {
    id: 'fam-001',
    title: 'The Evening Reset',
    description: '15-minute sweep of core living spaces to find calm in the chaos before tomorrow.',
    pillarType: 'FAMILY' as PillarType,
    weight: 2 as TaskWeight,
  },
  {
    id: 'fam-002',
    title: 'Schedule Sync',
    description: 'Review tomorrow\'s calendar: school drop-offs, practitioner shifts, and training blocks.',
    pillarType: 'FAMILY' as PillarType,
    weight: 2 as TaskWeight,
  },
  {
    id: 'fin-001',
    title: 'Zero-Spend Day',
    description: 'Successfully avoided any non-essential discretionary spending today.',
    pillarType: 'FINANCE' as PillarType,
    weight: 3 as TaskWeight,
  },
  {
    id: 'fin-002',
    title: 'Check Accounts',
    description: 'Log in and review balances for 60 seconds to prevent financial avoidance.',
    pillarType: 'FINANCE' as PillarType,
    weight: 1 as TaskWeight,
  },
  {
    id: 'men-001',
    title: 'Daily Psychosocial Check-in',
    description: 'Log current mood, stress, and behavioral triggers on a 1-10 scale.',
    pillarType: 'MENTAL' as PillarType,
    weight: 3 as TaskWeight,
  },
  {
    id: 'men-002',
    title: 'Unstructured Downtime',
    description: '15 minutes of intentional nothingness. No screens, no podcasts.',
    pillarType: 'MENTAL' as PillarType,
    weight: 2 as TaskWeight,
  },
];

export const V2_STORAGE_KEY = 'v2_life_infrastructure_tasks';
export const V2_INIT_FLAG = 'v2_life_infrastructure_seeded';
export const LAST_ACTIVE_DATE_KEY = 'v2_life_infrastructure_last_date';

/**
 * Builds standard Task models from seed data with daily defaults and baseline past completions
 * to ensure immediate, rich radar visualization out of the box.
 */
export function buildInitialV2Tasks(): Task[] {
  const today = getTodayDateString();
  const d1 = formatDateOffset(-1);
  const d2 = formatDateOffset(-2);
  const d3 = formatDateOffset(-3);

  // Icon mapping for high-performance dashboard UI
  const iconMap: Record<string, string> = {
    'phys-001': 'Dumbbell',
    'phys-002': 'Flame',
    'fam-001': 'Sparkles',
    'fam-002': 'Users',
    'fin-001': 'Wallet',
    'fin-002': 'Activity',
    'men-001': 'Brain',
    'men-002': 'Sun',
  };

  return V2_SEED_DATA.map((seed) => {
    // Provide 2-3 previous days of completions for initial radar demonstration,
    // while keeping today defaults to false (uncompleted) as required.
    const completedDates = [d3, d2, d1];
    const isCompleted = false; // Defaults to false daily as specified

    return {
      id: seed.id,
      title: seed.title,
      name: seed.title, // Backward compatibility alias
      description: seed.description,
      notes: seed.description, // Backward compatibility alias
      pillarType: seed.pillarType,
      weight: seed.weight,
      isCompleted,
      frequency: 'daily',
      icon: iconMap[seed.id] || 'Target',
      isNonNegotiable: seed.weight === 3,
      completedDates,
      createdAt: d3,
      targetMetric: seed.title,
    };
  });
}

/**
 * Specific database initialization sequence for V2 Life Infrastructure app.
 *
 * Populates the state management system with the default set of tasks when the user
 * opens the application for the first time.
 *
 * Safe Seeding Guarantee:
 * - Checks persistent storage (localStorage / AsyncStorage / SQLite).
 * - If user data already exists, it parses and returns existing tasks without overwriting.
 * - If first launch, parses the V2 seed JSON, stores it, and sets the initialization flag.
 * - Handles daily rollover: if user opens on a new calendar date, resets `isCompleted`
 *   to false daily while preserving historical `completedDates`.
 *
 * @returns {Task[]} The active array of user tasks
 */
export function seedDatabaseOnFirstLaunch(): Task[] {
  const today = getTodayDateString();

  try {
    const isSeeded = localStorage.getItem(V2_INIT_FLAG);
    const existingRaw = localStorage.getItem(V2_STORAGE_KEY);
    const lastActiveDate = localStorage.getItem(LAST_ACTIVE_DATE_KEY);

    // If already seeded and existing data exists, DO NOT OVERWRITE
    if (isSeeded && existingRaw) {
      const parsedTasks: Task[] = JSON.parse(existingRaw);

      // Perform daily rollover check: if new day, update isCompleted based on today
      if (lastActiveDate !== today) {
        const rolledOverTasks = parsedTasks.map((t) => {
          const isDoneToday = (t.completedDates || []).includes(today);
          return {
            ...t,
            isCompleted: isDoneToday,
            // Ensure title and description are populated
            title: t.title || t.name || 'Untitled Protocol',
            description: t.description || t.notes || '',
          };
        });

        localStorage.setItem(V2_STORAGE_KEY, JSON.stringify(rolledOverTasks));
        localStorage.setItem(LAST_ACTIVE_DATE_KEY, today);
        return rolledOverTasks;
      }

      return parsedTasks;
    }

    // First launch: Inject V2 seed JSON into state management
    const initialTasks = buildInitialV2Tasks();
    localStorage.setItem(V2_STORAGE_KEY, JSON.stringify(initialTasks));
    localStorage.setItem(V2_INIT_FLAG, 'true');
    localStorage.setItem(LAST_ACTIVE_DATE_KEY, today);

    console.info('[V2 Database Seeder]: First launch detected. Injected 8 V2 Life Infrastructure tasks.');
    return initialTasks;
  } catch (error) {
    console.warn('[V2 Database Seeder]: Storage unavailable or parse error, returning in-memory seed:', error);
    return buildInitialV2Tasks();
  }
}

/**
 * Persists updated task array to storage
 */
export function persistTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(V2_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('[V2 Database Seeder]: Failed to persist tasks:', error);
  }
}
