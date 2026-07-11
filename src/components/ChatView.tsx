/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSocial } from '../context/SocialContext';
import { Conversation, Message, UserProfile } from '../types';
import { Send, Smile, Plus, Camera, Image, ArrowLeft, Search, MessageSquareCode, CircleAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const EMOJIS = ['😊', '😂', '🔥', '🎓', '📚', '🚀', '💖', '👍', '👏', '👀', '✨', '🎉'];

export default function ChatView() {
  const {
    currentUser,
    users,
    conversations,
    messages,
    sendMessage,
    startConversation,
    isFollowingUser
  } = useSocial();

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [showEmojiBox, setShowEmojiBox] = useState(false);
  const [showQuickMediaBox, setShowQuickMediaBox] = useState(false);
  const [attachedMediaUrl, setAttachedMediaUrl] = useState('');

  // Typing simulator state
  const [isOpponentTyping, setIsOpponentTyping] = useState(false);
  
  // New match/conversation helper target
  const [searchContactQuery, setSearchContactQuery] = useState('');
  const [showNewChatCreator, setShowNewChatCreator] = useState(false);

  const listEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chats
  useEffect(() => {
    if (listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeConvId, isOpponentTyping]);

  // Simulate typing indicator responses when messages are sent! 😊
  const triggerSimulatedRespondent = (convId: string) => {
    setIsOpponentTyping(true);
    setTimeout(() => {
      setIsOpponentTyping(false);
      // We automatically append a friendly, contextual response from the simulated peer
      sendMessage(
        convId, 
        "That's exceptionally impressive! Let's schedule a study session in Brooklyn College Library on Friday to compile these project memories together! 📚🎓"
      );
    }, 2800);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConvId) return;
    if (!inputText.trim() && !attachedMediaUrl) return;

    sendMessage(activeConvId, inputText, attachedMediaUrl);
    
    const targetConv = activeConvId;
    setInputText('');
    setAttachedMediaUrl('');
    setShowEmojiBox(false);
    setShowQuickMediaBox(false);

    // Trigger typing response simulation
    triggerSimulatedRespondent(targetConv);
  };

  const appendEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const activeConv = conversations.find(c => c.id === activeConvId);

  // Get other user's profile details
  const getOpponentUser = (conv: Conversation): UserProfile => {
    const oppId = conv.participantIds.find(id => id !== currentUser?.uid) || '';
    const found = users.find(u => u.uid === oppId);
    return found || {
      uid: oppId,
      fullName: 'Academic Peer',
      username: 'academic_peer',
      email: '',
      bio: '',
      userType: 'student',
      profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
      coverPhoto: '',
      website: '',
      location: 'University Campus',
      followersCount: 120,
      followingCount: 154,
      postsCount: 15,
      verified: true,
      createdAt: ''
    };
  };

  // Contacts search for starting a conversation
  const contactQueryResults = users.filter(user => {
    if (currentUser && user.uid === currentUser.uid) return false;
    return user.fullName.toLowerCase().includes(searchContactQuery.toLowerCase()) ||
           user.username.toLowerCase().includes(searchContactQuery.toLowerCase());
  });

  const handleStartChatWithContact = async (uid: string) => {
    const convId = await startConversation(uid);
    if (convId) {
      setActiveConvId(convId);
      setShowNewChatCreator(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-24 text-slate-800 flex flex-col">
      <AnimatePresence mode="wait">
        {!activeConvId ? (
          /* CONVERSATIONS LIST SCREEN */
          <motion.div 
            className="flex-1 flex flex-col h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header bar */}
            <header className="sticky top-0 bg-white border-b border-slate-100 z-10 px-4 py-4 flex items-center justify-between shadow-sm">
              <div>
                <h2 className="text-xl font-black">Messages</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Campus Chats ({conversations.length})</p>
              </div>

              {/* Start new Chat button */}
              <button 
                onClick={() => setShowNewChatCreator(true)}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-bold text-xs flex items-center gap-1.5 shadow shadow-cyan-300/30"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>New Chat</span>
              </button>
            </header>

            {/* Conversation list */}
            <div className="flex-1 p-3 overflow-y-auto w-full max-w-xl md:max-w-2xl mx-auto flex flex-col gap-2">
              {conversations.map(conv => {
                const opponent = getOpponentUser(conv);
                const convMsgs = messages[conv.id] || [];
                const lastMsg = convMsgs[convMsgs.length - 1] || { text: conv.lastMessageText || 'No messages.', createdAt: conv.lastMessageTime };

                return (
                  <div 
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className="p-4 rounded-2xl bg-white border border-slate-100/80 hover:border-cyan-200 cursor-pointer shadow-sm flex justify-between items-center transition-all duration-200"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img 
                          src={opponent.profilePhoto} 
                          alt={opponent.fullName} 
                          className="w-12 h-12 rounded-full object-cover border border-slate-50"
                          referrerPolicy="no-referrer"
                        />
                        {/* Simulated green active/online dot */}
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                      </div>

                      <div className="max-w-[200px]">
                        <h4 className="text-sm font-black text-slate-800 leading-none mb-1 flex items-center gap-1">
                          <span>{opponent.fullName}</span>
                          {opponent.verified && (
                            <div className="w-3.5 h-3.5 rounded-full bg-cyan-500 text-white flex items-center justify-center text-[7px] font-bold">✓</div>
                          )}
                        </h4>
                        <p className="text-xs text-slate-450 truncate font-semibold">
                          {lastMsg.text}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end justify-between">
                      <span className="text-[9px] text-slate-400 font-bold font-sans">Recent</span>
                      {conv.unreadCount && currentUser && conv.unreadCount[currentUser.uid] > 0 && (
                        <span className="w-5 h-5 bg-gradient-to-r from-cyan-400 to-sky-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center mt-2.5">
                          {conv.unreadCount[currentUser.uid]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {conversations.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <MessageSquareCode className="w-16 h-16 stroke-1 mx-auto mb-3 text-slate-300" />
                  <p className="font-semibold text-sm">No campus chats initialized yet.</p>
                  <p className="text-xs">Tap New Chat above to message high-profile university students.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* SINGLE ROOM CHAT VIEW */
          <motion.div 
            className="flex-1 flex flex-col h-screen"
            initial={{ x: 150, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -150, opacity: 0 }}
          >
            {/* Room header custom info bar */}
            <header className="bg-white border-b border-slate-100 z-10 px-4 py-3 flex items-center gap-3.5 shadow-sm">
              <button 
                onClick={() => { setActiveConvId(null); setIsOpponentTyping(false); }}
                className="p-1 px-1.5 rounded-full text-slate-400 hover:text-cyan-500"
              >
                <ArrowLeft className="w-6 h-6 stroke-[3.5]" />
              </button>

              {activeConv && (
                <>
                  <div className="relative">
                    <img 
                      src={getOpponentUser(activeConv).profilePhoto} 
                      alt={getOpponentUser(activeConv).fullName} 
                      className="w-10.5 h-10.5 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 leading-none mb-0.5">
                      {getOpponentUser(activeConv).fullName}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                      {isOpponentTyping ? "Typing..." : "Online"}
                    </span>
                  </div>
                </>
              )}
            </header>

            {/* Message room flow list */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
              {activeConvId && (messages[activeConvId] || []).map((msg, index) => {
                const isMine = currentUser && msg.senderId === currentUser.uid;

                return (
                  <div 
                    key={index}
                    className={`flex items-end gap-2 max-w-[80%] ${isMine ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {!isMine && activeConv && (
                      <img 
                        src={getOpponentUser(activeConv).profilePhoto} 
                        alt="peer" 
                        className="w-7 h-7 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="flex flex-col">
                      <div className={`p-3.5 px-4.5 rounded-3xl text-sm leading-relaxed ${
                        isMine 
                          ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white rounded-br-none shadow shadow-cyan-300/20' 
                          : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm'
                      }`}>
                        {msg.text}
                        
                        {/* Media rendering optionally if attached */}
                        {msg.mediaUrl && (
                          <div className="rounded-xl overflow-hidden mt-2 border max-h-[160px]">
                            <img src={msg.mediaUrl} alt="Attached message file" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                      <span className="text-[8px] text-slate-400 font-semibold font-sans mt-1 ml-1 scale-90 block">
                        Recent
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* OPponent simulator typing ball */}
              {isOpponentTyping && (
                <div className="flex items-center gap-2 mr-auto">
                  {activeConv && <img src={getOpponentUser(activeConv).profilePhoto} className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />}
                  <div className="bg-white p-3 px-4.5 rounded-3xl rounded-bl-none border border-slate-100 shadow-sm flex items-center justify-center gap-1">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-cyan-550 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}

              <div ref={listEndRef} />
            </div>

            {/* Messaging bottom action bar panel controls */}
            <div className="p-4 bg-white border-t border-slate-100 relative">
              
              {/* Media URL optional drawer slider */}
              {showQuickMediaBox && (
                <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl mb-3 flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attachment Asset URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="url"
                      placeholder="Paste image/file URL..."
                      value={attachedMediaUrl}
                      onChange={(e) => setAttachedMediaUrl(e.target.value)}
                      className="flex-1 p-2 bg-white text-xs border border-slate-250 rounded-lg outline-none"
                    />
                    <button 
                      onClick={() => setAttachedMediaUrl('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80')}
                      className="px-2 bg-cyan-50 text-cyan-600 text-[10px] font-extrabold rounded"
                    >
                      Use Demo
                    </button>
                  </div>
                </div>
              )}

              {/* Emoji box slide deck */}
              {showEmojiBox && (
                <div className="flex items-center gap-2.5 pb-3 border-b mb-3 overflow-x-auto scrollbar-none">
                  {EMOJIS.map(emoji => (
                    <button 
                      key={emoji} 
                      onClick={() => appendEmoji(emoji)}
                      className="text-xl p-1.5 hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Main keyboard input layout */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2.5">
                <button 
                  type="button"
                  onClick={() => setShowEmojiBox(!showEmojiBox)}
                  className="p-1.5 text-slate-400 hover:text-cyan-500 transition-colors"
                >
                  <Smile className="w-6 h-6" />
                </button>

                <button 
                  type="button"
                  onClick={() => setShowQuickMediaBox(!showQuickMediaBox)}
                  className="p-1.5 text-slate-400 hover:text-cyan-500 transition-colors"
                >
                  <Camera className="w-6 h-6" />
                </button>

                <input 
                  type="text"
                  placeholder="Say something nice..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 p-3 px-4 rounded-full border border-slate-200/80 outline-none text-sm focus:border-cyan-500 bg-slate-50 focus:bg-white transition-all font-medium"
                />

                <button 
                  type="submit"
                  className="h-11 w-11 rounded-full bg-gradient-to-r from-cyan-400 to-sky-600 text-white flex items-center justify-center shadow shadow-cyan-300/30"
                >
                  <Send className="w-5 h-5 line-height" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW CHAT ROOM INITIATOR SHEET */}
      <AnimatePresence>
        {showNewChatCreator && (
          <div className="fixed inset-0 bg-black/60 z-30 flex items-end justify-center p-4">
            {/* Background click closer */}
            <div className="absolute inset-0" onClick={() => setShowNewChatCreator(false)}></div>
            
            <motion.div 
              className="relative bg-white rounded-t-[40px] rounded-b-3xl w-full max-w-md h-[70vh] p-6 flex flex-col shadow-2xl z-40"
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
            >
              <div className="flex justify-between items-center pb-3 border-b">
                <div>
                  <h3 className="text-lg font-black">Interactive Directory</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Start conversation thread</p>
                </div>
                <button onClick={() => setShowNewChatCreator(false)} className="p-1 rounded-full hover:bg-slate-100">
                  <ArrowLeft className="w-6 h-6 rotate-90" />
                </button>
              </div>

              {/* Simple directory search */}
              <div className="relative my-4">
                <input 
                  type="text" 
                  placeholder="Type name, username or email..."
                  value={searchContactQuery}
                  onChange={(e) => setSearchContactQuery(e.target.value)}
                  className="w-full text-xs p-3.5 pl-10 border border-slate-250 rounded-xl outline-none"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>

              {/* Directory dynamic matches list */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-2">
                {contactQueryResults.map(user => (
                  <div 
                    key={user.uid}
                    onClick={() => handleStartChatWithContact(user.uid)}
                    className="p-3 bg-slate-50 border border-slate-100/50 hover:border-cyan-300 rounded-xl cursor-pointer flex items-center gap-3 transition-colors"
                  >
                    <img src={user.profilePhoto} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{user.fullName}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold truncate">@{user.username} • {user.instituteName || "University Student"}</p>
                    </div>
                  </div>
                ))}

                {contactQueryResults.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-xs">No active university students match your query.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
