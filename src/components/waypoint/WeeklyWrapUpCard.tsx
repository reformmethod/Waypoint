import React, { useState, useEffect } from 'react';
import { WaypointTask, WaypointUserProfile } from '../../types/waypoint';
import {
  weeklySummaryService,
  WeeklyWrapUpInsight,
} from '../../services/weeklySummaryService';
import {
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Lock,
  Activity,
  Home,
  DollarSign,
  Heart,
} from 'lucide-react';

interface WeeklyWrapUpCardProps {
  tasks: WaypointTask[];
  userProfile: WaypointUserProfile;
}

export const WeeklyWrapUpCard: React.FC<WeeklyWrapUpCardProps> = ({
  tasks,
  userProfile,
}) => {
  const [insight, setInsight] = useState<WeeklyWrapUpInsight | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSummary = async (forceFresh: boolean = false) => {
    setIsLoading(true);
    try {
      const data = await weeklySummaryService.getOrGenerateWeeklyWrapUp(
        tasks,
        userProfile,
        forceFresh
      );
      setInsight(data);
    } catch (e) {
      console.error('Error generating on-device weekly summary', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await weeklySummaryService.getOrGenerateWeeklyWrapUp(
          tasks,
          userProfile,
          false
        );
        if (isMounted) setInsight(data);
      } catch (e) {
        console.error('Error generating on-device weekly summary', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [userProfile?.id]);

  return (
    <div
      id="weekly-wrap-up-card"
      className="p-5 sm:p-6 rounded-3xl bg-[#F7FAFC] border border-[#E2E8F0] shadow-md space-y-4 text-[#1A202C]"
    >
      {/* 1. Header */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4A5568]/10 text-[#4A5568] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1A202C] tracking-tight">
                Weekly Story
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                On-Device AI
              </span>
            </div>
            <p className="text-xs text-[#718096]">
              Your 7-day progress across Body, Home, Money, and Mind
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchSummary(true)}
          disabled={isLoading}
          title="Refresh summary"
          className="p-2 rounded-xl bg-white border border-[#CBD5E0] hover:bg-slate-50 text-[#4A5568] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#4A5568]' : ''}`} />
        </button>
      </div>

      {/* 2. Privacy Note */}
      <div className="p-3 rounded-2xl bg-[#EDF2F7] border border-[#E2E8F0] flex items-center gap-2 text-xs text-[#4A5568]">
        <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Private on-device AI. Your reflections never leave your phone.</span>
      </div>

      {/* 3. 4-Pillar Simple Activity Pills */}
      {insight && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Body */}
          <div className="p-2.5 rounded-2xl bg-white border border-[#E2E8F0] flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-[#718096] uppercase font-bold">Body</div>
              <div className="text-xs font-bold text-[#1A202C]">
                {insight.aggregatedData?.pillars?.physical?.formattedStat ?? '0/7 days'}
              </div>
            </div>
          </div>

          {/* Home */}
          <div className="p-2.5 rounded-2xl bg-white border border-[#E2E8F0] flex items-center gap-2">
            <Home className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-[#718096] uppercase font-bold">Home</div>
              <div className="text-xs font-bold text-[#1A202C]">
                {insight.aggregatedData?.pillars?.family?.formattedStat ?? '0/7 days'}
              </div>
            </div>
          </div>

          {/* Money */}
          <div className="p-2.5 rounded-2xl bg-white border border-[#E2E8F0] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-[#718096] uppercase font-bold">Money</div>
              <div className="text-xs font-bold text-[#1A202C]">
                {insight.aggregatedData?.pillars?.financial?.formattedStat ??
                  insight.aggregatedData?.pillars?.finance?.formattedStat ??
                  '0/7 days'}
              </div>
            </div>
          </div>

          {/* Mind */}
          <div className="p-2.5 rounded-2xl bg-white border border-[#E2E8F0] flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-[#718096] uppercase font-bold">Mind</div>
              <div className="text-xs font-bold text-[#1A202C]">
                {insight.aggregatedData?.pillars?.mental?.formattedStat ?? '0/7 days'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. AI Narrative Summary */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
        {isLoading ? (
          <div className="flex items-center gap-2 text-xs text-[#718096] py-2">
            <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
            <span>Connecting local thoughts...</span>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-[#2D3748] leading-relaxed font-normal">
            &ldquo;
            {insight?.summaryText ||
              insight?.aiResult?.summaryText ||
              'You showed up for yourself this week. Small steps lead to real change.'}
            &rdquo;
          </p>
        )}
      </div>
    </div>
  );
};
