import React, { useState } from 'react';
import {
  Flame,
  Check,
  AlertCircle,
  Shield,
  Plus,
  Sparkles,
  Calendar,
  Zap,
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sliders,
  LifeBuoy,
  Crosshair,
  Brain,
  Clock,
  Eye,
  EyeOff,
  Settings2,
} from 'lucide-react';
import { Task, PillarType, CorePillar } from '../types';
import { HabitIcon } from './HabitIcon';
import { PILLAR_METADATA } from '../data/initialHabits';
import {
  getTodayDateString,
  formatDisplayDate,
  calculatePillarScores,
  normalizePillar,
} from '../utils/dateUtils';
import {
  loadDeepFocusConfig,
  saveDeepFocusConfig,
  isCurrentlyWorkHours,
  isDeepFocusActive,
  formatWorkHoursString,
  DeepFocusConfig,
  DEFAULT_NON_ESSENTIAL_PILLARS,
  isTaskNonEssentialDuringWork,
} from '../utils/focusModeUtils';
import { LifeBalanceRadar } from './LifeBalanceRadar';
import { RedCrisisButton } from './CrisisSupportModal';

interface DashboardScreenProps {
  habits: Task[];
  onToggleHabit: (habitId: string, dateStr: string) => void;
  onOpenEmergency: () => void;
  onNavigateToAdd: () => void;
  streakDays: number;
  longestStreak: number;
  onOpenAccount?: () => void;
  onQuickAddWin?: (name: string, pillar: PillarType, metric: string) => void;
}

