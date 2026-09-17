import React from 'react';
import { Bell, CheckCircle2, Clock, X, Sparkles } from 'lucide-react';
import { WaypointTask } from '../../types/waypoint';

interface InAppNotificationBannerProps {
  isOpen: boolean;
  onClose: () => void;
  pendingTasks: WaypointTask[];
  onSnooze?: (minutes: number) => void;
  onViewTasks?: () => void;
  isTest?: boolean;
}

export function InAppNotificationBanner({
  isOpen,
  onClose,
  pendingTasks,
  onSnooze,
  onViewTasks,
  isTest = false,
}: InAppNotificationBannerProps) {
  if (!isOpen) return null;

  const count = pendingTasks.length;

  return (
    <div
      id="waypoint-in-app-notification-banner"
      role="alert"
      aria-live="assertive"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg animate-in slide-in-from-top-4 duration-300"
    >
      <div className="p-4 sm:p-5 rounded-3xl bg-[#121926]/95 backdrop-blur-md border border-sky-500/50 shadow-2xl shadow-sky-950/60 text-slate-100 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-sky-600/30">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">
                  {isTest ? 'Test Push Notification' : 'Scheduled Non-Negotiables Reminder'}
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              </div>

              <h4 className="text-sm sm:text-base font-bold text-white">
                {count > 0 ? (
                  <>
                    You have <span className="text-amber-300 font-mono">{count}</span> non-negotiable anchor{count !== 1 ? 's' : ''} pending
                  </>
                ) : (
                  'All Non-Negotiables Secured!'
                )}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">
                {count > 0 ? (
                  <>
                    Daily foundational habits require execution to preserve stability:{' '}
                    <strong className="text-slate-100">
                      {pendingTasks.slice(0, 2).map((t) => t.title).join(', ')}
                      {count > 2 ? ` +${count - 2} more` : ''}
                    </strong>.
                  </>
                ) : (
                  'All non-negotiable daily anchors have been executed today. Great momentum!'
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/80">
          {onSnooze && count > 0 && (
            <button
              type="button"
              onClick={() => onSnooze(15)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Snooze 15m</span>
            </button>
          )}

          {onViewTasks && count > 0 && (
            <button
              type="button"
              onClick={() => {
                onViewTasks();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-950 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Review Anchors</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
