import React, { useState } from 'react';
import { AuthUser } from '../../types/waypoint';
import { X, Shield, Check, Fingerprint, Lock, ArrowRight } from 'lucide-react';

interface AppleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

export const AppleAuthModal: React.FC<AppleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [emailOption, setEmailOption] = useState<'share' | 'hide'>('hide');
  const [isVerifyingFaceId, setIsVerifyingFaceId] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  if (!isOpen) return null;

  const handleConfirmApple = () => {
    setIsVerifyingFaceId(true);
    setTimeout(() => {
      setIsVerifyingFaceId(false);
      setVerificationSuccess(true);
      setTimeout(() => {
        const email =
          emailOption === 'hide'
            ? 'alex.m.relay@privaterelay.appleid.com'
            : 'alex.morgan@icloud.com';
        onSuccess({
          id: `apple-${Date.now().toString(36)}`,
          name: 'Alex Morgan',
          email,
          role: 'Personal',
          orgCode: 'YJS-LEEDS',
          lastLogin: new Date().toISOString(),
        });
        onClose();
      }, 400);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#1C1C1E] text-white rounded-3xl shadow-2xl border border-white/10 overflow-hidden font-sans animate-fadeIn">
        {/* Apple ID Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white text-black flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.7-11.71-13.98-5.65-8.6-9.97-18.49-12.98-29.68-3-11.19-4.51-21.94-4.51-32.25 0-14.12 3.38-25.77 10.14-34.94 6.76-9.17 15.34-13.84 25.75-14.02 5.01 0 10.45 1.34 16.32 4.02 5.87 2.68 9.77 4.08 11.71 4.2 1.63 0 5.62-1.39 11.97-4.18 6.35-2.79 11.83-4.08 16.44-3.87 13.9.76 24.62 5.61 32.18 14.56-11.96 7.23-17.83 17.1-17.61 29.6.22 9.87 4.03 18.06 11.44 24.56 7.41 6.5 16.32 10.15 26.74 10.96-2.5 7.6-5.44 14.63-8.81 21.09zM119.22 33.7c0-7.39 2.67-14.18 8.01-20.37 5.34-6.19 11.89-9.87 19.64-11.04.22 1.09.33 2.06.33 2.93 0 7.39-2.77 14.28-8.31 20.67-5.54 6.39-12.16 10.09-19.86 11.1-0.22-1.08-.33-2.05-.33-2.92z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Apple ID</h3>
              <p className="text-[11px] text-zinc-400">Sign in to Waypoint</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-center space-y-2 py-1">
            <div className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 mx-auto flex items-center justify-center text-blue-400">
              {verificationSuccess ? (
                <Check className="w-7 h-7 text-emerald-400 animate-bounce" />
              ) : isVerifyingFaceId ? (
                <Fingerprint className="w-8 h-8 text-blue-400 animate-pulse" />
              ) : (
                <Fingerprint className="w-8 h-8 text-zinc-300" />
              )}
            </div>
            <p className="text-xs font-semibold text-zinc-200">
              {verificationSuccess
                ? 'Identity Confirmed'
                : isVerifyingFaceId
                ? 'Verifying with Face ID...'
                : 'Do you want to sign in to Waypoint with your Apple ID?'}
            </p>
            <p className="text-[11px] text-zinc-400">alex.morgan@icloud.com</p>
          </div>

          {/* Email Privacy Options */}
          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Email Option
            </label>

            <button
              type="button"
              onClick={() => setEmailOption('hide')}
              className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                emailOption === 'hide'
                  ? 'border-blue-500 bg-blue-950/40 text-white'
                  : 'border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <div>
                <p className="text-xs font-bold">Hide My Email</p>
                <p className="text-[10px] text-zinc-400">
                  Forward to alex.morgan@icloud.com (Private Relay)
                </p>
              </div>
              {emailOption === 'hide' && (
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setEmailOption('share')}
              className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                emailOption === 'share'
                  ? 'border-blue-500 bg-blue-950/40 text-white'
                  : 'border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <div>
                <p className="text-xs font-bold">Share My Email</p>
                <p className="text-[10px] text-zinc-400">alex.morgan@icloud.com</p>
              </div>
              {emailOption === 'share' && (
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-zinc-300 shrink-0 mt-0.5" />
            <span>
              Your Apple ID credentials are cryptographically protected and never exposed to external servers.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-zinc-400 hover:text-white font-semibold"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isVerifyingFaceId || verificationSuccess}
              onClick={handleConfirmApple}
              className="px-5 py-2.5 rounded-2xl bg-white hover:bg-zinc-200 active:scale-95 text-black font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              {isVerifyingFaceId ? (
                <span>Confirming...</span>
              ) : verificationSuccess ? (
                <span>Verified!</span>
              ) : (
                <>
                  <span>Continue with Apple</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
