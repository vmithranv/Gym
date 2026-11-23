import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  Upload,
  Link,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Timer,
  Layers,
  Image,
  Award
} from 'lucide-react';
import AnatomicalMuscleVisual from './AnatomicalMuscleVisual';
import { MUSCLE_GROUP_CONFIG, getExerciseMuscleGroup, EXERCISE_GUIDES } from '../utils/exerciseData';

export default function AnatomicalExerciseCard({
  exercise,
  isCompleted = false,
  onToggleComplete,
  onOpenFormGuide,
  customMediaUrl,
  onSaveCustomMedia
}) {
  const [expanded, setExpanded] = useState(false);
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [mediaUrlInput, setMediaUrlInput] = useState('');

  const muscle = exercise.muscleGroup || getExerciseMuscleGroup(exercise.name);
  const muscleStyle = MUSCLE_GROUP_CONFIG[muscle] || MUSCLE_GROUP_CONFIG.Other;
  const guide = EXERCISE_GUIDES[exercise.name];

  const tips = guide?.tips || [
    'Control the lowering eccentric phase for 2-3 seconds for maximum muscle fiber recruitment.',
    'Keep your core tightly braced throughout and avoid relying on body momentum.',
    'Exhale as you press or pull through the sticking point.'
  ];

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

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-xs hover:shadow-md ${
        isCompleted
          ? 'bg-emerald-50/70 dark:bg-[#15231C] border-emerald-500/40 ring-1 ring-emerald-500/20'
          : 'bg-white dark:bg-[#181B20] border-slate-200/80 dark:border-[#2D333B]'
      }`}
    >
      {/* Top Media Header: Custom uploaded media OR 3D Anatomical Muscle Visual */}
      <div className="relative group">
        {customMediaUrl ? (
          <div className="w-full h-44 bg-slate-950 flex items-center justify-center overflow-hidden">
            <img
              src={customMediaUrl}
              alt={exercise.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <AnatomicalMuscleVisual
            exerciseKey={exercise.name}
            targetMuscle={muscle}
            className="w-full h-44"
          />
        )}

        {/* Clear Overlay Badges: Target Sets × Reps & Rest Time */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-black/75 text-white backdrop-blur-md border border-white/20 shadow-md">
            {exercise.targetSets || 2} Sets × {exercise.defaultReps || 10} Reps
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-black/75 text-emerald-300 dark:text-[#A3E635] backdrop-blur-md border border-white/20 shadow-md flex items-center gap-1">
            <Timer className="w-3.5 h-3.5" />
            {exercise.restSeconds || 90}s Rest
          </span>
        </div>

        {/* Top-Right Muscle Group Tag & Check status */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-md backdrop-blur-md ${muscleStyle.badgeBg} ${muscleStyle.badgeText} ${muscleStyle.badgeBorder}`}
          >
            {muscle}
          </span>
        </div>

        {/* Bottom Bar overlay inside visual */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          <button
            onClick={() => onOpenFormGuide(exercise)}
            className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-black/75 hover:bg-black text-white border border-white/20 transition-all flex items-center gap-1 backdrop-blur-md cursor-pointer"
            title="Watch video tutorial"
          >
            <PlayCircle className="w-3.5 h-3.5 text-rose-500" /> Watch Video
          </button>
          <button
            onClick={() => setShowMediaInput(!showMediaInput)}
            className="p-1 rounded-xl bg-black/75 hover:bg-black text-white border border-white/20 transition-all backdrop-blur-md cursor-pointer"
            title="Upload custom GIF/screenshot or URL"
          >
            <Image className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Info and Action Body */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-black text-base text-slate-900 dark:text-white leading-tight">
              {exercise.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Target: <strong className="text-slate-800 dark:text-slate-200">{muscle}</strong> • 2 heavy/strict work sets
            </p>
          </div>

          {/* Mark Exercise Done (✅) Button */}
          <button
            onClick={() => onToggleComplete(exercise.name)}
            className={`px-3 py-1.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm ${
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

        {/* Custom Image/GIF Uploader Input Drawer */}
        {showMediaInput && (
          <div className="p-3 bg-slate-50 dark:bg-[#22262E] rounded-2xl border border-slate-200 dark:border-[#2D333B] space-y-2 text-xs animate-in fade-in">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Set Custom Exercise Image or GIF:
            </span>
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="url"
                placeholder="Paste image/GIF URL..."
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

        {/* Expandable Form Cues Accordion */}
        <div className="pt-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-left text-xs font-extrabold text-blue-600 dark:text-sky-400 py-1 hover:underline cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {expanded ? 'Hide Posture & Execution Cues' : 'View 3 Pro Posture & Execution Cues'}
            </span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded && (
            <div className="mt-2 p-3 bg-slate-50 dark:bg-[#22262E]/70 rounded-2xl border border-slate-100 dark:border-transparent space-y-2 animate-in fade-in">
              {tips.map((tip, tIdx) => (
                <div key={tIdx} className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-600 dark:text-sky-400 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {tIdx + 1}
                  </span>
                  <p className="font-medium">{tip}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
