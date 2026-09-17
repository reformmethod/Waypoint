export type UserRole = 'Personal' | 'Staff' | 'Organization' | 'Admin';

export interface StaffInviteCode {
  id: string;
  code: string;
  staffName: string;
  staffEmail: string;
  role: string;
  orgCode: string;
  orgName: string;
  createdAt: string;
  expiresAt: string;
  maxUses: number;
  timesUsed: number;
  status: 'active' | 'redeemed' | 'revoked' | 'expired';
  createdBy: string;
  notes?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  orgCode: string;
  orgName: string;
  joinedAt: string;
  lastActive: string;
  status: 'active' | 'inactive';
  caseloadCount: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  orgCode?: string;
  practitionerRole?: string;
  lastLogin: string;
  staffInviteCodeUsed?: string;
  twoFactorVerified?: boolean;
  isLeadPractitioner?: boolean;
}

export type AgeBracket = 'under-16' | '16-17' | '18-24' | '25-49' | '50+';

export type CognitiveMode = 'big-goals' | 'tiny-steps';

export type SensoryMode = 'standard' | 'low-stimulation';

export type SupportPathwayId = 'alcohol' | 'substances' | 'mental-health' | 'financial' | 'general' | 'youth_justice';

export type WaypointPillar =
  | 'Physical Conditioning'
  | 'Household/Family Ops'
  | 'Financial Health'
  | 'Mental Wellness';

export type InterventionType =
  | 'harm-reduction'    // SADQ / High AUDIT
  | 'trigger-mapping'   // DUDIT
  | 'cbt-micro'         // PHQ-9 / GAD-7
  | 'financial-infra'   // Financial Focus
  | 'foundation'        // Circadian, Hydration, Executive resets
  | 'youth-restorative' // Child-First Restorative Justice & Empathy Checks
  | 'yjs-action';       // YJS Education, Training & Worker Prep

export interface WaypointUserProfile {
  id: string;
  ageBracket: AgeBracket;
  cognitiveMode: CognitiveMode;
  microTaskMode: boolean;
  sensoryMode: SensoryMode;
  focusAreas: string[];
  supportPathways: SupportPathwayId[];
  orgCode?: string;
  onboardingCompleted: boolean;
  createdAt: string;

  // Exact Local Clinical Scores (Stored strictly on-device SQLite)
  baselineAuditScore?: number;
  baselineSadqScore?: number;
  baselineDuditScore?: number;
  baselineGad7Score?: number;
  baselinePhq9Score?: number;
  baselineCrafftScore?: number;
  baselineWemwbsScore?: number;

  // Clinical Risk Bands (Used for UI display and aggregated telemetry)
  auditBand?: 'Low' | 'Hazardous' | 'Harmful' | 'Severe';
  sadqBand?: 'Mild' | 'Moderate' | 'Severe';
  duditBand?: 'Low' | 'Harmful' | 'Severe';
  gad7Band?: 'Minimal' | 'Mild' | 'Moderate' | 'Severe';
  phq9Band?: 'Minimal' | 'Mild' | 'Moderate' | 'Moderately Severe' | 'Severe';
  crafftBand?: 'Low' | 'Elevated';
  wemwbsBand?: 'Low' | 'Moderate' | 'High';

  // Tracking which clinical paths were triggered in OnboardingTriageController
  triagePathwaysTriggered?: string[];

  // V22 SLCN-Aware Communication Profile (Reading Age 10 Accessibility)
  communicationPreference?: CommunicationPreferences;
  communicationSupportSuggested?: boolean;
  comprehensionCheckCompleted?: boolean;
}

export type CommunicationPreferences = 'text' | 'voice' | 'both';

export type YjsAppointmentKind = 'key_worker' | 'court' | 'reparation' | 'training';

export interface YjsAppointment {
  id: string;
  kind: YjsAppointmentKind;
  title: string;
  workerName?: string;
  role?: string;
  scheduledAt: string; // ISO date string or formatted date
  location: string;
  notes?: string;
  syncedToCalendar?: boolean;
  courtDetails?: {
    courtName: string;
    room?: string;
    solicitorName?: string;
  };
}

