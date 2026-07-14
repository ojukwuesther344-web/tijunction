/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useSocial } from '../context/SocialContext';
import { UserProfile } from '../types';
import { 
  Grid, Bookmark, Eye, Edit3, Settings, LogOut, Check, 
  MapPin, Globe, Award, ShieldAlert, X, EyeOff, Save, Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileViewProps {
  altTargetUid?: string | null;
  onClearTarget?: () => void;
  openSettingsTab: () => void;
}

export default function ProfileView({ altTargetUid, onClearTarget, openSettingsTab }: ProfileViewProps) {
  const {
    currentUser,
    users,
    posts,
    stories,
    savedPostIds,
    updateProfile,
    isFollowingUser,
    followUser,
    unfollowUser,
    reports,
    deletePost,
    uploadMediaFile
  } = useSocial();

  const [activeTab, setActiveTab] = useState<'memories' | 'stories' | 'saved' | 'admin'>('memories');
  const [showEditModal, setShowEditModal] = useState(false);

  // Profile fields editing state
  const [editFullName, setEditFullName] = useState(currentUser?.fullName || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editWebsite, setEditWebsite] = useState(currentUser?.website || '');
  const [editLocation, setEditLocation] = useState(currentUser?.location || '');
  const [editProfilePhoto, setEditProfilePhoto] = useState(currentUser?.profilePhoto || '');
  const [editCoverPhoto, setEditCoverPhoto] = useState(currentUser?.coverPhoto || '');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  // Select target: ourselves, or another student
  const profileUser: UserProfile = altTargetUid 
    ? (users.find(u => u.uid === altTargetUid) || currentUser!) 
    : currentUser!;

  const isMe = currentUser && profileUser.uid === currentUser.uid;
  const isFollowing = isFollowingUser(profileUser.uid);

  // Computed feeds
  const userPosts = posts.filter(p => p.userId === profileUser.uid);
  const userStories = stories.filter(s => s.userId === profileUser.uid);
  const bookmarkPosts = posts.filter(p => savedPostIds.includes(p.id));

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      fullName: editFullName,
      bio: editBio,
      website: editWebsite,
      location: editLocation,
      profilePhoto: editProfilePhoto,
      coverPhoto: editCoverPhoto
    });
    setShowEditModal(false);
    alert("Portfolio profile revised successfully!");
  };

  const toggleFollow = () => {
    if (isFollowing) {
      unfollowUser(profileUser.uid);
    } else {
      followUser(profileUser.uid);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-24 text-slate-800">
      {/* Profil details heading banner */}
      <div className="relative h-48 bg-slate-200 overflow-hidden">
        <img 
          src={profileUser.coverPhoto || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&h=300&q=80'} 
          alt="Cover Portfolio banner" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        
        {/* Transparent layout headers */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          {altTargetUid && onClearTarget ? (
            <button 
              onClick={onClearTarget}
              className="py-1.5 px-3.5 bg-black/50 hover:bg-black/70 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
            >
              ← Back Directory
            </button>
          ) : <span></span>}

          {isMe && (
            <div className="flex items-center gap-2">
              <button 
                onClick={openSettingsTab}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
                title="Account Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main profile stats block layout details */}
      <div className="max-w-xl md:max-w-2xl mx-auto px-4 relative -mt-16 mb-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100/60">
          <div className="flex justify-between items-end mb-4">
            {/* Circular picture layout details */}
            <div className="relative">
              <img 
                src={profileUser.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} 
                alt={profileUser.fullName} 
                className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md"
                referrerPolicy="no-referrer"
              />
              {profileUser.verified && (
                <div className="absolute bottom-0.5 right-0.5 w-6 h-6 bg-cyan-500 text-white border-2 border-white rounded-full flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
              )}
            </div>

            {/* Editing / follow interactions buttons */}
            <div className="flex gap-2">
              {isMe ? (
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="py-2.5 px-4 rounded-xl bg-slate-50 border border-slate-150 hover:bg-slate-100/70 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4 text-cyan-500" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button 
                  onClick={toggleFollow}
                  className={`py-2.5 px-6 rounded-xl text-xs font-extrabold transition-all ${
                    isFollowing 
                      ? 'bg-slate-100 text-slate-700 border' 
                      : 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow shadow-cyan-300/35'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-800 leading-none flex items-center gap-1.5">
              <span>{profileUser.fullName}</span>
              <span className="text-[10px] bg-cyan-100 text-cyan-600 font-black px-2 py-0.5 rounded-full uppercase scale-90">
                {profileUser.userType}
              </span>
            </h3>
            <span className="text-sm text-slate-400 font-semibold">@{profileUser.username}</span>

            {/* Academic badge identifier list content */}
            {profileUser.instituteName && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 font-bold bg-cyan-50/40 p-2 rounded-xl">
                <Award className="w-4 h-4 text-cyan-500 stroke-[2.5]" />
                <span className="truncate">{profileUser.instituteName} • {profileUser.degreeOrSubject || "Faculty member"}</span>
              </div>
            )}

            <p className="text-sm text-slate-600 mt-3 leading-relaxed font-semibold">
              {profileUser.bio || "No university memoirs drafted yet. High performing campus portfolio!"}
            </p>

            {/* Location & website inline details layout */}
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-400 font-bold border-t pt-4">
              {profileUser.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-cyan-500" />
                  {profileUser.location}
                </span>
              )}
              {profileUser.website && (
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-cyan-500" />
                  <a href={profileUser.website} target="_blank" rel="noreferrer" className="text-cyan-500 hover:underline">{profileUser.website.replace(/(^\w+:|^)\/\//, '')}</a>
                </span>
              )}
            </div>
          </div>

          {/* Followers / Following Counters layout block details */}
          <div className="grid grid-cols-3 gap-2 mt-4 text-center border-t border-slate-50 pt-4">
            <div>
              <span className="text-lg font-black text-slate-800 font-sans block leading-none">{profileUser.postsCount || userPosts.length}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Posts</span>
            </div>
            <div>
              <span className="text-lg font-black text-slate-800 font-sans block leading-none">{profileUser.followersCount || 0}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Followers</span>
            </div>
            <div>
              <span className="text-lg font-black text-slate-800 font-sans block leading-none">{profileUser.followingCount || 0}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation list panel details */}
      <div className="max-w-xl md:max-w-2xl mx-auto px-2">
        <div className="flex border-b border-slate-200 mb-4 bg-white rounded-2xl p-1 shadow-sm gap-1">
          <button 
            onClick={() => setActiveTab('memories')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'memories' ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Grid className="w-4.5 h-4.5" />
            <span>Memories</span>
          </button>

          <button 
            onClick={() => setActiveTab('stories')}
            className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'stories' ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-4.5 h-4.5" />
            <span>Stories & Video Records ({userStories.length})</span>
          </button>

          {isMe && (
            <button 
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'saved' ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-4.5 h-4.5" />
              <span>Bookmarks</span>
            </button>
          )}

          {isMe && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'admin' ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <ShieldAlert className="w-4.5 h-4.5 text-rose-300" />
              <span>Admin</span>
            </button>
          )}
        </div>

        {/* Tab 1: Memories (User's posts grid) */}
        {activeTab === 'memories' && (
          <div className="grid grid-cols-2 gap-3">
            {userPosts.map(post => (
              <motion.div 
                key={post.id} 
                className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col gap-2 relative group overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {post.mediaType === 'image' && post.mediaUrls && post.mediaUrls.length > 0 ? (
                  <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-50 border">
                    <img src={post.mediaUrls[0]} alt="memory" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ) : (
                  <div className="w-full h-32 rounded-xl bg-gradient-to-br from-cyan-50 to-sky-100 p-3 text-xs font-semibold text-cyan-705 leading-relaxed overflow-hidden">
                    {post.text}
                  </div>
                )}
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold px-1 mt-1">
                  <span>👍 {post.likesCount}</span>
                  <span>recent</span>
                </div>
              </motion.div>
            ))}

            {userPosts.length === 0 && (
              <div className="col-span-2 text-center py-12 text-slate-400 bg-white rounded-2xl border p-6">
                <Grid className="w-10 h-10 stroke-1 mx-auto mb-2" />
                <p className="text-sm font-semibold">No campus posts added.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Stories list */}
        {activeTab === 'stories' && (
          <div className="grid grid-cols-2 gap-3">
            {userStories.map(story => (
              <div key={story.id} className="relative rounded-2xl overflow-hidden shadow-sm bg-slate-100 border border-slate-150 h-56 flex flex-col group">
                <div className="relative flex-1 overflow-hidden">
                  {story.mediaType === 'video' ? (
                    <div className="w-full h-full relative bg-black">
                      <video 
                        src={story.mediaUrl} 
                        className="w-full h-full object-cover" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        onError={(e) => {
                          console.warn("Story video failed to load, falling back to stable campus loop:", story.mediaUrl);
                          const fallbacks = [
                            'https://assets.mixkit.co/videos/preview/mixkit-undergrad-students-walking-on-school-campus-41618-large.mp4',
                            'https://assets.mixkit.co/videos/preview/mixkit-web-designer-working-on-his-laptop-at-home-vertical-40292-large.mp4',
                            'https://assets.mixkit.co/videos/preview/mixkit-group-of-friends-having-fun-at-a-music-festival-vertical-39745-large.mp4'
                          ];
                          const fallbackUrl = fallbacks[Math.floor(Math.random() * fallbacks.length)];
                          if (e.currentTarget.src !== fallbackUrl) {
                            e.currentTarget.src = fallbackUrl;
                          }
                        }}
                      />
                      <div className="absolute top-2 left-2 z-10">
                        <span className="text-[8px] font-black uppercase tracking-wider bg-pink-500 text-white px-2 py-0.5 rounded-full border border-pink-400/30">
                          🎥 Video Record
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full relative">
                      <img 
                        src={story.mediaUrl} 
                        alt="Story content" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                      <div className="absolute top-2 left-2 z-10">
                        <span className="text-[8px] font-black uppercase tracking-wider bg-cyan-500 text-white px-2 py-0.5 rounded-full border border-cyan-400/30">
                          Story
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-2.5 bg-white border-t flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                    Campus Archive Record
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold">
                    Posted: {new Date(story.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}

            {userStories.length === 0 && (
              <div className="col-span-2 text-center py-12 text-slate-400 bg-white rounded-2xl border p-6">
                <EyeOff className="w-10 h-10 stroke-1 mx-auto mb-2" />
                <p className="text-sm font-semibold">No active stories or video records shared.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Saved Bookmarked Posts */}
        {activeTab === 'saved' && (
          <div className="flex flex-col gap-3">
            {bookmarkPosts.map(post => (
              <div key={post.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <img src={post.profilePhoto} alt={post.username} className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-805">{post.fullName}</h5>
                    <span className="text-[10px] text-slate-400">@{post.username}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 text-shadow-sm leading-relaxed">{post.text}</p>
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className="w-full max-h-48 rounded-xl overflow-hidden border">
                    <img src={post.mediaUrls[0]} alt="saved graphic" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            ))}

            {bookmarkPosts.length === 0 && (
              <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border p-6">
                <Bookmark className="w-10 h-10 stroke-1 mx-auto mb-2" />
                <p className="text-sm font-semibold">No saved memory bookmarks.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Admin Moderation Desk panel details */}
        {activeTab === 'admin' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow flex flex-col gap-4">
            <div>
              <h4 className="text-base font-black text-slate-800">Admin Moderation Workbench</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Reported Abuse & Content Audit ({reports.length})</p>
            </div>

            <div className="flex flex-col gap-3">
              {reports.map((rep) => {
                const targetPost = posts.find(p => p.id === rep.targetId);

                return (
                  <div key={rep.id} className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-rose-700">
                      <span className="uppercase">Target: {rep.targetType}</span>
                      <span>Reason: {rep.reason}</span>
                    </div>

                    {targetPost ? (
                      <div className="bg-white p-2.5 rounded-lg border text-xs text-slate-600 italic">
                        "{targetPost.text.substring(0, 80)}..."
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Content already deleted by user or admin.</p>
                    )}

                    <div className="flex justify-end gap-2.5 mt-1.5">
                      <button
                        onClick={() => {
                          if (targetPost) {
                            deletePost(targetPost.id);
                            alert("Post deleted and removed for violation of safety policies.");
                          }
                        }}
                        className="p-1 px-3 bg-rose-600 text-white rounded text-[10px] font-extrabold shadow hover:bg-rose-700"
                      >
                        Enforce Removals
                      </button>
                    </div>
                  </div>
                );
              })}

              {reports.length === 0 && (
                <div className="text-center py-6 text-slate-400">
                  <p className="text-xs font-semibold">Prisitine state. No active safety violations flagged!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4">
            <motion.div 
              className="bg-white rounded-[32px] w-full max-w-md p-6 max-h-[90vh] overflow-y-auto flex flex-col gap-4 shadow-2xl relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="text-lg font-black">Edit Campus Portfolio</h3>
                <button onClick={() => setShowEditModal(false)} className="p-1 rounded-full hover:bg-slate-100">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditSave} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Biography</label>
                  <textarea 
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Personal Website Link</label>
                  <input 
                    type="url" 
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Location Coordinates</label>
                  <input 
                    type="text" 
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Avatar Profile Photo</label>
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {editProfilePhoto && (
                      <img src={editProfilePhoto} alt="Avatar Preview" className="w-10 h-10 rounded-full object-cover border border-cyan-100" referrerPolicy="no-referrer" />
                    )}
                    <input 
                      type="file" 
                      ref={avatarInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAvatarUploading(true);
                           try {
                             const url = await uploadMediaFile(e.target.files[0], 'avatars');
                             setEditProfilePhoto(url);
                           } catch (err) {
                             console.error(err);
                             alert("Failed to upload avatar.");
                           } finally {
                             setAvatarUploading(false);
                           }
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={avatarUploading}
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-cyan-400 hover:text-cyan-600 text-slate-600 text-[10px] font-black rounded-lg uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      {avatarUploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                    <input 
                      type="url" 
                      placeholder="Or paste profile photo URL"
                      value={editProfilePhoto}
                      onChange={(e) => setEditProfilePhoto(e.target.value)}
                      className="flex-1 p-2 border border-slate-200 rounded-lg text-[10px] font-semibold bg-white outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Portfolio Cover Banner</label>
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {editCoverPhoto && (
                      <img src={editCoverPhoto} alt="Cover Preview" className="w-14 h-8 rounded-lg object-cover border border-cyan-100" referrerPolicy="no-referrer" />
                    )}
                    <input 
                      type="file" 
                      ref={coverInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          setCoverUploading(true);
                           try {
                             const url = await uploadMediaFile(e.target.files[0], 'covers');
                             setEditCoverPhoto(url);
                           } catch (err) {
                             console.error(err);
                             alert("Failed to upload cover banner.");
                           } finally {
                             setCoverUploading(false);
                           }
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={coverUploading}
                      onClick={() => coverInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-cyan-400 hover:text-cyan-600 text-slate-600 text-[10px] font-black rounded-lg uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      {coverUploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                    <input 
                      type="url" 
                      placeholder="Or paste cover URL"
                      value={editCoverPhoto}
                      onChange={(e) => setEditCoverPhoto(e.target.value)}
                      className="flex-1 p-2 border border-slate-200 rounded-lg text-[10px] font-semibold bg-white outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-600 text-white font-extrabold shadow shadow-cyan-300/40"
                >
                  Save Portfolio Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
