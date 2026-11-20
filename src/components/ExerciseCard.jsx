import React, { useState } from 'react';
import { Check, Plus, Trash2, Award, History, Dumbbell } from 'lucide-react';
import { calculate1RM } from '../utils/storage';

export default function ExerciseCard({
  exercise,
  onUpdateExercise,
  onRemoveExercise,
  previousRecord,
  onSetCompleted,
  isPrTriggered
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

    // Check PR against previous record
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

  // Check if any completed set is a PR
  const hasPrInCurrentSession = sets.some((s) => s.completed && s.isPr);

  return (
    <div className="bg-[#181B20] rounded-2xl p-4 border border-[#2D333B] shadow-lg mb-4 transition-all">
      {/* Exercise Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-white leading-tight">
              {exercise.name}
            </h3>
            {hasPrInCurrentSession && (
              <span className="animate-pr-pop inline-flex items-center gap-1 bg-[#A3E635] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-[0_0_12px_rgba(163,230,53,0.5)]">
                <Award className="w-3 h-3 stroke-[3]" /> NEW PR!
              </span>
            )}
          </div>

          {/* Previous Performance Reference */}
          {previousRecord ? (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
              <History className="w-3.5 h-3.5 text-[#A3E635]" />
              <span>
                Previous best:{' '}
                <strong className="text-slate-200">
                  {previousRecord.weight} kg × {previousRecord.reps} reps
                </strong>
                {previousRecord.calculated1RM ? (
                  <span className="text-slate-500 ml-1">
                    (~{previousRecord.calculated1RM}kg 1RM)
                  </span>
                ) : null}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Dumbbell className="w-3 h-3" /> First time logging this exercise
            </div>
          )}
        </div>

        {onRemoveExercise && (
          <button
            onClick={() => onRemoveExercise(exercise.id)}
            className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg active:scale-90 transition-all"
            title="Remove exercise"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sets Table Header */}
      <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1 text-center">
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
              className={`grid grid-cols-12 gap-2 items-center p-1.5 rounded-xl transition-all ${
                isDone ? 'bg-[#22262E]/70 border border-[#A3E635]/30' : 'bg-[#0F1115]/50 border border-transparent'
              }`}
            >
              {/* Set index */}
              <div className="col-span-2 text-left flex items-center gap-1 pl-1">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                  isDone ? 'bg-[#A3E635] text-black font-extrabold' : 'bg-[#22262E] text-slate-300'
                }`}>
                  {set.setNumber}
                </span>
                {sets.length > 1 && !isDone && (
                  <button
                    onClick={() => removeSet(idx)}
                    className="text-slate-600 hover:text-red-400 p-0.5 text-xs opacity-40 hover:opacity-100"
                    title="Delete set"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Weight Input (Thumb-friendly) */}
              <div className="col-span-4">
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={set.weight}
                    disabled={isDone}
                    onChange={(e) => updateSetField(idx, 'weight', e.target.value)}
                    className={`w-full text-center font-mono font-bold text-base py-2.5 rounded-xl bg-[#22262E] text-white focus:outline-none focus:ring-2 focus:ring-[#A3E635] transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Reps Input (Thumb-friendly) */}
              <div className="col-span-4">
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={set.reps}
                    disabled={isDone}
                    onChange={(e) => updateSetField(idx, 'reps', e.target.value)}
                    className={`w-full text-center font-mono font-bold text-base py-2.5 rounded-xl bg-[#22262E] text-white focus:outline-none focus:ring-2 focus:ring-[#A3E635] transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Checkmark Button */}
              <div className="col-span-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => toggleSetComplete(idx)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-90 ${
                    isDone
                      ? 'bg-[#A3E635] text-black shadow-[0_0_15px_rgba(163,230,53,0.4)]'
                      : 'bg-[#22262E] text-slate-500 hover:text-white hover:border-[#A3E635]/40 border border-[#2D333B]'
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

      {/* Add Set Button */}
      <button
        onClick={addSet}
        className="w-full mt-3 py-2.5 rounded-xl bg-[#22262E]/80 hover:bg-[#22262E] text-slate-300 hover:text-white border border-dashed border-[#2D333B] hover:border-[#A3E635]/50 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider active:scale-98 transition-all"
      >
        <Plus className="w-4 h-4 text-[#A3E635]" /> Add Set
      </button>
    </div>
  );
}
