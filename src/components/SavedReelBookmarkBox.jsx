import React, { useState } from 'react';
import { Bookmark, Plus, Trash2, ExternalLink, Video, Check, AlertCircle } from 'lucide-react';
import { useSavedReels } from '../utils/reelStorage';

export default function SavedReelBookmarkBox({ exerciseName, defaultOpen = false }) {
  const { getForExercise, addReel, deleteReel } = useSavedReels();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [savedNotice, setSavedNotice] = useState('');

  const exerciseLinks = getForExercise(exerciseName);

  const handleAddLink = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSavedNotice('');

    const res = addReel(exerciseName, urlInput, titleInput);
    if (!res.ok) {
      setErrorMsg(res.error || 'Could not save link.');
      return;
    }

    setUrlInput('');
    setTitleInput('');
    setSavedNotice(res.alreadySaved ? 'Updated & pinned!' : 'Saved for future reference!');
    setTimeout(() => setSavedNotice(''), 2500);
  };

  const handleDeleteLink = (id) => {
    deleteReel(exerciseName, id);
  };

  return (
    <div className="bg-slate-50 dark:bg-[#20242C] rounded-2xl p-3 border border-slate-200/80 dark:border-[#2D333B] space-y-2.5">
      <div className="flex items-center justify-between gap-2">
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

        <div className="flex items-center gap-2">
          {savedNotice && (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-[#A3E635] flex items-center gap-0.5 animate-in fade-in">
              <Check className="w-3 h-3 stroke-[3]" /> {savedNotice}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              setErrorMsg('');
            }}
            className="text-[11px] font-bold text-blue-600 dark:text-[#A3E635] hover:underline cursor-pointer"
          >
            {isOpen ? 'Close' : '+ Add Reel'}
          </button>
        </div>
      </div>

      {isOpen && (
        <form onSubmit={handleAddLink} noValidate className="space-y-2 pt-1.5 border-t border-slate-200/60 dark:border-[#2D333B] animate-in fade-in">
          <div>
            <input
              type="text"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="Paste Instagram Reel or Video URL (e.g. instagram.com/reel/...)"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#181B20] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs font-mono outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Note/Title (e.g. Wide-grip form cue)"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#181B20] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1 active:scale-95 transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Save
            </button>
          </div>
          {errorMsg && (
            <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errorMsg}
            </p>
          )}
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
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
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
