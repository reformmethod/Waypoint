import React from 'react';

interface WaypointLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'color' | 'monochrome' | 'dark' | 'light' | 'warm-sand';
  iconOnly?: boolean;
}

/**
 * Waypoint A-Tier Logo:
 * A softly rounded, continuous-line "W" that resembles a gently rolling path leading forward,
 * followed by the single word "Waypoint". Friendly, approachable, zero medical or corporate clutter.
 */
export const WaypointLogo: React.FC<WaypointLogoProps> = ({
  size = 'md',
  variant = 'color',
  iconOnly = false,
}) => {
  const isDark = variant === 'dark';
  const isLight = variant === 'light' || variant === 'warm-sand';

  const sizeClasses = {
    sm: { box: 'w-7 h-7', text: 'text-lg', stroke: '3.5' },
    md: { box: 'w-9 h-9', text: 'text-2xl', stroke: '4' },
    lg: { box: 'w-12 h-12', text: 'text-3xl', stroke: '4.5' },
  }[size];

  const strokeColor = isDark ? '#2D3748' : isLight ? '#F7FAFC' : '#718096';

  return (
    <div className="inline-flex items-center gap-2.5 select-none" aria-label="Waypoint">
      {/* Continuous-line softly rounded "W" rolling path */}
      <div className={`${sizeClasses.box} flex items-center justify-center shrink-0`}>
        <svg
          viewBox="0 0 52 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          {/* Gentle rolling path line */}
          <path
            d="M 6 12 C 8 26, 12 32, 18 32 C 23.5 32, 25.5 19, 26 17 C 26.5 19, 28.5 32, 34 32 C 40 32, 44 26, 46 12"
            stroke={strokeColor}
            strokeWidth={sizeClasses.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Subtle forward focal dot at the horizon of the path */}
          <circle cx="46" cy="12" r="2.5" fill="#C25953" />
        </svg>
      </div>

      {!iconOnly && (
        <span
          className={`font-display font-bold tracking-tight leading-none ${
            isDark ? 'text-[#1A202C]' : 'text-white'
          } ${sizeClasses.text}`}
        >
          Waypoint
        </span>
      )}
    </div>
  );
};
