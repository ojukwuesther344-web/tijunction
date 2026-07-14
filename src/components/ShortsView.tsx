/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useSocial } from '../context/SocialContext';
import { Reel } from '../types';
import { 
  Heart, MessageSquare, Share2, Upload, X, Play, Music, Volume2, VolumeX, Sparkles, ArrowLeft,
  ChevronUp, ChevronDown, Radio, Camera, RefreshCw, Users, Mic, MicOff, Send, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ShortsView() {
  const { reels, createReel, toggleLikeReel, currentUser, setActiveTab, uploadMediaFile } = useSocial();
  const [activeReelIdx, setActiveReelIdx] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for up (previous), 1 for down (next)
  const [isMuted, setIsMuted] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [likedAnimMap, setLikedAnimMap] = useState<{ [reelId: string]: boolean }>({});
  
  const [reelFile, setReelFile] = useState<File | null>(null);
  const [reelUploadLoading, setReelUploadLoading] = useState(false);
  const reelFileInputRef = useRef<HTMLInputElement>(null);

  const touchStartY = useRef<number | null>(null);
  const lastScrollTime = useRef<number>(0);

  const handlePrevReel = () => {
    if (activeReelIdx > 0) {
      setDirection(-1);
      setActiveReelIdx(activeReelIdx - 1);
    }
  };

  const handleNextReel = () => {
    if (activeReelIdx < reels.length - 1) {
      setDirection(1);
      setActiveReelIdx(activeReelIdx + 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showUploadModal) return;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevReel();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNextReel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReelIdx, reels.length, showUploadModal]);

  const handleWheel = (e: React.WheelEvent) => {
    if (showUploadModal) return;
    const now = Date.now();
    if (now - lastScrollTime.current < 700) return; // scroll cooldown
    
    if (e.deltaY > 20) {
      handleNextReel();
      lastScrollTime.current = now;
    } else if (e.deltaY < -20) {
      handlePrevReel();
      lastScrollTime.current = now;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (showUploadModal) return;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (showUploadModal || touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchEndY - touchStartY.current;
    
    if (diff < -30) {
      handleNextReel();
    } else if (diff > 30) {
      handlePrevReel();
    }
    touchStartY.current = null;
  };

  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [durationError, setDurationError] = useState<string | null>(null);

  // Preset academic loops for easier sandbox testing
  const videoTemplates = [
    {
      title: '💻 Tech Lab Loop',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-web-designer-working-on-his-laptop-at-home-vertical-40292-large.mp4',
    },
    {
      title: '🎓 School Campus Promenade',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-undergrad-students-walking-on-school-campus-41618-large.mp4',
    },
    {
      title: '🎸 Live Concert Crowds',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-group-of-friends-having-fun-at-a-music-festival-vertical-39745-large.mp4',
    },
    {
      title: '🎥 Mobile Video Concert',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-smartphone-showing-a-video-of-a-live-concert-vertical-39746-large.mp4',
    },
  ];

  const getVideoDuration = (fileOrUrl: File | string): Promise<number> => {
    return new Promise((resolve) => {
      try {
        if (!fileOrUrl) {
          resolve(0);
          return;
        }
        if (typeof document === 'undefined') {
          resolve(0);
          return;
        }
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;
        
        let objectUrl = '';
        if (typeof fileOrUrl === 'string') {
          video.src = fileOrUrl;
        } else {
          try {
            objectUrl = URL.createObjectURL(fileOrUrl as any);
            video.src = objectUrl;
          } catch (urlErr) {
            console.error("Failed to create object URL:", urlErr);
            resolve(0);
            return;
          }
        }
        
        const onLoaded = () => {
          if (objectUrl) {
            try {
              URL.revokeObjectURL(objectUrl);
            } catch (e) {}
          }
          resolve(video.duration || 0);
          cleanup();
        };
        
        const onError = () => {
          if (objectUrl) {
            try {
              URL.revokeObjectURL(objectUrl);
            } catch (e) {}
          }
          resolve(0); // Return 0 as fallback
          cleanup();
        };
        
        const cleanup = () => {
          video.removeEventListener('loadedmetadata', onLoaded);
          video.removeEventListener('error', onError);
        };
        
        video.addEventListener('loadedmetadata', onLoaded);
        video.addEventListener('error', onError);
        video.load();
      } catch (err) {
        console.error("Exception in getVideoDuration body:", err);
        resolve(0);
      }
    });
  };

  useEffect(() => {
    if (!videoUrl && !reelFile) {
      setVideoDuration(null);
      setDurationError(null);
      return;
    }

    let isCancelled = false;
    const validate = async () => {
      const target = reelFile || videoUrl;
      if (!target) return;

      const duration = await getVideoDuration(target);
      if (isCancelled) return;

      setVideoDuration(duration);
      if (duration > 20) {
        setDurationError(`Video is too long (${Math.round(duration)}s). Shorts must be between 0 and 20 seconds.`);
      } else {
        setDurationError(null);
      }
    };

    validate();

    return () => {
      isCancelled = true;
    };
  }, [videoUrl, reelFile]);

  const handleDoubleTapLike = (reelId: string) => {
    toggleLikeReel(reelId);
    setLikedAnimMap(prev => ({ ...prev, [reelId]: true }));
    setTimeout(() => {
      setLikedAnimMap(prev => ({ ...prev, [reelId]: false }));
    }, 850);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set loading state immediately so the publish button gives instant feedback and loads fast
    setReelUploadLoading(true);
    
    try {
      // Use pre-calculated duration from state to bypass slow loading checks, otherwise fallback safely
      let duration = videoDuration;
      if (duration === null) {
        const fileOrUrl = reelFile || videoUrl || videoTemplates[0].url;
        try {
          duration = await getVideoDuration(fileOrUrl);
        } catch (err) {
          console.warn("Could not retrieve video duration", err);
        }
      }

      if (duration !== null && duration > 20) {
        const errorMsg = `Upload blocked: Video duration is ${Math.round(duration)} seconds. Shorts must be between 0 and 20 seconds.`;
        alert(errorMsg);
        setDurationError(errorMsg);
        setReelUploadLoading(false);
        return;
      }

      let finalUrl = videoUrl;
      if (reelFile) {
        finalUrl = await uploadMediaFile(reelFile, 'reels');
      } else {
        finalUrl = videoUrl || videoTemplates[0].url;
      }
      
      // If uploadMediaFile fell back to a blob URL, we keep videoUrl (the Base64 Data URL) as the finalUrl 
      // because Base64 Data URLs play successfully inside sandboxed iframes unlike blocked blob URLs.
      if (finalUrl.startsWith('blob:') && videoUrl && videoUrl.startsWith('data:')) {
        finalUrl = videoUrl;
      }

      await createReel(finalUrl, caption);
      setVideoUrl('');
      setCaption('');
      setReelFile(null);
      setVideoDuration(null);
      setDurationError(null);
      setShowUploadModal(false);
      setActiveReelIdx(0); // View the uploaded video instantly!
    } catch (err) {
      console.error(err);
      alert("Failed to upload short video: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setReelUploadLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black text-white overflow-hidden flex flex-col justify-between z-40">
      {/* Absolute Translucent Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/90 via-black/40 to-transparent p-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          {/* Back Action button requested by user */}
          <button 
            type="button"
            onClick={() => setActiveTab('home')}
            className="p-2 rounded-full bg-black/40 hover:bg-white/20 backdrop-blur-md text-white transition-all transform active:scale-95 border border-white/10 cursor-pointer mr-0.5 flex items-center justify-center"
            title="Back to Homepage"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
          </button>

          <button 
            type="button"
            onClick={() => setShowLiveStream(true)}
            className="group flex items-center gap-1.5 p-1 px-2.5 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-rose-500 text-[9px] font-black uppercase tracking-wider scale-95 shadow-md hover:scale-100 active:scale-95 cursor-pointer border border-pink-400/20 transition-all text-white"
            title="Start Live Video Stream"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            LIVE
          </button>
          <h2 className="text-lg font-black tracking-tight font-sans bg-gradient-to-r from-stone-100 to-slate-200 bg-clip-text text-transparent">
            ti connect <span className="font-medium text-pink-400">shorts</span>
          </h2>
        </div>

        {/* Upload Reel Icon Button requested by user */}
        <button 
          onClick={() => setShowUploadModal(true)}
          className="p-2 py-1.5 px-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all transform hover:scale-105 active:scale-95 border border-white/10 flex items-center gap-1.5 text-[11px] font-black cursor-pointer shadow-sm"
        >
          <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Upload</span>
        </button>
      </div>

      {/* Main vertical loop list layout */}
      <div 
        className="flex-1 w-full bg-black flex flex-col items-center justify-center relative touch-none"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {reels.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <Sparkles className="w-12 h-12 text-slate-500 animate-spin" />
            <p className="font-extrabold text-sm">No reels uploaded yet!</p>
            <p className="text-xs">Be the first custom uploader in the global feed.</p>
          </div>
        ) : (
          <div className="w-full h-full absolute inset-0 flex items-center justify-center overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              {reels.map((reel, idx) => {
                if (idx !== activeReelIdx) return null;
                const isLiked = (reel as any).isLiked;

                // Simple slide variants for gorgeous physical sliding
                const slideVariants = {
                  initial: (dir: number) => ({
                    y: dir > 0 ? '100%' : dir < 0 ? '-100%' : '0%',
                    opacity: 0.9,
                  }),
                  animate: {
                    y: '0%',
                    opacity: 1,
                    transition: {
                      type: 'spring',
                      stiffness: 240,
                      damping: 26,
                    }
                  },
                  exit: (dir: number) => ({
                    y: dir > 0 ? '-100%' : dir < 0 ? '100%' : '0%',
                    opacity: 0.9,
                    transition: {
                      duration: 0.3,
                    }
                  }),
                };

                return (
                  <motion.div 
                    key={reel.id} 
                    custom={direction}
                    variants={slideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="w-full h-full absolute inset-0 bg-black flex items-center justify-center overflow-hidden group animate-none"
                    onDoubleClick={() => handleDoubleTapLike(reel.id)}
                  >
                    {/* Inline Looping video player with robust onError fallback */}
                    <video 
                      src={reel.videoUrl} 
                      key={reel.id}
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      onError={(e) => {
                        console.warn("Video failed to play inside ShortsView, substituting with stable campus template:", reel.videoUrl);
                        const fallbacks = [
                          'https://assets.mixkit.co/videos/preview/mixkit-undergrad-students-walking-on-school-campus-41618-large.mp4',
                          'https://assets.mixkit.co/videos/preview/mixkit-web-designer-working-on-his-laptop-at-home-vertical-40292-large.mp4',
                          'https://assets.mixkit.co/videos/preview/mixkit-group-of-friends-having-fun-at-a-music-festival-vertical-39745-large.mp4'
                        ];
                        // Choose fallback based on index to ensure variety
                        const fallbackUrl = fallbacks[idx % fallbacks.length];
                        if (e.currentTarget.src !== fallbackUrl) {
                          e.currentTarget.src = fallbackUrl;
                        }
                      }}
                    />

                    {/* Absolute Click area to toggle audio or shows mute indicator badge */}
                    <div 
                      onClick={() => setIsMuted(!isMuted)}
                      className="absolute inset-0 bg-transparent flex items-center justify-center cursor-pointer"
                    >
                      {isMuted ? (
                        <div className="absolute top-20 right-4 p-2 bg-black/60 rounded-full backdrop-blur-xs text-[10px] text-slate-300 pointer-events-none flex items-center gap-1">
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Tap video to unmute</span>
                        </div>
                      ) : (
                        <div className="absolute top-20 right-4 p-2 bg-cyan-500/85 rounded-full text-[10px] text-white pointer-events-none flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                          <span>Sound On</span>
                        </div>
                      )}
                    </div>

                    {/* Double tap heart splash animation */}
                    <AnimatePresence>
                      {likedAnimMap[reel.id] && (
                        <motion.div 
                          className="absolute pointer-events-none text-white drop-shadow-lg z-20"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: [0, 1.4, 0.9, 1], opacity: [0, 1, 1, 0] }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.8 }}
                        >
                          <Heart className="w-24 h-24 text-rose-500 fill-rose-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Right hand Engagement overlay column */}
                    <div className="absolute right-4 bottom-24 flex flex-col gap-4 items-center z-15">
                      
                      {/* User profile bubble */}
                      <div className="p-0.5 bg-gradient-to-tr from-pink-500 to-rose-500 rounded-full shadow-lg animate-none">
                        <img 
                          src={reel.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'} 
                          alt={reel.username}
                          className="w-11 h-11 rounded-full object-cover border border-black/50"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Like button */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleLikeReel(reel.id); }}
                        className="p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/65 transition-transform active:scale-90 flex flex-col items-center gap-1 group shadow cursor-pointer"
                      >
                        <Heart className={`w-5.5 h-5.5 ${isLiked ? 'text-rose-500 fill-rose-500 animate-pulse' : 'text-stone-100 group-hover:text-rose-450'}`} />
                        <span className="text-[10px] font-black">{reel.likesCount || 0}</span>
                      </button>

                      {/* Comment mock count */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); alert("Thread replies loaded inside memory chassis!"); }}
                        className="p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/65 transition-transform active:scale-90 flex flex-col items-center gap-1 shadow cursor-pointer"
                      >
                        <MessageSquare className="w-5.5 h-5.5 text-stone-100" />
                        <span className="text-[10px] font-black">{reel.commentsCount || 1}</span>
                      </button>

                      {/* Share mock count */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); alert("Reel short URL copied! Share with classmate."); }}
                        className="p-3 rounded-full bg-black/50 backdrop-blur-sm text-stone-100 hover:text-white transition-all active:scale-95 flex flex-col items-center gap-1 shadow cursor-pointer"
                      >
                        <Share2 className="w-5.5 h-5.5" />
                        <span className="text-[10px] font-semibold">{reel.sharesCount || 4}</span>
                      </button>
                    </div>

                    {/* Left hand helper slide buttons to navigate easily */}
                    <div className="absolute left-4 bottom-24 flex flex-col gap-2.5 z-20 pointer-events-auto">
                      <button
                        disabled={activeReelIdx === 0}
                        onClick={(e) => { e.stopPropagation(); handlePrevReel(); }}
                        className="p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white hover:text-cyan-400 transition-all border border-white/10 disabled:opacity-20 disabled:pointer-events-none shadow-md backdrop-blur-xs active:scale-95 cursor-pointer"
                        title="Slide Up (Previous)"
                      >
                        <ChevronUp className="w-4.5 h-4.5 stroke-[3]" />
                      </button>
                      <button
                        disabled={activeReelIdx === reels.length - 1}
                        onClick={(e) => { e.stopPropagation(); handleNextReel(); }}
                        className="p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white hover:text-cyan-400 transition-all border border-white/10 disabled:opacity-20 disabled:pointer-events-none shadow-md backdrop-blur-xs active:scale-95 cursor-pointer"
                        title="Slide Down (Next)"
                      >
                        <ChevronDown className="w-4.5 h-4.5 stroke-[3]" />
                      </button>
                    </div>

                    {/* Caption & User Info Bottom Overlay */}
                    <div className="absolute bottom-4 left-4 right-16 z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 rounded-b-2xl pointer-events-none">
                      <div className="flex items-center gap-2 mb-1.5 mt-2">
                        <span className="text-sm font-black text-stone-50">@{reel.username}</span>
                        <span className="text-[9px] bg-cyan-500/90 text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                          VERIFIED PROFILE
                        </span>
                      </div>

                      <p className="text-xs text-slate-100 leading-relaxed font-sans line-clamp-2 pr-2 font-medium">
                        {reel.caption}
                      </p>

                      <div className="flex items-center gap-1.5 mt-3.5 text-[10px] text-slate-300 font-semibold truncate bg-white/10 p-1.5 py-1 rounded-lg w-fit">
                        <Music className="w-3 h-3 text-cyan-400 animate-spin" />
                        <span className="truncate">Original Audio • Ti Connect Global Feed</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* UPLOAD SHORT REEL DRAWER OVERLAY */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/75 z-50 flex items-end justify-center p-4">
            <div className="absolute inset-0" onClick={() => setShowUploadModal(false)}></div>
            <motion.div 
              className="relative bg-white text-slate-800 rounded-t-[40px] rounded-b-3xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl z-55"
              initial={{ y: 300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Upload Short Reel</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Publish to Global Reels</p>
                </div>
                <button 
                  onClick={() => setShowUploadModal(false)} 
                  className="p-1 px-2 pr-2.5 rounded-full hover:bg-slate-100 text-slate-500 font-black h-8 w-8 flex items-center justify-center text-lg cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
                {/* Visual select templates for sandbox convenience */}
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 block mb-1.5 uppercase tracking-wider">
                    Select a Campus Video Template
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {videoTemplates.map((tpl, i) => (
                      <button 
                        type="button"
                        key={i}
                        onClick={() => setVideoUrl(tpl.url)}
                        className={`p-2.5 text-left text-xs rounded-xl font-bold border transition-colors ${
                          videoUrl === tpl.url 
                            ? 'bg-cyan-50 text-cyan-600 border-cyan-400' 
                            : 'bg-slate-50 border-slate-150 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {tpl.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider flex justify-between items-center">
                    <span>Upload Short Video or Enter MP4 Link</span>
                    <span className="text-rose-500 font-extrabold text-[9px] uppercase tracking-wider">Max 20s Allowed</span>
                  </label>
                  
                  {/* File Upload Trigger */}
                  <div 
                    onClick={() => reelFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-1 select-none"
                  >
                    <input 
                      type="file" 
                      ref={reelFileInputRef}
                      className="hidden" 
                      accept="video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setReelFile(file);
                          
                          // Set preview URL
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setVideoUrl(event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <span className="text-xs font-black text-slate-700">Tap to browse video from gallery</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Supports MP4, MOV format (0 to 20 seconds)</span>
                  </div>

                  {reelFile && (
                    <div className="text-xs text-cyan-600 font-extrabold flex items-center justify-between bg-cyan-50/60 p-2 rounded-xl mt-1 border border-cyan-100">
                      <span className="truncate">📎 {reelFile.name}</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          setReelFile(null);
                          setVideoUrl('');
                        }}
                        className="text-slate-500 hover:text-red-500 font-black px-1.5"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <input 
                    type="url"
                    placeholder="https://example.com/custom_video.mp4"
                    value={reelFile ? '' : videoUrl}
                    disabled={!!reelFile}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full p-3.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-cyan-500 bg-slate-50 text-slate-800"
                  />
                </div>

                {/* Display detected video duration or duration constraint error */}
                {videoDuration !== null && !durationError && (
                  <div className="p-2.5 px-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl font-bold flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Video Duration: {Math.round(videoDuration)} seconds (Valid for Shorts ✅)</span>
                  </div>
                )}

                {durationError && (
                  <div className="p-3 bg-rose-50 border border-rose-150 text-rose-600 text-xs rounded-xl font-bold flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                      <span className="font-extrabold uppercase text-[10px] tracking-wider">Duration Constraint Failed</span>
                    </div>
                    <p className="font-medium text-slate-600">{durationError}</p>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">
                    Tell us what's happening (Caption)
                  </label>
                  <textarea 
                    placeholder="Share the campus spark with #collegelife..."
                    required
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full p-3.5 border border-slate-200 rounded-xl text-xs font-semibold h-24 outline-none focus:border-cyan-500 resize-none bg-slate-50 text-slate-800"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={reelUploadLoading || !!durationError}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-pink-200/50 mt-1 cursor-pointer transition-all hover:translate-y-[-1px] disabled:opacity-50"
                >
                  {reelUploadLoading ? 'Uploading Short Video...' : 'Publish Campus Short ✨'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACTIVE LIVE VIDEO STREAMING OVERLAY */}
      <AnimatePresence>
        {showLiveStream && (
          <LiveStreamOverlay 
            onClose={() => setShowLiveStream(false)} 
            currentUser={currentUser} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// INTERACTIVE LIVE STREAM OVERLAY COMPONENT
// ==========================================
interface LiveStreamOverlayProps {
  onClose: () => void;
  currentUser: any;
}

function LiveStreamOverlay({ onClose, currentUser }: LiveStreamOverlayProps) {
  const [isCounting, setIsCounting] = useState(true);
  const [countdown, setCountdown] = useState<number | string>(3);
  const [duration, setDuration] = useState(0);
  const [viewerCount, setViewerCount] = useState(1324);
  const [liveComments, setLiveComments] = useState<any[]>([
    { id: 'start-1', username: 'alex_academic', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80', text: 'Hey! Is the live stream up? campus looks amazing! 🎓' },
    { id: 'start-2', username: 'david_dev', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80', text: 'Stunning broadcast feed quality! Let\'s connect' },
    { id: 'start-3', username: 'emma_eng', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80', text: 'Wow, is there an orientation going on? 🏫' },
  ]);
  const [newCommentText, setNewCommentText] = useState('');
  const [floatingHearts, setFloatingHearts] = useState<any[]>([]);
  const [totalLikes, setTotalLikes] = useState(48);
  const [liveAudioMuted, setLiveAudioMuted] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showEndSummary, setShowEndSummary] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // 3-2-1 Countdown Logic
  useEffect(() => {
    if (!isCounting) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 3) return 2;
        if (prev === 2) return 1;
        if (prev === 1) return 'GO!';
        setIsCounting(false);
        clearInterval(timer);
        return '';
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isCounting]);

  // Live stream ticking timer
  useEffect(() => {
    if (isCounting || showEndSummary) return;
    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCounting, showEndSummary]);

  // Fluctuating view count simulation
  useEffect(() => {
    if (isCounting || showEndSummary) return;
    const interval = setInterval(() => {
      setViewerCount(prev => {
        const delta = Math.floor(Math.random() * 15) - 7;
        const newCount = prev + delta;
        return newCount > 0 ? newCount : 100;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isCounting, showEndSummary]);

  // Real Camera capture stream with sandbox-safe error handling
  useEffect(() => {
    if (isCounting || showEndSummary) return;
    let activeStream: MediaStream | null = null;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("UserMedia APIs not supported in this browser context.");
        }
        const constraints = {
          video: { 
            facingMode: isFrontCamera ? 'user' : 'environment',
            width: { ideal: 640 },
            height: { ideal: 1136 }
          },
          audio: !liveAudioMuted
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = stream;
        setCameraStream(stream);
        setCameraError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Camera hardware access is restricted or unsupported in this sandbox:", err);
        setCameraError(err instanceof Error ? err.message : String(err));
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => {
          try {
            track.stop();
          } catch (e) {}
        });
      }
    };
  }, [isCounting, showEndSummary, isFrontCamera, liveAudioMuted]);

  // Simulated peer campus comments popping in every few seconds
  useEffect(() => {
    if (isCounting || showEndSummary) return;

    const simulatedNames = ['alex_academic', 'sarah_stewart', 'david_dev', 'emma_engineering', 'marcus_global', 'elena_law', 'sam_science', 'liam_lingua', 'sophia_social'];
    const simulatedAvatars = [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80'
    ];
    const simulatedTexts = [
      'Amazing stream! Let\'s establish a professional network! 🤝',
      'Which course are you studying? 📚',
      'Greetings from the computer science lab!',
      'TI Connect is turning into a global family! 🌍',
      'The live video quality looks super sharp!',
      'Is there a study group starting soon? 🎓',
      'Love this feature, live stream on campus is gold!',
      'Please show the global feed center! ✨',
      'Can you pin the group link?',
      'Awesome live broadcast! keep it up! 👍',
      'What a lovely sunset over the campus grounds! 🌅'
    ];

    const commentTimer = setInterval(() => {
      const randomUser = simulatedNames[Math.floor(Math.random() * simulatedNames.length)];
      const randomAvatar = simulatedAvatars[Math.floor(Math.random() * simulatedAvatars.length)];
      const randomText = simulatedTexts[Math.floor(Math.random() * simulatedTexts.length)];
      
      setLiveComments(prev => [
        ...prev,
        {
          id: String(Date.now() + Math.random()),
          username: randomUser,
          avatar: randomAvatar,
          text: randomText,
          isMe: false
        }
      ]);
    }, 4000);

    return () => clearInterval(commentTimer);
  }, [isCounting, showEndSummary]);

  // Autoscroll comments list to bottom
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveComments]);

  // Add a visual floating heart bubble animation
  const handleLikeClick = () => {
    setTotalLikes(prev => prev + 1);
    const newHeart = {
      id: Date.now() + Math.random(),
      x: Math.random() * 60 + 20, // offset left %
    };
    setFloatingHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 2000);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setLiveComments(prev => [
      ...prev,
      {
        id: String(Date.now()),
        username: currentUser?.username || 'me_student',
        avatar: currentUser?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
        text: newCommentText.trim(),
        isMe: true
      }
    ]);
    setNewCommentText('');
  };

  // Format counter to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndBroadcast = () => {
    setShowEndSummary(true);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col justify-between overflow-hidden font-sans select-none text-white">
      
      {/* 1. 3-2-1 INITIAL COUNTDOWN OVERLAY */}
      {isCounting && (
        <div className="absolute inset-0 bg-slate-950 z-55 flex flex-col items-center justify-center text-center p-6">
          <div className="absolute top-8 left-0 right-0 flex items-center justify-center gap-2">
            <span className="p-1 px-3 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-pink-500" />
              Initializing Broadcast
            </span>
          </div>
          
          <div className="relative">
            {/* Visual background rotating glow */}
            <div className="absolute -inset-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 opacity-20 blur-2xl animate-spin-slow duration-10000" />
            <motion.div 
              key={countdown}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: [1, 1.2, 1], opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-8xl font-black tracking-tighter bg-gradient-to-r from-pink-400 via-rose-500 to-amber-400 bg-clip-text text-transparent filter drop-shadow"
            >
              {countdown}
            </motion.div>
          </div>

          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-12 animate-none">
            Turn on your campus spotlight • Connect live
          </p>
        </div>
      )}

      {/* 2. LIVE CAMERA BROADCAST CANVAS OR SIMULATED FALLBACK */}
      <div className="absolute inset-0 w-full h-full z-10 bg-neutral-900">
        {cameraError ? (
          // Sandbox safe premium loop fallback if camera blocked
          <div className="relative w-full h-full">
            <video 
              src="https://assets.mixkit.co/videos/preview/mixkit-group-of-friends-having-fun-at-a-music-festival-vertical-39745-large.mp4"
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="absolute top-20 right-4 z-20 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-bold text-cyan-400 tracking-wider uppercase border border-cyan-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Studio Sandbox Fallback Stream</span>
            </div>
          </div>
        ) : (
          // Real live user video element
          <video 
            ref={videoRef}
            className="w-full h-full object-cover transform scale-x-[-1]"
            autoPlay
            playsInline
            muted
          />
        )}

        {/* Cinematic subtle dark overlay to keep HUD/Chat highly legible */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* 3. TOP LIVE STATUS HUD BAR */}
      <div className="relative z-30 p-4 pt-6 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          {/* Pulsing Live indicator */}
          <span className="p-1 px-3 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-600/30">
            <span className="h-2 w-2 rounded-full bg-white animate-ping" />
            LIVE
          </span>

          {/* Time Counter */}
          <span className="text-xs font-mono font-black bg-black/40 backdrop-blur-md p-1 px-2.5 rounded-lg border border-white/10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Viewers Counter with visual badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1 px-2.5 rounded-lg border border-white/10 text-xs font-bold">
            <Users className="w-3.5 h-3.5 text-pink-400" />
            <span>{viewerCount.toLocaleString()}</span>
          </div>

          <button 
            onClick={handleEndBroadcast}
            className="p-1 px-3 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-[10px] font-black uppercase tracking-wider shadow cursor-pointer transition-all border border-rose-500"
          >
            End Live
          </button>
        </div>
      </div>

      {/* 4. CURRENT BROADCASTER FLOATING CHIP */}
      <div className="relative z-30 px-4 pointer-events-none flex items-center gap-2 bg-gradient-to-r from-black/30 to-transparent p-2 rounded-xl w-fit">
        <img 
          src={currentUser?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} 
          alt="Avatar" 
          className="w-8 h-8 rounded-full border-2 border-pink-500 object-cover"
        />
        <div>
          <div className="flex items-center gap-1 text-[11px] font-black">
            <span>@{currentUser?.username || 'me_student'}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-tight">Broadcaster</p>
        </div>
      </div>

      {/* 5. FLOATING HEART ANIME BUBBLE STACK */}
      <div className="absolute right-4 bottom-28 pointer-events-none h-60 w-24 overflow-hidden z-35">
        <AnimatePresence>
          {floatingHearts.map(heart => (
            <motion.div
              key={heart.id}
              initial={{ y: 200, x: `${heart.x}%`, opacity: 0, scale: 0.7 }}
              animate={{ 
                y: 0, 
                x: `${heart.x + (Math.sin(heart.id) * 15)}%`, 
                opacity: [0, 1, 1, 0],
                scale: [0.7, 1.2, 1, 0.6]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="absolute bottom-0 text-red-500 text-3xl select-none"
            >
              ❤️
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 6. BOTTOM CHAT MESSAGES & TEXT INPUT BAR */}
      <div className="relative z-30 p-4 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col gap-3">
        {/* Chat List Screen Container */}
        <div className="max-h-48 overflow-y-auto flex flex-col gap-1.5 pr-2 custom-scrollbar pointer-events-auto">
          {liveComments.map((comment) => (
            <div 
              key={comment.id}
              className={`p-1.5 px-3 rounded-2xl w-fit max-w-[90%] text-xs flex items-start gap-2 backdrop-blur-sm shadow-sm ${
                comment.isMe 
                  ? 'bg-pink-600/35 border border-pink-500/20 text-pink-50' 
                  : 'bg-black/45 border border-white/5 text-slate-100'
              }`}
            >
              <img 
                src={comment.avatar} 
                alt="avatar" 
                className="w-4 h-4 rounded-full object-cover mt-0.5 border border-white/20"
              />
              <div className="flex flex-col">
                <span className={`text-[10px] font-black leading-none mb-0.5 ${comment.isMe ? 'text-pink-300' : 'text-slate-300'}`}>
                  @{comment.username}
                </span>
                <span className="font-medium leading-relaxed">{comment.text}</span>
              </div>
            </div>
          ))}
          <div ref={commentsEndRef} />
        </div>

        {/* Controls Layout (Typing Input + Camera Action Controls + Heart Clicker) */}
        <div className="flex items-center gap-2 mt-1 pointer-events-auto">
          <form onSubmit={handlePostComment} className="flex-1 flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1 px-3 rounded-full border border-white/10">
            <input 
              type="text" 
              placeholder="Post a comment as Broadcaster..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="flex-1 bg-transparent text-xs py-2 px-1 outline-none font-semibold text-white placeholder:text-slate-400"
            />
            <button 
              type="submit"
              className="p-1.5 rounded-full hover:bg-white/10 text-pink-400 active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Flip Camera */}
          <button 
            type="button"
            onClick={() => setIsFrontCamera(!isFrontCamera)}
            className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-stone-200 hover:text-white hover:bg-black/60 transition-all active:scale-90 cursor-pointer"
            title="Flip Camera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Mute Microphone toggle */}
          <button 
            type="button"
            onClick={() => setLiveAudioMuted(!liveAudioMuted)}
            className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 cursor-pointer ${
              liveAudioMuted 
                ? 'bg-rose-500/20 border-rose-500 text-rose-400' 
                : 'bg-black/40 border-white/10 text-stone-200 hover:text-white hover:bg-black/60'
            }`}
            title={liveAudioMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {liveAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Floating Heart Stream Button */}
          <button 
            type="button"
            onClick={handleLikeClick}
            className="p-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-500/20 transition-all active:scale-90 animate-pulse cursor-pointer flex items-center justify-center border border-pink-400"
            title="Send Heart"
          >
            <Heart className="w-4 h-4 fill-current stroke-none" />
          </button>
        </div>
      </div>

      {/* 7. POST-BROADCAST METRICS SUMMARY MODAL */}
      {showEndSummary && (
        <div className="absolute inset-0 bg-slate-950/98 z-55 flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-8 rounded-full bg-pink-500/10 opacity-30 blur-xl animate-pulse" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg mx-auto">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <h3 className="text-2xl font-black text-slate-100 mb-1">Live Stream Ended</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">Broadcast Analytics Report</p>

          {/* Bento grid style analytics display */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-12">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">Time Elapsed</span>
              <span className="text-xl font-mono font-black text-pink-400">{formatTime(duration)}</span>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">Total Viewers</span>
              <span className="text-xl font-sans font-black text-rose-400">{(viewerCount + 34).toLocaleString()}</span>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">Hearts Gained</span>
              <span className="text-xl font-sans font-black text-amber-400">❤️ {totalLikes}</span>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">New Comments</span>
              <span className="text-xl font-sans font-black text-emerald-400">{liveComments.length}</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full max-w-xs py-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-pink-900/30 cursor-pointer transition-all active:scale-95"
          >
            Go Back to Shorts Feed
          </button>
        </div>
      )}
    </div>
  );
}
