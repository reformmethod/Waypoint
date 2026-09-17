import React, { useState, FormEvent } from 'react';
import {
  Check,
  Shield,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  Zap,
  Flame,
  Target,
} from 'lucide-react';
import { Task, PillarType, TaskWeight, Frequency } from '../types';
import { AVAILABLE_ICONS, HabitIcon } from './HabitIcon';
import { PILLAR_METADATA } from '../data/initialHabits';
import { getTodayDateString } from '../utils/dateUtils';

interface AddHabitScreenProps {
  onAddHabit: (newTask: Task) => void;
  onCancel: () => void;
}

const PRESET_SUGGESTIONS: Array<{
  name: string;
  pillarType: PillarType;
  weight: TaskWeight;
  frequency: Frequency;
  icon: string;
  targetMetric: string;
  notes: string;
  isNonNegotiable: boolean;
}> = [
  {
    name: 'Hyrox Prep / 5km Run',
    pillarType: 'Physical Conditioning',
    weight: 3,
    frequency: 'daily',
    icon: 'Flame',
    targetMetric: '5km Zone 2 or Sled Push',
    notes: 'Maintain aerobic threshold, functional capacity, and VO2 max',
    isNonNegotiable: true,
  },
  {
    name: 'Hit Protein Target (160g+)',
    pillarType: 'Physical Conditioning',
    weight: 2,
    frequency: 'daily',
    icon: 'Dumbbell',
    targetMetric: '160g lean protein • 3L water',
    notes: 'Fuel lean recovery and stabilize systemic blood sugar',
    isNonNegotiable: true,
  },
  {
    name: 'Family Presence (Phone-Free Dinner)',
    pillarType: 'Household/Family Ops',
    weight: 3,
    frequency: 'daily',
    icon: 'Users',
    targetMetric: '60 min undivided presence',
    notes: 'Zero devices at dinner table and bedtime connection',
    isNonNegotiable: true,
  },
  {
    name: 'Evening House Reset & Dishwasher',
    pillarType: 'Household/Family Ops',
    weight: 1,
    frequency: 'daily',
    icon: 'Sparkles',
    targetMetric: 'Clean kitchen before bed',
    notes: 'Tidy living spaces so morning begins with zero friction',
    isNonNegotiable: false,
  },
  {
    name: 'No-Spend Day (Zero Non-Essential)',
    pillarType: 'Financial Health',
    weight: 3,
    frequency: 'daily',
    icon: 'Wallet',
    targetMetric: '$0 impulse spend',
    notes: 'Strict impulse defense: no takeout coffee, shopping apps, or unplanned buys',
    isNonNegotiable: true,
  },
  {
    name: 'Circadian Light & Breathwork',
    pillarType: 'Mental Wellness',
    weight: 2,
    frequency: 'daily',
    icon: 'Sun',
    targetMetric: '15m sunlight + breathwork',
    notes: 'Anchor morning cortisol awakening response before looking at email',
    isNonNegotiable: true,
  },
  {
    name: 'Sleep Protocol (Screens Off 10:15 PM)',
    pillarType: 'Mental Wellness',
    weight: 3,
    frequency: 'daily',
    icon: 'Bed',
    targetMetric: '8h sleep architecture window',
    notes: 'Eliminate blue light 60 mins before sleep to protect REM quality',
    isNonNegotiable: true,
  },
];

const PILLAR_OPTIONS: Array<{
  id: PillarType;
  label: string;
  desc: string;
}> = [
  {
    id: 'Physical Conditioning',
    label: 'Physical Conditioning',
    desc: 'Hyrox prep, running, strength, nutrition & recovery',
  },
  {
    id: 'Household/Family Ops',
    label: 'Household/Family Ops',
    desc: 'Family presence, domestic chores, home logistics & care',
  },
  {
    id: 'Financial Health',
    label: 'Financial Health',
    desc: 'No-spend discipline, budget reviews & impulse protection',
  },
  {
    id: 'Mental Wellness',
    label: 'Mental Wellness',
    desc: 'Circadian rhythm, deep sleep, mindfulness & clarity',
  },
];

