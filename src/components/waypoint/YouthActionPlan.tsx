import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  CalendarCheck,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Heart,
  BookOpen,
  ArrowRight,
  MessageCircle,
  Award,
  Scale,
  GraduationCap,
  HeartHandshake,
  Share2,
  Volume2,
  Plus,
  Flame,
} from 'lucide-react';
import { YJSSession, RestorativeMilestone, ReparationLogEntry, ETEMicroTask } from '../../types/waypoint';
import { SpeakableText } from './SpeakableText';
import { VoiceNoteInput } from './VoiceNoteInput';
import { CourtPrepModal } from './CourtPrepModal';
import { ContinuityPassModal } from './ContinuityPassModal';
import {
  getReparationLogs,
  saveReparationLog,
  getTotalReparationHoursThisMonth,
  getETEDayRecords,
  saveETEDayRecord,
} from '../../utils/waypointStorage';

interface YouthActionPlanProps {
  onTaskComplete?: (milestoneId: string) => void;
  workerName?: string;
  workerRole?: string;
  nextMeetingDate?: string;
  hasUpcomingCourt?: boolean;
}

/**
 * ============================================================================
 * YOUTH ACTION PLAN (V22 Youth Justice & Child-First Module)
 * ============================================================================
 * Adheres to UK Child-First Justice principles and the "Soft Monolith" design system.
 * Reading Age: 10.
 * Core Features:
 * 1. SLCN-Aware Text-to-Speech & Voice Notes (Directive 1)
 * 2. Getting Ready for Court Paced Guide (Directive 2)
 * 3. Reparation & Restorative Hours Logging (Directive 3)
 * 4. Education, Training & Employment (ETE) Mini-Pillar with Holding Resilience (Directive 4)
 * 5. Opt-in Transition Continuity Pass (Directive 6)
 * ============================================================================
 */
