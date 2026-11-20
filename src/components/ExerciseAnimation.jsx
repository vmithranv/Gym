import React from 'react';
import { getExerciseMuscleGroup } from '../utils/exerciseData';

// Animated SVG Demonstration Component for exercises
// Provides smooth, high-framerate infinite movement cues for lifters
export default function ExerciseAnimation({ exerciseName, className = 'w-16 h-16' }) {
  const name = (exerciseName || '').toLowerCase();

  // Bench Press / Chest Press Animation
  if (name.includes('bench') || name.includes('chest press') || name.includes('incline dumbbell')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-500/20 overflow-hidden ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full p-1.5">
          {/* Bench */}
          <rect x="25" y="65" width="50" height="6" rx="3" fill="#64748B" />
          <line x1="32" y1="71" x2="32" y2="85" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          <line x1="68" y1="71" x2="68" y2="85" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          
          {/* Lifter Torso */}
          <rect x="35" y="58" width="30" height="7" rx="3" fill="#F43F5E" />
          {/* Lifter Head */}
          <circle cx="28" cy="61" r="5" fill="#FDA4AF" />

          {/* Animated Barbell & Arms */}
          <g className="animate-[bounce_2s_infinite_ease-in-out]">
            {/* Left Arm */}
            <line x1="42" y1="58" x2="42" y2="35" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" />
            {/* Right Arm */}
            <line x1="58" y1="58" x2="58" y2="35" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" />
            {/* Barbell Bar */}
            <line x1="18" y1="35" x2="82" y2="35" stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" />
            {/* Weight Plates */}
            <rect x="18" y="24" width="5" height="22" rx="2" fill="#F43F5E" />
            <rect x="24" y="27" width="4" height="16" rx="2" fill="#E2E8F0" />
            <rect x="72" y="27" width="4" height="16" rx="2" fill="#E2E8F0" />
            <rect x="77" y="24" width="5" height="22" rx="2" fill="#F43F5E" />
          </g>
        </svg>
      </div>
    );
  }

  // Squats / Leg Press Animation
  if (name.includes('squat') || name.includes('leg press') || name.includes('lunge') || name.includes('leg extension')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 overflow-hidden ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full p-1.5">
          {/* Floor */}
          <line x1="15" y1="88" x2="85" y2="88" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />

          {/* Animated Squatter */}
          <g className="animate-[pulse_2s_infinite_ease-in-out]">
            {/* Head */}
            <circle cx="50" cy="22" r="6" fill="#6EE7B7" />
            {/* Torso */}
            <line x1="50" y1="28" x2="50" y2="52" stroke="#10B981" strokeWidth="4.5" strokeLinecap="round" />
            {/* Barbell across traps */}
            <line x1="20" y1="27" x2="80" y2="27" stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="18" y="16" width="5" height="22" rx="2" fill="#10B981" />
            <rect x="77" y="16" width="5" height="22" rx="2" fill="#10B981" />
            {/* Upper Legs / Thighs */}
            <line x1="50" y1="52" x2="40" y2="68" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
            <line x1="50" y1="52" x2="60" y2="68" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
            {/* Lower Legs / Shins */}
            <line x1="40" y1="68" x2="38" y2="88" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="60" y1="68" x2="62" y2="88" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    );
  }

  // Deadlift / Rows / Pull Animation
  if (name.includes('deadlift') || name.includes('row') || name.includes('pull') || name.includes('lat')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/10 to-blue-500/10 border border-sky-500/20 overflow-hidden ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full p-1.5">
          {/* Ground */}
          <line x1="15" y1="88" x2="85" y2="88" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />

          {/* Puller Animation */}
          <g className="animate-[bounce_2.2s_infinite_ease-in-out]">
            {/* Head */}
            <circle cx="50" cy="20" r="6" fill="#7DD3FC" />
            {/* Spine */}
            <line x1="50" y1="26" x2="50" y2="54" stroke="#0284C7" strokeWidth="4.5" strokeLinecap="round" />
            {/* Arms pulling up */}
            <line x1="50" y1="34" x2="34" y2="58" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="50" y1="34" x2="66" y2="58" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
            {/* Barbell */}
            <line x1="18" y1="58" x2="82" y2="58" stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="20" cy="58" r="9" fill="#0284C7" />
            <circle cx="80" cy="58" r="9" fill="#0284C7" />
            {/* Legs */}
            <line x1="50" y1="54" x2="42" y2="88" stroke="#0369A1" strokeWidth="4" strokeLinecap="round" />
            <line x1="50" y1="54" x2="58" y2="88" stroke="#0369A1" strokeWidth="4" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    );
  }

  // Overhead Press / Shoulder Raise Animation
  if (name.includes('press') || name.includes('overhead') || name.includes('shoulder') || name.includes('raise') || name.includes('delt')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 overflow-hidden ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full p-1.5">
          {/* Lifter Body */}
          <line x1="15" y1="88" x2="85" y2="88" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="42" r="6" fill="#D8B4FE" />
          <line x1="50" y1="48" x2="50" y2="70" stroke="#9333EA" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="70" x2="44" y2="88" stroke="#7E22CE" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="50" y1="70" x2="56" y2="88" stroke="#7E22CE" strokeWidth="3.5" strokeLinecap="round" />

          {/* Animated Barbell Overhead */}
          <g className="animate-[bounce_2s_infinite_ease-in-out]">
            <line x1="50" y1="50" x2="38" y2="24" stroke="#A855F7" strokeWidth="3" strokeLinecap="round" />
            <line x1="50" y1="50" x2="62" y2="24" stroke="#A855F7" strokeWidth="3" strokeLinecap="round" />
            <line x1="18" y1="20" x2="82" y2="20" stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="18" y="10" width="5" height="20" rx="2" fill="#9333EA" />
            <rect x="77" y="10" width="5" height="20" rx="2" fill="#9333EA" />
          </g>
        </svg>
      </div>
    );
  }

  // Biceps / Triceps / Arms Animation
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/10 to-rose-500/10 border border-amber-500/20 overflow-hidden ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full p-1.5">
        {/* Arm bicep flexing */}
        <g className="animate-[pulse_1.8s_infinite_ease-in-out]">
          {/* Shoulder & Bicep Peak */}
          <path d="M 25 60 C 25 35, 45 30, 55 45 C 65 35, 75 55, 75 70" fill="none" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
          {/* Dumbbell in hand */}
          <rect x="68" y="32" width="16" height="6" rx="2" fill="#E2E8F0" transform="rotate(-20 68 32)" />
          <circle cx="67" cy="27" r="7" fill="#F59E0B" />
          <circle cx="82" cy="38" r="7" fill="#F59E0B" />
          {/* Peak badge */}
          <circle cx="53" cy="38" r="3" fill="#EF4444" className="animate-ping" />
        </g>
      </svg>
    </div>
  );
}
