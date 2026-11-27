import React, { useState } from 'react';
import {
  Bookmark,
  Plus,
  Trash2,
  ExternalLink,
  Video,
  Check,
  AlertCircle,
  PlayCircle,
  Play
} from 'lucide-react';
import { useSavedReels } from '../utils/reelStorage';
import { extractYoutubeId } from '../utils/exerciseData';

export default function SavedReelBookmarkBox({ exerciseName, defaultOpen = false }) {
  const { getForExercise, addReel, deleteReel } = useSavedReels();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [linkMode, setLinkMode] = useState('youtube'); // 'youtube' | 'reel'
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [savedNotice, setSavedNotice] = useState('');
  const [playingId, setPlayingId] = useState(null);

  const exerciseLinks = getForExercise(exerciseName);

  const openComposer = (mode) => {
    setLinkMode(mode);
    setIsOpen(true);
    setErrorMsg('');
  };

  const handleAddLink = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSavedNotice('');

    if (linkMode === 'youtube') {
      const ytId = extractYoutubeId(urlInput);
      const isYoutubeHost = /youtube\.com|youtu\.be/i.test(urlInput);
      if (!ytId && !isYoutubeHost) {
        setErrorMsg('Please paste a valid YouTube link (youtube.com/watch?v=..., youtu.be/..., or youtube.com/shorts/...).');
        return;
      }
    }

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
    if (playingId === id) setPlayingId(null);
    deleteReel(exerciseName, id);
  };

  return (
    <div className="bg-slate-50 dark:bg-[#20242C] rounded-2xl p-3 border border-slate-200/80 dark:border-[#2D333B] space-y-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider hover:text-blue-600 dark:hover:text-[#A3E635] transition-colors cursor-pointer"
        >
          <Video className="w-3.5 h-3.5 text-pink-500" />
          <span>Saved Reels & YouTube</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-[#2D333B] text-slate-700 dark:text-slate-300 ml-0.5">
            {exerciseLinks.length}
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          {savedNotice && (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-[#A3E635] flex items-center gap-0.5 animate-in fade-in">
              <Check className="w-3 h-3 stroke-[3]" /> {savedNotice}
            </span>
          )}
          {isOpen ? (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setErrorMsg('');
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer px-1.5"
            >
              Close
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openComposer('youtube')}
                className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-extrabold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" /> + YouTube
              </button>
              <button
                type="button"
                onClick={() => openComposer('reel')}
                className="px-2 py-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/20 text-[10px] font-extrabold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              >
                <Bookmark className="w-3 h-3" /> + Reel
              </button>
            </>
          )}
        </div>
      </div>

      {isOpen && (
        <form onSubmit={handleAddLink} noValidate className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-[#2D333B] animate-in fade-in">
          <div className="grid grid-cols-2 gap-1.5 bg-white dark:bg-[#181B20] p-1 rounded-xl border border-slate-200/80 dark:border-[#2D333B]">
            <button
              type="button"
              onClick={() => {
                setLinkMode('youtube');
                setErrorMsg('');
              }}
              className={`py-1.5 rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                linkMode === 'youtube'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" /> YouTube URL
            </button>
            <button
              type="button"
              onClick={() => {
                setLinkMode('reel');
                setErrorMsg('');
              }}
              className={`py-1.5 rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                linkMode === 'reel'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" /> Reels Link
            </button>
          </div>

          <div>
            <input
              type="text"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder={
                linkMode === 'youtube'
                  ? 'Paste YouTube URL (youtube.com/watch?v=... or youtu.be/...)'
                  : 'Paste Instagram Reel / TikTok link (instagram.com/reel/...)'
              }
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
              placeholder={
                linkMode === 'youtube'
                  ? 'Note/Title (e.g. Jeff Nippard form cue)'
                  : 'Note/Title (e.g. Wide-grip reel tip)'
              }
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#181B20] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className={`px-3.5 py-2 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1 active:scale-95 transition-all shadow-sm cursor-pointer shrink-0 ${
                linkMode === 'youtube'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Save {linkMode === 'youtube' ? 'YouTube' : 'Reel'}
            </button>
          </div>
          {errorMsg && (
            <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errorMsg}
            </p>
          )}
        </form>
      )}

      {/* List of Saved YouTube & Reel Bookmarks */}
      {exerciseLinks.length > 0 ? (
        <div className="space-y-1.5 pt-1">
          {exerciseLinks.map((link) => {
            const ytId = extractYoutubeId(link.url);
            const isYoutube = link.platform === 'youtube' || Boolean(ytId);
            const isPlaying = playingId === link.id && Boolean(ytId);

            return (
              <div
                key={link.id}
                className="rounded-xl bg-white dark:bg-[#181B20] border border-slate-200/70 dark:border-[#2D333B] text-xs shadow-xs overflow-hidden"
              >
                <div className="flex items-center justify-between gap-2 p-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {isYoutube ? (
                      <Play className="w-4 h-4 text-rose-600 fill-rose-600 shrink-0" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full ${
                            isYoutube
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              : 'bg-pink-500/15 text-pink-600 dark:text-pink-400'
                          }`}
                        >
                          {isYoutube ? 'YouTube' : 'Reel'}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {link.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block font-mono">
                        {link.url}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {ytId && (
                      <button
                        type="button"
                        onClick={() => setPlayingId(isPlaying ? null : link.id)}
                        className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                        title={isPlaying ? 'Hide YouTube Player' : 'Play YouTube Video'}
                      >
                        <PlayCircle className="w-3 h-3" />
                        <span>{isPlaying ? 'Hide' : 'Watch'}</span>
                      </button>
                    )}

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors ${
                        isYoutube
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
                          : 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 hover:bg-pink-100'
                      }`}
                      title="Open link in new tab"
                    >
                      <span>{isYoutube ? 'Open' : 'Open Reel'}</span>
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

                {isPlaying && ytId && (
                  <div className="aspect-video w-full bg-black border-t border-slate-200 dark:border-[#2D333B]">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&playsinline=1`}
                      title={link.title || `${exerciseName} YouTube Video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        !isOpen && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
            No custom links saved yet. Tap "+ YouTube" or "+ Reel" to save your favorite tutorials.
          </p>
        )
      )}
    </div>
  );
}
