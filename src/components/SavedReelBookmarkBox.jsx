import React, { useState } from 'react';
import { Bookmark, Plus, Trash2, ExternalLink, Video } from 'lucide-react';
import { loadFromStorage, saveToStorage } from '../utils/storage';

export default function SavedReelBookmarkBox({ exerciseName }) {
  const storageKey = 'saved_reel_links';
  const [linksMap, setLinksMap] = useState(() => loadFromStorage(storageKey, {}));
  const [isOpen, setIsOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');

  const exerciseLinks = linksMap[exerciseName] || [];

  const handleAddLink = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    // Validate or clean up URL
    let cleanUrl = urlInput.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const newLink = {
      id: `link-${Date.now()}`,
      url: cleanUrl,
      title: titleInput.trim() || 'Instagram Reel / Form Tip',
      addedAt: new Date().toLocaleDateString()
    };

    const updatedList = [newLink, ...exerciseLinks];
    const updatedMap = {
      ...linksMap,
      [exerciseName]: updatedList
    };

    setLinksMap(updatedMap);
    saveToStorage(storageKey, updatedMap);
    setUrlInput('');
    setTitleInput('');
  };

  const handleDeleteLink = (id) => {
    const updatedList = exerciseLinks.filter((l) => l.id !== id);
    const updatedMap = {
      ...linksMap,
      [exerciseName]: updatedList
    };
    setLinksMap(updatedMap);
    saveToStorage(storageKey, updatedMap);
  };

  return (
    <div className="bg-slate-50 dark:bg-[#20242C] rounded-2xl p-3 border border-slate-200/80 dark:border-[#2D333B] space-y-2.5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider hover:text-blue-600 dark:hover:text-[#A3E635] transition-colors cursor-pointer"
        >
          <Video className="w-3.5 h-3.5 text-pink-500" />
          <span>Saved Reel Links</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-[#2D333B] text-slate-700 dark:text-slate-300 ml-1">
            {exerciseLinks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-[11px] font-bold text-blue-600 dark:text-[#A3E635] hover:underline cursor-pointer"
        >
          {isOpen ? 'Close' : '+ Add Reel'}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleAddLink} className="space-y-2 pt-1 border-t border-slate-200/60 dark:border-[#2D333B] animate-in fade-in">
          <div>
            <input
              type="url"
              placeholder="Paste Instagram Reel or Video URL..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#181B20] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs font-mono outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Note/Title (e.g. Wide-grip form cue)"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#181B20] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </form>
      )}

      {/* List of Saved Reel Link Chips */}
      {exerciseLinks.length > 0 ? (
        <div className="space-y-1.5 pt-1">
          {exerciseLinks.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-[#181B20] border border-slate-200/70 dark:border-[#2D333B] text-xs shadow-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Bookmark className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                    {link.title}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate block">
                    {link.url}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 hover:bg-pink-100 font-bold text-[11px] flex items-center gap-1 transition-colors"
                  title="Open directly in Instagram or new tab"
                >
                  <span>Open Reel</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={() => handleDeleteLink(link.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                  title="Delete bookmark"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isOpen && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
            No saved reel links yet. Tap "+ Add Reel" to bookmark your favorite trainer's Instagram reel.
          </p>
        )
      )}
    </div>
  );
}
