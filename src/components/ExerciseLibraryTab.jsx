import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  PlayCircle,
  Layers,
  Sparkles,
  Bookmark,
  ExternalLink,
  Trash2,
  Video,
  Check,
  AlertCircle,
  X
} from 'lucide-react';
import { MUSCLE_GROUP_CONFIG } from '../utils/exerciseData';
import SavedReelBookmarkBox from './SavedReelBookmarkBox';
import ExerciseAnimation from './ExerciseAnimation';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { useSavedReels, GENERAL_REELS_KEY } from '../utils/reelStorage';
import { logAnalyticsEvent } from '../utils/analyticsService';

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
  useEffect(() => {
    logAnalyticsEvent('exercise_library_viewed', { surface: 'Exercise Library Tab' });
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyFilter, setSelectedBodyFilter] = useState('All');
  const [selectedEquipFilter, setSelectedEquipFilter] = useState('All');
  const [showReelsVault, setShowReelsVault] = useState(false);

  // Centralized Saved Reels state synced across all components
  const { allReels, totalReelsCount, addReel, deleteReel } = useSavedReels();
  const [vaultUrl, setVaultUrl] = useState('');
  const [vaultTitle, setVaultTitle] = useState('');
  const [vaultExercise, setVaultExercise] = useState(GENERAL_REELS_KEY);
  const [vaultError, setVaultError] = useState('');
  const [vaultSavedNotice, setVaultSavedNotice] = useState('');

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

  const handleSaveVaultReel = (e) => {
    e.preventDefault();
    setVaultError('');
    setVaultSavedNotice('');

    const res = addReel(vaultExercise, vaultUrl, vaultTitle);
    if (!res.ok) {
      setVaultError(res.error || 'Could not save link.');
      return;
    }

    setVaultUrl('');
    setVaultTitle('');
    setVaultSavedNotice('Saved for future reference!');
    setTimeout(() => setVaultSavedNotice(''), 2500);
  };

  const filteredVaultReels = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allReels;
    return allReels.filter(
      (r) =>
        (r.title || '').toLowerCase().includes(q) ||
        (r.exerciseName || '').toLowerCase().includes(q) ||
        (r.url || '').toLowerCase().includes(q)
    );
  }, [allReels, searchQuery]);

  return (
    <div className="space-y-4 pb-32 animate-in fade-in duration-200">
      {/* Signature Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl hero-gradient text-white p-5 shadow-xl border border-teal-500/20">
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between gap-2">
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
          <button
            type="button"
            onClick={() => setShowReelsVault((prev) => !prev)}
            className="hero-pill-badge hover:bg-white/30 text-white px-3 py-1.5 rounded-xl text-xs font-black shrink-0 border border-white/25 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-pink-300" />
            <span>{totalReelsCount} Reels</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher: Exercise Catalog vs All Saved Reels Vault */}
      <div className="flex rounded-2xl bg-[#F1F5F9] dark:bg-[#20242C] p-1 border border-slate-200/80 dark:border-[#2D333B]">
        <button
          type="button"
          onClick={() => setShowReelsVault(false)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            !showReelsVault
              ? 'bg-white dark:bg-[#181B20] text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Exercises ({filteredExercises.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setShowReelsVault(true)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            showReelsVault
              ? 'bg-white dark:bg-[#181B20] text-pink-600 dark:text-[#A3E635] shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-pink-500" />
          <span>Saved Reels Vault ({totalReelsCount})</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder={showReelsVault ? 'Search saved reels by title, exercise, or URL...' : 'Search exercises by name...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#F1F5F9] dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200/80 dark:border-[#2D333B] text-xs font-medium shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showReelsVault ? (
        /* ─────────────────────────────────────────────────────────────
           UNIFIED SAVED REELS VAULT FOR FUTURE REFERENCE
           ───────────────────────────────────────────────────────────── */
        <div className="space-y-4">
          {/* Quick Add Any Reel Form */}
          <form
            onSubmit={handleSaveVaultReel}
            noValidate
            className="repkraft-card rounded-2xl p-4 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
                <Video className="w-4 h-4 text-pink-500" /> Save Reel Link for Future Reference
              </h3>
              {vaultSavedNotice && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-[#A3E635] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> {vaultSavedNotice}
                </span>
              )}
            </div>

            <input
              type="text"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="Paste Instagram Reel, YouTube, or Video URL..."
              value={vaultUrl}
              onChange={(e) => {
                setVaultUrl(e.target.value);
                if (vaultError) setVaultError('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1F5F9] dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs font-mono outline-none focus:ring-2 focus:ring-teal-500"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Note / Form Cue (e.g. Elbow angle cue)"
                value={vaultTitle}
                onChange={(e) => setVaultTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs outline-none focus:ring-2 focus:ring-teal-500"
              />
              <select
                value={vaultExercise}
                onChange={(e) => setVaultExercise(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs font-semibold outline-none"
              >
                <option value={GENERAL_REELS_KEY}>{GENERAL_REELS_KEY}</option>
                {allExercises.map((ex) => (
                  <option key={ex.id} value={ex.name}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            {vaultError && (
              <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {vaultError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Save Reel Bookmark
            </button>
          </form>

          {/* Saved Reels List */}
          {filteredVaultReels.length > 0 ? (
            <div className="space-y-2.5">
              {filteredVaultReels.map((item) => (
                <div
                  key={`${item.exerciseName}-${item.id}`}
                  className="repkraft-card rounded-2xl p-3.5 flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-[#A3E635] mb-1">
                        {item.exerciseName}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {item.url}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                    >
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => deleteReel(item.exerciseName, item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Delete reel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="repkraft-card rounded-2xl p-6 text-center space-y-2">
              <Bookmark className="w-8 h-8 text-pink-500 mx-auto opacity-70" />
              <h4 className="font-black text-sm text-slate-800 dark:text-white">
                No Saved Reels Yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Paste any Instagram Reel or YouTube form video above (or under any exercise card) so you can revisit it quickly during workouts.
              </p>
            </div>
          )}
        </div>
      ) : (
        <>

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
        </>
      )}

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
