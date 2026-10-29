import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  IndianRupee
} from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password strength calculation
  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = calculateStrength(password);
  const getStrengthLabel = () => {
    if (strengthScore <= 1) return { label: 'Weak', color: 'bg-fintech-red', text: 'text-fintech-red' };
    if (strengthScore <= 3) return { label: 'Medium', color: 'bg-amber-400', text: 'text-amber-400' };
    return { label: 'Strong', color: 'bg-fintech-green', text: 'text-fintech-green' };
  };
  const strengthInfo = getStrengthLabel();

  // Handle Form Submission -> Direct Registration
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(fullName, email, password, confirmPassword);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Server is establishing connection. Please try again in a few moments.');
      } else if (err.response?.status === 409 || err.message?.toLowerCase().includes('already exists')) {
        setError('An account with this email address already exists. Please sign in below.');
      } else {
        const msg = err.response?.data?.message || err.message || 'Registration failed. Please check inputs.';
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

      {/* Main Container */}
      <div className="max-w-md w-full mx-auto my-10">
        <div className="fintech-card p-8 shadow-2xl relative">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h1>
            <p className="text-xs text-[#737373] mt-1.5">
              Establish your private financial ledger on AURA
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-fintech-redSubtle border border-fintech-red/30 text-fintech-red text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111111] border border-[#292929] text-white text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Email */}
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111111] border border-[#292929] text-white text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono uppercase text-[#A3A3A3]">
                  Password
                </label>
                {password && (
                  <span className={`text-[10px] font-mono ${strengthInfo.text}`}>
                    {strengthInfo.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#111111] border border-[#292929] text-white text-sm focus:outline-none focus:border-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength Meter Bar */}
              {password && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        level <= strengthScore ? strengthInfo.color : 'bg-[#262626]'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#A3A3A3] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111111] border border-[#292929] text-white text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span>Establishing Ledger...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-xs text-[#737373]">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="text-center text-xs font-mono text-[#525252]">
        AURA Finance • Zero Advertising • End-to-End Tenancy
      </div>
    </div>
  );
};

export default RegisterPage;
