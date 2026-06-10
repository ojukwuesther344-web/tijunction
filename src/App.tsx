/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { SocialProvider, useSocial } from './context/SocialContext';
import SplashView from './components/SplashView';
import SlidesView from './components/SlidesView';
import WelcomeView from './components/WelcomeView';
import AuthScreens from './components/AuthScreens';
import HomeFeedView from './components/HomeFeedView';
import SearchView from './components/SearchView';
import CreatePostView from './components/CreatePostView';
import ChatView from './components/ChatView';
import AlertsView from './components/AlertsView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import ShortsView from './components/ShortsView';

import { 
  Home, Search, PlusCircle, Bell, User, MessageCircle, Settings, Menu, Video, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function SocialAppContent() {
  const { 
    currentUser, 
    onboardingStep, 
    setOnboardingStep, 
    notifications, 
    conversations,
    users,
    activeTab,
    setActiveTab
  } = useSocial();

  // Let other pages request target user profile viewing
  const [targetProfileUid, setTargetProfileUid] = useState<string | null>(null);

  // Scroll state to auto hide/show bottom navigation bar
  const [showToolbar, setShowToolbar] = useState(true);
  const lastScrollTopRef = useRef<number>(0);
  const scrollTimeoutRef = useRef<any>(null);

  // Consolidated scroll logic: hide on active scroll, show once paused/stopped
  const handleScrollUpdate = (scrollTop: number) => {
    // Avoid double-firing/jitters when scrollTop hasn't actually shifted
    if (scrollTop === lastScrollTopRef.current) return;

    // Immediately hide the toolbar on any scrolling motion (up or down)
    setShowToolbar(false);

    // Reset stillness timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // After 220ms of stillness (scrolling paused/stopped), pop the toolbar right back in
    scrollTimeoutRef.current = setTimeout(() => {
      setShowToolbar(true);
    }, 220);

    lastScrollTopRef.current = scrollTop;
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    handleScrollUpdate(e.currentTarget.scrollTop);
  };

  // Listens to global window scroll event as well
  useEffect(() => {
    const handleWindowScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || window.pageYOffset;
      handleScrollUpdate(scrollTop);
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Reset toolbar show state when switching tab and clean up timers
  useEffect(() => {
    setShowToolbar(true);
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [activeTab]);

  // Calculate badges
  const unreadAlertsCount = notifications.filter(n => !n.read).length;
  const unreadMessagesCount = 1; // simulation mockup unread count to feel alive

  const handleCreatePostComplete = () => {
    setActiveTab('home');
  };

  const openSettingsFromProfile = () => {
    setActiveTab('settings');
  };

  const handleProfileLookup = (uid: string) => {
    setTargetProfileUid(uid);
    setActiveTab('profile');
  };

  // STEP BY STEP RENDERING SECTIONS
  if (onboardingStep === 'splash') {
    return <SplashView onComplete={() => setOnboardingStep('slides')} />;
  }

  if (onboardingStep === 'slides') {
    return <SlidesView onComplete={() => setOnboardingStep('welcome')} />;
  }

  if (onboardingStep === 'welcome') {
    return <WelcomeView />;
  }

  if (onboardingStep !== 'app') {
    return <AuthScreens />;
  }

  // RENDER PRIMARY MOBILE FRAME APP INTERFACE
  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center font-sans select-none antialiased md:py-6 md:px-4">
      {/* Simulation phone chassis bezel frame */}
      <div className="w-full max-w-md bg-white min-h-screen md:min-h-[850px] shadow-2xl relative md:rounded-[48px] overflow-hidden border-8 border-slate-950 flex flex-col">
        
        {/* Dynamic Notch / Ear Speaker mockup for mobile simulation */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 h-6 w-36 bg-black rounded-b-2xl z-50"></div>

        {/* Content area based on tab */}
        <div 
          className={`flex-1 ${activeTab === 'shorts' ? 'overflow-hidden pt-0 pb-0' : 'overflow-y-auto mt-[120px] md:mt-[144px] pb-[80px]'}`} 
          onScroll={handleScroll}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <HomeFeedView />
              </motion.div>
            )}

            {activeTab === 'search' && (
              <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SearchView />
              </motion.div>
            )}

            {activeTab === 'create' && (
              <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CreatePostView onComplete={handleCreatePostComplete} />
              </motion.div>
            )}

            {activeTab === 'shorts' && (
              <motion.div 
                key="shorts" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black z-45 flex flex-col"
              >
                <ShortsView />
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ChatView />
              </motion.div>
            )}

            {activeTab === 'alerts' && (
              <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AlertsView />
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProfileView 
                  altTargetUid={targetProfileUid} 
                  onClearTarget={() => setTargetProfileUid(null)} 
                  openSettingsTab={openSettingsFromProfile}
                />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SettingsView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Hotkeys target shortcut list (undercovers target profile navigation preview) */}
        <div className="absolute bottom-6 right-4 flex flex-col gap-2 z-20">
          {activeTab === 'home' && users.length > 0 && (
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-bold text-slate-400 bg-white shadow-sm p-1 px-2.5 rounded-full capitalize border border-slate-100">Quick view peer:</span>
              <button 
                onClick={() => handleProfileLookup(users[1].uid)}
                className="p-2.5 bg-gradient-to-r from-cyan-400 to-sky-600 rounded-full text-white text-xs font-black shadow-lg flex items-center gap-1 hover:scale-105 transition-all"
              >
                🎓 @{users[1].username}
              </button>
            </div>
          )}
        </div>

        {/* Top unified navigation container */}
        <nav className={`absolute top-0 left-0 right-0 bg-white border-b border-slate-100/90 flex flex-col z-30 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-b-3xl transition-all duration-200 ease-in-out transform ${
          activeTab === 'shorts' ? '-translate-y-[110%] opacity-0 pointer-events-none' : (showToolbar ? 'translate-y-0 opacity-100' : '-translate-y-[110%] opacity-0 pointer-events-none')
        } ${activeTab !== 'shorts' ? 'md:pt-8 pt-4' : 'pt-3'}`}>
          
          {/* Row 1: Logo and Action Buttons */}
          <div className="px-5 py-3 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                C
              </div>
              <div>
                <h1 className="text-xl font-black bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent tracking-tight leading-none mb-1">
                  collegio
                </h1>
                <p className="text-[9px] text-slate-400 font-bold tracking-wider uppercase leading-none">Campus Feed</p>
              </div>
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab('search')}
                className="p-2 w-10 h-10 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-700 transition-all active:scale-95 flex items-center justify-center border border-slate-200/25"
                title="Search campus"
              >
                <Search className="w-5 h-5 stroke-[2.5]" />
              </button>

              <button 
                onClick={() => {
                  if (activeTab === 'settings') {
                    setActiveTab('home');
                  } else {
                    setActiveTab('settings');
                  }
                }}
                className="p-2 w-10 h-10 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-700 transition-all active:scale-95 flex items-center justify-center border border-slate-200/25"
                title={activeTab === 'settings' ? "Close settings" : "Open settings"}
              >
                {activeTab === 'settings' ? (
                  <X className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Menu className="w-5 h-5 stroke-[2.5]" />
                )}
              </button>
            </div>
          </div>

          {/* Row 2: Toolbar Tab Buttons */}
          <div className="px-4 pb-2.5 pt-1.5 flex justify-between items-center border-t border-slate-100/50">
            {/* 1. Home */}
            <button 
              onClick={() => { setActiveTab('home'); setTargetProfileUid(null); }}
              className={`flex flex-col items-center gap-0.5 justify-center transition-colors ${
                activeTab === 'home' ? 'text-cyan-500' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Home className="w-6 h-6 stroke-[2.5]" />
              <span className="text-[9px] font-bold uppercase tracking-tight">Home</span>
            </button>

            {/* 2. Search */}
            <button 
              onClick={() => setActiveTab('search')}
              className={`flex flex-col items-center gap-0.5 justify-center transition-colors ${
                activeTab === 'search' ? 'text-cyan-500' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Search className="w-6 h-6 stroke-[2.5]" />
              <span className="text-[9px] font-bold uppercase tracking-tight">Search</span>
            </button>

            {/* 3. Chat */}
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center gap-0.5 justify-center transition-colors relative ${
                activeTab === 'chat' ? 'text-cyan-500' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <MessageCircle className="w-6 h-6 stroke-[2.5]" />
              <span className="text-[9px] font-bold uppercase tracking-tight">Chat</span>
              <span className="absolute top-0 right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
            </button>

            {/* 4. Shorts */}
            <button 
              onClick={() => setActiveTab('shorts')}
              className={`flex flex-col items-center gap-0.5 justify-center transition-colors ${
                activeTab === 'shorts' ? 'text-pink-500' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Video className="w-6 h-6 stroke-[2.5]" />
              <span className="text-[9px] font-bold uppercase tracking-tight">Shorts</span>
            </button>

            {/* 5. Alerts */}
            <button 
              onClick={() => setActiveTab('alerts')}
              className={`flex flex-col items-center gap-0.5 justify-center transition-colors relative ${
                activeTab === 'alerts' ? 'text-cyan-500' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Bell className="w-6 h-6 stroke-[2.5]" />
              <span className="text-[9px] font-bold uppercase tracking-tight">Alerts</span>
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4.5 h-4.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* 6. Profile */}
            <button 
              onClick={() => { setActiveTab('profile'); setTargetProfileUid(null); }}
              className={`flex flex-col items-center gap-0.5 justify-center transition-colors ${
                activeTab === 'profile' && !targetProfileUid ? 'text-cyan-500' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <User className="w-6 h-6 stroke-[2.5]" />
              <span className="text-[9px] font-bold uppercase tracking-tight">Profile</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Extra floating side widgets explaining Sandbox mode */}
      <div className="hidden lg:flex flex-col gap-4 max-w-xs ml-8 text-white">
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-705 shadow-xl">
          <span className="text-xs font-black text-cyan-400 uppercase tracking-widest block mb-2">Sandbox Controller</span>
          <h2 className="text-2xl font-black leading-tight tracking-tight text-white">
            Collegio Memory Network
          </h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed font-semibold">
            An academic social ecosystem to save student pictures, degree details, and verified university portfolios.
          </p>

          <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-dashed border-slate-700/60 mt-4">
            <span className="text-[10px] font-mono font-bold text-cyan-453 block mb-1">💡 Sandbox Shortcuts:</span>
            <ul className="text-[10px] text-slate-400 space-y-1 font-semibold list-disc list-inside">
              <li>Skip email OTP validation with verification code <code className="text-cyan-400 text-xs font-mono">1111</code></li>
              <li>Toggle between students from the Quick peer button</li>
              <li>Switch templates and paste image attachments</li>
              <li>Simulate real-time live messaging replies</li>
            </ul>
          </div>
        </div>

        <div className="bg-slate-800 p-4.5 rounded-2xl border border-slate-705 flex items-center justify-between">
          <div className="text-slate-400 font-bold text-xs">
            Device status : Online
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SocialProvider>
      <SocialAppContent />
    </SocialProvider>
  );
}
