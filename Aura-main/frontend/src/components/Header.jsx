import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, Plus, Check, Trash2, ArrowUpRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Header = ({ onOpenSidebar, onOpenNewTransaction, title, subtitle }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count')
      ]);
      if (listRes.data?.success) setNotifications(listRes.data.data || []);
      if (countRes.data?.success) setUnreadCount(countRes.data.data?.unreadCount || 0);
    } catch (err) {
      console.warn('Could not fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-20 bg-[#080808]/90 backdrop-blur-md border-b border-[#292929] px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-[#A3A3A3] hover:text-white rounded-lg hover:bg-[#171717] lg:hidden"
          aria-label="Open Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{title || 'Dashboard'}</h1>
          {subtitle && <p className="text-xs text-[#737373] hidden sm:block mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Right: Notification Center & Quick Add Transaction */}
      <div className="flex items-center gap-3">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2.5 rounded-xl bg-[#171717] border border-[#292929] text-[#A3A3A3] hover:text-white hover:border-[#383838] transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#111111] border border-[#292929] shadow-2xl p-4 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#292929] mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-white text-black font-mono font-bold text-[10px]">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <>
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[11px] text-[#A3A3A3] hover:text-white transition-colors"
                        title="Mark all as read"
                      >
                        Read all
                      </button>
                      <button
                        onClick={handleClearAll}
                        className="text-[#737373] hover:text-[#EF4444] transition-colors p-1"
                        title="Clear all notifications"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Notification Items */}
              <div className="max-h-80 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-[#737373] text-xs">
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.read && handleMarkAsRead(n.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        n.read
                          ? 'bg-[#141414] border-[#222222] text-[#888888]'
                          : 'bg-[#1c1c1c] border-[#333333] text-white hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-semibold text-white truncate">{n.title}</span>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed text-[#A3A3A3] mb-1.5">{n.message}</p>
                      <span className="text-[9px] font-mono text-[#525252]">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Transaction Button */}
        {onOpenNewTransaction && (
          <button
            onClick={onOpenNewTransaction}
            className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs sm:text-sm hover:bg-white/90 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.12)] shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}
      </div>
    </header>
  );
};
