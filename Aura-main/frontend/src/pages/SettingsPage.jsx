import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Settings,
  User,
  Shield,
  KeyRound,
  CheckCircle2,
  Lock,
  Database,
  Server
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, refreshUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('Password must be at least 6 characters.');
      return;
    }

    setPwdLoading(true);
    setPwdError('');
    setPwdSuccess('');

    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      if (res.data?.success) {
        setPwdSuccess('Your password has been changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPwdSuccess(''), 6000);
      }
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Could not update password. Please check your current password.');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Account & Security Settings</h2>
        <p className="text-xs text-[#737373]">
          Manage your personal profile, credentials, and ledger environment
        </p>
      </div>

      {/* Profile Information Card */}
      <div className="fintech-card p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#242424]">
          <div className="w-10 h-10 rounded-xl bg-[#242424] border border-[#333333] flex items-center justify-center text-white font-bold text-sm">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{user?.fullName}</h3>
            <p className="text-xs text-[#737373] font-mono">{user?.email}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-white/10 text-white font-semibold">
              {user?.role}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-fintech-greenSubtle text-fintech-green border border-fintech-green/30">
              {user?.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#242424]">
            <span className="text-[#737373] block mb-1">User Identifier</span>
            <span className="text-white text-[11px] truncate block">{user?.id}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#242424]">
            <span className="text-[#737373] block mb-1">Ledger Tenant</span>
            <span className="text-white text-[11px]">Strictly Isolated (MongoDB)</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#242424]">
            <span className="text-[#737373] block mb-1">Account Created</span>
            <span className="text-white text-[11px]">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="fintech-card p-6 space-y-4">
        <div className="flex items-center gap-2.5 mb-2">
          <KeyRound className="w-4 h-4 text-white" />
          <h3 className="text-sm font-bold text-white">Update Account Password</h3>
        </div>

        {pwdSuccess && (
          <div className="p-3.5 rounded-xl bg-fintech-greenSubtle border border-fintech-green/30 text-xs font-mono text-fintech-green flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{pwdSuccess}</span>
          </div>
        )}

        {pwdError && (
          <div className="p-3.5 rounded-xl bg-fintech-redSubtle border border-fintech-red/30 text-xs font-mono text-fintech-red">
            {pwdError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pwdLoading}
            className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {pwdLoading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      </div>

      {/* System & Database Architecture Card */}
      <div className="fintech-card p-6 space-y-4">
        <div className="flex items-center gap-2.5 mb-2">
          <Database className="w-4 h-4 text-white" />
          <h3 className="text-sm font-bold text-white">System Architecture & Database</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#141414] border border-[#242424]">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-fintech-green" />
              <span className="text-white font-medium">MongoDB Native Service</span>
            </div>
            <span className="font-mono text-[#737373]">port 27017 • Decimal128 Active</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#141414] border border-[#242424]">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-fintech-green" />
              <span className="text-white font-medium">Spring Boot REST API</span>
            </div>
            <span className="font-mono text-[#737373]">port 8080 • Java 17 • Spring Security 6</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#141414] border border-[#242424]">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-fintech-green" />
              <span className="text-white font-medium">Automated Recurring Scheduler</span>
            </div>
            <span className="font-mono text-[#737373]">@Scheduled Hourly & Daily Active</span>
          </div>
        </div>
      </div>

      {/* Security Info Card */}
      <div className="fintech-card p-6 space-y-4">
        <div className="flex items-center gap-2.5 mb-2">
          <Lock className="w-4 h-4 text-white" />
          <h3 className="text-sm font-bold text-white">Security & Cryptography</h3>
        </div>
        <p className="text-xs text-[#A3A3A3] leading-relaxed">
          Your account uses BCrypt password hashing and HMAC-SHA256 authenticated JSON Web Tokens. Financial amounts are calculated with strict IEEE 754-2008 Decimal128 representation, eliminating rounding errors.
        </p>
      </div>
    </div>
  );
};