export interface ReparationLogEntry {
  id: string;
  hoursCompleted: number;
  description: string;
  date: string; // YYYY-MM-DD
  pathway: 'restorative_justice';
  voiceNoteRecorded?: boolean;
  createdAt: string;
}

export interface ETEMicroTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface ETEDayRecord {
  date: string; // YYYY-MM-DD
  attended: boolean | null; // true (attended), false (missed - holds resilience), null (unlogged)
  streakHeld: boolean;
  notes?: string;
  tasksCompleted: string[];
}

export interface ContinuityPassSummary {
  id: string;
  generatedAt: string;
  anonymisedReference: string; // e.g. "WP-YJS-411"
  ageAtTransition: number;
  whatHelped: string[];
  whatDidntHelp: string[];
  assetPlusPathwaysSummary: {
    pathway: string;
    status: 'stable' | 'progressing' | 'needs-support';
    notes: string;
  }[];
  resilienceTrend: string;
  communicationNotes: string;
}

export interface WaypointTask {
  id: string;
  pillar: WaypointPillar;
  title: string;
  description: string;
  isMicroTask: boolean;
  isCompleted: boolean;
  completedDates: string[]; // YYYY-MM-DD
  weight: 1 | 2 | 3;
  targetMetric?: string;
  ageAppropriateFor: AgeBracket[];

  // Clinical Intervention Metadata
  interventionType: InterventionType;
  clinicalRationale?: string;
  evidenceBase?: string;
  timeEstimate?: string;
  triggeredBy?: string; // e.g. "SADQ (High Alcohol Dependence)" or "PHQ-9 (CBT Mood)"
  isNonNegotiable?: boolean;
}

export interface AnonymizedTelemetryPacket {
  id: string;
  orgCode: string;
  ageBracket: AgeBracket;
  redButtonUsed: boolean;
  
  // Banded Aggregate Data Only (Zero PII, Zero Exact Clinical Scores, Zero Private Task Notes)
  alcoholRiskBand?: 'Low' | 'Hazardous' | 'Harmful' | 'Severe';
  sadqDependenceBand?: 'Mild' | 'Moderate' | 'Severe';
  substanceRiskBand?: 'Low' | 'Harmful' | 'Severe';
  anxietyBand?: 'Minimal' | 'Mild' | 'Moderate' | 'Severe';
  depressionBand?: 'Minimal' | 'Mild' | 'Moderate' | 'Moderately Severe' | 'Severe';
  youthSubstanceBand?: 'Low' | 'Elevated';
  youthWellbeingBand?: 'Low' | 'Moderate' | 'High';

  // Adherence and Clinical Triage Indicators
  pillarAdherenceRate: number; // 0 - 100%
  interventionsEngagedCount?: number;
  totalInterventions?: number;
  triagePathways?: string[];
  sadqTriggered?: boolean;
  duditTriggered?: boolean;
  phqGadTriggered?: boolean;

  microTaskEnabled: boolean;
  sensoryMode: SensoryMode;
  timestamp: string;

  // Severe Risk Incident Flagging (V18 Crisis Safeguard)
  severeRiskIncident?: boolean;
  severeRiskTimestamp?: string;
  crisisTrigger?: string;

  // Youth Justice System (YJS) Leading Indicators (Zero-PII GDPR/Caldicott)
  isYJS?: boolean;
  yjsAttendanceRate?: number; // % on-time worker sessions
  eetStabilityScore?: number; // % in Education, Employment, or Training (0-100)
  restorativeMilestonesCompleted?: number; // count of completed restorative actions
  reparationHoursThisMonth?: number; // aggregated community reparation hours
  eteAttendanceRate?: number; // % aggregated ETE participation
  communicationSupportSuggested?: boolean; // non-clinical SLCN indicator

  // Backward compatibility optional fields
  auditScore?: number;
  crafftScore?: number;
}

export interface YJSSession {
  id: string;
  workerName: string;
  role: string; // e.g. "YJS Key Worker", "Youth Mentor"
  scheduledAt: string; // ISO date string
  location: string;
  syncedToCalendar: boolean;
  sessionGoal: string;
  status: 'upcoming' | 'completed' | 'rescheduled';
}

