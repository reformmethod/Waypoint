import {
  PushNotificationScheduleConfig,
  NotificationPermissionState,
  WaypointTask,
} from '../types/waypoint';

const NOTIFICATION_CONFIG_KEY = 'waypoint_push_schedule_config_v1';

export const DEFAULT_NOTIFICATION_CONFIG: PushNotificationScheduleConfig = {
  enabled: true,
  scheduledTime: '18:00', // 6:00 PM evening check-in
  soundEnabled: true,
};

export const PRESET_TIMES = [
  { time: '09:00', label: 'Morning Anchor (9:00 AM)', desc: 'Start the day clear' },
  { time: '13:00', label: 'Midday Reset (1:00 PM)', desc: 'Midday check' },
  { time: '18:00', label: 'Evening Guardrail (6:00 PM)', desc: 'Secure daily non-negotiables' },
  { time: '20:30', label: 'Night Wind-Down (8:30 PM)', desc: 'Pre-bedtime check' },
];

/**
 * Checks whether a task is deemed a non-negotiable anchor.
 * Explicit boolean takes precedence; otherwise weight 3 represents statutory non-negotiables.
 */
export function isTaskNonNegotiable(task: WaypointTask): boolean {
  if (task.isNonNegotiable !== undefined) {
    return task.isNonNegotiable;
  }
  return task.weight === 3;
}

/**
 * Filters for pending non-negotiables that have not yet been marked completed.
 */
export function getPendingNonNegotiables(tasks: WaypointTask[]): WaypointTask[] {
  return tasks.filter((t) => isTaskNonNegotiable(t) && !t.isCompleted);
}

/**
 * Retrieves the stored push notification scheduling configuration.
 */
export function getStoredNotificationConfig(): PushNotificationScheduleConfig {
  try {
    const raw = localStorage.getItem(NOTIFICATION_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_NOTIFICATION_CONFIG,
        ...parsed,
      };
    }
  } catch (err) {
    console.error('Error reading push notification configuration:', err);
  }
  return DEFAULT_NOTIFICATION_CONFIG;
}

/**
 * Persists the push notification scheduling configuration.
 */
export function saveStoredNotificationConfig(config: PushNotificationScheduleConfig): void {
  try {
    localStorage.setItem(NOTIFICATION_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving push notification configuration:', err);
  }
}

/**
 * Checks current browser notification permission status.
 */
export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
}

/**
 * Prompts user for browser notification permission.
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const perm = await Notification.requestPermission();
    return perm as NotificationPermissionState;
  } catch (err) {
    console.warn('Error requesting Notification permission:', err);
    return Notification.permission as NotificationPermissionState;
  }
}

/**
 * Gentle, auditory chime using the Web Audio API without requiring external audio assets.
 */
export function playNotificationChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    
    // Smooth 3-tone harmonic chime: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz)
    const tones = [523.25, 659.25, 783.99];
    tones.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.08, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.55);
    });
  } catch (err) {
    // Audio contexts might be blocked until user gesture, safely ignored
    console.debug('Chime audio playback prevented or not permitted yet', err);
  }
}

/**
 * Fires a native desktop/mobile browser notification if supported and granted.
 */
export function dispatchNativeBrowserNotification(options: {
  title: string;
  body: string;
  tag?: string;
  onClick?: () => void;
}): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: options.tag || 'waypoint-notification',
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      if (options.onClick) {
        options.onClick();
      }
      notification.close();
    };

    return true;
  } catch (err) {
    console.warn('Native Notification could not be instantiated:', err);
    return false;
  }
}

/**
 * Formats 24h string (e.g. "18:00") into readable 12h format ("6:00 PM").
 */
export function formatTime12Hour(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24;
  const [hourStr, minStr] = time24.split(':');
  const h = parseInt(hourStr, 10);
  const m = parseInt(minStr, 10);
  if (isNaN(h) || isNaN(m)) return time24;

  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  const displayM = m < 10 ? `0${m}` : `${m}`;
  return `${displayH}:${displayM} ${ampm}`;
}

/**
 * Computes remaining time until next scheduled time today or tomorrow.
 */
export function getTimeUntilNextNotification(scheduledTime: string): string {
  if (!scheduledTime || !scheduledTime.includes(':')) return '';
  const [targetH, targetM] = scheduledTime.split(':').map((n) => parseInt(n, 10));
  if (isNaN(targetH) || isNaN(targetM)) return '';

  const now = new Date();
  const target = new Date();
  target.setHours(targetH, targetM, 0, 0);

  if (target.getTime() <= now.getTime()) {
    // Scheduled time has passed for today, next is tomorrow
    target.setDate(target.getDate() + 1);
  }

  const diffMs = target.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours === 0 && diffMins === 0) {
    return 'in less than a minute';
  }
  if (diffHours === 0) {
    return `in ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
  }
  return `in ${diffHours} hr${diffHours !== 1 ? 's' : ''} ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
}
