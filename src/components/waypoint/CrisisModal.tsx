import React, { useState, useEffect } from 'react';
import {
  X,
  Eye,
  Hand,
  Ear,
  Wind,
  Smile,
  Phone,
  MessageSquare,
  ArrowRight,
  LifeBuoy,
} from 'lucide-react';
import { recordAnonymizedTelemetryEvent } from '../../utils/waypointStorage';
import { WaypointUserProfile } from '../../types/waypoint';

export interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: WaypointUserProfile;
}

interface GroundingCardData {
  count: number;
  verb: string;
  instruction: string;
  icon: React.ComponentType<{ className?: string }>;
  accentLabel: string;
}

const GROUNDING_CARDS: GroundingCardData[] = [
  {
    count: 5,
    verb: 'Look around.',
    instruction: 'Name 5 things you can see.',
    icon: Eye,
    accentLabel: 'Sight',
  },
  {
    count: 4,
    verb: 'Focus.',
    instruction: 'Name 4 things you can physically feel.',
    icon: Hand,
    accentLabel: 'Touch',
  },
  {
    count: 3,
    verb: 'Listen.',
    instruction: 'Name 3 distinct sounds around you.',
    icon: Ear,
    accentLabel: 'Sound',
  },
  {
    count: 2,
    verb: 'Breathe.',
    instruction: 'Name 2 things you can smell.',
    icon: Wind,
    accentLabel: 'Scent',
  },
  {
    count: 1,
    verb: 'Notice.',
    instruction: 'Name 1 thing you can taste.',
    icon: Smile,
    accentLabel: 'Taste',
  },
];

interface SupportContact {
  id: string;
  name: string;
  actionText: string;
  href: string;
  icon: 'phone' | 'sms';
}

const SUPPORT_CONTACTS: SupportContact[] = [
  {
    id: 'nhs-111',
    name: 'NHS 111 (Mental Health option)',
    actionText: 'Tap to Call NHS 111',
    href: 'tel:111',
    icon: 'phone',
  },
  {
    id: 'local-247',
    name: 'Local 24/7 Service (01924 316830)',
    actionText: 'Tap to Call Local 24/7 Service (01924 316830)',
    href: 'tel:01924316830',
    icon: 'phone',
  },
  {
    id: 'samaritans',
    name: 'Samaritans (116 123)',
    actionText: 'Tap to Call Samaritans (116 123)',
    href: 'tel:116123',
    icon: 'phone',
  },
  {
    id: 'shout-sms',
    name: 'SHOUT (Text 85258)',
    actionText: 'Tap to Text SHOUT (85258)',
    href: 'sms:85258?body=SHOUT',
    icon: 'sms',
  },
];

