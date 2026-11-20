import React, { useState } from 'react';
import { Play, Plus, Clock, Award, Flame, CheckCircle2, Video } from 'lucide-react';
import confetti from 'canvas-confetti';
import ExerciseCard from './ExerciseCard';
import RestTimer from './RestTimer';
import { MUSCLE_GROUP_CONFIG, getExerciseMuscleGroup } from '../utils/exerciseData';

export default function WorkoutTab({
  activeSession,
  setActiveSession,
  routines,
  records,
  onSaveWorkout,
  onRecordPr,
  onOpenFormGuide
}) {
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [newPrNotice, setNewPrNotice] = useState(null);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [customMuscleGroup, setCustomMuscleGroup] = useState('Chest');
  const [showAddModal, setShowAddModal] = useState(false);

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
    const todayIndex = new Date().getDay();
    const matchedRoutine = routines.find((r) => r.dayOfWeek === todayIndex) || routines[0];

    const initialExercises = (matchedRoutine.exercises || []).map((ex, idx) => ({
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
      name: matchedRoutine.name || "Today's Lift",
      routineId: matchedRoutine.id,
      startedAt: new Date().toISOString(),
      exercises: initialExercises
    });
  };

  const startEmptySession = () => {
    setActiveSession({
      id: `session-${Date.now()}`,
      name: 'Custom Session',
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
    setShowRestTimer(true);

    if (isNewPr) {
      triggerPrCelebration(exerciseName, weight, reps);
      onRecordPr(exerciseName, weight, reps);
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
    setShowRestTimer(false);

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
      setShowRestTimer(false);
    }
  };

  // If no active session, show the quick-start view
  if (!activeSession) {
    const todayIndex = new Date().getDay();
    const todayRoutine = routines.find((r) => r.dayOfWeek === todayIndex);

    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        {/* Vibrant Gradient Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-[#181B20] dark:via-[#1A1E24] dark:to-[#0F1115] text-white p-6 shadow-xl border border-blue-500/20 dark:border-[#2D333B]">
          <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 dark:bg-[#A3E635]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-white/20 dark:bg-[#A3E635]/20 text-white dark:text-[#A3E635] text-xs font-black tracking-wider uppercase flex items-center gap-1.5 backdrop-blur-xs">
              <Flame className="w-3.5 h-3.5 fill-current" /> Ready to Train
            </span>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            IronPulse Session
          </h2>
          <p className="text-blue-100 dark:text-slate-400 text-xs mt-1 max-w-sm">
            Track weights, smash personal records, and check video form guides for every lift.
          </p>

          <div className="mt-5 flex flex-col gap-2.5">
            <button
              onClick={startTodayRoutine}
              className="w-full py-4 px-6 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 dark:bg-[#A3E635] dark:text-black dark:hover:bg-lime-400 font-extrabold text-sm flex items-center justify-center gap-3 shadow-lg active:scale-98 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Today's Workout: {todayRoutine?.name ? todayRoutine.name.split('(')[0] : 'Push Day'}</span>
            </button>

            <button
              onClick={startEmptySession}
              className="w-full py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/20 dark:bg-[#22262E] dark:hover:bg-[#2D333B] text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/20 dark:border-[#2D333B] active:scale-98 transition-all backdrop-blur-xs"
            >
              <Plus className="w-4 h-4 text-emerald-300 dark:text-[#A3E635]" />
              <span>Start Blank / Freestyle Workout</span>
            </button>
          </div>
        </div>

        {/* Quick Preview of Today's exercises */}
        {todayRoutine && todayRoutine.exercises?.length > 0 && (
          <div className="bg-white dark:bg-[#181B20] rounded-3xl p-5 border border-slate-200/80 dark:border-[#2D333B] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-[#A3E635]" /> Scheduled for Today ({todayRoutine.category})
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {todayRoutine.exercises.length} Exercises
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-[#22262E]">
              {todayRoutine.exercises.map((ex, i) => {
                const muscle = ex.muscleGroup || getExerciseMuscleGroup(ex.name);
                const muscleStyle = MUSCLE_GROUP_CONFIG[muscle] || MUSCLE_GROUP_CONFIG.Other;

                return (
                  <div key={i} className="py-2.5 flex items-center justify-between text-sm gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-[#22262E] text-slate-500 dark:text-slate-400 text-xs flex items-center justify-center font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {ex.name}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 border ${muscleStyle.badgeBg} ${muscleStyle.badgeText} ${muscleStyle.badgeBorder}`}
                      >
                        {muscle}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onOpenFormGuide(ex)}
                        className="p-1 text-blue-600 dark:text-[#A3E635] hover:opacity-80 transition-opacity"
                        title="Watch form video"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                        {ex.targetSets}×{ex.defaultReps}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active workout view
  const completedSetsCount = activeSession.exercises.reduce(
    (acc, ex) => acc + (ex.sets ? ex.sets.filter((s) => s.completed).length : 0),
    0
  );
  const totalSetsCount = activeSession.exercises.reduce(
    (acc, ex) => acc + (ex.sets ? ex.sets.length : 0),
    0
  );

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-200">
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

      {/* Active Session Header Card */}
      <div className="bg-white dark:bg-[#181B20] rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#2D333B] shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-emerald-600 dark:text-[#A3E635] tracking-widest uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#A3E635] animate-ping" />
            LIVE WORKOUT
          </span>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mt-0.5 leading-snug">
            {activeSession.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Progress: <strong className="text-slate-800 dark:text-white">{completedSetsCount}</strong> of{' '}
            <strong className="text-slate-800 dark:text-white">{totalSetsCount}</strong> sets completed
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={cancelSession}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 dark:bg-[#22262E] dark:hover:bg-red-500/20 text-slate-600 dark:text-slate-400 dark:hover:text-red-400 text-xs font-bold transition-all"
          >
            Discard
          </button>
          <button
            onClick={finishSession}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-[#A3E635] dark:to-lime-400 text-white dark:text-black font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[3]" /> Finish
          </button>
        </div>
      </div>

      {/* List of Exercises */}
      <div className="space-y-3">
        {activeSession.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onUpdateExercise={updateExercise}
            onRemoveExercise={removeExercise}
            previousRecord={records[exercise.name]}
            onSetCompleted={handleSetCompleted}
            onOpenFormGuide={onOpenFormGuide}
          />
        ))}
      </div>

      {/* Add Exercise Button */}
      <div className="pt-2">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-4 rounded-2xl bg-white hover:bg-slate-50 dark:bg-[#181B20] dark:hover:bg-[#22262E] text-slate-700 dark:text-slate-200 border border-dashed border-slate-300 dark:border-[#2D333B] hover:border-blue-500 dark:hover:border-[#A3E635] font-bold text-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
        >
          <Plus className="w-5 h-5 text-blue-600 dark:text-[#A3E635]" /> Add Another Exercise
        </button>
      </div>

      {/* Add Custom Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="bg-white dark:bg-[#181B20] border border-slate-200 dark:border-[#2D333B] w-full max-w-md rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200 text-slate-900 dark:text-white">
            <h3 className="text-lg font-black mb-1">Add Exercise to Session</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter the exercise details and optionally save a custom YouTube tutorial link.
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
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://youtu.be/... or https://youtube.com/watch?v=..."
                    value={customVideoUrl}
                    onChange={(e) => setCustomVideoUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs font-mono"
                  />
                  <Video className="w-4 h-4 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
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

      {/* Floating Rest Timer */}
      {showRestTimer && (
        <RestTimer
          initialSeconds={90}
          isActive={showRestTimer}
          onClose={() => setShowRestTimer(false)}
          onFinish={() => setShowRestTimer(false)}
        />
      )}
    </div>
  );
}
