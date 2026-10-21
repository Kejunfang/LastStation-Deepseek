/* ==========================================================
   LIGHTHOUSE — interface
   Screen flow, character staging, dialogue chrome, menus,
   save/load, gallery, settings, cinematic cards.
   ========================================================== */
(function (global) {
  'use strict';
  const { $, $$, el, clamp } = U;

  let stage, bgCanvas, bgCtx, bgOld;
  let titleEl, gameEl, overlayEl;
  let currentBg = 'black';
  let bgStart = performance.now();
  let reduceMotion = false;
  let lastBgFrame = 0, lastCastFrame = 0;
  let overlayOpen = false;
  let overlayLocked = false;
  let overlayCleanup = null;
  let toastTimer = 0;
  let endingResolve = null;
  let chapterResolve = null;
  let transitionBusy = false;

  const cast = { left: null, center: null, right: null };
  const slotEls = {};
  const offscreens = {};

  /* ---------------------------------------------------------
     boot / stage
     --------------------------------------------------------- */
  function init() {
    stage = $('#stage');
    bgCanvas = $('#bg-canvas');
    bgCtx = bgCanvas.getContext('2d');
    titleEl = $('#screen-title');
    gameEl = $('#screen-game');
    overlayEl = $('#overlay');
    reduceMotion = Save.settings.reduceMotion;

    for (const key of ['left', 'center', 'right']) {
      slotEls[key] = document.querySelector(`.cast-slot[data-slot="${key}"]`);
      offscreens[key] = { canvas: PX.make(90, 135), ctx: null };
      offscreens[key].ctx = offscreens[key].canvas.getContext('2d');
    }

    bgOld = PX.make(640, 360);
    bgOld.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;opacity:0;transition:opacity .75s ease;pointer-events:none;z-index:1;';
    bgCanvas.parentNode.insertBefore(bgOld, bgCanvas.nextSibling);

    U.fitStage(stage);
    window.addEventListener('resize', () => U.fitStage(stage));
    window.addEventListener('orientationchange', () => setTimeout(() => U.fitStage(stage), 120));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) Audio.pauseAll();
      else if (Engine.running && !overlayOpen) Audio.playMusic(Engine.currentMusic || 'title', 0.4);
    });

    bindTitle();
    bindQuickbar();
    bindDialogue();
    bindCards();
    updateTitleMeta();
    requestAnimationFrame(loop);
  }

  function loop(now) {
    const t = reduceMotion ? 1.6 : now / 1000;
    if (!document.hidden) {
      const interval = reduceMotion ? 1000 : 48;
      if (now - lastBgFrame > interval) {
        lastBgFrame = now;
        Backgrounds.draw(bgCtx, currentBg, t);
      }
      if (now - lastCastFrame > (reduceMotion ? 1000 : 105)) {
        lastCastFrame = now;
        renderCast(t);
      }
    }
    requestAnimationFrame(loop);
  }

  function setBackground(name, opts) {
    opts = opts || {};
    if (!name) name = 'black';
    if (name === currentBg && !opts.force) return;
    if (!opts.instant && currentBg) {
      const octx = bgOld.getContext('2d');
      octx.clearRect(0, 0, 640, 360);
      octx.drawImage(bgCanvas, 0, 0);
      bgOld.style.opacity = '1';
    }
    currentBg = name;
    bgStart = performance.now();
    Backgrounds.draw(bgCtx, currentBg, performance.now() / 1000);
    if (!opts.instant) {
      requestAnimationFrame(() => { bgOld.style.opacity = '0'; });
    } else {
      bgOld.style.opacity = '0';
    }
  }

  /* ---------------------------------------------------------
     characters
     --------------------------------------------------------- */
  function renderCast(t) {
    for (const key of ['left', 'center', 'right']) {
      const item = cast[key];
      if (!item) continue;
      const off = offscreens[key];
      Characters.draw(off.ctx, item.who, item.expr, t, { noAura: false });
      const canvas = slotEls[key].querySelector('canvas');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 360, 540);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off.canvas, 0, 0, 360, 540);
    }
  }

  function showChar(who, expr, pos) {
    if (!who || !GameData.CHARS[who]) return;
    expr = expr || 'normal';
    // already somewhere?
    let target = pos;
    for (const key of ['left', 'center', 'right']) {
      if (cast[key] && cast[key].who === who) {
        cast[key].expr = expr;
        if (!target) target = key;
        if (target !== key) {
          cast[key] = null;
          slotEls[key].classList.remove('active');
          cast[target] = { who, expr };
        }
        break;
      }
    }
    if (!target) {
      const occupied = ['center', 'left', 'right'].filter(k => cast[k]);
      if (occupied.length === 0) target = 'center';
      else if (!occupied.includes('center')) target = 'center';
      else if (!occupied.includes('left')) target = 'left';
      else target = 'right';
    }
    if (!cast[target] || cast[target].who !== who) {
      cast[target] = { who, expr };
      const slot = slotEls[target];
      slot.classList.remove('enter');
      void slot.offsetWidth;
      slot.classList.add('enter');
    }
    slotEls[target].dataset.who = who;
    slotEls[target].classList.toggle('fading', expr === 'fade');
    slotEls[target].classList.add('active');
    focusChar(who);
    renderCast(reduceMotion ? 1.6 : performance.now() / 1000);
  }

  function setExpr(who, expr) {
    for (const key of ['left', 'center', 'right']) {
      if (cast[key] && cast[key].who === who) {
        cast[key].expr = expr || 'normal';
        slotEls[key].classList.toggle('fading', cast[key].expr === 'fade');
        renderCast(reduceMotion ? 1.6 : performance.now() / 1000);
        return;
      }
    }
  }

  function focusChar(who) {
    const active = Object.keys(cast).filter(k => cast[k]);
    if (active.length < 2) {
      active.forEach(k => slotEls[k].classList.remove('dim'));
      return;
    }
    for (const key of active) {
      slotEls[key].classList.toggle('dim', cast[key].who !== who);
    }
  }

  function hideChar(who) {
    for (const key of ['left', 'center', 'right']) {
      if (cast[key] && cast[key].who === who) {
        cast[key] = null;
        slotEls[key].classList.remove('active', 'enter', 'dim', 'fading');
        delete slotEls[key].dataset.who;
      }
    }
  }

  function clearCast() {
    for (const key of ['left', 'center', 'right']) {
      cast[key] = null;
      slotEls[key].classList.remove('active', 'enter', 'dim', 'fading');
      delete slotEls[key].dataset.who;
    }
  }

  function getCastSnapshot() {
    return JSON.parse(JSON.stringify(cast));
  }
  function restoreCast(snap) {
    clearCast();
    if (!snap) return;
    for (const key of ['left', 'center', 'right']) {
      if (snap[key]) {
        cast[key] = { who: snap[key].who, expr: snap[key].expr };
        slotEls[key].dataset.who = cast[key].who;
        slotEls[key].classList.toggle('fading', cast[key].expr === 'fade');
        slotEls[key].classList.add('active');
      }
    }
    renderCast(reduceMotion ? 1.6 : performance.now() / 1000);
  }

  /* ---------------------------------------------------------
     screens
     --------------------------------------------------------- */
  function showTitle() {
    titleEl.classList.remove('hidden', 'leaving');
    gameEl.classList.add('hidden');
    overlayEl.classList.add('hidden');
    overlayOpen = false;
    document.title = '灯塔不眠 · The Lighthouse Never Sleeps';
    setBackground('title_night', { instant: false });
    clearCast();
    updateTitleMeta();
  }

  async function enterGame() {
    await fadeTo(1, 450);
    titleEl.classList.add('hidden');
    titleEl.classList.remove('leaving');
    gameEl.classList.remove('hidden');
    stage.classList.add('in-game');
    await wait(120);
    await fadeIn(650);
    Audio.playSfx('select');
  }

  function updateTitleMeta() {
    const g = Save.global;
    $('#frag-count').textContent = `${g.fragments.filter(id => GameData.FRAGMENTS[id]).length}/8`;
    $('#end-count').textContent = `${g.endings.filter(e => GameData.ENDINGS[e]).length}/4`;
    $('#ngplus-badge').classList.toggle('hidden', !g.ngPlus);
    const cont = $('#continue-note');
    const latest = Save.latest();
    if (latest) {
      cont.textContent = latest.data.chapterTitle || '';
      const btn = document.querySelector('#title-menu [data-action="continue"]');
      btn.disabled = false;
    } else {
      cont.textContent = '暂无记录';
      document.querySelector('#title-menu [data-action="continue"]').disabled = true;
    }
  }

  function bindTitle() {
    $('#title-menu').addEventListener('click', (e) => {
      const btn = e.target.closest('.menu-item');
      if (!btn || btn.disabled) return;
      const action = btn.dataset.action;
      btn.blur();
      Audio.unlock();
      Audio.playSfx('select');
      switch (action) {
        case 'new': Main.startNewGame(); break;
        case 'continue': Main.continueGame(); break;
        case 'load': openSave('load'); break;
        case 'memories': openMemories(); break;
        case 'endings': openEndings(); break;
        case 'settings': openSettings(); break;
      }
    });
    // ambient title music on the first interaction anywhere
    const first = () => {
      Audio.unlock();
      if (currentBg === 'title_night') Audio.playMusic('title', 2.0);
      window.removeEventListener('pointerdown', first);
      window.removeEventListener('keydown', first);
    };
    window.addEventListener('pointerdown', first);
    window.addEventListener('keydown', first);
  }

  /* ---------------------------------------------------------
     dialogue / quickbar
     --------------------------------------------------------- */
  function bindDialogue() {
    $('#dialogue').addEventListener('click', (e) => {
      if (overlayOpen) return;
      Engine.advance();
    });
  }

  function bindQuickbar() {
    $('#quickbar').addEventListener('click', (e) => {
      const btn = e.target.closest('.qb');
      if (!btn) return;
      const action = btn.dataset.action;
      btn.blur();
      Audio.playSfx('click');
      switch (action) {
        case 'backlog': openBacklog(); break;
        case 'auto': Engine.toggleAuto(); break;
        case 'skip': Engine.toggleSkip(); break;
        case 'save': openSave('save'); break;
        case 'load': openSave('load'); break;
        case 'notebook': openNotebook(); break;
        case 'settings': openSettings(); break;
        case 'menu': openMenu(); break;
      }
    });
  }

  function setSpeaker(who) {
    const box = $('#speaker');
    const nameEl = $('#speaker-name');
    const enEl = $('#speaker-en');
    if (!who || !GameData.CHARS[who]) {
      box.classList.add('hidden');
      document.documentElement.style.setProperty('--speaker-accent', 'var(--amber)');
      return;
    }
    const c = GameData.CHARS[who];
    nameEl.textContent = c.name;
    enEl.textContent = c.en;
    document.documentElement.style.setProperty('--speaker-accent', c.color);
    box.classList.remove('hidden');
  }

  function setText(html, cls) {
    const t = $('#dialogue-text');
    t.className = cls || '';
    t.innerHTML = html;
  }
  function getTextEl() { return $('#dialogue-text'); }

  function showNext(show) { $('#next-mark').classList.toggle('hidden', !show); }
  function showDialogue(show) { $('#dialogue-wrap').classList.toggle('hidden', !show); }
  function showQuick(show) { $('#quickbar').classList.toggle('hidden', !show); }
  function setQuickActive(action, on) {
    const btn = document.querySelector(`.qb[data-action="${action}"]`);
    if (btn) btn.classList.toggle('active', !!on);
  }
  function setChapterTag(text) {
    const tag = $('#chapter-tag');
    if (!text) { tag.classList.remove('show'); return; }
    tag.textContent = text;
    tag.classList.add('show');
  }

  function showChoices(items, onPick) {
    const wrap = $('#choices');
    const list = $('#choice-list');
    list.innerHTML = '';
    wrap.classList.remove('hidden');
    showQuick(false);
    gameEl.classList.add('choosing');
    items.forEach((item, i) => {
      const b = el('button', 'choice' + (item.locked ? ' locked' : '') + (item.true ? ' true-choice' : ''));
      b.innerHTML = `<span class="choice-index">0${i + 1}</span><span class="choice-text">${U.esc(item.text)}</span>` +
        (item.locked ? `<span class="choice-lock">${U.esc(item.lockText || '尚未解锁')}</span>` : '');
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        if (item.locked) { Audio.playSfx('error'); return; }
        Audio.playSfx('select');
        hideChoices();
        onPick(i);
      });
      list.appendChild(b);
    });
    // stagger animation reset
    Array.from(list.children).forEach((b, i) => {
      b.style.animation = 'none';
      void b.offsetWidth;
      b.style.animation = `choiceIn .55s ${i * 0.07}s cubic-bezier(.22,.61,.36,1) both`;
    });
  }
  function hideChoices() {
    $('#choices').classList.add('hidden');
    showQuick(true);
    if (gameEl) gameEl.classList.remove('choosing');
  }

  function setBond(n, bump) {
    const hud = $('#hud-bond');
    $('#bond-num').textContent = String(n);
    if (!Save.settings.showBond) { hud.classList.add('hidden'); return; }
    hud.classList.remove('hidden');
    if (bump) {
      hud.classList.remove('bump');
      void hud.offsetWidth;
      hud.classList.add('bump');
    }
  }
  function hideBond() { $('#hud-bond').classList.add('hidden'); }

  /* ---------------------------------------------------------
     toast / chapter / ending cards
     --------------------------------------------------------- */
  function toast(kicker, name, desc, ms) {
    const box = $('#toast');
    box.innerHTML = `<div class="toast-inner">
      <div class="toast-icon"><span>◈</span></div>
      <div><div class="toast-kicker">${U.esc(kicker)}</div>
      <div class="toast-name">${U.esc(name)}</div>
      ${desc ? `<div class="toast-desc">${U.esc(desc)}</div>` : ''}</div>
    </div>`;
    box.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove('show'), ms || 3800);
  }

  function chapterCard(chapter) {
    const meta = GameData.CHAPTERS[chapter];
    if (!meta) return Promise.resolve();
    const card = $('#chapter-card');
    $('#cc-no').textContent = meta.no;
    $('#cc-title').textContent = meta.title;
    $('#cc-sub').textContent = meta.sub;
    card.classList.remove('hidden');
    void card.offsetWidth;
    card.classList.add('show');
    gameEl.classList.add('cinematic');
    Audio.playSfx('chime');
    return new Promise(resolve => {
      chapterResolve = resolve;
      setTimeout(() => {
        card.classList.remove('show');
        setTimeout(() => {
          card.classList.add('hidden');
          gameEl.classList.remove('cinematic');
          chapterResolve = null;
          resolve();
        }, 900);
      }, reduceMotion ? 1100 : 2200);
    });
  }
  function hideChapterCard() {
    const card = $('#chapter-card');
    card.classList.remove('show');
    card.classList.add('hidden');
    gameEl.classList.remove('cinematic');
    chapterResolve = null;
  }

  function skipChapterCard() {
    if (!chapterResolve) return;
    const card = $('#chapter-card');
    card.classList.remove('show');
    setTimeout(() => {
      card.classList.add('hidden');
      gameEl.classList.remove('cinematic');
      const r = chapterResolve; chapterResolve = null;
      if (r) r();
    }, 300);
  }

  function showEnding(id) {
    const meta = GameData.ENDINGS[id];
    if (!meta) return Promise.resolve();
    const card = $('#ending-card');
    $('#ec-no').textContent = `ENDING ${id === 'TRUE' ? 'TRUE' : id}`;
    $('#ec-title').textContent = meta.title;
    $('#ec-epi').textContent = meta.epi;
    $('#ec-desc').textContent = meta.desc;
    $('#ec-hint').textContent = id === 'C'
      ? '新的夏天已经解锁 · 标题画面可以选择 New Game+'
      : (id === 'TRUE' ? '感谢你陪他们走到这里。' : '');
    card.classList.remove('hidden');
    void card.offsetWidth;
    card.classList.add('show');
    gameEl.classList.add('cinematic');
    showQuick(false);
    setSpeaker(null);
    Audio.playMusic(id === 'TRUE' ? 'true' : (id === 'C' ? 'piano' : 'farewell'), 2);
    return new Promise(resolve => {
      let done = false;
      endingResolve = () => {
        if (done) return;
        done = true;
        card.classList.remove('show');
        setTimeout(() => {
          card.classList.add('hidden');
          gameEl.classList.remove('cinematic');
          resolve();
        }, 800);
      };
    });
  }
  function bindCards() {
    $('#ec-return').addEventListener('click', () => {
      Audio.playSfx('select');
      if (endingResolve) endingResolve();
    });
    $('#chapter-card').addEventListener('click', () => {
      if (chapterResolve) skipChapterCard();
    });
  }

  /* ---------------------------------------------------------
     fade / flash
     --------------------------------------------------------- */
  function fadeTo(opacity, ms) {
    const f = $('#fade');
    f.classList.remove('hidden');
    f.style.transition = `opacity ${ms || 600}ms ease`;
    requestAnimationFrame(() => { f.style.opacity = String(opacity); });
    return wait((ms || 600) + 30);
  }
  function fadeIn(ms) {
    const f = $('#fade');
    f.style.transition = `opacity ${ms || 600}ms ease`;
    f.style.opacity = '0';
    setTimeout(() => f.classList.add('hidden'), (ms || 600) + 60);
    return wait((ms || 600) + 60);
  }
  function flash() {
    const f = $('#flash');
    f.classList.remove('fire');
    void f.offsetWidth;
    f.classList.add('fire');
    Audio.playSfx('thunder');
  }
  function shake() {
    gameEl.classList.remove('shake');
    void gameEl.offsetWidth;
    gameEl.classList.add('shake');
    setTimeout(() => gameEl.classList.remove('shake'), 500);
  }

  /* ---------------------------------------------------------
     overlays
     --------------------------------------------------------- */
  function modal(opts) {
    closeOverlay(true);
    overlayLocked = false;
    overlayEl.classList.remove('hidden');
    overlayOpen = true;
    overlayEl.innerHTML = '';
    overlayEl.style.background = opts.dim || '';
    const panel = el('div', 'panel ' + (opts.cls || ''));
    const head = el('div', 'panel-head');
    head.innerHTML = `<div class="panel-title">${U.esc(opts.title || '')}${opts.sub ? `<small>${U.esc(opts.sub)}</small>` : ''}</div>`;
    const close = el('button', 'panel-close');
    close.setAttribute('aria-label', '关闭');
    close.addEventListener('click', () => closeOverlay());
    head.appendChild(close);
    const body = el('div', 'panel-body');
    if (typeof opts.body === 'string') body.innerHTML = opts.body;
    else if (opts.body) body.appendChild(opts.body);
    panel.appendChild(head);
    panel.appendChild(body);
    if (opts.foot) {
      const foot = el('div', 'panel-foot');
      if (typeof opts.foot === 'string') foot.innerHTML = opts.foot;
      else foot.appendChild(opts.foot);
      panel.appendChild(foot);
    }
    overlayEl.appendChild(panel);
    if (opts.onMount) opts.onMount(panel, body, close);
    overlayCleanup = opts.onClose || null;
    return { panel, body, close };
  }

  function closeOverlay(silent) {
    if (!overlayOpen) return;
    if (overlayLocked && !silent) return;
    overlayLocked = false;
    overlayOpen = false;
    overlayEl.classList.add('hidden');
    overlayEl.innerHTML = '';
    overlayEl.style.background = '';
    const fn = overlayCleanup;
    overlayCleanup = null;
    if (!silent && fn) fn();
    if (typeof Engine !== 'undefined') Engine.onOverlayClosed();
  }

  function isOverlayOpen() { return overlayOpen; }
  function setOverlayLock(v) { overlayLocked = !!v; }

  function confirmDialog(title, text, okLabel) {
    return new Promise(resolve => {
      const wrap = el('div', 'confirm-wrap');
      wrap.innerHTML = `<h3>${U.esc(title)}</h3><p>${U.esc(text).replace(/\n/g, '<br>')}</p>
        <div class="confirm-btns"><button class="btn" data-no>取消</button><button class="btn primary" data-yes>${U.esc(okLabel || '确认')}</button></div>`;
      const back = el('div', '');
      back.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(2,6,9,.6)';
      back.appendChild(wrap);
      overlayEl.classList.remove('hidden');
      // use a separate layer on top of existing panel
      let layer = $('#confirm-layer');
      if (!layer) { layer = el('div', ''); layer.id = 'confirm-layer'; overlayEl.appendChild(layer); }
      layer.style.cssText = 'position:absolute;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;background:rgba(2,6,9,.55);backdrop-filter:blur(3px)';
      layer.innerHTML = '';
      layer.appendChild(wrap);
      const done = (v) => { layer.remove(); resolve(v); };
      wrap.querySelector('[data-no]').onclick = () => done(false);
      wrap.querySelector('[data-yes]').onclick = () => done(true);
      layer.addEventListener('click', (e) => { if (e.target === layer) done(false); });
    });
  }

  /* ---------------- save / load ---------------- */
  function openSave(mode) {
    const isSave = mode === 'save';
    const slots = Save.allSlots();
    const auto = isSave ? null : Save.loadSlot('auto');
    const body = el('div', '');
    const grid = el('div', 'save-grid');

    function makeCard(id, data, autoFlag) {
      const card = el('div', 'save-card' + (autoFlag ? ' save-auto' : ''));
      if (!data) {
        card.innerHTML = `<div class="save-empty"><span>${autoFlag ? '自动存档' : '空存档'}</span>${isSave ? '点击保存到这个栏位' : '尚无记录'}</div>`;
        card.addEventListener('click', () => {
          if (isSave) doSave(id, null);
          else Audio.playSfx('error');
        });
        return card;
      }
      const thumb = el('div', 'save-thumb');
      if (data.thumb) thumb.style.backgroundImage = `url(${data.thumb})`;
      thumb.innerHTML = '';
      const meta = el('div', 'save-meta');
      meta.innerHTML = `<div class="save-chapter">${U.esc(data.chapterTitle || '未知章节')}</div>
        <div class="save-preview">${U.esc(data.preview || '')}</div>
        <div class="save-date">${U.formatDate(data.ts)}</div>`;
      card.appendChild(thumb);
      card.appendChild(meta);
      card.addEventListener('click', (e) => {
        if (e.target.closest('.save-del')) return;
        if (isSave) doSave(id, data);
        else doLoad(id, data);
      });
      if (!autoFlag) {
        const del = el('button', 'save-del', '✕');
        del.title = '删除存档';
        del.addEventListener('click', async (e) => {
          e.stopPropagation();
          const ok = await confirmDialog('删除存档', '这个栏位的记录将无法恢复。', '删除');
          if (!ok) return;
          Save.deleteSlot(id);
          openSave(mode);
        });
        card.appendChild(del);
      }
      return card;
    }

    async function doSave(id, existing) {
      if (existing) {
        const ok = await confirmDialog('覆盖存档', '这个栏位已有记录，确定覆盖吗？', '覆盖');
        if (!ok) return;
      }
      if (!Engine.running) { Audio.playSfx('error'); return; }
      const ok = Engine.saveToSlot(id);
      if (ok) {
        Audio.playSfx('select');
        toast('SAVED', '已存档', '', 1800);
        openSave(mode);
      }
    }
    function doLoad(id, data) {
      closeOverlay();
      Audio.playSfx('page');
      Engine.loadSave(data);
    }

    if (!isSave) {
      grid.appendChild(makeCard('auto', auto, true));
    }
    slots.forEach(s => grid.appendChild(makeCard(s.id, s.data, false)));
    body.appendChild(grid);
    const note = el('p', 'end-note', isSave
      ? '六个手动栏位。场景切换与重要抉择时会自动存档。'
      : '读取任意记录。自动存档会在每次进入新场景时更新。');
    body.appendChild(note);
    modal({
      title: isSave ? '存档' : '读档',
      sub: isSave ? 'SAVE' : 'LOAD',
      body,
      foot: `<span>当前进度会记录文字、羁绊与已寻回的记忆</span><span>${Save.SLOTS} SLOTS + AUTO</span>`
    });
  }

  /* ---------------- settings ---------------- */
  function openSettings() {
    const s = Save.settings;
    const body = el('div', '');
    const list = el('div', 'settings-list');
    body.appendChild(list);

    function row(label, sub, control, valueEl) {
      const r = el('div', 'set-row');
      const l = el('div', 'set-label', `${U.esc(label)}${sub ? `<small>${U.esc(sub)}</small>` : ''}`);
      const c = el('div', 'set-control');
      if (typeof control === 'string') c.innerHTML = control;
      else c.appendChild(control);
      const v = el('div', 'set-value', valueEl || '');
      r.appendChild(l); r.appendChild(c); r.appendChild(v);
      list.appendChild(r);
      return { row: r, control: c, value: v };
    }

    function slider(min, max, step, value, onInput) {
      const input = el('input');
      input.type = 'range';
      input.min = min; input.max = max; input.step = step; input.value = value;
      input.addEventListener('input', () => onInput(Number(input.value)));
      return input;
    }

    const speedLabels = (v) => v >= 120 ? '瞬间' : v >= 85 ? '很快' : v >= 55 ? '标准' : v >= 35 ? '舒缓' : '很慢';
    const speed = slider(10, 140, 1, s.textSpeed, v => {
      s.textSpeed = v; Save.setSetting('textSpeed', v);
      speedRow.value.textContent = speedLabels(v);
      Engine.applySettings();
    });
    const speedRow = row('文字速度', 'TEXT SPEED', speed, speedLabels(s.textSpeed));

    const auto = slider(0.3, 3, 0.1, s.autoDelay, v => {
      s.autoDelay = v; Save.setSetting('autoDelay', v);
      autoRow.value.textContent = v.toFixed(1) + '×';
    });
    const autoRow = row('自动播放间隔', 'AUTO DELAY', auto, s.autoDelay.toFixed(1) + '×');

    const bgm = slider(0, 1, 0.01, s.bgm, v => {
      s.bgm = v; Save.setSetting('bgm', v);
      Audio.setVolumes();
      bgmRow.value.textContent = Math.round(v * 100) + '%';
    });
    const bgmRow = row('背景音乐', 'MUSIC VOLUME', bgm, Math.round(s.bgm * 100) + '%');

    const sfx = slider(0, 1, 0.01, s.sfx, v => {
      s.sfx = v; Save.setSetting('sfx', v);
      Audio.setVolumes();
      Audio.playSfx('click');
      sfxRow.value.textContent = Math.round(v * 100) + '%';
    });
    const sfxRow = row('音效与环境音', 'SOUND VOLUME', sfx, Math.round(s.sfx * 100) + '%');

    function toggleRow(label, sub, key, onChange) {
      const t = el('button', 'set-toggle' + (s[key] ? ' on' : ''));
      t.setAttribute('aria-label', label);
      const rowRef = row(label, sub, t, s[key] ? '开启' : '关闭');
      t.addEventListener('click', () => {
        s[key] = !s[key];
        Save.setSetting(key, s[key]);
        t.classList.toggle('on', s[key]);
        rowRef.value.textContent = s[key] ? '开启' : '关闭';
        Audio.playSfx('click');
        if (onChange) onChange(s[key]);
      });
      return t;
    }

    toggleRow('跳过未读文本', 'SKIP UNREAD', 'skipUnread', () => {});
    toggleRow('减少动态效果', 'REDUCE MOTION', 'reduceMotion', (v) => {
      reduceMotion = v;
      Backgrounds.draw(bgCtx, currentBg, 1.6);
    });
    toggleRow('显示羁绊', 'SHOW BOND', 'showBond', (v) => {
      if (v) setBond(State.bond); else hideBond();
    });

    // fullscreen
    const fs = el('button', 'btn', document.fullscreenElement ? '退出全屏' : '进入全屏');
    fs.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen().catch(() => {});
      Audio.playSfx('click');
    });
    row('全屏', 'FULLSCREEN', fs, '');

    const danger = el('div', 'set-danger');
    const resetBtn = el('button', 'btn', '恢复默认设置');
    resetBtn.addEventListener('click', async () => {
      const ok = await confirmDialog('恢复默认', '音量、文字速度等设置将回到初始值。', '恢复');
      if (ok) { Save.resetSettings(); Audio.setVolumes(); openSettings(); }
    });
    const clearBtn = el('button', 'btn danger', '清除全部记录');
    clearBtn.addEventListener('click', async () => {
      const ok = await confirmDialog('清除全部记录', '所有存档、记忆、结局都会消失。\n此操作无法撤销。', '全部清除');
      if (!ok) return;
      Save.resetEverything();
      Audio.setVolumes();
      closeOverlay();
      Main.toTitle();
    });
    const creditsBtn = el('button', 'btn', '制作信息');
    creditsBtn.addEventListener('click', () => { Audio.playSfx('click'); openCredits(); });
    danger.appendChild(resetBtn);
    danger.appendChild(creditsBtn);
    danger.appendChild(clearBtn);
    body.appendChild(danger);

    modal({
      title: '设置', sub: 'SETTINGS', body,
      foot: `<span>设置会自动保存</span><span>ESC 关闭</span>`
    });
  }

  /* ---------------- backlog ---------------- */
  function openBacklog() {
    const rows = Engine.backlog;
    const body = el('div', '');
    if (!rows.length) {
      body.innerHTML = '<div class="bl-empty">还没有可以回忆的对话。</div>';
    } else {
      const list = el('div', 'backlog-list');
      rows.slice(-80).forEach(r => {
        const item = el('div', 'bl-item' + (r.who ? '' : ' narration') + (r.inner ? ' inner' : ''));
        const who = r.who && GameData.CHARS[r.who] ? GameData.CHARS[r.who].name : '';
        item.innerHTML = `<div class="bl-speaker">${U.esc(who)}</div><div class="bl-text">${U.esc(U.plainText(r.text))}</div>`;
        list.appendChild(item);
      });
      body.appendChild(list);
      requestAnimationFrame(() => { body.scrollTop = body.scrollHeight; });
    }
    modal({ title: '记录', sub: 'BACKLOG · 最近的对话', body, cls: '' });
  }

  /* ---------------- memories ---------------- */
  function openMemories() {
    const body = el('div', '');
    const found = Save.global.fragments.filter(id => GameData.FRAGMENTS[id]);
    body.innerHTML = `<div class="mem-progress">已寻回 ${found.length} / 8 段记忆　·　记忆会跨越周目保留</div>`;
    const grid = el('div', 'mem-grid');
    GameData.FRAGMENT_IDS.forEach((id, i) => {
      const f = GameData.FRAGMENTS[id];
      const has = found.includes(id);
      const card = el('div', 'mem-card ' + (has ? 'found' : 'locked'));
      card.innerHTML = `<div class="mem-no">MEMORY ${U.pad(i + 1)}</div>
        <div class="mem-name">${has ? U.esc(f.name) : '未寻回的记忆'}</div>
        <div class="mem-desc">${has ? U.esc(f.desc) : '在汐见町的某个角落，还留着一段关于她的痕迹。'}</div>
        <div class="mem-glyph">${has ? f.glyph : '？'}</div>`;
      if (has) {
        card.addEventListener('click', () => {
          Audio.playSfx('select');
          toast('MEMORY', f.name, f.desc, 4200);
        });
      }
      grid.appendChild(card);
    });
    body.appendChild(grid);
    const note = el('p', 'end-note', '真正的结局，需要八段记忆一起亮起来。');
    body.appendChild(note);
    modal({ title: '记忆', sub: 'MEMORIES', body });
  }

  /* ---------------- endings ---------------- */
  function openEndings() {
    const body = el('div', '');
    const grid = el('div', 'end-grid');
    Object.values(GameData.ENDINGS).forEach(e => {
      const has = Save.hasEnding(e.key);
      const card = el('div', 'end-card ' + (has ? 'unlocked' : 'locked'));
      card.innerHTML = `<div class="end-letter">${e.key === 'TRUE' ? '✦' : e.key}</div>
        <h4>${has ? U.esc(e.title) : '？？？'}</h4>
        <p>${has ? U.esc(e.epi) : '尚未抵达的结局。'}</p>`;
      if (has) card.addEventListener('click', () => toast('ENDING ' + e.key, e.title, e.desc, 5200));
      grid.appendChild(card);
    });
    body.appendChild(grid);
    const note = el('p', 'end-note',
      Save.global.ngPlus
        ? '第二个夏天已经开启。标题画面的「新游戏」将以二周目开始，记忆会保留。'
        : '完成 Ending C 后，会解锁「第二个夏天」。');
    body.appendChild(note);
    modal({ title: '结局', sub: 'ENDINGS', body });
  }

  /* ---------------- notebook ---------------- */
  function openNotebook() {
    const st = State.data;
    const body = el('div', '');
    const local = State.localFragCount();
    const global = State.globalFragCount();
    const chapter = GameData.CHAPTERS[st.chapter] || GameData.CHAPTERS[0];
    const top = el('div', 'note-top');
    top.innerHTML = `
      <div class="note-block"><div class="note-k">Chapter</div><div class="note-v">${U.esc(chapter.title)}<small>${U.esc(chapter.no)}</small></div></div>
      <div class="note-block"><div class="note-k">Bond · 灯</div><div class="note-v">${st.bond} / 10<small>她离你有多近</small></div>
        <div class="note-bars">${Array.from({ length: 10 }, (_, i) => `<i class="${i < Math.min(10, st.bond) ? 'on' : ''}"></i>`).join('')}</div></div>
      <div class="note-block"><div class="note-k">Memories</div><div class="note-v">${local} / 8<small>累计 ${global} / 8</small></div></div>`;
    body.appendChild(top);

    const obj = el('div', 'note-objective');
    obj.innerHTML = `<strong>此刻</strong><br>${U.esc(State.objective())}`;
    body.appendChild(obj);

    const frags = el('div', 'note-frags');
    GameData.FRAGMENT_IDS.forEach(id => {
      const f = GameData.FRAGMENTS[id];
      const has = st.fragments.includes(id);
      const item = el('div', 'note-frag ' + (has ? 'found' : ''));
      item.innerHTML = `<span class="dot"></span><span>${has ? U.esc(f.name) : '？？？'}</span>`;
      frags.appendChild(item);
    });
    body.appendChild(frags);

    const hint = el('p', 'note-hint', '提示：按下 Ctrl 可以快速跳过已读文本。选项会改变「灯」的亮度，也会决定最后一夜你能看见什么。');
    body.appendChild(hint);

    modal({ title: '手记', sub: 'NOTEBOOK', body });
  }

  /* ---------------- menu ---------------- */
  function openMenu() {
    const body = el('div', '');
    body.innerHTML = `<div class="note-objective" style="margin-bottom:18px"><strong>暂停</strong><br>${U.esc(State.objective())}</div>`;
    const grid = el('div', 'end-grid');
    const items = [
      ['继续游戏', '回到这个夏天', () => closeOverlay()],
      ['存档', '保存当前进度', () => openSave('save')],
      ['读档', '回到某个时刻', () => openSave('load')],
      ['设置', '声音、文字与动态效果', () => openSettings()],
      ['手记', '羁绊与记忆', () => openNotebook()],
      ['返回标题', '结束本周目', async () => {
        const ok = await confirmDialog('返回标题', '未保存的进度将会丢失。', '返回标题');
        if (ok) { closeOverlay(); Main.toTitle(); }
      }]
    ];
    items.forEach(([t, d, fn]) => {
      const card = el('div', 'end-card unlocked');
      card.style.cursor = 'pointer';
      card.innerHTML = `<h4>${t}</h4><p>${d}</p>`;
      card.addEventListener('click', () => { Audio.playSfx('click'); fn(); });
      grid.appendChild(card);
    });
    body.appendChild(grid);
    modal({ title: '菜单', sub: 'PAUSE', body });
  }

  /* ---------------- credits ---------------- */
  function openCredits() {
    const body = el('div', 'credits-copy');
    body.innerHTML = `
      <h4>灯塔不眠 / The Lighthouse Never Sleeps</h4>
      <p>一部关于记忆、潮汐与灯光的原创视觉小说。<br>
      全部剧情、代码、像素背景与角色立绘均为本作原创；画面由 Canvas 实时绘制，没有任何图片素材。</p>
      <h4>声音</h4>
      <p>背景音乐来自原作者提供的素材集（<em>SLSMusic</em> 等）。除此之外的音效与环境音，由 Web Audio API 实时合成。</p>
      <h4>操作</h4>
      <p>点击 / 空格 / 回车：推进对话　·　Ctrl：按住快进<br>
      数字键 1–4：选择选项　·　Esc：关闭面板 / 打开菜单</p>
      <h4>写给海</h4>
      <p>“灯不是一个人守的。”<br>感谢你陪他们走到这里。</p>`;
    modal({ title: '制作信息', sub: 'CREDITS', body });
  }

  /* ---------------- helpers ---------------- */
  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  function captureThumb() {
    const c = PX.make(320, 180);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(bgCanvas, 0, 0, 320, 180);
    try { return c.toDataURL('image/jpeg', 0.55); } catch (e) { return ''; }
  }

  function setCinematic(on) { gameEl.classList.toggle('cinematic', !!on); }

  function applyReduceMotion(v) { reduceMotion = v; }

  global.UI = {
    init, setBackground, showTitle, enterGame, updateTitleMeta,
    showChar, hideChar, clearCast, setExpr, focusChar,
    getCastSnapshot, restoreCast,
    setSpeaker, setText, getTextEl, showNext, showDialogue, showQuick,
    setQuickActive, setChapterTag, setBond, hideBond,
    showChoices, hideChoices, toast,
    chapterCard, hideChapterCard, skipChapterCard, showEnding, fadeTo, fadeIn, flash, shake,
    openSave, openSettings, openBacklog, openMemories, openEndings, openNotebook, openMenu, openCredits,
    modal, closeOverlay, isOverlayOpen, setOverlayLock, confirmDialog,
    captureThumb, wait, setCinematic, applyReduceMotion, updateTitleMeta,
    get bgName() { return currentBg; },
    setSpeakerAccent: (c) => document.documentElement.style.setProperty('--speaker-accent', c)
  };
})(window);
