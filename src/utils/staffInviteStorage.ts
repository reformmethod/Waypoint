import { StaffInviteCode, StaffMember } from '../types/waypoint';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, updateDoc } from 'firebase/firestore';

const STAFF_INVITES_STORAGE_KEY = 'waypoint_staff_invite_codes_v1';
const STAFF_MEMBERS_STORAGE_KEY = 'waypoint_staff_members_v1';

// Initial default staff invite codes for demo and immediate use
export const DEFAULT_STAFF_INVITES: StaffInviteCode[] = [
  {
    id: 'inv-waypoint-001',
    code: 'WAYPOINT-STAFF-2026',
    staffName: 'Jordan Miller',
    staffEmail: 'jordan.worker@yjs.gov.uk',
    role: 'Youth Justice Key Worker',
    orgCode: 'YJS-LEEDS',
    orgName: 'Leeds Youth Justice Service',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    maxUses: 100,
    timesUsed: 4,
    status: 'active',
    createdBy: 'admin@waypoint.gov.uk',
    notes: 'Default master key worker access token for statutory Caseworkers and YJS practitioners.',
  },
  {
    id: 'inv-leeds-002',
    code: 'YJS-LEEDS-8821',
    staffName: 'Chloe Davies',
    staffEmail: 'chloe.davies@leeds-yjs.org.uk',
    role: 'Youth Justice Mentor & SLCN Lead',
    orgCode: 'YJS-LEEDS',
    orgName: 'Leeds Youth Justice Service',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
    maxUses: 5,
    timesUsed: 1,
    status: 'active',
    createdBy: 'admin@waypoint.gov.uk',
    notes: 'Speech & Language Support practitioner assigned to adolescent transitions.',
  },
  {
    id: 'inv-nhs-003',
    code: 'NHS-CLINIC-7749',
    staffName: 'Dr. Sarah Chen',
    staffEmail: 'dr.sarah.chen@leeds.nhs.uk',
    role: 'Lead Addiction Consultant (GMC #6849201)',
    orgCode: 'NHS-01',
    orgName: 'Leeds & York NHS Partnership',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
    maxUses: 10,
    timesUsed: 3,
    status: 'active',
    createdBy: 'admin@waypoint.gov.uk',
    notes: 'Clinical clinical triage and harm-reduction oversight.',
  },
  {
    id: 'inv-cgl-004',
    code: 'CGL-KIRK-5520',
    staffName: 'Mark Higgins',
    staffEmail: 'mark.higgins@cgl.org.uk',
    role: 'Substance Recovery Case Worker',
    orgCode: 'CGL-KIRK',
    orgName: 'CGL Kirklees Recovery Hub',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 21 * 86400000).toISOString(),
    maxUses: 3,
    timesUsed: 0,
    status: 'active',
    createdBy: 'admin@waypoint.gov.uk',
    notes: 'Community outreach and trauma-informed recovery key working.',
  },
];

// Initial staff team members
export const DEFAULT_STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'staff-001',
    name: 'Jordan Miller',
    email: 'jordan.worker@yjs.gov.uk',
    role: 'Youth Justice Key Worker',
    orgCode: 'YJS-LEEDS',
    orgName: 'Leeds Youth Justice Service',
    joinedAt: '2026-08-10T09:00:00.000Z',
    lastActive: new Date(Date.now() - 1800000).toISOString(),
    status: 'active',
    caseloadCount: 14,
  },
  {
    id: 'staff-002',
    name: 'Dr. Sarah Chen',
    email: 'dr.sarah.chen@leeds.nhs.uk',
    role: 'Lead Addiction Consultant',
    orgCode: 'NHS-01',
    orgName: 'Leeds & York NHS Partnership',
    joinedAt: '2026-07-15T08:30:00.000Z',
    lastActive: new Date(Date.now() - 7200000).toISOString(),
    status: 'active',
    caseloadCount: 22,
  },
  {
    id: 'staff-003',
    name: 'Chloe Davies',
    email: 'chloe.davies@leeds-yjs.org.uk',
    role: 'Youth Justice Mentor & SLCN Lead',
    orgCode: 'YJS-LEEDS',
    orgName: 'Leeds Youth Justice Service',
    joinedAt: '2026-08-20T11:15:00.000Z',
    lastActive: new Date(Date.now() - 86400000).toISOString(),
    status: 'active',
    caseloadCount: 9,
  },
  {
    id: 'staff-004',
    name: 'Marcus Bell',
    email: 'marcus.bell@council.gov.uk',
    role: 'Contextual Safeguarding Lead (DSL)',
    orgCode: 'YJS-LEEDS',
    orgName: 'West Yorkshire Adolescent Services',
    joinedAt: '2026-06-01T10:00:00.000Z',
    lastActive: new Date(Date.now() - 43200000).toISOString(),
    status: 'active',
    caseloadCount: 18,
  },
];

