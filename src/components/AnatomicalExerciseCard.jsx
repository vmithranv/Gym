import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  Upload,
  AlertTriangle,
  Timer,
  Layers,
  Sparkles,
  Image,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MUSCLE_GROUP_CONFIG, getExerciseMuscleGroup } from '../utils/exerciseData';
import { BEGINNER_EXERCISE_GUIDES } from '../utils/beginnerExerciseData';
import SavedReelBookmarkBox from './SavedReelBookmarkBox';

export default function AnatomicalExerciseCard({
  exercise,
  isCompleted = false,
  onToggleComplete,
  onOpenFormGuide,
  customMediaUrl,
  onSaveCustomMedia
}) {
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [imgError, setImgError] = useState(false);

  const muscle = exercise.muscleGroup || getExerciseMuscleGroup(exercise.name);
  const muscleStyle = MUSCLE_GROUP_CONFIG[muscle] || MUSCLE_GROUP_CONFIG.Other;

  // Retrieve beginner-friendly instructions and verified image
  const beginnerGuide = BEGINNER_EXERCISE_GUIDES[exercise.name] || {
    equipment: 'Gym Equipment / Dumbbell',
    targetMuscle: muscle,
    youtubeId: '',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    step1: 'Position yourself securely on the machine or bench. Check hand grip and foot placement.',
    step2: 'Perform the movement smoothly while exhaling through the lift.',
    step3: 'Lower weights under complete 2-3 second control back to starting position.',
    commonMistake: 'Using excessive weight and jerky body momentum.'
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          onSaveCustomMedia(exercise.name, reader.result);
          setShowMediaInput(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (mediaUrlInput.trim()) {
      onSaveCustomMedia(exercise.name, mediaUrlInput.trim());
      setMediaUrlInput('');
      setShowMediaInput(false);
    }
  };

  const displayImage = customMediaUrl || (imgError ? beginnerGuide.fallbackImageUrl : beginnerGuide.imageUrl);

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-xs hover:shadow-md ${
        isCompleted
          ? 'bg-emerald-50/70 dark:bg-[#15231C] border-emerald-500/40 ring-1 ring-emerald-500/20'
          : 'bg-white dark:bg-[#181B20] border-slate-200/80 dark:border-[#2D333B]'
      }`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. REAL EXERCISE DEMONSTRATION VISUAL & OVERLAY BADGES
         ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full h-48 bg-slate-950 overflow-hidden group">
        <img
          src={displayImage}
          alt={exercise.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient vignette for high-contrast badge readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/60 pointer-events-none" />

        {/* Top-Left: Target Sets × Reps & Rest Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-black/80 text-white backdrop-blur-md border border-white/20 shadow-md">
            {exercise.targetSets || 2} Sets × {exercise.defaultReps || 10} Reps
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-black/80 text-emerald-300 dark:text-[#A3E635] backdrop-blur-md border border-white/20 shadow-md flex items-center gap-1">
            <Timer className="w-3.5 h-3.5" />
            {exercise.restSeconds || 90}s Rest
          </span>
        </div>

        {/* Top-Right: Target Muscle & Equipment Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-md backdrop-blur-md ${muscleStyle.badgeBg} ${muscleStyle.badgeText} ${muscleStyle.badgeBorder}`}
          >
            {muscle}
          </span>
        </div>

        {/* Bottom Banner Over Visual: Equipment Name */}
        <div className="absolute bottom-3 left-3 text-white pointer-events-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
            Equipment / Setup:
          </span>
          <span className="text-xs font-extrabold text-white">
            {beginnerGuide.equipment}
          </span>
        </div>

        {/* Bottom-Right 1-Tap Action: "Visual Guide / Form" & "Add Photo" */}
        <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5">
          <button
            onClick={() => onOpenFormGuide(exercise)}
            className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            title="Open Visual Form & Muscle Guide"
          >
            <PlayCircle className="w-4 h-4 fill-white text-blue-600" />
            <span>Visual Form</span>
          </button>
          <button
            onClick={() => setShowMediaInput(!showMediaInput)}
            className="p-1.5 rounded-xl bg-black/75 hover:bg-black text-white border border-white/20 transition-all backdrop-blur-md cursor-pointer"
            title="Add custom photo or reel link"
          >
            <Image className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. EXERCISE TITLE & "MARK DONE ✅" TOGGLE BUTTON
         ───────────────────────────────────────────────────────────── */}
      <div className="p-4 space-y-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-black text-base text-slate-900 dark:text-white leading-tight">
              {exercise.name}
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 block">
              Targets: <strong className="text-blue-600 dark:text-[#A3E635]">{beginnerGuide.targetMuscle}</strong>
            </span>
          </div>

          {/* Mark Exercise Done (✅) Button */}
          <button
            onClick={() => onToggleComplete(exercise.name)}
            className={`px-3 py-2 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm ${
              isCompleted
                ? 'bg-emerald-500 text-white shadow-emerald-500/30 ring-2 ring-emerald-400'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#22262E] dark:hover:bg-[#2D333B] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#2D333B]'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 stroke-[3]" /> Done!
              </>
            ) : (
              <>
                <Circle className="w-4 h-4" /> Mark Done
              </>
            )}
          </button>
        </div>

        {/* Custom Image/GIF/Reel Link Drawer */}
        {showMediaInput && (
          <div className="p-3 bg-slate-50 dark:bg-[#22262E] rounded-2xl border border-slate-200 dark:border-[#2D333B] space-y-2 text-xs animate-in fade-in">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Add My Own Photo or Instagram Reel / GIF URL:
            </span>
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="url"
                placeholder="Paste image/GIF/video link..."
                value={mediaUrlInput}
                onChange={(e) => setMediaUrlInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#181B20] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold uppercase text-[10px]"
              >
                Save
              </button>
            </form>
            <div className="flex items-center gap-2">
              <label className="flex-1 py-1.5 px-3 rounded-xl bg-white dark:bg-[#181B20] border border-dashed border-slate-300 dark:border-[#2D333B] text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer text-xs font-semibold hover:border-blue-500">
                <Upload className="w-3.5 h-3.5" /> Upload from Phone / Gallery
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
              {customMediaUrl && (
                <button
                  type="button"
                  onClick={() => onSaveCustomMedia(exercise.name, '')}
                  className="px-2 py-1.5 text-red-500 font-bold text-xs"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            3. SIMPLE 3-STEP BEGINNER INSTRUCTIONS ("HOW TO DO IT")
           ───────────────────────────────────────────────────────────── */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-[#22262E]">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
            How to Do It (Simple 3-Step Guide)
          </span>

          {/* Step 1: Setup & Grip */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-[#22262E]/60 text-xs">
            <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold text-[11px]">
                Setup & Grip:
              </strong>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] mt-0.5">
                {beginnerGuide.step1}
              </p>
            </div>
          </div>

          {/* Step 2: The Lift & Breathing */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-[#22262E]/60 text-xs">
            <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold text-[11px]">
                The Lift & Breathing:
              </strong>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] mt-0.5">
                {beginnerGuide.step2}
              </p>
            </div>
          </div>

          {/* Step 3: Control Return */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-[#22262E]/60 text-xs">
            <span className="w-5 h-5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold text-[11px]">
                Control Return:
              </strong>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] mt-0.5">
                {beginnerGuide.step3}
              </p>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. COMMON MISTAKE TO AVOID (SOFT RED/AMBER WARNING TAG)
           ───────────────────────────────────────────────────────────── */}
        <div className="p-3 bg-amber-500/10 dark:bg-amber-950/25 border border-amber-500/25 rounded-2xl flex items-start gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-800 dark:text-amber-300 font-bold block text-[11px]">
              Common Mistake to Avoid:
            </strong>
            <p className="text-amber-700 dark:text-amber-200/90 leading-relaxed text-[11px] mt-0.5 font-medium">
              {beginnerGuide.commonMistake}
            </p>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            5. SAVED REEL LINKS BOOKMARK BOX (PERSISTED IN LOCALSTORAGE)
           ───────────────────────────────────────────────────────────── */}
        <SavedReelBookmarkBox exerciseName={exercise.name} />
      </div>
    </div>
  );
}
