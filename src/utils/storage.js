// IronPulse initial seed data & storage utilities

export const DEFAULT_ROUTINES = [
  {
    id: 'push-a',
    name: 'Push Day A (Chest & Triceps Focus)',
    dayOfWeek: 1, // Mon
    category: 'Push',
    exercises: [
      { id: 'ex-bench', name: 'Barbell Flat Bench Press', targetSets: 4, defaultReps: 8, targetRpe: 8 },
      { id: 'ex-incline-db', name: 'Incline Dumbbell Press', targetSets: 3, defaultReps: 10, targetRpe: 8 },
      { id: 'ex-ohp', name: 'Standing Overhead Barbell Press', targetSets: 3, defaultReps: 8, targetRpe: 8 },
      { id: 'ex-dips', name: 'Weighted Chest Dips', targetSets: 3, defaultReps: 10, targetRpe: 9 },
      { id: 'ex-cable-fly', name: 'Cable Low-to-High Flyes', targetSets: 3, defaultReps: 12, targetRpe: 9 },
      { id: 'ex-tricep-pushdown', name: 'Cable Tricep Rope Pushdown', targetSets: 4, defaultReps: 12, targetRpe: 9 }
    ]
  },
  {
    id: 'pull-a',
    name: 'Pull Day A (Back & Biceps Focus)',
    dayOfWeek: 2, // Tue
    category: 'Pull',
    exercises: [
      { id: 'ex-deadlift', name: 'Conventional Barbell Deadlift', targetSets: 4, defaultReps: 6, targetRpe: 8.5 },
      { id: 'ex-lat-pulldown', name: 'Wide-Grip Lat Pulldown', targetSets: 4, defaultReps: 10, targetRpe: 8 },
      { id: 'ex-barbell-row', name: 'Bent-Over Barbell Row', targetSets: 3, defaultReps: 8, targetRpe: 8 },
      { id: 'ex-chest-supported-row', name: 'Chest-Supported T-Bar Row', targetSets: 3, defaultReps: 10, targetRpe: 8 },
      { id: 'ex-face-pulls', name: 'Cable Face Pulls', targetSets: 3, defaultReps: 15, targetRpe: 8 },
      { id: 'ex-incline-curl', name: 'Incline Dumbbell Bicep Curl', targetSets: 4, defaultReps: 10, targetRpe: 9 }
    ]
  },
  {
    id: 'legs-a',
    name: 'Legs Day A (Quad & Calves Focus)',
    dayOfWeek: 3, // Wed
    category: 'Legs',
    exercises: [
      { id: 'ex-squat', name: 'Barbell Back Squat', targetSets: 4, defaultReps: 8, targetRpe: 8.5 },
      { id: 'ex-leg-press', name: 'Incline 45° Leg Press', targetSets: 3, defaultReps: 10, targetRpe: 8 },
      { id: 'ex-romanian-deadlift', name: 'Romanian Deadlift (RDL)', targetSets: 3, defaultReps: 8, targetRpe: 8 },
      { id: 'ex-leg-extension', name: 'Leg Extension Machine', targetSets: 3, defaultReps: 12, targetRpe: 9 },
      { id: 'ex-seated-leg-curl', name: 'Seated Hamstring Leg Curl', targetSets: 3, defaultReps: 12, targetRpe: 9 },
      { id: 'ex-standing-calf-raise', name: 'Standing Machine Calf Raise', targetSets: 4, defaultReps: 15, targetRpe: 9 }
    ]
  },
  {
    id: 'push-b',
    name: 'Push Day B (Shoulder & Upper Chest)',
    dayOfWeek: 4, // Thu
    category: 'Push',
    exercises: [
      { id: 'ex-ohp', name: 'Standing Overhead Barbell Press', targetSets: 4, defaultReps: 6, targetRpe: 8.5 },
      { id: 'ex-incline-db', name: 'Incline Dumbbell Press', targetSets: 4, defaultReps: 8, targetRpe: 8 },
      { id: 'ex-pec-deck', name: 'Pec Deck Machine Fly', targetSets: 3, defaultReps: 12, targetRpe: 8.5 },
      { id: 'ex-lateral-raise', name: 'Dumbbell Lateral Raise', targetSets: 4, defaultReps: 15, targetRpe: 9 },
      { id: 'ex-overhead-tricep-ext', name: 'Cable Overhead Tricep Extension', targetSets: 3, defaultReps: 12, targetRpe: 9 }
    ]
  },
  {
    id: 'pull-b',
    name: 'Pull Day B (Upper Back & Forearms)',
    dayOfWeek: 5, // Fri
    category: 'Pull',
    exercises: [
      { id: 'ex-weighted-pullups', name: 'Pull-Ups / Weighted Pull-Ups', targetSets: 4, defaultReps: 8, targetRpe: 8.5 },
      { id: 'ex-seated-cable-row', name: 'Close-Grip Seated Cable Row', targetSets: 4, defaultReps: 10, targetRpe: 8 },
      { id: 'ex-single-arm-db-row', name: 'Single-Arm Dumbbell Row', targetSets: 3, defaultReps: 10, targetRpe: 8 },
      { id: 'ex-reverse-pec-deck', name: 'Reverse Pec Deck / Rear Delt Fly', targetSets: 4, defaultReps: 15, targetRpe: 8.5 },
      { id: 'ex-hammer-curl', name: 'Standing Dumbbell Hammer Curl', targetSets: 4, defaultReps: 10, targetRpe: 9 }
    ]
  },
  {
    id: 'legs-b',
    name: 'Legs Day B (Hamstring & Glute Focus)',
    dayOfWeek: 6, // Sat
    category: 'Legs',
    exercises: [
      { id: 'ex-romanian-deadlift', name: 'Romanian Deadlift (RDL)', targetSets: 4, defaultReps: 8, targetRpe: 8.5 },
      { id: 'ex-front-squat', name: 'Front Squats or Hack Squat', targetSets: 3, defaultReps: 8, targetRpe: 8 },
      { id: 'ex-bulgarian-split-squat', name: 'Bulgarian Split Squat', targetSets: 3, defaultReps: 10, targetRpe: 9 },
      { id: 'ex-lying-leg-curl', name: 'Lying Hamstring Leg Curl', targetSets: 4, defaultReps: 12, targetRpe: 9 },
      { id: 'ex-seated-calf-raise', name: 'Seated Calf Raise', targetSets: 4, defaultReps: 15, targetRpe: 8.5 }
    ]
  },
  {
    id: 'rest-sunday',
    name: 'Rest & Recovery Day',
    dayOfWeek: 0, // Sun
    category: 'Rest',
    isRest: true,
    exercises: []
  }
];

