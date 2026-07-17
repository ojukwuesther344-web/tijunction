/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useSocial } from '../context/SocialContext';
import { Reel } from '../types';
import { 
  collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, limit, increment, getDocs 
} from 'firebase/firestore';
import { db, isFirebaseMock, auth } from '../firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleLiveFirestoreError(error: unknown, operationType: OperationType, path: string | null, currentUserId?: string) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || currentUserId,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
import { 
  Heart, MessageSquare, Share2, Upload, X, Play, Music, Volume2, VolumeX, Sparkles, ArrowLeft,
  ChevronUp, ChevronDown, Radio, Camera, RefreshCw, Users, Mic, MicOff, Send, HelpCircle,
  Smile, UserPlus, MessageCircle, Zap, Gift, Video, VideoOff, MoreVertical, Wifi
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ShortsView() {
  const { reels, createReel, toggleLikeReel, currentUser, setActiveTab, uploadMediaFile, activeLiveStreamId, setActiveLiveStreamId } = useSocial();
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
        {(showLiveStream || activeLiveStreamId) && (
          <LiveStreamOverlay 
            onClose={() => {
              setShowLiveStream(false);
              setActiveLiveStreamId(null);
            }} 
            currentUser={currentUser} 
            streamId={activeLiveStreamId}
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
  streamId?: string | null;
}

interface HeartItem {
  id: string;
  emoji: string;
  x: number;
  scale: number;
}

function LiveStreamOverlay({ onClose, currentUser, streamId }: LiveStreamOverlayProps) {
  const isViewer = !!streamId;
  const activeStreamId = useRef(streamId || 'stream-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)).current;

  // States
  const [isLive, setIsLive] = useState(isViewer); // Viewers are live instantly; Broadcasters start in Pre-Live Preview
  const [isCounting, setIsCounting] = useState(false);
  const [countdown, setCountdown] = useState<number | string>(3);
  const [duration, setDuration] = useState(0);
  const [viewerCount, setViewerCount] = useState(isViewer ? 1 : 1);
  const [liveComments, setLiveComments] = useState<any[]>([]);
  const [activeComments, setActiveComments] = useState<any[]>([]); // comments in the last 8 seconds to support automatic fade-out
  const [newCommentText, setNewCommentText] = useState('');
  const [floatingHearts, setFloatingHearts] = useState<HeartItem[]>([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [liveAudioMuted, setLiveAudioMuted] = useState(false);
  const [cameraMuted, setCameraMuted] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showEndSummary, setShowEndSummary] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [broadcaster, setBroadcaster] = useState<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGiftsPanel, setShowGiftsPanel] = useState(false);

  const [streamMode, setStreamMode] = useState<'camera' | 'vlog'>(isViewer ? 'vlog' : 'camera');
  const [currentVlogIndex, setCurrentVlogIndex] = useState(0);
  const [micLevels, setMicLevels] = useState<number[]>([4, 8, 12, 16, 12, 8, 4]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const vlogLoops = [
    'https://assets.mixkit.co/videos/preview/mixkit-young-man-walking-and-vlogging-with-his-phone-vertical-40291-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-happy-girl-vlogging-while-walking-vertical-40285-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-man-recording-himself-with-his-phone-vertical-40286-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-influencer-recording-a-video-with-her-phone-vertical-40284-large.mp4'
  ];

  // 1. Audio equalizer simulation
  useEffect(() => {
    if (showEndSummary || !isLive) return;
    const interval = setInterval(() => {
      setMicLevels(prev => prev.map(() => Math.floor(Math.random() * 20) + 4));
    }, 120);
    return () => clearInterval(interval);
  }, [showEndSummary, isLive]);

  // 2. Swirling live stream ticker timer (Broadcasters update duration field every 5 seconds)
  useEffect(() => {
    if (showEndSummary || !isLive) return;
    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [showEndSummary, isLive]);

  // 3. Request camera and microphone permissions immediately on mount for broadcaster
  useEffect(() => {
    if (showEndSummary || isViewer) return;
    let activeStream: MediaStream | null = null;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera and Microphone APIs are not supported in this browser.");
        }
        
        // Ask for camera and microphone permissions
        const constraints = {
          video: { 
            facingMode: isFrontCamera ? 'user' : 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: true
        };

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (err) {
          console.warn("Standard camera constraints failed. Attempting audio & video fallback.", err);
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: isFrontCamera ? 'user' : 'environment' },
              audio: true
            });
          } catch (err2) {
            console.warn("Audio/Video fallback failed. Requesting video-only fallback.", err2);
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false
            });
          }
        }

        activeStream = stream;
        setCameraStream(stream);
        setCameraError(null);
        setStreamMode('camera'); // Successfully bound to real hardware!
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Camera hardware access is not available, falling back to simulated stream:", err);
        setCameraError(err instanceof Error ? err.message : String(err));
        setStreamMode('vlog'); // Fall back to interactive pre-recorded vlog simulation
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
  }, [showEndSummary, isFrontCamera, isViewer]);

  // Ensure camera streams stay connected to video ref when mounted
  useEffect(() => {
    if (videoRef.current && cameraStream && streamMode === 'camera' && !isViewer) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, streamMode, isViewer]);

  // Enable / disable video tracks
  useEffect(() => {
    if (cameraStream) {
      cameraStream.getVideoTracks().forEach(track => {
        track.enabled = !cameraMuted;
      });
    }
  }, [cameraMuted, cameraStream]);

  // Enable / disable audio tracks
  useEffect(() => {
    if (cameraStream) {
      cameraStream.getAudioTracks().forEach(track => {
        track.enabled = !liveAudioMuted;
      });
    }
  }, [liveAudioMuted, cameraStream]);

  // 4. Simulated peer commentary (Mock Mode only)
  useEffect(() => {
    if (!isLive || showEndSummary || !isFirebaseMock) return;

    const simulatedNames = ['john_doe', 'sarah_m', 'alex_stud', 'campus_star', 'linda_k', 'emma_w', 'david_web', 'clover_g'];
    const simulatedAvatars = [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80'
    ];
    const simulatedTexts = [
      'Love the stream! 🔥🔥🔥',
      'This camera filter looks incredible!',
      'Where are you broadcasting from? 🎓',
      'Awesome study vibe today! 📚✨',
      'Can you study together tomorrow? 💡',
      'TI Connect LIVE is super fast!',
      'Incredible! Say hello to David 👑',
      'This full-screen feed is stunning 💖'
    ];

    const commentInterval = setInterval(() => {
      const randomUser = simulatedNames[Math.floor(Math.random() * simulatedNames.length)];
      const randomAvatar = simulatedAvatars[Math.floor(Math.random() * simulatedAvatars.length)];
      const randomText = simulatedTexts[Math.floor(Math.random() * simulatedTexts.length)];
      
      const newComment = {
        id: 'mock-cmt-' + Date.now() + '-' + Math.random(),
        username: randomUser,
        avatar: randomAvatar,
        text: randomText,
        isMe: false,
        timestamp: Date.now()
      };

      setLiveComments(prev => [...prev, newComment]);
    }, 4500);

    return () => clearInterval(commentInterval);
  }, [isLive, showEndSummary]);

  // Fluctuating view count (Mock Mode only)
  useEffect(() => {
    if (!isLive || showEndSummary || !isFirebaseMock) return;
    setViewerCount(isViewer ? 421 : 129);
    const interval = setInterval(() => {
      setViewerCount(prev => {
        const delta = Math.floor(Math.random() * 9) - 4;
        const newCount = prev + delta;
        return newCount > 1 ? newCount : 12;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isLive, showEndSummary]);

  // 5. Firestore real-time synchronization for LIVE broadcasters and viewers
  useEffect(() => {
    if (!isLive || showEndSummary) return;

    if (!isFirebaseMock) {
      if (!isViewer) {
        // Broadcaster initializes the stream document
        const streamRef = doc(db, 'liveStreams', activeStreamId);
        setDoc(streamRef, {
          id: activeStreamId,
          userId: currentUser?.uid || 'anonymous',
          fullName: currentUser?.fullName || '',
          username: currentUser?.username || 'me_student',
          profilePhoto: currentUser?.profilePhoto || '',
          status: 'live',
          viewerCount: 1,
          likesCount: totalLikes,
          duration: 0,
          streamMode: streamMode,
          currentVlogIndex,
          isFilterActive,
          isFlashOn,
          micMuted: liveAudioMuted,
          createdAt: new Date().toISOString()
        }).catch(err => {
          console.error("Failed to initialize liveStream doc:", err);
        });

        // Periodic update of duration
        const durationInterval = setInterval(() => {
          updateDoc(streamRef, {
            duration: increment(5)
          }).catch(() => {});
        }, 5000);

        return () => {
          clearInterval(durationInterval);
          // Set stream status to ended
          updateDoc(streamRef, {
            status: 'ended',
            endedAt: new Date().toISOString()
          }).catch(() => {});
        };
      } else {
        // Viewer subscribes to active stream document
        const streamRef = doc(db, 'liveStreams', activeStreamId);
        const unsubscribe = onSnapshot(streamRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.status === 'ended') {
              setShowEndSummary(true);
            } else {
              setViewerCount(data.viewerCount || 1);
              setTotalLikes(data.likesCount || 0);
              setDuration(data.duration || 0);
              setBroadcaster({
                uid: data.userId,
                fullName: data.fullName,
                username: data.username,
                profilePhoto: data.profilePhoto
              });
              setIsFilterActive(!!data.isFilterActive);
              setIsFlashOn(!!data.isFlashOn);
              setLiveAudioMuted(!!data.micMuted);
              if (data.streamMode) {
                setStreamMode(data.streamMode);
              }
              if (data.currentVlogIndex !== undefined) {
                setCurrentVlogIndex(data.currentVlogIndex);
              }
            }
          } else {
            setShowEndSummary(true);
          }
        }, (error) => {
          console.error("Error subscribing to liveStream:", error);
        });

        // Periodic heartbeat for viewers
        const heartbeatId = currentUser?.uid + '_' + activeStreamId;
        const heartbeatRef = doc(db, 'liveViewers', heartbeatId);
        
        const writeHeartbeat = () => {
          setDoc(heartbeatRef, {
            id: heartbeatId,
            streamId: activeStreamId,
            userId: currentUser?.uid || 'anonymous',
            username: currentUser?.username || 'viewer',
            profilePhoto: currentUser?.profilePhoto || '',
            lastActive: Date.now()
          }).catch(() => {});
        };

        writeHeartbeat();
        const heartbeatInterval = setInterval(writeHeartbeat, 10000);

        return () => {
          unsubscribe();
          clearInterval(heartbeatInterval);
          deleteDoc(heartbeatRef).catch(() => {});
        };
      }
    } else {
      if (isViewer) {
        setBroadcaster({
          uid: 'clara-uid',
          fullName: 'Clara Hughes',
          username: 'clara_h',
          profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80'
        });
      }
    }
  }, [isLive, showEndSummary, isViewer]);

  // Real-time Viewers Listener (Broadcaster only listens and sums viewers)
  useEffect(() => {
    if (!isLive || showEndSummary || isViewer || !currentUser) return;

    if (!isFirebaseMock) {
      const viewersQuery = query(
        collection(db, 'liveViewers'),
        where('streamId', '==', activeStreamId)
      );

      const unsubscribe = onSnapshot(viewersQuery, (snapshot) => {
        const count = snapshot.size;
        setViewerCount(count > 0 ? count : 1);
        
        // Write count back to stream doc so viewers read it
        const streamRef = doc(db, 'liveStreams', activeStreamId);
        updateDoc(streamRef, {
          viewerCount: count > 0 ? count : 1
        }).catch(() => {});
      }, (error) => {
        console.error("Error fetching live viewers:", error);
      });

      return () => unsubscribe();
    }
  }, [isLive, showEndSummary, isViewer, currentUser, activeStreamId]);

  // Real-time Comments Listener (Firestore synced)
  useEffect(() => {
    if (!isLive || showEndSummary || !currentUser) return;

    if (!isFirebaseMock) {
      const commentsQuery = query(
        collection(db, 'liveComments'),
        where('streamId', '==', activeStreamId)
      );

      const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        setLiveComments(prevComments => {
          const fetched: any[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            const commentId = doc.id;
            
            // Check if this comment is already in state to preserve its unique local arrival timestamp
            const existingComment = prevComments.find(c => c.id === commentId);
            const arrivalTime = existingComment ? existingComment.timestamp : Date.now();

            fetched.push({
              id: commentId,
              username: data.username || 'student',
              avatar: data.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
              text: data.message || data.text || '',
              isMe: data.userId === currentUser?.uid,
              createdAt: data.createdAt,
              timestamp: arrivalTime
            });
          });

          // Sort in chronological order
          fetched.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeA - timeB;
          });

          return fetched;
        });
      }, (error) => {
        console.error("Error subscribing to live comments:", error);
      });

      return () => unsubscribe();
    }
  }, [isLive, showEndSummary, currentUser, activeStreamId]);

  // Real-time Likes Listener (Firestore synced)
  useEffect(() => {
    if (!isLive || showEndSummary || !currentUser) return;

    if (!isFirebaseMock) {
      const likesQuery = query(
        collection(db, 'liveLikes'),
        where('streamId', '==', activeStreamId)
      );

      let isFirstLoad = true;
      const unsubscribe = onSnapshot(likesQuery, (snapshot) => {
        setTotalLikes(snapshot.size);

        if (isFirstLoad) {
          isFirstLoad = false;
          return;
        }

        // Only trigger animations for newly appended likes after loading history
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            triggerHeartAnimation();
          }
        });
      }, (error) => {
        console.error("Error reading live likes snapshot:", error);
      });

      return () => unsubscribe();
    }
  }, [isLive, showEndSummary, currentUser, activeStreamId]);

  // 6. Dynamic comment fade-out timer (Filters active comments based on 8-second threshold)
  useEffect(() => {
    if (!isLive) return;
    
    const updateActiveComments = () => {
      const now = Date.now();
      setActiveComments(liveComments.filter(comment => {
        const age = now - (comment.timestamp || now);
        return age < 8000; // Only visible if less than 8 seconds old
      }));
    };

    updateActiveComments();
    const timer = setInterval(updateActiveComments, 1000);
    return () => clearInterval(timer);
  }, [liveComments, isLive]);

  // Auto scroll to bottom when active comments update
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeComments]);

  // 7. Broadcaster Starts the Stream (Go Live action)
  const handleGoLive = async () => {
    setIsCounting(true);
    let countVal = 3;
    setCountdown(3);

    const interval = setInterval(() => {
      countVal -= 1;
      if (countVal > 0) {
        setCountdown(countVal);
      } else if (countVal === 0) {
        setCountdown('GO!');
      } else {
        clearInterval(interval);
        setIsCounting(false);
        setIsLive(true); // Transitions the broadcaster to live!

        // Send a notification activity if synced with Firestore
        if (!isFirebaseMock && currentUser) {
          const activityId = 'activity-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
          setDoc(doc(db, 'userActivities', activityId), {
            id: activityId,
            userId: currentUser.uid,
            fullName: currentUser.fullName,
            username: currentUser.username,
            profilePhoto: currentUser.profilePhoto || '',
            activityType: 'create_reel',
            activityDetails: `started a real-time live video broadcast! 🎥📡`,
            targetId: activeStreamId,
            createdAt: new Date().toISOString()
          }).catch(() => {});
        }
      }
    }, 1000);
  };

  // 8. Hearts animation trigger helper
  const triggerHeartAnimation = () => {
    const emojis = ['❤️', '💖', '💝', '💕', '💛', '💙', '💜', '🧡', '✨'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const newHeart: HeartItem = {
      id: 'heart-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      emoji: randomEmoji,
      x: Math.random() * 40 - 20, // offset range
      scale: Math.random() * 0.4 + 0.8 // size range
    };
    setFloatingHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 2200);
  };

  // Like click trigger
  const handleLikeClick = async () => {
    triggerHeartAnimation();

    if (!isFirebaseMock) {
      try {
        const likeId = 'like-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
        await setDoc(doc(db, 'liveLikes', likeId), {
          id: likeId,
          streamId: activeStreamId,
          userId: currentUser?.uid || 'anonymous',
          createdAt: new Date().toISOString()
        });
        
        updateDoc(doc(db, 'liveStreams', activeStreamId), {
          likesCount: increment(1)
        }).catch(() => {});
      } catch (err) {
        console.error("Failed to post live like:", err);
      }
    } else {
      setTotalLikes(prev => prev + 1);
    }
  };

  // Submit chat comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const textValue = newCommentText.trim();
    setNewCommentText('');
    setShowEmojiPicker(false);

    if (!isFirebaseMock) {
      try {
        const commentId = 'comment-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
        await setDoc(doc(db, 'liveComments', commentId), {
          commentId,
          streamId: activeStreamId,
          userId: currentUser?.uid || 'anonymous',
          username: currentUser?.username || 'student',
          profilePhoto: currentUser?.profilePhoto || '',
          message: textValue,
          text: textValue,
          timestamp: Date.now(),
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Failed to post live comment:", err);
      }
    } else {
      const myComment = {
        id: 'mock-cmt-' + Date.now(),
        username: currentUser?.username || 'me_student',
        avatar: currentUser?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
        text: textValue,
        isMe: true,
        timestamp: Date.now()
      };
      setLiveComments(prev => [...prev, myComment]);
    }
  };

  // Share stream
  const handleShareClick = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert("Live stream link copied to clipboard! Share with your class. 📤✅");
    }).catch(() => {
      alert("Failed to copy link. Share this stream manually! 🔗");
    });
  };

  // Simulates purchasing / sending gifts
  const handleSendGift = (giftName: string, icon: string) => {
    setShowGiftsPanel(false);
    alert(`You sent a ${giftName} ${icon}! 🎁✨`);

    const giftMessage = `sent a ${giftName} ${icon}! 🎁`;
    if (!isFirebaseMock) {
      const commentId = 'comment-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      setDoc(doc(db, 'liveComments', commentId), {
        commentId,
        streamId: activeStreamId,
        userId: currentUser?.uid || 'anonymous',
        username: currentUser?.username || 'student',
        profilePhoto: currentUser?.profilePhoto || '',
        message: giftMessage,
        text: giftMessage,
        timestamp: Date.now(),
        createdAt: new Date().toISOString()
      }).catch(() => {});
    } else {
      const giftComment = {
        id: 'mock-cmt-gift-' + Date.now(),
        username: currentUser?.username || 'me_student',
        avatar: currentUser?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
        text: giftMessage,
        isMe: true,
        timestamp: Date.now()
      };
      setLiveComments(prev => [...prev, giftComment]);
    }
  };

  // Format counter (MM:SS)
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
      
      {/* 1. IMMERSIVE FULL-SCREEN CAMERA OR SIMULATED FALLBACK */}
      <div className="absolute inset-0 w-full h-full z-10 bg-stone-950 overflow-hidden select-none">
        {streamMode === 'camera' && !cameraError && !isViewer ? (
          <video 
            ref={videoRef}
            className={`w-full h-full object-cover transition-all duration-700 ${isFrontCamera ? 'transform scale-x-[-1]' : ''} ${isFilterActive ? 'brightness-110 saturate-125 sepia-[10%] contrast-[102%] hue-rotate-15 filter blur-[0.3px]' : ''}`}
            autoPlay
            playsInline
            muted
          />
        ) : (
          <div className="relative w-full h-full">
            <video 
              key={vlogLoops[currentVlogIndex]}
              src={vlogLoops[currentVlogIndex]}
              className={`w-full h-full object-cover transition-all duration-700 ${isFilterActive ? 'brightness-110 saturate-125 sepia-[10%] contrast-[102%] hue-rotate-15 filter blur-[0.3px]' : ''}`}
              autoPlay
              loop
              muted
              playsInline
              onError={() => {
                console.warn("Vlog video failed to play, cycling index");
                setCurrentVlogIndex((prev) => (prev + 1) % vlogLoops.length);
              }}
            />
            {isViewer && (
              <div className="absolute top-20 left-4 z-20 bg-pink-500/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black text-white tracking-widest uppercase border border-pink-400/30 flex items-center gap-1 shadow-lg shadow-pink-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                <span>LOCATION: {currentVlogIndex === 0 ? 'STUDENT QUAD' : currentVlogIndex === 1 ? 'CAMPUS CAFE' : currentVlogIndex === 2 ? 'CREATIVE LAB' : 'SPORTS COMPLEX'}</span>
              </div>
            )}
          </div>
        )}

        {/* Dynamic visual flashlight/glowing overlay */}
        {isFlashOn && (
          <div className="absolute inset-0 bg-white/10 pointer-events-none mix-blend-screen z-15 shadow-[inset_0_0_120px_rgba(255,255,255,0.2)]" />
        )}

        {/* Professional gradient overlays to ensure full-screen legibility of all floating items */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none z-12" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-12" />
      </div>

      {/* 2. BROADCASTER PRE-LIVE SETUP OVERLAY */}
      {!isLive && !isViewer && (
        <div className="absolute inset-0 bg-black/55 backdrop-blur-md z-45 flex flex-col justify-between p-6 pt-16">
          {/* Header instructions */}
          <div className="w-full text-center mt-4">
            <span className="p-1.5 px-3 rounded-full bg-pink-500/25 text-pink-300 border border-pink-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit mx-auto animate-pulse">
              <span className="h-2 w-2 rounded-full bg-pink-500 animate-ping" />
              Pre-Live Broadcast Studio
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white mt-3 drop-shadow-md">Choose Your Style & Connect</h2>
            <p className="text-xs text-stone-300 max-w-xs mx-auto mt-1 leading-relaxed">
              Verify your appearance, select campus locations, or turn on filters before interacting with peers live!
            </p>
          </div>

          {/* Quick config options inside card */}
          <div className="w-full max-w-sm mx-auto bg-black/60 border border-white/10 backdrop-blur-xl p-5 rounded-2xl flex flex-col gap-4">
            {/* Mode selection (Camera or Simulation) */}
            <div>
              <label className="text-[10px] text-pink-400 font-black uppercase tracking-wider block mb-2">Streaming Input Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStreamMode('camera')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                    streamMode === 'camera' 
                      ? 'bg-pink-600 border-pink-500 text-white font-extrabold shadow-md shadow-pink-600/20' 
                      : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  Live Webcam
                </button>
                <button
                  type="button"
                  onClick={() => setStreamMode('vlog')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                    streamMode === 'vlog' 
                      ? 'bg-pink-600 border-pink-500 text-white font-extrabold shadow-md shadow-pink-600/20' 
                      : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Campus Simulation
                </button>
              </div>
            </div>

            {/* Quick adjust row */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsFilterActive(!isFilterActive)}
                className={`py-2.5 rounded-xl text-[10px] font-bold border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  isFilterActive ? 'bg-pink-500/20 border-pink-500 text-pink-400' : 'bg-white/5 border-white/10 text-stone-300'
                }`}
              >
                <Smile className="w-4 h-4 mb-0.5" />
                Beauty Filter
              </button>
              <button
                type="button"
                onClick={() => setLiveAudioMuted(!liveAudioMuted)}
                className={`py-2.5 rounded-xl text-[10px] font-bold border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  liveAudioMuted ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-white/5 border-white/10 text-stone-300'
                }`}
              >
                {liveAudioMuted ? <MicOff className="w-4 h-4 mb-0.5" /> : <Mic className="w-4 h-4 mb-0.5" />}
                {liveAudioMuted ? 'Muted' : 'Audio On'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (streamMode === 'vlog') {
                    setCurrentVlogIndex((prev) => (prev + 1) % vlogLoops.length);
                  } else {
                    setIsFrontCamera(!isFrontCamera);
                  }
                }}
                className="py-2.5 rounded-xl text-[10px] font-bold border bg-white/5 border-white/10 text-stone-300 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 mb-0.5" />
                Flip Stream
              </button>
            </div>
          </div>

          {/* Large Start Button */}
          <div className="w-full max-w-sm mx-auto mb-6">
            <button
              type="button"
              onClick={handleGoLive}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-pink-600/30 cursor-pointer hover:shadow-pink-600/40 transform hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              Go Live Now
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-2.5 py-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/5 font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel & Exit
            </button>
          </div>
        </div>
      )}

      {/* 3. 3-2-1 INITIAL COUNTDOWN OVERLAY */}
      {isCounting && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-55 flex flex-col items-center justify-center text-center p-6 select-none">
          <div className="relative">
            <div className="absolute -inset-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 opacity-20 blur-2xl animate-pulse" />
            <motion.div 
              key={countdown}
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: [1, 1.4, 1], opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-7xl font-sans font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-rose-400 to-amber-300 drop-shadow-[0_4px_12px_rgba(236,72,153,0.3)] tracking-wider"
            >
              {countdown}
            </motion.div>
            <p className="text-xs text-pink-300 font-extrabold uppercase tracking-widest mt-6 animate-pulse">
              Preparing live broadcast feed...
            </p>
          </div>
        </div>
      )}

      {/* 4. TIKTOK LIVE HUD: TOP BAR (PINS PROFILE & VIEW COUNT) */}
      <div className="relative z-30 p-3 pt-5 flex items-center justify-between pointer-events-auto">
        {/* Left corner: Immersive Creator Profile Badge */}
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1 pl-1 pr-3 rounded-full border border-white/10 max-w-[200px] select-none">
          <img 
            src={isViewer ? (broadcaster?.profilePhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80') : (currentUser?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80')} 
            alt="Broadcaster" 
            className="w-8 h-8 rounded-full border border-pink-500 object-cover"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black tracking-tight truncate leading-none mb-0.5">
              @{isViewer ? (broadcaster?.username || 'broadcaster') : (currentUser?.username || 'me_student')}
            </span>
            <div className="flex items-center gap-1 text-[8px] text-stone-300 font-bold leading-none">
              <Users className="w-2.5 h-2.5 text-stone-300" />
              <span>{viewerCount.toLocaleString()}</span>
            </div>
          </div>
          {isViewer && (
            <button
              type="button"
              onClick={() => alert("You followed this live broadcaster! 🔔")}
              className="ml-2 px-2.5 py-1 bg-pink-600 hover:bg-pink-700 active:scale-95 transition-all text-white font-extrabold text-[8px] uppercase tracking-wider rounded-full cursor-pointer flex items-center justify-center"
            >
              Follow
            </button>
          )}
        </div>

        {/* Right corner: Live Indicators, Connection Ping & Close Button */}
        <div className="flex items-center gap-2.5 select-none">
          {/* Pulsing Orange "LIVE" badge & duration timer */}
          <div className="flex items-center bg-red-600 text-white rounded-lg p-0.5 pr-2.5 text-[10px] font-black uppercase tracking-wider border border-red-500/25">
            <span className="bg-white text-red-600 px-1.5 py-0.5 rounded-md font-black mr-1.5">
              LIVE
            </span>
            <span className="font-mono text-[9px] font-bold">
              {formatTime(duration)}
            </span>
          </div>

          {/* Connection signal (Network) */}
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md py-1 px-2 rounded-lg border border-white/5" title="Stable connection ping">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[8px] font-black text-emerald-400 uppercase font-mono">18ms</span>
          </div>

          {/* TIKTOK LIVE Exit Button */}
          <button 
            type="button"
            onClick={isViewer ? onClose : handleEndBroadcast}
            className="p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-stone-200 hover:bg-white/10 cursor-pointer active:scale-90 transition-all flex items-center justify-center"
            title="Exit Livestream"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* 5. TIKTOK LIVE FLOATING CONTROLS PANEL (RIGHT COLUMN FLUID OVERLAY) */}
      <div className="absolute right-4 top-1/3 -translate-y-4 z-35 flex flex-col gap-3 pointer-events-auto select-none">
        {/* Like trigger heart button (Vertical Rail) */}
        <button
          type="button"
          onClick={handleLikeClick}
          className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-stone-100 hover:bg-black/60 hover:text-red-400 transition-all active:scale-90 cursor-pointer flex flex-col items-center justify-center relative shadow-lg"
          title="Send Love Heart"
        >
          <Heart className="w-5 h-5 fill-red-500 stroke-red-400" />
          <span className="absolute -bottom-1 px-1 bg-red-600 text-[8px] font-black rounded-full border border-red-500/20">{totalLikes}</span>
        </button>

        {/* Gift Trigger Button */}
        <button
          type="button"
          onClick={() => setShowGiftsPanel(!showGiftsPanel)}
          className={`w-11 h-11 rounded-full backdrop-blur-md border transition-all active:scale-90 cursor-pointer flex items-center justify-center shadow-lg ${
            showGiftsPanel 
              ? 'bg-pink-600 border-pink-400 text-white shadow-pink-500/30' 
              : 'bg-black/40 border-white/10 text-stone-100 hover:bg-black/60'
          }`}
          title="Send Virtual Gifts"
        >
          <Gift className="w-5 h-5 text-amber-300 animate-bounce" />
        </button>

        {/* Share stream button */}
        <button
          type="button"
          onClick={handleShareClick}
          className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-stone-100 hover:bg-black/60 active:scale-90 transition-all cursor-pointer flex items-center justify-center shadow-lg"
          title="Share Stream Link"
        >
          <Share2 className="w-5 h-5" />
        </button>

        {/* Settings controls (Broadcaster Settings Vertical Stack) */}
        {!isViewer && isLive && (
          <>
            {/* Filter Toggle */}
            <button
              type="button"
              onClick={() => setIsFilterActive(!isFilterActive)}
              className={`w-11 h-11 rounded-full backdrop-blur-md border transition-all active:scale-90 cursor-pointer flex items-center justify-center shadow-lg ${
                isFilterActive 
                  ? 'bg-pink-500/20 border-pink-500 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.25)]' 
                  : 'bg-black/40 border-white/10 text-stone-100 hover:bg-black/60'
              }`}
              title="Beauty Filter"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Mic Toggle */}
            <button
              type="button"
              onClick={() => setLiveAudioMuted(!liveAudioMuted)}
              className={`w-11 h-11 rounded-full backdrop-blur-md border transition-all active:scale-90 cursor-pointer flex items-center justify-center shadow-lg ${
                liveAudioMuted 
                  ? 'bg-rose-500/25 border-rose-500 text-rose-400' 
                  : 'bg-black/40 border-white/10 text-stone-100 hover:bg-black/60'
              }`}
              title={liveAudioMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {liveAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Camera Switch / Flip */}
            <button
              type="button"
              onClick={() => {
                if (streamMode === 'vlog') {
                  setCurrentVlogIndex((prev) => (prev + 1) % vlogLoops.length);
                } else {
                  setIsFrontCamera(!isFrontCamera);
                }
              }}
              className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-stone-100 hover:bg-black/60 transition-all active:scale-90 cursor-pointer flex items-center justify-center shadow-lg"
              title={streamMode === 'vlog' ? "Cycle Location Feed" : "Flip Camera"}
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>

            {/* Flash Toggle */}
            <button
              type="button"
              onClick={() => setIsFlashOn(!isFlashOn)}
              className={`w-11 h-11 rounded-full backdrop-blur-md border transition-all active:scale-90 cursor-pointer flex items-center justify-center shadow-lg ${
                isFlashOn 
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300' 
                  : 'bg-black/40 border-white/10 text-stone-100 hover:bg-black/60'
              }`}
              title="Flash Toggle"
            >
              <Zap className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* 6. VIRTUAL GIFT SHOP PANEL POP-UP OVERLAY */}
      {showGiftsPanel && (
        <div className="absolute left-4 right-4 bottom-28 bg-black/85 backdrop-blur-xl border border-white/10 p-4 rounded-3xl z-40 animate-fade-in pointer-events-auto select-none">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] text-pink-400 font-black uppercase tracking-wider">Campus Live Gift Store 🎁✨</span>
            <button 
              type="button" 
              onClick={() => setShowGiftsPanel(false)}
              className="text-stone-400 hover:text-white text-xs font-black cursor-pointer px-1"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            <button 
              type="button" 
              onClick={() => handleSendGift("Campus Cap", "🎓")}
              className="bg-white/5 hover:bg-pink-600/10 border border-white/5 hover:border-pink-500/30 p-2.5 rounded-2xl flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <span className="text-2xl mb-1">🎓</span>
              <span className="text-[8px] font-black uppercase tracking-wider text-stone-200">Campus Cap</span>
            </button>
            <button 
              type="button" 
              onClick={() => handleSendGift("Coffee Shot", "☕")}
              className="bg-white/5 hover:bg-pink-600/10 border border-white/5 hover:border-pink-500/30 p-2.5 rounded-2xl flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <span className="text-2xl mb-1">☕</span>
              <span className="text-[8px] font-black uppercase tracking-wider text-stone-200">Study Fuel</span>
            </button>
            <button 
              type="button" 
              onClick={() => handleSendGift("University Hat", "🎩")}
              className="bg-white/5 hover:bg-pink-600/10 border border-white/5 hover:border-pink-500/30 p-2.5 rounded-2xl flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <span className="text-2xl mb-1">🎩</span>
              <span className="text-[8px] font-black uppercase tracking-wider text-stone-200">Grad Hat</span>
            </button>
            <button 
              type="button" 
              onClick={() => handleSendGift("Love Rose", "🌹")}
              className="bg-white/5 hover:bg-pink-600/10 border border-white/5 hover:border-pink-500/30 p-2.5 rounded-2xl flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <span className="text-2xl mb-1">🌹</span>
              <span className="text-[8px] font-black uppercase tracking-wider text-stone-200">Love Rose</span>
            </button>
          </div>
        </div>
      )}

      {/* 7. FLOATING HEART ANIME BUBBLE STACK */}
      <div className="absolute right-4 bottom-24 pointer-events-none h-64 w-28 overflow-hidden z-35 select-none">
        <AnimatePresence>
          {floatingHearts.map(heart => (
            <motion.div
              key={heart.id}
              initial={{ y: 220, x: `${heart.x}%`, opacity: 0, scale: 0.6 }}
              animate={{ 
                y: 0, 
                x: `${heart.x + (Math.sin(parseInt(heart.id.substring(5, 10)) || 1) * 20)}%`, 
                opacity: [0, 1, 1, 0],
                scale: [0.6, heart.scale * 1.2, heart.scale, 0.5]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.0, ease: "easeOut" }}
              className="absolute bottom-0 text-3xl select-none filter drop-shadow-md"
            >
              {heart.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 8. BOTTOM-LEFT FLOATING CHAT BUBBLE STACK */}
      <div className="relative z-30 p-4 pb-2 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col gap-2 cursor-default select-none max-w-sm pointer-events-auto">
        {/* Dynamic Bubble Stack wrapper (auto scrolling, auto fading) */}
        <div className="max-h-48 overflow-y-auto flex flex-col gap-2 pr-2 scrollbar-none scroll-smooth">
          {activeComments.length === 0 ? (
            <div className="p-2 py-3 text-left text-[10px] text-pink-300 font-extrabold tracking-widest uppercase animate-pulse">
              💬 Waiting for community chatter...
            </div>
          ) : (
            activeComments.map((comment) => (
              <motion.div 
                key={comment.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`p-2.5 px-3.5 rounded-2xl w-fit max-w-[95%] text-xs flex items-start gap-2.5 shadow-md border ${
                  comment.isMe 
                    ? 'bg-pink-600/35 border-pink-500/20 text-pink-50 rounded-bl-xs' 
                    : comment.text.includes("sent a") 
                      ? 'bg-amber-500/20 border-amber-400/30 text-amber-100 font-extrabold rounded-bl-xs shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                      : 'bg-black/50 border-white/5 text-stone-100 rounded-bl-xs'
                }`}
              >
                <img 
                  src={comment.avatar} 
                  alt="avatar" 
                  className="w-5.5 h-5.5 rounded-full object-cover border border-white/10 mt-0.5"
                />
                <div className="flex flex-col">
                  <span className={`text-[9px] font-black leading-none mb-1 ${comment.isMe ? 'text-pink-300' : comment.text.includes("sent a") ? 'text-amber-300' : 'text-slate-300'}`}>
                    @{comment.username}
                  </span>
                  <span className="font-semibold leading-relaxed text-left break-all">{comment.text}</span>
                </div>
              </motion.div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* 9. BOTTOM INPUT BAR (COMMENTARY & EMOJI QUICK SELECT) */}
        {isLive && (
          <div className="flex flex-col gap-1.5 mt-2">
            {/* Quick emoji drawer toggle */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 px-2.5 bg-black/45 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-extrabold text-stone-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
              >
                <span>😊</span>
                <span>Quick Emojis</span>
              </button>
              {showEmojiPicker && (
                <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xl border border-white/10 p-1 rounded-full animate-fade-in">
                  {['🔥', '👏', '💖', '👑', '😮', '🤣', '🎉', '💯'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setNewCommentText(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="w-6 h-6 flex items-center justify-center text-xs hover:bg-white/15 rounded-full transition-all cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Comment field formulation */}
            <form onSubmit={handlePostComment} className="flex items-center gap-2">
              <div className="flex items-center gap-2.5 text-white/95 text-xs py-1.5 px-4 bg-black/50 backdrop-blur-lg rounded-2xl border border-white/10 flex-1 focus-within:border-pink-500/50 transition-all shadow-lg">
                <MessageCircle className="w-4 h-4 text-stone-300" />
                <input 
                  type="text" 
                  placeholder="Interact with class streams..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="bg-transparent border-none outline-none py-1 flex-1 text-white font-semibold placeholder:text-stone-400 text-xs"
                />
                {newCommentText && (
                  <button type="submit" className="text-pink-400 hover:text-pink-300 font-extrabold text-[10px] uppercase tracking-widest pl-1 cursor-pointer">
                    Post
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>

      {/* 10. POST-BROADCAST METRICS SUMMARY MODAL */}
      {showEndSummary && (
        <div className="absolute inset-0 bg-slate-950/98 z-55 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="relative mb-6">
            <div className="absolute -inset-8 rounded-full bg-pink-500/10 opacity-30 blur-xl animate-pulse" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg mx-auto">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <h3 className="text-2xl font-black text-slate-100 mb-1">
            {isViewer ? 'Broadcast Finished' : 'Live Stream Ended'}
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">
            {isViewer ? 'Thank you for watching!' : 'Broadcast Analytics Report'}
          </p>

          {!isViewer ? (
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-12">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">Time Elapsed</span>
                <span className="text-xl font-mono font-black text-pink-400">{formatTime(duration)}</span>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">Total Viewers</span>
                <span className="text-xl font-sans font-black text-rose-400">{viewerCount.toLocaleString()}</span>
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
          ) : (
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl w-full max-w-sm mb-12 flex flex-col gap-2 items-center">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Stream Host</span>
              <span className="text-lg font-black text-pink-400">@{broadcaster?.username || 'broadcaster'}</span>
              <p className="text-xs text-slate-400 font-medium max-w-xs mt-2 text-center leading-relaxed">
                This live broadcast session has completed. Subscribe to get notified for future streams!
              </p>
            </div>
          )}

          <button 
            type="button"
            onClick={onClose}
            className="w-full max-w-xs py-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-pink-900/30 cursor-pointer transition-all active:scale-95"
          >
            {isViewer ? 'Return to Feed' : 'Go Back to Shorts Feed'}
          </button>
        </div>
      )}
    </div>
  );
}

