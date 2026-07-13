/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useSocial } from '../context/SocialContext';
import { UserProfile } from '../types';
import { Search as SearchIcon, Filter, Check, UserPlus, UserCheck, Eye } from 'lucide-react';
import { motion } from 'motion/react';

export default function SearchView() {
  const { 
    users, 
    currentUser, 
    followUser, 
    unfollowUser, 
    isFollowingUser, 
    posts, 
    setTargetProfileUid, 
    setActiveTab 
  } = useSocial();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState<'all' | 'profiles' | 'posts' | 'institutes'>('all');

  // Handle Search Queries
  const filteredUsers = users.filter(user => {
    // Current user can also be searched and found
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeChip === 'profiles') return matchesSearch && user.userType === 'student';
    if (activeChip === 'institutes') return matchesSearch && user.userType === 'institute';
    return matchesSearch;
  });

  const filteredPosts = posts.filter(post => {
    return post.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const toggleFollow = (user: UserProfile) => {
    if (isFollowingUser(user.uid)) {
      unfollowUser(user.uid);
    } else {
      followUser(user.uid);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-24 text-slate-800">
      {/* Header bar with Search query */}
      <div className="sticky top-0 bg-white border-b border-slate-100 z-10 p-4 shadow-sm">
        <div className="relative max-w-xl md:max-w-2xl mx-auto">
          <input 
            type="text" 
            placeholder="Search for students, subjects, posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-150 border-0 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 text-sm outline-none transition-all font-medium"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5.5 h-5.5" />
        </div>

        {/* Filter chips scrolling container */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-none max-w-xl md:max-w-2xl mx-auto">
          {(['all', 'profiles', 'posts', 'institutes'] as const).map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold capitalize transition-colors duration-200 border ${
                activeChip === chip 
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white border-transparent shadow shadow-cyan-300/30' 
                  : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Main Results body */}
      <div className="max-w-xl md:max-w-2xl mx-auto w-full p-4 flex flex-col gap-4">
        {/* Render profiles when relevant */}
        {activeChip !== 'posts' && (
          <div className="flex flex-col gap-3">
            {filteredUsers.length > 0 && <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-1 uppercase font-mono">Popular Users</h3>}
            {filteredUsers.map((user) => {
              const following = isFollowingUser(user.uid);
              const isMe = currentUser && user.uid === currentUser.uid;
              return (
                <motion.div 
                  key={user.uid} 
                  className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100 hover:border-slate-200 transition-colors"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div 
                    className="flex items-center gap-3 cursor-pointer group flex-1 mr-2 min-w-0"
                    onClick={() => {
                      setTargetProfileUid(user.uid);
                      setActiveTab('profile');
                    }}
                  >
                    <img 
                      src={user.profilePhoto || 'https://images.unsplash.com/photo-1535713875003-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} 
                      alt={user.fullName} 
                      className="w-12 h-12 rounded-full object-cover border border-slate-50 group-hover:ring-2 group-hover:ring-cyan-500 transition-all"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-800 leading-none group-hover:text-cyan-600 transition-colors">{user.fullName}</span>
                        {user.verified && (
                          <div className="w-3.5 h-3.5 rounded-full bg-cyan-500 text-white flex items-center justify-center text-[8px] font-bold">✓</div>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium block">@{user.username}</span>
                      <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[170px] mt-1 capitalize">
                        {user.userType} • {user.location}
                      </p>
                    </div>
                  </div>

                  {/* Follow / Edit controls */}
                  {isMe ? (
                    <div className="py-2 px-3.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold border border-slate-200 shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                      <span>You</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleFollow(user)}
                      className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        following 
                          ? 'bg-slate-100 text-slate-600 border border-slate-200' 
                          : 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-sm shadow-cyan-300/30'
                      }`}
                    >
                      {following ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Render posts when relevant */}
        {(activeChip === 'all' || activeChip === 'posts') && filteredPosts.length > 0 && (
          <div className="flex flex-col gap-3 mt-2">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-1 uppercase font-mono">Trending Posts</h3>
            {filteredPosts.map(post => (
              <motion.div 
                key={post.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div 
                  className="flex items-center gap-2 mb-2 cursor-pointer group w-fit"
                  onClick={() => {
                    setTargetProfileUid(post.userId);
                    setActiveTab('profile');
                  }}
                >
                  <img src={post.profilePhoto} alt={post.username} className="w-6 h-6 rounded-full object-cover group-hover:ring-1 group-hover:ring-cyan-500 transition-all" referrerPolicy="no-referrer" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-cyan-600 transition-colors">@{post.username}</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-3">{post.text}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-405 font-bold mt-3">
                  <span>Likes: {post.likesCount}</span>
                  <span>•</span>
                  <span>Comments: {post.commentsCount}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state finder checks */}
        {filteredUsers.length === 0 && (filteredPosts.length === 0 || activeChip !== 'posts') && (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 mt-8">
            <Filter className="w-12 h-12 stroke-1 mb-3 text-slate-300" />
            <p className="text-sm font-semibold">No results match your criteria.</p>
            <p className="text-xs">Try searching for other student usernames or keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
}
