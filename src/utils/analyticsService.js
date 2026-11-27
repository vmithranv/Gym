// Centralized RepKraft User & Feature Engagement Analytics Service
// Mirrors live events to Firebase Firestore (`users` & `activity_logs` collections)
// with real-time onSnapshot listeners, cross-tab storage sync, and exact local fallback diagnostics.

import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { getFirebaseApp, getCurrentFirebaseUser, isFirebaseConfigured } from './authService';
import {
  loadFromStorage,
  saveToStorage,
  getOrCreateDeviceId,
  computeWorkoutVolumeKg
} from './storage';

const ANALYTICS_USERS_KEY = 'repkraft_analytics_users';
const ANALYTICS_LOGS_KEY = 'repkraft_analytics_logs';
const ADMIN_CONFIG_KEY = 'repkraft_admin_security';
const ADMIN_SESSION_KEY = 'repkraft_admin_unlocked';
export const ANALYTICS_STATUS_EVENT = 'repkraft:analytics-status';

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

// Track real-time cloud telemetry diagnostics so /admin never hides silent Firestore errors
let cloudDiagnostics = {
  firebaseConfigured: isFirebaseConfigured,
  readState: isFirebaseConfigured ? 'idle' : 'not_configured',
  writeState: isFirebaseConfigured ? 'idle' : 'not_configured',
  errorCode: '',
  errorMessage: ''
};

const updateDiagnostics = (patch) => {
  cloudDiagnostics = {
    ...cloudDiagnostics,
    firebaseConfigured: isFirebaseConfigured,
    currentFirebaseEmail: getCurrentFirebaseUser()?.email || '',
    ...patch
  };
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ANALYTICS_STATUS_EVENT));
  }
};

export const getCloudDiagnostics = () => ({
  ...cloudDiagnostics,
  firebaseConfigured: isFirebaseConfigured,
  currentFirebaseEmail: getCurrentFirebaseUser()?.email || ''
});

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM & DEVICE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
export { getOrCreateDeviceId };

export const detectDeviceType = () => {
  if (typeof window === 'undefined') return 'Desktop';
  const ua = (window.navigator?.userAgent || '').toLowerCase();
  if (/android/.test(ua)) return 'Android';
  const isTouchMac = window.navigator?.platform === 'MacIntel' && (window.navigator?.maxTouchPoints || 0) > 1;
  if (/iphone|ipad|ipod/.test(ua) || isTouchMac) return 'iOS';
  return 'Desktop';
};

export const detectBrowserName = () => {
  if (typeof window === 'undefined') return 'Browser';
  const ua = (window.navigator?.userAgent || '').toLowerCase();
  if (/samsungbrowser/.test(ua)) return 'Samsung Internet';
  if (/edg\/|edga\/|edgios\//.test(ua)) return 'Edge';
  if (/opr\/|opera/.test(ua)) return 'Opera';
  if (/firefox|fxios/.test(ua)) return 'Firefox';
  if (/chrome|crios/.test(ua)) return 'Chrome';
  if (/safari/.test(ua)) return 'Safari';
  return 'Browser';
};

export const detectIsInstalledPWA = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator?.standalone === true ||
    document.referrer.startsWith('android-app://')
  );
};

export const getClientEnvironmentMetadata = () => {
  const deviceType = detectDeviceType();
  const browser = detectBrowserName();
  const isInstalledPWA = detectIsInstalledPWA();
  let timezone = '';
  let language = '';
  if (typeof window !== 'undefined') {
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch {}
    language = window.navigator?.language || window.navigator?.userLanguage || '';
  }
  return { deviceType, browser, isInstalledPWA, timezone, language };
};

export const detectPlatform = () => {
  if (typeof window === 'undefined') return 'web';
  const isStandalone = detectIsInstalledPWA();
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
  const deviceType = detectDeviceType();
  const browser = detectBrowserName();
  const isStandalone = detectIsInstalledPWA();
  if (isStandalone && deviceType === 'Android') return 'Android PWA';
  if (isStandalone && deviceType === 'iOS') return 'iOS PWA';
  if (deviceType === 'Android') return `Android ${browser}`;
  if (deviceType === 'iOS') return `iOS ${browser}`;
  return `Desktop ${browser}`;
};

export const normalizeAuthProvider = (provider, isGuest) => {
  if (isGuest || !provider || provider === 'guest') return 'guest';
  const lower = String(provider).toLowerCase();
  if (lower.includes('google')) return 'google';
  if (lower.includes('email')) return 'email';
  return 'guest';
};

const getSavedProfilePhone = () => {
  const profile = loadFromStorage('repkraft_user_profile_data', {});
  return typeof profile?.phone === 'string' ? profile.phone.trim().slice(0, 32) : '';
};

