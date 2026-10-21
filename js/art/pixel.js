/* ==========================================================
   LIGHTHOUSE / pixel drawing kit
   Crisp software-rasterised primitives. Everything is drawn on
   a 1-pixel logical grid, then upscaled without smoothing.
   ========================================================== */
(function (global) {
  'use strict';

  const clamp = (v, a, b) => v < a ? a : (v > b ? b : v);

  function make(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  /* ---------- colour helpers ---------- */
  function hexToRgb(hex) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(x => x + x).join('');
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgba(hex, a) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  }
  function mix(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    const r = Math.round(A.r + (B.r - A.r) * t);
    const g = Math.round(A.g + (B.g - A.g) * t);
    const bl = Math.round(A.b + (B.b - A.b) * t);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
  }
  function shade(hex, amt) {
    // amt -1..1 : negative darkens, positive lightens
    return amt >= 0 ? mix(hex, '#ffffff', amt) : mix(hex, '#000000', -amt);
  }

  /* ---------- primitives (logical 1px grid) ---------- */
  function rect(ctx, x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function ellipse(ctx, cx, cy, rx, ry, c) {
    if (rx <= 0 || ry <= 0) return;
    ctx.fillStyle = c;
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      const dy = (y + 0.5 - cy) / ry;
      if (Math.abs(dy) > 1) continue;
      const dx = rx * Math.sqrt(1 - dy * dy);
      const x0 = Math.round(cx - dx), x1 = Math.round(cx + dx);
      if (x1 > x0) ctx.fillRect(x0, y, x1 - x0, 1);
    }
  }

  function poly(ctx, pts, c) {
    if (!pts.length) return;
    ctx.fillStyle = c;
    let minY = Infinity, maxY = -Infinity;
    for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      const sy = y + 0.5;
      const xs = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= sy && b[1] > sy) || (b[1] <= sy && a[1] > sy)) {
          xs.push(a[0] + (sy - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
        }
      }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        const x0 = Math.round(xs[i]), x1 = Math.round(xs[i + 1]);
        if (x1 > x0) ctx.fillRect(x0, y, x1 - x0, 1);
      }
    }
  }

  function line(ctx, x0, y0, x1, y1, c, t) {
    t = t || 1;
    ctx.fillStyle = c;
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    for (;;) {
      ctx.fillRect(x0, y0, t, t);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  }

  function hline(ctx, x, y, w, c) { rect(ctx, x, y, w, 1, c); }
  function vline(ctx, x, y, h, c) { rect(ctx, x, y, 1, h, c); }

  /* ordered dithering */
  const BAYER = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
  ];
  function dither(ctx, x, y, w, h, c, density) {
    // density 0..16
    ctx.fillStyle = c;
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        if (BAYER[(yy & 3)][(xx & 3)] < density) ctx.fillRect(x + xx, y + yy, 1, 1);
      }
    }
  }

  function gradBand(ctx, x, y, w, h, top, bottom, steps) {
    steps = steps || h;
    for (let i = 0; i < steps; i++) {
      const t = steps === 1 ? 0 : i / (steps - 1);
      const yy = Math.round(y + (h * i) / steps);
      const yy2 = Math.round(y + (h * (i + 1)) / steps);
      ctx.fillStyle = mix(top, bottom, t);
      ctx.fillRect(Math.round(x), yy, Math.round(w), Math.max(1, yy2 - yy));
    }
  }

  function rectOutline(ctx, x, y, w, h, c, t) {
    t = t || 1;
    rect(ctx, x, y, w, t, c);
    rect(ctx, x, y + h - t, w, t, c);
    rect(ctx, x, y, t, h, c);
    rect(ctx, x + w - t, y, t, h, c);
  }

  /* deterministic pseudo random */
  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function star(ctx, x, y, size, c) {
    rect(ctx, x, y, size, size, c);
    if (size > 1) {
      rect(ctx, x - 1, y, size + 2, 1, c);
      rect(ctx, x, y - 1, size, 1, c);
      rect(ctx, x, y + size, size, 1, c);
    }
  }

  /* soft glow using stacked low-alpha ellipses */
  function glow(ctx, cx, cy, r, color, alpha, squash) {
    squash = squash || 1;
    const steps = 8;
    for (let i = steps; i >= 1; i--) {
      const rr = (r * i) / steps;
      ctx.fillStyle = rgba(color, alpha / steps);
      ellipse(ctx, cx, cy, rr, rr * squash, ctx.fillStyle);
    }
  }

  function cloud(ctx, x, y, w, h, c, cShade) {
    ellipse(ctx, x + w * 0.22, y + h * 0.62, w * 0.24, h * 0.36, c);
    ellipse(ctx, x + w * 0.48, y + h * 0.48, w * 0.30, h * 0.46, c);
    ellipse(ctx, x + w * 0.72, y + h * 0.64, w * 0.24, h * 0.34, c);
    rect(ctx, x + w * 0.12, y + h * 0.66, w * 0.78, h * 0.3, c);
    if (cShade) {
      ellipse(ctx, x + w * 0.48, y + h * 0.72, w * 0.26, h * 0.20, cShade);
      rect(ctx, x + w * 0.2, y + h * 0.8, w * 0.62, h * 0.12, cShade);
    }
  }

  function beam(ctx, x, y, angle, length, spread, color, alpha) {
    const a1 = angle - spread / 2, a2 = angle + spread / 2;
    const x1 = x + Math.cos(a1) * length, y1 = y + Math.sin(a1) * length;
    const x2 = x + Math.cos(a2) * length, y2 = y + Math.sin(a2) * length;
    poly(ctx, [[x, y], [x1, y1], [x2, y2]], rgba(color, alpha));
  }

  global.PX = {
    clamp, make, hexToRgb, rgba, mix, shade,
    rect, ellipse, poly, line, hline, vline, dither, gradBand, rectOutline,
    rng, star, glow, cloud, beam
  };
})(window);
