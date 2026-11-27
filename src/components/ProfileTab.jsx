import React, { useState } from 'react';
import {
  User,
  LogOut,
  Dumbbell,
  Sun,
  Moon,
  Download,
  Upload,
  Check,
  Sparkles,
  Link,
  ShieldCheck,
  BarChart3,
  Phone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { updateUserDisplayName } from '../utils/authService';
import {
  getAdminSecurityConfig,
  isAdminEmailMatch,
  isAdminUnlocked,
  upsertAnalyticsUser
} from '../utils/analyticsService';

export default function ProfileTab({
  currentUser,
  weightHistory = [],
  onAddBodyWeight,
  onUserUpdated,
  onLogout,
  onOpenUpgradeAuth,
  onOpenAdminDashboard,
  isDark,
  onToggleTheme
}) {
  const latestWeightEntry = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null;
  const latestWeightVal =
    typeof latestWeightEntry === 'object' && latestWeightEntry !== null
      ? latestWeightEntry.weight
      : latestWeightEntry;

  // Fitness Profile state persisted in localStorage
  const [profile, setProfile] = useState(() =>
    loadFromStorage('repkraft_user_profile_data', {
      displayName: currentUser?.displayName || 'Mithran',
      age: '24',
      heightCm: '160',
      weightKg: String(latestWeightVal ?? '65'),
      experience: '1–3 Months (Beginner)',
      wakeUpTime: '5:00 AM',
      gymTime: '6:00 AM',
      primaryGoal: 'Overall Stronger & Muscular Physique',
      weightUnit: 'kg',
      phone: ''
    })
  );

  const displayedWeightKg = latestWeightVal !== undefined && latestWeightVal !== null ? String(latestWeightVal) : profile.weightKg;

  const [isEditing, setIsEditing] = useState(false);
  const [saveNotice, setSaveNotice] = useState(false);
  const [phoneInput, setPhoneInput] = useState(() => profile.phone || '');
  const [phoneSavedNotice, setPhoneSavedNotice] = useState(false);

  const handleSavePhoneQuick = (e) => {
    e.preventDefault();
    const cleanPhone = (phoneInput || '').trim().slice(0, 32);
    const updatedProfile = { ...profile, phone: cleanPhone };
    setProfile(updatedProfile);
    saveToStorage('repkraft_user_profile_data', updatedProfile);
    upsertAnalyticsUser(currentUser, { phone: cleanPhone });
    setPhoneSavedNotice(true);
    setTimeout(() => setPhoneSavedNotice(false), 2500);
  };

  // Handle Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const cleanPhone = (profile.phone || '').trim().slice(0, 32);
    const updatedProfile = { ...profile, phone: cleanPhone };
    setProfile(updatedProfile);
    setPhoneInput(cleanPhone);
    saveToStorage('repkraft_user_profile_data', updatedProfile);

    const parsedWeight = parseFloat(profile.weightKg);
    if (onAddBodyWeight && !Number.isNaN(parsedWeight) && parsedWeight > 0 && parsedWeight !== Number(latestWeightVal)) {
      onAddBodyWeight(parsedWeight);
    }

    let latestUser = currentUser;
    if (profile.displayName?.trim() && currentUser && !currentUser.isGuest) {
      const updatedUser = await updateUserDisplayName(profile.displayName.trim());
      if (updatedUser) {
        latestUser = updatedUser;
        if (onUserUpdated) onUserUpdated(updatedUser);
      }
    }
    upsertAnalyticsUser(latestUser, { phone: cleanPhone });

    setIsEditing(false);
    setSaveNotice(true);
    try {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    } catch {}
    setTimeout(() => setSaveNotice(false), 2500);
  };

  // Restore / Import Backup JSON file
  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result || '{}');
        if (parsed.profile) {
          saveToStorage('repkraft_user_profile_data', parsed.profile);
          setProfile(parsed.profile);
        }
        if (Array.isArray(parsed.routines)) saveToStorage('routines', parsed.routines);
        if (parsed.records) saveToStorage('records', parsed.records);
        if (parsed.progression) saveToStorage('progression', parsed.progression);
        if (Array.isArray(parsed.weightHistory)) saveToStorage('weight_history', parsed.weightHistory);
        if (Array.isArray(parsed.workoutHistory)) saveToStorage('workout_history', parsed.workoutHistory);
        if (Array.isArray(parsed.cardioLogs)) saveToStorage('cardio_logs', parsed.cardioLogs);
        if (parsed.savedReelLinks && typeof parsed.savedReelLinks === 'object') {
          saveToStorage('saved_reel_links', parsed.savedReelLinks);
        }
        alert('Backup restored successfully! Refreshing app data...');
        window.location.reload();
      } catch {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Export / Backup all localStorage data to JSON file
  const handleExportData = () => {
    try {
      const dataBackup = {
        exportedAt: new Date().toISOString(),
        user: currentUser,
        profile: profile,
        routines: loadFromStorage('routines', []),
        records: loadFromStorage('records', {}),
        progression: loadFromStorage('progression', {}),
        weightHistory: loadFromStorage('weight_history', []),
        workoutHistory: loadFromStorage('workout_history', []),
        cardioLogs: loadFromStorage('cardio_logs', []),
        savedReelLinks: loadFromStorage('saved_reel_links', {})
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataBackup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `RepKraft_Backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Failed to export data: ' + err.message);
    }
  };

  const isGuest = !currentUser || currentUser.isGuest;

  const adminConfig = getAdminSecurityConfig();
  const canShowAdminButton =
    onOpenAdminDashboard &&
    (isAdminEmailMatch(currentUser) ||
      isAdminUnlocked(currentUser) ||
      (!adminConfig.hasEnvAdminEmail && !adminConfig.adminEmail && currentUser && !currentUser.isGuest));

  return (
    <div className="space-y-4 pb-32 animate-in fade-in duration-200">
      {/* Signature Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl hero-gradient text-white p-5 shadow-xl border border-teal-500/20">
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider hero-pill-badge text-white mb-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> Account & Preferences
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <User className="w-6 h-6 text-white" />
              Athlete Profile
            </h2>
            <p className="text-blue-100 text-xs font-medium mt-1">
              Manage your personal fitness metrics, account details, and workout backups.
            </p>
          </div>
          {isGuest && (
            <button
              onClick={onOpenUpgradeAuth}
              className="hero-pill-badge hover:bg-white/30 text-white border border-white/25 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 shrink-0 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <Link className="w-3.5 h-3.5 text-emerald-300" /> Link Account
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. USER CARD (AVATAR, NAME, EMAIL, LOGOUT)
         ───────────────────────────────────────────────────────────── */}
      <div className="repkraft-card rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Avatar Photo or Initial */}
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Profile"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-500 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl hero-gradient text-white font-black text-xl flex items-center justify-center shadow-md">
                {(currentUser?.displayName || profile.displayName || 'A').charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-slate-900 dark:text-white leading-tight">
                  {currentUser?.displayName || profile.displayName || 'RepKraft Lifter'}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    isGuest
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-[#A3E635] border border-emerald-500/30'
                  }`}
                >
                  {isGuest ? 'Guest' : 'Verified'}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                {currentUser?.email ||
                  (currentUser?.isAnonymous
                    ? 'Cloud Guest Account (Firebase Anonymous Sync)'
                    : 'Offline Guest Account (Data in localStorage)')}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#22262E] dark:hover:bg-[#2D333B] text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Guest Upgrade Banner */}
        {isGuest && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-indigo-500/10 border border-teal-500/25 flex items-center justify-between text-xs">
            <div>
              <strong className="text-teal-900 dark:text-teal-300 font-bold block">
                Upgrade from Guest:
              </strong>
              <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                Link Google or Email to upgrade your guest account without losing workout history.
              </span>
            </div>
              <button
                onClick={onOpenUpgradeAuth}
                className="px-3 py-1.5 rounded-xl bg-teal-600 dark:bg-[#A3E635] text-white dark:text-black font-extrabold text-[10px] uppercase shrink-0 shadow-xs active:scale-95 transition-all"
              >
                Sign In
              </button>
            </div>
          )}

        {/* Optional Phone / WhatsApp Number (Quick Save & Firestore Sync) */}
        <form
          onSubmit={handleSavePhoneQuick}
          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#22262E]/60 border border-slate-100 dark:border-[#2D333B] space-y-2 text-xs"
        >
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="profile-phone-input"
              className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-[#A3E635]" />
              Phone / WhatsApp Number
            </label>
            {phoneSavedNotice && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-[#A3E635] flex items-center gap-0.5 animate-in fade-in">
                <Check className="w-3 h-3 stroke-[3]" /> Saved!
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              id="profile-phone-input"
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#181B20] border border-slate-200 dark:border-[#2D333B] text-slate-900 dark:text-white font-mono text-xs outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] uppercase tracking-wider cursor-pointer active:scale-95 transition-all shrink-0"
            >
              Save
            </button>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Optional — saved to your personal fitness profile
          </p>
        </form>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FITNESS & BODY DETAILS CARD (EDITABLE & SAVED)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-teal-600 dark:text-[#A3E635]" />
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Body & Gym Schedule Details
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {saveNotice && (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-[#A3E635] flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Saved!
              </span>
            )}
            <button
              onClick={() => {
                if (!isEditing) {
                  setProfile((prev) => ({
                    ...prev,
                    ...(currentUser && !currentUser.isGuest && currentUser.displayName
                      ? { displayName: currentUser.displayName }
                      : {}),
                    weightKg: displayedWeightKg
                  }));
                }
                setIsEditing(!isEditing);
              }}
              className="text-xs font-bold text-teal-600 dark:text-[#A3E635] hover:underline cursor-pointer"
            >
              {isEditing ? 'Cancel' : 'Edit Details'}
            </button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#22262E] border border-slate-200 dark:border-[#2D333B] font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.weightKg}
                  onChange={(e) => setProfile({ ...profile, weightKg: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] border border-slate-200 dark:border-[#2D333B] font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={profile.heightCm}
                  onChange={(e) => setProfile({ ...profile, heightCm: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] border border-slate-200 dark:border-[#2D333B] font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] border border-slate-200 dark:border-[#2D333B] font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Experience Level
                </label>
                <select
                  value={profile.experience}
                  onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] border border-slate-200 dark:border-[#2D333B] font-bold"
                >
                  <option value="1–3 Months (Beginner)">1–3 Months (Beginner)</option>
                  <option value="3–6 Months (Intermediate)">3–6 Months (Intermediate)</option>
                  <option value="6–12 Months">6–12 Months</option>
                  <option value="1+ Year (Advanced)">1+ Year (Advanced)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Wake-Up Time
                </label>
                <input
                  type="text"
                  value={profile.wakeUpTime}
                  onChange={(e) => setProfile({ ...profile, wakeUpTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] border border-slate-200 dark:border-[#2D333B] font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Gym Time
                </label>
                <input
                  type="text"
                  value={profile.gymTime}
                  onChange={(e) => setProfile({ ...profile, gymTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] border border-slate-200 dark:border-[#2D333B] font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Primary Goal
              </label>
              <input
                type="text"
                value={profile.primaryGoal}
                onChange={(e) => setProfile({ ...profile, primaryGoal: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#22262E] border border-slate-200 dark:border-[#2D333B] font-bold"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#22262E] font-bold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase text-xs shadow-md cursor-pointer"
              >
                Save Details
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#22262E]/60 border border-slate-100 dark:border-[#2D333B]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Weight</span>
              <span className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                {displayedWeightKg} kg
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#22262E]/60 border border-slate-100 dark:border-[#2D333B]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Height</span>
              <span className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                {profile.heightCm} cm
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#22262E]/60 border border-slate-100 dark:border-[#2D333B]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Timetable</span>
              <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">
                {profile.wakeUpTime} Wake • {profile.gymTime} Gym
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#22262E]/60 border border-slate-100 dark:border-[#2D333B]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Experience</span>
              <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">
                {profile.experience}
              </span>
            </div>

            <div className="col-span-2 p-3 rounded-2xl bg-slate-50 dark:bg-[#22262E]/60 border border-slate-100 dark:border-[#2D333B]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary Fitness Goal</span>
              <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 block">
                🎯 {profile.primaryGoal}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. APP PREFERENCES & DATA BACKUP / EXPORT
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#181B20] border border-slate-200/80 dark:border-[#2D333B] rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">
          Preferences & Data Protection
        </h3>

        {/* Theme Mode Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#22262E]/60 border border-slate-100 dark:border-[#2D333B] text-xs">
          <div className="flex items-center gap-2.5">
            {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Theme: {isDark ? 'Neon Dark Mode' : 'Vibrant Light Mode'}
            </span>
          </div>
          <button
            onClick={onToggleTheme}
            className="px-3 py-1 rounded-xl bg-white dark:bg-[#181B20] border border-slate-200 dark:border-[#2D333B] font-bold text-[11px] shadow-2xs cursor-pointer"
          >
            Switch
          </button>
        </div>

        {/* Export / Backup Data Button */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#22262E]/60 border border-slate-100 dark:border-[#2D333B] text-xs">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Backup / Export Data (JSON)
            </span>
            <span className="text-[10px] text-slate-400">
              Save your workouts, PRs, and reel bookmarks to an offline file.
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <label className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#22262E] dark:hover:bg-[#2D333B] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#2D333B] font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>Restore</span>
              <input type="file" accept=".json,application/json" onChange={handleImportData} className="hidden" />
            </label>
            <button
              onClick={handleExportData}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Hidden / Protected Admin Analytics Portal (Visible only for Admin / Authorized setup) */}
        {canShowAdminButton && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-indigo-500/10 border border-teal-500/25 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-[#A3E635] shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-slate-900 dark:text-white block">
                  Admin Analytics Portal
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isAdminEmailMatch(currentUser)
                    ? 'Verified Admin Account — View live user & feature telemetry.'
                    : 'Protected by configurable Admin PIN & VITE_ADMIN_EMAIL.'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenAdminDashboard}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs active:scale-95 transition-all"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Admin Analytics</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