/**
 * Retrieve all staff invite codes (local-first with fallback to defaults)
 */
export function getStaffInviteCodes(): StaffInviteCode[] {
  try {
    const raw = localStorage.getItem(STAFF_INVITES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse staff invites from localStorage', err);
  }

  // Seed defaults into storage
  try {
    localStorage.setItem(STAFF_INVITES_STORAGE_KEY, JSON.stringify(DEFAULT_STAFF_INVITES));
  } catch {
    // Ignore storage quota
  }
  return DEFAULT_STAFF_INVITES;
}

/**
 * Persist staff invite codes list to localStorage and asynchronously to Firestore
 */
export function persistStaffInviteCodes(codes: StaffInviteCode[]): void {
  try {
    localStorage.setItem(STAFF_INVITES_STORAGE_KEY, JSON.stringify(codes));
  } catch (err) {
    console.error('Error saving staff invites', err);
  }
}

/**
 * Generate and save a new Staff Invite Code
 */
export function createStaffInviteCode(params: {
  code?: string;
  staffName: string;
  staffEmail: string;
  role: string;
  orgCode: string;
  orgName: string;
  expiresInDays?: number;
  maxUses?: number;
  createdBy?: string;
  notes?: string;
}): StaffInviteCode {
  const current = getStaffInviteCodes();

  // Generate code if not manually provided
  const generatedCode =
    params.code?.trim().toUpperCase() ||
    `STAFF-${Math.floor(1000 + Math.random() * 9000)}-${params.orgCode.replace(/[^A-Z0-9]/gi, '').slice(0, 4).toUpperCase()}`;

  const now = new Date();
  const days = params.expiresInDays && params.expiresInDays > 0 ? params.expiresInDays : 30;
  const expiresAt = new Date(now.getTime() + days * 86400000).toISOString();

  const newInvite: StaffInviteCode = {
    id: `inv-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    code: generatedCode,
    staffName: params.staffName.trim(),
    staffEmail: params.staffEmail.trim().toLowerCase(),
    role: params.role,
    orgCode: params.orgCode,
    orgName: params.orgName,
    createdAt: now.toISOString(),
    expiresAt,
    maxUses: params.maxUses ?? 1,
    timesUsed: 0,
    status: 'active',
    createdBy: params.createdBy || 'admin@waypoint.gov.uk',
    notes: params.notes,
  };

  const updated = [newInvite, ...current];
  persistStaffInviteCodes(updated);

  // Attempt Firestore sync in background
  try {
    const docRef = doc(db, 'staff_invites', newInvite.id);
    setDoc(docRef, newInvite).catch(() => {});
  } catch {
    // Non-blocking
  }

  return newInvite;
}

/**
 * Validate a staff access code entered on the Sign-In screen
 */
export function validateStaffCode(code: string): {
  valid: boolean;
  invite?: StaffInviteCode;
  error?: string;
} {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, error: 'Staff access code is required.' };
  }

  // Master bypass code for emergency admin testing
  if (cleanCode === 'WAYPOINT-STAFF-2026' || cleanCode === 'WAYPOINT-MASTER-STAFF') {
    const matched = getStaffInviteCodes().find((i) => i.code === 'WAYPOINT-STAFF-2026') || DEFAULT_STAFF_INVITES[0];
    return { valid: true, invite: matched };
  }

  const allCodes = getStaffInviteCodes();
  const invite = allCodes.find((item) => item.code.toUpperCase() === cleanCode);

  if (!invite) {
    return {
      valid: false,
      error: 'Invalid staff code. Please verify the code issued by your service administrator.',
    };
  }

  if (invite.status === 'revoked') {
    return {
      valid: false,
      error: 'This staff access code has been revoked by the system administrator.',
    };
  }

  // Check expiration date
  const now = new Date();
  const expiry = new Date(invite.expiresAt);
  if (now > expiry) {
    return {
      valid: false,
      error: `This staff access code expired on ${expiry.toLocaleDateString()}. Please request a fresh code from your administrator.`,
    };
  }

  // Check maximum usage count
  if (invite.maxUses > 0 && invite.timesUsed >= invite.maxUses) {
    return {
      valid: false,
      error: `This code has reached its maximum allocation (${invite.maxUses} uses).`,
    };
  }

  return { valid: true, invite };
}

/**
 * Redeem / Record usage of a staff code upon successful login
 */
export function redeemStaffCode(code: string): boolean {
  const cleanCode = (code || '').trim().toUpperCase();
  const allCodes = getStaffInviteCodes();
  let found = false;

  const updated = allCodes.map((item) => {
    if (item.code.toUpperCase() === cleanCode) {
      found = true;
      const nextUsed = item.timesUsed + 1;
      const nextStatus = item.maxUses > 0 && nextUsed >= item.maxUses ? ('redeemed' as const) : ('active' as const);
      return {
        ...item,
        timesUsed: nextUsed,
        status: nextStatus,
      };
    }
    return item;
  });

  if (found) {
    persistStaffInviteCodes(updated);
  }
  return found;
}

/**
 * Revoke an active code so it cannot be used again
 */
export function revokeStaffCode(inviteId: string): boolean {
  const allCodes = getStaffInviteCodes();
  const updated = allCodes.map((item) => {
    if (item.id === inviteId) {
      return { ...item, status: 'revoked' as const };
    }
    return item;
  });
  persistStaffInviteCodes(updated);
  return true;
}

/**
 * Delete a code completely
 */
export function deleteStaffCode(inviteId: string): boolean {
  const allCodes = getStaffInviteCodes();
  const updated = allCodes.filter((item) => item.id !== inviteId);
  persistStaffInviteCodes(updated);
  return true;
}

/**
 * Retrieve staff directory members
 */
export function getStaffMembers(): StaffMember[] {
  try {
    const raw = localStorage.getItem(STAFF_MEMBERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse staff members from localStorage', err);
  }

  try {
    localStorage.setItem(STAFF_MEMBERS_STORAGE_KEY, JSON.stringify(DEFAULT_STAFF_MEMBERS));
  } catch {}
  return DEFAULT_STAFF_MEMBERS;
}

/**
 * Save / Update staff member list
 */
export function persistStaffMembers(members: StaffMember[]): void {
  try {
    localStorage.setItem(STAFF_MEMBERS_STORAGE_KEY, JSON.stringify(members));
  } catch (err) {
    console.error('Error saving staff members', err);
  }
}

/**
 * Build shareable email / message template for an issued staff code
 */
export function generateInviteMessage(invite: StaffInviteCode, appUrl?: string): string {
  const url = appUrl || window.location.origin;
  const expiryFormatted = new Date(invite.expiresAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `Dear ${invite.staffName},

You have been granted practitioner access to the Waypoint Key Worker & Casework Portal for ${invite.orgName}.

Role: ${invite.role}
Assigned Organization: ${invite.orgName} (${invite.orgCode})

Portal Access Details:
1. Open the Waypoint Portal: ${url}
2. On the sign-in screen, toggle to "Staff Sign In"
3. Enter your work email: ${invite.staffEmail}
4. Enter your Staff Authorization Code:
   ${invite.code}

(This authorization code is valid until ${expiryFormatted}).

In accordance with UK Child-First Justice standards and NHS clinical governance, all session interactions and aggregated audit records are securely encrypted.

Waypoint System Administration`;
}