export const YouthActionPlan: React.FC<YouthActionPlanProps> = ({
  workerName = 'Jordan (Key Worker)',
  workerRole = 'Youth Justice Mentor',
  nextMeetingDate = 'Thursday at 3:30 PM',
  hasUpcomingCourt = true, // Defaults to true for testability/accessibility
}) => {
  // Modals State
  const [isCourtModalOpen, setIsCourtModalOpen] = useState<boolean>(false);
  const [isContinuityModalOpen, setIsContinuityModalOpen] = useState<boolean>(false);

  // Calendar Sync State
  const [isCalendarSynced, setIsCalendarSynced] = useState<boolean>(false);
  const [showCalendarNotice, setShowCalendarNotice] = useState<boolean>(false);

  // Local Session Preparation Prompts (Zero-PII)
  const [prepTalkTopic, setPrepTalkTopic] = useState<string>(() => {
    return localStorage.getItem('waypoint_yjs_prep_topic') || '';
  });
  const [prepWin, setPrepWin] = useState<string>(() => {
    return localStorage.getItem('waypoint_yjs_prep_win') || '';
  });
  const [prepStress, setPrepStress] = useState<string>(() => {
    return localStorage.getItem('waypoint_yjs_prep_stress') || '';
  });
  const [isPrepSaved, setIsPrepSaved] = useState<boolean>(false);
  const [isPrepExpanded, setIsPrepExpanded] = useState<boolean>(true);

  // Directive 3: Reparation & Restorative Logging State
  const [reparationLogs, setReparationLogs] = useState<ReparationLogEntry[]>([]);
  const [reparationHoursInput, setReparationHoursInput] = useState<string>('2');
  const [reparationDescInput, setReparationDescInput] = useState<string>('Community garden maintenance');
  const [totalReparationHours, setTotalReparationHours] = useState<number>(8.5);
  const [reparationSavedNotice, setReparationSavedNotice] = useState<boolean>(false);

  // Directive 4: ETE Micro-Tracker State
  const [eteAttendedToday, setEteAttendedToday] = useState<boolean | null>(() => {
    const records = getETEDayRecords();
    const today = new Date().toISOString().slice(0, 10);
    const todayRecord = records.find((r) => r.date === today);
    return todayRecord ? todayRecord.attended : null;
  });
  const [eteStreakHeldMessage, setEteStreakHeldMessage] = useState<string>('');
  const [eteTasks, setEteTasks] = useState<ETEMicroTask[]>([
    { id: 'ete-1', title: 'One line of your CV or personal intro', completed: false },
    { id: 'ete-2', title: 'Message your tutor or advisor about tomorrow', completed: true },
    { id: 'ete-3', title: 'Pack bag or set alarms the night before', completed: false },
    { id: 'ete-4', title: 'Check bus or train travel times', completed: true },
  ]);

  // Restorative Reflection Milestones
  const [milestones, setMilestones] = useState<RestorativeMilestone[]>([
    {
      id: 'resto-1',
      title: 'Empathy & Perspective Check',
      category: 'reflection',
      description: 'Think of one person you care about. How can you make their day easier today?',
      timeEstimate: '2 mins',
      completed: false,
      reflectionPrompt: 'One kind thing you thought of or said:',
      userReflection: '',
    },
    {
      id: 'resto-2',
      title: 'Positive Action at Home',
      category: 'repair',
      description: 'Do one helpful thing for your family or household (tidy a room or make a tea).',
      timeEstimate: '5 mins',
      completed: false,
    },
    {
      id: 'resto-3',
      title: 'Future Step (College / Training)',
      category: 'education-training',
      description: 'Spend 5 minutes looking at a college course, apprentice trade, or hobby you like.',
      timeEstimate: '5 mins',
      completed: false,
    },
  ]);

  // Load initial logs
  useEffect(() => {
    const logs = getReparationLogs();
    setReparationLogs(logs);
    setTotalReparationHours(getTotalReparationHoursThisMonth());
  }, []);

  // Handle saving session prep notes locally
  const handleSavePrep = () => {
    localStorage.setItem('waypoint_yjs_prep_topic', prepTalkTopic);
    localStorage.setItem('waypoint_yjs_prep_win', prepWin);
    localStorage.setItem('waypoint_yjs_prep_stress', prepStress);
    setIsPrepSaved(true);
    setTimeout(() => setIsPrepSaved(false), 2500);
  };

  // Secure Calendar Sync (Simulates native OS calendar integration)
  const handleToggleCalendarSync = () => {
    const nextSync = !isCalendarSynced;
    setIsCalendarSynced(nextSync);
    setShowCalendarNotice(true);
    setTimeout(() => setShowCalendarNotice(false), 4000);
  };

  // Toggle milestone completion
  const handleToggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  // Directive 3: Save Reparation Entry
  const handleAddReparationHours = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseFloat(reparationHoursInput);
    if (isNaN(hours) || hours <= 0) return;

    const newEntry = saveReparationLog({
      hoursCompleted: hours,
      description: reparationDescInput.trim() || 'Community repair activity',
      date: new Date().toISOString().slice(0, 10),
      pathway: 'restorative_justice',
    });

    setReparationLogs((prev) => [newEntry, ...prev]);
    setTotalReparationHours(getTotalReparationHoursThisMonth());
    setReparationSavedNotice(true);
    setTimeout(() => setReparationSavedNotice(false), 3000);
  };

  // Directive 4: ETE Attendance toggle (Holding resilience score pattern)
  const handleSetEteAttendance = (attended: boolean) => {
    setEteAttendedToday(attended);
    const today = new Date().toISOString().slice(0, 10);
    saveETEDayRecord({
      date: today,
      attended,
      streakHeld: true,
      tasksCompleted: eteTasks.filter((t) => t.completed).map((t) => t.id),
    });

    if (attended) {
      setEteStreakHeldMessage('Great job showing up today! Your progress is moving forward.');
    } else {
      // Non-punitive hold
      setEteStreakHeldMessage('Held at 84% — no streaks lost. Tomorrow is a fresh start.');
    }
  };

  const handleToggleEteTask = (id: string) => {
    setEteTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedCount = milestones.filter((m) => m.completed).length;

  return (
    <div
      id="youth-action-plan"
      className="p-5 sm:p-6 rounded-3xl bg-[#F7FAFC] border border-[#E2E8F0] shadow-md text-[#1A202C] space-y-5"
    >
      {/* Header: Child-First Supportive Badge */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#1A202C]">
                My Action Plan
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                Child-First
              </span>
            </div>
            <p className="text-xs text-[#718096]">
              Your goals, worker catch-ups, and positive steps forward
            </p>
          </div>
        </div>

        {/* Milestone Badge & Audio Support */}
        <div className="flex items-center gap-2">
          <SpeakableText
            text="My Action Plan. Your goals, worker catch-ups, and positive steps forward."
            buttonClassName="bg-white border border-[#CBD5E0] p-1.5"
          />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>{completedCount}/{milestones.length} Steps</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DIRECTIVE 2: GETTING READY FOR COURT (Paced Step-by-Step Card)
          ========================================================================= */}
      {hasUpcomingCourt && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-900 to-[#1e293b] text-white shadow-md border border-sky-700 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/30 shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                  Coming Up in 7 Days
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  Getting Ready for Court
                </h3>
                <p className="text-xs text-slate-300">
                  Leeds Youth Court • Thursday 10:00 AM • Jordan will be there with you
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCourtModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-md transition-all"
            >
              <span>See Court Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 rounded-xl bg-black/25 border border-sky-800/40 text-[11px] text-slate-300 flex items-center justify-between">
            <span>
              Plain-language guide: who will be in the room, how long it takes, and what you&apos;ll be asked.
            </span>
            <SpeakableText
              text="Getting Ready for Court. Leeds Youth Court. Thursday at 10 AM. Jordan will be there with you. Tap See Court Guide for a step-by-step walkthrough."
              buttonClassName="text-sky-300 hover:text-white"
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: WORKER MEETING & SECURE CALENDAR SYNC
          ========================================================================= */}
      <div className="p-4 rounded-2xl bg-white border border-[#CBD5E0] shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
              Next Worker Catch-Up
            </span>
            <h3 className="text-sm font-bold text-[#1A202C] mt-0.5">
              Catch-up with {workerName}
            </h3>
            <p className="text-xs text-[#718096]">
              {workerRole} • Leeds Youth Hub
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleCalendarSync}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isCalendarSynced
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-slate-100 hover:bg-slate-200 text-[#2D3748]'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isCalendarSynced ? 'Synced to Phone' : 'Add to Calendar'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs bg-[#F7FAFC] p-3 rounded-xl border border-[#E2E8F0]">
          <div className="flex items-center gap-2 text-[#4A5568]">
            <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>{nextMeetingDate}</span>
          </div>
          <div className="flex items-center gap-2 text-[#4A5568]">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Room 3, Quiet Hub</span>
          </div>
        </div>

        {showCalendarNotice && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isCalendarSynced
                ? 'Added meeting reminder to your local calendar with private alert.'
                : 'Removed calendar reminder.'}
            </span>
          </div>
        )}
      </div>

      {/* =========================================================================
          DIRECTIVE 4: ETE MINI-PILLAR (Education, Training & Employment)
          Non-punitive Resilience Score pattern — missed day holds, never resets!
          ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5E0] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700 border border-purple-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#1A202C]">
                  College, Training &amp; Work (ETE)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                  AssetPlus Life Opportunities
                </span>
              </div>
              <p className="text-xs text-[#718096]">
                Non-punitive tracker: missed days hold your score, never reset.
              </p>
            </div>
          </div>
          <SpeakableText text="College, Training and Work. Did you go today? Missing a day holds your resilience score, it never resets." />
        </div>

        {/* "Did you go today?" Question */}
        <div className="p-3.5 rounded-2xl bg-[#F7FAFC] border border-[#E2E8F0] space-y-2.5">
          <div className="text-xs font-bold text-[#2D3748]">Did you attend college or training today?</div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleSetEteAttendance(true)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                eteAttendedToday === true
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-[#CBD5E0] text-[#2D3748] hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Yes, Attended</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetEteAttendance(false)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                eteAttendedToday === false
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white border border-[#CBD5E0] text-[#2D3748] hover:bg-slate-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Rest / Missed Day</span>
            </button>
          </div>

          {eteStreakHeldMessage && (
            <div className="p-2 rounded-xl bg-white border border-[#CBD5E0] text-xs text-[#4A5568] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{eteStreakHeldMessage}</span>
            </div>
          )}
        </div>

        {/* ETE Micro-Tasks */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-[#718096] uppercase tracking-wide">
            Small Positive Work Steps:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {eteTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => handleToggleEteTask(task.id)}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all text-xs ${
                  task.completed
                    ? 'bg-purple-50/60 border-purple-200 text-purple-900 font-semibold'
                    : 'bg-white border-[#E2E8F0] text-[#4A5568] hover:border-[#CBD5E0]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 ${
                    task.completed ? 'bg-purple-600 text-white' : 'border border-[#A0AEC0]'
                  }`}
                >
                  {task.completed && <CheckCircle2 className="w-3 h-3" />}
                </div>
                <span>{task.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          DIRECTIVE 3: REPARATION & RESTORATIVE HOURS LOGGING
          Maps to AssetPlus restorative_justice pathway
          ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#CBD5E0] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#1A202C]">
                  Log Reparation Hours
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  Restorative Justice
                </span>
              </div>
              <p className="text-xs text-[#718096]">
                Track your community projects, repairs, and voluntary contributions.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#718096] uppercase font-bold block">This Month</span>
            <span className="text-sm font-extrabold text-amber-700">{totalReparationHours} Hours</span>
          </div>
        </div>

        <form onSubmit={handleAddReparationHours} className="space-y-3 bg-[#F7FAFC] p-3.5 rounded-2xl border border-[#E2E8F0]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-[#4A5568] block mb-1">
                Hours Completed:
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                value={reparationHoursInput}
                onChange={(e) => setReparationHoursInput(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E0] text-xs text-[#1A202C] focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-[#4A5568] block">
                  What did you help with?
                </label>
                <VoiceNoteInput
                  currentValue={reparationDescInput}
                  onTranscript={(txt) => setReparationDescInput(txt)}
                  promptHint="Say what you repaired or helped with..."
                  buttonClassName="py-0.5 px-2 text-[10px]"
                />
              </div>
              <input
                type="text"
                value={reparationDescInput}
                onChange={(e) => setReparationDescInput(e.target.value)}
                placeholder="e.g. Cleared the community garden, painted youth centre..."
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#CBD5E0] text-xs text-[#1A202C] focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#718096] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Feeds aggregated desistance metrics (Zero individual PII)
            </span>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              {reparationSavedNotice ? '✓ Logged!' : 'Save Reparation Hours'}
            </button>
          </div>
        </form>

        {/* Recent logs */}
        {reparationLogs.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-[#718096] uppercase tracking-wider">
              Recent Reparation Steps:
            </div>
            {reparationLogs.slice(0, 2).map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-semibold text-[#1A202C]">{log.description}</span>
                  <span className="text-[10px] text-[#718096] block">{log.date}</span>
                </div>
                <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                  +{log.hoursCompleted} hrs
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 2: LOCAL SESSION PREPARATION PROMPTS (Zero-PII)
          With SLCN-Aware Voice Dictation & Speakable Text (Directive 1)
          ========================================================================= */}
      <div className="p-4 rounded-2xl bg-white border border-[#CBD5E0] shadow-sm space-y-3">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsPrepExpanded(!isPrepExpanded)}
        >
          <div>
            <h3 className="text-sm font-bold text-[#1A202C]">
              What Matters to Me (Prep for Next Meeting)
            </h3>
            <p className="text-xs text-[#718096]">
              Your private thoughts for your catch-up. Stored only on your phone.
            </p>
          </div>
          <button
            type="button"
            className="p-1 rounded-lg text-[#718096] hover:bg-slate-100"
            aria-label="Toggle prep prompts"
          >
            {isPrepExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isPrepExpanded && (
          <div className="space-y-3 pt-2">
            {/* Prompt 1: What I want to discuss */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#2D3748]">
                  One thing I want to talk about:
                </label>
                <VoiceNoteInput
                  currentValue={prepTalkTopic}
                  onTranscript={(txt) => setPrepTalkTopic(txt)}
                  buttonClassName="py-0.5 px-2 text-[10px]"
                />
              </div>
              <input
                type="text"
                value={prepTalkTopic}
                onChange={(e) => setPrepTalkTopic(e.target.value)}
                placeholder="e.g. My apprenticeship search, trouble sleeping, housing..."
                className="w-full px-3 py-2 rounded-xl bg-[#F7FAFC] border border-[#CBD5E0] text-xs text-[#1A202C] placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Prompt 2: Positive Win */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#2D3748]">
                  One positive thing that happened this week:
                </label>
                <VoiceNoteInput
                  currentValue={prepWin}
                  onTranscript={(txt) => setPrepWin(txt)}
                  buttonClassName="py-0.5 px-2 text-[10px]"
                />
              </div>
              <input
                type="text"
                value={prepWin}
                onChange={(e) => setPrepWin(e.target.value)}
                placeholder="e.g. Cooked a meal, kept calm when annoyed, helped my sister..."
                className="w-full px-3 py-2 rounded-xl bg-[#F7FAFC] border border-[#CBD5E0] text-xs text-[#1A202C] placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#718096] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Zero-PII • Saved strictly on your phone
              </span>
              <button
                type="button"
                onClick={handleSavePrep}
                className="px-4 py-1.5 rounded-xl bg-[#2D3748] hover:bg-[#1A202C] text-white text-xs font-bold transition-all"
              >
                {isPrepSaved ? '✓ Saved on Phone' : 'Save Notes'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 3: RESTORATIVE REFLECTION MICRO-TASKS
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1A202C]">
              Restorative Steps for Today
            </h3>
            <p className="text-xs text-[#718096]">
              Simple positive habits to build empathy, trust, and future skills.
            </p>
          </div>
          <SpeakableText text="Restorative Steps for Today. Simple positive habits to build empathy, trust, and future skills." />
        </div>

        <div className="space-y-2.5">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                milestone.completed
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E0]'
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggleMilestone(milestone.id)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  milestone.completed
                    ? 'bg-emerald-600 text-white'
                    : 'border-2 border-[#CBD5E0] hover:border-[#718096]'
                }`}
                aria-label={`Mark ${milestone.title} as completed`}
              >
                {milestone.completed && <CheckCircle2 className="w-4 h-4" />}
              </button>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-bold text-xs ${
                      milestone.completed ? 'line-through text-emerald-800' : 'text-[#1A202C]'
                    }`}
                  >
                    {milestone.title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-[#718096] bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                      {milestone.timeEstimate}
                    </span>
                    <SpeakableText
                      text={`${milestone.title}. ${milestone.description}`}
                      buttonClassName="p-1"
                    />
                  </div>
                </div>
                <p
                  className={`text-xs mt-1 leading-relaxed ${
                    milestone.completed ? 'text-emerald-700' : 'text-[#4A5568]'
                  }`}
                >
                  {milestone.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          DIRECTIVE 6: TRANSITION CONTINUITY PASS (Opt-In High-Trust Generator)
          ========================================================================= */}
      <div className="p-4 rounded-2xl bg-[#EDF2F7] border border-[#CBD5E0] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white text-slate-700 border border-[#CBD5E0] shrink-0">
            <Share2 className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1A202C]">
              Moving to Adult Services Soon?
            </h4>
            <p className="text-[11px] text-[#4A5568]">
              Create your voluntary Continuity Pass to share what worked, what didn&apos;t, and your communication style.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsContinuityModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-sky-700 border border-sky-300 text-xs font-bold shrink-0 shadow-sm transition-all flex items-center gap-1.5"
        >
          <span>Open Pass</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Court Preparation Modal */}
      <CourtPrepModal
        isOpen={isCourtModalOpen}
        onClose={() => setIsCourtModalOpen(false)}
        workerName={workerName}
        courtName="Leeds Youth Court"
        appointmentDate={nextMeetingDate}
      />

      {/* Continuity Pass Modal */}
      <ContinuityPassModal
        isOpen={isContinuityModalOpen}
        onClose={() => setIsContinuityModalOpen(false)}
        currentResilienceScore={84}
      />
    </div>
  );
};
