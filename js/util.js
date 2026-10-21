/* ==========================================================
   LIGHTHOUSE — small utilities
   ========================================================== */
(function (global) {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function on(node, ev, fn, opts) {
    node.addEventListener(ev, fn, opts);
    return () => node.removeEventListener(ev, fn, opts);
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function timeAgo(ts) {
    if (!ts) return '';
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return '刚刚';
    if (s < 3600) return Math.floor(s / 60) + ' 分钟前';
    if (s < 86400) return Math.floor(s / 3600) + ' 小时前';
    return Math.floor(s / 86400) + ' 天前';
  }

  /* ----------------------------------------------------------
     Inline text markup
     {pause:400} {shake}…{/shake} {em}…{/em} {c:#8fd6d6}…{/c}
     ---------------------------------------------------------- */
  const COLOR_RE = /^c:(#[0-9a-fA-F]{3,8})$/;

  function parseMarkup(text) {
    const tokens = [];
    let state = { shake: false, em: false, color: null };
    let i = 0;
    const pushChar = (ch) => tokens.push({ type: 'char', ch, shake: state.shake, em: state.em, color: state.color });
    while (i < text.length) {
      if (text[i] === '{') {
        const end = text.indexOf('}', i);
        if (end > i) {
          const tag = text.slice(i + 1, end);
          let m;
          if ((m = tag.match(/^pause:(\d+)$/))) {
            tokens.push({ type: 'pause', ms: Number(m[1]) });
            i = end + 1; continue;
          }
          if (tag === 'shake') { state.shake = true; i = end + 1; continue; }
          if (tag === '/shake') { state.shake = false; i = end + 1; continue; }
          if (tag === 'em') { state.em = true; i = end + 1; continue; }
          if (tag === '/em') { state.em = false; i = end + 1; continue; }
          if ((m = tag.match(COLOR_RE))) { state.color = m[1]; i = end + 1; continue; }
          if (tag === '/c') { state.color = null; i = end + 1; continue; }
        }
      }
      // surrogate pairs
      const code = text.codePointAt(i);
      const ch = String.fromCodePoint(code);
      pushChar(ch);
      i += ch.length;
    }
    return tokens;
  }

  function plainText(text) {
    return String(text)
      .replace(/\{pause:\d+\}/g, '')
      .replace(/\{\/?shake\}/g, '')
      .replace(/\{\/?em\}/g, '')
      .replace(/\{c:#[0-9a-fA-F]{3,8}\}/g, '')
      .replace(/\{\/c\}/g, '');
  }

  /* Render a token slice to HTML, merging style runs. */
  function tokensToHTML(tokens, upTo) {
    let html = '';
    let run = null;
    const flush = () => {
      if (!run) return;
      const cls = [];
      if (run.shake) cls.push('t-shake');
      if (run.em) cls.push('t-em');
      const style = run.color ? ` style="color:${run.color}"` : '';
      html += `<span class="${cls.join(' ')}"${style}>${esc(run.text)}</span>`;
      run = null;
    };
    const n = upTo == null ? tokens.length : Math.min(upTo, tokens.length);
    for (let i = 0; i < n; i++) {
      const t = tokens[i];
      if (t.type === 'pause') continue;
      if (run && run.shake === t.shake && run.em === t.em && run.color === t.color) {
        run.text += t.ch;
      } else {
        flush();
        run = { text: t.ch, shake: t.shake, em: t.em, color: t.color };
      }
    }
    flush();
    return html;
  }

  function tokenCount(tokens) {
    return tokens.filter(t => t.type === 'char').length;
  }

  /* ---------------------------------------------------------- */
  function storage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }
  function store(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { console.warn('[storage] write failed', e); return false; }
  }
  function unstore(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  function fitStage(stage) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const s = Math.min(vw / 1280, vh / 720);
    stage.style.transform = `scale(${s})`;
    stage.style.left = Math.round((vw - 1280 * s) / 2) + 'px';
    stage.style.top = Math.round((vh - 720 * s) / 2) + 'px';
    return s;
  }

  const isTouch = () => window.matchMedia('(pointer: coarse)').matches;

  global.U = {
    $, $$, el, on, clamp, lerp, esc, pad, formatDate, timeAgo,
    parseMarkup, plainText, tokensToHTML, tokenCount,
    storage, store, unstore, fitStage, isTouch
  };
})(window);
