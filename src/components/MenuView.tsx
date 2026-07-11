import React, { useState } from 'react';
import { useSocial } from '../context/SocialContext';
import { 
  Search, MessageCircle, Users, User, Video, ShoppingBag, Flag, Bookmark, 
  RefreshCw, Gift, Calendar, Gamepad, Award, Radio, Rss, ChevronDown, 
  ChevronUp, Settings, CreditCard, Moon, Globe, HelpCircle, Shield, 
  Inbox, Plus, LogOut, ChevronLeft
} from 'lucide-react';

interface MenuViewProps {
  onSelectProfile: (uid: string) => void;
  onNavigateToSubView: (tab: 'home' | 'search' | 'create' | 'chat' | 'alerts' | 'profile' | 'settings' | 'shorts' | 'menu', subView: string | null) => void;
}

export const MenuView: React.FC<MenuViewProps> = ({ onSelectProfile, onNavigateToSubView }) => {
  const { 
    currentUser, 
    darkMode, 
    setDarkMode, 
    logout 
  } = useSocial();

  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);

  return (
    <div className="flex flex-col bg-[#f0f2f5] min-h-screen w-full pb-24 text-slate-900 select-none animate-fadeIn duration-200">
      
      {/* Header section with back and search */}
      <div className="bg-white border-b border-slate-200/60 py-3 px-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigateToSubView('home', null)}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-all font-black text-left"
            id="menu_back_btn"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h2 className="text-xl font-black text-slate-900 leading-none" id="menu_title">Menu</h2>
        </div>
        <button 
          onClick={() => onNavigateToSubView('search', null)}
          className="p-2 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all flex items-center justify-center"
          id="menu_search_btn"
        >
          <Search className="w-4.5 h-4.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4">
        
        {/* Profile Card */}
        <div 
          onClick={() => {
            if (currentUser?.uid) {
              onSelectProfile(currentUser.uid);
            }
          }}
          className="bg-white border border-slate-200/50 rounded-2xl p-3 shadow-xs hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between"
          id="menu_profile_card"
        >
          <div className="flex items-center gap-3">
            <img 
              src={currentUser?.profilePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"} 
              alt={currentUser?.fullName || "User"} 
              className="w-10 h-10 rounded-full object-cover border border-slate-100/50"
              referrerPolicy="no-referrer"
            />
            <div className="text-left">
              <h4 className="text-xs font-black text-slate-800 leading-none">{currentUser?.fullName || "David Ojukwu"}</h4>
              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">View your profile</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-slate-500 rotate-180" />
          </div>
        </div>

        {/* 2-column Grid of Campus Features */}
        <div className="grid grid-cols-2 gap-2" id="menu_features_grid">
          {[
            { id: 'chat-shortcut', label: 'Messages', icon: MessageCircle, iconColor: 'text-indigo-500', bgColor: 'bg-indigo-50', action: () => onNavigateToSubView('chat', null) },
            { id: 'groups-shortcut', label: 'Groups', icon: Users, iconColor: 'text-blue-500', bgColor: 'bg-blue-50', action: () => onNavigateToSubView('settings', 'groups') },
            { id: 'friends-shortcut', label: 'Friends', icon: User, iconColor: 'text-emerald-500', bgColor: 'bg-emerald-50', action: () => onNavigateToSubView('settings', 'friends') },
            { id: 'shorts-shortcut', label: 'Reels', icon: Video, iconColor: 'text-pink-500', bgColor: 'bg-pink-50', action: () => onNavigateToSubView('shorts', null) },
            { id: 'market-shortcut', label: 'Marketplace', icon: ShoppingBag, iconColor: 'text-emerald-650', bgColor: 'bg-emerald-50', action: () => onNavigateToSubView('settings', 'marketplace') },
            { id: 'pages-shortcut', label: 'Pages', icon: Flag, iconColor: 'text-orange-500', bgColor: 'bg-orange-50', action: () => onNavigateToSubView('settings', 'pages') },
            { id: 'saved-shortcut', label: 'Saved', icon: Bookmark, iconColor: 'text-purple-500', bgColor: 'bg-purple-50', action: () => onNavigateToSubView('settings', 'saved') },
            { id: 'memories-shortcut', label: 'Memories', icon: RefreshCw, iconColor: 'text-blue-600', bgColor: 'bg-blue-50', action: () => onNavigateToSubView('settings', 'memories') },
            { id: 'bdays-shortcut', label: 'Birthdays', icon: Gift, iconColor: 'text-rose-500', bgColor: 'bg-rose-50', action: () => onNavigateToSubView('settings', 'birthdays') },
            { id: 'events-shortcut', label: 'Events', icon: Calendar, iconColor: 'text-cyan-500', bgColor: 'bg-cyan-50', action: () => onNavigateToSubView('settings', 'events') },
            { id: 'games-shortcut', label: 'Games', icon: Gamepad, iconColor: 'text-violet-500', bgColor: 'bg-violet-50', action: () => onNavigateToSubView('settings', 'games') },
            { id: 'ads-shortcut', label: 'Ads Manager', icon: Award, iconColor: 'text-pink-600', bgColor: 'bg-pink-50', action: () => onNavigateToSubView('settings', 'ads-manager') },
            { id: 'mobile-shortcut', label: 'Mobile centre', icon: Radio, iconColor: 'text-slate-500', bgColor: 'bg-slate-100', action: () => onNavigateToSubView('settings', 'mobile-centre') },
            { id: 'feeds-shortcut', label: 'Feeds', icon: Rss, iconColor: 'text-amber-500', bgColor: 'bg-amber-50', action: () => onNavigateToSubView('settings', 'feeds') }
          ].map(item => {
            const IconComp = item.icon;
            return (
              <div 
                key={item.id}
                onClick={item.action}
                className="bg-white border border-slate-200/50 rounded-2xl p-3 flex flex-col justify-between items-start min-h-[82px] shadow-xs hover:bg-slate-50 hover:shadow-sm border-slate-200/60 transition-all cursor-pointer text-left active:scale-[0.98]"
                id={item.id}
              >
                <div className={`w-8 h-8 rounded-full ${item.bgColor} ${item.iconColor} flex items-center justify-center shrink-0`}>
                  <IconComp className="w-4.5 h-4.5 text-inherit stroke-[2]" />
                </div>
                <span className="text-[11px] font-black text-slate-800 leading-tight block mt-3">{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Settings & privacy Accordion */}
        <div className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-xs" id="menu_settings_accordion_container">
          <div 
            onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
            id="menu_settings_accordion_toggle"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-slate-500" />
              <span className="text-xs font-black text-slate-800">Settings & privacy</span>
            </div>
            {isSettingsExpanded ? (
              <ChevronUp className="w-4.5 h-4.5 text-slate-500" />
            ) : (
              <ChevronDown className="w-4.5 h-4.5 text-slate-500" />
            )}
          </div>

          {isSettingsExpanded && (
            <div className="bg-slate-50/20 border-t border-slate-100 flex flex-col divide-y divide-slate-100">
              <div 
                onClick={() => onNavigateToSubView('settings', 'settings')}
                className="p-3 pl-11 flex items-center gap-3 cursor-pointer hover:bg-slate-50/85 transition-colors"
                id="menu_settings_subview"
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black text-slate-700">Settings</span>
              </div>

              <div 
                onClick={() => onNavigateToSubView('settings', 'orders-and-payments')}
                className="p-3 pl-11 flex items-center gap-3 cursor-pointer hover:bg-slate-50/85 transition-colors"
                id="menu_payments_subview"
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black text-slate-700">Orders and payments</span>
              </div>

              {/* Dark Mode Reactive Toggle */}
              <div className="p-3 pl-11 pr-4 flex items-center justify-between hover:bg-slate-50/85 transition-colors" id="menu_darkmode_toggle_row">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Moon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-black text-slate-700">Dark mode</span>
                </div>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors relative duration-300 ${
                    darkMode ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                  id="menu_darkmode_toggle_btn"
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 absolute ${
                      darkMode ? 'translate-x-[20px]' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div 
                onClick={() => onNavigateToSubView('settings', 'language')}
                className="p-3 pl-11 flex items-center gap-3 cursor-pointer hover:bg-slate-50/85 transition-colors"
                id="menu_language_subview"
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black text-slate-700">Language</span>
              </div>
            </div>
          )}
        </div>

        {/* Help & support Accordion */}
        <div className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-xs" id="menu_help_accordion_container">
          <div 
            onClick={() => setIsHelpExpanded(!isHelpExpanded)}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
            id="menu_help_accordion_toggle"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-slate-500" />
              <span className="text-xs font-black text-slate-800">Help & support</span>
            </div>
            {isHelpExpanded ? (
              <ChevronUp className="w-4.5 h-4.5 text-slate-500" />
            ) : (
              <ChevronDown className="w-4.5 h-4.5 text-slate-500" />
            )}
          </div>

          {isHelpExpanded && (
            <div className="bg-slate-50/20 border-t border-slate-100 flex flex-col divide-y divide-slate-100">
              <div 
                onClick={() => onNavigateToSubView('settings', 'help')}
                className="p-3 pl-11 flex items-center gap-3 cursor-pointer hover:bg-slate-50/85 transition-colors"
                id="menu_help_subview"
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black text-slate-700">Help</span>
              </div>

              <div 
                onClick={() => onNavigateToSubView('settings', 'account-status')}
                className="p-3 pl-11 flex items-center gap-3 cursor-pointer hover:bg-slate-50/85 transition-colors"
                id="menu_accstatus_subview"
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black text-slate-700">Account status</span>
              </div>

              <div 
                onClick={() => onNavigateToSubView('settings', 'support-inbox')}
                className="p-3 pl-11 flex items-center gap-3 cursor-pointer hover:bg-slate-50/85 transition-colors"
                id="menu_supportinbox_subview"
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Inbox className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black text-slate-700">Support Inbox</span>
              </div>
            </div>
          )}
        </div>

        {/* Add Account Shortcut */}
        <div 
          onClick={() => {
            alert("This feature lets you configure multiple sandbox profiles; profile switching is handled automatically on real-time logins.");
          }}
          className="bg-white border border-slate-200/50 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs hover:bg-slate-50 cursor-pointer transition-colors"
          id="menu_add_account_btn"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200/50">
            <Plus className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs font-black text-slate-800">Add Account</span>
        </div>

        {/* Log Out Shortcut */}
        <div 
          onClick={() => {
            logout();
          }}
          className="bg-white border border-slate-200/50 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs hover:bg-red-50 cursor-pointer transition-colors text-red-650"
          id="menu_logout_btn"
        >
          <div className="w-8 h-8 rounded-full bg-red-50 text-red-650 flex items-center justify-center">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="text-xs font-black">Log Out</span>
        </div>

      </div>
    </div>
  );
};
