import React, { useState, useMemo } from 'react';
import {
  CaseworkClient,
  ClientCaseNote,
  RiskLevel,
  AuthUser,
  StaffIntervention,
} from '../../types/waypoint';
import {
  getCaseworkClients,
  addCaseNote,
  updateClientSafeguarding,
  createCaseworkClient,
  addClientIntervention,
  updateClientInterventionStatus,
} from '../../utils/clientNotesStorage';
import {
  formulateClinicalNote,
  analyzeSafeguardingRisk,
  draftCourtReport,
} from '../../utils/aiService';
import { OrgTeamManagerModal } from './OrgTeamManagerModal';
import {
  ShieldAlert,
  FileText,
  UserCheck,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  Send,
  Copy,
  ChevronRight,
  Sparkles,
  Phone,
  User,
  Building,
  Flag,
  Lock,
  Download,
  Search,
  Filter,
  Eye,
  Briefcase,
  AlertCircle,
  Tag,
  Scale,
  Users,
  Bot,
  Wand2,
  RefreshCw,
  FileCheck,
  Activity,
  Target,
  Battery,
  Flame,
  CheckSquare,
  Zap,
  Check,
  BarChart3,
  MessageSquare,
} from 'lucide-react';

interface StaffCaseworkManagerProps {
  currentUser?: AuthUser;
  currentOrgCode?: string;
  onSelectClientForPrep?: (client: CaseworkClient) => void;
}

