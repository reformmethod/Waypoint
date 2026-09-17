import React, { useState } from 'react';
import {
  Award,
  Calendar as CalendarIcon,
  CheckCircle2,
  TrendingUp,
  Shield,
  Clock,
  Sparkles,
  ChevronRight,
  Flame,
  Zap,
  Activity,
  Check,
} from 'lucide-react';
import { Task, PillarType, CorePillar } from '../types';
import { HabitIcon } from './HabitIcon';
import {
  getLast7Days,
  calculateProgressForDays,
  calculateStreakStats,
  formatDisplayDate,
  isHabitScheduledForDate,
  getTodayDateString,
  calculatePillarScores,
  calculateCumulativePillarScores,
  normalizePillar,
  CORE_PILLARS,
} from '../utils/dateUtils';
import { PILLAR_METADATA } from '../data/initialHabits';
import { LifeBalanceRadar } from './LifeBalanceRadar';

interface ProgressScreenProps {
  habits: Task[];
  onToggleHabitDate: (habitId: string, dateStr: string) => void;
  onNavigateToDashboard: () => void;
}

export function ProgressScreen({
  habits,
  onToggleHabitDate,
  onNavigateToDashboard,
}: ProgressScreenProps) {
  const [timeframe, setTimeframe] = useState<'today' | '7days'>('today');
  const [selectedPillar, setSelectedPillar] = useState<CorePillar | 'All'>('All');
  const [viewMode, setViewMode] = useState<'radar' | 'matrix'>('radar');

  const today = getTodayDateString();
  const last7Days = getLast7Days();
  const dayProgressList = calculateProgressForDays(habits, last7Days);
  const streakStats = calculateStreakStats(habits);

  const todayScores = calculatePillarScores(habits, today);
  const sevenDayScores = calculateCumulativePillarScores(habits, last7Days);

  const activeRadarScores = timeframe === 'today' ? todayScores : sevenDayScores;

  return (
    <div id="screen-progress" className="flex flex-col min-h-full pb-28 text-gray-100 selection:bg-cyan-500/20">
      {/* Top Telemetry Header */}
      <div className="bg-gradient-to-b from-[#11131a] via-[#0d0e14] to-[#08090d] p-4 sm:p-5 border-b border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h1 className="text-base sm:text-lg font-extrabold uppercase font-mono tracking-wider text-white">
              Life Infrastructure Telemetry
            </h1>
          </div>

          <div className="flex items-center bg-[#090a0f] p-1 rounded-lg border border-white/10 text-[10px] font-mono font-bold">
            <button
              onClick={() => setTimeframe('today')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                timeframe === 'today'
                  ? 'bg-cyan-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeframe('7days')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                timeframe === '7days'
                  ? 'bg-cyan-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              7-Day Avg
            </button>
          </div>
        </div>
        <p className="text-xs text-zinc-400">
          Dynamic multi-axis balance across Physical Conditioning, Household/Family Ops, Financial Health, and Mental Wellness.
        </p>
      </div>

      <div className="p-4 sm:p-5 space-y-6 max-w-2xl mx-auto w-full">
        {/* Core Showcase: Dynamic Life Balance Radar (Replaces basic 7-day chart) */}
        <div
          id="section-life-balance-radar"
          className="bg-[#10121a] rounded-2xl p-4 sm:p-5 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.6)] space-y-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Zap className="w-4 h-4 fill-cyan-400/20" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-white">
                  Dynamic Life Balance Radar
                </h2>
                <p className="text-[10px] text-zinc-500">
                  {timeframe === 'today' ? "Today's Instant Execution" : '7-Day Cumulative Average'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-400">
                4 Separate Axes
              </span>
            </div>
          </div>

          {/* Render the full dynamic SVG radar */}
          <div className="py-2 flex flex-col items-center">
            <LifeBalanceRadar
              scores={activeRadarScores}
              size={290}
              selectedPillar={selectedPillar}
              onSelectPillar={(p) => setSelectedPillar(selectedPillar === p ? 'All' : p)}
              showDetails={true}
              timeframeLabel={timeframe === 'today' ? 'Today' : '7 Days'}
            />
          </div>

          <div className="text-center pt-2 border-t border-white/5 text-[11px] text-zinc-400 font-mono">
            <span>Tap any pillar card or axis above to isolate related protocol tasks</span>
          </div>
        </div>

        {/* Section 2: Executive Resilience & Accountability Summary */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Protocol Accountability Summary</span>
            </h2>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">
              {streakStats.recoveryMilestone}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Life Infrastructure Index */}
            <div className="bg-[#11131c] p-3 rounded-xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
                <span>System Score</span>
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="mt-2 font-mono">
                <div className="text-2xl font-black text-cyan-400">
                  {streakStats.lifeInfrastructureIndex}%
                </div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">Readiness</div>
              </div>
            </div>

            {/* Active Momentum (Non-Punitive) */}
            <div className="bg-[#11131c] p-3 rounded-xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
                <span>Active Momentum</span>
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
              </div>
              <div className="mt-2 font-mono">
                <div className="text-2xl font-black text-white">
                  {streakStats.currentMomentumDays ?? streakStats.currentStreak} <span className="text-xs text-zinc-500 font-normal">days</span>
                </div>
                <div className="text-[9px] text-amber-400 uppercase tracking-wider mt-0.5">Anchors Intact</div>
              </div>
            </div>

            {/* Best Record */}
            <div className="bg-[#11131c] p-3 rounded-xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
                <span>Best Record</span>
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="mt-2 font-mono">
                <div className="text-2xl font-black text-white">
                  {streakStats.longestStreak} <span className="text-xs text-zinc-500 font-normal">days</span>
                </div>
                <div className="text-[9px] text-indigo-300 uppercase tracking-wider mt-0.5">Peak Discipline</div>
              </div>
            </div>

            {/* 7-Day Rate */}
            <div className="bg-[#11131c] p-3 rounded-xl border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
                <span>7-Day Load</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="mt-2 font-mono">
                <div className="text-2xl font-black text-emerald-400">
                  {streakStats.sevenDayRate}%
                </div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">Weighted Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Detailed 4-Pillar Architecture Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pillar Architecture Breakdown</span>
            </h2>

            {selectedPillar !== 'All' && (
              <button
                onClick={() => setSelectedPillar('All')}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 font-bold"
              >
                Reset Filter (Show All)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {CORE_PILLARS.filter((p) => selectedPillar === 'All' || selectedPillar === p).map((pillar) => {
              const meta = PILLAR_METADATA[pillar];
              const score = activeRadarScores[pillar];
              const pillarTasks = habits.filter((h) => normalizePillar(h) === pillar);

              return (
                <div
                  key={pillar}
                  id={`pillar-breakdown-${meta.shortName.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`bg-[#11131c] p-4 rounded-xl border transition-all ${
                    selectedPillar === pillar
                      ? 'border-cyan-400/50 shadow-[0_0_20px_rgba(0,240,255,0.1)]'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${meta.bg} ${meta.text} ${meta.border}`}
                      >
                        <HabitIcon name={meta.icon} className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                          <span>{meta.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            ({pillarTasks.length} tasks)
                          </span>
                        </h3>
                        <p className="text-xs text-zinc-400">{meta.description}</p>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-lg font-black text-white">{score.percentage}%</div>
                      <div className="text-[10px] text-zinc-400">
                        {score.completedWeight}/{score.totalWeight} pts
                      </div>
                    </div>
                  </div>

                  {/* Visual Progress Line */}
                  <div className="w-full h-2 bg-[#090a0f] rounded-full overflow-hidden border border-white/5 my-2.5">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.max(3, score.percentage)}%`,
                        backgroundColor: meta.colorHex,
                        boxShadow: `0 0 10px ${meta.glow}`,
                      }}
                    />
                  </div>

                  {/* Active Protocol Items in this pillar */}
                  <div className="space-y-1.5 mt-3 pt-2.5 border-t border-white/5">
                    {pillarTasks.map((t) => {
                      const isDoneToday = t.completedDates.includes(today);
                      return (
                        <div
                          key={t.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[#0a0b10] border border-white/5"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isDoneToday ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-zinc-700'
                              }`}
                            />
                            <span
                              className={`truncate font-medium ${
                                isDoneToday ? 'text-zinc-400 line-through' : 'text-zinc-200'
                              }`}
                            >
                              {t.title || t.name}
                            </span>
                            {t.targetMetric && (
                              <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                                • {t.targetMetric}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">
                            <span className="text-zinc-400">{t.weight}x Impact</span>
                            <button
                              onClick={() => onToggleHabitDate(t.id, today)}
                              className={`px-2 py-0.5 rounded transition-colors ${
                                isDoneToday
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {isDoneToday ? 'Locked' : 'Log Win'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: 7-Day Matrix Audit View */}
        <div className="bg-[#10121a] rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-zinc-300 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>7-Day Habit Matrix Audit</span>
            </h2>
            <span className="text-[10px] font-mono text-zinc-500">Tap cells to back-log</span>
          </div>

          <div className="overflow-x-auto pt-1 no-scrollbar">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-zinc-400 border-b border-white/10 font-mono text-[10px]">
                  <th className="py-2 pr-2 font-semibold">Protocol Task</th>
                  <th className="py-2 px-1 font-semibold text-center">Pillar</th>
                  {last7Days.map((d) => {
                    const isToday = d === today;
                    const [, , day] = d.split('-').map(Number);
                    return (
                      <th
                        key={d}
                        className={`py-2 px-1 text-center min-w-[32px] ${
                          isToday ? 'text-cyan-400 font-bold' : 'text-zinc-400'
                        }`}
                      >
                        {day}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {habits.map((task) => {
                  const meta = PILLAR_METADATA[normalizePillar(task)];

                  return (
                    <tr key={task.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 pr-2 font-sans text-xs font-medium text-white max-w-[140px] truncate">
                        {task.title || task.name}
                      </td>
                      <td className="py-2.5 px-1 text-center">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${meta.badge}`}>
                          {meta.shortName}
                        </span>
                      </td>
                      {last7Days.map((d) => {
                        const isDone = task.completedDates.includes(d);
                        const isToday = d === today;

                        return (
                          <td key={d} className="py-2.5 px-1 text-center">
                            <button
                              onClick={() => onToggleHabitDate(task.id, d)}
                              title={`${task.name} on ${d}: ${isDone ? 'Completed' : 'Missed'}`}
                              className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-all ${
                                isDone
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                                  : isToday
                                  ? 'bg-zinc-800/80 text-zinc-600 border border-cyan-500/30'
                                  : 'bg-zinc-900 text-zinc-700 border border-white/5'
                              }`}
                            >
                              {isDone ? (
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              ) : (
                                <span className="text-[10px] opacity-40">-</span>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
