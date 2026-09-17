import React from 'react';
import { CrisisModal, CrisisModalProps } from './CrisisModal';

// Backwards-compatible alias for existing imports
export const RedButtonGroundingModal: React.FC<CrisisModalProps> = (props) => {
  return <CrisisModal {...props} />;
};

export { CrisisModal };
