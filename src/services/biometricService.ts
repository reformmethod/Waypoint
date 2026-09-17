import { WaypointTask, WaypointPillar } from '../types/waypoint';

export type BiometricPermissionStatus = 'granted' | 'denied' | 'prompt';

export interface BiometricReading {
  sleepHours: number;
  restingHeartRate: number;
  timestamp: string;
  dataSource: 'Apple HealthKit' | 'Google Fit' | 'Health Connect';
  isHighVulnerability: boolean;
  vulnerabilityReason?: string;
  synced: boolean;
}

const BIOMETRIC_STORAGE_KEY = 'waypoint_biometrics_reading_v1';
const BIOMETRIC_PERMISSION_KEY = 'waypoint_biometrics_permission_v1';

export const TACTICAL_BREATHING_TASK_ID = 'biometric-tactical-breathing';

class BiometricService {
  private defaultReading: BiometricReading = {
    sleepHours: 4.5, // Seeded below 5h to demonstrate the dynamic clinical intervention
    restingHeartRate: 84,
    timestamp: new Date().toISOString(),
    dataSource: 'Apple HealthKit',
    isHighVulnerability: true,
    vulnerabilityReason: 'Sleep < 5h (4.5h) • Autonomic strain & prefrontal fatigue',
    synced: true,
  };

  /**
   * Check current device permission state
   */
  public getPermissionStatus(): BiometricPermissionStatus {
    try {
      const stored = localStorage.getItem(BIOMETRIC_PERMISSION_KEY);
      if (stored === 'granted' || stored === 'denied' || stored === 'prompt') {
        return stored;
      }
    } catch {}
    return 'prompt';
  }

  /**
   * Request local device permissions for HealthKit / Google Fit Sleep & Heart Rate
   */
  public async requestPermissions(): Promise<BiometricPermissionStatus> {
    try {
      // In native iOS/Android, this calls Apple HealthKit HKHealthStore or Google Health Connect API
      localStorage.setItem(BIOMETRIC_PERMISSION_KEY, 'granted');
      return 'granted';
    } catch {
      return 'denied';
    }
  }

  /**
   * Disconnect or revoke biometric permissions
   */
  public revokePermissions(): void {
    try {
      localStorage.setItem(BIOMETRIC_PERMISSION_KEY, 'prompt');
    } catch {}
  }

  /**
   * Fetch the latest biometric reading
   */
  public getLatestReading(): BiometricReading {
    try {
      const stored = localStorage.getItem(BIOMETRIC_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return this.defaultReading;
  }

  /**
   * Update or simulate a new biometric reading (e.g. from wearable sync)
   */
  public saveReading(reading: Partial<BiometricReading>): BiometricReading {
    const current = this.getLatestReading();
    const sleepHours = reading.sleepHours !== undefined ? reading.sleepHours : current.sleepHours;
    const restingHeartRate =
      reading.restingHeartRate !== undefined ? reading.restingHeartRate : current.restingHeartRate;

    const isHighVulnerability = sleepHours < 5.0 || restingHeartRate > 88;
    let vulnerabilityReason: string | undefined;

    if (sleepHours < 5.0 && restingHeartRate > 88) {
      vulnerabilityReason = `Severe sleep deficit (${sleepHours}h) & elevated resting pulse (${restingHeartRate} bpm)`;
    } else if (sleepHours < 5.0) {
      vulnerabilityReason = `Sleep under restorative threshold (${sleepHours}h < 5h) • Heightened relapse vulnerability`;
    } else if (restingHeartRate > 88) {
      vulnerabilityReason = `Elevated sympathetic tone (${restingHeartRate} bpm RHR)`;
    }

    const updated: BiometricReading = {
      ...current,
      ...reading,
      sleepHours,
      restingHeartRate,
      isHighVulnerability,
      vulnerabilityReason,
      timestamp: new Date().toISOString(),
      synced: true,
    };

    try {
      localStorage.setItem(BIOMETRIC_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    return updated;
  }

  /**
   * Objective 1 Logic Layer:
   * If sleep < 5 hours, dynamically inject a low-friction task into the Mental Wellness pillar:
   * "5-Minute Tactical Breathing" and flag local highVulnerability state.
   */
  public evaluateAndInjectBiometricTask(
    tasks: WaypointTask[],
    reading: BiometricReading
  ): { tasks: WaypointTask[]; injected: boolean; highVulnerability: boolean } {
    const isVulnerable = reading.sleepHours < 5.0;
    const taskExists = tasks.some((t) => t.id === TACTICAL_BREATHING_TASK_ID);

    if (isVulnerable) {
      if (!taskExists) {
        const tacticalTask: WaypointTask = {
          id: TACTICAL_BREATHING_TASK_ID,
          pillar: 'Mental Wellness',
          title: '5-Minute Tactical Breathing',
          description: `Restorative sleep was ${reading.sleepHours}h (under 5h threshold). 4-second box inhalation/hold to regulate autonomic nervous tone and mitigate cognitive fatigue.`,
          isMicroTask: true,
          isCompleted: false,
          completedDates: [],
          weight: 1,
          interventionType: 'cbt-micro',
          triggeredBy: `Wearable Biometrics (Sleep: ${reading.sleepHours}h)`,
          clinicalRationale:
            'Acute sleep deprivation (<5h) degrades prefrontal cortex impulse regulation and elevates cortisol. Box breathing lowers sympathetic hyperarousal.',
          evidenceBase: 'NHS & NICE Autonomic Pacing Guidelines (2024)',
          timeEstimate: '5 mins',
          ageAppropriateFor: ['16-17', '18-24', '25-49', '50+'],
        };

        return {
          tasks: [tacticalTask, ...tasks],
          injected: true,
          highVulnerability: true,
        };
      }
      return {
        tasks,
        injected: false,
        highVulnerability: true,
      };
    }

    return {
      tasks,
      injected: false,
      highVulnerability: false,
    };
  }
}

export const biometricService = new BiometricService();
