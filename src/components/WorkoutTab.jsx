import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ExerciseCard from './ExerciseCard';
import RestTimer from './RestTimer';
import ExerciseAnimation from './ExerciseAnimation';
import { MUSCLE_GROUP_CONFIG, getExerciseMuscleGroup } from '../utils/exerciseData';

const DAYS_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
  const [restTimerConfig, setRestTimerConfig] = useState(null); // { mode: 'set'|'transition', seconds: number, nextExerciseName?: string }
  const [newPrNotice, setNewPrNotice] = useState(null);

  // Custom Exercise modal
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [customMuscleGroup, setCustomMuscleGroup] = useState('Chest');
  const [showAddModal, setShowAddModal] = useState(false);

  // Session elapsed timer (MM:SS)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (activeSession) {
      interval = setInterval(() => {
        const start = new Date(activeSession.startedAt).getTime();
        const now = Date.now();
        setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

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

  // Detect current day's routine
  const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const todayDayName = DAYS_NAMES[todayIndex];
  const todayRoutine = routines.find((r) => r.dayOfWeek === todayIndex) || routines[0];
  const isSundayRest = todayIndex === 0 || todayRoutine?.category === 'Rest';

  const startTodayRoutine = () => {
    const initialExercises = (todayRoutine.exercises || []).map((ex, idx) => ({
      id: `${ex.id}-${Date.now()}-${idx}`,
      name: ex.name,
      muscleGroup: ex.muscleGroup || getExerciseMuscleGroup(ex.name),
      customVideoUrl: ex.customVideoUrl || '',
      sets: Array.from({ length: ex.targetSets || 3 }).map((_, sIdx) => ({
        setNumber: sIdx + 1,
        weight: records[ex.name]?.weight || 60,
        reps: ex.defaultReps || 8,
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
          sets: [
            { setNumber: 1, weight: 60, reps: 8, completed: false, isPr: false },
            { setNumber: 2, weight: 60, reps: 8, completed: false, isPr: false },
            { setNumber: 3, weight: 60, reps: 8, completed: false, isPr: false }
          ]
        }
      ]
    });
  };

  const handleSetCompleted = (exerciseName, weight, reps, isNewPr) => {
    // Trigger standard Set Rest Timer (default 90s)
    setRestTimerConfig({
      mode: 'set',
      seconds: 90
    });

    if (isNewPr) {
      triggerPrCelebration(exerciseName, weight, reps);
      onRecordPr(exerciseName, weight, reps);
    }
  };

  const handleStartTransitionTimer = (currentExName) => {
    // Find next exercise name
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
      sets: [
        { setNumber: 1, weight: 50, reps: 10, completed: false, isPr: false },
        { setNumber: 2, weight: 50, reps: 10, completed: false, isPr: false },
        { setNumber: 3, weight: 50, reps: 10, completed: false, isPr: false }
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

  // Calculate session volume & completed sets
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
    <div className="space-y-5 pb-32 animate-in fade-in duration-200">
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

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1 (TOP): TODAY'S SCHEDULED WORKOUT CARD
          Automatically detects Monday-Sunday and shows full routine
         ───────────────────────────────────────────────────────────── */}
      {!isSundayRest ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-[#181B20] dark:via-[#1A1E24] dark:to-[#0F1115] text-white p-5 sm:p-6 shadow-xl border border-blue-500/20 dark:border-[#2D333B]">
          <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 dark:bg-[#A3E635]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Today Header Tag */}
          <div className="flex items-center justify-between mb-2">
            <span className="px-3 py-1 rounded-full bg-white/20 dark:bg-[#A3E635]/20 text-white dark:text-[#A3E635] text-xs font-black tracking-wider uppercase flex items-center gap-1.5 backdrop-blur-xs">
              <Calendar className="w-3.5 h-3.5" /> {todayDayName}'s Scheduled Routine
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100 dark:text-slate-400">
              {todayRoutine.category} Focus
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {todayRoutine.name}
          </h2>
          <p className="text-blue-100 dark:text-slate-400 text-xs mt-1">
            {todayRoutine.exercises?.length || 0} exercises programmed for maximum hypertrophy.
          </p>

          {/* Full Exercise List for Today */}
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
                      {ex.targetSets}×{ex.defaultReps}
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
                <span>Start Today's Workout ({todayRoutine.category})</span>
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
        /* SUNDAY RECOVERY CARD */
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 text-white p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Sunday Active Recovery & Rest
            </span>
            <span className="text-xs font-bold uppercase text-emerald-100">Optimal Growth</span>
          </div>
          <h2 className="text-xl font-black text-white">Muscle Growth Happens on Rest Days</h2>
          <p className="text-emerald-100 text-xs mt-1">
            Focus on 8 hours of sleep, light 20-minute mobility/foam rolling, and hitting your protein goal.
          </p>
          {!activeSession && (
            <div className="mt-4">
              <button
                onClick={startEmptySession}
                className="py-3 px-5 rounded-2xl bg-white text-slate-900 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:bg-slate-100 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-current" /> Start Optional Workout
              </button>
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
