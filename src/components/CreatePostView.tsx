/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSocial } from '../context/SocialContext';
import { Camera, MapPin, Hash, Plus, X, Image as ImageIcon, Check } from 'lucide-react';
import { motion } from 'motion/react';

// Stock design images for selective posting shortcuts
const STOCK_TEMPLATES = [
  { name: "Saturdays Study", url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=400&q=80" },
  { name: "Coffee Workspace", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80" },
  { name: "Adventure Traveler", url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80" },
  { name: "Healthy soup bowl", url: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=400&q=80" }
];

export default function CreatePostView({ onComplete }: { onComplete: () => void }) {
  const { createPost, currentUser, uploadMediaFile } = useSocial();
  const [postText, setPostText] = useState('');
  const [locationValue, setLocationValue] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | 'none'>('none');
  const [loading, setLoading] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Highly compatible file formats: Please select or drag an image/video file.');
      return;
    }
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setFileType(type);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePostPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() && !imageUrl) {
      alert("Please add text context or an image/video to register your post.");
      return;
    }
    setLoading(true);
    try {
      // Split hashtags safely
      const hashtags = hashtagInput
        ? hashtagInput.split(/[\s,#]+/).filter(tag => tag.trim() !== '')
        : [];
      
      let finalMediaUrl = imageUrl;
      if (selectedFile) {
        finalMediaUrl = await uploadMediaFile(selectedFile, 'posts');
      }

      const mediaUrls = finalMediaUrl ? [finalMediaUrl] : [];
      const mediaType = fileType !== 'none' ? fileType : (finalMediaUrl ? 'image' : 'none');

      await createPost(postText, mediaUrls, mediaType, locationValue, hashtags);
      
      // reset states
      setPostText('');
      setLocationValue('');
      setHashtagInput('');
      setImageUrl('');
      setSelectedFile(null);
      setFileType('none');
      
      alert("Congratulations! Post successfully compiled and broadcasted.");
      onComplete();
    } catch (err) {
      console.error(err);
      alert("Failed to publish post: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-24 text-slate-800">
      <header className="sticky top-0 bg-white border-b border-slate-100 z-10 px-4 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-xl font-black">Publish Update</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Add a global thread</p>
        </div>
        <button 
          onClick={onComplete}
          className="text-xs font-bold text-slate-400 hover:text-cyan-500 transition-colors"
        >
          Cancel
        </button>
      </header>

      {/* Form Content */}
      <main className="max-w-xl md:max-w-2xl mx-auto w-full p-4">
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
              <span className="text-xs font-semibold text-slate-400">Posting publicly on global feed</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
            {/* Input box */}
            <textarea
              rows={4}
              placeholder="What's on your mind? Share some reflections, news, or updates with the world..."
              required
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              className="w-full text-sm leading-relaxed border-0 outline-none resize-none font-medium text-slate-705 placeholder-slate-400"
            />

            {/* Real File Upload & Custom URL Section */}
            <div className="border-t border-slate-50 pt-3">
              <label className="text-xs font-bold text-slate-450 block mb-2 flex items-center gap-1.5 align-middle">
                <ImageIcon className="w-4 h-4 text-cyan-500" />
                <span>Upload Media from Gallery or File Storage</span>
              </label>
              
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 select-none ${
                  isDragging 
                    ? 'border-cyan-500 bg-cyan-100/30' 
                    : 'border-slate-200 bg-slate-50/60 hover:border-cyan-400 hover:bg-slate-50'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*,video/*" 
                  className="hidden" 
                />
                
                <div className="p-3 bg-white rounded-full shadow-sm border border-slate-100">
                  <Camera className="w-5 h-5 text-cyan-500 animate-pulse" />
                </div>
                
                <div>
                  <p className="text-xs font-black text-slate-700">Drag & drop your files here or <span className="text-cyan-600 underline">Browse</span></p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Supports JPEG, PNG, WEBP and Videos</p>
                </div>
              </div>
            </div>

            {/* Attachment preview if set */}
            {imageUrl && (
              <div className="relative rounded-2xl overflow-hidden mt-2 bg-slate-100 border max-h-[220px] flex items-center justify-center">
                {fileType === 'video' ? (
                  <video src={imageUrl} controls className="w-full max-h-[220px] object-cover" />
                ) : (
                  <img src={imageUrl} alt="Memory Visualizer Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                )}
                <button 
                  type="button" 
                  onClick={() => {
                    setImageUrl('');
                    setFileType('none');
                    setSelectedFile(null);
                  }}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 text-white hover:text-cyan-400 transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Stock preset shortcuts */}
            <div className="mt-2 text-slate-400">
              <span className="text-[10px] font-bold block mb-2 uppercase tracking-tight">Need media? Tap a visual preset placeholder:</span>
              <div className="flex flex-wrap gap-2">
                {STOCK_TEMPLATES.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      setImageUrl(item.url);
                      setFileType('image');
                      setSelectedFile(null);
                    }}
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
                placeholder="e.g. New York, Paris, Tokyo"
                value={locationValue}
                onChange={(e) => setLocationValue(e.target.value)}
                className="w-full p-3.5 border border-slate-100 bg-slate-50 text-xs rounded-xl outline-none focus:border-cyan-400 focus:bg-white"
              />
            </div>

            {/* Hashtag input */}
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 flex items-center gap-1.5">
                <Hash className="w-4.5 h-4.5 text-cyan-500" />
                <span>Post Tags (comma-separated, optional)</span>
              </label>
              <input 
                type="text"
                placeholder="e.g. news, life, tech, blogger"
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
