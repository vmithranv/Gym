// Firebase & Local Account Authentication Service
// Supports live Firebase Auth (Google Popup + Mobile Redirect fallback, Email/Password, Password Reset)
// AND a complete local account registry when Firebase env variables are not configured.

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { loadFromStorage, saveToStorage } from './storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'your_api_key_here' &&
  firebaseConfig.authDomain
);

let app = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (err) {
    console.warn('Firebase initialization error, local account auth enabled:', err);
  }
}

export const getFirebaseApp = () => app;

const AUTH_STORAGE_KEY = 'repkraft_user_auth';
const LOCAL_ACCOUNTS_KEY = 'repkraft_local_accounts';

const makeAuthError = (code, message) => {
  const err = new Error(message);
  err.code = code;
  return err;
};

/**
 * Deterministic password hash supporting both HTTPS/localhost (crypto.subtle) and HTTP LAN testing.
 */
const hashPassword = async (password, normalizedEmail) => {
  const salted = `repkraft:${normalizedEmail}:${password}`;
  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const encoded = new TextEncoder().encode(salted);
      const buf = await window.crypto.subtle.digest('SHA-256', encoded);
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {
    // Fallback below for non-secure contexts (e.g., LAN IP over HTTP on phone)
  }

  let h1 = 0xdeadbeef ^ salted.length;
  let h2 = 0x41c6ce57 ^ salted.length;
  for (let i = 0; i < salted.length; i++) {
    const ch = salted.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `fb-${(h2 >>> 0).toString(16)}-${(h1 >>> 0).toString(16)}`;
};

const loadLocalAccounts = () => {
  const raw = loadFromStorage(LOCAL_ACCOUNTS_KEY, {});
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
};

const saveLocalAccounts = (accountsMap) => {
  const ok = saveToStorage(LOCAL_ACCOUNTS_KEY, accountsMap);
  if (!ok) {
    throw makeAuthError('auth/storage-error', 'Browser storage is unavailable. Allow site storage and try again.');
  }
};

const mapFirebaseUser = (fbUser) => ({
  uid: fbUser.uid,
  displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Athlete',
  email: fbUser.email || '',
  photoURL: fbUser.photoURL || '',
  isGuest: false,
  provider: fbUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email'
});

export const formatAuthError = (err) => {
  if (!err) return 'Authentication failed. Please try again.';
  const code = err.code || '';
  switch (code) {
    case 'auth/user-not-found':
      return err.message || 'No account found with this email. Please Sign Up first.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return err.message || 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Try logging in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups or try again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in window was closed before completing login.';
    case 'auth/unauthorized-domain': {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      return `Domain "${host}" is not authorized in Firebase Console > Authentication > Settings > Authorized domains.`;
    }
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is not enabled yet in Firebase Console > Authentication > Sign-in method.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment before trying again.';
    case 'auth/network-request-failed':
      return 'Network error while connecting to Firebase. Check your internet connection.';
    default:
      return err.message || 'Authentication failed. Please check your details.';
  }
};

// Retrieve initial user from storage
export const getStoredUser = () => {
  return loadFromStorage(AUTH_STORAGE_KEY, null);
};

// Save user to storage
export const persistUser = (userObj) => {
  saveToStorage(AUTH_STORAGE_KEY, userObj);
};

/**
 * Syncs Firebase redirect sign-in results and active Firebase auth state on startup.
 */
export const initAuthListener = (onUserSynced) => {
  if (!isFirebaseConfigured || !auth) {
    return () => {};
  }

  getRedirectResult(auth)
    .then((result) => {
      if (result?.user) {
        const userData = mapFirebaseUser(result.user);
        persistUser(userData);
        onUserSynced(userData);
      }
    })
    .catch((err) => {
      console.warn('Redirect sign-in error:', err);
    });

  const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
    if (fbUser) {
      const userData = mapFirebaseUser(fbUser);
      persistUser(userData);
      onUserSynced(userData);
    }
  });

  return unsubscribe;
};

// 1. Google Sign-In (Firebase Popup with Mobile/PWA Redirect Fallback)
export const loginWithGoogle = async () => {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw makeAuthError(
      'auth/firebase-not-configured',
      'Live Google OAuth requires Firebase configuration.'
    );
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const userData = mapFirebaseUser(result.user);
    persistUser(userData);
    return userData;
  } catch (err) {
    // On mobile PWAs / restricted webviews, fall back cleanly to full-page redirect
    if (
      err?.code === 'auth/popup-blocked' ||
      err?.code === 'auth/operation-not-supported-in-this-environment'
    ) {
      await signInWithRedirect(auth, googleProvider);
      return { redirecting: true };
    }
    throw err;
  }
};

// 1b. Offline / Local Device Profile with Name & Gmail (when Firebase isn't configured)
export const loginWithLocalGoogleProfile = (name, email) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (name || '').trim() || cleanEmail.split('@')[0] || 'Athlete';
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    throw makeAuthError('auth/invalid-email', 'Please enter a valid Gmail or email address.');
  }

  const accounts = loadLocalAccounts();
  const existing = accounts[cleanEmail];
  const uid = existing?.uid || `local-google-${Date.now()}`;

  const userData = {
    uid,
    displayName: cleanName,
    email: cleanEmail,
    photoURL: existing?.photoURL || '',
    isGuest: false,
    provider: 'google-local'
  };

  if (!existing) {
    accounts[cleanEmail] = {
      uid,
      displayName: cleanName,
      email: cleanEmail,
      passwordHash: null,
      provider: 'google-local',
      createdAt: new Date().toISOString()
    };
    saveLocalAccounts(accounts);
  } else if (cleanName && existing.displayName !== cleanName) {
    accounts[cleanEmail] = { ...existing, displayName: cleanName };
    saveLocalAccounts(accounts);
  }

  persistUser(userData);
  return userData;
};

