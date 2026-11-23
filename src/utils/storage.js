// RepKraft 6-Day Push-Pull-Legs (PPL) Split
// Monday: Push (Chest, Shoulders, Triceps)
// Tuesday: Pull (Back, Biceps, Forearms)
// Wednesday: Legs (Quads, Hamstrings, Glutes, Calves)
// Thursday: Push (Chest, Shoulders, Triceps)
// Friday: Pull (Back, Biceps, Forearms)
// Saturday: Legs (Quads, Hamstrings, Glutes, Calves)
// Sunday: Full Rest & Active Recovery Day

export const DEFAULT_ROUTINES = [
  {
    id: 'monday-push',
    name: 'Monday: Push Day (Chest, Shoulders & Triceps)',
    dayOfWeek: 1, // Mon
    category: 'Push',
    description: '2 heavy/moderate sets per exercise for maximum mechanical tension and upper-body pressing strength.',
    exercises: [
      { id: 'ex-chest-press', name: 'Barbell Flat Bench Press', muscleGroup: 'Chest', targetSets: 2, defaultReps: 10, restSeconds: 105, isCompound: true },
      { id: 'ex-incline-db', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', targetSets: 2, defaultReps: 10, restSeconds: 90, isCompound: true },
      { id: 'ex-shoulder-press', name: 'Standing Overhead Barbell Press', muscleGroup: 'Shoulders', targetSets: 2, defaultReps: 10, restSeconds: 105, isCompound: true },
      { id: 'ex-lateral-raise', name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', targetSets: 2, defaultReps: 12, restSeconds: 75, isCompound: false },
      { id: 'ex-tricep-pushdown', name: 'Cable Tricep Rope Pushdown', muscleGroup: 'Arms', targetSets: 2, defaultReps: 12, restSeconds: 75, isCompound: false }
    ]
  },
  {
    id: 'tuesday-pull',
    name: 'Tuesday: Pull Day (Back, Biceps & Forearms)',
    dayOfWeek: 2, // Tue
    category: 'Pull',
    description: 'Target lats, upper back thickness, and bicep/forearm peaks with strict 2-set progressive overload.',
    exercises: [
      { id: 'ex-lat-pulldown', name: 'Wide-Grip Lat Pulldown', muscleGroup: 'Back', targetSets: 2, defaultReps: 10, restSeconds: 105, isCompound: true },
      { id: 'ex-seated-cable-row', name: 'Close-Grip Seated Cable Row', muscleGroup: 'Back', targetSets: 2, defaultReps: 10, restSeconds: 105, isCompound: true },
      { id: 'ex-chest-supported-row', name: 'Chest-Supported T-Bar Row', muscleGroup: 'Back', targetSets: 2, defaultReps: 10, restSeconds: 90, isCompound: true },
      { id: 'ex-face-pulls', name: 'Cable Face Pulls', muscleGroup: 'Shoulders', targetSets: 2, defaultReps: 14, restSeconds: 75, isCompound: false },
      { id: 'ex-biceps-curl', name: 'Incline Dumbbell Bicep Curl', muscleGroup: 'Arms', targetSets: 2, defaultReps: 10, restSeconds: 75, isCompound: false },
      { id: 'ex-hammer-curl', name: 'Standing Dumbbell Hammer Curl', muscleGroup: 'Arms', targetSets: 2, defaultReps: 10, restSeconds: 75, isCompound: false },
      { id: 'ex-reverse-curl', name: 'Reverse-Grip Barbell Curls', muscleGroup: 'Arms', targetSets: 2, defaultReps: 12, restSeconds: 75, isCompound: false }
    ]
  },
  {
    id: 'wednesday-legs',
    name: 'Wednesday: Leg Day (Quads, Hamstrings, Glutes & Calves)',
    dayOfWeek: 3, // Wed
    category: 'Legs',
    description: 'Build powerful quads, hamstrings, and calves with extended rest intervals on compound machines.',
    exercises: [
      { id: 'ex-leg-press', name: 'Incline 45° Leg Press', muscleGroup: 'Legs', targetSets: 2, defaultReps: 10, restSeconds: 120, isCompound: true },
      { id: 'ex-goblet-squat', name: 'Goblet Squats or Hack Squat', muscleGroup: 'Legs', targetSets: 2, defaultReps: 10, restSeconds: 105, isCompound: true },
      { id: 'ex-seated-leg-curl', name: 'Seated Hamstring Leg Curl', muscleGroup: 'Legs', targetSets: 2, defaultReps: 10, restSeconds: 75, isCompound: false },
      { id: 'ex-leg-extension', name: 'Leg Extension Machine', muscleGroup: 'Legs', targetSets: 2, defaultReps: 12, restSeconds: 75, isCompound: false },
      { id: 'ex-calf-raise', name: 'Standing Machine Calf Raise', muscleGroup: 'Legs', targetSets: 2, defaultReps: 15, restSeconds: 75, isCompound: false }
    ]
  },
  {
    id: 'thursday-push',
    name: 'Thursday: Push Day (Chest, Shoulders & Triceps)',
    dayOfWeek: 4, // Thu
    category: 'Push',
    description: 'Second push session of the week. Progress weight or reps from Monday with high mechanical tension.',
    exercises: [
      { id: 'ex-chest-press-2', name: 'Barbell Flat Bench Press', muscleGroup: 'Chest', targetSets: 2, defaultReps: 10, restSeconds: 105, isCompound: true },
      { id: 'ex-incline-db-2', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', targetSets: 2, defaultReps: 10, restSeconds: 90, isCompound: true },
      { id: 'ex-shoulder-press-2', name: 'Standing Overhead Barbell Press', muscleGroup: 'Shoulders', targetSets: 2, defaultReps: 10, restSeconds: 105, isCompound: true },
      { id: 'ex-lateral-raise-2', name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', targetSets: 2, defaultReps: 12, restSeconds: 75, isCompound: false },
      { id: 'ex-tricep-pushdown-2', name: 'Cable Tricep Rope Pushdown', muscleGroup: 'Arms', targetSets: 2, defaultReps: 12, restSeconds: 75, isCompound: false }
    ]
  },
  {
    id: 'friday-pull',
    name: 'Friday: Pull Day (Back, Biceps & Forearms)',
    dayOfWeek: 5, // Fri
    category: 'Pull',
    description: 'Second pull session of the week. Build back width, mid-trap density, and arm thickness.',
    exercises: [
      { id: 'ex-lat-pulldown-2', name: 'Wide-Grip Lat Pulldown', muscleGroup: 'Back', targetSets: 2, defaultReps: 10, restSeconds: 105, isCompound: true },
      { id: 'ex-seated-cable-row-2', name: 'Close-Grip Seated Cable Row', muscleGroup: 'Back', targetSets: 2, defaultReps: 10, restSeconds: 105, isCompound: true },
      { id: 'ex-chest-supported-row-2', name: 'Chest-Supported T-Bar Row', muscleGroup: 'Back', targetSets: 2, defaultReps: 10, restSeconds: 90, isCompound: true },
      { id: 'ex-face-pulls-2', name: 'Cable Face Pulls', muscleGroup: 'Shoulders', targetSets: 2, defaultReps: 14, restSeconds: 75, isCompound: false },
      { id: 'ex-biceps-curl-2', name: 'Incline Dumbbell Bicep Curl', muscleGroup: 'Arms', targetSets: 2, defaultReps: 10, restSeconds: 75, isCompound: false },
      { id: 'ex-hammer-curl-2', name: 'Standing Dumbbell Hammer Curl', muscleGroup: 'Arms', targetSets: 2, defaultReps: 10, restSeconds: 75, isCompound: false },
      { id: 'ex-reverse-curl-2', name: 'Reverse-Grip Barbell Curls', muscleGroup: 'Arms', targetSets: 2, defaultReps: 12, restSeconds: 75, isCompound: false }
    ]
  },
  {
    id: 'saturday-legs',
    name: 'Saturday: Leg Day (Quads, Hamstrings, Glutes & Calves)',
    dayOfWeek: 6, // Sat
    category: 'Legs',
    description: 'Second leg session of the week. Full lower-body hypertrophy stimulation before Sunday rest.',
    exercises: [
      { id: 'ex-leg-press-2', name: 'Incline 45° Leg Press', muscleGroup: 'Legs', targetSets: 2, defaultReps: 10, restSeconds: 120, isCompound: true },
      { id: 'ex-goblet-squat-2', name: 'Goblet Squats or Hack Squat', muscleGroup: 'Legs', targetSets: 2, defaultReps: 10, restSeconds: 105, isCompound: true },
      { id: 'ex-seated-leg-curl-2', name: 'Seated Hamstring Leg Curl', muscleGroup: 'Legs', targetSets: 2, defaultReps: 10, restSeconds: 75, isCompound: false },
      { id: 'ex-leg-extension-2', name: 'Leg Extension Machine', muscleGroup: 'Legs', targetSets: 2, defaultReps: 12, restSeconds: 75, isCompound: false },
      { id: 'ex-calf-raise-2', name: 'Standing Machine Calf Raise', muscleGroup: 'Legs', targetSets: 2, defaultReps: 15, restSeconds: 75, isCompound: false }
    ]
  },
  {
    id: 'sunday-rest',
    name: 'Sunday: Full Rest & Recovery Day',
    dayOfWeek: 0, // Sun
    category: 'Rest',
    isRest: true,
    description: 'Complete systemic recovery day. Prioritize 8–10 hours of sleep, 3–4L hydration, gentle stretching, and high-protein nutrition.',
    exercises: []
  }
];

export const INITIAL_PREVIOUS_RECORDS = {
  'Barbell Flat Bench Press': { weight: 55, reps: 10, date: '2026-11-17', calculated1RM: 73.3 },
  'Incline Dumbbell Press': { weight: 18, reps: 10, date: '2026-11-17', calculated1RM: 24.0 },
  'Standing Overhead Barbell Press': { weight: 35, reps: 10, date: '2026-11-17', calculated1RM: 46.7 },
  'Dumbbell Lateral Raise': { weight: 8, reps: 14, date: '2026-11-17', calculated1RM: 12.5 },
  'Cable Tricep Rope Pushdown': { weight: 22.5, reps: 12, date: '2026-11-17', calculated1RM: 32.4 },
  'Wide-Grip Lat Pulldown': { weight: 50, reps: 10, date: '2026-11-15', calculated1RM: 66.7 },
  'Close-Grip Seated Cable Row': { weight: 45, reps: 10, date: '2026-11-15', calculated1RM: 60.0 },
  'Chest-Supported T-Bar Row': { weight: 30, reps: 10, date: '2026-11-15', calculated1RM: 40.0 },
  'Cable Face Pulls': { weight: 17.5, reps: 15, date: '2026-11-15', calculated1RM: 28.6 },
  'Incline Dumbbell Bicep Curl': { weight: 12, reps: 10, date: '2026-11-15', calculated1RM: 16.0 },
  'Standing Dumbbell Hammer Curl': { weight: 12, reps: 10, date: '2026-11-15', calculated1RM: 16.0 },
  'Incline 45° Leg Press': { weight: 110, reps: 10, date: '2026-11-14', calculated1RM: 146.7 },
  'Goblet Squats or Hack Squat': { weight: 24, reps: 10, date: '2026-11-14', calculated1RM: 32.0 },
  'Seated Hamstring Leg Curl': { weight: 35, reps: 10, date: '2026-11-14', calculated1RM: 46.7 },
  'Leg Extension Machine': { weight: 40, reps: 12, date: '2026-11-14', calculated1RM: 57.6 },
  'Standing Machine Calf Raise': { weight: 50, reps: 15, date: '2026-11-14', calculated1RM: 81.8 }
};

export const INITIAL_BODY_WEIGHT_HISTORY = [
  { date: '11/01', weight: 68.5 },
  { date: '11/05', weight: 68.7 },
  { date: '11/09', weight: 68.6 },
  { date: '11/13', weight: 68.9 },
  { date: '11/17', weight: 69.1 },
  { date: '11/20', weight: 69.3 }
];

export const INITIAL_STRENGTH_PROGRESSION = {
  'Barbell Flat Bench Press': [
    { date: '10/25', oneRepMax: 60 },
    { date: '11/01', oneRepMax: 64 },
    { date: '11/08', oneRepMax: 67.5 },
    { date: '11/15', oneRepMax: 70 },
    { date: '11/17', oneRepMax: 73.3 }
  ],
  'Wide-Grip Lat Pulldown': [
    { date: '10/25', oneRepMax: 54 },
    { date: '11/01', oneRepMax: 58 },
    { date: '11/08', oneRepMax: 62 },
    { date: '11/15', oneRepMax: 66.7 }
  ],
  'Incline 45° Leg Press': [
    { date: '10/25', oneRepMax: 120 },
    { date: '11/01', oneRepMax: 128 },
    { date: '11/08', oneRepMax: 138 },
    { date: '11/14', oneRepMax: 146.7 }
  ],
  'Standing Overhead Barbell Press': [
    { date: '10/25', oneRepMax: 38 },
    { date: '11/01', oneRepMax: 40 },
    { date: '11/08', oneRepMax: 43 },
    { date: '11/17', oneRepMax: 46.7 }
  ]
};

export const INITIAL_NUTRITION_DATA = {
  targets: {
    calories: 2350,
    protein: 140,
    carbs: 270,
    fats: 60
  },
  logs: [
    { id: '1', time: '05:15 AM', name: 'Pre-Workout Banana + Almonds & Cashews', calories: 155, protein: 3.5, carbs: 28, fats: 4.5 },
    { id: '2', time: '07:30 AM', name: 'Rice Puttu + Kadala Curry + 2 Boiled Eggs', calories: 520, protein: 28, carbs: 68, fats: 14 },
    { id: '3', time: '11:00 AM', name: 'Thick Curd + Sliced Cucumber & Carrot', calories: 127, protein: 7, carbs: 13.5, fats: 4.7 }
  ]
};

export const loadFromStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(`ironpulse_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return fallback;
  }
};

export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(`ironpulse_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
};

// Brzycki 1RM formula: Weight × (36 / (37 - Reps))
export const calculate1RM = (weight, reps) => {
  if (!weight || !reps || reps <= 0) return 0;
  if (reps === 1) return Number(weight);
  const oneRM = weight * (36 / (37 - reps));
  return Number(oneRM.toFixed(1));
};
