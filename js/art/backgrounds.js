/* ==========================================================
   LIGHTHOUSE / procedural backgrounds
   Every scene is painted from primitives at 640x360.
   ========================================================== */
(function (global) {
  'use strict';
  const P = PX;
  const W = 640, H = 360;

  /* ---------- shared pieces ---------- */
  function sky(ctx, stops, y0, y1) {
    const n = stops.length - 1;
    for (let i = 0; i < n; i++) {
      const a = y0 + (y1 - y0) * (i / n);
      const b = y0 + (y1 - y0) * ((i + 1) / n);
      P.gradBand(ctx, 0, a, W, b - a, stops[i], stops[i + 1], Math.max(2, Math.round(b - a)));
    }
  }

  function stars(ctx, t, count, seed, maxY, alpha) {
    const rnd = P.rng(seed);
    for (let i = 0; i < count; i++) {
      const x = Math.floor(rnd() * W);
      const y = Math.floor(rnd() * maxY);
      const ph = rnd() * 6.283;
      const a = (0.35 + 0.65 * Math.abs(Math.sin(t * 0.7 + ph))) * (alpha || 1);
      ctx.fillStyle = P.rgba(i % 7 === 0 ? '#ffe6b4' : '#dceaff', a);
      ctx.fillRect(x, y, i % 11 === 0 ? 2 : 1, 1);
      if (i % 17 === 0) {
        ctx.fillRect(x - 1, y, 3, 1);
        ctx.fillRect(x, y - 1, 1, 3);
      }
    }
  }

  function moon(ctx, x, y, r, color) {
    P.glow(ctx, x, y, r * 4, color, 0.18, 1);
    P.ellipse(ctx, x, y, r, r, color);
    P.ellipse(ctx, x - r * 0.35, y - r * 0.15, r * 0.18, r * 0.16, P.rgba('#b9c3cf', 0.45));
    P.ellipse(ctx, x + r * 0.2, y + r * 0.35, r * 0.12, r * 0.1, P.rgba('#b9c3cf', 0.35));
    P.ellipse(ctx, x + r * 0.3, y - r * 0.3, r * 0.09, r * 0.08, P.rgba('#c8d2dc', 0.35));
  }

  function sea(ctx, horizon, t, top, bottom, shimmer, opts) {
    opts = opts || {};
    P.gradBand(ctx, 0, horizon, W, H - horizon, top, bottom, 18);
    // horizontal wave flecks
    const rnd = P.rng(opts.seed || 21);
    const n = opts.amount || 80;
    for (let i = 0; i < n; i++) {
      const x = Math.floor(rnd() * W);
      const y = horizon + Math.floor(rnd() * (H - horizon));
      const len = 2 + Math.floor(rnd() * 10);
      const drift = Math.sin(t * (0.3 + rnd() * 0.5) + x * 0.03) * 3;
      const a = 0.12 + rnd() * 0.3;
      ctx.fillStyle = P.rgba(shimmer, a);
      ctx.fillRect(Math.floor(x + drift), y, len, 1);
    }
    // horizon line
    ctx.fillStyle = P.rgba(shimmer, 0.35);
    ctx.fillRect(0, horizon, W, 1);
  }

  function moonPath(ctx, x, horizon, t, color) {
    for (let y = horizon + 2; y < H; y += 2) {
      const p = (y - horizon) / (H - horizon);
      const w = 8 + p * 70;
      const wob = Math.sin(t * 1.1 + y * 0.2) * 3;
      ctx.fillStyle = P.rgba(color, 0.22 * (1 - p * 0.55));
      const seg = 3 + Math.floor(Math.sin(y * 0.7 + t) * 2 + 3);
      ctx.fillRect(Math.floor(x - w / 2 + wob), y, seg, 1);
      ctx.fillRect(Math.floor(x + w / 4 - wob), y, seg, 1);
    }
  }

  function townline(ctx, y, color, seed, windows, scale) {
    const rnd = P.rng(seed);
    let x = -10;
    while (x < W + 10) {
      const w = (10 + rnd() * 26) * (scale || 1);
      const h = (6 + rnd() * 18) * (scale || 1);
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x), Math.round(y - h), Math.round(w), Math.round(h));
      // roof
      P.poly(ctx, [[x, y - h], [x + w / 2, y - h - 4], [x + w, y - h]], color);
      if (windows) {
        for (let i = 0; i < 3; i++) {
          if (rnd() > 0.55) {
            const wx = x + 2 + rnd() * (w - 5);
            const wy = y - h + 3 + rnd() * (h - 6);
            ctx.fillStyle = P.rgba('#ffd18a', 0.35 + rnd() * 0.5);
            ctx.fillRect(Math.round(wx), Math.round(wy), 1, 1);
          }
        }
      }
      x += w + rnd() * 3;
    }
  }

  function lighthouse(ctx, x, baseY, h, opts) {
    opts = opts || {};
    const wBottom = h * 0.20, wTop = h * 0.115;
    const topY = baseY - h;
    const dark = opts.dark || '#1b2638';
    const body = opts.body || '#e7e6e0';
    const shade = opts.shade || '#b8bcc4';
    const band = opts.band || '#b4574e';
    // rock base
    P.poly(ctx, [[x - wBottom * 1.1, baseY], [x - wBottom * 0.7, baseY - 8], [x + wBottom * 0.7, baseY - 8], [x + wBottom * 1.1, baseY]], dark);
    // tower
    P.poly(ctx, [
      [x - wBottom / 2, baseY - 6], [x - wTop / 2, topY + h * 0.14],
      [x + wTop / 2, topY + h * 0.14], [x + wBottom / 2, baseY - 6]
    ], body);
    // shading
    P.poly(ctx, [
      [x - wBottom / 2, baseY - 6], [x - wTop / 2, topY + h * 0.14],
      [x - wTop / 2 + wTop * 0.38, topY + h * 0.14], [x - wBottom / 2 + wBottom * 0.38, baseY - 6]
    ], shade);
    // red band
    P.poly(ctx, [
      [x - wBottom * 0.42, baseY - h * 0.34], [x - wBottom * 0.35, baseY - h * 0.42],
      [x + wBottom * 0.35, baseY - h * 0.42], [x + wBottom * 0.42, baseY - h * 0.34]
    ], band);
    // gallery
    const gy = topY + h * 0.13;
    P.rect(ctx, x - wTop * 0.95, gy, wTop * 1.9, 3, dark);
    P.rect(ctx, x - wTop * 0.7, gy - 2, wTop * 1.4, 2, shade);
    // lamp room
    const lh = h * 0.13;
    P.rect(ctx, x - wTop * 0.52, gy - lh, wTop * 1.04, lh, opts.lampOff ? dark : '#202b3b');
    if (!opts.lampOff) {
      const glow = opts.lampColor || '#ffe4a3';
      P.glow(ctx, x, gy - lh / 2, h * 0.30, glow, 0.5, 1);
      P.rect(ctx, x - wTop * 0.35, gy - lh + 2, wTop * 0.7, lh - 4, glow);
      P.rect(ctx, x - wTop * 0.23, gy - lh + 3, wTop * 0.46, lh - 7, '#fff6d8');
    } else {
      P.rect(ctx, x - wTop * 0.30, gy - lh + 3, wTop * 0.6, lh - 6, '#26313f');
    }
    // mullions
    P.rect(ctx, x - 1, gy - lh, 2, lh, dark);
    P.rect(ctx, x - wTop * 0.52, gy - lh / 2, wTop * 1.04, 1, dark);
    // roof
    P.poly(ctx, [[x - wTop * 0.72, gy - lh], [x, gy - lh - h * 0.055], [x + wTop * 0.72, gy - lh]], opts.roof || dark);
    // finial
    P.rect(ctx, x - 1, gy - lh - h * 0.075, 2, h * 0.03, dark);
    // tiny railing posts
    for (let i = -2; i <= 2; i++) {
      P.rect(ctx, x + i * wTop * 0.32, gy - 5, 1, 4, dark);
    }
    return { lampX: x, lampY: gy - lh / 2, gy, topY };
  }

  function cliff(ctx, y, color, seed, tall) {
    const rnd = P.rng(seed);
    P.poly(ctx, [[0, H], [0, y + 8], [60, y], [130, y + 18], [210, y + 6], [300, y + 24], [420, y + 10], [520, y + 20], [640, y + 2], [640, H]], color);
    for (let i = 0; i < 40; i++) {
      const x = rnd() * W;
      const yy = y + rnd() * 30;
      ctx.fillStyle = P.rgba('#000000', 0.08);
      ctx.fillRect(x, yy, 2 + rnd() * 8, 1);
    }
    if (tall) {
      for (let i = 0; i < 30; i++) {
        const x = 20 + rnd() * 600;
        const yy = y + 4 + rnd() * 8;
        P.line(ctx, x, yy, x + (rnd() - 0.5) * 4, yy - 6 - rnd() * 12, P.rgba('#26313a', 0.75), 1);
      }
    }
  }

  function gulls(ctx, t, n, seed, baseY) {
    const rnd = P.rng(seed);
    for (let i = 0; i < n; i++) {
      const x = ((rnd() * W + t * (8 + rnd() * 8)) % (W + 80)) - 40;
      const y = baseY + rnd() * 60 + Math.sin(t * 0.9 + i) * 4;
      const s = 2 + Math.round(rnd() * 2);
      ctx.fillStyle = 'rgba(30,36,44,0.55)';
      ctx.fillRect(x - s, y, s, 1);
      ctx.fillRect(x + 1, y, s, 1);
      ctx.fillRect(x, y - 1, 1, 1);
    }
  }

  function waves(ctx, y, t, color, alpha, count) {
    for (let i = 0; i < (count || 26); i++) {
      const p = i / (count || 26);
      const yy = y + p * (H - y);
      const off = Math.sin(t * (0.6 + p) + i * 1.7) * (8 + p * 30);
      const len = 10 + p * 70;
      ctx.fillStyle = P.rgba(color, (alpha || 0.25) * (0.4 + p * 0.6));
      ctx.fillRect(Math.floor(120 + off + p * 300), Math.floor(yy), Math.floor(len), 1 + (p > 0.7 ? 1 : 0));
    }
  }

  function rain(ctx, t, density, alpha, slant) {
    const n = density || 90;
    ctx.fillStyle = P.rgba('#cfe2f0', alpha || 0.22);
    for (let i = 0; i < n; i++) {
      const seed = i * 97.13;
      const x = (seed * 37 % (W + 100)) - 50 + ((t * 380 + i * 13) % 40) * (slant || 0.2);
      const y = (t * 420 + i * 53) % (H + 40) - 20;
      const len = 4 + (i % 5) * 3;
      for (let k = 0; k < len; k++) ctx.fillRect(Math.floor(x + k * (slant || 0.2)), Math.floor(y + k), 1, 1);
    }
  }

  function fireflies(ctx, t, n, seed) {
    const rnd = P.rng(seed);
    for (let i = 0; i < n; i++) {
      const bx = rnd() * W, by = 200 + rnd() * 140;
      const x = bx + Math.sin(t * (0.3 + rnd() * 0.5) + i) * 18;
      const y = by + Math.cos(t * (0.25 + rnd() * 0.4) + i * 2) * 9;
      const a = 0.25 + 0.55 * Math.abs(Math.sin(t * 0.9 + i));
      P.glow(ctx, x, y, 4, '#ffdf9a', a * 0.5, 1);
      ctx.fillStyle = P.rgba('#fff3c4', a);
      ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }
  }

  function vignette(ctx) {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.85);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function dust(ctx, t, n, seed) {
    const rnd = P.rng(seed);
    for (let i = 0; i < n; i++) {
      const x = (rnd() * W + Math.sin(t * 0.2 + i) * 8) % W;
      const y = (rnd() * H + t * (2 + rnd() * 3)) % H;
      ctx.fillStyle = P.rgba('#ffe8bb', 0.12 + rnd() * 0.2);
      ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }
  }

  function fireworks(ctx, t, x, y, hue) {
    const cyc = (t + x * 0.01) % 3.4;
    if (cyc > 1.2) return;
    const p = cyc / 1.2;
    const r = 6 + p * 46;
    const a = (1 - p) * 0.9;
    for (let i = 0; i < 22; i++) {
      const ang = (i / 22) * Math.PI * 2;
      const xx = x + Math.cos(ang) * r;
      const yy = y + Math.sin(ang) * r * 0.85;
      ctx.fillStyle = P.rgba(hue, a * (i % 2 ? 0.5 : 0.9));
      ctx.fillRect(Math.round(xx), Math.round(yy), 1, 1);
      if (i % 4 === 0) ctx.fillRect(Math.round(xx), Math.round(yy) - 1, 1, 2);
    }
    P.glow(ctx, x, y, r * 0.5, hue, a * 0.12, 1);
  }

  /* =========================================================
     Scenes
     ========================================================= */
  const scenes = {

    /* ---------- title: night lighthouse ---------- */
    title_night(ctx, t) {
      sky(ctx, ['#04060e', '#0a1122', '#152641', '#243b57'], 0, 214);
      stars(ctx, t, 120, 4, 200, 0.9);
      moon(ctx, 398, 62, 17, '#f4efd9');
      // thin clouds
      for (let i = 0; i < 4; i++) {
        const x = ((i * 190 - t * 4) % (W + 260)) - 130;
        P.cloud(ctx, x, 96 + i * 17, 180, 24, P.rgba('#7f95b5', 0.10), P.rgba('#3d516e', 0.10));
      }
      // sea
      sea(ctx, 214, t, '#0d1b30', '#050a14', '#a9c8e8', { seed: 9, amount: 70 });
      moonPath(ctx, 398, 216, t, '#ffeec9');
      // distant town
      townline(ctx, 216, '#0a1424', 11, true, 0.8);
      // headland
      P.poly(ctx, [[0, 252], [120, 236], [250, 248], [360, 240], [450, 250], [640, 238], [640, 360], [0, 360]], '#070d18');
      // lighthouse on the point
      const lh = lighthouse(ctx, 505, 262, 148, { body: '#cfd3d8', shade: '#8c95a3', band: '#a55048', roof: '#121a28', dark: '#0b1220', lampColor: '#ffdf9a' });
      // rotating beams
      const ang = Math.sin(t * 0.28) * 0.55 + Math.PI;
      P.beam(ctx, lh.lampX, lh.lampY, ang - 0.05, 380, 0.12, '#ffe6a6', 0.05);
      P.beam(ctx, lh.lampX, lh.lampY, ang + Math.PI - 0.05, 380, 0.12, '#ffe6a6', 0.05);
      P.beam(ctx, lh.lampX, lh.lampY, ang, 280, 0.02, '#fff1c8', 0.10);
      P.beam(ctx, lh.lampX, lh.lampY, ang + Math.PI, 280, 0.02, '#fff1c8', 0.10);
      // foreground cliff + grass
      P.poly(ctx, [[0, 360], [0, 315], [60, 302], [150, 318], [240, 309], [330, 330], [390, 322], [430, 360]], '#050a12');
      for (let i = 0; i < 26; i++) {
        const x = (i * 31) % 420;
        const y = 314 + Math.sin(i * 2.3) * 8;
        P.line(ctx, x, y, x + (i % 2 ? 3 : -3), y - 7 - (i % 4), P.rgba('#1a2632', 0.9), 1);
      }
      // tiny boat
      const bx = 250 + Math.sin(t * 0.18) * 6;
      ctx.fillStyle = '#060c16';
      ctx.fillRect(bx, 224, 7, 2);
      ctx.fillRect(bx + 3, 218, 1, 6);
      ctx.fillStyle = P.rgba('#ffd9a0', 0.8);
      ctx.fillRect(bx + 3, 217, 1, 1);
      vignette(ctx);
      P.gradBand(ctx, 0, 300, W, 60, 'rgba(0,0,0,0)', 'rgba(0,0,0,0.55)', 12);
    },

    /* ---------- ferry at dusk ---------- */
    ferry_dusk(ctx, t) {
      sky(ctx, ['#2c3a63', '#7a5a72', '#d08a78', '#f2c08a'], 0, 226);
      // sun
      P.glow(ctx, 424, 196, 90, '#ffd9a0', 0.22, 1);
      P.ellipse(ctx, 424, 196, 19, 19, '#ffe6b6');
      // clouds
      for (let i = 0; i < 6; i++) {
        const x = ((i * 160 - t * 5) % (W + 240)) - 120;
        const c = i % 2 ? 'rgba(255,206,170,0.30)' : 'rgba(93,85,113,0.35)';
        P.cloud(ctx, x, 52 + i * 24, 150, 30, c, 'rgba(120,96,112,0.22)');
      }
      // sea
      sea(ctx, 226, t, '#6d5e78', '#1c2740', '#ffd9b0', { seed: 14, amount: 90 });
      // sun path
      moonPath(ctx, 424, 226, t, '#ffe0ae');
      // distant town and lighthouse
      townline(ctx, 228, '#2a2e40', 22, true, 0.7);
      lighthouse(ctx, 150, 230, 52, { body: '#4a4a58', shade: '#333544', band: '#4a4a58', roof: '#2a2e40', dark: '#2a2e40', lampOff: true });
      gulls(ctx, t, 5, 3, 100);
      // ferry railing / deck (foreground)
      P.poly(ctx, [[0, 300], [W, 286], [W, 360], [0, 360]], '#191b28');
      P.rect(ctx, 0, 296, W, 5, '#2b2c3a');
      P.rect(ctx, 0, 286, W, 3, '#3a3a48');
      for (let x = 30; x < W; x += 96) {
        P.rect(ctx, x, 236, 5, 68, '#232432');
        P.rect(ctx, x + 1, 236, 1, 64, '#4a4a5e');
        // wire
        P.line(ctx, x, 242, x + 96, 240, 'rgba(40,42,54,0.9)', 1);
      }
      P.rect(ctx, 0, 252, W, 4, '#232432');
      // wake
      for (let i = 0; i < 12; i++) {
        const x = (i * 83 + t * 18) % W;
        P.rect(ctx, x, 312 + (i % 3) * 6, 20 + i * 2, 1, 'rgba(230,215,200,0.10)');
      }
      vignette(ctx);
    },

    /* ---------- town slope, day ---------- */
    town_day(ctx, t) {
      sky(ctx, ['#5f9ec4', '#8fc0d4', '#d7e7da'], 0, 168);
      P.glow(ctx, 520, 60, 120, '#fff4d6', 0.30, 1);
      // clouds
      for (let i = 0; i < 5; i++) {
        const x = ((i * 190 + t * 3) % (W + 300)) - 160;
        P.cloud(ctx, x, 40 + (i % 3) * 30, 170, 34, 'rgba(255,255,255,0.82)', 'rgba(197,215,218,0.55)');
      }
      // distant hills
      P.poly(ctx, [[0, 160], [90, 138], [190, 152], [300, 130], [420, 150], [540, 136], [640, 150], [640, 210], [0, 210]], '#7fa49c');
      P.poly(ctx, [[0, 168], [120, 154], [240, 166], [380, 148], [520, 164], [640, 156], [640, 210], [0, 210]], '#5f897f');
      // sea between hills
      P.rect(ctx, 0, 188, W, 30, '#4f8fa5');
      for (let i = 0; i < 30; i++) {
        const x = (i * 31 + t * 4) % W;
        P.rect(ctx, x, 192 + (i % 7) * 3, 5 + (i % 4) * 2, 1, 'rgba(205,238,240,0.35)');
      }
      // grassy slope below the town
      P.gradBand(ctx, 0, 208, W, 62, '#74866c', '#596b54', 14);
      for (let i = 0; i < 30; i++) {
        const x = (i * 43) % W, y = 216 + (i * 17) % 44;
        P.line(ctx, x, y, x + 2, y - 3, 'rgba(60,82,56,0.45)', 1);
      }
      // town houses
      const rnd = P.rng(31);
      for (let i = 0; i < 9; i++) {
        const x = 10 + i * 72 + rnd() * 10;
        const y = 206 + rnd() * 26;
        const w = 50 + rnd() * 20, h = 34 + rnd() * 18;
        P.rect(ctx, x + 5, y - h, w - 10, h, '#e3ddcb');
        P.rect(ctx, x + 5, y - h, w - 10, 4, '#c7bfa9');
        P.poly(ctx, [[x, y - h], [x + w / 2, y - h - 12], [x + w, y - h]], '#6d5a63');
        P.poly(ctx, [[x + 2, y - h - 1], [x + w / 2, y - h - 11], [x + w - 2, y - h - 1]], '#8a737b');
        for (let k = 0; k < 2; k++) {
          P.rect(ctx, x + 14 + k * 20, y - h + 12, 9, 7, '#7f98a4');
          P.rect(ctx, x + 14 + k * 20, y - h + 12, 9, 1, '#a7bcc4');
          P.rect(ctx, x + 14 + k * 20, y - h + 12, 1, 7, '#b9cbd0');
        }
      }
      // road, mostly behind the dialogue box
      P.poly(ctx, [[0, 360], [0, 300], [200, 274], [430, 286], [640, 266], [640, 360]], '#b4a58e');
      P.poly(ctx, [[0, 360], [0, 314], [210, 290], [430, 300], [640, 282], [640, 360]], '#8f8271');
      // stone retaining wall across the foreground
      P.rect(ctx, 0, 244, W, 24, '#8b8473');
      P.rect(ctx, 0, 243, W, 3, '#a49c88');
      for (let i = 0; i < 12; i++) {
        P.rect(ctx, 0, 248 + i * 2, W, 1, i % 2 ? '#77705f' : '#938c79');
      }
      for (let i = 0; i < 9; i++) P.rect(ctx, 40 + i * 72, 244, 1, 24, 'rgba(70,64,52,0.5)');
      // hedge and hydrangeas along the wall
      for (let i = 0; i < 24; i++) {
        const x = 10 + i * 27;
        P.ellipse(ctx, x, 240, 16, 7, i % 2 ? '#3f5f45' : '#4a6c4f');
      }
      const hy = P.rng(9);
      for (let i = 0; i < 12; i++) {
        const x = 14 + i * 52 + hy() * 8, y = 234 + hy() * 4;
        for (let k = 0; k < 6; k++) {
          P.ellipse(ctx, x + (k % 3) * 3, y + Math.floor(k / 3) * 3, 2, 2, k % 2 ? '#8b96d2' : '#a593dc');
        }
      }
      // bus stop on the left
      P.rect(ctx, 196, 190, 3, 76, '#63605a');
      P.rect(ctx, 168, 186, 58, 22, '#d8d2c0');
      P.rect(ctx, 170, 188, 54, 18, '#ece6d5');
      P.rect(ctx, 175, 192, 12, 9, '#5f7d84');
      P.rect(ctx, 177, 194, 8, 4, '#dce8e6');
      P.rect(ctx, 176, 201, 3, 2, '#3f5458');
      P.rect(ctx, 183, 201, 3, 2, '#3f5458');
      P.rect(ctx, 191, 193, 28, 2, '#7d8a8f');
      P.rect(ctx, 191, 197, 20, 2, '#9aa5a8');
      P.rect(ctx, 166, 252, 66, 5, '#7a5a3d');
      P.rect(ctx, 170, 257, 4, 22, '#4a382a');
      P.rect(ctx, 224, 257, 4, 22, '#4a382a');
      // vending machine on the right
      P.rect(ctx, 586, 194, 30, 56, '#b84b3c');
      P.rect(ctx, 589, 198, 24, 28, '#f0dfc8');
      for (let i = 0; i < 3; i++) P.rect(ctx, 592, 201 + i * 8, 18, 5, i % 2 ? '#7fa4a0' : '#d9a35e');
      P.rect(ctx, 590, 230, 22, 12, '#2a2a2a');
      P.rect(ctx, 592, 232, 18, 6, 'rgba(180,220,220,0.28)');
      P.glow(ctx, 601, 214, 34, '#ffcf9a', 0.12, 1);
      // cat on the wall
      P.ellipse(ctx, 122, 236, 9, 6, '#2b2622');
      P.ellipse(ctx, 129, 230, 7, 6, '#2b2622');
      P.poly(ctx, [[124, 225], [125, 217], [130, 224]], '#2b2622');
      P.poly(ctx, [[131, 224], [136, 217], [136, 225]], '#2b2622');
      P.rect(ctx, 127, 230, 1, 1, '#e8c078');
      P.rect(ctx, 132, 230, 1, 1, '#e8c078');
      P.line(ctx, 114, 238, 104, 230, '#2b2622', 2);
      // power poles and wires
      P.rect(ctx, 96, 88, 5, 164, '#5d544c');
      P.rect(ctx, 84, 98, 30, 3, '#5d544c');
      P.rect(ctx, 88, 110, 22, 2, '#6d635a');
      P.line(ctx, 86, 100, 0, 136, 'rgba(55,55,60,0.5)', 1);
      P.line(ctx, 110, 100, 250, 150, 'rgba(55,55,60,0.5)', 1);
      P.line(ctx, 86, 112, 0, 148, 'rgba(55,55,60,0.35)', 1);
      P.rect(ctx, 60, 74, 7, 196, '#5a5047');
      P.rect(ctx, 62, 74, 2, 196, '#776b5f');
      P.rect(ctx, 42, 100, 44, 4, '#5a5047');
      P.rect(ctx, 46, 116, 36, 3, '#6d635a');
      P.line(ctx, 42, 102, 0, 128, 'rgba(55,55,60,0.5)', 1);
      P.line(ctx, 86, 102, 250, 140, 'rgba(55,55,60,0.45)', 1);
      // foreground grass
      for (let i = 0; i < 30; i++) {
        const x = (i * 23) % W;
        const y = 292 + (i % 5) * 3;
        P.line(ctx, x, y, x + 2, y - 6 - (i % 4), 'rgba(64,90,66,0.55)', 1);
      }
      gulls(ctx, t, 3, 8, 110);
      vignette(ctx);
    },

    /* ---------- grandmother's house, evening ---------- */
    old_house(ctx, t) {
      // wall
      P.rect(ctx, 0, 0, W, H, '#2c2724');
      P.gradBand(ctx, 0, 0, W, H, '#4a3b31', '#221b18', 24);
      // wall beams
      P.rect(ctx, 0, 36, W, 5, '#2a211c');
      P.rect(ctx, 0, 238, W, 4, '#2a211c');
      // shoji screen on the left
      P.rect(ctx, 40, 68, 196, 152, '#2c211a');
      P.gradBand(ctx, 46, 74, 184, 140, '#8a6c4c', '#544132', 14);
      P.rect(ctx, 46, 74, 184, 140, 'rgba(255,200,140,0.05)');
      for (let i = 1; i < 3; i++) P.rect(ctx, 46 + i * 62, 74, 3, 140, '#3a2b22');
      for (let i = 1; i < 3; i++) P.rect(ctx, 46, 74 + i * 47, 184, 3, '#3a2b22');
      P.rect(ctx, 40, 68, 196, 7, '#4a3628');
      P.rect(ctx, 40, 213, 196, 8, '#4a3628');
      // hanging scroll beside it
      P.rect(ctx, 258, 74, 34, 112, '#3a2b22');
      P.rect(ctx, 262, 78, 26, 104, '#b9a27c');
      P.line(ctx, 275, 92, 275, 160, 'rgba(50,40,32,0.55)', 2);
      P.line(ctx, 270, 104, 281, 100, 'rgba(50,40,32,0.45)', 1);
      P.line(ctx, 270, 116, 282, 120, 'rgba(50,40,32,0.35)', 1);
      P.rect(ctx, 250, 68, 50, 4, '#4a3628');
      // light through the paper
      P.glow(ctx, 140, 150, 100, '#ffcf8c', 0.05, 0.9);
      // wall lamp
      P.line(ctx, 320, 0, 320, 62, '#2a211c', 1);
      P.poly(ctx, [[308, 62], [332, 62], [326, 76], [314, 76]], '#3a2c24');
      P.ellipse(ctx, 320, 78, 10, 4, '#ffe0a8');
      P.glow(ctx, 320, 82, 60, '#ffc878', 0.18, 1);
      // low cabinet in front of the screen
      P.rect(ctx, 50, 224, 190, 16, '#4a3527');
      P.rect(ctx, 50, 224, 190, 3, '#6c4d35');
      P.rect(ctx, 58, 240, 8, 28, '#3a2a1e');
      P.rect(ctx, 224, 240, 8, 28, '#3a2a1e');
      // old photo and box on the cabinet
      P.rect(ctx, 84, 210, 34, 14, '#d8c9a8');
      P.rect(ctx, 87, 212, 28, 10, '#6f5a4a');
      P.rect(ctx, 92, 214, 5, 6, '#c9a27a');
      P.rect(ctx, 100, 215, 5, 5, '#c9a27a');
      P.rect(ctx, 140, 206, 44, 18, '#7a5d3f');
      P.rect(ctx, 140, 206, 44, 3, '#98774f');
      P.rect(ctx, 158, 206, 8, 18, '#5f4830');
      // tatami floor perspective
      P.poly(ctx, [[0, 250], [W, 236], [W, 360], [0, 360]], '#7d6f45');
      for (let i = 0; i < 9; i++) {
        const y = 250 + i * 14;
        P.line(ctx, 0, y, W, y - 6 + i * 0.6, 'rgba(70,60,34,0.55)', 1);
      }
      for (let i = 0; i < 8; i++) {
        P.line(ctx, 80 + i * 78, 248, 30 + i * 96, 360, 'rgba(70,60,34,0.35)', 1);
      }
      // shoji window
      P.rect(ctx, 354, 56, 236, 168, '#191512');
      P.rect(ctx, 361, 63, 222, 154, '#c98a58');
      P.gradBand(ctx, 361, 63, 222, 154, '#f0b878', '#8d5d6a', 14);
      // sea through window
      P.rect(ctx, 361, 155, 222, 62, '#a2686c');
      P.gradBand(ctx, 361, 155, 222, 62, '#c98779', '#6b4a62', 8);
      for (let i = 0; i < 12; i++) {
        P.rect(ctx, 365 + i * 19, 166 + (i % 4) * 8, 9, 1, 'rgba(255,214,160,0.35)');
      }
      lighthouse(ctx, 500, 176, 42, { body: '#5b4149', shade: '#46343d', band: '#5b4149', roof: '#3a2d33', dark: '#3a2d33', lampOff: true });
      // shoji frame
      for (let i = 1; i < 5; i++) P.rect(ctx, 361 + i * 44, 63, 3, 154, '#3a2b22');
      for (let i = 1; i < 4; i++) P.rect(ctx, 361, 63 + i * 38, 222, 3, '#3a2b22');
      P.rect(ctx, 354, 56, 236, 8, '#4a382c');
      P.rect(ctx, 354, 216, 236, 8, '#4a382c');
      // warm light shaft
      P.poly(ctx, [[390, 70], [600, 90], [500, 330], [230, 300]], 'rgba(255,200,130,0.05)');
      // low table
      P.rect(ctx, 236, 236, 152, 11, '#4b3527');
      P.rect(ctx, 236, 236, 152, 3, '#6c4d35');
      P.rect(ctx, 244, 247, 7, 26, '#3a291f');
      P.rect(ctx, 373, 247, 7, 26, '#3a291f');
      // teacups
      P.ellipse(ctx, 270, 232, 6, 2, '#c9bda8');
      P.ellipse(ctx, 270, 231, 4, 1, '#6f5a4a');
      P.ellipse(ctx, 352, 232, 6, 2, '#c9bda8');
      // wind chime
      P.line(ctx, 300, 0, 300, 52, '#6d5a48', 1);
      P.ellipse(ctx, 300, 58, 6, 7, 'rgba(190,230,238,0.55)');
      P.ellipse(ctx, 300, 58, 4, 5, 'rgba(230,250,255,0.35)');
      P.line(ctx, 300, 65, 300, 76, '#8a7458', 1);
      P.rect(ctx, 297, 76, 6, 3, '#e8e0cf');
      // dust motes
      dust(ctx, t, 40, 5);
      // foreground shadow
      P.poly(ctx, [[0, 340], [W, 320], [W, 360], [0, 360]], 'rgba(12,10,9,0.55)');
      vignette(ctx);
      P.gradBand(ctx, 0, 0, W, 40, 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0)', 8);
    },

    /* ---------- lighthouse from the cliff, dusk ---------- */
    lighthouse_dusk(ctx, t) {
      sky(ctx, ['#2d3160', '#7b5878', '#d68e78', '#f3c78f'], 0, 200);
      P.glow(ctx, 150, 170, 130, '#ffd6a0', 0.25, 1);
      P.ellipse(ctx, 150, 172, 22, 22, '#ffe9c0');
      for (let i = 0; i < 5; i++) {
        const x = ((i * 210 - t * 6) % (W + 280)) - 140;
        P.cloud(ctx, x, 64 + i * 26, 190, 26, 'rgba(255,200,170,0.22)', 'rgba(120,90,120,0.22)');
      }
      sea(ctx, 202, t, '#5a5472', '#1a2236', '#ffd7ad', { seed: 31, amount: 70 });
      moonPath(ctx, 150, 204, t, '#ffd9a4');
      // far headland
      P.poly(ctx, [[0, 202], [80, 190], [180, 200], [280, 188], [400, 202], [640, 194], [640, 230], [0, 230]], '#3b3b52');
      // cliff
      P.poly(ctx, [[0, 360], [0, 238], [140, 216], [300, 236], [420, 226], [560, 248], [640, 240], [640, 360]], '#1b1d2a');
      P.poly(ctx, [[0, 360], [0, 262], [180, 240], [360, 258], [520, 244], [640, 262], [640, 360]], '#262633');
      // path
      P.poly(ctx, [[70, 360], [250, 240], [310, 246], [160, 360]], '#6f6252');
      P.poly(ctx, [[85, 360], [258, 246], [288, 248], [140, 360]], '#877867');
      // lighthouse
      const lh = lighthouse(ctx, 380, 268, 196, { body: '#e3e1da', shade: '#b4b5bd', band: '#b05349', roof: '#2a2632', dark: '#1a1b26', lampOff: true });
      // lamp is dark
      // grass
      for (let i = 0; i < 70; i++) {
        const x = (i * 37) % W;
        const y = 258 + (i % 11) * 8;
        P.line(ctx, x, y, x + (i % 2 ? 3 : -3), y - 6 - (i % 6), 'rgba(40,48,40,0.8)', 1);
      }
      for (let i = 0; i < 12; i++) {
        const x = 40 + (i * 53) % 560, y = 300 + (i % 4) * 14;
        P.ellipse(ctx, x, y, 3, 2, i % 3 ? '#c8b98a' : '#d8d0b0');
      }
      gulls(ctx, t, 4, 6, 120);
      vignette(ctx);
    },

    /* ---------- lantern room ---------- */
    lantern_room(ctx, t) {
      P.rect(ctx, 0, 0, W, H, '#090d17');
      // glass panes with night outside
      const panes = [[40, 36, 140, 210], [196, 30, 150, 218], [362, 36, 140, 210], [518, 40, 90, 200]];
      for (const [x, y, w, h] of panes) {
        P.rect(ctx, x, y, w, h, '#0d1830');
        P.gradBand(ctx, x, y, w, h, '#152b4a', '#070b16', 12);
        // moon in one pane
        if (x === 196) {
          P.ellipse(ctx, 260, 92, 12, 12, '#f3eed8');
          P.glow(ctx, 260, 92, 48, '#dfe8ff', 0.12, 1);
          P.ellipse(ctx, 263, 88, 3, 3, 'rgba(200,205,210,0.5)');
        }
        // stars
        const rnd = P.rng(x + 3);
        for (let i = 0; i < 16; i++) {
          P.rect(ctx, x + rnd() * w, y + rnd() * h * 0.6, 1, 1, P.rgba('#dfe9ff', 0.5));
        }
        // sea
        P.rect(ctx, x, y + h * 0.72, w, h * 0.28, '#0a1526');
        for (let i = 0; i < 8; i++) {
          P.rect(ctx, x + 6 + i * 17, y + h * 0.78 + (i % 3) * 6, 8, 1, 'rgba(170,205,235,0.18)');
        }
      }
      // mullions
      for (const x of [36, 190, 356, 512, 626]) {
        P.rect(ctx, x, 24, 6, 236, '#121824');
        P.rect(ctx, x + 1, 24, 1, 236, '#2e3a4c');
      }
      P.rect(ctx, 30, 24, 600, 10, '#121824');
      P.rect(ctx, 30, 252, 600, 10, '#121824');
      // Fresnel lens (center)
      P.glow(ctx, 320, 160, 150, '#ffdca0', 0.16, 1);
      P.ellipse(ctx, 320, 160, 92, 76, '#2d2a28');
      P.ellipse(ctx, 320, 160, 84, 68, '#b08a4e');
      P.ellipse(ctx, 320, 160, 75, 60, '#d9b26a');
      for (let i = 0; i < 8; i++) {
        P.ellipse(ctx, 320, 160, 68 - i * 7, 53 - i * 5.5, i % 2 ? '#f0d59a' : '#c99f5c');
      }
      P.ellipse(ctx, 320, 160, 20, 26, '#fff3cc');
      P.glow(ctx, 320, 160, 60, '#ffe7ae', 0.22, 1);
      // prism spokes
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        P.line(ctx, 320 + Math.cos(a) * 24, 160 + Math.sin(a) * 30, 320 + Math.cos(a) * 74, 160 + Math.sin(a) * 58, 'rgba(120,88,44,0.55)', 1);
      }
      // brass ring
      P.ellipse(ctx, 320, 160, 86, 70, 'rgba(0,0,0,0)');
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        P.rect(ctx, 320 + Math.cos(a) * 88, 160 + Math.sin(a) * 72, 1, 1, '#8e6c36');
      }
      // floor
      P.rect(ctx, 0, 262, W, 98, '#0a0e16');
      P.poly(ctx, [[30, 262], [610, 262], [640, 360], [0, 360]], '#121724');
      for (let i = 0; i < 9; i++) {
        P.line(ctx, 0, 280 + i * 9, W, 268 + i * 11, 'rgba(70,82,100,0.25)', 1);
      }
      // lens pedestal
      P.rect(ctx, 288, 240, 64, 22, '#3a332a');
      P.rect(ctx, 280, 258, 80, 8, '#221d18');
      // drifting motes in the light
      dust(ctx, t, 30, 12);
      vignette(ctx);
    },

    /* ---------- diner ---------- */
    diner(ctx, t) {
      P.rect(ctx, 0, 0, W, H, '#2a1e19');
      P.gradBand(ctx, 0, 0, W, 260, '#5a4030', '#35261e', 16);
      // wall planks
      for (let i = 0; i < 22; i++) P.rect(ctx, 0, i * 12, W, 1, 'rgba(20,14,12,0.35)');
      // window to the sea
      P.rect(ctx, 390, 52, 196, 120, '#1b1612');
      P.rect(ctx, 398, 60, 180, 104, '#d99a66');
      P.gradBand(ctx, 398, 60, 180, 104, '#f3c07b', '#b27070', 10);
      P.rect(ctx, 398, 128, 180, 36, '#9a6470');
      for (let i = 0; i < 9; i++) P.rect(ctx, 402 + i * 20, 136 + (i % 4) * 7, 10, 1, 'rgba(255,220,170,0.4)');
      P.rect(ctx, 488, 60, 3, 104, '#3a2a22');
      P.rect(ctx, 398, 110, 180, 3, '#3a2a22');
      // shelves
      P.rect(ctx, 40, 60, 280, 8, '#6a4a33');
      P.rect(ctx, 40, 122, 280, 8, '#6a4a33');
      const rnd = P.rng(77);
      for (let i = 0; i < 14; i++) {
        const x = 48 + i * 19;
        const h = 10 + rnd() * 16;
        P.rect(ctx, x, 60 - h, 8, h, ['#7f9b74', '#9b6d52', '#c9a15f', '#6d8c9b'][i % 4]);
        P.rect(ctx, x + 2, 58 - h, 4, 3, '#e8d9b0');
      }
      for (let i = 0; i < 10; i++) {
        const x = 52 + i * 26;
        P.ellipse(ctx, x, 118, 6, 4, i % 2 ? '#8c6b4f' : '#b08a62');
      }
      // counter
      P.poly(ctx, [[0, 260], [640, 244], [640, 300], [0, 320]], '#7a5138');
      P.poly(ctx, [[0, 250], [640, 234], [640, 246], [0, 262]], '#a97950');
      P.poly(ctx, [[0, 300], [640, 284], [640, 360], [0, 360]], '#2b1d17');
      // stools
      for (const x of [110, 250, 400, 540]) {
        P.ellipse(ctx, x, 300, 22, 6, '#7d3f35');
        P.ellipse(ctx, x, 296, 22, 6, '#b25a48');
        P.rect(ctx, x - 3, 300, 6, 52, '#3a2a22');
        P.rect(ctx, x - 16, 350, 32, 5, '#2a1d18');
      }
      // hanging lamps
      for (const x of [160, 330, 500]) {
        P.rect(ctx, x, 0, 2, 52, '#2a211c');
        P.poly(ctx, [[x - 22, 52], [x + 22, 52], [x + 14, 74], [x - 14, 74]], '#3a2c24');
        P.ellipse(ctx, x, 76, 15, 6, '#ffdda0');
        P.glow(ctx, x, 82, 54, '#ffca7a', 0.3, 1);
      }
      // steam
      for (let i = 0; i < 3; i++) {
        const x = 300 + i * 60 + Math.sin(t * 0.7 + i) * 6;
        for (let k = 0; k < 5; k++) {
          P.ellipse(ctx, x + Math.sin(t + k) * 4, 236 - k * 12 - (t * 6 + i * 9) % 12, 5 - k * 0.6, 3, `rgba(235,220,205,${0.10 - k * 0.015})`);
        }
      }
      // cat on the counter
      P.ellipse(ctx, 580, 238, 12, 7, '#25201e');
      P.ellipse(ctx, 588, 230, 8, 7, '#25201e');
      P.poly(ctx, [[582, 224], [584, 216], [588, 223]], '#25201e');
      P.poly(ctx, [[590, 223], [594, 216], [595, 224]], '#25201e');
      P.rect(ctx, 585, 231, 1, 1, '#d8b06a');
      P.rect(ctx, 592, 231, 1, 1, '#d8b06a');
      P.line(ctx, 570, 240, 558, 232, '#25201e', 2);
      vignette(ctx);
    },

    /* ---------- breakwater, sunset ---------- */
    breakwater(ctx, t) {
      sky(ctx, ['#3a3f68', '#8b5f74', '#e09277', '#f7cf9a'], 0, 196);
      P.glow(ctx, 470, 176, 120, '#ffd9a4', 0.3, 1);
      P.ellipse(ctx, 470, 176, 24, 24, '#ffe9bf');
      for (let i = 0; i < 6; i++) {
        const x = ((i * 180 - t * 4) % (W + 260)) - 130;
        P.cloud(ctx, x, 52 + i * 24, 180, 28, 'rgba(255,206,178,0.26)', 'rgba(130,95,120,0.26)');
      }
      sea(ctx, 198, t, '#8a6a78', '#2a2c45', '#ffdfb0', { seed: 44, amount: 80 });
      moonPath(ctx, 470, 200, t, '#ffe2b2');
      // breakwater
      P.poly(ctx, [[0, 360], [0, 292], [180, 262], [420, 254], [640, 276], [640, 360]], '#6b6a6b');
      P.poly(ctx, [[0, 360], [0, 318], [200, 292], [430, 286], [640, 302], [640, 360]], '#4b4a4c');
      // top edge
      P.poly(ctx, [[0, 292], [180, 262], [420, 254], [640, 276], [640, 286], [415, 265], [180, 273], [0, 302]], '#9a9792');
      // seams
      for (let i = 0; i < 9; i++) {
        P.line(ctx, i * 80, 360, 60 + i * 68, 270, 'rgba(38,38,40,0.4)', 1);
      }
      // tetrapods on the left
      for (let i = 0; i < 7; i++) {
        const x = 20 + i * 38, y = 300 + (i % 3) * 18;
        P.ellipse(ctx, x, y, 18, 10, '#3e3f44');
        P.ellipse(ctx, x + 8, y - 8, 11, 7, '#4d4e53');
        P.ellipse(ctx, x - 7, y - 9, 10, 6, '#44454a');
        P.rect(ctx, x - 2, y - 16, 4, 20, '#3a3b40');
      }
      // railing on the right
      for (let i = 0; i < 4; i++) {
        const x = 430 + i * 56;
        P.rect(ctx, x, 238, 4, 44, '#3d3d42');
      }
      P.rect(ctx, 426, 238, 190, 3, '#4a4a50');
      // waves hitting
      for (let i = 0; i < 20; i++) {
        const x = 60 + (i * 47) % 560;
        const y = 310 + (i % 5) * 7;
        P.rect(ctx, x + Math.sin(t * 1.2 + i) * 3, y, 8 + (i % 4) * 4, 1, 'rgba(235,242,245,0.28)');
      }
      gulls(ctx, t, 4, 12, 100);
      vignette(ctx);
    },

    /* ---------- shrine steps ---------- */
    shrine(ctx, t) {
      // forest
      P.gradBand(ctx, 0, 0, W, H, '#1b2a20', '#0c1511', 20);
      const rnd = P.rng(55);
      // cedar trunks
      for (let i = 0; i < 16; i++) {
        const x = rnd() * W;
        const w = 8 + rnd() * 20;
        P.rect(ctx, x, 0, w, 260 + rnd() * 60, i % 2 ? '#1a241c' : '#223026');
        P.rect(ctx, x, 0, 2, 300, 'rgba(90,110,80,0.15)');
      }
      // canopy
      for (let i = 0; i < 40; i++) {
        const x = rnd() * W, y = rnd() * 150;
        P.ellipse(ctx, x, y, 30 + rnd() * 40, 14 + rnd() * 20, i % 3 ? 'rgba(24,44,30,0.55)' : 'rgba(34,58,38,0.45)');
      }
      // light shafts
      for (let i = 0; i < 4; i++) {
        P.poly(ctx, [[180 + i * 90, 0], [220 + i * 90, 0], [360 + i * 70, 360], [250 + i * 80, 360]], 'rgba(220,230,180,0.035)');
      }
      // steps
      P.poly(ctx, [[190, 360], [250, 210], [400, 210], [470, 360]], '#6e6a5c');
      for (let i = 0; i < 12; i++) {
        const y = 214 + i * 12;
        const w = 150 - i * 11;
        P.rect(ctx, 320 - w / 2, y, w, 4, '#8b8574');
        P.rect(ctx, 320 - w / 2, y + 4, w, 2, '#54503f');
      }
      // torii
      P.rect(ctx, 236, 110, 12, 130, '#b64f3e');
      P.rect(ctx, 392, 110, 12, 130, '#b64f3e');
      P.rect(ctx, 218, 104, 204, 10, '#c25a46');
      P.rect(ctx, 226, 92, 188, 8, '#a84636');
      P.rect(ctx, 210, 88, 220, 6, '#8f3a2e');
      P.rect(ctx, 258, 132, 124, 7, '#b64f3e');
      P.rect(ctx, 290, 132, 8, 24, '#9c4232');
      // stone lanterns
      for (const x of [160, 480]) {
        P.rect(ctx, x, 250, 6, 40, '#6a685c');
        P.rect(ctx, x - 8, 240, 22, 12, '#7a776a');
        P.rect(ctx, x - 4, 232, 14, 8, '#8a8779');
        P.rect(ctx, x - 1, 238, 8, 5, '#ffd890');
        P.glow(ctx, x + 3, 240, 24, '#ffd890', 0.16, 1);
      }
      // hydrangeas foreground
      for (let i = 0; i < 14; i++) {
        const x = (i * 53) % W, y = 320 + (i % 4) * 12;
        for (let k = 0; k < 6; k++) {
          P.ellipse(ctx, x + (k % 3) * 5 - 5, y + Math.floor(k / 3) * 5, 3, 3, k % 2 ? '#5f6ea8' : '#7d6aa8');
        }
        P.ellipse(ctx, x, y + 5, 10, 5, 'rgba(30,52,34,0.8)');
      }
      // fireflies
      fireflies(ctx, t, 14, 3);
      vignette(ctx);
    },

    /* ---------- festival night ---------- */
    festival(ctx, t) {
      sky(ctx, ['#060a18', '#111a34', '#28243f'], 0, 200);
      stars(ctx, t, 70, 8, 160, 0.6);
      moon(ctx, 92, 54, 13, '#f3edd8');
      // fireworks over the bay
      fireworks(ctx, t, 300, 90, '#ffcf7a');
      fireworks(ctx, t + 1.1, 470, 70, '#ff9e8a');
      fireworks(ctx, t + 2.2, 560, 120, '#9fe0e8');
      // sea
      sea(ctx, 200, t, '#14172c', '#080a14', '#ffd9a0', { seed: 18, amount: 55 });
      for (let i = 0; i < 8; i++) P.rect(ctx, 300 + i * 14, 210 + i * 6, 5, 1, 'rgba(255,190,120,0.2)');
      // town street
      P.rect(ctx, 0, 244, W, 116, '#1b1520');
      P.poly(ctx, [[0, 360], [0, 300], [640, 286], [640, 360]], '#2a2029');
      // stalls
      for (let i = 0; i < 4; i++) {
        const x = 20 + i * 165;
        P.rect(ctx, x, 236, 130, 44, '#3a2b2c');
        P.poly(ctx, [[x - 8, 236], [x + 138, 236], [x + 128, 220], [x + 2, 220]], i % 2 ? '#8f3d3d' : '#3f5a6e');
        P.rect(ctx, x, 280, 130, 6, '#5a4434');
        // goods
        for (let k = 0; k < 8; k++) {
          P.rect(ctx, x + 8 + k * 15, 272, 7, 7, ['#d8a95f', '#c9685a', '#7fa88b'][k % 3]);
        }
        // lantern
        P.ellipse(ctx, x + 64, 206, 9, 12, '#e8795a');
        P.rect(ctx, x + 63, 194, 2, 4, '#2a2029');
        P.glow(ctx, x + 64, 206, 34, '#ffb066', 0.18, 1);
      }
      // crowd silhouettes
      const rnd = P.rng(66);
      for (let i = 0; i < 26; i++) {
        const x = 10 + i * 24 + rnd() * 8;
        const y = 300 + rnd() * 34;
        const s = 0.8 + rnd() * 0.6;
        P.ellipse(ctx, x, y - 20 * s, 4 * s, 5 * s, '#0e0b12');
        P.poly(ctx, [[x - 5 * s, y], [x - 3 * s, y - 16 * s], [x + 3 * s, y - 16 * s], [x + 5 * s, y]], '#0e0b12');
      }
      // lantern strings
      for (let row = 0; row < 2; row++) {
        const y0 = 74 + row * 34;
        for (let i = 0; i < 14; i++) {
          const x = 20 + i * 45;
          const sag = Math.sin((i / 13) * Math.PI) * 18;
          P.rect(ctx, x, y0 + sag, 8, 10, '#d96b4e');
          P.rect(ctx, x + 1, y0 + sag + 1, 6, 2, '#f0a06a');
          P.rect(ctx, x + 2, y0 + sag - 2, 4, 2, '#2a2029');
          P.glow(ctx, x + 4, y0 + sag + 5, 16, '#ffaa66', 0.10, 1);
          if (i < 13) P.line(ctx, x + 8, y0 + sag + 1, x + 53, y0 + Math.sin(((i + 1) / 13) * Math.PI) * 18 + 1, 'rgba(40,30,35,0.7)', 1);
        }
      }
      // shrine roof in the distance
      P.poly(ctx, [[250, 236], [320, 210], [390, 236]], '#2a2029');
      P.rect(ctx, 262, 236, 116, 16, '#241b20');
      // foreground railing
      P.rect(ctx, 0, 344, W, 3, '#3a2b2c');
      vignette(ctx);
      P.gradBand(ctx, 0, 320, W, 40, 'rgba(0,0,0,0)', 'rgba(0,0,0,0.4)', 8);
    },

    /* ---------- storm ---------- */
    storm(ctx, t) {
      sky(ctx, ['#05070d', '#101827', '#1d2734'], 0, 196);
      // clouds
      for (let i = 0; i < 8; i++) {
        const x = ((i * 130 - t * 14) % (W + 300)) - 150;
        const y = 10 + (i % 3) * 38;
        P.cloud(ctx, x, y, 240, 54, 'rgba(40,48,62,0.55)', 'rgba(16,20,30,0.55)');
        P.cloud(ctx, x + 40, y + 18, 200, 38, 'rgba(22,30,42,0.55)', 'rgba(10,14,22,0.6)');
      }
      // lightning
      const flash = Math.pow(Math.max(0, Math.sin(t * 0.7)), 16);
      if (flash > 0.05) {
        ctx.fillStyle = P.rgba('#c8dcff', flash * 0.20);
        ctx.fillRect(0, 0, W, 210);
        if (flash > 0.4) {
          let x = 420, y = 20;
          for (let i = 0; i < 9; i++) {
            const nx = x - 16 + (i % 3) * 14;
            const ny = y + 16;
            P.line(ctx, x, y, nx, ny, '#e8f0ff', 2);
            x = nx; y = ny;
          }
        }
      }
      // sea, huge
      sea(ctx, 196, t, '#1a2a3a', '#060a10', '#9fb6c4', { seed: 28, amount: 50 });
      // waves
      for (let i = 0; i < 5; i++) {
        const y = 250 + i * 22;
        const off = Math.sin(t * 0.8 + i) * 40;
        P.poly(ctx, [[0, y + 20], [120 + off, y - 14], [260 + off, y + 8], [420 + off * 0.5, y - 20], [640, y + 4], [640, y + 34], [0, y + 40]], 'rgba(20,36,48,0.9)');
        for (let k = 0; k < 16; k++) {
          P.rect(ctx, (k * 47 + off) % W, y + (k % 5) * 3, 8 + (k % 4) * 5, 1, 'rgba(210,230,238,0.22)');
        }
      }
      // lighthouse beam far left
      const lh = lighthouse(ctx, 96, 250, 118, { body: '#4a5562', shade: '#2a323e', band: '#5a3b39', roof: '#121822', dark: '#0a0f18', lampColor: '#ffe3a0' });
      const ang = Math.sin(t * 1.1) * 0.5 - 0.4;
      P.beam(ctx, lh.lampX, lh.lampY, ang, 520, 0.10, '#ffe7b0', 0.07);
      // rain
      rain(ctx, t, 140, 0.25, 0.35);
      vignette(ctx);
    },

    /* ---------- dawn ---------- */
    dawn(ctx, t) {
      sky(ctx, ['#1e2c4a', '#6b6b88', '#e0a48e', '#f7d7a8'], 0, 206);
      P.glow(ctx, 330, 196, 170, '#ffe0b0', 0.35, 1);
      P.ellipse(ctx, 330, 202, 26, 26, '#fff0cc');
      for (let i = 0; i < 5; i++) {
        const x = ((i * 200 + t * 3) % (W + 300)) - 160;
        P.cloud(ctx, x, 74 + i * 22, 220, 26, 'rgba(255,215,190,0.25)', 'rgba(150,130,150,0.22)');
      }
      sea(ctx, 208, t, '#8c8798', '#2f3a4e', '#ffe6bd', { seed: 51, amount: 90 });
      moonPath(ctx, 330, 210, t, '#ffeac6');
      // headland + lighthouse
      P.poly(ctx, [[0, 224], [140, 208], [300, 222], [430, 212], [640, 226], [640, 360], [0, 360]], '#3a3a44');
      const lh = lighthouse(ctx, 500, 232, 96, { body: '#d8d5cc', shade: '#a8a6a4', band: '#a55850', roof: '#2e2b30', dark: '#20202a', lampOff: true });
      // warm rim
      P.rect(ctx, lh.lampX - 3, lh.lampY - 2, 6, 4, '#fff1c0');
      // foreground cliff
      P.poly(ctx, [[0, 360], [0, 300], [120, 280], [260, 300], [420, 286], [640, 302], [640, 360]], '#1d1f27');
      for (let i = 0; i < 40; i++) {
        const x = (i * 29) % W, y = 300 + (i % 9) * 6;
        P.line(ctx, x, y, x + 2, y - 7, 'rgba(50,56,50,0.7)', 1);
      }
      // boat
      P.rect(ctx, 420, 236, 9, 2, '#2b2f38');
      P.rect(ctx, 424, 230, 1, 6, '#2b2f38');
      gulls(ctx, t, 5, 19, 120);
      vignette(ctx);
    },

    /* ---------- attic ---------- */
    attic(ctx, t) {
      P.gradBand(ctx, 0, 0, W, H, '#241d19', '#120e0d', 20);
      // roof beams
      P.poly(ctx, [[0, 0], [W, 0], [W, 86], [0, 120]], '#1a1512');
      for (let i = 0; i < 5; i++) {
        const y = 20 + i * 20;
        P.line(ctx, 0, y, W, y - 8, '#2e241d', 3);
      }
      // round window
      P.ellipse(ctx, 470, 126, 74, 74, '#33271f');
      P.ellipse(ctx, 470, 126, 66, 66, '#1a2430');
      P.ellipse(ctx, 470, 126, 62, 62, '#2e3e52');
      P.ellipse(ctx, 470, 96, 48, 20, 'rgba(180,200,220,0.15)');
      // moon
      P.ellipse(ctx, 500, 104, 11, 11, '#f0ead6');
      P.glow(ctx, 500, 104, 40, '#dfe8f8', 0.12, 1);
      // mullions
      P.rect(ctx, 466, 60, 5, 132, '#241b16');
      P.rect(ctx, 404, 122, 132, 5, '#241b16');
      P.ellipse(ctx, 470, 126, 74, 74, 'rgba(0,0,0,0)');
      // floor
      P.poly(ctx, [[0, 280], [W, 262], [W, 360], [0, 360]], '#3a2c22');
      for (let i = 0; i < 10; i++) P.line(ctx, 0, 286 + i * 8, W, 268 + i * 9, 'rgba(20,14,11,0.5)', 1);
      // boxes
      P.rect(ctx, 40, 222, 68, 58, '#6b5339');
      P.rect(ctx, 40, 222, 68, 5, '#8a6b49');
      P.rect(ctx, 66, 222, 10, 58, '#55402c');
      P.rect(ctx, 120, 244, 50, 36, '#7a5d3f');
      P.rect(ctx, 120, 244, 50, 4, '#98774f');
      // desk
      P.rect(ctx, 280, 252, 210, 12, '#4a3526');
      P.rect(ctx, 286, 264, 8, 80, '#3a2a1e');
      P.rect(ctx, 478, 264, 8, 80, '#3a2a1e');
      // old radio
      P.rect(ctx, 320, 204, 96, 50, '#5a3d2a');
      P.rect(ctx, 324, 208, 88, 42, '#2e2119');
      P.rect(ctx, 330, 214, 50, 30, '#c9a76a');
      for (let i = 0; i < 7; i++) P.rect(ctx, 332, 217 + i * 4, 46, 1, '#8e6d43');
      P.rect(ctx, 388, 216, 18, 18, '#191410');
      P.ellipse(ctx, 397, 225, 7, 7, '#c9a76a');
      P.rect(ctx, 396, 218, 2, 7, '#3a2a1e');
      P.rect(ctx, 390, 242, 14, 4, '#8e6d43');
      // antenna wire
      P.line(ctx, 416, 208, 560, 120, 'rgba(160,140,110,0.5)', 1);
      // hanging bulb
      P.line(ctx, 240, 0, 240, 92, '#2a2019', 1);
      P.ellipse(ctx, 240, 98, 8, 10, '#ffe5b0');
      P.glow(ctx, 240, 100, 80, '#ffcf80', 0.14, 1);
      dust(ctx, t, 30, 22);
      vignette(ctx);
    },

    /* ---------- old cinema ---------- */
    cinema(ctx, t) {
      P.gradBand(ctx, 0, 0, W, H, '#1a1110', '#090708', 20);
      // back wall
      P.rect(ctx, 0, 0, W, 260, '#17100f');
      for (let i = 0; i < 20; i++) P.rect(ctx, 0, i * 13, W, 1, 'rgba(0,0,0,0.25)');
      // screen frame
      P.rect(ctx, 96, 30, 448, 214, '#241a15');
      P.rect(ctx, 104, 38, 432, 198, '#0b0d0e');
      // film image: sea, boat, lighthouse
      P.gradBand(ctx, 104, 38, 432, 150, '#5d6668', '#242b2e', 14);
      P.gradBand(ctx, 104, 176, 432, 60, '#394347', '#141a1d', 8);
      // clouds
      for (let i = 0; i < 4; i++) P.cloud(ctx, 120 + i * 105, 54 + (i % 2) * 18, 110, 18, 'rgba(200,205,200,0.18)', 'rgba(90,100,100,0.15)');
      // lighthouse silhouette
      P.rect(ctx, 458, 128, 7, 48, '#141a1c');
      P.rect(ctx, 455, 120, 13, 9, '#141a1c');
      P.poly(ctx, [[455, 120], [461, 112], [468, 120]], '#141a1c');
      P.ellipse(ctx, 461, 124, 8, 8, 'rgba(240,240,220,0.10)');
      // boat
      P.rect(ctx, 300, 160, 18, 3, '#101517');
      P.rect(ctx, 307, 150, 1, 10, '#101517');
      // screen glow
      P.glow(ctx, 320, 136, 260, '#c8d4cc', 0.10, 0.8);
      // projector beam
      P.poly(ctx, [[640, 20], [640, 90], [110, 210], [104, 40]], 'rgba(230,240,225,0.035)');
      // seats rows
      for (let row = 0; row < 4; row++) {
        const y = 250 + row * 26;
        for (let i = 0; i < 8; i++) {
          const x = 24 + i * 78 - row * 9;
          P.rect(ctx, x, y, 62, 16, row === 0 ? '#2a1515' : '#201010');
          P.rect(ctx, x, y, 62, 3, row === 0 ? '#4a2523' : '#3a1c1b');
          P.rect(ctx, x + 3, y + 16, 4, 14, '#120909');
          P.rect(ctx, x + 55, y + 16, 4, 14, '#120909');
        }
      }
      // exit sign
      P.rect(ctx, 596, 70, 30, 11, '#3a1916');
      P.rect(ctx, 599, 73, 24, 5, 'rgba(230,120,90,0.55)');
      // dust in projector light
      dust(ctx, t, 26, 41);
      vignette(ctx);
    },

    /* ---------- calm night sea (ending) ---------- */
    sea_night(ctx, t) {
      sky(ctx, ['#050811', '#0c1528', '#172740'], 0, 210);
      stars(ctx, t, 110, 30, 200, 0.85);
      moon(ctx, 460, 72, 20, '#f5efda');
      sea(ctx, 210, t, '#0e1e34', '#050a12', '#a9c9e8', { seed: 61, amount: 60 });
      moonPath(ctx, 460, 212, t, '#ffeec9');
      P.poly(ctx, [[0, 236], [90, 226], [180, 238], [260, 230], [340, 240], [420, 232], [520, 240], [640, 230], [640, 260], [0, 260]], '#080e18');
      lighthouse(ctx, 560, 252, 62, { body: '#202a3a', shade: '#141b28', band: '#202a3a', roof: '#0b111c', dark: '#080e18', lampOff: true });
      vignette(ctx);
    },

    /* ---------- black ---------- */
    black(ctx) {
      ctx.fillStyle = '#04060a';
      ctx.fillRect(0, 0, W, H);
    },

    /* ---------- white out (memory) ---------- */
    white(ctx) {
      ctx.fillStyle = '#f3efe4';
      ctx.fillRect(0, 0, W, H);
    }
  };

  function create(name) {
    const c = PX.make(W, H);
    return { canvas: c, ctx: c.getContext('2d'), name };
  }

  function draw(ctx, name, t) {
    const fn = scenes[name] || scenes.black;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    fn(ctx, t || 0);
    ctx.restore();
  }

  global.Backgrounds = { W, H, scenes, draw, create };
})(window);
