import {
  CaseworkClient,
  ClientCaseNote,
  SafeguardingRiskAssessment,
  RiskLevel,
  StaffIntervention,
  ClientLiveStatistics,
} from '../types/waypoint';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const CLIENTS_STORAGE_KEY = 'waypoint_casework_clients_v1';

// Seed Initial Casework Clients
const INITIAL_CLIENTS: CaseworkClient[] = [
  {
    id: 'client-alex-m',
    urn: 'YJS-2026-881',
    name: 'Alex Morgan',
    preferredName: 'Alex',
    age: 16,
    gender: 'Non-binary',
    orgCode: 'YJS-LEEDS',
    orgName: 'Leeds Youth Justice Service',
    assignedWorker: 'Jordan Miller',
    statutoryStatus: 'Youth Rehabilitation Order (YRO)',
    pathway: 'Youth Justice & Diversion',
    primaryRiskSummary: 'Contextual Safeguarding: vulnerable to older peer exploitation in East Leeds; elevated emotional dysregulation during court hearings.',
    overallRiskLevel: 'high',
    safeguarding: {
      riskToSelf: 'medium',
      riskToOthers: 'low',
      riskFromOthers: 'high',
      activeAlerts: [
        'Contextual exploitation alert: Known older peer group active near bus interchange',
        'Court accompaniment protocol active for Crown Court review on 18th',
        'Paced sensory grounding required during stressful interviews',
      ],
      dslNotified: true,
      dslNotes: 'Notified Sarah Jenkins (DSL) on 04/09. Agreed safe travel voucher and curfew anchor check-in at 19:30.',
      safetyMitigations: [
        'Direct taxi travel pass to youth center to avoid transit hub',
        'Nominated emergency trusted adult: Auntie Clara (07700 900142)',
        'Waypoint Low-Stimulation mode enabled on personal device',
      ],
      lastAssessedAt: '2026-09-04T14:30:00.000Z',
      assessedBy: 'Jordan Miller (YJS Key Worker)',
    },
    emergencyContact: {
      name: 'Clara Morgan',
      relationship: 'Maternal Aunt / Kinship Carer',
      phone: '07700 900142',
    },
    lastSessionDate: '2026-09-06T11:00:00.000Z',
    notes: [
      {
        id: 'note-alex-1',
        clientId: 'client-alex-m',
        createdAt: '2026-09-06T11:30:00.000Z',
        workerName: 'Jordan Miller',
        workerRole: 'Youth Justice Key Worker',
        contactType: '1:1 Casework Session',
        title: 'Weekly Anchors & Court Walkthrough Preparation',
        content:
          'Met Alex at Leeds Central Youth Hub. Reviewed 4-stage Court Prep Walkthrough in Waypoint. Alex expressed feeling anxious about having to speak to the magistrate. Practiced the 4-7-8 grounding exercise together. Alex completed 3/4 daily anchor habits this week, including attending bike maintenance workshop. Agreed on trusted support plan.',
        safeguardingFlag: false,
        actionItems: [
          'Coordinate with court usher for private quiet room on arrival',
          'Check in with Aunt Clara regarding morning transport',
        ],
        sharedWithClient: true,
      },
      {
        id: 'note-alex-2',
        clientId: 'client-alex-m',
        createdAt: '2026-09-02T16:15:00.000Z',
        workerName: 'Jordan Miller',
        workerRole: 'Youth Justice Key Worker',
        contactType: 'Safeguarding Incident Alert',
        title: 'Contextual Safeguarding: Bus Station Approach',
        content:
          'Alex disclosed that an older associate ("Terry") approached them near the bus station offering cash for "holding an item". Alex declined and went into the pharmacy to phone Clara. Outstanding protective decision made by Alex using their Waypoint trigger pause protocol. Safeguarding alert logged and DSL alerted.',
        safeguardingFlag: true,
        safeguardingCategory: 'Contextual / Peer Exploitation (CCE)',
        actionItems: [
          'Submitted contextual safeguarding intelligence report to Leeds MASH',
          'Updated daily travel arrangement to bypass station',
          'Notified DSL Sarah Jenkins',
        ],
        sharedWithClient: false,
      },
      {
        id: 'note-alex-3',
        clientId: 'client-alex-m',
        createdAt: '2026-08-28T14:00:00.000Z',
        workerName: 'Marcus Wright',
        workerRole: 'Restorative Justice Coordinator',
        contactType: 'School / ETE Visit',
        title: 'Community Bike Workshop - 4hr Reparation Credit',
        content:
          'Alex completed 4 hours of restorative reparation at Meanwood Valley Urban Farm bike project. Excellent engagement; Alex showed genuine mechanical aptitude and worked respectfully with the site manager. Added credit to Reparation Tracker.',
        safeguardingFlag: false,
        actionItems: ['Award 4 hours credit towards 20-hour YRO condition'],
        sharedWithClient: true,
      },
    ],
  },
  {
    id: 'client-liam-k',
    urn: 'YJS-2026-402',
    name: 'Liam Kelly',
    preferredName: 'Liam',
    age: 15,
    gender: 'Male',
    orgCode: 'YJS-LEEDS',
    orgName: 'Leeds Youth Justice Service',
    assignedWorker: 'Jordan Miller',
    statutoryStatus: 'Conditional Caution',
    pathway: 'Youth Justice & Diversion',
    primaryRiskSummary: 'Cannabis experimentation and school non-attendance; low compliance risk if sessions are scheduled after 11am.',
    overallRiskLevel: 'medium',
    safeguarding: {
      riskToSelf: 'medium',
      riskToOthers: 'low',
      riskFromOthers: 'medium',
      activeAlerts: [
        'CRAFFT score elevated (score 3) - substance harm reduction pathway',
        'ETE attendance monitored weekly with school liaison officer',
      ],
      dslNotified: false,
      safetyMitigations: [
        'Weekly joint session with CGL young persons substance recovery worker',
        'Attendance incentive: College sports taster enrollment',
      ],
      lastAssessedAt: '2026-09-01T10:00:00.000Z',
      assessedBy: 'Jordan Miller (YJS Key Worker)',
    },
    emergencyContact: {
      name: 'Tracey Kelly',
      relationship: 'Mother',
      phone: '07700 900581',
    },
    lastSessionDate: '2026-09-05T13:00:00.000Z',
    notes: [
      {
        id: 'note-liam-1',
        clientId: 'client-liam-k',
        createdAt: '2026-09-05T13:45:00.000Z',
        workerName: 'Jordan Miller',
        workerRole: 'Youth Justice Key Worker',
        contactType: '1:1 Casework Session',
        title: 'Cannabis Harm Reduction & College Application',
        content:
          'Liam attended on time. Discussed cutting back evening cannabis use to improve morning motivation. Liam agreed to try a 3-day pause challenge in Waypoint. Completed application form for Leeds City College Level 1 Construction course.',
        safeguardingFlag: false,
        actionItems: [
          'Send college form to admissions lead with fee waiver code',
          'Follow up with mother on Monday',
        ],
        sharedWithClient: true,
      },
    ],
  },
  {
    id: 'client-maya-s',
    urn: 'NHS-2026-119',
    name: 'Maya Siddiqui',
    preferredName: 'Maya',
    age: 17,
    gender: 'Female',
    orgCode: 'NHS-01',
    orgName: 'Leeds & York NHS Partnership Trust',
    assignedWorker: 'Dr. Rachel Thornton',
    statutoryStatus: 'Child in Need (s.17)',
    pathway: 'Complex Adolescent Needs',
    primaryRiskSummary: 'Severe social anxiety, past self-harm ideation; stabilizing with voluntary anchor habits and psychology support.',
    overallRiskLevel: 'medium',
    safeguarding: {
      riskToSelf: 'medium',
      riskToOthers: 'low',
      riskFromOthers: 'low',
      activeAlerts: [
        'Safety plan agreed: Contact CAMHS crisis line if distress scale exceeds 8/10',
        'Sensory overwhelm in crowded public transit',
      ],
      dslNotified: true,
      dslNotes: 'Reviewed in Team Around the Family (TAF) meeting on 29/08. Stable trajectory.',
      safetyMitigations: [
        'Crisis Grounding Button mapped directly in Waypoint app',
        'Weekly video check-in option when homebound anxiety is high',
      ],
      lastAssessedAt: '2026-08-30T15:00:00.000Z',
      assessedBy: 'Dr. Rachel Thornton (Clinical Psychologist)',
    },
    emergencyContact: {
      name: 'Farhan Siddiqui',
      relationship: 'Father',
      phone: '07700 900293',
    },
    lastSessionDate: '2026-09-04T16:00:00.000Z',
    notes: [
      {
        id: 'note-maya-1',
        clientId: 'client-maya-s',
        createdAt: '2026-09-04T16:30:00.000Z',
        workerName: 'Dr. Rachel Thornton',
        workerRole: 'Clinical Psychologist',
        contactType: '1:1 Casework Session',
        title: 'Cognitive Restructuring & Phased Exposure',
        content:
          'Maya attended session via clinic. Phq9 showed modest improvement from 16 to 12. Maya practiced ordering coffee at the library cafe as part of agreed exposure hierarchy. Zero self-harm episodes reported for 35 days.',
        safeguardingFlag: false,
        actionItems: ['Continue diary logging in Waypoint Mental Wellness pillar'],
        sharedWithClient: true,
      },
    ],
  },
  {
    id: 'client-jordan-b',
    urn: 'CGL-2026-724',
    name: 'Jordan Brooks',
    preferredName: 'Jordan',
    age: 18,
    gender: 'Male',
    orgCode: 'CGL-KIRK',
    orgName: 'CGL Kirklees Recovery Hub',
    assignedWorker: 'Callum O’Connor',
    statutoryStatus: 'Voluntary Support',
    pathway: 'Substance Misuse & Recovery',
    primaryRiskSummary: 'Alcohol dependence and binge episodes; transitioning into adult recovery services.',
    overallRiskLevel: 'high',
    safeguarding: {
      riskToSelf: 'high',
      riskToOthers: 'medium',
      riskFromOthers: 'low',
      activeAlerts: [
        'Severe SADQ score during baseline intake',
        'High relapse risk on weekends - requires Friday wellness check-in',
      ],
      dslNotified: false,
      safetyMitigations: [
        'Medical detox protocol consultation completed',
        'Weekend safety plan with recovery sponsor',
      ],
      lastAssessedAt: '2026-09-03T11:00:00.000Z',
      assessedBy: 'Callum O’Connor (Recovery Coordinator)',
    },
    emergencyContact: {
      name: 'David Brooks',
      relationship: 'Brother',
      phone: '07700 900812',
    },
    lastSessionDate: '2026-09-06T15:00:00.000Z',
    notes: [
      {
        id: 'note-jordan-1',
        clientId: 'client-jordan-b',
        createdAt: '2026-09-06T15:30:00.000Z',
        workerName: 'Callum O’Connor',
        workerRole: 'Recovery Coordinator',
        contactType: '1:1 Casework Session',
        title: 'Weekend Relapse Prevention Plan',
        content:
          'Jordan attended following a 5-day alcohol-free streak. Reviewed triggers (visiting old pub crowd). Roleplayed refusal phrases. Jordan configured the Waypoint Red Button to text brother David if cravings spike.',
        safeguardingFlag: false,
        actionItems: ['Saturday 12pm check-in call by peer mentor'],
        sharedWithClient: true,
      },
    ],
  },
];

