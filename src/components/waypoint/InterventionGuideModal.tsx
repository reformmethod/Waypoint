import React, { useState, useEffect, useRef } from 'react';
import { WaypointTask, WaypointUserProfile } from '../../types/waypoint';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Waves,
  Heart,
  Activity,
  Compass,
  AlertCircle,
  Brain,
  Sparkles,
  Info,
  Check,
  ShieldCheck,
  Feather,
} from 'lucide-react';

interface InterventionGuideModalProps {
  task: WaypointTask | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleteTask: (taskId: string) => void;
  userProfile: WaypointUserProfile;
}

export const InterventionGuideModal: React.FC<InterventionGuideModalProps> = ({
  task,
  isOpen,
  onClose,
  onCompleteTask,
  userProfile,
}) => {
  // Primary Urge Surfing vs General Intervention Detection
  const isUrgeSurfing =
    task?.id === 'interv-harm-2' ||
    Boolean(task?.title.toLowerCase().includes('urge surf')) ||
    Boolean(task?.description.toLowerCase().includes('ocean wave'));

  // --- TIMER STATE (Urge Surfing & Time-based Interventions) ---
  const defaultSeconds = task?.isMicroTask ? 180 : 600; // 3 min or 10 min
  const [durationSeconds, setDurationSeconds] = useState<number>(defaultSeconds);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(defaultSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (task) {
      const secs = task.isMicroTask ? 180 : 600;
      setDurationSeconds(secs);
      setSecondsRemaining(secs);
      setIsTimerRunning(false);
    }
  }, [durationSeconds, task?.id, task?.isMicroTask]);

  useEffect(() => {
    if (isTimerRunning && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isTimerRunning && timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, secondsRemaining]);

  const toggleTimer = () => setIsTimerRunning((prev) => !prev);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setSecondsRemaining(durationSeconds);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- INTERACTIVE SOMATIC PROMPTS (Urge Surfing) ---
  const [selectedBodyLocations, setSelectedBodyLocations] = useState<string[]>([]);
  const [cravingIntensity, setCravingIntensity] = useState<number>(6);
  const [somaticDescription, setSomaticDescription] = useState<string>('');
  const [breathingPacerActive, setBreathingPacerActive] = useState<boolean>(false);

  // --- CBT 3-COLUMN RECORD PROMPTS ---
  const [cbtSituation, setCbtSituation] = useState('');
  const [cbtAutomaticThought, setCbtAutomaticThought] = useState('');
  const [cbtBalancedAlternative, setCbtBalancedAlternative] = useState('');

  // --- HALT SELECTIONS ---
  const [haltSelected, setHaltSelected] = useState<string | null>(null);

  // Body Region Options for Urge Surfing
  const bodyRegionOptions = [
    { id: 'chest', label: 'Chest Tightness', icon: '🫁' },
    { id: 'throat', label: 'Throat Clench', icon: '🗣️' },
    { id: 'stomach', label: 'Stomach Flutter / Knot', icon: '🌊' },
    { id: 'jaw', label: 'Jaw Clench / Teeth', icon: '🦷' },
    { id: 'limbs', label: 'Restless Limbs / Palms', icon: '🦵' },
    { id: 'head', label: 'Head Pressure / Buzz', icon: '🧠' },
  ];

  const toggleBodyLocation = (id: string) => {
    setSelectedBodyLocations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Wave Phase Calculation based on Timer
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round(((durationSeconds - secondsRemaining) / (durationSeconds || 1)) * 100))
  );

  const getWavePhase = () => {
    if (progressPercent < 30) {
      return {
        title: 'Phase 1: The Rising Swell',
        subtitle: 'Craving begins to gather neurochemical momentum. Do not panic; acknowledge its arrival.',
        accent: 'text-sky-400',
      };
    } else if (progressPercent < 65) {
      return {
        title: 'Phase 2: The Crest (Peak Urge)',
        subtitle: 'The wave reaches maximum intensity. Soften your shoulders, breathe into the sensation.',
        accent: 'text-amber-400',
      };
    } else if (progressPercent < 90) {
      return {
        title: 'Phase 3: Breaking & Dissipation',
        subtitle: 'Adrenaline naturally decays. Prefrontal control re-establishes as the craving loses grip.',
        accent: 'text-teal-400',
      };
    } else {
      return {
        title: 'Phase 4: Calm Horizon',
        subtitle: 'The wave has passed through. Notice the return of stillness in your body.',
        accent: 'text-emerald-400',
      };
    }
  };

  const wavePhase = getWavePhase();

  const handleCompleteAndClose = () => {
    if (task) {
      onCompleteTask(task.id);
    }
    onClose();
  };

  if (!isOpen || !task) return null;

  return (
    <div
      id="intervention-guide-modal-backdrop"
      className="fixed inset-0 z-50 bg-[#060a10]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        id="intervention-guide-card"
        className="w-full max-w-xl bg-[#0f1724] border border-[#2d3748] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] text-[#F7FAFC]"
      >
        {/* HEADER BAR */}
        <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between bg-[#141d2d] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-sky-950/80 border border-sky-600/40 text-sky-400 flex items-center justify-center shrink-0">
              {isUrgeSurfing ? <Waves className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-semibold block">
                Evidence-Based Intervention Guide
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {task.title}
              </h2>
            </div>
          </div>

          <button
            id="close-intervention-guide-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SCROLLABLE INTERVENTION BODY */}
        <div className="p-5 overflow-y-auto space-y-6 text-sm flex-1 custom-scrollbar">
          {/* URGE SURFING DEEP DIVE (THE SPECIFIED PRIMARY PATTERN) */}
          {isUrgeSurfing ? (
            <div className="space-y-6">
              {/* Concept Hero Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#172338] to-[#101a2b] border border-sky-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-sky-300 font-mono text-xs font-semibold">
                  <Waves className="w-4 h-4 text-sky-400" />
                  <span>The Core Principle of Urge Surfing</span>
                </div>
                <blockquote className="text-sm text-slate-100 font-medium italic border-l-2 border-sky-400 pl-3 leading-relaxed">
                  &ldquo;Cravings are like ocean waves; they peak and crash. You don&apos;t have to fight them, just ride them out.&rdquo;
                </blockquote>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Neurobiologically, a craving surge naturally peaks and subsides within 7–10 minutes if you do not fight it or amplify it with mental struggle. Treat yourself as the surfboard, not the wave.
                </p>
              </div>

              {/* Dynamic Ocean Wave Visualization & Phase */}
              <div className="p-4 rounded-2xl bg-[#090f18] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={`font-semibold ${wavePhase.accent}`}>{wavePhase.title}</span>
                  <span className="text-slate-400">{progressPercent}% complete</span>
                </div>

                {/* Animated Wave SVG Graphic */}
                <div className="relative h-20 w-full rounded-xl bg-[#0c1422] border border-slate-800/80 overflow-hidden flex items-center justify-center">
                  <svg
                    className="absolute inset-0 w-full h-full preserve-3d"
                    viewBox="0 0 500 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 0,60 Q 125,20 250,60 T 500,60 L 500,100 L 0,100 Z"
                      fill="#1E293B"
                      opacity="0.5"
                    />
                    <path
                      d="M 0,70 Q 125,35 250,70 T 500,70 L 500,100 L 0,100 Z"
                      fill="#0284C7"
                      opacity="0.4"
                    />
                    <path
                      d="M 0,80 Q 125,50 250,80 T 500,80 L 500,100 L 0,100 Z"
                      fill="#0EA5E9"
                      opacity="0.6"
                    />
                  </svg>

                  {/* Marker for Current Progress */}
                  <div
                    className="absolute top-2 bottom-2 w-0.5 bg-sky-300 shadow-[0_0_8px_#38bdf8] transition-all duration-700"
                    style={{ left: `${Math.max(2, Math.min(98, progressPercent))}%` }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-white -ml-1 -mt-1 shadow-sm animate-pulse" />
                  </div>

                  <div className="relative z-10 text-[11px] font-mono text-sky-200/90 text-center px-4 bg-black/40 py-1 rounded-lg backdrop-blur-xs">
                    {wavePhase.subtitle}
                  </div>
                </div>

                {/* Visual Timer Display */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div>
                    <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white">
                      {formatTime(secondsRemaining)}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {isTimerRunning ? 'Wave surf active • breathe deeply' : 'Timer paused'}
                    </div>
                  </div>

                  {/* Timer Preset Switcher */}
                  <div className="flex items-center gap-1.5">
                    {[
                      { label: '3m (Micro)', sec: 180 },
                      { label: '5m', sec: 300 },
                      { label: '10m (Clinical)', sec: 600 },
                    ].map((preset) => (
                      <button
                        key={preset.sec}
                        onClick={() => {
                          setDurationSeconds(preset.sec);
                          setSecondsRemaining(preset.sec);
                          setIsTimerRunning(false);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all ${
                          durationSeconds === preset.sec
                            ? 'bg-sky-500 text-slate-950 shadow-xs'
                            : 'bg-[#1a2332] text-slate-400 hover:text-white border border-slate-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Play / Pause / Reset Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleTimer}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                        isTimerRunning
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                      }`}
                    >
                      {isTimerRunning ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Pause Wave</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Wave</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={resetTimer}
                      className="p-2 rounded-xl bg-[#1a2332] hover:bg-[#243144] border border-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Reset Timer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Somatic Prompt 1: Body Location Mapping */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200">
                    1. Where in your body do you feel this craving right now?
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">Select all that apply</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {bodyRegionOptions.map((opt) => {
                    const isSelected = selectedBodyLocations.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleBodyLocation(opt.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all text-xs flex items-center gap-2 ${
                          isSelected
                            ? 'bg-sky-950/70 border-sky-400 text-white shadow-xs'
                            : 'bg-[#131b28] border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-base">{opt.icon}</span>
                        <span className="text-[11px] font-medium leading-tight">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Somatic Prompt 2: Craving Intensity Slider */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-[#090f18] border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-200">
                    2. Craving Wave Intensity (1 to 10)
                  </label>
                  <span className="font-mono font-bold text-sky-400 text-sm">
                    {cravingIntensity} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={cravingIntensity}
                  onChange={(e) => setCravingIntensity(Number(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>1: Gentle ripple</span>
                  <span>5: Moderate surge</span>
                  <span>10: Towering swell</span>
                </div>
              </div>

              {/* Interactive Somatic Prompt 3: Somatic Description */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-200 block">
                  3. Somatic description (objective observation without judgment):
                </label>
                <textarea
                  value={somaticDescription}
                  onChange={(e) => setSomaticDescription(e.target.value)}
                  placeholder="Describe the physical sensation (e.g. 'Warm tight pressure in solar plexus, jaw is tense, breathing is slightly rapid'). Do not judge the feeling as good or bad."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-[#090f18] border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-400 placeholder:text-slate-600 resize-none transition-colors"
                />
                {/* Quick chip prompts */}
                <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-400">
                  <span className="text-slate-500">Quick anchors:</span>
                  {[
                    'Tight chest pressure',
                    'Flutter in stomach',
                    'Hot tension in neck',
                    'Impulse to move hands',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        setSomaticDescription((prev) =>
                          prev ? `${prev}, ${chip.toLowerCase()}` : chip
                        )
                      }
                      className="px-2 py-0.5 rounded-md bg-[#172030] hover:bg-[#202c42] border border-slate-700 text-slate-300"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Physiological Sigh Breathing Guide Toggle */}
              <div className="p-3.5 rounded-2xl bg-[#131e2d] border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Feather className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white">
                      Vagal Reset: Physiological Sigh Pacer
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBreathingPacerActive((prev) => !prev)}
                    className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-all ${
                      breathingPacerActive
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {breathingPacerActive ? 'Active Pacer' : 'Turn On'}
                  </button>
                </div>
                {breathingPacerActive && (
                  <div className="text-xs text-emerald-200/90 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-emerald-500/30 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400 animate-ping shrink-0" />
                    <div>
                      <div className="font-semibold text-emerald-300">
                        Inhale deep through nose &rarr; quick top-up sniff &rarr; long slow mouth exhale (6s)
                      </div>
                      <div className="text-[10px] text-emerald-400/80 font-mono">
                        Directly stimulates the vagus nerve and cardiac brake.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : task.interventionType === 'cbt-micro' ? (
            /* COGNITIVE BEHAVIORAL THERAPY (PHQ-9 / GAD-7) DETAILED GUIDE */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#141e2e] border border-indigo-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-300 font-mono text-xs font-semibold">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  <span>Cognitive Restructuring (3-Column Thought Record)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Depression and anxiety warp perceptions into catastrophic assumptions. Unpack the thought objectively:
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Column 1: Activating Situation / Trigger
                  </label>
                  <input
                    type="text"
                    value={cbtSituation}
                    onChange={(e) => setCbtSituation(e.target.value)}
                    placeholder="e.g. Received a work email or noticed my heart racing..."
                    className="w-full px-3 py-2 rounded-xl bg-[#090f18] border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Column 2: Automatic Harsh Thought
                  </label>
                  <input
                    type="text"
                    value={cbtAutomaticThought}
                    onChange={(e) => setCbtAutomaticThought(e.target.value)}
                    placeholder="e.g. 'I ruin everything' or 'I will never get through this week'..."
                    className="w-full px-3 py-2 rounded-xl bg-[#090f18] border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Column 3: Evidence-Grounded Compassionate Alternative
                  </label>
                  <textarea
                    value={cbtBalancedAlternative}
                    onChange={(e) => setCbtBalancedAlternative(e.target.value)}
                    placeholder="What would you tell someone you care about who had this exact thought? What is the factual reality right now?"
                    rows={2}
                    className="w-full p-3 rounded-xl bg-[#090f18] border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-400 resize-none"
                  />
                </div>
              </div>
            </div>
          ) : task.interventionType === 'trigger-mapping' ? (
            /* HALT FRAMEWORK TRIGGER MAPPING (DUDIT / CRAFFT) */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#1b1928] border border-purple-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-purple-300 font-mono text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-purple-400" />
                  <span>The HALT Vulnerability Audit</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Impulses spike exponentially when basic physiological reserves are drained. Identify the active state:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { key: 'H', title: 'Hungry', desc: 'Blood sugar dip mimicking panic. Eat protein or drink water.' },
                  { key: 'A', title: 'Angry', desc: 'Sympathetic arousal. Step outside for 3 minutes before answering.' },
                  { key: 'L', title: 'Lonely', desc: 'Social isolation loop. Send 1 text message or step into a shared room.' },
                  { key: 'T', title: 'Tired', desc: 'Prefrontal executive collapse. Lay flat for 10 minutes without screens.' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setHaltSelected(item.key)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      haltSelected === item.key
                        ? 'bg-purple-950/70 border-purple-400 text-white shadow-xs'
                        : 'bg-[#090f18] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm text-purple-300 font-mono">{item.key} - {item.title}</div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-snug">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* GENERAL EVIDENCE-BASED PROTOCOL */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#141d2a] border border-slate-700 space-y-2">
                <span className="text-xs font-mono text-sky-400 font-semibold block uppercase">
                  Protocol Instructions
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {task.description}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#090f18] border border-slate-800 space-y-1 text-xs">
                <span className="font-mono text-slate-400 block text-[10px] uppercase">Target Completion Metric</span>
                <span className="font-semibold text-white">{task.targetMetric || 'Action complete'}</span>
              </div>
            </div>
          )}

          {/* CLINICAL RATIONALE & EVIDENCE ACCORDION */}
          {(task.clinicalRationale || task.evidenceBase) && (
            <div className="p-3.5 rounded-2xl bg-[#0a101a] border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-sky-400 font-mono text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Clinical Mechanism &amp; Evidence Grounding</span>
              </div>
              {task.clinicalRationale && (
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong className="text-white">Mechanism: </strong>
                  {task.clinicalRationale}
                </p>
              )}
              {task.evidenceBase && (
                <p className="text-slate-400 font-mono text-[10px] border-t border-slate-800/60 pt-1.5">
                  <strong>Evidence Base: </strong>
                  {task.evidenceBase}
                </p>
              )}
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-5 py-3.5 border-t border-[#1e293b] bg-[#141d2d] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-[#1e293b] hover:bg-[#283548] text-slate-300 hover:text-white font-mono text-xs font-semibold transition-colors"
          >
            Exit / Save Progress
          </button>

          <button
            type="button"
            id="complete-intervention-btn"
            onClick={handleCompleteAndClose}
            className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-all shadow-md active:scale-98"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Complete &amp; Check Off</span>
          </button>
        </div>
      </div>
    </div>
  );
};
