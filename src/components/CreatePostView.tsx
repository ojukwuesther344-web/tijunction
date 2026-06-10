/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSocial } from '../context/SocialContext';
import { Camera, MapPin, Hash, Plus, X, Image as ImageIcon, Check } from 'lucide-react';
import { motion } from 'motion/react';

// Stock design images for selective posting shortcuts
const CAMPUS_TEMPLATES = [
  { name: "Saturdays Study", url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=400&q=80" },
  { name: "Coffee Workspace", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80" },
  { name: "Graduation memories", url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80" },
  { name: "Healthy soup bowl", url: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=400&q=80" }
];

export default function CreatePostView({ onComplete }: { onComplete: () => void }) {
  const { createPost, currentUser } = useSocial();
  const [postText, setPostText] = useState('');
  const [locationValue, setLocationValue] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePostPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() && !imageUrl) {
      alert("Please add text context or an image to register the campus memory.");
      return;
    }
    setLoading(true);
    try {
      // Split hashtags safely
      const hashtags = hashtagInput
        ? hashtagInput.split(/[\s,#]+/).filter(tag => tag.trim() !== '')
        : [];
      
      const mediaUrls = imageUrl ? [imageUrl] : [];
      const mediaType = imageUrl ? 'image' : 'none';

      await createPost(postText, mediaUrls, mediaType, locationValue, hashtags);
      
      // reset states
      setPostText('');
      setLocationValue('');
      setHashtagInput('');
      setImageUrl('');
      
      alert("Congratulations! Memory thread successfully compiled and broadcasted.");
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-24 text-slate-800">
      <header className="sticky top-0 bg-white border-b border-slate-100 z-10 px-4 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-xl font-black">Publish Memory</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Add a campus thread</p>
        </div>
        <button 
          onClick={onComplete}
          className="text-xs font-bold text-slate-400 hover:text-cyan-500 transition-colors"
        >
          Cancel
        </button>
      </header>

      {/* Form Content */}
      <main className="max-w-md mx-auto w-full p-4">
        <form onSubmit={handlePostPublish} className="flex flex-col gap-4">
          
          {/* User profile identifier */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <img 
              src={currentUser?.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} 
              alt={currentUser?.fullName} 
              className="w-11 h-11 rounded-full object-cover border border-slate-50"
              referrerPolicy="no-referrer"
            />
            <div>
              <h4 className="text-sm font-black text-slate-850">{currentUser?.fullName}</h4>
              <span className="text-xs font-semibold text-slate-400">Posting publicly on campus feed</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
            {/* Input box */}
            <textarea
              rows={4}
              placeholder="What's on your mind? Share some academic reflections or memories..."
              required
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              className="w-full text-sm leading-relaxed border-0 outline-none resize-none font-medium text-slate-705 placeholder-slate-400"
            />

            {/* Custom URL Input for attachment image optional */}
            <div className="border-t border-slate-50 pt-3">
              <label className="text-xs font-bold text-slate-400 block mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-4.5 h-4.5 text-cyan-500" />
                <span>Memory Attachment Image URL</span>
              </label>
              <input 
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-3 border border-slate-100 bg-slate-50 rounded-xl text-xs outline-none focus:border-cyan-400 focus:bg-white"
              />
            </div>

            {/* Attachment preview if set */}
            {imageUrl && (
              <div className="relative rounded-2xl overflow-hidden mt-2 bg-slate-100 border max-h-[220px]">
                <img src={imageUrl} alt="Memory Visualizer Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <button 
                  type="button" 
                  onClick={() => setImageUrl('')}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 text-white hover:text-cyan-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Campus preset shortcuts */}
            <div className="mt-2 text-slate-400">
              <span className="text-[10px] font-bold block mb-2 uppercase tracking-tight">Need media? Tap a campus preset placeholder:</span>
              <div className="flex flex-wrap gap-2">
                {CAMPUS_TEMPLATES.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setImageUrl(item.url)}
                    className="p-2 bg-slate-50 border border-slate-100 text-[10px] font-bold rounded-xl text-slate-655 hover:border-cyan-400 hover:text-cyan-500 transition-all flex items-center gap-1"
                  >
                    <span>📷 {item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col gap-4">
            {/* Location Input box */}
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4.5 h-4.5 text-cyan-500" />
                <span>Location Pin (Optional)</span>
              </label>
              <input 
                type="text"
                placeholder="e.g. Brooklyn College Library, Boston MA"
                value={locationValue}
                onChange={(e) => setLocationValue(e.target.value)}
                className="w-full p-3.5 border border-slate-100 bg-slate-50 text-xs rounded-xl outline-none focus:border-cyan-400 focus:bg-white"
              />
            </div>

            {/* Hashtag input */}
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 flex items-center gap-1.5">
                <Hash className="w-4.5 h-4.5 text-cyan-500" />
                <span>Campus Tags (comma-separated, optional)</span>
              </label>
              <input 
                type="text"
                placeholder="e.g. graduation, studybuddy, code"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                className="w-full p-3.5 border border-slate-100 bg-slate-50 text-xs rounded-xl outline-none focus:border-cyan-400 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-extrabold shadow-md shadow-cyan-300/45 hover:opacity-95 transition-all text-center"
          >
            {loading ? 'Publishing memory thread...' : 'Publish Post'}
          </button>
        </form>
      </main>
    </div>
  );
}