// Helper to get all clients with guarantee of liveStatistics & interventions
export function getCaseworkClients(): CaseworkClient[] {
  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    let clientsList: CaseworkClient[];
    if (!raw) {
      clientsList = INITIAL_CLIENTS;
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(INITIAL_CLIENTS));
    } else {
      clientsList = JSON.parse(raw);
    }

    // Hydrate each client with liveStatistics & interventions if missing
    return clientsList.map((client, idx) => {
      const defaultStats: ClientLiveStatistics = {
        totalAnchorsCompleted: 14 + idx * 6,
        adherenceRate: 75 + (idx % 4) * 6,
        streakDays: 4 + (idx % 5),
        dailyBattery: 82 - (idx % 3) * 10,
        restStatus: idx % 2 === 0 ? 'Optimal Recharge' : 'Moderate Rest',
        redButtonGroundingUses: idx % 2,
        lastActiveAt: new Date(Date.now() - (idx * 3600000 + 1800000)).toISOString(),
        recentMoodCheckIns: [
          { date: 'Yesterday', mood: 'Calm & Steady', score: 8 },
          { date: '2 days ago', mood: 'Slightly Overwhelmed', score: 5 },
          { date: '3 days ago', mood: 'Focused & Grounded', score: 8 },
        ],
        completedInterventionCount: 2 + idx,
      };

      const defaultInterventions: StaffIntervention[] = [
        {
          id: `intv-sample-${client.id}-1`,
          clientId: client.id,
          title: 'Establish Evening Digital Curfew & Sleep Anchor',
          category: 'anchor' as const,
          description: 'Power down devices 45 minutes prior to sleep. Practice the 4-7-8 rhythm before lights out.',
          actionSteps: [
            'Set device downtime alarm at 22:15',
            'Run through one 3-minute breath cycle in Waypoint',
            'Log morning waking energy in daily habit tracker',
          ],
          assignedByWorker: client.assignedWorker || 'Jordan Miller',
          assignedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
          dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
          status: 'active' as const,
        },
        {
          id: `intv-sample-${client.id}-2`,
          clientId: client.id,
          title: 'Restorative Activity Reflection Log',
          category: 'restorative' as const,
          description: 'Reflect on practical skills learned during the weekly community workshop session.',
          actionSteps: [
            'Discuss session with workshop supervisor',
            'Write 2 sentences on how teamwork felt today',
          ],
          assignedByWorker: client.assignedWorker || 'Jordan Miller',
          assignedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
          dueDate: new Date(Date.now() - 2 * 86400000).toISOString(),
          status: 'completed' as const,
          clientReflection: 'Enjoyed working on the bicycle gear assembly. Felt respected by the workshop lead and was on time.',
          completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
      ];

      return {
        ...client,
        liveStatistics: client.liveStatistics || defaultStats,
        interventions: client.interventions && client.interventions.length > 0 ? client.interventions : defaultInterventions,
      };
    });
  } catch {
    return INITIAL_CLIENTS;
  }
}

