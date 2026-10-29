import React, { useState, useEffect, useRef } from 'react';
import { IndianRupee, Volume2, VolumeX, Sparkles } from 'lucide-react';
import api from '../services/api';
import {
  unlockAudio,
  playCoinClink,
  playCoinCascade,
  playChaChing,
  playVaultActivation,
  toggleMute,
  getMuteState
} from '../utils/soundEffects';
import './Preloader.css';

/**
 * BLACK DIAMOND FINANCE — ULTRA-PREMIUM CINEMATIC PRELOADER
 *
 * Sequence:
 * 1. Dramatic Opening: Architectural light beam sweep across dark obsidian grid + concentric pulse rings.
 * 2. 3D Financial Emblem Assembly: Sculptural metallic ring, ascending vector facet, and coin core converge.
 * 3. Continuous 3D Gyroscope & Drifting Coins: Floating metallic discs and multi-axis orbital rings.
 * 4. Financial Light Trail: Luminous spline charting capital growth with sequential crest illumination.
 * 5. Precision Orbital Circular Progress: Circumferential arc around emblem with laser bead and tabular readout.
 * 6. Typography Shimmer: "EXPENSE TRACKER" with metallic specular sheen + "EVERY RUPEE. UNDER CONTROL."
 * 7. Anamorphic Lens Flare Exit: Horizontal expansion beam and cinematic shutter wipe into dashboard.
 */
