import React from 'react';
import { Dumbbell, Calendar, TrendingUp, UtensilsCrossed } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, activeWorkoutInProgress }) {
  const tabs = [
    { id: 'workout', label: 'Workout', icon: Dumbbell, hasBadge: activeWorkoutInProgress },
    { id: 'routines', label: 'Routines', icon: Calendar },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'nutrition', label: 'Nutrition', icon: UtensilsCrossed },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#181B20]/95 backdrop-blur-lg border-t border-[#2D333B] pb-[env(safe-area-inset-bottom,8px)] pt-2 shadow-2xl max-w-lg mx-auto">
      <div className="flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all duration-200 active:scale-95 ${
                isActive ? 'text-[#A3E635]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                {tab.hasBadge && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A3E635] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A3E635]"></span>
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-semibold tracking-wide mt-1 ${isActive ? 'text-[#A3E635]' : 'text-slate-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-8 h-[2px] bg-[#A3E635] rounded-full shadow-[0_0_8px_#A3E635]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
