/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useSocial } from '../context/SocialContext';
import { Post, Story, Comment } from '../types';
import { 
  Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, 
  Plus, X, Send, MapPin, Smile, Flag, Calendar, Trash2,
  Video, Users, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function HomeFeedView() {
  const {
    currentUser,
    posts,
    stories,
    comments,
    createStory,
    toggleLikePost,
    toggleSavePost,
    isLikedPost,
    isSavedPost,
    addComment,
    deleteComment,
    deletePost,
    reportContent,
    users,
    setActiveTab,
    setTargetProfileUid,
    reels,
    followUser,
    isFollowingUser,
    userActivities,
    uploadMediaFile
  } = useSocial();

  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [showStoryCreate, setShowStoryCreate] = useState(false);
  const [newStoryUrl, setNewStoryUrl] = useState('');
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyFileType, setStoryFileType] = useState<'image' | 'video'>('image');
  const [storyUploadLoading, setStoryUploadLoading] = useState(false);
  
  // Track visually dismissed recommended user IDs
  const [removedUserIds, setRemovedUserIds] = useState<string[]>([]);
  
  // Comments modal state
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);

  // More options state
  const [optionsPost, setOptionsPost] = useState<Post | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [showReportInput, setShowReportInput] = useState(false);

  // Story views simulation
  const [storyProgress, setStoryProgress] = useState(0);
  const storyInterval = useRef<any>(null);
  const storyFileInputRef = useRef<HTMLInputElement>(null);

  const startStoryTimer = () => {
    setStoryProgress(0);
    if (storyInterval.current) clearInterval(storyInterval.current);
    storyInterval.current = setInterval(() => {
      setStoryProgress(p => {
        if (p >= 100) {
          clearInterval(storyInterval.current);
          setActiveStory(null);
          return 100;
        }
        return p + 2;
      });
    }, 100);
  };

  const handleOpenStory = (story: Story) => {
    setActiveStory(story);
    startStoryTimer();
  };

  const handleCloseStory = () => {
    if (storyInterval.current) clearInterval(storyInterval.current);
    setActiveStory(null);
  };

  const handleCreateStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoryUploadLoading(true);
    try {
      let url = newStoryUrl;
      let finalType = storyFileType;
      if (storyFile) {
        url = await uploadMediaFile(storyFile, 'stories');
        finalType = storyFile.type.startsWith('video/') ? 'video' : 'image';
      } else {
        url = newStoryUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80';
      }
      await createStory(url, finalType);
      setNewStoryUrl('');
      setStoryFile(null);
      setStoryFileType('image');
      setShowStoryCreate(false);
    } catch (err) {
      console.error(err);
      alert("Failed to share story.");
    } finally {
      setStoryUploadLoading(false);
    }
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentPost || !newCommentText.trim()) return;
    addComment(commentPost.id, newCommentText, replyingToCommentId);
    setNewCommentText('');
    setReplyingToCommentId(null);
  };

  const handleReportPost = () => {
    if (!optionsPost || !reportReason) return;
    reportContent(optionsPost.id, 'post', reportReason);
    setReportReason('');
    setShowReportInput(false);
    setOptionsPost(null);
  };

  // Group stories by user to make an elegant list like Instagram
  const groupedStories: { [userId: string]: Story[] } = {};
  stories.forEach(s => {
    if (!groupedStories[s.userId]) {
      groupedStories[s.userId] = [];
    }
    groupedStories[s.userId].push(s);
  });

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-24 text-slate-800">
      {/* Main Container */}
      <main className="max-w-xl md:max-w-2xl mx-auto w-full py-4 px-2">

        {/* UNIFIED CONTINUOUS VERTICAL FEED */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col gap-0">

          {/* WHAT'S ON YOUR MIND BOX */}
          <div 
            onClick={() => setActiveTab('create')}
            className="p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50/50 transition-all active:scale-[0.99]"
          >
            {/* User profile with active status dot */}
            <div className="relative flex-shrink-0">
              <img 
                src={currentUser?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'} 
                alt={currentUser?.fullName || 'Me'} 
                className="w-10 h-10 rounded-full object-cover border border-slate-150"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>

            {/* Prompt text field outline */}
            <div className="flex-1 bg-slate-100 text-slate-550 text-sm py-2.5 px-4 rounded-full font-medium transition-colors text-left">
              What's on your mind?
            </div>

            {/* Photo icon on right */}
            <div className="flex flex-col items-center gap-0.5 justify-center pl-1 text-emerald-500 hover:text-emerald-600 transition-colors">
              <svg 
                className="w-6 h-6 text-emerald-500" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-[10px] text-slate-500 font-bold tracking-tight">Photo</span>
            </div>
          </div>

          {/* Thin horizontal separator line */}
          <div className="h-[1px] bg-[#E5E7EB] w-full" />

          {/* STORIES TRAY */}
          <div id="stories-tray" className="p-4 overflow-x-auto flex items-center gap-4 scrollbar-none">
            {/* Create Story Button */}
            <div className="flex flex-col items-center flex-shrink-0 cursor-pointer" onClick={() => setShowStoryCreate(true)}>
              <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 hover:bg-slate-100">
                <Plus className="w-6 h-6 text-slate-400" />
                <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 mt-2">Your Story</span>
            </div>

            {/* Grouped Stories list */}
            {Object.entries(groupedStories).map(([userId, list]) => {
              const firstStory = list[0];
              const hasStoryUnread = true; // highlight unread stories with grad ring
              
              return (
                <div 
                  key={userId} 
                  className="flex flex-col items-center flex-shrink-0 cursor-pointer"
                  onClick={() => handleOpenStory(firstStory)}
                >
                  <div className={`p-0.5 rounded-full bg-gradient-to-r ${hasStoryUnread ? 'from-cyan-400 via-pink-400 to-yellow-400' : 'from-slate-200 to-slate-200'} shadow-md`}>
                    <div className="bg-white p-0.5 rounded-full">
                      <img 
                        src={firstStory.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'} 
                        alt={firstStory.username} 
                        className="w-14 h-14 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 mt-2 max-w-[65px] truncate text-center">
                    {firstStory.username}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Thin horizontal separator line */}
          <div className="h-[1px] bg-[#E5E7EB] w-full" />

          {/* LIVE REAL TIME CAMPUS STREAM */}
          <div className="p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <h3 className="text-xs font-black tracking-wider uppercase text-slate-800">
                  Live Global Activity Stream
                </h3>
              </div>
              <span className="text-[9px] font-mono text-cyan-600 font-black bg-cyan-50 px-2 py-0.5 rounded-full">
                {userActivities.length} logs
              </span>
            </div>

            <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
              {userActivities.slice(0, 8).map((act) => {
                const typeLabels: { [key: string]: { label: string; textClass: string; bgClass: string } } = {
                  signup: { label: 'SIGNUP', textClass: 'text-emerald-700', bgClass: 'bg-emerald-50' },
                  login: { label: 'LOGIN', textClass: 'text-cyan-700', bgClass: 'bg-cyan-50' },
                  create_post: { label: 'POST', textClass: 'text-purple-700', bgClass: 'bg-purple-50' },
                  create_story: { label: 'STORY', textClass: 'text-pink-700', bgClass: 'bg-pink-50' },
                  create_reel: { label: 'SHORT', textClass: 'text-rose-700', bgClass: 'bg-rose-50' },
                };

                const spec = typeLabels[act.activityType] || { label: 'LOG', textClass: 'text-slate-700', bgClass: 'bg-slate-50' };

                 return (
                  <div key={act.id} className="flex gap-2.5 items-start py-1 rounded-2xl">
                    <img
                      src={act.profilePhoto}
                      alt={act.fullName}
                      className="w-7 h-7 rounded-full object-cover border border-slate-100 mt-0.5 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-cyan-500 transition-all"
                      referrerPolicy="no-referrer"
                      onClick={() => {
                        setTargetProfileUid(act.userId);
                        setActiveTab('profile');
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span 
                          className="text-xs font-bold text-slate-800 truncate cursor-pointer hover:text-cyan-600 transition-colors"
                          onClick={() => {
                            setTargetProfileUid(act.userId);
                            setActiveTab('profile');
                          }}
                        >
                          {act.fullName}
                        </span>
                        <span 
                          className="text-[9px] text-slate-400 font-medium cursor-pointer hover:text-cyan-500 transition-colors"
                          onClick={() => {
                            setTargetProfileUid(act.userId);
                            setActiveTab('profile');
                          }}
                        >
                          @{act.username}
                        </span>
                        <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-full ${spec.textClass} ${spec.bgClass}`}>
                          {spec.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-snug break-words">
                        {act.activityDetails}
                      </p>
                      <div className="text-[8px] text-slate-400 font-sans mt-0.5">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Thin horizontal separator line */}
          <div className="h-[1px] bg-[#E5E7EB] w-full" />

          {/* FEED LIST */}
          {(() => {
            // Helper function to render a single post
            const renderPost = (post: any) => {
              const isLiked = isLikedPost(post.id);
              const isSaved = isSavedPost(post.id);
              const isOwnPost = currentUser && post.userId === currentUser.uid;

              return (
                <motion.article 
                  key={`post-${post.id}`} 
                  className="bg-white pt-3.5 px-4 pb-0 overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Header info */}
                  <div className="flex items-center justify-between mb-3">
                    <div 
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => {
                        setTargetProfileUid(post.userId);
                        setActiveTab('profile');
                      }}
                    >
                      <img 
                        src={post.profilePhoto} 
                        alt={post.fullName} 
                        className="w-11 h-11 rounded-full object-cover border border-slate-100 group-hover:ring-2 group-hover:ring-cyan-500 transition-all"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="text-sm font-black text-slate-800 group-hover:text-cyan-600 transition-colors">{post.fullName}</h4>
                          {post.userId === 'umt-uid' && (
                            <div className="w-3.5 h-3.5 rounded-full bg-cyan-500 text-white flex items-center justify-center text-[8px] font-bold">✓</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <span>@{post.username}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 font-sans justify-center"><Calendar className="w-3 h-3" /> recent</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setOptionsPost(post)} 
                      className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <p className="text-sm text-slate-700 font-medium leading-relaxed mb-3 whitespace-pre-line px-1">
                    {post.text}
                  </p>

                  {/* Image Gallery supporting single/carousel */}
                  {post.mediaType === 'image' && post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="relative rounded-2xl overflow-hidden mb-3.5 bg-slate-100 border border-slate-100 shadow-sm">
                      <img 
                        src={post.mediaUrls[0]} 
                        alt="Post visual attachment" 
                        className="w-full max-h-[340px] object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {post.mediaUrls.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black/60 text-white font-mono text-[9px] font-bold px-2 py-1 rounded-full">
                          1/{post.mediaUrls.length}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Location Badge */}
                  {post.location && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-bold mb-3.5 px-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                      <span>{post.location}</span>
                    </div>
                  )}

                  {/* Feedback Action Buttons row */}
                  <div className="flex items-center justify-between border-t border-slate-100 py-2.5 px-1 mt-2">
                    <div className="flex items-center gap-5">
                      {/* Like button */}
                      <button 
                        onClick={() => toggleLikePost(post.id)}
                        className="flex items-center gap-1.5 text-slate-500 hover:text-rose-500 transition-colors"
                      >
                        <Heart className={`w-5.5 h-5.5 ${isLiked ? 'fill-rose-500 stroke-rose-500 text-rose-500 animate-pulse' : ''}`} />
                        <span className="text-xs font-black font-sans">{post.likesCount || 0}</span>
                      </button>

                      {/* Comment button */}
                      <button 
                        onClick={() => setCommentPost(post)}
                        className="flex items-center gap-1.5 text-slate-500 hover:text-cyan-500 transition-colors"
                      >
                        <MessageCircle className="w-5.5 h-5.5" />
                        <span className="text-xs font-black font-sans">
                          {comments.filter(c => c.postId === post.id).length || post.commentsCount}
                        </span>
                      </button>

                      {/* Share mock button */}
                      <button 
                        onClick={() => alert("Post link copied to clipboard! Shared via social rails.")}
                        className="flex items-center gap-1.5 text-slate-500 hover:text-blue-500 transition-colors"
                      >
                        <Share2 className="w-5.5 h-5.5" />
                      </button>
                    </div>

                    {/* Bookmark Save button */}
                    <button 
                      onClick={() => toggleSavePost(post.id)}
                      className="p-1 text-slate-500 hover:text-amber-500 transition-colors"
                    >
                      <Bookmark className={`w-5.5 h-5.5 ${isSaved ? 'fill-amber-500 stroke-amber-500 text-amber-500' : ''}`} />
                    </button>
                  </div>
                </motion.article>
              );
            };

            type FeedItem =
              | { type: 'post'; post: any }
              | { type: 'reels'; id: string; key: string }
              | { type: 'people'; id: string; key: string; recommendedUsers: any[] };

            const items: FeedItem[] = [];

            posts.forEach((post, i) => {
              items.push({ type: 'post', post });
              const postOrdinal = i + 1;

              if (postOrdinal === 2) {
                items.push({ type: 'reels', id: 'reels-1', key: 'reels-inject-1' });
              }

              if (postOrdinal === 6) {
                const recommended = users.filter(u => {
                  if (currentUser && u.uid === currentUser.uid) return false;
                  if (isFollowingUser(u.uid)) return false;
                  if (removedUserIds.includes(u.uid)) return false;
                  return true;
                }).slice(0, 10);

                if (recommended.length > 0) {
                  items.push({ type: 'people', id: 'people-1', key: 'people-inject-1', recommendedUsers: recommended });
                }
              }

              if (postOrdinal === 15) {
                items.push({ type: 'reels', id: 'reels-2', key: 'reels-inject-2' });
              }

              if (postOrdinal === 20) {
                const recommended = users.filter(u => {
                  if (currentUser && u.uid === currentUser.uid) return false;
                  if (isFollowingUser(u.uid)) return false;
                  if (removedUserIds.includes(u.uid)) return false;
                  return true;
                }).slice(0, 10);

                if (recommended.length > 0) {
                  items.push({ type: 'people', id: 'people-2', key: 'people-inject-2', recommendedUsers: recommended });
                }
              }
            });

            type GroupedItem =
              | { type: 'post_group'; posts: any[] }
              | { type: 'reels'; id: string; key: string }
              | { type: 'people'; id: string; key: string; recommendedUsers: any[] };

            const groups: GroupedItem[] = [];
            let currentPostGroup: any[] = [];

            items.forEach((item) => {
              if (item.type === 'post') {
                currentPostGroup.push(item.post);
              } else {
                if (currentPostGroup.length > 0) {
                  groups.push({ type: 'post_group', posts: currentPostGroup });
                  currentPostGroup = [];
                }
                if (item.type === 'reels') {
                  groups.push({ type: 'reels', id: item.id, key: item.key });
                } else if (item.type === 'people') {
                  groups.push({ type: 'people', id: item.id, key: item.key, recommendedUsers: item.recommendedUsers });
                }
              }
            });

            if (currentPostGroup.length > 0) {
              groups.push({ type: 'post_group', posts: currentPostGroup });
            }

            return groups.map((group, groupIdx) => {
              const isLastGroup = groupIdx === groups.length - 1;

              if (group.type === 'post_group') {
                return (
                  <React.Fragment key={`post-group-${groupIdx}`}>
                    {group.posts.map((post, postIdx) => {
                      const isLastPostOfGroup = postIdx === group.posts.length - 1;
                      const showDivider = !isLastPostOfGroup || !isLastGroup;

                      return (
                        <div key={`group-item-post-${post.id}`}>
                          {renderPost(post)}
                          {showDivider && (
                            <div className="h-[1px] bg-[#E5E7EB] w-full" />
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              } else if (group.type === 'reels') {
                return (
                  <React.Fragment key={group.key}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
                          <Video className="w-5 h-5 text-rose-500" />
                          <span>Reels</span>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600" onClick={() => setActiveTab('shorts')}>
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex gap-2.5 overflow-x-auto scrollbar-none snap-x py-1 px-1">
                        {reels.map((reel) => (
                          <div 
                            key={reel.id}
                            onClick={() => setActiveTab('shorts')}
                            className="w-[200px] h-[330px] rounded-2xl overflow-hidden relative flex-shrink-0 snap-start bg-slate-900 border border-slate-100 shadow-sm cursor-pointer group active:scale-[0.98] transition-all"
                          >
                            <video 
                              src={reel.videoUrl} 
                              className="w-full h-full object-cover pointer-events-none group-hover:scale-105 transition-transform duration-300" 
                              muted 
                              loop 
                              playsInline 
                              autoPlay 
                            />
                            {/* Gradient bottom overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
                            
                            {/* Top Right triple dot menu */}
                            <div className="absolute top-2 right-2 bg-black/45 p-1 rounded-full text-white backdrop-blur-xs">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </div>

                            {/* Bottom Caption Overlay */}
                            <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white pointer-events-none">
                              <p className="text-[10px] font-black leading-snug line-clamp-3 text-shadow-sm">
                                {reel.caption}
                              </p>
                              <div className="flex items-center gap-1 mt-1.5 opacity-90">
                                <img 
                                  src={reel.profilePhoto} 
                                  alt={reel.username} 
                                  className="w-4.5 h-4.5 rounded-full object-cover border border-white/40"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="text-[8px] font-extrabold truncate text-slate-100">@{reel.username}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {!isLastGroup && (
                      <div className="h-[1px] bg-[#E5E7EB] w-full" />
                    )}
                  </React.Fragment>
                );
              } else if (group.type === 'people') {
                return (
                  <React.Fragment key={group.key}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-[15px]">
                          <Users className="w-5 h-5 text-sky-500" />
                          <span>People you may know</span>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex gap-3 overflow-x-auto scrollbar-none snap-x py-1.5 px-1">
                        {group.recommendedUsers.map((recommendUser) => (
                          <div 
                            key={recommendUser.uid}
                            className="w-[260px] rounded-[18px] bg-white border border-[#e4e6eb] shadow-xs flex-shrink-0 snap-start overflow-hidden flex flex-col"
                          >
                            <div className="relative aspect-[3/4] w-full bg-slate-100">
                              <img 
                                src={recommendUser.profilePhoto || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80'} 
                                alt={recommendUser.fullName} 
                                className="w-full h-full object-cover animate-fade-in"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            <div className="p-3 flex flex-col justify-between flex-grow gap-2.5 bg-white">
                              <div>
                                <h5 className="text-[16px] font-bold text-slate-900 truncate tracking-tight text-left leading-none mt-1">
                                  {recommendUser.fullName}
                                </h5>
                              </div>

                              <div className="flex gap-2 mt-1">
                                <button 
                                  onClick={() => {
                                    followUser(recommendUser.uid);
                                    alert(`Added ${recommendUser.fullName} to your connections.`);
                                  }}
                                  className="flex-[1.5] py-2 rounded-lg bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                                >
                                  <UserPlus className="w-4 h-4 text-white" />
                                  <span>Add friend</span>
                                </button>
                                <button 
                                  onClick={() => {
                                    setRemovedUserIds(prev => [...prev, recommendUser.uid]);
                                  }}
                                  className="flex-1 py-1.5 rounded-lg bg-[#e4e6eb] hover:bg-[#d8dadf] text-[#050505] font-semibold text-xs flex items-center justify-center active:scale-[0.98] transition-all"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-center mt-2 pb-1">
                        <button 
                          onClick={() => alert("Loading entire Ti Connect verified member directory...")}
                          className="text-[14px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                        >
                          <span>See all</span>
                          <span className="text-slate-400 font-bold ml-0.5">&gt;</span>
                        </button>
                      </div>
                    </div>
                    {!isLastGroup && (
                      <div className="h-[1px] bg-[#E5E7EB] w-full" />
                    )}
                  </React.Fragment>
                );
              }
              return null;
            });
          })()}
        </div>
      </main>

      {/* STORY VIEWER MODAL */}
      <AnimatePresence>
        {activeStory && (
          <motion.div 
            className="fixed inset-0 bg-black z-50 flex flex-col justify-between"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Story loading top headers */}
            <div className="p-4 flex flex-col gap-3">
              {/* Progress bars */}
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 transition-all duration-100 ease-linear"
                  style={{ width: `${storyProgress}%` }}
                ></div>
              </div>

              {/* Story User Info details */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <img 
                    src={activeStory.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'} 
                    alt={activeStory.username} 
                    className="w-10 h-10 rounded-full border-2 border-white/80 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h5 className="font-extrabold text-sm text-shadow">{activeStory.username}</h5>
                    <p className="text-[10px] text-white/60 font-bold uppercase">Daily Update</p>
                  </div>
                </div>

                <button onClick={handleCloseStory} className="text-white hover:text-cyan-400 p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Story Image container */}
            <div className="flex-1 flex items-center justify-center p-2 relative">
              <img 
                src={activeStory.mediaUrl} 
                alt="Story visual content" 
                className="max-h-[80vh] rounded-3xl object-contain shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Bottom response bar simulation */}
            <div className="p-6 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center gap-4">
              <input 
                type="text" 
                placeholder="Send a supportive response..."
                className="flex-1 p-3 rounded-full bg-white/10 text-white placeholder-white/50 text-sm focus:bg-white/20 outline-none"
                onFocus={() => { if (storyInterval.current) clearInterval(storyInterval.current); }}
                onBlur={startStoryTimer}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    alert("Reply sent privately to messenger!");
                    handleCloseStory();
                  }
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STORY CREATE SLIDE DRAWER */}
      <AnimatePresence>
        {showStoryCreate && (
          <div className="fixed inset-0 bg-black/60 z-30 flex items-end justify-center p-4">
            <motion.div 
              className="bg-white rounded-t-[40px] rounded-b-3xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl"
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black">Publish Stories</h3>
                <button onClick={() => setShowStoryCreate(false)} className="p-1 rounded-full hover:bg-slate-100">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateStorySubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">Upload Story File or Paste URL</label>
                  
                  {/* File Upload Box */}
                  <div 
                    onClick={() => storyFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-50/80 rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-1 mb-3 select-none"
                  >
                    <input 
                      type="file" 
                      ref={storyFileInputRef}
                      className="hidden" 
                      accept="image/*,video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setStoryFile(file);
                          setStoryFileType(file.type.startsWith('video/') ? 'video' : 'image');
                          
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setNewStoryUrl(event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <span className="text-xs font-black text-slate-700">Tap to upload story (Image/Video)</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Or drag and drop files here</span>
                  </div>

                  {newStoryUrl && (
                    <div className="relative rounded-2xl overflow-hidden mt-2 bg-slate-100 border max-h-[160px] flex items-center justify-center mb-3">
                      {storyFileType === 'video' ? (
                        <video src={newStoryUrl} controls className="w-full max-h-[160px] object-cover" />
                      ) : (
                        <img src={newStoryUrl} alt="Story Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      )}
                      <button 
                        type="button" 
                        onClick={() => {
                          setNewStoryUrl('');
                          setStoryFile(null);
                          setStoryFileType('image');
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:text-cyan-400 transition-colors z-10 text-[10px]"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  <input 
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={storyFile ? '' : newStoryUrl}
                    disabled={!!storyFile}
                    onChange={(e) => {
                      setNewStoryUrl(e.target.value);
                      setStoryFileType('image');
                    }}
                    className="w-full p-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-500 bg-slate-50 text-slate-700 placeholder-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-2">
                  <button 
                    type="button"
                    disabled={!!storyFile}
                    onClick={() => {
                      setNewStoryUrl('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80');
                      setStoryFileType('image');
                    }}
                    className="p-3 text-xs font-extrabold rounded-xl border border-slate-100 bg-slate-50 text-slate-600 hover:border-cyan-400 hover:text-cyan-500 transition-colors disabled:opacity-50"
                  >
                    💡 Template 1 (Tech Hub)
                  </button>
                  <button 
                    type="button"
                    disabled={!!storyFile}
                    onClick={() => {
                      setNewStoryUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80');
                      setStoryFileType('image');
                    }}
                    className="p-3 text-xs font-extrabold rounded-xl border border-slate-100 bg-slate-50 text-slate-600 hover:border-cyan-400 hover:text-cyan-500 transition-colors disabled:opacity-50"
                  >
                    🍲 Template 2 (Culinary table)
                  </button>
                </div>

                <button 
                  type="submit"
                  disabled={storyUploadLoading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-extrabold shadow-md shadow-cyan-300/40 hover:opacity-95 transition-all"
                >
                  {storyUploadLoading ? 'Uploading story...' : 'Post Story'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMMENTS SHEET MODAL */}
      <AnimatePresence>
        {commentPost && (
          <div className="fixed inset-0 bg-black/65 z-30 flex items-end justify-center">
            {/* Background Closer */}
            <div className="absolute inset-0" onClick={() => setCommentPost(null)}></div>
            
            <motion.div 
              className="relative bg-white rounded-t-[40px] w-full max-w-md h-[85vh] flex flex-col shadow-2xl z-40"
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black">Comments</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Thread Discussion</p>
                </div>
                <button onClick={() => setCommentPost(null)} className="p-1 px-2.5 rounded-full hover:bg-slate-150">
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              {/* Comments scroll area */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                {comments.filter(c => c.postId === commentPost.id && !c.parentId).map(comment => {
                  const replies = comments.filter(r => r.postId === commentPost.id && r.parentId === comment.id);

                  return (
                    <div key={comment.id} className="border-b border-slate-50 pb-3">
                      <div className="flex items-start gap-3">
                        <img 
                          src={comment.profilePhoto} 
                          alt={comment.fullName} 
                          className="w-9 h-9 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-800">{comment.fullName}</span>
                            <span className="text-[10px] text-slate-400">@{comment.username}</span>
                          </div>
                          <p className="text-sm text-slate-650 font-medium leading-relaxed mt-1">
                            {comment.text}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <button 
                              onClick={() => setReplyingToCommentId(comment.id)}
                              className="text-[10px] font-bold text-cyan-500 hover:underline"
                            >
                              Reply
                            </button>
                            {currentUser && comment.userId === currentUser.uid && (
                              <button 
                                onClick={() => deleteComment(comment.id)}
                                className="text-[10px] font-bold text-rose-500 hover:underline"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* RENDERING NESTED REPLIES */}
                      {replies.length > 0 && (
                        <div className="ml-8 mt-3 pl-3 border-l-2 border-slate-100 flex flex-col gap-3">
                          {replies.map(reply => (
                            <div key={reply.id} className="flex items-start gap-3">
                              <img 
                                src={reply.profilePhoto} 
                                alt={reply.fullName} 
                                className="w-7 h-7 rounded-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-800">{reply.fullName}</span>
                                  <span className="text-[10px] text-slate-400">@{reply.username}</span>
                                </div>
                                <p className="text-xs text-slate-650 font-medium leading-relaxed mt-1">
                                  {reply.text}
                                </p>
                                {currentUser && reply.userId === currentUser.uid && (
                                  <button 
                                    onClick={() => deleteComment(reply.id)}
                                    className="text-[10px] font-bold text-rose-500 hover:underline mt-1.5 block"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {comments.filter(c => c.postId === commentPost.id).length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <Smile className="w-12 h-12 stroke-1 mb-2 text-slate-300" />
                    <p className="text-sm font-semibold">No comments yet.</p>
                    <p className="text-xs">Be the first to share your university feedback!</p>
                  </div>
                )}
              </div>

              {/* Bottom input form */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col gap-2">
                {replyingToCommentId && (
                  <div className="flex justify-between items-center bg-cyan-50 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-600">
                    <span>Replying to nested comment thread</span>
                    <button onClick={() => setReplyingToCommentId(null)}>✖</button>
                  </div>
                )}

                <form onSubmit={handleAddCommentSubmit} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Compose supportive feedback..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-1 p-3.5 border border-slate-200 rounded-2xl text-sm outline-none focus:border-cyan-500 bg-white"
                  />
                  <button 
                    type="submit"
                    className="h-12 w-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white flex items-center justify-center shadow-md shadow-cyan-300/40"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OPTIONS SHEET MODAL (Delete / Report) */}
      <AnimatePresence>
        {optionsPost && (
          <div className="fixed inset-0 bg-black/50 z-30 flex items-end justify-center p-4">
            <div className="absolute inset-0" onClick={() => setOptionsPost(null)}></div>
            <motion.div 
              className="relative bg-white rounded-t-[40px] rounded-b-3xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl z-40"
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black">Memory Admin</h3>
                <button onClick={() => setOptionsPost(null)} className="p-1 rounded-full hover:bg-slate-150">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {showReportInput ? (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-slate-500">Provide an explicit reason for moderation (e.g. offensive language, plagiarism):</p>
                  <input 
                    type="text"
                    required
                    placeholder="State your concern..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="p-3 border border-slate-200 rounded-xl text-sm"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button" 
                      onClick={() => setShowReportInput(false)}
                      className="p-3 rounded-xl bg-slate-100 font-bold"
                    >
                      Back
                    </button>
                    <button 
                      type="button" 
                      onClick={handleReportPost}
                      className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-extrabold shadow"
                    >
                      Submit Report
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 py-2">
                  {currentUser && (optionsPost.userId === currentUser.uid || currentUser.email === 'sheilawalshsheila@gmail.com') ? (
                    <button 
                      onClick={() => {
                        deletePost(optionsPost.id);
                        setOptionsPost(null);
                        alert("Post successfully removed from memory stream.");
                      }}
                      className="w-full py-4 rounded-xl bg-rose-50 text-rose-605 font-bold hover:bg-rose-100 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-rose-500" />
                      <span>Delete Post</span>
                    </button>
                  ) : null}

                  <button 
                    onClick={() => setShowReportInput(true)}
                    className="w-full py-4 rounded-xl bg-amber-50 text-amber-700 font-bold hover:bg-amber-100 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Flag className="w-5 h-5 text-amber-500" />
                    <span>Report Content for Moderation</span>
                  </button>

                  <button 
                    onClick={() => setOptionsPost(null)}
                    className="w-full py-4 rounded-xl bg-slate-50 text-slate-700 font-semibold hover:bg-slate-100 text-center transition-colors border border-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
