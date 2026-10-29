import React from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Footer = () => {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="bg-[#080808] border-t border-[#292929] pt-16 pb-12 text-[#A3A3A3]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Info */}
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#171717] border border-[#292929] flex items-center justify-center text-white">
                <IndianRupee className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold tracking-wider text-white">AURA FINANCE</span>
            </Link>
            <p className="text-sm leading-relaxed text-[#737373] mb-4">
              Precision personal finance platform designed for clarity, intelligent budgeting, and complete financial control.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#737373] font-mono">
              <Shield className="w-3.5 h-3.5 text-white/50" />
              <span>Enterprise-Grade Security & Privacy</span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-xs uppercase font-mono tracking-widest text-white mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to={isAuthenticated ? '/transactions' : '/login'} className="hover:text-white transition-colors">
                  Transaction Ledger
                </Link>
              </li>
              <li>
                <Link to={isAuthenticated ? '/categories' : '/login'} className="hover:text-white transition-colors">
                  Category Intelligence
                </Link>
              </li>
              <li>
                <Link to={isAuthenticated ? '/budgets' : '/login'} className="hover:text-white transition-colors">
                  Monthly Budgets
                </Link>
              </li>
              <li>
                <Link to={isAuthenticated ? '/recurring' : '/login'} className="hover:text-white transition-colors">
                  Recurring Engine
                </Link>
              </li>
              <li>
                <Link to={isAuthenticated ? '/reports' : '/login'} className="hover:text-white transition-colors">
                  Analytical Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Access */}
          <div>
            <h4 className="text-xs uppercase font-mono tracking-widest text-white mb-4">Direct Access</h4>
            <div className="flex flex-col gap-3 max-w-xs">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-4 py-2.5 rounded-xl bg-white text-black text-xs font-semibold text-center hover:bg-white/90 transition-all shadow-sm"
                  >
                    Open Dashboard
                  </Link>
                  <Link
                    to="/transactions"
                    className="px-4 py-2.5 rounded-xl bg-[#171717] border border-[#292929] hover:border-white/50 text-white text-xs font-mono text-center transition-all"
                  >
                    Transaction Ledger
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2.5 rounded-xl bg-[#171717] border border-[#292929] hover:border-white/50 text-white text-xs font-mono text-center transition-all"
                  >
                    Sign In to Portal
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2.5 rounded-xl bg-white text-black text-xs font-semibold text-center hover:bg-white/90 transition-all shadow-sm"
                  >
                    Create Free Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#292929]/50 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[#525252]">
          <p>© {new Date().getFullYear()} AURA Finance. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
