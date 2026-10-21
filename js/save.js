/* ==========================================================
   LIGHTHOUSE — persistence
   Global progression (fragments / endings / read text),
   six manual slots, one autosave, and settings.
   ========================================================== */
(function (global) {
  'use strict';

  const KEY_GLOBAL = 'lighthouse.global.v1';
  const KEY_SETTINGS = 'lighthouse.settings.v1';
  const KEY_SLOT = (i) => `lighthouse.slot.${i}.v1`;
  const KEY_AUTO = 'lighthouse.auto.v1';
  const SLOTS = 6;

  const defaultGlobal = () => ({
    v: 1,
    fragments: [],
    endings: [],
    ngPlus: false,
    clears: 0,
    read: {},
    seenIntro: false,
    firstRunAt: 0
  });

  const defaultSettings = () => ({
    textSpeed: 52,       // chars per second
    autoDelay: 1.0,      // multiplier
    bgm: 0.52,
    sfx: 0.6,
    skipUnread: false,
    reduceMotion: false,
    showBond: true
  });

  let G = defaultGlobal();
  let S = defaultSettings();

  function sanitizeGlobal(obj) {
    const g = Object.assign(defaultGlobal(), obj || {});
    if (!Array.isArray(g.fragments)) g.fragments = [];
    if (!Array.isArray(g.endings)) g.endings = [];
    g.fragments = g.fragments.filter(x => typeof x === 'string');
    g.endings = g.endings.filter(x => typeof x === 'string');
    if (!g.read || typeof g.read !== 'object') g.read = {};
    g.ngPlus = !!g.ngPlus;
    g.clears = Number(g.clears) || 0;
    return g;
  }
  function sanitizeSettings(obj) {
    const s = Object.assign(defaultSettings(), obj || {});
    s.textSpeed = U.clamp(Number(s.textSpeed) || 52, 10, 140);
    s.autoDelay = U.clamp(Number(s.autoDelay) || 1, 0.3, 3);
    s.bgm = U.clamp(Number(s.bgm), 0, 1);
    s.sfx = U.clamp(Number(s.sfx), 0, 1);
    s.skipUnread = !!s.skipUnread;
    s.reduceMotion = !!s.reduceMotion;
    s.showBond = s.showBond !== false;
    return s;
  }

  function init() {
    G = sanitizeGlobal(U.storage(KEY_GLOBAL, null));
    S = sanitizeSettings(U.storage(KEY_SETTINGS, null));
    if (!G.firstRunAt) { G.firstRunAt = Date.now(); persistGlobal(); }
    persistSettings();
  }

  function persistGlobal() { U.store(KEY_GLOBAL, G); }
  function persistSettings() { U.store(KEY_SETTINGS, S); }

  /* ---------------- global progression ---------------- */
  function addFragment(id) {
    if (!id) return false;
    if (G.fragments.includes(id)) return false;
    G.fragments.push(id);
    persistGlobal();
    return true;
  }
  function hasFragment(id) { return G.fragments.includes(id); }
  function fragmentCount() { return G.fragments.length; }

  function unlockEnding(id) {
    const isNew = !G.endings.includes(id);
    if (isNew) G.endings.push(id);
    if (id === 'C' && !G.ngPlus) {
      G.ngPlus = true;
      G.clears = Math.max(1, G.clears + 1);
    } else if (id === 'TRUE') {
      // true ending also counts as a clear
      G.clears = Math.max(G.clears, 1);
    }
    persistGlobal();
    return isNew;
  }
  function hasEnding(id) { return G.endings.includes(id); }

  function markRead(key) {
    if (!key || G.read[key]) return false;
    G.read[key] = 1;
    // prune if it somehow grows huge
    const keys = Object.keys(G.read);
    if (keys.length > 5000) {
      for (let i = 0; i < 1000; i++) delete G.read[keys[i]];
    }
    persistGlobal();
    return true;
  }
  function isRead(key) { return !!G.read[key]; }

  function markIntroSeen() { G.seenIntro = true; persistGlobal(); }

  function resetProgress() {
    const first = G.firstRunAt;
    G = defaultGlobal();
    G.firstRunAt = first;
    persistGlobal();
  }
  function resetEverything() {
    for (let i = 0; i < SLOTS; i++) U.unstore(KEY_SLOT(i));
    U.unstore(KEY_AUTO);
    U.unstore(KEY_GLOBAL);
    U.unstore(KEY_SETTINGS);
    G = defaultGlobal();
    S = defaultSettings();
    G.firstRunAt = Date.now();
    persistGlobal();
    persistSettings();
  }

  /* ---------------- save slots ---------------- */
  function saveSlot(slot, payload) {
    const key = slot === 'auto' ? KEY_AUTO : KEY_SLOT(slot);
    const data = Object.assign({}, payload, {
      v: 1,
      ts: Date.now(),
      slot: slot
    });
    return U.store(key, data);
  }
  function loadSlot(slot) {
    const key = slot === 'auto' ? KEY_AUTO : KEY_SLOT(slot);
    const data = U.storage(key, null);
    if (!data || !data.state || !data.scene) return null;
    return data;
  }
  function deleteSlot(slot) {
    const key = slot === 'auto' ? KEY_AUTO : KEY_SLOT(slot);
    U.unstore(key);
  }
  function allSlots() {
    const arr = [];
    for (let i = 0; i < SLOTS; i++) arr.push({ id: i, data: loadSlot(i) });
    return arr;
  }
  function latest() {
    let best = null;
    const auto = loadSlot('auto');
    if (auto) best = { slot: 'auto', data: auto };
    for (let i = 0; i < SLOTS; i++) {
      const d = loadSlot(i);
      if (d && (!best || d.ts > best.data.ts)) best = { slot: i, data: d };
    }
    return best;
  }
  function anySave() { return !!latest(); }

  /* ---------------- settings ---------------- */
  function setSetting(key, value) {
    S[key] = value;
    persistSettings();
    return S[key];
  }
  function resetSettings() {
    S = defaultSettings();
    persistSettings();
    return S;
  }

  global.Save = {
    init,
    get global() { return G; },
    get settings() { return S; },
    SLOTS,
    addFragment, hasFragment, fragmentCount,
    unlockEnding, hasEnding,
    markRead, isRead, markIntroSeen,
    resetProgress, resetEverything,
    saveSlot, loadSlot, deleteSlot, allSlots, latest, anySave,
    setSetting, resetSettings
  };
})(window);
