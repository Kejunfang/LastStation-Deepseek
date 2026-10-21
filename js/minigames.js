/* ==========================================================
   LIGHTHOUSE — interactive interludes
   · the hand-drawn town map
   · the attic radio tuner
   ========================================================== */
(function (global) {
  'use strict';
  const { $, el } = U;
  const P = PX;

  /* =========================================================
     MAP
     ========================================================= */
  function drawMap(ctx) {
    const W = 640, H = 360;
    ctx.clearRect(0, 0, W, H);

    // sea
    P.gradBand(ctx, 0, 0, W, H, '#0c2230', '#07111a', 12);
    for (let i = 0; i < 90; i++) {
      const x = (i * 97) % W, y = 40 + (i * 53) % 310;
      ctx.fillStyle = 'rgba(130,180,190,0.12)';
      ctx.fillRect(x, y, 4 + (i % 5) * 3, 1);
    }
    // waves
    for (let i = 0; i < 12; i++) {
      const x = 500 + (i % 4) * 30, y = 80 + i * 22;
      ctx.fillStyle = 'rgba(160,200,205,0.12)';
      ctx.fillRect(x, y, 14, 1);
      ctx.fillRect(x + 4, y - 3, 8, 1);
    }

    // land mass
    const coast = [
      [0, 0], [560, 0], [548, 34], [556, 58], [528, 82], [532, 110],
      [500, 132], [514, 162], [494, 188], [510, 214], [488, 240],
      [478, 268], [496, 300], [470, 322], [480, 360], [0, 360]
    ];
    P.poly(ctx, coast, '#26372f');
    P.poly(ctx, coast.map((p, i) => [p[0] - (i > 0 && i < coast.length - 1 ? 7 : 0), p[1]]), '#1c2a24');
    P.poly(ctx, coast, '#26372f');
    // beach line
    for (let i = 1; i < coast.length - 1; i++) {
      P.line(ctx, coast[i][0] - 2, coast[i][1], coast[i + 1][0] - 2, coast[i + 1][1], 'rgba(190,180,140,0.34)', 1);
    }

    // grassy contours
    const rnd = P.rng(9);
    for (let i = 0; i < 34; i++) {
      const x = 20 + rnd() * 430, y = 20 + rnd() * 320;
      P.ellipse(ctx, x, y, 9 + rnd() * 20, 3 + rnd() * 5, 'rgba(70,100,76,0.25)');
    }

    // roads
    function road(pts) {
      for (let i = 0; i < pts.length - 1; i++) {
        const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
        P.line(ctx, x1, y1, x2, y2, '#8e7f5c', 3);
        P.line(ctx, x1, y1, x2, y2, '#b7a67c', 1);
      }
    }
    road([[120, 200], [160, 208], [200, 228]]);
    road([[120, 200], [128, 150], [130, 122]]);
    road([[200, 228], [300, 210], [360, 170], [410, 120], [424, 96]]);
    road([[200, 228], [320, 250], [420, 252], [470, 260]]);
    road([[424, 96], [470, 118], [515, 150], [540, 176]]);
    road([[130, 122], [120, 200]]);

    // railway / old line
    for (let x = 90; x < 430; x += 8) {
      P.rect(ctx, x, 292, 4, 1, 'rgba(120,110,92,0.5)');
      P.rect(ctx, x + 2, 288, 1, 4, 'rgba(120,110,92,0.5)');
    }

    // old house
    function house(x, y, w, h, roof, wall) {
      P.rect(ctx, x, y, w, h, wall || '#cbbd9c');
      P.poly(ctx, [[x - 3, y], [x + w / 2, y - 8], [x + w + 3, y]], roof || '#7b5040');
      P.rect(ctx, x + 3, y + 4, 3, 3, '#4d5c58');
      P.rect(ctx, x + w - 6, y + 4, 3, 3, '#4d5c58');
    }

    house(100, 168, 26, 18, '#6c4438', '#d2c5a4'); // old house
    // cinema
    P.rect(ctx, 108, 106, 42, 30, '#c9b895');
    P.poly(ctx, [[102, 106], [129, 96], [156, 106]], '#6a4036');
    P.rect(ctx, 112, 112, 34, 9, '#3a2a28');
    P.rect(ctx, 114, 114, 30, 4, 'rgba(240,220,170,0.55)');
    P.rect(ctx, 124, 126, 10, 10, '#4a3530');
    // diner
    P.rect(ctx, 184, 214, 34, 22, '#d5c7a4');
    P.poly(ctx, [[180, 214], [201, 205], [222, 214]], '#7a4a3a');
    for (let i = 0; i < 5; i++) P.rect(ctx, 184 + i * 7, 217, 4, 4, i % 2 ? '#c97b5d' : '#e8dfc4');
    P.rect(ctx, 194, 226, 8, 10, '#5a4438');
    // shrine
    P.rect(ctx, 414, 82, 3, 14, '#b6543f');
    P.rect(ctx, 432, 82, 3, 14, '#b6543f');
    P.rect(ctx, 409, 79, 31, 3, '#c66048');
    P.rect(ctx, 404, 75, 41, 2, '#8e3f30');
    for (let i = 0; i < 5; i++) P.rect(ctx, 414 + i * 4, 96 + i * 4, 22 - i * 4, 2, '#8b8068');
    // trees around shrine
    const tr = P.rng(3);
    for (let i = 0; i < 16; i++) {
      const x = 380 + tr() * 80, y = 40 + tr() * 60;
      P.ellipse(ctx, x, y, 5 + tr() * 4, 7 + tr() * 5, '#1d3527');
    }
    // breakwater
    P.poly(ctx, [[466, 252], [552, 264], [548, 274], [462, 262]], '#6b6a60');
    P.poly(ctx, [[466, 252], [552, 264], [552, 268], [466, 256]], '#928e7c');
    for (let i = 0; i < 6; i++) {
      P.ellipse(ctx, 470 + i * 14, 264 + i * 2, 5, 4, '#4a4b47');
    }
    // lighthouse
    P.rect(ctx, 552, 160, 9, 26, '#dbd7c9');
    P.rect(ctx, 550, 155, 13, 6, '#b35247');
    P.rect(ctx, 554, 150, 5, 6, '#25303a');
    P.glow(ctx, 556, 152, 16, '#ffe1a0', 0.5, 1);

    // forest / hills
    for (let i = 0; i < 26; i++) {
      const x = 10 + rnd() * 190, y = 10 + rnd() * 100;
      P.ellipse(ctx, x, y, 3 + rnd() * 4, 6 + rnd() * 5, 'rgba(22,46,32,0.7)');
    }

    // field lines
    for (let i = 0; i < 9; i++) {
      P.line(ctx, 20 + i * 12, 318, 60 + i * 14, 340, 'rgba(130,125,92,0.18)', 1);
    }

    // map credit
    ctx.font = '8px monospace';
    ctx.fillStyle = 'rgba(220,205,170,0.35)';
    ctx.fillText('SHIOMI-CHO · HAND-DRAWN MAP', 420, 344);

    // compass
    const cx = 592, cy = 52;
    P.ellipse(ctx, cx, cy, 17, 17, 'rgba(0,0,0,0)');
    ctx.strokeStyle = 'rgba(210,195,160,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.stroke();
    P.poly(ctx, [[cx, cy - 14], [cx - 4, cy + 2], [cx, cy - 2]], '#d9c69c');
    P.poly(ctx, [[cx, cy - 14], [cx + 4, cy + 2], [cx, cy - 2]], '#8b7a58');
    ctx.font = '8px serif';
    ctx.fillStyle = 'rgba(220,205,170,0.7)';
    ctx.fillText('N', cx - 3, cy - 20);

    // scale
    P.rect(ctx, 26, 332, 40, 1, 'rgba(220,205,170,0.5)');
    P.rect(ctx, 26, 328, 1, 5, 'rgba(220,205,170,0.5)');
    P.rect(ctx, 66, 328, 1, 5, 'rgba(220,205,170,0.5)');
    ctx.font = '8px monospace';
    ctx.fillStyle = 'rgba(220,205,170,0.55)';
    ctx.fillText('500 m', 72, 336);

    // vignette
    const g = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 420);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function openMap(opts) {
    const st = State.data;
    const body = el('div', 'map-body');
    body.style.padding = '0';
    const canvas = el('canvas');
    canvas.id = 'map-canvas';
    canvas.width = 640; canvas.height = 360;
    body.appendChild(canvas);
    drawMap(canvas.getContext('2d'));

    const hud = el('div', 'map-hud');
    hud.innerHTML = `<div class="map-day">${st.day === 1 ? '第一天' : '第二天'} · 潮声正暖</div>
      <div class="map-slots">今日行程 ${Array.from({ length: 2 }, (_, i) => `<i class="${i < st.visits ? 'on' : ''}"></i>`).join('')}
      <span style="margin-left:8px">还可以去 ${Math.max(0, 2 - st.visits)} 处</span></div>`;
    body.appendChild(hud);

    Object.values(Story.LOCATIONS).forEach(loc => {
      const visited = !!st.flags['visited_' + loc.id];
      const pin = el('button', 'map-pin' + (visited ? ' visited' : ''));
      pin.style.left = loc.x + '%';
      pin.style.top = loc.y + '%';
      pin.innerHTML = `<span class="dot"></span><span class="label">${U.esc(loc.name)}<span class="sub">${visited ? '今天已经去过了' : U.esc(loc.sub)}</span></span>`;
      pin.title = loc.desc;
      pin.addEventListener('click', () => {
        if (visited) return;
        Audio.playSfx('select');
        UI.setOverlayLock(false);
        UI.closeOverlay(true);
        opts.onPick(loc);
      });
      body.appendChild(pin);
    });

    const hint = el('div', 'map-hint', '点击地图上的光点前往 · 每个地点只能去一次');
    body.appendChild(hint);

    UI.modal({
      title: '汐见町', sub: 'TOWN MAP', cls: 'map-panel', body,
      onMount: (panel) => {
        panel.querySelector('.panel-close').style.display = 'none';
        const foot = panel.querySelector('.panel-foot');
        if (foot) foot.remove();
      }
    });
    UI.setOverlayLock(true);
  }

  /* =========================================================
     RADIO
     ========================================================= */
  const STATIONS = [
    {
      freq: 82.4, id: 'keeper_log', title: '灯塔日志', kicker: 'SIGNAL 01 · 23:47',
      text: '八月三十一日。暴风雨。\n灯室第三层玻璃破裂，手动转盘卡死。\n汐崎彻留下，继续转灯。\n23:47，灯灭。\n三分钟后，船进港。\n是我关掉了灯。\n\n——白石源藏'
    },
    {
      freq: 85.7, id: 'unsent_letter', title: '未寄出的信', kicker: 'SIGNAL 02 · 未寄出',
      text: '遥：\n如果你读到这里，说明我又没能说出口。\n那天的电影很好看。你睡着的时候，我一直没敢动。\n你说等灯塔亮起来就回来。我知道你是在安慰我。\n可是我还是想等一等。\n\n要是你回来的时候，我已经不在了，就别找我了。\n去看看海。海会替我记得你。\n\n——灯'
    },
    {
      freq: 88.1, id: 'festival_song', title: '夏祭之歌', kicker: 'SIGNAL 03 · 无题',
      text: '她哼的调子没有名字。\n只有四句，反反复复。\n\n第一句像海浪，第二句像风铃，\n第三句像有人在很远的地方叫你，\n第四句忽然停了。\n\n她说，这是她母亲教她的歌。\n灯守祭那晚，要在灯塔上唱完。'
    }
  ];

  function openRadio(opts) {
    const found = [];
    let freq = 79.0;
    const minF = 76, maxF = 92;
    let lockedView = true;
    let memoryOpen = false;
    let finishing = false;
    let raf = 0;

    const body = el('div', 'radio-body');
    body.innerHTML = `
      <div class="radio-left">
        <div class="radio-face">
          <div class="freq-display">
            <div><span class="freq-num" id="freq-num">79.0</span><span class="freq-unit">MHz</span></div>
            <div class="signal-led" id="signal-led"><i></i><span id="signal-text">NO SIGNAL</span></div>
          </div>
          <canvas id="dial-canvas" width="660" height="190"></canvas>
          <div class="radio-knobs">
            <div class="knob-group"><div class="knob"></div><div class="knob"></div></div>
            <div class="radio-actions">
              <button class="radio-btn" id="radio-lock">锁定信号</button>
            </div>
          </div>
        </div>
        <div class="radio-scope"><canvas id="scope-canvas" width="660" height="64"></canvas></div>
      </div>
      <div class="radio-right">
        <h3>夜里的三个频率</h3>
        <div class="radio-log" id="radio-log">
          ${STATIONS.map((s, i) => `<div class="station" data-i="${i}"><span><b>${s.freq.toFixed(1)}</b>　未知信号</span><span class="check"></span></div>`).join('')}
        </div>
        <div class="radio-tip">拖动刻度，或使用 ← → 调频。<br>当指示灯亮起时，按 Enter 收录。<br><br>「有些声音，只有愿意听的人才能听见。」</div>
      </div>`;

    const res = UI.modal({
      title: '旧收音机', sub: 'SANDSTORM · SHORTWAVE', cls: 'radio-panel', body,
      onClose: () => { cleanup(); }
    });
    res.panel.querySelector('.panel-close').style.display = 'none';
    res.panel.querySelector('.panel-head').style.paddingBottom = '14px';
    UI.setOverlayLock(true);

    const dial = body.querySelector('#dial-canvas');
    const dctx = dial.getContext('2d');
    const scope = body.querySelector('#scope-canvas');
    const sctx = scope.getContext('2d');
    const freqEl = body.querySelector('#freq-num');
    const led = body.querySelector('#signal-led');
    const sigText = body.querySelector('#signal-text');
    const lockBtn = body.querySelector('#radio-lock');

    Audio.startStatic();

    function nearestGap() {
      let best = 999;
      for (const st of STATIONS) {
        if (found.includes(st.id)) continue;
        best = Math.min(best, Math.abs(st.freq - freq));
      }
      return best;
    }

    function setFreq(v) {
      freq = U.clamp(Math.round(v * 10) / 10, minF, maxF);
      freqEl.textContent = freq.toFixed(1);
      const gap = nearestGap();
      const strength = gap > 2.2 ? 0 : Math.pow(U.clamp(1 - gap / 2.2, 0, 1), 1.4);
      led.classList.toggle('on', gap <= 0.45);
      sigText.textContent = gap <= 0.45 ? 'SIGNAL FOUND' : (strength > 0.25 ? 'WEAK SIGNAL' : 'NO SIGNAL');
      Audio.setStaticLevel(0.9 - strength * 0.75);
    }

    function drawDial() {
      const w = 660, h = 190;
      dctx.clearRect(0, 0, w, h);
      dctx.fillStyle = '#0d0a07';
      dctx.fillRect(0, 0, w, h);
      const x0 = 30, x1 = 630, y = 92;
      // glow band
      const g = dctx.createLinearGradient(0, 40, 0, 140);
      g.addColorStop(0, 'rgba(255,190,110,0.02)');
      g.addColorStop(0.5, 'rgba(255,190,110,0.06)');
      g.addColorStop(1, 'rgba(255,190,110,0.02)');
      dctx.fillStyle = g;
      dctx.fillRect(x0, 40, x1 - x0, 100);
      // ticks
      for (let f = minF; f <= maxF + 0.001; f += 0.2) {
        const x = x0 + ((f - minF) / (maxF - minF)) * (x1 - x0);
        const major = Math.abs(f - Math.round(f)) < 0.01;
        const mid = Math.abs((f * 10) % 10) < 0.01 && Math.round(f * 10) % 5 === 0;
        dctx.fillStyle = major ? 'rgba(240,205,150,0.75)' : 'rgba(200,160,110,0.35)';
        dctx.fillRect(Math.round(x), y - (major ? 12 : mid ? 8 : 4), 1, major ? 12 : mid ? 8 : 4);
        if (major && Math.round(f) % 2 === 0) {
          dctx.font = '10px monospace';
          dctx.fillStyle = 'rgba(232,198,142,0.8)';
          dctx.fillText(f.toFixed(0), Math.round(x) - 6, y + 24);
        }
      }
      // baseline
      dctx.fillStyle = 'rgba(220,180,120,0.4)';
      dctx.fillRect(x0, y, x1 - x0, 1);
      // found station marks
      STATIONS.forEach(st => {
        if (!found.includes(st.id)) return;
        const x = x0 + ((st.freq - minF) / (maxF - minF)) * (x1 - x0);
        dctx.fillStyle = 'rgba(120,220,180,0.7)';
        dctx.fillRect(Math.round(x) - 1, y - 16, 2, 32);
        dctx.font = '8px monospace';
        dctx.fillStyle = 'rgba(150,230,195,0.8)';
        dctx.fillText('LOCK', Math.round(x) - 10, y - 22);
      });
      // need
      const nx = x0 + ((freq - minF) / (maxF - minF)) * (x1 - x0);
      dctx.fillStyle = 'rgba(255,220,160,0.9)';
      dctx.beginPath();
      dctx.moveTo(nx, y - 34);
      dctx.lineTo(nx - 6, y - 46);
      dctx.lineTo(nx + 6, y - 46);
      dctx.closePath();
      dctx.fill();
      dctx.fillRect(Math.round(nx), y - 34, 1, 60);
      dctx.shadowColor = 'rgba(255,190,110,0.8)';
      dctx.shadowBlur = 10;
      dctx.fillStyle = 'rgba(255,225,170,0.95)';
      dctx.fillRect(Math.round(nx), y - 50, 1, 8);
      dctx.shadowBlur = 0;
      // scale label
      dctx.font = '9px monospace';
      dctx.fillStyle = 'rgba(190,150,100,0.5)';
      dctx.fillText('76', x0 - 8, y + 44);
      dctx.fillText('92', x1 - 8, y + 44);
      dctx.fillText('FM / MHz', x0, 30);
    }

    function drawScope(t) {
      const w = 660, h = 64;
      sctx.fillStyle = '#080b07';
      sctx.fillRect(0, 0, w, h);
      const gap = nearestGap();
      const strength = gap > 2.2 ? 0 : Math.pow(U.clamp(1 - gap / 2.2, 0, 1), 1.4);
      sctx.beginPath();
      for (let x = 0; x < w; x += 3) {
        const n = Math.sin(x * 1.7 + t * 90) * Math.cos(x * 0.37 + t * 33);
        const flat = Math.sin(x * 0.05 + t * 6) * (1 - strength) * 1.5 + n * (1 - strength) * 9;
        const wave = Math.sin(x * 0.11 + t * 9) * 13 * strength + Math.sin(x * 0.031 + t * 3) * 5 * strength;
        const y = h / 2 + wave + flat;
        if (x === 0) sctx.moveTo(x, y); else sctx.lineTo(x, y);
      }
      sctx.strokeStyle = strength > 0.4 ? 'rgba(140,230,190,0.85)' : 'rgba(180,200,150,0.32)';
      sctx.lineWidth = 1;
      sctx.stroke();
      // grid
      sctx.fillStyle = 'rgba(120,150,100,0.12)';
      for (let y = 0; y < h; y += 16) sctx.fillRect(0, y, w, 1);
      for (let x = 0; x < w; x += 60) sctx.fillRect(x, 0, 1, h);
    }

    function loop(t) {
      drawDial();
      drawScope(t / 1000);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    setFreq(79.0);

    function pointerToFreq(e) {
      const r = dial.getBoundingClientRect();
      const x = U.clamp(e.clientX - r.left, 0, r.width);
      const pad = r.width * (30 / 660);
      const usable = r.width * (600 / 660);
      return minF + (U.clamp(x - pad, 0, usable) / usable) * (maxF - minF);
    }
    let dragging = false;
    dial.addEventListener('pointerdown', (e) => {
      if (memoryOpen) return;
      dragging = true;
      dial.setPointerCapture(e.pointerId);
      Audio.playSfx('radio');
      setFreq(pointerToFreq(e));
    });
    dial.addEventListener('pointermove', (e) => {
      if (!dragging || memoryOpen) return;
      setFreq(pointerToFreq(e));
    });
    dial.addEventListener('pointerup', () => { dragging = false; });

    function collect() {
      if (memoryOpen || finishing) return;
      const st = STATIONS.find(s => !found.includes(s.id) && Math.abs(s.freq - freq) <= 0.45);
      if (!st) {
        Audio.playSfx('error');
        sigText.textContent = 'NOT TUNED';
        led.classList.remove('on');
        setTimeout(() => setFreq(freq), 500);
        return;
      }
      found.push(st.id);
      Audio.playSfx('radio');
      Audio.setStaticLevel(0.02);
      showMemory(st);
    }

    function showMemory(st) {
      memoryOpen = true;
      const inner = el('div', 'radio-memory');
      inner.innerHTML = `<div class="radio-memory-inner">
        <div class="radio-memory-kicker">${U.esc(st.kicker)}</div>
        <div class="radio-memory-title">${U.esc(st.title)}</div>
        <div class="radio-memory-text">${U.esc(st.text)}</div>
        <button class="radio-memory-next">收下这段记忆　→</button>
      </div>`;
      res.panel.appendChild(inner);
      inner.querySelector('.radio-memory-next').addEventListener('click', () => {
        Audio.playSfx('fragment');
        inner.remove();
        memoryOpen = false;
        const row = body.querySelector(`.station[data-i="${STATIONS.indexOf(st)}"]`);
        if (row) {
          row.classList.add('found');
          row.querySelector('span').innerHTML = `<b>${st.freq.toFixed(1)}</b>　${U.esc(st.title)}`;
          row.querySelector('.check').textContent = '◆';
        }
        setFreq(freq);
        if (found.length === STATIONS.length) {
          setTimeout(showFinish, 500);
        }
      });
    }

    function showFinish() {
      finishing = true;
      Audio.stopStatic();
      const inner = el('div', 'radio-memory');
      inner.innerHTML = `<div class="radio-memory-inner">
        <div class="radio-memory-kicker">SIGNAL COMPLETE</div>
        <div class="radio-memory-title">三段杂音，拼成同一段过去</div>
        <div class="radio-memory-text">灯塔日志里的 23:47。\n没有寄出的信。\n一首没有唱完的歌。\n\n它们都在说同一件事：\n有一个人，在这座灯塔上等了十年。</div>
        <button class="radio-memory-next">放下耳机　→</button>
      </div>`;
      res.panel.appendChild(inner);
      inner.querySelector('.radio-memory-next').addEventListener('click', () => {
        Audio.playSfx('chime');
        UI.setOverlayLock(false);
        UI.closeOverlay(true);
        cleanup();
        opts.onComplete(found.slice());
      });
    }

    function cleanup() {
      cancelAnimationFrame(raf);
      Audio.stopStatic();
      UI.setOverlayLock(false);
    }

    function onKey(e) {
      if (memoryOpen) return;
      if (e.key === 'ArrowLeft') { setFreq(freq - (e.shiftKey ? 0.5 : 0.1)); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { setFreq(freq + (e.shiftKey ? 0.5 : 0.1)); e.preventDefault(); }
      else if (e.key === 'Enter' || e.key === ' ') { collect(); e.preventDefault(); }
    }
    window.addEventListener('keydown', onKey);
    const oldCleanup = cleanup;
    cleanup = () => { window.removeEventListener('keydown', onKey); oldCleanup(); };
    lockBtn.addEventListener('click', collect);
    UI.setOverlayLock(true);
  }

  global.Mini = { openMap, openRadio, STATIONS };
})(window);