// Helper to save all clients
export function saveCaseworkClients(clients: CaseworkClient[]): void {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  } catch (err) {
    console.warn('Failed to save clients to localStorage', err);
  }
}

// Add a note to a client
export function addCaseNote(
  clientId: string,
  noteData: Omit<ClientCaseNote, 'id' | 'createdAt'>
): ClientCaseNote {
  const clients = getCaseworkClients();
  const clientIndex = clients.findIndex((c) => c.id === clientId);

  const newNote: ClientCaseNote = {
    ...noteData,
    id: `note-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  if (clientIndex !== -1) {
    const client = clients[clientIndex];
    client.notes = [newNote, ...client.notes];
    client.lastSessionDate = newNote.createdAt;

    // If note has a critical safeguarding flag, update client risk if applicable
    if (newNote.safeguardingFlag) {
      if (newNote.safeguardingCategory === 'Contextual / Peer Exploitation (CCE)') {
        client.safeguarding.riskFromOthers = 'high';
      } else if (newNote.safeguardingCategory === 'Mental Health / Self-Harm') {
        client.safeguarding.riskToSelf = 'high';
      }
      if (!client.safeguarding.activeAlerts.includes(newNote.title)) {
        client.safeguarding.activeAlerts = [
          `[FLAGGED] ${newNote.title} (${new Date().toLocaleDateString()})`,
          ...client.safeguarding.activeAlerts,
        ];
      }
    }

    clients[clientIndex] = client;
    saveCaseworkClients(clients);

    // Sync to Firestore if available
    try {
      if (db) {
        setDoc(doc(db, 'casework_clients', client.id), client).catch(() => {});
        setDoc(doc(db, 'client_notes', newNote.id), newNote).catch(() => {});
      }
    } catch {}
  }

  return newNote;
}

// Update safeguarding assessment
export function updateClientSafeguarding(
  clientId: string,
  updates: Partial<SafeguardingRiskAssessment> & { overallRiskLevel?: RiskLevel }
): void {
  const clients = getCaseworkClients();
  const clientIndex = clients.findIndex((c) => c.id === clientId);

  if (clientIndex !== -1) {
    const client = clients[clientIndex];
    client.safeguarding = {
      ...client.safeguarding,
      ...updates,
      lastAssessedAt: new Date().toISOString(),
    };
    if (updates.overallRiskLevel) {
      client.overallRiskLevel = updates.overallRiskLevel;
    }
    clients[clientIndex] = client;
    saveCaseworkClients(clients);

    try {
      if (db) {
        setDoc(doc(db, 'casework_clients', client.id), client).catch(() => {});
      }
    } catch {}
  }
}

// Create a new client
export function createCaseworkClient(
  clientData: Omit<CaseworkClient, 'id' | 'notes' | 'lastSessionDate'>
): CaseworkClient {
  const clients = getCaseworkClients();
  const newClient: CaseworkClient = {
    ...clientData,
    id: `client-${Date.now().toString(36)}`,
    lastSessionDate: new Date().toISOString(),
    interventions: clientData.interventions || [],
    liveStatistics: clientData.liveStatistics || {
      totalAnchorsCompleted: 0,
      adherenceRate: 0,
      streakDays: 1,
      dailyBattery: 85,
      restStatus: 'Fully Charged',
      redButtonGroundingUses: 0,
      lastActiveAt: new Date().toISOString(),
      recentMoodCheckIns: [{ date: new Date().toISOString().slice(0, 10), mood: 'Ready', energy: 80 }],
      completedInterventionCount: 0,
    },
    notes: [
      {
        id: `note-init-${Date.now().toString(36)}`,
        clientId: `client-${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
        workerName: clientData.assignedWorker,
        workerRole: 'Key Worker',
        contactType: '1:1 Casework Session',
        title: 'Initial Intake & Assessment Completed',
        content: `Client onboarded under ${clientData.statutoryStatus}. Baseline risks logged: ${clientData.primaryRiskSummary}`,
        safeguardingFlag: clientData.overallRiskLevel === 'high' || clientData.overallRiskLevel === 'critical',
        actionItems: ['Establish weekly anchor check-in routine'],
        sharedWithClient: false,
      },
    ],
  };

  clients.unshift(newClient);
  saveCaseworkClients(clients);

  try {
    if (db) {
      setDoc(doc(db, 'casework_clients', newClient.id), newClient).catch(() => {});
    }
  } catch {}

  return newClient;
}

