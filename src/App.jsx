import React, { useState, useEffect } from 'react';
import {
  DEFAULT_ROUTINES,
  INITIAL_PREVIOUS_RECORDS,
  INITIAL_BODY_WEIGHT_HISTORY,
  INITIAL_STRENGTH_PROGRESSION,
  INITIAL_NUTRITION_DATA,
  loadFromStorage,
  saveToStorage,
  calculate1RM
} from './utils/storage';

import BottomNav from './components/BottomNav';
import HomeDashboardTab from './components/HomeDashboardTab';
import WorkoutTab from './components/WorkoutTab';
import RoutinesTab from './components/RoutinesTab';
import ProgressTab from './components/ProgressTab';
import NutritionTab from './components/NutritionTab';
import ExerciseLibraryTab from './components/ExerciseLibraryTab';
import CardioTab from './components/CardioTab';
import ProfileTab from './components/ProfileTab';
import ExerciseFormModal from './components/ExerciseFormModal';
import FloatingAICoach from './components/FloatingAICoach';
import AuthModal from './components/AuthModal';
import { getStoredUser, logoutUser, persistUser } from './utils/authService';
import { Dumbbell, Sun, Moon, Sparkles, User as UserIcon } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [showAuthModal, setShowAuthModal] = useState(() => !getStoredUser());
  const [isUpgradeAuth, setIsUpgradeAuth] = useState(false);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    persistUser(user);
    setShowAuthModal(false);
    setIsUpgradeAuth(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setShowAuthModal(true);
    setIsUpgradeAuth(false);
  };

  const handleOpenUpgradeAuth = () => {
    setIsUpgradeAuth(true);
    setShowAuthModal(true);
  };

  // Theme Mode: 'light' or 'dark' (Default to colorful vibrant light mode)
  const [theme, setTheme] = useState(() => {
    return loadFromStorage('theme', 'light');
  });

  const isDark = theme === 'dark';

  // Toggle theme and update HTML root class
  useEffect(() => {
    saveToStorage('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Selected exercise for form demonstration modal
  const [selectedGuideExercise, setSelectedGuideExercise] = useState(null);

  // Application State backed by localStorage (versioned routines check so 6-day split updates seamlessly)
  const ROUTINES_VERSION = 'v2_ppl_6day';
  const [routines, setRoutines] = useState(() => {
    const savedVersion = loadFromStorage('routines_version', null);
    if (savedVersion !== ROUTINES_VERSION) {
      saveToStorage('routines_version', ROUTINES_VERSION);
      saveToStorage('routines', DEFAULT_ROUTINES);
      return DEFAULT_ROUTINES;
    }
    return loadFromStorage('routines', DEFAULT_ROUTINES);
  });
  const [records, setRecords] = useState(() =>
    loadFromStorage('records', INITIAL_PREVIOUS_RECORDS)
  );
  const [progressionData, setProgressionData] = useState(() =>
    loadFromStorage('progression', INITIAL_STRENGTH_PROGRESSION)
  );
  const [weightHistory, setWeightHistory] = useState(() =>
    loadFromStorage('weight_history', INITIAL_BODY_WEIGHT_HISTORY)
  );
  const [nutritionData, setNutritionData] = useState(() =>
    loadFromStorage('nutrition', INITIAL_NUTRITION_DATA)
  );
  const [workoutHistory, setWorkoutHistory] = useState(() =>
    loadFromStorage('workout_history', [])
  );
  const [activeSession, setActiveSession] = useState(() =>
    loadFromStorage('active_session', null)
  );

  // Sync state to localStorage
  useEffect(() => {
    saveToStorage('routines', routines);
  }, [routines]);

  useEffect(() => {
    saveToStorage('records', records);
  }, [records]);

  useEffect(() => {
    saveToStorage('progression', progressionData);
  }, [progressionData]);

  useEffect(() => {
    saveToStorage('weight_history', weightHistory);
  }, [weightHistory]);

  useEffect(() => {
    saveToStorage('nutrition', nutritionData);
  }, [nutritionData]);

  useEffect(() => {
    saveToStorage('workout_history', workoutHistory);
  }, [workoutHistory]);

  useEffect(() => {
    saveToStorage('active_session', activeSession);
  }, [activeSession]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSaveWorkout = (completedWorkout) => {
    const finishedWorkoutObj = {
      ...completedWorkout,
      completedAt: new Date().toISOString()
    };
    setWorkoutHistory((prev) => [finishedWorkoutObj, ...prev]);
  };

  const handleRecordPr = (exerciseName, weight, reps) => {
    const calculated = calculate1RM(weight, reps);
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate() < 10 ? '0' : ''}${now.getDate()}`;

    const newRecords = {
      ...records,
      [exerciseName]: {
        weight,
        reps,
        date: new Date().toISOString().split('T')[0],
        calculated1RM: calculated
      }
    };
    setRecords(newRecords);

    const existingList = progressionData[exerciseName] || [];
    const updatedProgression = {
      ...progressionData,
      [exerciseName]: [...existingList, { date: dateStr, oneRepMax: calculated }]
    };
    setProgressionData(updatedProgression);
  };

  const handleAddBodyWeight = (newEntry) => {
    setWeightHistory((prev) => [...prev, newEntry]);
  };

  const handleStartRoutineNow = (routine) => {
    const initialExercises = (routine.exercises || []).map((ex, idx) => ({
      id: `${ex.id}-${Date.now()}-${idx}`,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      customVideoUrl: ex.customVideoUrl || '',
      restSeconds: ex.restSeconds || 90,
      sets: Array.from({ length: ex.targetSets || 2 }).map((_, sIdx) => ({
        setNumber: sIdx + 1,
        weight: records[ex.name]?.weight || 50,
        reps: ex.defaultReps || 10,
        completed: false,
        isPr: false
      }))
    }));

    setActiveSession({
      id: `session-${Date.now()}`,
      name: routine.name,
      routineId: routine.id,
      startedAt: new Date().toISOString(),
      exercises: initialExercises
    });

    setActiveTab('workout');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F1115] text-slate-900 dark:text-white flex flex-col font-sans max-w-lg mx-auto shadow-2xl relative border-x border-slate-200/80 dark:border-[#2D333B]/40 transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0F1115]/90 backdrop-blur-md px-4 py-3 border-b border-slate-200/80 dark:border-[#2D333B]/70 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-500 via-blue-600 to-indigo-600 dark:from-[#A3E635] dark:to-emerald-400 flex items-center justify-center text-white dark:text-black font-black shadow-md shadow-blue-500/20 dark:shadow-[0_0_15px_rgba(163,230,53,0.35)]">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider uppercase text-slate-900 dark:text-white flex items-center gap-1 leading-none">
              REP<span className="text-teal-600 dark:text-[#A3E635]">KRAFT</span>
            </h1>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">
              Master Your Routine
            </span>
          </div>
        </div>

        {/* Right Header Actions: Theme Toggle & Storage Status */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#181B20] dark:hover:bg-[#22262E] border border-slate-200/80 dark:border-[#2D333B] text-xs font-bold text-slate-700 dark:text-slate-200 transition-all active:scale-95 cursor-pointer shadow-xs"
            title={`Switch to ${isDark ? 'Vibrant Light Mode' : 'Neon Dark Mode'}`}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px]">Dark</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="flex-1 px-4 py-4 overflow-y-auto">
        {activeTab === 'home' && (
          <HomeDashboardTab
            workoutHistory={workoutHistory}
            records={records}
            weightHistory={weightHistory}
            onAddBodyWeight={handleAddBodyWeight}
            onNavigateToTab={setActiveTab}
            todayRoutine={routines.find((r) => r.dayOfWeek === new Date().getDay()) || routines[0]}
            todayDayName={['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]}
            isRestDay={new Date().getDay() === 0}
          />
        )}

        {activeTab === 'workout' && (
          <WorkoutTab
            activeSession={activeSession}
            setActiveSession={setActiveSession}
            routines={routines}
            records={records}
            onSaveWorkout={handleSaveWorkout}
            onRecordPr={handleRecordPr}
            onOpenFormGuide={setSelectedGuideExercise}
          />
        )}

        {activeTab === 'exercises' && (
          <ExerciseLibraryTab
            onOpenFormGuide={setSelectedGuideExercise}
          />
        )}

        {activeTab === 'cardio' && (
          <CardioTab />
        )}

        {activeTab === 'routines' && (
          <RoutinesTab
            routines={routines}
            onUpdateRoutines={setRoutines}
            onStartRoutineNow={handleStartRoutineNow}
            onOpenFormGuide={setSelectedGuideExercise}
          />
        )}

        {activeTab === 'stats' && (
          <ProgressTab
            workoutHistory={workoutHistory}
            records={records}
            progressionData={progressionData}
            weightHistory={weightHistory}
            onAddBodyWeight={handleAddBodyWeight}
            isDark={isDark}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionTab
            nutritionData={nutritionData}
            onUpdateNutrition={setNutritionData}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            currentUser={currentUser}
            onLogout={handleLogout}
            onOpenUpgradeAuth={handleOpenUpgradeAuth}
            isDark={isDark}
            onToggleTheme={toggleTheme}
          />
        )}
      </main>

      {/* Floating AI Coach Assistant Drawer */}
      <FloatingAICoach />

      {/* Authentication Modal / Initial Launch Gate */}
      {showAuthModal && (
        <AuthModal
          onAuthSuccess={handleAuthSuccess}
          onClose={currentUser ? () => setShowAuthModal(false) : null}
          isUpgrade={isUpgradeAuth}
        />
      )}

      {/* Exercise Form Demonstration Modal */}
      {selectedGuideExercise && (
        <ExerciseFormModal
          exercise={selectedGuideExercise}
          onClose={() => setSelectedGuideExercise(null)}
        />
      )}

      {/* Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeWorkoutInProgress={Boolean(activeSession)}
      />
    </div>
  );
}
