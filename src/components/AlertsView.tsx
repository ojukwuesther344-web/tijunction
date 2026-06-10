/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useSocial } from '../context/SocialContext';
import { Bell, Heart, MessageSquare, UserCheck, MessageCircle, MailPlus, CheckCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function AlertsView() {
  const { notifications, markNotificationsAsRead } = useSocial();

  const handleMarkAllRead = () => {
    markNotificationsAsRead();
    alert("Checked all notifications as read! Push badge deactivated.");
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-cyan-500" />;
      case 'message':
        return <MailPlus className="w-5 h-5 text-blue-500" />;
      case 'follower':
        return <UserCheck className="w-5 h-5 text-emerald-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-24 text-slate-800">
      <header className="sticky top-0 bg-white border-b border-slate-100 z-10 px-4 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-xl font-black">Alerts</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Campus Feed Notifications</p>
        </div>

        {/* Mark All read */}
        {notifications.some(n => !n.read) && (
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-xl text-xs font-bold transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark read</span>
          </button>
        )}
      </header>

      {/* Main Alerts List */}
      <main className="max-w-md mx-auto w-full p-4 flex flex-col gap-3">
        {notifications.map((notif) => (
          <motion.div 
            key={notif.id}
            className={`p-4 rounded-2xl bg-white border flex gap-3.5 items-center shadow-sm relative transition-colors ${
              notif.read ? 'border-slate-100/70 opacity-80' : 'border-cyan-155 bg-cyan-50/10'
            }`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Sender Image Frame */}
            <div className="relative">
              <img 
                src={notif.senderPhoto} 
                alt={notif.senderName} 
                className="w-11 h-11 rounded-full object-cover border border-slate-100/50"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                {getNotifIcon(notif.type)}
              </div>
            </div>

            {/* Notification content text */}
            <div className="flex-1 leading-snug">
              <p className="text-xs font-bold text-slate-800">
                {notif.senderName} <span className="font-normal text-slate-500">{notif.text}</span>
              </p>
              <span className="text-[9px] text-slate-400 font-bold font-sans mt-1 block">Recent</span>
            </div>

            {/* Blue dot indicator for Unread */}
            {!notif.read && (
              <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full"></div>
            )}
          </motion.div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Bell className="w-16 h-16 stroke-1 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-sm">Campus stream is quiet.</p>
            <p className="text-xs">Interaction notices will construct here once users react to posts.</p>
          </div>
        )}
      </main>
    </div>
  );
}
