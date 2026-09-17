import {
  WaypointUserProfile,
  WaypointTask,
  InterventionType,
  AgeBracket,
} from '../types/waypoint';

/**
 * Lead Clinical Architect Directive:
 * InterventionMapper Specification & Engine
 *
 * Links exact clinical scores (AUDIT, SADQ, DUDIT, PHQ-9, GAD-7, CRAFFT, WEMWBS)
 * to personalized, evidence-based psychosocial interventions across the 4 Pillars.
 */

export interface IInterventionMapper {
  generateDailyInterventions(profile: WaypointUserProfile): WaypointTask[];
  getClinicalSummary(profile: WaypointUserProfile): {
    pathways: string[];
    primaryFocus: string;
    safeguardingAlert: boolean;
  };
}

export class InterventionMapper implements IInterventionMapper {
  /**
   * Generates a calibrated set of evidence-based tasks for the 4 Pillars based
   * on clinical triage scores and executive function settings.
   */
  public generateDailyInterventions(profile: WaypointUserProfile): WaypointTask[] {
    const tasks: WaypointTask[] = [];
    const isMicro = profile.microTaskMode;
    const isYouth = profile.ageBracket === 'under-16' || profile.ageBracket === '16-17';

    // 1. Harm Reduction Module: Triggered if SADQ is active or AUDIT > 16
    const sadqTriggered = (profile.baselineSadqScore !== undefined && profile.baselineSadqScore > 0) ||
      (profile.baselineAuditScore !== undefined && profile.baselineAuditScore > 16);

    if (sadqTriggered) {
      tasks.push({
        id: 'interv-harm-1',
        pillar: 'Physical Conditioning',
        title: isMicro ? 'Electrolyte & Hydration Check (1 full glass)' : 'Hydration & Electrolyte Replenishment Protocol',
        description: isMicro
          ? 'Drink 1 large glass of water with a pinch of salt or electrolyte tab to support autonomic balance.'
          : 'Replenish lost magnesium and potassium; maintain steady cellular hydration to reduce nervous system tremors.',
        isMicroTask: isMicro,
        isCompleted: false,
        completedDates: [],
        weight: 3,
        targetMetric: isMicro ? '1 glass' : '1.5 Litres',
        ageAppropriateFor: ['18-24', '25-49', '50+'],
        interventionType: 'harm-reduction',
        triggeredBy: 'SADQ (Alcohol Physical Dependence)',
        clinicalRationale: 'Fluid and electrolyte depletion exacerbates autonomic rebound hyperactivity and increases seizure thresholds.',
        evidenceBase: 'NICE Clinical Guideline CG115 (Alcohol-use disorders: diagnosis, assessment and management of physical complications).',
        timeEstimate: isMicro ? '2 mins' : '10 mins',
      });

      tasks.push({
        id: 'interv-harm-2',
        pillar: 'Mental Wellness',
        title: isMicro ? 'Urge Surfing: 3 deep breaths through craving' : 'Urge Surfing Practice (10 Minutes)',
        description: isMicro
          ? 'Notice the craving sensation in your chest or stomach. Treat it like an ocean wave: it peaks and recedes within 90 seconds.'
          : 'Sit comfortably. Scan physical sensations of the urge without fighting or judging. Breathe into the crest of the craving.',
        isMicroTask: isMicro,
        isCompleted: false,
        completedDates: [],
        weight: 3,
        targetMetric: isMicro ? '3 breaths' : '10 mins',
        ageAppropriateFor: ['18-24', '25-49', '50+'],
        interventionType: 'harm-reduction',
        triggeredBy: 'SADQ (Relief Drinking & Craving)',
        clinicalRationale: 'Marlatt & Gordon Relapse Prevention: Neurochemical cravings peak within 7-10 minutes and naturally decay if not reinforced.',
        evidenceBase: 'Mindfulness-Based Relapse Prevention (MBRP) Cochrane Review 2021.',
        timeEstimate: isMicro ? '3 mins' : '10 mins',
      });

      tasks.push({
        id: 'interv-harm-3',
        pillar: 'Physical Conditioning',
        title: isMicro ? 'AM/PM Physical Check: Steady hands?' : 'Morning & Evening Withdrawal Symptom Log',
        description: isMicro
          ? 'Hold hands out for 5 seconds. If severe shaking, palpitations, or nausea occur, use the Red Safeguard button or dial 111.'
          : 'Record autonomic vitals: tremor severity, sweating, and heart rate. Never attempt sudden unmonitored cold-turkey if dependent.',
        isMicroTask: isMicro,
        isCompleted: false,
        completedDates: [],
        weight: 3,
        targetMetric: isMicro ? '5-sec test' : 'AM & PM Log',
        ageAppropriateFor: ['18-24', '25-49', '50+'],
        interventionType: 'harm-reduction',
        triggeredBy: 'SADQ (Autonomic Hyperactivity Monitoring)',
        clinicalRationale: 'Daily somatic monitoring catches early signs of severe delirium tremens or autonomic instability before crisis.',
        evidenceBase: 'CIWA-Ar (Clinical Institute Withdrawal Assessment for Alcohol).',
        timeEstimate: isMicro ? '1 min' : '5 mins',
      });
    }

    // 2. Trigger Mapping Module: Triggered if DUDIT is elevated (score >= 6) or youth CRAFFT elevated (>= 2)
    const duditElevated = (profile.baselineDuditScore !== undefined && profile.baselineDuditScore >= 6);
    const crafftElevated = (profile.baselineCrafftScore !== undefined && profile.baselineCrafftScore >= 2);

    if (duditElevated || crafftElevated) {
      tasks.push({
        id: 'interv-trig-1',
        pillar: 'Mental Wellness',
        title: isMicro ? 'Check HALT: Am I Hungry, Angry, Lonely, or Tired?' : 'Identify Today’s High-Risk Situations (HALT Framework)',
        description: isMicro
          ? 'Pause for 30 seconds. Identify which of the 4 vulnerability states is most active right now.'
          : 'Review upcoming hours: people, places, social apps, or emotional states that trigger impulse cascades. Plan an exit strategy.',
        isMicroTask: isMicro,
        isCompleted: false,
        completedDates: [],
        weight: 2,
        targetMetric: isMicro ? '30 secs' : '5 mins',
        ageAppropriateFor: ['under-16', '16-17', '18-24', '25-49', '50+'],
        interventionType: 'trigger-mapping',
        triggeredBy: duditElevated ? 'DUDIT (Substance Trigger Mapping)' : 'CRAFFT (Youth Substance Shield)',
        clinicalRationale: 'Relapse and impulse spikes correlate heavily with visceral depleted states (HALT: Hungry, Angry, Lonely, Tired).',
        evidenceBase: 'SAMHSA Relapse Prevention Model & Contingency Management Framework.',
        timeEstimate: isMicro ? '2 mins' : '10 mins',
      });

      tasks.push({
        id: 'interv-trig-2',
        pillar: 'Household/Family Ops',
        title: isMicro ? 'Delay Tactic: Set a 15-minute timer before acting' : 'Practice the 15-Minute Impulse Delay Protocol',
        description: isMicro
          ? 'If an impulse strikes, press pause on the timer. Engage in physical sensory distraction until the bell rings.'
          : 'Commit to postponing any substance use by 15 minutes while drinking water, stepping outside, or calling a designated support.',
        isMicroTask: isMicro,
        isCompleted: false,
        completedDates: [],
        weight: 2,
        targetMetric: isMicro ? '15 min pause' : '1 delay session',
        ageAppropriateFor: ['under-16', '16-17', '18-24', '25-49', '50+'],
        interventionType: 'trigger-mapping',
        triggeredBy: duditElevated ? 'DUDIT (Impulse Regulation)' : 'CRAFFT (Impulse Delay)',
        clinicalRationale: 'Prefrontal cortex activation requires a latency window to override dopamine-driven reward seeking in the nucleus accumbens.',
        evidenceBase: 'Dialectical Behavior Therapy (DBT) Distress Tolerance Skills (Linehan).',
        timeEstimate: isMicro ? '2 mins' : '15 mins',
      });

      tasks.push({
        id: 'interv-trig-3',
        pillar: 'Household/Family Ops',
        title: isMicro ? 'Clean 1 trigger: Archive or mute 1 risky contact' : 'Secure Environment Sweep (Clear Triggers & Safeguard Space)',
        description: isMicro
          ? 'Mute or archive one phone number or chat group associated with substance acquisition.'
          : 'Remove paraphernalia, empty vessels, or triggering items from immediate eyesight. Environment dictates habit loops.',
        isMicroTask: isMicro,
        isCompleted: false,
        completedDates: [],
        weight: 2,
        targetMetric: isMicro ? '1 contact' : 'Full room sweep',
        ageAppropriateFor: ['under-16', '16-17', '18-24', '25-49', '50+'],
        interventionType: 'trigger-mapping',
        triggeredBy: duditElevated ? 'DUDIT (Environmental Friction)' : 'CRAFFT (Environment Shield)',
        clinicalRationale: 'Stimulus control therapy: Reducing cue reactivity lowers cue-induced craving spikes in the amygdala.',
        evidenceBase: 'Behavioral Cue-Exposure and Stimulus Control Therapy (Rohsenow et al.).',
        timeEstimate: isMicro ? '1 min' : '10 mins',
      });
    }

    // 3. Cognitive Behavioral Therapy (CBT) Module: Triggered if PHQ-9 >= 10, GAD-7 >= 10, or WEMWBS <= 14
    const phqElevated = (profile.baselinePhq9Score !== undefined && profile.baselinePhq9Score >= 10);
    const gadElevated = (profile.baselineGad7Score !== undefined && profile.baselineGad7Score >= 10);
    const wemwbsLow = (profile.baselineWemwbsScore !== undefined && profile.baselineWemwbsScore <= 14);

    if (phqElevated || gadElevated || wemwbsLow) {
      tasks.push({
        id: 'interv-cbt-1',
        pillar: 'Mental Wellness',
        title: isMicro ? 'Catch 1 Negative Thought: "Is this 100% true?"' : 'Catching Automatic Thoughts (3-Column CBT Record)',
        description: isMicro
          ? 'Notice one harsh internal sentence (e.g. "I ruined everything"). Ask yourself: "What would I tell a close friend who said this?"'
          : 'Record: 1) Trigger situation, 2) Automatic catastrophic belief, 3) Evidence-grounded, compassionate alternative perspective.',
        isMicroTask: isMicro,
        isCompleted: false,
        completedDates: [],
        weight: 3,
        targetMetric: isMicro ? '1 thought' : '1 log entry',
        ageAppropriateFor: ['under-16', '16-17', '18-24', '25-49', '50+'],
        interventionType: 'cbt-micro',
        triggeredBy: phqElevated ? 'PHQ-9 (Depression Screener)' : 'GAD-7 (Anxiety Screener)',
        clinicalRationale: 'Cognitive restructuring weakens depressive cognitive triads (negative view of self, world, future) and reduces catastrophic worry.',
        evidenceBase: 'Beck Institute for Cognitive Behavior Therapy; NICE Guideline NG222 (Depression in adults).',
        timeEstimate: isMicro ? '2 mins' : '10 mins',
      });

      tasks.push({
        id: 'interv-cbt-2',
        pillar: 'Physical Conditioning',
        title: isMicro ? 'Behavioral Activation: 2-minute step outside' : 'Behavioral Activation: 15-Minute Restorative Walk',
        description: isMicro
          ? 'Step onto the porch or open a window. Look at the horizon for 120 seconds to reset sensory input.'
          : 'Engage motor cortex to interrupt the passive default mode network. Walk at a steady pace without checking notifications.',
        isMicroTask: isMicro,
        isCompleted: false,
        completedDates: [],
        weight: 2,
        targetMetric: isMicro ? '2 mins' : '15 mins',
        ageAppropriateFor: ['under-16', '16-17', '18-24', '25-49', '50+'],
        interventionType: 'cbt-micro',
        triggeredBy: 'PHQ-9 (Behavioral Activation Protocol)',
        clinicalRationale: 'Depression promotes psychomotor withdrawal and lethargy. Action must precede motivation to kickstart dopamine release.',
        evidenceBase: 'Martell et al. Behavioral Activation for Depression: A Clinician’s Guide.',
        timeEstimate: isMicro ? '2 mins' : '15 mins',
      });

      tasks.push({
        id: 'interv-cbt-3',
        pillar: 'Mental Wellness',
        title: isMicro ? 'Worry Tree: Can I do something right now? (Yes/No)' : 'The Worry Tree Decision Protocol (5 Minutes)',
        description: isMicro
          ? 'If you can fix it right now in under 2 minutes, do it. If not, schedule a time or file it under "out of my control".'
          : 'Classify active anxiety into: "Real Problem" (make action plan) vs. "Hypothetical Worry" (practice radical acceptance & return to task).',
        isMicroTask: isMicro,
        isCompleted: false,
        completedDates: [],
        weight: 2,
        targetMetric: isMicro ? '1 decision' : '5 mins',
        ageAppropriateFor: ['under-16', '16-17', '18-24', '25-49', '50+'],
        interventionType: 'cbt-micro',
        triggeredBy: 'GAD-7 (Generalized Anxiety Protocol)',
        clinicalRationale: 'Differentiates actionable problem-solving from unproductive rumination, reducing prefrontal cognitive overload.',
        evidenceBase: 'Butler et al. Cognitive Therapy for Generalized Anxiety Disorder.',
        timeEstimate: isMicro ? '2 mins' : '5 mins',
      });
    }

    // 4. Youth Justice & Child-First Restorative Module
    const yjsActive = profile.supportPathways?.includes('youth_justice');
    if (yjsActive) {
      tasks.push({
        id: 'interv-yjs-session-prep',
        pillar: 'Household/Family Ops',
        title: isMicro ? 'Session Prep: Think of 1 win to tell your worker' : 'Key Worker Session Preparation (5 Mins)',
        description: isMicro
          ? 'Pick one good thing you did this week that you want your key worker to know about.'
          : 'Write down one win, one challenge, and what help you need ahead of your upcoming worker meeting.',
        isMicroTask: isMicro,
        isCompleted: false,
        completedDates: [],
        weight: 3,
        targetMetric: '1 preparation note',
        ageAppropriateFor: ['under-16', '16-17', '18-24'],
        interventionType: 'yjs-action',
        triggeredBy: 'Youth Justice & Child-First Pathway',
        clinicalRationale: 'Constructive session preparation shifts engagement from passive compliance to active personal agency.',
        evidenceBase: 'Youth Justice Board (YJB) Child-First Framework & Desistance Theory (Maruna).',
        timeEstimate: isMicro ? '2 mins' : '5 mins',
      });

      tasks.push({
        id: 'interv-yjs-restorative-empathy',
        pillar: 'Mental Wellness',
        title: isMicro ? 'Perspective Check: 60 seconds thinking of someone you care about' : 'Restorative Perspective & Empathy Reflection',
        description: isMicro
          ? 'Take one minute to think about how your choices can make life easier for someone at home or in your circle.'
          : 'Reflect on a recent difficult situation and consider how the other person might have felt. Write one constructive thought.',
        isMicroTask: isMicro,
        isCompleted: false,
        completedDates: [],
        weight: 2,
        targetMetric: '1 reflection',
        ageAppropriateFor: ['under-16', '16-17', '18-24'],
        interventionType: 'youth-restorative',
        triggeredBy: 'Restorative Justice Standards',
        clinicalRationale: 'Perspective-taking exercises build pro-social empathy pathways and emotional regulation.',
        evidenceBase: 'Restorative Justice Council (RJC) Standards & Positive Youth Justice.',
        timeEstimate: isMicro ? '1 min' : '5 mins',
      });

      tasks.push({
        id: 'interv-yjs-eet-step',
        pillar: 'Financial Health',
        title: isMicro ? 'Future Step: 3 minutes looking at an apprentice or college idea' : 'EET Stability: Explore 1 Training or Education Path',
        description: isMicro
          ? 'Look up one course, apprentice role, or hobby class that sounds interesting for your future.'
          : 'Spend 10 minutes reviewing local vocational or college courses to discuss with your worker.',
        isMicroTask: isMicro,
        isCompleted: false,
        completedDates: [],
        weight: 2,
        targetMetric: '1 exploration',
        ageAppropriateFor: ['under-16', '16-17', '18-24'],
        interventionType: 'yjs-action',
        triggeredBy: 'Education, Employment & Training (EET) Stability Pathway',
        clinicalRationale: 'Building EET aspirations is the single strongest protective factor against re-involvement in the justice system.',
        evidenceBase: 'Ministry of Justice (UK) & Youth Justice Board Evidence on EET as a Protective Factor.',
        timeEstimate: isMicro ? '3 mins' : '10 mins',
      });
    }

    // 4. Financial Infrastructure Module: Triggered if Financial Pathway is selected
    const financialFocus = profile.supportPathways?.includes('financial') ||
      profile.focusAreas?.some((f) => f.toLowerCase().includes('finan') || f.toLowerCase().includes('money'));

    if (financialFocus) {
      tasks.push({
        id: 'interv-fin-1',
        pillar: 'Financial Health',
        title: isMicro ? 'Neutral Glance: Look at bank balance for 15 seconds' : 'Micro-Budgeting: Non-Judgmental Balance Verification',
        description: isMicro
          ? 'Open your banking app. Observe the number like you are checking the weather. No self-criticism, just factual awareness.'
          : 'Log your current balance and check pending charges. Confronting the figure safely stops the cycle of avoidance panic.',
        isMicroTask: isMicro,
        isCompleted: false,
        completedDates: [],
        weight: 2,
        targetMetric: isMicro ? '15 secs' : '5 mins',
        ageAppropriateFor: isYouth ? ['16-17'] : ['18-24', '25-49', '50+'],
        interventionType: 'financial-infra',
        triggeredBy: 'Financial Pathway (Scarcity & Avoidance Dissolution)',
        clinicalRationale: 'Financial trauma triggers acute fight-or-flight avoidance; structured exposure lowers visceral dread.',
        evidenceBase: 'Financial Social Work & Behavioral Economics Research (Mullainathan & Shafir: Scarcity Theory).',
        timeEstimate: isMicro ? '1 min' : '5 mins',
      });

      tasks.push({
        id: 'interv-fin-2',
        pillar: 'Financial Health',
        title: isMicro ? 'Direct Debit Sweep: Identify 1 recurring charge' : 'Direct Debit & Subscription Audit',
        description: isMicro
          ? 'Spot one recurring subscription or direct debit you do not actively use or value.'
          : 'Audit monthly bank statement: flag any auto-renewals, unused streaming services, or recurring fees for cancellation.',
        isMicroTask: isMicro,
        isCompleted: false,
        completedDates: [],
        weight: 2,
        targetMetric: isMicro ? '1 item' : 'Audit completed',
        ageAppropriateFor: ['18-24', '25-49', '50+'],
        interventionType: 'financial-infra',
        triggeredBy: 'Financial Pathway (Cashflow Sovereignty)',
        clinicalRationale: 'Restoring agency over micro-outflows creates positive self-efficacy feedback loops.',
        evidenceBase: 'Money and Mental Health Policy Institute (UK) Debt-Mental Health Evidence Framework.',
        timeEstimate: isMicro ? '2 mins' : '10 mins',
      });
    }

    // 5. Foundation & Baseline Habits (Ensures all 4 Pillars always have balanced tasks)
    // Physical Foundation
    if (!tasks.some((t) => t.pillar === 'Physical Conditioning')) {
      tasks.push({
        id: 'found-phys-1',
        pillar: 'Physical Conditioning',
        title: isMicro ? 'Circadian Reset: 60 seconds of natural daylight' : 'Circadian Morning Movement & Light Exposure',
        description: isMicro
          ? 'Step to the window or outside for 1 minute to tell your brain clock that morning has started.'
          : 'Get 10-15 minutes of outdoor sunlight and light stretching to anchor your cortisol awakening response.',
        isMicroTask: isMicro,
        isCompleted: false,
        completedDates: [],
        weight: 1,
        targetMetric: isMicro ? '60 secs' : '15 mins',
        ageAppropriateFor: ['under-16', '16-17', '18-24', '25-49', '50+'],
        interventionType: 'foundation',
        clinicalRationale: 'Photonic retinal stimulation anchors suprachiasmatic nucleus rhythms, stabilizing nighttime melatonin.',
        evidenceBase: 'Circadian neurobiology (Huberman Lab / Stanford Neuroscience).',
        timeEstimate: isMicro ? '1 min' : '15 mins',
      });
    }

    // Household/Family Foundation
    if (!tasks.some((t) => t.pillar === 'Household/Family Ops')) {
      tasks.push({
        id: 'found-fam-1',
        pillar: 'Household/Family Ops',
        title: isMicro ? '1-Minute Surface Reset: Clear 1 small desk area' : (isYouth ? 'Tidy Study Bag & Organize Tomorrow’s Essentials' : 'Domestic Sanctuary Reset: Clear Kitchen Counter'),
        description: isMicro
          ? 'Put away 1 mug, plate, or piece of mail. A clean surface signals internal safety.'
          : 'Tidy immediate surroundings to reduce visual cognitive clutter before evening rest.',
        isMicroTask: isMicro,
        isCompleted: false,
        completedDates: [],
        weight: 1,
        targetMetric: isMicro ? '1 min' : '10 mins',
        ageAppropriateFor: ['under-16', '16-17', '18-24', '25-49', '50+'],
        interventionType: 'foundation',
        clinicalRationale: 'Visual environmental disorder correlates with elevated salivary cortisol and sustained executive fatigue.',
        evidenceBase: 'Saxbe & Repetti: Domestic clutter and physiological stress recovery.',
        timeEstimate: isMicro ? '1 min' : '10 mins',
      });
    }

    // Financial Foundation (if not already populated)
    if (!tasks.some((t) => t.pillar === 'Financial Health')) {
      tasks.push({
        id: 'found-fin-1',
        pillar: 'Financial Health',
        title: isMicro ? 'Micro-Save: Move £1 to emergency stash' : 'Review Essential Needs vs. Wants for Today',
        description: isMicro
          ? 'Transfer £1 or save a spare coin into a locked jar or separate pot. Build momentum.'
          : 'Clarify what expenses are truly essential today to preserve financial breathing room.',
        isMicroTask: isMicro,
        isCompleted: false,
        completedDates: [],
        weight: 1,
        targetMetric: isMicro ? '£1' : '5 mins',
        ageAppropriateFor: ['under-16', '16-17', '18-24', '25-49', '50+'],
        interventionType: 'foundation',
        clinicalRationale: 'Incremental positive agency dismantles financial helplessness.',
        evidenceBase: 'Behavioral Economics: Nudge Theory (Thaler & Sunstein).',
        timeEstimate: isMicro ? '1 min' : '5 mins',
      });
    }

    // Mental Wellness Foundation (if not already populated)
    if (!tasks.some((t) => t.pillar === 'Mental Wellness')) {
      tasks.push({
        id: 'found-ment-1',
        pillar: 'Mental Wellness',
        title: isMicro ? 'Evening Exhale: 5 physiological sighs' : 'Evening Mental Wind-Down & Unplugged Reflection',
        description: isMicro
          ? 'Two quick inhales through the nose, followed by a long, slow exhale through the mouth. Repeat 5 times.'
          : 'Close laptops and phones 30 minutes before sleep. Write down 1 win from today in private notes.',
        isMicroTask: isMicro,
        isCompleted: false,
        completedDates: [],
        weight: 2,
        targetMetric: isMicro ? '5 breaths' : '20 mins',
        ageAppropriateFor: ['under-16', '16-17', '18-24', '25-49', '50+'],
        interventionType: 'foundation',
        clinicalRationale: 'Physiological sigh opens collapsed alveoli and engages vagal parasympathetic cardiac braking.',
        evidenceBase: 'Vagal nerve stimulation and respiratory autonomic regulation (Balban et al., Cell Reports Medicine 2023).',
        timeEstimate: isMicro ? '2 mins' : '20 mins',
      });
    }

    return tasks;
  }

