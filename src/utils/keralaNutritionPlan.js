// Personalized Kerala Gym Nutrition, 6:00 AM Routine, Protein Rotation, Healthy Habits, and Food Database

export const DAILY_HABITS_LIST = [
  { id: 'habit-1', title: 'Breakfast within 45 mins after 6:00 AM Gym', desc: 'Fuel muscle repair with protein + complex carbs', icon: '🍳' },
  { id: 'habit-2', title: 'Include Protein in Every Main Meal', desc: 'Aim for 20-35g protein across breakfast, lunch, and dinner', icon: '🍗' },
  { id: 'habit-3', title: 'Vegetables & Fruits Daily', desc: 'Carrot, cucumber, thoran, or fresh fruit for micronutrients', icon: '🥗' },
  { id: 'habit-4', title: 'Drink 3-4 Litres of Water', desc: 'Stay hydrated through workout and entire day', icon: '💧' },
  { id: 'habit-5', title: 'Honor Your Rest Days (Tue, Thu, Sun)', desc: 'Muscles grow during recovery, not during the workout', icon: '🧘' },
  { id: 'habit-6', title: '8-10 Hours Sleep (Bedtime 8:30 - 9:00 PM)', desc: 'Deep sleep enables GH release for 5:00 AM wake up', icon: '🌙' },
];

export const PROTEIN_ROTATION_WEEK = {
  1: { // Monday
    title: 'Monday Rotation',
    breakfast: 'Rice Puttu + Kadala Curry + 2 Boiled Eggs',
    lunch: 'Matta Rice + Grilled Chicken Breast + Cherupayar Thoran + Curd',
    dinner: '2 Chapatis + Paneer Curry / Egg Curry + Cucumber Salad',
    proteinFocus: 'Eggs + Chicken Breast + Kadala'
  },
  2: { // Tuesday (Rest)
    title: 'Tuesday Rotation (Recovery Focus)',
    breakfast: 'Oats Porridge + 100g Curd + 50g Paneer cubes',
    lunch: 'Matta Rice + Kerala Fish Curry (Ayala/Mathi) + Green Gram Thoran',
    dinner: '2 Chapatis + Chicken Breast Masala / Soya Chunks + Salad',
    proteinFocus: 'Fish + Paneer + Green Gram'
  },
  3: { // Wednesday
    title: 'Wednesday Rotation',
    breakfast: '2 Idiyappam + Green Gram (Cherupayar) Curry + 1-2 Eggs',
    lunch: 'Matta Rice + Soya Chunks Curry (50g) + Vegetable Thoran + Curd',
    dinner: '2 Chapatis + Paneer Bhurji / Chicken + Salad',
    proteinFocus: 'Eggs + Soya Chunks + Paneer'
  },
  4: { // Thursday (Rest)
    title: 'Thursday Rotation (Hydration & Rest)',
    breakfast: 'Rice Puttu + Kadala Curry + 2 Boiled Eggs',
    lunch: 'Matta Rice + Grilled Chicken Breast + Cabbage Thoran + Curd',
    dinner: '2 Chapatis + Green Gram Curry + 2 Boiled Eggs',
    proteinFocus: 'Chicken + Kadala + Eggs'
  },
  5: { // Friday
    title: 'Friday Rotation',
    breakfast: 'Oats + Curd + 50g Paneer + Banana',
    lunch: 'Matta Rice + Kerala Fish Curry / Chicken Breast + Kadala + Curd',
    dinner: '2 Chapatis + Chicken Breast Curry + Cucumber',
    proteinFocus: 'Fish / Chicken + Paneer + Kadala'
  },
  6: { // Saturday
    title: 'Saturday Rotation (Active Weekend)',
    breakfast: '2 Chapatis + Soya Chunks Curry + 1-2 Eggs',
    lunch: 'Matta Rice + Kadala Curry + Boiled Eggs (2) + Curd + Thoran',
    dinner: '2 Chapatis + Paneer Curry / Chicken + Carrot Salad',
    proteinFocus: 'Soya Chunks + Eggs + Kadala'
  },
  0: { // Sunday
    title: 'Sunday Rotation (Full Rest & Feast)',
    breakfast: 'Rice Puttu + Kadala Curry + 2 Boiled Eggs',
    lunch: 'Matta Rice + Chicken Breast or Fish Curry + Dal + Curd',
    dinner: '2 Chapatis + Paneer Curry + Warm Milk with Almonds',
    proteinFocus: 'Chicken + Eggs + Paneer'
  }
};