// 2. Email & Password Sign Up
export const signUpWithEmail = async (name, email, password) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (name || '').trim();

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw makeAuthError('auth/invalid-email', 'Please enter a valid email address.');
  }
  if (!password || password.length < 6) {
    throw makeAuthError('auth/weak-password', 'Password must be at least 6 characters.');
  }

  if (isFirebaseConfigured && auth) {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    if (cleanName && cred.user) {
      await updateProfile(cred.user, { displayName: cleanName });
    }
    const userData = {
      uid: cred.user.uid,
      displayName: cleanName || cleanEmail.split('@')[0],
      email: cred.user.email,
      photoURL: '',
      isGuest: false,
      provider: 'email'
    };
    persistUser(userData);
    return userData;
  }

  const accounts = loadLocalAccounts();
  if (accounts[cleanEmail]) {
    throw makeAuthError(
      'auth/email-already-in-use',
      'An account already exists with this email address. Try logging in instead.'
    );
  }

  const passwordHash = await hashPassword(password, cleanEmail);
  const uid = `local-${Date.now()}`;
  const displayName = cleanName || cleanEmail.split('@')[0];

  accounts[cleanEmail] = {
    uid,
    displayName,
    email: cleanEmail,
    passwordHash,
    provider: 'email-local',
    createdAt: new Date().toISOString()
  };
  saveLocalAccounts(accounts);

  const localUser = {
    uid,
    displayName,
    email: cleanEmail,
    photoURL: '',
    isGuest: false,
    provider: 'email-local'
  };
  persistUser(localUser);
  return localUser;
};

// 3. Email & Password Login
export const loginWithEmail = async (email, password) => {
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw makeAuthError('auth/invalid-email', 'Please enter a valid email address.');
  }
  if (!password || password.length < 6) {
    throw makeAuthError('auth/wrong-password', 'Password must be at least 6 characters.');
  }

  if (isFirebaseConfigured && auth) {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const userData = {
      uid: cred.user.uid,
      displayName: cred.user.displayName || cleanEmail.split('@')[0],
      email: cred.user.email,
      photoURL: cred.user.photoURL || '',
      isGuest: false,
      provider: 'email'
    };
    persistUser(userData);
    return userData;
  }

  const accounts = loadLocalAccounts();
  const account = accounts[cleanEmail];
  if (!account) {
    throw makeAuthError(
      'auth/user-not-found',
      'No account found for this email on this device. Switch to Sign Up to create one.'
    );
  }

  if (!account.passwordHash) {
    throw makeAuthError(
      'auth/wrong-password',
      'This email was saved without a password. Tap "Forgot?" to set a password for it.'
    );
  }

  const attemptedHash = await hashPassword(password, cleanEmail);
  if (attemptedHash !== account.passwordHash) {
    throw makeAuthError('auth/wrong-password', 'Incorrect password. Try again or tap Forgot? to reset.');
  }

  const localUser = {
    uid: account.uid,
    displayName: account.displayName || cleanEmail.split('@')[0],
    email: account.email,
    photoURL: account.photoURL || '',
    isGuest: false,
    provider: 'email-local'
  };
  persistUser(localUser);
  return localUser;
};

// 4. Password Reset (Firebase email reset OR direct local password update)
export const resetPassword = async (email, newPassword = '') => {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw makeAuthError('auth/invalid-email', 'Please enter a valid email address.');
  }

  if (isFirebaseConfigured && auth) {
    await sendPasswordResetEmail(auth, cleanEmail);
    return { mode: 'firebase' };
  }

  const accounts = loadLocalAccounts();
  const account = accounts[cleanEmail];
  if (!account) {
    throw makeAuthError(
      'auth/user-not-found',
      'No local account found for this email. Please Sign Up to create one.'
    );
  }

  if (!newPassword || newPassword.length < 6) {
    throw makeAuthError('auth/weak-password', 'New password must be at least 6 characters.');
  }

  accounts[cleanEmail] = {
    ...account,
    passwordHash: await hashPassword(newPassword, cleanEmail)
  };
  saveLocalAccounts(accounts);
  return { mode: 'local' };
};

// 5. Update Display Name across auth session & account record
export const updateUserDisplayName = async (newName) => {
  const cleanName = (newName || '').trim();
  if (!cleanName) return getStoredUser();

  if (isFirebaseConfigured && auth?.currentUser) {
    try {
      await updateProfile(auth.currentUser, { displayName: cleanName });
    } catch (err) {
      console.warn('Could not update Firebase display name:', err);
    }
  }

  const current = getStoredUser();
  if (current) {
    const updated = { ...current, displayName: cleanName };
    persistUser(updated);

    if (current.email) {
      const accounts = loadLocalAccounts();
      const key = current.email.toLowerCase();
      if (accounts[key]) {
        accounts[key] = { ...accounts[key], displayName: cleanName };
        saveLocalAccounts(accounts);
      }
    }
    return updated;
  }
  return null;
};

// 6. Continue as Guest Mode
export const loginAsGuest = () => {
  const existing = getStoredUser();
  const guestUser = {
    uid: existing?.isGuest ? existing.uid : `guest-${Date.now()}`,
    displayName: 'Guest Lifter',
    email: null,
    photoURL: '',
    isGuest: true,
    provider: 'guest'
  };
  persistUser(guestUser);
  return guestUser;
};

// 7. Sign Out
export const logoutUser = async () => {
  if (isFirebaseConfigured && auth) {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
  }
  localStorage.removeItem(AUTH_STORAGE_KEY);
};
