/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useSocial } from '../context/SocialContext';
import { Reel } from '../types';
import { 
  Heart, MessageSquare, Share2, Upload, X, Play, Music, Volume2, VolumeX, Sparkles, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ShortsView() {
  const { reels, createReel, toggleLikeReel, currentUser, setActiveTab, uploadMediaFile } = useSocial();
  const [activeReelIdx, setActiveReelIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [likedAnimMap, setLikedAnimMap] = useState<{ [reelId: string]: boolean }>({});
  
  const [reelFile, setReelFile] = useState<File | null>(null);
  const [reelUploadLoading, setReelUploadLoading] = useState(false);
  const reelFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDoubleTapLike = (reelId: string) => {
    toggleLikeReel(reelId);
    setLikedAnimMap(prev => ({ ...prev, [reelId]: true }));
    setTimeout(() => {
      setLikedAnimMap(prev => ({ ...prev, [reelId]: false }));
    }, 850);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReelUploadLoading(true);
    try {
      let finalUrl = videoUrl;
      if (reelFile) {
        finalUrl = await uploadMediaFile(reelFile, 'reels');
      } else {
        finalUrl = videoUrl || videoTemplates[0].url;
      }
      await createReel(finalUrl, caption);
      setVideoUrl('');
      setCaption('');
      setReelFile(null);
      setShowUploadModal(false);
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

          <span className="p-1 px-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-[9px] font-black uppercase tracking-wider scale-95 shadow">
            LIVE
          </span>
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
      <div className="flex-1 w-full bg-black flex flex-col items-center justify-center relative">
        {reels.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <Sparkles className="w-12 h-12 text-slate-500 animate-spin" />
            <p className="font-extrabold text-sm">No reels uploaded yet!</p>
            <p className="text-xs">Be the first custom uploader in the global feed.</p>
          </div>
        ) : (
          <div className="w-full h-full absolute inset-0 flex items-center justify-center overflow-hidden">
            {reels.map((reel, idx) => {
              if (idx !== activeReelIdx) return null;
              const isLiked = (reel as any).isLiked;

              return (
                <div 
                  key={reel.id} 
                  className="w-full h-full absolute inset-0 bg-black flex items-center justify-center overflow-hidden group"
                  onDoubleClick={() => handleDoubleTapLike(reel.id)}
                >
                  {/* Inline Looping video player */}
                  <video 
                    src={reel.videoUrl} 
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                  />

                  {/* Absolute Click area to toggle audio or shows mute indicator badge */}
                  <div 
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute inset-0 bg-transparent flex items-center justify-center cursor-pointer"
                  >
                    {isMuted ? (
                      <div className="absolute top-20 right-4 p-2 bg-black/60 rounded-full backdrop-blur-xs text-xs text-slate-300 pointer-events-none flex items-center gap-1">
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Tap video to unmute</span>
                      </div>
                    ) : (
                      <div className="absolute top-20 right-4 p-2 bg-cyan-500/80 rounded-full text-xs text-white pointer-events-none flex items-center gap-1">
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
                    <div className="p-0.5 bg-gradient-to-tr from-pink-500 to-rose-500 rounded-full shadow-lg">
                      <img 
                        src={reel.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'} 
                        alt={reel.username}
                        className="w-11 h-11 rounded-full object-cover border border-black/50"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Like button */}
                    <button 
                      onClick={() => toggleLikeReel(reel.id)}
                      className="p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/65 transition-transform active:scale-90 flex flex-col items-center gap-1 group shadow"
                    >
                      <Heart className={`w-5.5 h-5.5 ${isLiked ? 'text-rose-500 fill-rose-500 animate-pulse' : 'text-stone-100 group-hover:text-rose-450'}`} />
                      <span className="text-[10px] font-black">{reel.likesCount || 0}</span>
                    </button>

                    {/* Comment mock count */}
                    <button 
                      onClick={() => alert("Thread replies loaded inside memory chassis!")}
                      className="p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/65 transition-transform active:scale-90 flex flex-col items-center gap-1 shadow"
                    >
                      <MessageSquare className="w-5.5 h-5.5 text-stone-100" />
                      <span className="text-[10px] font-black">{reel.commentsCount || 1}</span>
                    </button>

                    {/* Share mock count */}
                    <button 
                      onClick={() => alert("Reel short URL copied! Share with classmate.")}
                      className="p-3 rounded-full bg-black/50 backdrop-blur-sm text-stone-100 hover:text-white transition-all active:scale-95 flex flex-col items-center gap-1 shadow"
                    >
                      <Share2 className="w-5.5 h-5.5" />
                      <span className="text-[10px] font-semibold">{reel.sharesCount || 4}</span>
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
                </div>
              );
            })}

            {/* Pagination vertical buttons for loops */}
            {reels.length > 1 && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20 bg-slate-900/50 p-2.5 rounded-full border border-white/5 backdrop-blur-md">
                {reels.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveReelIdx(idx)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      activeReelIdx === idx ? 'bg-cyan-400 scale-[1.25]' : 'bg-white/30 hover:bg-white/60'
                    }`}
                    title={`Go to reel ${idx + 1}`}
                  />
                ))}
              </div>
            )}
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
                  <label className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">
                    Upload Short Video or Enter MP4 Link
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
                    <span className="text-[10px] text-slate-400 font-semibold">Supports MP4, MOV format</span>
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
                    className="w-full p-3.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-cyan-500 bg-slate-50"
                  />
                </div>

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
                  disabled={reelUploadLoading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-pink-200/50 mt-1 cursor-pointer transition-all hover:translate-y-[-1px] disabled:opacity-50"
                >
                  {reelUploadLoading ? 'Uploading Short Video...' : 'Publish Campus Short ✨'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
