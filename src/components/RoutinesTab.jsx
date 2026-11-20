import React, { useState } from 'react';
import { Calendar, Plus, Edit3, Trash2, Dumbbell, Sparkles, ChevronRight, Video } from 'lucide-react';
import { MUSCLE_GROUP_CONFIG, getExerciseMuscleGroup } from '../utils/exerciseData';

const DAYS_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function RoutinesTab({
  routines,
  onUpdateRoutines,
  onStartRoutineNow,
  onOpenFormGuide
}) {
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Push');
  const [formDay, setFormDay] = useState(1);
  const [formExercises, setFormExercises] = useState([]);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('Chest');
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState(10);
  const [newExVideoUrl, setNewExVideoUrl] = useState('');

  const openEditor = (routine) => {
    setEditingRoutine(routine);
    setIsCreatingNew(false);
    setFormName(routine.name);
    setFormCategory(routine.category || 'Push');
    setFormDay(routine.dayOfWeek ?? 1);
    setFormExercises([...(routine.exercises || [])]);
  };

  const openNewRoutineModal = () => {
    setEditingRoutine(null);
    setIsCreatingNew(true);
    setFormName('');
    setFormCategory('Push');
    setFormDay(1);
    setFormExercises([
      { id: `ex-${Date.now()}-1`, name: 'Barbell Flat Bench Press', muscleGroup: 'Chest', targetSets: 4, defaultReps: 8, customVideoUrl: '' },
      { id: `ex-${Date.now()}-2`, name: 'Incline Dumbbell Press', muscleGroup: 'Chest', targetSets: 3, defaultReps: 10, customVideoUrl: '' }
    ]);
  };

  const handleAddExerciseToForm = (e) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    setFormExercises([
      ...formExercises,
      {
        id: `ex-${Date.now()}`,
        name: newExName.trim(),
        muscleGroup: newExMuscle,
        targetSets: Number(newExSets) || 3,
        defaultReps: Number(newExReps) || 10,
        customVideoUrl: newExVideoUrl.trim()
      }
    ]);
    setNewExName('');
    setNewExVideoUrl('');
  };

  const handleRemoveExerciseFromForm = (index) => {
    setFormExercises(formExercises.filter((_, i) => i !== index));
  };

  const handleSaveRoutine = () => {
    if (!formName.trim()) return;

    if (isCreatingNew) {
      const newRoutineObj = {
        id: `custom-${Date.now()}`,
        name: formName.trim(),
        category: formCategory,
        dayOfWeek: Number(formDay),
        isRest: formCategory === 'Rest',
        exercises: formExercises
      };
      onUpdateRoutines([...routines, newRoutineObj]);
    } else if (editingRoutine) {
      const updated = routines.map((r) =>
        r.id === editingRoutine.id
          ? {
              ...r,
              name: formName.trim(),
              category: formCategory,
              dayOfWeek: Number(formDay),
              isRest: formCategory === 'Rest',
              exercises: formExercises
            }
          : r
      );
      onUpdateRoutines(updated);
    }

    setEditingRoutine(null);
    setIsCreatingNew(false);
  };

  const handleDeleteRoutine = (routineId) => {
    if (window.confirm('Delete this routine template?')) {
      onUpdateRoutines(routines.filter((r) => r.id !== routineId));
      if (editingRoutine?.id === routineId) setEditingRoutine(null);
    }
  };

  const resetToDefaultPpl = () => {
    if (window.confirm('Reset routines to default 6-Day PPL split?')) {
      localStorage.removeItem('ironpulse_routines');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-[#A3E635]" /> Workout Routines
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            6-Day Push-Pull-Legs split with form guides and custom videos.
          </p>
        </div>

        <button
          onClick={openNewRoutineModal}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#A3E635] dark:to-lime-400 text-white dark:text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Routine
        </button>
      </div>

      {/* Routine Cards Grid */}
      <div className="space-y-3">
        {routines.map((routine) => {
          const isRest = routine.isRest || routine.category === 'Rest';
          const dayLabel = DAYS_NAMES[routine.dayOfWeek] || 'Custom';
          const isToday = new Date().getDay() === routine.dayOfWeek;

          return (
            <div
              key={routine.id}
              className={`rounded-3xl p-5 border transition-all ${
                isToday
                  ? 'bg-white dark:bg-gradient-to-r dark:from-[#181B20] dark:to-[#20252C] border-blue-500/50 dark:border-[#A3E635]/60 shadow-md ring-2 ring-blue-500/10 dark:ring-transparent'
                  : 'bg-white dark:bg-[#181B20] border-slate-200/80 dark:border-[#2D333B] hover:border-slate-300 dark:hover:border-slate-600 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#22262E] text-slate-700 dark:text-slate-300">
                      {dayLabel}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                        routine.category === 'Push'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          : routine.category === 'Pull'
                          ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                          : routine.category === 'Legs'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                      }`}
                    >
                      {routine.category}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600 dark:bg-[#A3E635] text-white dark:text-black">
                        Today
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-2">
                    {routine.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditor(routine)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#22262E] dark:hover:bg-[#2D333B] text-slate-600 dark:text-slate-300 transition-all active:scale-90"
                    title="Edit routine"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {routines.length > 1 && (
                    <button
                      onClick={() => handleDeleteRoutine(routine.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-[#22262E] dark:hover:bg-red-500/20 text-slate-400 dark:text-slate-400 transition-all active:scale-90"
                      title="Delete routine"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Routine Exercises Preview */}
              {!isRest ? (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#22262E]">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {routine.exercises?.map((ex, idx) => {
                      const muscle = ex.muscleGroup || getExerciseMuscleGroup(ex.name);
                      const muscleStyle = MUSCLE_GROUP_CONFIG[muscle] || MUSCLE_GROUP_CONFIG.Other;

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#22262E] px-2.5 py-1 rounded-xl text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-transparent"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: muscleStyle.dotColor }}
                          />
                          <span>{ex.name}</span>
                          <button
                            onClick={() => onOpenFormGuide(ex)}
                            className="p-0.5 hover:text-blue-600 dark:hover:text-[#A3E635] text-slate-400 dark:text-slate-500 transition-colors"
                            title="Watch exercise form"
                          >
                            <Video className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => onStartRoutineNow(routine)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-[#22262E] dark:hover:bg-[#A3E635] text-slate-800 dark:text-slate-200 dark:hover:text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <span>Launch This Workout</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#22262E] text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 dark:text-[#A3E635]" />
                  <span>Scheduled rest day. Hydration, mobility, and recovery.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer reset button */}
      <div className="text-center pt-2">
        <button
          onClick={resetToDefaultPpl}
          className="text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 underline underline-offset-4"
        >
          Reset to default 6-Day PPL template
        </button>
      </div>

      {/* Modal for Creating or Editing Routine */}
      {(editingRoutine || isCreatingNew) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="bg-white dark:bg-[#181B20] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] w-full max-w-lg rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black mb-3">
              {isCreatingNew ? 'Create New Routine' : 'Edit Routine'}
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Routine Title
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Push Day (Hypertrophy)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#A3E635] outline-none font-semibold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] font-semibold text-xs"
                  >
                    <option value="Push">Push (Chest/Shoulders/Triceps)</option>
                    <option value="Pull">Pull (Back/Biceps)</option>
                    <option value="Legs">Legs (Quads/Hamstrings)</option>
                    <option value="Upper">Upper Body</option>
                    <option value="Lower">Lower Body</option>
                    <option value="Full Body">Full Body</option>
                    <option value="Rest">Rest & Recovery</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Scheduled Day
                  </label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] font-semibold text-xs"
                  >
                    {DAYS_NAMES.map((name, index) => (
                      <option key={index} value={index}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exercises in Routine */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Exercises ({formExercises.length})
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formExercises.map((ex, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#22262E] text-xs border border-slate-100 dark:border-transparent"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white">{ex.name}</span>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-[#181B20] text-slate-600 dark:text-slate-300">
                            {ex.muscleGroup || getExerciseMuscleGroup(ex.name)}
                          </span>
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                          {ex.targetSets} sets × {ex.defaultReps} reps
                          {ex.customVideoUrl ? ' • (Custom Video saved)' : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExerciseFromForm(idx)}
                        className="text-red-500 dark:text-red-400 p-1 hover:opacity-80"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {formExercises.length === 0 && (
                    <div className="text-xs text-slate-400 dark:text-slate-500 text-center py-4 bg-slate-50 dark:bg-[#22262E]/50 rounded-xl">
                      No exercises added yet. Add some below.
                    </div>
                  )}
                </div>
              </div>

              {/* Add Exercise form row */}
              <div className="p-3 bg-slate-50 dark:bg-[#22262E]/60 border border-slate-200/80 dark:border-[#2D333B] rounded-2xl space-y-2">
                <span className="text-[11px] font-black text-blue-600 dark:text-[#A3E635] uppercase tracking-wider block">
                  Add Exercise to Routine
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Exercise name (e.g. Lat Pulldown)"
                      value={newExName}
                      onChange={(e) => setNewExName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#181B20] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs font-semibold outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <select
                      value={newExMuscle}
                      onChange={(e) => setNewExMuscle(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl bg-white dark:bg-[#181B20] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs font-semibold"
                    >
                      <option value="Chest">Chest</option>
                      <option value="Back">Back</option>
                      <option value="Shoulders">Shoulders</option>
                      <option value="Arms">Arms</option>
                      <option value="Legs">Legs</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mb-0.5">Target Sets</span>
                    <input
                      type="number"
                      value={newExSets}
                      onChange={(e) => setNewExSets(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#181B20] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mb-0.5">Target Reps</span>
                    <input
                      type="number"
                      value={newExReps}
                      onChange={(e) => setNewExReps(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#181B20] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Custom Video input */}
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mb-0.5">
                    Custom YouTube Tutorial Link (Optional)
                  </span>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://youtu.be/... (or YouTube URL)"
                      value={newExVideoUrl}
                      onChange={(e) => setNewExVideoUrl(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#181B20] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs font-mono"
                    />
                    <Video className="w-3.5 h-3.5 text-rose-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddExerciseToForm}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 dark:bg-[#2D333B] dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add to List
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRoutine(null);
                    setIsCreatingNew(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#22262E] text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRoutine}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#A3E635] dark:to-lime-400 text-white dark:text-black font-extrabold text-xs uppercase tracking-wider shadow-md hover:opacity-90 active:scale-95"
                >
                  Save Routine
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
