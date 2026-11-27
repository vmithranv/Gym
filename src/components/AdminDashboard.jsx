import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Activity,
  Dumbbell,
  Flame,
  Download,
  RefreshCw,
  ArrowLeft,
  Search,
  ShieldCheck,
  Lock,
  Settings,
  Smartphone,
  Globe,
  Clock,
  Sparkles,
  Database,
  Trash2,
  BarChart3,
  Heart
} from 'lucide-react';
import {
  fetchAdminAnalytics,
  computeAdminMetrics,
  exportAdminCsvReport,
  seedDemoAnalyticsData,
  clearDemoAnalyticsData,
  getAdminSecurityConfig,
  saveLocalAdminSecurity,
  isAdminUnlocked,
  setAdminSessionUnlocked,
  verifyAdminPin
} from '../utils/analyticsService';
import { isFirebaseConfigured } from '../utils/authService';

const formatRelativeTime = (isoOrMs) => {
  const ts = typeof isoOrMs === 'number' ? isoOrMs : Date.parse(isoOrMs || '');
  if (!ts || Number.isNaN(ts)) return 'Unknown';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? '' : 's'} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr${diffHr === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
};

const formatActivitySentence = (evt) => {
  const actor = evt.userName || evt.userEmail || 'Athlete';
  const d = evt.details || {};
  switch (evt.eventType) {
    case 'workout_completed': {
      const name = d.workoutName || d.category || 'Workout';
      const vol = d.totalVolume ? ` (${Number(d.totalVolume).toLocaleString()} kg)` : '';
      return `${actor} completed ${name}${vol}`;
    }
    case 'workout_started':
      return `${actor} started ${d.workoutName || d.category || 'a workout'}`;
    case 'cardio_logged':
      return `${actor} logged cardio: ${d.title || 'Session'} (${d.durationMinutes || 0} min)`;
    case 'food_logged':
      return `${actor} logged nutrition: ${d.mealName || 'Meal'}${d.calories ? ` (${d.calories} kcal)` : ''}`;
    case 'ai_coach_asked':
      return `${actor} asked AI Coach${d.question ? `: "${d.question}"` : ''}`;
    case 'reel_link_saved':
      return `${actor} saved a form reel for ${d.exerciseName || 'an exercise'}`;
    case 'exercise_library_viewed':
      return `${actor} browsed ${d.surface || 'Exercise Library'}`;
    case 'user_login':
      return `${actor} signed in via ${(d.authProvider || evt.authProvider || 'web').toUpperCase()}`;
    case 'app_visit':
      return `${actor} opened RepKraft on ${evt.deviceLabel || (evt.platform === 'android_pwa' ? 'Android PWA' : 'Web')}`;
    default:
      return `${actor} triggered ${evt.eventType}`;
  }
};

