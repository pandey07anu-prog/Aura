import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, IndianRupee, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialToken = queryParams.get('token') || '';

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('A valid reset token is required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword,
        confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-between p-6 bg-radial-gradient">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#171717] border border-[#292929] flex items-center justify-center text-white">
            <IndianRupee className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-wider text-white">AURA FINANCE</span>
        </Link>
        <Link to="/login" className="text-xs text-[#A3A3A3] hover:text-white transition-colors">
          ← Back to Sign In
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto my-12">
        <div className="fintech-card p-8 shadow-2xl relative">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Set New Password</h1>
            <p className="text-xs text-[#737373] mt-1.5">
              Enter your reset token and choose a new secure password
            </p>
          </div>

          {success ? (
            <div className="p-6 rounded-2xl bg-[#171717] border border-[#292929] text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-fintech-greenSubtle border border-fintech-green/30 flex items-center justify-center text-fintech-green mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Password Updated</h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Your password has been changed successfully. Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-fintech-redSubtle border border-fintech-red/30 text-fintech-red text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
                  Reset Token
                </label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 mt-2"
              >
                {loading ? <span>Updating Password...</span> : <span>Update Password</span>}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="text-center text-xs font-mono text-[#525252]">
        AURA Finance • Secure Token Reset
      </div>
    </div>
  );
};
