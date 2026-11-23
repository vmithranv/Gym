import React from 'react';
import { Home, Dumbbell, Layers, Heart, TrendingUp, UtensilsCrossed } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, activeWorkoutInProgress }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'workout', label: 'Workout', icon: Dumbbell, hasBadge: activeWorkoutInProgress },
    { id: 'exercises', label: 'Exercises', icon: Layers },
    { id: 'cardio', label: 'Cardio', icon: Heart },
    { id: 'stats', label: 'Stats', icon: TrendingUp },
    { id: 'nutrition', label: 'Nutrition', icon: UtensilsCrossed },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#181B20]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-[#2D333B] pb-[env(safe-area-inset-bottom,8px)] pt-1.5 shadow-2xl max-w-lg mx-auto transition-colors">
      <div className="flex items-center justify-between px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-0.5 transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive
                  ? 'text-teal-600 dark:text-[#A3E635]'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                {tab.hasBadge && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 dark:bg-[#A3E635] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600 dark:bg-[#A3E635]"></span>
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold tracking-tight mt-0.5 truncate max-w-[54px] ${isActive ? 'text-teal-600 dark:text-[#A3E635]' : 'text-slate-400'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute top-0 w-6 h-[2px] bg-teal-600 dark:bg-[#A3E635] rounded-full shadow-[0_0_8px_rgba(20,184,166,0.4)] dark:shadow-[0_0_8px_#A3E635]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