export default function AdminDashboard({ currentUser, onBackToApp }) {
  const [unlocked, setUnlocked] = useState(() => isAdminUnlocked(currentUser));
  const [securityConfig, setSecurityConfig] = useState(() => getAdminSecurityConfig());

  // Admin Gate form states
  const [pinInput, setPinInput] = useState('');
  const [setupPinInput, setSetupPinInput] = useState('');
  const [setupEmailInput, setSetupEmailInput] = useState(currentUser?.email || '');
  const [authError, setAuthError] = useState('');

  // Analytics state
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [dataSource, setDataSource] = useState('local');
  const [loading, setLoading] = useState(false);

  // Filters & Settings drawer
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChip, setFilterChip] = useState('All'); // All | Google | Email | Guest | Web | Android PWA
  const [showSettings, setShowSettings] = useState(false);
  const [newPinSetting, setNewPinSetting] = useState('');
  const [newEmailSetting, setNewEmailSetting] = useState(() => getAdminSecurityConfig().adminEmail || '');
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  const loadAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminAnalytics();
      setUsers(res.users);
      setLogs(res.logs);
      setDataSource(res.source);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (unlocked) {
      loadAnalyticsData();
    }
  }, [unlocked, loadAnalyticsData]);

  // First-time local admin PIN setup OR existing PIN verification
  const handleUnlockSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    if (!securityConfig.hasCustomPin) {
      if (!setupPinInput.trim() || setupPinInput.trim().length < 4) {
        setAuthError('Create an Admin PIN of at least 4 characters.');
        return;
      }
      const updated = saveLocalAdminSecurity({
        pin: setupPinInput.trim(),
        adminEmail: setupEmailInput.trim()
      });
      setSecurityConfig(getAdminSecurityConfig());
      setNewEmailSetting(updated.adminEmail || '');
      setAdminSessionUnlocked(true);
      setUnlocked(true);
      return;
    }

    if (verifyAdminPin(pinInput)) {
      setAdminSessionUnlocked(true);
      setUnlocked(true);
      setPinInput('');
    } else {
      setAuthError('Incorrect Admin PIN. Check VITE_ADMIN_PIN or your saved Admin PIN.');
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const updates = {};
    if (!securityConfig.hasEnvAdminEmail && newEmailSetting.trim()) {
      updates.adminEmail = newEmailSetting.trim();
    }
    if (newPinSetting.trim()) {
      if (newPinSetting.trim().length < 4) {
        setSettingsSavedMsg('PIN must be at least 4 characters.');
        return;
      }
      updates.pin = newPinSetting.trim();
    }
    saveLocalAdminSecurity(updates);
    setSecurityConfig(getAdminSecurityConfig());
    setNewPinSetting('');
    setSettingsSavedMsg('Admin security preferences updated!');
    setTimeout(() => setSettingsSavedMsg(''), 2500);
  };

  const handleSeedDemo = () => {
    seedDemoAnalyticsData();
    loadAnalyticsData();
  };

  const handleClearDemo = () => {
    clearDemoAnalyticsData();
    loadAnalyticsData();
  };

  const handleLockDashboard = () => {
    setAdminSessionUnlocked(false);
    setUnlocked(false);
    setShowSettings(false);
  };

  const metrics = useMemo(() => computeAdminMetrics(users, logs), [users, logs]);
  const maxFeatureCount = useMemo(
    () => Math.max(1, ...metrics.featurePopularity.map((f) => f.count)),
    [metrics]
  );

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      const matchQuery =
        !q ||
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.uid || '').toLowerCase().includes(q);
      if (!matchQuery) return false;

      switch (filterChip) {
        case 'Google':
          return u.authProvider === 'google';
        case 'Email':
          return u.authProvider === 'email';
        case 'Guest':
          return u.authProvider === 'guest';
        case 'Web':
          return u.platform !== 'android_pwa';
        case 'Android PWA':
          return u.platform === 'android_pwa';
        default:
          return true;
      }
    });
  }, [users, searchQuery, filterChip]);

  // ───────────────────────────────────────────────────────────────────────────
  // ADMIN SECURITY GATE (IF NOT AUTHORIZED / UNLOCKED)
  // ───────────────────────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] dark:bg-[#0F1115] text-[#0F172A] dark:text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="rounded-2xl hero-gradient text-white p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider hero-pill-badge text-white mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Protected Admin Portal
            </span>
            <h1 className="text-2xl font-black tracking-tight">RepKraft Admin Analytics</h1>
            <p className="text-blue-100 text-xs mt-1">
              {securityConfig.adminEmail
                ? `Restricted to ${securityConfig.adminEmail} or authorized Admin PIN.`
                : 'Play Store & Web Telemetry. Set or enter your Admin PIN to continue.'}
            </p>
          </div>

          <form onSubmit={handleUnlockSubmit} className="repkraft-card rounded-2xl p-5 space-y-4">
            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {authError}
              </div>
            )}

            {!securityConfig.hasCustomPin ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl peach-gradient border border-orange-200/70 dark:border-orange-500/20 text-[11px] text-orange-900 dark:text-orange-200 font-medium leading-relaxed">
                  First-time Admin Setup on this device: choose your Admin PIN (and optional Admin Email) to lock this portal cleanly. You can also set <code>VITE_ADMIN_EMAIL</code> in Vercel.
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Admin Email (Optional Local Match)
                  </label>
                  <input
                    type="email"
                    placeholder="admin@gmail.com"
                    value={setupEmailInput}
                    onChange={(e) => setSetupEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1F5F9] dark:bg-[#22262E] border border-slate-200 dark:border-[#2D333B] text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Create Admin PIN (4+ characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      placeholder="Choose Admin PIN"
                      value={setupPinInput}
                      onChange={(e) => setSetupPinInput(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F1F5F9] dark:bg-[#22262E] border border-slate-200 dark:border-[#2D333B] text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Enter Admin PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    autoFocus
                    placeholder="Enter configured Admin PIN"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F1F5F9] dark:bg-[#22262E] border border-slate-200 dark:border-[#2D333B] text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onBackToApp}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#22262E] text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md cursor-pointer"
              >
                {securityConfig.hasCustomPin ? 'Unlock Admin Dashboard' : 'Save PIN & Open Dashboard'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // UNLOCKED ADMIN ANALYTICS DASHBOARD
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F4F7FA] dark:bg-[#0F1115] text-[#0F172A] dark:text-white pb-16">
      <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        {/* 1. SIGNATURE HERO HEADER */}
        <div className="relative overflow-hidden rounded-2xl hero-gradient text-white p-5 sm:p-6 shadow-xl border border-teal-500/20">
          <div className="absolute top-0 right-0 w-52 h-52 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider hero-pill-badge text-white">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> RepKraft Telemetry
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold hero-pill-badge text-emerald-200 border border-white/20">
                  <Database className="w-3 h-3" />
                  {dataSource === 'firestore' && isFirebaseConfigured
                    ? 'Firestore Live Cloud'
                    : 'Local Telemetry Mode'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Admin Analytics Dashboard
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm font-medium mt-1">
                Monitor users, daily active engagement, PPL popularity & Play Store readiness.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onBackToApp}
                className="px-3 py-2 rounded-xl hero-pill-badge hover:bg-white/30 text-white border border-white/25 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> App
              </button>
              <button
                type="button"
                onClick={loadAnalyticsData}
                className="px-3 py-2 rounded-xl hero-pill-badge hover:bg-white/30 text-white border border-white/25 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <button
                type="button"
                onClick={() => exportAdminCsvReport(users, logs, metrics)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV Report
              </button>
              <button
                type="button"
                onClick={() => setShowSettings((s) => !s)}
                className="p-2 rounded-xl hero-pill-badge hover:bg-white/30 text-white border border-white/25 cursor-pointer"
                title="Admin Settings & Sample Data"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Optional Collapsible Settings / Sample Dataset Controls */}
        {showSettings && (
          <div className="repkraft-card rounded-2xl p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 dark:border-[#2D333B] pb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-teal-600 dark:text-[#A3E635]" /> Admin Security & Preview Dataset Controls
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Manage Admin PIN, Admin Email, or load sample multi-user records to preview charts.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLockDashboard}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" /> Lock Admin
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form onSubmit={handleSaveSettings} className="space-y-2.5 text-xs">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Security Settings
                </label>
                <input
                  type="email"
                  disabled={securityConfig.hasEnvAdminEmail}
                  placeholder="Admin Email (or set VITE_ADMIN_EMAIL)"
                  value={newEmailSetting}
                  onChange={(e) => setNewEmailSetting(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#22262E] border border-slate-200 dark:border-[#2D333B] text-xs font-medium disabled:opacity-60"
                />
                <input
                  type="password"
                  placeholder="Change Admin PIN (4+ characters)"
                  value={newPinSetting}
                  onChange={(e) => setNewPinSetting(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#22262E] border border-slate-200 dark:border-[#2D333B] text-xs font-mono"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Save Security Settings
                  </button>
                  {settingsSavedMsg && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-[#A3E635]">
                      {settingsSavedMsg}
                    </span>
                  )}
                </div>
              </form>

              <div className="space-y-2.5 text-xs">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Testing & Sample Multi-User Data
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  All real app visits, workouts, cardio, meals, AI chats, and saved reels are tracked automatically. For multi-user preview testing, you can populate or clear demo entries:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSeedDemo}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5" /> Load Demo Dataset
                  </button>
                  <button
                    type="button"
                    onClick={handleClearDemo}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#22262E] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Demo Entries
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. TOP KPI SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* KPI 1: Total Users */}
          <div className="repkraft-card rounded-2xl p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.05em] text-[#64748B] dark:text-slate-400">
                TOTAL USERS
              </span>
              <span className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-600 dark:text-[#A3E635] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#0F172A] dark:text-white leading-none">
              {metrics.totalUsers}
            </div>
            <div className="flex flex-wrap gap-1 text-[10px] font-bold">
              <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-sky-400">
                Google: {metrics.googleUsers}
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-[#A3E635]">
                Email: {metrics.emailUsers}
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-[#22262E] text-slate-600 dark:text-slate-300">
                Guest: {metrics.guestUsers}
              </span>
            </div>
          </div>

          {/* KPI 2: Daily Active Users */}
          <div className="peach-gradient border border-orange-200/70 dark:border-orange-500/20 rounded-2xl p-4 shadow-[0_4px_20px_rgba(15,23,42,0.05)] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.05em] text-orange-800 dark:text-orange-300">
                DAILY ACTIVE
              </span>
              <span className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Flame className="w-4 h-4 fill-current" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-orange-950 dark:text-white leading-none">
              {metrics.dauToday}
            </div>
            <div className="text-[11px] font-bold text-orange-800/80 dark:text-orange-200/80">
              Today • <span className="font-black">Last 7d: {metrics.activeLast7Days}</span>
            </div>
          </div>

          {/* KPI 3: Total Workouts Completed */}
          <div className="repkraft-card rounded-2xl p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.05em] text-[#64748B] dark:text-slate-400">
                WORKOUTS
              </span>
              <span className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-sky-400 flex items-center justify-center">
                <Dumbbell className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#0F172A] dark:text-white leading-none">
              {metrics.totalWorkouts}
            </div>
            <div className="text-[11px] font-bold text-blue-600 dark:text-sky-400">
              {metrics.totalVolumeKg > 1000
                ? `${(metrics.totalVolumeKg / 1000).toFixed(1)}k kg lifted`
                : `${metrics.totalVolumeKg} kg lifted`}
            </div>
          </div>

          {/* KPI 4: Cardio & Nutrition Logs */}
          <div className="repkraft-card rounded-2xl p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.05em] text-[#64748B] dark:text-slate-400">
                CARDIO & FOOD
              </span>
              <span className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-[#A3E635] flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#0F172A] dark:text-white leading-none">
              {metrics.totalCardioLogs + metrics.totalFoodLogs}
            </div>
            <div className="flex gap-1.5 text-[10px] font-bold">
              <span className="px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400">
                Cardio: {metrics.totalCardioLogs}
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-[#A3E635]">
                Food: {metrics.totalFoodLogs}
              </span>
            </div>
          </div>
        </div>

        {/* 3. ENGAGEMENT & FEATURE POPULARITY CHART + PLATFORM SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 repkraft-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-[#0F172A] dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-teal-600 dark:text-[#A3E635]" />
                  Engagement & Feature Popularity
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Push vs Pull vs Legs workouts, Cardio, Nutrition, Library & AI Coach usage
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {metrics.featurePopularity.map((item) => {
                const pct = Math.round((item.count / maxFeatureCount) * 100);
                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
                      <span className="font-mono font-black text-slate-900 dark:text-white">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#F1F5F9] dark:bg-[#22262E] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.count === 0 ? 3 : Math.max(6, pct)}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Platform & Auth Method Breakdown */}
          <div className="repkraft-card rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#0F172A] dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                Platform & Auth Split
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#F1F5F9] dark:bg-[#22262E] flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Globe className="w-4 h-4 text-blue-500" /> Web Browser
                  </span>
                  <span className="font-mono font-black text-slate-900 dark:text-white">
                    {metrics.webUsers}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#F1F5F9] dark:bg-[#22262E] flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Smartphone className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" /> Android / PWA App
                  </span>
                  <span className="font-mono font-black text-slate-900 dark:text-white">
                    {metrics.androidPwaUsers}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/25 text-[11px] text-teal-900 dark:text-teal-200 leading-relaxed font-medium">
              Ready for Play Store TWA deployment: user visits automatically classify <code>android_pwa</code> vs <code>web</code> platform metrics.
            </div>
          </div>
        </div>

        {/* 4. USER DIRECTORY & LIVE ACTIVITY FEED */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* User Directory (2 cols) */}
          <div className="lg:col-span-2 repkraft-card rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#0F172A] dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600 dark:text-[#A3E635]" />
                User Directory ({filteredUsers.length})
              </h2>

              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F1F5F9] dark:bg-[#22262E] border border-slate-200 dark:border-[#2D333B] text-xs font-medium outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Google', 'Email', 'Guest', 'Web', 'Android PWA'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setFilterChip(chip)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    filterChip === chip
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-[#F1F5F9] dark:bg-[#22262E] text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#2D333B] text-[10px] font-black uppercase tracking-wider text-[#64748B] dark:text-slate-400">
                    <th className="py-2 pr-3">Athlete</th>
                    <th className="py-2 px-2">Sign-In</th>
                    <th className="py-2 px-2">Workouts</th>
                    <th className="py-2 px-2">Platform</th>
                    <th className="py-2 pl-2 text-right">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#2D333B]/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-50/70 dark:hover:bg-[#22262E]/40 transition-colors">
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl hero-gradient text-white font-black text-[11px] flex items-center justify-center shrink-0 uppercase">
                            {(u.name || 'G').charAt(0)}
                          </span>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[140px]">
                              {u.name || 'Guest Lifter'}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                              {u.email || 'Guest Visitor'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            u.authProvider === 'google'
                              ? 'bg-blue-500/15 text-blue-600 dark:text-sky-400'
                              : u.authProvider === 'email'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-[#A3E635]'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {u.authProvider || 'guest'}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-mono font-black text-slate-800 dark:text-white">
                        {u.workoutsCompleted || 0}
                      </td>
                      <td className="py-2.5 px-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          {u.platform === 'android_pwa' ? (
                            <>
                              <Smartphone className="w-3 h-3 text-emerald-500" /> Mobile
                            </>
                          ) : (
                            <>
                              <Globe className="w-3 h-3 text-blue-500" /> Web
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-2.5 pl-2 text-right text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap" title={u.lastActiveAt}>
                        {formatRelativeTime(u.lastActiveAt)}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                        No matching users found. Use the app or click Settings → Load Demo Dataset to preview.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Recent Activity Feed */}
          <div className="repkraft-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#0F172A] dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-500" />
                Recent Activity Feed
              </h2>
              <span className="text-[10px] font-bold text-slate-400">{logs.length} events</span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {logs.slice(0, 40).map((evt, idx) => (
                <div
                  key={evt.id || idx}
                  className="p-3 rounded-xl bg-[#F1F5F9] dark:bg-[#22262E] border border-slate-200/70 dark:border-[#2D333B] text-xs space-y-1"
                >
                  <p className="font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                    {formatActivitySentence(evt)}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="uppercase font-bold">{evt.eventType}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatRelativeTime(evt.timestamp || evt.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  No activity logged yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
