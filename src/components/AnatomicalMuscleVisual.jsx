import React from 'react';

/**
 * Anatomical 3D-Style Muscle Illustration Component
 * Highlights the target muscle group (Chest, Back, Shoulders, Biceps, Triceps, Quads, Hamstrings, Calves)
 * using glowing neon vectors, biomechanical lines, and movement equipment cues.
 */
export default function AnatomicalMuscleVisual({
  exerciseKey,
  targetMuscle = 'Chest',
  highlightColor = '#3B82F6', // 'blue', 'purple', 'red'
  className = 'w-full h-44',
  mini = false // miniature body diagram mode for top strip
}) {
  const key = (exerciseKey || '').toLowerCase();

  // If mini mode: returns a compact full-body silhouette with the target muscle glowing
  if (mini) {
    let musclePoints = null;

    if (key.includes('chest') || targetMuscle === 'Chest') {
      // Chest pectorals glowing
      musclePoints = (
        <path d="M 18 20 C 23 18, 27 22, 27 26 C 24 28, 18 27, 18 20 Z M 32 20 C 27 18, 23 22, 23 26 C 26 28, 32 27, 32 20 Z" fill="#EF4444" className="animate-pulse drop-shadow-[0_0_6px_#EF4444]" />
      );
    } else if (key.includes('lat') || key.includes('row') || targetMuscle === 'Back') {
      // Upper back and lats glowing
      musclePoints = (
        <path d="M 16 19 L 34 19 L 31 29 L 25 33 L 19 29 Z" fill="#0EA5E9" className="animate-pulse drop-shadow-[0_0_6px_#0EA5E9]" />
      );
    } else if (key.includes('shoulder') || key.includes('overhead') || key.includes('lateral') || key.includes('face') || targetMuscle === 'Shoulders') {
      // Deltoids glowing
      musclePoints = (
        <g fill="#A855F7" className="animate-pulse drop-shadow-[0_0_6px_#A855F7]">
          <ellipse cx="14" cy="18" rx="4" ry="5" />
          <ellipse cx="36" cy="18" rx="4" ry="5" />
        </g>
      );
    } else if (key.includes('tricep')) {
      // Triceps glowing
      musclePoints = (
        <g fill="#F59E0B" className="animate-pulse drop-shadow-[0_0_6px_#F59E0B]">
          <rect x="10" y="22" width="3.5" height="8" rx="1.5" />
          <rect x="36.5" y="22" width="3.5" height="8" rx="1.5" />
        </g>
      );
    } else if (key.includes('curl') || key.includes('bicep') || targetMuscle === 'Arms') {
      // Biceps glowing
      musclePoints = (
        <g fill="#F59E0B" className="animate-pulse drop-shadow-[0_0_6px_#F59E0B]">
          <circle cx="12" cy="24" r="3.5" />
          <circle cx="38" cy="24" r="3.5" />
        </g>
      );
    } else if (key.includes('leg press') || key.includes('squat') || key.includes('extension')) {
      // Quads glowing
      musclePoints = (
        <g fill="#10B981" className="animate-pulse drop-shadow-[0_0_6px_#10B981]">
          <path d="M 19 36 L 24 36 L 23 48 L 18 47 Z" />
          <path d="M 26 36 L 31 36 L 32 47 L 27 48 Z" />
        </g>
      );
    } else if (key.includes('curl') && targetMuscle === 'Legs') {
      // Hamstrings glowing
      musclePoints = (
        <g fill="#10B981" className="animate-pulse drop-shadow-[0_0_6px_#10B981]">
          <rect x="18" y="37" width="5.5" height="11" rx="2" />
          <rect x="26.5" y="37" width="5.5" height="11" rx="2" />
        </g>
      );
    } else {
      // Calves glowing
      musclePoints = (
        <g fill="#10B981" className="animate-pulse drop-shadow-[0_0_6px_#10B981]">
          <ellipse cx="20" cy="53" rx="2.8" ry="5.5" />
          <ellipse cx="30" cy="53" rx="2.8" ry="5.5" />
        </g>
      );
    }

    return (
      <svg viewBox="0 0 50 65" className="w-full h-full drop-shadow-sm">
        {/* Anatomical Body Silhouette */}
        {/* Head */}
        <circle cx="25" cy="8" r="4.5" fill="#64748B" opacity="0.35" />
        {/* Neck */}
        <rect x="23.5" y="12" width="3" height="3" fill="#64748B" opacity="0.35" />
        {/* Torso */}
        <path d="M 17 15 L 33 15 L 30 35 L 20 35 Z" fill="#64748B" opacity="0.25" />
        {/* Arms */}
        <path d="M 16 15 L 11 28 L 10 37" stroke="#64748B" strokeWidth="3" strokeLinecap="round" opacity="0.3" fill="none" />
        <path d="M 34 15 L 39 28 L 40 37" stroke="#64748B" strokeWidth="3" strokeLinecap="round" opacity="0.3" fill="none" />
        {/* Legs */}
        <path d="M 21 35 L 19 50 L 18 62" stroke="#64748B" strokeWidth="4" strokeLinecap="round" opacity="0.3" fill="none" />
        <path d="M 29 35 L 31 50 L 32 62" stroke="#64748B" strokeWidth="4" strokeLinecap="round" opacity="0.3" fill="none" />

        {/* Highlighted Glowing Target Muscle */}
        {musclePoints}
      </svg>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // FULL 3D-STYLE ANATOMICAL DETAIL CARD VISUALS
  // ─────────────────────────────────────────────────────────────

  // 1. CHEST / BENCH PRESS
  if (key.includes('bench') || key.includes('chest press') || key.includes('incline dumbbell')) {
    const isIncline = key.includes('incline');
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-[#181B24] to-[#0F1115] border border-rose-500/30 overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(#EF4444_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

        <svg viewBox="0 0 200 130" className="w-full h-full p-2">
          <defs>
            <linearGradient id="chestGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#FB7185" />
            </linearGradient>
            <linearGradient id="barGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>

          {/* Bench Frame */}
          {isIncline ? (
            <line x1="60" y1="105" x2="135" y2="60" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
          ) : (
            <line x1="55" y1="85" x2="145" y2="85" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
          )}

          {/* Human Body Musculature Silhouette */}
          {/* Head & Neck */}
          <circle cx="70" cy="72" r="9" fill="#475569" />
          <path d="M 77 75 L 85 75" stroke="#475569" strokeWidth="5" />
          {/* Ribcage & Core */}
          <ellipse cx="105" cy="78" rx="24" ry="14" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />

          {/* GLOWING PECTORALIS MAJOR & CLAVICULAR FIBERS */}
          <path
            d="M 88 68 C 96 62, 108 62, 115 67 C 114 77, 100 82, 88 77 Z"
            fill="url(#chestGlow)"
            className="animate-pulse drop-shadow-[0_0_12px_rgba(244,63,94,0.9)]"
          />
          <path
            d="M 115 67 C 122 62, 134 62, 142 68 C 142 77, 130 82, 116 77 Z"
            fill="url(#chestGlow)"
            className="animate-pulse drop-shadow-[0_0_12px_rgba(244,63,94,0.9)]"
          />
          {/* Muscle striations */}
          <line x1="93" y1="70" x2="108" y2="76" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />
          <line x1="137" y1="70" x2="122" y2="76" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />

          {/* Biomechanical Barbell Path with dynamic arrow indicator */}
          <g className="animate-[bounce_2.4s_infinite_ease-in-out]">
            {/* Arms Holding Bar */}
            <path d="M 94 72 L 92 48 L 75 42" stroke="#FDA4AF" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 136 72 L 138 48 L 155 42" stroke="#FDA4AF" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Barbell */}
            <line x1="45" y1="42" x2="185" y2="42" stroke="url(#barGlow)" strokeWidth="4.5" strokeLinecap="round" />
            {/* Plates */}
            <rect x="42" y="26" width="6" height="32" rx="2" fill="#F43F5E" />
            <rect x="49" y="30" width="4" height="24" rx="1.5" fill="#94A3B8" />
            <rect x="175" y="30" width="4" height="24" rx="1.5" fill="#94A3B8" />
            <rect x="180" y="26" width="6" height="32" rx="2" fill="#F43F5E" />
          </g>

          {/* Grip Width Cue Annotation */}
          <text x="115" y="22" fill="#F43F5E" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="1">
            {isIncline ? '30° INCLINE • UPPER PECS' : 'MID-STERNUM TOUCH • 45° ELBOWS'}
          </text>
        </svg>
      </div>
    );
  }

  // 2. SHOULDERS / OVERHEAD PRESS / LATERAL RAISE / FACE PULLS
  if (key.includes('shoulder') || key.includes('overhead') || key.includes('lateral') || key.includes('face pull')) {
    const isLateral = key.includes('lateral');
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-[#19162A] to-[#0F1115] border border-purple-500/30 overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(#A855F7_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

        <svg viewBox="0 0 200 130" className="w-full h-full p-2">
          <defs>
            <linearGradient id="deltGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#9333EA" />
            </linearGradient>
          </defs>

          {/* Torso Outline */}
          <circle cx="100" cy="38" r="11" fill="#475569" />
          <path d="M 82 52 L 118 52 L 112 108 L 88 108 Z" fill="#1E293B" stroke="#475569" strokeWidth="2" />

          {/* GLOWING ANTERIOR & LATERAL DELTOIDS */}
          <ellipse
            cx="75"
            cy="54"
            rx="11"
            ry="14"
            fill="url(#deltGlow)"
            className="animate-pulse drop-shadow-[0_0_12px_rgba(168,85,247,0.95)]"
          />
          <ellipse
            cx="125"
            cy="54"
            rx="11"
            ry="14"
            fill="url(#deltGlow)"
            className="animate-pulse drop-shadow-[0_0_12px_rgba(168,85,247,0.95)]"
          />

          {isLateral ? (
            /* Lateral Raise DB Paths */
            <g className="animate-[pulse_2s_infinite_ease-in-out]">
              <path d="M 75 58 L 48 56" stroke="#D8B4FE" strokeWidth="4" strokeLinecap="round" />
              <path d="M 125 58 L 152 56" stroke="#D8B4FE" strokeWidth="4" strokeLinecap="round" />
              <rect x="40" y="50" width="8" height="12" rx="2" fill="#A855F7" />
              <rect x="152" y="50" width="8" height="12" rx="2" fill="#A855F7" />
              {/* Arc arrows */}
              <path d="M 52 75 Q 45 62 48 54" stroke="#A855F7" strokeWidth="2" strokeDasharray="3 3" fill="none" />
              <path d="M 148 75 Q 155 62 152 54" stroke="#A855F7" strokeWidth="2" strokeDasharray="3 3" fill="none" />
            </g>
          ) : (
            /* Overhead Barbell Press */
            <g className="animate-[bounce_2.4s_infinite_ease-in-out]">
              <path d="M 75 54 L 80 28" stroke="#D8B4FE" strokeWidth="4" strokeLinecap="round" />
              <path d="M 125 54 L 120 28" stroke="#D8B4FE" strokeWidth="4" strokeLinecap="round" />
              <line x1="45" y1="24" x2="155" y2="24" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
              <rect x="42" y="14" width="5" height="20" rx="1.5" fill="#A855F7" />
              <rect x="153" y="14" width="5" height="20" rx="1.5" fill="#A855F7" />
            </g>
          )}

          <text x="100" y="122" fill="#C084FC" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="1">
            {isLateral ? 'SLIGHT LEAN • LEAD WITH ELBOWS' : 'BRACE CORE • STRAIGHT OVERHEAD'}
          </text>
        </svg>
      </div>
    );
  }

  // 3. BACK / LAT PULLDOWN / SEATED ROW / T-BAR
  if (key.includes('lat') || key.includes('row') || key.includes('pull')) {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-[#101928] to-[#0F1115] border border-sky-500/30 overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(#0EA5E9_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

        <svg viewBox="0 0 200 130" className="w-full h-full p-2">
          <defs>
            <linearGradient id="latGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>

          {/* Rear Anatomical Silhouette (Back View) */}
          <circle cx="100" cy="28" r="10" fill="#475569" />
          {/* Spine indicator */}
          <line x1="100" y1="38" x2="100" y2="108" stroke="#334155" strokeWidth="3" strokeDasharray="2 3" />

          {/* GLOWING LATISSIMUS DORSI & RHOMBOIDS WING SHAPE */}
          <path
            d="M 100 38 L 74 44 L 70 78 L 92 98 L 100 102 L 108 98 L 130 78 L 126 44 Z"
            fill="url(#latGlow)"
            className="animate-pulse drop-shadow-[0_0_14px_rgba(14,165,233,0.95)]"
          />
          {/* Scapular Wing Lines */}
          <path d="M 85 48 C 88 65, 88 80, 96 92" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" fill="none" />
          <path d="M 115 48 C 112 65, 112 80, 104 92" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" fill="none" />

          {/* Pulldown / Cable Bar Mechanism */}
          <g className="animate-[bounce_2.2s_infinite_ease-in-out]">
            <line x1="40" y1="18" x2="160" y2="18" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
            <path d="M 60 18 L 80 46" stroke="#BAE6FD" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 140 18 L 120 46" stroke="#BAE6FD" strokeWidth="3.5" strokeLinecap="round" />
            {/* Center cable wire */}
            <line x1="100" y1="0" x2="100" y2="18" stroke="#94A3B8" strokeWidth="2" />
          </g>

          <text x="100" y="122" fill="#38BDF8" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="1">
            ELBOWS TO HIPS • DEEP LAT STRETCH
          </text>
        </svg>
      </div>
    );
  }

  // 4. ARMS / BICEPS / TRICEPS
  if (key.includes('curl') || key.includes('tricep') || targetMuscle === 'Arms') {
    const isTricep = key.includes('tricep');
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-[#261E16] to-[#0F1115] border border-amber-500/30 overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

        <svg viewBox="0 0 200 130" className="w-full h-full p-2">
          <defs>
            <linearGradient id="armGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
          </defs>

          {/* Arm Skeletal Outline */}
          <path d="M 55 45 C 75 35, 115 35, 125 55 L 148 95" stroke="#334155" strokeWidth="12" strokeLinecap="round" fill="none" />

          {/* GLOWING BICEP PEAK OR TRICEP HORSESHOE */}
          {isTricep ? (
            <path
              d="M 68 52 C 80 44, 105 44, 114 58 C 110 74, 85 78, 68 52 Z"
              fill="url(#armGlow)"
              className="animate-pulse drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]"
            />
          ) : (
            <ellipse
              cx="92"
              cy="36"
              rx="16"
              ry="12"
              fill="url(#armGlow)"
              className="animate-pulse drop-shadow-[0_0_12px_rgba(245,158,11,0.95)]"
            />
          )}

          {/* Dumbbell / Cable Grip Attachment */}
          <g className="animate-[pulse_2s_infinite_ease-in-out]">
            <rect x="135" y="86" width="22" height="8" rx="2" fill="#E2E8F0" transform="rotate(-30 146 90)" />
            <circle cx="138" cy="80" r="8" fill="#F59E0B" />
            <circle cx="156" cy="98" r="8" fill="#F59E0B" />
          </g>

          <text x="100" y="122" fill="#FBBF24" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="1">
            {isTricep ? 'PIN ELBOWS • SPREAD ROPE AT BASE' : 'SUPINATE WRISTS • FULL SQUEEZE'}
          </text>
        </svg>
      </div>
    );
  }

  // 5. LEGS / LEG PRESS / GOBLET SQUATS / LEG CURL / EXTENSION / CALVES
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-[#12231E] to-[#0F1115] border border-emerald-500/30 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

      <svg viewBox="0 0 200 130" className="w-full h-full p-2">
        <defs>
          <linearGradient id="legGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Pelvis & Hips */}
        <path d="M 80 20 L 120 20 L 105 38 L 95 38 Z" fill="#334155" />

        {/* GLOWING QUADRICEPS / HAMSTRINGS */}
        {/* Left Quad */}
        <path
          d="M 82 25 C 72 45, 75 75, 84 85 C 92 82, 95 55, 92 28 Z"
          fill="url(#legGlow)"
          className="animate-pulse drop-shadow-[0_0_12px_rgba(16,185,129,0.9)]"
        />
        {/* Right Quad */}
        <path
          d="M 118 25 C 128 45, 125 75, 116 85 C 108 82, 105 55, 108 28 Z"
          fill="url(#legGlow)"
          className="animate-pulse drop-shadow-[0_0_12px_rgba(16,185,129,0.9)]"
        />
        {/* Calves */}
        <ellipse cx="80" cy="108" rx="6" ry="12" fill="#047857" opacity="0.8" />
        <ellipse cx="120" cy="108" rx="6" ry="12" fill="#047857" opacity="0.8" />

        {/* Knee Joint Protectors */}
        <circle cx="85" cy="88" r="4.5" fill="#E2E8F0" />
        <circle cx="115" cy="88" r="4.5" fill="#E2E8F0" />

        <text x="100" y="124" fill="#34D399" fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="1">
          FEET SHOULDER-WIDTH • DO NOT LOCK KNEES
        </text>
      </svg>
    </div>
  );
}