/**
 * Automatically creates and registers a young person's casework client profile in the Staff area
 * when they complete registration on the Personal app and indicate they work with an organisation.
 */
export function registerClientFromPersonalApp(params: {
  userId: string;
  name: string;
  email: string;
  age: number;
  orgCode: string;
  orgName: string;
  workerName?: string;
  statutoryOrder?: string;
  pathwayFocus?: string;
}): CaseworkClient {
  const clients = getCaseworkClients();

  // Check if client profile already exists for this user ID or email
  const existing = clients.find(
    (c) => c.linkedUserId === params.userId || c.registeredEmail === params.email.toLowerCase().trim()
  );
  if (existing) {
    return existing;
  }

  const generatedURN = `${params.orgCode.split('-')[0]}-${new Date().getFullYear()}-${Math.floor(
    100 + Math.random() * 900
  )}`;

  const newClient: CaseworkClient = {
    id: `client-reg-${params.userId}`,
    urn: generatedURN,
    name: params.name,
    preferredName: params.name.split(' ')[0],
    age: params.age || 16,
    gender: 'Self-Registered',
    orgCode: params.orgCode,
    orgName: params.orgName,
    assignedWorker: params.workerName?.trim() || 'Jordan Miller (Lead Key Worker)',
    statutoryStatus: (params.statutoryOrder as CaseworkClient['statutoryStatus']) || 'Youth Rehabilitation Order (YRO)',
    pathway: 'Youth Justice & Diversion',
    primaryRiskSummary: `Client self-registered via Waypoint Personal App. Working with ${params.orgName}. Primary support goal: ${
      params.pathwayFocus || 'Routine & Stability'
    }.`,
    overallRiskLevel: 'medium',
    linkedUserId: params.userId,
    registeredEmail: params.email.toLowerCase().trim(),
    workingWithOrg: true,
    lastSessionDate: new Date().toISOString(),
    safeguarding: {
      riskToSelf: 'low',
      riskToOthers: 'low',
      riskFromOthers: 'medium',
      activeAlerts: [
        `Self-registered via mobile app on ${new Date().toLocaleDateString()}. Initial caseworker intake review recommended.`,
      ],
      dslNotified: false,
      safetyMitigations: [
        'Waypoint Low-Power sensory grounding enabled by default',
        'Daily anchor reminders configured on personal device',
      ],
      lastAssessedAt: new Date().toISOString(),
      assessedBy: 'Waypoint System Intake Service',
    },
    emergencyContact: {
      name: 'Primary Kinship Contact',
      relationship: 'Nominated Carer',
      phone: '07700 900214',
    },
    liveStatistics: {
      totalAnchorsCompleted: 2,
      adherenceRate: 67,
      streakDays: 1,
      dailyBattery: 85,
      restStatus: 'Fully Charged',
      redButtonGroundingUses: 0,
      lastActiveAt: new Date().toISOString(),
      recentMoodCheckIns: [
        { date: new Date().toISOString().slice(0, 10), mood: 'Reflective & Motivated', energy: 85 },
      ],
      completedInterventionCount: 0,
      pathwayFocus: params.pathwayFocus || 'Routine & Stability',
    },
    interventions: [
      {
        id: `intv-welcome-${Date.now().toString(36)}`,
        clientId: `client-reg-${params.userId}`,
        title: 'Initial Orientation: Configure Your 3 Daily Anchors',
        category: 'anchor',
        description: 'Complete your morning, afternoon, and evening micro-anchors to stabilize daily momentum.',
        actionSteps: [
          'Choose a consistent morning wakeup anchor',
          'Review the 4-7-8 Breathing Grounding exercise',
          'Check in with your key worker during the weekly review',
        ],
        assignedByWorker: params.workerName?.trim() || 'Jordan Miller (Key Worker)',
        assignedAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        status: 'active',
      },
    ],
    notes: [
      {
        id: `note-reg-${Date.now().toString(36)}`,
        clientId: `client-reg-${params.userId}`,
        createdAt: new Date().toISOString(),
        workerName: 'Waypoint Digital Intake',
        workerRole: 'Automated Multi-Agency Bridge',
        contactType: '1:1 Casework Session',
        title: 'Young Person Self-Registration & Organisation Linkage',
        content: `${params.name} (age ${params.age}) registered through the Waypoint Personal App and confirmed active engagement with ${params.orgName}. Casework profile, real-time telemetry statistics, and intervention channels have been provisioned in the staff portal.`,
        safeguardingFlag: false,
        actionItems: [
          'Verify caseworker allocation during weekly team allocation meeting',
          'Review young person baseline anchors and support pathway in portal',
        ],
        sharedWithClient: true,
      },
    ],
  };

  clients.unshift(newClient);
  saveCaseworkClients(clients);

  try {
    if (db) {
      setDoc(doc(db, 'casework_clients', newClient.id), newClient).catch(() => {});
    }
  } catch {}

  return newClient;
}

