import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Flame,
  Play,
  Pause,
  RotateCcw,
  Plus,
  CheckCircle2,
  Clock,
  Activity,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Volume2,
  VolumeX,
  X,
  Footprints,
  Bike,
  Compass,
  Zap,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { loadFromStorage, saveToStorage } from '../utils/storage';

// Built-in Web Audio beep sound generator for interval switches and finish
const playIntervalBeep = (type = 'switch') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    if (type === 'finish') {
      // Victorious triple ascending chime
      playTone(523.25, 0.0, 0.2); // C5
      playTone(659.25, 0.18, 0.2); // E5
      playTone(783.99, 0.36, 0.4); // G5
    } else if (type === 'fast') {
      // High-energy double alert for work/sprint phase
      playTone(880.0, 0.0, 0.15); // A5
      playTone(1046.5, 0.15, 0.25); // C6
    } else {
      // Gentle switch tone
      playTone(659.25, 0.0, 0.2);
    }
  } catch (e) {
    console.warn('Audio chime error:', e);
  }
};

// 4 Structured Cardio Workout Plans with Exact Time & Interval Phases
const CARDIO_PLANS = [
  {
    id: 'plan-incline-walk',
    title: 'Incline Treadmill / Brisk Outdoor Walk',
    bestFor: 'Best for Rest Days (Tue / Thu / Sat)',
    tag: 'Active Recovery',
    tagColor: 'bg-emerald-500/15 text-emerald-600 dark:text-[#A3E635] border-emerald-500/30',
    totalDurationMinutes: 25,
    icon: Footprints,
    accentGradient: 'from-emerald-500 to-teal-600',
    helpsFor: 'Active muscle recovery, gentle fat burn without joint stress, and hitting your daily step count.',
    phases: [
      { name: 'Warm-Up Walk', durationSeconds: 5 * 60, intensity: 'Easy Pace (Level 2-3)', color: 'text-blue-500' },
      { name: 'Brisk Incline Round 1', durationSeconds: 3 * 60, intensity: 'Fast Walk (8-12% Incline)', color: 'text-amber-500' },
      { name: 'Moderate Recovery', durationSeconds: 2 * 60, intensity: 'Normal Pace (Flat Incline)', color: 'text-emerald-500' },
      { name: 'Brisk Incline Round 2', durationSeconds: 3 * 60, intensity: 'Fast Walk (8-12% Incline)', color: 'text-amber-500' },
      { name: 'Moderate Recovery', durationSeconds: 2 * 60, intensity: 'Normal Pace (Flat Incline)', color: 'text-emerald-500' },
      { name: 'Brisk Incline Round 3', durationSeconds: 3 * 60, intensity: 'Fast Walk (8-12% Incline)', color: 'text-amber-500' },
      { name: 'Moderate Recovery', durationSeconds: 2 * 60, intensity: 'Normal Pace (Flat Incline)', color: 'text-emerald-500' },
      { name: 'Cool-Down Walk', durationSeconds: 5 * 60, intensity: 'Slow Easy Walk', color: 'text-teal-500' }
    ]
  },
  {
    id: 'plan-spin-bike',
    title: 'Stationary Cycling / Spin Bike',
    bestFor: 'Post-Workout or Rest Day',
    tag: 'Leg Endurance',
    tagColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    totalDurationMinutes: 18,
    icon: Bike,
    accentGradient: 'from-blue-600 to-indigo-600',
    helpsFor: 'Building leg endurance, cardiovascular stamina, and joint-friendly high-efficiency calorie burn.',
    phases: [
      { name: 'Light Spin Warm-Up', durationSeconds: 3 * 60, intensity: 'Low Resistance (Cadence 70-80 RPM)', color: 'text-blue-500' },
      { name: 'Fast Pedal Round 1', durationSeconds: 60, intensity: 'Medium-High Resistance (90+ RPM)', color: 'text-rose-500' },
      { name: 'Easy Spin Recovery', durationSeconds: 90, intensity: 'Low Resistance Recovery', color: 'text-emerald-500' },
      { name: 'Fast Pedal Round 2', durationSeconds: 60, intensity: 'Medium-High Resistance (90+ RPM)', color: 'text-rose-500' },
      { name: 'Easy Spin Recovery', durationSeconds: 90, intensity: 'Low Resistance Recovery', color: 'text-emerald-500' },
      { name: 'Fast Pedal Round 3', durationSeconds: 60, intensity: 'Medium-High Resistance (90+ RPM)', color: 'text-rose-500' },
      { name: 'Easy Spin Recovery', durationSeconds: 90, intensity: 'Low Resistance Recovery', color: 'text-emerald-500' },
      { name: 'Fast Pedal Round 4', durationSeconds: 60, intensity: 'Medium-High Resistance (90+ RPM)', color: 'text-rose-500' },
      { name: 'Easy Spin Recovery', durationSeconds: 90, intensity: 'Low Resistance Recovery', color: 'text-emerald-500' },
      { name: 'Cool-Down Spin', durationSeconds: 4 * 60, intensity: 'Gentle Flush Spin', color: 'text-teal-500' }
    ]
  },
  {
    id: 'plan-post-lift-walk',
    title: 'Post-Lift Light Walk',
    bestFor: 'Right After Push / Pull Sessions',
    tag: 'Lactic Flush',
    tagColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    totalDurationMinutes: 10,
    icon: Compass,
    accentGradient: 'from-amber-500 to-orange-500',
    helpsFor: 'Gradually lowering your heart rate, flushing accumulated lactic acid from upper-body muscles, and easing DOMS.',
    phases: [
      { name: 'Relaxed Walking Phase', durationSeconds: 10 * 60, intensity: 'Casual, relaxing pace (~4 km/h)', color: 'text-amber-500' }
    ]
  },
  {
    id: 'plan-stair-elliptical',
    title: 'Beginner Stair Climber / Elliptical Intervals',
    bestFor: 'Metabolic Conditioning',
    tag: 'Lung Capacity',
    tagColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    totalDurationMinutes: 15,
    icon: Zap,
    accentGradient: 'from-purple-600 to-pink-600',
    helpsFor: 'Lower-body conditioning, lung capacity, and boosting your metabolic calorie burn without heavy pounding.',
    phases: [
      { name: 'Easy Warm-Up Climb', durationSeconds: 3 * 60, intensity: 'Level 3-4 (Steady Cadence)', color: 'text-blue-500' },
      { name: 'Steady Climb Round 1', durationSeconds: 60, intensity: 'Level 6-7 (Strong Push)', color: 'text-rose-500' },
      { name: 'Slow Pace Recovery', durationSeconds: 90, intensity: 'Level 2-3 (Deep Breaths)', color: 'text-emerald-500' },
      { name: 'Steady Climb Round 2', durationSeconds: 60, intensity: 'Level 6-7 (Strong Push)', color: 'text-rose-500' },
      { name: 'Slow Pace Recovery', durationSeconds: 90, intensity: 'Level 2-3 (Deep Breaths)', color: 'text-emerald-500' },
      { name: 'Steady Climb Round 3', durationSeconds: 60, intensity: 'Level 6-7 (Strong Push)', color: 'text-rose-500' },
      { name: 'Slow Pace Recovery', durationSeconds: 90, intensity: 'Level 2-3 (Deep Breaths)', color: 'text-emerald-500' },
      { name: 'Steady Climb Round 4', durationSeconds: 60, intensity: 'Level 6-7 (Strong Push)', color: 'text-rose-500' },
      { name: 'Slow Pace Recovery', durationSeconds: 90, intensity: 'Level 2-3 (Deep Breaths)', color: 'text-emerald-500' },
      { name: 'Cool-Down Climb', durationSeconds: 2 * 60, intensity: 'Easy Recovery Level', color: 'text-teal-500' }
    ]
  }
];

