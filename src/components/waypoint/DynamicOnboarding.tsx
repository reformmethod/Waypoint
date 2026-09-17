import React from 'react';
import { WaypointUserProfile } from '../../types/waypoint';
import { OnboardingTriageController } from './OnboardingTriageController';

interface DynamicOnboardingProps {
  onComplete: (profile: WaypointUserProfile) => void;
  initialProfile?: WaypointUserProfile;
}

/**
 * DynamicOnboarding Wrapper
 * Delegates directly to the V4 Cascading Clinical Triage Engine (OnboardingTriageController)
 */
export const DynamicOnboarding: React.FC<DynamicOnboardingProps> = ({
  onComplete,
  initialProfile,
}) => {
  return (
    <OnboardingTriageController
      onComplete={onComplete}
      initialProfile={initialProfile}
    />
  );
};
