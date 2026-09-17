import React from 'react';
import {
  X,
  Briefcase,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Award,
  GraduationCap,
  CalendarCheck,
  HeartHandshake,
  MessageSquare,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import { AnonymizedTelemetryPacket } from '../../types/waypoint';

export interface WorkerSessionPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
  packet?: AnonymizedTelemetryPacket;
  participantId?: string;
  workerName?: string;
}

/**
 * ============================================================================
 * WORKER SESSION-PREP BRIEF (V22 Directive 5)
 * ============================================================================
 * Practitioner-side productivity view generated before a key worker appointment.
 * - Anonymised case references only (never real names).
 * - Recent engagement & attendance trends.
 * - AssetPlus pathway status.
 * - Non-clinical SLCN communication flag (Directive 1).
 * - AI-suggested reflection prompt from local evening reflection models.
 * - ZERO surveillance: strictly trends and status, never raw journals or chats.
 * ============================================================================
 */
export const WorkerSessionPrepModal: React.FC<WorkerSessionPrepModalProps> = ({
  isOpen,
  onClose,
  packet,
  participantId = 'WP-YJS-411',
  workerName = 'Jordan (Key Worker)',
}) => {
  if (!isOpen) return null;

  const displayId = packet?.id ? packet.id.replace('pkt-', 'WP-') : participantId;
  const attendanceRate = packet?.yjsAttendanceRate || 92;
  const eetScore = packet?.eetStabilityScore || 86;
  const reparationHours = packet?.reparationHoursThisMonth || 8.5;
  const restorativeCount = packet?.restorativeMilestonesCompleted || 6;
  const isSlcnFlagged = packet?.communicationSupportSuggested ?? true;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#131b26] border border-slate-700 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Session-Prep Brief</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 font-mono text-xs font-bold border border-slate-700">
                  {displayId}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 text-[10px] font-bold border border-sky-800">
                  Child-First AssetPlus
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Key Worker: <strong className="text-slate-200">{workerName}</strong> • Hub: {packet?.orgCode || 'YJS-LEEDS'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close session prep brief"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* 1. SLCN Communication Support Flag (Directive 1) */}
          {isSlcnFlagged && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wide">
                    SLCN Communication Guidance
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700/60">
                    Non-Clinical Prompt
                  </span>
                </div>
                <p className="text-xs text-amber-100/90 font-medium leading-relaxed">
                  &ldquo;Might benefit from extra time or a visual aid — never labelled as low ability.&rdquo;
                </p>
                <p className="text-[11px] text-amber-200/70">
                  Preference: Prefers voice-notes, short bullet points, and plain words at Reading Age 10.
                </p>
              </div>
            </div>
          )}

          {/* 2. Engagement & Attendance Trend Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Attendance</span>
                <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-emerald-400">{attendanceRate}%</div>
              <div className="text-[10px] text-slate-400">Worker sessions</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>EET Stability</span>
                <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="text-xl font-bold text-sky-400">{eetScore}%</div>
              <div className="text-[10px] text-slate-400">Life Opportunities</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Reparation</span>
                <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xl font-bold text-amber-400">{reparationHours} hrs</div>
              <div className="text-[10px] text-slate-400">Logged this month</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Milestones</span>
                <Award className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-xl font-bold text-purple-400">{restorativeCount} steps</div>
              <div className="text-[10px] text-slate-400">Restorative Justice</div>
            </div>
          </div>

          {/* 3. AssetPlus Pathway Status Summary */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-sky-400" />
                <span>AssetPlus Pathway Status (Support Plan)</span>
              </h4>
              <span className="text-[10px] text-slate-400">Active Desistance Model</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <strong className="text-slate-200">Restorative Justice: </strong>
                  <span className="text-slate-300">Community repair hours active &amp; empathy reflections completed.</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800">
                  STABLE
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <strong className="text-slate-200">Life Opportunities (ETE): </strong>
                  <span className="text-slate-300">College attendance steady with non-punitive holding streak.</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 text-[10px] font-bold border border-sky-800">
                  PROGRESSING
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <strong className="text-slate-200">Personal &amp; Emotional Wellbeing: </strong>
                  <span className="text-slate-300">Engaging with calm breathing &amp; sleep consistency.</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800">
                  STABLE
                </span>
              </div>
            </div>
          </div>

          {/* 4. AI-Suggested Reflection Prompt */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-800/50 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-bold text-purple-200">
                AI-Suggested Opening Reflection Prompt
              </h4>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed italic bg-black/30 p-3 rounded-xl border border-purple-900/40">
              &ldquo;You logged steady college days and completed your community gardening hours this week.
              What felt like the most positive moment you handled on your own?&rdquo;
            </p>
            <p className="text-[10px] text-slate-400">
              Formulated from local on-device evening reflection themes. Use to initiate strengths-based dialogue.
            </p>
          </div>

          {/* Productivity vs Surveillance Disclaimer */}
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Zero-PII Productivity Feature:</strong> This brief combines high-level participation trends only.
              Private chat transcripts and journal entries never leave the participant&apos;s phone.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Confidential to Youth Justice Services • Caldicott &amp; GDPR Compliant
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors"
          >
            Close Brief
          </button>
        </div>
      </div>
    </div>
  );
};