export function AddHabitScreen({ onAddHabit, onCancel }: AddHabitScreenProps) {
  const [name, setName] = useState('');
  const [pillarType, setPillarType] = useState<PillarType>('Physical Conditioning');
  const [weight, setWeight] = useState<TaskWeight>(2);
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [selectedIcon, setSelectedIcon] = useState('Flame');
  const [isNonNegotiable, setIsNonNegotiable] = useState(true);
  const [targetMetric, setTargetMetric] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const frequencies: { id: Frequency; label: string; desc: string }[] = [
    { id: 'daily', label: 'Every Day', desc: 'Core daily protocol' },
    { id: 'weekdays', label: 'Mon - Fri', desc: 'Workweek routine' },
    { id: 'weekends', label: 'Sat - Sun', desc: 'Weekend discipline' },
  ];

  const handleApplyPreset = (preset: (typeof PRESET_SUGGESTIONS)[0]) => {
    setName(preset.name);
    setPillarType(preset.pillarType);
    setWeight(preset.weight);
    setFrequency(preset.frequency);
    setSelectedIcon(preset.icon);
    setTargetMetric(preset.targetMetric);
    setNotes(preset.notes);
    setIsNonNegotiable(preset.isNonNegotiable);
    setErrorMessage('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Task name is required');
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: name.trim(),
      name: name.trim(),
      description: notes.trim() || targetMetric.trim() || '',
      notes: notes.trim() || undefined,
      pillarType,
      category: pillarType,
      weight,
      isCompleted: false,
      frequency,
      icon: selectedIcon,
      isNonNegotiable,
      targetMetric: targetMetric.trim() || undefined,
      completedDates: [],
      createdAt: getTodayDateString(),
    };

    onAddHabit(newTask);
  };

  const meta = PILLAR_METADATA[pillarType];

  return (
    <div id="screen-add-task" className="flex flex-col min-h-full pb-28 text-gray-100 selection:bg-cyan-500/20">
      {/* Top Header */}
      <div className="bg-gradient-to-b from-[#11131a] via-[#0d0e14] to-[#08090d] p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            id="back-to-dashboard-btn"
            onClick={onCancel}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-white/5"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold uppercase font-mono tracking-wider text-white">
              Configure Protocol Task
            </h1>
            <p className="text-xs text-zinc-400">Add an anchor or maintenance habit to your life infrastructure.</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 max-w-xl mx-auto w-full space-y-6">
        {/* Quick Life Infrastructure Presets */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono uppercase tracking-wider font-bold text-zinc-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>High-Performance Presets</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">1-tap autofill</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_SUGGESTIONS.slice(0, 4).map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="p-2.5 rounded-xl bg-[#10121a] hover:bg-[#161824] border border-white/10 hover:border-cyan-500/40 text-left transition-all text-xs group"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 mb-0.5">
                  <span>{PILLAR_METADATA[preset.pillarType].shortName}</span>
                  <span className="text-zinc-500">{preset.weight}x Impact</span>
                </div>
                <div className="font-bold text-white group-hover:text-cyan-300 truncate">
                  {preset.name}
                </div>
                <div className="text-[10px] text-zinc-400 truncate mt-0.5">{preset.targetMetric}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Form */}
        <form onSubmit={handleSubmit} className="space-y-5 bg-[#10121a] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-lg">
          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl flex items-center gap-2 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Task Name */}
          <div className="space-y-1.5">
            <label htmlFor="task-name-input" className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 block">
              Task / Protocol Name *
            </label>
            <input
              id="task-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hyrox Sled & Run, No-Spend Day, 160g Protein..."
              className="w-full bg-[#090a0f] border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
            />
          </div>

          {/* 2. Four Core Pillars Grid */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 block">
              Core Life Pillar *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PILLAR_OPTIONS.map((item) => {
                const pMeta = PILLAR_METADATA[item.id];
                const isSelected = pillarType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPillarType(item.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? `${pMeta.bg} ${pMeta.border} ring-1 ring-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.15)]`
                        : 'bg-[#090a0f] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${pMeta.bg} ${pMeta.text} ${pMeta.border}`}
                        >
                          <HabitIcon name={pMeta.icon} className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-white tracking-tight">{item.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Weight / Impact Score (1-3) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 block">
                Impact Weight (Radar Expansion Score) *
              </label>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">
                {weight === 3 ? '3x Anchor (High Impact)' : weight === 2 ? '2x Core Priority' : '1x Maintenance'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono">
              <button
                type="button"
                onClick={() => setWeight(1)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  weight === 1
                    ? 'bg-zinc-800 border-zinc-500 text-white shadow-sm'
                    : 'bg-[#090a0f] border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="text-base font-black">1x</div>
                <div className="text-[9px] uppercase tracking-wider text-zinc-400 mt-0.5">Maintenance</div>
              </button>

              <button
                type="button"
                onClick={() => setWeight(2)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  weight === 2
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'bg-[#090a0f] border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="text-base font-black">2x</div>
                <div className="text-[9px] uppercase tracking-wider text-zinc-400 mt-0.5">Core Load</div>
              </button>

              <button
                type="button"
                onClick={() => setWeight(3)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  weight === 3
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-[#090a0f] border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="text-base font-black">3x</div>
                <div className="text-[9px] uppercase tracking-wider text-zinc-400 mt-0.5">Anchor (Max)</div>
              </button>
            </div>
          </div>

          {/* 4. Target Metric Specification */}
          <div className="space-y-1.5">
            <label htmlFor="target-metric-input" className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
              <span>Target Metric Specification</span>
              <span className="text-[10px] text-zinc-500 lowercase font-normal">(optional)</span>
            </label>
            <input
              id="target-metric-input"
              type="text"
              value={targetMetric}
              onChange={(e) => setTargetMetric(e.target.value)}
              placeholder="e.g. 160g protein, 5km Zone 2, $0 impulse, 8h sleep..."
              className="w-full bg-[#090a0f] border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors font-mono"
            />
          </div>

          {/* 5. Non-Negotiable Toggle Switch */}
          <div className="p-3.5 rounded-xl bg-[#090a0f] border border-white/10 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                <span>Non-Negotiable Anchor</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Must be executed daily to preserve non-negotiable resilience integrity.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsNonNegotiable(!isNonNegotiable)}
              role="switch"
              aria-checked={isNonNegotiable}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isNonNegotiable ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isNonNegotiable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* 6. Frequency Pills */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 block">
              Frequency Schedule
            </label>
            <div className="grid grid-cols-3 gap-2">
              {frequencies.map((freq) => (
                <button
                  key={freq.id}
                  type="button"
                  onClick={() => setFrequency(freq.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    frequency === freq.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-sm font-bold'
                      : 'bg-[#090a0f] text-zinc-400 border-white/10 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold font-mono">{freq.label}</div>
                  <div className="text-[9px] text-zinc-500 mt-0.5">{freq.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 7. Icon Selection Grid */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 block">
              Protocol Icon
            </label>
            <div className="grid grid-cols-7 gap-2 max-h-36 overflow-y-auto p-1 bg-[#090a0f] rounded-xl border border-white/10">
              {AVAILABLE_ICONS.map((iconItem) => {
                const iconName = iconItem.name;
                const isSelected = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    title={iconItem.label}
                    onClick={() => setSelectedIcon(iconName)}
                    className={`h-9 rounded-lg flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.4)] scale-105'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <HabitIcon name={iconName} className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 8. Context Notes */}
          <div className="space-y-1.5">
            <label htmlFor="task-notes-input" className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 block">
              Operational Notes (Optional)
            </label>
            <textarea
              id="task-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Cue triggers, recovery rules, or execution standards..."
              className="w-full bg-[#090a0f] border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white text-xs font-mono font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] active:scale-[0.98]"
            >
              Deploy Task Protocol
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
