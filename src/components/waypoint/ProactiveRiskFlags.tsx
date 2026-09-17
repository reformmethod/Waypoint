import React, { useState } from 'react';
import { AnonymizedTelemetryPacket } from '../../types/waypoint';
import { predictiveRiskService, ProactiveRiskFlag } from '../../services/predictiveRiskService';
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  BellRing,
  CheckCircle2,
  Users,
  Activity,
  ArrowRight,
} from 'lucide-react';

interface ProactiveRiskFlagsProps {
  telemetryData: AnonymizedTelemetryPacket[];
  selectedOrg?: string;
}

export const ProactiveRiskFlags: React.FC<ProactiveRiskFlagsProps> = ({
  telemetryData,
  selectedOrg = 'ALL',
}) => {
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');

  const riskFlags = React.useMemo(() => {
    return predictiveRiskService.evaluateProactiveRiskFlags(telemetryData, selectedOrg);
  }, [telemetryData, selectedOrg]);

  const handleAcknowledge = (id: string) => {
    setAcknowledgedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const displayedFlags = riskFlags.filter((f) => {
    if (activeTab === 'active') return !acknowledgedIds.has(f.id);
    return true;
  });

  return (
    <div
      id="proactive-risk-flags"
      className="p-6 rounded-3xl bg-[#131b26] border border-rose-500/30 shadow-xl space-y-5"
    >
      {/* Header with status badge & filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <BellRing className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Proactive Risk Flags: Predictive Telemetry Scanner
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-mono font-semibold">
                Objective 3 AI Layer
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous scan: Triggers when demographic cohorts exhibit &gt;20% Physical drop alongside &gt;15% Mental distress surge over 7 days.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'active'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-white border border-slate-700/60'
            }`}
          >
            Active ({riskFlags.length - acknowledgedIds.size})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'all'
                ? 'bg-slate-700 text-white border border-slate-600'
                : 'text-slate-400 hover:text-white border border-slate-700/60'
            }`}
          >
            All Flags ({riskFlags.length})
          </button>
        </div>
      </div>

      {displayedFlags.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#0d141f] border border-slate-800 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-80" />
          <p className="text-xs font-semibold text-slate-300">
            All predictive risk flags acknowledged or stable.
          </p>
          <p className="text-[11px] text-slate-500">
            No demographic cohort currently exceeds the dual-variance risk threshold (&gt;20% Physical Drop + &gt;15% Mental Distress Rise).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayedFlags.map((flag) => {
            const isAck = acknowledgedIds.has(flag.id);
            return (
              <div
                key={flag.id}
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  isAck
                    ? 'bg-[#0d141f]/70 border-slate-800 opacity-60'
                    : flag.severity === 'CRITICAL'
                    ? 'bg-[#1a1217] border-rose-500/40 shadow-lg shadow-rose-950/20'
                    : 'bg-[#18161c] border-amber-500/40 shadow-lg shadow-amber-950/20'
                }`}
              >
                {/* Top Alert Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider border ${
                        flag.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {flag.severity}
                    </span>
                    <h4 className="text-xs font-bold text-white sm:text-sm">
                      {flag.alertTitle}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono text-slate-300">{flag.orgCode}</span>
                    <span>•</span>
                    <span>{flag.cohortName}</span>
                  </div>
                </div>

                {/* 7-Day Metric Variance Indicator Boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Metric 1: Physical Task Completion Drop */}
                  <div className="p-3 rounded-xl bg-[#0a0e16] border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                        Physical Completion
                      </span>
                      <span className="font-mono text-rose-400 font-bold">
                        -{flag.physicalDropPct}%
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Baseline: 76% → Current: {Math.round(76 * (1 - flag.physicalDropPct / 100))}% over 7 days
                    </div>
                  </div>

                  {/* Metric 2: Mental Check-In Distress Surge */}
                  <div className="p-3 rounded-xl bg-[#0a0e16] border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                        Mental Distress Scores
                      </span>
                      <span className="font-mono text-amber-400 font-bold">
                        +{flag.mentalDistressRisePct}%
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Aggregated GAD-7 &amp; PHQ-9 distress check-in severity
                    </div>
                  </div>

                  {/* Metric 3: Cohort Impact */}
                  <div className="p-3 rounded-xl bg-[#0a0e16] border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        Cohort Sample
                      </span>
                      <span className="font-mono text-sky-400 font-bold">
                        {flag.affectedCount} / {flag.totalCohortCount}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {flag.crisisTriggerCount} crisis grounding triggers logged
                    </div>
                  </div>
                </div>

                {/* Clinical Rationale & Actionable Guidance */}
                <div className="p-3.5 rounded-xl bg-black/30 border border-slate-800/80 space-y-2">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-white font-semibold">Clinical Telemetry Signal: </strong>
                    {flag.clinicalRationale}
                  </p>
                  <div className="flex items-start gap-2 pt-1 border-t border-slate-800/60 text-xs text-sky-300">
                    <Activity className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-semibold text-white">Recommended Practitioner Action: </strong>
                      {flag.practitionerGuidance}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Trigger rule: Physical Drop &gt; 20% &amp; Mental Distress &gt; 15% (7d)
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcknowledge(flag.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isAck
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-rose-500/20 text-rose-200 border border-rose-500/40 hover:bg-rose-500/30'
                      }`}
                    >
                      {isAck ? 'Mark as Active' : 'Acknowledge Flag'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
