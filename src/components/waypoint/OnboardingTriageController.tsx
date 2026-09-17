import React, { useState, useMemo } from 'react';
import {
  AgeBracket,
  CognitiveMode,
  SensoryMode,
  SupportPathwayId,
  WaypointUserProfile,
  ClinicalQuestion,
  CommunicationPreferences,
} from '../../types/waypoint';
import { SpeakableText } from './SpeakableText';
import {
  AUDIT_QUESTIONS,
  SADQ_QUESTIONS,
  DUDIT_QUESTIONS,
  GAD7_QUESTIONS,
  PHQ9_QUESTIONS,
  CRAFFT_QUESTIONS,
  WEMWBS_QUESTIONS,
  calculateAuditBand,
  calculateSadqBand,
  calculateDuditBand,
  calculateGad7Band,
  calculatePhq9Band,
  calculateCrafftBand,
  calculateWemwbsBand,
} from '../../data/clinicalQuestions';
import { WaypointLogo } from './WaypointLogo';
import { interventionMapper } from '../../services/InterventionMapper';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Brain,
  Eye,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Flame,
  Activity,
  Heart,
  DollarSign,
  Compass,
  FileText,
  Lock,
  ChevronRight,
  Stethoscope,
  Smile,
  Users,
} from 'lucide-react';

interface OnboardingTriageControllerProps {
  onComplete: (profile: WaypointUserProfile) => void;
  initialProfile?: WaypointUserProfile;
}

type OnboardingStage =
  | 'age-gate'            // Stage 1: Age Assessment & Safety Routing
  | 'support-pathways'    // Stage 2: Needs & Clinical Pathways Selection
  | 'cognitive-sensory'   // Stage 3: Executive Function & Sensory Space
  | 'communication-slcn'  // Stage 3b: Communication Preferences & Ungraded Check (Directive 1)
  | 'clinical-triage'     // Stage 4: Cascading Clinical Single-Card Swiper
  | 'prescription-preview'; // Stage 5: Triage Diagnostic & Dynamic Prescription Preview