export const StaffCaseworkManager: React.FC<StaffCaseworkManagerProps> = ({
  currentUser,
  currentOrgCode,
  onSelectClientForPrep,
}) => {
  const [clients, setClients] = useState<CaseworkClient[]>(() => getCaseworkClients());
  const [selectedClientId, setSelectedClientId] = useState<string>(() => clients[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'notes' | 'safeguarding' | 'statistics' | 'interventions'>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high_critical' | 'flagged'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Note Form States
  const [noteContactType, setNoteContactType] = useState<ClientCaseNote['contactType']>('1:1 Casework Session');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isSafeguardingFlag, setIsSafeguardingFlag] = useState(false);
  const [safeguardingCategory, setSafeguardingCategory] = useState<NonNullable<ClientCaseNote['safeguardingCategory']>>('Contextual / Peer Exploitation (CCE)');
  const [noteActionInput, setNoteActionInput] = useState('');
  const [actionItemsList, setActionItemsList] = useState<string[]>([]);
  const [shareWithClient, setShareWithClient] = useState(true);

  // New Client Modal
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientAge, setNewClientAge] = useState(16);
  const [newClientGender, setNewClientGender] = useState('Male');
  const [newClientStatus, setNewClientStatus] = useState<CaseworkClient['statutoryStatus']>('Youth Rehabilitation Order (YRO)');
  const [newClientRisk, setNewClientRisk] = useState<RiskLevel>('medium');
  const [newClientSummary, setNewClientSummary] = useState('');

  // Safeguarding editing state
  const [editingSafeguarding, setEditingSafeguarding] = useState(false);
  const [newAlertInput, setNewAlertInput] = useState('');
  const [newMitigationInput, setNewMitigationInput] = useState('');

  // Staff Interventions Dispatch State
  const [isNewInterventionModalOpen, setIsNewInterventionModalOpen] = useState(false);
  const [intvTitle, setIntvTitle] = useState('');
  const [intvCategory, setIntvCategory] = useState<StaffIntervention['category']>('anchor');
  const [intvDescription, setIntvDescription] = useState('');
  const [intvActionSteps, setIntvActionSteps] = useState<string[]>([]);
  const [intvActionInput, setIntvActionInput] = useState('');
  const [intvDueDays, setIntvDueDays] = useState<number>(7);
  const [intvFilter, setIntvFilter] = useState<'all' | 'active' | 'completed'>('all');

  // AI Formulation States
  const [isFormulatingAI, setIsFormulatingAI] = useState(false);
  const [previousNoteContent, setPreviousNoteContent] = useState<string | null>(null);

  // AI Safeguarding Risk Synthesis States
  const [isAnalyzingRiskAI, setIsAnalyzingRiskAI] = useState(false);
  const [safeguardingAISynthesis, setSafeguardingAISynthesis] = useState<{
    synthesis: string;
    suggestedMitigations?: string[];
    riskScoreSummary?: string;
  } | null>(null);

  // AI Court Report Modal States
  const [isCourtReportModalOpen, setIsCourtReportModalOpen] = useState(false);
  const [isDraftingCourtReportAI, setIsDraftingCourtReportAI] = useState(false);
  const [courtReportText, setCourtReportText] = useState('');
  const [courtReportOfficerRecommendation, setCourtReportOfficerRecommendation] = useState<
    'revoke_order' | 'continue_order' | 'vary_requirements' | 'discharge_early'
  >('continue_order');

  // Org Team Manager Modal State
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || clients[0];
  }, [clients, selectedClientId]);

  // AI Clinical Formulation Handler
  const handleAIClinicalFormulate = async () => {
    if (!selectedClient) return;
    if (!noteContent.trim() && !noteTitle.trim()) {
      showToast('Please enter some brief session bullets or title for AI formulation.');
      return;
    }
    setIsFormulatingAI(true);
    setPreviousNoteContent(noteContent);
    try {
      const formulatedText = await formulateClinicalNote({
        clientName: selectedClient.name,
        age: selectedClient.age,
        contactType: noteContactType,
        rawNotes:
          noteContent.trim() ||
          'Client attended 1:1 key worker session. Discussed daily anchors, sleep routine, and local peer group interactions.',
        sessionTitle: noteTitle.trim() || `${noteContactType} Review`,
        statutoryOrder: selectedClient.statutoryStatus,
        workerRole: currentUser?.practitionerRole || 'Youth Justice Key Worker',
      });

      if (formulatedText) {
        setNoteContent(formulatedText);
        showToast('✨ Child-First statutory formulation completed by Gemini.');
      }
    } catch (err) {
      console.error('AI Formulation Error:', err);
      showToast('AI formulation encountered an issue.');
    } finally {
      setIsFormulatingAI(false);
    }
  };

  // AI Safeguarding Risk Synthesis Handler
  const handleAISafeguardingSynthesis = async () => {
    if (!selectedClient) return;
    setIsAnalyzingRiskAI(true);
    try {
      const analysisText = await analyzeSafeguardingRisk({
        clientName: selectedClient.name,
        age: selectedClient.age,
        notesHistory: selectedClient.notes,
        currentRiskLevels: {
          riskToSelf: selectedClient.safeguarding.riskToSelf,
          riskToOthers: selectedClient.safeguarding.riskToOthers,
          riskFromOthers: selectedClient.safeguarding.riskFromOthers,
        },
      });

      setSafeguardingAISynthesis({
        synthesis: analysisText,
        suggestedMitigations: [
          'Review travel safety arrangements with Kinship Carer before next contact',
          'Coordinate with local ETE provider to monitor attendance stability',
          'Reinforce daily evening anchor routine to safeguard curfew adherence',
        ],
        riskScoreSummary: selectedClient.overallRiskLevel.toUpperCase(),
      });
      showToast('🛡️ Multi-Agency Safeguarding risk synthesis generated.');
    } catch (err) {
      console.error('AI Safeguarding Synthesis Error:', err);
      showToast('Safeguarding synthesis encountered an issue.');
    } finally {
      setIsAnalyzingRiskAI(false);
    }
  };

  // AI Court Report Generator Handler
  const handleGenerateCourtReport = async () => {
    if (!selectedClient) return;
    setIsDraftingCourtReportAI(true);
    try {
      const reportText = await draftCourtReport({
        client: selectedClient,
        reparationHours: '18 / 24 hours completed',
        recentNotes: selectedClient.notes,
        officerRecommendation: courtReportOfficerRecommendation,
      });

      setCourtReportText(reportText);
      showToast('⚖️ Official Court Progress Review drafted.');
    } catch (err) {
      console.error('AI Court Report Error:', err);
      showToast('Court report drafting encountered an issue.');
    } finally {
      setIsDraftingCourtReportAI(false);
    }
  };

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.urn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.statutoryStatus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.orgName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (riskFilter === 'high_critical') {
        return c.overallRiskLevel === 'high' || c.overallRiskLevel === 'critical';
      }
      if (riskFilter === 'flagged') {
        return c.safeguarding.activeAlerts.length > 0 || c.notes.some((n) => n.safeguardingFlag);
      }
      return true;
    });
  }, [clients, searchQuery, riskFilter]);

  // Handle Add Action Item to new note form
  const handleAddActionItem = () => {
    if (noteActionInput.trim()) {
      setActionItemsList([...actionItemsList, noteActionInput.trim()]);
      setNoteActionInput('');
    }
  };

  // Submit Casework Note
  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    if (!noteTitle.trim() || !noteContent.trim()) {
      showToast('Please enter both note title and session summary.');
      return;
    }

    const workerName = currentUser?.name || selectedClient.assignedWorker || 'Jordan Miller';
    const workerRole = currentUser?.practitionerRole || 'Youth Justice Key Worker';

    addCaseNote(selectedClient.id, {
      clientId: selectedClient.id,
      workerName,
      workerRole,
      contactType: noteContactType,
      title: noteTitle.trim(),
      content: noteContent.trim(),
      safeguardingFlag: isSafeguardingFlag,
      safeguardingCategory: isSafeguardingFlag ? safeguardingCategory : undefined,
      actionItems: actionItemsList,
      sharedWithClient: shareWithClient,
    });

    // Refresh client state
    setClients(getCaseworkClients());
    setNoteTitle('');
    setNoteContent('');
    setIsSafeguardingFlag(false);
    setActionItemsList([]);
    showToast(`Casework note recorded for ${selectedClient.name}.`);
  };

  // Add Safeguarding Alert to selected client
  const handleAddAlert = () => {
    if (!newAlertInput.trim() || !selectedClient) return;
    const updatedAlerts = [newAlertInput.trim(), ...selectedClient.safeguarding.activeAlerts];
    updateClientSafeguarding(selectedClient.id, {
      ...selectedClient.safeguarding,
      activeAlerts: updatedAlerts,
    });
    setClients(getCaseworkClients());
    setNewAlertInput('');
    showToast('Safeguarding alert logged.');
  };

  // Add Safety Mitigation
  const handleAddMitigation = () => {
    if (!newMitigationInput.trim() || !selectedClient) return;
    const updated = [...selectedClient.safeguarding.safetyMitigations, newMitigationInput.trim()];
    updateClientSafeguarding(selectedClient.id, {
      ...selectedClient.safeguarding,
      safetyMitigations: updated,
    });
    setClients(getCaseworkClients());
    setNewMitigationInput('');
    showToast('Safety mitigation logged.');
  };

  // Toggle DSL notification
  const handleToggleDSL = () => {
    if (!selectedClient) return;
    const newStatus = !selectedClient.safeguarding.dslNotified;
    updateClientSafeguarding(selectedClient.id, {
      ...selectedClient.safeguarding,
      dslNotified: newStatus,
      dslNotes: newStatus
        ? `Notified Designated Safeguarding Lead (Sarah Jenkins) on ${new Date().toLocaleDateString()}`
        : selectedClient.safeguarding.dslNotes,
    });
    setClients(getCaseworkClients());
    showToast(newStatus ? 'DSL notification logged.' : 'DSL notification cleared.');
  };

  // Update Risk Levels
  const handleUpdateRisk = (dimension: 'riskToSelf' | 'riskToOthers' | 'riskFromOthers', level: RiskLevel) => {
    if (!selectedClient) return;
    updateClientSafeguarding(selectedClient.id, {
      ...selectedClient.safeguarding,
      [dimension]: level,
    });
    setClients(getCaseworkClients());
    showToast(`Updated ${dimension} to ${level.toUpperCase()}`);
  };

  // Export Briefing / Multi-Agency Handover
  const handleExportBriefing = () => {
    if (!selectedClient) return;
    const briefing = `
=====================================================
WAYPOINT MULTI-AGENCY SAFEGUARDING & CASEWORK BRIEF
=====================================================
Client: ${selectedClient.name} (${selectedClient.preferredName ? `Preferred: ${selectedClient.preferredName}` : ''})
URN: ${selectedClient.urn} | Age: ${selectedClient.age} | Statutory Order: ${selectedClient.statutoryStatus}
Assigned Worker: ${selectedClient.assignedWorker} (${selectedClient.orgName})
Date Exported: ${new Date().toLocaleString()}

1. PRIMARY RISK SUMMARY:
${selectedClient.primaryRiskSummary}

2. SAFEGUARDING RISK STRATIFICATION:
- Risk to Self: ${selectedClient.safeguarding.riskToSelf.toUpperCase()}
- Risk to Others: ${selectedClient.safeguarding.riskToOthers.toUpperCase()}
- Risk From Others (Contextual / CCE): ${selectedClient.safeguarding.riskFromOthers.toUpperCase()}
- DSL Sign-Off: ${selectedClient.safeguarding.dslNotified ? 'NOTIFIED & ACTIVE' : 'PENDING'}
  ${selectedClient.safeguarding.dslNotes || ''}

3. ACTIVE SAFEGUARDING ALERTS:
${selectedClient.safeguarding.activeAlerts.map((a, i) => `[${i + 1}] ${a}`).join('\n') || 'None recorded'}

4. AGREED SAFETY MITIGATIONS:
${selectedClient.safeguarding.safetyMitigations.map((m, i) => `- ${m}`).join('\n')}

5. RECENT CASEWORK NOTES (${selectedClient.notes.length} total recorded):
${selectedClient.notes
  .slice(0, 3)
  .map(
    (n) => `
Date: ${new Date(n.createdAt).toLocaleDateString()} | Type: ${n.contactType} | Worker: ${n.workerName}
Title: ${n.title}
${n.safeguardingFlag ? `*** SAFEGUARDING FLAGGED [${n.safeguardingCategory || 'GENERAL'}] ***\n` : ''}Summary: ${n.content}
Actions: ${n.actionItems.join('; ')}
`
  )
  .join('\n-----------------------------------------------------')}

Emergency Kinship Contact:
${selectedClient.emergencyContact.name} (${selectedClient.emergencyContact.relationship}) - ${selectedClient.emergencyContact.phone}
=====================================================
Generated by Waypoint Child-First Infrastructure
    `.trim();

    navigator.clipboard.writeText(briefing);
    showToast(`Multi-agency briefing for ${selectedClient.name} copied to clipboard.`);
  };

  // Create New Client
  const handleCreateNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const created = createCaseworkClient({
      urn: `YJS-2026-${Math.floor(100 + Math.random() * 900)}`,
      name: newClientName.trim(),
      preferredName: newClientName.split(' ')[0],
      age: newClientAge,
      gender: newClientGender,
      orgCode: currentOrgCode || 'YJS-LEEDS',
      orgName: currentUser?.practitionerRole?.includes('NHS')
        ? 'Leeds & York NHS Trust'
        : currentUser?.practitionerRole?.includes('CGL')
        ? 'CGL Kirklees Recovery Hub'
        : 'Leeds Youth Justice Service',
      assignedWorker: currentUser?.name || 'Jordan Miller',
      statutoryStatus: newClientStatus,
      pathway: 'Youth Justice & Diversion',
      primaryRiskSummary: newClientSummary.trim() || 'Intake assessment underway.',
      overallRiskLevel: newClientRisk,
      safeguarding: {
        riskToSelf: 'medium',
        riskToOthers: 'low',
        riskFromOthers: newClientRisk === 'high' ? 'high' : 'medium',
        activeAlerts: ['Initial statutory assessment scheduled'],
        dslNotified: false,
        safetyMitigations: ['Waypoint daily anchors mobile setup'],
        lastAssessedAt: new Date().toISOString(),
        assessedBy: currentUser?.name || 'Jordan Miller',
      },
      emergencyContact: {
        name: 'Parent / Primary Guardian',
        relationship: 'Guardian',
        phone: '07700 900000',
      },
    });

    setClients(getCaseworkClients());
    setSelectedClientId(created.id);
    setIsNewClientModalOpen(false);
    setNewClientName('');
    setNewClientSummary('');
    showToast(`Client ${created.name} (${created.urn}) enrolled into caseload.`);
  };

  // Intervention Handlers
  const handleAddInterventionStep = () => {
    if (!intvActionInput.trim()) return;
    setIntvActionSteps((prev) => [...prev, intvActionInput.trim()]);
    setIntvActionInput('');
  };

  const handleRemoveInterventionStep = (index: number) => {
    setIntvActionSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApplyInterventionPreset = (preset: {
    title: string;
    category: StaffIntervention['category'];
    description: string;
    steps: string[];
    dueDays: number;
  }) => {
    setIntvTitle(preset.title);
    setIntvCategory(preset.category);
    setIntvDescription(preset.description);
    setIntvActionSteps(preset.steps);
    setIntvDueDays(preset.dueDays);
  };

  const handleSendIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    if (!intvTitle.trim()) {
      showToast('Please enter an intervention title.');
      return;
    }

    const created = addClientIntervention(selectedClient.id, {
      clientId: selectedClient.id,
      title: intvTitle.trim(),
      category: intvCategory,
      description: intvDescription.trim() || 'Complete assigned exercise on personal app.',
      actionSteps:
        intvActionSteps.length > 0
          ? intvActionSteps
          : ['Follow guidance on personal device', 'Record completed reflection'],
      assignedByWorker: currentUser?.name || selectedClient.assignedWorker || 'Key Worker',
      dueDate: new Date(Date.now() + intvDueDays * 86400000).toISOString(),
    });

    setClients(getCaseworkClients());
    setIsNewInterventionModalOpen(false);
    setIntvTitle('');
    setIntvDescription('');
    setIntvActionSteps([]);
    setIntvActionInput('');
    showToast(`Intervention "${created.title}" dispatched to ${selectedClient.name}'s app!`);
  };

  const handleToggleInterventionStatus = (intvId: string, currentStatus: StaffIntervention['status']) => {
    if (!selectedClient) return;
    const newStatus = currentStatus === 'completed' ? 'active' : 'completed';
    updateClientInterventionStatus(
      selectedClient.id,
      intvId,
      newStatus,
      newStatus === 'completed' ? 'Practitioner verified completion in session review.' : undefined
    );
    setClients(getCaseworkClients());
    showToast(newStatus === 'completed' ? 'Intervention marked completed.' : 'Intervention marked active.');
  };

  return (
    <div id="staff-casework-manager" className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Worker Attribution & Safeguarding Watchlist Bar */}
      <div className="p-5 rounded-3xl bg-[#16202f] border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Practitioner Casework Notes &amp; Safeguarding Risk Register
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                Child-First Statutory Log
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Record 1:1 sessions, home visits, multi-agency meetings, and real-time contextual safeguarding risks.
            </p>
          </div>
        </div>

        {/* Action buttons: Team Manager, AI Court Report, Enroll new client */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTeamModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Manage organization practitioners & issue staff invite codes"
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Manage Team (+ Add Staff)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (selectedClient) {
                setCourtReportText('');
                setIsCourtReportModalOpen(true);
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-900/80 to-purple-900/80 hover:from-indigo-800 hover:to-purple-800 border border-indigo-700/60 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Draft official statutory court progress review using Gemini AI"
          >
            <Scale className="w-3.5 h-3.5 text-purple-300" />
            <span>AI Court Report Drafter</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewClientModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Client Intake</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* =========================================================================
            LEFT COLUMN: CLIENT CASELOAD LIST & FILTERS (4 cols)
            ========================================================================= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-3xl bg-[#16202f] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>Caseload Directory ({filteredClients.length})</span>
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, URN, status..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-400"
              />
            </div>

            {/* Risk Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#0e141f] p-1 rounded-xl border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setRiskFilter('all')}
                className={`flex-1 py-1 rounded-lg font-semibold transition-colors ${
                  riskFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setRiskFilter('high_critical')}
                className={`flex-1 py-1 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 ${
                  riskFilter === 'high_critical'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'text-slate-400 hover:text-rose-300'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>High Risk</span>
              </button>
              <button
                type="button"
                onClick={() => setRiskFilter('flagged')}
                className={`flex-1 py-1 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 ${
                  riskFilter === 'flagged'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                <Flag className="w-3 h-3 text-amber-400" />
                <span>Alerts</span>
              </button>
            </div>

            {/* Client Cards List */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredClients.map((client) => {
                const isSelected = client.id === selectedClient?.id;
                const hasSafeguardingAlert = client.safeguarding.activeAlerts.length > 0;

                return (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => setSelectedClientId(client.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all relative ${
                      isSelected
                        ? 'bg-[#1e2a3d] border-sky-500 shadow-md ring-1 ring-sky-500/20'
                        : 'bg-[#0e141f] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: Name, URN & Risk Badge */}
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span>{client.name}</span>
                          {client.preferredName && client.preferredName !== client.name && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              ("{client.preferredName}")
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {client.urn} • Age {client.age}
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          client.overallRiskLevel === 'critical'
                            ? 'bg-rose-950 text-rose-300 border border-rose-700'
                            : client.overallRiskLevel === 'high'
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                            : client.overallRiskLevel === 'medium'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                        }`}
                      >
                        {client.overallRiskLevel}
                      </span>
                    </div>

                    {/* Middle: Order & Safeguarding Alert Indicator */}
                    <div className="mt-2 text-[11px] text-slate-300 truncate">
                      {client.statutoryStatus}
                    </div>

                    {hasSafeguardingAlert && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400 font-semibold truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span className="truncate">{client.safeguarding.activeAlerts[0]}</span>
                      </div>
                    )}

                    {/* Bottom stats row */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-slate-500" />
                        <span>{client.notes.length} notes</span>
                      </span>
                      <span>
                        Last:{' '}
                        {new Date(client.lastSessionDate).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: SELECTED CLIENT DOSSIER, NOTES & SAFEGUARDING (8 cols)
            ========================================================================= */}
        {selectedClient ? (
          <div className="lg:col-span-8 space-y-5">
            {/* Client Banner Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#16202f] border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{selectedClient.name}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#0e141f] border border-slate-700 text-sky-300">
                      {selectedClient.urn}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        selectedClient.overallRiskLevel === 'high' || selectedClient.overallRiskLevel === 'critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      Overall Risk: {selectedClient.overallRiskLevel}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>
                      Age: <strong className="text-slate-200">{selectedClient.age}</strong> ({selectedClient.gender})
                    </span>
                    <span>•</span>
                    <span>
                      Order: <strong className="text-slate-200">{selectedClient.statutoryStatus}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Assigned: <strong className="text-slate-200">{selectedClient.assignedWorker}</strong>
                    </span>
                  </div>
                </div>

                {/* Top Action Buttons: Export Briefing */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportBriefing}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Copy Multi-Agency / Court Briefing to Clipboard"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>Export Briefing</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleDSL}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                      selectedClient.safeguarding.dslNotified
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                        : 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-900/60'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{selectedClient.safeguarding.dslNotified ? 'DSL Notified' : 'Escalate to DSL'}</span>
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Tabs: Casework Notes vs Safeguarding Risks vs Statistics vs Interventions */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    activeTab === 'notes'
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Casework Notes</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-700 text-[10px]">
                    {selectedClient.notes.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('safeguarding')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    activeTab === 'safeguarding'
                      ? 'bg-rose-950/50 text-rose-300 border border-rose-800 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Safeguarding &amp; Risks</span>
                  {selectedClient.safeguarding.activeAlerts.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-900 text-rose-200 text-[10px] font-bold">
                      {selectedClient.safeguarding.activeAlerts.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('statistics')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    activeTab === 'statistics'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live App Statistics</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] font-mono font-bold">
                    {selectedClient.liveStatistics?.adherenceRate ?? 82}%
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('interventions')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    activeTab === 'interventions'
                      ? 'bg-sky-950/60 text-sky-300 border border-sky-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Target className="w-3.5 h-3.5 text-sky-400" />
                  <span>Interventions &amp; Targets</span>
                  {selectedClient.interventions && selectedClient.interventions.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-sky-900/80 text-sky-200 text-[10px] font-bold">
                      {selectedClient.interventions.filter((i) => i.status === 'active').length} active
                    </span>
                  )}
                </button>
              </div>

              {/* TAB 1: CASEWORK NOTES */}
              {activeTab === 'notes' && (
                <div className="space-y-6">
                  {/* Form to Log a New Casework Note */}
                  <form
                    onSubmit={handleSubmitNote}
                    className="p-4 sm:p-5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-sky-400" />
                        <span>Log Casework Note / Contact Event</span>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Recorded by {currentUser?.name || selectedClient.assignedWorker}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Contact Event Type *</label>
                        <select
                          value={noteContactType}
                          onChange={(e) =>
                            setNoteContactType(e.target.value as ClientCaseNote['contactType'])
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#16202f] border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400 cursor-pointer"
                        >
                          <option value="1:1 Casework Session">1:1 Casework Session</option>
                          <option value="Home Visit">Home Visit</option>
                          <option value="School / ETE Visit">School / ETE Visit</option>
                          <option value="Multi-Agency / TAF Meeting">Multi-Agency / TAF Meeting</option>
                          <option value="Court Accompaniment">Court Accompaniment</option>
                          <option value="Phone / Check-in">Phone / Check-in</option>
                          <option value="Safeguarding Incident Alert">Safeguarding Incident Alert</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Session Title / Subject *</label>
                        <input
                          type="text"
                          value={noteTitle}
                          onChange={(e) => setNoteTitle(e.target.value)}
                          placeholder="e.g. Weekly Anchor Review &amp; ETE Planning"
                          required
                          className="w-full px-3 py-2 rounded-xl bg-[#16202f] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-400"
                        />
                      </div>
                    </div>

                    {/* Note Content with AI Child-First Formulation */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <span>Clinical &amp; Casework Notes (Child-First, Strength-Based) *</span>
                        </label>
                        <div className="flex items-center gap-2">
                          {previousNoteContent && (
                            <button
                              type="button"
                              onClick={() => {
                                setNoteContent(previousNoteContent);
                                setPreviousNoteContent(null);
                                showToast('Reverted to original note.');
                              }}
                              className="text-[11px] text-slate-400 hover:text-slate-200 underline font-medium"
                            >
                              Undo AI Formulation
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleAIClinicalFormulate}
                            disabled={isFormulatingAI}
                            className="px-3 py-1 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
                            title="Structure raw notes into Child-First statutory sections (Presentation, Strengths, Protective Factors, Actions)"
                          >
                            <Sparkles
                              className={`w-3.5 h-3.5 ${
                                isFormulatingAI ? 'animate-spin text-amber-300' : 'text-amber-300'
                              }`}
                            />
                            <span>
                              {isFormulatingAI
                                ? 'Structuring Clinical Sections...'
                                : '✨ AI Child-First Formulation'}
                            </span>
                          </button>
                        </div>
                      </div>
                      <textarea
                        rows={5}
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Detail the discussion, young person's engagement, protective strengths demonstrated, emotional state, and any identified triggers... Or click 'AI Child-First Formulation' to transform rough bullet points into statutory clinical sections."
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#16202f] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-400 leading-relaxed font-sans"
                      />
                    </div>

                    {/* Safeguarding Flag Toggle */}
                    <div className="p-3 rounded-xl bg-[#16202f] border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSafeguardingFlag}
                            onChange={(e) => setIsSafeguardingFlag(e.target.checked)}
                            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-[#0e141f] border-slate-700"
                          />
                          <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                            <Flag className="w-3.5 h-3.5 text-rose-400" />
                            <span>Flag as Safeguarding Concern / Incident</span>
                          </span>
                        </label>
                        {isSafeguardingFlag && (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                            Escalation Workflow Triggered
                          </span>
                        )}
                      </div>

                      {isSafeguardingFlag && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-300">
                              Safeguarding Category
                            </label>
                            <select
                              value={safeguardingCategory}
                              onChange={(e) =>
                                setSafeguardingCategory(
                                  e.target.value as NonNullable<ClientCaseNote['safeguardingCategory']>
                                )
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0e141f] border border-rose-800 text-rose-200 text-xs"
                            >
                              <option value="Contextual / Peer Exploitation (CCE)">
                                Contextual / Peer Exploitation (CCE)
                              </option>
                              <option value="Mental Health / Self-Harm">Mental Health / Self-Harm</option>
                              <option value="Substance Misuse">Substance Misuse</option>
                              <option value="Missing Episode">Missing Episode</option>
                              <option value="Domestic / Family Discord">Domestic / Family Discord</option>
                              <option value="Court / Compliance Breach">Court / Compliance Breach</option>
                              <option value="General Welfare">General Welfare</option>
                            </select>
                          </div>
                          <div className="flex items-center text-[11px] text-rose-300/80 bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/50">
                            This note will update the client's active risk alerts and appear on the Safeguarding Risk Register.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Items List */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">
                        Agreed Follow-Up Action Items
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={noteActionInput}
                          onChange={(e) => setNoteActionInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddActionItem();
                            }
                          }}
                          placeholder="e.g. Confirm quiet room with court usher"
                          className="flex-1 px-3 py-1.5 rounded-xl bg-[#16202f] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-400"
                        />
                        <button
                          type="button"
                          onClick={handleAddActionItem}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                        >
                          Add
                        </button>
                      </div>

                      {actionItemsList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {actionItemsList.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 text-sky-300 text-xs flex items-center gap-1.5 border border-slate-700"
                            >
                              <span>{item}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setActionItemsList(actionItemsList.filter((_, i) => i !== idx))
                                }
                                className="text-slate-400 hover:text-white"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Save Casework Note to Record</span>
                    </button>
                  </form>

                  {/* Past Casework Notes Timeline */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Recorded Casework Timeline ({selectedClient.notes.length})
                    </h4>

                    {selectedClient.notes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-4 rounded-2xl border space-y-2.5 ${
                          note.safeguardingFlag
                            ? 'bg-rose-950/20 border-rose-800/80'
                            : 'bg-[#0e141f] border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/80 pb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                note.safeguardingFlag
                                  ? 'bg-rose-950 text-rose-300 border border-rose-700'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {note.contactType}
                            </span>
                            <span className="font-bold text-white text-xs">{note.title}</span>
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{new Date(note.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            <span>•</span>
                            <span className="text-slate-300 font-medium">{note.workerName}</span>
                          </div>
                        </div>

                        {note.safeguardingFlag && (
                          <div className="flex items-center gap-2 text-[11px] text-rose-400 font-semibold bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-900/60 w-fit">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Safeguarding Concern: {note.safeguardingCategory}</span>
                          </div>
                        )}

                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                          {note.content}
                        </p>

                        {note.actionItems && note.actionItems.length > 0 && (
                          <div className="pt-2 border-t border-slate-800/60 text-xs">
                            <div className="text-[10px] font-bold text-slate-400 uppercase">
                              Action Items:
                            </div>
                            <ul className="list-disc list-inside text-sky-300 text-xs space-y-0.5 mt-0.5">
                              {note.actionItems.map((action, i) => (
                                <li key={i}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: SAFEGUARDING & RISK ASSESSMENT */}
              {activeTab === 'safeguarding' && (
                <div className="space-y-6">
                  {/* Risk Stratification Dials */}
                  <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          <span>Multi-Agency Risk Stratification Matrix</span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          Last assessed on{' '}
                          {new Date(selectedClient.safeguarding.lastAssessedAt).toLocaleDateString()} by{' '}
                          {selectedClient.safeguarding.assessedBy}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Risk to Self */}
                      <div className="p-3.5 rounded-xl bg-[#16202f] border border-slate-800 space-y-2">
                        <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                          <span>Risk to Self</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              selectedClient.safeguarding.riskToSelf === 'high'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : selectedClient.safeguarding.riskToSelf === 'medium'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {selectedClient.safeguarding.riskToSelf}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Self-harm, substance overdose, psychological distress.
                        </p>
                        <div className="flex gap-1 pt-1">
                          {(['low', 'medium', 'high'] as RiskLevel[]).map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => handleUpdateRisk('riskToSelf', lvl)}
                              className={`flex-1 py-1 rounded text-[10px] uppercase font-bold transition-colors ${
                                selectedClient.safeguarding.riskToSelf === lvl
                                  ? 'bg-slate-700 text-white'
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Risk to Others */}
                      <div className="p-3.5 rounded-xl bg-[#16202f] border border-slate-800 space-y-2">
                        <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                          <span>Risk to Others</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              selectedClient.safeguarding.riskToOthers === 'high'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : selectedClient.safeguarding.riskToOthers === 'medium'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {selectedClient.safeguarding.riskToOthers}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Aggression, property damage, public compliance.
                        </p>
                        <div className="flex gap-1 pt-1">
                          {(['low', 'medium', 'high'] as RiskLevel[]).map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => handleUpdateRisk('riskToOthers', lvl)}
                              className={`flex-1 py-1 rounded text-[10px] uppercase font-bold transition-colors ${
                                selectedClient.safeguarding.riskToOthers === lvl
                                  ? 'bg-slate-700 text-white'
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Risk from Others (Contextual) */}
                      <div className="p-3.5 rounded-xl bg-[#16202f] border border-slate-800 space-y-2">
                        <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                          <span>Contextual / CCE</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              selectedClient.safeguarding.riskFromOthers === 'high'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : selectedClient.safeguarding.riskFromOthers === 'medium'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {selectedClient.safeguarding.riskFromOthers}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Peer exploitation, county lines, bus interchange grooming.
                        </p>
                        <div className="flex gap-1 pt-1">
                          {(['low', 'medium', 'high'] as RiskLevel[]).map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => handleUpdateRisk('riskFromOthers', lvl)}
                              className={`flex-1 py-1 rounded text-[10px] uppercase font-bold transition-colors ${
                                selectedClient.safeguarding.riskFromOthers === lvl
                                  ? 'bg-slate-700 text-white'
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Safeguarding & Multi-Agency Risk Synthesizer */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121927] to-[#1c1a2e] border border-indigo-900/60 shadow-lg space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-950/80 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            <span>AI Safeguarding &amp; Contextual Risk Synthesizer</span>
                            <span className="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 text-[10px] font-bold">
                              Gemini Flash
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Multi-agency MASH &amp; DSL early warning analysis across notes, attendance, and exploitation flags.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAISafeguardingSynthesis}
                        disabled={isAnalyzingRiskAI}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all shrink-0"
                      >
                        <Wand2
                          className={`w-3.5 h-3.5 ${
                            isAnalyzingRiskAI ? 'animate-spin text-amber-300' : 'text-amber-300'
                          }`}
                        />
                        <span>
                          {isAnalyzingRiskAI
                            ? 'Synthesizing Risk Trajectory...'
                            : 'Run AI Risk Synthesis'}
                        </span>
                      </button>
                    </div>

                    {safeguardingAISynthesis ? (
                      <div className="space-y-3 animate-fadeIn">
                        <div className="p-3.5 rounded-xl bg-[#0b101a] border border-indigo-800/40 text-xs text-slate-200 leading-relaxed space-y-2 whitespace-pre-wrap">
                          <div className="flex items-center justify-between font-bold text-indigo-300 pb-1 border-b border-indigo-900/40">
                            <span>Multi-Agency Synthesis</span>
                            {safeguardingAISynthesis.riskScoreSummary && (
                              <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700">
                                Trajectory: {safeguardingAISynthesis.riskScoreSummary}
                              </span>
                            )}
                          </div>
                          <p>{safeguardingAISynthesis.synthesis}</p>
                        </div>

                        {safeguardingAISynthesis.suggestedMitigations &&
                          safeguardingAISynthesis.suggestedMitigations.length > 0 && (
                            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/50 space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                                <span>AI-Recommended Safety Mitigations:</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = Array.from(
                                      new Set([
                                        ...selectedClient.safeguarding.safetyMitigations,
                                        ...safeguardingAISynthesis.suggestedMitigations!,
                                      ])
                                    );
                                    updateClientSafeguarding(selectedClient.id, {
                                      ...selectedClient.safeguarding,
                                      safetyMitigations: updated,
                                    });
                                    setClients(getCaseworkClients());
                                    showToast('Adopted AI safety mitigations into active plan.');
                                  }}
                                  className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-800/60 hover:bg-emerald-700 text-emerald-100 transition-colors"
                                >
                                  + Adopt All into Active Plan
                                </button>
                              </div>
                              <ul className="space-y-1 text-[11px] text-emerald-200/90 list-disc list-inside">
                                {safeguardingAISynthesis.suggestedMitigations.map((mit, i) => (
                                  <li key={i}>{mit}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-[#0b101a]/60 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>
                          Click to evaluate peer grooming indicators, missing episodes, and family discord factors across all session notes.
                        </span>
                        <span className="text-indigo-400 font-semibold text-[10px]">Zero-PII Secure</span>
                      </div>
                    )}
                  </div>

                  {/* Active Safeguarding Alerts */}
                  <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Flag className="w-4 h-4 text-rose-400" />
                        <span>Active Safeguarding Alerts &amp; Critical Warnings</span>
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        Shared with Multi-Agency Safeguarding Hub (MASH)
                      </span>
                    </div>

                    <div className="space-y-2">
                      {selectedClient.safeguarding.activeAlerts.map((alert, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/60 text-xs text-rose-200 flex items-start justify-between gap-3"
                        >
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <span>{alert}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = selectedClient.safeguarding.activeAlerts.filter(
                                (_, idx) => idx !== i
                              );
                              updateClientSafeguarding(selectedClient.id, {
                                ...selectedClient.safeguarding,
                                activeAlerts: updated,
                              });
                              setClients(getCaseworkClients());
                              showToast('Alert resolved.');
                            }}
                            className="text-[11px] text-rose-400 hover:text-white underline shrink-0"
                          >
                            Resolve
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add alert field */}
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        value={newAlertInput}
                        onChange={(e) => setNewAlertInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddAlert();
                          }
                        }}
                        placeholder="Log new active alert (e.g. Missed curfew check-in on Friday)..."
                        className="flex-1 px-3 py-2 rounded-xl bg-[#16202f] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddAlert}
                        className="px-3.5 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold"
                      >
                        Add Alert
                      </button>
                    </div>
                  </div>

                  {/* Agreed Safety Mitigations */}
                  <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Agreed Protective Factors &amp; Safety Mitigations</span>
                    </h4>

                    <div className="space-y-2">
                      {selectedClient.safeguarding.safetyMitigations.map((mitigation, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/60 text-xs text-emerald-200 flex items-center justify-between"
                        >
                          <span>{mitigation}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        value={newMitigationInput}
                        onChange={(e) => setNewMitigationInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMitigation();
                          }
                        }}
                        placeholder="Add protective measure (e.g. Travel voucher to avoid bus interchange)..."
                        className="flex-1 px-3 py-2 rounded-xl bg-[#16202f] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddMitigation}
                        className="px-3.5 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold"
                      >
                        Add Mitigation
                      </button>
                    </div>
                  </div>

                  {/* Emergency Kinship Contact */}
                  <div className="p-4 rounded-2xl bg-[#0e141f] border border-slate-800 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-sky-400" />
                        <span>Emergency Trusted Kinship Contact</span>
                      </div>
                      <div className="text-slate-300">
                        {selectedClient.emergencyContact.name} ({selectedClient.emergencyContact.relationship})
                      </div>
                    </div>
                    <div className="font-mono text-sky-300 font-bold bg-[#16202f] px-3 py-1.5 rounded-lg border border-slate-700">
                      {selectedClient.emergencyContact.phone}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LIVE APP STATISTICS & CLIENT TELEMETRY */}
              {activeTab === 'statistics' && (
                <div className="space-y-6">
                  {/* Telemetry Synchronization Banner */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0d1e2e] to-[#0e141f] border border-sky-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
                        <span className="text-xs font-bold text-white">
                          Personal App Connected &amp; Transmitting
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950 border border-sky-800 text-sky-300 font-mono">
                          {selectedClient.registeredEmail || selectedClient.linkedUserId ? 'Verified Link' : 'Sync Profile Active'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Real-time behavioral telemetry streaming from {selectedClient.name}'s Waypoint Personal mobile installation.
                      </p>
                      <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                        <span>
                          Registered Email: <strong className="text-slate-200">{selectedClient.registeredEmail || 'alex.m@example.org'}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Last Device Sync: <strong className="text-emerald-300">{selectedClient.liveStatistics?.lastActiveAt ? new Date(selectedClient.liveStatistics.lastActiveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active now'}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setClients(getCaseworkClients());
                          showToast('Polled latest telemetry from client device.');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                        <span>Poll Live Data</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('interventions');
                          setIsNewInterventionModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-950 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Intervention</span>
                      </button>
                    </div>
                  </div>

                  {/* 4-Card Primary Statistics Metric Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Metric 1: Habit Adherence Rate */}
                    <div className="p-4 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Anchor Adherence</span>
                        <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white font-mono">
                          {selectedClient.liveStatistics?.adherenceRate ?? 84}%
                        </div>
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <span>High compliance trajectory</span>
                        </div>
                      </div>
                      {/* Visual progress bar */}
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${selectedClient.liveStatistics?.adherenceRate ?? 84}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {selectedClient.liveStatistics?.totalAnchorsCompleted ?? 18} micro-anchors verified
                      </div>
                    </div>

                    {/* Metric 2: Active Habit Streak */}
                    <div className="p-4 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Current Streak</span>
                        <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Flame className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white font-mono">
                          {selectedClient.liveStatistics?.streakDays ?? 5}{' '}
                          <span className="text-xs font-sans text-slate-400 font-normal">Days</span>
                        </div>
                        <div className="text-[11px] text-amber-300 flex items-center gap-1 mt-0.5">
                          <span>Consistent daily momentum</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
                          style={{ width: `${Math.min(100, (selectedClient.liveStatistics?.streakDays ?? 5) * 14)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400">Target: 7-day statutory milestone</div>
                    </div>

                    {/* Metric 3: Daily Battery & Power Mode */}
                    <div className="p-4 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Habit Battery</span>
                        <div className="w-7 h-7 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                          <Battery className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white font-mono">
                          {selectedClient.liveStatistics?.dailyBattery ?? 80}%
                        </div>
                        <div className="text-[11px] text-sky-300 flex items-center gap-1 mt-0.5">
                          <span>{selectedClient.liveStatistics?.restStatus || 'Optimal Recharge'}</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-indigo-400 rounded-full"
                          style={{ width: `${selectedClient.liveStatistics?.dailyBattery ?? 80}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400">Low-stimulation mode available</div>
                    </div>

                    {/* Metric 4: Safety & Crisis Button Uses */}
                    <div className="p-4 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Emergency Grounding</span>
                        <div className="w-7 h-7 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white font-mono">
                          {selectedClient.liveStatistics?.redButtonGroundingUses ?? 0}{' '}
                          <span className="text-xs font-sans text-slate-400 font-normal">uses</span>
                        </div>
                        <div className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                          <span>4-7-8 Breathing Pauses</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${Math.min(100, (selectedClient.liveStatistics?.redButtonGroundingUses ?? 0) * 33)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-emerald-400">No unmanaged crisis logged</div>
                    </div>
                  </div>

                  {/* Mood Trajectory & Emotional Valence History */}
                  <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-sky-400" />
                        <span>Self-Reported Emotional Valence &amp; Daily Check-Ins</span>
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Past 3 Days Submitted on Personal Device
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(selectedClient.liveStatistics?.recentMoodCheckIns || [
                        { date: 'Yesterday', mood: 'Calm & Steady', score: 8 },
                        { date: '2 days ago', mood: 'Slightly Overwhelmed', score: 5 },
                        { date: '3 days ago', mood: 'Focused & Grounded', score: 8 },
                      ]).map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-[#16202f] border border-slate-700/80 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-medium">{item.date}</span>
                            <span className="font-mono text-sky-300 font-bold">
                              {(item.score || 7)}/10 Stability
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>{item.mood}</span>
                          </div>
                          <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden mt-1">
                            <div
                              className="h-full bg-sky-400 rounded-full"
                              style={{ width: `${(item.score || 7) * 10}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Dispatch Intervention Callout */}
                  <div className="p-4 rounded-2xl bg-[#16202f] border border-sky-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-sky-400" />
                        <span>Support Progression &amp; Casework Tasks</span>
                      </div>
                      <p className="text-slate-300">
                        {selectedClient.name} currently has{' '}
                        <strong className="text-sky-300">
                          {selectedClient.interventions?.filter((i) => i.status === 'active').length ?? 1} active
                        </strong>{' '}
                        practitioner interventions pending on their phone.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('interventions')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                    >
                      <span>Manage Interventions</span>
                      <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: PRACTITIONER INTERVENTIONS & DISPATCH */}
              {activeTab === 'interventions' && (
                <div className="space-y-6">
                  {/* Interventions Header & Dispatch Button */}
                  <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-sky-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Practitioner Interventions &amp; Targeted Tasks
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 max-w-xl">
                        Design micro-anchors, grounding exercises, court prep walkthroughs, or restorative reflections and push them directly to {selectedClient.name}'s Waypoint mobile app.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsNewInterventionModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-950 transition-colors shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Dispatch New Intervention</span>
                    </button>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setIntvFilter('all')}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                        intvFilter === 'all'
                          ? 'bg-slate-800 text-white border border-slate-700'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All ({selectedClient.interventions?.length || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setIntvFilter('active')}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                        intvFilter === 'active'
                          ? 'bg-sky-950 border border-sky-800 text-sky-300'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Active ({selectedClient.interventions?.filter((i) => i.status === 'active').length || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setIntvFilter('completed')}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                        intvFilter === 'completed'
                          ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Completed ({selectedClient.interventions?.filter((i) => i.status === 'completed').length || 0})
                    </button>
                  </div>

                  {/* Interventions List */}
                  <div className="space-y-3.5">
                    {(selectedClient.interventions || [])
                      .filter((intv) => {
                        if (intvFilter === 'active') return intv.status === 'active';
                        if (intvFilter === 'completed') return intv.status === 'completed';
                        return true;
                      })
                      .map((intv) => {
                        const isCompleted = intv.status === 'completed';
                        const categoryColor =
                          intv.category === 'grounding'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : intv.category === 'restorative'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : intv.category === 'substance'
                            ? 'bg-purple-950 text-purple-300 border-purple-800'
                            : intv.category === 'court_prep'
                            ? 'bg-sky-950 text-sky-300 border-sky-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800';

                        return (
                          <div
                            key={intv.id}
                            className={`p-5 rounded-2xl border transition-all ${
                              isCompleted
                                ? 'bg-[#0f1824] border-slate-800 opacity-90'
                                : 'bg-[#16202f] border-slate-700/80 shadow-md'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="space-y-1.5 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${categoryColor}`}>
                                    {intv.category}
                                  </span>
                                  <h4 className="text-sm font-bold text-white">{intv.title}</h4>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      isCompleted
                                        ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                                        : 'bg-amber-950/80 border border-amber-800 text-amber-300 flex items-center gap-1'
                                    }`}
                                  >
                                    {!isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                                    {isCompleted ? 'Completed' : 'Active on Client Device'}
                                  </span>
                                </div>

                                <p className="text-xs text-slate-300 leading-relaxed">
                                  {intv.description}
                                </p>

                                {/* Action Steps Checklist */}
                                {intv.actionSteps && intv.actionSteps.length > 0 && (
                                  <div className="pt-2 space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                      Prescribed Client Action Steps:
                                    </span>
                                    <div className="space-y-1">
                                      {intv.actionSteps.map((step, sIdx) => (
                                        <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-300">
                                          <CheckSquare className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                                          <span>{step}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Young Person's Reflection If Completed */}
                                {isCompleted && intv.clientReflection && (
                                  <div className="mt-3 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-xs text-emerald-200 space-y-1">
                                    <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                                      <MessageSquare className="w-3.5 h-3.5" />
                                      <span>Young Person's Reflection (Logged in App):</span>
                                    </div>
                                    <p className="italic text-emerald-100 pl-5 border-l border-emerald-700/60">
                                      "{intv.clientReflection}"
                                    </p>
                                  </div>
                                )}

                                <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 pt-2">
                                  <span>
                                    Assigned by: <strong className="text-slate-200">{intv.assignedByWorker}</strong>
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Dispatched: <strong className="text-slate-200">{new Date(intv.assignedAt).toLocaleDateString()}</strong>
                                  </span>
                                  {intv.dueDate && (
                                    <>
                                      <span>•</span>
                                      <span>
                                        Due:{' '}
                                        <strong className={isCompleted ? 'text-slate-300' : 'text-amber-300'}>
                                          {new Date(intv.dueDate).toLocaleDateString()}
                                        </strong>
                                      </span>
                                    </>
                                  )}
                                  {intv.completedAt && (
                                    <>
                                      <span>•</span>
                                      <span>
                                        Completed:{' '}
                                        <strong className="text-emerald-300">
                                          {new Date(intv.completedAt).toLocaleDateString()}
                                        </strong>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Toggle Completion Status Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleInterventionStatus(intv.id, intv.status)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 self-start border ${
                                  isCompleted
                                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                                    : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-700 text-emerald-200'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{isCompleted ? 'Re-open' : 'Verify & Complete'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                    {(!selectedClient.interventions || selectedClient.interventions.length === 0) && (
                      <div className="p-8 rounded-2xl bg-[#0e141f] border border-dashed border-slate-800 text-center space-y-3">
                        <Target className="w-8 h-8 text-slate-600 mx-auto" />
                        <div className="text-xs text-slate-300 font-semibold">
                          No interventions currently logged for {selectedClient.name}.
                        </div>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          Assign a targeted grounding habit, restorative task, or court preparation challenge to support their stabilization.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsNewInterventionModalOpen(true)}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Dispatch First Intervention</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center text-slate-500 text-xs">
            No client selected. Select a client from the caseload list on the left.
          </div>
        )}
      </div>

      {/* MODAL: NEW CLIENT INTAKE */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#16202f] border border-slate-800 p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-sky-400" />
                <span>New Casework Client Intake</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewClientModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g. Tyler Johnson"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Age</label>
                  <input
                    type="number"
                    value={newClientAge}
                    onChange={(e) => setNewClientAge(Number(e.target.value))}
                    min={10}
                    max={25}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Statutory Order / Status</label>
                  <select
                    value={newClientStatus}
                    onChange={(e) =>
                      setNewClientStatus(e.target.value as CaseworkClient['statutoryStatus'])
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    <option value="Youth Rehabilitation Order (YRO)">Youth Rehabilitation Order (YRO)</option>
                    <option value="Conditional Caution">Conditional Caution</option>
                    <option value="Child in Need (s.17)">Child in Need (s.17)</option>
                    <option value="Child Protection Plan (s.47)">Child Protection Plan (s.47)</option>
                    <option value="Looked After Child (s.20)">Looked After Child (s.20)</option>
                    <option value="Early Help Intervention">Early Help Intervention</option>
                    <option value="Voluntary Support">Voluntary Support</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Initial Risk Level</label>
                  <select
                    value={newClientRisk}
                    onChange={(e) => setNewClientRisk(e.target.value as RiskLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                    <option value="critical">Critical Risk</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Baseline Risk &amp; Intake Summary</label>
                <textarea
                  rows={3}
                  value={newClientSummary}
                  onChange={(e) => setNewClientSummary(e.target.value)}
                  placeholder="Summarize initial reasons for referral, protective factors, and key areas of focus..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Create Client Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          AI COURT & STATUTORY PROGRESS REPORT MODAL
          ========================================================================= */}
      {isCourtReportModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-3xl rounded-3xl bg-[#131b26] border border-slate-800 shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-950/80 via-[#131b26] to-[#131b26] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Statutory Court &amp; Progress Review Drafter</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-900/60 border border-indigo-700/60 text-indigo-300 text-[10px] font-bold">
                      A-Tier Gemini AI
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Draft an official Ministry of Justice / Youth Court compliant report for{' '}
                    <strong className="text-slate-200">{selectedClient.name}</strong> ({selectedClient.urn})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCourtReportModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Parameters & Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#0e141f] border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">Young Person &amp; Order:</span>
                  <div className="font-bold text-white text-sm mt-0.5">
                    {selectedClient.name} ({selectedClient.age} y/o)
                  </div>
                  <div className="text-slate-300 mt-0.5">{selectedClient.statutoryStatus}</div>
                  <div className="text-slate-500 mt-1 font-mono text-[10px]">
                    URN: {selectedClient.urn} • Org: {selectedClient.orgName}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">
                    Officer Court Recommendation:
                  </label>
                  <select
                    value={courtReportOfficerRecommendation}
                    onChange={(e) =>
                      setCourtReportOfficerRecommendation(
                        e.target.value as
                          | 'continue_order'
                          | 'discharge_early'
                          | 'vary_requirements'
                          | 'revoke_order'
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#16202f] border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-400"
                  >
                    <option value="continue_order">Order should continue as currently framed</option>
                    <option value="discharge_early">
                      Application for early discharge (exemplary progress)
                    </option>
                    <option value="vary_requirements">
                      Application to vary requirements (e.g. lift curfew / amend hours)
                    </option>
                    <option value="revoke_order">
                      Revocation consideration due to breach / non-compliance
                    </option>
                  </select>
                </div>
              </div>

              {/* Generate Trigger */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Synthesizes attendance logs, reparation completion, ETE engagement, and risk alerts into legal sections.
                </span>
                <button
                  type="button"
                  onClick={handleGenerateCourtReport}
                  disabled={isDraftingCourtReportAI}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
                >
                  <Sparkles
                    className={`w-4 h-4 ${
                      isDraftingCourtReportAI ? 'animate-spin text-amber-300' : 'text-amber-300'
                    }`}
                  />
                  <span>
                    {isDraftingCourtReportAI
                      ? 'Synthesizing Official Court Report...'
                      : courtReportText
                      ? 'Re-draft Report with Gemini'
                      : 'Draft Statutory Court Report'}
                  </span>
                </button>
              </div>

              {/* Report Output Preview */}
              {courtReportText ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span>Drafted Statutory Review Document</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(courtReportText);
                        showToast('Court report copied to clipboard.');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Document to Clipboard</span>
                    </button>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#090d14] border border-indigo-900/40 text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto select-text shadow-inner">
                    {courtReportText}
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-[#0e141f] border border-dashed border-slate-800 text-center space-y-2">
                  <Scale className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">
                    No draft generated yet for {selectedClient.name}.
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                    Click "Draft Statutory Court Report" above. The AI will extract all casework entries, reparation hours, and risk trajectory from Waypoint to construct a complete MoJ-compliant review.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#0e141f] border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                UK YJB &amp; Youth Justice Board Compliant Format
              </span>
              <button
                type="button"
                onClick={() => setIsCourtReportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Close Drafter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DISPATCH NEW INTERVENTION */}
      {isNewInterventionModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-[#16202f] border border-slate-800 p-6 shadow-2xl space-y-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-sky-400" />
                  <span>Dispatch Intervention to {selectedClient.name}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Transmits directly to their Waypoint Personal app with push notification and task verification.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewInterventionModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Clinical &amp; Safeguarding Presets:
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleApplyInterventionPreset({
                      title: '4-7-8 Sensory Grounding Protocol',
                      category: 'grounding',
                      description: 'Complete a guided 3-minute sensory breathing cycle when feeling emotional dysregulation or approaching stressful peer scenarios.',
                      steps: [
                        'Step away from elevated noise or conflict',
                        'Open Waypoint Red Button / Low-Stimulation Grounding',
                        'Complete 3 consecutive 4-7-8 breathing cycles',
                      ],
                      dueDays: 7,
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[11px] font-medium transition-colors"
                >
                  ⚡ Sensory Grounding
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleApplyInterventionPreset({
                      title: 'Evening Digital Curfew & Sleep Anchor',
                      category: 'anchor',
                      description: 'Power down entertainment devices 45 minutes prior to bedtime to stabilize circadian rhythm and support morning school/ETE attendance.',
                      steps: [
                        'Turn off phone alerts at 22:15',
                        'Practice 2 minutes of sensory muscle relaxation',
                        'Log morning waking energy in habit tracker',
                      ],
                      dueDays: 7,
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[11px] font-medium transition-colors"
                >
                  🌙 Evening Sleep Anchor
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleApplyInterventionPreset({
                      title: 'Court Appearance Walkthrough & Safe Transport',
                      category: 'court_prep',
                      description: 'Review the 4-stage Court Prep Walkthrough in Waypoint and confirm quiet room coordination with caseworker before the hearing.',
                      steps: [
                        'Review courtroom etiquette and role breakdown in Waypoint',
                        'Confirm morning travel pass with Aunt Clara',
                        'Meet key worker 30 minutes before hearing in quiet room',
                      ],
                      dueDays: 5,
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-sky-950/60 hover:bg-sky-900 border border-sky-800 text-sky-300 text-[11px] font-medium transition-colors"
                >
                  ⚖️ Court Prep Walkthrough
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleApplyInterventionPreset({
                      title: 'Community Bike Workshop - Reparation Reflection',
                      category: 'restorative',
                      description: 'Participate actively in the weekend restorative reparation session and submit a 2-sentence reflection on skills gained.',
                      steps: [
                        'Arrive on time at Meanwood Urban Farm Workshop',
                        'Complete 3 hours towards statutory YRO order condition',
                        'Submit reflection on personal app after the session',
                      ],
                      dueDays: 4,
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-800 text-amber-300 text-[11px] font-medium transition-colors"
                >
                  🛠️ Restorative Reparation
                </button>
              </div>
            </div>

            <form onSubmit={handleSendIntervention} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-300">Intervention Title *</label>
                  <input
                    type="text"
                    value={intvTitle}
                    onChange={(e) => setIntvTitle(e.target.value)}
                    placeholder="e.g. 4-7-8 Sensory Grounding Protocol"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Target Category</label>
                  <select
                    value={intvCategory}
                    onChange={(e) => setIntvCategory(e.target.value as StaffIntervention['category'])}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="anchor">Anchor Habit</option>
                    <option value="grounding">Sensory Grounding</option>
                    <option value="restorative">Restorative / Reparation</option>
                    <option value="substance">Harm Reduction</option>
                    <option value="court_prep">Court Prep</option>
                    <option value="routine">Routine Stabilization</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Intervention Description &amp; Guidance *</label>
                <textarea
                  rows={2}
                  value={intvDescription}
                  onChange={(e) => setIntvDescription(e.target.value)}
                  placeholder="Explain why this intervention is important and what the young person should expect..."
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 resize-none leading-relaxed"
                />
              </div>

              {/* Action Steps Checklist Builder */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300">Action Steps Checklist for Client Device</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={intvActionInput}
                    onChange={(e) => setIntvActionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInterventionStep();
                      }
                    }}
                    placeholder="e.g. Log in to Waypoint before 21:00..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddInterventionStep}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold border border-slate-700"
                  >
                    Add Step
                  </button>
                </div>

                {intvActionSteps.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {intvActionSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-[#0e141f] border border-slate-800 text-slate-300 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
                          <span>{step}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveInterventionStep(idx)}
                          className="text-rose-400 hover:text-rose-300 text-[11px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Target Completion Window</label>
                  <select
                    value={intvDueDays}
                    onChange={(e) => setIntvDueDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e141f] border border-slate-700 text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value={3}>Within 3 Days (Immediate Review)</option>
                    <option value={7}>Within 7 Days (Weekly Casework Cycle)</option>
                    <option value={14}>Within 14 Days (Fortnightly Review)</option>
                    <option value={30}>Within 30 Days (Statutory Milestone)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Assigning Practitioner</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser?.name || selectedClient.assignedWorker || 'Key Worker'}
                    className="w-full px-3 py-2 rounded-xl bg-[#0b101a] border border-slate-800 text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-800/60 text-[11px] text-sky-300 flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  Dispatched interventions sync instantly with {selectedClient.name}'s Waypoint client app and will appear in their daily action stream.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewInterventionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-sky-950"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Intervention to Client</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Staff Org Team Management Modal */}
      <OrgTeamManagerModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        currentUser={currentUser}
        currentOrgCode={currentUser?.orgCode || currentOrgCode}
      />
    </div>
  );
};
