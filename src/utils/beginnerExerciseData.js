// Comprehensive Beginner Exercise Guide Database
// Includes verified exercise demo images (Wger/Wikimedia open source), equipment type,
// step-by-step beginner instructions, common mistakes to avoid, and YouTube video IDs.

export const BEGINNER_EXERCISE_GUIDES = {
  'Barbell Flat Bench Press': {
    equipment: 'Barbell & Flat Bench',
    targetMuscle: 'Chest (Mid-Pecs)',
    youtubeId: '4Y2ZdHCOXok',
    imageUrl: 'https://wger.de/media/exercise-images/88/Narrow-grip-bench-press-1.png',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    step1: 'Lie flat on the bench with eyes under the bar. Plant feet flat on the floor and pinch your shoulder blades firmly together.',
    step2: 'Unrack the bar and lower it smoothly to mid-chest while breathing in. Keep elbows tucked at 45° to 70° (not flared out wide).',
    step3: 'Push the bar forcefully back up to the start while breathing out. Keep your hips on the bench—do not lift your buttocks.',
    commonMistake: 'Flaring elbows straight out at 90° or bouncing the bar off the ribcage.'
  },
  'Incline Dumbbell Press': {
    equipment: 'Adjustable Bench (30°) & Dumbbells',
    targetMuscle: 'Upper Chest & Front Shoulders',
    youtubeId: '8iPEnn-ltC8',
    imageUrl: 'https://wger.de/media/exercise-images/341/Incline-dumbbell-bench-press-1.png',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80',
    step1: 'Set the bench to a 30° incline. Sit back with a dumbbell in each hand resting on your thighs, then kick them up to shoulder height.',
    step2: 'Press dumbbells up over your upper chest until arms are extended, rotating hands slightly so palms face forward.',
    step3: 'Lower weights with a controlled 2–3 second stretch until elbows are just below your chest line, then press up again.',
    commonMistake: 'Setting the bench angle too steep (>45°), turning it into a pure shoulder press instead of upper chest.'
  },
  'Standing Overhead Barbell Press': {
    equipment: 'Barbell / Squat Rack',
    targetMuscle: 'Shoulders & Core',
    youtubeId: '2yjwXTZQDDI',
    imageUrl: 'https://wger.de/media/exercise-images/115/Overhead-press-1.png',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
    step1: 'Grip bar just outside shoulder width resting across clavicles. Squeeze glutes and brace your abs hard.',
    step2: 'Tilt your chin back slightly and press the bar straight up overhead. Push your head through the window once bar clears your forehead.',
    step3: 'Lock out overhead with bar centered over midfoot. Lower with control back to collarbone level.',
    commonMistake: 'Arching your lower back backward excessively to cheat the weight up.'
  },
  'Dumbbell Lateral Raise': {
    equipment: 'Light Dumbbells',
    targetMuscle: 'Side Deltoids (Shoulder Width)',
    youtubeId: '3VcKaXpzqRo',
    imageUrl: 'https://wger.de/media/exercise-images/148/Dumbbell-lateral-raise-1.png',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
    step1: 'Stand with feet shoulder-width, holding dumbbells at your sides with a slight forward torso lean (5°–10°).',
    step2: 'Raise weights out to the sides leading with your elbows until arms are parallel to the floor (do not swing).',
    step3: 'Pause for half a second at the top, then lower smoothly over 2 seconds to feel tension throughout.',
    commonMistake: 'Using heavy weights and using body momentum or shrugging traps up to the ears.'
  },
  'Cable Tricep Rope Pushdown': {
    equipment: 'Cable Machine & Rope Attachment',
    targetMuscle: 'Triceps (Back of Arms)',
    youtubeId: 'vB5OHsJ3EME',
    imageUrl: 'https://wger.de/media/exercise-images/170/Triceps-pushdown-1.png',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
    step1: 'Clip the rope to the top pulley. Stand close with a slight forward lean and pin elbows glued to your ribcage.',
    step2: 'Push the rope straight down by extending your elbows, spreading the two rope ends apart at the bottom.',
    step3: 'Hold the peak tricep flex for 1 count, then allow forearms to rise back up to chest height with elbows stationary.',
    commonMistake: 'Letting your elbows swing forward and backward instead of keeping them glued to your sides.'
  },
  'Wide-Grip Lat Pulldown': {
    equipment: 'Lat Pulldown Cable Machine',
    targetMuscle: 'Lats (V-Taper Back)',
    youtubeId: 'CAwf7n6Luuc',
    imageUrl: 'https://wger.de/media/exercise-images/161/Lat-pulldown-1.png',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&auto=format&fit=crop&q=80',
    step1: 'Adjust the thigh pad so your legs are locked securely underneath. Grip the wide bar slightly wider than shoulder width.',
    step2: 'Sit tall with a proud chest. Pull the bar down smoothly to your upper chest while driving your elbows down toward your back pockets.',
    step3: 'Exhale at the bottom, then let the bar rise slowly over 2–3 seconds until your lats are completely stretched.',
    commonMistake: 'Leaning backward 45° and turning the pulldown into a messy row or pulling the bar behind the neck.'
  },
  'Close-Grip Seated Cable Row': {
    equipment: 'Low Row Cable Machine & V-Handle',
    targetMuscle: 'Mid-Back & Rhomboids',
    youtubeId: 'GZbfZ033f74',
    imageUrl: 'https://wger.de/media/exercise-images/142/Seated-cable-row-1.png',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
    step1: 'Sit on the bench with feet on the footplates, knees slightly bent (not locked). Grab the V-handle with back upright.',
    step2: 'Pull the handle into your lower stomach/belly button while squeezing your shoulder blades together.',
    step3: 'Hold for 1 count, then extend arms forward under full muscular control without rounding your lower back.',
    commonMistake: 'Rocking your torso violently back and forth like a rowing boat to create momentum.'
  },
  'Chest-Supported T-Bar Row': {
    equipment: 'Chest-Supported Row Machine',
    targetMuscle: 'Upper Back & Lats',
    youtubeId: 'tzKgeGBweNM',
    imageUrl: 'https://wger.de/media/exercise-images/150/Barbell-shrugs-1.png',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    step1: 'Position your sternum firmly against the chest pad and adjust seat height so handles are easily reachable.',
    step2: 'Grab the handles and pull your elbows straight back towards the ceiling, squeezing mid-back muscles hard at top.',
    step3: 'Slowly lower weights to full extension without letting the weight stack slam.',
    commonMistake: 'Lifting your chest off the pad to yank heavier weights with body momentum.'
  },
  'Cable Face Pulls': {
    equipment: 'Cable Machine & Rope Attachment',
    targetMuscle: 'Rear Delts & Rotator Cuff',
    youtubeId: 'rep-qVOkqgk',
    imageUrl: 'https://wger.de/media/exercise-images/151/Dumbbell-shrugs-2.png',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
    step1: 'Set the cable pulley to eye level with a double rope attachment. Step back so cable is under tension.',
    step2: 'Pull the rope towards the bridge of your nose while rotating hands back so knuckles face behind your ears.',
    step3: 'Squeeze rear shoulders and upper back for a full beat before slowly releasing back forward.',
    commonMistake: 'Pulling too low toward the chest or shrugging shoulders up into the neck.'
  },
  'Incline Dumbbell Bicep Curl': {
    equipment: 'Incline Bench (45°–60°) & Dumbbells',
    targetMuscle: 'Biceps (Long Head Peak)',
    youtubeId: 'soxrZlIl35U',
    imageUrl: 'https://wger.de/media/exercise-images/81/Biceps-curl-1.png',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80',
    step1: 'Lie back on the incline bench. Let your arms hang straight down behind your torso with palms facing inward.',
    step2: 'Curl dumbbells upward while turning your palms to face the ceiling (supination) as you rise.',
    step3: 'Squeeze biceps hard at the top, then lower slowly over 2–3 seconds to feel an expansive stretch at the bottom.',
    commonMistake: 'Swinging elbows forward or kicking your shoulders up to assist the curl.'
  },
  'Standing Dumbbell Hammer Curl': {
    equipment: 'Pair of Dumbbells',
    targetMuscle: 'Brachialis & Forearms',
    youtubeId: 'zC3nLlEvin4',
    imageUrl: 'https://wger.de/media/exercise-images/86/Bicep-hammer-curl-1.png',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
    step1: 'Stand tall holding dumbbells with palms facing each other (neutral hammer grip) throughout the movement.',
    step2: 'Pin elbows to your ribcage and curl dumbbells up toward shoulder level without twisting your wrists.',
    step3: 'Squeeze forearm and outer bicep at peak, then lower under complete control.',
    commonMistake: 'Swinging your torso or letting elbows drift forward.'
  },
  'Reverse-Grip Barbell Curls': {
    equipment: 'Barbell or EZ-Curl Bar',
    targetMuscle: 'Forearms & Outer Biceps (Brachioradialis)',
    youtubeId: 'nRgxYX2Ve9w',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
    step1: 'Hold an EZ-bar or barbell with an overhand (pronated) grip, palms facing downward toward the floor.',
    step2: 'Keep upper arms tight against your ribcage and curl the bar upward by flexing your forearms and biceps.',
    step3: 'Pause for 1 count at the top to fully contract the brachioradialis, then lower smoothly over 2-3 seconds.',
    commonMistake: 'Allowing your wrists to curl backward or using body swinging momentum.'
  },
  'Incline 45° Leg Press': {
    equipment: '45° Leg Press Machine',
    targetMuscle: 'Quads & Glutes',
    youtubeId: 'IZxyjW7MPJQ',
    imageUrl: 'https://wger.de/media/exercise-images/176/Leg-press-1.png',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&auto=format&fit=crop&q=80',
    step1: 'Sit deep into seat with lower back and hips pressed firmly against backrest. Place feet shoulder-width on platform.',
    step2: 'Release safety handles. Lower platform smoothly by bending knees until they reach approximately a 90° angle.',
    step3: 'Press firmly through your midfoot and heels to push platform back up. NEVER lock or snap your knees hyperextended at the top!',
    commonMistake: 'Letting your lower back/buttocks round off the seat pad, which places immense stress on lumbar spine.'
  },
  'Goblet Squats or Hack Squat': {
    equipment: 'Dumbbell or Kettlebell',
    targetMuscle: 'Quads & Core',
    youtubeId: 'lRYBbchqxtI',
    imageUrl: 'https://wger.de/media/exercise-images/111/Squats-1.png',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
    step1: 'Hold one dumbbell vertically against your sternum with both hands. Stance slightly wider than shoulder width.',
    step2: 'Inhale, push hips back slightly and squat down between your thighs until hip crease reaches knee parallel.',
    step3: 'Keep chest upright and knees tracking over toes. Drive up through full foot and exhale.',
    commonMistake: 'Collapsing your chest forward or letting your knees cave inward.'
  },
  'Seated Hamstring Leg Curl': {
    equipment: 'Seated Leg Curl Machine',
    targetMuscle: 'Hamstrings (Back of Thighs)',
    youtubeId: 'ELOCsoDSmrg',
    imageUrl: 'https://wger.de/media/exercise-images/178/Seated-leg-curl-1.png',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&auto=format&fit=crop&q=80',
    step1: 'Adjust machine pivot to knee axis. Lock thigh pad firmly against quads so hips cannot lift.',
    step2: 'Curl lower pad downward and back under your seat by flexing hamstrings forcefully.',
    step3: 'Pause and flex hamstrings for 1 count at maximum contraction, then allow legs to return slowly over 3 seconds.',
    commonMistake: 'Allowing your hips to lift off the seat pad to generate momentum.'
  },
  'Leg Extension Machine': {
    equipment: 'Leg Extension Machine',
    targetMuscle: 'Quadriceps (Front Thighs)',
    youtubeId: 'YyvSfVjQeL0',
    imageUrl: 'https://wger.de/media/exercise-images/177/Leg-extension-1.png',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    step1: 'Sit with back flat against pad. Position the shin pad snugly across your lower shins just above the ankles.',
    step2: 'Extend legs smoothly upward until knees are fully extended, squeezing your quads hard at the top for 1 full second.',
    step3: 'Lower weights under complete control—do not let the weight stack crash down.',
    commonMistake: 'Kicking the weight up violently with jerky momentum instead of a smooth quad contraction.'
  },
  'Standing Machine Calf Raise': {
    equipment: 'Standing Calf Raise Machine',
    targetMuscle: 'Calves (Gastrocnemius)',
    youtubeId: '95itLfMBG40',
    imageUrl: 'https://wger.de/media/exercise-images/181/Standing-calf-raises-1.png',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
    step1: 'Place shoulder pads comfortably on traps. Position the balls of your feet on the step block with heels hanging off.',
    step2: 'Lower your heels as far down as possible into a deep 2-second calf stretch.',
    step3: 'Explode up onto the balls of your big toes, pause at peak calf contraction for 1 count, then repeat.',
    commonMistake: 'Bouncing rapidly up and down without pausing at the bottom stretch.'
  }
};