export const Preloader = ({ onFinish }) => {
  // Sequence Timeline Phases: 'OPENING' | 'ASSEMBLY' | 'TRAIL' | 'TYPOGRAPHY' | 'READY' | 'EXIT'
  const [phase, setPhase] = useState('OPENING');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING ENCRYPTED VAULT');
  const [showExitFlare, setShowExitFlare] = useState(false);
  const [isExitTransitioning, setIsExitTransitioning] = useState(false);
  const [muted, setMuted] = useState(() => getMuteState());
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const handleInteraction = async () => {
    const success = await unlockAudio();
    if (success) {
      setAudioUnlocked(true);
      playChaChing();
    }
  };

  // App readiness coordination
  const isAppReadyRef = useRef(false);
  const completionTriggeredRef = useRef(false);

  // 1. Accessibility: Check prefers-reduced-motion immediately
  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        onFinish?.();
      }
    } catch (e) {
      // Graceful fallback
    }
  }, [onFinish]);

  // 2. Coordinate with genuine application & backend readiness
  useEffect(() => {
    let isMounted = true;

    const verifyReadiness = async () => {
      try {
        const storedToken = localStorage.getItem('aura_token');
        if (storedToken) {
          // Verify JWT session against backend if token exists
          await api.get('/auth/me', { timeout: 3500 });
        }
      } catch (err) {
        // Non-blocking fault tolerance: never strand the user
      } finally {
        if (isMounted) {
          isAppReadyRef.current = true;
        }
      }
    };

    verifyReadiness();

    // Absolute fallback: Ensure the transition completes even if server is cold
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        isAppReadyRef.current = true;
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
    };
  }, []);

  // 3. Orchestrate the cinematic timeline stages & procedural money sounds
  useEffect(() => {
    const timers = [];

    // Stage 1: Initial drifting coin clink (0.35s)
    timers.push(
      setTimeout(() => {
        playCoinClink({ pitch: 1.15, volume: 0.22 });
      }, 350)
    );

    // Stage 2: 3D Emblem & Coin Core Assembly + Cascading Coins (0.75s)
    timers.push(
      setTimeout(() => {
        setPhase('ASSEMBLY');
        setStatusText('ASSEMBLING SCULPTURAL EMBLEM');
        playCoinCascade();
      }, 750)
    );

    // Stage 3: Financial Light Trail draws across + Metallic growth chime (1.85s)
    timers.push(
      setTimeout(() => {
        setPhase('TRAIL');
        setStatusText('MAPPING CAPITAL ASCENT');
        playCoinClink({ pitch: 1.28, volume: 0.26 });
      }, 1850)
    );

    // Stage 4: Typography reveal & orbital progress active (2.65s)
    timers.push(
      setTimeout(() => {
        setPhase('TYPOGRAPHY');
        setStatusText('CALIBRATING PRECISION VAULT');
        playCoinClink({ pitch: 1.0, volume: 0.22 });
      }, 2650)
    );

    // First interaction listener to immediately unlock AudioContext if browser held it
    const handleFirstGesture = () => {
      playCoinClink({ pitch: 1.1, volume: 0.2 });
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

  // 4. Smooth percentage engine & Precision Orbital Progress Arc
  const CIRCLE_RADIUS = 75;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // ~471.2px

  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      // If nearing 90% and backend is still verifying, gracefully hold
      if (currentProgress >= 90 && !isAppReadyRef.current) {
        setStatusText('SYNCHRONIZING SECURE TENANT');
        return;
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setStatusText('SYSTEM SYNCHRONIZED');
        if (!completionTriggeredRef.current) {
          completionTriggeredRef.current = true;
          triggerExitTransition();
        }
        return;
      }

      // Smooth mathematical acceleration
      const delta = phase === 'TYPOGRAPHY' ? Math.max(1, (100 - currentProgress) / 5) : 3.5;
      currentProgress = Math.min(100, currentProgress + delta);
      setProgress(Math.round(currentProgress));
    }, 40);

    const triggerExitTransition = () => {
      // Trigger final wealth sound culmination
      playVaultActivation();
      playCoinCascade();

      // Trigger horizontal anamorphic lens flare
      setShowExitFlare(true);

      // Trigger cinematic shutter mask dissolve (380ms after flare)
      setTimeout(() => {
        setIsExitTransitioning(true);

        // Hand over cleanly to the dashboard / homepage (750ms after mask dissolve)
        setTimeout(() => {
          onFinish?.();
        }, 750);
      }, 380);
    };

    return () => {
      clearInterval(interval);
    };
  }, [phase, onFinish]);

  // Dynamic stroke-dashoffset calculation for the orbital progress arc
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE - (progress / 100) * CIRCLE_CIRCUMFERENCE;

  return (
    <div
      className={`black-diamond-overlay ${isExitTransitioning ? 'exit-transition' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Expense Tracker"
      onClick={handleInteraction}
      onPointerDown={handleInteraction}
    >
      {/* Audio Mute/Unmute Indicator & Toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          unlockAudio();
          const next = toggleMute();
          setMuted(next);
          if (!next) {
            playChaChing();
          }
        }}
        className="bd-audio-toggle"
        title={muted ? 'Enable Money Chimes' : 'Mute Sound'}
      >
        {muted ? (
          <>
            <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            <span>MUTED</span>
          </>
        ) : (
          <>
            <div className="bd-audio-wave">
              <span className="bd-audio-bar" />
              <span className="bd-audio-bar" />
              <span className="bd-audio-bar" />
            </div>
            <Volume2 className="w-3.5 h-3.5 text-white" />
            <span>{audioUnlocked ? 'AUDIO ACTIVE' : 'UNMUTE'}</span>
          </>
        )}
      </button>

      {/* Interactive Sound Activation Pill */}
      <div className="bd-audio-prompt-container">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleInteraction();
          }}
          className={`bd-audio-prompt-pill ${audioUnlocked ? 'unlocked' : 'pulse'}`}
        >
          {audioUnlocked ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-mono text-[11px] tracking-wider font-bold">
                COIN AUDIO ACTIVE • CLICK FOR CHIME
              </span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-white animate-bounce" />
              <span className="text-white font-mono text-[11px] tracking-wider font-semibold">
                TAP ANYWHERE FOR COIN SOUNDS 🔊
              </span>
            </>
          )}
        </button>
      </div>

      {/* Film Grain Texture */}
      <div className="bd-grain-texture" />

      {/* Architectural Precision Grid Lines */}
      <div className="bd-architectural-grid" />

      {/* Ambient Radial Vignette */}
      <div className="bd-ambient-vignette" />

      {/* Phase 1: Architectural Light Beam Sweep */}
      <div className="bd-opening-beam" />

      {/* Anamorphic Lens Flare at Exit */}
      {showExitFlare && <div className="bd-anamorphic-flare" />}

      {/* Concentric Expanding Pulse Rings (Opening Phase) */}
      <div className="concentric-rings-stage">
        <div className="concentric-ring ring-1" />
        <div className="concentric-ring ring-2" />
        <div className="concentric-ring ring-3" />
        <div className="concentric-ring ring-4" />
      </div>

      {/* Drifting Specular Coins (Layered 3D Depth) */}
      <div className="drifting-coins-field">
        <div className="drifting-coin coin-fg-1" />
        <div className="drifting-coin coin-mg-2" />
        <div className="drifting-coin coin-bg-3" />
        <div className="drifting-coin coin-bokeh-4" />
      </div>

      {/* Main 3D Choreography Stage */}
      <div className="bd-stage">
        {/* Core Luminous Particle during Opening */}
        {phase === 'OPENING' && <div className="bd-core-particle" />}

        {/* 3D Gyroscopic Orbital Rings */}
        <div className="orbital-gyro-system">
          <div className="gyro-ring-1" />
          <div className="gyro-ring-2" />
          <div className="gyro-ring-3" />
        </div>

        {/* Custom 3D Financial Emblem: "The Capital Ascent" */}
        {(phase === 'ASSEMBLY' || phase === 'TRAIL' || phase === 'TYPOGRAPHY') && (
          <div className="emblem-assembly-stage">
            {/* Precision Orbital Circular Progress Arc */}
            <div className="orbital-progress-container">
              <svg viewBox="0 0 170 170" className="orbital-progress-svg">
                <defs>
                  <linearGradient id="progressArcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                    <stop offset="60%" stopColor="#e4e4e7" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                  </linearGradient>
                </defs>
                {/* Background Ring Track */}
                <circle
                  cx="85"
                  cy="85"
                  r={CIRCLE_RADIUS}
                  className="orbital-progress-track"
                />
                {/* Luminous Active Progress Arc */}
                <circle
                  cx="85"
                  cy="85"
                  r={CIRCLE_RADIUS}
                  className="orbital-progress-fill"
                  style={{
                    strokeDasharray: CIRCLE_CIRCUMFERENCE,
                    strokeDashoffset: strokeDashoffset,
                  }}
                />
              </svg>
            </div>

            {/* Layer 1: Sculptural Metallic Ring */}
            <div className="emblem-layer-ring" />

            {/* Layer 2: Rising Geometric Vector Line ("The Ascent") */}
            <div className="emblem-layer-vector">
              <svg viewBox="0 0 80 80" className="ascent-vector-svg">
                <defs>
                  <linearGradient id="ascentGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                    <stop offset="45%" stopColor="#d4d4d8" stopOpacity="0.9" />
                    <stop offset="80%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#a1a1aa" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                {/* Stylized Ascending Arrow & Faceted Growth Line */}
                <path
                  d="M 18,58 L 38,38 L 50,46 L 68,22"
                  fill="none"
                  stroke="url(#ascentGrad)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="54,22 68,22 68,36"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Layer 3: Central Precision Coin Core with Indian Rupee */}
            <div className="emblem-layer-coin">
              <IndianRupee className="emblem-coin-rupee" strokeWidth={2.8} />
            </div>

            {/* Specular Fusion Burst Flash upon Assembly */}
            <div className="assembly-specular-flash" />
          </div>
        )}

        {/* Financial Light Trail Spline */}
        {(phase === 'TRAIL' || phase === 'TYPOGRAPHY') && (
          <div className="financial-trail-svg">
            <svg viewBox="0 0 480 140" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="financialTrailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                  <stop offset="35%" stopColor="#e4e4e7" stopOpacity="0.75" />
                  <stop offset="70%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.85" />
                </linearGradient>
              </defs>
              <path
                d="M 25,105 Q 85,105 135,50 T 235,80 T 335,30 T 415,60 T 465,18"
                className="trail-line-path"
              />
            </svg>

            {/* Illuminating Sequential Crest Nodes */}
            <div className="trail-crest-node" style={{ left: '28%', top: '35%', animationDelay: '0.4s' }} />
            <div className="trail-crest-node" style={{ left: '70%', top: '22%', animationDelay: '0.9s' }} />
            <div className="trail-crest-node" style={{ left: '97%', top: '13%', animationDelay: '1.4s' }} />
          </div>
        )}

        {/* Premium Typography & Status Readout */}
        {phase === 'TYPOGRAPHY' && (
          <div className="bd-typography-group">
            <h1 className="bd-brand-title">EXPENSE TRACKER</h1>
            <p className="bd-brand-tagline">EVERY RUPEE. UNDER CONTROL.</p>

            {/* Compact Metric Readout Bar */}
            <div className="bd-status-bar">
              <span className="bd-status-label">{statusText}</span>
              <span className="bd-status-value">
                {String(progress).padStart(2, '0')}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
