import React from 'react';
import { PhoneCall, MessageSquare, ShieldAlert, HeartHandshake, ArrowUpRight } from 'lucide-react';

export interface CrisisOverrideCardProps {
  onAcknowledgeGrounding?: () => void;
  triggerCategory?: string;
  timestamp?: string;
}

/**
 * ============================================================================
 * CRISIS OVERRIDE CARD (V18 Protocol)
 * ============================================================================
 * Injected directly into the chat stream when an acute risk tripwire is triggered.
 * Color: Muted Terracotta (#C25953).
 * Key Features:
 * 1. Massive, high-contrast primary button linked directly to tel:999.
 * 2. Secondary high-urgency action buttons for NHS 111 (tel:111) and SHOUT (85258).
 * 3. Trauma-informed, non-judgmental crisis safeguarding reassurance.
 * ============================================================================
 */
export const CrisisOverrideCard: React.FC<CrisisOverrideCardProps> = ({
  onAcknowledgeGrounding,
  triggerCategory,
  timestamp,
}) => {
  return (
    <div
      id="crisis-override-card"
      className="w-full my-3 rounded-2xl sm:rounded-3xl bg-[#C25953] text-white p-5 sm:p-6 shadow-2xl border-2 border-white/30 animate-in fade-in zoom-in-95 duration-200"
      role="alert"
      aria-live="assertive"
    >
      {/* Safeguard Alert Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-100/90">
            Clinical Safeguarding Intercept
          </span>
          <h3 className="text-base font-extrabold leading-tight text-white">
            Immediate Human Support Available
          </h3>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-white/95 leading-relaxed mb-4">
        You are not alone. There are trained, compassionate people ready to listen and keep you safe right now—free, confidential, and 24/7.
      </p>

      {/* Massive Primary Action: 999 Emergency Services */}
      <a
        href="tel:999"
        className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-slate-50 active:scale-[0.98] text-[#9B3733] font-black text-center text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg transition-all mb-3.5 group cursor-pointer no-underline"
        aria-label="Call Emergency Services on 999"
      >
        <PhoneCall className="w-6 h-6 text-[#9B3733] group-hover:scale-110 transition-transform" />
        <span>Call 999 Emergency Services</span>
        <ArrowUpRight className="w-4 h-4 text-[#9B3733]/70 ml-auto" />
      </a>

      {/* Secondary Urgent Lines: NHS 111 and SHOUT 85258 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* NHS 111 Mental Health & Urgent Medical */}
        <a
          href="tel:111"
          className="py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-between transition-all border border-white/20 no-underline cursor-pointer"
          aria-label="Call NHS 111"
        >
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-rose-200 shrink-0" />
            <div className="text-left">
              <div className="font-extrabold">NHS 111</div>
              <div className="text-[10px] text-white/80 font-normal">Urgent Care &amp; Mental Health</div>
            </div>
          </div>
          <span className="text-xs font-mono bg-black/20 px-2 py-0.5 rounded text-white">Call 111</span>
        </a>

        {/* SHOUT 24/7 Crisis Text Line */}
        <a
          href="sms:85258?body=SHOUT"
          className="py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-between transition-all border border-white/20 no-underline cursor-pointer"
          aria-label="Text SHOUT to 85258"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-rose-200 shrink-0" />
            <div className="text-left">
              <div className="font-extrabold">SHOUT</div>
              <div className="text-[10px] text-white/80 font-normal">24/7 Crisis Text Line</div>
            </div>
          </div>
          <span className="text-xs font-mono bg-black/20 px-2 py-0.5 rounded text-white">Text 85258</span>
        </a>
      </div>

      {/* Grounding & Reassurance Footer */}
      <div className="mt-4 pt-3 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-white/80">
        <span>Free from UK landlines &amp; mobiles. Will not show on bills.</span>
        {onAcknowledgeGrounding && (
          <button
            type="button"
            onClick={onAcknowledgeGrounding}
            className="text-white hover:text-white font-semibold underline underline-offset-2 hover:opacity-100 opacity-90 transition-opacity"
          >
            Open 5-4-3-2-1 Sensory Grounding
          </button>
        )}
      </div>
    </div>
  );
};
