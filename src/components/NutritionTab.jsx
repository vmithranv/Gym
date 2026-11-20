import React, { useState } from 'react';
import { UtensilsCrossed, Plus, Target, Trash2, Flame, Droplets, Wheat, Beef } from 'lucide-react';

export default function NutritionTab({ nutritionData, onUpdateNutrition }) {
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);

  // New Meal Form State
  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [mealProtein, setMealProtein] = useState('');
  const [mealCarbs, setMealCarbs] = useState('');
  const [mealFats, setMealFats] = useState('');

  // Target Customization State
  const [targetCalories, setTargetCalories] = useState(nutritionData?.targets?.calories || 2800);
  const [targetProtein, setTargetProtein] = useState(nutritionData?.targets?.protein || 180);
  const [targetCarbs, setTargetCarbs] = useState(nutritionData?.targets?.carbs || 320);
  const [targetFats, setTargetFats] = useState(nutritionData?.targets?.fats || 70);

  const targets = nutritionData?.targets || {
    calories: 2800,
    protein: 180,
    carbs: 320,
    fats: 70
  };

  const logs = nutritionData?.logs || [];

  // Sum current intake
  const totals = logs.reduce(
    (acc, meal) => ({
      calories: acc.calories + (Number(meal.calories) || 0),
      protein: acc.protein + (Number(meal.protein) || 0),
      carbs: acc.carbs + (Number(meal.carbs) || 0),
      fats: acc.fats + (Number(meal.fats) || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const handleAddMeal = (e) => {
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
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-[#A3E635]" /> Fuel & Recovery
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Daily macronutrient tracker for optimal muscle hypertrophy.
          </p>
        </div>

        <button
          onClick={() => setShowTargetModal(true)}
          className="px-3 py-1.5 rounded-xl bg-[#22262E] hover:bg-[#2D333B] text-slate-300 hover:text-white border border-[#2D333B] text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <Target className="w-3.5 h-3.5 text-[#A3E635]" /> Set Targets
        </button>
      </div>

      {/* Main Calories & Macro Overview Card */}
      <div className="bg-[#181B20] border border-[#2D333B] rounded-3xl p-5 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#A3E635]/5 rounded-full blur-2xl pointer-events-none" />

        {/* Calories Highlight */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A3E635] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-[#A3E635]" /> Energy Target
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-white font-mono">{totals.calories}</span>
              <span className="text-slate-400 text-xs font-bold">/ {targets.calories} kcal</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#A3E635]/20 text-[#A3E635] border border-[#A3E635]/30">
              {calculatePercent(totals.calories, targets.calories)}%
            </span>
            <span className="block text-[11px] text-slate-500 mt-1">
              {Math.max(0, targets.calories - totals.calories)} kcal left
            </span>
          </div>
        </div>

        {/* Calories Master Bar */}
        <div className="w-full h-3 bg-[#22262E] rounded-full overflow-hidden mb-6 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#A3E635] to-lime-300 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(163,230,53,0.4)]"
            style={{ width: `${calculatePercent(totals.calories, targets.calories)}%` }}
          />
        </div>

        {/* 3 Macro Progress Bars */}
        <div className="space-y-3.5 pt-2 border-t border-[#22262E]">
          {/* Protein */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Beef className="w-3.5 h-3.5 text-red-400" /> Protein (g)
              </span>
              <span className="font-mono text-slate-300">
                <strong className="text-white">{totals.protein}</strong> / {targets.protein}g ({calculatePercent(totals.protein, targets.protein)}%)
              </span>
            </div>
            <div className="w-full h-2 bg-[#22262E] rounded-full overflow-hidden">
              <div
                className="h-full bg-red-400 rounded-full transition-all duration-500"
                style={{ width: `${calculatePercent(totals.protein, targets.protein)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Wheat className="w-3.5 h-3.5 text-amber-400" /> Carbs (g)
              </span>
              <span className="font-mono text-slate-300">
                <strong className="text-white">{totals.carbs}</strong> / {targets.carbs}g ({calculatePercent(totals.carbs, targets.carbs)}%)
              </span>
            </div>
            <div className="w-full h-2 bg-[#22262E] rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${calculatePercent(totals.carbs, targets.carbs)}%` }}
              />
            </div>
          </div>

          {/* Fats */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-400" /> Fats (g)
              </span>
              <span className="font-mono text-slate-300">
                <strong className="text-white">{totals.fats}</strong> / {targets.fats}g ({calculatePercent(totals.fats, targets.fats)}%)
              </span>
            </div>
            <div className="w-full h-2 bg-[#22262E] rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${calculatePercent(totals.fats, targets.fats)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Meal Trigger Button */}
      <button
        onClick={() => setShowAddMealModal(true)}
        className="w-full py-3.5 rounded-2xl bg-[#A3E635] text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(163,230,53,0.3)] hover:bg-lime-400 active:scale-98 transition-all"
      >
        <Plus className="w-5 h-5 stroke-[3]" /> Log Meal / Snack
      </button>

      {/* Today's Meals Log */}
      <div className="bg-[#181B20] border border-[#2D333B] rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white text-sm">Today's Meals ({logs.length})</h3>
          <span className="text-xs text-slate-500">Fast entry</span>
        </div>

        <div className="divide-y divide-[#22262E]">
          {logs.map((meal) => (
            <div key={meal.id} className="py-3 flex items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{meal.time}</span>
                  <span className="font-bold text-sm text-white">{meal.name}</span>
                </div>
                <div className="flex items-center gap-2.5 mt-1 text-[11px] text-slate-400">
                  <span className="text-[#A3E635] font-semibold">{meal.calories} kcal</span>
                  <span>P: {meal.protein}g</span>
                  <span>C: {meal.carbs}g</span>
                  <span>F: {meal.fats}g</span>
                </div>
              </div>

              <button
                onClick={() => handleRemoveMeal(meal.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                title="Remove entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-500">
              No meals logged today yet. Hit "+ Log Meal" above.
            </div>
          )}
        </div>
      </div>

      {/* Add Meal Modal */}
      {showAddMealModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#181B20] border border-[#2D333B] w-full max-w-md rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom">
            <h3 className="text-base font-black text-white mb-3">Log Food or Meal</h3>
            <form onSubmit={handleAddMeal} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                  Meal Name / Description
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. 4 Eggs + Sourdough Toast"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#22262E] text-white border border-[#2D333B] focus:ring-2 focus:ring-[#A3E635] outline-none text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-0.5">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    placeholder="450"
                    value={mealCalories}
                    onChange={(e) => setMealCalories(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#22262E] text-white border border-[#2D333B] text-sm font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-0.5">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    placeholder="35"
                    value={mealProtein}
                    onChange={(e) => setMealProtein(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#22262E] text-white border border-[#2D333B] text-sm font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-0.5">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    placeholder="40"
                    value={mealCarbs}
                    onChange={(e) => setMealCarbs(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#22262E] text-white border border-[#2D333B] text-sm font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-0.5">
                    Fats (g)
                  </label>
                  <input
                    type="number"
                    placeholder="12"
                    value={mealFats}
                    onChange={(e) => setMealFats(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#22262E] text-white border border-[#2D333B] text-sm font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMealModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#22262E] text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#A3E635] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-lime-400"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#181B20] border border-[#2D333B] w-full max-w-md rounded-3xl p-5 shadow-2xl">
            <h3 className="text-base font-black text-white mb-1 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#A3E635]" /> Daily Macro Targets
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Configure your daily nutritional goals for your current cutting or bulking phase.
            </p>
            <form onSubmit={handleSaveTargets} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Daily Calories (kcal)
                  </label>
                  <input
                    type="number"
                    value={targetCalories}
                    onChange={(e) => setTargetCalories(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#22262E] text-white border border-[#2D333B] font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Protein Target (g)
                  </label>
                  <input
                    type="number"
                    value={targetProtein}
                    onChange={(e) => setTargetProtein(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#22262E] text-white border border-[#2D333B] font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Carbs Target (g)
                  </label>
                  <input
                    type="number"
                    value={targetCarbs}
                    onChange={(e) => setTargetCarbs(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#22262E] text-white border border-[#2D333B] font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Fats Target (g)
                  </label>
                  <input
                    type="number"
                    value={targetFats}
                    onChange={(e) => setTargetFats(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#22262E] text-white border border-[#2D333B] font-mono font-bold text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowTargetModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#22262E] text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#A3E635] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-lime-400"
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
