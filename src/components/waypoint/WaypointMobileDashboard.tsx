import React, { useState, useEffect, useMemo } from 'react';
import {
  WaypointUserProfile,
  WaypointTask,
  WaypointPillar,
  PushNotificationScheduleConfig,
} from '../../types/waypoint';
import { isTaskNonNegotiable } from '../../utils/notificationScheduler';
import { CorePillar, PillarScore } from '../../types';
import { WaypointLogo } from './WaypointLogo';
import { CrisisModal } from './CrisisModal';
import { CrisisButton } from './CrisisButton';
import { InterventionGuideModal } from './InterventionGuideModal';
import { WeeklyWrapUpCard } from './WeeklyWrapUpCard';
import { LifeBalanceRadar } from '../LifeBalanceRadar';
import { WearableConnectionModal } from './WearableConnectionModal';
import { WaypointAIAssistantModal } from './WaypointAIAssistantModal';
import { YouthActionPlan } from './YouthActionPlan';
import { WorkerSessionPrepModal } from './WorkerSessionPrepModal';
import { SpeakableText } from './SpeakableText';
import {
  biometricService,
  BiometricReading,
} from '../../services/biometricService';
import { resilienceService } from '../../services/resilienceService';
import {
  Check,
  Activity,
  Home,
  DollarSign,
  Heart,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  BatteryCharging,
  BatteryMedium,
  BatteryWarning,
  ShieldCheck,
  CheckCircle2,
  Watch,
  HelpCircle,
  Briefcase,
  Bell,
} from 'lucide-react';

interface WaypointMobileDashboardProps {
  userProfile: WaypointUserProfile;
  tasks: WaypointTask[];
  onToggleTask: (taskId: string) => void;
  onResetOnboarding: () => void;
  onUpdateProfile: (profile: WaypointUserProfile) => void;
  onSignOut?: () => void;
  onUpdateTasks?: (tasks: WaypointTask[]) => void;
  notificationConfig?: PushNotificationScheduleConfig;
  onOpenNotificationSchedule?: () => void;
  pendingNonNegotiablesCount?: number;
}

// Universal Language (Reading Age 10) Pillar Definition
interface PillarMapping {
  internalKey: WaypointPillar;
  displayName: string;
  icon: React.ComponentType<{ className?: string }>;
  colorHex: string;
  badgeBg: string;
  badgeText: string;
}

const PILLAR_MAPPINGS: PillarMapping[] = [
  {
    internalKey: 'Physical Conditioning',
    displayName: 'Body',
    icon: Activity,
    colorHex: '#10B981',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-800',
  },
  {
    internalKey: 'Household/Family Ops',
    displayName: 'Home',
    icon: Home,
    colorHex: '#3B82F6',
    badgeBg: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-800',
  },
  {
    internalKey: 'Financial Health',
    displayName: 'Money',
    icon: DollarSign,
    colorHex: '#F59E0B',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-800',
  },
  {
    internalKey: 'Mental Wellness',
    displayName: 'Mind',
    icon: Heart,
    colorHex: '#EF4444',
    badgeBg: 'bg-rose-50 border-rose-200',
    badgeText: 'text-rose-800',
  },
];

