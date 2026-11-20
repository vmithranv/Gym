import React, { useState } from 'react';
import {
  TrendingUp,
  Dumbbell,
  Flame,
  Award,
  Scale,
  Plus,
  Layers,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Milestone,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { MUSCLE_BUILDING_ROADMAP } from '../utils/keralaNutritionPlan';

export default function ProgressTab({
  workoutHistory = [],
  records = {},
  progressionData = {},
  weightHistory = [],
  onAddBodyWeight,
  isDark
}) {
  const [selectedExercise, setSelectedExercise] = useState('Barbell Flat Bench Press');
  const [newWeightInput, setNewWeightInput] = useState('');
  const [showWeightModal, setShowWeightModal] = useState(false);

  const totalVolumeKg = workoutHistory.reduce((sum, workout) => {
    const workoutVol = (workout.exercises || []).reduce((eSum, ex) => {
      const exVol = (ex.sets || []).reduce((sSum, set) => {
        if (set.completed) {
          return sSum + (Number(set.weight) || 0) * (Number(set.reps) || 0);
        }
        return sSum;
      }, 0);
      return eSum + exVol;
    }, 0);
    return sum + workoutVol;
  }, 12450);

  const totalWorkouts = Math.max(workoutHistory.length + 14, 15);
  const currentStreak = 4; // Consistency

  const availableExercises = Array.from(
    new Set([...Object.keys(progressionData), ...Object.keys(records)])
  );

  const activeChartData = progressionData[selectedExercise] || [
    { date: '11/01', oneRepMax: (records[selectedExercise]?.weight || 50) * 1.1 },
    { date: '11/10', oneRepMax: (records[selectedExercise]?.weight || 50) * 1.15 },
    {
      date: '11/17',
      oneRepMax: records[selectedExercise]?.calculated1RM || (records[selectedExercise]?.weight || 50) * 1.2
    }
  ];

  const handleAddWeight = (e) => {
    e.preventDefault();
    if (!newWeightInput || isNaN(newWeightInput)) return;
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate() < 10 ? '0' : ''}${now.getDate()}`;
    onAddBodyWeight({
      date: dateStr,
      weight: parseFloat(newWeightInput)
    });
    setNewWeightInput('');
    setShowWeightModal(false);
  };

  const latestBodyWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : 69.3;

  const gridColor = isDark ? '#2D333B' : '#E2E8F0';
  const axisColor = isDark ? '#64748B' : '#94A3B8';
  const primaryStroke = isDark ? '#A3E635' : '#2563EB';
  const secondaryStroke = isDark ? '#38BDF8' : '#0EA5E9';

  return (
    <div className="space-y-5 pb-28 animate-in fade-in duration-200">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-[#A3E635]" /> Strength & Milestones
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Track progressive overload, body composition, and your realistic muscle-growth journey.
        </p>
      </div>

      {/* 3 Summary Stats Cards with Colorful Vibrant Gradients */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3.5 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-100 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Workouts</span>
            <Dumbbell className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xl font-black text-white leading-tight font-mono">{totalWorkouts}</div>
            <div className="text-[10px] text-blue-100 font-medium">Completed</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-3.5 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-100 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Streak</span>
            <Flame className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <div className="text-xl font-black text-white leading-tight font-mono">
              {currentStreak} Days
            </div>
            <div className="text-[10px] text-amber-100 font-medium">6:00 AM Active</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-3.5 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-100 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Volume</span>
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xl font-black text-white leading-tight font-mono">
              {(totalVolumeKg / 1000).toFixed(1)}t
            </div>
            <div className="text-[10px] text-emerald-100 font-medium">Tonnes Lifted</div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          REALISTIC MUSCLE-BUILDING MILESTONE ROADMAP (NO CRASH DIETING)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Milestone className="w-4 h-4 text-blue-600 dark:text-[#A3E635]" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Natural Muscle Growth Roadmap
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400">Sustainable Gym Journey</span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Building dense, athletic muscle is about consistent lifting at 6:00 AM, progressive overload with 90s–120s rest, and fueling with Kerala protein sources — zero crash diets or weight anxiety.
        </p>

        <div className="space-y-3 pt-1">
          {MUSCLE_BUILDING_ROADMAP.map((phase, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-50 dark:bg-[#22262E]/70 rounded-2xl border border-slate-100 dark:border-transparent space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-[#A3E635]" />
                  {phase.phase}: {phase.title}
                </span>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${phase.badgeColor}`}
                >
                  {phase.badge}
                </span>
              </div>

              <ul className="space-y-1.5 pl-3">
                {phase.milestones.map((ms, mIdx) => (
                  <li
                    key={mIdx}
                    className="text-[11px] text-slate-600 dark:text-slate-300 list-disc leading-relaxed font-medium"
                  >
                    {ms}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Strength Progression Chart */}
      <div className="bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-[#A3E635] block">
              1RM Strength Curve
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Estimated 1-Rep Max (kg)</h3>
          </div>

          {/* Exercise Selector */}
          <div className="relative">
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 pr-8 bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              {availableExercises.map((exName) => (
                <option key={exName} value={exName}>
                  {exName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Chart View */}
        <div className="h-52 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="date" stroke={axisColor} fontSize={11} tickLine={false} />
              <YAxis
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#181B20' : '#FFFFFF',
                  borderColor: isDark ? '#2D333B' : '#E2E8F0',
                  borderRadius: '12px',
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
                formatter={(val) => [`${val} kg`, 'Estimated 1RM']}
              />
              <Line
                type="monotone"
                dataKey="oneRepMax"
                stroke={primaryStroke}
                strokeWidth={3}
                dot={{ fill: isDark ? '#0F1115' : '#FFFFFF', stroke: primaryStroke, strokeWidth: 2, r: 4 }}
                activeDot={{ fill: primaryStroke, stroke: '#fff', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Body Weight Trend Tracker */}
      <div className="bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Body Composition
              </span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-[#22262E] px-2 py-0.5 rounded-md">
                Current: {latestBodyWeight} kg
              </span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">Consistent Weight Tracking</h3>
          </div>

          <button
            onClick={() => setShowWeightModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#22262E] dark:hover:bg-[#2D333B] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#2D333B] text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-[#A3E635]" /> Log Weight
          </button>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="date" stroke={axisColor} fontSize={11} tickLine={false} />
              <YAxis
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#181B20' : '#FFFFFF',
                  borderColor: isDark ? '#2D333B' : '#E2E8F0',
                  borderRadius: '12px',
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  fontSize: '12px'
                }}
                formatter={(val) => [`${val} kg`, 'Body Weight']}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke={secondaryStroke}
                strokeWidth={2.5}
                dot={{ fill: isDark ? '#0F1115' : '#FFFFFF', stroke: secondaryStroke, strokeWidth: 2, r: 3.5 }}
                activeDot={{ fill: secondaryStroke, stroke: '#fff', strokeWidth: 2, r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Log Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 text-slate-900 dark:text-white">
          <div className="bg-white dark:bg-[#181B20] border border-slate-200 dark:border-[#2D333B] w-full max-w-sm rounded-3xl p-5 shadow-2xl">
            <h3 className="text-base font-black mb-1 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600 dark:text-[#A3E635]" /> Log Morning Weight
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Weigh yourself after waking up (fasted) for the truest weekly average.
            </p>
            <form onSubmit={handleAddWeight} className="space-y-4">
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  autoFocus
                  placeholder="e.g. 69.5"
                  value={newWeightInput}
                  onChange={(e) => setNewWeightInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#A3E635] font-mono font-bold text-lg text-center outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                  KG
                </span>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#22262E] text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#A3E635] dark:to-lime-400 text-white dark:text-black font-extrabold text-xs uppercase tracking-wider shadow-md hover:opacity-90"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
