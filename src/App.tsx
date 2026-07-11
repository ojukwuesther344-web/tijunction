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
import { MenuView } from './components/MenuView';
import Logo from './components/Logo';

import { 
  Home, Search, PlusCircle, Bell, User, MessageCircle, Settings, Menu, Video, X,
  Users, ShoppingBag, Flag, Bookmark, Calendar, Gift, Gamepad, Award, Radio, Rss, RefreshCw,
  ChevronDown, ChevronUp, ChevronLeft, CreditCard, HelpCircle, Shield, Inbox, Globe, Plus, Moon, LogOut
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
    setActiveTab,
    darkMode,
    setDarkMode,
    logout
  } = useSocial();

  // Let other pages request target user profile viewing
  const [targetProfileUid, setTargetProfileUid] = useState<string | null>(null);

  // Nested sub-views state inside SettingsView
  const [activeSubView, setActiveSubView] = useState<string | null>(null);

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

  // Helper to render current active view content
  const renderActiveViewContent = () => {
    return (
      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex-1 flex flex-col min-h-full">
            <HomeFeedView />
          </motion.div>
        )}

        {activeTab === 'search' && (
          <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex-1 flex flex-col min-h-full">
            <SearchView />
          </motion.div>
        )}

        {activeTab === 'create' && (
          <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex-1 flex flex-col min-h-full">
            <CreatePostView onComplete={handleCreatePostComplete} />
          </motion.div>
        )}

        {activeTab === 'shorts' && (
          <motion.div 
            key="shorts" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black z-45 flex flex-col w-full h-full"
          >
            <ShortsView />
          </motion.div>
        )}

        {activeTab === 'chat' && (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex-1 flex flex-col min-h-full">
            <ChatView />
          </motion.div>
        )}

        {activeTab === 'alerts' && (
          <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex-1 flex flex-col min-h-full">
            <AlertsView />
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex-1 flex flex-col min-h-full">
            <ProfileView 
              altTargetUid={targetProfileUid} 
              onClearTarget={() => setTargetProfileUid(null)} 
              openSettingsTab={openSettingsFromProfile}
            />
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex-1 flex flex-col min-h-full animate-fadeIn">
            <SettingsView activeSubView={activeSubView} setActiveSubView={setActiveSubView} />
          </motion.div>
        )}

        {activeTab === 'menu' && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex-1 flex flex-col min-h-full">
            <MenuView 
              onSelectProfile={(uid) => {
                setTargetProfileUid(uid);
                setActiveTab('profile');
              }}
              onNavigateToSubView={(tab, subView) => {
                setActiveTab(tab);
                setActiveSubView(subView);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // RENDER RESPONSIVE INTERFACES FOR DESKTOP & MOBILE
  return (
    <div className="min-h-screen bg-[#f1f3f6] font-sans antialiased text-slate-800 flex justify-center">
      
      {/* 1. UNIVERSAL DESKTOP DUAL VIEWPORT FRAME (Flex row on desktop, hidden on mobile) */}
      <div className="hidden md:flex w-full max-w-7xl mx-auto min-h-screen relative gap-6 px-4">
        
        {/* DESKTOP SIDEBAR PANEL (LEFT) */}
        <aside className="w-64 xl:w-72 flex flex-col h-screen sticky top-0 py-6 pr-4 justify-between flex-shrink-0 z-30">
          <div className="flex flex-col gap-6">
            <div className="py-2 px-1">
              <Logo size="md" />
            </div>

            <nav className="flex flex-col gap-1">
              <button 
                onClick={() => { setActiveTab('home'); setTargetProfileUid(null); }}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-150 font-extrabold text-sm ${
                  activeTab === 'home' 
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' 
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-100'
                }`}
              >
                <Home className="w-5 h-5 stroke-[2.5]" />
                <span>Home Feed</span>
              </button>

              <button 
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-150 font-extrabold text-sm ${
                  activeTab === 'search' 
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' 
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-100'
                }`}
              >
                <Search className="w-5 h-5 stroke-[2.5]" />
                <span>Search Explore</span>
              </button>

              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-150 font-extrabold text-sm relative ${
                  activeTab === 'chat' 
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' 
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-100'
                }`}
              >
                <MessageCircle className="w-5 h-5 stroke-[2.5]" />
                <span className="flex-1 text-left">Direct Messages</span>
                <span className="absolute top-4 right-4 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
              </button>

              <button 
                onClick={() => setActiveTab('shorts')}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-150 font-extrabold text-sm ${
                  activeTab === 'shorts' 
                    ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20' 
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-100'
                }`}
              >
                <Video className="w-5 h-5 stroke-[2.5]" />
                <span>Short Reels</span>
              </button>

              <button 
                onClick={() => setActiveTab('alerts')}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-150 font-extrabold text-sm relative ${
                  activeTab === 'alerts' 
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' 
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-100'
                }`}
              >
                <Bell className="w-5 h-5 stroke-[2.5]" />
                <span className="flex-1 text-left">Alerts</span>
                {unreadAlertsCount > 0 ? (
                  <span className="bg-pink-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {unreadAlertsCount}
                  </span>
                ) : (
                  <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                )}
              </button>

              <button 
                onClick={() => { setActiveTab('profile'); setTargetProfileUid(null); }}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-150 font-extrabold text-sm ${
                  activeTab === 'profile' && !targetProfileUid
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' 
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-100'
                }`}
              >
                <User className="w-5 h-5 stroke-[2.5]" />
                <span>My Profile</span>
              </button>

              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-150 font-extrabold text-sm ${
                  activeTab === 'settings' 
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' 
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-100'
                }`}
              >
                <Settings className="w-5 h-5 stroke-[2.5]" />
                <span>Settings</span>
              </button>
            </nav>

            <button 
              onClick={() => setActiveTab('create')}
              className="mt-2 w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create Post</span>
            </button>
          </div>

          {/* User profile section at bottom of desktop left sidebar */}
          <div className="border-t border-slate-200/80 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <img 
                src={currentUser?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'} 
                alt="Me" 
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-xs font-black text-slate-800 truncate leading-tight">{currentUser?.fullName}</span>
                <span className="text-[10px] text-slate-400 font-extrabold truncate">@{currentUser?.username}</span>
              </div>
            </div>
            <button 
              onClick={() => logout()}
              className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all active:scale-95"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </aside>

        {/* DESKTOP MAIN VIEWPORT COLUMN */}
        <main className="flex-1 max-w-2xl bg-[#f0f2f5] border-l border-r border-slate-200/50 h-screen overflow-y-auto relative flex flex-col scrollbar-none shadow-sm">
          {renderActiveViewContent()}
        </main>

        {/* DESKTOP SIDEBAR DETAILS (RIGHT) */}
        <aside className="hidden lg:flex flex-col w-80 py-6 h-screen overflow-y-auto gap-5 sticky top-0 scrollbar-none flex-shrink-0">
          {/* Sandbox controller card */}
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl text-white">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-widest block mb-2">Sandbox Controller</span>
            <h2 className="text-lg font-black leading-tight tracking-tight">
              Ti Connect Global Network
            </h2>
            <p className="text-[11px] text-slate-300 mt-2 leading-relaxed font-semibold">
              A universal social ecosystem to connect individuals, creators, and businesses to share ideas, media, and daily moments.
            </p>

            <div className="bg-slate-900/50 p-3 mt-4 rounded-2xl border border-dashed border-slate-700/60">
              <span className="text-[10px] font-mono font-bold text-cyan-400 block mb-1">💡 Sandbox Shortcuts:</span>
              <ul className="text-[10px] text-slate-400 space-y-1 font-semibold list-disc list-inside">
                <li>Skip email OTP with code <code className="text-cyan-400 font-mono">1111</code></li>
                <li>Simulate live messages dynamically</li>
                <li>Switch profiles instantly below</li>
              </ul>
            </div>
          </div>

          {/* Quick peer switcher */}
          {users.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Profile Viewer</span>
              <div className="flex flex-col gap-2">
                {users.slice(0, 3).map((peer) => (
                  <button 
                    key={peer.uid}
                    onClick={() => handleProfileLookup(peer.uid)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-all text-left border border-slate-100 hover:border-slate-200"
                  >
                    <img src={peer.profilePhoto} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                    <div className="flex-1 overflow-hidden">
                      <div className="text-xs font-bold text-slate-800 truncate">{peer.fullName}</div>
                      <div className="text-[9px] text-slate-400 font-bold">@{peer.username}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between text-slate-500 font-bold text-xs">
            <span>Global Status: Active</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        </aside>

      </div>

      {/* 2. NATIVE RESPONSIVE MOBILE APP INTERFACE (Visible on mobile screens < md) */}
      <div className="md:hidden w-full min-h-screen bg-white relative flex flex-col overflow-hidden">
        
        {/* Mobile top unified navigation container */}
        <nav className={`absolute top-0 left-0 right-0 bg-white border-b border-slate-100/90 flex flex-col z-30 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-200 ease-in-out transform ${
          (activeTab === 'shorts' || activeTab === 'menu') ? '-translate-y-[110%] opacity-0 pointer-events-none' : (showToolbar ? 'translate-y-0 opacity-100' : '-translate-y-[110%] opacity-0 pointer-events-none')
        } pt-4`}>
          
          {/* Row 1: Logo and Action Buttons */}
          <div className="px-5 py-3 flex items-center justify-between">
            {/* Logo */}
            <Logo size="sm" />

            {/* Top Right Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab('search')}
                className="p-2 w-10 h-10 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-700 transition-all active:scale-95 flex items-center justify-center border border-slate-200/25"
                title="Search network"
              >
                <Search className="w-5 h-5 stroke-[2.5]" />
              </button>

              <button 
                onClick={() => {
                  if (activeTab === 'menu') {
                    setActiveTab('home');
                  } else {
                    setActiveTab('menu');
                  }
                }}
                className={`p-2 w-10 h-10 rounded-full transition-all active:scale-95 flex items-center justify-center border ${
                  activeTab === 'menu'
                    ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm'
                    : 'bg-slate-100/90 hover:bg-slate-200 text-slate-700 border-slate-200/25'
                }`}
                title="Menu"
              >
                <Menu className="w-5 h-5 stroke-[2.5]" />
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

        {/* Content Area */}
        <div 
          className={`flex-1 bg-[#f0f2f5] ${
            activeTab === 'shorts' 
              ? 'overflow-hidden pt-0 pb-0' 
              : activeTab === 'menu'
                ? 'overflow-y-auto pt-0 pb-[80px]'
                : 'overflow-y-auto mt-[120px] pb-[80px]'
          }`} 
          onScroll={handleScroll}
        >
          {renderActiveViewContent()}
        </div>

        {/* Floating action buttons */}
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