  /**
   * Generates high-level clinical insight summaries for display and practitioner triage
   */
  public getClinicalSummary(profile: WaypointUserProfile): {
    pathways: string[];
    primaryFocus: string;
    safeguardingAlert: boolean;
  } {
    const pathways: string[] = [];
    let safeguarding = false;

    if (profile.baselineAuditScore !== undefined) {
      if (profile.baselineAuditScore > 16) {
        pathways.push(`Severe Alcohol Risk (AUDIT: ${profile.baselineAuditScore}, SADQ: ${profile.baselineSadqScore ?? 'Screened'})`);
        safeguarding = true;
      } else if (profile.baselineAuditScore >= 8) {
        pathways.push(`Hazardous Alcohol Use (AUDIT: ${profile.baselineAuditScore})`);
      }
    }

    if (profile.baselineDuditScore !== undefined && profile.baselineDuditScore >= 6) {
      pathways.push(`Substance Trigger Mapping Active (DUDIT: ${profile.baselineDuditScore})`);
      if (profile.baselineDuditScore >= 25) safeguarding = true;
    }

    if (profile.baselinePhq9Score !== undefined && profile.baselinePhq9Score >= 10) {
      pathways.push(`Depression CBT Protocol (PHQ-9: ${profile.baselinePhq9Score})`);
      if (profile.baselinePhq9Score >= 20) safeguarding = true;
    }

    if (profile.baselineGad7Score !== undefined && profile.baselineGad7Score >= 10) {
      pathways.push(`Anxiety Regulation Protocol (GAD-7: ${profile.baselineGad7Score})`);
    }

    if (profile.baselineCrafftScore !== undefined && profile.baselineCrafftScore >= 2) {
      pathways.push(`Youth Substance Safeguard (CRAFFT: ${profile.baselineCrafftScore})`);
    }

    return {
      pathways,
      primaryFocus: pathways.length > 0 ? pathways[0] : 'Foundation Life Infrastructure',
      safeguardingAlert: safeguarding,
    };
  }
}

// Global Singleton Instance
export const interventionMapper = new InterventionMapper();
