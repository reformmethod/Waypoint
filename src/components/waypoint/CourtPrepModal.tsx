import React, { useState, useEffect } from 'react';
import {
  X,
  Scale,
  Users,
  Clock,
  HelpCircle,
  Wind,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Heart,
  Volume2,
} from 'lucide-react';
import { SpeakableText } from './SpeakableText';

export interface CourtPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
  courtName?: string;
  appointmentDate?: string;
  workerName?: string;
}

interface CourtCardStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  body: string[];
  tips: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const COURT_PREP_STEPS: CourtCardStep[] = [
  {
    stepNumber: 1,
    title: 'Who will be in the room?',
    subtitle: 'Everyone in the room has a clear job to do.',
    icon: Users,
    body: [
      'Your Solicitor: They are on your side. Their job is to explain the law and speak up for you.',
      'Your YJS Worker: They will sit with you or nearby. They are there to support you and share your positive progress.',
      'The Magistrates or District Judge: They sit at the front desk. Their job is to listen carefully to everyone and be fair.',
      'The Court Clerk: They sit below the magistrates. They manage the files, take notes, and help explain court rules.',
      'An Usher: They wear a black gown and help show you where to sit and when to come in.',
    ],
    tips: [
      'You are never alone in the room — your worker and solicitor are right beside you.',
      'Family members or trusted carers can usually sit in the public area to support you.',
    ],
  },
  {
    stepNumber: 2,
    title: 'Roughly how long does it take?',
    subtitle: 'Understanding the day and quiet waiting times.',
    icon: Clock,
    body: [
      'Arrive early: Your worker will arrange to meet you 30 to 45 minutes before your time.',
      'Private meeting: You will talk with your solicitor and worker in a private side room first.',
      'Waiting time: Courts can run a little slow. Bring headphones or a book to stay calm.',
      'In the courtroom: Most hearings only take 15 to 30 minutes.',
      'Lots of pauses: People will often pause to read or write notes. Pauses are completely normal.',
    ],
    tips: [
      'A pause does not mean anything bad is happening. People are just checking their notes.',
      'Take deep, steady breaths if waiting feels long.',
    ],
  },
  {
    stepNumber: 3,
    title: 'What will you be asked?',
    subtitle: 'Plain words and having your voice heard.',
    icon: HelpCircle,
    body: [
      'Confirming your details: The clerk will ask you to confirm your name, address, and date of birth.',
      'Listening: Most of the time, you will simply sit quietly while your solicitor and worker speak for you.',
      'Plain words rule: If anyone uses a word you do not know, you can say: "Could you explain that in plain words, please?"',
      'No trick questions: You will never be rushed or tricked. You can take your time to answer.',
    ],
    tips: [
      'Your solicitor will do most of the talking.',
      'You can always lean over and whisper to your solicitor or worker if you are unsure.',
    ],
  },
  {
    stepNumber: 4,
    title: 'Calm Grounding (5-4-3-2-1)',
    subtitle: 'Take a quiet moment right now to steady your body.',
    icon: Wind,
    body: [
      '5 things you can see: Look around the room right now. Notice 5 colours or shapes.',
      '4 things you can feel: Feel your feet flat on the floor, your back against the chair, your clothes.',
      '3 things you can hear: Listen closely for 3 sounds (a clock, someone talking outside, traffic).',
      '2 things you can smell: Notice two gentle scents in the air.',
      '1 deep belly breath: Breathe in slowly for 4 seconds, hold for 2, breathe out gently for 6.',
    ],
    tips: [
      'You can do this quiet 5-4-3-2-1 check anytime in the waiting room or court hallway.',
      'Breathe out longer than you breathe in to help your heartbeat settle.',
    ],
  },
];

/**
 * ============================================================================
 * COURT PREP MODAL (V22 Directive 2)
 * ============================================================================
 * Paced, trauma-informed step-by-step preparation flow for young people
 * with upcoming court appointments.
 * Reading age: 10. Reassuring, zero legal advice, zero prediction of outcomes.
 * ============================================================================
 */
export const CourtPrepModal: React.FC<CourtPrepModalProps> = ({
  isOpen,
  onClose,
  courtName = 'Leeds Youth Court',
  appointmentDate = 'Thursday at 10:00 AM',
  workerName = 'Jordan (Key Worker)',
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCard = COURT_PREP_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === COURT_PREP_STEPS.length - 1;
  const Icon = currentCard.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-xl rounded-3xl bg-[#131b26] border border-slate-700 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Banner */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Getting Ready for Court</h3>
                <span className="px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 text-[10px] font-bold border border-sky-800">
                  Step {currentStepIndex + 1} of {COURT_PREP_STEPS.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {courtName} • {appointmentDate}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close court preparation"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Dots */}
        <div className="px-6 pt-4 flex items-center gap-2">
          {COURT_PREP_STEPS.map((step, idx) => (
            <button
              key={step.stepNumber}
              type="button"
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'bg-sky-400 shadow-sm'
                  : idx < currentStepIndex
                  ? 'bg-sky-600/60'
                  : 'bg-slate-800'
              }`}
              title={`Jump to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Title & Subtitle with SpeakableText */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-800 text-sky-400 border border-slate-700">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-lg font-bold text-white tracking-tight">
                  {currentCard.title}
                </h4>
              </div>
              <SpeakableText
                text={`${currentCard.title}. ${currentCard.subtitle}. ${currentCard.body.join(' ')}`}
                buttonClassName="bg-slate-800/80 p-1.5"
              />
            </div>
            <p className="text-xs text-slate-300 pl-1">{currentCard.subtitle}</p>
          </div>

          {/* Core Body Points */}
          <div className="space-y-2.5">
            {currentCard.body.map((line, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{line}</p>
              </div>
            ))}
          </div>

          {/* Supportive Tips Box */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <Heart className="w-3.5 h-3.5 text-emerald-400" />
              <span>Helpful to remember:</span>
            </div>
            <ul className="space-y-1 pl-1">
              {currentCard.tips.map((tip, idx) => (
                <li key={idx} className="text-xs text-emerald-200/90 leading-relaxed flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Safeguarding Reassurance Notice */}
          <div className="p-3 rounded-xl bg-black/30 border border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              This guide is for calm preparation only. It does not provide legal advice or predict outcomes.
            </span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-slate-400">
            Worker: <strong className="text-slate-200">{workerName}</strong>
          </span>

          {isLast ? (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-950 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Ready &amp; Grounded</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentStepIndex((prev) => Math.min(COURT_PREP_STEPS.length - 1, prev + 1))}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-950 transition-all"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
