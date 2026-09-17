import React from 'react';
import {
  Sun,
  Pill,
  Dumbbell,
  Wallet,
  ShieldCheck,
  BookHeart,
  Brain,
  Heart,
  Sparkles,
  Smile,
  Droplets,
  Bed,
  Compass,
  Anchor,
  Users,
  CheckCircle2,
  Coffee,
  Zap,
  Flame,
  Shield,
  Activity,
  Target,
  PhoneCall,
  AlertTriangle,
  LifeBuoy,
  HeartPulse,
  Scale,
  Sparkle,
  SmilePlus,
} from 'lucide-react';

interface HabitIconProps {
  name: string;
  className?: string;
  size?: number;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Sun,
  Pill,
  Dumbbell,
  Wallet,
  ShieldCheck,
  BookHeart,
  Brain,
  Heart,
  Sparkles,
  Smile,
  Droplets,
  Bed,
  Compass,
  Anchor,
  Users,
  CheckCircle2,
  Coffee,
  Zap,
  Flame,
  Shield,
  Activity,
  Target,
  PhoneCall,
  AlertTriangle,
  LifeBuoy,
  HeartPulse,
  Scale,
  Sparkle,
  SmilePlus,
};

export const AVAILABLE_ICONS = [
  { name: 'Sun', label: 'Morning / Mind' },
  { name: 'Pill', label: 'Medication' },
  { name: 'Dumbbell', label: 'Exercise' },
  { name: 'Wallet', label: 'Finance' },
  { name: 'ShieldCheck', label: 'Recovery / Safe' },
  { name: 'BookHeart', label: 'Journaling' },
  { name: 'Brain', label: 'Mental Health' },
  { name: 'Heart', label: 'Self Love' },
  { name: 'Sparkles', label: 'Clarity' },
  { name: 'Droplets', label: 'Hydration' },
  { name: 'Bed', label: 'Rest / Sleep' },
  { name: 'Users', label: 'Support / Group' },
  { name: 'Anchor', label: 'Grounding' },
  { name: 'Compass', label: 'Direction' },
  { name: 'Target', label: 'Focus' },
  { name: 'Activity', label: 'Vitality' },
];

export function HabitIcon({ name, className = 'w-5 h-5', size }: HabitIconProps) {
  const IconComponent = ICON_MAP[name] || Activity;
  return <IconComponent className={className} size={size} />;
}
