import { useState, useEffect } from 'react';
import {
  PhoneCall,
  MessageSquare,
  ShieldAlert,
  X,
  Heart,
  UserCheck,
  Edit2,
  Wind,
  CheckCircle,
} from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  const [activeTab, setActiveTab] = useState<'hotlines' | 'breathe' | 'grounding'>('hotlines');
  const [sponsorName, setSponsorName] = useState(() => {
    return localStorage.getItem('emergency_sponsor_name') || 'Sponsor / Trusted Peer';
  });
  const [sponsorPhone, setSponsorPhone] = useState(() => {
    return localStorage.getItem('emergency_sponsor_phone') || '';
  });
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [tempName, setTempName] = useState(sponsorName);
  const [tempPhone, setTempPhone] = useState(sponsorPhone);

  // Breathing state
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreathingActive && activeTab === 'breathe') {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            if (breathPhase === 'Inhale') {
              setBreathPhase('Hold');
              return 7;
            } else if (breathPhase === 'Hold') {
              setBreathPhase('Exhale');
              return 8;
            } else {
              setBreathPhase('Inhale');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, breathPhase, activeTab]);

  const saveContact = () => {
    setSponsorName(tempName || 'Sponsor / Trusted Peer');
    setSponsorPhone(tempPhone);
    localStorage.setItem('emergency_sponsor_name', tempName || 'Sponsor / Trusted Peer');
    localStorage.setItem('emergency_sponsor_phone', tempPhone);
    setIsEditingContact(false);
  };

  if (!isOpen) return null;

  return (
    <div
      id="emergency-support-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div
        id="emergency-modal-card"
        className="relative w-full max-w-lg bg-[#0e0e12] border border-red-500/40 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.25)] text-gray-200 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950/60 via-[#181014] to-[#0e0e12] p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 font-display">
                Emergency Support
              </h2>
              <p className="text-xs text-red-200/80">You are not alone. Safe, immediate help is available.</p>
            </div>
          </div>
          <button
            id="close-emergency-modal-btn"
            onClick={onClose}
            aria-label="Close emergency support modal"
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 bg-[#08080a] p-1 border-b border-white/5 text-xs font-medium text-zinc-400">
          <button
            id="tab-hotlines"
            onClick={() => setActiveTab('hotlines')}
            className={`py-2 px-1 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'hotlines'
                ? 'bg-red-500/20 text-red-200 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                : 'hover:text-zinc-200'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Crisis Lines</span>
          </button>
          <button
            id="tab-breathe"
            onClick={() => {
              setActiveTab('breathe');
              setIsBreathingActive(true);
            }}
            className={`py-2 px-1 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'breathe'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'hover:text-zinc-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>4-7-8 Breathe</span>
          </button>
          <button
            id="tab-grounding"
            onClick={() => setActiveTab('grounding')}
            className={`py-2 px-1 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'grounding'
                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'hover:text-zinc-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>5-4-3-2-1 Ground</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-sm">
          {activeTab === 'hotlines' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              {/* Reminder Banner */}
              <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-xs text-red-200/90 leading-relaxed shadow-sm">
                <span className="font-semibold text-red-300">Urge Surfing Principle:</span> Cravings & emotional panics peak like ocean waves within 15–20 minutes and always subside. Connect right now.
              </div>

              {/* Personal Sponsor / Trusted Contact */}
              <div className="bg-[#131318] border border-white/10 rounded-xl p-3.5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-zinc-200 text-xs tracking-wide uppercase">
                      My Accountability Partner / Sponsor
                    </span>
                  </div>
                  {!isEditingContact && (
                    <button
                      id="edit-sponsor-btn"
                      onClick={() => setIsEditingContact(true)}
                      className="text-xs text-zinc-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {isEditingContact ? (
                  <div className="space-y-2.5 pt-1">
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Contact Name</label>
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        placeholder="e.g. Mike (Sponsor) or Sarah"
                        className="w-full bg-[#08080a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={tempPhone}
                        onChange={(e) => setTempPhone(e.target.value)}
                        placeholder="e.g. 555-123-4567"
                        className="w-full bg-[#08080a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setIsEditingContact(false)}
                        className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveContact}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md text-xs font-medium shadow-sm"
                      >
                        Save Contact
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-base font-medium text-white mb-2">{sponsorName}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        id="call-sponsor-link"
                        href={sponsorPhone ? `tel:${sponsorPhone}` : '#'}
                        onClick={(e) => {
                          if (!sponsorPhone) {
                            e.preventDefault();
                            setIsEditingContact(true);
                          }
                        }}
                        className="flex items-center justify-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded-lg font-medium text-xs transition-colors shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{sponsorPhone ? 'Call Sponsor' : 'Set Phone'}</span>
                      </a>
                      <a
                        id="text-sponsor-link"
                        href={sponsorPhone ? `sms:${sponsorPhone}?body=Hey%2C%20I%20am%20feeling%20triggered%20and%20need%20a%20quick%20check-in.` : '#'}
                        onClick={(e) => {
                          if (!sponsorPhone) {
                            e.preventDefault();
                            setIsEditingContact(true);
                          }
                        }}
                        className="flex items-center justify-center gap-1.5 bg-[#1c1c24] hover:bg-[#242430] border border-white/10 text-zinc-200 px-3 py-2 rounded-lg font-medium text-xs transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send SOS Text</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* 988 Suicide & Crisis Lifeline */}
              <div className="bg-[#131318] border border-white/10 rounded-xl p-3.5 flex flex-col gap-2 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-white text-sm">988 Suicide & Crisis Lifeline</div>
                    <div className="text-xs text-zinc-400">Free, confidential, available 24/7 (Call or Text)</div>
                  </div>
                  <span className="px-2 py-0.5 bg-red-950/60 text-red-300 border border-red-500/30 text-[10px] font-semibold rounded-full">
                    24/7 FREE
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <a
                    id="call-988-btn"
                    href="tel:988"
                    className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-semibold text-xs transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call 988</span>
                  </a>
                  <a
                    id="text-988-btn"
                    href="sms:988"
                    className="flex items-center justify-center gap-1.5 bg-[#1c1c24] hover:bg-[#242430] border border-white/10 text-zinc-200 px-3 py-2 rounded-lg font-medium text-xs transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Text 988</span>
                  </a>
                </div>
              </div>

              {/* SAMHSA National Helpline */}
              <div className="bg-[#131318] border border-white/10 rounded-xl p-3.5 flex flex-col gap-2 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-white text-sm">SAMHSA Substance Helpline</div>
                    <div className="text-xs text-zinc-400">Substance abuse & mental health treatment referral</div>
                  </div>
                </div>
                <a
                  id="call-samhsa-btn"
                  href="tel:1-800-662-4357"
                  className="flex items-center justify-center gap-2 bg-[#1c1c24] hover:bg-[#242430] border border-white/10 text-zinc-200 px-3 py-2 rounded-lg font-semibold text-xs transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Call 1-800-662-4357 (HELP)</span>
                </a>
              </div>

              {/* Crisis Text Line */}
              <div className="bg-[#131318] border border-white/10 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
                <div>
                  <div className="font-semibold text-white text-sm">Crisis Text Line</div>
                  <div className="text-xs text-zinc-400">Text HOME to 741741 to connect with a crisis counselor</div>
                </div>
                <a
                  id="text-crisis-line-btn"
                  href="sms:741741?body=HOME"
                  className="bg-[#1c1c24] hover:bg-[#242430] border border-white/10 text-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors"
                >
                  Text HOME
                </a>
              </div>
            </div>
          )}

          {activeTab === 'breathe' && (
            <div className="flex flex-col items-center justify-center py-4 space-y-5 text-center animate-in fade-in duration-150">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white font-display">4-7-8 Parasympathetic Reset</h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Scientifically proven to lower heart rate and calm acute cravings or panic spikes.
                </p>
              </div>

              {/* Animated breathing circle */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                    breathPhase === 'Inhale'
                      ? 'scale-105 bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)]'
                      : breathPhase === 'Hold'
                      ? 'scale-100 bg-amber-500/20 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                      : 'scale-90 bg-indigo-500/20 border-2 border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.3)]'
                  }`}
                />
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white tracking-tight font-display">{breathTimer}</span>
                  <span
                    className={`text-sm font-semibold tracking-wide uppercase mt-1 ${
                      breathPhase === 'Inhale'
                        ? 'text-cyan-300'
                        : breathPhase === 'Hold'
                        ? 'text-amber-300'
                        : 'text-indigo-300'
                    }`}
                  >
                    {breathPhase}
                  </span>
                  <span className="text-[11px] text-zinc-400 mt-1">
                    {breathPhase === 'Inhale'
                      ? 'Deep into belly'
                      : breathPhase === 'Hold'
                      ? 'Gently pause'
                      : 'Slow through mouth'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  id="toggle-breathing-btn"
                  onClick={() => setIsBreathingActive(!isBreathingActive)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-colors"
                >
                  {isBreathingActive ? 'Pause Exercise' : 'Resume Exercise'}
                </button>
                <button
                  id="reset-breathing-btn"
                  onClick={() => {
                    setBreathPhase('Inhale');
                    setBreathTimer(4);
                  }}
                  className="px-3 py-2 bg-[#181820] hover:bg-[#22222c] border border-white/10 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Restart
                </button>
              </div>
            </div>
          )}

          {activeTab === 'grounding' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="text-xs text-zinc-300 leading-relaxed bg-[#131318] p-3 rounded-xl border border-white/10">
                Grounding pulls your brain out of fight-or-flight and reconnects you to the physical room. Notice these right now:
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-[#131318] rounded-lg border border-white/10 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-xs shadow-sm">
                    5
                  </span>
                  <div>
                    <strong className="text-zinc-200">5 Things You Can See:</strong>
                    <p className="text-zinc-400 mt-0.5">Look for subtle details: a speck on the table, shadows on the wall, textures.</p>
                  </div>
                </div>

                <div className="p-2.5 bg-[#131318] rounded-lg border border-white/10 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-xs shadow-sm">
                    4
                  </span>
                  <div>
                    <strong className="text-zinc-200">4 Things You Can Physically Feel:</strong>
                    <p className="text-zinc-400 mt-0.5">Your feet flat on the floor, the fabric of your shirt, the cool phone in your palm.</p>
                  </div>
                </div>

                <div className="p-2.5 bg-[#131318] rounded-lg border border-white/10 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-xs shadow-sm">
                    3
                  </span>
                  <div>
                    <strong className="text-zinc-200">3 Things You Can Hear:</strong>
                    <p className="text-zinc-400 mt-0.5">Distant traffic, hum of an appliance, your own steady breath.</p>
                  </div>
                </div>

                <div className="p-2.5 bg-[#131318] rounded-lg border border-white/10 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0 text-xs shadow-sm">
                    2
                  </span>
                  <div>
                    <strong className="text-zinc-200">2 Things You Can Smell:</strong>
                    <p className="text-zinc-400 mt-0.5">Fresh air, soap, coffee, or simply the scent of your clean hands.</p>
                  </div>
                </div>

                <div className="p-2.5 bg-[#131318] rounded-lg border border-white/10 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center shrink-0 text-xs shadow-sm">
                    1
                  </span>
                  <div>
                    <strong className="text-zinc-200">1 Thing You Can Taste:</strong>
                    <p className="text-zinc-400 mt-0.5">Take a sip of cold water, chew mint gum, or recognize your mouth's state.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#08080a] border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>This intense moment will pass. Keep breathing.</span>
          </div>
          <button
            id="emergency-close-bottom-btn"
            onClick={onClose}
            className="px-3 py-1 bg-[#1c1c24] hover:bg-[#242430] border border-white/10 text-zinc-200 rounded-md text-xs font-medium transition-colors"
          >
            I Feel Safer Now
          </button>
        </div>
      </div>
    </div>
  );
}
