// Firebase & Local Fallback Authentication Service
// Seamlessly handles Google Sign-In, Email/Password, and Guest Mode.
// If Firebase environment variables are not yet provided, gracefully falls back to instant demo auth
// so the application never breaks or crashes on local preview or live deployments.

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
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
  } catch (err) {
    console.warn('Firebase initialization error, fallback auth enabled:', err);
  }
}

const AUTH_STORAGE_KEY = 'repkraft_user_auth';

// Retrieve initial user from storage
export const getStoredUser = () => {
  return loadFromStorage(AUTH_STORAGE_KEY, null);
};

// Save user to storage
export const persistUser = (userObj) => {
  saveToStorage(AUTH_STORAGE_KEY, userObj);
};

// 1. Google Sign-In
export const loginWithGoogle = async () => {
  if (isFirebaseConfigured && auth && googleProvider) {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userData = {
      uid: user.uid,
      displayName: user.displayName || 'Athlete',
      email: user.email,
      photoURL: user.photoURL || '',
      isGuest: false,
      provider: 'google'
    };
    persistUser(userData);
    return userData;
  } else {
    // Demo Google Auth Fallback
    const demoUser = {
      uid: `demo-google-${Date.now()}`,
      displayName: 'Google Athlete',
      email: 'athlete@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isGuest: false,
      provider: 'google-demo'
    };
    persistUser(demoUser);
    return demoUser;
  }
};

// 2. Email & Password Sign Up
export const signUpWithEmail = async (name, email, password) => {
  if (isFirebaseConfigured && auth) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name && cred.user) {
      await updateProfile(cred.user, { displayName: name });
    }
    const userData = {
      uid: cred.user.uid,
      displayName: name || 'Athlete',
      email: cred.user.email,
      photoURL: '',
      isGuest: false,
      provider: 'email'
    };
    persistUser(userData);
    return userData;
  } else {
    // Local Fallback Email Sign Up
    const localUser = {
      uid: `local-${Date.now()}`,
      displayName: name || email.split('@')[0],
      email,
      photoURL: '',
      isGuest: false,
      provider: 'email-local'
    };
    persistUser(localUser);
    return localUser;
  }
};

// 3. Email & Password Login
export const loginWithEmail = async (email, password) => {
  if (isFirebaseConfigured && auth) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const userData = {
      uid: cred.user.uid,
      displayName: cred.user.displayName || email.split('@')[0],
      email: cred.user.email,
      photoURL: cred.user.photoURL || '',
      isGuest: false,
      provider: 'email'
    };
    persistUser(userData);
    return userData;
  } else {
    // Local Fallback Email Login
    const localUser = {
      uid: `local-${Date.now()}`,
      displayName: email.split('@')[0],
      email,
      photoURL: '',
      isGuest: false,
      provider: 'email-local'
    };
    persistUser(localUser);
    return localUser;
  }
};

// 4. Password Reset
export const resetPassword = async (email) => {
  if (isFirebaseConfigured && auth) {
    await sendPasswordResetEmail(auth, email);
    return true;
  } else {
    // Mock reset success
    return true;
  }
};

// 5. Continue as Guest Mode
export const loginAsGuest = () => {
  const guestUser = {
    uid: `guest-${Date.now()}`,
    displayName: 'Guest Lifter',
    email: null,
    photoURL: '',
    isGuest: true,
    provider: 'guest'
  };
  persistUser(guestUser);
  return guestUser;
};

// 6. Sign Out
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