const resolveAnalyticsIdentity = (user) => {
  if (user && !user.isGuest && user.uid) {
    return {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'Athlete',
      email: user.email || '',
      authProvider: normalizeAuthProvider(user.provider, false),
      isAnonymous: false
    };
  }
  const guestUid = (user?.uid && String(user.uid).trim()) || getOrCreateDeviceId();
  const isAnon = Boolean(
    user?.isAnonymous || (!guestUid.startsWith('dev-') && !guestUid.startsWith('guest-'))
  );
  return {
    uid: guestUid,
    name: user?.displayName || 'Guest Lifter',
    email: user?.email || 'Guest Visitor',
    authProvider: 'guest',
    isAnonymous: isAnon
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
// RECONCILIATION HELPERS (EXACT COUNTS, NO GHOST DUPLICATES)
// ─────────────────────────────────────────────────────────────────────────────
const recomputeUserCountsFromLogs = (usersMap, logsList) => {
  const nextUsers = {};
  Object.entries(usersMap || {}).forEach(([uid, u]) => {
    if (!u) return;
    const isDemoUser = Boolean(u.isDemo);
    const userLogs = logsList.filter((l) => l.uid === uid && Boolean(l.isDemo) === isDemoUser);
    const workoutsCompleted = userLogs.filter((l) => l.eventType === 'workout_completed').length;
    const cardioLoggedCount = userLogs.filter((l) => l.eventType === 'cardio_logged').length;
    const foodLoggedCount = userLogs.filter((l) => l.eventType === 'food_logged').length;
    const aiQuestionsCount = userLogs.filter((l) => l.eventType === 'ai_coach_asked').length;
    const reelsSavedCount = userLogs.filter((l) => l.eventType === 'reel_link_saved').length;
    const sessionEvents = userLogs.filter(
      (l) => l.eventType === 'app_visit' || l.eventType === 'user_login'
    ).length;

    nextUsers[uid] = {
      ...u,
      workoutsCompleted,
      cardioLoggedCount,
      foodLoggedCount,
      aiQuestionsCount,
      reelsSavedCount,
      totalSessionsCount: Math.max(sessionEvents, Number(u.totalSessionsCount) || 1)
    };
  });
  return nextUsers;
};

/**
 * Merges an anonymous/guest browser session into a signed-in user so upgrading doesn't leave duplicate ghost users.
 */
export const mergeGuestIntoUserAnalytics = (targetUser, previousGuestUid = null) => {
  if (!targetUser || targetUser.isGuest || !targetUser.uid) return;

  const deviceId = getOrCreateDeviceId();
  const usersMap = loadFromStorage(ANALYTICS_USERS_KEY, {});
  const existingLogs = loadFromStorage(ANALYTICS_LOGS_KEY, []);

  let changedUsers = false;
  let mergedGuestStats = null;
  let carriedPhone = '';

  Object.entries(usersMap).forEach(([uid, u]) => {
    const isLocalGuestRow =
      u &&
      !u.isDemo &&
      uid !== targetUser.uid &&
      ((previousGuestUid && uid === previousGuestUid) ||
        uid === deviceId ||
        uid.startsWith('guest-') ||
        uid.startsWith('dev-') ||
        u.authProvider === 'guest');
    if (isLocalGuestRow) {
      mergedGuestStats = mergedGuestStats || {
        workoutsCompleted: 0,
        cardioLoggedCount: 0,
        foodLoggedCount: 0,
        aiQuestionsCount: 0,
        reelsSavedCount: 0,
        totalSessionsCount: 0
      };
      mergedGuestStats.workoutsCompleted += Number(u.workoutsCompleted) || 0;
      mergedGuestStats.cardioLoggedCount += Number(u.cardioLoggedCount) || 0;
      mergedGuestStats.foodLoggedCount += Number(u.foodLoggedCount) || 0;
      mergedGuestStats.aiQuestionsCount += Number(u.aiQuestionsCount) || 0;
      mergedGuestStats.reelsSavedCount += Number(u.reelsSavedCount) || 0;
      mergedGuestStats.totalSessionsCount += Number(u.totalSessionsCount) || 0;
      if (!carriedPhone && u.phone) carriedPhone = u.phone;
      delete usersMap[uid];
      changedUsers = true;
    }
  });

  let changedLogs = false;
  const reattributedLogs = (Array.isArray(existingLogs) ? existingLogs : []).map((evt) => {
    const isLocalGuestEvent =
      evt &&
      !evt.isDemo &&
      evt.uid &&
      evt.uid !== targetUser.uid &&
      ((previousGuestUid && evt.uid === previousGuestUid) ||
        evt.uid === deviceId ||
        evt.uid.startsWith('guest-') ||
        evt.uid.startsWith('dev-') ||
        evt.authProvider === 'guest');
    if (isLocalGuestEvent) {
      changedLogs = true;
      return {
        ...evt,
        uid: targetUser.uid,
        userName: targetUser.displayName || targetUser.email?.split('@')[0] || 'Athlete',
        userEmail: targetUser.email || '',
        authProvider: normalizeAuthProvider(targetUser.provider, false)
      };
    }
    return evt;
  });

  if (changedLogs) {
    saveToStorage(ANALYTICS_LOGS_KEY, reattributedLogs);
  }

  if (changedUsers || mergedGuestStats || carriedPhone) {
    saveToStorage(ANALYTICS_USERS_KEY, usersMap);
    upsertAnalyticsUser(targetUser, {
      fieldIncrements: mergedGuestStats || {},
      ...(carriedPhone ? { phone: carriedPhone } : {})
    });
  }
};

/**
 * Idempotently syncs existing device data (registered accounts, workouts, cardio, logged meals, saved reels)
 * into local telemetry so metrics accurately reflect real activity even from before analytics was enabled.
 */
export const reconcileDeviceAnalytics = (explicitUser = null) => {
  try {
    const activeUser = explicitUser || loadFromStorage('repkraft_user_auth', null);
    if (activeUser && !activeUser.isGuest) {
      mergeGuestIntoUserAnalytics(activeUser);
    }

    const localAccounts = loadFromStorage('repkraft_local_accounts', {});
    const usersMap = { ...loadFromStorage(ANALYTICS_USERS_KEY, {}) };
    const existingLogs = Array.isArray(loadFromStorage(ANALYTICS_LOGS_KEY, []))
      ? [...loadFromStorage(ANALYTICS_LOGS_KEY, [])]
      : [];

    const existingIds = new Set(existingLogs.map((l) => l.id));
    const platform = detectPlatform();
    const deviceLabel = detectDeviceLabel();

    const accountBackfills = [];
    Object.values(localAccounts || {}).forEach((acc) => {
      if (acc && acc.uid) {
        if (!usersMap[acc.uid]) {
          usersMap[acc.uid] = {
            uid: acc.uid,
            name: acc.displayName || acc.email?.split('@')[0] || 'Athlete',
            email: acc.email || '',
            authProvider: normalizeAuthProvider(acc.provider, false),
            platform,
            deviceLabel,
            createdAt: acc.createdAt || new Date().toISOString(),
            lastActiveAt: acc.createdAt || new Date().toISOString(),
            totalSessionsCount: 1,
            workoutsCompleted: 0,
            cardioLoggedCount: 0,
            foodLoggedCount: 0,
            aiQuestionsCount: 0,
            reelsSavedCount: 0,
            isDemo: false
          };
        }
        const loginKey = `backfill-login-${acc.uid}`;
        const hasLogin =
          existingIds.has(loginKey) ||
          existingLogs.some((l) => l.uid === acc.uid && l.eventType === 'user_login');
        if (!hasLogin) {
          existingIds.add(loginKey);
          const loginTs = Date.parse(acc.createdAt || '') || Date.now();
          accountBackfills.push({
            id: loginKey,
            eventType: 'user_login',
            uid: acc.uid,
            userName: acc.displayName || acc.email?.split('@')[0] || 'Athlete',
            userEmail: acc.email || '',
            authProvider: normalizeAuthProvider(acc.provider, false),
            platform,
            deviceLabel,
            details: { authProvider: acc.provider || 'email' },
            timestamp: loginTs,
            createdAt: new Date(loginTs).toISOString(),
            isDemo: false
          });
        }
      }
    });

    if (activeUser) {
      const identity = resolveAnalyticsIdentity(activeUser);
      if (!usersMap[identity.uid]) {
        usersMap[identity.uid] = {
          uid: identity.uid,
          name: identity.name,
          email: identity.email,
          authProvider: identity.authProvider,
          platform,
          deviceLabel,
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          totalSessionsCount: 1,
          workoutsCompleted: 0,
          cardioLoggedCount: 0,
          foodLoggedCount: 0,
          aiQuestionsCount: 0,
          reelsSavedCount: 0,
          isDemo: false
        };
      }

      const newBackfills = [];

      const workoutHistory = loadFromStorage('workout_history', []);
      (Array.isArray(workoutHistory) ? workoutHistory : []).forEach((w, idx) => {
        const wKey = `backfill-wo-${w.id || idx}`;
        const ts = Date.parse(w.completedAt || w.startedAt || w.date || '') || Date.now();
        const workoutName = w.name || w.routineName || 'Workout';
        const alreadyLogged =
          existingIds.has(wKey) ||
          existingLogs.some(
            (l) =>
              l.eventType === 'workout_completed' &&
              Math.abs((l.timestamp || 0) - ts) < 15000 &&
              (l.details?.workoutName === workoutName || l.uid === identity.uid)
          );
        if (!alreadyLogged) {
          existingIds.add(wKey);
          newBackfills.push({
            id: wKey,
            eventType: 'workout_completed',
            uid: identity.uid,
            userName: identity.name,
            userEmail: identity.email,
            authProvider: identity.authProvider,
            platform,
            deviceLabel,
            details: {
              workoutName,
              category: w.category || workoutName,
              totalVolume: computeWorkoutVolumeKg(w),
              durationMinutes: w.durationMinutes || 35
            },
            timestamp: ts,
            createdAt: new Date(ts).toISOString(),
            isDemo: false
          });
        }
      });

      const cardioLogs = loadFromStorage('cardio_logs', []);
      (Array.isArray(cardioLogs) ? cardioLogs : []).forEach((c) => {
        if (!c || c.id === 'cl-init-1') return;
        const cKey = `backfill-cardio-${c.id}`;
        const ts = Number(c.timestamp) || Date.parse(c.date || '') || Date.now();
        const alreadyLogged =
          existingIds.has(cKey) ||
          existingLogs.some(
            (l) =>
              l.eventType === 'cardio_logged' &&
              Math.abs((l.timestamp || 0) - ts) < 15000
          );
        if (!alreadyLogged) {
          existingIds.add(cKey);
          newBackfills.push({
            id: cKey,
            eventType: 'cardio_logged',
            uid: identity.uid,
            userName: identity.name,
            userEmail: identity.email,
            authProvider: identity.authProvider,
            platform,
            deviceLabel,
            details: {
              title: c.title || 'Cardio Session',
              durationMinutes: Number(c.durationMinutes) || 20
            },
            timestamp: ts,
            createdAt: new Date(ts).toISOString(),
            isDemo: false
          });
        }
      });

      const nutrition = loadFromStorage('nutrition', { logs: [] });
      (Array.isArray(nutrition?.logs) ? nutrition.logs : []).forEach((m) => {
        if (!m || m.id === '1' || m.id === '2' || m.id === '3') return;
        const mKey = `backfill-food-${m.id}`;
        const tsMatch = String(m.id).match(/meal-(\d+)/);
        const ts = tsMatch ? Number(tsMatch[1]) : Date.now();
        const alreadyLogged =
          existingIds.has(mKey) ||
          existingLogs.some(
            (l) =>
              l.eventType === 'food_logged' &&
              Math.abs((l.timestamp || 0) - ts) < 15000
          );
        if (!alreadyLogged) {
          existingIds.add(mKey);
          newBackfills.push({
            id: mKey,
            eventType: 'food_logged',
            uid: identity.uid,
            userName: identity.name,
            userEmail: identity.email,
            authProvider: identity.authProvider,
            platform,
            deviceLabel,
            details: {
              mealName: m.name || 'Meal',
              calories: Number(m.calories) || 0,
              protein: Number(m.protein) || 0
            },
            timestamp: ts,
            createdAt: new Date(ts).toISOString(),
            isDemo: false
          });
        }
      });

      const savedReelsMap = loadFromStorage('saved_reel_links', {});
      Object.entries(savedReelsMap || {}).forEach(([exerciseName, list]) => {
        if (!Array.isArray(list)) return;
        list.forEach((link) => {
          if (!link || !link.url) return;
          const rKey = `backfill-reel-${link.id || encodeURIComponent(link.url)}`;
          const ts = Number(link.createdAt) || Date.now();
          const alreadyLogged =
            existingIds.has(rKey) ||
            existingLogs.some(
              (l) =>
                l.eventType === 'reel_link_saved' &&
                ((link.createdAt && Math.abs((l.timestamp || 0) - link.createdAt) < 15000) ||
                  (l.details?.exerciseName === exerciseName && l.details?.title === link.title))
            );
          if (!alreadyLogged) {
            existingIds.add(rKey);
            newBackfills.push({
              id: rKey,
              eventType: 'reel_link_saved',
              uid: identity.uid,
              userName: identity.name,
              userEmail: identity.email,
              authProvider: identity.authProvider,
              platform,
              deviceLabel,
              details: {
                exerciseName,
                platform: link.platform || 'instagram',
                title: link.title || 'Saved Reel'
              },
              timestamp: ts,
              createdAt: new Date(ts).toISOString(),
              isDemo: false
            });
          }
        });
      });

      const allBackfills = [...accountBackfills, ...newBackfills];
      const combinedLogs = [...allBackfills, ...existingLogs]
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 400);

      const syncedUsers = recomputeUserCountsFromLogs(usersMap, combinedLogs);
      saveToStorage(ANALYTICS_USERS_KEY, syncedUsers);
      if (allBackfills.length > 0) {
        saveToStorage(ANALYTICS_LOGS_KEY, combinedLogs);
      }
      return;
    }

    const combinedNoActive = [...accountBackfills, ...existingLogs]
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 400);
    const syncedUsersOnly = recomputeUserCountsFromLogs(usersMap, combinedNoActive);
    saveToStorage(ANALYTICS_USERS_KEY, syncedUsersOnly);
    if (accountBackfills.length > 0) {
      saveToStorage(ANALYTICS_LOGS_KEY, combinedNoActive);
    }
  } catch (err) {
    console.warn('Reconcile device analytics error:', err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// USER PROFILE UPSERT (`users` Collection)
// ─────────────────────────────────────────────────────────────────────────────
export const upsertAnalyticsUser = (
  user,
  { incrementSession = false, fieldIncrements = {}, phone, isInstalledPWA: explicitPwaInstalled } = {}
) => {
  try {
    const identity = resolveAnalyticsIdentity(user);
    const platform = detectPlatform();
    const deviceLabel = detectDeviceLabel();
    const envMeta = getClientEnvironmentMetadata();
    const nowIso = new Date().toISOString();

    const usersMap = loadFromStorage(ANALYTICS_USERS_KEY, {});
    const existing = usersMap[identity.uid] || {};

    const resolvedPhone =
      phone !== undefined
        ? String(phone || '').trim().slice(0, 32)
        : (existing.phone ?? getSavedProfilePhone());
    const resolvedIsPwa =
      explicitPwaInstalled !== undefined
        ? Boolean(explicitPwaInstalled)
        : Boolean(existing.isInstalledPWA || envMeta.isInstalledPWA);

    const updatedLocal = {
      uid: identity.uid,
      name: identity.name,
      email: identity.email,
      authProvider: identity.authProvider,
      isAnonymous: identity.isAnonymous,
      platform,
      deviceLabel,
      deviceType: envMeta.deviceType,
      browser: envMeta.browser,
      isInstalledPWA: resolvedIsPwa,
      timezone: envMeta.timezone,
      language: envMeta.language,
      phone: resolvedPhone,
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

    const db = getDb();
    if (db) {
      const firestorePayload = {
        uid: identity.uid,
        name: identity.name,
        email: identity.email,
        authProvider: identity.authProvider,
        isAnonymous: identity.isAnonymous,
        platform,
        deviceLabel,
        deviceType: envMeta.deviceType,
        browser: envMeta.browser,
        isInstalledPWA: resolvedIsPwa,
        timezone: envMeta.timezone,
        language: envMeta.language,
        phone: resolvedPhone,
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

      setDoc(doc(db, 'users', identity.uid), firestorePayload, { merge: true })
        .then(() => {
          updateDiagnostics({ writeState: 'ok', errorCode: '', errorMessage: '' });
        })
        .catch((err) => {
          console.warn('Firestore user upsert skipped:', err?.code || err?.message);
          updateDiagnostics({
            writeState: err?.code === 'permission-denied' ? 'permission_denied' : 'error',
            errorCode: err?.code || 'write-error',
            errorMessage: err?.message || 'Failed writing user telemetry to Firestore.'
          });
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
    if (!activeUser && eventType === 'app_visit') {
      return;
    }

    const identity = resolveAnalyticsIdentity(activeUser);
    const platform = detectPlatform();
    const deviceLabel = detectDeviceLabel();
    const now = Date.now();
    const nowIso = new Date(now).toISOString();

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

    const existingLogs = loadFromStorage(ANALYTICS_LOGS_KEY, []);
    const updatedLogs = [logEntry, ...(Array.isArray(existingLogs) ? existingLogs : [])].slice(0, 400);
    saveToStorage(ANALYTICS_LOGS_KEY, updatedLogs);

    // Update user document cleanly right after logs are persisted
    upsertAnalyticsUser(activeUser, {
      incrementSession: eventType === 'app_visit' || eventType === 'user_login',
      fieldIncrements
    });

    const db = getDb();
    if (db) {
      addDoc(collection(db, 'activity_logs'), {
        ...logEntry,
        createdAtServer: serverTimestamp()
      })
        .then(() => {
          updateDiagnostics({ writeState: 'ok' });
        })
        .catch((err) => {
          console.warn('Firestore event log skipped:', err?.code || err?.message);
          updateDiagnostics({
            writeState: err?.code === 'permission-denied' ? 'permission_denied' : 'error',
            errorCode: err?.code || 'write-error',
            errorMessage: err?.message || 'Failed writing event telemetry to Firestore.'
          });
        });
    }
  } catch (err) {
    console.warn('Analytics event logging error:', err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN FETCHING, REALTIME SUBSCRIPTION, AGGREGATION & EXPORT
// ─────────────────────────────────────────────────────────────────────────────
const mergeLocalAndRemoteData = (remoteUsers = [], remoteLogs = []) => {
  const localUsersMap = loadFromStorage(ANALYTICS_USERS_KEY, {});
  const localLogs = Array.isArray(loadFromStorage(ANALYTICS_LOGS_KEY, []))
    ? loadFromStorage(ANALYTICS_LOGS_KEY, [])
    : [];

  const mergedUsersMap = { ...localUsersMap };
  remoteUsers.forEach((u) => {
    const localU = mergedUsersMap[u.uid] || {};
    mergedUsersMap[u.uid] = {
      ...localU,
      ...u,
      workoutsCompleted: Math.max(Number(u.workoutsCompleted) || 0, Number(localU.workoutsCompleted) || 0),
      cardioLoggedCount: Math.max(Number(u.cardioLoggedCount) || 0, Number(localU.cardioLoggedCount) || 0),
      foodLoggedCount: Math.max(Number(u.foodLoggedCount) || 0, Number(localU.foodLoggedCount) || 0)
    };
  });

  const seenLogIds = new Set();
  const combinedLogs = [];
  [...remoteLogs, ...localLogs].forEach((entry) => {
    const k = entry.id || `${entry.uid}-${entry.timestamp}-${entry.eventType}`;
    if (!seenLogIds.has(k)) {
      seenLogIds.add(k);
      combinedLogs.push(entry);
    }
  });

  const users = Object.values(mergedUsersMap);
  users.sort((a, b) => Date.parse(b.lastActiveAt || 0) - Date.parse(a.lastActiveAt || 0));
  combinedLogs.sort((a, b) => (b.timestamp || Date.parse(b.createdAt || 0)) - (a.timestamp || Date.parse(a.createdAt || 0)));

  return { users, logs: combinedLogs };
};

export const fetchAdminAnalytics = async () => {
  reconcileDeviceAnalytics();

  const db = getDb();
  if (!db) {
    updateDiagnostics({ readState: 'not_configured' });
    const { users, logs } = mergeLocalAndRemoteData([], []);
    return { users, logs, source: 'local', diagnostics: getCloudDiagnostics() };
  }

  let remoteUsers = [];
  let remoteLogs = [];
  let readErr = null;
  let firestoreSucceeded = false;

  const [usersRes, logsRes] = await Promise.allSettled([
    getDocs(query(collection(db, 'users'), limit(500))),
    getDocs(query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(400)))
  ]);

  if (usersRes.status === 'fulfilled') {
    remoteUsers = usersRes.value.docs.map((d) => ({ uid: d.id, ...d.data() }));
    firestoreSucceeded = true;
  } else {
    readErr = usersRes.reason;
  }

  if (logsRes.status === 'fulfilled') {
    remoteLogs = logsRes.value.docs.map((d) => ({ id: d.id, ...d.data() }));
    firestoreSucceeded = true;
  } else if (logsRes.reason?.code === 'failed-precondition') {
    // Fallback query without orderBy in case index isn't available yet
    try {
      const unorderedSnap = await getDocs(query(collection(db, 'activity_logs'), limit(400)));
      remoteLogs = unorderedSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      firestoreSucceeded = true;
    } catch (innerErr) {
      if (!readErr) readErr = innerErr;
    }
  } else if (!readErr) {
    readErr = logsRes.reason;
  }

  if (readErr && !firestoreSucceeded) {
    console.warn('Firestore admin fetch fallback to local telemetry:', readErr?.code || readErr?.message);
    updateDiagnostics({
      readState: readErr?.code === 'permission-denied' ? 'permission_denied' : 'error',
      errorCode: readErr?.code || 'read-error',
      errorMessage: readErr?.message || 'Unable to read Firestore admin collections.'
    });
    const { users, logs } = mergeLocalAndRemoteData([], []);
    return { users, logs, source: 'local', diagnostics: getCloudDiagnostics() };
  }

  updateDiagnostics({
    readState: 'ok',
    errorCode: '',
    errorMessage: ''
  });

  const { users, logs } = mergeLocalAndRemoteData(remoteUsers, remoteLogs);
  return {
    users,
    logs,
    source: 'firestore',
    diagnostics: getCloudDiagnostics()
  };
};

/**
 * Subscribes to live Firestore updates (users & activity_logs) AND cross-tab localStorage updates
 * so /admin updates immediately whenever any new user logs in!
 */
export const subscribeToAdminAnalytics = (onUpdate) => {
  let latestRemoteUsers = [];
  let latestRemoteLogs = [];
  let unsubUsers = null;
  let unsubLogs = null;

  const emitCombined = (sourceOverride = null) => {
    const { users, logs } = mergeLocalAndRemoteData(latestRemoteUsers, latestRemoteLogs);
    onUpdate({
      users,
      logs,
      source: sourceOverride || (isFirebaseConfigured && getCloudDiagnostics().readState === 'ok' ? 'firestore' : 'local'),
      diagnostics: getCloudDiagnostics()
    });
  };

  // Cross-tab & focus refresh for same-browser logins (read-only so tabs never race-overwrite localStorage)
  const handleStorageEvent = (e) => {
    if (!e?.key || e.key.includes('repkraft_analytics') || e.key.includes('repkraft_user_auth')) {
      emitCombined();
    }
  };
  const handleLocalChange = () => emitCombined();
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('focus', handleLocalChange);
    window.addEventListener(ANALYTICS_STATUS_EVENT, handleLocalChange);
  }

  const db = getDb();
  if (db) {
    try {
      unsubUsers = onSnapshot(
        query(collection(db, 'users'), limit(500)),
        (snap) => {
          latestRemoteUsers = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
          updateDiagnostics({ readState: 'ok', errorCode: '', errorMessage: '' });
          emitCombined('firestore');
        },
        (err) => {
          updateDiagnostics({
            readState: err?.code === 'permission-denied' ? 'permission_denied' : 'error',
            errorCode: err?.code || 'snapshot-error',
            errorMessage: err?.message || 'Firestore live listener blocked.'
          });
          emitCombined('local');
        }
      );

      unsubLogs = onSnapshot(
        query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(400)),
        (snap) => {
          latestRemoteLogs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          emitCombined('firestore');
        },
        () => {
          // Logs permission/index handled cleanly without blocking users list
        }
      );
    } catch (err) {
      console.warn('Could not start Firestore live listener:', err);
    }
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('focus', handleLocalChange);
      window.removeEventListener(ANALYTICS_STATUS_EVENT, handleLocalChange);
    }
    if (typeof unsubUsers === 'function') unsubUsers();
    if (typeof unsubLogs === 'function') unsubLogs();
  };
};

const normalizeDeviceType = (u) => {
  if (u?.deviceType === 'Android' || u?.deviceType === 'iOS' || u?.deviceType === 'Desktop') {
    return u.deviceType;
  }
  const label = String(u?.deviceLabel || '').toLowerCase();
  if (u?.platform === 'android_pwa' || label.includes('android')) return 'Android';
  if (label.includes('ios') || label.includes('iphone') || label.includes('ipad')) return 'iOS';
  return 'Desktop';
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
  let androidDevices = 0;
  let iosDevices = 0;
  let desktopDevices = 0;
  let dauToday = 0;
  let activeLast7Days = 0;
  const installedPwaUids = new Set();

  users.forEach((u) => {
    const provider = normalizeAuthProvider(u.authProvider, u.authProvider === 'guest');
    if (provider === 'google') googleUsers++;
    else if (provider === 'email') emailUsers++;
    else guestUsers++;

    if (u.platform === 'android_pwa') androidPwaUsers++;
    else webUsers++;

    const devType = normalizeDeviceType(u);
    if (devType === 'Android') androidDevices++;
    else if (devType === 'iOS') iosDevices++;
    else desktopDevices++;

    if (u.isInstalledPWA === true && u.uid) {
      installedPwaUids.add(u.uid);
    }

    const lastActiveMs = Date.parse(u.lastActiveAt || u.createdAt || 0);
    if (lastActiveMs >= todayCutoff) dauToday++;
    if (lastActiveMs >= sevenDaysCutoff) activeLast7Days++;
  });

  let pushWorkouts = 0;
  let pullWorkouts = 0;
  let legWorkouts = 0;
  let freestyleWorkouts = 0;
  let totalWorkoutsFromLogs = 0;
  let totalVolumeKg = 0;
  let cardioCountFromLogs = 0;
  let foodCountFromLogs = 0;
  let libraryViews = 0;
  let aiCoachChats = 0;
  let reelsSaved = 0;
  let pwaInstalledEvents = 0;

  logs.forEach((evt) => {
    const t = evt.eventType;
    const cat = String(evt.details?.category || evt.details?.workoutName || '').toLowerCase();

    if (t === 'workout_completed') {
      totalWorkoutsFromLogs++;
      totalVolumeKg += Number(evt.details?.totalVolume) || 0;
      if (cat.includes('push')) pushWorkouts++;
      else if (cat.includes('pull')) pullWorkouts++;
      else if (cat.includes('leg')) legWorkouts++;
      else freestyleWorkouts++;
    } else if (t === 'cardio_logged') {
      cardioCountFromLogs++;
    } else if (t === 'food_logged') {
      foodCountFromLogs++;
    } else if (t === 'exercise_library_viewed') {
      libraryViews++;
    } else if (t === 'ai_coach_asked') {
      aiCoachChats++;
    } else if (t === 'reel_link_saved') {
      reelsSaved++;
    } else if (t === 'pwa_installed') {
      pwaInstalledEvents++;
      if (evt.uid) installedPwaUids.add(evt.uid);
    }
  });

  const pwaInstallCount = Math.max(installedPwaUids.size, pwaInstalledEvents);

  const userSumWorkouts = users.reduce((s, u) => s + (Number(u.workoutsCompleted) || 0), 0);
  const userSumCardio = users.reduce((s, u) => s + (Number(u.cardioLoggedCount) || 0), 0);
  const userSumFood = users.reduce((s, u) => s + (Number(u.foodLoggedCount) || 0), 0);

  const totalWorkouts = Math.max(totalWorkoutsFromLogs, userSumWorkouts);
  const totalCardioLogs = Math.max(cardioCountFromLogs, userSumCardio);
  const totalFoodLogs = Math.max(foodCountFromLogs, userSumFood);

  const featurePopularity = [
    { id: 'push', label: 'Push Workouts', count: pushWorkouts, color: '#0D9488' },
    { id: 'pull', label: 'Pull Workouts', count: pullWorkouts, color: '#0284C7' },
    { id: 'legs', label: 'Leg Workouts', count: legWorkouts, color: '#2563EB' },
    { id: 'freestyle', label: 'Freestyle / Other Workouts', count: freestyleWorkouts + Math.max(0, totalWorkouts - totalWorkoutsFromLogs), color: '#6366F1' },
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
    androidDevices,
    iosDevices,
    desktopDevices,
    pwaInstallCount,
    pwaInstalledEvents,
    dauToday,
    activeLast7Days,
    totalWorkouts,
    totalVolumeKg,
    totalCardioLogs,
    totalFoodLogs,
    hasDemoData: users.some((u) => u.isDemo) || logs.some((l) => l.isDemo),
    featurePopularity
  };
};

// Consistent sample dataset where every user counter matches the exact demo event rows
export const seedDemoAnalyticsData = () => {
  const now = Date.now();
  const min = 60 * 1000;
  const hr = 60 * min;

  const existingUsers = loadFromStorage(ANALYTICS_USERS_KEY, {});
  const cleanedUsers = {};
  Object.entries(existingUsers || {}).forEach(([k, u]) => {
    if (!u.isDemo) cleanedUsers[k] = u;
  });

  const demoUsers = {
    'demo-u-rahul': {
      uid: 'demo-u-rahul',
      name: 'Rahul Nair',
      email: 'rahul.nair@gmail.com',
      authProvider: 'google',
      isAnonymous: false,
      platform: 'android_pwa',
      deviceLabel: 'Android PWA',
      deviceType: 'Android',
      browser: 'Chrome',
      isInstalledPWA: true,
      timezone: 'Asia/Calcutta',
      language: 'en-IN',
      phone: '+91 98470 11223',
      createdAt: new Date(now - 14 * 24 * hr).toISOString(),
      lastActiveAt: new Date(now - 12 * min).toISOString(),
      totalSessionsCount: 6,
      workoutsCompleted: 2,
      cardioLoggedCount: 1,
      foodLoggedCount: 1,
      aiQuestionsCount: 1,
      reelsSavedCount: 1,
      isDemo: true
    },
    'demo-u-arjun': {
      uid: 'demo-u-arjun',
      name: 'Arjun Menon',
      email: 'arjun.m@outlook.com',
      authProvider: 'email',
      isAnonymous: false,
      platform: 'web',
      deviceLabel: 'Desktop Chrome',
      deviceType: 'Desktop',
      browser: 'Chrome',
      isInstalledPWA: false,
      timezone: 'Asia/Calcutta',
      language: 'en-IN',
      phone: '',
      createdAt: new Date(now - 9 * 24 * hr).toISOString(),
      lastActiveAt: new Date(now - 2 * hr).toISOString(),
      totalSessionsCount: 4,
      workoutsCompleted: 2,
      cardioLoggedCount: 1,
      foodLoggedCount: 1,
      aiQuestionsCount: 1,
      reelsSavedCount: 0,
      isDemo: true
    },
    'demo-u-sneha': {
      uid: 'demo-u-sneha',
      name: 'Sneha Kurian',
      email: 'sneha.k@gmail.com',
      authProvider: 'google',
      isAnonymous: false,
      platform: 'android_pwa',
      deviceLabel: 'Android PWA',
      deviceType: 'Android',
      browser: 'Chrome',
      isInstalledPWA: true,
      timezone: 'Asia/Calcutta',
      language: 'en-IN',
      phone: '+91 94471 55678',
      createdAt: new Date(now - 5 * 24 * hr).toISOString(),
      lastActiveAt: new Date(now - 29 * min).toISOString(),
      totalSessionsCount: 3,
      workoutsCompleted: 1,
      cardioLoggedCount: 1,
      foodLoggedCount: 1,
      aiQuestionsCount: 0,
      reelsSavedCount: 1,
      isDemo: true
    },
    'demo-u-guest1': {
      uid: 'demo-u-guest1',
      name: 'Demo Guest Visitor',
      email: 'Guest Visitor',
      authProvider: 'guest',
      isAnonymous: true,
      platform: 'web',
      deviceLabel: 'iOS Safari',
      deviceType: 'iOS',
      browser: 'Safari',
      isInstalledPWA: false,
      timezone: 'Asia/Calcutta',
      language: 'en-IN',
      phone: '',
      createdAt: new Date(now - 1 * 24 * hr).toISOString(),
      lastActiveAt: new Date(now - 45 * min).toISOString(),
      totalSessionsCount: 2,
      workoutsCompleted: 1,
      cardioLoggedCount: 0,
      foodLoggedCount: 1,
      aiQuestionsCount: 0,
      reelsSavedCount: 0,
      isDemo: true
    }
  };

  saveToStorage(ANALYTICS_USERS_KEY, { ...demoUsers, ...cleanedUsers });

  const realLogs = (loadFromStorage(ANALYTICS_LOGS_KEY, []) || []).filter((l) => !l.isDemo);
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
      userName: 'Demo Guest Visitor',
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
    },
    {
      id: 'demo-evt-9',
      eventType: 'workout_completed',
      uid: 'demo-u-rahul',
      userName: 'Rahul Nair',
      userEmail: 'rahul.nair@gmail.com',
      authProvider: 'google',
      platform: 'android_pwa',
      details: { workoutName: 'Thursday: Push Day', category: 'Push', totalVolume: 1520, durationMinutes: 44 },
      timestamp: now - 26 * hr,
      createdAt: new Date(now - 26 * hr).toISOString(),
      isDemo: true
    },
    {
      id: 'demo-evt-10',
      eventType: 'workout_completed',
      uid: 'demo-u-arjun',
      userName: 'Arjun Menon',
      userEmail: 'arjun.m@outlook.com',
      authProvider: 'email',
      platform: 'web',
      details: { workoutName: 'Saturday: Leg Day', category: 'Legs', totalVolume: 2150, durationMinutes: 50 },
      timestamp: now - 30 * hr,
      createdAt: new Date(now - 30 * hr).toISOString(),
      isDemo: true
    },
    {
      id: 'demo-evt-11',
      eventType: 'workout_completed',
      uid: 'demo-u-guest1',
      userName: 'Demo Guest Visitor',
      userEmail: 'Guest Visitor',
      authProvider: 'guest',
      platform: 'web',
      details: { workoutName: 'Freestyle Workout', category: 'Freestyle', totalVolume: 640, durationMinutes: 25 },
      timestamp: now - 10 * hr,
      createdAt: new Date(now - 10 * hr).toISOString(),
      isDemo: true
    },
    {
      id: 'demo-evt-12',
      eventType: 'cardio_logged',
      uid: 'demo-u-rahul',
      userName: 'Rahul Nair',
      userEmail: 'rahul.nair@gmail.com',
      authProvider: 'google',
      platform: 'android_pwa',
      details: { title: 'Post-Lift Light Walk', durationMinutes: 10 },
      timestamp: now - 11 * hr,
      createdAt: new Date(now - 11 * hr).toISOString(),
      isDemo: true
    },
    {
      id: 'demo-evt-13',
      eventType: 'cardio_logged',
      uid: 'demo-u-arjun',
      userName: 'Arjun Menon',
      userEmail: 'arjun.m@outlook.com',
      authProvider: 'email',
      platform: 'web',
      details: { title: 'Stationary Cycling Intervals', durationMinutes: 18 },
      timestamp: now - 15 * hr,
      createdAt: new Date(now - 15 * hr).toISOString(),
      isDemo: true
    },
    {
      id: 'demo-evt-14',
      eventType: 'food_logged',
      uid: 'demo-u-rahul',
      userName: 'Rahul Nair',
      userEmail: 'rahul.nair@gmail.com',
      authProvider: 'google',
      platform: 'android_pwa',
      details: { mealName: 'Kerala Fish + Matta Rice + Thoran', calories: 640 },
      timestamp: now - 8 * hr,
      createdAt: new Date(now - 8 * hr).toISOString(),
      isDemo: true
    },
    {
      id: 'demo-evt-15',
      eventType: 'food_logged',
      uid: 'demo-u-arjun',
      userName: 'Arjun Menon',
      userEmail: 'arjun.m@outlook.com',
      authProvider: 'email',
      platform: 'web',
      details: { mealName: 'Appam + 3 Boiled Eggs + Protein Shake', calories: 580 },
      timestamp: now - 14 * hr,
      createdAt: new Date(now - 14 * hr).toISOString(),
      isDemo: true
    },
    {
      id: 'demo-evt-16',
      eventType: 'food_logged',
      uid: 'demo-u-sneha',
      userName: 'Sneha Kurian',
      userEmail: 'sneha.k@gmail.com',
      authProvider: 'google',
      platform: 'android_pwa',
      details: { mealName: 'Chapathi + Paneer Bhurji', calories: 510 },
      timestamp: now - 7 * hr,
      createdAt: new Date(now - 7 * hr).toISOString(),
      isDemo: true
    },
    {
      id: 'demo-evt-17',
      eventType: 'ai_coach_asked',
      uid: 'demo-u-rahul',
      userName: 'Rahul Nair',
      userEmail: 'rahul.nair@gmail.com',
      authProvider: 'google',
      platform: 'android_pwa',
      details: { question: "Today's Kerala protein meals" },
      timestamp: now - 9 * hr,
      createdAt: new Date(now - 9 * hr).toISOString(),
      isDemo: true
    },
    {
      id: 'demo-evt-18',
      eventType: 'reel_link_saved',
      uid: 'demo-u-sneha',
      userName: 'Sneha Kurian',
      userEmail: 'sneha.k@gmail.com',
      authProvider: 'google',
      platform: 'android_pwa',
      details: { exerciseName: 'Wide-Grip Lat Pulldown', platform: 'instagram' },
      timestamp: now - 18 * hr,
      createdAt: new Date(now - 18 * hr).toISOString(),
      isDemo: true
    }
  ];

  saveToStorage(ANALYTICS_LOGS_KEY, [...realLogs, ...demoLogs]);
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

export const resetLocalAnalyticsAndResync = () => {
  saveToStorage(ANALYTICS_USERS_KEY, {});
  saveToStorage(ANALYTICS_LOGS_KEY, []);
  reconcileDeviceAnalytics();
};

export const exportAdminCsvReport = (users = [], logs = [], metrics = {}) => {
  const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

  const lines = [];
  lines.push('REPKRAFT ADMIN ANALYTICS REPORT');
  lines.push(`Generated At,${escapeCsv(new Date().toISOString())}`);
  lines.push(`Total Users,${metrics.totalUsers ?? users.length}`);
  lines.push(`Guest Users,${metrics.guestUsers ?? 0}`);
  lines.push(`PWA Installs,${metrics.pwaInstallCount ?? 0}`);
  lines.push(`Daily Active Users (Today),${metrics.dauToday ?? 0}`);
  lines.push(`Active Last 7 Days,${metrics.activeLast7Days ?? 0}`);
  lines.push(`Total Workouts Completed,${metrics.totalWorkouts ?? 0}`);
  lines.push(`Total Cardio Logs,${metrics.totalCardioLogs ?? 0}`);
  lines.push(`Total Nutrition Logs,${metrics.totalFoodLogs ?? 0}`);
  lines.push('');

  lines.push('USER DIRECTORY');
  lines.push('UID,Name,Email,Phone,Auth Provider,Device Type,Browser,Installed PWA,Platform,Timezone,Language,Workouts Completed,Cardio Logs,Food Logs,Sessions,Last Active');
  users.forEach((u) => {
    lines.push(
      [
        escapeCsv(u.uid),
        escapeCsv(u.name),
        escapeCsv(u.email),
        escapeCsv(u.phone || 'Not provided'),
        escapeCsv(u.authProvider),
        escapeCsv(normalizeDeviceType(u)),
        escapeCsv(u.browser || ''),
        Boolean(u.isInstalledPWA),
        escapeCsv(u.platform),
        escapeCsv(u.timezone || ''),
        escapeCsv(u.language || ''),
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
