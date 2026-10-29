import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  TrendingUp,
  Shield,
  PieChart,
  Repeat,
  FileSpreadsheet,
  Lock,
  ArrowUpRight,
  Layers,
  CheckCircle2,
  IndianRupee,
  AlertTriangle,
  Sparkles,
  CreditCard,
  Activity,
  Cpu,
  Wifi
} from 'lucide-react';
import { motion } from 'framer-motion';
import './LandingPage.css';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  // 3D Interactive Parallax Mouse State
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x, y });
  };

  const dynamicChassisTilt = isHovered
    ? {
        transform: `perspective(1400px) rotateX(${9 - mouseOffset.y * 22}deg) rotateY(${-5 + mouseOffset.x * 24}deg) translateZ(15px)`,
      }
    : {
        transform: `perspective(1400px) rotateX(10deg) rotateY(-5deg) rotateZ(0.8deg)`,
      };

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-white selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section
        onMouseMove={handleHeroMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setMouseOffset({ x: 0, y: 0 });
        }}
        className="relative pt-36 pb-32 overflow-hidden bg-radial-gradient"
      >
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

        {/* Volumetric Top Spotlight Cones */}
        <div className="volumetric-spotlight" />

        {/* 3D Horizon Scanning Grid Floor */}
        <div className="horizon-grid-viewport">
          <div className="horizon-grid-mesh" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* 3D Illuminated Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="animated-glow-badge mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-mono uppercase tracking-widest text-white/90">
                AURA 3D FINANCIAL OS • PRECISION LEDGER
              </span>
            </motion.div>

            {/* Headline with 3D Metallic Gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-[#71717A] leading-[1.08] mb-6"
            >
              Take Control of Your Wealth.
            </motion.h1>

            {/* One-Liner Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-[#A3A3A3] max-w-2xl mx-auto mb-8 font-normal leading-relaxed"
            >
              Institutional-grade ledger tracking, automated category guardrails, and real-time wealth analytics inside an uncompromising 3D workspace.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            >
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_35px_rgba(255,255,255,0.28)] hover:scale-[1.02]"
              >
                <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started Free'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <Link
                to={isAuthenticated ? '/dashboard' : '/login'}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#141416]/90 border border-white/20 text-white font-semibold text-sm hover:border-white/50 hover:bg-[#1a1a1f] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Explore Live Platform</span>
                <ArrowUpRight className="w-4 h-4 text-[#A3A3A3]" />
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-[#737373]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-white/70" />
                <span>100% Private & Encrypted</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-white/70" />
                <span>Bank-Grade Security</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-white/70" />
                <span>Real-Time Analytics</span>
              </span>
            </div>
          </div>

          {/* 3D Isometric Interactive Showcase Stage */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 relative max-w-5xl mx-auto hero-3d-stage"
          >
            {/* Ambient Back Glow */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-b from-white/12 via-transparent to-transparent blur-2xl pointer-events-none" />

            {/* Main 3D Dashboard Chassis */}
            <div
              className="dashboard-3d-chassis p-6 sm:p-8 relative"
              style={dynamicChassisTilt}
            >
              {/* Floating 3D "Titanium Obsidian" Card */}
              <div className="hidden lg:flex titanium-card-3d">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#27272a] border border-white/30 flex items-center justify-center text-white">
                      <IndianRupee className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-white/90 font-bold">AURA TITANIUM</span>
                  </div>
                  <Wifi className="w-4 h-4 text-white/60 rotate-90" />
                </div>

                <div className="flex items-center gap-3 my-auto">
                  <div className="emv-chip" />
                  <span className="text-xs font-mono tracking-wider text-white/75">CONTACTLESS LEDGER</span>
                </div>

                <div>
                  <div className="font-mono text-sm tracking-[0.22em] text-white font-semibold drop-shadow-sm">
                    •••• •••• •••• 9240
                  </div>
                  <div className="flex justify-between items-end mt-2 text-[9px] font-mono text-[#a1a1aa] uppercase tracking-wider">
                    <span>Valued Ledger Member</span>
                    <span>10 / 30</span>
                  </div>
                </div>
              </div>

              {/* Floating 3D Wire Influx Badge (Top Left) */}
              <div className="hidden lg:flex floating-widget-left">
                <div className="w-10 h-10 rounded-xl bg-fintech-greenSubtle border border-fintech-green/40 flex items-center justify-center text-fintech-green font-bold text-sm shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                  ₹
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Client Wire Influx</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-fintech-green animate-pulse" />
                  </div>
                  <div className="text-[12px] font-mono text-fintech-green font-bold">
                    +₹1,25,000.00 • Active Inflow
                  </div>
                </div>
              </div>

              {/* Floating 3D Budget Guardrail Pill (Bottom Right) */}
              <div className="hidden lg:flex floating-widget-right">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Budget Guardrail Active</div>
                  <div className="text-[11px] font-mono text-[#A3A3A3]">
                    ₹24,800 Remaining • 82% Safe
                  </div>
                </div>
              </div>

              {/* Floating 3D Gyroscopic Rupee Coin */}
              <div className="hidden xl:block gyro-coin-stage">
                <div className="gyro-coin-disc">
                  <IndianRupee className="w-6 h-6 text-white" strokeWidth={2.8} />
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center justify-between pb-6 border-b border-[#242424] mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/20 border border-white/30" />
                  <div className="w-3 h-3 rounded-full bg-white/20 border border-white/30" />
                  <div className="w-3 h-3 rounded-full bg-white/20 border border-white/30" />
                  <span className="ml-3 text-xs font-mono text-[#737373]">aura-finance.vault/overview</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-[#18181b] border border-white/15 text-[10px] font-mono text-white/90 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-fintech-green animate-pulse" />
                  <span>MONGODB ATLAS CLUSTER • ENCRYPTED</span>
                </div>
              </div>

              {/* Sample Metrics Mock Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-[#141417] border border-white/10 shadow-sm">
                  <div className="text-[10px] uppercase font-mono text-[#737373] mb-1">Total Income</div>
                  <div className="text-xl font-bold font-mono text-white">₹1,25,000.00</div>
                  <div className="text-[10px] font-mono text-fintech-green mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +14.2% vs last mo
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#141417] border border-white/10 shadow-sm">
                  <div className="text-[10px] uppercase font-mono text-[#737373] mb-1">Total Expenses</div>
                  <div className="text-xl font-bold font-mono text-white">₹38,200.00</div>
                  <div className="text-[10px] font-mono text-[#737373] mt-1">-4.8% vs last mo</div>
                </div>
                <div className="p-4 rounded-xl bg-[#141417] border border-white/10 shadow-sm">
                  <div className="text-[10px] uppercase font-mono text-[#737373] mb-1">Net Cash Flow</div>
                  <div className="text-xl font-bold font-mono text-white">₹86,800.00</div>
                  <div className="text-[10px] font-mono text-white/70 mt-1">69.4% savings rate</div>
                </div>
                <div className="p-4 rounded-xl bg-[#141417] border border-white/10 shadow-sm">
                  <div className="text-[10px] uppercase font-mono text-[#737373] mb-1">Remaining Budget</div>
                  <div className="text-xl font-bold font-mono text-white">₹11,800.00</div>
                  <div className="text-[10px] font-mono text-fintech-green mt-1">Within safe limits</div>
                </div>
              </div>

              {/* 3D Wave Interactive Spline Area Chart */}
              <div className="h-44 bg-[#111114] border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#737373] mb-2">
                  <span>6-MONTH CASHFLOW CONVERGENCE</span>
                  <span className="text-white/80 font-bold">● Income vs ■ Spending</span>
                </div>
                <div className="flex-1 flex items-end justify-between gap-3">
                  {[
                    { label: 'May', inc: 70, exp: 35 },
                    { label: 'Jun', inc: 85, exp: 40 },
                    { label: 'Jul', inc: 65, exp: 45 },
                    { label: 'Aug', inc: 95, exp: 50 },
                    { label: 'Sep', inc: 90, exp: 38 },
                    { label: 'Oct', inc: 100, exp: 32 },
                  ].map((col, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1.5 h-28">
                        <div
                          className="w-1/2 bg-white rounded-t transition-all group-hover:bg-white/90 group-hover:scale-y-105 origin-bottom shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                          style={{ height: `${col.inc}%` }}
                        />
                        <div
                          className="w-1/2 bg-[#2d2d32] rounded-t transition-all group-hover:bg-[#3f3f46] group-hover:scale-y-105 origin-bottom"
                          style={{ height: `${col.exp}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-[#737373] group-hover:text-white transition-colors">
                        {col.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Overview in 3D */}
      <section id="features" className="py-24 border-t border-[#292929] bg-[#0c0c0c] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#737373]">Engineered for Control</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4 tracking-tight">
              A Complete Financial Operating System
            </h2>
            <p className="text-sm text-[#A3A3A3] leading-relaxed">
              Every tool you need to track, budget, automate, and analyze your wealth with zero fluff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="feature-card-3d p-8 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#1b1b20] border border-white/20 flex items-center justify-center text-white mb-6 shadow-sm">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">High-Precision Ledger</h3>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  Store exact monetary amounts with Decimal128 precision. Avoid floating-point truncation errors forever.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="feature-card-3d p-8 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#1b1b20] border border-white/20 flex items-center justify-center text-white mb-6 shadow-sm">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Smart Category Reassignment</h3>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  Delete custom categories safely. Reassign referencing transactions automatically or archive categories to preserve history.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="feature-card-3d p-8 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#1b1b20] border border-white/20 flex items-center justify-center text-white mb-6 shadow-sm">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Threshold Budget Alerts</h3>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  Set monthly caps per category. Get immediate in-app and email notifications before you overspend.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="feature-card-3d p-8 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#1b1b20] border border-white/20 flex items-center justify-center text-white mb-6 shadow-sm">
                <Repeat className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Scheduled Automation</h3>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  Define weekly, monthly, or yearly rules. The Spring scheduler executes due transactions with duplicate prevention.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="feature-card-3d p-8 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#1b1b20] border border-white/20 flex items-center justify-center text-white mb-6 shadow-sm">
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">RFC4180 CSV Export</h3>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  Export your complete transaction history or custom date ranges directly into CSV format for tax and accounting.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="feature-card-3d p-8 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#1b1b20] border border-white/20 flex items-center justify-center text-white mb-6 shadow-sm">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Private Tenancy & Access Control</h3>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  Your financial ledger is strictly private and encrypted. Protected with role-based access controls and audit security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 border-t border-[#292929] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#737373]">Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4 tracking-tight">
              Three Steps to Complete Financial Clarity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#111111] border border-[#292929] feature-card-3d">
              <div className="text-2xl font-mono font-bold text-white/30 mb-4">01</div>
              <h3 className="text-lg font-bold text-white mb-2">Create Account & Ledger</h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Sign up in seconds. Your account comes pre-seeded with 16 system income and expense categories.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#111111] border border-[#292929] feature-card-3d">
              <div className="text-2xl font-mono font-bold text-white/30 mb-4">02</div>
              <h3 className="text-lg font-bold text-white mb-2">Track & Set Budgets</h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Log daily transactions or schedule recurring rules. Set category spending limits with custom threshold warnings.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#111111] border border-[#292929] feature-card-3d">
              <div className="text-2xl font-mono font-bold text-white/30 mb-4">03</div>
              <h3 className="text-lg font-bold text-white mb-2">Review Insights & Export</h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Inspect 6-month trends, category breakdown charts, and export compliant CSV reports whenever you need them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Budgeting & Threshold Alerts Showcase Section */}
      <section id="budgeting" className="py-24 border-t border-[#292929] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#737373]">Budget Intelligence</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4 tracking-tight">
              Category Budgets & Real-Time Warning Thresholds
            </h2>
            <p className="text-sm text-[#A3A3A3] leading-relaxed">
              Define monthly spending caps for each expense category. Get visual and notification alerts before you overspend.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            {/* Budget Card 1 - Normal */}
            <div className="feature-card-3d p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#737373]">Groceries & Dining</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-fintech-greenSubtle text-fintech-green border border-fintech-green/30">
                    SAFE (58%)
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-white mb-1">₹14,500.00</div>
                <p className="text-xs text-[#737373] mb-4">of ₹25,000.00 monthly limit</p>
                <div className="w-full h-2 rounded-full bg-[#222222] overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all" style={{ width: '58%' }} />
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#222222] text-[11px] font-mono text-[#525252] flex justify-between">
                <span>Threshold: 80%</span>
                <span>₹10,500.00 remaining</span>
              </div>
            </div>

            {/* Budget Card 2 - Warning */}
            <div className="feature-card-3d p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#737373]">Shopping & Apparel</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> WARNING (86%)
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-white mb-1">₹17,200.00</div>
                <p className="text-xs text-[#737373] mb-4">of ₹20,000.00 monthly limit</p>
                <div className="w-full h-2 rounded-full bg-[#222222] overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: '86%' }} />
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#222222] text-[11px] font-mono text-yellow-400/80 flex justify-between">
                <span>Alert Triggered</span>
                <span>₹2,800.00 remaining</span>
              </div>
            </div>

            {/* Budget Card 3 - Target */}
            <div className="feature-card-3d p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#737373]">Housing & Utilities</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-fintech-greenSubtle text-fintech-green border border-fintech-green/30">
                    SAFE (70%)
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-white mb-1">₹35,000.00</div>
                <p className="text-xs text-[#737373] mb-4">of ₹50,000.00 monthly limit</p>
                <div className="w-full h-2 rounded-full bg-[#222222] overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all" style={{ width: '70%' }} />
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#222222] text-[11px] font-mono text-[#525252] flex justify-between">
                <span>Threshold: 85%</span>
                <span>₹15,000.00 remaining</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              to={isAuthenticated ? '/budgets' : '/register'}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all shadow-sm"
            >
              <span>{isAuthenticated ? 'Manage Your Budgets' : 'Start Budgeting in AURA'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 border-t border-[#292929] bg-[#0c0c0c]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#171717] border border-[#2e2e2e] flex items-center justify-center text-white mx-auto mb-6">
            <Lock className="w-6 h-6" />
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#737373]">Data Integrity & Privacy</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-4 tracking-tight">
            Built with Zero Compromise
          </h2>
          <p className="text-sm text-[#A3A3A3] leading-relaxed max-w-2xl mx-auto mb-10">
            AURA Finance never sells user data, never uses external analytics trackers, and enforces zero-knowledge privacy and strict cryptographic protection on every transaction.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-5 rounded-xl bg-[#141414] border border-[#262626] feature-card-3d">
              <div className="flex items-center gap-2 text-white text-xs font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>BCrypt Password Hashing</span>
              </div>
              <p className="text-[11px] text-[#737373]">Passwords are never stored in plain text or visible in logs.</p>
            </div>
            <div className="p-5 rounded-xl bg-[#141414] border border-[#262626] feature-card-3d">
              <div className="flex items-center gap-2 text-white text-xs font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Stateless 256-bit JWTs</span>
              </div>
              <p className="text-[11px] text-[#737373]">Cryptographically verified bearer tokens with 24-hour expiration.</p>
            </div>
            <div className="p-5 rounded-xl bg-[#141414] border border-[#262626] feature-card-3d">
              <div className="flex items-center gap-2 text-white text-xs font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Admin Audit Logging</span>
              </div>
              <p className="text-[11px] text-[#737373]">Sensitive administrative actions are logged with timestamp and IP.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 border-t border-[#292929] bg-[#080808] relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-6">
            Ready to Take Control of Your Money?
          </h2>
          <p className="text-sm sm:text-base text-[#A3A3A3] max-w-xl mx-auto mb-8">
            Experience the luxury of complete financial clarity with AURA Finance today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)]"
            >
              {isAuthenticated ? 'Open Dashboard' : 'Create Your Free Account'}
            </Link>
            <Link
              to={isAuthenticated ? '/transactions' : '/login'}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#171717] border border-[#2e2e2e] text-white font-semibold text-sm hover:border-white/50 transition-all"
            >
              {isAuthenticated ? 'View Transaction Ledger' : 'Sign In to Existing Ledger'}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
