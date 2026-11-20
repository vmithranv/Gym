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
import WorkoutTab from './components/WorkoutTab';
import RoutinesTab from './components/RoutinesTab';
import ProgressTab from './components/ProgressTab';
import NutritionTab from './components/NutritionTab';
import { Dumbbell, ShieldCheck, WifiOff } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('workout');

  // Application State backed by localStorage
  const [routines, setRoutines] = useState(() =>
    loadFromStorage('routines', DEFAULT_ROUTINES)
  );
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

  // Sync to localStorage
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

  // Handler when user finishes a workout
  const handleSaveWorkout = (completedWorkout) => {
    const finishedWorkoutObj = {
      ...completedWorkout,
      completedAt: new Date().toISOString()
    };
    setWorkoutHistory((prev) => [finishedWorkoutObj, ...prev]);
  };

  // Handler when a new PR is recorded
  const handleRecordPr = (exerciseName, weight, reps) => {
    const calculated = calculate1RM(weight, reps);
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate() < 10 ? '0' : ''}${now.getDate()}`;

    // Update records dictionary
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

    // Update progression history for chart
    const existingList = progressionData[exerciseName] || [];
    const updatedProgression = {
      ...progressionData,
      [exerciseName]: [...existingList, { date: dateStr, oneRepMax: calculated }]
    };
    setProgressionData(updatedProgression);
  };

  // Handler for adding a new body weight record
  const handleAddBodyWeight = (newEntry) => {
    setWeightHistory((prev) => [...prev, newEntry]);
  };

  // Launch a routine from Routines tab into active workout
  const handleStartRoutineNow = (routine) => {
    const initialExercises = (routine.exercises || []).map((ex, idx) => ({
      id: `${ex.id}-${Date.now()}-${idx}`,
      name: ex.name,
      sets: Array.from({ length: ex.targetSets || 3 }).map((_, sIdx) => ({
        setNumber: sIdx + 1,
        weight: records[ex.name]?.weight || 60,
        reps: ex.defaultReps || 8,
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
    <div className="min-h-screen bg-[#0F1115] text-white flex flex-col font-sans max-w-lg mx-auto shadow-2xl relative border-x border-[#2D333B]/40">
      {/* Top Mobile App Header */}
      <header className="sticky top-0 z-30 bg-[#0F1115]/95 backdrop-blur-md px-4 py-3 border-b border-[#2D333B]/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A3E635] to-lime-500 flex items-center justify-center text-black font-black shadow-[0_0_15px_rgba(163,230,53,0.35)]">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider uppercase text-white flex items-center gap-1.5 leading-none">
              IRON<span className="text-[#A3E635]">PULSE</span>
            </h1>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
              Pro Gym Companion
            </span>
          </div>
        </div>

        {/* Offline & PWA Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181B20] border border-[#2D333B] text-[11px] text-slate-300 font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-pulse" />
          <span>Local Storage</span>
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="flex-1 px-4 py-4 overflow-y-auto">
        {activeTab === 'workout' && (
          <WorkoutTab
            activeSession={activeSession}
            setActiveSession={setActiveSession}
            routines={routines}
            records={records}
            onSaveWorkout={handleSaveWorkout}
            onRecordPr={handleRecordPr}
          />
        )}

        {activeTab === 'routines' && (
          <RoutinesTab
            routines={routines}
            onUpdateRoutines={setRoutines}
            onStartRoutineNow={handleStartRoutineNow}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressTab
            workoutHistory={workoutHistory}
            records={records}
            progressionData={progressionData}
            weightHistory={weightHistory}
            onAddBodyWeight={handleAddBodyWeight}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionTab
            nutritionData={nutritionData}
            onUpdateNutrition={setNutritionData}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeWorkoutInProgress={Boolean(activeSession)}
      />
    </div>
  );
}
