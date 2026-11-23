import React from 'react';
import { X, Sparkles, Layers, Activity, Video, ExternalLink } from 'lucide-react';
import { EXERCISE_GUIDES, MUSCLE_GROUP_CONFIG, extractYoutubeId, getExerciseMuscleGroup } from '../utils/exerciseData';
import { BEGINNER_EXERCISE_GUIDES } from '../utils/beginnerExerciseData';
import AnatomicalMuscleVisual from './AnatomicalMuscleVisual';
import ExerciseAnimation from './ExerciseAnimation';
import SavedReelBookmarkBox from './SavedReelBookmarkBox';

export default function ExerciseFormModal({ exercise, onClose }) {
  if (!exercise) return null;

  const exerciseName = typeof exercise === 'string' ? exercise : (exercise?.name || 'Exercise');
  const muscleGroup = exercise?.muscleGroup || getExerciseMuscleGroup(exerciseName) || 'Full Body';
  const muscleStyle = MUSCLE_GROUP_CONFIG[muscleGroup] || MUSCLE_GROUP_CONFIG.Other || {
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-500',
    badgeBorder: 'border-blue-500/30',
    dotColor: '#3B82F6'
  };

  const beginner = BEGINNER_EXERCISE_GUIDES[exerciseName] || {};
  const guide = EXERCISE_GUIDES[exerciseName] || {};

  const customYoutubeId = exercise?.customVideoUrl ? extractYoutubeId(exercise.customVideoUrl) : '';
  const videoId = customYoutubeId || beginner?.youtubeId || guide?.youtubeId;

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    exerciseName + ' proper form exercise tutorial'
  )}`;

  // Specific tempo cue
  const tempoCue = beginner?.tempo || '2s Lower • 1s Squeeze • 2s Push/Pull';

  const tips = guide?.tips || [
    'Maintain a rigid, braced core and neutral spinal alignment throughout the full repetition.',
    'Control the eccentric (lowering) phase for 2-3 seconds to maximize muscular tension and hypertrophy.',
    'Breathe in deeply before the descent; exhale powerfully past the sticking point on exertion.'
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#181B20] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-300"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-[#2D333B] flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${muscleStyle.badgeBg} ${muscleStyle.badgeText} ${muscleStyle.badgeBorder}`}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: muscleStyle.dotColor }}
                />
                {muscleGroup}
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Visual Muscle Guide & YouTube Video
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {exerciseName}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#22262E] dark:hover:bg-[#2D333B] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* YouTube Video Player Embed or Fallback */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video shadow-md border border-slate-200 dark:border-slate-800">
            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`}
                title={`${exerciseName} Tutorial`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-300">
                <Video className="w-12 h-12 text-rose-500 mb-2" />
                <p className="text-sm font-bold text-white mb-1">Video Tutorial Available</p>
                <p className="text-xs text-slate-400 max-w-xs mb-3">
                  Watch top certified strength trainers demonstrate {exerciseName} on YouTube.
                </p>
                <a
                  href={youtubeSearchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Watch on YouTube
                </a>
              </div>
            )}
          </div>

          {/* Quick Fallback / Alternative Angles Link */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#22262E]/50 p-3 rounded-2xl border border-slate-100 dark:border-[#2D333B]">
            <span className="flex items-center gap-1.5 font-medium">
              <Video className="w-4 h-4 text-rose-500" /> Need more tips or angles?
            </span>
            <a
              href={youtubeSearchUrl}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              Search on YouTube <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Side-by-Side Visual Reference (Anatomical Highlight + Movement Animation) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Anatomical Muscle Highlight Diagram */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-500 dark:text-[#A3E635]" />
                Target Muscle Anatomy
              </span>
              <div className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-[#2D333B] shadow-xs">
                <AnatomicalMuscleVisual
                  exerciseKey={exerciseName}
                  targetMuscle={muscleGroup}
                  className="w-full h-40"
                />
              </div>
            </div>

            {/* 2. Animated Exercise Form Movement Cue */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-rose-500" />
                Movement Path Animation
              </span>
              <div className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-[#2D333B] shadow-xs flex items-center justify-center bg-slate-950/20 dark:bg-black/30 h-40">
                <ExerciseAnimation
                  exerciseName={exerciseName}
                  className="w-32 h-32"
                />
              </div>
            </div>
          </div>

          {/* Tempo Banner */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Recommended Tempo:
            </span>
            <span className="font-mono font-extrabold text-blue-600 dark:text-[#A3E635]">
              {tempoCue}
            </span>
          </div>

          {/* 3-Bullet Form & Posture Cues */}
          <div className="bg-slate-50 dark:bg-[#22262E]/70 p-4 rounded-2xl border border-slate-200/70 dark:border-[#2D333B] space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Form & Execution Checklist
            </h4>
            <div className="space-y-2">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-blue-500/15 text-blue-600 dark:text-[#A3E635] text-[10px] font-black flex items-center justify-center">
                    {index + 1}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Reel Links Bookmark Box */}
          <SavedReelBookmarkBox exerciseName={exerciseName} />
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#181B20] border-t border-slate-100 dark:border-[#2D333B] flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#A3E635] dark:to-lime-400 text-white dark:text-black font-extrabold text-xs uppercase tracking-wider shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            Ready to Lift
          </button>
        </div>
      </div>
    </div>
  );
}
