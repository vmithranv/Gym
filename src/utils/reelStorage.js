import { useState, useEffect, useCallback, useMemo } from 'react';
import { loadFromStorage, saveToStorage } from './storage';
import { logAnalyticsEvent } from './analyticsService';

export const REELS_STORAGE_KEY = 'saved_reel_links';
export const REELS_UPDATED_EVENT = 'repkraft:reels-updated';
export const GENERAL_REELS_KEY = 'General Workout & Form Tips';

/**
 * Normalizes and validates pasted reel/video URLs, including Instagram share-sheet text.
 */
export const normalizeReelUrl = (rawInput) => {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) {
    return { ok: false, error: 'Please paste an Instagram Reel or video URL.' };
  }

  // Extract first http(s) URL if user pasted share text alongside a link
  const httpMatch = trimmed.match(/https?:\/\/[^\s"'<>]+/i);
  let candidate = httpMatch ? httpMatch[0] : trimmed.split(/\s+/)[0];

  // Clean common trailing punctuation from share copy
  candidate = candidate.replace(/[.,;!?)]+$/, '');

  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return {
      ok: false,
      error: 'Please enter a valid link (e.g. https://www.instagram.com/reel/...).'
    };
  }

  const host = parsed.hostname.toLowerCase();
  if (!host.includes('.') && host !== 'localhost') {
    return {
      ok: false,
      error: 'Link must be a valid website URL (e.g. instagram.com/reel/... or youtu.be/...).'
    };
  }

  let platform = 'web';
  let defaultTitle = 'Saved Video / Form Tip';
  if (host.includes('instagram.com') || host.includes('instagr.am')) {
    platform = 'instagram';
    defaultTitle = 'Instagram Reel / Form Tip';
  } else if (host.includes('youtube.com') || host.includes('youtu.be')) {
    platform = 'youtube';
    defaultTitle = 'YouTube Tutorial / Short';
  } else if (host.includes('tiktok.com')) {
    platform = 'tiktok';
    defaultTitle = 'TikTok Form Tip';
  }

  return {
    ok: true,
    url: parsed.toString(),
    platform,
    defaultTitle
  };
};

/**
 * Checks whether a URL points to a social video page rather than a direct image file.
 */
export const isVideoPageUrl = (rawUrl) => {
  const lower = (rawUrl || '').toLowerCase();
  return (
    lower.includes('instagram.com') ||
    lower.includes('instagr.am') ||
    lower.includes('youtube.com') ||
    lower.includes('youtu.be') ||
    lower.includes('tiktok.com') ||
    lower.endsWith('.mp4') ||
    lower.endsWith('.mov')
  );
};

export const loadSavedReelsMap = () => {
  const raw = loadFromStorage(REELS_STORAGE_KEY, {});
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  return raw;
};

const notifyReelsUpdated = () => {
  window.dispatchEvent(new CustomEvent(REELS_UPDATED_EVENT));
};

/**
 * Adds a reel link using a fresh read from localStorage so sibling components never overwrite each other.
 */
export const addSavedReel = (exerciseName, rawUrl, customTitle = '') => {
  const parsed = normalizeReelUrl(rawUrl);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const key = (exerciseName || GENERAL_REELS_KEY).trim() || GENERAL_REELS_KEY;
  const freshMap = loadSavedReelsMap();
  const currentList = Array.isArray(freshMap[key]) ? freshMap[key] : [];

  const cleanedTitle = (customTitle || '').trim() || parsed.defaultTitle;
  const existingIdx = currentList.findIndex(
    (item) => (item.url || '').toLowerCase() === parsed.url.toLowerCase()
  );

  let updatedList;
  let savedLink;
  if (existingIdx >= 0) {
    // Update title if provided and move existing bookmark to top instead of duplicating
    const existing = currentList[existingIdx];
    savedLink = {
      ...existing,
      title: (customTitle || '').trim() || existing.title || parsed.defaultTitle,
      addedAt: new Date().toLocaleDateString()
    };
    updatedList = [savedLink, ...currentList.filter((_, i) => i !== existingIdx)];
  } else {
    savedLink = {
      id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      url: parsed.url,
      title: cleanedTitle,
      platform: parsed.platform,
      addedAt: new Date().toLocaleDateString(),
      createdAt: Date.now()
    };
    updatedList = [savedLink, ...currentList];
  }

  const updatedMap = {
    ...freshMap,
    [key]: updatedList
  };

  const persisted = saveToStorage(REELS_STORAGE_KEY, updatedMap);
  if (!persisted) {
    return {
      ok: false,
      error: 'Could not save to browser storage. Check private browsing or storage quota.'
    };
  }

  notifyReelsUpdated();
  logAnalyticsEvent('reel_link_saved', {
    exerciseName: key,
    platform: parsed.platform,
    title: cleanedTitle
  });
  return { ok: true, link: savedLink, map: updatedMap, alreadySaved: existingIdx >= 0 };
};

export const deleteSavedReel = (exerciseName, linkId) => {
  const key = (exerciseName || GENERAL_REELS_KEY).trim() || GENERAL_REELS_KEY;
  const freshMap = loadSavedReelsMap();
  const currentList = Array.isArray(freshMap[key]) ? freshMap[key] : [];
  const filteredList = currentList.filter((l) => l.id !== linkId);

  const updatedMap = { ...freshMap };
  if (filteredList.length > 0) {
    updatedMap[key] = filteredList;
  } else {
    delete updatedMap[key];
  }

  saveToStorage(REELS_STORAGE_KEY, updatedMap);
  notifyReelsUpdated();
  return updatedMap;
};

export const getAllSavedReelsFlat = (linksMap) => {
  const map = linksMap || loadSavedReelsMap();
  const flattened = [];
  Object.entries(map).forEach(([exerciseName, list]) => {
    if (Array.isArray(list)) {
      list.forEach((item) => {
        if (item && item.url) {
          flattened.push({ ...item, exerciseName });
        }
      });
    }
  });
  return flattened.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
};

/**
 * Shared reactive hook keeping all components synced with saved reel bookmarks in localStorage.
 */
export function useSavedReels() {
  const [linksMap, setLinksMap] = useState(() => loadSavedReelsMap());

  useEffect(() => {
    const sync = () => {
      setLinksMap(loadSavedReelsMap());
    };

    window.addEventListener(REELS_UPDATED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(REELS_UPDATED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const addReel = useCallback((exerciseName, rawUrl, customTitle = '') => {
    return addSavedReel(exerciseName, rawUrl, customTitle);
  }, []);

  const deleteReel = useCallback((exerciseName, linkId) => {
    return deleteSavedReel(exerciseName, linkId);
  }, []);

  const getForExercise = useCallback(
    (exerciseName) => {
      const key = (exerciseName || GENERAL_REELS_KEY).trim() || GENERAL_REELS_KEY;
      return Array.isArray(linksMap[key]) ? linksMap[key] : [];
    },
    [linksMap]
  );

  const allReels = useMemo(() => getAllSavedReelsFlat(linksMap), [linksMap]);

  return {
    linksMap,
    allReels,
    totalReelsCount: allReels.length,
    getForExercise,
    addReel,
    deleteReel
  };
}
