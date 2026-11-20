import React from 'react';
import { X, ExternalLink, Sparkles, Video, CheckCircle2 } from 'lucide-react';
import { EXERCISE_GUIDES, MUSCLE_GROUP_CONFIG, extractYoutubeId, getExerciseMuscleGroup } from '../utils/exerciseData';

export default function ExerciseFormModal({ exercise, onClose }) {
  if (!exercise) return null;

  const exerciseName = exercise.name || 'Exercise';
  const customYoutubeId = exercise.customVideoUrl ? extractYoutubeId(exercise.customVideoUrl) : '';
  const guide = EXERCISE_GUIDES[exerciseName];
  const videoId = customYoutubeId || guide?.youtubeId;
  const muscleGroup = exercise.muscleGroup || guide?.muscleGroup || getExerciseMuscleGroup(exerciseName);
  const muscleStyle = MUSCLE_GROUP_CONFIG[muscleGroup] || MUSCLE_GROUP_CONFIG.Other;

  const tips = guide?.tips || [
    'Maintain a rigid, braced core and neutral spinal alignment throughout the full repetition.',
    'Control the eccentric (lowering) phase for 2-3 seconds to maximize muscular tension and hypertrophy.',
    'Breathe in deeply before the descent; exhale powerfully past the sticking point on exertion.'
  ];

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    exerciseName + ' proper form exercise tutorial'
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#181B20] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
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
                Form Guide & Video
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {exerciseName}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#22262E] dark:hover:bg-[#2D333B] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all active:scale-95"
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

          {/* Quick Fallback Button */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#22262E]/50 p-3 rounded-2xl border border-slate-100 dark:border-[#2D333B]">
            <span className="flex items-center gap-1.5 font-medium">
              <Video className="w-4 h-4 text-rose-500" /> Need more camera angles?
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

          {/* 3 Form & Breathing Execution Tips */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-[#22262E]/70 dark:to-[#181B20] p-4 rounded-2xl border border-slate-200/70 dark:border-[#2D333B]">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Pro Execution & Breathing Cues
            </h4>

            <div className="space-y-2.5">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/10 dark:bg-emerald-500/20 text-blue-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#181B20] border-t border-slate-100 dark:border-[#2D333B] flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#A3E635] dark:to-lime-400 text-white dark:text-black font-extrabold text-xs uppercase tracking-wider shadow-md hover:opacity-90 active:scale-95 transition-all"
          >
            Got it, Let's Lift
          </button>
        </div>
      </div>
    </div>
  );
}
