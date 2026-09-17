import React, { useState } from 'react';
import { AuthUser } from '../../types/waypoint';
import { X, Check, Shield, User, ArrowRight } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

interface GoogleAccount {
  name: string;
  email: string;
  avatarBg: string;
  initials: string;
}

const PRESET_ACCOUNTS: GoogleAccount[] = [
  {
    name: 'Alex Morgan',
    email: 'alex.morgan@gmail.com',
    avatarBg: 'bg-blue-600',
    initials: 'AM',
  },
  {
    name: 'Jordan Miller',
    email: 'jordan.m.personal@gmail.com',
    avatarBg: 'bg-emerald-600',
    initials: 'JM',
  },
];

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedAccount, setSelectedAccount] = useState<GoogleAccount>(PRESET_ACCOUNTS[0]);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const handleConfirmLogin = (account: GoogleAccount) => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      onSuccess({
        id: `google-${Date.now().toString(36)}`,
        name: account.name,
        email: account.email,
        role: 'Personal',
        orgCode: 'YJS-LEEDS',
        lastLogin: new Date().toISOString(),
      });
      onClose();
    }, 450);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) return;
    const name = customName.trim() || customEmail.split('@')[0];
    handleConfirmLogin({
      name,
      email: customEmail.trim().toLowerCase(),
      avatarBg: 'bg-indigo-600',
      initials: name.substring(0, 2).toUpperCase(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden font-sans text-slate-800 animate-fadeIn">
        {/* Google Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <div>
              <h3 className="text-base font-bold text-slate-900">Sign in with Google</h3>
              <p className="text-xs text-slate-500">Choose an account to continue to Waypoint</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!isCustomMode ? (
            <div className="space-y-2.5">
              {PRESET_ACCOUNTS.map((acc) => {
                const isSelected = selectedAccount.email === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => setSelectedAccount(acc)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-sm ${acc.avatarBg}`}
                      >
                        {acc.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{acc.name}</p>
                        <p className="text-xs text-slate-500">{acc.email}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className="w-full p-3.5 rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 text-left flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-semibold text-sm">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">Use another Google account</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Kai Taylor"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Google Email</label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="e.g. kai.taylor@gmail.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  ← Select Existing Account
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
                >
                  Sign In with Account
                </button>
              </div>
            </form>
          )}

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
            <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              To continue, Google will share your name, email address, language preference, and profile picture with <strong>Waypoint</strong>.
            </span>
          </div>

          {!isCustomMode && (
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isAuthenticating}
                onClick={() => handleConfirmLogin(selectedAccount)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
              >
                {isAuthenticating ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Continue as {selectedAccount.name.split(' ')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
