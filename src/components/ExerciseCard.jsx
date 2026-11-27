import React, { useState } from 'react';
import { Check, Plus, Trash2, Award, History, Dumbbell, PlayCircle, Timer, Bookmark, ExternalLink } from 'lucide-react';
import { MUSCLE_GROUP_CONFIG, getExerciseMuscleGroup } from '../utils/exerciseData';
import { useSavedReels } from '../utils/reelStorage';
import ExerciseAnimation from './ExerciseAnimation';

export default function ExerciseCard({
  exercise,
  onUpdateExercise,
  onRemoveExercise,
  previousRecord,
  onSetCompleted,
  onOpenFormGuide,
  onStartTransitionTimer,
  isLastExercise
}) {
  const [sets, setSets] = useState(
    exercise.sets && exercise.sets.length > 0
      ? exercise.sets
      : [
          { setNumber: 1, weight: previousRecord?.weight || 60, reps: previousRecord?.reps || 8, completed: false, isPr: false },
          { setNumber: 2, weight: previousRecord?.weight || 60, reps: previousRecord?.reps || 8, completed: false, isPr: false },
          { setNumber: 3, weight: previousRecord?.weight || 60, reps: previousRecord?.reps || 8, completed: false, isPr: false }
        ]
  );

  const { getForExercise } = useSavedReels();
  const savedReels = getForExercise(exercise.name);
  const [showSavedReels, setShowSavedReels] = useState(false);

  const muscleGroup = exercise.muscleGroup || getExerciseMuscleGroup(exercise.name);
  const muscleStyle = MUSCLE_GROUP_CONFIG[muscleGroup] || MUSCLE_GROUP_CONFIG.Other;

  const updateSetField = (index, field, value) => {
    const updated = sets.map((s, i) => {
      if (i === index) {
        return { ...s, [field]: value === '' ? '' : Number(value) };
      }
      return s;
    });
    setSets(updated);
    onUpdateExercise({ ...exercise, sets: updated });
  };

  const toggleSetComplete = (index) => {
    const currentSet = sets[index];
    const newStatus = !currentSet.completed;
    const weightNum = Number(currentSet.weight) || 0;
    const repsNum = Number(currentSet.reps) || 0;

    const prevWeight = previousRecord?.weight || 0;
    const isNewPr = newStatus && (weightNum > prevWeight || (weightNum === prevWeight && repsNum > (previousRecord?.reps || 0)));

    const updated = sets.map((s, i) => {
      if (i === index) {
        return {
          ...s,
          completed: newStatus,
          isPr: isNewPr
        };
      }
      return s;
    });

    setSets(updated);
    onUpdateExercise({ ...exercise, sets: updated });

    if (newStatus) {
      onSetCompleted(exercise.name, weightNum, repsNum, isNewPr);
    }
  };

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    const newSet = {
      setNumber: sets.length + 1,
      weight: lastSet ? lastSet.weight : (previousRecord?.weight || 60),
      reps: lastSet ? lastSet.reps : (previousRecord?.reps || 8),
      completed: false,
      isPr: false
    };
    const updated = [...sets, newSet];
    setSets(updated);
    onUpdateExercise({ ...exercise, sets: updated });
  };

  const removeSet = (index) => {
    if (sets.length <= 1) return;
    const filtered = sets
      .filter((_, i) => i !== index)
      .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
    setSets(filtered);
    onUpdateExercise({ ...exercise, sets: filtered });
  };

  const hasPrInCurrentSession = sets.some((s) => s.completed && s.isPr);
  const allSetsCompleted = sets.length > 0 && sets.every((s) => s.completed);

  return (
    <div className="bg-white dark:bg-[#181B20] rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#2D333B] shadow-xs hover:shadow-md transition-all mb-4">
      {/* Exercise Header with Animated GIF Demonstration */}
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Animated Demonstration Illustration/GIF */}
          <ExerciseAnimation exerciseName={exercise.name} className="w-16 h-16 shrink-0 shadow-xs" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-1.5 mb-1">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${muscleStyle.badgeBg} ${muscleStyle.badgeText} ${muscleStyle.badgeBorder}`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: muscleStyle.dotColor }}
                />
                {muscleGroup}
              </span>

              {/* Watch Form Guide Button */}
              <button
                type="button"
                onClick={() => onOpenFormGuide(exercise)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:bg-[#A3E635]/15 dark:hover:bg-[#A3E635]/25 dark:text-[#A3E635] border border-blue-500/20 dark:border-[#A3E635]/30 transition-all active:scale-95 cursor-pointer"
                title="Watch video & cues"
              >
                <PlayCircle className="w-3 h-3" />
                <span>Form</span>
              </button>

              {savedReels.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSavedReels((prev) => !prev)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/15 hover:bg-pink-500/25 text-pink-600 dark:text-pink-400 border border-pink-500/30 transition-all active:scale-95 cursor-pointer"
                  title="Open saved reels for this exercise"
                >
                  <Bookmark className="w-3 h-3" />
                  <span>{savedReels.length} Reel{savedReels.length > 1 ? 's' : ''}</span>
                </button>
              )}

              {hasPrInCurrentSession && (
                <span className="animate-pr-pop inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-rose-500 dark:from-[#A3E635] dark:to-lime-400 text-white dark:text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                  <Award className="w-3 h-3 stroke-[3]" /> NEW PR!
                </span>
              )}
            </div>

            <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight truncate">
              {exercise.name}
            </h3>

            {/* Previous Performance Reference */}
            {previousRecord ? (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                <History className="w-3.5 h-3.5 text-blue-500 dark:text-[#A3E635] shrink-0" />
                <span className="truncate">
                  Best:{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {previousRecord.weight}kg × {previousRecord.reps}r
                  </strong>
                  {previousRecord.calculated1RM ? (
                    <span className="text-slate-400 dark:text-slate-500 ml-1">
                      (~{previousRecord.calculated1RM}kg 1RM)
                    </span>
                  ) : null}
                </span>
              </div>
            ) : (
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                <Dumbbell className="w-3 h-3" /> First time logging
              </div>
            )}
          </div>
        </div>

        {onRemoveExercise && (
          <button
            type="button"
            onClick={() => onRemoveExercise(exercise.id)}
            className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-1.5 rounded-lg active:scale-90 transition-all shrink-0"
            title="Remove exercise"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Inline Saved Reels Drawer during Workout */}
      {showSavedReels && savedReels.length > 0 && (
        <div className="mb-3 p-2.5 rounded-2xl bg-pink-50/70 dark:bg-pink-950/20 border border-pink-200/70 dark:border-pink-800/40 space-y-1.5 animate-in fade-in">
          <div className="text-[10px] font-black uppercase tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-1">
            <Bookmark className="w-3 h-3" /> Saved Reference Reels
          </div>
          {savedReels.map((link) => (
            <div key={link.id} className="flex items-center justify-between gap-2 text-xs bg-white dark:bg-[#181B20] px-2.5 py-1.5 rounded-xl border border-pink-100 dark:border-[#2D333B]">
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                {link.title}
              </span>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 rounded-lg bg-pink-600 text-white font-bold text-[10px] flex items-center gap-1 shrink-0"
              >
                Open <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Sets Table Header */}
      <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1 text-center">
        <div className="col-span-2 text-left">SET</div>
        <div className="col-span-4">KG</div>
        <div className="col-span-4">REPS</div>
        <div className="col-span-2">DONE</div>
      </div>

      {/* Sets Rows */}
      <div className="space-y-2">
        {sets.map((set, idx) => {
          const isDone = set.completed;
          return (
            <div
              key={idx}
              className={`grid grid-cols-12 gap-2 items-center p-1.5 rounded-2xl transition-all ${
                isDone
                  ? 'bg-emerald-50/80 dark:bg-[#22262E]/70 border border-emerald-500/30 dark:border-[#A3E635]/30'
                  : 'bg-slate-50 dark:bg-[#0F1115]/50 border border-slate-100 dark:border-transparent'
              }`}
            >
              {/* Set index */}
              <div className="col-span-2 text-left flex items-center gap-1 pl-1">
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isDone
                      ? 'bg-emerald-500 dark:bg-[#A3E635] text-white dark:text-black font-extrabold'
                      : 'bg-slate-200 dark:bg-[#22262E] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {set.setNumber}
                </span>
                {sets.length > 1 && !isDone && (
                  <button
                    onClick={() => removeSet(idx)}
                    className="text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 p-0.5 text-xs opacity-50 hover:opacity-100"
                    title="Delete set"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Weight Input (Thumb-friendly) */}
              <div className="col-span-4">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={set.weight}
                  disabled={isDone}
                  onChange={(e) => updateSetField(idx, 'weight', e.target.value)}
                  className="w-full text-center font-mono font-bold text-base py-2.5 rounded-xl bg-white dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#A3E635] shadow-xs disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  placeholder="0"
                />
              </div>

              {/* Reps Input (Thumb-friendly) */}
              <div className="col-span-4">
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={set.reps}
                  disabled={isDone}
                  onChange={(e) => updateSetField(idx, 'reps', e.target.value)}
                  className="w-full text-center font-mono font-bold text-base py-2.5 rounded-xl bg-white dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#A3E635] shadow-xs disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  placeholder="0"
                />
              </div>

              {/* Checkmark Button */}
              <div className="col-span-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => toggleSetComplete(idx)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-90 ${
                    isDone
                      ? 'bg-emerald-500 dark:bg-[#A3E635] text-white dark:text-black shadow-md shadow-emerald-500/20 dark:shadow-[#A3E635]/20'
                      : 'bg-white dark:bg-[#22262E] text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-[#2D333B]'
                  }`}
                  aria-label="Toggle completed set"
                >
                  <Check className={`w-5 h-5 ${isDone ? 'stroke-[3.5]' : 'stroke-2'}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Exercise Actions: Add Set & Exercise Transition Rest Timer */}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={addSet}
          className="flex-1 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#22262E]/80 dark:hover:bg-[#22262E] text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-dashed border-slate-200 dark:border-[#2D333B] hover:border-blue-400 dark:hover:border-[#A3E635]/50 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4 text-blue-600 dark:text-[#A3E635]" /> Add Set
        </button>

        {!isLastExercise && (
          <button
            onClick={() => onStartTransitionTimer(exercise.name)}
            className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all ${
              allSetsCompleted
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm animate-pulse'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60'
            }`}
            title="Start 2-minute rest before next exercise"
          >
            <Timer className="w-4 h-4" /> Next Exercise Rest (2m)
          </button>
        )}
      </div>
    </div>
  );
}
