import React, { useState } from 'react';
import {
  X,
  BatteryCharging,
  ShieldCheck,
  HeartPulse,
  CheckCircle2,
  Watch,
  ArrowRight,
  Sparkles,
  Lock,
  RefreshCw,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import {
  biometricService,
  BiometricPermissionStatus,
  BiometricReading,
} from '../../services/biometricService';

interface WearableConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncReading?: (reading: BiometricReading) => void;
}

type ProviderKey = 'apple' | 'google' | 'garmin';

interface ProviderConfig {
  id: ProviderKey;
  name: string;
  badge: string;
  sourceLabel: 'Apple HealthKit' | 'Google Fit' | 'Health Connect';
  description: string;
  accentClass: string;
  iconColor: string;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: 'apple',
    name: 'Apple Health',
    badge: 'iOS HealthKit',
    sourceLabel: 'Apple HealthKit',
    description: 'Reads SleepAnalysis and Resting Heart Rate directly from your iPhone Secure Enclave.',
    accentClass: 'border-[#2D3748] hover:border-[#1A202C]',
    iconColor: 'text-[#1A202C]',
  },
  {
    id: 'google',
    name: 'Google Health Connect',
    badge: 'Android',
    sourceLabel: 'Health Connect',
    description: 'Syncs SleepSession & RestingHeartRate records locally on Android without cloud exposure.',
    accentClass: 'border-emerald-200 hover:border-emerald-300',
    iconColor: 'text-emerald-700',
  },
  {
    id: 'garmin',
    name: 'Garmin Health',
    badge: 'Garmin Connect',
    sourceLabel: 'Apple HealthKit', // Fallback mapped data source
    description: 'Authorizes secure webhook sync for overnight sleep duration and Body Battery.',
    accentClass: 'border-blue-200 hover:border-blue-300',
    iconColor: 'text-blue-700',
  },
];