export const KERALA_TIMETABLE = [
  {
    time: '5:15 AM',
    title: 'Pre-Workout Fuel (Quick Energy)',
    items: '½–1 Banana + 3 Almonds + 2–3 Cashews + 1 glass Warm Water',
    calories: 155,
    protein: 3.5,
    carbs: 28,
    fats: 4.5,
    icon: '🍌'
  },
  {
    time: '6:00 AM - 7:00 AM',
    title: 'Gym Workout Session',
    items: 'Push, Pull, or Legs lift + Water hydration during rest intervals',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    icon: '🏋️‍♂️'
  },
  {
    time: '7:30 AM',
    title: 'Post-Workout Breakfast',
    items: 'Rice Puttu + Kadala Curry + 2 Eggs (or Oats + Curd + Paneer)',
    calories: 520,
    protein: 28,
    carbs: 68,
    fats: 14,
    icon: '🍲'
  },
  {
    time: '11:00 AM',
    title: 'Mid-Morning Snack',
    items: '1 cup Fresh Curd / Yogurt + Sliced Cucumber & Carrot + 1 Apple or Orange',
    calories: 170,
    protein: 7,
    carbs: 24,
    fats: 4.5,
    icon: '🥕'
  },
  {
    time: '1:00 PM',
    title: 'Wholesome Lunch',
    items: '1 cup Matta Rice + 120g Chicken Breast / Fish + Green Gram / Kadala + Vegetable Thoran + Curd',
    calories: 640,
    protein: 42,
    carbs: 72,
    fats: 16,
    icon: '🍛'
  },
  {
    time: '4:00 PM',
    title: 'Evening Recovery Snack',
    items: 'Boiled Green Gram (Cherupayar) / Kadala Sundal or Paneer with Cucumber slices',
    calories: 210,
    protein: 14,
    carbs: 26,
    fats: 5,
    icon: '🥣'
  },
  {
    time: '7:30 PM',
    title: 'Light Dinner (Before 8:00 PM)',
    items: '2 Whole Wheat Chapatis + Chicken / Paneer / Soybean Curry + Fresh Salad',
    calories: 480,
    protein: 32,
    carbs: 52,
    fats: 12,
    icon: '🫓'
  },
  {
    time: '8:30 PM - 9:00 PM',
    title: 'Wind-Down & Bedtime',
    items: 'Hydrate lightly, no screens, sleep 8–9 hours for 5:00 AM wake up',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    icon: '😴'
  }
];

