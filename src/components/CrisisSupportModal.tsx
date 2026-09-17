import React, { useEffect } from 'react';
import { Phone, MessageSquare, ShieldAlert, X, HeartHandshake } from 'lucide-react';

export interface CrisisContact {
  name: string;
  description: string;
  actionText: string;
  uri: string;
}

export const CRISIS_ORGANIZATIONS: CrisisContact[] = [
  {
    name: "NHS 111 Mental Health",
    description: "24/7 crisis mental health support with trained professionals.",
    actionText: "Call 111",
    uri: "tel:111"
  },
  {
    name: "Local 24/7 Mental Health Services",
    description: "Open access to local mental health support.",
    actionText: "Call 01924 316830",
    uri: "tel:01924316830"
  },
  {
    name: "The Samaritans",
    description: "Emotional support 24 hours a day – in full confidence. Free to call.",
    actionText: "Call 116 123",
    uri: "tel:116123"
  },
  {
    name: "SANEline",
    description: "Practical information, crisis care, and emotional support. Available 4:30pm – 10:30pm daily.",
    actionText: "Call 0300 304 7000",
    uri: "tel:03003047000"
  },
  {
    name: "SHOUT Text Support",
    description: "Free confidential mental health text support available 24/7.",
    actionText: "Text SHOUT to 85258",
    uri: "sms:85258?body=SHOUT"
  }
];

interface CrisisSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Trauma-Informed Emergency Action Plan & Crisis Safeguarding Modal
 * Designed for high legibility, large touch targets, zero cognitive overwhelm,
 * and direct actionable tel: / sms: protocols.
 */
export function CrisisSupportModal({ isOpen, onClose }: CrisisSupportModalProps) {
  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="crisis-support-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="crisis-support-modal-card"
        className="w-full max-w-lg bg-[#0e1017] border-2 border-red-500/60 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.25)] text-zinc-100 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Grounded, Calm & Urgent Header */}
        <div className="bg-gradient-to-r from-red-950/80 via-[#181119] to-[#0e1017] p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className="w-12 h-12 rounded-xl bg-red-600/25 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              aria-hidden="true"
            >
              <ShieldAlert className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-red-300">
                Crisis Safeguarding
              </span>
              <h2
                id="crisis-modal-title"
                className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight mt-0.5"
              >
                Emergency Action Plan
              </h2>
              <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                You do not have to carry this alone. Free, confidential support is available right now.
              </p>
            </div>
          </div>

          <button
            id="crisis-modal-close-button"
            onClick={onClose}
            aria-label="Close crisis support modal"
            className="p-2.5 -mr-1 -mt-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Immediate 999 Lifeline Notice */}
        <div className="bg-red-950/40 border-b border-red-500/30 px-5 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-red-200">
            <HeartHandshake className="w-4 h-4 text-red-400 shrink-0" />
            <span>If you or someone else is in immediate physical danger:</span>
          </div>
          <a
            id="crisis-call-999-urgent-link"
            href="tel:999"
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold font-mono text-xs uppercase tracking-wider transition-colors shrink-0 shadow-sm"
          >
            Call 999
          </a>
        </div>

        {/* List of Crisis Support Organizations */}
        <div
          id="crisis-organizations-list"
          className="p-4 sm:p-6 overflow-y-auto space-y-3.5 divide-y-0"
        >
          {CRISIS_ORGANIZATIONS.map((org, index) => {
            const isSms = org.uri.startsWith('sms:');
            const isPhone = org.uri.startsWith('tel:');

            return (
              <div
                key={org.name}
                id={`crisis-org-card-${index}`}
                className="p-4 sm:p-4.5 rounded-xl bg-[#141722] border border-white/10 hover:border-red-500/40 transition-all shadow-sm space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {org.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 shrink-0">
                      {isSms ? 'Text Service' : 'Phone Line'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {org.description}
                  </p>
                </div>

                {/* Large, Wide, Actionable Touch Target */}
                <a
                  id={`crisis-action-btn-${index}`}
                  href={org.uri}
                  role="button"
                  aria-label={`${org.actionText} for ${org.name}`}
                  className={`w-full py-3.5 px-4 rounded-xl font-mono font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all active:scale-[0.99] shadow-md border ${
                    isSms
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white border-indigo-400/40 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                      : 'bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white border-red-400/50 shadow-[0_0_18px_rgba(225,29,72,0.25)]'
                  }`}
                >
                  {isSms ? (
                    <MessageSquare className="w-5 h-5 text-indigo-200 shrink-0" />
                  ) : (
                    <Phone className="w-5 h-5 text-red-200 shrink-0" />
                  )}
                  <span>{org.actionText}</span>
                </a>
              </div>
            );
          })}
        </div>

        {/* Modal Footer: Gentle Grounding & Close Action */}
        <div className="p-4 bg-[#0a0c12] border-t border-white/10 flex items-center justify-between gap-4">
          <p className="text-xs text-zinc-400">
            Take a slow, deep breath. Help is just one tap away.
          </p>
          <button
            id="crisis-modal-dismiss-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-zinc-300 hover:text-white transition-colors shrink-0"
          >
            Close Plan
          </button>
        </div>
      </div>
    </div>
  );
}

interface RedCrisisButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * Prominent "Red Button" Trigger Component
 * Styled with clear alerting colors (deep crimson / alerting red) that communicate
 * high priority and safety without chaotic visual panic.
 */
export function RedCrisisButton({ onClick, className = '' }: RedCrisisButtonProps) {
  return (
    <button
      id="emergency-action-plan-red-button"
      onClick={onClick}
      type="button"
      aria-label="Open Emergency Action Plan & Crisis Safeguarding"
      className={`w-full relative overflow-hidden group bg-gradient-to-r from-red-700 via-rose-700 to-red-700 hover:from-red-600 hover:via-rose-600 hover:to-red-600 text-white py-3.5 px-4 rounded-2xl font-mono font-bold tracking-wider text-xs sm:text-sm uppercase shadow-[0_4px_25px_rgba(220,38,38,0.4)] border border-red-400/50 flex items-center justify-center gap-3 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-400/60 ${className}`}
    >
      {/* Alerting Pulse Beacon */}
      <span className="relative flex h-3 w-3 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-200 shadow-[0_0_8px_#fff]" />
      </span>

      <ShieldAlert className="w-5 h-5 text-red-100" />
      <span className="font-bold tracking-wide">Emergency Action Plan</span>

      <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/30 border border-white/15 text-red-200 hidden sm:inline-block">
        24/7 Lifeline
      </span>
    </button>
  );
}