export const WaypointMobileDashboard: React.FC<WaypointMobileDashboardProps> = ({
  userProfile,
  tasks,
  onToggleTask,
  onResetOnboarding,
  onUpdateProfile,
  onSignOut,
  onUpdateTasks,
  notificationConfig,
  onOpenNotificationSchedule,
  pendingNonNegotiablesCount,
}) => {
  const [selectedPillarTab, setSelectedPillarTab] = useState<string>('All');
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState<boolean>(false);
  const [isWearableModalOpen, setIsWearableModalOpen] = useState<boolean>(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [activeInterventionTask, setActiveInterventionTask] = useState<WaypointTask | null>(null);
  const [isWorkerPrepOpen, setIsWorkerPrepOpen] = useState<boolean>(false);

  // V19 Youth Justice / Child-First Detection
  const isYouth =
    userProfile.ageBracket === 'under-16' ||
    userProfile.ageBracket === '16-17' ||
    userProfile.supportPathways?.includes('youth_justice');
  const [showYouthPlan, setShowYouthPlan] = useState<boolean>(isYouth);

  // Wearable biometrics state (Zero raw charts/HRV graphs displayed)
  const [biometricReading, setBiometricReading] = useState<BiometricReading>(() =>
    biometricService.getLatestReading()
  );

  // 30-Day Non-Punitive Resilience Score
  const resilienceData = useMemo(() => {
    return resilienceService.calculateResilienceScore(tasks);
  }, [tasks]);

  // CRITICAL DIRECTIVE 3: The "Invisible Hand" Dynamic Adjustment
  // If sleep < 6 hours:
  // 1. Silently downgrade heavy "Body" tasks to active recovery.
  // 2. Push grounding tasks to the top of the "Mind" pillar.
  const isSleepDeficit = biometricReading.sleepHours < 6.0;

  const adjustedTasks = useMemo(() => {
    return tasks.map((t) => {
      // Downgrade heavy Body tasks if sleep < 6h
      if (isSleepDeficit && t.pillar === 'Physical Conditioning') {
        const isHeavy =
          t.title.toLowerCase().includes('workout') ||
          t.title.toLowerCase().includes('run') ||
          t.title.toLowerCase().includes('conditioning') ||
          t.title.toLowerCase().includes('strength');

        if (isHeavy) {
          return {
            ...t,
            title: 'Active Recovery: Gentle 10-Min Walk or Light Stretch',
            description:
              'Paced gently for rest today. Soft motion helps your nervous system recharge without burnout.',
            timeEstimate: '10 mins',
          };
        }
      }
      return t;
    });
  }, [tasks, isSleepDeficit]);

  // Sort tasks so grounding tasks sit at the top of Mind if sleep < 6 hours
  const sortedTasks = useMemo(() => {
    return [...adjustedTasks].sort((a, b) => {
      if (isSleepDeficit) {
        const aIsGrounding =
          a.pillar === 'Mental Wellness' &&
          (a.title.toLowerCase().includes('breath') ||
            a.title.toLowerCase().includes('ground') ||
            a.title.toLowerCase().includes('calm'));
        const bIsGrounding =
          b.pillar === 'Mental Wellness' &&
          (b.title.toLowerCase().includes('breath') ||
            b.title.toLowerCase().includes('ground') ||
            b.title.toLowerCase().includes('calm'));

        if (aIsGrounding && !bIsGrounding) return -1;
        if (!aIsGrounding && bIsGrounding) return 1;
      }
      return 0;
    });
  }, [adjustedTasks, isSleepDeficit]);

  // Tally per pillar
  const pillarStats = useMemo(() => {
    return PILLAR_MAPPINGS.map((p) => {
      const pTasks = sortedTasks.filter((t) => t.pillar === p.internalKey);
      const done = pTasks.filter((t) => t.isCompleted).length;
      return {
        ...p,
        completed: done,
        total: pTasks.length,
        isAllDone: pTasks.length > 0 && done === pTasks.length,
      };
    });
  }, [sortedTasks]);

  const totalTasks = sortedTasks.length;
  const completedTasks = sortedTasks.filter((t) => t.isCompleted).length;
  const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Radar scores formatted for LifeBalanceRadar component
  const radarScores: Record<CorePillar, PillarScore> = useMemo(() => {
    const result: Record<CorePillar, PillarScore> = {
      'Physical Conditioning': {
        pillar: 'Physical Conditioning',
        completedWeight: 0,
        totalWeight: 0,
        percentage: 0,
        tasksCount: 0,
        completedCount: 0,
      },
      'Household/Family Ops': {
        pillar: 'Household/Family Ops',
        completedWeight: 0,
        totalWeight: 0,
        percentage: 0,
        tasksCount: 0,
        completedCount: 0,
      },
      'Financial Health': {
        pillar: 'Financial Health',
        completedWeight: 0,
        totalWeight: 0,
        percentage: 0,
        tasksCount: 0,
        completedCount: 0,
      },
      'Mental Wellness': {
        pillar: 'Mental Wellness',
        completedWeight: 0,
        totalWeight: 0,
        percentage: 0,
        tasksCount: 0,
        completedCount: 0,
      },
    };

    PILLAR_MAPPINGS.forEach((p) => {
      const pTasks = sortedTasks.filter((t) => t.pillar === p.internalKey);
      const doneCount = pTasks.filter((t) => t.isCompleted).length;
      const pct = pTasks.length > 0 ? Math.round((doneCount / pTasks.length) * 100) : 0;
      result[p.internalKey] = {
        pillar: p.internalKey,
        completedWeight: doneCount,
        totalWeight: pTasks.length || 1,
        percentage: pct,
        tasksCount: pTasks.length,
        completedCount: doneCount,
      };
    });

    return result;
  }, [sortedTasks]);

  // Filter tasks by active tab
  const displayedTasks = useMemo(() => {
    if (selectedPillarTab === 'All') return sortedTasks;
    const mapping = PILLAR_MAPPINGS.find((p) => p.displayName === selectedPillarTab);
    if (!mapping) return sortedTasks;
    return sortedTasks.filter((t) => t.pillar === mapping.internalKey);
  }, [sortedTasks, selectedPillarTab]);

  return (
    <div
      id="waypoint-mobile-dashboard"
      className="min-h-screen w-full flex justify-center py-6 px-4 sm:px-6 pb-28 bg-[#394452] text-slate-100 font-sans"
    >
      <div className="w-full max-w-md flex flex-col gap-5">
        {/* =========================================================================
            ZONE 1: THE HEADER
            Single Logo: Continuous-line "W" + "Waypoint" (No duplicate headers)
            ========================================================================= */}
        <header
          id="waypoint-header"
          aria-label="Waypoint Header"
          className="p-4 sm:p-5 rounded-3xl bg-[#F7FAFC] border border-[#E2E8F0] shadow-md flex items-center justify-between text-[#1A202C]"
        >
          <div className="flex items-center">
            <WaypointLogo size="md" variant="dark" />
          </div>

          <div className="flex items-center gap-2">
            {onOpenNotificationSchedule && (
              <button
                type="button"
                id="waypoint-notification-schedule-btn"
                onClick={onOpenNotificationSchedule}
                title={
                  notificationConfig?.enabled
                    ? `Push Reminders Active (${notificationConfig.scheduledTime})`
                    : 'Configure Non-Negotiables Push Reminders'
                }
                className={`p-2 rounded-xl border transition-all relative ${
                  notificationConfig?.enabled
                    ? 'bg-sky-50 border-sky-300 text-sky-700 hover:bg-sky-100 shadow-sm'
                    : 'bg-white border-[#CBD5E0] text-[#4A5568] hover:bg-slate-50'
                }`}
                aria-label="Notification Reminders"
              >
                <Bell className="w-4 h-4" />
                {pendingNonNegotiablesCount !== undefined && pendingNonNegotiablesCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-[9px] font-bold text-white flex items-center justify-center font-mono shadow">
                    {pendingNonNegotiablesCount}
                  </span>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsWorkerPrepOpen(true)}
              title="Practitioner session brief"
              className="px-2.5 py-1.5 rounded-xl bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-800 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">Worker Prep</span>
            </button>
            <button
              type="button"
              onClick={onResetOnboarding}
              title="Reset preferences"
              className="p-2 rounded-xl bg-white border border-[#CBD5E0] hover:bg-slate-50 text-[#4A5568] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                title="Sign out"
                className="p-2 rounded-xl bg-white border border-[#CBD5E0] hover:bg-slate-50 text-[#4A5568] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* =========================================================================
            ZONE 2: THE LIFELINE
            Muted terracotta (#C25953) "Crisis Support" Button
            ========================================================================= */}
        <section id="waypoint-lifeline" aria-label="Crisis Support">
          <CrisisButton onClick={() => setIsCrisisModalOpen(true)} label="Crisis Support" />
        </section>

        {/* =========================================================================
            CRITICAL DIRECTIVE 3: THE "INVISIBLE HAND" READINESS UI (Daily Battery)
            Zero raw graphs, zero sleep charts, zero HRV lines.
            Simple, intuitive "Daily Battery" card.
            ========================================================================= */}
        <section id="daily-battery-card" aria-label="Daily Energy Readiness">
          <div
            onClick={() => setIsWearableModalOpen(true)}
            className="p-5 rounded-3xl bg-[#F7FAFC] border border-[#E2E8F0] shadow-md text-[#1A202C] cursor-pointer hover:border-[#CBD5E0] transition-all group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isSleepDeficit
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {isSleepDeficit ? (
                    <BatteryMedium className="w-6 h-6" />
                  ) : (
                    <BatteryCharging className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#1A202C]">
                      {isSleepDeficit ? 'Daily Battery: 40%' : 'Daily Battery: 85%'}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        isSleepDeficit
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isSleepDeficit ? 'Low Power Mode' : 'Fully Charged'}
                    </span>
                  </div>
                  <p className="text-xs text-[#718096] mt-0.5">
                    {isSleepDeficit
                      ? 'Short rest detected: Body tasks softened to gentle recovery.'
                      : 'Rest threshold met: Balanced momentum active.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <SpeakableText
                  text={
                    isSleepDeficit
                      ? 'Daily Battery is at 40 percent. Short rest detected. Body tasks have been softened to gentle recovery.'
                      : 'Daily Battery is at 85 percent. Rest threshold met. Balanced momentum active.'
                  }
                />
                <div className="p-2 rounded-xl bg-white border border-[#CBD5E0] text-[#4A5568] group-hover:text-[#1A202C] transition-colors">
                  <Watch className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            ZONE 3: THE DAILY ACTION ZONE (Above the fold)
            Universal Language: Body, Home, Money, Mind.
            Tasks are called "Boosts".
            ========================================================================= */}
        <section id="daily-action-zone" aria-label="Daily Boosts" className="space-y-3.5">
          {/* 4 Pillars Filter Tabs */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setSelectedPillarTab('All')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                selectedPillarTab === 'All'
                  ? 'bg-white text-[#1A202C] shadow-sm border border-[#CBD5E0]'
                  : 'bg-black/15 text-slate-300 hover:text-white'
              }`}
            >
              All Boosts ({completedTasks}/{totalTasks})
            </button>

            {PILLAR_MAPPINGS.map((p) => {
              const pTasks = sortedTasks.filter((t) => t.pillar === p.internalKey);
              const done = pTasks.filter((t) => t.isCompleted).length;
              const isSelected = selectedPillarTab === p.displayName;
              const IconComp = p.icon;

              return (
                <button
                  key={p.displayName}
                  type="button"
                  onClick={() => setSelectedPillarTab(p.displayName)}
                  className={`px-3 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                    isSelected
                      ? 'bg-white text-[#1A202C] shadow-sm border border-[#CBD5E0]'
                      : 'bg-black/15 text-slate-300 hover:text-white'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{p.displayName}</span>
                  <span className="text-[10px] opacity-75">
                    ({done}/{pTasks.length})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Non-Negotiable Push Notification Scheduler Banner */}
          {onOpenNotificationSchedule && (
            <div
              id="nn-push-schedule-banner"
              className="p-3 rounded-2xl bg-white border border-[#CBD5E0] shadow-sm flex items-center justify-between gap-3 text-xs text-[#1A202C]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="font-bold text-[#1A202C] flex items-center gap-1.5">
                    <span>Non-Negotiables Reminder</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-bold">
                      {notificationConfig?.enabled ? notificationConfig.scheduledTime : 'Off'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#718096] truncate">
                    {pendingNonNegotiablesCount !== undefined && pendingNonNegotiablesCount > 0
                      ? `${pendingNonNegotiablesCount} daily anchor${pendingNonNegotiablesCount > 1 ? 's' : ''} pending alert`
                      : 'All non-negotiable anchors completed today'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenNotificationSchedule}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shrink-0 transition-colors shadow-sm"
              >
                Schedule
              </button>
            </div>
          )}

          {/* Daily Boost Cards */}
          <div className="space-y-3">
            {displayedTasks.map((task) => {
              const mapping =
                PILLAR_MAPPINGS.find((p) => p.internalKey === task.pillar) || PILLAR_MAPPINGS[0];
              const IconComp = mapping.icon;
              const isExpanded = expandedTaskId === task.id;
              const isNN = isTaskNonNegotiable(task);

              return (
                <div
                  key={task.id}
                  className={`p-4 sm:p-5 rounded-3xl bg-[#F7FAFC] border transition-all shadow-md text-[#1A202C] ${
                    task.isCompleted
                      ? 'border-emerald-200/80 bg-emerald-50/20'
                      : 'border-[#E2E8F0] hover:border-[#CBD5E0]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Satisfying 44px Checkbox */}
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all active:scale-95 ${
                        task.isCompleted
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-white border-2 border-[#CBD5E0] hover:border-slate-400 text-transparent'
                      }`}
                      aria-label={
                        task.isCompleted
                          ? `Mark ${task.title} incomplete`
                          : `Mark ${task.title} complete`
                      }
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                    </button>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${mapping.badgeBg} ${mapping.badgeText}`}
                        >
                          {mapping.displayName} Boost
                        </span>
                        {isNN && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5 text-amber-700" />
                            <span>Non-Negotiable</span>
                          </span>
                        )}
                        {task.timeEstimate && (
                          <span className="text-[10px] text-[#718096] font-medium">
                            {task.timeEstimate}
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm font-bold text-[#1A202C] leading-snug ${
                          task.isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h3>

                      <p className="text-xs text-[#4A5568] leading-relaxed line-clamp-2">
                        {task.description}
                      </p>

                      {/* Interactive boost button or guide trigger */}
                      {task.interventionType === 'harm-reduction' && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setActiveInterventionTask(task)}
                            className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                            <span>Open Wave Practice</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Expandable rationale toggle */}
                    <button
                      type="button"
                      onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label="Why this boost helps"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Expanded simple explanation (Reading age 10) */}
                  {isExpanded && (
                    <div className="mt-3.5 pt-3 border-t border-[#E2E8F0] space-y-2 text-xs text-[#4A5568] animate-in fade-in duration-150">
                      <div className="flex items-start gap-2">
                        <HelpCircle className="w-4 h-4 text-[#718096] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-[#1A202C]">Why this Boost helps: </strong>
                          {task.clinicalRationale ||
                            'Small daily habits give your brain a gentle sense of safety and steady progress.'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            V19 YOUTH ACTION PLAN (Child-First & Youth Justice Pathway)
            ========================================================================= */}
        {(isYouth || showYouthPlan) && (
          <section id="youth-action-plan-section" aria-label="Youth Action Plan">
            <YouthActionPlan />
          </section>
        )}

        {/* =========================================================================
            ZONE 4: THE REFLECTION ZONE (Below the fold)
            Analytical & reflective components:
            1. The WeeklyWrapUpCard (Local AI Summary)
            2. The LifeBalanceRadar (4-Axis Holistic Visualization)
            3. Non-punitive 30-Day Strength Score
            ========================================================================= */}
        <section id="reflection-zone" aria-label="Reflection Zone" className="space-y-5 pt-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Your Reflection Zone
            </h2>
            <span className="text-[11px] text-slate-300">
              Weekly progress
            </span>
          </div>

          {/* 1. On-Device AI Weekly Story */}
          <WeeklyWrapUpCard tasks={tasks} userProfile={userProfile} />

          {/* 2. 4-Pillars Life Balance Radar */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#F7FAFC] border border-[#E2E8F0] shadow-md text-[#1A202C] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1A202C]">
                  Life Balance Shape
                </h3>
                <p className="text-xs text-[#718096]">
                  Body, Home, Money, and Mind
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                {overallPercentage}% Balanced
              </span>
            </div>

            <div className="flex justify-center py-2">
              <LifeBalanceRadar scores={radarScores} size={260} showDetails={false} />
            </div>
          </div>

          {/* 3. 30-Day Strength (Non-Punitive Resilience Score) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#F7FAFC] border border-[#E2E8F0] shadow-md text-[#1A202C] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-[#1A202C]">
                  30-Day Strength
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <SpeakableText
                  text={`30-Day Strength score is ${resilienceData.score} out of 100. Missed days do not erase your past efforts. Stability is built on getting back up gently.`}
                />
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {resilienceData.score}/100
                </span>
              </div>
            </div>

            <p className="text-xs text-[#4A5568] leading-relaxed">
              Every small action counts. Missed days do not erase your past efforts—stability is
              built on getting back up gently.
            </p>

            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${resilienceData.score}%` }}
              />
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================================
          CRITICAL DIRECTIVE: FLOATING "WAYPOINT AI" ASSISTANT BUTTON (FAB)
          Persistent FAB in bottom right corner of mobile dashboard with "W" logo icon.
          Tapping opens bottom-sheet chat with on-device SLM SQLite tool-calling.
          ========================================================================= */}
      <button
        id="waypoint-ai-fab"
        type="button"
        onClick={() => setIsAIAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#2D3748] hover:bg-[#1A202C] active:scale-95 text-[#F7FAFC] py-2.5 px-4 rounded-full shadow-2xl border-2 border-[#CBD5E0]/40 flex items-center gap-2.5 transition-all group"
        aria-label="Open Waypoint AI Assistant"
      >
        <div className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
          <WaypointLogo size="sm" iconOnly variant="warm-sand" />
        </div>
        <span className="text-xs font-bold tracking-wide text-white">Waypoint AI</span>
      </button>

      {/* Waypoint AI Chat Modal */}
      <WaypointAIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        tasks={tasks}
        userProfile={userProfile}
        onUpdateTasks={(updated) => {
          if (onUpdateTasks) onUpdateTasks(updated);
        }}
      />

      {/* Wearable Connection Modal (Explains watch permissions in plain English) */}
      <WearableConnectionModal
        isOpen={isWearableModalOpen}
        onClose={() => setIsWearableModalOpen(false)}
        onSyncReading={(reading) => setBiometricReading(reading)}
      />

      {/* 5-4-3-2-1 Crisis & Grounding Modal */}
      <CrisisModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
        userProfile={userProfile}
      />

      {/* Interactive Intervention Modal (Wave Surfing Practice) */}
      {activeInterventionTask && (
        <InterventionGuideModal
          task={activeInterventionTask}
          isOpen={true}
          onClose={() => setActiveInterventionTask(null)}
          onCompleteTask={(taskId) => {
            onToggleTask(taskId);
          }}
          userProfile={userProfile}
        />
      )}

      {/* V22 Key Worker Session-Prep Brief (Directive 5) */}
      <WorkerSessionPrepModal
        isOpen={isWorkerPrepOpen}
        onClose={() => setIsWorkerPrepOpen(false)}
        userProfile={userProfile}
        tasks={tasks}
      />
    </div>
  );
};
