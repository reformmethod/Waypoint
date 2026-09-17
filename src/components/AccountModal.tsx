import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  User,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  LogOut,
  Mail,
  Copy,
  Check,
  Calendar,
  PhoneCall,
  CheckCircle2,
  RefreshCw,
  Power,
  Sparkles,
} from 'lucide-react';
import { formatSecretKey, generate2FASecret, generateBackupCodes } from '../utils/twoFactor';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const {
    userProfile,
    user,
    logout,
    sendPasswordReset,
    updateSponsor,
    enable2FA,
    disable2FA,
  } = useAuth();

  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [isResettingPass, setIsResettingPass] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isEditingSponsor, setIsEditingSponsor] = useState(false);
  const [sponsorName, setSponsorName] = useState(userProfile?.sponsorName || '');
  const [sponsorPhone, setSponsorPhone] = useState(userProfile?.sponsorPhone || '');
  const [isSavingSponsor, setIsSavingSponsor] = useState(false);

  // 2FA Management States
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [newSecret, setNewSecret] = useState('');
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);
  const [isToggling2FA, setIsToggling2FA] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);

  if (!isOpen) return null;

  const is2FAActive = !!userProfile?.twoFactorEnabled;

  const handleStartEnable2FA = () => {
    const secret = generate2FASecret();
    const codes = generateBackupCodes();
    setNewSecret(secret);
    setNewBackupCodes(codes);
    setIsEnabling2FA(true);
  };

  const handleConfirmEnable2FA = async () => {
    setIsToggling2FA(true);
    try {
      await enable2FA(newSecret, newBackupCodes);
      setIsEnabling2FA(false);
    } catch (err) {
      console.error('Failed to enable 2FA:', err);
    } finally {
      setIsToggling2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsToggling2FA(true);
    try {
      await disable2FA();
      setConfirmDisable(false);
    } catch (err) {
      console.error('Failed to disable 2FA:', err);
    } finally {
      setIsToggling2FA(false);
    }
  };

  const handleCopySecret = (secretToCopy: string) => {
    navigator.clipboard.writeText(secretToCopy);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyBackupCodes = (codesToCopy: string[]) => {
    navigator.clipboard.writeText(codesToCopy.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsResettingPass(true);
    try {
      await sendPasswordReset(user.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResettingPass(false);
    }
  };

  const handleSaveSponsor = async () => {
    setIsSavingSponsor(true);
    try {
      await updateSponsor(sponsorName.trim(), sponsorPhone.trim());
      setIsEditingSponsor(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSponsor(false);
    }
  };

  const handleSignOut = async () => {
    onClose();
    await logout();
  };

  const formattedDate = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Active';

  return (
    <div
      id="account-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="account-modal-card"
        className="relative w-full max-w-lg bg-[#0e0e12] border border-white/10 rounded-2xl shadow-2xl text-gray-200 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#14141d] to-[#0e0e12] p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">Account & Security Settings</h2>
              <p className="text-xs text-zinc-400">Cloud Sync, Optional 2FA, and Recovery Data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* User Profile Card */}
          <div className="bg-[#131318] border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center font-bold text-cyan-300 text-xs">
                  {user?.email?.[0]?.toUpperCase() || user?.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {userProfile?.displayName || user?.displayName || 'Recovery Warrior'}
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-zinc-500" />
                    <span>{user?.email || 'Logged In'}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cloud Synced</span>
              </span>
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-zinc-500" />
                <span>Joined {formattedDate}</span>
              </span>
            </div>
          </div>

          {/* 2FA Security Section (Optional) */}
          <div className="bg-[#131318] border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {is2FAActive ? (
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-zinc-400" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Two-Factor Authentication (2FA)
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  is2FAActive
                    ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                    : 'bg-zinc-800/60 text-zinc-400 border-white/10'
                }`}
              >
                {is2FAActive ? 'ACTIVE' : 'OPTIONAL (OFF)'}
              </span>
            </div>

            {/* State A: 2FA is currently active */}
            {is2FAActive && !confirmDisable && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Your account is protected by 2FA. A 6-digit TOTP code or emergency backup code is required during sign-in.
                </p>

                {/* Secret Key Box */}
                {userProfile?.twoFactorSecret && (
                  <div className="p-3 bg-[#0a0a0e] rounded-lg border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Authenticator Secret (Base32):</span>
                      <button
                        onClick={() => handleCopySecret(userProfile.twoFactorSecret!)}
                        className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-[11px]"
                      >
                        {copiedSecret ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-xs text-zinc-200 bg-[#161620] p-1.5 rounded border border-white/5 select-all break-all">
                      {formatSecretKey(userProfile.twoFactorSecret)}
                    </div>
                  </div>
                )}

                {/* Emergency Backup Codes */}
                {userProfile?.backupCodes && userProfile.backupCodes.length > 0 && (
                  <div className="p-3 bg-[#0a0a0e] rounded-lg border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1 font-medium text-amber-400">
                        <KeyRound className="w-3 h-3" />
                        <span>Emergency Backup Codes ({userProfile.backupCodes.length} remaining):</span>
                      </span>
                      <button
                        onClick={() => handleCopyBackupCodes(userProfile.backupCodes!)}
                        className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-[11px]"
                      >
                        {copiedCodes ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCodes ? 'Copied All' : 'Copy All'}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] text-zinc-300">
                      {userProfile.backupCodes.map((code, idx) => (
                        <div key={idx} className="bg-[#14141c] px-2 py-1 rounded border border-white/5 text-center">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setConfirmDisable(true)}
                    className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
                  >
                    Turn off 2FA
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Disable 2FA Prompt */}
            {is2FAActive && confirmDisable && (
              <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl space-y-2.5 text-xs text-red-200">
                <p className="font-medium">Are you sure you want to disable Two-Factor Authentication?</p>
                <p className="text-[11px] text-zinc-400">
                  You will only need your email and password (or social login) to sign in.
                </p>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmDisable(false)}
                    className="px-2.5 py-1 text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isToggling2FA}
                    onClick={handleDisable2FA}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg"
                  >
                    {isToggling2FA ? 'Disabling...' : 'Confirm Disable'}
                  </button>
                </div>
              </div>
            )}

            {/* State B: 2FA is currently disabled */}
            {!is2FAActive && !isEnabling2FA && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Two-Factor Authentication is currently optional. Enabling it adds a layer of protection to your recovery data using any authenticator app (Google Authenticator, Apple Passwords, Authy).
                </p>
                <button
                  type="button"
                  onClick={handleStartEnable2FA}
                  className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Set Up Two-Factor Authentication</span>
                </button>
              </div>
            )}

            {/* State C: In-progress enabling 2FA wizard */}
            {!is2FAActive && isEnabling2FA && (
              <div className="space-y-3 p-3 bg-[#0a0a0e] rounded-xl border border-cyan-500/20 text-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-cyan-300 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>New 2FA Configuration Generated</span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                    <span>1. Add this key to your Authenticator:</span>
                    <button
                      type="button"
                      onClick={() => handleCopySecret(newSecret)}
                      className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1"
                    >
                      {copiedSecret ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-zinc-200 bg-[#161620] p-2 rounded border border-white/10 select-all break-all">
                    {formatSecretKey(newSecret)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                    <span>2. Save your Emergency Backup Codes:</span>
                    <button
                      type="button"
                      onClick={() => handleCopyBackupCodes(newBackupCodes)}
                      className="text-amber-400 hover:text-amber-300 text-[11px] flex items-center gap-1"
                    >
                      {copiedCodes ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCodes ? 'Copied All' : 'Copy All'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1 font-mono text-[11px] text-zinc-300">
                    {newBackupCodes.map((c, i) => (
                      <div key={i} className="bg-[#14141c] p-1 rounded text-center border border-white/5">
                        {c}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsEnabling2FA(false)}
                    className="px-2.5 py-1 text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isToggling2FA}
                    onClick={handleConfirmEnable2FA}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                  >
                    {isToggling2FA ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Activate 2FA</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Accountability Contact / Sponsor */}
          <div className="bg-[#131318] border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Sponsor / Emergency SOS Contact
                </span>
              </div>
              {!isEditingSponsor && (
                <button
                  onClick={() => setIsEditingSponsor(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingSponsor ? (
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    placeholder="e.g. Mike (Sponsor)"
                    className="w-full bg-[#08080a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={sponsorPhone}
                    onChange={(e) => setSponsorPhone(e.target.value)}
                    placeholder="e.g. 555-123-4567"
                    className="w-full bg-[#08080a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsEditingSponsor(false)}
                    className="px-2.5 py-1 text-zinc-400 hover:text-zinc-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSponsor}
                    disabled={isSavingSponsor}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md font-medium"
                  >
                    {isSavingSponsor ? 'Saving...' : 'Save Contact'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <div>
                  <span className="font-semibold text-white">
                    {userProfile?.sponsorName || 'No Sponsor Assigned'}
                  </span>
                  <div className="text-zinc-500 text-[11px]">{userProfile?.sponsorPhone || 'Add phone number'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Password Reset Action */}
          <div className="bg-[#131318] border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white">Need to update your password?</div>
              <div className="text-[11px] text-zinc-400">We'll dispatch a secure reset link to your email.</div>
            </div>
            <button
              onClick={handlePasswordReset}
              disabled={isResettingPass}
              className="px-3 py-1.5 bg-[#1e1e28] hover:bg-[#282836] border border-white/10 rounded-lg text-xs font-medium text-cyan-300 transition-colors shrink-0"
            >
              {isResettingPass ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : resetSent ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  Sent!
                </span>
              ) : (
                'Send Reset Email'
              )}
            </button>
          </div>
        </div>

        {/* Footer with Sign Out */}
        <div className="p-4 bg-[#09090d] border-t border-white/5 flex items-center justify-between">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-300 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1a1a24] hover:bg-[#222230] border border-white/10 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
