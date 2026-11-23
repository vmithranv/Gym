import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  PlayCircle,
  Layers,
  Sparkles,
  Dumbbell,
  Check,
  ChevronRight,
  X
} from 'lucide-react';
import { MUSCLE_GROUP_CONFIG, getExerciseMuscleGroup } from '../utils/exerciseData';
import { BEGINNER_EXERCISE_GUIDES } from '../utils/beginnerExerciseData';
import SavedReelBookmarkBox from './SavedReelBookmarkBox';
import AnatomicalMuscleVisual from './AnatomicalMuscleVisual';
import ExerciseAnimation from './ExerciseAnimation';
import { loadFromStorage, saveToStorage } from '../utils/storage';

// 40+ Pre-populated Gym Exercises categorized by Body & Equipment
export const ALL_LIBRARY_EXERCISES = [
  // CHEST
  { id: 'lib-1', name: 'Barbell Flat Bench Press', body: 'Chest', equipment: 'Barbell', targetSets: 3, defaultReps: 10, restSeconds: 105 },
  { id: 'lib-2', name: 'Incline Dumbbell Press', body: 'Chest', equipment: 'Dumbbell', targetSets: 3, defaultReps: 10, restSeconds: 90 },
  { id: 'lib-3', name: 'Decline Barbell Bench Press', body: 'Chest', equipment: 'Barbell', targetSets: 3, defaultReps: 10, restSeconds: 90 },
  { id: 'lib-4', name: 'Flat Dumbbell Flyes', body: 'Chest', equipment: 'Dumbbell', targetSets: 3, defaultReps: 12, restSeconds: 75 },
  { id: 'lib-5', name: 'Cable Chest Fly (High-to-Low)', body: 'Chest', equipment: 'Cable', targetSets: 3, defaultReps: 12, restSeconds: 75 },
  { id: 'lib-6', name: 'Seated Machine Chest Press', body: 'Chest', equipment: 'Machine', targetSets: 3, defaultReps: 10, restSeconds: 90 },
  { id: 'lib-7', name: 'Pec Deck Machine Fly', body: 'Chest', equipment: 'Machine', targetSets: 3, defaultReps: 12, restSeconds: 75 },
  { id: 'lib-8', name: 'Weighted Chest Dips', body: 'Chest', equipment: 'Bodyweight', targetSets: 3, defaultReps: 10, restSeconds: 90 },
  { id: 'lib-9', name: 'Standard Push-Ups', body: 'Chest', equipment: 'Bodyweight', targetSets: 3, defaultReps: 15, restSeconds: 60 },

  // BACK
  { id: 'lib-10', name: 'Wide-Grip Lat Pulldown', body: 'Back', equipment: 'Cable', targetSets: 3, defaultReps: 10, restSeconds: 105 },
  { id: 'lib-11', name: 'Close-Grip Seated Cable Row', body: 'Back', equipment: 'Cable', targetSets: 3, defaultReps: 10, restSeconds: 105 },
  { id: 'lib-12', name: 'Chest-Supported T-Bar Row', body: 'Back', equipment: 'Machine', targetSets: 3, defaultReps: 10, restSeconds: 90 },
  { id: 'lib-13', name: 'Barbell Bent-Over Row', body: 'Back', equipment: 'Barbell', targetSets: 3, defaultReps: 10, restSeconds: 105 },
  { id: 'lib-14', name: 'Single-Arm Dumbbell Row', body: 'Back', equipment: 'Dumbbell', targetSets: 3, defaultReps: 10, restSeconds: 75 },
  { id: 'lib-15', name: 'Pull-Ups / Weighted Pull-Ups', body: 'Back', equipment: 'Bodyweight', targetSets: 3, defaultReps: 8, restSeconds: 90 },
  { id: 'lib-16', name: 'Straight-Arm Cable Pulldown', body: 'Back', equipment: 'Cable', targetSets: 3, defaultReps: 12, restSeconds: 75 },
  { id: 'lib-17', name: 'Conventional Barbell Deadlift', body: 'Back', equipment: 'Barbell', targetSets: 3, defaultReps: 6, restSeconds: 150 },

  // SHOULDERS
  { id: 'lib-18', name: 'Standing Overhead Barbell Press', body: 'Shoulders', equipment: 'Barbell', targetSets: 3, defaultReps: 10, restSeconds: 105 },
  { id: 'lib-19', name: 'Seated Dumbbell Shoulder Press', body: 'Shoulders', equipment: 'Dumbbell', targetSets: 3, defaultReps: 10, restSeconds: 90 },
  { id: 'lib-20', name: 'Dumbbell Lateral Raise', body: 'Shoulders', equipment: 'Dumbbell', targetSets: 3, defaultReps: 14, restSeconds: 75 },
  { id: 'lib-21', name: 'Cable Lateral Raise', body: 'Shoulders', equipment: 'Cable', targetSets: 3, defaultReps: 14, restSeconds: 60 },
  { id: 'lib-22', name: 'Cable Face Pulls', body: 'Shoulders', equipment: 'Cable', targetSets: 3, defaultReps: 14, restSeconds: 75 },
  { id: 'lib-23', name: 'Reverse Pec Deck (Rear Delts)', body: 'Shoulders', equipment: 'Machine', targetSets: 3, defaultReps: 12, restSeconds: 75 },
  { id: 'lib-24', name: 'Barbell Shrugs', body: 'Shoulders', equipment: 'Barbell', targetSets: 3, defaultReps: 12, restSeconds: 75 },

  // ARMS (BICEPS, TRICEPS, FOREARMS)
  { id: 'lib-25', name: 'Cable Tricep Rope Pushdown', body: 'Arms', equipment: 'Cable', targetSets: 3, defaultReps: 12, restSeconds: 75 },
  { id: 'lib-26', name: 'Incline Dumbbell Bicep Curl', body: 'Arms', equipment: 'Dumbbell', targetSets: 3, defaultReps: 10, restSeconds: 75 },
  { id: 'lib-27', name: 'Standing Dumbbell Hammer Curl', body: 'Arms', equipment: 'Dumbbell', targetSets: 3, defaultReps: 10, restSeconds: 75 },
  { id: 'lib-28', name: 'Reverse-Grip Barbell Curls', body: 'Arms', equipment: 'Barbell', targetSets: 3, defaultReps: 12, restSeconds: 75 },
  { id: 'lib-29', name: 'Skull Crushers (EZ-Bar)', body: 'Arms', equipment: 'Barbell', targetSets: 3, defaultReps: 10, restSeconds: 90 },
  { id: 'lib-30', name: 'Overhead Cable Tricep Extension', body: 'Arms', equipment: 'Cable', targetSets: 3, defaultReps: 12, restSeconds: 75 },
  { id: 'lib-31', name: 'Preacher Curl Machine', body: 'Arms', equipment: 'Machine', targetSets: 3, defaultReps: 10, restSeconds: 75 },

  // LEGS
  { id: 'lib-32', name: 'Incline 45° Leg Press', body: 'Legs', equipment: 'Machine', targetSets: 3, defaultReps: 10, restSeconds: 120 },
  { id: 'lib-33', name: 'Goblet Squats or Hack Squat', body: 'Legs', equipment: 'Dumbbell', targetSets: 3, defaultReps: 10, restSeconds: 105 },
  { id: 'lib-34', name: 'Barbell Back Squats', body: 'Legs', equipment: 'Barbell', targetSets: 3, defaultReps: 8, restSeconds: 150 },
  { id: 'lib-35', name: 'Romanian Deadlift (RDL)', body: 'Legs', equipment: 'Barbell', targetSets: 3, defaultReps: 10, restSeconds: 105 },
  { id: 'lib-36', name: 'Seated Hamstring Leg Curl', body: 'Legs', equipment: 'Machine', targetSets: 3, defaultReps: 10, restSeconds: 75 },
  { id: 'lib-37', name: 'Lying Leg Curl', body: 'Legs', equipment: 'Machine', targetSets: 3, defaultReps: 10, restSeconds: 75 },
  { id: 'lib-38', name: 'Leg Extension Machine', body: 'Legs', equipment: 'Machine', targetSets: 3, defaultReps: 12, restSeconds: 75 },
  { id: 'lib-39', name: 'Walking Dumbbell Lunges', body: 'Legs', equipment: 'Dumbbell', targetSets: 3, defaultReps: 12, restSeconds: 90 },
  { id: 'lib-40', name: 'Standing Machine Calf Raise', body: 'Legs', equipment: 'Machine', targetSets: 3, defaultReps: 15, restSeconds: 75 },

  // CORE
  { id: 'lib-41', name: 'Hanging Leg Raises', body: 'Core', equipment: 'Bodyweight', targetSets: 3, defaultReps: 12, restSeconds: 60 },
  { id: 'lib-42', name: 'Cable Woodchoppers', body: 'Core', equipment: 'Cable', targetSets: 3, defaultReps: 12, restSeconds: 60 },
  { id: 'lib-43', name: 'Ab Roller Wheel', body: 'Core', equipment: 'Bodyweight', targetSets: 3, defaultReps: 12, restSeconds: 60 },
  { id: 'lib-44', name: 'Weighted Plank Hold', body: 'Core', equipment: 'Bodyweight', targetSets: 3, defaultReps: 45, restSeconds: 60 }
];

