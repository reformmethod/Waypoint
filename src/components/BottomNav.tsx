import React from 'react';
import { CheckSquare, PlusCircle, Activity, Zap } from 'lucide-react';
import { ScreenType } from '../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
  pendingNonNegotiablesCount: number;
}

export function BottomNav({
  currentScreen,
  onSelectScreen,
  pendingNonNegotiablesCount,
}: BottomNavProps) {
  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Application Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#090a0f]/95 backdrop-blur-xl border-t border-white/10 max-w-lg mx-auto"
    >
      <div className="grid grid-cols-3 h-16 font-mono">
        {/* Screen 1: Dashboard */}
        <button
          id="nav-tab-dashboard"
          onClick={() => onSelectScreen('dashboard')}
          aria-label="Dashboard screen"
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            currentScreen === 'dashboard'
              ? 'text-cyan-400 font-bold'
              : 'text-zinc-500 hover:text-zinc-300 font-normal'
          }`}
        >
          <div className="relative">
            <CheckSquare className="w-5 h-5" />
            {pendingNonNegotiablesCount > 0 && currentScreen !== 'dashboard' && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-cyan-400 text-[#050505] font-black rounded-full text-[10px] flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                {pendingNonNegotiablesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-wider uppercase">Protocol</span>
          {currentScreen === 'dashboard' && (
            <div className="absolute bottom-0.5 w-8 h-1 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
          )}
        </button>

        {/* Screen 2: Add Task */}
        <button
          id="nav-tab-add-habit"
          onClick={() => onSelectScreen('add-habit')}
          aria-label="Add Task screen"
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            currentScreen === 'add-habit'
              ? 'text-cyan-400 font-bold'
              : 'text-zinc-500 hover:text-zinc-300 font-normal'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border -mt-2 transition-all ${
              currentScreen === 'add-habit'
                ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-[#151722] text-cyan-400 border-white/10 hover:border-white/25 shadow-md'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-wider uppercase">New Task</span>
          {currentScreen === 'add-habit' && (
            <div className="absolute bottom-0.5 w-8 h-1 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
          )}
        </button>

        {/* Screen 3: Life Radar */}
        <button
          id="nav-tab-progress"
          onClick={() => onSelectScreen('progress')}
          aria-label="Life Radar and Telemetry screen"
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            currentScreen === 'progress'
              ? 'text-cyan-400 font-bold'
              : 'text-zinc-500 hover:text-zinc-300 font-normal'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] tracking-wider uppercase">Life Radar</span>
          {currentScreen === 'progress' && (
            <div className="absolute bottom-0.5 w-8 h-1 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
          )}
        </button>
      </div>
    </nav>
  );
}
