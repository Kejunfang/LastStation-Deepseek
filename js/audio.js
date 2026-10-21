/* ==========================================================
   LIGHTHOUSE — audio
   Streaming BGM with crossfade + synthesised SFX and ambience.
   ========================================================== */
(function (global) {
  'use strict';

  const TRACKS = {
    title: 'title_theme.mp3',
    town: 'town_day.mp3',
    akari: 'mio_theme.mp3',
    mystery: 'mystery_theme.mp3',
    festival: 'festival_theme.mp3',
    farewell: 'farewell_theme.mp3',
    true: 'true_end_theme.mp3',
    piano: '如果可以 (Piano Solo) - SLSMusic (128k).mp3'
  };

  let unlocked = false;
  let ac = null;
  let sfxBus = null, ambBus = null, staticBus = null;
  let noiseBuf = null;
  let ambNodes = null, ambName = null, staticNode = null, staticGain = null;
  let pendingTrack = null;
  let currentName = null;

  const players = [];
  let activeIdx = 0;

  function makePlayer() {
    const a = document.createElement('audio');
    a.loop = true;
    a.preload = 'auto';
    a.crossOrigin = 'anonymous';
    a.volume = 0;
    a._fade = 0;
    a.style.display = 'none';
    if (document.body) document.body.appendChild(a);
    players.push(a);
    return a;
  }

  function init() {
    if (players.length === 0) {
      makePlayer();
      makePlayer();
      players[0].addEventListener('error', () => {});
      players[1].addEventListener('error', () => {});
    }
  }

  function ensureContext() {
    if (ac) return ac;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ac = new Ctx();
    sfxBus = ac.createGain();
    sfxBus.gain.value = Save.settings.sfx;
    sfxBus.connect(ac.destination);
    ambBus = ac.createGain();
    ambBus.gain.value = 0;
    ambBus.connect(ac.destination);
    // noise buffer
    const len = ac.sampleRate * 2;
    noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return ac;
  }

  function unlock() {
    init();
    const was = unlocked;
    unlocked = true;
    ensureContext();
    if (ac && ac.state === 'suspended') ac.resume();
    if (!was && pendingTrack) {
      const t = pendingTrack;
      pendingTrack = null;
      playMusic(t, 1.6);
    } else if (!was && currentName && players[activeIdx].paused) {
      playMusic(currentName, 0.8);
    }
  }

  function setElVolume(el) {
    const base = Save.settings.bgm;
    el.volume = U.clamp(base * el._fade, 0, 1);
  }

  function fadeTo(el, target, ms, onDone) {
    if (el._raf) cancelAnimationFrame(el._raf);
    const from = el._fade;
    const t0 = performance.now();
    const step = (now) => {
      const p = U.clamp((now - t0) / ms, 0, 1);
      el._fade = from + (target - from) * p;
      setElVolume(el);
      if (p < 1) el._raf = requestAnimationFrame(step);
      else { el._raf = null; if (onDone) onDone(); }
    };
    el._raf = requestAnimationFrame(step);
  }

  function playMusic(name, fade) {
    init();
    if (!TRACKS[name]) return;
    if (name === currentName && players[activeIdx] && !players[activeIdx].paused) {
      if (!unlocked) pendingTrack = name;
      return;
    }
    currentName = name;
    if (!unlocked) { pendingTrack = name; return; }
    const oldEl = players[activeIdx];
    const newIdx = 1 - activeIdx;
    const newEl = players[newIdx];
    activeIdx = newIdx;

    // stop any old fade
    if (newEl._raf) { cancelAnimationFrame(newEl._raf); newEl._raf = null; }
    if (oldEl._raf) { cancelAnimationFrame(oldEl._raf); oldEl._raf = null; }

    const src = 'assets/music/' + encodeURI(TRACKS[name]);
    if (!newEl.src.endsWith(encodeURI(TRACKS[name]))) {
      newEl.src = src;
    }
    newEl._fade = 0;
    setElVolume(newEl);
    const p = newEl.play();
    if (p && p.catch) p.catch(() => {});
    fadeTo(newEl, 1, (fade || 1.4) * 1000);

    if (!oldEl.paused) {
      const startFade = oldEl._fade || 1;
      oldEl._fade = startFade;
      fadeTo(oldEl, 0, (fade || 1.4) * 1000, () => { oldEl.pause(); });
    }
  }

  function stopMusic(fade) {
    currentName = null;
    pendingTrack = null;
    const el = players[activeIdx];
    if (!el) return;
    fadeTo(el, 0, (fade || 1.0) * 1000, () => { el.pause(); });
  }

  function setVolumes() {
    players.forEach(setElVolume);
    if (sfxBus) sfxBus.gain.value = Save.settings.sfx;
    if (ambBus) ambBus.gain.value = Save.settings.sfx * 0.32;
    if (staticGain) staticGain.gain.setTargetAtTime(0.05 * Save.settings.sfx, now(), 0.1);
  }

  /* ---------------------------------------------------------
     SFX
     --------------------------------------------------------- */
  function now() { return ac ? ac.currentTime : 0; }

  function env(gainNode, peak, attack, decay, at) {
    const t = at || now();
    const g = gainNode.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(0.0001, t);
    g.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
    g.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }

  function tone(freq, type, peak, attack, decay, detune) {
    if (!ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    if (detune) o.detune.value = detune;
    o.connect(g); g.connect(sfxBus);
    env(g, peak, attack, decay);
    o.start();
    o.stop(now() + attack + decay + 0.05);
  }

  function noise(dur, filterType, freq, q, peak, attack) {
    if (!ac || !noiseBuf) return;
    const src = ac.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = ac.createBiquadFilter();
    f.type = filterType;
    f.frequency.value = freq;
    f.Q.value = q || 0.7;
    const g = ac.createGain();
    src.connect(f); f.connect(g); g.connect(sfxBus);
    env(g, peak, attack || 0.005, dur);
    src.start();
    src.stop(now() + (attack || 0.005) + dur + 0.1);
  }

  const sfx = {
    click() { if (!ac) return; noise(0.04, 'bandpass', 1800, 1.2, 0.10, 0.002); },
    select() { if (!ac) return; tone(660, 'sine', 0.06, 0.004, 0.16); tone(990, 'sine', 0.03, 0.02, 0.2); },
    page() { if (!ac) return; noise(0.12, 'highpass', 2200, 0.7, 0.05, 0.004); },
    chime() {
      if (!ac) return;
      tone(1174, 'sine', 0.06, 0.008, 1.3);
      tone(1760, 'sine', 0.035, 0.01, 1.0);
      tone(2349, 'sine', 0.02, 0.02, 0.8);
    },
    fragment() {
      if (!ac) return;
      [523, 659, 784, 1046].forEach((f, i) => {
        setTimeout(() => tone(f, 'sine', 0.05, 0.01, 1.2), i * 90);
      });
    },
    bell() {
      if (!ac) return;
      tone(392, 'sine', 0.09, 0.01, 2.4);
      tone(587, 'sine', 0.04, 0.01, 2.0);
      tone(784, 'sine', 0.02, 0.02, 1.6);
    },
    splash() { if (!ac) return; noise(0.5, 'bandpass', 900, 0.8, 0.16, 0.01); },
    wave() { if (!ac) return; noise(1.4, 'lowpass', 600, 0.5, 0.09, 0.25); },
    thunder() {
      if (!ac) return;
      noise(2.6, 'lowpass', 120, 0.6, 0.4, 0.04);
      setTimeout(() => noise(1.8, 'lowpass', 80, 0.6, 0.28, 0.1), 120);
    },
    heartbeat() {
      if (!ac) return;
      tone(58, 'sine', 0.18, 0.01, 0.22);
      setTimeout(() => tone(52, 'sine', 0.12, 0.01, 0.2), 240);
    },
    radio() { if (!ac) return; noise(0.3, 'bandpass', 1400, 3, 0.06, 0.005); },
    error() { if (!ac) return; tone(180, 'square', 0.03, 0.005, 0.18); }
  };

  function playSfx(name) {
    if (!unlocked) return;
    ensureContext();
    if (ac && ac.state === 'suspended') ac.resume();
    const fn = sfx[name];
    if (fn) fn();
  }

  /* ---------------------------------------------------------
     Ambience (sea / rain)
     --------------------------------------------------------- */
  function stopAmbience(fade) {
    if (!ac || !ambNodes) return;
    const t = now();
    const g = ambNodes.g.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.exponentialRampToValueAtTime(0.0001, t + (fade || 1.2));
    const nodes = ambNodes;
    setTimeout(() => {
      try { nodes.src.stop(); } catch (e) {}
      try { nodes.lfo.stop(); } catch (e) {}
    }, (fade || 1.2) * 1000 + 100);
    ambNodes = null;
    ambName = null;
  }

  function setAmbience(name) {
    if (!unlocked) return;
    ensureContext();
    if (!ac) return;
    if (name === ambName) return;
    if (ambNodes) stopAmbience(1.2);
    ambName = name;
    if (!name || !noiseBuf) return;

    const src = ac.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = ac.createBiquadFilter();
    const g = ac.createGain();
    const lfo = ac.createOscillator();
    const lfoGain = ac.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = name === 'sea' ? 0.018 : 0.006;
    lfo.connect(lfoGain);
    lfoGain.connect(g.gain);
    g.gain.value = name === 'sea' ? 0.05 : 0.035;
    if (name === 'sea') {
      f.type = 'lowpass';
      f.frequency.value = 480;
      f.Q.value = 0.4;
    } else {
      f.type = 'highpass';
      f.frequency.value = 1400;
      f.Q.value = 0.5;
    }
    src.connect(f); f.connect(g); g.connect(ambBus);
    ambBus.gain.setTargetAtTime(Save.settings.sfx * 0.32, now(), 0.8);
    src.start();
    lfo.start();
    ambNodes = { src, f, g, lfo };
  }

  function startStatic() {
    if (!unlocked) return;
    ensureContext();
    if (!ac || staticNode) return;
    const src = ac.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1600;
    f.Q.value = 0.6;
    const g = ac.createGain();
    g.gain.value = 0.0;
    src.connect(f); f.connect(g); g.connect(ac.destination);
    src.start();
    staticNode = src; staticGain = g;
    g.gain.setTargetAtTime(0.035 * Save.settings.sfx, now(), 0.15);
  }

  function setStaticLevel(v) {
    if (staticGain) staticGain.gain.setTargetAtTime(U.clamp(v, 0, 1) * 0.11 * Save.settings.sfx, now(), 0.08);
  }

  function stopStatic() {
    if (!staticGain) return;
    const g = staticGain;
    g.gain.setTargetAtTime(0.0001, now(), 0.12);
    setTimeout(() => {
      try { staticNode.stop(); } catch (e) {}
      staticNode = null; staticGain = null;
    }, 400);
  }

  function pauseAll() {
    players.forEach(p => { if (!p.paused) p.pause(); });
  }

  global.Audio = {
    init, unlock, playMusic, stopMusic, playSfx, setAmbience,
    setVolumes, startStatic, setStaticLevel, stopStatic, pauseAll,
    get unlocked() { return unlocked; },
    get status() {
      return players.map(p => ({ src: p.src.split('/').pop(), paused: p.paused, volume: +p.volume.toFixed(2), time: +p.currentTime.toFixed(1), error: p.error ? p.error.code : 0 }));
    }
  };
})(window);
