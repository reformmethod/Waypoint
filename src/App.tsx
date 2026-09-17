import React, { useState } from 'react';
import {
  WaypointUserProfile,
  WaypointTask,
  AnonymizedTelemetryPacket,
  AuthUser,
  PushNotificationScheduleConfig,
  NotificationPermissionState,
} from './types/waypoint';
import {
  getLocalUserProfile,
  saveLocalUserProfile,
  getLocalTasks,
  saveLocalTasks,
  getAnonymizedTelemetry,
  recordAnonymizedTelemetryEvent,
  getAuthSession,
  saveAuthSession,
  clearAuthSession,
} from './utils/waypointStorage';
import {
  getStoredNotificationConfig,
  saveStoredNotificationConfig,
  getNotificationPermission,
  requestBrowserNotificationPermission,
  dispatchNativeBrowserNotification,
  playNotificationChime,
  getPendingNonNegotiables,
  isTaskNonNegotiable,
  formatTime12Hour,
} from './utils/notificationScheduler';
import { SafeguardedAuthScreen } from './components/waypoint/SafeguardedAuthScreen';
import { OnboardingTriageController } from './components/waypoint/OnboardingTriageController';
import { WaypointMobileDashboard } from './components/waypoint/WaypointMobileDashboard';
import { OrgB2BDashboard } from './components/waypoint/OrgB2BDashboard';
import { AdminPanel } from './components/waypoint/AdminPanel';
import { CrisisModal } from './components/waypoint/CrisisModal';
import { NotificationSchedulerModal } from './components/waypoint/NotificationSchedulerModal';
import { InAppNotificationBanner } from './components/waypoint/InAppNotificationBanner';

