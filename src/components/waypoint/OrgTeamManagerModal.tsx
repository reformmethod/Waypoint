import React, { useState, useMemo } from 'react';
import { StaffInviteCode, StaffMember, AuthUser } from '../../types/waypoint';
import {
  getStaffInviteCodes,
  getStaffMembers,
  createStaffInviteCode,
  persistStaffMembers,
  revokeStaffCode,
  generateInviteMessage,
} from '../../utils/staffInviteStorage';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Key,
  Copy,
  CheckCircle2,
  X,
  AlertCircle,
  Building,
  Mail,
  Clock,
  Sparkles,
  ChevronRight,
  Trash2,
} from 'lucide-react';

interface OrgTeamManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AuthUser;
  currentOrgCode?: string;
}

export const OrgTeamManagerModal: React.FC<OrgTeamManagerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentOrgCode = 'YJS-LEEDS',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'invites' | 'create'>('members');
  const [members, setMembers] = useState<StaffMember[]>(() => getStaffMembers());
  const [invites, setInvites] = useState<StaffInviteCode[]>(() => getStaffInviteCodes());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for creating new staff invite
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState('Youth Justice Key Worker');
  const [staffNotes, setStaffNotes] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [createdInvite, setCreatedInvite] = useState<StaffInviteCode | null>(null);

  const orgCode = currentUser?.orgCode || currentOrgCode;
  const orgName =
    orgCode === 'YJS-LEEDS'
      ? 'Leeds Youth Justice Service'
      : orgCode === 'CGL-KIRK'
      ? 'CGL Kirklees Recovery Hub'
      : orgCode === 'NHS-01'
      ? 'Leeds & York NHS Partnership'
      : `${orgCode} Regional Service`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter members and invites for THIS organization only (strict organization scoping)
  const orgMembers = useMemo(() => {
    return members.filter((m) => m.orgCode === orgCode || orgCode === 'ALL');
  }, [members, orgCode]);

  const orgInvites = useMemo(() => {
    return invites.filter((i) => i.orgCode === orgCode || orgCode === 'ALL');
  }, [invites, orgCode]);

  if (!isOpen) return null;

  const handleCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim()) {
      showToast('Staff name and work email are required.');
      return;
    }

    const newInvite = createStaffInviteCode({
      code: customCode.trim() ? customCode.trim().toUpperCase() : undefined,
      staffName: staffName.trim(),
      staffEmail: staffEmail.trim().toLowerCase(),
      role: staffRole,
      orgCode,
      orgName,
      expiresInDays: 30,
      maxUses: 1,
      createdBy: currentUser?.email || 'lead.worker@yjs.gov.uk',
      notes: staffNotes.trim() || `Authorized by lead practitioner ${currentUser?.name || 'Lead Worker'}`,
    });

    // Also register member into directory
    const newMember: StaffMember = {
      id: `staff-${Date.now().toString(36)}`,
      name: staffName.trim(),
      email: staffEmail.trim().toLowerCase(),
      role: staffRole,
      orgCode,
      orgName,
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'active',
      caseloadCount: 0,
    };

    const updatedMembers = [newMember, ...members];
    persistStaffMembers(updatedMembers);
    setMembers(updatedMembers);
    setInvites(getStaffInviteCodes());
    setCreatedInvite(newInvite);
    showToast(`Staff access code generated for ${newInvite.staffName}.`);

    // Reset form
    setStaffName('');
    setStaffEmail('');
    setCustomCode('');
    setStaffNotes('');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Access code ${code} copied to clipboard.`);
  };

  const handleCopyEmailTemplate = (invite: StaffInviteCode) => {
    const text = generateInviteMessage(invite);
    navigator.clipboard.writeText(text);
    showToast(`Invitation email template for ${invite.staffName} copied!`);
  };

  const handleRevoke = (inviteId: string) => {
    revokeStaffCode(inviteId);
    setInvites(getStaffInviteCodes());
    showToast('Staff access code revoked.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-[#131b26] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn text-slate-100 font-sans">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#16202f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Organization Staff &amp; Team Management
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800">
                  {orgCode}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Lead Authority: {orgName} • Authorized to enroll practitioners &amp; issue 2FA access codes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 pb-2 border-b border-slate-800 bg-[#0e141f]">
          <button
            type="button"
            onClick={() => setActiveSubTab('members')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'members'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Practitioners ({orgMembers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('invites')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'invites'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Authorization Codes ({orgInvites.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('create');
              setCreatedInvite(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'create'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-sky-400 hover:text-sky-300'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Staff Member</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: MEMBERS */}
          {activeSubTab === 'members' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Practitioners with statutory case access for {orgName}</span>
                <span>Role &amp; Caseload</span>
              </div>

              <div className="space-y-2">
                {orgMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-2xl bg-[#0e141f] border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-2">
                          <span>{member.name}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </div>
                        <div className="text-[11px] text-slate-400">{member.email}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold text-sky-300">{member.role}</div>
                      <div className="text-[10px] text-slate-400">
                        {member.caseloadCount} Active Clients • Joined {new Date(member.joinedAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: INVITE CODES */}
          {activeSubTab === 'invites' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Active access tokens issued to staff for logging into {orgName}.
              </div>

              <div className="space-y-2.5">
                {orgInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="p-3.5 rounded-2xl bg-[#0e141f] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                          {invite.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            invite.status === 'active'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {invite.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1">
                        Issued for: <strong>{invite.staffName}</strong> ({invite.staffEmail})
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Role: {invite.role} • Expires {new Date(invite.expiresAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(invite.code)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                        title="Copy Access Code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Code</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyEmailTemplate(invite)}
                        className="px-2.5 py-2 rounded-xl bg-sky-950 hover:bg-sky-900 text-sky-200 text-[11px] font-semibold flex items-center gap-1 border border-sky-800/60"
                        title="Copy Full Invite Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email Invite</span>
                      </button>

                      {invite.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => handleRevoke(invite.id)}
                          className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs"
                          title="Revoke Code"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CREATE STAFF INVITE FORM */}
          {activeSubTab === 'create' && (
            <div className="space-y-4">
              {createdInvite ? (
                <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-800 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Staff Member Successfully Added &amp; Code Issued!</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0e141f] border border-slate-700 space-y-1">
                    <div className="text-[11px] text-slate-400">Staff Authorization Code:</div>
                    <div className="font-mono text-base font-bold text-sky-300 flex items-center justify-between">
                      <span>{createdInvite.code}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(createdInvite.code)}
                        className="text-xs text-sky-400 hover:text-white flex items-center gap-1 font-sans"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </button>
                    </div>
                    <div className="text-xs text-slate-300 pt-1">
                      Assigned to: {createdInvite.staffName} ({createdInvite.staffEmail}) • {createdInvite.role}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleCopyEmailTemplate(createdInvite)}
                      className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Copy Full Invitation Email</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreatedInvite(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                    >
                      Add Another
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateInvite} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Staff Member Full Name *</label>
                      <input
                        type="text"
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                        placeholder="e.g. Liam Fitzpatrick"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Official Work Email *</label>
                      <input
                        type="email"
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        placeholder="liam.fitzpatrick@leeds-yjs.gov.uk"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Practitioner Role</label>
                      <select
                        value={staffRole}
                        onChange={(e) => setStaffRole(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                      >
                        <option value="Youth Justice Key Worker">Youth Justice Key Worker</option>
                        <option value="Substance Recovery Case Worker">Substance Recovery Case Worker</option>
                        <option value="Contextual Safeguarding Specialist">Contextual Safeguarding Specialist</option>
                        <option value="Speech & Language Mentor (SLCN)">Speech &amp; Language Mentor (SLCN)</option>
                        <option value="Clinical Addiction Consultant">Clinical Addiction Consultant</option>
                        <option value="Restorative Justice Coordinator">Restorative Justice Coordinator</option>
                        <option value="Peer Support Worker">Peer Support Worker</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Custom Code (Optional)</label>
                      <input
                        type="text"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                        placeholder={`Auto: STAFF-XXXX-${orgCode.slice(0, 4)}`}
                        className="w-full px-3 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Internal Notes / Authorization Scope</label>
                    <input
                      type="text"
                      value={staffNotes}
                      onChange={(e) => setStaffNotes(e.target.value)}
                      placeholder="e.g. East Leeds transition caseload oversight"
                      className="w-full px-3 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-800/40 text-[11px] text-sky-300 leading-relaxed">
                    <strong>Organization Lock:</strong> This authorization code will be cryptographically scoped exclusively to <strong>{orgName} ({orgCode})</strong>. Staff members will be required to complete mandatory 2-Factor Authentication (2FA) upon entry.
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Issue Authorization Code &amp; Enroll Colleague</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
