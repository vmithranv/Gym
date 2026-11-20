import React, { useState } from 'react';
import {
  Play,
  Plus,
  Clock,
  Award,
  Flame,
  CheckCircle2,
  Video,
  Timer,
  Sparkles,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  HeartPulse,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ExerciseCard from './ExerciseCard';
import RestTimer from './RestTimer';
import ExerciseAnimation from './ExerciseAnimation';
import {
  MUSCLE_GROUP_CONFIG,
  getExerciseMuscleGroup,
  getExerciseRecommendedRest
} from '../utils/exerciseData';

const DAYS_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// 5-8 min Dynamic Warm-up Checklist
const WARMUP_ROUTINE = [
  { id: 'w-1', title: 'Arm Circles & Shoulder Dislocations', reps: '15 reps forward & backward' },
  { id: 'w-2', title: 'Torso Twists & Cat-Cow Stretches', reps: '10 reps each side' },
  { id: 'w-3', title: 'Bodyweight Squats & Hip Openers', reps: '15 deep reps' },
  { id: 'w-4', title: 'Light Warm-Up Set (50% working weight)', reps: '1 set of 10 easy reps' }
];

// 3-5 min Stretching Cool-down Checklist
const COOLDOWN_ROUTINE = [
  { id: 'c-1', title: 'Doorway Chest & Bicep Stretch', duration: '30 seconds each side' },
  { id: 'c-2', title: 'Lat & Upper Back Hanging Stretch', duration: '30 seconds deep stretch' },
  { id: 'c-3', title: 'Standing Quad & Hip Flexor Stretch', duration: '30 seconds per leg' },
  { id: 'c-4', title: 'Seated Hamstring & Lower Back Release', duration: '45 seconds calm breathing' }
];

export default function WorkoutTab({
  activeSession,
  setActiveSession,
  routines,
  records,
  onSaveWorkout,
  onRecordPr,
  onOpenFormGuide
}) {
  // Timer States
  const [restTimerConfig, setRestTimerConfig] = useState(null);
  const [newPrNotice, setNewPrNotice] = useState(null);
  const [shortRestWarning, setShortRestWarning] = useState(null);

  // Warmup & Cooldown Collapsible States
  const [showWarmup, setShowWarmup] = useState(false);
  const [warmupChecked, setWarmupChecked] = useState({});
  const [showCooldown, setShowCooldown] = useState(false);
  const [cooldownChecked, setCooldownChecked] = useState({});

  // Custom Exercise modal
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [customMuscleGroup, setCustomMuscleGroup] = useState('Chest');
  const [showAddModal, setShowAddModal] = useState(false);

  // Session elapsed timer (MM:SS)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Track timestamp of last completed set to detect < 30s rest
  const [lastSetTimestamp, setLastSetTimestamp] = useState(null);

  // Detect current day's routine
  const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const todayDayName = DAYS_NAMES[todayIndex];
  const todayRoutine = routines.find((r) => r.dayOfWeek === todayIndex) || routines[0];
  const isRestDay = todayRoutine?.category === 'Rest' || todayRoutine?.isRest;

  const formatElapsed = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const triggerPrCelebration = (exerciseName, weight, reps) => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#A3E635', '#3B82F6', '#F59E0B', '#EC4899', '#10B981']
      });
    } catch (e) {
      console.warn('Confetti failed to launch', e);
    }

    setNewPrNotice({
      exercise: exerciseName,
      weight,
      reps
    });

    setTimeout(() => {
      setNewPrNotice(null);
    }, 4500);
  };

  const startTodayRoutine = () => {
    const initialExercises = (todayRoutine.exercises || []).map((ex, idx) => ({
      id: `${ex.id}-${Date.now()}-${idx}`,
      name: ex.name,
      muscleGroup: ex.muscleGroup || getExerciseMuscleGroup(ex.name),
      customVideoUrl: ex.customVideoUrl || '',
      restSeconds: ex.restSeconds || getExerciseRecommendedRest(ex.name),
      sets: Array.from({ length: ex.targetSets || 2 }).map((_, sIdx) => ({
        setNumber: sIdx + 1,
        weight: records[ex.name]?.weight || 50,
        reps: ex.defaultReps || 10,
        completed: false,
        isPr: false
      }))
    }));

    setActiveSession({
      id: `session-${Date.now()}`,
      name: todayRoutine.name || `${todayDayName}'s Workout`,
      routineId: todayRoutine.id,
      startedAt: new Date().toISOString(),
      exercises: initialExercises
    });
  };

  const startEmptySession = () => {
    setActiveSession({
      id: `session-${Date.now()}`,
      name: 'Freestyle Workout',
      startedAt: new Date().toISOString(),
      exercises: [
        {
          id: `ex-${Date.now()}`,
          name: 'Barbell Flat Bench Press',
          muscleGroup: 'Chest',
          restSeconds: 105,
          sets: [
            { setNumber: 1, weight: 50, reps: 10, completed: false, isPr: false },
            { setNumber: 2, weight: 50, reps: 10, completed: false, isPr: false }
          ]
        }
      ]
    });
  };

  const handleSetCompleted = (exerciseName, weight, reps, isNewPr) => {
    const now = Date.now();

    // Check if user logged set too fast (< 30 seconds rest)
    if (lastSetTimestamp && now - lastSetTimestamp < 30000) {
      setShortRestWarning(
        `Gentle tip: You rested less than 30s. For ${exerciseName}, taking full 60s–120s allows ATP replenish for heavier reps.`
      );
      setTimeout(() => setShortRestWarning(null), 6000);
    }
    setLastSetTimestamp(now);

    // Calculate smart recommended rest based on exercise (120s for leg compounds, 90-105s for presses, 75s for isolation)
    const recommendedRest = getExerciseRecommendedRest(exerciseName);

    setRestTimerConfig({
      mode: 'set',
      seconds: recommendedRest
    });

    if (isNewPr) {
      triggerPrCelebration(exerciseName, weight, reps);
      onRecordPr(exerciseName, weight, reps);
    }
  };

  const handleStartTransitionTimer = (currentExName) => {
    if (activeSession) {
      const idx = activeSession.exercises.findIndex((e) => e.name === currentExName);
      const nextEx = activeSession.exercises[idx + 1];
      setRestTimerConfig({
        mode: 'transition',
        seconds: 120, // 2 minutes transition rest
        nextExerciseName: nextEx ? nextEx.name : ''
      });
    }
  };

  const updateExercise = (updatedEx) => {
    if (!activeSession) return;
    const updatedExercises = activeSession.exercises.map((e) =>
      e.id === updatedEx.id ? updatedEx : e
    );
    setActiveSession({
      ...activeSession,
      exercises: updatedExercises
    });
  };

  const removeExercise = (exerciseId) => {
    if (!activeSession) return;
    const updatedExercises = activeSession.exercises.filter((e) => e.id !== exerciseId);
    setActiveSession({
      ...activeSession,
      exercises: updatedExercises
    });
  };

  const addCustomExercise = (e) => {
    e.preventDefault();
    if (!customExerciseName.trim()) return;

    const newEx = {
      id: `ex-custom-${Date.now()}`,
      name: customExerciseName.trim(),
      muscleGroup: customMuscleGroup,
      customVideoUrl: customVideoUrl.trim(),
      restSeconds: getExerciseRecommendedRest(customExerciseName.trim()),
      sets: [
        { setNumber: 1, weight: 40, reps: 10, completed: false, isPr: false },
        { setNumber: 2, weight: 40, reps: 10, completed: false, isPr: false }
      ]
    };

    setActiveSession({
      ...activeSession,
      exercises: [...(activeSession.exercises || []), newEx]
    });

    setCustomExerciseName('');
    setCustomVideoUrl('');
    setShowAddModal(false);
  };

  const finishSession = () => {
    if (!activeSession) return;
    onSaveWorkout(activeSession);
    setActiveSession(null);
    setRestTimerConfig(null);

    try {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 }
      });
    } catch (_) {}
  };

  const cancelSession = () => {
    if (window.confirm('Discard this workout in progress?')) {
      setActiveSession(null);
      setRestTimerConfig(null);
    }
  };

  const currentExercises = activeSession?.exercises || [];
  const completedSetsCount = currentExercises.reduce(
    (acc, ex) => acc + (ex.sets ? ex.sets.filter((s) => s.completed).length : 0),
    0
  );
  const totalSetsCount = currentExercises.reduce(
    (acc, ex) => acc + (ex.sets ? ex.sets.length : 0),
    0
  );
  const currentSessionVolumeKg = currentExercises.reduce((sum, ex) => {
    const exVol = (ex.sets || []).reduce((sSum, s) => {
      if (s.completed) return sSum + (Number(s.weight) || 0) * (Number(s.reps) || 0);
      return sSum;
    }, 0);
    return sum + exVol;
  }, 0);

  return (
    <div className="space-y-5 pb-36 animate-in fade-in duration-200">
      {/* PR Toast Banner */}
      {newPrNotice && (
        <div className="sticky top-2 z-50 animate-pr-pop bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 dark:from-[#A3E635] dark:to-lime-400 text-white dark:text-black px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-black/20 dark:bg-black rounded-xl text-white dark:text-[#A3E635]">
              <Award className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-white/80 dark:text-black/70">
                NEW PERSONAL RECORD!
              </div>
              <div className="font-black text-sm">
                {newPrNotice.exercise}: {newPrNotice.weight} kg × {newPrNotice.reps} reps
              </div>
            </div>
          </div>
          <span className="text-xs font-black uppercase px-2 py-1 bg-black/20 rounded-lg">
            BEAST!
          </span>
        </div>
      )}

      {/* Short Rest Warning Banner */}
      {shortRestWarning && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{shortRestWarning}</p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 (TOP): TODAY'S SCHEDULED WORKOUT CARD
          Automatically detects Monday-Sunday and shows full routine
         ───────────────────────────────────────────────────────────── */}
      {!isRestDay ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-[#181B20] dark:via-[#1A1E24] dark:to-[#0F1115] text-white p-5 sm:p-6 shadow-xl border border-blue-500/20 dark:border-[#2D333B]">
          <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 dark:bg-[#A3E635]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Today Header Tag */}
          <div className="flex items-center justify-between mb-2">
            <span className="px-3 py-1 rounded-full bg-white/20 dark:bg-[#A3E635]/20 text-white dark:text-[#A3E635] text-xs font-black tracking-wider uppercase flex items-center gap-1.5 backdrop-blur-xs">
              <Calendar className="w-3.5 h-3.5" /> {todayDayName}'s Program
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100 dark:text-slate-400">
              {todayRoutine.category} (2 Sets Focus)
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {todayRoutine.name}
          </h2>
          <p className="text-blue-100 dark:text-slate-400 text-xs mt-1">
            {todayRoutine.description}
          </p>

          {/* Full Exercise List for Today with Rest Timing Cues */}
          <div className="mt-4 pt-3 border-t border-white/15 dark:border-[#2D333B] space-y-2">
            {(todayRoutine.exercises || []).map((ex, idx) => {
              const muscle = ex.muscleGroup || getExerciseMuscleGroup(ex.name);
              const muscleStyle = MUSCLE_GROUP_CONFIG[muscle] || MUSCLE_GROUP_CONFIG.Other;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-white/10 dark:bg-[#22262E]/70 p-2.5 rounded-2xl backdrop-blur-xs text-xs"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="w-5 h-5 rounded-md bg-white/20 dark:bg-[#181B20] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white truncate">{ex.name}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 border ${muscleStyle.badgeBg} ${muscleStyle.badgeText} ${muscleStyle.badgeBorder}`}
                    >
                      {muscle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenFormGuide(ex)}
                      className="p-1 text-white/80 hover:text-white dark:text-[#A3E635] transition-colors"
                      title="Watch form video"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-mono text-blue-100 dark:text-slate-400 font-semibold">
                      {ex.targetSets}×{ex.defaultReps}r ({ex.restSeconds}s rest)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Start Today Workout Action */}
          {!activeSession && (
            <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={startTodayRoutine}
                className="flex-1 py-4 px-6 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 dark:bg-[#A3E635] dark:text-black dark:hover:bg-lime-400 font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg active:scale-98 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start {todayDayName}'s Workout ({todayRoutine.category})</span>
              </button>
              <button
                onClick={startEmptySession}
                className="py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 dark:bg-[#22262E] dark:hover:bg-[#2D333B] text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/20 dark:border-[#2D333B] active:scale-98 transition-all backdrop-blur-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-300 dark:text-[#A3E635]" /> Freestyle
              </button>
            </div>
          )}
        </div>
      ) : (
        /* REST & RECOVERY CARD (Tue, Thu, Sun) */
        <div className="rounded-3xl bg-gradient-to-br from-teal-500 via-emerald-600 to-cyan-700 text-white p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5" /> {todayDayName} Rest & Recovery Day
            </span>
            <span className="text-xs font-bold uppercase text-teal-100">Muscle Repair</span>
          </div>
          <h2 className="text-xl font-black text-white">Muscles Rebuild on Rest Days</h2>
          <p className="text-teal-100 text-xs mt-1.5 leading-relaxed">
            {todayRoutine.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded-xl bg-white/15 font-semibold">💧 3-4L Water</span>
            <span className="px-2.5 py-1 rounded-xl bg-white/15 font-semibold">🚶 20 min light walk</span>
            <span className="px-2.5 py-1 rounded-xl bg-white/15 font-semibold">🍗 Hit 140g protein</span>
            <span className="px-2.5 py-1 rounded-xl bg-white/15 font-semibold">😴 8:30 PM bedtime</span>
          </div>
          {!activeSession && (
            <div className="mt-4">
              <button
                onClick={startEmptySession}
                className="py-2.5 px-4 rounded-2xl bg-white text-slate-900 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> Optional Freestyle Workout
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          WARM-UP CHECKLIST (COLLAPSIBLE 5-8 MIN PRE-WORKOUT)
         ───────────────────────────────────────────────────────────── */}
      {activeSession && (
        <div className="bg-white dark:bg-[#181B20] rounded-3xl p-4 border border-slate-200/80 dark:border-[#2D333B] shadow-xs">
          <button
            onClick={() => setShowWarmup(!showWarmup)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  5–8 Min Dynamic Warm-Up Routine
                </h4>
                <span className="text-[10px] text-slate-400">
                  Prime shoulders, hips & nervous system for heavy lifts
                </span>
              </div>
            </div>
            {showWarmup ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showWarmup && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#22262E] space-y-2">
              {WARMUP_ROUTINE.map((w) => {
                const checked = warmupChecked[w.id];
                return (
                  <div
                    key={w.id}
                    onClick={() => setWarmupChecked({ ...warmupChecked, [w.id]: !checked })}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#22262E]/70 flex items-center justify-between text-xs cursor-pointer select-none"
                  >
                    <div>
                      <span className={`font-bold block ${checked ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {w.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{w.reps}</span>
                    </div>
                    <CheckCircle2 className={`w-4 h-4 ${checked ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2 (MIDDLE): ACTIVE EXERCISE CARDS WITH DEMO GIFS
         ───────────────────────────────────────────────────────────── */}
      {activeSession && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-[#A3E635]" />
              Active Exercises ({activeSession.exercises.length})
            </h3>
            <span className="text-xs text-slate-500 font-medium">With Animated Form Demonstrations</span>
          </div>

          {activeSession.exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onUpdateExercise={updateExercise}
              onRemoveExercise={removeExercise}
              previousRecord={records[exercise.name]}
              onSetCompleted={handleSetCompleted}
              onOpenFormGuide={onOpenFormGuide}
              onStartTransitionTimer={handleStartTransitionTimer}
              isLastExercise={index === activeSession.exercises.length - 1}
            />
          ))}

          {/* Add Another Exercise Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-4 rounded-3xl bg-white hover:bg-slate-50 dark:bg-[#181B20] dark:hover:bg-[#22262E] text-slate-700 dark:text-slate-200 border border-dashed border-slate-300 dark:border-[#2D333B] hover:border-blue-500 dark:hover:border-[#A3E635] font-bold text-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5 text-blue-600 dark:text-[#A3E635]" /> Add Another Exercise
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          COOL-DOWN CHECKLIST (COLLAPSIBLE 3-5 MIN POST-WORKOUT)
         ───────────────────────────────────────────────────────────── */}
      {activeSession && (
        <div className="bg-white dark:bg-[#181B20] rounded-3xl p-4 border border-slate-200/80 dark:border-[#2D333B] shadow-xs">
          <button
            onClick={() => setShowCooldown(!showCooldown)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-teal-500" />
              <div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  3–5 Min Post-Workout Cool-Down & Stretch
                </h4>
                <span className="text-[10px] text-slate-400">
                  Release muscle tightness & restore resting heart rate
                </span>
              </div>
            </div>
            {showCooldown ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showCooldown && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#22262E] space-y-2">
              {COOLDOWN_ROUTINE.map((c) => {
                const checked = cooldownChecked[c.id];
                return (
                  <div
                    key={c.id}
                    onClick={() => setCooldownChecked({ ...cooldownChecked, [c.id]: !checked })}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#22262E]/70 flex items-center justify-between text-xs cursor-pointer select-none"
                  >
                    <div>
                      <span className={`font-bold block ${checked ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {c.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{c.duration}</span>
                    </div>
                    <CheckCircle2 className={`w-4 h-4 ${checked ? 'text-teal-500' : 'text-slate-300 dark:text-slate-600'}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3 (BOTTOM): IRONPULSE SESSION SUMMARY & CONTROLS
          Placed at bottom right above bottom navigation bar
         ───────────────────────────────────────────────────────────── */}
      {activeSession && (
        <div className="bg-white dark:bg-[#181B20] rounded-3xl p-5 border border-slate-200/80 dark:border-[#2D333B] shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2D333B] pb-3">
            <div>
              <span className="text-[10px] font-black text-emerald-600 dark:text-[#A3E635] tracking-widest uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#A3E635] animate-ping" />
                IRONPULSE ACTIVE SESSION
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {activeSession.name}
              </h3>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Session Time</span>
              <span className="font-mono text-xl font-black text-blue-600 dark:text-[#A3E635]">
                {formatElapsed(elapsedSeconds)}
              </span>
            </div>
          </div>

          {/* Live Workout Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 bg-slate-50 dark:bg-[#22262E] rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Sets Done</span>
              <span className="font-mono text-base font-black text-slate-800 dark:text-white">
                {completedSetsCount} / {totalSetsCount}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-[#22262E] rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Exercises</span>
              <span className="font-mono text-base font-black text-slate-800 dark:text-white">
                {activeSession.exercises.length}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-[#22262E] rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Volume Lifted</span>
              <span className="font-mono text-base font-black text-blue-600 dark:text-[#A3E635]">
                {currentSessionVolumeKg} kg
              </span>
            </div>
          </div>

          {/* Session Actions */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              onClick={cancelSession}
              className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-[#22262E] dark:hover:bg-red-500/20 text-slate-600 dark:text-slate-400 dark:hover:text-red-400 text-xs font-bold transition-all active:scale-95"
            >
              Discard
            </button>
            <button
              onClick={finishSession}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-[#A3E635] dark:to-lime-400 text-white dark:text-black font-black text-xs uppercase tracking-wider shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> Finish & Save Workout
            </button>
          </div>
        </div>
      )}

      {/* Modal for adding custom exercise to active session */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="bg-white dark:bg-[#181B20] border border-slate-200 dark:border-[#2D333B] w-full max-w-md rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200 text-slate-900 dark:text-white">
            <h3 className="text-lg font-black mb-1">Add Exercise to Session</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter the exercise details with target muscle group and optional custom tutorial link.
            </p>
            <form onSubmit={addCustomExercise} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Exercise Name
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Incline Hammer Curls, Dips..."
                  value={customExerciseName}
                  onChange={(e) => setCustomExerciseName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#A3E635] outline-none font-semibold text-sm"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Target Muscle Group
                </label>
                <select
                  value={customMuscleGroup}
                  onChange={(e) => setCustomMuscleGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] font-semibold text-xs"
                >
                  <option value="Chest">Chest (Pectorals)</option>
                  <option value="Back">Back (Lats, Traps, Rhomboids)</option>
                  <option value="Shoulders">Shoulders (Delts)</option>
                  <option value="Arms">Arms (Biceps & Triceps)</option>
                  <option value="Legs">Legs (Quads, Hamstrings, Calves)</option>
                  <option value="Other">Other / Core</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Custom YouTube Video Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://youtu.be/... or https://youtube.com/watch?v=..."
                  value={customVideoUrl}
                  onChange={(e) => setCustomVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs font-mono"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#22262E] text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#A3E635] dark:to-lime-400 text-white dark:text-black font-extrabold text-xs uppercase tracking-wider shadow-md hover:opacity-90"
                >
                  Add Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Dual Rest Timer (Set or Exercise Transition) */}
      {restTimerConfig && (
        <RestTimer
          initialSeconds={restTimerConfig.seconds}
          mode={restTimerConfig.mode}
          nextExerciseName={restTimerConfig.nextExerciseName}
          isActive={Boolean(restTimerConfig)}
          onClose={() => setRestTimerConfig(null)}
          onFinish={() => setRestTimerConfig(null)}
        />
      )}
    </div>
  );
}
