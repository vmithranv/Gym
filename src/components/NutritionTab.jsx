import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Target,
  Trash2,
  Flame,
  Droplets,
  Wheat,
  Beef,
  Search,
  BookOpen,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  CheckSquare,
  Square,
  Moon,
  Info
} from 'lucide-react';
import {
  DAILY_HABITS_LIST,
  PROTEIN_ROTATION_WEEK,
  KERALA_TIMETABLE,
  EXPANDED_FOOD_LIBRARY
} from '../utils/keralaNutritionPlan';
import { loadFromStorage, saveToStorage } from '../utils/storage';

export default function NutritionTab({ nutritionData, onUpdateNutrition }) {
  // Modal states
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showCustomFoodModal, setShowCustomFoodModal] = useState(false);

  // Search & Filter state for built-in food library
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [customFoodMultiplier, setCustomFoodMultiplier] = useState({});

  // Daily Habits State backed by storage
  const [completedHabits, setCompletedHabits] = useState(() =>
    loadFromStorage('completed_daily_habits', {})
  );

  // User Custom Food items loaded from storage
  const [customFoods, setCustomFoods] = useState(() =>
    loadFromStorage('custom_food_library', [])
  );

  // New Custom Food Form State
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodCategory, setNewFoodCategory] = useState('Vegetarian');
  const [newFoodServing, setNewFoodServing] = useState('100g');
  const [newFoodCalories, setNewFoodCalories] = useState('');
  const [newFoodProtein, setNewFoodProtein] = useState('');
  const [newFoodCarbs, setNewFoodCarbs] = useState('');
  const [newFoodFats, setNewFoodFats] = useState('');

  // Manual Log Food Form State
  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [mealProtein, setMealProtein] = useState('');
  const [mealCarbs, setMealCarbs] = useState('');
  const [mealFats, setMealFats] = useState('');

  // Target Customization State
  const [targetCalories, setTargetCalories] = useState(nutritionData?.targets?.calories || 2350);
  const [targetProtein, setTargetProtein] = useState(nutritionData?.targets?.protein || 140);
  const [targetCarbs, setTargetCarbs] = useState(nutritionData?.targets?.carbs || 270);
  const [targetFats, setTargetFats] = useState(nutritionData?.targets?.fats || 60);

  const targets = nutritionData?.targets || {
    calories: 2350,
    protein: 140,
    carbs: 270,
    fats: 60
  };

  const logs = nutritionData?.logs || [];

  // Detect today for protein rotation
  const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const todayRotation = PROTEIN_ROTATION_WEEK[todayIndex] || PROTEIN_ROTATION_WEEK[1];

  // Combine default library with user's saved custom foods
  const allLibraryFoods = [...EXPANDED_FOOD_LIBRARY, ...customFoods];

  const categories = [
    'All',
    'Grains & Carbs',
    'Poultry',
    'Fish & Seafood',
    'Eggs & Dairy',
    'Vegetarian',
    'Supplements',
    'Healthy Fats',
    'Fruits & Carbs'
  ];

  const filteredFoods = allLibraryFoods.filter((food) => {
    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || food.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totals = logs.reduce(
    (acc, meal) => ({
      calories: acc.calories + (Number(meal.calories) || 0),
      protein: acc.protein + (Number(meal.protein) || 0),
      carbs: acc.carbs + (Number(meal.carbs) || 0),
      fats: acc.fats + (Number(meal.fats) || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const toggleHabit = (habitId) => {
    const todayKey = new Date().toISOString().split('T')[0];
    const userTodayHabits = completedHabits[todayKey] || {};
    const updated = {
      ...completedHabits,
      [todayKey]: {
        ...userTodayHabits,
        [habitId]: !userTodayHabits[habitId]
      }
    };
    setCompletedHabits(updated);
    saveToStorage('completed_daily_habits', updated);
  };

  const todayKey = new Date().toISOString().split('T')[0];
  const currentDayHabits = completedHabits[todayKey] || {};

  // Fast 1-tap food logging from library
  const handleQuickLogFood = (food, multiplier = 1) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const multNum = Number(multiplier) || 1;
    const portionSuffix = multNum === 1 ? '' : ` (${multNum}x serving)`;

    const newMeal = {
      id: `meal-${Date.now()}`,
      time: timeStr,
      name: `${food.name}${portionSuffix}`,
      calories: Math.round(food.calories * multNum),
      protein: Math.round(food.protein * multNum * 10) / 10,
      carbs: Math.round(food.carbs * multNum * 10) / 10,
      fats: Math.round(food.fats * multNum * 10) / 10
    };

    onUpdateNutrition({
      ...nutritionData,
      logs: [newMeal, ...logs]
    });
  };

  // 1-tap schedule timetable meal logger
  const handleLogScheduledMeal = (item) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMeal = {
      id: `meal-${Date.now()}`,
      time: timeStr,
      name: `${item.title}: ${item.items.split('+')[0].trim()}`,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fats: item.fats
    };

    onUpdateNutrition({
      ...nutritionData,
      logs: [newMeal, ...logs]
    });
  };

  // Add custom food to permanent library
  const handleSaveCustomFood = (e) => {
    e.preventDefault();
    if (!newFoodName.trim()) return;

    const newFoodItem = {
      id: `custom-food-${Date.now()}`,
      name: newFoodName.trim(),
      category: newFoodCategory,
      servingSize: newFoodServing.trim() || '1 serving',
      calories: Number(newFoodCalories) || 0,
      protein: Number(newFoodProtein) || 0,
      carbs: Number(newFoodCarbs) || 0,
      fats: Number(newFoodFats) || 0,
      icon: '🍽️'
    };

    const updated = [newFoodItem, ...customFoods];
    setCustomFoods(updated);
    saveToStorage('custom_food_library', updated);

    handleQuickLogFood(newFoodItem, 1);

    setNewFoodName('');
    setNewFoodCalories('');
    setNewFoodProtein('');
    setNewFoodCarbs('');
    setNewFoodFats('');
    setShowCustomFoodModal(false);
  };

  const handleManualAddMeal = (e) => {
    e.preventDefault();
    if (!mealName.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMeal = {
      id: `meal-${Date.now()}`,
      time: timeStr,
      name: mealName.trim(),
      calories: Number(mealCalories) || 0,
      protein: Number(mealProtein) || 0,
      carbs: Number(mealCarbs) || 0,
      fats: Number(mealFats) || 0
    };

    onUpdateNutrition({
      ...nutritionData,
      logs: [newMeal, ...logs]
    });

    setMealName('');
    setMealCalories('');
    setMealProtein('');
    setMealCarbs('');
    setMealFats('');
    setShowAddMealModal(false);
  };

  const handleRemoveMeal = (mealId) => {
    onUpdateNutrition({
      ...nutritionData,
      logs: logs.filter((m) => m.id !== mealId)
    });
  };

  const handleSaveTargets = (e) => {
    e.preventDefault();
    onUpdateNutrition({
      ...nutritionData,
      targets: {
        calories: Number(targetCalories),
        protein: Number(targetProtein),
        carbs: Number(targetCarbs),
        fats: Number(targetFats)
      }
    });
    setShowTargetModal(false);
  };

  const calculatePercent = (current, target) => {
    if (!target) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  };

  return (
    <div className="space-y-5 pb-32 animate-in fade-in duration-200">
      {/* Signature Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl hero-gradient text-white p-5 shadow-xl border border-teal-500/20">
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider hero-pill-badge text-white mb-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> Fuel & Recovery
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-white" />
              Daily Fuel & Kerala Macro Plan
            </h2>
            <p className="text-blue-100 text-xs font-medium mt-1">
              Tailored around your 6:00 AM workout schedule, high-protein rotation, and calorie goals.
            </p>
          </div>

          <button
            onClick={() => setShowTargetModal(true)}
            className="hero-pill-badge hover:bg-white/30 text-white border border-white/25 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Target className="w-3.5 h-3.5 text-emerald-300" /> Targets
          </button>
        </div>
      </div>

      {/* Main Calories & Macro Overview Card */}
      <div className="repkraft-card rounded-2xl p-5 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Calories Highlight */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-current" /> Daily Target
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{totals.calories}</span>
              <span className="text-slate-400 dark:text-slate-500 text-xs font-bold">/ {targets.calories} kcal</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
              {calculatePercent(totals.calories, targets.calories)}%
            </span>
            <span className="block text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {Math.max(0, targets.calories - totals.calories)} kcal left
            </span>
          </div>
        </div>

        {/* Calories Master Bar */}
        <div className="w-full h-3 bg-slate-100 dark:bg-[#22262E] rounded-full overflow-hidden mb-6 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-[#A3E635] dark:to-lime-300 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${calculatePercent(totals.calories, targets.calories)}%` }}
          />
        </div>

        {/* 3 Macro Progress Bars */}
        <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-[#22262E]">
          {/* Protein */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Beef className="w-3.5 h-3.5 text-rose-500" /> Protein (g)
              </span>
              <span className="font-mono text-slate-500 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">{totals.protein}</strong> / {targets.protein}g ({calculatePercent(totals.protein, targets.protein)}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-[#22262E] rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${calculatePercent(totals.protein, targets.protein)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Wheat className="w-3.5 h-3.5 text-amber-500" /> Carbs (g)
              </span>
              <span className="font-mono text-slate-500 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">{totals.carbs}</strong> / {targets.carbs}g ({calculatePercent(totals.carbs, targets.carbs)}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-[#22262E] rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${calculatePercent(totals.carbs, targets.carbs)}%` }}
              />
            </div>
          </div>

          {/* Fats */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-500" /> Fats (g)
              </span>
              <span className="font-mono text-slate-500 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">{totals.fats}</strong> / {targets.fats}g ({calculatePercent(totals.fats, targets.fats)}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-[#22262E] rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${calculatePercent(totals.fats, targets.fats)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TODAY'S 7-DAY PROTEIN ROTATION WIDGET
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-xs">
            <Calendar className="w-3 h-3" /> Today's Recommended Protein Rotation
          </span>
          <span className="text-[10px] font-extrabold uppercase text-purple-200">
            {todayRotation.title}
          </span>
        </div>

        <div className="mt-2 space-y-2 text-xs">
          <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-xs">
            <span className="font-black text-purple-200 block text-[10px] uppercase">Breakfast Focus</span>
            <p className="font-semibold text-white mt-0.5">{todayRotation.breakfast}</p>
          </div>
          <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-xs">
            <span className="font-black text-purple-200 block text-[10px] uppercase">Lunch Focus</span>
            <p className="font-semibold text-white mt-0.5">{todayRotation.lunch}</p>
          </div>
          <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-xs">
            <span className="font-black text-purple-200 block text-[10px] uppercase">Dinner Focus</span>
            <p className="font-semibold text-white mt-0.5">{todayRotation.dinner}</p>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between text-[11px]">
          <span className="text-purple-100 font-medium">Core Protein Sources:</span>
          <strong className="text-white font-bold">{todayRotation.proteinFocus}</strong>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5:00 AM WAKE / 6:00 AM GYM DAILY TIMETABLE (1-TAP LOGGING)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] rounded-3xl p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 dark:text-[#A3E635]" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              6:00 AM Gym Daily Timetable
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400">1-Tap Log</span>
        </div>

        <div className="space-y-2.5">
          {KERALA_TIMETABLE.map((slot, sIdx) => (
            <div
              key={sIdx}
              className="p-3 bg-slate-50 dark:bg-[#22262E]/70 rounded-2xl border border-slate-100 dark:border-transparent flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="text-lg shrink-0 mt-0.5">{slot.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-black text-blue-600 dark:text-[#A3E635] bg-blue-50 dark:bg-black/30 px-2 py-0.5 rounded-md">
                      {slot.time}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {slot.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                    {slot.items}
                  </p>
                  {slot.calories > 0 && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                      <span>{slot.calories} kcal</span>
                      <span className="text-rose-500 font-bold">P: {slot.protein}g</span>
                      <span className="text-amber-500 font-bold">C: {slot.carbs}g</span>
                      <span className="text-sky-500 font-bold">F: {slot.fats}g</span>
                    </div>
                  )}
                </div>
              </div>

              {slot.calories > 0 && (
                <button
                  onClick={() => handleLogScheduledMeal(slot)}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-[#A3E635] dark:hover:bg-lime-400 text-white dark:text-black font-extrabold text-[10px] uppercase tracking-wider shrink-0 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 stroke-[3]" /> Log
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DAILY HEALTHY HABITS CHECKLIST (6 ITEMS)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-[#A3E635]" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Daily Healthy Habits Checklist
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            {Object.values(currentDayHabits).filter(Boolean).length} of 6 Done
          </span>
        </div>

        <div className="space-y-2">
          {DAILY_HABITS_LIST.map((habit) => {
            const isDone = Boolean(currentDayHabits[habit.id]);

            return (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  isDone
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-slate-50 dark:bg-[#22262E]/70 border-slate-100 dark:border-transparent'
                }`}
              >
                <span className="text-lg shrink-0 mt-0.5">{habit.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-bold text-xs ${
                      isDone
                        ? 'text-emerald-700 dark:text-emerald-400 line-through'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {habit.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {habit.desc}
                  </p>
                </div>
                <div className="shrink-0 mt-0.5">
                  {isDone ? (
                    <CheckSquare className="w-5 h-5 text-emerald-500 dark:text-[#A3E635]" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BUILT-IN FOOD & MACRO LIBRARY (SEARCH & 1-TAP LOGGING)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] rounded-3xl p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-[#A3E635]" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Food & Macro Library
            </h3>
          </div>

          <button
            onClick={() => setShowCustomFoodModal(true)}
            className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Custom Food
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Chicken, Matta Rice, Eggs, Puttu, Kadala, Paneer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200/80 dark:border-[#2D333B] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#A3E635]"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl whitespace-nowrap font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 dark:bg-[#A3E635] text-white dark:text-black shadow-xs'
                  : 'bg-slate-100 dark:bg-[#22262E] text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Food List Grid */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredFoods.map((food) => {
            const currentMult = customFoodMultiplier[food.id] || 1;

            return (
              <div
                key={food.id}
                className="p-3 bg-slate-50 dark:bg-[#22262E]/70 hover:bg-slate-100 dark:hover:bg-[#22262E] rounded-2xl border border-slate-100 dark:border-transparent transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl shrink-0">{food.icon || '🥣'}</span>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {food.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-medium">
                      {food.servingSize} • <strong className="text-slate-700 dark:text-slate-200">{Math.round(food.calories * currentMult)} kcal</strong>
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                      <span className="text-rose-500 font-bold">P: {Math.round(food.protein * currentMult)}g</span>
                      <span className="text-amber-500 font-bold">C: {Math.round(food.carbs * currentMult)}g</span>
                      <span className="text-sky-500 font-bold">F: {Math.round(food.fats * currentMult)}g</span>
                    </div>
                  </div>
                </div>

                {/* Serving multiplier picker & 1-tap add */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <select
                    value={currentMult}
                    onChange={(e) =>
                      setCustomFoodMultiplier({
                        ...customFoodMultiplier,
                        [food.id]: Number(e.target.value)
                      })
                    }
                    className="px-1.5 py-1.5 bg-white dark:bg-[#181B20] text-slate-800 dark:text-white border border-slate-200 dark:border-[#2D333B] rounded-xl text-[10px] font-bold outline-none cursor-pointer"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                    <option value={3}>3x</option>
                  </select>

                  <button
                    onClick={() => handleQuickLogFood(food, currentMult)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-[#A3E635] dark:hover:bg-lime-400 text-white dark:text-black font-extrabold text-xs uppercase tracking-wider active:scale-90 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    title="1-tap log to today's macros"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" /> Log
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual "+ Log Meal" Custom Button */}
      <button
        onClick={() => setShowAddMealModal(true)}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-[#A3E635] dark:to-lime-400 text-white dark:text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer"
      >
        <Plus className="w-5 h-5 stroke-[3]" /> Quick Custom Food Log
      </button>

      {/* Today's Logged Meals List */}
      <div className="bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Today's Logged Meals ({logs.length})</h3>
          <span className="text-xs text-slate-400">Active entries</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-[#22262E]">
          {logs.map((meal) => (
            <div key={meal.id} className="py-3 flex items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{meal.time}</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{meal.name}</span>
                </div>
                <div className="flex items-center gap-2.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="text-blue-600 dark:text-[#A3E635] font-semibold">{meal.calories} kcal</span>
                  <span>P: {meal.protein}g</span>
                  <span>C: {meal.carbs}g</span>
                  <span>F: {meal.fats}g</span>
                </div>
              </div>

              <button
                onClick={() => handleRemoveMeal(meal.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                title="Remove entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-400">
              No meals logged today yet. Tap any item in the timetable or library above!
            </div>
          )}
        </div>
      </div>

      {/* Modal: Save Custom Food to Library */}
      {showCustomFoodModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 text-slate-900 dark:text-white">
          <div className="bg-white dark:bg-[#181B20] border border-slate-200 dark:border-[#2D333B] w-full max-w-md rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom">
            <h3 className="text-base font-black mb-1">Add Food to Permanent Library</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Save your frequent home recipes or protein snacks to your personal library.
            </p>
            <form onSubmit={handleSaveCustomFood} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                  Food Name
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Kerala Beef Roast, Protein Shake..."
                  value={newFoodName}
                  onChange={(e) => setNewFoodName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-0.5">
                    Category
                  </label>
                  <select
                    value={newFoodCategory}
                    onChange={(e) => setNewFoodCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs font-semibold"
                  >
                    <option value="Grains & Carbs">Grains & Carbs</option>
                    <option value="Poultry">Poultry</option>
                    <option value="Fish & Seafood">Fish & Seafood</option>
                    <option value="Eggs & Dairy">Eggs & Dairy</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Supplements">Supplements</option>
                    <option value="Healthy Fats">Healthy Fats</option>
                    <option value="Fruits & Carbs">Fruits & Carbs</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-0.5">
                    Serving Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100g or 1 cup"
                    value={newFoodServing}
                    onChange={(e) => setNewFoodServing(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-0.5">
                    Calories
                  </label>
                  <input
                    type="number"
                    placeholder="220"
                    value={newFoodCalories}
                    onChange={(e) => setNewFoodCalories(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-0.5">
                    Protein
                  </label>
                  <input
                    type="number"
                    placeholder="25"
                    value={newFoodProtein}
                    onChange={(e) => setNewFoodProtein(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-0.5">
                    Carbs
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    value={newFoodCarbs}
                    onChange={(e) => setNewFoodCarbs(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-0.5">
                    Fats
                  </label>
                  <input
                    type="number"
                    placeholder="8"
                    value={newFoodFats}
                    onChange={(e) => setNewFoodFats(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomFoodModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#22262E] text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#A3E635] dark:to-lime-400 text-white dark:text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 shadow-md cursor-pointer"
                >
                  Save & Log Food
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Manual Food Log */}
      {showAddMealModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 text-slate-900 dark:text-white">
          <div className="bg-white dark:bg-[#181B20] border border-slate-200 dark:border-[#2D333B] w-full max-w-md rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom">
            <h3 className="text-base font-black mb-3">Quick Food Log</h3>
            <form onSubmit={handleManualAddMeal} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                  Food Description
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. 2 Chapatis + Chicken Curry"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-0.5">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    placeholder="450"
                    value={mealCalories}
                    onChange={(e) => setMealCalories(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-sm font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-0.5">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    placeholder="35"
                    value={mealProtein}
                    onChange={(e) => setMealProtein(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-sm font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-0.5">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    placeholder="40"
                    value={mealCarbs}
                    onChange={(e) => setMealCarbs(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-sm font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-0.5">
                    Fats (g)
                  </label>
                  <input
                    type="number"
                    placeholder="12"
                    value={mealFats}
                    onChange={(e) => setMealFats(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-sm font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMealModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#22262E] text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#A3E635] dark:to-lime-400 text-white dark:text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 shadow-md cursor-pointer"
                >
                  Save Meal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Target Customization Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 text-slate-900 dark:text-white">
          <div className="bg-white dark:bg-[#181B20] border border-slate-200 dark:border-[#2D333B] w-full max-w-md rounded-3xl p-5 shadow-2xl">
            <h3 className="text-base font-black mb-1 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600 dark:text-[#A3E635]" /> Daily Macro Targets
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Configure daily nutritional targets aligned with your Kerala muscle-gain goals.
            </p>
            <form onSubmit={handleSaveTargets} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                    Daily Calories (kcal)
                  </label>
                  <input
                    type="number"
                    value={targetCalories}
                    onChange={(e) => setTargetCalories(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                    Protein Target (g)
                  </label>
                  <input
                    type="number"
                    value={targetProtein}
                    onChange={(e) => setTargetProtein(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                    Carbs Target (g)
                  </label>
                  <input
                    type="number"
                    value={targetCarbs}
                    onChange={(e) => setTargetCarbs(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                    Fats Target (g)
                  </label>
                  <input
                    type="number"
                    value={targetFats}
                    onChange={(e) => setTargetFats(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] font-mono font-bold text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowTargetModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#22262E] text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#A3E635] dark:to-lime-400 text-white dark:text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 shadow-md cursor-pointer"
                >
                  Update Targets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
