/* Real-browser smoke test: boot, play, save/load, map, radio, mobile. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStaticServer } from './serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'test-results');
fs.mkdirSync(OUT, { recursive: true });

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('e2e: playwright is not installed. Run: npm install');
  process.exit(1);
}

const server = createStaticServer(ROOT);
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const base = `http://127.0.0.1:${server.address().port}`;

let browser;
const problems = [];
const label = (s) => `\n  ✗ ${s}`;

function watch(page, name) {
  page.on('pageerror', (err) => problems.push(`${name}: pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (/ERR_ABORTED|\.mp3|favicon/i.test(text)) return;
    problems.push(`${name}: console: ${text}`);
  });
  page.on('requestfailed', (req) => {
    const err = req.failure()?.errorText || '';
    if (/ERR_ABORTED/i.test(err) || req.url().includes('.mp3')) return;
    problems.push(`${name}: request failed: ${req.url()} (${err})`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400) problems.push(`${name}: HTTP ${res.status()} ${res.url()}`);
  });
}

async function launchBrowser() {
  const attempts = [];
  for (const opts of [{ channel: 'chrome', headless: true }, { headless: true }]) {
    try { return await chromium.launch(opts); }
    catch (err) { attempts.push(err.message.split('\n')[0]); }
  }
  throw new Error('could not launch a browser. Run "npx playwright install chromium" or install Chrome.\n' + attempts.join('\n'));
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function openPage(name, viewport = { width: 1440, height: 810 }, contextOpts = {}) {
  const context = await browser.newContext({ viewport, ...contextOpts });
  const page = await context.newPage();
  watch(page, name);
  await page.goto(base, { waitUntil: 'networkidle' });
  await sleep(1200);
  return { context, page };
}

async function advance(page, times = 1, delay = 140) {
  for (let i = 0; i < times; i++) {
    await page.keyboard.press('Space');
    await sleep(delay);
  }
}

async function closePanel(page) {
  await page.keyboard.press('Escape');
  await sleep(320);
}

try {
  browser = await launchBrowser();

  /* ------------------------------------------------------------ */
  /* title + new game + first dialogue                             */
  /* ------------------------------------------------------------ */
  let { context, page } = await openPage('desktop');
  assert.equal(await page.locator('#screen-title').isVisible(), true, 'title screen should be visible');
  assert.equal(await page.locator('[data-action="new"]').isVisible(), true, 'New Game should be visible');

  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await sleep(1200);
  await page.evaluate(() => Save.setSetting('textSpeed', 140));
  await page.click('[data-action="new"]');
  await sleep(900);

  if (await page.locator('#chapter-card:not(.hidden)').count()) {
    await page.click('#chapter-card');
    await sleep(900);
  }
  await page.waitForFunction(() => window.Engine && Engine.running && Engine.sceneId === 'prologue_ferry', null, { timeout: 8000 });
  await advance(page, 6);
  const opening = await page.evaluate(() => ({
    scene: Engine.sceneId,
    line: Engine.lineIndex,
    running: Engine.running,
    autosave: !!localStorage.getItem('lighthouse.auto.v1')
  }));
  assert.equal(opening.running, true, 'engine should be running');
  assert.ok(opening.line >= 1, 'space should advance the prologue');
  assert.equal(opening.autosave, true, 'chapter start should create an autosave');

  /* ------------------------------------------------------------ */
  /* menus, save/load, backlog, notebook                           */
  /* ------------------------------------------------------------ */
  await page.click('.qb[data-action="settings"]');
  await sleep(400);
  assert.equal(await page.locator('#overlay .panel').isVisible(), true, 'settings panel should open');
  await closePanel(page);

  await page.click('.qb[data-action="save"]');
  await sleep(400);
  assert.equal(await page.locator('.save-card').count(), 6, 'save mode should show 6 manual slots');
  await page.locator('.save-card').first().click();
  await sleep(600);
  assert.equal(await page.evaluate(() => !!localStorage.getItem('lighthouse.slot.0.v1')), true, 'first slot should be written');
  await closePanel(page);

  await page.click('.qb[data-action="load"]');
  await sleep(400);
  assert.equal(await page.locator('.save-card').count(), 7, 'load mode should show 6 slots + auto');
  await closePanel(page);

  await page.click('.qb[data-action="backlog"]');
  await sleep(400);
  assert.ok(await page.locator('.bl-item').count() >= 1, 'backlog should contain lines');
  await closePanel(page);

  await page.click('.qb[data-action="notebook"]');
  await sleep(400);
  assert.ok((await page.locator('#overlay').innerText()).includes('此刻'), 'notebook should show the current objective');
  await closePanel(page);

  /* ------------------------------------------------------------ */
  /* town map                                                      */
  /* ------------------------------------------------------------ */
  await page.evaluate(() => Engine.enterScene('ch2_map', { noCard: true }));
  await sleep(500);
  for (let i = 0; i < 8 && !(await page.evaluate(() => UI.isOverlayOpen())); i++) await advance(page, 1, 220);
  assert.equal(await page.locator('#map-canvas').count(), 1, 'map canvas should be visible');
  await page.locator('.map-pin:not(.visited)').first().click();
  await sleep(900);
  const mapScene = await page.evaluate(() => Engine.sceneId);
  assert.match(mapScene, /^loc_/, 'clicking a map pin should enter a location scene');

  /* ------------------------------------------------------------ */
  /* radio minigame: tune all three stations                       */
  /* ------------------------------------------------------------ */
  await page.evaluate(() => Engine.enterScene('ch3_radio', { noCard: true }));
  await sleep(600);
  for (let i = 0; i < 8 && !(await page.evaluate(() => UI.isOverlayOpen())); i++) await advance(page, 1, 220);
  assert.equal(await page.locator('#dial-canvas').count(), 1, 'radio dial should be visible');

  for (const freq of [82.4, 85.7, 88.1]) {
    const box = await page.locator('#dial-canvas').boundingBox();
    assert.ok(box, 'radio dial should have a layout box');
    const x = box.x + ((30 + (freq - 76) / 16 * 600) / 660) * box.width;
    const y = box.y + (92 / 190) * box.height;
    await page.mouse.click(x, y);
    await sleep(220);
    await page.click('#radio-lock');
    await sleep(500);
    assert.equal(await page.locator('.radio-memory').count(), 1, `memory card for ${freq} should open`);
    if (freq === 82.4) {
      assert.ok((await page.locator('.radio-memory-title').innerText()).includes('灯塔日志'), 'first signal should be the keeper log');
    }
    await page.click('.radio-memory-next');
    await sleep(450);
  }
  await sleep(900);
  assert.equal(await page.locator('.radio-memory').count(), 1, 'radio completion card should appear');
  await page.click('.radio-memory-next');
  await sleep(1400);
  assert.equal(await page.evaluate(() => Engine.sceneId), 'ch3_after', 'radio completion should continue the story');

  /* ------------------------------------------------------------ */
  /* mobile layout                                                 */
  /* ------------------------------------------------------------ */
  const mobile = await openPage('mobile', { width: 844, height: 390 }, { isMobile: true, hasTouch: true });
  const stageBox = await mobile.page.evaluate(() => document.getElementById('stage').getBoundingClientRect().toJSON());
  assert.ok(stageBox.width > 0 && stageBox.height > 0, 'stage should have size on mobile');
  assert.ok(stageBox.width <= 844 + 1 && stageBox.height <= 390 + 1, 'stage should fit the mobile viewport');
  await mobile.context.close();

  await context.close();

  if (problems.length) {
    throw new Error(`browser problems:\n${problems.map(label).join('\n')}`);
  }

  const summary = await Promise.resolve('e2e: title, prologue, settings, save/load, backlog, notebook, map, radio, mobile — all passed');
  console.log(summary);
} catch (err) {
  console.error('\nE2E TESTS FAILED\n');
  console.error(err.stack || String(err));
  if (browser) {
    try {
      const pages = browser.contexts().flatMap(c => c.pages());
      if (pages[0]) await pages[0].screenshot({ path: path.join(OUT, 'e2e-failure.png') });
    } catch {}
  }
  process.exitCode = 1;
} finally {
  try { if (browser) await browser.close(); } catch {}
  await new Promise(resolve => server.close(resolve));
}