export const INITIAL_PREVIOUS_RECORDS = {
  'Barbell Flat Bench Press': { weight: 90, reps: 8, date: '2026-11-17', calculated1RM: 111.6 },
  'Incline Dumbbell Press': { weight: 32, reps: 10, date: '2026-11-17', calculated1RM: 42.7 },
  'Standing Overhead Barbell Press': { weight: 57.5, reps: 8, date: '2026-11-15', calculated1RM: 71.3 },
  'Conventional Barbell Deadlift': { weight: 160, reps: 5, date: '2026-11-16', calculated1RM: 186.7 },
  'Wide-Grip Lat Pulldown': { weight: 75, reps: 10, date: '2026-11-16', calculated1RM: 100 },
  'Bent-Over Barbell Row': { weight: 80, reps: 8, date: '2026-11-16', calculated1RM: 99.2 },
  'Barbell Back Squat': { weight: 135, reps: 6, date: '2026-11-14', calculated1RM: 162 },
  'Romanian Deadlift (RDL)': { weight: 110, reps: 8, date: '2026-11-14', calculated1RM: 136.4 }
};

export const INITIAL_BODY_WEIGHT_HISTORY = [
  { date: '11/01', weight: 80.2 },
  { date: '11/04', weight: 80.0 },
  { date: '11/07', weight: 79.8 },
  { date: '11/10', weight: 79.5 },
  { date: '11/13', weight: 79.7 },
  { date: '11/16', weight: 79.4 },
  { date: '11/19', weight: 79.2 }
];

export const INITIAL_STRENGTH_PROGRESSION = {
  'Barbell Flat Bench Press': [
    { date: '10/20', oneRepMax: 95 },
    { date: '10/27', oneRepMax: 100 },
    { date: '11/03', oneRepMax: 102.5 },
    { date: '11/10', oneRepMax: 107 },
    { date: '11/17', oneRepMax: 111.6 }
  ],
  'Barbell Back Squat': [
    { date: '10/20', oneRepMax: 140 },
    { date: '10/27', oneRepMax: 145 },
    { date: '11/03', oneRepMax: 152 },
    { date: '11/10', oneRepMax: 158 },
    { date: '11/14', oneRepMax: 162 }
  ],
  'Conventional Barbell Deadlift': [
    { date: '10/20', oneRepMax: 165 },
    { date: '10/27', oneRepMax: 170 },
    { date: '11/03', oneRepMax: 175 },
    { date: '11/10', oneRepMax: 180 },
    { date: '11/16', oneRepMax: 186.7 }
  ],
  'Standing Overhead Barbell Press': [
    { date: '10/20', oneRepMax: 60 },
    { date: '10/27', oneRepMax: 62.5 },
    { date: '11/03', oneRepMax: 65 },
    { date: '11/10', oneRepMax: 68 },
    { date: '11/15', oneRepMax: 71.3 }
  ]
};

export const INITIAL_NUTRITION_DATA = {
  targets: {
    calories: 2800,
    protein: 180,
    carbs: 320,
    fats: 70
  },
  logs: [
    { id: '1', time: '08:00 AM', name: 'Oatmeal with Whey & Berries', calories: 620, protein: 45, carbs: 75, fats: 12 },
    { id: '2', time: '12:30 PM', name: 'Chicken Breast, Jasmine Rice & Veggies', calories: 750, protein: 55, carbs: 90, fats: 14 },
    { id: '3', time: '04:00 PM', name: 'Pre-Workout Banana & Protein Shake', calories: 340, protein: 30, carbs: 45, fats: 4 }
  ]
};

// LocalStorage helpers with safe JSON parsing
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
