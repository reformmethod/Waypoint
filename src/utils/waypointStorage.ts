import {
  WaypointUserProfile,
  WaypointTask,
  AnonymizedTelemetryPacket,
  AuthUser,
  ReparationLogEntry,
  ETEDayRecord,
} from '../types/waypoint';
import { INITIAL_ANONYMIZED_TELEMETRY } from '../data/waypointData';
import { interventionMapper } from '../services/InterventionMapper';

const USER_PROFILE_KEY = 'waypoint_local_user_profile_v4';
const TASKS_KEY = 'waypoint_local_tasks_v4';
const TELEMETRY_KEY = 'waypoint_anonymized_telemetry_v4';
const AUTH_SESSION_KEY = 'waypoint_auth_session_v5';
const REPARATION_LOG_KEY = 'waypoint_reparation_logs_v1';
const ETE_RECORDS_KEY = 'waypoint_ete_records_v1';

// Demo Auth Profiles
export const DEMO_PERSONAL_USER: AuthUser = {
  id: 'usr-personal-409',
  email: 'alex.morgan@waypoint.nhs.uk',
  name: 'Alex Morgan',
  role: 'Personal',
  orgCode: 'NHS-01',
  lastLogin: new Date().toISOString(),
};

export const DEMO_ORG_USER: AuthUser = {
  id: 'usr-org-802',
  email: 'dr.sarah.chen@leeds.nhs.uk',
  name: 'Dr. Sarah Chen',
  role: 'Organization',
  orgCode: 'NHS-01',
  practitionerRole: 'Lead Addiction Consultant (GMC #6849201)',
  lastLogin: new Date().toISOString(),
};

export function getAuthSession(): AuthUser | null {
  try {
    const data = localStorage.getItem(AUTH_SESSION_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading auth session', e);
  }
  return null;
}

export function saveAuthSession(user: AuthUser): void {
  try {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Error saving auth session', e);
  }
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
  } catch (e) {
    console.error('Error clearing auth session', e);
  }
}

// Default initial user profile
export const DEFAULT_USER_PROFILE: WaypointUserProfile = {
  id: 'local-user-anon-409',
  ageBracket: '18-24',
  cognitiveMode: 'tiny-steps',
  microTaskMode: true,
  sensoryMode: 'standard',
  focusAreas: ['ALCOHOL', 'MENTAL-HEALTH'],
  supportPathways: ['alcohol', 'mental-health'],
  orgCode: 'NHS-01',
  onboardingCompleted: false,
  createdAt: new Date().toISOString(),
};

/**
 * Local-First Storage Handler
 * Strict Data Privacy: All user data stays on device via SQLite/Local Storage.
 */
export function getLocalUserProfile(): WaypointUserProfile {
  try {
    const data = localStorage.getItem(USER_PROFILE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading local user profile', e);
  }
  return DEFAULT_USER_PROFILE;
}

export function saveLocalUserProfile(profile: WaypointUserProfile): void {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving local user profile', e);
  }
}

/**
 * Objective 2: Dynamic Psychosocial Intervention Generation
 * Pulls existing tasks or generates tailored evidence-based tasks via InterventionMapper.
 */
export function getLocalTasks(profile: WaypointUserProfile): WaypointTask[] {
  try {
    const data = localStorage.getItem(TASKS_KEY);
    if (data) {
      const parsed: WaypointTask[] = JSON.parse(data);
      if (parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading local tasks', e);
  }

  // Use InterventionMapper to dynamically generate evidence-based tasks from clinical triage
  const initial = interventionMapper.generateDailyInterventions(profile);
  saveLocalTasks(initial);
  return initial;
}

export function saveLocalTasks(tasks: WaypointTask[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving local tasks', e);
  }
}

/**
 * Anonymized Telemetry Sync Engine (Objective 3)
 * Strict Privacy: Only de-identified metric telemetry is queued for organization views.
 * Zero PII, zero notes, zero task descriptions.
 */
export function getAnonymizedTelemetry(): AnonymizedTelemetryPacket[] {
  try {
    const data = localStorage.getItem(TELEMETRY_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading telemetry queue', e);
  }
  // Initialize with nationwide seed dataset if empty
  try {
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(INITIAL_ANONYMIZED_TELEMETRY));
  } catch {}
  return INITIAL_ANONYMIZED_TELEMETRY;
}

export function recordAnonymizedTelemetryEvent(
  packet: Omit<AnonymizedTelemetryPacket, 'id' | 'timestamp'>
): void {
  try {
    const existing = getAnonymizedTelemetry();
    const newPacket: AnonymizedTelemetryPacket = {
      ...packet,
      id: `pkt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newPacket, ...existing];
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error recording anonymized telemetry', e);
  }
}

/**
 * V22 Reparation Log Storage (Directive 3)
 * Stored locally on device under AssetPlus restorative_justice pathway.
 */
export function getReparationLogs(): ReparationLogEntry[] {
  try {
    const data = localStorage.getItem(REPARATION_LOG_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading reparation logs', e);
  }
  // Default sample entry if empty
  const defaultEntry: ReparationLogEntry = {
    id: 'rep-init-01',
    hoursCompleted: 2,
    description: 'Helped clear and plant in the community garden',
    date: new Date().toISOString().slice(0, 10),
    pathway: 'restorative_justice',
    createdAt: new Date().toISOString(),
  };
  return [defaultEntry];
}

export function saveReparationLog(
  entry: Omit<ReparationLogEntry, 'id' | 'createdAt'>
): ReparationLogEntry {
  const existing = getReparationLogs();
  const newEntry: ReparationLogEntry = {
    ...entry,
    id: `rep-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newEntry, ...existing];
  try {
    localStorage.setItem(REPARATION_LOG_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving reparation log', e);
  }
  return newEntry;
}

export function getTotalReparationHoursThisMonth(): number {
  const logs = getReparationLogs();
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthLogs = logs.filter((l) => l.date && l.date.startsWith(currentMonth));
  const total = monthLogs.reduce((acc, curr) => acc + (curr.hoursCompleted || 0), 0);
  return Math.round(total * 10) / 10;
}

/**
 * V22 ETE Micro-Tracker Day Records (Directive 4)
 * Uses the non-punitive Resilience Score pattern — a missed day holds, never resets.
 */
export function getETEDayRecords(): ETEDayRecord[] {
  try {
    const data = localStorage.getItem(ETE_RECORDS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading ETE records', e);
  }
  return [];
}

export function saveETEDayRecord(record: ETEDayRecord): void {
  const existing = getETEDayRecords().filter((r) => r.date !== record.date);
  const updated = [record, ...existing];
  try {
    localStorage.setItem(ETE_RECORDS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving ETE record', e);
  }
}

