import React, { useState, useMemo } from 'react';
import { AnonymizedTelemetryPacket, AuthUser } from '../../types/waypoint';
import { DashboardOverview } from './DashboardOverview';
import { StaffCaseworkManager } from './StaffCaseworkManager';
import { OrgTeamManagerModal } from './OrgTeamManagerModal';
import { ShieldCheck, FileText, Activity, LogOut, KeyRound, Building2, Users } from 'lucide-react';

interface OrgB2BDashboardProps {
  telemetryData: AnonymizedTelemetryPacket[];
  currentOrgCode?: string;
  currentUser?: AuthUser;
  onSignOut?: () => void;
  onOpenAdmin?: () => void;
}

export const OrgB2BDashboard: React.FC<OrgB2BDashboardProps> = ({
  telemetryData,
  currentOrgCode = 'ALL',
  currentUser,
  onSignOut,
  onOpenAdmin,
}) => {
  const [activeOrg, setActiveOrg] = useState<string>(currentOrgCode);
  const [activeView, setActiveView] = useState<'casework' | 'telemetry'>('casework');
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Filtered dataset for the de-identified ledger table
  const filteredData = useMemo(() => {
    if (activeOrg === 'ALL') return telemetryData;
    return telemetryData.filter((d) => d.orgCode === activeOrg);
  }, [telemetryData, activeOrg]);

  return (
    <div
      id="org-b2b-dashboard"
      className="w-full max-w-7xl px-4 py-8 sm:px-6 space-y-8 text-slate-100 font-sans"
    >
      {/* Top Practitioner Portal Header & View Switcher */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#131b26] border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400 font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Waypoint Practitioner &amp; Casework Portal
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono">
                {currentUser?.orgCode || currentOrgCode}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {currentUser?.name || 'Staff Member'} •{' '}
              {currentUser?.practitionerRole || 'Youth Justice Key Worker'}
            </p>
          </div>
        </div>

        {/* View Switcher: Casework Notes vs Cohort Telemetry */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Lead Staff Org Team Manager Button */}
          <button
            type="button"
            onClick={() => setIsTeamModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Manage Team (+ Add Staff)</span>
          </button>

          <div className="flex items-center gap-1 bg-[#0b1017] p-1 rounded-2xl border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveView('casework')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeView === 'casework'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Client Notes &amp; Risks</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('telemetry')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeView === 'telemetry'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Cohort Telemetry</span>
            </button>
          </div>

          {/* Optional Admin Link & Sign Out */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                title="Admin Control Center"
              >
                <KeyRound className="w-4 h-4" />
              </button>
            )}

            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 transition-colors"
                title="Sign out of Practitioner Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main View Display */}
      {activeView === 'casework' ? (
        <StaffCaseworkManager
          currentUser={currentUser}
          currentOrgCode={currentUser?.orgCode || currentOrgCode}
        />
      ) : (
        <div className="space-y-8 animate-fadeIn">
          {/* SaaS Dashboard Overview: KPI Bar, Risk Stratification Matrix, Intervention Efficacy & Early Warning System */}
          <DashboardOverview
            telemetryData={telemetryData}
            currentOrgCode={currentOrgCode}
            onSelectOrg={setActiveOrg}
            onSignOut={onSignOut}
            onOpenAdmin={onOpenAdmin}
          />

          {/* De-Identified Clinical Triage & Intervention Ledger Card */}
          <div className="p-6 rounded-3xl bg-[#131b26] border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  De-Identified Clinical Triage &amp; Adherence Ledger
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/40">
                  Banded Telemetry Only
                </span>
                <button
                  type="button"
                  onClick={() => setActiveView('casework')}
                  className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  <span>Open Client Notes</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Aggregated cohort progress and risk bands transmitted from enrolled mobile devices. Raw personal entries and exact scores remain secured on client hardware.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Cohort ID</th>
                    <th className="pb-3 font-semibold">Org Code</th>
                    <th className="pb-3 font-semibold">Age Bracket</th>
                    <th className="pb-3 font-semibold">Alcohol Risk Band</th>
                    <th className="pb-3 font-semibold">Substance Band</th>
                    <th className="pb-3 font-semibold">Mood / Anxiety</th>
                    <th className="pb-3 font-semibold">Interventions Engaged</th>
                    <th className="pb-3 font-semibold">Crisis Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredData.map((packet) => {
                    const userDisplayId = packet.id.replace('pkt-', 'Participant ');
                    const ratio = `${packet.interventionsEngagedCount || 4}/${packet.totalInterventions || 7}`;
                    const pct = Math.round(
                      ((packet.interventionsEngagedCount || 4) / (packet.totalInterventions || 7)) * 100
                    );

                    return (
                      <tr key={packet.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 font-bold text-slate-300">{userDisplayId}</td>
                        <td className="py-3.5 font-semibold text-white">{packet.orgCode}</td>
                        <td className="py-3.5">{packet.ageBracket}</td>

                        {/* Alcohol Band & SADQ Cascade */}
                        <td className="py-3.5">
                          {packet.alcoholRiskBand ? (
                            <span
                              className={`px-2 py-0.5 rounded font-semibold border ${
                                packet.alcoholRiskBand === 'Severe'
                                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                                  : packet.alcoholRiskBand === 'Hazardous'
                                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {packet.alcoholRiskBand}
                              {packet.sadqDependenceBand && ` (SADQ: ${packet.sadqDependenceBand})`}
                            </span>
                          ) : (
                            <span className="text-slate-500">Not assessed</span>
                          )}
                        </td>

                        {/* Substance Band */}
                        <td className="py-3.5">
                          {packet.substanceRiskBand ? (
                            <span
                              className={`px-2 py-0.5 rounded font-semibold border ${
                                packet.substanceRiskBand === 'Severe' || packet.substanceRiskBand === 'Harmful'
                                  ? 'bg-purple-950 text-purple-300 border-purple-800'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {packet.substanceRiskBand}
                            </span>
                          ) : packet.youthSubstanceBand ? (
                            <span
                              className={`px-2 py-0.5 rounded border ${
                                packet.youthSubstanceBand === 'Elevated'
                                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              CRAFFT: {packet.youthSubstanceBand}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>

                        {/* Mood / Anxiety */}
                        <td className="py-3.5">
                          {packet.depressionBand || packet.anxietyBand ? (
                            <div className="flex flex-col gap-0.5">
                              {packet.anxietyBand && (
                                <span className="text-xs text-sky-400">
                                  Anxiety: {packet.anxietyBand}
                                </span>
                              )}
                              {packet.depressionBand && (
                                <span className="text-xs text-emerald-400">
                                  Mood: {packet.depressionBand}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>

                        {/* Interventions Engaged */}
                        <td className="py-3.5">
                          <span className="font-semibold text-white">{ratio}</span>
                          <span className="text-slate-400 ml-1.5">({pct}%)</span>
                        </td>

                        {/* Crisis Alert & Severe Risk Incident Flagging */}
                        <td className="py-3.5">
                          {packet.severeRiskIncident ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 font-bold text-[11px] flex items-center gap-1 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                                Severe Risk Incident
                              </span>
                              <span className="text-[10px] text-rose-400 font-mono">
                                {packet.severeRiskTimestamp
                                  ? new Date(packet.severeRiskTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : 'Recent'} • AI Intercept
                              </span>
                            </div>
                          ) : packet.redButtonUsed ? (
                            <span className="px-2 py-0.5 rounded bg-[#C55A43]/20 text-[#E27D60] border border-[#C55A43]/40 font-semibold">
                              Triggered
                            </span>
                          ) : (
                            <span className="text-slate-500">Standby</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* Lead Staff Org Team Management Modal */}
      <OrgTeamManagerModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        currentUser={currentUser}
        currentOrgCode={currentUser?.orgCode || currentOrgCode}
      />
    </div>
  );
};