export interface RestorativeMilestone {
  id: string;
  title: string;
  category: 'reflection' | 'repair' | 'education-training';
  description: string;
  timeEstimate: string;
  completed: boolean;
  reflectionPrompt?: string;
  userReflection?: string;
}

export interface ClinicalQuestion {
  id: string;
  tool: 'AUDIT' | 'SADQ' | 'DUDIT' | 'GAD7' | 'PHQ9' | 'CRAFFT' | 'WEMWBS';
  question: string;
  subtext?: string;
  options: { label: string; points: number }[];
}

// ==========================================
// Casework Clients, Notes & Safeguarding Risks
// ==========================================
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface StaffIntervention {
  id: string;
  clientId: string;
  title: string;
  category: 'grounding' | 'anchor' | 'restorative' | 'substance' | 'routine' | 'court_prep';
  description: string;
  actionSteps: string[];
  assignedByWorker: string;
  assignedAt: string;
  dueDate?: string;
  status: 'active' | 'completed' | 'in_progress';
  completedAt?: string;
  clientReflection?: string;
}

export interface ClientLiveStatistics {
  totalAnchorsCompleted: number;
  adherenceRate: number; // 0 - 100%
  streakDays: number;
  dailyBattery: number; // 0 - 100%
  restStatus: 'Fully Charged' | 'Low Power Mode' | 'Optimal Recharge' | 'Moderate Rest';
  redButtonGroundingUses: number;
  lastActiveAt: string;
  recentMoodCheckIns: { date: string; mood: string; energy?: number; score?: number }[];
  completedInterventionCount: number;
  pathwayFocus?: string;
}

export interface SafeguardingRiskAssessment {
  riskToSelf: RiskLevel;
  riskToOthers: RiskLevel;
  riskFromOthers: RiskLevel; // Contextual safeguarding / CCE / Peer exploitation
  activeAlerts: string[];
  dslNotified: boolean;
  dslNotes?: string;
  safetyMitigations: string[];
  lastAssessedAt: string;
  assessedBy: string;
}

export interface ClientCaseNote {
  id: string;
  clientId: string;
  createdAt: string;
  workerName: string;
  workerRole: string;
  contactType:
    | '1:1 Casework Session'
    | 'Home Visit'
    | 'School / ETE Visit'
    | 'Multi-Agency / TAF Meeting'
    | 'Phone / Check-in'
    | 'Court Accompaniment'
    | 'Safeguarding Incident Alert';
  title: string;
  content: string;
  safeguardingFlag: boolean;
  safeguardingCategory?:
    | 'Mental Health / Self-Harm'
    | 'Substance Misuse'
    | 'Contextual / Peer Exploitation (CCE)'
    | 'Missing Episode'
    | 'Domestic / Family Discord'
    | 'Court / Compliance Breach'
    | 'General Welfare';
  actionItems: string[];
  sharedWithClient?: boolean;
}

export interface CaseworkClient {
  id: string;
  urn: string; // e.g. YJS-2026-881
  name: string;
  preferredName?: string;
  age: number;
  gender: string;
  orgCode: string;
  orgName: string;
  assignedWorker: string;
  statutoryStatus:
    | 'Youth Rehabilitation Order (YRO)'
    | 'Conditional Caution'
    | 'Child in Need (s.17)'
    | 'Child Protection Plan (s.47)'
    | 'Looked After Child (s.20)'
    | 'Early Help Intervention'
    | 'Voluntary Support';
  pathway: 'Youth Justice & Diversion' | 'Substance Misuse & Recovery' | 'Complex Adolescent Needs';
  primaryRiskSummary: string;
  overallRiskLevel: RiskLevel;
  safeguarding: SafeguardingRiskAssessment;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  notes: ClientCaseNote[];
  lastSessionDate: string;

  // Registered Client Profile Extensions
  linkedUserId?: string;
  registeredEmail?: string;
  workingWithOrg?: boolean;
  liveStatistics?: ClientLiveStatistics;
  interventions?: StaffIntervention[];
}

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export interface PushNotificationScheduleConfig {
  enabled: boolean;
  scheduledTime: string; // 'HH:MM' 24hr format, e.g. '18:00'
  soundEnabled: boolean;
  lastNotifiedDate?: string; // 'YYYY-MM-DD'
  snoozedUntil?: string; // ISO string if snoozed
}