export const EXPANDED_FOOD_LIBRARY = [
  {
    id: 'food-puttu',
    name: 'Rice Puttu (Kerala Steamed Cylinders)',
    category: 'Grains & Carbs',
    servingSize: '1 medium cylinder (100g)',
    calories: 160,
    protein: 3.2,
    carbs: 34,
    fats: 0.8,
    icon: '🍚'
  },
  {
    id: 'food-kadala',
    name: 'Kadala Curry (Black Chickpeas)',
    category: 'Vegetarian',
    servingSize: '1 cup cooked (150g)',
    calories: 210,
    protein: 12,
    carbs: 34,
    fats: 3.5,
    icon: '🍲'
  },
  {
    id: 'food-cherupayar',
    name: 'Green Gram / Cherupayar (Boiled/Curry)',
    category: 'Vegetarian',
    servingSize: '1 cup cooked (150g)',
    calories: 195,
    protein: 14,
    carbs: 32,
    fats: 0.8,
    icon: '🌱'
  },
  {
    id: 'food-idiyappam',
    name: 'Idiyappam (String Hoppers)',
    category: 'Grains & Carbs',
    servingSize: '2 idiyappams (90g)',
    calories: 150,
    protein: 2.5,
    carbs: 32,
    fats: 0.6,
    icon: '🍜'
  },
  {
    id: 'food-matta-rice',
    name: 'Kerala Red Matta Rice (Cooked)',
    category: 'Grains & Carbs',
    servingSize: '1 cup cooked (150g)',
    calories: 205,
    protein: 4.5,
    carbs: 45,
    fats: 0.4,
    icon: '🍚'
  },
  {
    id: 'food-chicken-breast',
    name: 'Grilled Chicken Breast',
    category: 'Poultry',
    servingSize: '100g cooked',
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.6,
    icon: '🍗'
  },
  {
    id: 'food-egg-whole',
    name: 'Whole Egg (Boiled)',
    category: 'Eggs & Dairy',
    servingSize: '1 large egg (50g)',
    calories: 72,
    protein: 6,
    carbs: 0.5,
    fats: 5,
    icon: '🥚'
  },
  {
    id: 'food-egg-whites',
    name: 'Egg Whites (Boiled)',
    category: 'Eggs & Dairy',
    servingSize: '4 egg whites (130g)',
    calories: 68,
    protein: 14,
    carbs: 1,
    fats: 0,
    icon: '🍳'
  },
  {
    id: 'food-fish-curry',
    name: 'Kerala Fish (Ayala / Mathi / Mackerel)',
    category: 'Fish & Seafood',
    servingSize: '100g fish + light gravy',
    calories: 180,
    protein: 20,
    carbs: 2,
    fats: 10,
    icon: '🐟'
  },
  {
    id: 'food-paneer',
    name: 'Fresh Paneer (Cottage Cheese)',
    category: 'Vegetarian',
    servingSize: '100g',
    calories: 265,
    protein: 18,
    carbs: 3,
    fats: 20,
    icon: '🧀'
  },
  {
    id: 'food-soya-chunks',
    name: 'Soya Chunks (Mealmaker)',
    category: 'Vegetarian',
    servingSize: '50g dry raw',
    calories: 172,
    protein: 26,
    carbs: 16,
    fats: 0.3,
    icon: '🌱'
  },
  {
    id: 'food-chapati',
    name: 'Whole Wheat Chapati / Roti',
    category: 'Grains & Carbs',
    servingSize: '1 medium roti (35g)',
    calories: 104,
    protein: 3,
    carbs: 20,
    fats: 1.5,
    icon: '🫓'
  },
  {
    id: 'food-oats',
    name: 'Rolled Oats (Dry)',
    category: 'Grains & Carbs',
    servingSize: '50g dry',
    calories: 190,
    protein: 6.5,
    carbs: 33,
    fats: 3.5,
    icon: '🥣'
  },
  {
    id: 'food-curd',
    name: 'Thick Curd / Yogurt',
    category: 'Eggs & Dairy',
    servingSize: '1 cup (150g)',
    calories: 95,
    protein: 6,
    carbs: 7,
    fats: 4.5,
    icon: '🥣'
  },
  {
    id: 'food-banana',
    name: 'Banana (Robusta / Nendran / Palayamkodan)',
    category: 'Fruits & Carbs',
    servingSize: '1 medium fruit (118g)',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fats: 0.4,
    icon: '🍌'
  },
  {
    id: 'food-sweet-potato',
    name: 'Boiled Sweet Potato',
    category: 'Grains & Carbs',
    servingSize: '100g boiled',
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fats: 0.1,
    icon: '🍠'
  },
  {
    id: 'food-almonds-cashews',
    name: 'Pre-Workout Almonds & Cashews',
    category: 'Healthy Fats',
    servingSize: '3 almonds + 3 cashews (12g)',
    calories: 72,
    protein: 2.3,
    carbs: 3.2,
    fats: 5.8,
    icon: '🥜'
  },
  {
    id: 'food-cucumber-carrot',
    name: 'Raw Cucumber & Carrot Slices',
    category: 'Vegetables',
    servingSize: '1 cup salad (120g)',
    calories: 32,
    protein: 1,
    carbs: 6.5,
    fats: 0.2,
    icon: '🥕'
  },
  {
    id: 'food-whey',
    name: 'Whey Protein Powder',
    category: 'Supplements',
    servingSize: '1 scoop (30g)',
    calories: 120,
    protein: 24,
    carbs: 3,
    fats: 1.5,
    icon: '🥛'
  }
];

export const MUSCLE_BUILDING_ROADMAP = [
  {
    phase: 'Months 1 – 2',
    title: 'Technique Mastery & Neural Adaptation',
    badge: 'Foundation',
    badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    milestones: [
      'Master the mind-muscle connection and stable joint mechanics for Bench Press, Squats, and Rows.',
      'Notice rapid strength jumps as your nervous system learns to fire more motor units efficiently.',
      'Develop the lifelong habit of working out consistently at 6:00 AM without feeling sore every day.'
    ]
  },
  {
    phase: 'Months 3 – 4',
    title: 'Visible Tone & Density Changes',
    badge: 'Momentum',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    milestones: [
      'First visible signs of shoulder width, upper back thickness, and firmer quad muscle tone.',
      'Gym weights will have increased by 15%–30% across key compound lifts with 90s-120s rest discipline.',
      'Clothes fit broader across chest/back while waist feels tight and strong.'
    ]
  },
  {
    phase: 'Months 6 – 12',
    title: 'Noticeable Hypertrophy & Athletic Build',
    badge: 'Transformation',
    badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    milestones: [
      'Genuine muscular shape and separation visible in arms, lats, chest, and legs.',
      'Consistent progression: hitting PRs regularly, progressive overload seamlessly documented.',
      'High daily energy, enhanced metabolic health, and sustainable nutrition habits that feel natural.'
    ]
  }
];
