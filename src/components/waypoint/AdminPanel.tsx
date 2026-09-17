import React, { useState, useMemo } from 'react';
import { AuthUser, StaffInviteCode, StaffMember } from '../../types/waypoint';
import {
  getStaffInviteCodes,
  createStaffInviteCode,
  revokeStaffCode,
  deleteStaffCode,
  getStaffMembers,
  generateInviteMessage,
} from '../../utils/staffInviteStorage';
import { WaypointLogo } from './WaypointLogo';
import {
  ShieldCheck,
  KeyRound,
  UserPlus,
  Copy,
  Check,
  Mail,
  Send,
  Trash2,
  Ban,
  ArrowRight,
  LogOut,
  Users,
  Building2,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  Briefcase,
  Layers,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface AdminPanelProps {
  adminUser: AuthUser;
  onSignOut: () => void;
  onSwitchToStaff?: (staffUser?: AuthUser) => void;
  onSwitchToPersonal?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  adminUser,
  onSignOut,
  onSwitchToStaff,
  onSwitchToPersonal,
}) => {
  const [inviteCodes, setInviteCodes] = useState<StaffInviteCode[]>(() => getStaffInviteCodes());
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => getStaffMembers());

  // Form states for creating a new invite code
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState('Youth Justice Key Worker');
  const [orgCode, setOrgCode] = useState('YJS-LEEDS');
  const [orgName, setOrgName] = useState('Leeds Youth Justice Service');
  const [customCode, setCustomCode] = useState('');
  const [expiryDays, setExpiryDays] = useState(30);
  const [maxUses, setMaxUses] = useState(1);
  const [notes, setNotes] = useState('');

  // UI status states
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [recentlyCreatedInvite, setRecentlyCreatedInvite] = useState<StaffInviteCode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'redeemed' | 'revoked'>('all');
  const [activeTab, setActiveTab] = useState<'invites' | 'roster' | 'governance'>('invites');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const orgPresetMap: Record<string, string> = {
    'YJS-LEEDS': 'Leeds Youth Justice Service',
    'CGL-KIRK': 'CGL Kirklees Recovery Hub',
    'NHS-01': 'Leeds & York NHS Partnership Trust',
    'WY-YJS': 'West Yorkshire Adolescent Services',
    'OTHER': 'Independent Service Partner',
  };

  const showToast = (message: string) => {
    setNotificationToast(message);
    setTimeout(() => {
      setNotificationToast(null);
    }, 4000);
  };

  // Generate random readable code helper
  const handleGenerateRandomCode = () => {
    const prefix = 'STAFF';
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const suffix = orgCode === 'OTHER' ? 'SEC' : orgCode.replace(/[^A-Z0-9]/gi, '').slice(0, 4);
    setCustomCode(`${prefix}-${randDigits}-${suffix}`);
  };

  // Submit new invite code
  const handleCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim()) {
      showToast('Please provide both staff member name and work email.');
      return;
    }

    const created = createStaffInviteCode({
      code: customCode.trim() ? customCode.trim() : undefined,
      staffName: staffName.trim(),
      staffEmail: staffEmail.trim(),
      role: staffRole,
      orgCode,
      orgName,
      expiresInDays: expiryDays,
      maxUses,
      createdBy: adminUser.email,
      notes: notes.trim() || undefined,
    });

    setInviteCodes(getStaffInviteCodes());
    setRecentlyCreatedInvite(created);
    setStaffName('');
    setStaffEmail('');
    setCustomCode('');
    setNotes('');
    showToast(`Staff code ${created.code} successfully generated for ${created.staffName}.`);
  };

  // Copy code to clipboard
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    showToast(`Access code ${code} copied to clipboard.`);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  // Copy full message template to clipboard
  const handleCopyInviteMessage = (invite: StaffInviteCode) => {
    const message = generateInviteMessage(invite);
    navigator.clipboard.writeText(message);
    showToast(`Full invite message for ${invite.staffName} copied to clipboard.`);
  };

  // Simulate sending invite email
  const handleSendSimulatedEmail = (invite: StaffInviteCode) => {
    showToast(`Email invitation dispatched to ${invite.staffEmail}.`);
  };

  // Revoke code
  const handleRevoke = (id: string) => {
    revokeStaffCode(id);
    setInviteCodes(getStaffInviteCodes());
    showToast('Staff access code revoked.');
  };

  // Delete code
  const handleDelete = (id: string) => {
    deleteStaffCode(id);
    setInviteCodes(getStaffInviteCodes());
    showToast('Code deleted from records.');
  };

  // Test login directly as this staff member
  const handleTestLoginWithInvite = (invite: StaffInviteCode) => {
    if (onSwitchToStaff) {
      const staffUser: AuthUser = {
        id: `staff-${Date.now().toString(36)}`,
        email: invite.staffEmail,
        name: invite.staffName,
        role: 'Organization',
        orgCode: invite.orgCode,
        practitionerRole: `${invite.role} (${invite.orgName})`,
        lastLogin: new Date().toISOString(),
        staffInviteCodeUsed: invite.code,
      };
      onSwitchToStaff(staffUser);
    }
  };

  // Filtered invite codes
  const filteredInvites = useMemo(() => {
    return inviteCodes.filter((item) => {
      const matchesSearch =
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.staffEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.orgName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === 'all') return true;
      return item.status === statusFilter;
    });
  }, [inviteCodes, searchQuery, statusFilter]);

  // Aggregate stats
  const activeCount = inviteCodes.filter((i) => i.status === 'active').length;
  const totalUses = inviteCodes.reduce((sum, i) => sum + i.timesUsed, 0);

  return (
    <div
      id="waypoint-admin-panel"
      className="min-h-screen w-full bg-[#111823] text-slate-100 font-sans pb-16"
    >
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="w-full bg-[#0b1019] border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <WaypointLogo size="sm" />
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
              Admin Portal
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Service Governance &amp; Staff Provisioning
            </span>
          </div>
        </div>

        {/* Admin User Info & Role Switchers */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-white">{adminUser.name}</div>
            <div className="text-[10px] text-slate-400">{adminUser.email}</div>
          </div>

          {onSwitchToStaff && (
            <button
              type="button"
              onClick={() => onSwitchToStaff()}
              title="Preview Casework View"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Staff Casework</span>
            </button>
          )}

          {onSwitchToPersonal && (
            <button
              type="button"
              onClick={onSwitchToPersonal}
              title="Preview Young Person View"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Member View</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSignOut}
            className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* KPI Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#16202f] border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Active Staff Codes</span>
              <KeyRound className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">{activeCount}</div>
            <div className="text-[11px] text-slate-400">Available for staff onboarding</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#16202f] border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Authorized Staff</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-white">{staffMembers.length}</div>
            <div className="text-[11px] text-slate-400">YJS, NHS &amp; CGL practitioners</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#16202f] border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Portal Logins Recorded</span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{totalUses}</div>
            <div className="text-[11px] text-slate-400">Code redemptions to date</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#16202f] border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Safeguarding Governance</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Compliant
            </div>
            <div className="text-[11px] text-slate-400">DSL Sign-Off Enforced</div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('invites')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'invites'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Staff Access Codes &amp; Invitations</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
              {inviteCodes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'roster'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Authorized Staff Directory</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px]">
              {staffMembers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('governance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'governance'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Security &amp; Policy Settings</span>
          </button>
        </div>

        {/* TAB 1: INVITES & CODE ISSUANCE */}
        {activeTab === 'invites' && (
          <div className="space-y-6">
            {/* Top Grid: Form to Issue New Code + Success Card (if recently created) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Card */}
              <div className="lg:col-span-7 bg-[#16202f] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <UserPlus className="w-5 h-5 text-amber-400" />
                    <div>
                      <h2 className="text-base font-bold text-white">
                        Issue Special Staff Access Code
                      </h2>
                      <p className="text-xs text-slate-400">
                        Generate an invitation code for a Key Worker, YJS Mentor, or Clinician.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Statutory Multi-Agency
                  </span>
                </div>

                <form onSubmit={handleCreateInvite} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        Staff Member Full Name *
                      </label>
                      <input
                        type="text"
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                        placeholder="e.g. Jordan Miller"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e141f] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        Staff Work Email *
                      </label>
                      <input
                        type="email"
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        placeholder="e.g. jordan.worker@yjs.gov.uk"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e141f] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        Staff Role / Specialism
                      </label>
                      <select
                        value={staffRole}
                        onChange={(e) => setStaffRole(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e141f] border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                      >
                        <option value="Youth Justice Key Worker">Youth Justice Key Worker</option>
                        <option value="Youth Justice Mentor & SLCN Lead">Youth Justice Mentor &amp; SLCN Lead</option>
                        <option value="Substance Misuse Specialist">Substance Misuse Specialist</option>
                        <option value="Clinical Lead / Psychologist">Clinical Lead / Psychologist</option>
                        <option value="Contextual Safeguarding Officer (DSL)">Contextual Safeguarding Officer (DSL)</option>
                        <option value="Court Liaison Officer">Court Liaison Officer</option>
                        <option value="Adolescent Transition Lead">Adolescent Transition Lead</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        Assigned Organisation Hub
                      </label>
                      <select
                        value={orgCode}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOrgCode(val);
                          setOrgName(orgPresetMap[val] || 'Service Partner');
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e141f] border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                      >
                        <option value="YJS-LEEDS">Leeds Youth Justice Service (YJS-LEEDS)</option>
                        <option value="CGL-KIRK">CGL Kirklees Recovery Hub (CGL-KIRK)</option>
                        <option value="NHS-01">Leeds &amp; York NHS Trust (NHS-01)</option>
                        <option value="WY-YJS">West Yorkshire Adolescent Services (WY-YJS)</option>
                        <option value="OTHER">Independent Service Partner</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1 sm:col-span-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300">
                          Access Code
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateRandomCode}
                          className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Generate</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                        placeholder="e.g. STAFF-4910-YJS"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-400 transition-colors uppercase"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        Expiration
                      </label>
                      <select
                        value={expiryDays}
                        onChange={(e) => setExpiryDays(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                      >
                        <option value={7}>7 Days</option>
                        <option value={14}>14 Days</option>
                        <option value={30}>30 Days (Standard)</option>
                        <option value={60}>60 Days</option>
                        <option value={365}>1 Year</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        Max Usage Limit
                      </label>
                      <select
                        value={maxUses}
                        onChange={(e) => setMaxUses(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                      >
                        <option value={1}>1 Use (Single staff)</option>
                        <option value={3}>3 Uses</option>
                        <option value={5}>5 Uses (Small team)</option>
                        <option value={20}>20 Uses</option>
                        <option value={100}>100 Uses (Open Hub)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">
                      Internal Casework Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Granted for pilot case management in Harehills &amp; East Leeds"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-slate-300 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md mt-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Issue &amp; Save Staff Invite Code</span>
                  </button>
                </form>
              </div>

              {/* Right Col: Recently Issued Code Card or Quick Guidance */}
              <div className="lg:col-span-5 space-y-4">
                {recentlyCreatedInvite ? (
                  <div className="bg-[#16202f] border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Code Ready to Dispatch
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Expires {new Date(recentlyCreatedInvite.expiresAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white">
                        {recentlyCreatedInvite.staffName} ({recentlyCreatedInvite.role})
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {recentlyCreatedInvite.staffEmail}
                      </div>
                    </div>

                    {/* Prominent Code Box */}
                    <div className="p-4 rounded-2xl bg-[#0b1019] border border-amber-500/40 text-center space-y-2">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        Special Staff Access Code
                      </div>
                      <div className="text-2xl font-mono font-bold text-amber-300 tracking-wider select-all">
                        {recentlyCreatedInvite.code}
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyCode(recentlyCreatedInvite.code, recentlyCreatedInvite.id)
                          }
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          {copiedCodeId === recentlyCreatedInvite.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyInviteMessage(recentlyCreatedInvite)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Copy Message</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex flex-col gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSendSimulatedEmail(recentlyCreatedInvite)}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-sky-300 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Simulate Dispatch to {recentlyCreatedInvite.staffEmail}</span>
                      </button>

                      {onSwitchToStaff && (
                        <button
                          type="button"
                          onClick={() => handleTestLoginWithInvite(recentlyCreatedInvite)}
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 transition-colors"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>Test Sign-In as this Staff Member</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#16202f] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        How Staff Access Codes Work
                      </h3>
                    </div>
                    <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          1
                        </span>
                        <span>
                          <strong>Generate Code:</strong> Issue a custom or randomized token for a Key Worker, Case Officer, or Clinician.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          2
                        </span>
                        <span>
                          <strong>Dispatch to Staff:</strong> Share the code via secure NHS/Gov email or paste the generated template directly.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          3
                        </span>
                        <span>
                          <strong>Staff Sign-In:</strong> Staff toggle to the "Staff Sign In" tab on the login screen, entering their work email and this code.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          4
                        </span>
                        <span>
                          <strong>Audit Logged:</strong> Each redemption is tracked against statutory multi-agency governance and can be revoked at any time.
                        </span>
                      </li>
                    </ul>

                    {/* Pre-seeded quick test helper */}
                    <div className="p-3.5 rounded-2xl bg-[#0b1019] border border-slate-700 text-xs space-y-2">
                      <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pre-Configured Demo Staff Code</span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-amber-300 bg-[#16202f] px-3 py-1.5 rounded-lg border border-slate-800">
                        <span>WAYPOINT-STAFF-2026</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode('WAYPOINT-STAFF-2026', 'demo-default')}
                          className="text-slate-400 hover:text-white"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Assigned to Jordan Miller (Leeds Youth Justice Service). Test directly on the login screen!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Table: All Issued Staff Access Codes */}
            <div className="bg-[#16202f] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Issued Staff Access Codes Ledger</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Active, redeemed, and revoked access authorization tokens.
                  </p>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search code, name, org..."
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0b1019] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 w-48 sm:w-56"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-[#0b1019] p-1 rounded-xl border border-slate-700 text-xs">
                    {(['all', 'active', 'redeemed', 'revoked'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`px-2.5 py-1 rounded-lg capitalize text-xs font-semibold transition-colors ${
                          statusFilter === status
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="pb-3 pl-1">Access Code</th>
                      <th className="pb-3">Staff Member</th>
                      <th className="pb-3">Role &amp; Organisation</th>
                      <th className="pb-3">Expires</th>
                      <th className="pb-3">Uses</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right pr-1">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredInvites.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                          No staff invite codes match your filter.
                        </td>
                      </tr>
                    ) : (
                      filteredInvites.map((invite) => {
                        const isExpired = new Date() > new Date(invite.expiresAt);
                        const displayStatus =
                          invite.status === 'revoked'
                            ? 'revoked'
                            : isExpired
                            ? 'expired'
                            : invite.status;

                        return (
                          <tr key={invite.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3.5 pl-1 font-mono font-bold text-amber-300 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span>{invite.code}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(invite.code, invite.id)}
                                  title="Copy code"
                                  className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                >
                                  {copiedCodeId === invite.id ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </td>

                            <td className="py-3.5 whitespace-nowrap">
                              <div className="font-bold text-white">{invite.staffName}</div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {invite.staffEmail}
                              </div>
                            </td>

                            <td className="py-3.5 whitespace-nowrap">
                              <div className="text-slate-200 font-medium">{invite.role}</div>
                              <div className="text-[11px] text-slate-400">{invite.orgName}</div>
                            </td>

                            <td className="py-3.5 text-slate-300 whitespace-nowrap">
                              {new Date(invite.expiresAt).toLocaleDateString()}
                            </td>

                            <td className="py-3.5 text-slate-300 whitespace-nowrap">
                              <span className="font-bold text-white">{invite.timesUsed}</span>
                              <span className="text-slate-500">
                                /{invite.maxUses > 0 ? invite.maxUses : '∞'}
                              </span>
                            </td>

                            <td className="py-3.5 whitespace-nowrap">
                              {displayStatus === 'active' && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                                  Active
                                </span>
                              )}
                              {displayStatus === 'redeemed' && (
                                <span className="px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-bold">
                                  Redeemed
                                </span>
                              )}
                              {displayStatus === 'revoked' && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                                  Revoked
                                </span>
                              )}
                              {displayStatus === 'expired' && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                                  Expired
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 text-right pr-1 whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                {onSwitchToStaff && displayStatus === 'active' && (
                                  <button
                                    type="button"
                                    onClick={() => handleTestLoginWithInvite(invite)}
                                    title="Test login with this code"
                                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Test</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleCopyInviteMessage(invite)}
                                  title="Copy invite message"
                                  className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </button>

                                {invite.status === 'active' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRevoke(invite.id)}
                                    title="Revoke code"
                                    className="p-1.5 rounded hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(invite.id)}
                                    title="Delete code"
                                    className="p-1.5 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROSTER & STAFF DIRECTORY */}
        {activeTab === 'roster' && (
          <div className="bg-[#16202f] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>Authorized Staff Team Directory</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Practitioners currently registered with active statutory casework access.
                </p>
              </div>

              <span className="text-xs font-bold text-sky-400 bg-sky-950/40 px-3 py-1 rounded-full border border-sky-800/40">
                {staffMembers.length} Active Practitioners
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staffMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-2xl bg-[#0e141f] border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{member.name}</div>
                      <div className="text-xs text-sky-400 font-medium">{member.role}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {member.email}
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{member.orgName}</span>
                    </div>
                    <div>
                      Caseload: <strong className="text-white">{member.caseloadCount}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: GOVERNANCE & POLICY SETTINGS */}
        {activeTab === 'governance' && (
          <div className="bg-[#16202f] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Multi-Agency Information Governance &amp; Safeguarding Policy</span>
              </h3>
              <p className="text-xs text-slate-400">
                Statutory compliance with UK Working Together to Safeguard Children (2023) and NHS Caldicott Principles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="p-4 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Mandatory Staff Access Code Policy</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  All practitioner sign-ins require a verified multi-agency invite token issued by a registered Service Administrator. Open public registration for staff accounts is strictly disabled.
                </p>
                <div className="pt-2 flex items-center gap-2 text-emerald-400 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Policy Enforced &amp; Active</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Zero-PII Aggregated Telemetry Guarantee</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Young person habit entries, reflections, and clinical scales remain strictly local on personal client hardware. B2B cohort analytics only ingest de-identified bands.
                </p>
                <div className="pt-2 flex items-center gap-2 text-emerald-400 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Audit Compliant</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