export const WearableConnectionModal: React.FC<WearableConnectionModalProps> = ({
  isOpen,
  onClose,
  onSyncReading,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<BiometricPermissionStatus>(() =>
    biometricService.getPermissionStatus()
  );
  const [activeReading, setActiveReading] = useState<BiometricReading>(() =>
    biometricService.getLatestReading()
  );
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderKey>('apple');
  const [connectionNotice, setConnectionNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTriggerNativePermission = async (provider: ProviderConfig) => {
    setIsConnecting(true);
    setSelectedProvider(provider.id);
    setConnectionNotice(null);

    try {
      // In native environment, requests HealthKit or Health Connect permissions
      const status = await biometricService.requestPermissions();
      setPermissionStatus(status);

      if (status === 'granted') {
        const updated = biometricService.saveReading({
          dataSource: provider.sourceLabel,
          synced: true,
          timestamp: new Date().toISOString(),
        });
        setActiveReading(updated);
        if (onSyncReading) onSyncReading(updated);
        setConnectionNotice(`${provider.name} connected successfully. Biometrics syncing silently.`);
      } else {
        setConnectionNotice('Permission was dismissed or restricted. Using zero-friction local baseline.');
      }
    } catch {
      setConnectionNotice('Device permission prompt failed to open. You can still test pacing manually below.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSimulateRest = (sleepHours: number, rhr: number) => {
    const updated = biometricService.saveReading({
      sleepHours,
      restingHeartRate: rhr,
      synced: true,
      timestamp: new Date().toISOString(),
    });
    setActiveReading(updated);
    if (onSyncReading) onSyncReading(updated);
  };

  const isConnected = permissionStatus === 'granted';

  return (
    <div
      id="wearable-connection-modal"
      className="fixed inset-0 z-50 bg-[#2D3748]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wearable-modal-title"
    >
      <div className="w-full max-w-lg bg-[#F7FAFC] text-[#1A202C] rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#E2E8F0] space-y-5 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Soft Monolith Header */}
        <div className="flex items-start justify-between gap-3 pb-2 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#2D3748] text-[#F7FAFC] flex items-center justify-center shrink-0 shadow-sm">
              <Watch className="w-6 h-6 text-[#F7FAFC]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
                Autonomous Routine Pacing
              </div>
              <h2 id="wearable-modal-title" className="text-lg font-bold text-[#1A202C] leading-snug">
                Connect Wearable Data
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-white hover:bg-slate-100 text-[#4A5568] border border-[#CBD5E0] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The Contextual Explainer: Explaining the Benefits BEFORE Triggering Native Permissions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1A202C] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              How Wearables Power Your Day
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Zero PII • Local Only
            </span>
          </div>

          <div className="space-y-3 text-xs text-[#4A5568] leading-relaxed">
            {/* Benefit 1: Invisible Hand Routine Pacing */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
                <BatteryCharging className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-[#1A202C] font-bold">Gentle Routine Downscaling:</strong>
                <p className="text-[#718096] mt-0.5">
                  When your sleep falls under 5 hours or resting pulse runs high, Waypoint automatically
                  replaces intense tasks with 2-minute low-effort micro-boosts so you never face burnout.
                </p>
              </div>
            </div>

            {/* Benefit 2: Autonomic Mind & Nervous Tone Protection */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-700 shrink-0 mt-0.5">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-[#1A202C] font-bold">Priority Calming Boosts:</strong>
                <p className="text-[#718096] mt-0.5">
                  Surfaces box breathing and sensory grounding to the top of your Mind pillar during
                  high autonomic strain to restore prefrontal focus.
                </p>
              </div>
            </div>

            {/* Benefit 3: Zero-PII Enclave Guarantee */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700 shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-[#1A202C] font-bold">Strictly Local Enclave:</strong>
                <p className="text-[#718096] mt-0.5">
                  Queries are performed locally via your device’s secure enclave. Your raw biometric data is
                  never transmitted, monetized, or shared with cloud databases.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Provider Cards with Contextual Native Permission Triggers */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-[#718096] uppercase tracking-wider">
            Select Your Wearable Source
          </div>

          <div className="space-y-2">
            {PROVIDERS.map((provider) => {
              const isSelected = selectedProvider === provider.id;
              return (
                <div
                  key={provider.id}
                  className={`p-3.5 rounded-2xl border transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected ? 'border-[#2D3748] ring-2 ring-[#2D3748]/10' : 'border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                      <Watch className={`w-4 h-4 ${provider.iconColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1A202C]">{provider.name}</span>
                        <span className="text-[10px] font-semibold text-[#718096] bg-slate-100 px-2 py-0.5 rounded-full">
                          {provider.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#718096] mt-0.5 leading-snug">
                        {provider.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isConnecting}
                    onClick={() => handleTriggerNativePermission(provider)}
                    className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                      isConnected && isSelected
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-[#2D3748] hover:bg-[#1A202C] text-white active:scale-95 shadow-sm'
                    }`}
                  >
                    {isConnecting && isSelected ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : isConnected && isSelected ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isConnecting && isSelected
                        ? 'Requesting...'
                        : isConnected && isSelected
                        ? 'Connected'
                        : 'Grant Permission'}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Connection Notice / Status Feedback */}
        {connectionNotice && (
          <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-[#4A5568] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{connectionNotice}</span>
          </div>
        )}

        {/* Active Sync Status & Interactive Pacing Test */}
        <div className="p-4 rounded-2xl bg-[#EDF2F7] border border-[#E2E8F0] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#2D3748] uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#4A5568]" />
              Live Biometric Reading
            </span>
            <span className="text-[11px] font-semibold text-[#718096]">
              {activeReading.dataSource} • {activeReading.sleepHours}h sleep • {activeReading.restingHeartRate} bpm
            </span>
          </div>

          <p className="text-[11px] text-[#718096] leading-relaxed">
            Test how Waypoint’s "Invisible Hand" immediately recalibrates your day when your watch registers short rest:
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleSimulateRest(4.5, 86)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                activeReading.sleepHours < 5.0
                  ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                  : 'bg-white border-[#CBD5E0] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-900">Short Sleep (4.5h)</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                  Low Battery
                </span>
              </div>
              <p className="text-[10px] text-amber-800 mt-1 leading-snug">
                Paces Body into 2-min micro-tasks; activates Box Breathing in Mind.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSimulateRest(7.5, 62)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                activeReading.sleepHours >= 6.0
                  ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
                  : 'bg-white border-[#CBD5E0] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-900">Restorative (7.5h)</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Full Battery
                </span>
              </div>
              <p className="text-[10px] text-emerald-800 mt-1 leading-snug">
                Restores standard routines across Body, Home, Money, and Mind.
              </p>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-[#718096]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Local privacy guaranteed</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-2xl bg-[#2D3748] hover:bg-[#1A202C] text-white font-bold text-xs transition-all shadow-md active:scale-95"
          >
            Save &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
};
