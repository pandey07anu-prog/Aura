import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowRight, IndianRupee } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      if (user.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Server is warming up from inactivity. Please wait 10 seconds and try again.');
      } else {
        const msg = err.response?.data?.message || err.message || 'Invalid credentials. Please try again.';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-between p-6 bg-radial-gradient">
      {/* Top Brand Link */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#171717] border border-[#292929] flex items-center justify-center text-white">
            <IndianRupee className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-wider text-white">AURA FINANCE</span>
        </Link>
        <Link to="/" className="text-xs text-[#A3A3A3] hover:text-white transition-colors">
          ← Return to Home
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-12">
        <div className="fintech-card p-8 shadow-2xl relative">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Sign In</h1>
            <p className="text-xs text-[#737373] mt-1.5">
              Access your personal ledger and financial analytics
            </p>
          </div>

          {/* Session Expired Banner */}
          {isExpired && (
            <div className="mb-6 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#A3A3A3] text-center">
              Your authentication session has expired. Please sign in again.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-fintech-redSubtle border border-fintech-red/30 text-fintech-red text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase text-[#A3A3A3]">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[11px] text-[#A3A3A3] hover:text-white transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-xs text-[#737373]">
            Don't have an account?{' '}
            <Link to="/register" className="text-white font-semibold hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="text-center text-xs font-mono text-[#525252]">
        AURA Finance • 256-bit BCrypt + JWT Secure
      </div>
    </div>
  );
};
