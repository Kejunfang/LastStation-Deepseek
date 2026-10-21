/* ==========================================================
   LIGHTHOUSE / character sprites
   Hand-built pixel busts, drawn at 90x135 and nearest-neighbour
   upscaled. Everything is code — no image assets.
   ========================================================== */
(function (global) {
  'use strict';
  const { rect, ellipse, poly, line, hline, dither, rgba, mix, glow } = PX;

  const W = 90, H = 135;

  const PAL = {
    akari: {
      line: '#453d5c',
      hair: '#ded9ef', hairShade: '#b8b1d4', hairDeep: '#8e86b0', hairLight: '#fbf8ff',
      skin: '#f9ddcc', skinShade: '#eec3ae', skinDeep: '#d69c8b',
      eye: '#e7a35c', eyeDeep: '#8d5a32', eyeLine: '#3d324c',
      cloth: '#f5f1e8', clothShade: '#dad5cc', clothDeep: '#bcb7b4',
      accent: '#8ec5d8', accentDeep: '#5b93ab',
      lip: '#cd8984', blush: 'rgba(231,142,142,0.32)',
      brass: '#d8a95f', brassDark: '#a7793a'
    },
    chinatsu: {
      line: '#40313a',
      hair: '#3c595c', hairShade: '#2b4246', hairDeep: '#1d3035', hairLight: '#6d9293',
      skin: '#f7d4bd', skinShade: '#e9b49c', skinDeep: '#cd8e79',
      eye: '#e6a05b', eyeDeep: '#8f5b33', eyeLine: '#3d2b31',
      cloth: '#f8f1e0', clothShade: '#dfd1b7', clothDeep: '#c0b093',
      accent: '#e8896b', accentDeep: '#b75c47',
      lip: '#c47b6d', blush: 'rgba(227,132,116,0.28)',
      brass: '#d8a95f', brassDark: '#a7793a'
    }
  };

  function blinkAt(t, seed) {
    const cycle = 3.6 + seed * 0.4;
    const p = (t + seed * 1.7) % cycle;
    return p > cycle - 0.12;
  }

  /* ---------------------------------------------------------
     Body
     --------------------------------------------------------- */
  function drawBody(ctx, P, opts) {
    const { style } = opts;

    // ---- long back hair, behind everything ----
    if (style === 'long') {
      poly(ctx, [
        [26, 18], [17, 38], [15, 74], [12, 108], [19, 122],
        [30, 114], [33, 84], [35, 60], [55, 60], [57, 84],
        [60, 114], [71, 122], [78, 108], [75, 74], [73, 38], [64, 18]
      ], P.hairDeep);
      poly(ctx, [
        [27, 22], [21, 42], [19, 78], [16, 105], [21, 116],
        [29, 108], [32, 82], [33, 56], [57, 56], [58, 82],
        [61, 108], [69, 116], [74, 105], [71, 78], [69, 42], [63, 22]
      ], P.hairShade);
      line(ctx, 20, 50, 18, 100, P.hairShade, 1);
      line(ctx, 70, 50, 72, 100, P.hairShade, 1);
      line(ctx, 23, 64, 21, 106, P.hair, 1);
      line(ctx, 67, 64, 69, 106, P.hair, 1);
      // rim light on the right side
      line(ctx, 73, 46, 76, 96, P.hairLight, 1);
    } else {
      poly(ctx, [
        [27, 19], [18, 37], [17, 55], [22, 66], [29, 63],
        [33, 49], [57, 49], [61, 63], [68, 66], [73, 55],
        [72, 37], [63, 19]
      ], P.hairDeep);
      poly(ctx, [
        [29, 22], [21, 38], [20, 54], [24, 62], [30, 58],
        [33, 46], [57, 46], [60, 58], [66, 62], [70, 54],
        [69, 38], [61, 22]
      ], P.hairShade);
      line(ctx, 69, 40, 70, 56, P.hairLight, 1);
    }

    // ---- neck ----
    rect(ctx, 40, 47, 10, 16, P.skinShade);
    rect(ctx, 41, 47, 8, 14, P.skin);
    hline(ctx, 39, 55, 12, P.skinDeep);
    hline(ctx, 40, 56, 10, P.skinShade);
    // neck shadow under the jaw
    poly(ctx, [[39, 52], [51, 52], [50, 58], [40, 58]], P.skinShade);

    // ---- bare shoulders & chest (under the dress) ----
    poly(ctx, [
      [40, 56], [33, 59], [25, 65], [20, 76], [21, 92], [27, 97],
      [32, 80], [45, 74], [58, 80], [63, 97], [69, 92], [70, 76],
      [65, 65], [57, 59], [50, 56]
    ], P.skin);
    poly(ctx, [[25, 65], [20, 76], [21, 92], [25, 95], [26, 78], [31, 66]], P.skinShade);
    poly(ctx, [[65, 65], [70, 76], [69, 92], [65, 95], [64, 78], [59, 66]], P.skinShade);
    poly(ctx, [[33, 60], [57, 60], [60, 68], [57, 78], [45, 87], [33, 78], [30, 68]], P.skin);
    // collarbones
    line(ctx, 34, 63, 41, 65, P.skinShade, 1);
    line(ctx, 56, 63, 49, 65, P.skinShade, 1);
    // thin ribbon choker
    if (style === 'long') {
      hline(ctx, 39, 58, 12, P.accentDeep);
      hline(ctx, 39, 59, 12, P.accent);
      rect(ctx, 44, 58, 3, 3, P.brass);
      rect(ctx, 45, 59, 1, 1, '#ffe8ae');
    }

    // ---- dress ----
    poly(ctx, [
      [33, 66], [38, 66], [45, 76], [52, 66], [57, 66],
      [64, 72], [66, 96], [63, 135], [27, 135], [24, 96], [26, 72]
    ], P.cloth);
    poly(ctx, [[33, 66], [26, 72], [24, 96], [27, 135], [39, 135], [37, 90], [35, 70]], P.clothShade);
    poly(ctx, [[57, 66], [64, 72], [66, 96], [63, 135], [57, 135], [55, 92], [55, 70]], P.clothShade);
    line(ctx, 38, 96, 37, 130, P.clothDeep, 1);
    line(ctx, 55, 98, 57, 128, P.clothDeep, 1);
    line(ctx, 45, 90, 45, 122, P.clothShade, 1);

    if (style === 'long') {
      // sweetheart trim
      line(ctx, 38, 66, 45, 76, P.accentDeep, 1);
      line(ctx, 52, 66, 45, 76, P.accentDeep, 1);
      // thin straps
      line(ctx, 37, 64, 38, 67, P.accentDeep, 2);
      line(ctx, 53, 64, 52, 67, P.accentDeep, 2);
      // thin waist sash + small side bow
      poly(ctx, [[25, 99], [65, 99], [65, 102], [25, 102]], P.accent);
      hline(ctx, 25, 102, 40, P.accentDeep);
      poly(ctx, [[60, 100], [64, 96], [65, 100], [64, 104]], P.accent);
      rect(ctx, 62, 100, 2, 2, P.accentDeep);
      // key pendant on a fine chain
      line(ctx, 45, 76, 43, 84, P.brassDark, 1);
      line(ctx, 45, 76, 47, 84, P.brassDark, 1);
      ellipse(ctx, 45, 85, 2, 2, P.brass);
      rect(ctx, 44, 85, 3, 2, P.brassDark);
      rect(ctx, 45, 86, 1, 1, '#ffe8ae');
      line(ctx, 45, 87, 45, 89, P.brass, 1);
      rect(ctx, 44, 89, 2, 3, P.brass);
      rect(ctx, 46, 90, 2, 1, P.brass);
      // bracelet
      hline(ctx, 24, 106, 5, P.brass);
    } else {
      // blouse collar
      poly(ctx, [[36, 64], [45, 74], [54, 64], [51, 62], [45, 69], [39, 62]], P.clothShade);
      hline(ctx, 36, 64, 18, P.clothDeep);
      // puffed sleeves
      ellipse(ctx, 26, 70, 8, 8, P.clothShade);
      ellipse(ctx, 64, 70, 8, 8, P.clothShade);
      ellipse(ctx, 26, 69, 7, 7, P.cloth);
      ellipse(ctx, 64, 69, 7, 7, P.cloth);
      hline(ctx, 20, 74, 5, P.accentDeep);
      hline(ctx, 65, 74, 5, P.accentDeep);
      // apron
      poly(ctx, [[34, 86], [56, 86], [61, 135], [29, 135]], P.accent);
      poly(ctx, [[31, 88], [34, 88], [33, 135], [28, 135]], P.accentDeep);
      rect(ctx, 32, 84, 26, 3, P.accentDeep);
      line(ctx, 36, 72, 35, 86, P.accentDeep, 2);
      line(ctx, 54, 72, 55, 86, P.accentDeep, 2);
      // pocket
      rect(ctx, 40, 104, 11, 8, P.accentDeep);
      rect(ctx, 41, 105, 9, 6, P.accent);
      line(ctx, 42, 108, 48, 108, P.cloth, 1);
      // button
      rect(ctx, 45, 78, 2, 2, P.brass);
      // hairpin
      rect(ctx, 60, 25, 4, 2, P.brass);
      rect(ctx, 62, 23, 2, 4, P.brass);
    }

    // ---- arms ----
    poly(ctx, [[27, 68], [22, 78], [21, 105], [26, 119], [31, 116], [31, 84], [34, 72]], P.skin);
    poly(ctx, [[63, 68], [68, 78], [69, 105], [64, 119], [59, 116], [59, 84], [56, 72]], P.skin);
    poly(ctx, [[23, 92], [22, 105], [25, 115], [27, 110], [27, 94]], P.skinShade);
    poly(ctx, [[67, 92], [68, 105], [65, 115], [63, 110], [63, 94]], P.skinShade);
    // hands
    ellipse(ctx, 26, 120, 5, 6, P.skin);
    ellipse(ctx, 64, 120, 5, 6, P.skin);
    hline(ctx, 22, 124, 8, P.skinShade);
    hline(ctx, 60, 124, 8, P.skinShade);
  }

  /* ---------------------------------------------------------
     Head
     --------------------------------------------------------- */
  function drawHead(ctx, P, opts) {
    const { style, expr, t } = opts;
    const bob = Math.round(Math.sin(t * 1.15) * 0.6);

    // hair crown behind face
    ellipse(ctx, 45, 27 + bob, 18, 19, P.hairDeep);
    ellipse(ctx, 45, 26 + bob, 17, 18, P.hairShade);

    // ---- face ----
    ellipse(ctx, 45, 33 + bob, 13, 16, P.skin);
    poly(ctx, [[32, 37 + bob], [58, 37 + bob], [55, 48 + bob], [45, 53 + bob], [35, 48 + bob]], P.skin);
    poly(ctx, [[32, 29 + bob], [34, 42 + bob], [37, 49 + bob], [41, 53 + bob], [39, 45 + bob], [36, 34 + bob]], P.skinShade);
    ellipse(ctx, 31, 38 + bob, 3, 4, P.skin);
    ellipse(ctx, 59, 38 + bob, 3, 4, P.skin);
    rect(ctx, 30, 37 + bob, 1, 3, P.skinDeep);
    rect(ctx, 59, 37 + bob, 1, 3, P.skinDeep);
    hline(ctx, 41, 52 + bob, 8, P.skinShade);

    // ---- bangs ----
    const sway = Math.round(Math.sin(t * 0.85) * 0.5);
    if (style === 'long') {
      // broad fringe with five soft points
      poly(ctx, [
        [25, 27 + bob], [27, 16 + bob], [34, 10 + bob], [45, 8 + bob],
        [56, 10 + bob], [63, 16 + bob], [65, 27 + bob],
        [63, 30 + bob], [59, 29 + bob], [57, 31 + bob], [53, 28 + bob],
        [49, 31 + bob], [45, 28 + bob], [41, 31 + bob], [37, 27 + bob],
        [33, 30 + bob], [30, 28 + bob], [27, 30 + bob]
      ], P.hair);
      // fringe strands
      line(ctx, 35, 17 + bob, 39, 15 + bob, 'rgba(251,248,255,0.65)', 1);
      line(ctx, 51, 16 + bob, 55, 18 + bob, 'rgba(251,248,255,0.45)', 1);
      line(ctx, 44, 14 + bob, 44, 21 + bob, P.hairShade, 1);
      // thin side locks framing the cheeks
      poly(ctx, [[28, 24 + bob + sway], [25, 38 + bob], [26, 49 + sway], [30, 51 + sway], [32, 42 + bob], [33, 30 + bob]], P.hair);
      poly(ctx, [[62, 24 + bob - sway], [66, 38 + bob], [65, 49 - sway], [61, 51 - sway], [58, 42 + bob], [57, 30 + bob]], P.hair);
      line(ctx, 27, 36 + bob, 27, 54 + sway, P.hairShade, 1);
      line(ctx, 63, 36 + bob, 63, 54 - sway, P.hairShade, 1);
      // braid on the right
      ellipse(ctx, 64, 62, 3, 4, P.hairShade);
      ellipse(ctx, 65, 69, 3, 4, P.hair);
      poly(ctx, [[64, 71], [59, 68], [59, 74]], P.accent);
      poly(ctx, [[67, 71], [72, 68], [72, 74]], P.accent);
      rect(ctx, 64, 70, 3, 3, P.accentDeep);
      rect(ctx, 63, 58, 1, 1, P.hairLight);
    } else {
      // soft side-swept fringe
      poly(ctx, [
        [27, 27 + bob], [28, 16 + bob], [36, 10 + bob], [46, 9 + bob],
        [56, 11 + bob], [63, 17 + bob], [64, 27 + bob],
        [61, 31 + bob], [57, 29 + bob], [54, 31 + bob], [50, 28 + bob],
        [45, 31 + bob], [40, 28 + bob], [35, 31 + bob], [31, 29 + bob]
      ], P.hair);
      line(ctx, 35, 17 + bob, 43, 13 + bob, P.hairLight, 1);
      line(ctx, 50, 14 + bob, 57, 19 + bob, P.hairShade, 1);
      // short side tufts
      poly(ctx, [[28, 25 + bob], [24, 40 + bob], [25, 50 + bob], [29, 47 + bob], [32, 31 + bob]], P.hairShade);
      poly(ctx, [[62, 25 + bob], [66, 40 + bob], [65, 50 + bob], [61, 47 + bob], [58, 31 + bob]], P.hairShade);
      line(ctx, 26, 33 + bob, 27, 46 + bob, P.hair, 1);
      line(ctx, 64, 33 + bob, 63, 46 + bob, P.hair, 1);
    }

    // ---- brows ----
    const sad = expr === 'sad' || expr === 'cry';
    const stern = expr === 'determined' || expr === 'angry';
    const by = 32 + bob;
    if (sad) {
      line(ctx, 33, by + 2, 39, by, P.hairDeep, 1);
      line(ctx, 51, by, 57, by + 2, P.hairDeep, 1);
    } else if (stern) {
      line(ctx, 33, by, 39, by + 2, P.hairDeep, 1);
      line(ctx, 51, by + 2, 57, by, P.hairDeep, 1);
    } else {
      line(ctx, 33, by + 1, 39, by, P.hairDeep, 1);
      line(ctx, 51, by, 57, by + 1, P.hairDeep, 1);
    }

    // ---- eyes ----
    const specialClosed = expr === 'happy' || expr === 'cry' || expr === 'fade';
    const closed = specialClosed || blinkAt(t, style === 'long' ? 0.3 : 1.4);
    const wide = expr === 'surprised';
    const half = expr === 'sad' || expr === 'shy' || expr === 'distant';
    const look = expr === 'shy' ? -1 : (expr === 'distant' ? 1 : 0);
    if (specialClosed) {
      drawHappyEye(ctx, P, 37, 38 + bob, expr === 'cry' ? -1 : 1);
      drawHappyEye(ctx, P, 53, 38 + bob, expr === 'cry' ? -1 : 1);
    } else if (closed) {
      hline(ctx, 34, 39 + bob, 7, P.eyeLine);
      hline(ctx, 50, 39 + bob, 7, P.eyeLine);
      rect(ctx, 33, 38 + bob, 1, 1, P.eyeLine);
      rect(ctx, 57, 38 + bob, 1, 1, P.eyeLine);
    } else {
      drawEye(ctx, P, 37, 38 + bob, { wide, half, look });
      drawEye(ctx, P, 53, 38 + bob, { wide, half, look });
    }

    if (expr === 'cry' || expr === 'fade') {
      rect(ctx, 34, 40 + bob, 1, 5, '#c6eafa');
      rect(ctx, 35, 44 + bob, 1, 3, '#9fd6ed');
      rect(ctx, 56, 40 + bob, 1, 5, '#c6eafa');
      rect(ctx, 55, 44 + bob, 1, 3, '#9fd6ed');
      rect(ctx, 34, 45 + bob, 2, 1, '#eafaff');
    }

    if (expr === 'shy' || expr === 'happy' || expr === 'smile') {
      ctx.fillStyle = P.blush;
      ellipse(ctx, 34, 44 + bob, 4, 2, ctx.fillStyle);
      ellipse(ctx, 56, 44 + bob, 4, 2, ctx.fillStyle);
      rect(ctx, 33, 44 + bob, 1, 1, rgba('#e08080', 0.5));
      rect(ctx, 55, 44 + bob, 1, 1, rgba('#e08080', 0.5));
    }

    rect(ctx, 45, 43 + bob, 1, 2, P.skinShade);

    // ---- mouth ----
    const mx = 45, my = 48 + bob;
    if (expr === 'happy') {
      rect(ctx, mx - 2, my - 1, 1, 1, P.lip);
      rect(ctx, mx - 1, my, 3, 1, P.lip);
      rect(ctx, mx + 2, my - 1, 1, 1, P.lip);
      rect(ctx, mx, my + 1, 1, 1, '#a85b58');
    } else if (expr === 'smile') {
      rect(ctx, mx - 2, my - 1, 1, 1, P.lip);
      rect(ctx, mx - 1, my, 3, 1, P.lip);
      rect(ctx, mx + 2, my - 1, 1, 1, P.lip);
    } else if (expr === 'surprised' || expr === 'open') {
      rect(ctx, mx - 1, my - 1, 2, 2, '#8e514c');
      rect(ctx, mx - 1, my, 2, 1, '#b56a61');
    } else if (expr === 'sad' || expr === 'cry') {
      rect(ctx, mx - 1, my + 1, 3, 1, P.lip);
      rect(ctx, mx - 2, my, 1, 1, P.lip);
      rect(ctx, mx + 2, my, 1, 1, P.lip);
    } else if (expr === 'determined') {
      rect(ctx, mx - 2, my, 4, 1, P.lip);
      rect(ctx, mx - 3, my - 1, 1, 1, P.lip);
    } else {
      rect(ctx, mx - 1, my, 3, 1, P.lip);
    }
  }

  function drawEye(ctx, P, x, y, o) {
    const white = '#fff9f1';
    if (o.wide) {
      ellipse(ctx, x, y, 4, 5, white);
      ellipse(ctx, x, y + 1, 3, 4, P.eye);
      ellipse(ctx, x, y + 1, 1, 3, P.eyeDeep);
      rect(ctx, x - 1, y - 2, 2, 2, '#ffffff');
      rect(ctx, x + 1, y + 3, 1, 1, '#ffe3b0');
      hline(ctx, x - 4, y - 4, 9, P.eyeLine);
      rect(ctx, x - 5, y - 4, 1, 2, P.eyeLine);
    } else if (o.half) {
      ellipse(ctx, x, y, 4, 3, white);
      ellipse(ctx, x, y + 1, 3, 2, P.eye);
      ellipse(ctx, x, y + 1, 1, 1, P.eyeDeep);
      rect(ctx, x - 1, y - 1, 2, 1, '#ffffff');
      hline(ctx, x - 4, y - 2, 9, P.eyeLine);
      rect(ctx, x - 5, y - 2, 1, 2, P.eyeLine);
      hline(ctx, x - 3, y + 3, 6, rgba('#5a4450', 0.35));
    } else {
      ellipse(ctx, x, y, 4, 4, white);
      ellipse(ctx, x + o.look, y + 1, 3, 3, P.eye);
      ellipse(ctx, x + o.look, y + 1, 1, 2, P.eyeDeep);
      rect(ctx, x - 2 + o.look, y - 1, 2, 2, '#ffffff');
      rect(ctx, x + 1 + o.look, y + 2, 1, 1, '#ffe3b0');
      hline(ctx, x - 4, y - 4, 9, P.eyeLine);
      rect(ctx, x - 5, y - 4, 1, 2, P.eyeLine);
      rect(ctx, x + 4, y - 4, 1, 1, P.eyeLine);
      hline(ctx, x - 2, y + 4, 4, rgba('#5a4450', 0.35));
    }
  }

  function drawHappyEye(ctx, P, x, y, dir) {
    hline(ctx, x - 3, y + 1, 3, P.eyeLine);
    rect(ctx, x, y, 1, 1, P.eyeLine);
    rect(ctx, x + 1, y + 1, 2, 1, P.eyeLine);
    if (dir < 0) {
      rect(ctx, x - 3, y, 1, 1, P.eyeLine);
      rect(ctx, x + 2, y + 2, 1, 1, P.eyeLine);
    }
  }

  /* ---------------------------------------------------------
     Public
     --------------------------------------------------------- */
  function draw(ctx, char, expression, t, opts) {
    opts = opts || {};
    const P = PAL[char] || PAL.akari;
    const style = char === 'chinatsu' ? 'bob' : 'long';
    ctx.clearRect(0, 0, W, H);

    const expr = expression || 'normal';
    const ghost = char === 'akari';

    if (ghost && !opts.noAura) {
      for (let i = 4; i >= 1; i--) {
        ctx.fillStyle = rgba('#a8deea', 0.018);
        ellipse(ctx, 45, 68, 34 + i * 3, 54 + i * 4, ctx.fillStyle);
      }
    }

    drawBody(ctx, P, { style, t });
    drawHead(ctx, P, { style, expr, t });

    if (ghost && !opts.noMotes) {
      const rnd = PX.rng(7);
      for (let i = 0; i < 9; i++) {
        const bx = 10 + rnd() * 70;
        const by = 18 + rnd() * 108;
        const ph = (t * (0.25 + rnd() * 0.4) + rnd() * 6) % 6;
        const a = Math.sin((ph / 6) * Math.PI);
        if (a < 0.3) continue;
        ctx.fillStyle = rgba('#dcf8ff', a * 0.5);
        rect(ctx, bx + Math.sin(t * 0.7 + i) * 2, by - ph * 2, 1, 1, ctx.fillStyle);
      }
    }
  }

  function makeSprite(char, expression, t, scale, opts) {
    scale = scale || 4;
    const off = PX.make(W, H);
    const octx = off.getContext('2d');
    octx.imageSmoothingEnabled = false;
    draw(octx, char, expression, t, opts);
    const c = PX.make(W * scale, H * scale);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, W * scale, H * scale);
    return c;
  }

  global.Characters = { draw, makeSprite, W, H, PAL };
})(window);
