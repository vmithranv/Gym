import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Plus, Minus, BellRing } from 'lucide-react';

export default function RestTimer({ initialSeconds = 90, isActive, onClose, onFinish }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    setTimeLeft(initialSeconds);
    setRunning(true);
  }, [initialSeconds, isActive]);

  useEffect(() => {
    let interval = null;
    if (running && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Vibrate if mobile browser supports it
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 400]);
      }
      if (onFinish) onFinish();
    }
    return () => clearInterval(interval);
  }, [running, timeLeft, onFinish]);

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
    <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50">
      <div className="relative bg-[#181B20]/95 backdrop-blur-xl border border-[#A3E635]/40 rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(163,230,53,0.15)] flex flex-col gap-3">
        {/* Glow progress bar along the top edge */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#22262E] rounded-t-2xl overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#A3E635] to-lime-300 transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A3E635] ${running ? 'opacity-75' : 'opacity-0'}`}></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#A3E635]"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Rest Timer
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => addTime(-15)}
              className="p-1.5 rounded-lg bg-[#22262E] hover:bg-[#2D333B] text-slate-300 active:scale-90 transition-all text-xs font-bold flex items-center gap-0.5"
              title="-15s"
            >
              <Minus className="w-3.5 h-3.5" /> 15s
            </button>
            <button
              onClick={() => addTime(15)}
              className="p-1.5 rounded-lg bg-[#22262E] hover:bg-[#2D333B] text-slate-300 active:scale-90 transition-all text-xs font-bold flex items-center gap-0.5"
              title="+15s"
            >
              <Plus className="w-3.5 h-3.5" /> 15s
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#22262E] hover:bg-red-500/20 text-slate-400 hover:text-red-400 active:scale-90 transition-all ml-1"
              title="Close Timer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold tracking-tight text-[#A3E635]">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs text-slate-400 font-medium">remaining</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRunning(!running)}
              className="px-4 py-2 rounded-xl bg-[#22262E] hover:bg-[#2D333B] text-white font-medium text-xs flex items-center gap-1.5 active:scale-95 transition-all"
            >
              {running ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              {running ? 'Pause' : 'Resume'}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#A3E635] text-black font-bold text-xs uppercase tracking-wider hover:bg-lime-400 active:scale-95 shadow-md shadow-[#A3E635]/20 transition-all"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
