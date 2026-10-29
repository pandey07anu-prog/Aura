/**
 * AURA FINANCE — LUXURY FINTECH WEB AUDIO ENGINE
 * High-definition procedural synthesis for minted currency, coin clinks,
 * cash register cha-chings, and vault activation chimes.
 */

let audioCtx = null;
let isMuted = false;
let isUnlocked = false;

export function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

/**
 * Call on any user gesture (click / touch / keydown) to unlock browser audio
 */
export async function unlockAudio() {
  const ctx = getAudioContext();
  if (!ctx) return false;

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    isUnlocked = true;
    return true;
  } catch (err) {
    console.warn('Audio unlock notice:', err);
    return false;
  }
}

export function isAudioReady() {
  return audioCtx && audioCtx.state === 'running';
}

/**
 * Synthesizes a loud, crisp minted gold/silver coin clink.
 */
export function playCoinClink(options = {}) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Auto-resume if suspended
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const pitch = options.pitch || 1.0;
  const volume = options.volume ?? 0.75; // Rich, prominent volume

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, now);
  masterGain.connect(ctx.destination);

  // Metallic Resonant Frequencies of dense minted coins
  const frequencies = [
    2450 * pitch, // Primary metallic ring
    3950 * pitch, // Secondary overtone
    5420 * pitch, // High shimmer
    1680 * pitch  // Sub-body tone
  ];

  frequencies.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = idx === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.99, now + 0.1);

    const decay = idx === 0 ? 0.65 : idx === 1 ? 0.45 : 0.3;
    gain.gain.setValueAtTime(idx === 0 ? 0.8 : 0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + decay);
  });

  // Metallic Impact Noise Click
  try {
    const bufferSize = Math.floor(ctx.sampleRate * 0.015);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(4500, now);
    filter.Q.setValueAtTime(3.0, now);

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.6, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    noise.connect(filter);
    filter.connect(clickGain);
    clickGain.connect(masterGain);

    noise.start(now);
  } catch (e) {
    // Graceful fallback
  }
}

/**
 * Classic Fintech "Cha-Ching" Cash / Currency Sound
 */
export function playChaChing() {
  if (isMuted) return;

  // First metallic ring
  playCoinClink({ pitch: 0.95, volume: 0.8 });

  // Second higher register chime 110ms later
  setTimeout(() => {
    playCoinClink({ pitch: 1.35, volume: 0.85 });
  }, 110);
}

/**
 * Multiple Coins Cascading together (coin drop / clatter)
 */
export function playCoinCascade() {
  if (isMuted) return;

  const drops = [
    { delay: 0, pitch: 1.05, volume: 0.7 },
    { delay: 80, pitch: 1.25, volume: 0.75 },
    { delay: 170, pitch: 0.92, volume: 0.8 },
    { delay: 270, pitch: 1.38, volume: 0.75 },
    { delay: 390, pitch: 1.15, volume: 0.85 },
  ];

  drops.forEach(({ delay, pitch, volume }) => {
    setTimeout(() => {
      playCoinClink({ pitch, volume });
    }, delay);
  });
}

/**
 * Vault Activation Shimmer — ambient harmonic bell chord
 */
export function playVaultActivation() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.5, now);
  master.connect(ctx.destination);

  const notes = [554.37, 659.25, 880.0, 1108.73, 1318.51];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.05);

    gain.gain.setValueAtTime(0.001, now + i * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.4, now + i * 0.05 + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 1.2);

    osc.connect(gain);
    gain.connect(master);

    osc.start(now + i * 0.05);
    osc.stop(now + i * 0.05 + 1.25);
  });
}

export function toggleMute() {
  isMuted = !isMuted;
  return isMuted;
}

export function getMuteState() {
  return isMuted;
}