export default function ExerciseLibraryTab({ onOpenFormGuide }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyFilter, setSelectedBodyFilter] = useState('All');
  const [selectedEquipFilter, setSelectedEquipFilter] = useState('All');

  // Custom User Exercises
  const [customExercises, setCustomExercises] = useState(() =>
    loadFromStorage('user_custom_library_exercises', [])
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExBody, setNewExBody] = useState('Chest');
  const [newExEquip, setNewExEquip] = useState('Dumbbell');

  const allExercises = useMemo(() => {
    return [...customExercises, ...ALL_LIBRARY_EXERCISES];
  }, [customExercises]);

  const bodyFilters = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];
  const equipFilters = ['All', 'Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight'];

  // Filtered Results
  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => {
      const matchSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchBody = selectedBodyFilter === 'All' || ex.body === selectedBodyFilter;
      const matchEquip = selectedEquipFilter === 'All' || ex.equipment === selectedEquipFilter;
      return matchSearch && matchBody && matchEquip;
    });
  }, [allExercises, searchQuery, selectedBodyFilter, selectedEquipFilter]);

  const handleSaveCustomExercise = (e) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    const newEx = {
      id: `custom-${Date.now()}`,
      name: newExName.trim(),
      body: newExBody,
      equipment: newExEquip,
      targetSets: 3,
      defaultReps: 10,
      restSeconds: 90
    };

    const updated = [newEx, ...customExercises];
    setCustomExercises(updated);
    saveToStorage('user_custom_library_exercises', updated);
    setNewExName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4 pb-32 animate-in fade-in duration-200">
      {/* Signature Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl hero-gradient text-white p-5 shadow-xl border border-teal-500/20">
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider hero-pill-badge text-white mb-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> Complete Database
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-white" />
              Exercise Library
            </h2>
            <p className="text-blue-100 text-xs font-medium mt-1">
              Search, filter by muscle or equipment, check 3D anatomical guides, and save your favourite video form tips.
            </p>
          </div>
          <span className="hero-pill-badge text-white px-3 py-1.5 rounded-xl text-xs font-mono font-bold shrink-0 border border-white/20">
            {filteredExercises.length} Total
          </span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search exercises by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#F1F5F9] dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200/80 dark:border-[#2D333B] text-xs font-medium shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Row 1 Filter: Target Body Muscle */}
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
          Target Muscle
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {bodyFilters.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBodyFilter(b)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedBodyFilter === b
                  ? 'bg-blue-600 dark:bg-[#A3E635] text-white dark:text-black shadow-xs'
                  : 'bg-white dark:bg-[#181B20] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-[#2D333B]'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2 Filter: Equipment */}
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
          Equipment Type
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {equipFilters.map((eq) => (
            <button
              key={eq}
              onClick={() => setSelectedEquipFilter(eq)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedEquipFilter === eq
                  ? 'bg-purple-600 dark:bg-lime-400 text-white dark:text-black shadow-xs'
                  : 'bg-white dark:bg-[#181B20] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-[#2D333B]'
              }`}
            >
              {eq}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Cards Grid */}
      <div className="space-y-3 pt-1">
        {filteredExercises.map((exercise) => {
          const muscleStyle = MUSCLE_GROUP_CONFIG[exercise.body] || MUSCLE_GROUP_CONFIG.Other;

          return (
            <div
              key={exercise.id}
              className="bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] rounded-3xl p-4 shadow-xs hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Movement animation / visual thumbnail */}
                  <div className="w-12 h-12 rounded-2xl bg-slate-950/20 dark:bg-black/30 border border-slate-200/70 dark:border-[#2D333B] flex items-center justify-center shrink-0 overflow-hidden">
                    <ExerciseAnimation exerciseName={exercise.name} className="w-10 h-10" />
                  </div>

                  <div>
                    <div className="flex items-center flex-wrap gap-1.5 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${muscleStyle.badgeBg} ${muscleStyle.badgeText} ${muscleStyle.badgeBorder}`}>
                        {exercise.body}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-[#22262E] text-slate-600 dark:text-slate-300">
                        {exercise.equipment}
                      </span>
                    </div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                      {exercise.name}
                    </h3>
                  </div>
                </div>

                {/* Watch Form Guide & YouTube Modal Trigger */}
                <button
                  onClick={() => onOpenFormGuide(exercise)}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-[#A3E635] border border-blue-500/20 dark:border-[#A3E635]/30 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Form</span>
                </button>
              </div>

              {/* Saved Reel Links Bookmark Box inside each exercise */}
              <SavedReelBookmarkBox exerciseName={exercise.name} />
            </div>
          );
        })}
      </div>

      {/* Floating Plus Button to Add Custom Exercise */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed right-5 bottom-24 z-30 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#A3E635] dark:to-lime-400 text-white dark:text-black flex items-center justify-center shadow-xl active:scale-95 transition-all cursor-pointer"
        title="Add Custom Exercise"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

      {/* Add Custom Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181B20] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] w-full max-w-sm rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base">Add Custom Exercise</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-[#22262E] text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomExercise} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Exercise Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Incline Cable Curls"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] border border-slate-200 dark:border-[#2D333B] text-slate-900 dark:text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Target Muscle Group:</label>
                <select
                  value={newExBody}
                  onChange={(e) => setNewExBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] border border-slate-200 dark:border-[#2D333B] text-slate-900 dark:text-white font-medium"
                >
                  <option value="Chest">Chest</option>
                  <option value="Back">Back</option>
                  <option value="Shoulders">Shoulders</option>
                  <option value="Arms">Arms</option>
                  <option value="Legs">Legs</option>
                  <option value="Core">Core</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Equipment:</label>
                <select
                  value={newExEquip}
                  onChange={(e) => setNewExEquip(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] border border-slate-200 dark:border-[#2D333B] text-slate-900 dark:text-white font-medium"
                >
                  <option value="Dumbbell">Dumbbell</option>
                  <option value="Barbell">Barbell</option>
                  <option value="Cable">Cable</option>
                  <option value="Machine">Machine</option>
                  <option value="Bodyweight">Bodyweight</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#22262E] text-slate-600 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold uppercase text-xs shadow-md"
                >
                  Save Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
