// Web Audio API engine for realistic wheel ticks, applause, clicks, and speech
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play mechanical wheel click/tick
export function playTickSound(volume = 50) {
  if (volume <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const gainNode = ctx.createGain();
    const gainVal = Math.min(Math.max(volume / 100, 0), 1) * 0.4;
    gainNode.gain.setValueAtTime(gainVal, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600 + Math.random() * 200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

// Play click sound on remove
export function playClickSound(volume = 50) {
  if (volume <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const gainNode = ctx.createGain();
    const gainVal = Math.min(Math.max(volume / 100, 0), 1) * 0.5;
    gainNode.gain.setValueAtTime(gainVal, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.06);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  } catch (e) {}
}

// Play applause / victory sound
let applauseOscs = [];
export function playApplauseSound(volume = 50, type = 'Subdued applause') {
  if (volume <= 0) return;
  stopApplauseSound();

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    const gainVal = Math.min(Math.max(volume / 100, 0), 1) * 0.35;
    masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + 0.3);
    masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.2);
    masterGain.connect(ctx.destination);

    // Generate textured cheer/applause noise bursts
    const bufferSize = ctx.sampleRate * 3.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 2.5));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter to simulate cheering/clapping resonance
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = type === 'Cheering' ? 1200 : 850;
    filter.Q.value = 1.2;

    noise.connect(filter);
    filter.connect(masterGain);

    noise.start();
    applauseOscs.push(noise);

    // Additional harmonic chime if fanfare
    if (type === 'Fanfare') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.setValueAtTime(gainVal * 0.25, ctx.currentTime + i * 0.15);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 1.2);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 1.2);
        applauseOscs.push(osc);
      });
    }
  } catch (e) {}
}

export function stopApplauseSound() {
  applauseOscs.forEach(node => {
    try { node.stop(); } catch(e) {}
  });
  applauseOscs = [];
}

// Preview loop timer
let previewTimer = null;

export function startSoundPreview(soundName, volume) {
  stopSoundPreview();
  if (soundName === 'Ticking sound') {
    playTickSound(volume);
    previewTimer = setInterval(() => {
      playTickSound(volume);
    }, 180);
  } else {
    playApplauseSound(volume, soundName);
  }
}

export function stopSoundPreview() {
  if (previewTimer) {
    clearInterval(previewTimer);
    previewTimer = null;
  }
  stopApplauseSound();
}

// Text-to-speech for 'Read out the name'
export function speakName(name, volume = 50) {
  if (!window.speechSynthesis || volume <= 0) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(name);
    utterance.volume = Math.min(Math.max(volume / 100, 0), 1);
    window.speechSynthesis.speak(utterance);
  } catch (e) {}
}