export function App() {
  // Authentication & Invisible RBAC State - default to null so the app opens on the sign-in screen
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  // Personal Profile (stored strictly on local device)
  const [userProfile, setUserProfile] = useState<WaypointUserProfile>(() => getLocalUserProfile());

  // Task list (stored strictly on local device)
  const [tasks, setTasks] = useState<WaypointTask[]>(() => getLocalTasks(userProfile));

  // Telemetry packets (de-identified, aggregated for organization dashboard)
  const [telemetryPackets, setTelemetryPackets] = useState<AnonymizedTelemetryPacket[]>(() =>
    getAnonymizedTelemetry()
  );

  // Global Crisis Grounding Modal state
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);

  // Browser Push Notification Scheduling State
  const [notificationConfig, setNotificationConfig] = useState<PushNotificationScheduleConfig>(() =>
    getStoredNotificationConfig()
  );
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionState>(
    () => getNotificationPermission()
  );
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [activeInAppBanner, setActiveInAppBanner] = useState<{
    isOpen: boolean;
    pendingTasks: WaypointTask[];
    isTest?: boolean;
  } | null>(null);

  // Sync profile changes to device storage
  React.useEffect(() => {
    saveLocalUserProfile(userProfile);
  }, [userProfile]);

  // Sync tasks changes to device storage
  React.useEffect(() => {
    saveLocalTasks(tasks);
  }, [tasks]);

  // Permission request handler
  const handleRequestPermission = async (): Promise<NotificationPermissionState> => {
    const perm = await requestBrowserNotificationPermission();
    setNotificationPermission(perm);
    return perm;
  };

  // Save updated schedule configuration
  const handleSaveNotificationConfig = (newConfig: PushNotificationScheduleConfig) => {
    setNotificationConfig(newConfig);
    saveStoredNotificationConfig(newConfig);
  };

  // Core push notification dispatch
  const handleTriggerPushNotification = (isTest: boolean = false) => {
    const pendingNN = getPendingNonNegotiables(tasks);
    const tasksToReport =
      pendingNN.length > 0 ? pendingNN : tasks.filter(isTaskNonNegotiable).slice(0, 3);

    const count = tasksToReport.length;
    const taskTitles = tasksToReport.map((t) => t.title).slice(0, 2).join(', ');
    const extra = count > 2 ? ` +${count - 2} more` : '';

    const title = isTest
      ? 'Waypoint • Test Push Notification'
      : `Waypoint • ${count} Non-Negotiable Anchor${count !== 1 ? 's' : ''} Pending`;

    const body = isTest
      ? `Push notification scheduling is active for ${formatTime12Hour(
          notificationConfig.scheduledTime
        )} (${tasksToReport.length} anchor${tasksToReport.length !== 1 ? 's' : ''}: ${taskTitles}${extra}).`
      : `Time to secure your non-negotiables: ${taskTitles}${extra}. Keep your life infrastructure intact!`;

    // 1. Dispatch Native Browser Push Notification
    dispatchNativeBrowserNotification({
      title,
      body,
      tag: isTest
        ? `waypoint-test-${Date.now()}`
        : `waypoint-nn-${new Date().toISOString().slice(0, 10)}`,
      onClick: () => {
        window.focus();
      },
    });

    // 2. Play gentle harmonic chime if enabled
    if (notificationConfig.soundEnabled) {
      playNotificationChime();
    }

    // 3. Show In-App Notification Banner
    setActiveInAppBanner({
      isOpen: true,
      pendingTasks: tasksToReport,
      isTest,
    });
  };

  // Browser Push Notification Scheduling Engine
  React.useEffect(() => {
    // Refresh permission state on mount
    setNotificationPermission(getNotificationPermission());

    const checkSchedule = () => {
      if (!notificationConfig.enabled) return;

      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentHHMM = `${hh}:${mm}`;
      const todayDateStr = now.toISOString().slice(0, 10);

      // Check if snoozed
      if (notificationConfig.snoozedUntil) {
        const snoozeExpiry = new Date(notificationConfig.snoozedUntil).getTime();
        if (now.getTime() < snoozeExpiry) {
          return;
        }
      }

      // Check if scheduled time matches current minute
      if (currentHHMM === notificationConfig.scheduledTime) {
        if (notificationConfig.lastNotifiedDate === todayDateStr) {
          return; // Already notified today
        }

        const pendingNN = getPendingNonNegotiables(tasks);
        if (pendingNN.length > 0) {
          handleTriggerPushNotification(false);
        }

        // Mark today as notified for this schedule
        const updatedConfig = {
          ...notificationConfig,
          lastNotifiedDate: todayDateStr,
          snoozedUntil: undefined,
        };
        setNotificationConfig(updatedConfig);
        saveStoredNotificationConfig(updatedConfig);
      }
    };

    // Run immediate check and interval every 15s
    checkSchedule();
    const intervalId = setInterval(checkSchedule, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setNotificationPermission(getNotificationPermission());
        checkSchedule();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [notificationConfig, tasks]);

  // Snooze handler
  const handleSnoozeNotification = (minutes: number = 15) => {
    const snoozeDate = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    const updated = {
      ...notificationConfig,
      snoozedUntil: snoozeDate,
    };
    setNotificationConfig(updated);
    saveStoredNotificationConfig(updated);
    setActiveInAppBanner(null);
  };

  // Handle Login with background credential check & invisible RBAC routing
  const handleLogin = (user: AuthUser) => {
    setAuthUser(user);
    saveAuthSession(user);

    // If logging in as an organization, ensure fresh telemetry data
    if (user.role === 'Organization') {
      setTelemetryPackets(getAnonymizedTelemetry());
    }
  };

  // Sign out cleanly back to login screen
  const handleSignOut = () => {
    setAuthUser(null);
    clearAuthSession();
  };

  // Toggle task completion
  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
    setTasks(updated);

    // Record anonymized telemetry sync if linked to commissioning organization
    if (userProfile.orgCode) {
      const completedCount = updated.filter((t) => t.isCompleted).length;
      const rate = Math.round((completedCount / updated.length) * 100);

      recordAnonymizedTelemetryEvent({
        orgCode: userProfile.orgCode,
        ageBracket: userProfile.ageBracket,
        redButtonUsed: false,
        alcoholRiskBand: userProfile.auditBand,
        sadqDependenceBand: userProfile.sadqBand,
        substanceRiskBand: userProfile.duditBand,
        anxietyBand: userProfile.gad7Band,
        depressionBand: userProfile.phq9Band,
        youthSubstanceBand: userProfile.crafftBand,
        youthWellbeingBand: userProfile.wemwbsBand,
        pillarAdherenceRate: rate,
        interventionsEngagedCount: completedCount,
        totalInterventions: updated.length,
        sadqTriggered: Boolean(userProfile.baselineSadqScore && userProfile.baselineSadqScore > 0),
        duditTriggered: Boolean(userProfile.baselineDuditScore && userProfile.baselineDuditScore >= 6),
        phqGadTriggered: Boolean(
          (userProfile.baselinePhq9Score && userProfile.baselinePhq9Score >= 10) ||
            (userProfile.baselineGad7Score && userProfile.baselineGad7Score >= 10)
        ),
        triagePathways: userProfile.triagePathwaysTriggered || ['AUDIT', 'GAD7'],
        microTaskEnabled: userProfile.microTaskMode,
        sensoryMode: userProfile.sensoryMode,
      });

      setTelemetryPackets(getAnonymizedTelemetry());
    }
  };

  // Complete onboarding
  const handleCompleteOnboarding = (newProfile: WaypointUserProfile) => {
    setUserProfile(newProfile);
    const freshTasks = getLocalTasks(newProfile);
    setTasks(freshTasks);

    // Record initial anonymized onboarding registration
    if (newProfile.orgCode) {
      recordAnonymizedTelemetryEvent({
        orgCode: newProfile.orgCode,
        ageBracket: newProfile.ageBracket,
        redButtonUsed: false,
        alcoholRiskBand: newProfile.auditBand,
        sadqDependenceBand: newProfile.sadqBand,
        substanceRiskBand: newProfile.duditBand,
        anxietyBand: newProfile.gad7Band,
        depressionBand: newProfile.phq9Band,
        youthSubstanceBand: newProfile.crafftBand,
        youthWellbeingBand: newProfile.wemwbsBand,
        pillarAdherenceRate: 0,
        interventionsEngagedCount: 0,
        totalInterventions: freshTasks.length,
        sadqTriggered: Boolean(newProfile.baselineSadqScore && newProfile.baselineSadqScore > 0),
        duditTriggered: Boolean(newProfile.baselineDuditScore && newProfile.baselineDuditScore >= 6),
        phqGadTriggered: Boolean(
          (newProfile.baselinePhq9Score && newProfile.baselinePhq9Score >= 10) ||
            (newProfile.baselineGad7Score && newProfile.baselineGad7Score >= 10)
        ),
        triagePathways: newProfile.triagePathwaysTriggered || ['AUDIT', 'GAD7'],
        microTaskEnabled: newProfile.microTaskMode,
        sensoryMode: newProfile.sensoryMode,
      });
      setTelemetryPackets(getAnonymizedTelemetry());
    }
  };

  // Reset onboarding
  const handleResetOnboarding = () => {
    const resetProfile: WaypointUserProfile = {
      ...userProfile,
      onboardingCompleted: false,
    };
    setUserProfile(resetProfile);
  };

  // 1. If not authenticated, render the Clean Safeguarded Authentication Flow
  if (!authUser) {
    return (
      <SafeguardedAuthScreen
        onLogin={handleLogin}
        onTriggerCrisisBypass={() => setIsCrisisModalOpen(true)}
      />
    );
  }

  // 2. Invisible RBAC Routing:
  // If Organization role -> Web Dashboard (OrgB2BDashboard)
  // If Personal role -> Mobile App (OnboardingTriageController or WaypointMobileDashboard)
  return (
    <div className="min-h-screen bg-[#394452] text-slate-100 flex flex-col font-sans">
      <main className="flex-1 w-full flex flex-col items-center justify-start overflow-y-auto">
        {authUser.role === 'Admin' ? (
          <AdminPanel
            adminUser={authUser}
            onSignOut={handleSignOut}
            onSwitchToStaff={(staffUser) => {
              const user: AuthUser = staffUser || {
                id: 'staff-demo',
                email: 'jordan.worker@yjs.gov.uk',
                name: 'Jordan Miller',
                role: 'Organization',
                orgCode: 'YJS-LEEDS',
                practitionerRole: 'Youth Justice Key Worker',
                lastLogin: new Date().toISOString(),
              };
              setAuthUser(user);
              saveAuthSession(user);
            }}
            onSwitchToPersonal={() => {
              const user: AuthUser = {
                id: 'usr-demo',
                email: 'alex.morgan@waypoint.nhs.uk',
                name: 'Alex Morgan',
                role: 'Personal',
                orgCode: 'YJS-LEEDS',
                lastLogin: new Date().toISOString(),
              };
              setAuthUser(user);
              saveAuthSession(user);
            }}
          />
        ) : authUser.role === 'Organization' || authUser.role === 'Staff' ? (
          <OrgB2BDashboard
            telemetryData={telemetryPackets}
            currentOrgCode={authUser.orgCode || 'CGL-KIRK'}
            currentUser={authUser}
            onSignOut={handleSignOut}
            onOpenAdmin={() => {
              const adminUser: AuthUser = {
                id: 'admin-elevated',
                email: 'admin@waypoint.gov.uk',
                name: 'System Administrator',
                role: 'Admin',
                orgCode: 'WAYPOINT-HQ',
                practitionerRole: 'Service Manager & Designated Safeguarding Lead',
                lastLogin: new Date().toISOString(),
              };
              setAuthUser(adminUser);
              saveAuthSession(adminUser);
            }}
          />
        ) : !userProfile.onboardingCompleted ? (
          <OnboardingTriageController
            onComplete={handleCompleteOnboarding}
            initialProfile={userProfile}
          />
        ) : (
          <WaypointMobileDashboard
            userProfile={userProfile}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onResetOnboarding={handleResetOnboarding}
            onUpdateProfile={setUserProfile}
            onSignOut={handleSignOut}
            onUpdateTasks={(updated) => setTasks(updated)}
            notificationConfig={notificationConfig}
            onOpenNotificationSchedule={() => setIsNotificationModalOpen(true)}
            pendingNonNegotiablesCount={getPendingNonNegotiables(tasks).length}
          />
        )}
      </main>

      {/* Push Notification In-App Banner */}
      {activeInAppBanner && (
        <InAppNotificationBanner
          isOpen={activeInAppBanner.isOpen}
          onClose={() => setActiveInAppBanner(null)}
          pendingTasks={activeInAppBanner.pendingTasks}
          onSnooze={handleSnoozeNotification}
          onViewTasks={() => {
            setActiveInAppBanner(null);
            const actionZone = document.getElementById('daily-action-zone');
            if (actionZone) {
              actionZone.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          isTest={activeInAppBanner.isTest}
        />
      )}

      {/* Push Notification Scheduling Modal */}
      <NotificationSchedulerModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        config={notificationConfig}
        onSaveConfig={handleSaveNotificationConfig}
        permissionState={notificationPermission}
        onRequestPermission={handleRequestPermission}
        onTriggerTestNotification={() => handleTriggerPushNotification(true)}
        tasks={tasks}
      />

      {/* Emergency Crisis Bypass Modal (Always Accessible) */}
      <CrisisModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
        userProfile={userProfile}
      />
    </div>
  );
}
export default App;
