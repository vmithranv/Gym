import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Filter,
  Sparkles,
  Info,
  Calendar,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';
import AnatomicalMuscleVisual from './AnatomicalMuscleVisual';
import AnatomicalExerciseCard from './AnatomicalExerciseCard';
import { loadFromStorage, saveToStorage } from '../utils/storage';

export default function ExerciseGuideTab({ routines, onOpenFormGuide }) {
  // Filter bar state: 'All', 'push', 'pull', 'legs'
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Track completed exercise names for today's visual muscle progress strip
  const todayKey = new Date().toISOString().split('T')[0];
  const [completedMap, setCompletedMap] = useState(() =>
    loadFromStorage('exercise_guide_completed', {})
  );

  // Custom user media (screenshots / custom gif URLs) saved in storage
  const [customMediaMap, setCustomMediaMap] = useState(() =>
    loadFromStorage('exercise_custom_media', {})
  );

  const filterOptions = [
    { id: 'All', label: 'All Exercises', desc: 'Full PPL Routine' },
    { id: 'push', label: 'Monday: Push', desc: 'Chest, Shoulders & Triceps' },
    { id: 'pull', label: 'Wednesday: Pull', desc: 'Back & Biceps' },
    { id: 'legs', label: 'Friday: Legs', desc: 'Quads, Hamstrings & Calves' }
  ];

  // Map routines into filtered exercise lists
  const pushRoutine = routines.find((r) => r.id === 'monday-push') || routines[0];
  const pullRoutine = routines.find((r) => r.id === 'wednesday-pull') || routines[2];
  const legRoutine = routines.find((r) => r.id === 'friday-legs') || routines[4];

  let displayExercises = [];
  if (selectedFilter === 'push') {
    displayExercises = pushRoutine?.exercises || [];
  } else if (selectedFilter === 'pull') {
    displayExercises = pullRoutine?.exercises || [];
  } else if (selectedFilter === 'legs') {
    displayExercises = legRoutine?.exercises || [];
  } else {
    // Combine all unique exercises across the 3 main workout days
    displayExercises = [
      ...(pushRoutine?.exercises || []),
      ...(pullRoutine?.exercises || []),
      ...(legRoutine?.exercises || [])
    ];
  }

  // Which routine is active for the Top Muscle Progress Strip
  const stripRoutine =
    selectedFilter === 'pull'
      ? pullRoutine
      : selectedFilter === 'legs'
      ? legRoutine
      : pushRoutine; // default to push or currently selected

  const todayCompleted = completedMap[todayKey] || {};

  const handleToggleComplete = (exerciseName) => {
    const isNowDone = !todayCompleted[exerciseName];
    const updated = {
      ...completedMap,
      [todayKey]: {
        ...todayCompleted,
        [exerciseName]: isNowDone
      }
    };
    setCompletedMap(updated);
    saveToStorage('exercise_guide_completed', updated);
  };

  const handleSaveCustomMedia = (exerciseName, mediaUrlOrBase64) => {
    const updated = {
      ...customMediaMap,
      [exerciseName]: mediaUrlOrBase64
    };
    setCustomMediaMap(updated);
    saveToStorage('exercise_custom_media', updated);
  };

  const completedCount = displayExercises.filter((e) => todayCompleted[e.name]).length;

  return (
    <div className="space-y-5 pb-32 animate-in fade-in duration-200">
      {/* Tab Header Banner */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-[#A3E635]" /> 3D Exercise & Muscle Guide
          </h2>
          <span className="text-xs font-mono font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-[#22262E] px-2.5 py-1 rounded-full">
            {completedCount}/{displayExercises.length} Done
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Anatomical target muscle highlights, biomechanical cues, and visual completion tracking.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. TOP MUSCLE GROUP & ROUTINE FILTER BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedFilter(opt.id)}
            className={`px-3.5 py-2 rounded-2xl whitespace-nowrap text-xs font-bold transition-all cursor-pointer shadow-xs ${
              selectedFilter === opt.id
                ? 'bg-blue-600 dark:bg-[#A3E635] text-white dark:text-black shadow-blue-500/20'
                : 'bg-white dark:bg-[#181B20] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-[#2D333B] hover:border-slate-300'
            }`}
          >
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. VISUAL MUSCLE PROGRESS STRIP (MINI BODY DIAGRAMS WITH ✅)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-[#A3E635] block">
              Active Muscle Recruitment Strip
            </span>
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
              {stripRoutine?.name || "Today's Target Muscles"}
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
            Tap card below to complete
          </span>
        </div>

        {/* Horizontal Row of Miniature Anatomical Diagrams */}
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 pt-1">
          {(stripRoutine?.exercises || []).map((ex, idx) => {
            const isDone = Boolean(todayCompleted[ex.name]);

            return (
              <div
                key={idx}
                className={`p-2 rounded-2xl border transition-all flex flex-col items-center justify-between text-center relative overflow-hidden ${
                  isDone
                    ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/40'
                    : 'bg-slate-50 dark:bg-[#22262E]/70 border-slate-100 dark:border-transparent'
                }`}
              >
                {/* Mini Anatomical Silhouette with glowing muscle highlight */}
                <div className="w-9 h-12 flex items-center justify-center my-1">
                  <AnatomicalMuscleVisual
                    exerciseKey={ex.name}
                    targetMuscle={ex.muscleGroup}
                    mini={true}
                  />
                </div>

                <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 truncate w-full px-0.5">
                  {ex.name.split(' ')[0]}
                </span>

                {/* Bright Green Checkmark badge when done */}
                <div className="mt-1">
                  {isDone ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 text-transparent">
                      •
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. INTERACTIVE ANATOMICAL EXERCISE CARDS GRID
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Exercises ({displayExercises.length})
          </h3>
          <span className="text-[11px] text-slate-400">
            Tap cards to view cues or customize visual
          </span>
        </div>

        {displayExercises.map((exercise, idx) => (
          <AnatomicalExerciseCard
            key={`${exercise.id || exercise.name}-${idx}`}
            exercise={exercise}
            isCompleted={Boolean(todayCompleted[exercise.name])}
            onToggleComplete={handleToggleComplete}
            onOpenFormGuide={onOpenFormGuide}
            customMediaUrl={customMediaMap[exercise.name]}
            onSaveCustomMedia={handleSaveCustomMedia}
          />
        ))}
      </div>
    </div>
  );
}
