import React from 'react';
import { LifeBuoy, ArrowRight } from 'lucide-react';

interface CrisisButtonProps {
  onClick: () => void;
  className?: string;
  label?: string;
}

/**
 * Objective: The Muted Terracotta Crisis Support Button (#C25953).
 * Always accessible, clear, non-alarming, and inviting.
 */
export const CrisisButton: React.FC<CrisisButtonProps> = ({
  onClick,
  className = '',
  label = 'Crisis Support',
}) => {
  return (
    <button
      id="waypoint-crisis-trigger-button"
      type="button"
      onClick={onClick}
      className={`w-full py-4 px-5 rounded-2xl bg-[#C25953] hover:bg-[#b04f4a] active:scale-[0.99] text-white border border-[#E07A74]/30 shadow-md shadow-[#C25953]/20 flex items-center justify-between transition-all text-left group ${className}`}
      aria-label="Open emergency crisis and grounding support"
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-xl bg-black/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <LifeBuoy className="w-5 h-5 text-white stroke-[2.2]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-white tracking-wide">
            {label}
          </div>
          <div className="text-xs text-white/80 font-medium">
            5-4-3-2-1 Grounding &amp; 24/7 Helplines
          </div>
        </div>
      </div>
      <div className="w-8 h-8 rounded-lg bg-black/15 flex items-center justify-center shrink-0 ml-2 group-hover:bg-black/25 transition-colors">
        <ArrowRight className="w-4 h-4 text-white" />
      </div>
    </button>
  );
};
