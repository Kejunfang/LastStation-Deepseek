/* Project-aware static checks: every referenced file, scene target, asset and
   save/ending/fragment id must exist before we start a browser. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
let checks = 0;

const check = (cond, msg) => {
  checks++;
  if (!cond) errors.push(msg);
};
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const isFile = (rel) => { try { return fs.statSync(path.join(ROOT, rel)).isFile(); } catch { return false; } };

function loadScript(rel, extra = {}) {
  const sandbox = { console, ...extra };
  vm.createContext(sandbox);
  sandbox.window = sandbox;
  vm.runInContext(read(rel), sandbox, { filename: rel });
  return sandbox;
}

/* ------------------------------------------------------------------ */
/* 1. required files                                                   */
/* ------------------------------------------------------------------ */
const required = [
  'index.html', 'README.md', 'AGENTS.md', 'package.json', 'package-lock.json',
  '.gitignore', '.gitattributes', '.githooks/pre-commit',
  '.github/workflows/ci.yml',
  'scripts/serve.mjs', 'scripts/setup.mjs', 'scripts/test-static.mjs', 'scripts/test-e2e.mjs',
  'css/base.css', 'css/title.css', 'css/game.css', 'css/overlays.css',
  'js/util.js', 'js/save.js', 'js/audio.js', 'js/state.js', 'js/story.js',
  'js/ui.js', 'js/minigames.js', 'js/engine.js', 'js/main.js',
  'js/art/pixel.js', 'js/art/backgrounds.js', 'js/art/characters.js'
];
for (const f of required) check(isFile(f), `missing required file: ${f}`);

/* ------------------------------------------------------------------ */
/* 2. HTML references and JS syntax                                    */
/* ------------------------------------------------------------------ */
const html = read('index.html');
const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1])
  .filter(h => !/^(?:data:|https?:|mailto:|#)/.test(h))
  .map(h => h.split('?')[0]);
for (const ref of refs) check(isFile(ref), `index.html references missing file: ${ref}`);
check((html.match(/<script src="js\/main\.js"><\/script>/g) || []).length === 1, 'main.js must be loaded exactly once');

const jsFiles = [];
function walk(dir) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) walk(rel);
    else if (e.name.endsWith('.js')) jsFiles.push(rel);
  }
}
walk('js');
for (const rel of jsFiles) {
  try { new Function(read(rel)); }
  catch (e) { check(false, `JS syntax error in ${rel}: ${e.message}`); }
}
check(jsFiles.length >= 10, `expected at least 10 JS files, found ${jsFiles.length}`);

/* ------------------------------------------------------------------ */
/* 3. data modules                                                     */
/* ------------------------------------------------------------------ */
const stateBox = loadScript('js/state.js');
const storyBox = loadScript('js/story.js', { State: { data: {} } });
const bgBox = loadScript('js/art/backgrounds.js', { PX: {} });

const GameData = stateBox.GameData;
const Story = storyBox.Story;
const Backgrounds = bgBox.Backgrounds;

check(!!GameData, 'state.js did not expose GameData');
check(!!Story, 'story.js did not expose Story');
check(!!Backgrounds, 'backgrounds.js did not expose Backgrounds');

const fragmentIds = new Set(Object.keys(GameData.FRAGMENTS));
const endingIds = new Set(Object.keys(GameData.ENDINGS));
const charIds = new Set(Object.keys(GameData.CHARS));
const chapterIds = new Set(Object.keys(GameData.CHAPTERS).map(Number));
const bgNames = new Set(Object.keys(Backgrounds.scenes));
const scenes = Story.scenes;
const sceneIds = new Set(Object.keys(scenes));

check(fragmentIds.size === 8, `expected 8 fragments, found ${fragmentIds.size}`);
check(endingIds.size === 4, `expected 4 endings, found ${endingIds.size}`);
check(sceneIds.size >= 50, `expected >= 50 scenes, found ${sceneIds.size}`);
for (let i = 0; i <= 5; i++) check(chapterIds.has(i), `missing chapter ${i}`);

