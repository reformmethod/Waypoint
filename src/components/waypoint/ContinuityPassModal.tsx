import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  Heart,
  Share2,
} from 'lucide-react';
import { ContinuityPassSummary, WaypointUserProfile } from '../../types/waypoint';
import { SpeakableText } from './SpeakableText';

export interface ContinuityPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: WaypointUserProfile;
  currentResilienceScore?: number;
}

/**
 * ============================================================================
 * CONTINUITY PASS MODAL (V22 Directive 6: Transition to Adult Services)
 * ============================================================================
 * Opt-in, high-trust transition summary controlled entirely by the young person.
 * - Explicit consent required.
 * - Stored and exported locally as a shareable file.
 * - ZERO background sync or automated transfer to adult services.
 * ============================================================================
 */
export const ContinuityPassModal: React.FC<ContinuityPassModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  currentResilienceScore = 84,
}) => {
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [whatHelped, setWhatHelped] = useState<string[]>([
    'Taking small daily steps instead of huge goals',
    'Morning text check-in and visual routine',
    'Walking meetings outside with my mentor',
  ]);
  const [whatDidntHelp, setWhatDidntHelp] = useState<string[]>([
    'Long formal paperwork without explanations',
    'Sudden appointment changes without notice',
  ]);
  const [newHelpedItem, setNewHelpedItem] = useState<string>('');
  const [newDidntHelpItem, setNewDidntHelpItem] = useState<string>('');
  const [communicationNotes, setCommunicationNotes] = useState<string>(
    'Prefers plain words (Reading Age 10). Responds well to voice notes and bullet points.'
  );
  const [isExported, setIsExported] = useState<boolean>(false);

  if (!isOpen) return null;

  const anonymisedRef = `WP-YJS-${userProfile?.id ? userProfile.id.slice(0, 6) : '782'}`;

  const handleAddHelped = () => {
    if (newHelpedItem.trim()) {
      setWhatHelped([...whatHelped, newHelpedItem.trim()]);
      setNewHelpedItem('');
    }
  };

  const handleAddDidntHelp = () => {
    if (newDidntHelpItem.trim()) {
      setWhatDidntHelp([...whatDidntHelp, newDidntHelpItem.trim()]);
      setNewDidntHelpItem('');
    }
  };

  const handleDownloadFile = () => {
    const summaryData: ContinuityPassSummary = {
      id: `pass-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      anonymisedReference: anonymisedRef,
      ageAtTransition: 17,
      whatHelped,
      whatDidntHelp,
      assetPlusPathwaysSummary: [
        { pathway: 'Restorative Justice', status: 'stable', notes: 'Completed community garden hours and empathy reflection.' },
        { pathway: 'Life Opportunities (ETE)', status: 'progressing', notes: 'Enrolled in college apprentice prep course.' },
        { pathway: 'Emotional & Mental Wellbeing', status: 'stable', notes: 'Engaged with daily grounding routines.' },
      ],
      resilienceTrend: `Steady at ${currentResilienceScore}% (Zero-punitive progress holding)`,
      communicationNotes,
    };

    const textOutput = `=======================================================
WAYPOINT TRANSITION CONTINUITY PASS (CONFIDENTIAL)
=======================================================
Anonymised Reference: ${summaryData.anonymisedReference}
Date Generated: ${new Date().toLocaleDateString('en-GB')}
Notice: This document is controlled by the young person. 
It was created with explicit consent for voluntary sharing.
=======================================================

1. WHAT WORKED WELL FOR ME:
${whatHelped.map((item, idx) => `  • ${item}`).join('\n')}

2. WHAT WAS DIFFICULT OR DIDN'T HELP:
${whatDidntHelp.map((item, idx) => `  • ${item}`).join('\n')}

3. HOW TO BEST COMMUNICATE WITH ME:
  • ${communicationNotes}

4. ASSETPLUS PATHWAY MOMENTUM:
${summaryData.assetPlusPathwaysSummary.map((p) => `  • ${p.pathway}: ${p.status.toUpperCase()} (${p.notes})`).join('\n')}

5. RESILIENCE SCORE TREND:
  • ${summaryData.resilienceTrend}

=======================================================
Generated on-device via Waypoint Child-First System.
Zero-PII. No automated data transfer.
=======================================================
`;

    const blob = new Blob([textOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Waypoint_Continuity_Pass_${anonymisedRef}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExported(true);
    setTimeout(() => setIsExported(false), 3500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#131b26] border border-slate-700 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Transition Continuity Pass</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[10px] font-bold border border-amber-800">
                  Voluntary &amp; Opt-In
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Your voice, your insights, your control as you move into adult life.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Continuity Pass"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Trust Banner: Zero Automated Sync Guarantee */}
          <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/50 flex items-start gap-3">
            <Lock className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-sky-300">
                Controlled by You — Never Sent Automatically
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                This pass stays strictly on your phone until you choose to download or share it.
                There is no automated account link or background sync to any adult service.
              </p>
            </div>
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={hasConsented}
              onChange={(e) => setHasConsented(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-sky-600 focus:ring-0 mt-0.5 cursor-pointer"
            />
            <span className="text-xs text-slate-200 leading-relaxed font-medium">
              I agree to generate this transition summary for myself or to share with a worker I trust.
              I understand it contains only my strengths and communication needs.
            </span>
          </label>

          {hasConsented && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Section 1: What Helped */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-emerald-400" />
                    <h5 className="text-xs font-bold text-white">What helped me most:</h5>
                  </div>
                  <SpeakableText text={`What helped me most: ${whatHelped.join('. ')}`} />
                </div>

                <div className="space-y-1.5">
                  {whatHelped.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-2 text-xs text-slate-200"
                    >
                      <span>• {item}</span>
                      <button
                        type="button"
                        onClick={() => setWhatHelped(whatHelped.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newHelpedItem}
                    onChange={(e) => setNewHelpedItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddHelped()}
                    placeholder="Add another positive strategy..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddHelped}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Section 2: What Didn't Help */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-white">What made things harder:</h5>
                  <SpeakableText text={`What made things harder: ${whatDidntHelp.join('. ')}`} />
                </div>

                <div className="space-y-1.5">
                  {whatDidntHelp.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-2 text-xs text-slate-200"
                    >
                      <span>• {item}</span>
                      <button
                        type="button"
                        onClick={() => setWhatDidntHelp(whatDidntHelp.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newDidntHelpItem}
                    onChange={(e) => setNewDidntHelpItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddDidntHelp()}
                    placeholder="Add something people should avoid..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddDidntHelp}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Section 3: Communication Preferences */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h5 className="text-xs font-bold text-white">How I prefer to communicate:</h5>
                <textarea
                  value={communicationNotes}
                  onChange={(e) => setCommunicationNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none leading-relaxed"
                />
              </div>

              {/* Summary Preview Box */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Anonymised Case Ref: </span>
                  <strong className="text-sky-400 font-mono">{anonymisedRef}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Resilience: </span>
                  <strong className="text-emerald-400">{currentResilienceScore}% (Held)</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!hasConsented}
            onClick={handleDownloadFile}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-950 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            {isExported ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Saved to Device</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Local Pass (.txt)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
