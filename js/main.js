/* ==========================================================
   LIGHTHOUSE — entry point & global input
   ========================================================== */
(function (global) {
  'use strict';

  let booted = false;

  async function boot() {
    if (booted) return;
    booted = true;

    Save.init();
    Audio.init();
    UI.init();

    const bootEl = document.getElementById('boot');
    setTimeout(() => {
      bootEl.style.opacity = '0';
      setTimeout(() => bootEl.classList.add('hidden'), 800);
    }, 380);

    UI.setBackground('title_night', { instant: true });
    UI.showTitle();
    Audio.playMusic('title', 2.4);
    bind();

  }

  function bind() {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // click anywhere in the game (except chrome) advances
    const game = document.getElementById('screen-game');
    game.addEventListener('click', (e) => {
      if (UI.isOverlayOpen()) return;
      if (e.target.closest('button')) return;
      if (e.target.closest('#dialogue-wrap')) return;
      if (e.target.closest('#choices')) return;
      if (document.getElementById('ending-card').classList.contains('show')) return;
      Engine.advance();
    });
  }

  function onKeyDown(e) {
    // overlays first
    if (UI.isOverlayOpen()) {
      if (e.key === 'Escape') { e.preventDefault(); UI.closeOverlay(); }
      return;
    }

    const ending = document.getElementById('ending-card');
    if (ending.classList.contains('show')) {
      if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        const btn = document.getElementById('ec-return');
        if (btn) btn.click();
      }
      return;
    }

    if (e.key === 'Escape') {
      if (Engine.running) { e.preventDefault(); UI.openMenu(); }
      return;
    }

    if (e.key === 'Control' && !e.repeat) {
      Engine.setCtrlSkip(true);
      return;
    }

    const choicesVisible = !document.getElementById('choices').classList.contains('hidden');
    if (choicesVisible) {
      const m = e.key.match(/^([1-4])$/);
      if (m) {
        const btn = document.querySelectorAll('#choice-list .choice')[Number(m[1]) - 1];
        if (btn) { e.preventDefault(); btn.click(); }
      }
      return;
    }

    if (e.code === 'Space' || e.key === 'Enter') {
      e.preventDefault();
      Engine.handleKey(e);
    }
  }

  function onKeyUp(e) {
    if (e.key === 'Control') Engine.setCtrlSkip(false);
  }

  async function startNewGame(skipFade) {
    Audio.unlock();
    Audio.playSfx('select');
    if (!skipFade) await UI.fadeTo(1, 480);
    document.getElementById('screen-title').classList.add('hidden');
    document.getElementById('screen-game').classList.remove('hidden');
    UI.clearCast();
    UI.setCinematic(false);
    Engine.startNewGame();
    if (Save.global.ngPlus) UI.toast('SECOND SUMMER', '第二个夏天', '八段记忆已经保留。', 3600);
    await UI.wait(280);
    UI.fadeIn(skipFade ? 300 : 900);
  }

  async function continueGame() {
    const latest = Save.latest();
    if (!latest) {
      UI.toast('CONTINUE', '还没有留下脚印', '先开始一个新游戏吧。', 2400);
      return;
    }
    Audio.unlock();
    await UI.fadeTo(1, 420);
    UI.closeOverlay(true);
    await Engine.loadSave(latest.data);
    UI.fadeIn(800);
  }

  async function toTitle() {
    Engine.stop();
    Audio.setAmbience(null);
    await UI.fadeTo(1, 520);
    UI.closeOverlay(true);
    document.getElementById('screen-game').classList.add('hidden');
    UI.showTitle();
    UI.setBackground('title_night', { instant: true });
    Audio.playMusic('title', 1.8);
    UI.fadeIn(850);
  }

  global.Main = { boot, startNewGame, continueGame, toTitle };
  global.LH = { Save, State, Story, Engine, UI, Mini, Audio, GameData };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
