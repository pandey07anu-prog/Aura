import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Tags,
  PieChart,
  Repeat,
  BarChart3,
  ShieldCheck,
  LogOut,
  X,
  IndianRupee
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: Receipt },
    { to: '/income', label: 'Income', icon: ArrowDownLeft },
    { to: '/expenses', label: 'Expenses', icon: ArrowUpRight },
    { to: '/categories', label: 'Categories', icon: Tags },
    { to: '/budgets', label: 'Budgets', icon: PieChart },
    { to: '/recurring', label: 'Recurring', icon: Repeat },
    { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#111111] border-r border-[#292929] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-[#292929]">
          <NavLink to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#171717] border border-[#292929] flex items-center justify-center text-white">
              <IndianRupee className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold tracking-wider text-white text-base">AURA</div>
              <div className="text-[10px] text-[#737373] tracking-widest font-mono uppercase">FINANCE OS</div>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A3A3A3] hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 mb-2 text-[11px] font-mono uppercase tracking-wider text-[#737373]">
            Main Menu
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-black font-semibold shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                      : 'text-[#A3A3A3] hover:text-white hover:bg-[#171717]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* Admin Management Section */}
          {isAdmin && (
            <div className="pt-6">
              <div className="px-3 mb-2 text-[11px] font-mono uppercase tracking-wider text-[#EF4444]/90 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Administrator</span>
              </div>
              <NavLink
                to="/admin"
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-black font-semibold shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                      : 'text-[#A3A3A3] hover:text-white hover:bg-[#171717]'
                  }`
                }
              >
                <ShieldCheck className="w-4 h-4 shrink-0 text-white" />
                <span>Admin Console</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* User Identity & Logout Footer */}
        <div className="p-4 border-t border-[#292929] bg-[#0c0c0c]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#171717] border border-[#292929] mb-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-[#242424] border border-[#383838] flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">{user?.fullName || 'User'}</div>
                <div className="text-[11px] text-[#737373] truncate font-mono">{user?.email}</div>
              </div>
            </div>
            {isAdmin && (
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/10 text-white font-mono shrink-0">
                ADMIN
              </span>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-[#A3A3A3] hover:text-white hover:bg-[#171717] rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
