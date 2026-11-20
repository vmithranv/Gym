import React, { useState } from 'react';
import { Play, Plus, Clock, Dumbbell, Award, Flame, CheckCircle2, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import ExerciseCard from './ExerciseCard';
import RestTimer from './RestTimer';
import { calculate1RM } from '../utils/storage';

export default function WorkoutTab({
  activeSession,
  setActiveSession,
  routines,
  records,
  onSaveWorkout,
  onRecordPr
}) {
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [newPrNotice, setNewPrNotice] = useState(null);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Trigger celebration confetti
  const triggerPrCelebration = (exerciseName, weight, reps) => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#A3E635', '#ffffff', '#84cc16', '#e2e8f0', '#22c55e']
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
    // Determine today's day (0=Sunday, 1=Monday, etc.)
    const todayIndex = new Date().getDay();
    const matchedRoutine = routines.find((r) => r.dayOfWeek === todayIndex) || routines[0];

    const initialExercises = (matchedRoutine.exercises || []).map((ex, idx) => ({
      id: `${ex.id}-${Date.now()}-${idx}`,
      name: ex.name,
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
    // Show automatic rest timer
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
      <div className="space-y-5 animate-in fade-in duration-300">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#181B20] via-[#1A1E24] to-[#0F1115] border border-[#2D333B] p-6 shadow-xl">
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#A3E635]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-[#A3E635]/20 text-[#A3E635] text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 fill-[#A3E635]" /> Ready to Crush It
            </span>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            IronPulse Session
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Track weights, smash personal records, and log every rep with zero friction.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={startTodayRoutine}
              className="w-full py-4 px-6 rounded-2xl bg-[#A3E635] hover:bg-lime-400 text-black font-extrabold text-base flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(163,230,53,0.35)] active:scale-98 transition-all"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>Start Today's Workout: {todayRoutine?.name ? todayRoutine.name.split('(')[0] : 'Push Day'}</span>
            </button>

            <button
              onClick={startEmptySession}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#22262E] hover:bg-[#2D333B] text-white font-bold text-sm flex items-center justify-center gap-2 border border-[#2D333B] active:scale-98 transition-all"
            >
              <Plus className="w-4 h-4 text-[#A3E635]" />
              <span>Start Blank / Freestyle Workout</span>
            </button>
          </div>
        </div>

        {/* Quick Preview of Today's exercises */}
        {todayRoutine && todayRoutine.exercises?.length > 0 && (
          <div className="bg-[#181B20] rounded-2xl p-5 border border-[#2D333B]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#A3E635]" /> Scheduled for Today ({todayRoutine.category})
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {todayRoutine.exercises.length} Exercises
              </span>
            </div>

            <div className="divide-y divide-[#22262E]">
              {todayRoutine.exercises.map((ex, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#22262E] text-slate-400 text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-slate-200">{ex.name}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {ex.targetSets} sets × {ex.defaultReps} reps
                  </span>
                </div>
              ))}
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
        <div className="sticky top-2 z-50 animate-pr-pop bg-gradient-to-r from-[#A3E635] to-lime-300 text-black px-4 py-3 rounded-2xl shadow-[0_10px_25px_rgba(163,230,53,0.5)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-black rounded-xl text-[#A3E635]">
              <Award className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-black/70">
                NEW PERSONAL RECORD!
              </div>
              <div className="font-black text-sm">
                {newPrNotice.exercise}: {newPrNotice.weight} kg × {newPrNotice.reps} reps
              </div>
            </div>
          </div>
          <span className="text-xs font-extrabold uppercase px-2 py-1 bg-black/10 rounded-lg">
            BEAST!
          </span>
        </div>
      )}

      {/* Active Session Header Card */}
      <div className="bg-[#181B20] rounded-2xl p-4 border border-[#2D333B] shadow-md flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#A3E635] tracking-widest uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-ping" />
            LIVE WORKOUT
          </span>
          <h2 className="text-lg font-black text-white mt-0.5 leading-snug">
            {activeSession.name}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Progress: <strong className="text-white">{completedSetsCount}</strong> of{' '}
            <strong className="text-white">{totalSetsCount}</strong> sets completed
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={cancelSession}
            className="px-3 py-2 rounded-xl bg-[#22262E] hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs font-bold transition-all"
          >
            Discard
          </button>
          <button
            onClick={finishSession}
            className="px-4 py-2.5 rounded-xl bg-[#A3E635] hover:bg-lime-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(163,230,53,0.3)] active:scale-95 transition-all flex items-center gap-1.5"
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
          />
        ))}
      </div>

      {/* Add Exercise Button */}
      <div className="pt-2">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-4 rounded-2xl bg-[#181B20] hover:bg-[#22262E] text-slate-200 border border-dashed border-[#2D333B] hover:border-[#A3E635] font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
        >
          <Plus className="w-5 h-5 text-[#A3E635]" /> Add Another Exercise
        </button>
      </div>

      {/* Add Custom Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#181B20] border border-[#2D333B] w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
            <h3 className="text-lg font-black text-white mb-2">Add Exercise</h3>
            <p className="text-xs text-slate-400 mb-4">
              Type any exercise name to add it to your active session.
            </p>
            <form onSubmit={addCustomExercise} className="space-y-4">
              <input
                type="text"
                autoFocus
                placeholder="e.g., Incline Dumbbell Curl, Dips..."
                value={customExerciseName}
                onChange={(e) => setCustomExerciseName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#22262E] text-white border border-[#2D333B] focus:outline-none focus:ring-2 focus:ring-[#A3E635] font-semibold text-sm placeholder:text-slate-500"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#22262E] text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#A3E635] text-black font-extrabold text-xs uppercase tracking-wider shadow-md hover:bg-lime-400"
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
