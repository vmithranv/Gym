// Centralized RepKraft User & Feature Engagement Analytics Service
// Mirrors live events to Firebase Firestore (`users` & `activity_logs` collections)
// while always storing lightweight local telemetry in localStorage so offline/preview mode never breaks.

import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { getFirebaseApp, isFirebaseConfigured } from './authService';
import { loadFromStorage, saveToStorage } from './storage';

const ANALYTICS_USERS_KEY = 'repkraft_analytics_users';
const ANALYTICS_LOGS_KEY = 'repkraft_analytics_logs';
const DEVICE_ID_KEY = 'repkraft_device_uid';
const ADMIN_CONFIG_KEY = 'repkraft_admin_security';
const ADMIN_SESSION_KEY = 'repkraft_admin_unlocked';

export const ENV_ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase();
export const ENV_ADMIN_PIN = (import.meta.env.VITE_ADMIN_PIN || '').trim();

let firestoreDb = null;
const getDb = () => {
  if (!isFirebaseConfigured) return null;
  if (firestoreDb) return firestoreDb;
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    firestoreDb = getFirestore(app);
    return firestoreDb;
  } catch (err) {
    console.warn('Firestore initialization failed, using local analytics:', err);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM & DEVICE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
export const getOrCreateDeviceId = () => {
  const existing = loadFromStorage(DEVICE_ID_KEY, null);
  if (existing) return existing;
  const generated = `dev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  saveToStorage(DEVICE_ID_KEY, generated);
  return generated;
};

export const detectPlatform = () => {
  if (typeof window === 'undefined') return 'web';
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator?.standalone === true;
  const ua = (window.navigator?.userAgent || '').toLowerCase();
  const isAndroid = /android/.test(ua);
  const isTwaOrWebView = /\bwv\b|; wv\)/.test(ua) || document.referrer.startsWith('android-app://');
  if (isTwaOrWebView || (isAndroid && isStandalone)) {
    return 'android_pwa';
  }
  return 'web';
};

export const detectDeviceLabel = () => {
  if (typeof window === 'undefined') return 'Web Browser';
  const ua = (window.navigator?.userAgent || '').toLowerCase();
  const platform = detectPlatform();
  if (platform === 'android_pwa') return 'Android PWA';
  if (/android/.test(ua)) return 'Android Browser';
  if (/iphone|ipad|ipod/.test(ua)) {
    return window.navigator?.standalone ? 'iOS PWA' : 'iOS Safari';
  }
  if (/edg\//.test(ua)) return 'Desktop Edge';
  if (/chrome/.test(ua)) return 'Desktop Chrome';
  if (/firefox/.test(ua)) return 'Desktop Firefox';
  return 'Web Browser';
};

export const normalizeAuthProvider = (provider, isGuest) => {
  if (isGuest || !provider || provider === 'guest') return 'guest';
  const lower = String(provider).toLowerCase();
  if (lower.includes('google')) return 'google';
  if (lower.includes('email')) return 'email';
  return 'guest';
};

const resolveAnalyticsIdentity = (user) => {
  if (user && !user.isGuest && user.uid) {
    return {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'Athlete',
      email: user.email || '',
      authProvider: normalizeAuthProvider(user.provider, false)
    };
  }
  const deviceId = getOrCreateDeviceId();
  return {
    uid: user?.uid || deviceId,
    name: user?.displayName || 'Guest Lifter',
    email: user?.email || 'Guest Visitor',
    authProvider: 'guest'
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN AUTHENTICATION & ACCESS CONTROL HELPERS
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminSecurityConfig = () => {
  const stored = loadFromStorage(ADMIN_CONFIG_KEY, {});
  return {
    adminEmail: ENV_ADMIN_EMAIL || (stored.adminEmail || '').trim().toLowerCase(),
    hasEnvAdminEmail: Boolean(ENV_ADMIN_EMAIL),
    hasCustomPin: Boolean(ENV_ADMIN_PIN || stored.pin),
    configuredPin: ENV_ADMIN_PIN || stored.pin || ''
  };
};

export const saveLocalAdminSecurity = ({ adminEmail, pin }) => {
  const current = loadFromStorage(ADMIN_CONFIG_KEY, {});
  const updated = {
    ...current,
    ...(adminEmail !== undefined ? { adminEmail: String(adminEmail).trim().toLowerCase() } : {}),
    ...(pin !== undefined ? { pin: String(pin).trim() } : {})
  };
  saveToStorage(ADMIN_CONFIG_KEY, updated);
  return updated;
};

export const isAdminEmailMatch = (user) => {
  if (!user || user.isGuest || !user.email) return false;
  const { adminEmail } = getAdminSecurityConfig();
  if (!adminEmail) return false;
  return user.email.trim().toLowerCase() === adminEmail;
};

export const isAdminUnlocked = (user) => {
  if (isAdminEmailMatch(user)) return true;
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setAdminSessionUnlocked = (unlocked) => {
  try {
    if (unlocked) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch {}
};

export const verifyAdminPin = (pinAttempt) => {
  const { configuredPin } = getAdminSecurityConfig();
  if (!configuredPin) return false;
  return String(pinAttempt).trim() === configuredPin;
};

// ─────────────────────────────────────────────────────────────────────────────
// USER PROFILE UPSERT (`users` Collection)
// ─────────────────────────────────────────────────────────────────────────────
export const upsertAnalyticsUser = (user, { incrementSession = false, fieldIncrements = {} } = {}) => {
  try {
    const identity = resolveAnalyticsIdentity(user);
    const platform = detectPlatform();
    const deviceLabel = detectDeviceLabel();
    const nowIso = new Date().toISOString();

    // 1. Update local mirror synchronously
    const usersMap = loadFromStorage(ANALYTICS_USERS_KEY, {});
    const existing = usersMap[identity.uid] || {};

    const updatedLocal = {
      uid: identity.uid,
      name: identity.name,
      email: identity.email,
      authProvider: identity.authProvider,
      platform,
      deviceLabel,
      createdAt: existing.createdAt || nowIso,
      lastActiveAt: nowIso,
      totalSessionsCount: (existing.totalSessionsCount || 0) + (incrementSession ? 1 : 0),
      workoutsCompleted: (existing.workoutsCompleted || 0) + (fieldIncrements.workoutsCompleted || 0),
      cardioLoggedCount: (existing.cardioLoggedCount || 0) + (fieldIncrements.cardioLoggedCount || 0),
      foodLoggedCount: (existing.foodLoggedCount || 0) + (fieldIncrements.foodLoggedCount || 0),
      aiQuestionsCount: (existing.aiQuestionsCount || 0) + (fieldIncrements.aiQuestionsCount || 0),
      reelsSavedCount: (existing.reelsSavedCount || 0) + (fieldIncrements.reelsSavedCount || 0),
      isDemo: false
    };

    usersMap[identity.uid] = updatedLocal;
    saveToStorage(ANALYTICS_USERS_KEY, usersMap);

    // 2. Non-blocking write to Firebase Firestore
    const db = getDb();
    if (db) {
      const firestorePayload = {
        uid: identity.uid,
        name: identity.name,
        email: identity.email,
        authProvider: identity.authProvider,
        platform,
        deviceLabel,
        createdAt: existing.createdAt || nowIso,
        lastActiveAt: nowIso,
        lastActiveServer: serverTimestamp(),
        ...(incrementSession ? { totalSessionsCount: increment(1) } : {}),
        ...(fieldIncrements.workoutsCompleted
          ? { workoutsCompleted: increment(fieldIncrements.workoutsCompleted) }
          : {}),
        ...(fieldIncrements.cardioLoggedCount
          ? { cardioLoggedCount: increment(fieldIncrements.cardioLoggedCount) }
          : {}),
        ...(fieldIncrements.foodLoggedCount
          ? { foodLoggedCount: increment(fieldIncrements.foodLoggedCount) }
          : {}),
        ...(fieldIncrements.aiQuestionsCount
          ? { aiQuestionsCount: increment(fieldIncrements.aiQuestionsCount) }
          : {}),
        ...(fieldIncrements.reelsSavedCount
          ? { reelsSavedCount: increment(fieldIncrements.reelsSavedCount) }
          : {})
      };

      setDoc(doc(db, 'users', identity.uid), firestorePayload, { merge: true }).catch((err) => {
        console.warn('Firestore user upsert skipped:', err?.code || err?.message);
      });
    }

    return updatedLocal;
  } catch (err) {
    console.warn('Analytics user upsert error:', err);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// LIGHTWEIGHT EVENT TRACKING (`activity_logs` Collection)
// ─────────────────────────────────────────────────────────────────────────────
let lastVisitLogTs = 0;

export const logAnalyticsEvent = (eventType, details = {}, explicitUser = null) => {
  try {
    const activeUser = explicitUser || loadFromStorage('repkraft_user_auth', null);
    const identity = resolveAnalyticsIdentity(activeUser);
    const platform = detectPlatform();
    const deviceLabel = detectDeviceLabel();
    const now = Date.now();
    const nowIso = new Date(now).toISOString();

    // Prevent duplicate app_visit events caused by React StrictMode double-mounting
    if (eventType === 'app_visit') {
      if (now - lastVisitLogTs < 4000) return;
      lastVisitLogTs = now;
    }

    const fieldIncrements = {};
    if (eventType === 'workout_completed') fieldIncrements.workoutsCompleted = 1;
    if (eventType === 'cardio_logged') fieldIncrements.cardioLoggedCount = 1;
    if (eventType === 'food_logged') fieldIncrements.foodLoggedCount = 1;
    if (eventType === 'ai_coach_asked') fieldIncrements.aiQuestionsCount = 1;
    if (eventType === 'reel_link_saved') fieldIncrements.reelsSavedCount = 1;

    // Keep user activity timestamp & counters fresh
    upsertAnalyticsUser(activeUser, {
      incrementSession: eventType === 'app_visit' || eventType === 'user_login',
      fieldIncrements
    });

    const logEntry = {
      id: `evt-${now}-${Math.random().toString(36).slice(2, 6)}`,
      eventType,
      uid: identity.uid,
      userName: identity.name,
      userEmail: identity.email,
      authProvider: identity.authProvider,
      platform,
      deviceLabel,
      details: details || {},
      timestamp: now,
      createdAt: nowIso,
      isDemo: false
    };

    // 1. Append locally (capped at newest 300 entries to keep localStorage fast)
    const existingLogs = loadFromStorage(ANALYTICS_LOGS_KEY, []);
    const updatedLogs = [logEntry, ...(Array.isArray(existingLogs) ? existingLogs : [])].slice(0, 300);
    saveToStorage(ANALYTICS_LOGS_KEY, updatedLogs);

    // 2. Async background Firestore write
    const db = getDb();
    if (db) {
      addDoc(collection(db, 'activity_logs'), {
        ...logEntry,
        createdAtServer: serverTimestamp()
      }).catch((err) => {
        console.warn('Firestore event log skipped:', err?.code || err?.message);
      });
    }
  } catch (err) {
    console.warn('Analytics event logging error:', err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN FETCHING, METRICS AGGREGATION, DEMO SEEDING & CSV EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export const fetchAdminAnalytics = async () => {
  const localUsersMap = loadFromStorage(ANALYTICS_USERS_KEY, {});
  const localLogs = loadFromStorage(ANALYTICS_LOGS_KEY, []);

  let users = Object.values(localUsersMap || {});
  let logs = Array.isArray(localLogs) ? [...localLogs] : [];
  let source = 'local';

  const db = getDb();
  if (db) {
    try {
      const [usersSnap, logsSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), limit(500))),
        getDocs(query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(400)))
      ]);

      const remoteUsers = usersSnap.docs.map((d) => ({ uid: d.id, ...d.data() }));
      const remoteLogs = logsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (remoteUsers.length > 0 || remoteLogs.length > 0) {
        // Merge remote + any unsynced local entries by key
        const mergedUsersMap = { ...localUsersMap };
        remoteUsers.forEach((u) => {
          mergedUsersMap[u.uid] = { ...mergedUsersMap[u.uid], ...u };
        });
        users = Object.values(mergedUsersMap);

        const seenLogIds = new Set();
        const combinedLogs = [];
        [...remoteLogs, ...logs].forEach((entry) => {
          const k = entry.id || `${entry.uid}-${entry.timestamp}-${entry.eventType}`;
          if (!seenLogIds.has(k)) {
            seenLogIds.add(k);
            combinedLogs.push(entry);
          }
        });
        logs = combinedLogs;
        source = 'firestore';
      }
    } catch (err) {
      console.warn('Firestore admin fetch fallback to local telemetry:', err?.code || err?.message);
    }
  }

  users.sort((a, b) => Date.parse(b.lastActiveAt || 0) - Date.parse(a.lastActiveAt || 0));
  logs.sort((a, b) => (b.timestamp || Date.parse(b.createdAt || 0)) - (a.timestamp || Date.parse(a.createdAt || 0)));

  return { users, logs, source };
};

export const computeAdminMetrics = (users = [], logs = []) => {
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayCutoff = startOfToday.getTime();
  const sevenDaysCutoff = now - 7 * 24 * 60 * 60 * 1000;

  let googleUsers = 0;
  let emailUsers = 0;
  let guestUsers = 0;
  let webUsers = 0;
  let androidPwaUsers = 0;
  let dauToday = 0;
  let activeLast7Days = 0;
  let totalWorkoutsUsersCount = 0;

  users.forEach((u) => {
    const provider = normalizeAuthProvider(u.authProvider, u.authProvider === 'guest');
    if (provider === 'google') googleUsers++;
    else if (provider === 'email') emailUsers++;
    else guestUsers++;

    if (u.platform === 'android_pwa') androidPwaUsers++;
    else webUsers++;

    const lastActiveMs = Date.parse(u.lastActiveAt || u.createdAt || 0);
    if (lastActiveMs >= todayCutoff) dauToday++;
    if (lastActiveMs >= sevenDaysCutoff) activeLast7Days++;

    totalWorkoutsUsersCount += Number(u.workoutsCompleted) || 0;
  });

  // Breakdown across feature events
  let pushWorkouts = 0;
  let pullWorkouts = 0;
  let legWorkouts = 0;
  let freestyleWorkouts = 0;
  let workoutCompletedEvents = 0;
  let totalVolumeKg = 0;
  let cardioCount = 0;
  let foodCount = 0;
  let libraryViews = 0;
  let aiCoachChats = 0;
  let reelsSaved = 0;

  logs.forEach((evt) => {
    const t = evt.eventType;
    const cat = String(evt.details?.category || evt.details?.workoutName || '').toLowerCase();

    if (t === 'workout_completed') {
      workoutCompletedEvents++;
      totalVolumeKg += Number(evt.details?.totalVolume) || 0;
      if (cat.includes('push')) pushWorkouts++;
      else if (cat.includes('pull')) pullWorkouts++;
      else if (cat.includes('leg')) legWorkouts++;
      else freestyleWorkouts++;
    } else if (t === 'cardio_logged') {
      cardioCount++;
    } else if (t === 'food_logged') {
      foodCount++;
    } else if (t === 'exercise_library_viewed') {
      libraryViews++;
    } else if (t === 'ai_coach_asked') {
      aiCoachChats++;
    } else if (t === 'reel_link_saved') {
      reelsSaved++;
    }
  });

  const userSumCardio = users.reduce((s, u) => s + (Number(u.cardioLoggedCount) || 0), 0);
  const userSumFood = users.reduce((s, u) => s + (Number(u.foodLoggedCount) || 0), 0);
  const totalWorkouts = Math.max(totalWorkoutsUsersCount, workoutCompletedEvents);
  const totalCardioLogs = Math.max(userSumCardio, cardioCount);
  const totalFoodLogs = Math.max(userSumFood, foodCount);

  const featurePopularity = [
    { id: 'push', label: 'Push Workouts', count: pushWorkouts, color: '#0D9488' },
    { id: 'pull', label: 'Pull Workouts', count: pullWorkouts, color: '#0284C7' },
    { id: 'legs', label: 'Leg Workouts', count: legWorkouts, color: '#2563EB' },
    { id: 'freestyle', label: 'Freestyle Workouts', count: freestyleWorkouts, color: '#6366F1' },
    { id: 'cardio', label: 'Cardio Sessions', count: totalCardioLogs, color: '#F97316' },
    { id: 'food', label: 'Food & Macros Logged', count: totalFoodLogs, color: '#059669' },
    { id: 'library', label: 'Exercise Library & Guides', count: libraryViews, color: '#8B5CF6' },
    { id: 'ai', label: 'AI Coach Questions', count: aiCoachChats, color: '#7C3AED' },
    { id: 'reels', label: 'Saved Video Reels', count: reelsSaved, color: '#EC4899' }
  ];

  return {
    totalUsers: users.length,
    googleUsers,
    emailUsers,
    guestUsers,
    webUsers,
    androidPwaUsers,
    dauToday,
    activeLast7Days,
    totalWorkouts,
    totalVolumeKg,
    totalCardioLogs,
    totalFoodLogs,
    featurePopularity
  };
};

// Sample multi-user dataset helper for preview/testing of Admin UI
export const seedDemoAnalyticsData = () => {
  const now = Date.now();
  const min = 60 * 1000;
  const hr = 60 * min;

  const existingUsers = loadFromStorage(ANALYTICS_USERS_KEY, {});
  const demoUsers = {
    'demo-u-rahul': {
      uid: 'demo-u-rahul',
      name: 'Rahul Nair',
      email: 'rahul.nair@gmail.com',
      authProvider: 'google',
      platform: 'android_pwa',
      deviceLabel: 'Android PWA',
      createdAt: new Date(now - 14 * 24 * hr).toISOString(),
      lastActiveAt: new Date(now - 12 * min).toISOString(),
      totalSessionsCount: 18,
      workoutsCompleted: 11,
      cardioLoggedCount: 5,
      foodLoggedCount: 24,
      aiQuestionsCount: 4,
      reelsSavedCount: 3,
      isDemo: true
    },
    'demo-u-arjun': {
      uid: 'demo-u-arjun',
      name: 'Arjun Menon',
      email: 'arjun.m@outlook.com',
      authProvider: 'email',
      platform: 'web',
      deviceLabel: 'Desktop Chrome',
      createdAt: new Date(now - 9 * 24 * hr).toISOString(),
      lastActiveAt: new Date(now - 2 * hr).toISOString(),
      totalSessionsCount: 11,
      workoutsCompleted: 7,
      cardioLoggedCount: 3,
      foodLoggedCount: 14,
      aiQuestionsCount: 6,
      reelsSavedCount: 2,
      isDemo: true
    },
    'demo-u-sneha': {
      uid: 'demo-u-sneha',
      name: 'Sneha Kurian',
      email: 'sneha.k@gmail.com',
      authProvider: 'google',
      platform: 'android_pwa',
      deviceLabel: 'Android PWA',
      createdAt: new Date(now - 5 * 24 * hr).toISOString(),
      lastActiveAt: new Date(now - 4 * hr).toISOString(),
      totalSessionsCount: 8,
      workoutsCompleted: 5,
      cardioLoggedCount: 6,
      foodLoggedCount: 12,
      aiQuestionsCount: 3,
      reelsSavedCount: 5,
      isDemo: true
    },
    'demo-u-guest1': {
      uid: 'demo-u-guest1',
      name: 'Guest Lifter',
      email: 'Guest Visitor',
      authProvider: 'guest',
      platform: 'web',
      deviceLabel: 'iOS Safari',
      createdAt: new Date(now - 1 * 24 * hr).toISOString(),
      lastActiveAt: new Date(now - 45 * min).toISOString(),
      totalSessionsCount: 2,
      workoutsCompleted: 1,
      cardioLoggedCount: 1,
      foodLoggedCount: 2,
      aiQuestionsCount: 1,
      reelsSavedCount: 0,
      isDemo: true
    }
  };

  saveToStorage(ANALYTICS_USERS_KEY, { ...demoUsers, ...existingUsers });

  const existingLogs = loadFromStorage(ANALYTICS_LOGS_KEY, []).filter((l) => !l.isDemo);
  const demoLogs = [
    {
      id: 'demo-evt-1',
      eventType: 'workout_completed',
      uid: 'demo-u-rahul',
      userName: 'Rahul Nair',
      userEmail: 'rahul.nair@gmail.com',
      authProvider: 'google',
      platform: 'android_pwa',
      details: { workoutName: 'Monday: Push Day', category: 'Push', totalVolume: 1450, durationMinutes: 46 },
      timestamp: now - 12 * min,
      createdAt: new Date(now - 12 * min).toISOString(),
      isDemo: true
    },
    {
      id: 'demo-evt-2',
      eventType: 'cardio_logged',
      uid: 'demo-u-sneha',
      userName: 'Sneha Kurian',
      userEmail: 'sneha.k@gmail.com',
      authProvider: 'google',
      platform: 'android_pwa',
      details: { title: 'Incline Treadmill / Brisk Outdoor Walking', durationMinutes: 28 },
      timestamp: now - 29 * min,
      createdAt: new Date(now - 29 * min).toISOString(),
      isDemo: true
    },
    {
      id: 'demo-evt-3',
      eventType: 'food_logged',
      uid: 'demo-u-guest1',
      userName: 'Guest Lifter',
      userEmail: 'Guest Visitor',
      authProvider: 'guest',
      platform: 'web',
      details: { mealName: 'Rice Puttu + Kadala Curry + 2 Boiled Eggs', calories: 520 },
      timestamp: now - 45 * min,
      createdAt: new Date(now - 45 * min).toISOString(),
      isDemo: true
    },
    {
      id: 'demo-evt-4',
      eventType: 'workout_completed',
      uid: 'demo-u-arjun',
      userName: 'Arjun Menon',
      userEmail: 'arjun.m@outlook.com',
      authProvider: 'email',
      platform: 'web',
      details: { workoutName: 'Tuesday: Pull Day', category: 'Pull', totalVolume: 1820, durationMinutes: 52 },
      timestamp: now - 2 * hr,
      createdAt: new Date(now - 2 * hr).toISOString(),
      isDemo: true
    },
    {
      id: 'demo-evt-5',
      eventType: 'ai_coach_asked',
      uid: 'demo-u-arjun',
      userName: 'Arjun Menon',
      userEmail: 'arjun.m@outlook.com',
      authProvider: 'email',
      platform: 'web',
      details: { question: 'How to do Leg Press safely?' },
      timestamp: now - 2.3 * hr,
      createdAt: new Date(now - 2.3 * hr).toISOString(),
      isDemo: true
    },
    {
      id: 'demo-evt-6',
      eventType: 'workout_completed',
      uid: 'demo-u-sneha',
      userName: 'Sneha Kurian',
      userEmail: 'sneha.k@gmail.com',
      authProvider: 'google',
      platform: 'android_pwa',
      details: { workoutName: 'Wednesday: Leg Day', category: 'Legs', totalVolume: 2340, durationMinutes: 55 },
      timestamp: now - 4 * hr,
      createdAt: new Date(now - 4 * hr).toISOString(),
      isDemo: true
    },
    {
      id: 'demo-evt-7',
      eventType: 'reel_link_saved',
      uid: 'demo-u-rahul',
      userName: 'Rahul Nair',
      userEmail: 'rahul.nair@gmail.com',
      authProvider: 'google',
      platform: 'android_pwa',
      details: { exerciseName: 'Barbell Flat Bench Press', platform: 'instagram' },
      timestamp: now - 5 * hr,
      createdAt: new Date(now - 5 * hr).toISOString(),
      isDemo: true
    },
    {
      id: 'demo-evt-8',
      eventType: 'exercise_library_viewed',
      uid: 'demo-u-sneha',
      userName: 'Sneha Kurian',
      userEmail: 'sneha.k@gmail.com',
      authProvider: 'google',
      platform: 'android_pwa',
      details: { surface: 'Exercise Library' },
      timestamp: now - 6 * hr,
      createdAt: new Date(now - 6 * hr).toISOString(),
      isDemo: true
    }
  ];

  saveToStorage(ANALYTICS_LOGS_KEY, [...existingLogs, ...demoLogs]);
};

export const clearDemoAnalyticsData = () => {
  const users = loadFromStorage(ANALYTICS_USERS_KEY, {});
  const cleanedUsers = {};
  Object.entries(users || {}).forEach(([uid, u]) => {
    if (!u.isDemo) cleanedUsers[uid] = u;
  });
  saveToStorage(ANALYTICS_USERS_KEY, cleanedUsers);

  const logs = loadFromStorage(ANALYTICS_LOGS_KEY, []);
  saveToStorage(
    ANALYTICS_LOGS_KEY,
    (Array.isArray(logs) ? logs : []).filter((l) => !l.isDemo)
  );
};

export const exportAdminCsvReport = (users = [], logs = [], metrics = {}) => {
  const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

  const lines = [];
  lines.push('REPKRAFT ADMIN ANALYTICS REPORT');
  lines.push(`Generated At,${escapeCsv(new Date().toISOString())}`);
  lines.push(`Total Users,${metrics.totalUsers ?? users.length}`);
  lines.push(`Daily Active Users (Today),${metrics.dauToday ?? 0}`);
  lines.push(`Active Last 7 Days,${metrics.activeLast7Days ?? 0}`);
  lines.push(`Total Workouts Completed,${metrics.totalWorkouts ?? 0}`);
  lines.push(`Total Cardio Logs,${metrics.totalCardioLogs ?? 0}`);
  lines.push(`Total Nutrition Logs,${metrics.totalFoodLogs ?? 0}`);
  lines.push('');

  lines.push('USER DIRECTORY');
  lines.push('UID,Name,Email,Auth Provider,Platform,Workouts Completed,Cardio Logs,Food Logs,Sessions,Last Active');
  users.forEach((u) => {
    lines.push(
      [
        escapeCsv(u.uid),
        escapeCsv(u.name),
        escapeCsv(u.email),
        escapeCsv(u.authProvider),
        escapeCsv(u.platform),
        u.workoutsCompleted || 0,
        u.cardioLoggedCount || 0,
        u.foodLoggedCount || 0,
        u.totalSessionsCount || 0,
        escapeCsv(u.lastActiveAt)
      ].join(',')
    );
  });

  lines.push('');
  lines.push('RECENT ACTIVITY LOGS (TOP 100)');
  lines.push('Timestamp,Event Type,User Name,User Email,Provider,Platform,Details');
  logs.slice(0, 100).forEach((l) => {
    lines.push(
      [
        escapeCsv(l.createdAt || new Date(l.timestamp || 0).toISOString()),
        escapeCsv(l.eventType),
        escapeCsv(l.userName),
        escapeCsv(l.userEmail),
        escapeCsv(l.authProvider),
        escapeCsv(l.platform),
        escapeCsv(JSON.stringify(l.details || {}))
      ].join(',')
    );
  });

  const csvContent = lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `RepKraft_Admin_Report_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
