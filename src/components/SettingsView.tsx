/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSocial } from '../context/SocialContext';
import { 
  Key, Moon, Sun, Bell, Shield, LogOut, Trash2, 
  MessageCircle, Users, User, Video, ShoppingBag, Flag, 
  Bookmark, Calendar, Gift, Gamepad, Award, Radio, 
  Rss, ChevronDown, ChevronUp, Search, Info, 
  HelpCircle, CheckCircle, RefreshCw, Send, AlertTriangle, Play,
  TrendingUp, Wifi, CreditCard, ChevronRight, Globe, Plus, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SettingsView() {
  const {
    currentUser,
    users,
    posts,
    savedPostIds,
    toggleSavePost,
    changePassword,
    logout,
    deactivateAccount,
    deleteAccount,
    darkMode,
    setDarkMode,
    setActiveTab,
    followUser,
    unfollowUser,
    isFollowingUser
  } = useSocial();

  // Navigation State
  const [activeSubView, setActiveSubView] = useState<string | null>(null);

  // Search input for main menu search icon
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState('');

  // Password Fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Local settings preference toggles
  const [pushLikes, setPushLikes] = useState(true);
  const [pushComments, setPushComments] = useState(true);
  const [pushMessages, setPushMessages] = useState(true);

  // Privacy toggles
  const [privatePortfolio, setPrivatePortfolio] = useState(false);
  const [hideStatus, setHideStatus] = useState(false);

  // Destructive actions validation states
  const [deleteConfirmPass, setDeleteConfirmPass] = useState('');
  const [checkedRules, setCheckedRules] = useState(false);

  // Accoridon Collapse Toggles
  const [colSettingsOpen, setColSettingsOpen] = useState(true);
  const [colHelpOpen, setColHelpOpen] = useState(false);
  const [colMetaOpen, setColMetaOpen] = useState(false);

  // TRANSACTION & ORDERS STATE (Shared)
  const [orders, setOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem('collegio_orders');
    return saved ? JSON.parse(saved) : [
      { id: 'ORD-8921', item: 'Engineering Calculus Textbook', price: 35, date: '2026-06-01', status: 'Delivered' },
      { id: 'ORD-2104', item: 'Computer Science Dept Gala Ticket', price: 15, date: '2026-06-05', status: 'Active' }
    ];
  });

  const saveOrders = (updated: any[]) => {
    setOrders(updated);
    localStorage.setItem('collegio_orders', JSON.stringify(updated));
  };

  // 1. GROUPS STATE
  const [groups, setGroups] = useState<any[]>(() => {
    const saved = localStorage.getItem('collegio_menu_groups');
    return saved ? JSON.parse(saved) : [
      { id: 'g1', name: 'Computer Science Study Hub', description: 'Exam preparation, group studies & programming debug sessions.', members: 42, joined: true, category: 'Academic' },
      { id: 'g2', name: 'Campus Soccer Club', description: 'Weekly match circles and weekend friendly matches.', members: 89, joined: false, category: 'Sports' },
      { id: 'g3', name: 'Design Guild & UI UX', description: 'Focusing on Figma skills, layout, and visual design workshops.', members: 24, joined: true, category: 'Design' },
      { id: 'g4', name: 'Campus Board Games Society', description: 'Catan, chess, and cooperative multiplayer matches.', members: 31, joined: false, category: 'Social' }
    ];
  });

  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCat, setNewGroupCat] = useState('Academic');

  const handleJoinGroup = (groupId: string) => {
    const updated = groups.map(g => {
      if (g.id === groupId) {
        return { ...g, joined: !g.joined, members: g.joined ? g.members - 1 : g.members + 1 };
      }
      return g;
    });
    setGroups(updated);
    localStorage.setItem('collegio_menu_groups', JSON.stringify(updated));
  };

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupTitle || !newGroupDesc) return;
    const added = {
      id: 'g-' + Date.now(),
      name: newGroupTitle,
      description: newGroupDesc,
      members: 1,
      joined: true,
      category: newGroupCat
    };
    const updated = [added, ...groups];
    setGroups(updated);
    localStorage.setItem('collegio_menu_groups', JSON.stringify(updated));
    setNewGroupTitle('');
    setNewGroupDesc('');
  };

  // 2. FRIENDS STATE
  const [friendSearch, setFriendSearch] = useState('');

  // 3. MARKETPLACE STATE
  const [marketItems, setMarketItems] = useState<any[]>(() => {
    const saved = localStorage.getItem('collegio_market_items');
    return saved ? JSON.parse(saved) : [
      { id: 'm1', name: 'Calculus 13th Edition Textbook', price: 40, category: 'Books', description: 'Slightly used with no written highlights. Perfect for incoming freshmen.', owner: 'Sarah Connor', phone: '+1 (555) 234-5678', photo: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80' },
      { id: 'm2', name: 'Dorm Mini Refrigerator', price: 75, category: 'Electronics', description: 'Extremely silent, keeps drinks ice cold. Fits perfectly under a desk.', owner: 'James Smith', phone: '+1 (555) 345-6789', photo: 'https://images.unsplash.com/photo-1585244433366-c8a49158fb75?auto=format&fit=crop&w=400&q=80' },
      { id: 'm3', name: 'Solid Wood Ergonomic Chair', price: 60, category: 'Furniture', description: 'Adjustable back support and high cushion base. Excellent condition.', owner: 'Emily Davis', phone: '+1 (555) 456-7890', photo: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=400&q=80' },
      { id: 'm4', name: 'MacBook Air M1 2020 (8GB/256GB)', price: 420, category: 'Electronics', description: 'Battery health 88%. Includes original charger and student protective wrapper.', owner: 'Alex Mercer', phone: '+1 (555) 567-8901', photo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&q=80' }
    ];
  });

  const [marketFilter, setMarketFilter] = useState('All');
  const [marketSearch, setMarketSearch] = useState('');
  const [sellFormOpen, setSellFormOpen] = useState(false);
  const [sellTitle, setSellTitle] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellCat, setSellCat] = useState('Books');
  const [sellDesc, setSellDesc] = useState('');
  const [sellPhoto, setSellPhoto] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80');

  const handleBuyMarketItem = (item: any) => {
    alert(`Acquisition of "${item.name}" complete!\n\nA request has been sent to ${item.owner}. You can complete the trade via direct meet-up or payment receipt.`);
    // Add to orders
    const newOrder = {
      id: 'ORD-' + Math.floor(Math.random() * 9000 + 1000),
      item: item.name,
      price: item.price,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending meetup'
    };
    saveOrders([newOrder, ...orders]);
  };

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellTitle || !sellPrice) return;
    const added = {
      id: 'm-' + Date.now(),
      name: sellTitle,
      price: parseFloat(sellPrice) || 0,
      category: sellCat,
      description: sellDesc,
      owner: currentUser?.fullName || 'Me',
      phone: '+1 (555) 012-3456',
      photo: sellPhoto || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
    };
    const updated = [added, ...marketItems];
    setMarketItems(updated);
    localStorage.setItem('collegio_market_items', JSON.stringify(updated));
    setSellTitle('');
    setSellPrice('');
    setSellDesc('');
    setSellFormOpen(false);
    alert('Listed successfully on Collegio Campus Marketplace!');
  };

  // 4. PAGES STATE
  const [pages, setPages] = useState<any[]>(() => {
    const saved = localStorage.getItem('collegio_menu_pages');
    return saved ? JSON.parse(saved) : [
      { id: 'p1', name: 'Collegio Student Union', likes: 1240, liked: true, category: 'Association' },
      { id: 'p2', name: 'University Department of Engineering', likes: 852, liked: false, category: 'Education' },
      { id: 'p3', name: 'Campus Nightlife Announcements', likes: 1954, liked: true, category: 'Social' },
      { id: 'p4', name: 'Student Advisor & Career Center', likes: 432, liked: false, category: 'Advising' }
    ];
  });

  const handleLikePage = (pageId: string) => {
    const updated = pages.map(p => {
      if (p.id === pageId) {
        return { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    });
    setPages(updated);
    localStorage.setItem('collegio_menu_pages', JSON.stringify(updated));
  };

  // 5. MEMORIES STATE -> filter posts written by active student
  const myMemories = posts.filter(post => post.userId === currentUser?.uid);

  // 6. BIRTHDAYS STATE
  const [shownBalloon, setShownBalloon] = useState(false);
  const [balloonCount, setBalloonCount] = useState(0);

  const triggerBalloons = () => {
    setShownBalloon(true);
    setBalloonCount(15);
    setTimeout(() => {
      setShownBalloon(false);
    }, 6000);
  };

  const classmatesBirthdays = [
    { name: 'Sarah Connor', date: 'June 12', daysLeft: 'In 2 Days', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
    { name: 'James Smith', date: 'June 18', daysLeft: 'In 8 Days', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80' },
    { name: 'Sofia Rodriguez', date: 'July 01', daysLeft: 'In 21 Days', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80' }
  ];

  // 7. EVENTS STATE
  const [campusEvents, setCampusEvents] = useState<any[]>(() => {
    const saved = localStorage.getItem('collegio_menu_events');
    return saved ? JSON.parse(saved) : [
      { id: 'e1', title: 'Grand Graduation Gala', date: 'June 15, 2026', time: '18:00', location: 'University Great Hall', rsvps: 231, status: 'Interested' },
      { id: 'e2', title: 'Fintech Student Hackathon 2026', date: 'June 20, 2026', time: '09:00', location: 'Science Annex Tower B', rsvps: 114, status: 'Attending' },
      { id: 'e3', title: 'Summer Welcome Bonfire', date: 'June 25, 2026', time: '20:30', location: 'South Campus Lawn', rsvps: 345, status: 'Not Going' }
    ];
  });

  const handleRSVP = (eventId: string, rsvpType: string) => {
    const updated = campusEvents.map(e => {
      if (e.id === eventId) {
        let diff = 0;
        if (e.status !== 'Attending' && rsvpType === 'Attending') diff = 1;
        if (e.status === 'Attending' && rsvpType !== 'Attending') diff = -1;
        return { ...e, status: rsvpType, rsvps: Math.max(0, e.rsvps + diff) };
      }
      return e;
    });
    setCampusEvents(updated);
    localStorage.setItem('collegio_menu_events', JSON.stringify(updated));
  };

  // 8. ADS MANAGER STATE
  const [clubAds, setClubAds] = useState<any[]>(() => {
    const saved = localStorage.getItem('collegio_club_ads');
    return saved ? JSON.parse(saved) : [
      { id: 'ad1', headline: 'Need Coding Buddies? Join ACM!', budget: 15, impressions: 1420, clicks: 104, CTR: '7.3%', active: true },
      { id: 'ad2', headline: 'Board Games Pizza Night - Friday', budget: 10, impressions: 850, clicks: 42, CTR: '4.9%', active: true }
    ];
  });

  const [adHeadline, setAdHeadline] = useState('');
  const [adBudget, setAdBudget] = useState('10');
  const [adAudience, setAdAudience] = useState('All undergrad students');

  const handleLaunchAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adHeadline) return;
    const added = {
      id: 'ad-' + Date.now(),
      headline: adHeadline,
      budget: parseFloat(adBudget) || 10,
      impressions: 1,
      clicks: 0,
      CTR: '0.0%',
      active: true
    };
    const updated = [added, ...clubAds];
    setClubAds(updated);
    localStorage.setItem('collegio_club_ads', JSON.stringify(updated));
    setAdHeadline('');
    alert('Study Flyer Campaign launched! Watch your club flyer reach peer feeds.');
  };

  // 9. MOBILE CENTRE SPEED TEST STATE
  const [selectedWifi, setSelectedWifi] = useState('Library Student High-Speed 5G');
  const [speedVal, setSpeedVal] = useState(0);
  const [latencyVal, setLatencyVal] = useState(0);
  const [testingSpeed, setTestingSpeed] = useState(false);

  const startSpeedTest = () => {
    setTestingSpeed(true);
    setSpeedVal(0);
    setLatencyVal(0);
    let count = 0;
    const interval = setInterval(() => {
      setSpeedVal(prev => Math.floor(Math.random() * 80 + 120));
      setLatencyVal(prev => Math.floor(Math.random() * 5 + 4));
      count++;
      if (count >= 15) {
        clearInterval(interval);
        setSpeedVal(248);
        setLatencyVal(6);
        setTestingSpeed(false);
      }
    }, 150);
  };

  // 10. GAME STATE: BALLOON POPPING ACADEMIC GAME
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [gameScore, setGameScore] = useState(0);
  const [gameBalloons, setGameBalloons] = useState<any[]>([]);
  const [gameTimeLeft, setGameTimeLeft] = useState(15);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('collegio_game_highscore') || '0', 10);
  });

  const startGame = () => {
    setGameState('playing');
    setGameScore(0);
    setGameTimeLeft(15);
    setGameBalloons([]);
  };

  // Game timer loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    const t = setInterval(() => {
      setGameTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          setGameState('gameover');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [gameState]);

  // Spawn game elements randomly
  useEffect(() => {
    if (gameState !== 'playing') return;
    const spawnTimer = setInterval(() => {
      const grades = ['GPA 4.0', 'A+', 'Exam Solved', 'Scholarship', 'Graduation', 'F Grade', 'C- Grade'];
      const isBad = Math.random() > 0.7;
      const label = grades[Math.floor(Math.random() * grades.length)];
      const item = {
        id: Math.random(),
        x: Math.floor(Math.random() * 75) + 10, // percentage left
        y: 100, // starts from bottom
        label: label,
        isBad: label.includes('Grade'),
        speed: Math.random() * 15 + 10, // speed
        color: label.includes('F') || label.includes('C-') ? 'bg-rose-500' : 'bg-cyan-500'
      };
      setGameBalloons(prev => [...prev.slice(-15), item]);
    }, 600);
    return () => clearInterval(spawnTimer);
  }, [gameState]);

  // Balloon animation interval
  useEffect(() => {
    if (gameState !== 'playing') return;
    const loop = setInterval(() => {
      setGameBalloons(prev => 
        prev.map(b => ({ ...b, y: b.y - 3 })).filter(b => b.y > 0)
      );
    }, 50);
    return () => clearInterval(loop);
  }, [gameState]);

  const handlePopBalloon = (id: number, isBad: boolean) => {
    setGameBalloons(prev => prev.filter(b => b.id !== id));
    if (isBad) {
      setGameScore(prev => Math.max(0, prev - 5));
    } else {
      setGameScore(prev => {
        const next = prev + 10;
        if (next > highScore) {
          setHighScore(next);
          localStorage.setItem('collegio_game_highscore', next.toString());
        }
        return next;
      });
    }
  };

  // 11. LANGUAGE SELECTION STATE
  const [currentLang, setCurrentLang] = useState('English (US)');
  const languagesList = ['English (US)', 'Español (América Latina)', 'Français (France)', 'Deutsch', 'Português', 'Swahili', 'Hausa', 'Igbo', 'Yoruba'];

  // 12. SUPPORT INBOX STATE
  const [supportTickets, setSupportTickets] = useState<any[]>(() => {
    const saved = localStorage.getItem('collegio_support_tickets');
    return saved ? JSON.parse(saved) : [
      { id: 'TKT-102', subject: 'In-app notification delay', message: 'I cannot see immediately when my friend reviews my post.', status: 'Closed', reply: 'We optimized firestore listeners. It compiles instantly now.', date: '2026-06-03' }
    ];
  });
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMsg) return;
    const added = {
      id: 'TKT-' + Math.floor(Math.random() * 900 + 100),
      subject: ticketSubject,
      message: ticketMsg,
      status: 'Open',
      reply: null,
      date: new Date().toISOString().split('T')[0]
    };
    const updated = [added, ...supportTickets];
    setSupportTickets(updated);
    localStorage.setItem('collegio_support_tickets', JSON.stringify(updated));
    setTicketSubject('');
    setTicketMsg('');
    alert('Academic Support Advisor response registered! Check response below shortly.');
  };

  // 13. REPORT A PROBLEM STATE
  const [problemCat, setProblemCat] = useState('Spam Post UI');
  const [problemText, setProblemText] = useState('');
  const [problemReported, setProblemReported] = useState(false);

  const handleReportProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemText) return;
    setProblemReported(true);
    setProblemText('');
    setTimeout(() => {
      setProblemReported(false);
    }, 4000);
  };

  // 14. ADD ACCOUNT STATE
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newAccEmail, setNewAccEmail] = useState('');
  const [newAccName, setNewAccName] = useState('');

  const handleAddAccountConfirm = () => {
    if (!newAccEmail || !newAccName) return;
    alert(`Mock profile "${newAccName}" configured!\n\nYou can now toggle context instantly from local application credentials.`);
    setShowAddAccountModal(false);
    setNewAccEmail('');
    setNewAccName('');
  };

  // Handle Password Submit Change
  const handleChangePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Please fill out all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match! Re-type credentials.");
      return;
    }
    try {
      await changePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert("Password updated successfully!");
    } catch (err: any) {
      alert("Could not update password: " + err.message);
    }
  };

  // Handle Delete Account Submit
  const handleDeleteAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteConfirmPass) {
      alert("Please enter password verification.");
      return;
    }
    if (!checkedRules) {
      alert("Please acknowledge that deletion removes all campus threads.");
      return;
    }
    
    const doubleCheck = window.confirm("Are you absolutely sure you want to permanently delete your academic account? This cannot be undone.");
    if (doubleCheck) {
      try {
        await deleteAccount(deleteConfirmPass);
      } catch (err: any) {
        alert("Verification failed: " + err.message);
      }
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-24 text-slate-800">
      
      {/* 🎈 Floating Balloon Particle Burst for Birthdays */}
      {shownBalloon && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: balloonCount }).map((_, i) => {
            const leftRand = Math.random() * 85 + 5;
            const sizeRand = Math.random() * 24 + 28;
            const delayRand = Math.random() * 1.5;
            const colors = ['bg-rose-400', 'bg-sky-400', 'bg-amber-400', 'bg-emerald-400', 'bg-purple-400'];
            const color = colors[i % colors.length];
            return (
              <motion.div
                key={i}
                initial={{ y: '110vh', left: `${leftRand}%`, opacity: 0.95 }}
                animate={{ y: '-20vh', rotate: Math.random() * 40 - 20 }}
                transition={{ duration: 4.5, delay: delayRand, ease: 'easeOut' }}
                className={`absolute rounded-t-full rounded-b-3xl shadow-lg border border-white/20 flex flex-col items-center justify-center`}
                style={{ width: sizeRand, height: sizeRand * 1.2 }}
              >
                <div className={`absolute bottom-0 w-full h-[1px] ${color} rounded-full`}></div>
                <div className={`absolute inset-0 rounded-t-full rounded-b-3xl ${color} opacity-90`}></div>
                <span className="text-[10px] z-10 font-bold text-white mb-1">🎁</span>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* RENDER DYNAMIC SUBVIEW HEADER */}
      <header className="sticky top-0 bg-white border-b border-slate-100 z-40 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {activeSubView !== null && (
            <button 
              id="menu-back-arrow"
              onClick={() => setActiveSubView(null)}
              className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 transition-colors rounded-xl text-xs font-black text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              ←
            </button>
          )}
          <div>
            <h2 className="text-xl font-black capitalize">
              {activeSubView === null ? 'Menu' : activeSubView.replace(/-/g, ' ')}
            </h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              {activeSubView === null ? 'Campus Portal Dashboard' : `Collegio Module: ${activeSubView}`}
            </p>
          </div>
        </div>

        {activeSubView === null && (
          <div className="flex items-center gap-2">
            <button 
              id="toggle-search-btn"
              onClick={() => setShowSearchBox(!showSearchBox)}
              className="p-2 w-9 h-9 rounded-full bg-slate-100/90 hover:bg-slate-250 text-slate-700 transition-all flex items-center justify-center border border-slate-200/25"
              title="Filter Menu"
            >
              <Search className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>
          </div>
        )}
      </header>

      {/* Main Container */}
      <div className="max-w-md mx-auto w-full p-4 flex flex-col gap-4">
        
        {/* IF SUBVIEW IS ACTIVE - RENDER UNIQUE SUB MODULE PAGE */}
        <AnimatePresence mode="wait">
          {activeSubView !== null ? (
            <motion.div 
              key={activeSubView} 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4"
            >
              
              {/* MODULE 1: GROUPS */}
              {activeSubView === 'groups' && (
                <div className="flex flex-col gap-4">
                  {/* Create Custom Group Form Card */}
                  <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1">
                      <Plus className="w-4 h-4 text-cyan-500" />
                      <span>Start New Academic Circle</span>
                    </h3>
                    <form onSubmit={handleCreateGroupSubmit} className="flex flex-col gap-2">
                      <input 
                        type="text" 
                        placeholder="E.g., Intro to Algorithms Study Circle" 
                        value={newGroupTitle}
                        onChange={(e) => setNewGroupTitle(e.target.value)}
                        required
                        className="p-2 sm:p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold outline-none focus:border-cyan-400 focus:bg-white"
                      />
                      <textarea 
                        placeholder="Describe study goals, meeting times, or class code..." 
                        value={newGroupDesc}
                        onChange={(e) => setNewGroupDesc(e.target.value)}
                        required
                        rows={2}
                        className="p-2 sm:p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold outline-none focus:border-cyan-400 focus:bg-white resize-none"
                      />
                      <div className="flex justify-between items-center gap-2">
                        <select 
                          value={newGroupCat} 
                          onChange={(e) => setNewGroupCat(e.target.value)}
                          className="bg-slate-50 border border-slate-100 p-2 rounded-xl text-xs font-bold text-slate-650"
                        >
                          <option value="Academic">📚 Academic</option>
                          <option value="Sports">⚽ Sports</option>
                          <option value="Design">🎨 Design</option>
                          <option value="Social">🍕 Social</option>
                        </select>
                        <button 
                          type="submit"
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs rounded-xl"
                        >
                          Launch Group
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Active Groups List */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider px-1">Study circles & Campus Groups</h3>
                    {groups.map(g => (
                      <div key={g.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                          {g.category === 'Academic' ? '📚' : g.category === 'Sports' ? '⚽' : g.category === 'Design' ? '🎨' : '🍕'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-cyan-500 font-extrabold tracking-tight uppercase">{g.category}</p>
                          <h4 className="text-xs font-black text-slate-800 line-clamp-1">{g.name}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold mb-2">{g.description}</p>
                          <span className="text-[9px] text-slate-400 font-bold bg-slate-50 border px-2 py-0.5 rounded-full">{g.members} members</span>
                        </div>
                        <button 
                          onClick={() => handleJoinGroup(g.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[10px] transition-all ${
                            g.joined 
                              ? 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600' 
                              : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-xs'
                          }`}
                        >
                          {g.joined ? 'Leave' : 'Join'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 2: FRIENDS */}
              {activeSubView === 'friends' && (
                <div className="flex flex-col gap-4">
                  {/* Search Student Box */}
                  <div className="bg-white rounded-2xl p-3 border border-slate-150 shadow-sm flex items-center gap-2">
                    <Search className="w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search class peers by name..." 
                      value={friendSearch}
                      onChange={(e) => setFriendSearch(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold outline-none text-slate-800"
                    />
                  </div>

                  {/* Class Peer List */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider px-1">Campus Student Registry</h3>
                    {users
                      .filter(u => u.uid !== currentUser?.uid)
                      .filter(u => u.fullName.toLowerCase().includes(friendSearch.toLowerCase()))
                      .map(u => {
                        const following = isFollowingUser(u.uid);
                        return (
                          <div key={u.uid} className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center gap-3">
                            <img 
                              src={u.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'} 
                              alt={u.fullName} 
                              className="w-10 h-10 rounded-full object-cover border"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 leading-none mb-1">
                                <span>{u.fullName}</span>
                                {u.verified && <CheckCircle className="w-3.5 h-3.5 text-cyan-500 fill-cyan-50" />}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-bold leading-none">@{u.username}</p>
                              <p className="text-[9px] text-slate-500 font-medium line-clamp-1 mt-1">{u.bio || 'Collegio Academic Student'}</p>
                            </div>
                            <button 
                              onClick={() => {
                                if (following) {
                                  unfollowUser(u.uid);
                                } else {
                                  followUser(u.uid);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-colors ${
                                following 
                                  ? 'bg-rose-50 text-rose-500 hover:bg-rose-100' 
                                  : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                              }`}
                            >
                              {following ? 'Unfollow' : 'Follow'}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* MODULE 3: MARKETPLACE */}
              {activeSubView === 'marketplace' && (
                <div className="flex flex-col gap-4">
                  {/* Category Pill Filters */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {['All', 'Books', 'Electronics', 'Furniture', 'Housing'].map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setMarketFilter(cat)}
                        className={`text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-full border transition-all flex-shrink-0 ${
                          marketFilter === cat 
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
                            : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex-1 bg-white rounded-2xl px-3 py-1.5 border border-slate-150 flex items-center gap-2">
                      <Search className="w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search textbooks, mini-fridge..."
                        value={marketSearch}
                        onChange={(e) => setMarketSearch(e.target.value)}
                        className="bg-transparent text-xs outline-none w-full text-slate-700 font-semibold"
                      />
                    </div>
                    <button 
                      onClick={() => setSellFormOpen(!sellFormOpen)}
                      className="px-3.5 py-2.5 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-2xl flex items-center gap-1 hover:bg-emerald-600 shadow-sm transition-all"
                    >
                      {sellFormOpen ? 'Close' : 'Sell'}
                    </button>
                  </div>

                  {/* List Item Submit Form */}
                  {sellFormOpen && (
                    <div className="bg-white rounded-3xl p-4 border border-emerald-100 shadow-sm">
                      <h3 className="text-xs font-black text-emerald-600 uppercase tracking-wide mb-3 flex items-center gap-1">
                        <ShoppingBag className="w-4 h-4" />
                        <span>List campus item for sale</span>
                      </h3>
                      <form onSubmit={handleSellSubmit} className="flex flex-col gap-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="text" 
                            placeholder="Product title (e.g. Lamp)" 
                            required
                            value={sellTitle}
                            onChange={(e) => setSellTitle(e.target.value)}
                            className="bg-slate-50 border p-2.5 rounded-xl text-xs font-bold outline-none focus:bg-white"
                          />
                          <input 
                            type="number" 
                            placeholder="Price ($)" 
                            required
                            value={sellPrice}
                            onChange={(e) => setSellPrice(e.target.value)}
                            className="bg-slate-50 border p-2.5 rounded-xl text-xs font-bold outline-none focus:bg-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <select 
                            value={sellCat} 
                            onChange={(e) => setSellCat(e.target.value)}
                            className="bg-slate-50 border p-2.5 rounded-xl text-xs font-bold outline-none"
                          >
                            <option value="Books">Books</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Furniture">Furniture</option>
                            <option value="Housing">Housing</option>
                          </select>
                          <input 
                            type="text" 
                            placeholder="Option Photo URL" 
                            value={sellPhoto}
                            onChange={(e) => setSellPhoto(e.target.value)}
                            className="bg-slate-50 border p-2.5 rounded-xl text-xs font-bold outline-none text-slate-400 overflow-ellipsis"
                          />
                        </div>
                        <textarea 
                          placeholder="Condition of item, meet-up details at campus, etc."
                          required
                          rows={2}
                          value={sellDesc}
                          onChange={(e) => setSellDesc(e.target.value)}
                          className="bg-slate-50 border p-2.5 rounded-xl text-xs font-bold outline-none resize-none focus:bg-white"
                        />
                        <button 
                          type="submit"
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black py-2.5 rounded-xl shadow-xs"
                        >
                          Submit Listed Product
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Listings Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {marketItems
                      .filter(item => marketFilter === 'All' || item.category === marketFilter)
                      .filter(item => item.name.toLowerCase().includes(marketSearch.toLowerCase()))
                      .map(item => (
                        <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm flex flex-col">
                          <img 
                            src={item.photo} 
                            alt={item.name} 
                            className="h-28 w-full object-cover bg-slate-50"
                            referrerPolicy="no-referrer"
                          />
                          <div className="p-3 flex-1 flex flex-col justify-between">
                            <div>
                              <span className="text-[8px] bg-emerald-50 text-emerald-600 font-extrabold px-2 py-0.5 rounded-full border border-emerald-100 uppercase inline-block mb-1">
                                {item.category}
                              </span>
                              <h4 className="text-xs font-black text-slate-800 line-clamp-1 leading-tight mb-0.5">{item.name}</h4>
                              <p className="text-[10px] font-extrabold text-emerald-600 mb-1.5">${item.price}</p>
                              <p className="text-[9px] text-slate-400 font-medium line-clamp-2 leading-tight mb-2">{item.description}</p>
                            </div>
                            <button 
                              onClick={() => handleBuyMarketItem(item)}
                              className="w-full py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-black rounded-lg uppercase"
                            >
                              Acquire Item
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* MODULE 4: PAGES */}
              {activeSubView === 'pages' && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider px-1">Discover Official Campus Associations</h3>
                  {pages.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 text-lg">
                          🚩
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800">{p.name}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold">{p.category} · {p.likes.toLocaleString()} likes</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleLikePage(p.id)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-colors ${
                          p.liked 
                            ? 'bg-slate-100 text-slate-500' 
                            : 'bg-amber-400 text-white shadow-xs hover:bg-amber-500'
                        }`}
                      >
                        {p.liked ? 'Liked' : 'Like'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* MODULE 5: SAVED */}
              {activeSubView === 'saved' && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider px-1">Bookmarked Campus Feeds</h3>
                  {savedPostIds.length === 0 ? (
                    <div className="bg-white rounded-3xl p-6 text-center text-slate-400 border border-slate-100 shadow-sm">
                      <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold">No saved memory posts yet.</p>
                      <p className="text-[10px] text-slate-400 mt-1">Tap the bookmark ribbon on posts in your feed to save.</p>
                    </div>
                  ) : (
                    posts
                      .filter(post => savedPostIds.includes(post.id))
                      .map(post => (
                        <div key={post.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <img src={post.profilePhoto} alt={post.fullName} className="w-8 h-8 rounded-full object-cover" />
                            <div>
                              <p className="text-xs font-black text-slate-800">{post.fullName}</p>
                              <p className="text-[9px] text-slate-400 font-bold">@{post.username}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 font-medium line-clamp-3">{post.text}</p>
                          <div className="flex justify-between items-center border-t pt-2 mt-1">
                            <span className="text-[9px] text-slate-400 font-semibold">{post.createdAt.split('T')[0] || 'Recently'}</span>
                            <button 
                              onClick={() => toggleSavePost(post.id)}
                              className="text-[10px] text-rose-500 hover:underline font-bold"
                            >
                              Unsave
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}

              {/* MODULE 6: MEMORIES */}
              {activeSubView === 'memories' && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider px-1">Your Retrospective Timeline</h3>
                  {myMemories.length === 0 ? (
                    <div className="bg-white rounded-3xl p-6 text-center text-slate-400 border border-slate-100 shadow-xs">
                      <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold">Write a campus memory first!</p>
                    </div>
                  ) : (
                    myMemories.map(post => (
                      <div key={post.id} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] bg-sky-50 text-sky-600 font-extrabold px-2 py-0.5 rounded-full border border-sky-100 uppercase">
                            On This Day In History
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold">{post.createdAt.split('T')[0]}</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed">{post.text}</p>
                        {post.mediaUrls && post.mediaUrls[0] && (
                          <img src={post.mediaUrls[0]} alt="memory" className="w-full h-32 object-cover rounded-xl mt-2 bg-slate-50" />
                        )}
                        <p className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-2">
                          <span>❤️ {post.likesCount} student likes</span>
                          <span>💬 {post.commentsCount} comments</span>
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* MODULE 7: BIRTHDAYS */}
              {activeSubView === 'birthdays' && (
                <div className="flex flex-col gap-4">
                  {/* Balloon Action Card */}
                  <div className="bg-gradient-to-br from-pink-400 to-rose-500 rounded-3xl p-5 text-white shadow-md flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black flex items-center gap-1">
                        <span>Celebrate Classroom Birthdays!</span>
                      </h4>
                      <p className="text-[10px] text-pink-50 opacity-90 mt-1 leading-relaxed">
                        Tap below to float digital congrats balloons across campus screens!
                      </p>
                    </div>
                    <button 
                      onClick={triggerBalloons}
                      className="px-4 py-2.5 bg-white text-pink-600 font-black text-[10px] uppercase rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform"
                    >
                      🎈 Send Balloon Burst
                    </button>
                  </div>

                  {/* List */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider px-1">Upcoming Birthdays</h3>
                    {classmatesBirthdays.map(b => (
                      <div key={b.name} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
                        <img src={b.image} alt={b.name} className="w-10 h-10 rounded-full object-cover border" />
                        <div className="flex-1">
                          <h4 className="text-xs font-black text-slate-800">{b.name}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold">{b.date} · <span className="text-rose-500 font-bold">{b.daysLeft}</span></p>
                        </div>
                        <button 
                          onClick={() => {
                            triggerBalloons();
                            alert(`Wished Happy Birthday to ${b.name}! 🌟`);
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl text-[10px] font-black"
                        >
                          Wish
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 8: EVENTS */}
              {activeSubView === 'events' && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider px-1">RSVP University Calendars</h3>
                  {campusEvents.map(e => (
                    <div key={e.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[9px] text-cyan-600 font-extrabold uppercase leading-none mb-1">{e.date} @ {e.time}</p>
                          <h4 className="text-xs font-black text-slate-800 leading-tight">{e.title}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold mt-1">📍 {e.location}</p>
                        </div>
                        <span className="text-[9px] bg-slate-50 border px-2.5 py-0.5 rounded-full font-bold text-slate-400">
                          {e.rsvps} RSVP
                        </span>
                      </div>

                      {/* RSVP Buttons */}
                      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-50">
                        {['Attending', 'Interested', 'Not Going'].map(rsvpType => (
                          <button
                            key={rsvpType}
                            onClick={() => handleRSVP(e.id, rsvpType)}
                            className={`py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${
                              e.status === rsvpType 
                                ? 'bg-cyan-500 text-white shadow-xs' 
                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            {rsvpType}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* MODULE 9: GAMES (CAMPUS GRAD GAME) */}
              {activeSubView === 'games' && (
                <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black">Campus Grade Escape</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">Pop GPA 4.0 & Scholar blocks! Avoid F Grades!</p>
                    </div>
                    <span className="text-xs font-black text-cyan-600">🏆 HS: {highScore}</span>
                  </div>

                  {gameState === 'idle' ? (
                    <div className="bg-gradient-to-br from-cyan-900 to-slate-900 aspect-video rounded-2xl flex flex-col items-center justify-center text-white p-4">
                      <Gamepad className="w-12 h-12 text-cyan-400 mb-2 animate-bounce" />
                      <button 
                        onClick={startGame}
                        className="px-6 py-2.5 bg-cyan-500 text-xs font-black rounded-full hover:scale-105 active:scale-95 transition-transform"
                      >
                        Start Arcade Game
                      </button>
                    </div>
                  ) : gameState === 'playing' ? (
                    <div className="bg-slate-900 aspect-video rounded-2xl relative overflow-hidden text-white border border-slate-800">
                      {/* Timer & Score HUD */}
                      <div className="absolute top-2 left-2 right-2 flex justify-between items-center text-[10px] font-bold z-10 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        <span>Score: {gameScore}</span>
                        <span>Time: {gameTimeLeft}s</span>
                      </div>

                      {/* Floating Balloons */}
                      {gameBalloons.map(b => (
                        <button
                          key={b.id}
                          onClick={() => handlePopBalloon(b.id, b.isBad)}
                          className={`absolute px-2.5 py-1.5 rounded-2xl text-[9px] font-extrabold text-white transition-transform active:scale-95 ${b.color}`}
                          style={{ bottom: `${100 - b.y}%`, left: `${b.x}%` }}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-900 aspect-video rounded-2xl flex flex-col items-center justify-center text-white p-4 text-center">
                      <h5 className="text-md font-black text-rose-500 mb-1">Game Over!</h5>
                      <p className="text-xs font-bold text-slate-300 mb-4">Your Final Score: {gameScore}</p>
                      <button 
                        onClick={startGame}
                        className="px-6 py-2 bg-cyan-500 text-xs font-black rounded-full hover:scale-105"
                      >
                        Play Again
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MODULE 10: ADS MANAGER */}
              {activeSubView === 'ads-manager' && (
                <div className="flex flex-col gap-4">
                  {/* Create New Flyer Form */}
                  <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2.5 flex items-center gap-1">
                      <Award className="w-4 h-4 text-pink-500" />
                      <span>Promote Campus Student Club</span>
                    </h3>
                    <form onSubmit={handleLaunchAd} className="flex flex-col gap-2">
                      <input 
                        type="text" 
                        placeholder="Tagline (e.g. Free Pizza Chess Marathon on Friday!)" 
                        value={adHeadline}
                        onChange={(e) => setAdHeadline(e.target.value)}
                        required
                        className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold outline-none focus:bg-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          value={adBudget} 
                          onChange={(e) => setAdBudget(e.target.value)}
                          className="p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                        >
                          <option value="5">$5 Budget (Reaches 500 students)</option>
                          <option value="15">$15 Budget (Reaches 1500 students)</option>
                          <option value="50">$50 Budget (Reaches 5000 students)</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="Audience target info" 
                          value={adAudience}
                          onChange={(e) => setAdAudience(e.target.value)}
                          className="p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs"
                      >
                        Launch Flyer Campaign
                      </button>
                    </form>
                  </div>

                  {/* Active Ads list */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider px-1">Campaign Analytics</h3>
                    {clubAds.map(ad => (
                      <div key={ad.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-black text-slate-800 line-clamp-1">{ad.headline}</h4>
                          <span className="text-[8px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border">ACTIVE</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 p-2 rounded-xl">
                          <div>
                            <span className="text-[8px] text-slate-400 block font-bold uppercase">Budget</span>
                            <span className="text-xs font-black text-slate-700">${ad.budget}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 block font-bold uppercase">Reach</span>
                            <span className="text-xs font-black text-slate-700">{ad.impressions}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 block font-bold uppercase">Clicks</span>
                            <span className="text-xs font-black text-slate-700">{ad.clicks}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 block font-bold uppercase">CTR</span>
                            <span className="text-xs font-black text-slate-705">{ad.CTR}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 11: MOBILE CENTRE */}
              {activeSubView === 'mobile-centre' && (
                <div className="flex flex-col gap-4">
                  {/* Diagnostic Speed Card */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-4">
                    <Wifi className="w-10 h-10 text-violet-500" />
                    <div>
                      <h4 className="text-xs font-black">Campus WiFi Network</h4>
                      <select 
                        value={selectedWifi}
                        onChange={(e) => setSelectedWifi(e.target.value)}
                        className="bg-slate-50 border p-2 rounded-xl text-[11px] font-bold outline-none text-slate-650 tracking-tight text-center mt-1.5"
                      >
                        <option value="Library Student High-Speed 5G">📚 Library Student High-Speed 5G</option>
                        <option value="Lecture Hall G WiFi Network">🏫 Lecture Hall G WiFi Network</option>
                        <option value="South Campus Student Lounge Hub">🍔 South Campus Student Lounge Hub</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-8 py-2">
                      <div className="text-center">
                        <span className="text-[8px] text-slate-400 block font-bold uppercase">Speed</span>
                        <span className="text-2xl font-black text-violet-600">{speedVal} <span className="text-[9px]">Mbps</span></span>
                      </div>
                      <div className="text-center">
                        <span className="text-[8px] text-slate-400 block font-bold uppercase">Latency</span>
                        <span className="text-2xl font-black text-violet-600">{latencyVal} <span className="text-[9px]">ms</span></span>
                      </div>
                    </div>

                    <button 
                      onClick={startSpeedTest}
                      disabled={testingSpeed}
                      className="px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 text-white font-extrabold text-xs rounded-full shadow-sm flex items-center gap-1.5 transition-transform"
                    >
                      {testingSpeed ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Testing Diagnostics...</span>
                        </>
                      ) : (
                        <span>Test Internet Speed</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* MODULE 12: FEEDS */}
              {activeSubView === 'feeds' && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider px-1">Chrono Feed Category Filter</h3>
                  <div className="bg-white rounded-3xl p-6 text-center text-slate-400 border border-slate-100 shadow-sm leading-relaxed">
                    <Rss className="w-10 h-10 text-slate-350 mx-auto mb-2" />
                    <h4 className="text-xs font-black text-slate-700 leading-none mb-1">Chronological Feed Channels</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mb-4">Read specific student categories or club publications exclusively.</p>
                    <div className="flex flex-col gap-2 max-w-[200px] mx-auto">
                      {['#Academics', '#Nightlife', '#LostAndFound', '#ClubSports'].map(tag => (
                        <button
                          key={tag}
                          onClick={() => {
                            setActiveTab('home');
                            alert(`Subscribing chronological feed to filter tag: ${tag}`);
                          }}
                          className="py-2.5 bg-slate-50 hover:bg-slate-100 border text-slate-700 rounded-xl text-[10px] font-black uppercase text-center"
                        >
                          View {tag} Channel
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 13: SETTINGS PROFILE FORMS */}
              {activeSubView === 'settings' && (
                <div className="flex flex-col gap-4">
                  {/* Display Settings Toggle */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col gap-2">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b pb-2 mb-1">
                      <Moon className="w-4.5 h-4.5 text-cyan-500" />
                      <span>Display Settings</span>
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-slate-700 block">Dark Canvas theme</span>
                        <span className="text-[9px] text-slate-400 font-bold block">Dim the light emissions on campus</span>
                      </div>
                      <button 
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-2 rounded-xl border flex items-center gap-1 transition-all ${
                          darkMode ? 'bg-slate-800 text-amber-400 border-slate-700' : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}
                      >
                        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        <span className="text-[9px] font-bold uppercase">{darkMode ? 'Light' : 'Dark'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Password Change Form */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b pb-3 mb-4">
                      <Key className="w-4.5 h-4.5 text-cyan-500" />
                      <span>Update Password Info</span>
                    </h3>
                    <form onSubmit={handleChangePassSubmit} className="flex flex-col gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Old Credentials</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          required
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold outline-none focus:bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 block mb-0.5">New Password</label>
                          <input 
                            type="password" 
                            placeholder="••••••••"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold outline-none focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Confirm</label>
                          <input 
                            type="password" 
                            placeholder="••••••••"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold outline-none focus:bg-white"
                          />
                        </div>
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-extrabold text-xs"
                      >
                        Change Password
                      </button>
                    </form>
                  </div>

                  {/* Alerts Preference Card */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col gap-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b pb-2 mb-1">
                      <Bell className="w-4.5 h-4.5 text-cyan-500" />
                      <span>Live Alerts Configuration</span>
                    </h3>
                    <div className="flex flex-col gap-3 text-xs font-bold text-slate-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <span>Like counts alerts</span>
                          <span className="text-[9px] text-slate-405 block font-normal">Push notification when peer likes a post</span>
                        </div>
                        <input type="checkbox" checked={pushLikes} onChange={(e) => setPushLikes(e.target.checked)} className="accent-cyan-500" />
                      </div>
                      <div className="flex items-center justify-between pt-2.5 border-t">
                        <div>
                          <span>Comments & replies</span>
                          <span className="text-[9px] text-slate-405 block font-normal">Sound notice when classmates respond to portfolios</span>
                        </div>
                        <input type="checkbox" checked={pushComments} onChange={(e) => setPushComments(e.target.checked)} className="accent-cyan-500" />
                      </div>
                    </div>
                  </div>

                  {/* Destructive account control */}
                  <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm flex flex-col gap-3 bg-rose-50/10">
                    <h3 className="text-xs font-black uppercase text-rose-700 tracking-wider flex items-center gap-1.5 border-b border-rose-100 pb-2 mb-1">
                      <Trash2 className="w-4.5 h-4.5 text-rose-500" />
                      <span>Destructive Space</span>
                    </h3>
                    <form onSubmit={handleDeleteAccountSubmit} className="flex flex-col gap-3">
                      <div>
                        <span className="text-xs font-bold text-rose-800 block">Delete Collegio Account</span>
                        <p className="text-[10px] text-slate-400 font-semibold mb-2 leading-tight">Wipes everything permanently.</p>
                        <input 
                          type="password" 
                          placeholder="Type secret password..." 
                          required
                          value={deleteConfirmPass}
                          onChange={(e) => setDeleteConfirmPass(e.target.value)}
                          className="w-full p-2.5 bg-white border border-rose-250 rounded-xl text-xs outline-none focus:border-rose-500"
                        />
                      </div>
                      <div className="flex items-start gap-1 text-[9px] text-slate-500 font-semibold mb-2">
                        <input type="checkbox" checked={checkedRules} onChange={(e) => setCheckedRules(e.target.checked)} className="mt-0.5" />
                        <span>I understand deletion is permanent and cannot be reversed.</span>
                      </div>
                      <button type="submit" className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs shadow-md">
                        Confirm Account Deletion
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* MODULE 14: ORDERS & PAYMENTS */}
              {activeSubView === 'orders-and-payments' && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider px-1">Campus Purchase Receipts</h3>
                  {orders.map(o => (
                    <div key={o.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800">{o.item}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold">Ref: {o.id} · Date: {o.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-extrabold text-emerald-600">${o.price}</p>
                        <span className="text-[8px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase border font-bold">
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* MODULE 15: LANGUAGE SELECTION */}
              {activeSubView === 'language' && (
                <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex flex-col gap-2">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Configure Language Preference</h3>
                  {languagesList.map(lang => (
                    <button
                      key={lang}
                      onClick={() => {
                        setCurrentLang(lang);
                        alert(`Applet language changed to ${lang}!`);
                      }}
                      className={`w-full p-3 rounded-2xl text-xs font-extrabold flex justify-between items-center transition-all ${
                        currentLang === lang 
                          ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' 
                          : 'bg-slate-50 border hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span>{lang}</span>
                      {currentLang === lang && <CheckCircle className="w-4 h-4 text-cyan-500" />}
                    </button>
                  ))}
                </div>
              )}

              {/* MODULE 16: HELP CENTER FAQ */}
              {activeSubView === 'help' && (
                <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Campus FAQ & Tutorials</h3>
                  {[
                    { q: 'How do I sell books on Marketplace?', a: 'Tap Marketplace icon in the main menu, choose "Sell" at the top right, fill in title, price, description and launch listing.' },
                    { q: 'Are direct messages secured?', a: 'Yes, all peer connection chats and attachments are authorized on secure firestore database networks.' },
                    { q: 'Can other colleges read my stories?', a: 'No, only verified students who belong to your chosen university and subject of study can load stories.' }
                  ].map((faq, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-2xl border flex flex-col gap-1">
                      <h5 className="text-xs font-black text-slate-800">Q: {faq.q}</h5>
                      <p className="text-[10px] font-semibold text-slate-505 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* MODULE 17: ACCOUNT STATUS */}
              {activeSubView === 'account-status' && (
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black">University Good Standing Certificate</h4>
                    <p className="text-[10px] text-slate-450 font-semibold tracking-tight mt-1 leading-relaxed">
                      Your current student social portfolio is in perfect stand and contains zero academic conduct alerts.
                    </p>
                  </div>
                  <div className="bg-slate-5 w-full p-3 rounded-2xl border text-[10px] font-bold text-slate-650 grid grid-cols-2">
                    <div>
                      <span className="text-[8px] text-slate-400 uppercase block font-bold">Institution badge</span>
                      <span className="text-xs font-black text-slate-700">Verified student</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 uppercase block font-bold">Conduct Rank</span>
                      <span className="text-xs font-black text-emerald-600">Perfect 100%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 18: SUPPORT INBOX */}
              {activeSubView === 'support-inbox' && (
                <div className="flex flex-col gap-4">
                  {/* Submit ticket Form */}
                  <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2.5 flex items-center gap-1">
                      <HelpCircle className="w-4 h-4 text-cyan-500" />
                      <span>Contact Student Success Advisor</span>
                    </h3>
                    <form onSubmit={handleSubmitTicket} className="flex flex-col gap-2">
                      <input 
                        type="text" 
                        placeholder="Subject (e.g. Account Registration Issue)" 
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        required
                        className="p-3 bg-slate-50 border rounded-xl text-xs font-semibold outline-none focus:bg-white"
                      />
                      <textarea 
                        placeholder="Write details of the issue..." 
                        value={ticketMsg}
                        onChange={(e) => setTicketMsg(e.target.value)}
                        required
                        rows={2}
                        className="p-3 bg-slate-50 border rounded-xl text-xs font-semibold outline-none focus:bg-white resize-none"
                      />
                      <button 
                        type="submit"
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs"
                      >
                        Submit Support Case
                      </button>
                    </form>
                  </div>

                  {/* Open Ticket Logs */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider px-1">advisor responses</h3>
                    {supportTickets.map(t => (
                      <div key={t.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block">REF: {t.id}</span>
                            <h5 className="text-xs font-black text-slate-800 leading-tight">{t.subject}</h5>
                          </div>
                          <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${
                            t.status === 'Open' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold italic">" {t.message} "</p>
                        {t.reply && (
                          <div className="bg-sky-50/50 p-2.5 rounded-xl border border-sky-100 text-[10px] text-sky-850 font-bold leading-relaxed">
                            <span className="text-[9px] text-sky-600 block uppercase font-extrabold">Office of Student Affairs feedback:</span>
                            {t.reply}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 19: ABOUT SYSTEM */}
              {activeSubView === 'about' && (
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-12 h-12 bg-cyan-500 text-white font-black text-2xl flex items-center justify-center rounded-3xl shadow-md">
                    C
                  </div>
                  <div>
                    <h4 className="text-xs font-black">Collegio Academic Social Network</h4>
                    <span className="text-[9px] bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 text-slate-400 font-black mt-1 inline-block">
                      v2.4.0 (Stable Production)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed max-w-xs">
                    Collegio is a student social environment running high-integrity connections designed exclusively for verified college cohorts, clubs, events, and textbook marketplaces.
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold">
                    Running safely on Cloud, FireStore & React.
                  </p>
                </div>
              )}

              {/* MODULE 20: REPORT PROBLEMS */}
              {activeSubView === 'report-problem' && (
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Report Technical Error</span>
                  </h3>
                  <form onSubmit={handleReportProblem} className="flex flex-col gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Feature Affected</label>
                      <select 
                        value={problemCat}
                        onChange={(e) => setProblemCat(e.target.value)}
                        className="bg-slate-50 border p-2.5 rounded-xl text-xs font-bold outline-none w-full"
                      >
                        <option value="Spam Post UI">Spam Post UI</option>
                        <option value="Direct chats delivery delay">Direct chats delivery delay</option>
                        <option value="Marketplace list bug">Marketplace list bug</option>
                        <option value="Profile badge mismatch">Profile badge mismatch</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Details of System Failure</label>
                      <textarea 
                        required
                        placeholder="Explain steps to reproduce the exception error..." 
                        rows={3}
                        value={problemText}
                        onChange={(e) => setProblemText(e.target.value)}
                        className="p-3 bg-slate-50 border rounded-xl text-xs font-semibold outline-none focus:bg-white resize-none w-full text-slate-700"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-rose-500 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs hover:bg-rose-600"
                    >
                      File Violation Report
                    </button>
                  </form>

                  {problemReported && (
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex items-center gap-2 text-emerald-600 text-[10px] font-bold animate-pulse">
                      <CheckCircle className="w-4.5 h-4.5" />
                      <span>Bug successfully registered in Collegio Developer Sandbox!</span>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          ) : (
            
            /* IF NO SUBVIEW IS ACTIVE - RENDER FACEBOOK MENU DASHBOARD */
            <motion.div 
              key="main-menu" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              
              {/* MAIN MENU FILTERING SEARCHBAR */}
              {showSearchBox && (
                <div className="bg-white rounded-2xl p-3 border border-slate-150 shadow-sm flex items-center gap-2">
                  <Search className="w-4.5 h-4.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Type name of menu to filter..." 
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold outline-none text-slate-800"
                  />
                </div>
              )}

              {/* USER ACCOUNT PROFILE BAR */}
              <div 
                id="menu-profile-card"
                onClick={() => setActiveTab('profile')}
                className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 hover:bg-slate-50/50 transition-all active:scale-[0.99] flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={currentUser?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'} 
                    alt={currentUser?.fullName || 'David Ojukwu'} 
                    className="w-12 h-12 rounded-full object-cover border border-slate-100"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="text-md font-black text-slate-800 leading-none mb-1 flex items-center gap-1.5">
                      <span>{currentUser?.fullName || 'David Ojukwu'}</span>
                      {currentUser?.verified && <CheckCircle className="w-4 h-4 text-cyan-500 fill-cyan-50" />}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-tight">View your student profile</p>
                  </div>
                </div>
                <span className="text-sm font-black text-slate-400">→</span>
              </div>

              {/* TWO COLUMN GRID SHORT-CUTS */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'chat-shortcut', label: 'Messages', desc: 'Active student chats', icon: MessageCircle, color: 'bg-indigo-50 text-indigo-500 border-indigo-100', action: () => setActiveTab('chat') },
                  { id: 'groups-shortcut', label: 'Groups', desc: 'Join academic study circles', icon: Users, color: 'bg-sky-50 text-sky-500 border-sky-100', action: () => setActiveSubView('groups') },
                  { id: 'friends-shortcut', label: 'Friends', desc: 'Follow class cohorts', icon: User, color: 'bg-emerald-50 text-emerald-500 border-emerald-100', action: () => setActiveSubView('friends') },
                  { id: 'shorts-shortcut', label: 'Reels', desc: 'Watch vertical video shorts', icon: Video, color: 'bg-pink-50 text-pink-500 border-pink-100', action: () => setActiveTab('shorts') },
                  { id: 'market-shortcut', label: 'Marketplace', desc: 'Buy & sell peer textbooks', icon: ShoppingBag, color: 'bg-emerald-5 w-auto text-emerald-600 border-emerald-100', action: () => setActiveSubView('marketplace') },
                  { id: 'pages-shortcut', label: 'Pages', desc: 'Discover campus guilds', icon: Flag, color: 'bg-orange-50 text-orange-500 border-orange-100', action: () => setActiveSubView('pages') },
                  { id: 'saved-shortcut', label: 'Saved', desc: 'Bookmarked board posts', icon: Bookmark, color: 'bg-purple-50 text-purple-500 border-purple-100', action: () => setActiveSubView('saved') },
                  { id: 'memories-shortcut', label: 'Memories', desc: 'Past history timeline', icon: RefreshCw, color: 'bg-blue-50 text-blue-500 border-blue-100', action: () => setActiveSubView('memories') },
                  { id: 'bdays-shortcut', label: 'Birthdays', desc: 'Float balloon greetings', icon: Gift, color: 'bg-rose-50 text-rose-500 border-rose-100', action: () => setActiveSubView('birthdays') },
                  { id: 'events-shortcut', label: 'Events', desc: 'Campus RSVP calendars', icon: Calendar, color: 'bg-cyan-50 text-cyan-500 border-cyan-100', action: () => setActiveSubView('events') },
                  { id: 'games-shortcut', label: 'Games', desc: 'Pop GPA F grade arcade', icon: Gamepad, color: 'bg-violet-50 text-violet-500 border-violet-100', action: () => setActiveSubView('games') },
                  { id: 'ads-shortcut', label: 'Ads Manager', desc: 'Promote student flyerships', icon: Award, color: 'bg-pink-50 text-pink-600 border-pink-100', action: () => setActiveSubView('ads-manager') },
                  { id: 'mobile-shortcut', label: 'Mobile Centre · Air...', desc: 'Internet speed diagnostic', icon: Radio, color: 'bg-slate-100 text-slate-500 border-slate-200', action: () => setActiveSubView('mobile-centre') },
                  { id: 'feeds-shortcut', label: 'Feeds', desc: 'Filter chrono feeds', icon: Rss, color: 'bg-amber-50 text-amber-500 border-amber-100', action: () => setActiveSubView('feeds') }
                ]
                  .filter(shortcut => shortcut.label.toLowerCase().includes(menuSearchQuery.toLowerCase()))
                  .map(shortcut => {
                    const IconComp = shortcut.icon;
                    return (
                      <div 
                        id={shortcut.id}
                        key={shortcut.label}
                        onClick={shortcut.action}
                        className="bg-white rounded-3xl p-3 border border-slate-100/50 hover:bg-slate-50 shadow-xs flex flex-col items-start gap-1 relative cursor-pointer hover:border-slate-200 transition-all active:scale-[0.98]"
                      >
                        <div className={`w-9 h-9 rounded-full ${shortcut.color} flex items-center justify-center border font-bold mb-1.5`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-black text-slate-800 leading-none mb-0.5">{shortcut.label}</h4>
                        <p className="text-[9px] text-slate-400 font-semibold line-clamp-1 leading-none">{shortcut.desc}</p>
                      </div>
                    );
                  })}
              </div>

              {/* COLLAPSIBLE TILE NAVIGATION (Accordion panels matching Screenshots 2 & 3) */}
              <div className="flex flex-col gap-2 mt-2">
                
                {/* ACCORDION 1: SETTINGS & PRIVACY */}
                <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs">
                  <button 
                    onClick={() => setColSettingsOpen(!colSettingsOpen)}
                    className="w-full p-4 flex items-center justify-between bg-white text-slate-700 font-black text-xs cursor-pointer hover:bg-slate-100/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-550 flex items-center justify-center">
                        <Key className="w-4 h-4" />
                      </div>
                      <span>Settings & privacy</span>
                    </div>
                    {colSettingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {colSettingsOpen && (
                    <div className="px-4 pb-4 bg-slate-50/50 border-t border-slate-50 flex flex-col gap-1.5 pt-2">
                      <button 
                        onClick={() => setActiveSubView('settings')}
                        className="w-full bg-white border rounded-2xl p-3 flex items-center justify-between text-left hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                            <Key className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-800 block">Settings</span>
                            <span className="text-[9px] text-slate-400 font-bold block">Password, push controls, account delete</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>

                      <button 
                        onClick={() => setActiveSubView('orders-and-payments')}
                        className="w-full bg-white border rounded-2xl p-3 flex items-center justify-between text-left hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-650 flex items-center justify-center">
                            <CreditCard className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-800 block">Orders and payments</span>
                            <span className="text-[9px] text-slate-400 font-bold block">Checkout receipts, tuition status logs</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>

                      <div className="w-full bg-white border rounded-2xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-650 flex items-center justify-center">
                            <Moon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-800 block">Dark mode</span>
                            <span className="text-[9px] text-slate-400 font-bold block">Low light emissions in app layout</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => setDarkMode(!darkMode)}
                          className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                            darkMode ? 'bg-cyan-500 justify-end' : 'bg-slate-200 justify-start'
                          }`}
                        >
                          <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-xs" />
                        </button>
                      </div>

                      <button 
                        onClick={() => setActiveSubView('language')}
                        className="w-full bg-white border rounded-2xl p-3 flex items-center justify-between text-left hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-650 flex items-center justify-center">
                            <Globe className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-800 block">Language</span>
                            <span className="text-[9px] text-slate-400 font-bold block">Current: {currentLang}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  )}
                </div>

                {/* ACCORDION 2: HELP & SUPPORT */}
                <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs">
                  <button 
                    onClick={() => setColHelpOpen(!colHelpOpen)}
                    className="w-full p-4 flex items-center justify-between bg-white text-slate-700 font-black text-xs cursor-pointer hover:bg-slate-100/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-550 flex items-center justify-center">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <span>Help & Support</span>
                    </div>
                    {colHelpOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {colHelpOpen && (
                    <div className="px-4 pb-4 bg-slate-50/50 border-t border-slate-50 flex flex-col gap-1.5 pt-2">
                      <button 
                        onClick={() => setActiveSubView('help')}
                        className="w-full bg-white border rounded-2xl p-3 flex items-center justify-between text-left hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-650 flex items-center justify-center">
                            <HelpCircle className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-800 block">Help FAQ</span>
                            <span className="text-[9px] text-slate-400 font-bold block">Articles, listings tips, direct advice</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>

                      <button 
                        onClick={() => setActiveSubView('account-status')}
                        className="w-full bg-white border rounded-2xl p-3 flex items-center justify-between text-left hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-650 flex items-center justify-center">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-800 block">Account status</span>
                            <span className="text-[9px] text-slate-400 font-bold block">Excellent Standing Verification badge</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>

                      <button 
                        onClick={() => setActiveSubView('support-inbox')}
                        className="w-full bg-white border rounded-2xl p-3 flex items-center justify-between text-left hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-650 flex items-center justify-center">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-800 block">Support Inbox</span>
                            <span className="text-[9px] text-slate-400 font-bold block">Unread dialogue tickets with university advisors</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>

                      <button 
                        onClick={() => setActiveSubView('about')}
                        className="w-full bg-white border rounded-2xl p-3 flex items-center justify-between text-left hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-650 flex items-center justify-center">
                            <Info className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-800 block">About</span>
                            <span className="text-[9px] text-slate-400 font-bold block">Credits, legal certifications, framework logs</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>

                      <button 
                        onClick={() => setActiveSubView('report-problem')}
                        className="w-full bg-white border rounded-2xl p-3 flex items-center justify-between text-left hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-650 flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-800 block">Report a problem</span>
                            <span className="text-[9px] text-slate-400 font-bold block">File visual error or student policy violation</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  )}
                </div>

                {/* STANDALONE ACTION BUTTONS */}
                <button 
                  onClick={() => setShowAddAccountModal(true)}
                  className="w-full bg-white border border-slate-100 rounded-3xl p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-650 flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 block">Add Account</span>
                      <span className="text-[9px] text-slate-400 font-bold block">Configure a secondary student login session</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button 
                  onClick={logout}
                  className="w-full bg-rose-50 border border-rose-100 rounded-3xl p-4 flex items-center justify-between text-left hover:bg-rose-100/30 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3 text-rose-600">
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black block">Log Out</span>
                      <span className="text-[9px] text-rose-450 block">End credentials token immediately</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400" />
                </button>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* 👤 ADD ACCOUNT SIMULATION MODAL OVERLAY */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-[32px] max-w-xs w-full p-5 border border-slate-100 flex flex-col gap-4 text-slate-800 relative shadow-2xl">
            <button 
              onClick={() => setShowAddAccountModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
            <div>
              <h4 className="text-sm font-black">Configure Secondary Session</h4>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-normal">
                Inject placeholder student credentials into local emulator logs.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <input 
                type="text" 
                placeholder="Full student name (e.g. John Doe)" 
                value={newAccName}
                onChange={(e) => setNewAccName(e.target.value)}
                className="p-2 sm:p-3 bg-slate-50 border rounded-xl text-xs font-semibold outline-none"
              />
              <input 
                type="email" 
                placeholder="University email (.edu)" 
                value={newAccEmail}
                onChange={(e) => setNewAccEmail(e.target.value)}
                className="p-2 sm:p-3 bg-slate-50 border rounded-xl text-xs font-semibold outline-none"
              />
            </div>
            <button 
              onClick={handleAddAccountConfirm}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-extrabold text-xs rounded-xl shadow-md"
            >
              Register Session Profile
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