export function DashboardScreen({
  habits,
  onToggleHabit,
  onOpenEmergency,
  onNavigateToAdd,
  streakDays,
  longestStreak,
  onOpenAccount,
  onQuickAddWin,
}: DashboardScreenProps) {
  const today = getTodayDateString();
  const [filterPillar, setFilterPillar] = useState<'All' | CorePillar>('All');
  const [showOnlyNonNegotiables, setShowOnlyNonNegotiables] = useState(false);
  const [showRadarExpanded, setShowRadarExpanded] = useState(true);
  const [quickWinText, setQuickWinText] = useState('');
  const [quickWinPillar, setQuickWinPillar] = useState<CorePillar>('Physical Conditioning');
  const [isMicroLoggerOpen, setIsMicroLoggerOpen] = useState(false);

  // Deep Focus State & Work Hours Detection
  const [focusConfig, setFocusConfig] = useState<DeepFocusConfig>(() => loadDeepFocusConfig());
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showFocusSettings, setShowFocusSettings] = useState(false);

  const isWorkHoursNow = isCurrentlyWorkHours(focusConfig.workHoursStart, focusConfig.workHoursEnd);
  const isDeepFocusMode = isDeepFocusActive(focusConfig);

  const handleToggleDeepFocus = () => {
    const nextVal = !isDeepFocusMode;
    const updated: DeepFocusConfig = {
      ...focusConfig,
      enabled: nextVal,
    };
    setFocusConfig(updated);
    saveDeepFocusConfig(updated);
  };

  const handleToggleAutoWorkHours = () => {
    const updated: DeepFocusConfig = {
      ...focusConfig,
      autoDuringWorkHours: !focusConfig.autoDuringWorkHours,
    };
    setFocusConfig(updated);
    saveDeepFocusConfig(updated);
  };

  const toggleCategoryExpansion = (pillarName: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [pillarName]: !prev[pillarName],
    }));
  };

  const allCollapsedExpanded = DEFAULT_NON_ESSENTIAL_PILLARS.every((p) => Boolean(expandedCategories[p]));

  const handleToggleAllCollapsedCategories = () => {
    const targetState = !allCollapsedExpanded;
    const next: Record<string, boolean> = {};
    DEFAULT_NON_ESSENTIAL_PILLARS.forEach((p) => {
      next[p] = targetState;
    });
    setExpandedCategories(next);
  };

  // Pillar scores for Today
  const pillarScores = calculatePillarScores(habits, today);

  // Overall system readiness
  const totalWeight = habits.reduce((acc, h) => acc + (h.weight || 1), 0);
  const completedWeight = habits
    .filter((h) => h.completedDates.includes(today))
    .reduce((acc, h) => acc + (h.weight || 1), 0);
  const readinessIndex = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

  // Non-negotiable metrics
  const nonNegotiables = habits.filter((h) => h.isNonNegotiable);
  const completedNN = nonNegotiables.filter((h) => h.completedDates.includes(today));
  const isAllNNCompletedToday = nonNegotiables.length > 0 && completedNN.length === nonNegotiables.length;

  // Filtered displayed tasks
  const displayedTasks = habits.filter((h) => {
    if (showOnlyNonNegotiables && !h.isNonNegotiable) return false;
    if (filterPillar !== 'All' && normalizePillar(h) !== filterPillar) return false;
    return true;
  });

  const handleQuickLogPreset = (title: string, pillar: PillarType, metric: string) => {
    if (onQuickAddWin) {
      onQuickAddWin(title, pillar, metric);
    } else {
      // Find matching habit if exists or toggle
      const existing = habits.find(
        (h) => h.name.toLowerCase().includes(title.toLowerCase()) || normalizePillar(h) === pillar
      );
      if (existing && !existing.completedDates.includes(today)) {
        onToggleHabit(existing.id, today);
      }
    }
  };

  const handleSubmitCustomQuickWin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickWinText.trim()) return;
    if (onQuickAddWin) {
      onQuickAddWin(quickWinText.trim(), quickWinPillar, 'Micro-Win Logged');
    }
    setQuickWinText('');
    setIsMicroLoggerOpen(false);
  };

  return (
    <div id="screen-dashboard" className="flex flex-col min-h-full pb-28 text-gray-100 selection:bg-cyan-500/20">
      {/* Top Header: Athletic Telemetry Bar */}
      <div className="bg-gradient-to-b from-[#11131a] via-[#0d0e14] to-[#08090d] p-4 sm:p-5 border-b border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 font-mono text-zinc-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="uppercase tracking-wider text-[11px] font-bold text-zinc-200">
              Life Infrastructure OS
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">{formatDisplayDate(today)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="top-crisis-safeguard-button"
              onClick={onOpenEmergency}
              title="Crisis Support & Emergency Action Plan"
              className="px-2.5 py-1 bg-red-950/70 hover:bg-red-900/80 border border-red-500/50 rounded-full text-[10px] text-red-200 font-mono font-bold flex items-center gap-1.5 transition-colors shadow-[0_0_12px_rgba(239,68,68,0.3)]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              <span>Crisis Support</span>
            </button>

            {onOpenAccount && (
              <button
                id="open-account-btn"
                onClick={onOpenAccount}
                title="Account, 2FA & Cloud Sync"
                className="px-2.5 py-1 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 rounded-full text-[10px] text-cyan-300 font-mono font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Shield className="w-3 h-3 text-cyan-400" />
                <span>Account</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Life Balance Radar Card (High-Performance HUD) */}
        <div
          id="dashboard-radar-hud"
          className="relative overflow-hidden bg-[#10121a] p-4 rounded-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.7)]"
        >
          {/* Header of the Radar Card */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Zap className="w-4 h-4 fill-cyan-400/20" />
              </div>
              <div>
                <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <span>Life Balance Radar</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Live
                  </span>
                </h3>
                <p className="text-[10px] text-zinc-500">Physical • Family Ops • Financial • Mental</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRadarExpanded(!showRadarExpanded)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors text-xs flex items-center gap-1 font-mono"
                title="Toggle Radar view"
              >
                {showRadarExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Collapsible Radar Visualization */}
          {showRadarExpanded && (
            <div className="py-2">
              <LifeBalanceRadar
                scores={pillarScores}
                size={270}
                selectedPillar={filterPillar}
                onSelectPillar={(p) => setFilterPillar(filterPillar === p ? 'All' : p)}
                showDetails={true}
                timeframeLabel="Today's Balance"
              />
            </div>
          )}

          {/* Quick Metrics Bar: Streak + Non-Negotiables Lock */}
          <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2 rounded-xl bg-[#090a0f] border border-white/5">
              <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">Momentum</div>
              <div className="text-base font-extrabold text-white flex items-center justify-center gap-1 mt-0.5">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{streakDays}d</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-[#090a0f] border border-white/5">
              <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">System Score</div>
              <div className="text-base font-extrabold text-cyan-400 mt-0.5">
                {readinessIndex}%
              </div>
            </div>

            <div className="p-2 rounded-xl bg-[#090a0f] border border-white/5">
              <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">Anchors</div>
              <div
                className={`text-base font-extrabold mt-0.5 ${
                  isAllNNCompletedToday ? 'text-emerald-400' : 'text-zinc-300'
                }`}
              >
                {completedNN.length}/{nonNegotiables.length}
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Banner when All Anchors Done */}
        {isAllNNCompletedToday && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-xs text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="leading-snug">
              <strong className="text-emerald-300 font-bold block uppercase tracking-wide text-[11px] font-mono">
                Core Protocol Locked
              </strong>
              All non-negotiables secured. Life infrastructure holding at maximum integrity.
            </div>
          </div>
        )}
      </div>

      {/* Main Command Center & Micro-Logging Section */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Frictionless Micro-Logging Action Bar */}
        <div className="bg-[#11131c] p-3 rounded-2xl border border-white/10 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-mono font-bold text-zinc-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Frictionless Micro-Logging</span>
            </span>
            <button
              onClick={() => setIsMicroLoggerOpen(!isMicroLoggerOpen)}
              className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
            >
              {isMicroLoggerOpen ? 'Close' : '+ Custom Win'}
            </button>
          </div>

          {/* 1-Tap Quick Action Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
            <button
              onClick={() =>
                handleQuickLogPreset('Protein Target', 'Physical Conditioning', '160g protein secured')
              }
              className="p-2 rounded-xl bg-[#090a0f] hover:bg-[#161824] border border-cyan-500/20 hover:border-cyan-500/50 text-left transition-all group"
            >
              <div className="text-[10px] text-cyan-400 font-mono font-semibold">+ Physical</div>
              <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                Hit Protein Target
              </div>
            </button>

            <button
              onClick={() =>
                handleQuickLogPreset('No-Spend Day', 'Financial Health', '$0 impulse spend')
              }
              className="p-2 rounded-xl bg-[#090a0f] hover:bg-[#161824] border border-amber-500/20 hover:border-amber-500/50 text-left transition-all group"
            >
              <div className="text-[10px] text-amber-400 font-mono font-semibold">+ Financial</div>
              <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                No-Spend Day
              </div>
            </button>

            <button
              onClick={() =>
                handleQuickLogPreset('Family Dinner', 'Household/Family Ops', 'Phone-free family')
              }
              className="p-2 rounded-xl bg-[#090a0f] hover:bg-[#161824] border border-emerald-500/20 hover:border-emerald-500/50 text-left transition-all group"
            >
              <div className="text-[10px] text-emerald-400 font-mono font-semibold">+ Family Ops</div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">
                Family Presence
              </div>
            </button>

            <button
              onClick={() =>
                handleQuickLogPreset('Sleep Protocol', 'Mental Wellness', 'Screen shutoff')
              }
              className="p-2 rounded-xl bg-[#090a0f] hover:bg-[#161824] border border-indigo-500/20 hover:border-indigo-500/50 text-left transition-all group"
            >
              <div className="text-[10px] text-indigo-400 font-mono font-semibold">+ Mental</div>
              <div className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">
                Sleep Shutoff
              </div>
            </button>
          </div>

          {/* Optional inline custom quick win form */}
          {isMicroLoggerOpen && (
            <form onSubmit={handleSubmitCustomQuickWin} className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={quickWinText}
                  onChange={(e) => setQuickWinText(e.target.value)}
                  placeholder="e.g., 5km Zone 2, 45m mobility, clean kitchen..."
                  className="flex-1 bg-[#090a0f] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400"
                />
                <select
                  value={quickWinPillar}
                  onChange={(e) => setQuickWinPillar(e.target.value as PillarType)}
                  className="bg-[#090a0f] border border-white/15 rounded-xl px-2 py-2 text-[11px] text-zinc-300 focus:outline-none focus:border-cyan-400 font-mono"
                >
                  <option value="Physical Conditioning">Physical</option>
                  <option value="Household/Family Ops">Family Ops</option>
                  <option value="Financial Health">Financial</option>
                  <option value="Mental Wellness">Mental</option>
                </select>
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-3 py-2 rounded-xl text-xs transition-colors shrink-0 font-mono"
                >
                  Log
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Pillar Filter Bar & Non-Negotiable Toggle */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-zinc-400 flex items-center gap-2">
              <span>Daily Protocol Checklist</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-400">
                {displayedTasks.length} Tasks
              </span>
            </h2>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Deep Focus Mode Toggle */}
              <button
                id="deep-focus-toggle"
                onClick={handleToggleDeepFocus}
                title={
                  isDeepFocusMode
                    ? 'Deep Focus is Active: Non-essential categories collapsed to reduce cognitive load'
                    : 'Activate Deep Focus: Collapses non-essential habit categories during work hours'
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border shadow-sm ${
                  isDeepFocusMode
                    ? 'bg-gradient-to-r from-indigo-500/25 via-cyan-500/20 to-indigo-500/15 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                    : 'bg-[#12131a] text-zinc-400 border-white/10 hover:text-zinc-200 hover:border-white/20'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isDeepFocusMode ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]' : 'bg-zinc-600'
                  }`}
                />
                <span className="flex items-center gap-1.5">
                  <Crosshair className={`w-3.5 h-3.5 ${isDeepFocusMode ? 'text-cyan-400' : 'text-zinc-500'}`} />
                  <span>Deep Focus</span>
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                    isDeepFocusMode
                      ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {isDeepFocusMode ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Non-Negotiables Filter Toggle */}
              <button
                id="filter-non-negotiables-toggle"
                onClick={() => setShowOnlyNonNegotiables(!showOnlyNonNegotiables)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-medium transition-colors border ${
                  showOnlyNonNegotiables
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                    : 'bg-[#12131a] text-zinc-400 border-white/10 hover:text-zinc-200'
                }`}
              >
                Non-Negotiables
              </button>
            </div>
          </div>

          {/* Deep Focus Active Telemetry & Cognitive Load Banner */}
          {isDeepFocusMode && (
            <div
              id="deep-focus-active-banner"
              className="p-3 sm:p-3.5 bg-gradient-to-r from-indigo-950/40 via-[#0e1220] to-[#0a0d16] border border-indigo-500/30 rounded-xl space-y-2 text-xs text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.12)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                    <Brain className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-indigo-300 font-mono uppercase tracking-wider text-[11px] font-bold">
                        Deep Focus Engaged
                      </strong>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-300" />
                        <span>{isWorkHoursNow ? 'Work Hours Active' : 'Manual Override'}</span>
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        ({formatWorkHoursString(focusConfig.workHoursStart, focusConfig.workHoursEnd)})
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                      Non-essential habit categories collapsed during work hours to reduce cognitive distraction and eliminate off-work mental friction.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    id="toggle-all-collapsed-categories-btn"
                    onClick={handleToggleAllCollapsedCategories}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
                    title={allCollapsedExpanded ? 'Collapse non-essential categories' : 'Expand all non-essential categories'}
                  >
                    {allCollapsedExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span className="hidden sm:inline">{allCollapsedExpanded ? 'Collapse Non-Essential' : 'Expand All'}</span>
                    <span className="sm:hidden">{allCollapsedExpanded ? 'Collapse' : 'Expand'}</span>
                  </button>

                  <button
                    id="deep-focus-settings-btn"
                    onClick={() => setShowFocusSettings(!showFocusSettings)}
                    className={`p-1.5 rounded-lg border text-zinc-400 hover:text-white transition-colors ${
                      showFocusSettings ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-300' : 'bg-white/5 border-white/10'
                    }`}
                    title="Deep Focus Settings"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Settings Drawer */}
              {showFocusSettings && (
                <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>Auto-engage during 09:00 - 17:00 (M-F)</span>
                  <button
                    id="deep-focus-auto-toggle"
                    onClick={handleToggleAutoWorkHours}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      focusConfig.autoDuringWorkHours
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {focusConfig.autoDuringWorkHours ? 'Auto Enabled' : 'Auto Disabled'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Horizontal Pillar Switchers */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              id="filter-pillar-all"
              onClick={() => setFilterPillar('All')}
              className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold transition-colors whitespace-nowrap border ${
                filterPillar === 'All'
                  ? 'bg-white text-black border-white shadow-sm'
                  : 'bg-[#10121a] text-zinc-400 border-white/10 hover:text-white'
              }`}
            >
              All Pillars
            </button>

            {(
              [
                'Physical Conditioning',
                'Household/Family Ops',
                'Financial Health',
                'Mental Wellness',
              ] as PillarType[]
            ).map((pillar) => {
              const meta = PILLAR_METADATA[pillar];
              const isSelected = filterPillar === pillar;

              return (
                <button
                  key={pillar}
                  id={`filter-pillar-${meta.shortName.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setFilterPillar(pillar)}
                  className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold transition-colors whitespace-nowrap border ${
                    isSelected
                      ? `${meta.bg} ${meta.text} ${meta.border} shadow-[0_0_10px_rgba(0,240,255,0.15)]`
                      : 'bg-[#10121a] text-zinc-400 border-white/10 hover:text-white'
                  }`}
                >
                  {meta.shortName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Task Cards List with Tactile Inline Toggle Switches & Collapsible Categories */}
        <div className="space-y-3">
          {displayedTasks.length === 0 ? (
            <div className="text-center py-10 bg-[#10121a] rounded-2xl border border-white/10 p-6">
              <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-300">No protocol tasks in this filter.</p>
              <p className="text-xs text-zinc-500 mt-1 mb-4">
                Add non-negotiable anchors or maintenance habits to build your life infrastructure.
              </p>
              <button
                id="empty-state-add-task-btn"
                onClick={onNavigateToAdd}
                className="inline-flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-xl text-xs font-mono font-bold transition-colors shadow-[0_0_15px_rgba(0,240,255,0.25)]"
              >
                <Plus className="w-4 h-4" />
                <span>Configure New Task</span>
              </button>
            </div>
          ) : (() => {
            // Helper to render individual tactile task cards
            const renderTaskCard = (task: Task) => {
              const isDoneToday = task.completedDates.includes(today);
              const pillar = normalizePillar(task);
              const meta = PILLAR_METADATA[pillar];
              const weight = task.weight || 1;

              return (
                <div
                  key={task.id}
                  id={`task-card-${task.id}`}
                  className={`group relative p-3.5 sm:p-4 rounded-xl border transition-all duration-200 ${
                    isDoneToday
                      ? 'bg-[#0c0d12]/80 border-white/5 opacity-85'
                      : 'bg-[#11131c] border-white/10 hover:border-white/20 shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Icon & Task Spec */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${meta.bg} ${meta.text} ${meta.border}`}
                      >
                        <HabitIcon name={task.icon} className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3
                            className={`text-sm sm:text-base font-bold tracking-tight transition-all ${
                              isDoneToday ? 'line-through text-zinc-500' : 'text-white'
                            }`}
                          >
                            {task.title || task.name}
                          </h3>

                          {/* Pillar Badge */}
                          <span
                            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border ${meta.badge}`}
                          >
                            {meta.shortName}
                          </span>

                          {/* Impact Weight Multiplier Badge */}
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${
                              weight === 3
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : weight === 2
                                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}
                          >
                            {weight === 3 ? '3x Anchor' : weight === 2 ? '2x Core' : '1x Maint'}
                          </span>

                          {/* Non-negotiable marker */}
                          {task.isNonNegotiable && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              Non-Negotiable
                            </span>
                          )}
                        </div>

                        {/* Target Metric or Description */}
                        {task.targetMetric && (
                          <p className="text-xs text-cyan-300/80 font-mono font-medium flex items-center gap-1 mt-0.5">
                            <span className="text-zinc-500">Metric:</span> {task.targetMetric}
                          </p>
                        )}

                        {(task.description || task.notes) && (
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mt-0.5">
                            {task.description || task.notes}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-zinc-500">
                          <span className="capitalize">{task.frequency || 'daily'}</span>
                          <span>•</span>
                          <span className="text-zinc-400">
                            {(task.completedDates || []).length} logged
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: High-Tactile Inline Toggle Switch */}
                    <div className="flex flex-col items-end shrink-0 pt-0.5">
                      <button
                        id={`toggle-task-${task.id}`}
                        onClick={() => onToggleHabit(task.id, today)}
                        role="switch"
                        aria-checked={isDoneToday}
                        aria-label={`Toggle ${task.title || task.name}`}
                        className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 ${
                          isDoneToday
                            ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                            : 'bg-[#1e202b] border border-white/10 hover:border-white/25'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-out flex items-center justify-center ${
                            isDoneToday ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        >
                          {isDoneToday ? (
                            <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                          )}
                        </span>
                      </button>

                      <span className="text-[9px] font-mono font-bold mt-1 text-zinc-400">
                        {isDoneToday ? 'LOCKED' : 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            };

            // If Deep Focus is active and in All Pillars view (without specific non-negotiable filter),
            // separate into essential protocols and collapsible non-essential categories
            if (isDeepFocusMode && filterPillar === 'All' && !showOnlyNonNegotiables) {
              const essentialTasks = displayedTasks.filter((t) => !isTaskNonEssentialDuringWork(t));
              const nonEssentialTasks = displayedTasks.filter(isTaskNonEssentialDuringWork);

              return (
                <div className="space-y-4">
                  {/* Active Essential Protocols Section */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                        <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Active Focus Protocols</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          {essentialTasks.length} Essential
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">Workday Priority</span>
                    </div>

                    {essentialTasks.length === 0 ? (
                      <div className="p-4 rounded-xl bg-[#0e1017] border border-white/10 text-center text-xs text-zinc-400 font-mono">
                        All essential focus protocols logged or none active.
                      </div>
                    ) : (
                      essentialTasks.map(renderTaskCard)
                    )}
                  </div>

                  {/* Collapsible Non-Essential Categories Section */}
                  {DEFAULT_NON_ESSENTIAL_PILLARS.map((pillar) => {
                    const tasksInPillar = nonEssentialTasks.filter(
                      (t) => normalizePillar(t) === pillar
                    );
                    if (tasksInPillar.length === 0) return null;

                    const meta = PILLAR_METADATA[pillar];
                    const isExpanded = Boolean(expandedCategories[pillar]);
                    const completedCount = tasksInPillar.filter((t) =>
                      t.completedDates.includes(today)
                    ).length;
                    const pillarSlug = pillar.toLowerCase().replace(/[^a-z0-9]/g, '-');

                    return (
                      <div
                        key={pillar}
                        id={`collapsed-category-${pillarSlug}`}
                        className="rounded-xl border border-white/10 bg-[#0d0f16] overflow-hidden transition-all shadow-sm"
                      >
                        {/* Collapsed Category Header / Accordion Bar */}
                        <div
                          id={`category-toggle-${pillarSlug}`}
                          onClick={() => toggleCategoryExpansion(pillar)}
                          className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors select-none"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${meta.bg} ${meta.text} ${meta.border}`}
                            >
                              <HabitIcon name={meta.icon} className="w-4 h-4" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs sm:text-sm font-bold text-zinc-200 truncate">
                                  {pillar}
                                </span>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                                  {tasksInPillar.length} non-essential
                                </span>
                                {completedCount > 0 && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    {completedCount}/{tasksInPillar.length} done
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
                                {isExpanded
                                  ? 'Category expanded • Click to collapse'
                                  : 'Collapsed for Deep Focus • Off-work / domestic protocol'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
                              <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Expanded Task Cards Container */}
                        {isExpanded && (
                          <div className="p-3 pt-1 space-y-2 border-t border-white/5 bg-[#0a0c12]/60">
                            {tasksInPillar.map(renderTaskCard)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            // Standard expanded view (when Deep Focus is OFF or single pillar filtered)
            return displayedTasks.map(renderTaskCard);
          })()}
        </div>
      </div>

      {/* Prominent Emergency Action Plan "Red Button" */}
      <div className="sticky bottom-16 px-4 py-2.5 bg-gradient-to-t from-[#08090d] via-[#08090d]/95 to-transparent z-20">
        <RedCrisisButton onClick={onOpenEmergency} />
      </div>
    </div>
  );
}
