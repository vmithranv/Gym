import React, { useState, useEffect } from 'react';
import { Play, Pause, X, Plus, Minus, ArrowRight, BellRing } from 'lucide-react';

// Web Audio API beep sound generator so no external audio files are required
const playRestChime = (isTransition = false) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    if (isTransition) {
      // 3 pleasant ascending chimes for exercise transition
      playTone(523.25, 0.0, 0.25); // C5
      playTone(659.25, 0.2, 0.25); // E5
      playTone(783.99, 0.4, 0.4);  // G5
    } else {
      // 2 clean chimes for set rest completion
      playTone(587.33, 0.0, 0.2); // D5
      playTone(880.00, 0.18, 0.35); // A5
    }
  } catch (e) {
    console.warn('Audio chime note failed:', e);
  }
};

export default function RestTimer({
  initialSeconds = 90,
  isActive,
  onClose,
  onFinish,
  mode = 'set', // 'set' (between sets) or 'transition' (between exercises)
  nextExerciseName = ''
}) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(true);

  const isTransition = mode === 'transition';

  useEffect(() => {
    setTimeLeft(initialSeconds);
    setRunning(true);
  }, [initialSeconds, isActive, mode]);

  useEffect(() => {
    let interval = null;
    if (running && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Play Web Audio chime sound
      playRestChime(isTransition);

      // Vibrate if mobile browser supports it
      if ('vibrate' in navigator) {
        navigator.vibrate([250, 100, 250, 100, 400]);
      }
      if (onFinish) onFinish();
    }
    return () => clearInterval(interval);
  }, [running, timeLeft, onFinish, isTransition]);

  const addTime = (delta) => {
    setTimeLeft((prev) => Math.max(0, prev + delta));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = Math.min(100, Math.max(0, (timeLeft / (initialSeconds || 90)) * 100));

  return (
    <div className="fixed bottom-20 left-3 right-3 max-w-md mx-auto z-50 animate-in slide-in-from-bottom duration-300">
      <div
        className={`relative backdrop-blur-xl rounded-3xl p-4 shadow-2xl flex flex-col gap-2.5 border transition-all ${
          isTransition
            ? 'bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-slate-900/95 border-blue-400/50 shadow-blue-500/20 text-white'
            : 'bg-white/95 dark:bg-[#181B20]/95 border-emerald-500/40 dark:border-[#A3E635]/40 text-slate-900 dark:text-white shadow-xl'
        }`}
      >
        {/* Glow progress bar along the top edge */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-200 dark:bg-[#22262E] rounded-t-3xl overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isTransition
                ? 'bg-gradient-to-r from-blue-400 to-indigo-300'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-[#A3E635] dark:to-lime-300'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  isTransition ? 'bg-blue-400' : 'bg-emerald-500 dark:bg-[#A3E635]'
                } ${running ? 'opacity-75' : 'opacity-0'}`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isTransition ? 'bg-blue-400' : 'bg-emerald-500 dark:bg-[#A3E635]'
                }`}
              ></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider">
              {isTransition ? 'Exercise Transition Rest' : 'Set Rest Timer'}
            </span>
            {nextExerciseName && isTransition && (
              <span className="text-[10px] text-blue-200 flex items-center gap-1 font-semibold truncate max-w-[130px]">
                <ArrowRight className="w-3 h-3 shrink-0" /> {nextExerciseName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => addTime(isTransition ? -30 : -15)}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#22262E] dark:hover:bg-[#2D333B] text-slate-700 dark:text-slate-300 active:scale-90 transition-all text-xs font-bold flex items-center gap-0.5"
              title={isTransition ? '-30s' : '-15s'}
            >
              <Minus className="w-3 h-3" /> {isTransition ? '30s' : '15s'}
            </button>
            <button
              onClick={() => addTime(isTransition ? 30 : 15)}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#22262E] dark:hover:bg-[#2D333B] text-slate-700 dark:text-slate-300 active:scale-90 transition-all text-xs font-bold flex items-center gap-0.5"
              title={isTransition ? '+30s' : '+15s'}
            >
              <Plus className="w-3 h-3" /> {isTransition ? '30s' : '15s'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-500 dark:bg-[#22262E] dark:hover:bg-red-500/20 text-slate-400 transition-all ml-1"
              title="Close Timer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span
              className={`font-mono text-3xl font-black tracking-tight ${
                isTransition ? 'text-blue-300' : 'text-emerald-600 dark:text-[#A3E635]'
              }`}
            >
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs text-slate-400 font-medium">remaining</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRunning(!running)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#22262E] dark:hover:bg-[#2D333B] text-slate-800 dark:text-white font-semibold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
            >
              {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {running ? 'Pause' : 'Resume'}
            </button>

            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 shadow-md transition-all ${
                isTransition
                  ? 'bg-blue-400 text-slate-950 hover:bg-blue-300'
                  : 'bg-emerald-500 hover:bg-emerald-600 dark:bg-[#A3E635] dark:hover:bg-lime-400 text-white dark:text-black'
              }`}
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
