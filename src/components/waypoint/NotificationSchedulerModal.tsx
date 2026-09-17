import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  X,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  PushNotificationScheduleConfig,
  NotificationPermissionState,
  WaypointTask,
} from '../../types/waypoint';
import {
  PRESET_TIMES,
  formatTime12Hour,
  getTimeUntilNextNotification,
  isTaskNonNegotiable,
} from '../../utils/notificationScheduler';

interface NotificationSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PushNotificationScheduleConfig;
  onSaveConfig: (config: PushNotificationScheduleConfig) => void;
  permissionState: NotificationPermissionState;
  onRequestPermission: () => Promise<NotificationPermissionState>;
  onTriggerTestNotification: () => void;
  tasks: WaypointTask[];
}

export function NotificationSchedulerModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  permissionState,
  onRequestPermission,
  onTriggerTestNotification,
  tasks,
}: NotificationSchedulerModalProps) {
  const [enabled, setEnabled] = useState<boolean>(config.enabled);
  const [scheduledTime, setScheduledTime] = useState<string>(config.scheduledTime || '18:00');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(config.soundEnabled ?? true);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const nonNegotiableTasks = tasks.filter(isTaskNonNegotiable);
  const pendingTasks = nonNegotiableTasks.filter((t) => !t.isCompleted);
  const completedTasks = nonNegotiableTasks.filter((t) => t.isCompleted);

  const handleSave = () => {
    onSaveConfig({
      ...config,
      enabled,
      scheduledTime,
      soundEnabled,
    });
    onClose();
  };

  const handleTest = () => {
    onTriggerTestNotification();
    setTestStatus('Test notification sent! Check your device notifications.');
    setTimeout(() => setTestStatus(null), 4000);
  };

  const timeUntil = getTimeUntilNextNotification(scheduledTime);

  return (
    <div
      id="notification-scheduler-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-modal-title"
    >
      <div className="w-full max-w-lg rounded-3xl bg-[#16202f] border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 id="notif-modal-title" className="text-base font-bold text-white flex items-center gap-2">
                <span>Push Notification Reminders</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-950 border border-sky-800 text-sky-300">
                  Non-Negotiables
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Automated reminders for your daily anchors at your chosen time.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notification settings"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Enabled Switch */}
        <div className="p-4 rounded-2xl bg-[#0e141f] border border-slate-800 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Enable Daily Push Reminders</span>
              {enabled && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            </div>
            <p className="text-[11px] text-slate-400">
              Sends an alert if non-negotiable habits remain pending at your scheduled time.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none shrink-0 ${
              enabled ? 'bg-sky-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`block w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                enabled ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Browser Permission Card */}
        <div className="p-4 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Browser Notification Permission
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                permissionState === 'granted'
                  ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                  : permissionState === 'denied'
                  ? 'bg-rose-950 border border-rose-800 text-rose-300'
                  : 'bg-amber-950 border border-amber-800 text-amber-300'
              }`}
            >
              {permissionState === 'granted' && <CheckCircle2 className="w-3 h-3" />}
              {permissionState === 'denied' && <AlertCircle className="w-3 h-3" />}
              {permissionState === 'default' && <Info className="w-3 h-3" />}
              <span>
                {permissionState === 'granted'
                  ? 'Granted & Active'
                  : permissionState === 'denied'
                  ? 'Blocked by Browser'
                  : permissionState === 'unsupported'
                  ? 'Unsupported'
                  : 'Permission Needed'}
              </span>
            </span>
          </div>

          <p className="text-xs text-slate-300">
            {permissionState === 'granted'
              ? 'Your browser will deliver desktop and mobile notifications even when the tab is backgrounded.'
              : permissionState === 'denied'
              ? 'Notifications are blocked in your browser settings. You will still receive in-app alerts whenever the application is open.'
              : permissionState === 'unsupported'
              ? 'This browser environment does not support native Notification APIs. Visual in-app alerts will be displayed instead.'
              : 'Click below to allow this application to send desktop and mobile push alerts.'}
          </p>

          {permissionState === 'default' && (
            <button
              type="button"
              onClick={async () => {
                const res = await onRequestPermission();
                if (res === 'granted') {
                  setEnabled(true);
                }
              }}
              className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-sky-950 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Allow Browser Push Notifications</span>
            </button>
          )}
        </div>

        {/* Scheduled Time Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Scheduled Reminder Time</span>
            </label>
            {timeUntil && enabled && (
              <span className="text-[11px] font-mono text-emerald-400">
                Next: {timeUntil}
              </span>
            )}
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-2 gap-2">
            {PRESET_TIMES.map((preset) => (
              <button
                key={preset.time}
                type="button"
                onClick={() => setScheduledTime(preset.time)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  scheduledTime === preset.time
                    ? 'bg-sky-950/60 border-sky-500/70 text-white shadow-sm'
                    : 'bg-[#0e141f] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">{preset.label}</div>
                <div className="text-[10px] text-slate-400 truncate">{preset.desc}</div>
              </button>
            ))}
          </div>

          {/* Custom Time Selector */}
          <div className="p-3 rounded-xl bg-[#0e141f] border border-slate-800 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-300">Custom Reminder Time:</span>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-sky-400"
              />
              <span className="text-xs font-mono text-sky-300 font-bold min-w-[70px]">
                {formatTime12Hour(scheduledTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Sound Toggle */}
        <div className="p-3 rounded-xl bg-[#0e141f] border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
            <span>Harmonic Audio Chime on Alert</span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={soundEnabled}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
              soundEnabled ? 'bg-sky-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Current Non-Negotiables Overview */}
        <div className="p-3.5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">Non-Negotiable Anchors Status</span>
            <span className="font-mono text-amber-300 font-bold">
              {pendingTasks.length} Pending / {nonNegotiableTasks.length} Total
            </span>
          </div>

          {pendingTasks.length > 0 ? (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-2 rounded-lg bg-slate-800/60 border border-amber-500/20 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-slate-200 font-medium truncate">{task.title}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60 shrink-0">
                    {task.pillar}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>All non-negotiable anchors completed for today!</span>
            </div>
          )}
        </div>

        {/* Test Trigger Feedback */}
        {testStatus && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{testStatus}</span>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleTest}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span>Test Notification Now</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-950 transition-colors"
            >
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
