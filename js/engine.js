/* ==========================================================
   LIGHTHOUSE — visual novel engine
   Scene execution, typewriter, branching, save/restore,
   auto / skip / backlog / endings.
   ========================================================== */
(function (global) {
  'use strict';

  let sceneId = null;
  let index = 0;
  let running = false;
  let generation = 0;

  let tokens = [];
  let tokenIdx = 0;
  let typing = false;
  let lineDone = false;
  let lineTimer = null;
  let autoTimer = null;
  let skipTimer = null;

  let auto = false;
  let skip = false;
  let ctrlSkip = false;
  let inputLocked = false;
  let choiceActive = false;
  let currentLine = null;
  let currentMusic = null;
  let currentCls = '';

  const backlog = [];

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  /* ---------------------------------------------------------
     lifecycle
     --------------------------------------------------------- */
  function startNewGame() {
    const playthrough = Save.global.ngPlus ? Math.max(1, Save.global.clears) : 0;
    State.reset(playthrough);
    backlog.length = 0;
    running = true;
    auto = false; skip = false; ctrlSkip = false;
    inputLocked = false; choiceActive = false;
    UI.clearCast();
    UI.showDialogue(true);
    UI.showQuick(true);
    UI.hideChoices();
    UI.setQuickActive('auto', false);
    UI.setQuickActive('skip', false);
    UI.setCinematic(false);
    UI.setBond(State.bond);
    UI.setChapterTag(null);
    Audio.setAmbience('sea');
    enterScene(Story.START);
  }

  function enterScene(id, opts) {
    opts = opts || {};
    const scene = Story.scenes[id];
    if (!scene) {
      console.error('[engine] unknown scene', id);
      return;
    }
    clearTimers();
    running = true;
    const gen = ++generation;
    sceneId = id;
    index = opts.index || 0;
    choiceActive = false;
    typing = false;
    lineDone = false;
    currentLine = null;

    const st = State.data;
    const chapterChanged = scene.chapter !== st.chapter;
    st.chapter = scene.chapter;
    st.scene = id;
    st.line = index;

    UI.hideChoices();
    UI.showDialogue(true);
    UI.showQuick(true);
    UI.setCinematic(false);
    UI.showNext(false);
    if (!scene.keepCast) UI.clearCast();
    UI.setBond(st.bond);
    if (scene.bg) UI.setBackground(scene.bg);
    if (scene.music) playTrack(scene.music);
    if (Object.prototype.hasOwnProperty.call(scene, 'amb')) Audio.setAmbience(scene.amb || null);
    const meta = GameData.CHAPTERS[scene.chapter];
    UI.setChapterTag(meta ? `${meta.no}　·　${meta.title}` : null);

    if (chapterChanged && !opts.noCard) {
      inputLocked = true;
      UI.chapterCard(scene.chapter).then(() => {
        if (gen !== generation) return;
        inputLocked = false;
        if (opts.restore) { restoreLine(); return; }
        if (index === 0) autoSave();
        process();
      });
      return;
    }
    if (opts.restore) { restoreLine(); return; }
    if (index === 0) autoSave();
    process();
  }

  function process() {
    if (!running) return;
    const scene = Story.scenes[sceneId];
    if (!scene) return;
    const st = State.data;

    while (index < scene.lines.length) {
      const line = scene.lines[index];
      st.line = index;

      if (line.t === 'say') { showSay(line); return; }
      if (line.t === 'choice') { showChoice(line); return; }
      if (line.t === 'jump') {
        const next = typeof line.next === 'function' ? line.next(st) : line.next;
        enterScene(next);
        return;
      }
      if (line.t === 'if') {
        const ok = !!line.cond(st);
        const next = ok ? line.then : line.else;
        if (next) { enterScene(typeof next === 'function' ? next(st) : next); return; }
        index++; continue;
      }
      if (line.t === 'ending') { showEnding(line.id); return; }
      if (line.t === 'radio') { runRadio(); return; }
      if (line.t === 'map') { runMap(); return; }
      if (line.t === 'wait') {
        inputLocked = true;
        clearTimers();
        setTimeout(() => {
          inputLocked = false;
          index++;
          process();
        }, line.ms || 500);
        return;
      }
      applySimple(line, st);
      index++;
      st.line = index;
    }

    // scene finished
    if (scene.next) {
      const next = typeof scene.next === 'function' ? scene.next(st) : scene.next;
      enterScene(next);
    } else {
      console.warn('[engine] scene has no next:', sceneId);
    }
  }

  function applySimple(line, st) {
    switch (line.t) {
      case 'bg':
        UI.setBackground(line.name);
        autoSave();
        break;
      case 'music':
        playTrack(line.name);
        break;
      case 'amb':
        Audio.setAmbience(line.name || null);
        break;
      case 'sfx':
        Audio.playSfx(line.name);
        break;
      case 'fx':
        if (line.name === 'shake') UI.shake();
        else if (line.name === 'flash') UI.flash();
        else if (line.name === 'fade') UI.fadeTo(1, 500).then(() => UI.fadeIn(500));
        break;
      case 'show':
        UI.showChar(line.who, line.expr, line.pos);
        break;
      case 'hide':
        UI.hideChar(line.who);
        break;
      case 'clear':
        UI.clearCast();
        break;
      case 'frag': {
        const r = State.addFragment(line.id);
        const def = GameData.FRAGMENTS[line.id];
        if (r.isNewGlobal && def) {
          UI.toast('MEMORY FOUND', def.name, def.desc, 4400);
          Audio.playSfx('fragment');
        } else if (r.added) {
          Audio.playSfx('select');
        }
        break;
      }
      case 'flag':
        State.setFlag(line.key, line.value);
        break;
      case 'set':
        st[line.key] = line.value;
        break;
      case 'inc':
        st[line.key] = (Number(st[line.key]) || 0) + (line.value || 1);
        break;
    }
    UI.setBond(st.bond);
  }

  /* ---------------------------------------------------------
     dialogue
     --------------------------------------------------------- */
  function showSay(line, restoring) {
    const text = (State.isNGPlus() && line.ngplus) ? line.ngplus : line.text;
    currentLine = Object.assign({}, line, { text });
    const key = sceneId + ':' + index;
    const wasRead = Save.isRead(key);
    Save.markRead(key);

    if (!restoring && (skip || ctrlSkip) && !wasRead && !Save.settings.skipUnread) {
      stopSkip(true);
      return renderSay(currentLine, restoring);
    }
    return renderSay(currentLine, restoring);
  }

  function renderSay(line, restoring) {
    if (line.who && !line.inner) UI.setSpeaker(line.who);
    else UI.setSpeaker(null);

    if (line.who && (line.who === 'akari' || line.who === 'chinatsu') && !line.offscreen) {
      UI.showChar(line.who, line.expr, line.pos);
    }

    currentCls = line.inner ? 'inner' : (line.who ? '' : 'narration');
    UI.setText('', currentCls);
    UI.showNext(false);
    lineDone = false;

    if (!restoring) {
      backlog.push({ who: line.who || null, text: line.text, inner: !!line.inner });
      if (backlog.length > 80) backlog.shift();
    }

    typewrite(line.text, currentCls);
  }

  function typewrite(text, cls) {
    clearTimeout(lineTimer);
    tokens = U.parseMarkup(text);
    tokenIdx = 0;

    const speed = U.clamp(Number(Save.settings.textSpeed) || 52, 10, 140);
    if (speed >= 120) {
      tokenIdx = tokens.length;
      UI.setText(U.tokensToHTML(tokens), cls);
      finishTyping();
      return;
    }

    typing = true;
    lineDone = false;

    // build a reveal schedule, folding pause tags into the next character
    const schedule = [];
    let pending = 0;
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.type === 'pause') { pending += Math.min(1200, t.ms); continue; }
      schedule.push({ upTo: i + 1, pause: pending });
      pending = 0;
    }

    const base = Math.max(13, 1000 / speed);
    let si = 0;

    const tick = () => {
      if (!typing) return;
      if (si >= schedule.length) { finishTyping(); return; }
      const step = schedule[si++];
      tokenIdx = step.upTo;
      UI.setText(U.tokensToHTML(tokens, tokenIdx), cls);
      lineTimer = setTimeout(tick, base + step.pause);
    };
    tick();

    if (skip || ctrlSkip) {
      finishTyping();
    }
  }

  function finishTyping() {
    clearTimeout(lineTimer);
    if (!tokens.length) return;
    typing = false;
    tokenIdx = tokens.length;
    UI.setText(U.tokensToHTML(tokens), currentCls);
    UI.showNext(true);
    lineDone = true;
    scheduleNext();
  }

  function scheduleNext() {
    clearTimeout(autoTimer);
    clearTimeout(skipTimer);
    if (!running || choiceActive || inputLocked) return;
    const plain = currentLine ? U.plainText(currentLine.text) : '';

    if (skip || ctrlSkip) {
      skipTimer = setTimeout(() => {
        if (!skip && !ctrlSkip) return;
        if (UI.isOverlayOpen()) { scheduleNext(); return; }
        advance();
      }, 34);
      return;
    }
    if (auto) {
      const delay = (850 + plain.length * 42) * U.clamp(Save.settings.autoDelay, 0.3, 3);
      autoTimer = setTimeout(() => {
        if (!auto) return;
        if (UI.isOverlayOpen() || inputLocked || choiceActive) { scheduleNext(); return; }
        advance();
      }, delay);
    }
  }

  function advance() {
    if (!running || inputLocked || choiceActive || UI.isOverlayOpen()) return;
    if (typing) { finishTyping(); return; }
    if (!lineDone) return;
    clearTimers();
    lineDone = false;
    index++;
    State.data.line = index;
    process();
  }

  function clearTimers() {
    clearTimeout(lineTimer);
    clearTimeout(autoTimer);
    clearTimeout(skipTimer);
    typing = false;
  }

  /* ---------------------------------------------------------
     choices
     --------------------------------------------------------- */
  function showChoice(line) {
    choiceActive = true;
    stopSkip(false);
    clearTimers();
    UI.showNext(false);
    const st = State.data;
    const items = line.choices
      .filter(c => !c.if || c.if(st))
      .map(c => {
        const locked = typeof c.locked === 'function' ? !!c.locked(st) : !!c.locked;
        return Object.assign({}, c, { locked });
      });
    UI.showChoices(items, (i) => {
      const c = items[i];
      if (!c || c.locked) return;
      choiceActive = false;
      State.applyEffects(c.effects);
      UI.setBond(State.bond, true);
      Audio.playSfx('select');
      autoSave();
      const next = typeof c.next === 'function' ? c.next(st) : c.next;
      enterScene(next);
    });
  }

  /* ---------------------------------------------------------
     interlude: radio / map
     --------------------------------------------------------- */
  function runRadio() {
    clearTimers();
    inputLocked = true;
    UI.showDialogue(false);
    UI.showQuick(false);
    Mini.openRadio({
      onComplete: (ids) => {
        inputLocked = false;
        UI.showDialogue(true);
        UI.showQuick(true);
        let got = 0;
        ids.forEach(id => {
          const r = State.addFragment(id);
          const def = GameData.FRAGMENTS[id];
          if (r.isNewGlobal && def) {
            got++;
            setTimeout(() => UI.toast('MEMORY FOUND', def.name, def.desc, 3800), got * 550);
          }
        });
        setTimeout(() => Audio.playSfx('fragment'), 200);
        State.setFlag('radioDone', true);
        State.data.bond = Math.min(10, State.data.bond + 2);
        UI.setBond(State.bond, true);
        index++;
        State.data.line = index;
        autoSave();
        setTimeout(process, 300);
      }
    });
  }

  function runMap() {
    clearTimers();
    inputLocked = true;
    UI.showDialogue(false);
    UI.showQuick(false);
    Mini.openMap({
      onPick: (loc) => {
        inputLocked = false;
        State.setFlag('visited_' + loc.id);
        autoSave();
        enterScene(loc.scene, { noCard: true });
      }
    });
  }

  /* ---------------------------------------------------------
     endings
     --------------------------------------------------------- */
  async function showEnding(id) {
    running = false;
    auto = false; skip = false; ctrlSkip = false;
    clearTimers();
    choiceActive = false;
    UI.setQuickActive('auto', false);
    UI.setQuickActive('skip', false);
    UI.showNext(false);
    const isNew = Save.unlockEnding(id);
    UI.updateTitleMeta();
    if (id === 'C') {
      UI.toast('NEW SUMMER', '第二个夏天', '记忆会保留到下一周目。', 4200);
    }
    await UI.showEnding(id);
    Main.toTitle();
  }

  /* ---------------------------------------------------------
     audio
     --------------------------------------------------------- */
  function playTrack(name) {
    if (!name) return;
    currentMusic = name;
    Audio.playMusic(name);
  }

  /* ---------------------------------------------------------
     save / load
     --------------------------------------------------------- */
  function makeSavePayload() {
    const scene = Story.scenes[sceneId];
    const chapterMeta = GameData.CHAPTERS[State.data.chapter] || {};
    const last = backlog[backlog.length - 1];
    const previewRaw = last ? U.plainText(last.text) : (scene ? scene.title : '');
    return {
      state: State.snapshot(),
      scene: sceneId,
      line: index,
      chapterTitle: `${chapterMeta.no || ''}　${chapterMeta.title || ''}`.trim(),
      sceneTitle: scene ? scene.title : '',
      preview: previewRaw.slice(0, 58),
      thumb: UI.captureThumb(),
      backlog: backlog.slice(-60),
      cast: UI.getCastSnapshot(),
      bg: UI.bgName,
      music: currentMusic,
      paused: true
    };
  }

  function saveToSlot(slot) {
    if (!running) return false;
    const ok = Save.saveSlot(slot, makeSavePayload());
    if (ok) UI.updateTitleMeta();
    return ok;
  }

  function autoSave() {
    if (!running || !sceneId) return;
    const sc = Story.scenes[sceneId];
    // never let an autosave trap the player inside an ending sequence
    if (!sc || sc.chapter >= 5) return;
    Save.saveSlot('auto', makeSavePayload());
  }

  async function loadSave(data) {
    if (!data || !data.state) return;
    Audio.unlock();
    const titleVisible = !document.getElementById('screen-title').classList.contains('hidden');
    if (titleVisible) await UI.enterGame();

    clearTimers();
    UI.hideChoices();
    State.restore(data.state);
    backlog.length = 0;
    (data.backlog || []).forEach(r => backlog.push(r));
    currentMusic = data.music || null;
    sceneId = data.scene;
    index = typeof data.line === 'number' ? data.line : 0;
    const scene = Story.scenes[sceneId];
    if (!scene) { console.error('[engine] save scene missing', sceneId); return; }

    running = true;
    auto = false; skip = false; ctrlSkip = false;
    inputLocked = false; choiceActive = false;
    UI.setQuickActive('auto', false);
    UI.setQuickActive('skip', false);
    UI.setCinematic(false);
    UI.showDialogue(true);
    UI.showQuick(true);
    UI.setSpeaker(null);
    UI.hideChoices();
    UI.setBond(State.bond);
    UI.setBackground(data.bg || scene.bg, { instant: true });
    const meta = GameData.CHAPTERS[scene.chapter];
    UI.setChapterTag(meta ? `${meta.no}　·　${meta.title}` : null);
    if (data.music) Audio.playMusic(data.music);
    if (Object.prototype.hasOwnProperty.call(scene, 'amb')) Audio.setAmbience(scene.amb || null);
    UI.restoreCast(data.cast);

    const line = scene.lines[index];
    if (line && line.t === 'say') {
      renderSay(line, true);
    } else {
      process();
    }
    UI.toast('LOADED', '已回到那个时刻', '', 1800);
  }

  function restoreLine() {
    const scene = Story.scenes[sceneId];
    const line = scene && scene.lines[index];
    if (line && line.t === 'say') renderSay(line, true);
    else process();
  }

  function stop() {
    clearTimers();
    running = false;
    auto = false; skip = false; ctrlSkip = false;
    choiceActive = false;
    inputLocked = false;
    UI.setQuickActive('auto', false);
    UI.setQuickActive('skip', false);
  }

  function hiddenChoices() {
    const c = document.getElementById('choices');
    if (c) c.classList.add('hidden');
    choiceActive = false;
  }

  /* ---------------------------------------------------------
     modes / input
     --------------------------------------------------------- */
  function toggleAuto() {
    if (!running) return;
    auto = !auto;
    if (auto) {
      skip = false; ctrlSkip = false;
      UI.setQuickActive('skip', false);
      scheduleNext();
    } else {
      clearTimeout(autoTimer);
    }
    UI.setQuickActive('auto', auto);
  }

  function toggleSkip() {
    if (!running) return;
    skip = !skip;
    if (skip) {
      auto = false;
      UI.setQuickActive('auto', false);
      clearTimeout(autoTimer);
      if (typing) finishTyping();
      scheduleNext();
    } else {
      clearTimeout(skipTimer);
    }
    UI.setQuickActive('skip', skip || ctrlSkip);
  }

  function stopSkip(notify) {
    skip = false;
    ctrlSkip = false;
    clearTimeout(skipTimer);
    UI.setQuickActive('skip', false);
    if (notify) UI.toast('SKIP', '已停止快进', '这段文字还没有读过。', 2200);
  }

  function setCtrlSkip(on) {
    if (!running) return;
    ctrlSkip = !!on;
    if (on) {
      auto = false;
      UI.setQuickActive('auto', false);
      if (typing) finishTyping();
      scheduleNext();
    } else if (!skip) {
      clearTimeout(skipTimer);
    }
    UI.setQuickActive('skip', skip || ctrlSkip);
  }

  function onOverlayClosed() {
    if (auto && lineDone) scheduleNext();
    if ((skip || ctrlSkip) && lineDone) scheduleNext();
  }

  function handleKey(e) {
    if (UI.isOverlayOpen()) return;
    if (e.code === 'Space' || e.key === 'Enter') {
      if (!running) return;
      if (document.getElementById('chapter-card') && !document.getElementById('chapter-card').classList.contains('hidden')) {
        UI.skipChapterCard();
        return;
      }
      if (choiceActive) return;
      e.preventDefault();
      advance();
    }
  }

  /* debug helper */
  function debugJump(id) {
    if (!Story.scenes[id]) return;
    generation++;
    running = true;
    inputLocked = false;
    UI.hideChapterCard();
    State.data.chapter = Story.scenes[id].chapter;
    enterScene(id, { noCard: true });
  }

  global.Engine = {
    get running() { return running; },
    get currentMusic() { return currentMusic; },
    get backlog() { return backlog; },
    get sceneId() { return sceneId; },
    get lineIndex() { return index; },
    get mode() { return { auto, skip, ctrlSkip }; },
    startNewGame, enterScene, advance, handleKey,
    toggleAuto, toggleSkip, setCtrlSkip, stopSkip,
    makeSavePayload, saveToSlot, loadSave, autoSave,
    onOverlayClosed, showEnding, debugJump, stop, restoreLine,
    setAutoOff() { auto = false; UI.setQuickActive('auto', false); },
    applySettings() {}
  };
})(window);