/**
 * Add / Send an intervention from Staff to a Client
 */
export function addClientIntervention(
  clientId: string,
  interventionData: Omit<StaffIntervention, 'id' | 'assignedAt' | 'status'>
): StaffIntervention {
  const clients = getCaseworkClients();
  const clientIndex = clients.findIndex((c) => c.id === clientId);

  const newIntervention: StaffIntervention = {
    ...interventionData,
    id: `intv-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    assignedAt: new Date().toISOString(),
    status: 'active',
  };

  if (clientIndex !== -1) {
    const client = clients[clientIndex];
    client.interventions = [newIntervention, ...(client.interventions || [])];
    clients[clientIndex] = client;
    saveCaseworkClients(clients);

    try {
      if (db) {
        setDoc(doc(db, 'casework_clients', client.id), client).catch(() => {});
      }
    } catch {}
  }

  return newIntervention;
}

/**
 * Update intervention status (e.g. client completes it with reflection)
 */
export function updateClientInterventionStatus(
  clientId: string,
  interventionId: string,
  status: StaffIntervention['status'],
  clientReflection?: string
): void {
  const clients = getCaseworkClients();
  const clientIndex = clients.findIndex((c) => c.id === clientId);

  if (clientIndex !== -1) {
    const client = clients[clientIndex];
    if (client.interventions) {
      client.interventions = client.interventions.map((item) => {
        if (item.id === interventionId) {
          return {
            ...item,
            status,
            clientReflection: clientReflection || item.clientReflection,
            completedAt: status === 'completed' ? new Date().toISOString() : item.completedAt,
          };
        }
        return item;
      });

      if (status === 'completed' && client.liveStatistics) {
        client.liveStatistics.completedInterventionCount =
          (client.liveStatistics.completedInterventionCount || 0) + 1;
      }

      clients[clientIndex] = client;
      saveCaseworkClients(clients);

      try {
        if (db) {
          setDoc(doc(db, 'casework_clients', client.id), client).catch(() => {});
        }
      } catch {}
    }
  }
}

/**
 * Retrieve client profile linked to a personal user ID or registered email
 */
export function getClientByUserId(userId: string, email?: string): CaseworkClient | undefined {
  const clients = getCaseworkClients();
  const cleanEmail = email?.toLowerCase().trim();
  return clients.find(
    (c) => c.linkedUserId === userId || (cleanEmail && c.registeredEmail === cleanEmail)
  );
}

/**
 * Update real-time statistics for a client from their personal app actions
 */
export function updateClientLiveStatistics(
  clientId: string,
  partialStats: Partial<CaseworkClient['liveStatistics']>
): void {
  const clients = getCaseworkClients();
  const clientIndex = clients.findIndex((c) => c.id === clientId);

  if (clientIndex !== -1) {
    const client = clients[clientIndex];
    client.liveStatistics = {
      ...(client.liveStatistics || {
        totalAnchorsCompleted: 0,
        adherenceRate: 0,
        streakDays: 1,
        dailyBattery: 85,
        restStatus: 'Fully Charged',
        redButtonGroundingUses: 0,
        lastActiveAt: new Date().toISOString(),
        recentMoodCheckIns: [],
        completedInterventionCount: 0,
      }),
      ...partialStats,
      lastActiveAt: new Date().toISOString(),
    };

    clients[clientIndex] = client;
    saveCaseworkClients(clients);

    try {
      if (db) {
        setDoc(doc(db, 'casework_clients', client.id), client).catch(() => {});
      }
    } catch {}
  }
}
