import React, { useState } from 'react';
import {
  TrendingUp,
  Dumbbell,
  Flame,
  Award,
  Scale,
  Plus,
  Calendar,
  Layers,
  ChevronDown
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

export default function ProgressTab({
  workoutHistory = [],
  records = {},
  progressionData = {},
  weightHistory = [],
  onAddBodyWeight
}) {
  const [selectedExercise, setSelectedExercise] = useState('Barbell Flat Bench Press');
  const [newWeightInput, setNewWeightInput] = useState('');
  const [showWeightModal, setShowWeightModal] = useState(false);

  // Compute Total Volume lifted across all workouts
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
  }, 14850); // Start with baseline historical volume

  const totalWorkouts = Math.max(workoutHistory.length + 18, 19);
  const currentStreak = 4; // 4 consecutive active gym days

  // Get list of available exercises for 1RM chart
  const availableExercises = Array.from(
    new Set([...Object.keys(progressionData), ...Object.keys(records)])
  );

  const activeChartData = progressionData[selectedExercise] || [
    { date: '11/01', oneRepMax: (records[selectedExercise]?.weight || 60) * 1.1 },
    { date: '11/10', oneRepMax: (records[selectedExercise]?.weight || 60) * 1.15 },
    {
      date: '11/17',
      oneRepMax: records[selectedExercise]?.calculated1RM || (records[selectedExercise]?.weight || 60) * 1.2
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

  const latestBodyWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : 79.2;

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#A3E635]" /> Strength & Progress
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Estimated 1-Rep Max (1RM) trends & body weight tracking.
        </p>
      </div>

      {/* 3 Summary Stats Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#181B20] border border-[#2D333B] p-3 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Workouts</span>
            <Dumbbell className="w-3.5 h-3.5 text-[#A3E635]" />
          </div>
          <div>
            <div className="text-xl font-black text-white leading-tight font-mono">{totalWorkouts}</div>
            <div className="text-[10px] text-slate-500 font-medium">Logged sessions</div>
          </div>
        </div>

        <div className="bg-[#181B20] border border-[#2D333B] p-3 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Streak</span>
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          </div>
          <div>
            <div className="text-xl font-black text-[#A3E635] leading-tight font-mono">
              {currentStreak} Days
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Consistency</div>
          </div>
        </div>

        <div className="bg-[#181B20] border border-[#2D333B] p-3 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Volume</span>
            <Layers className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div>
            <div className="text-xl font-black text-white leading-tight font-mono">
              {(totalVolumeKg / 1000).toFixed(1)}t
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Tonnes lifted</div>
          </div>
        </div>
      </div>

      {/* Strength Progression Chart */}
      <div className="bg-[#181B20] border border-[#2D333B] rounded-2xl p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#A3E635] block">
              1RM Strength Curve
            </span>
            <h3 className="font-bold text-white text-sm">Estimated 1-Rep Max (kg)</h3>
          </div>

          {/* Exercise Selector */}
          <div className="relative">
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 pr-8 bg-[#22262E] text-white border border-[#2D333B] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#A3E635] appearance-none cursor-pointer"
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
              <CartesianGrid strokeDasharray="3 3" stroke="#2D333B" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#181B20',
                  borderColor: '#2D333B',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}
                formatter={(val) => [`${val} kg`, 'Estimated 1RM']}
              />
              <Line
                type="monotone"
                dataKey="oneRepMax"
                stroke="#A3E635"
                strokeWidth={3}
                dot={{ fill: '#0F1115', stroke: '#A3E635', strokeWidth: 2, r: 4 }}
                activeDot={{ fill: '#A3E635', stroke: '#fff', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Body Weight Trend Tracker */}
      <div className="bg-[#181B20] border border-[#2D333B] rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Body Composition
              </span>
              <span className="text-xs font-mono font-bold text-white bg-[#22262E] px-2 py-0.5 rounded-md">
                Current: {latestBodyWeight} kg
              </span>
            </div>
            <h3 className="font-bold text-white text-sm mt-0.5">Weight Trend Tracker</h3>
          </div>

          <button
            onClick={() => setShowWeightModal(true)}
            className="px-3 py-1.5 rounded-xl bg-[#22262E] hover:bg-[#2D333B] text-slate-200 border border-[#2D333B] text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[#A3E635]" /> Log Weight
          </button>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D333B" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#181B20',
                  borderColor: '#2D333B',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(val) => [`${val} kg`, 'Body Weight']}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#38BDF8"
                strokeWidth={2.5}
                dot={{ fill: '#0F1115', stroke: '#38BDF8', strokeWidth: 2, r: 3.5 }}
                activeDot={{ fill: '#38BDF8', stroke: '#fff', strokeWidth: 2, r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Log Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#181B20] border border-[#2D333B] w-full max-w-sm rounded-3xl p-5 shadow-2xl">
            <h3 className="text-base font-black text-white mb-1 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#A3E635]" /> Log Morning Weight
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Weigh yourself under consistent conditions (fasted upon waking).
            </p>
            <form onSubmit={handleAddWeight} className="space-y-4">
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  autoFocus
                  placeholder="e.g. 79.5"
                  value={newWeightInput}
                  onChange={(e) => setNewWeightInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#22262E] text-white border border-[#2D333B] focus:outline-none focus:ring-2 focus:ring-[#A3E635] font-mono font-bold text-lg text-center"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                  KG
                </span>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#22262E] text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#A3E635] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-lime-400"
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