export const CrisisModal: React.FC<CrisisModalProps> = ({ isOpen, onClose, userProfile }) => {
  // Step index 0 to 4 correspond to Cards 1 to 5.
  // Step index 5 represents the Final Actionable Support Screen.
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      if (userProfile?.orgCode) {
        recordAnonymizedTelemetryEvent({
          orgCode: userProfile.orgCode,
          ageBracket: userProfile.ageBracket,
          redButtonUsed: true,
          alcoholRiskBand: userProfile.auditBand,
          sadqDependenceBand: userProfile.sadqBand,
          substanceRiskBand: userProfile.duditBand,
          anxietyBand: userProfile.gad7Band,
          depressionBand: userProfile.phq9Band,
          youthSubstanceBand: userProfile.crafftBand,
          youthWellbeingBand: userProfile.wemwbsBand,
          pillarAdherenceRate: 80,
          interventionsEngagedCount: 4,
          totalInterventions: 6,
          sadqTriggered: Boolean(userProfile.baselineSadqScore && userProfile.baselineSadqScore > 0),
          duditTriggered: Boolean(
            userProfile.baselineDuditScore && userProfile.baselineDuditScore >= 6
          ),
          phqGadTriggered: Boolean(
            (userProfile.baselinePhq9Score && userProfile.baselinePhq9Score >= 10) ||
              (userProfile.baselineGad7Score && userProfile.baselineGad7Score >= 10)
          ),
          triagePathways: userProfile.triagePathwaysTriggered || ['CRISIS-ALERT'],
          microTaskEnabled: userProfile.microTaskMode,
          sensoryMode: userProfile.sensoryMode,
        });
      }
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const isGroundingPhase = currentStepIndex < GROUNDING_CARDS.length;
  const currentCard = isGroundingPhase ? GROUNDING_CARDS[currentStepIndex] : null;
  const CardIcon = currentCard?.icon || Eye;

  const handleNext = () => {
    setCurrentStepIndex((prev) => prev + 1);
  };

  return (
    <div
      id="waypoint-crisis-modal-overlay"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="w-full max-w-md my-auto space-y-4 font-sans">
        {/* Top Control Bar: Non-alarming Branding + Gentle Dismiss */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-rose-200">
            <div className="w-8 h-8 rounded-xl bg-[#C55A43]/30 border border-[#E27D60]/40 flex items-center justify-center text-white">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              {isGroundingPhase ? 'Grounding Reset' : 'Actionable Support'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ==================================================================== */}
        {/* OBJECTIVE 2: 5-4-3-2-1 GROUNDING FLOW (PAGINATED CARDS) */}
        {/* Warm Sand #F7FAFC Background, Sage #718096 Accents, Boxed Card */}
        {/* ==================================================================== */}
        {isGroundingPhase && currentCard && (
          <div
            id={`grounding-card-${currentCard.count}`}
            className="w-full rounded-3xl bg-[#F7FAFC] border border-[#E2E8F0] shadow-2xl p-7 sm:p-8 flex flex-col justify-between min-h-[380px] space-y-6"
          >
            {/* Step Progress Badge */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E2E8F0] border border-[#CBD5E0]">
                <span className="w-2 h-2 rounded-full bg-[#718096]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#718096]">
                  Step {currentStepIndex + 1} of 5 • {currentCard.accentLabel}
                </span>
              </div>
              <span className="text-3xl font-black text-[#718096] font-mono">
                {currentCard.count}
              </span>
            </div>

            {/* Central Grounding Content */}
            <div className="space-y-4 py-2">
              <div className="w-16 h-16 rounded-2xl bg-[#EDF2F7] border border-[#CBD5E0] flex items-center justify-center text-[#718096] shadow-inner">
                <CardIcon className="w-8 h-8 stroke-[2]" />
              </div>

              <div className="space-y-1.5">
                <div className="text-xl font-bold text-[#1A202C] tracking-tight">
                  {currentCard.verb}
                </div>
                <div className="text-base text-[#4A5568] font-medium leading-relaxed">
                  {currentCard.instruction}
                </div>
              </div>
            </div>

            {/* Large Clearly Defined Next Button */}
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-4 px-6 rounded-2xl bg-[#C55A43] hover:bg-[#b54a34] active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#C55A43]/25 flex items-center justify-center gap-2 transition-all"
            >
              <span>{currentStepIndex === 4 ? 'Complete Grounding' : 'Next'}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {/* ==================================================================== */}
        {/* OBJECTIVE 3: ACTIONABLE SUPPORT SCREEN */}
        {/* Appears ONLY after completing Card 5. Boxed cards stacked vertically. */}
        {/* All clickable tel: or sms: links with massive touch targets. */}
        {/* ==================================================================== */}
        {!isGroundingPhase && (
          <div
            id="actionable-support-screen"
            className="w-full rounded-3xl bg-[#131b26] border border-slate-700/80 p-6 sm:p-8 shadow-2xl space-y-5"
          >
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Immediate Actionable Support
              </h2>
              <p className="text-xs text-slate-400">
                Tap any service below to connect instantly. All lines are free and confidential.
              </p>
            </div>

            {/* Vertically Stacked Boxed Contacts */}
            <div className="space-y-3">
              {SUPPORT_CONTACTS.map((contact) => (
                <a
                  key={contact.id}
                  href={contact.href}
                  className="w-full p-4 sm:p-5 rounded-2xl bg-[#1c2636] hover:bg-[#233044] active:scale-[0.99] border border-slate-600/80 hover:border-sky-400/80 flex items-center justify-between transition-all group shadow-md"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 group-hover:border-sky-400/50 transition-colors">
                      {contact.icon === 'phone' ? (
                        <Phone className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-white truncate">
                        {contact.name}
                      </div>
                      <div className="text-xs font-semibold text-sky-400 mt-0.5">
                        {contact.actionText}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-400 transition-colors shrink-0 ml-2" />
                </a>
              ))}
            </div>

            {/* Return or Dismiss */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setCurrentStepIndex(0)}
                className="text-slate-400 hover:text-white underline transition-colors"
              >
                Restart 5-4-3-2-1 Grounding
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
