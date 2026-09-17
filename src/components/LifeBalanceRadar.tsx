import React, { useState } from 'react';
import { CorePillar, PillarScore } from '../types';
import { PILLAR_METADATA } from '../data/initialHabits';
import { Activity, Zap, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { HabitIcon } from './HabitIcon';

interface LifeBalanceRadarProps {
  scores: Record<CorePillar, PillarScore>;
  size?: number; // pixel width/height (defaults to 280)
  onSelectPillar?: (pillar: CorePillar) => void;
  selectedPillar?: CorePillar | 'All';
  showDetails?: boolean;
  timeframeLabel?: string;
}

interface AxisConfig {
  pillar: CorePillar;
  angleRad: number; // Angle in radians
  dx: number; // Unit circle x
  dy: number; // Unit circle y
  labelAnchor: 'middle' | 'start' | 'end';
}

export function LifeBalanceRadar({
  scores,
  size = 300,
  onSelectPillar,
  selectedPillar,
  showDetails = true,
  timeframeLabel = 'Today',
}: LifeBalanceRadarProps) {
  const [hoveredPillar, setHoveredPillar] = useState<CorePillar | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.38; // leave room for labels

  // 4 Axes mapped precisely:
  // Top: Physical Conditioning (-90 deg / -PI/2)
  // Right: Household/Family Ops (0 deg / 0)
  // Bottom: Financial Health (90 deg / PI/2)
  // Left: Mental Wellness (180 deg / PI)
  const AXES: AxisConfig[] = [
    {
      pillar: 'Physical Conditioning',
      angleRad: -Math.PI / 2,
      dx: 0,
      dy: -1,
      labelAnchor: 'middle',
    },
    {
      pillar: 'Household/Family Ops',
      angleRad: 0,
      dx: 1,
      dy: 0,
      labelAnchor: 'start',
    },
    {
      pillar: 'Financial Health',
      angleRad: Math.PI / 2,
      dx: 0,
      dy: 1,
      labelAnchor: 'middle',
    },
    {
      pillar: 'Mental Wellness',
      angleRad: Math.PI,
      dx: -1,
      dy: 0,
      labelAnchor: 'end',
    },
  ];

  // Grid levels (25%, 50%, 75%, 100%)
  const GRID_LEVELS = [0.25, 0.5, 0.75, 1.0];

  // Compute coordinates for data polygon
  const polygonPoints = AXES.map((axis) => {
    const score = scores[axis.pillar];
    const pct = score ? Math.min(100, Math.max(0, score.percentage)) : 0;
    // Minimum 14% base visual radius so the polygon remains a palpable tactile shape
    const normalizedRadius = maxRadius * (0.14 + (pct / 100) * 0.86);
    const x = cx + normalizedRadius * Math.cos(axis.angleRad);
    const y = cy + normalizedRadius * Math.sin(axis.angleRad);
    return { x, y, pct, axis, score };
  });

  const polygonPointsString = polygonPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Compute average readiness
  const totalScorePct = Math.round(
    AXES.reduce((acc, a) => acc + (scores[a.pillar]?.percentage || 0), 0) / AXES.length
  );

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Dynamic SVG Radar */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible transition-all duration-300"
          id="life-balance-radar-svg"
        >
          <defs>
            {/* Athletic Cyan-Emerald-Amber Linear Gradient */}
            <linearGradient id="radarFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.45" />
            </linearGradient>

            {/* Glowing filter for polygon stroke */}
            <filter id="radarNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Center Hub Gradient */}
            <radialGradient id="centerHub" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="1" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
            </radialGradient>
          </defs>

          {/* 1. Background Grid Webs (Concentric Diamond/Squares) */}
          {GRID_LEVELS.map((level) => {
            const r = maxRadius * level;
            const gridPts = AXES.map((axis) => {
              const gx = cx + r * Math.cos(axis.angleRad);
              const gy = cy + r * Math.sin(axis.angleRad);
              return `${gx.toFixed(1)},${gy.toFixed(1)}`;
            }).join(' ');

            return (
              <g key={`grid-level-${level}`}>
                <polygon
                  points={gridPts}
                  fill={level === 1.0 ? 'rgba(255,255,255,0.015)' : 'none'}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={level === 1.0 ? '1.5' : '1'}
                  strokeDasharray={level === 1.0 ? undefined : '3,3'}
                />
                {/* Micro tick labels on North axis */}
                {level > 0.25 && (
                  <text
                    x={cx + 5}
                    y={cy - r + 3}
                    fill="rgba(148,163,184,0.4)"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {Math.round(level * 100)}%
                  </text>
                )}
              </g>
            );
          })}

          {/* 2. Axis Crosshairs / Rays */}
          {AXES.map((axis) => {
            const x2 = cx + maxRadius * Math.cos(axis.angleRad);
            const y2 = cy + maxRadius * Math.sin(axis.angleRad);
            const meta = PILLAR_METADATA[axis.pillar];
            const isHovered = hoveredPillar === axis.pillar;
            const isSelected = selectedPillar === axis.pillar;

            return (
              <g key={`axis-ray-${axis.pillar}`}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={x2}
                  y2={y2}
                  stroke={isSelected || isHovered ? meta.colorHex : 'rgba(255,255,255,0.14)'}
                  strokeWidth={isSelected || isHovered ? '2' : '1'}
                  strokeDasharray="4,3"
                />
                {/* Endpoint Accent Tick */}
                <circle
                  cx={x2}
                  cy={y2}
                  r="2.5"
                  fill={meta.colorHex}
                  opacity={isSelected || isHovered ? 1 : 0.6}
                />
              </g>
            );
          })}

          {/* 3. The Dynamic Active Polygon (Expands smoothly with completed tasks) */}
          <polygon
            id="radar-dynamic-polygon"
            points={polygonPointsString}
            fill="url(#radarFillGradient)"
            stroke="#00f0ff"
            strokeWidth="2.5"
            filter="url(#radarNeonGlow)"
            className="transition-all duration-500 ease-out"
          />

          {/* 4. Center Core Radar Target Hub */}
          <circle cx={cx} cy={cy} r="14" fill="url(#centerHub)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r="4" fill="#00f0ff" className="animate-pulse" />

          {/* 5. Vertex Active Nodes (Glowing dots on the polygon perimeter) */}
          {polygonPoints.map((pt) => {
            const meta = PILLAR_METADATA[pt.axis.pillar];
            const isDone = pt.pct === 100;
            const isHovered = hoveredPillar === pt.axis.pillar;
            const isSelected = selectedPillar === pt.axis.pillar;

            return (
              <g
                key={`vertex-${pt.axis.pillar}`}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => onSelectPillar?.(pt.axis.pillar)}
                onMouseEnter={() => setHoveredPillar(pt.axis.pillar)}
                onMouseLeave={() => setHoveredPillar(null)}
              >
                {/* Glowing Aura Ring */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered || isSelected ? '9' : isDone ? '7' : '5'}
                  fill={meta.colorHex}
                  opacity={isDone ? 0.3 : 0.15}
                  className="transition-all duration-300"
                />
                {/* Node Solid Center */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered || isSelected ? '4.5' : '3.5'}
                  fill={meta.colorHex}
                  stroke="#090a0f"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
              </g>
            );
          })}
        </svg>

        {/* Center Readiness HUD Overlay */}
        <div className="absolute flex flex-col items-center pointer-events-none text-center">
          <span className="text-[10px] tracking-wider uppercase font-mono font-bold text-zinc-400">
            {timeframeLabel}
          </span>
          <span className="text-xl font-black font-display tracking-tight text-white flex items-center gap-0.5">
            {totalScorePct}%
          </span>
          <span className="text-[9px] font-semibold text-cyan-400 tracking-wide uppercase">
            {totalScorePct >= 90 ? 'Optimal' : totalScorePct >= 50 ? 'Calibrated' : 'Engaging'}
          </span>
        </div>
      </div>

      {/* 4 Interactive Pillar Stat Cards Surrounding / Below Radar */}
      {showDetails && (
        <div className="w-full grid grid-cols-2 gap-2 mt-2">
          {AXES.map((axis) => {
            const score = scores[axis.pillar] || {
              completedWeight: 0,
              totalWeight: 0,
              percentage: 0,
              tasksCount: 0,
              completedCount: 0,
            };
            const meta = PILLAR_METADATA[axis.pillar];
            const isSelected = selectedPillar === axis.pillar;
            const is100 = score.percentage === 100;

            return (
              <button
                key={`pillar-btn-${axis.pillar}`}
                id={`radar-pill-${meta.shortName.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSelectPillar?.(axis.pillar)}
                onMouseEnter={() => setHoveredPillar(axis.pillar)}
                onMouseLeave={() => setHoveredPillar(null)}
                className={`p-2.5 rounded-xl border text-left transition-all duration-200 relative overflow-hidden group ${
                  isSelected
                    ? `${meta.bg} border-${meta.accent}-500/50 shadow-[0_0_15px_rgba(0,240,255,0.15)] ring-1 ring-${meta.accent}-400`
                    : 'bg-[#12131a] hover:bg-[#181a24] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${meta.bg} ${meta.text} ${meta.border}`}
                    >
                      <HabitIcon name={meta.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-white truncate tracking-tight">
                      {meta.shortName}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-mono font-extrabold ${
                      is100 ? 'text-emerald-400' : meta.text
                    }`}
                  >
                    {score.percentage}%
                  </span>
                </div>

                {/* Progress bar inside each pillar card */}
                <div className="w-full h-1.5 bg-[#0a0a0e] rounded-full overflow-hidden border border-white/5 mt-1">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.max(4, score.percentage)}%`,
                      backgroundColor: meta.colorHex,
                      boxShadow: `0 0 8px ${meta.glow}`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between mt-1 text-[10px] text-zinc-400 font-mono">
                  <span>
                    {score.completedWeight}/{score.totalWeight} pts
                  </span>
                  <span className="text-zinc-500">
                    {score.completedCount}/{score.tasksCount} done
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
