import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, IndianRupee, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit password reset request.');
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
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Reset Password</h1>
            <p className="text-xs text-[#737373] mt-1.5">
              Enter your email address to receive an expiring reset token
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-[#171717] border border-[#292929] text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-fintech-greenSubtle border border-fintech-green/30 flex items-center justify-center text-fintech-green mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Instructions Dispatched</h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                If an account exists with <span className="text-white font-mono">{email}</span>, a secure password reset link has been dispatched.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-block px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs"
                >
                  Return to Sign In
                </Link>
              </div>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 mt-2"
              >
                {loading ? <span>Sending...</span> : <span>Send Reset Instructions</span>}
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
