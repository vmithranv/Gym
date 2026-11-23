import React, { useState } from 'react';
import {
  Flame,
  Dumbbell,
  Scale,
  Calendar,
  Sparkles,
  TrendingUp,
  Award,
  Check,
  ChevronRight,
  Play,
  Heart,
  Clock,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function HomeDashboardTab({
  workoutHistory = [],
  records = {},
  weightHistory = [],
  onAddBodyWeight,
  onNavigateToTab,
  onStartTodayWorkout,
  todayRoutine,
  todayDayName,
  isRestDay
}) {
  const [weightInput, setWeightInput] = useState(
    weightHistory.length > 0 ? String(weightHistory[0].weight) : '65'
  );
  const [weightSavedNotice, setWeightSavedNotice] = useState(false);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // 1. Calculate Total Workouts
  const totalWorkouts = workoutHistory.length;

  // 2. Calculate Total Volume (kg)
  const totalVolumeKg = workoutHistory.reduce((sum, w) => sum + (Number(w.totalVolume) || 0), 0);

  // 3. Workouts This Week
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekCount = workoutHistory.filter((w) => {
    const wDate = new Date(w.date || w.timestamp);
    return wDate >= startOfWeek;
  }).length;

  // 4. Calculate Current Day Streak
  const calculateStreak = () => {
    if (workoutHistory.length === 0) return 0;
    const sortedDates = Array.from(
      new Set(workoutHistory.map((w) => (w.date || new Date(w.timestamp).toISOString().split('T')[0])))
    ).sort().reverse();

    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 90; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sortedDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today hasn't been logged yet, allow yesterday to continue streak
        if (i === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }
    return streak;
  };

  const streakDays = calculateStreak();

  // 5. Generate 90-Day Rolling Activity Heatmap
  const generate90DayHeatmap = () => {
    const days = [];
    const workoutDateCounts = {};

    workoutHistory.forEach((w) => {
      const d = w.date || new Date(w.timestamp).toISOString().split('T')[0];
      workoutDateCounts[d] = (workoutDateCounts[d] || 0) + 1;
    });

    const endDate = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(endDate);
      d.setDate(endDate.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = workoutDateCounts[dateStr] || 0;
      days.push({
        date: dateStr,
        dayOfWeek: d.getDay(),
        count,
        level: count >= 2 ? 3 : count === 1 ? 2 : 0
      });
    }
    return days;
  };

  const heatmapDays = generate90DayHeatmap();

  // Save Weight handler
  const handleSaveWeight = (e) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 0) {
      onAddBodyWeight(val);
      setWeightSavedNotice(true);
      try {
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
      } catch (err) {}
      setTimeout(() => setWeightSavedNotice(false), 2500);
    }
  };

  const lastLoggedWeight = weightHistory.length > 0 ? weightHistory[0].weight : 65;

  return (
    <div className="space-y-4 pb-32 animate-in fade-in duration-200">
      {/* ─────────────────────────────────────────────────────────────
          1. GREETING CARD (TIME OF DAY & CONSISTENCY QUOTE)
         ───────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-blue-600 to-indigo-700 dark:from-[#181B20] dark:via-[#1B222C] dark:to-[#0F1115] text-white p-5 sm:p-6 shadow-xl border border-teal-500/20 dark:border-[#2D333B]">
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 dark:bg-[#A3E635]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/20 dark:bg-[#A3E635]/20 text-white dark:text-[#A3E635] backdrop-blur-xs mb-2">
              <Sparkles className="w-3.5 h-3.5" /> RepKraft Dashboard
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {getGreeting()}, Athlete! 👋
            </h2>
            <p className="text-blue-100 dark:text-slate-400 text-xs sm:text-sm font-medium mt-1">
              "Master your routine. Consistency is key!"
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/15 dark:bg-[#A3E635]/15 text-white dark:text-[#A3E635] flex items-center justify-center shrink-0 shadow-inner">
            <Zap className="w-6 h-6 fill-current" />
          </div>
        </div>

        {/* Quick CTA to today's workout */}
        <div className="mt-4 pt-3 border-t border-white/15 dark:border-[#2D333B] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-200 dark:text-slate-400 block">
              Today: {todayDayName}
            </span>
            <span className="text-xs font-black text-white">
              {todayRoutine?.name || "Push-Pull-Legs Split"}
            </span>
          </div>
          <button
            onClick={() => onNavigateToTab('workout')}
            className="px-3.5 py-1.5 rounded-xl bg-white text-blue-600 dark:bg-[#A3E635] dark:text-black font-extrabold text-xs flex items-center gap-1 shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            <span>Train Now</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. QUICK BODY WEIGHT CARD (PRE-FILLED WITH 65 KG)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-600 dark:text-[#A3E635] flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Body Weight Check-In
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">
                Last: <strong className="text-teal-600 dark:text-[#A3E635]">{lastLoggedWeight} kg</strong>
              </span>
            </div>
          </div>

          {weightSavedNotice && (
            <span className="text-[11px] font-bold text-emerald-600 dark:text-[#A3E635] flex items-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveWeight} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="e.g. 65"
              className="w-full pl-3 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] font-mono text-sm font-black focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
            <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">
              kg
            </span>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 dark:from-[#A3E635] dark:to-lime-400 text-white dark:text-black font-extrabold text-xs uppercase tracking-wider shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save</span>
          </button>
        </form>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. 3-STAT METRICS ROW (TOTAL WORKOUTS, TOTAL VOLUME, THIS WEEK)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Total Workouts */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] shadow-xs text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block truncate">
            Total Workouts
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            {totalWorkouts}
          </div>
          <span className="text-[10px] font-semibold text-teal-600 dark:text-[#A3E635] block">
            All-time
          </span>
        </div>

        {/* Total Volume */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] shadow-xs text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block truncate">
            Total Volume
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono truncate">
            {totalVolumeKg > 1000 ? `${(totalVolumeKg / 1000).toFixed(1)}k` : totalVolumeKg}
          </div>
          <span className="text-[10px] font-semibold text-blue-600 dark:text-sky-400 block">
            kg lifted
          </span>
        </div>

        {/* This Week */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] shadow-xs text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block truncate">
            This Week
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            {thisWeekCount}<span className="text-xs font-normal text-slate-400">/6</span>
          </div>
          <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 block">
            Sessions
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. CURRENT STREAK BANNER ("On Fire!")
         ───────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-rose-500/15 border border-amber-500/30 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Flame className="w-6 h-6 fill-white" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              Streak Status
            </span>
            <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
              {streakDays > 0
                ? `Current Streak: ${streakDays} ${streakDays === 1 ? 'Day' : 'Days'} – On fire! 🔥`
                : 'Current Streak: Ready to build momentum! 🚀'}
            </h3>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              6-day PPL active consistency
            </span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-xs font-black shrink-0">
          {streakDays}d
        </span>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. 3-MONTH ACTIVITY HEATMAP (90-DAY ROLLING CONTRIBUTION GRID)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
              90-Day Activity Heatmap
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            Last 3 Months
          </span>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-1 scrollbar-none">
          <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-[320px]">
            {heatmapDays.map((day, idx) => {
              // Level colors
              let bg = 'bg-slate-100 dark:bg-[#22262E]';
              if (day.level === 2) bg = 'bg-emerald-400 dark:bg-[#A3E635]/80 shadow-[0_0_6px_rgba(163,230,53,0.5)]';
              if (day.level === 3) bg = 'bg-emerald-600 dark:bg-[#A3E635] shadow-[0_0_8px_rgba(163,230,53,0.8)]';

              return (
                <div
                  key={idx}
                  title={`${day.date}: ${day.count} workout(s)`}
                  className={`w-3.5 h-3.5 rounded-sm ${bg} transition-colors cursor-pointer hover:ring-2 hover:ring-blue-400`}
                />
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-[#2D333B]">
          <span>Mon – Sun rows</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-xs bg-slate-100 dark:bg-[#22262E]" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-400 dark:bg-[#A3E635]/70" />
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-600 dark:bg-[#A3E635]" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. QUICK SHORTCUT CARDS TO KEY MODULES
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigateToTab('workout')}
          className="p-4 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-left hover:border-blue-500/40 active:scale-98 transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-2 shadow-md">
            <Dumbbell className="w-4 h-4" />
          </div>
          <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center justify-between">
            <span>Workout</span>
            <ChevronRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-1 transition-transform" />
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            6-Day Push-Pull-Legs
          </p>
        </button>

        <button
          onClick={() => onNavigateToTab('cardio')}
          className="p-4 rounded-3xl bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-500/20 text-left hover:border-rose-500/40 active:scale-98 transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center mb-2 shadow-md">
            <Heart className="w-4 h-4" />
          </div>
          <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center justify-between">
            <span>Cardio</span>
            <ChevronRight className="w-3.5 h-3.5 text-rose-500 group-hover:translate-x-1 transition-transform" />
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Guided Interval Timers
          </p>
        </button>
      </div>
    </div>
  );
}
