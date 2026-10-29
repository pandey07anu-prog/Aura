import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, IndianRupee } from 'lucide-react';

export const Navbar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#080808]/85 backdrop-blur-md border-b border-[#292929]/70 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#171717] border border-[#292929] flex items-center justify-center text-white group-hover:border-white/50 transition-colors">
            <IndianRupee className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-wider text-white font-sans flex items-center gap-1.5">
              AURA
              <span className="text-[10px] tracking-widest uppercase bg-white/10 text-[#A3A3A3] px-1.5 py-0.5 rounded font-mono">FINANCE</span>
            </span>
          </div>
        </Link>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white text-black font-semibold text-xs sm:text-sm hover:bg-white/90 transition-all flex items-center gap-1.5 sm:gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              <span>Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-[#A3A3A3] hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white text-black font-semibold text-xs sm:text-sm hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