export const OnboardingTriageController: React.FC<OnboardingTriageControllerProps> = ({
  onComplete,
  initialProfile,
}) => {
  const [currentStage, setCurrentStage] = useState<OnboardingStage>('age-gate');

  // Baseline User Setup
  const [ageBracket, setAgeBracket] = useState<AgeBracket>(initialProfile?.ageBracket || '18-24');
  const [supportPathways, setSupportPathways] = useState<SupportPathwayId[]>(
    initialProfile?.supportPathways || ['alcohol', 'mental-health']
  );
  const [cognitiveMode, setCognitiveMode] = useState<CognitiveMode>(
    initialProfile?.cognitiveMode || 'tiny-steps'
  );
  const [sensoryMode, setSensoryMode] = useState<SensoryMode>(
    initialProfile?.sensoryMode || 'standard'
  );
  const [orgCode, setOrgCode] = useState<string>(initialProfile?.orgCode || '');

  // V22 SLCN Communication Preferences & Ungraded Check (Directive 1)
  const [communicationPreference, setCommunicationPreference] = useState<CommunicationPreferences>(
    initialProfile?.communicationPreference || 'both'
  );
  const [communicationSupportSuggested, setCommunicationSupportSuggested] = useState<boolean>(
    initialProfile?.communicationSupportSuggested || false
  );
  const [comprehensionAnswers, setComprehensionAnswers] = useState<Record<number, string>>({});

  // Clinical Screener Answers Map
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Clinical Swiper State
  const [activeToolIndex, setActiveToolIndex] = useState<number>(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  const isUnder18 = ageBracket === 'under-16' || ageBracket === '16-17';
  const isYouthPathway = isUnder18 || supportPathways.includes('youth_justice');
  const isLowStim = sensoryMode === 'low-stimulation';

  // Toggle Support Pathways in Stage 2
  const handleTogglePathway = (pathway: SupportPathwayId) => {
    if (supportPathways.includes(pathway)) {
      if (supportPathways.length > 1) {
        setSupportPathways(supportPathways.filter((p) => p !== pathway));
      }
    } else {
      setSupportPathways([...supportPathways, pathway]);
    }
  };

  /**
   * Cascading Clinical Triage Engine:
   * V19 Directive: If age < 18 or pathway === 'youth_justice', automatically bypass
   * adult clinical tools (AUDIT/SADQ/DUDIT) and route users to youth-appropriate
   * validation frameworks (CRAFFT for substances, adapted wellbeing trackers).
   * Strict Reading Age of 10. Supportive, restorative language only.
   */
  const clinicalBatteries = useMemo(() => {
    const queue: { tool: string; title: string; subtitle: string; questions: ClinicalQuestion[] }[] = [];

    if (isYouthPathway) {
      // Child-First & Youth Justice Validation Framework
      if (
        supportPathways.includes('alcohol') ||
        supportPathways.includes('substances') ||
        supportPathways.includes('youth_justice')
      ) {
        queue.push({
          tool: 'CRAFFT',
          title: 'Youth Health & Safety Choices (CRAFFT)',
          subtitle: 'Friendly, private questions to explore how drinks or substances fit into your day.',
          questions: CRAFFT_QUESTIONS,
        });
      }
      queue.push({
        tool: 'WEMWBS',
        title: 'Daily Energy & Mood Baseline',
        subtitle: 'Simple questions about how you have been feeling, sleeping, and handling your days.',
        questions: WEMWBS_QUESTIONS,
      });
    } else {
      // Adult 18+ Pathways
      // 1. Alcohol Pathway
      if (supportPathways.includes('alcohol')) {
        queue.push({
          tool: 'AUDIT',
          title: 'Alcohol Pattern Baseline (AUDIT)',
          subtitle: 'A standard 10-question baseline to understand physical and social patterns without judgment.',
          questions: AUDIT_QUESTIONS,
        });

        // Calculate AUDIT total from current answers
        const auditTotal = AUDIT_QUESTIONS.reduce((sum, q) => sum + (answers[q.id] || 0), 0);

        // Cascading Rule: If AUDIT > 16, dynamically follow up with SADQ!
        if (auditTotal > 16) {
          queue.push({
            tool: 'SADQ',
            title: 'Physical Dependence & Recovery Anchor (SADQ)',
            subtitle: 'Evaluating autonomic signals (tremors, sleep, cravings) to calibrate safe medical harm-reduction.',
            questions: SADQ_QUESTIONS,
          });
        }
      }

      // 2. Substance Pathway
      if (supportPathways.includes('substances')) {
        queue.push({
          tool: 'DUDIT',
          title: 'Substance & Trigger Screener (DUDIT)',
          subtitle: 'Validated 8-item assessment to map cravings, dosing, and high-risk trigger situations.',
          questions: DUDIT_QUESTIONS,
        });
      }

      // 3. Mental Health Pathway (All ages)
      if (supportPathways.includes('mental-health')) {
        queue.push({
          tool: 'GAD7',
          title: 'Anxiety & Tension Inventory (GAD-7)',
          subtitle: 'Examining autonomic worry, restlessness, and sensory strain over the last 14 days.',
          questions: GAD7_QUESTIONS,
        });
        queue.push({
          tool: 'PHQ9',
          title: 'Mood & Energy Screener (PHQ-9)',
          subtitle: 'Assessing sleep, concentration, and emotional weight for tailored CBT activation.',
          questions: PHQ9_QUESTIONS,
        });
      }
    }

    // Default fallback if no clinical tools selected
    if (queue.length === 0) {
      queue.push({
        tool: 'WEMWBS',
        title: 'Daily Wellbeing Check (WEMWBS)',
        subtitle: 'A gentle baseline for setting up your foundation routines.',
        questions: WEMWBS_QUESTIONS,
      });
    }

    return queue;
  }, [isUnder18, supportPathways, answers]);

  // Current active battery and question
  const currentBattery = clinicalBatteries[activeToolIndex] || clinicalBatteries[0];
  const currentQuestion = currentBattery?.questions[activeQuestionIndex];

  // Answer selection in single-card swiper
  const handleSelectOption = (points: number) => {
    if (!currentQuestion) return;

    const newAnswers = { ...answers, [currentQuestion.id]: points };
    setAnswers(newAnswers);

    // If more questions in current tool
    if (activeQuestionIndex < currentBattery.questions.length - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
    } else {
      // Current tool complete. Check if more tools in queue
      if (activeToolIndex < clinicalBatteries.length - 1) {
        setActiveToolIndex((prev) => prev + 1);
        setActiveQuestionIndex(0);
      } else {
        // All clinical screening tools complete! Proceed to prescription preview
        setCurrentStage('prescription-preview');
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex((prev) => prev - 1);
    } else if (activeToolIndex > 0) {
      const prevToolIndex = activeToolIndex - 1;
      const prevTool = clinicalBatteries[prevToolIndex];
      setActiveToolIndex(prevToolIndex);
      setActiveQuestionIndex(prevTool.questions.length - 1);
    } else {
      setCurrentStage('cognitive-sensory');
    }
  };

  // Compute exact scores
  const calculatedScores = useMemo(() => {
    const sumTool = (questions: ClinicalQuestion[]) =>
      questions.reduce((acc, q) => acc + (answers[q.id] || 0), 0);

    const auditScore = supportPathways.includes('alcohol') && !isYouthPathway
      ? sumTool(AUDIT_QUESTIONS)
      : undefined;

    const sadqScore = auditScore !== undefined && auditScore > 16
      ? sumTool(SADQ_QUESTIONS)
      : undefined;

    const duditScore = supportPathways.includes('substances') && !isYouthPathway
      ? sumTool(DUDIT_QUESTIONS)
      : undefined;

    const gad7Score = supportPathways.includes('mental-health') && !isYouthPathway
      ? sumTool(GAD7_QUESTIONS)
      : undefined;

    const phq9Score = supportPathways.includes('mental-health') && !isYouthPathway
      ? sumTool(PHQ9_QUESTIONS)
      : undefined;

    const crafftScore = isYouthPathway && (supportPathways.includes('alcohol') || supportPathways.includes('substances') || supportPathways.includes('youth_justice'))
      ? sumTool(CRAFFT_QUESTIONS)
      : undefined;

    const wemwbsScore = isYouthPathway || (!supportPathways.includes('alcohol') && !supportPathways.includes('mental-health'))
      ? sumTool(WEMWBS_QUESTIONS)
      : undefined;

    return {
      auditScore,
      sadqScore,
      duditScore,
      gad7Score,
      phq9Score,
      crafftScore,
      wemwbsScore,
    };
  }, [answers, supportPathways, isYouthPathway]);

  // Compute clinical risk bands
  const computedBands = useMemo(() => {
    const {
      auditScore,
      sadqScore,
      duditScore,
      gad7Score,
      phq9Score,
      crafftScore,
      wemwbsScore,
    } = calculatedScores;

    return {
      auditBand: auditScore !== undefined ? calculateAuditBand(auditScore) : undefined,
      sadqBand: sadqScore !== undefined ? calculateSadqBand(sadqScore) : undefined,
      duditBand: duditScore !== undefined ? calculateDuditBand(duditScore) : undefined,
      gad7Band: gad7Score !== undefined ? calculateGad7Band(gad7Score) : undefined,
      phq9Band: phq9Score !== undefined ? calculatePhq9Band(phq9Score) : undefined,
      crafftBand: crafftScore !== undefined ? calculateCrafftBand(crafftScore) : undefined,
      wemwbsBand: wemwbsScore !== undefined ? calculateWemwbsBand(wemwbsScore) : undefined,
    };
  }, [calculatedScores]);

  // Simulated profile for generating task preview
  const provisionalProfile: WaypointUserProfile = useMemo(() => {
    const triggeredTools = clinicalBatteries.map((b) => b.tool);

    return {
      id: initialProfile?.id || `user-anon-${Date.now().toString(36)}`,
      ageBracket,
      cognitiveMode,
      microTaskMode: cognitiveMode === 'tiny-steps',
      sensoryMode,
      focusAreas: supportPathways.map((p) => p.toUpperCase()),
      supportPathways,
      orgCode: orgCode.trim() || undefined,
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
      baselineAuditScore: calculatedScores.auditScore,
      baselineSadqScore: calculatedScores.sadqScore,
      baselineDuditScore: calculatedScores.duditScore,
      baselineGad7Score: calculatedScores.gad7Score,
      baselinePhq9Score: calculatedScores.phq9Score,
      baselineCrafftScore: calculatedScores.crafftScore,
      baselineWemwbsScore: calculatedScores.wemwbsScore,
      auditBand: computedBands.auditBand,
      sadqBand: computedBands.sadqBand,
      duditBand: computedBands.duditBand,
      gad7Band: computedBands.gad7Band,
      phq9Band: computedBands.phq9Band,
      crafftBand: computedBands.crafftBand,
      wemwbsBand: computedBands.wemwbsBand,
      triagePathwaysTriggered: triggeredTools,
      communicationPreference,
      communicationSupportSuggested,
      comprehensionCheckCompleted: true,
    };
  }, [
    initialProfile,
    ageBracket,
    cognitiveMode,
    sensoryMode,
    supportPathways,
    orgCode,
    calculatedScores,
    computedBands,
    clinicalBatteries,
    communicationPreference,
    communicationSupportSuggested,
  ]);

  // Generate dynamic evidence-based tasks via InterventionMapper
  const prescribedTasks = useMemo(() => {
    return interventionMapper.generateDailyInterventions(provisionalProfile);
  }, [provisionalProfile]);

  // Final confirmation
  const handleFinalizeOnboarding = () => {
    onComplete(provisionalProfile);
  };

  return (
    <div
      id="onboarding-triage-controller"
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-[#394452] text-[#1A202C] transition-colors duration-200"
    >
      <div className="w-full max-w-xl bg-[#F7FAFC] border border-[#E2E8F0] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 text-[#1A202C]">
        {/* Header with Waypoint Logo & Progress */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <WaypointLogo size="md" variant="dark" />
          <div className="text-right">
            <span className="text-[11px] font-semibold text-[#718096]">
              Getting Started
            </span>
            <div className="flex items-center gap-1.5 justify-end mt-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  currentStage === 'age-gate' ? 'bg-sky-400' : 'bg-slate-600'
                }`}
              />
              <span
                className={`w-2 h-2 rounded-full ${
                  currentStage === 'support-pathways' ? 'bg-sky-400' : 'bg-slate-600'
                }`}
              />
              <span
                className={`w-2 h-2 rounded-full ${
                  currentStage === 'cognitive-sensory' ? 'bg-sky-400' : 'bg-slate-600'
                }`}
              />
              <span
                className={`w-2 h-2 rounded-full ${
                  currentStage === 'communication-slcn' ? 'bg-sky-400' : 'bg-slate-600'
                }`}
              />
              <span
                className={`w-2 h-2 rounded-full ${
                  currentStage === 'clinical-triage' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                }`}
              />
              <span
                className={`w-2 h-2 rounded-full ${
                  currentStage === 'prescription-preview' ? 'bg-amber-400' : 'bg-slate-600'
                }`}
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STAGE 1: AGE GATE & SAFETY ROUTING */}
        {/* ========================================================================= */}
        {currentStage === 'age-gate' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] text-[#718096] uppercase tracking-wider font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Age Gate &amp; Safety
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-[#1A202C]">
                How old are you?
              </h2>
              <p className="text-sm text-[#4A5568] leading-relaxed">
                Waypoint is made for ages 12 and up. Under-18 users are automatically protected and shown friendly youth tools.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'under-16', label: '12 – 15 years', sub: 'Youth CRAFFT & WEMWBS, plain language' },
                { id: '16-17', label: '16 – 17 years', sub: 'Adolescent transition & safety anchors' },
                { id: '18-24', label: '18 – 24 years', sub: 'Young adult, university & early career' },
                { id: '25-49', label: '25 – 49 years', sub: 'Adult life infrastructure & habit reset' },
                { id: '50+', label: '50+ years', sub: 'Long-term health, family & retirement focus' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAgeBracket(item.id as AgeBracket)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    ageBracket === item.id
                      ? 'border-[#2D3748] bg-white text-[#1A202C] shadow-md ring-2 ring-[#4A5568]/20'
                      : 'border-[#E2E8F0] bg-white text-[#4A5568] hover:border-[#CBD5E0]'
                  }`}
                >
                  <span className="font-bold text-sm text-[#1A202C]">{item.label}</span>
                  <span className="text-xs text-[#718096] mt-1">{item.sub}</span>
                </button>
              ))}
            </div>

            {/* Youth Protection Banner */}
            {isUnder18 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Youth Safeguarding Active (Under 18)</p>
                  <p className="text-amber-800 mt-0.5">
                    Adult assessments are locked. You will receive friendly youth check-ins and age-appropriate Boosts.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Standard Suite Enabled (18+)</p>
                  <p className="text-emerald-800 mt-0.5">
                    Full habit boosters across Body, Home, Money, and Mind.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setCurrentStage('support-pathways')}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#2D3748] hover:bg-[#1A202C] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <span>Continue to Needs &amp; Pathways</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: SUPPORT PATHWAYS SELECTION */}
        {/* ========================================================================= */}
        {currentStage === 'support-pathways' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] text-[#718096] uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                Support Focus
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-[#1A202C]">
                What areas would you like support with?
              </h2>
              <p className="text-sm text-[#4A5568] leading-relaxed">
                Choose what matters to you. Everything stays safely on your phone.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'alcohol' as SupportPathwayId,
                  icon: <Flame className="w-4 h-4 text-rose-500" />,
                  title: 'Help with alcohol',
                  desc: isUnder18
                    ? 'Youth alcohol safety, cravings, and peer pressure support.'
                    : 'Balanced reflections and harm-reduction strategies to manage cravings.',
                },
                {
                  id: 'substances' as SupportPathwayId,
                  icon: <Activity className="w-4 h-4 text-purple-500" />,
                  title: 'Managing substances & cravings',
                  desc: 'Practical urge surfing and trigger mapping to stay calm.',
                },
                {
                  id: 'mental-health' as SupportPathwayId,
                  icon: <Heart className="w-4 h-4 text-emerald-600" />,
                  title: 'Mental wellness (Anxiety & Low Mood)',
                  desc: 'Gentle cognitive grounding exercises and daily calming boosts.',
                },
                {
                  id: 'financial' as SupportPathwayId,
                  icon: <DollarSign className="w-4 h-4 text-amber-500" />,
                  title: 'Money & stress reduction',
                  desc: 'Zero-spend habits, tracking small wins, and removing financial worry.',
                },
                {
                  id: 'youth_justice' as SupportPathwayId,
                  icon: <Users className="w-4 h-4 text-sky-600" />,
                  title: 'Youth Justice & Key Worker Support (Child-First)',
                  desc: 'Planning worker meetings, setting personal wins, and positive restorative goals.',
                },
                {
                  id: 'general' as SupportPathwayId,
                  icon: <Compass className="w-4 h-4 text-blue-500" />,
                  title: 'Daily routine & life balance',
                  desc: 'Building a consistent daily rhythm across Body, Home, Money, and Mind.',
                },
              ].map((path) => {
                const isSelected = supportPathways.includes(path.id);
                return (
                  <button
                    key={path.id}
                    onClick={() => handleTogglePathway(path.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-[#2D3748] bg-white text-[#1A202C] shadow-md ring-2 ring-[#4A5568]/20'
                        : 'border-[#E2E8F0] bg-white text-[#4A5568] hover:border-[#CBD5E0]'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                      {path.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#1A202C]">{path.title}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                      <p className="text-xs text-[#718096] mt-1 leading-relaxed">{path.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStage('age-gate')}
                className="py-3 px-4 rounded-2xl bg-white border border-[#CBD5E0] hover:bg-slate-50 text-[#4A5568] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setCurrentStage('cognitive-sensory')}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-[#2D3748] hover:bg-[#1A202C] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <span>Continue to Routine Pacing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: EXECUTIVE FUNCTION & SENSORY MODE */}
        {/* ========================================================================= */}
        {currentStage === 'cognitive-sensory' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] text-[#718096] uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-blue-600" />
                Pacing &amp; Style
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-[#1A202C]">
                Big goals or tiny steps?
              </h2>
              <p className="text-sm text-[#4A5568] leading-relaxed">
                Choose how you want your daily tasks paced.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'big-goals' as CognitiveMode,
                  title: 'Standard Routine (10–15 mins)',
                  desc: 'Balanced daily boosts to keep your momentum steady.',
                },
                {
                  id: 'tiny-steps' as CognitiveMode,
                  title: 'Tiny Steps Mode (2 mins or less)',
                  desc: 'Low-effort micro-boosts designed to prevent overwhelm when tired.',
                },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setCognitiveMode(mode.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start justify-between ${
                    cognitiveMode === mode.id
                      ? 'border-[#2D3748] bg-white text-[#1A202C] shadow-md ring-2 ring-[#4A5568]/20'
                      : 'border-[#E2E8F0] bg-white text-[#4A5568] hover:border-[#CBD5E0]'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-[#1A202C]">{mode.title}</div>
                    <div className="text-xs text-[#718096] mt-1">{mode.desc}</div>
                  </div>
                  {cognitiveMode === mode.id && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStage('support-pathways')}
                className="py-3 px-4 rounded-2xl bg-white border border-[#CBD5E0] hover:bg-slate-50 text-[#4A5568] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setCurrentStage('communication-slcn')}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-[#2D3748] hover:bg-[#1A202C] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <span>Continue to Communication Style</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3B: SLCN COMMUNICATION PREFERENCES & UNGRADED COMPREHENSION CHECK */}
        {/* ========================================================================= */}
        {currentStage === 'communication-slcn' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#718096] uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  Communication &amp; Accessibility
                </span>
                <SpeakableText text="Communication and Accessibility. How do you prefer to take in information? Choose what feels most comfortable." />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#1A202C]">
                How do you prefer to communicate?
              </h2>
              <p className="text-sm text-[#4A5568] leading-relaxed">
                Everyone learns differently. We can read things aloud to you, provide voice notes, or keep things in short text.
              </p>
            </div>

            {/* Communication Preference Selection */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-[#2D3748] block">
                Choose your preferred mode (you can change this anytime):
              </span>
              {[
                {
                  id: 'text' as CommunicationPreferences,
                  title: 'Reading Text',
                  desc: 'Short, clear sentences with bullet points.',
                },
                {
                  id: 'voice' as CommunicationPreferences,
                  title: 'Listening & Voice Notes',
                  desc: 'Text-to-speech reading aloud and voice dictation.',
                },
                {
                  id: 'both' as CommunicationPreferences,
                  title: 'Both Text & Voice',
                  desc: 'Read or listen whenever you choose.',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCommunicationPreference(opt.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    communicationPreference === opt.id
                      ? 'border-[#2D3748] bg-white text-[#1A202C] shadow-md ring-2 ring-[#4A5568]/20'
                      : 'border-[#E2E8F0] bg-white text-[#4A5568] hover:border-[#CBD5E0]'
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm text-[#1A202C]">{opt.title}</span>
                    <p className="text-xs text-[#718096] mt-0.5">{opt.desc}</p>
                  </div>
                  {communicationPreference === opt.id && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Ungraded Comprehension Check (Directive 1) */}
            <div className="p-4 rounded-2xl bg-white border border-[#CBD5E0] shadow-sm space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A202C] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Quick Check (Not a test — no scores or grades!)
                  </span>
                  <SpeakableText text="Quick check. This is not a test and has no scores or grades. It just helps us adapt to how you like to learn." />
                </div>
                <p className="text-[11px] text-[#718096]">
                  Answer these 3 quick questions so we know how to best format your daily tasks.
                </p>
              </div>

              {/* Question 1 */}
              <div className="space-y-1.5 border-t border-[#E2E8F0] pt-3">
                <p className="text-xs font-bold text-[#2D3748]">
                  1. What is Waypoint here to do?
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { text: 'Help me take small, steady daily steps', correct: true },
                    { text: 'Give me hard tests, marks, and grades', correct: false },
                  ].map((choice, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setComprehensionAnswers((prev) => ({ ...prev, 1: choice.text }));
                        if (!choice.correct) setCommunicationSupportSuggested(true);
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        comprehensionAnswers[1] === choice.text
                          ? 'border-sky-600 bg-sky-50 text-sky-900 font-semibold'
                          : 'border-[#E2E8F0] bg-[#F7FAFC] text-[#4A5568] hover:bg-slate-100'
                      }`}
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div className="space-y-1.5 border-t border-[#E2E8F0] pt-3">
                <p className="text-xs font-bold text-[#2D3748]">
                  2. Who can read your private notes and reflections?
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { text: 'Only me on my own phone', correct: true },
                    { text: 'Anyone on the public internet', correct: false },
                  ].map((choice, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setComprehensionAnswers((prev) => ({ ...prev, 2: choice.text }));
                        if (!choice.correct) setCommunicationSupportSuggested(true);
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        comprehensionAnswers[2] === choice.text
                          ? 'border-sky-600 bg-sky-50 text-sky-900 font-semibold'
                          : 'border-[#E2E8F0] bg-[#F7FAFC] text-[#4A5568] hover:bg-slate-100'
                      }`}
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3 */}
              <div className="space-y-1.5 border-t border-[#E2E8F0] pt-3">
                <p className="text-xs font-bold text-[#2D3748]">
                  3. If you have a tough day or miss a step, what happens?
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { text: 'My progress holds steady — no streaks lost', correct: true },
                    { text: 'I get penalized and my score drops to zero', correct: false },
                  ].map((choice, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setComprehensionAnswers((prev) => ({ ...prev, 3: choice.text }));
                        if (!choice.correct) setCommunicationSupportSuggested(true);
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        comprehensionAnswers[3] === choice.text
                          ? 'border-sky-600 bg-sky-50 text-sky-900 font-semibold'
                          : 'border-[#E2E8F0] bg-[#F7FAFC] text-[#4A5568] hover:bg-slate-100'
                      }`}
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStage('cognitive-sensory')}
                className="py-3 px-4 rounded-2xl bg-white border border-[#CBD5E0] hover:bg-slate-50 text-[#4A5568] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setCurrentStage('clinical-triage')}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-[#2D3748] hover:bg-[#1A202C] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <span>Continue to Check-In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 4: CASCADING CLINICAL SINGLE-CARD SWIPER */}
        {/* ========================================================================= */}
        {currentStage === 'clinical-triage' && currentQuestion && (
          <div className="space-y-6">
            {/* Tool Battery Indicator & Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#718096] font-medium">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[#4A5568] font-bold text-[11px]">
                  Step {activeToolIndex + 1} of {clinicalBatteries.length}: {currentBattery.tool}
                </span>
                <span>
                  Question {activeQuestionIndex + 1} of {currentBattery.questions.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#2D3748] h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${((activeQuestionIndex + 1) / currentBattery.questions.length) * 100}%`,
                  }}
                />
              </div>

              <h3 className="text-xl font-bold text-[#1A202C] mt-2">
                {currentBattery.title}
              </h3>
              <p className="text-xs text-[#718096] leading-relaxed">
                {currentBattery.subtitle}
              </p>
            </div>

            {/* The Single-Card Question Swiper */}
            <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm space-y-5">
              <div className="space-y-2">
                <span className="text-[10px] text-[#718096] uppercase tracking-wider font-bold">
                  Quick Check-In
                </span>
                <h4 className="text-base sm:text-lg font-bold text-[#1A202C] leading-snug">
                  {currentQuestion.question}
                </h4>
                {currentQuestion.subtext && (
                  <p className="text-xs text-[#718096] leading-relaxed">
                    {currentQuestion.subtext}
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentQuestion.id] === option.points;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(option.points)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between text-sm ${
                        isSelected
                          ? 'border-[#2D3748] bg-slate-50 text-[#1A202C] font-bold shadow-sm ring-2 ring-[#4A5568]/20'
                          : 'border-[#E2E8F0] bg-white text-[#4A5568] hover:border-[#CBD5E0] hover:bg-slate-50/50'
                      }`}
                    >
                      <span className="font-semibold">{option.label}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-[#718096] border border-slate-200">
                        {option.points} {option.points === 1 ? 'pt' : 'pts'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation / Skip */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handlePreviousQuestion}
                className="py-2.5 px-4 rounded-2xl bg-white border border-[#CBD5E0] hover:bg-slate-50 text-[#4A5568] text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => handleSelectOption(0)}
                className="text-xs text-[#718096] hover:text-[#1A202C] underline font-medium"
              >
                Skip question
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 5: TRIAGE DIAGNOSTIC & DYNAMIC PRESCRIPTION PREVIEW */}
        {/* ========================================================================= */}
        {currentStage === 'prescription-preview' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] text-[#718096] uppercase tracking-wider font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Check-In Complete
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-[#1A202C]">
                Your Personalized Boosts
              </h2>
              <p className="text-sm text-[#4A5568] leading-relaxed">
                Waypoint has set up daily habits across Body, Home, Money, and Mind.
              </p>
            </div>

            {/* Prescribed Boosts Preview */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A202C] uppercase tracking-wider">
                  Today's Recommended Boosts ({prescribedTasks.length})
                </span>
                <span className="text-xs text-[#718096]">
                  {cognitiveMode === 'tiny-steps' ? 'Tiny Steps (2 mins)' : 'Standard Routine'}
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1">
                {prescribedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-1 text-left"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-[#1A202C] line-clamp-1">
                        {t.title}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-[#4A5568] font-bold shrink-0 capitalize">
                        {t.category === 'physical' ? 'Body' : t.category === 'family' ? 'Home' : t.category === 'financial' ? 'Money' : 'Mind'}
                      </span>
                    </div>
                    <p className="text-xs text-[#718096] line-clamp-2">
                      {t.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Shield */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Private &amp; Secure on Your Phone</p>
                <p className="text-emerald-800 mt-0.5">
                  Your answers and daily tasks stay on your device. You are completely in control.
                </p>
              </div>
            </div>

            <button
              onClick={handleFinalizeOnboarding}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#2D3748] hover:bg-[#1A202C] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <span>Launch Daily Life Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