export default function CardioTab() {
  // Active Running Session
  const [activePlan, setActivePlan] = useState(null);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [secondsRemainingInPhase, setSecondsRemainingInPhase] = useState(0);
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Cardio Logging History in localStorage
  const [cardioLogs, setCardioLogs] = useState(() =>
    loadFromStorage('cardio_logs', [
      {
        id: 'cl-init-1',
        title: 'Incline Treadmill / Brisk Outdoor Walk',
        durationMinutes: 25,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        timestamp: Date.now() - 24 * 60 * 60 * 1000
      }
    ])
  );

  // Manual Quick Log State
  const [showQuickLogModal, setShowQuickLogModal] = useState(false);
  const [manualTitle, setManualTitle] = useState('Incline Treadmill Walk');
  const [manualDuration, setManualDuration] = useState('25');

  // Interval Engine
  useEffect(() => {
    let timer = null;

    if (isRunning && activePlan) {
      timer = setInterval(() => {
        setTotalSecondsElapsed((prev) => prev + 1);

        setSecondsRemainingInPhase((prev) => {
          if (prev <= 1) {
            // Move to next phase or complete
            const nextIndex = currentPhaseIndex + 1;
            if (nextIndex < activePlan.phases.length) {
              setCurrentPhaseIndex(nextIndex);
              const nextPhase = activePlan.phases[nextIndex];
              if (soundEnabled) {
                playIntervalBeep(nextPhase.name.toLowerCase().includes('fast') || nextPhase.name.toLowerCase().includes('climb') ? 'fast' : 'switch');
              }
              return nextPhase.durationSeconds;
            } else {
              // Cardio Completed!
              setIsRunning(false);
              if (soundEnabled) {
                playIntervalBeep('finish');
              }
              confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });

              // Auto-log completed session
              const newLog = {
                id: `cl-${Date.now()}`,
                title: activePlan.title,
                durationMinutes: Math.round(totalSecondsElapsed / 60) || activePlan.totalDurationMinutes,
                date: new Date().toISOString().split('T')[0],
                timestamp: Date.now()
              };
              const updatedLogs = [newLog, ...cardioLogs];
              setCardioLogs(updatedLogs);
              saveToStorage('cardio_logs', updatedLogs);

              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning, activePlan, currentPhaseIndex, totalSecondsElapsed, soundEnabled, cardioLogs]);

  // Start a plan
  const handleStartPlan = (plan) => {
    setActivePlan(plan);
    setCurrentPhaseIndex(0);
    setSecondsRemainingInPhase(plan.phases[0].durationSeconds);
    setTotalSecondsElapsed(0);
    setIsRunning(true);
    if (soundEnabled) playIntervalBeep('switch');
  };

  // Close timer modal
  const handleCloseTimer = () => {
    setIsRunning(false);
    setActivePlan(null);
  };

  // Manual Log Session
  const handleSaveManualLog = (e) => {
    e.preventDefault();
    if (!manualDuration || Number(manualDuration) <= 0) return;

    const newLog = {
      id: `cl-${Date.now()}`,
      title: manualTitle,
      durationMinutes: Number(manualDuration),
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now()
    };
    const updated = [newLog, ...cardioLogs];
    setCardioLogs(updated);
    saveToStorage('cardio_logs', updated);
    setShowQuickLogModal(false);
  };

  const handleDeleteLog = (id) => {
    const updated = cardioLogs.filter((l) => l.id !== id);
    setCardioLogs(updated);
    saveToStorage('cardio_logs', updated);
  };

  // Calculate total minutes this week
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyMinutes = cardioLogs
    .filter((l) => (l.timestamp || Date.parse(l.date)) >= oneWeekAgo)
    .reduce((sum, l) => sum + (Number(l.durationMinutes) || 0), 0);

  // Formatting helper
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentPhase = activePlan?.phases[currentPhaseIndex];
  const totalPlanSeconds = (activePlan?.phases || []).reduce((acc, p) => acc + p.durationSeconds, 0);

  return (
    <div className="space-y-5 pb-32 animate-in fade-in duration-200">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & WEEKLY METRICS STRIP
         ───────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
            Cardio & Active Recovery
          </h2>
          <button
            onClick={() => setShowQuickLogModal(true)}
            className="px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Log Cardio
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Structured intervals designed around your Push-Pull-Legs split to burn fat and speed recovery without draining leg strength.
        </p>
      </div>

      {/* Smart Leg Day Warning Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/25 border border-amber-500/25 flex items-start gap-2.5 text-xs">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-800 dark:text-amber-300 font-bold block text-xs">
            Smart PPL Reminder:
          </strong>
          <p className="text-amber-700 dark:text-amber-200/90 leading-relaxed text-[11px] mt-0.5 font-medium">
            Keep intense cardio away from <strong>Friday (Leg Day)</strong> so your quads and hamstrings stay 100% fresh for heavy squats and leg press. Prioritize incline walking on Tuesday & Thursday.
          </p>
        </div>
      </div>

      {/* Weekly Cardio Summary Pill */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Last 7 Days Cardio
            </span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              {weeklyMinutes} <span className="text-xs font-semibold text-slate-400">mins</span>
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Sessions
            </span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              {cardioLogs.length} <span className="text-xs font-semibold text-slate-400">logged</span>
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. 4 STRUCTURED CARDIO WORKOUT PLANS (WITH INTERVAL TIMERS)
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-rose-500" />
            Cardio Interval Plans (4)
          </h3>
          <span className="text-[11px] text-slate-400">Tap "Start Timer" for auto-intervals</span>
        </div>

        <div className="space-y-3">
          {CARDIO_PLANS.map((plan) => {
            const Icon = plan.icon;

            return (
              <div
                key={plan.id}
                className="bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                {/* Card Header: Icon, Title, Duration & Best For Tag */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${plan.accentGradient} text-white flex items-center justify-center shadow-md shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center flex-wrap gap-1.5 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${plan.tagColor}`}>
                          {plan.tag}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                          {plan.bestFor}
                        </span>
                      </div>
                      <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                        {plan.title}
                      </h4>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#22262E] text-slate-700 dark:text-slate-200 font-mono text-xs font-extrabold shrink-0">
                    {plan.totalDurationMinutes} mins
                  </span>
                </div>

                {/* Helps For Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-[#22262E]/50 p-2.5 rounded-2xl border border-slate-100 dark:border-[#2D333B]">
                  💡 <strong>Helps For:</strong> {plan.helpsFor}
                </p>

                {/* Interval Pattern Preview Chips */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Interval Breakdown ({plan.phases.length} Phases):
                  </span>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {plan.phases.map((ph, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-[#20242C] border border-slate-200/60 dark:border-[#2D333B] text-[10px] whitespace-nowrap shrink-0 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">{ph.name}</span>
                        <span className="font-mono text-slate-400">({Math.round(ph.durationSeconds / 60)}m)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button: Start Built-in Interval Timer */}
                <button
                  onClick={() => handleStartPlan(plan)}
                  className={`w-full py-2.5 rounded-2xl bg-gradient-to-r ${plan.accentGradient} text-white font-black text-xs uppercase tracking-wider shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer`}
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Guided Interval Timer ({plan.totalDurationMinutes} Min)</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. "WHY CARDIO MATTERS" (CARDIO BENEFITS SUMMARY CARD)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-rose-500/10 via-orange-500/5 to-amber-500/10 border border-rose-500/20 rounded-3xl p-5 space-y-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-rose-500" />
          <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Why Cardio Matters (For Lifters & Longevity)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white/70 dark:bg-[#181B20]/80 rounded-2xl border border-rose-500/15 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              🫁 Boosts Heart & Lung Stamina
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              Stronger VO2 max prevents gasping for air on high-rep squats, rows, and deadlifts.
            </p>
          </div>

          <div className="p-3 bg-white/70 dark:bg-[#181B20]/80 rounded-2xl border border-rose-500/15 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              ⚡ Speeds Up Muscle Recovery
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              Gentle blood flow on Tuesday and Thursday delivers amino acids to repair torn muscle fibers faster.
            </p>
          </div>

          <div className="p-3 bg-white/70 dark:bg-[#181B20]/80 rounded-2xl border border-rose-500/15 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              🔥 Supports Lean Body Composition
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              Burns extra calories and improves insulin sensitivity while preserving lean muscle mass.
            </p>
          </div>

          <div className="p-3 bg-white/70 dark:bg-[#181B20]/80 rounded-2xl border border-rose-500/15 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              💤 Improves Sleep & Energy
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              Lowers resting cortisol, relieves mental stress, and promotes deep REM sleep for recovery.
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. CARDIO SESSION LOGGER & RECENT HISTORY
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-500" />
            Cardio Session Log ({cardioLogs.length})
          </h3>
          <span className="text-[11px] text-slate-400">Saved to storage</span>
        </div>

        {cardioLogs.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">
            No cardio sessions logged yet. Complete an interval timer above or tap "Log Cardio".
          </p>
        ) : (
          <div className="space-y-2">
            {cardioLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#22262E]/60 border border-slate-100 dark:border-[#2D333B] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {log.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {log.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-extrabold text-blue-600 dark:text-[#A3E635] text-xs">
                    {log.durationMinutes} mins
                  </span>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Delete log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. BUILT-IN INTERVAL TIMER OVERLAY MODAL
         ───────────────────────────────────────────────────────────── */}
      {activePlan && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181B20] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                  Phase {currentPhaseIndex + 1} of {activePlan.phases.length}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1 leading-tight">
                  {activePlan.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#22262E] dark:hover:bg-[#2D333B] text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                  title={soundEnabled ? 'Mute Beeps' : 'Enable Beeps'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-500" />}
                </button>
                <button
                  onClick={handleCloseTimer}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#22262E] dark:hover:bg-[#2D333B] text-slate-500 transition-all cursor-pointer"
                  title="Close Timer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Current Phase Big Display */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#20242C] border border-slate-200/80 dark:border-[#2D333B] text-center space-y-2">
              <span className={`text-xs font-black uppercase tracking-wider block ${currentPhase?.color || 'text-rose-500'}`}>
                {currentPhase?.name}
              </span>
              <div className="text-5xl font-mono font-black text-slate-900 dark:text-white tracking-tight">
                {formatTime(secondsRemainingInPhase)}
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Target: <strong>{currentPhase?.intensity}</strong>
              </p>
            </div>

            {/* Overall Workout Progress */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-semibold">
                <span>Total Elapsed: {formatTime(totalSecondsElapsed)}</span>
                <span>Goal: {activePlan.totalDurationMinutes} mins</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#2D333B] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300 rounded-full"
                  style={{
                    width: `${Math.min(100, (totalSecondsElapsed / totalPlanSeconds) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" /> Resume
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setSecondsRemainingInPhase(activePlan.phases[currentPhaseIndex].durationSeconds);
                }}
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-[#22262E] dark:hover:bg-[#2D333B] text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                title="Restart Current Phase"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. QUICK MANUAL LOG MODAL
         ───────────────────────────────────────────────────────────── */}
      {showQuickLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181B20] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] w-full max-w-sm rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Log Completed Cardio
              </h3>
              <button
                onClick={() => setShowQuickLogModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-[#22262E] text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualLog} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Cardio Activity Name:
                </label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] border border-slate-200 dark:border-[#2D333B] text-slate-900 dark:text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Duration (Minutes):
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={manualDuration}
                  onChange={(e) => setManualDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] border border-slate-200 dark:border-[#2D333B] text-slate-900 dark:text-white font-mono font-bold"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickLogModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#22262E] text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold uppercase text-xs shadow-md"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