/* audio tracks + sfx ids */
const audioSrc = read('js/audio.js');
const tracksSrc = audioSrc.match(/const TRACKS = \{([\s\S]*?)\n  \};/);
check(!!tracksSrc, 'could not read TRACKS from audio.js');
const tracks = tracksSrc ? vm.runInNewContext('({' + tracksSrc[1] + '})') : {};
const trackNames = new Set(Object.keys(tracks));
for (const [key, file] of Object.entries(tracks)) {
  const rel = 'assets/music/' + file;
  check(isFile(rel), `audio track "${key}" points to missing file: ${rel}`);
  if (isFile(rel)) check(fs.statSync(path.join(ROOT, rel)).size > 100_000, `audio track too small: ${rel}`);
}
const sfxBlock = audioSrc.slice(audioSrc.indexOf('const sfx = {'), audioSrc.indexOf('function playSfx'));
const sfxNames = new Set([...sfxBlock.matchAll(/^\s{4}([a-zA-Z]+)\(\)\s*\{/gm)].map(m => m[1]));
check(sfxNames.size >= 8, `expected >= 8 sfx, found ${sfxNames.size}`);

/* every literal playMusic/playSfx call */
for (const rel of jsFiles) {
  const src = read(rel);
  for (const m of src.matchAll(/playMusic\('([^']+)'/g)) {
    check(trackNames.has(m[1]), `${rel}: unknown music track "${m[1]}"`);
  }
  for (const m of src.matchAll(/playSfx\('([^']+)'/g)) {
    check(sfxNames.has(m[1]), `${rel}: unknown sfx "${m[1]}"`);
  }
}

/* ------------------------------------------------------------------ */
/* 4. scene graph and line targets                                     */
/* ------------------------------------------------------------------ */
const addTarget = (v, where) => {
  if (typeof v !== 'string') return;
  check(sceneIds.has(v), `${where}: target scene "${v}" does not exist`);
};
const reachable = new Set();
const queue = [];
const edges = new Map();
const addEdge = (from, to) => {
  if (typeof to !== 'string') return;
  if (!edges.has(from)) edges.set(from, new Set());
  edges.get(from).add(to);
};
const usedFragments = new Set();
const usedEndings = new Set();

check(typeof Story.START === 'string' && sceneIds.has(Story.START), 'Story.START is not a valid scene');
if (sceneIds.has(Story.START)) { queue.push(Story.START); reachable.add(Story.START); }

for (const [id, scene] of Object.entries(scenes)) {
  check(scene.id === id, `scene key/id mismatch: ${id}`);
  check(Array.isArray(scene.lines), `scene ${id}: lines must be an array`);
  if (scene.bg) check(bgNames.has(scene.bg), `scene ${id}: unknown bg "${scene.bg}"`);
  if (scene.music) check(trackNames.has(scene.music), `scene ${id}: unknown music "${scene.music}"`);
  if (scene.next) addTarget(scene.next, `scene ${id}.next`);
  addEdge(id, scene.next);

  for (const [i, line] of (scene.lines || []).entries()) {
    const at = `${id}:${i}`;
    check(line && typeof line.t === 'string', `${at}: missing line type`);
    switch (line.t) {
      case 'say':
        check(typeof line.text === 'string' && line.text.length > 0, `${at}: say without text`);
        if (line.who) check(charIds.has(line.who), `${at}: unknown speaker "${line.who}"`);
        break;
      case 'choice':
        check(Array.isArray(line.choices) && line.choices.length > 0, `${at}: choice without options`);
        for (const [j, c] of (line.choices || []).entries()) {
          check(typeof c.text === 'string', `${at}.choice[${j}]: missing text`);
          check(typeof c.next === 'string' && sceneIds.has(c.next), `${at}.choice[${j}]: invalid next "${c.next}"`);
          addEdge(id, c.next);
        }
        break;
      case 'jump':
        addTarget(line.next, `${at}.jump`);
        addEdge(id, line.next);
        break;
      case 'if':
        check(typeof line.cond === 'function', `${at}: if without cond`);
        if (line.then) { addTarget(line.then, `${at}.then`); addEdge(id, line.then); }
        if (line.else) { addTarget(line.else, `${at}.else`); addEdge(id, line.else); }
        break;
      case 'bg': check(bgNames.has(line.name), `${at}: unknown bg "${line.name}"`); break;
      case 'music': check(trackNames.has(line.name), `${at}: unknown music "${line.name}"`); break;
      case 'amb': check([null, undefined, 'sea', 'rain'].includes(line.name), `${at}: unknown ambience "${line.name}"`); break;
      case 'sfx': check(sfxNames.has(line.name), `${at}: unknown sfx "${line.name}"`); break;
      case 'frag':
        check(fragmentIds.has(line.id), `${at}: unknown fragment "${line.id}"`);
        usedFragments.add(line.id);
        break;
      case 'show':
      case 'hide': check(charIds.has(line.who), `${at}: unknown character "${line.who}"`); break;
      case 'ending':
        check(endingIds.has(line.id), `${at}: unknown ending "${line.id}"`);
        usedEndings.add(line.id);
        break;
      case 'map':
        for (const loc of Object.values(Story.LOCATIONS)) addEdge(id, loc.scene);
        break;
      case 'radio': break;
      case 'fx':
        check(['shake', 'flash', 'fade'].includes(line.name), `${at}: unknown fx "${line.name}"`);
        break;
      case 'flag': case 'set': case 'inc': case 'clear': case 'wait': break;
      default: check(false, `${at}: unknown line type "${line.t}"`);
    }
  }

  const hasTerminal = (scene.lines || []).some(l => ['ending', 'choice', 'if', 'jump'].includes(l.t));
  check(!!scene.next || hasTerminal || (scene.lines || []).some(l => l.t === 'map'),
    `scene ${id}: no next and no terminal line`);
}

// BFS the graph so dead scenes cannot ship silently.
for (let qi = 0; qi < queue.length; qi++) {
  const from = queue[qi];
  for (const to of edges.get(from) || []) {
    if (sceneIds.has(to) && !reachable.has(to)) { reachable.add(to); queue.push(to); }
  }
}
const unreachable = [...sceneIds].filter(id => !reachable.has(id));
check(unreachable.length === 0, `unreachable scenes: ${unreachable.join(', ')}`);

for (const id of endingIds) check(usedEndings.has(id), `ending "${id}" is never triggered`);
for (const loc of Object.values(Story.LOCATIONS)) {
  check(sceneIds.has(loc.scene), `map location "${loc.id}" points to missing scene "${loc.scene}"`);
  check(typeof loc.x === 'number' && loc.x >= 0 && loc.x <= 100, `map location "${loc.id}" has invalid x`);
  check(typeof loc.y === 'number' && loc.y >= 0 && loc.y <= 100, `map location "${loc.id}" has invalid y`);
}
check(Object.keys(Story.LOCATIONS).length === 4, 'expected exactly 4 map locations');

/* radio station fragments live in minigames.js */
const miniSrc = read('js/minigames.js');
for (const m of miniSrc.matchAll(/id: '([a-z_]+)', title:/g)) {
  check(fragmentIds.has(m[1]), `radio station awards unknown fragment "${m[1]}"`);
  usedFragments.add(m[1]);
}
for (const id of fragmentIds) check(usedFragments.has(id), `fragment "${id}" has no acquisition path`);

/* ------------------------------------------------------------------ */
/* 5. docs / screenshots / save API                                    */
/* ------------------------------------------------------------------ */
const agents = read('AGENTS.md');
check(agents.includes('### 规则 0：每个任务开始前，自动运行 karpathy-guidelines skill'),
  'AGENTS.md must keep the task-start rule for karpathy-guidelines');
check(agents.includes('`skill` 工具加载 `karpathy-guidelines`'),
  'AGENTS.md must require actually loading the karpathy-guidelines skill');
check(/karpathy-guidelines/.test(read('README.md')),
  'README.md should mention the task-start karpathy-guidelines gate');

const readme = read('README.md');
for (const m of readme.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
  const rel = m[1].replace(/^<|>$/g, '');
  if (/^https?:/.test(rel)) continue;
  check(isFile(rel), `README image missing: ${rel}`);
}
check(/AGENTS\.md/.test(readme), 'README should point new contributors to AGENTS.md');

const saveSrc = read('js/save.js');
for (const key of ['lighthouse.global.v1', 'lighthouse.settings.v1', 'lighthouse.slot.', 'lighthouse.auto.v1']) {
  check(saveSrc.includes(key), `save.js missing storage key fragment ${key}`);
}
check(/const SLOTS = 6;/.test(saveSrc), 'save.js should expose six manual slots');

/* ------------------------------------------------------------------ */
if (errors.length) {
  console.error(`\nSTATIC TESTS FAILED (${errors.length} of ${checks} checks)\n`);
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log(`static: ${checks} checks passed`);
console.log(`  scenes ${sceneIds.size} · fragments ${fragmentIds.size} · endings ${endingIds.size} · tracks ${trackNames.size} · sfx ${sfxNames.size}`);
