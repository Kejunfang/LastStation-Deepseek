# 《灯塔不眠》开发者教学

从本地配置、修改剧情，到添加角色/背景/音乐，再到部署 GitHub Pages。

- 线上游戏：https://kejunfang.github.io/LastStation-Deepseek/
- 面向玩家： [README.md](README.md)
- 项目硬性规则： [AGENTS.md](AGENTS.md)

---

## 目录

1. [开始之前](#1-开始之前)
2. [五分钟认识项目](#2-五分钟认识项目)
3. [第一次本地运行](#3-第一次本地运行)
4. [剧情数据格式](#4-剧情数据格式)
5. [教程：添加一段新剧情](#5-教程添加一段新剧情)
6. [教程：添加选择、flag 与羁绊](#6-教程添加选择flag-与羁绊)
7. [修改角色与表情](#7-修改角色与表情)
8. [添加背景](#8-添加背景)
9. [添加音乐与音效](#9-添加音乐与音效)
10. [添加地图地点](#10-添加地图地点)
11. [添加收音机频率](#11-添加收音机频率)
12. [记忆碎片、结局与计数](#12-记忆碎片结局与计数)
13. [UI、主题与设置](#13-ui主题与设置)
14. [存档系统](#14-存档系统)
15. [测试、提交与 CI](#15-测试提交与-ci)
16. [部署到 GitHub Pages](#16-部署到-github-pages)
17. [调试技巧](#17-调试技巧)
18. [常见坑](#18-常见坑)
19. [提交前检查清单](#19-提交前检查清单)

---

## 1. 开始之前

### 你需要会什么

- 会改文本文件、会运行终端命令即可。
- 改剧情不需要懂编程；改角色/背景/小游戏需要基础 JavaScript。
- 项目没有 React/Vue、没有 Webpack/Vite、没有后端。浏览器直接加载 HTML/CSS/JS。

### 你需要装什么

| 工具 | 用途 | 版本 |
| --- | --- | --- |
| Git | 版本管理 | 任意较新版本 |
| Node.js | 测试与本地服务器 | >= 20 |
| Chrome | 浏览器测试（或 Playwright Chromium） | 较新版本 |
| 编辑器 | VS Code / Cursor / 任意文本编辑器 | 不限 |

> 只想玩：直接打开 [线上版](https://kejunfang.github.io/LastStation-Deepseek/)，不需要装任何东西。

### 三条基本规则

1. **每次只做一个连贯的变更**：例如“加一段剧情”或“修一个按钮”，不要顺手重构无关代码。
2. **提交前必须 `npm test` 全绿**；测试失败绝不能 commit。
3. **每完成一个变更立刻 commit**。规则写在 [AGENTS.md](AGENTS.md)，并由 Git hook 强制检查。

如果使用 AI Agent，[AGENTS.md](AGENTS.md) 还要求每个新任务开始前自动加载 `karpathy-guidelines` skill，再动手。

---

## 2. 五分钟认识项目

### 目录

```text
.
├── index.html                 页面骨架、脚本加载顺序
├── css/
│   ├── base.css               舞台、背景、角色、章节卡、结局卡
│   ├── title.css              标题画面
│   ├── game.css               对话框、选项、快捷栏
│   └── overlays.css           存档/设置/记录/画廊/地图/收音机
├── js/
│   ├── art/
│   │   ├── pixel.js           像素绘制原语
│   │   ├── backgrounds.js     所有程序化背景
│   │   └── characters.js      角色立绘与表情
│   ├── util.js                DOM、文本标记、存储、缩放
│   ├── save.js                localStorage 存档与设置
│   ├── audio.js               BGM / 音效 / 环境音
│   ├── state.js               碎片、结局、章节、当前周目状态
│   ├── story.js               ★ 全部剧情与选项
│   ├── ui.js                  标题、对话框、面板、画廊
│   ├── minigames.js           地图 + 收音机
│   ├── engine.js              场景执行器、打字机、Auto/Skip
│   └── main.js                启动与全局输入
├── assets/music/              8 首 BGM
├── screenshots/               README 截图
├── scripts/                   测试与本地服务器
├── AGENTS.md                  项目协议
└── DEVELOPER_GUIDE.md         本文件
```

### 运行顺序

`index.html` 按依赖顺序加载脚本：

```text
pixel → backgrounds → characters → util → save → audio
→ state → story → ui → minigames → engine → main
```

每个文件通过 IIFE 把模块挂到 `window`：

| 全局 | 用途 |
| --- | --- |
| `Story` | 剧情数据 |
| `Engine` | 执行剧情 |
| `UI` | 界面 |
| `State` | 当前周目状态 |
| `Save` | 存档/全局进度/设置 |
| `Audio` | 音乐/音效 |
| `Backgrounds` / `Characters` | 画面 |
| `Mini` | 地图/收音机 |

### 数据流

```text
Story.scenes[sceneId].lines[]
        ↓
Engine 逐行执行
        ├─ say     → 对话框 + 打字机
        ├─ choice  → 选项
        ├─ map     → 地图
        └─ radio   → 调频
        ↓
State 记录本周目（bond / fragments / flags）
Save 记录全局（跨周目碎片、结局、已读、设置）
        ↓
UI / Audio / Backgrounds / Characters
```

---

## 3. 第一次本地运行

```bash
git clone https://github.com/Kejunfang/LastStation-Deepseek.git
cd LastStation-Deepseek

npm install       # 只安装 Playwright 测试依赖；游戏本身零依赖
npm run setup     # 让 git 使用仓库里的 .githooks/pre-commit
npm test          # 静态检查 + 真实浏览器 smoke test
npm run serve     # http://127.0.0.1:8000
```

打开 http://127.0.0.1:8000 。

### 为什么不能直接双击 index.html？

可以打开，也能玩；但 Chrome/Safari 在 `file://` 下会以 CORS 限制拦截本地 mp3，背景音乐会静音。用本地 HTTP 服务器即可。

### 第一次测试很慢/失败？

- `test:e2e` 优先使用本机 Chrome；没装 Chrome 时执行：

  ```bash
  npx playwright install chromium
  ```

- 测试失败时看 `test-results/e2e-failure.png` 和终端输出。
- 不要用 `git commit --no-verify` 绕过。测试失败就先修。

### 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run serve` | 本地服务器（带 Range，音乐可拖动进度） |
| `npm run test:static` | 只跑静态检查，最快 |
| `npm run test:e2e` | 只跑浏览器测试 |
| `npm test` | 提交前必须跑的完整测试 |
| `npm run setup` | 启用 pre-commit hook（每个 clone 一次） |

---

## 4. 剧情数据格式

所有剧情在 `js/story.js` 的 `Story.scenes` 对象里。一个场景长这样：

```js
my_scene: {
  id: 'my_scene',
  chapter: 2,
  title: '场景标题',
  bg: 'town_day',
  music: 'town',
  amb: 'sea',
  keepCast: false,
  lines: [
    { t: 'say', text: '旁白。' },
    { t: 'say', who: 'akari', expr: 'smile', text: '「台词。」' }
  ],
  next: 'next_scene_id'
}
```

### 场景字段

| 字段 | 必需 | 说明 |
| --- | --- | --- |
| `id` | 是 | 必须和对象 key 一致 |
| `chapter` | 是 | 0–5；决定章节卡与自动存档规则 |
| `title` | 是 | 存档/章节用的标题 |
| `bg` | 否 | `Backgrounds.scenes` 中的 key |
| `music` | 否 | `TRACKS` 中的 key |
| `amb` | 否 | `'sea'`、`'rain'` 或 `null` |
| `keepCast` | 否 | 连续场景保持立绘，避免闪一下 |
| `lines` | 是 | 行数组 |
| `next` | 视情况 | 走完 lines 后跳转；没有 next 就必须有 ending/choice 等终止行 |

### 行类型

#### 对话

```js
{ t: 'say', text: '旁白。' }
{ t: 'say', who: 'akari', expr: 'smile', text: '「台词。」', pos: 'center' }
{ t: 'say', who: 'haruka', inner: true, text: '内心独白。' }
{ t: 'say', who: 'akari', text: '只能听见声音。', offscreen: true }
{ t: 'say', who: 'akari', text: '二周目替换文本。', ngplus: '另一种说法。' }
```

- `who` 必须是 `GameData.CHARS` 里的 id。
- `expr` 是表情名，见第 7 节。
- `pos`：`left` / `center` / `right`。
- `inner` 会隐藏名字框，用括号样式显示。
- `offscreen` 显示名字但不显示立绘（用于“只听见声音”）。
- `ngplus` 只在二周目替换。

#### 选项

```js
{
  t: 'choice',
  choices: [
    { text: '「我帮你。」', effects: { bond: 1, flag: 'promised' }, next: 'ch1_promise' },
    { text: '「我要走了。」', effects: { bond: -1 }, next: 'ch1_leave' },
    {
      text: '「回到十年前。」',
      next: 'ending_c_start',
      locked: (s) => !s.flags.radioDone,
      lockText: '还需要更多记忆'
    }
  ]
}
```

- `next` 必填，必须是存在的场景 id。
- `effects` 在选项被选中时应用。
- `locked` 可以是布尔值或 `(state) => boolean`；锁定选项显示 `lockText`。
- `if` 可用于整个选项的显示条件：`if: (s) => ...`。
- `true: true` 会让选项显示金色样式（TRUE 结局用）。

#### 跳转与条件

```js
{ t: 'jump', next: 'some_scene' }
{ t: 'if', cond: (s) => s.visits >= 2, then: 'day_end', else: 'map' }
```

#### 状态、碎片、旗标

```js
{ t: 'frag', id: 'ema' }          // 获得记忆碎片
{ t: 'flag', key: 'met_genzo' }   // 设为 true
{ t: 'set', key: 'day', value: 2 }
{ t: 'inc', key: 'visits' }       // +1（可写 value）
```

`effects` 支持：

```js
effects: {
  bond: 1,                        // 羁绊，最终会限制在 0–10
  flag: 'promised',               // 单旗标
  flags: { saw_light: true },     // 多旗标
  fragment: 'ema',                // 单碎片
  fragments: ['ema', 'old_ticket'] // 多碎片
}
```

#### 画面、声音、演出

```js
{ t: 'bg', name: 'lantern_room' }
{ t: 'music', name: 'akari' }
{ t: 'amb', name: 'rain' }
{ t: 'sfx', name: 'thunder' }
{ t: 'fx', name: 'shake' }     // shake / flash / fade
{ t: 'show', who: 'akari', expr: 'sad', pos: 'center' }
{ t: 'hide', who: 'akari' }
{ t: 'clear' }
{ t: 'wait', ms: 500 }
```

#### 小游戏与结局

```js
{ t: 'map' }            // 打开汐见町地图
{ t: 'radio' }          // 打开收音机调频
{ t: 'ending', id: 'B' } // A / B / C / TRUE
```

### 文本标记

对话文本支持：

| 标记 | 效果 |
| --- | --- |
| `{pause:600}` | 停顿 600 毫秒 |
| `{shake}文字{/shake}` | 抖动 |
| `{em}文字{/em}` | 强调色 |
| `{c:#8fd6d6}文字{/c}` | 自定义颜色 |

### 章节

章节卡信息在 `js/state.js` 的 `GameData.CHAPTERS`：

```js
2: { no: 'CH. 02', title: '潮声里的碎片', sub: 'What the town kept.' }
```

`chapter: 0` 是序章；`chapter: -1` 是 `State.reset()` 的初始值，专门用来触发序章章节卡，不要改成 0。

---

## 5. 教程：添加一段新剧情

目标：在第二章地图结束后，插入一小段“防波堤的黄昏”，然后回到地图。

### 第 1 步：写场景

在 `js/story.js` 的 `scenes` 对象里插入：

```js
new_breakwater_dusk: {
  id: 'new_breakwater_dusk',
  chapter: 2,
  title: '防波堤的黄昏',
  bg: 'breakwater',
  music: 'mystery',
  amb: 'sea',
  lines: [
    { t: 'say', text: '夕阳把防波堤染成橘色。' },
    { t: 'say', who: 'haruka', inner: true, text: '这里好像来过。' },
    { t: 'say', who: 'chinatsu', expr: 'normal', text: '「你果然在这里。」' },
    { t: 'say', who: 'chinatsu', expr: 'smile', text: '「晚饭要凉了哦。」' }
  ],
  next: 'ch2_map'
}
```

### 第 2 步：接上它

找到 `ch2_map_open` 或某个地点的 `next` / 选项，把目标改成：

```js
next: 'new_breakwater_dusk'
```

或者在某段对话后加：

```js
{ t: 'jump', next: 'new_breakwater_dusk' }
```

### 第 3 步：验证

```bash
npm run test:static
```

静态检查会确认：

- 场景 id 存在；
- `bg` / `music` / 人物 / `next` 都存在；
- 从 `START` 可以走到这个场景；
- 场景不是死路。

然后在浏览器 Console 里快速看效果：

```js
LH.Engine.debugJump('new_breakwater_dusk')
```

### 第 4 步：提交

```bash
npm test
git add js/story.js
git commit -m "feat: add the breakwater dusk scene"
```

---

## 6. 教程：添加选择、flag 与羁绊

```js
{
  t: 'choice',
  choices: [
    {
      text: '「我陪你走回去。」',
      effects: { bond: 1, flag: 'walked_home' },
      next: 'new_walk_home'
    },
    {
      text: '「我想一个人待会儿。」',
      effects: { flag: 'stayed_alone' },
      next: 'new_stay_alone'
    }
  ]
}
```

之后可以在条件里读取：

```js
{ t: 'if', cond: (s) => s.flags.walked_home, then: 'new_good', else: 'new_normal' }
```

或者在 `locked` 里使用：

```js
locked: (s) => s.bond < 7
```

注意：

- 一个选项必须有 `next`。
- `bond` 会被限制在 0–10；结局阈值见 README。
- 新增 flag 不需要提前注册；`s.flags.xxx` 直接读。
- 修改选项后，跑一遍 `npm test`；e2e 至少会覆盖基本流程。

---

## 7. 修改角色与表情

角色定义在 `js/state.js` 的 `GameData.CHARS`：

```js
akari: { name: '汐崎 灯', en: 'AKARI', color: '#e8bd82' }
```

立绘在 `js/art/characters.js`。

### 改台词/表情（最简单）

直接写：

```js
{ t: 'say', who: 'akari', expr: 'shy', text: '「……」' }
```

现有表情：

`normal`、`smile`、`happy`、`sad`、`surprised`、`shy`、`determined`、`cry`、`distant`、`fade`、`open`。

### 改一个角色的配色

在 `Characters.PAL` 中修改：

```js
akari: {
  hair: '#ded9ef',
  skin: '#f9ddcc',
  eye: '#e7a35c',
  cloth: '#f5f1e8',
  // ...
}
```

颜色会立即反映到所有表情。

### 新增表情

在 `drawHead` 里按现有 `expr` 分支扩展，例如：

```js
if (expr === 'thinking') {
  // 画眼睛、眉毛、嘴巴的另一种组合
}
```

同时确保 `drawEye` / `drawHappyEye` 的调用不会冲突。新增表情后：

1. 在剧情里使用 `expr: 'thinking'`；
2. 跑 `npm test`；
3. 用 `LH.Engine.debugJump(...)` 快速看效果。

### 新增角色（进阶）

1. 在 `GameData.CHARS` 加 id/name/en/color。
2. 在 `Characters.PAL` 加一套配色。
3. 在 `draw()` 里决定使用哪种身体风格（目前只有 `long` 和 `bob`）。

   ```js
   const style = char === 'chinatsu' ? 'bob' : 'long';
   ```

   新角色可以复用某一种风格并改配色；如果要完全新的发型/服装，需要在 `drawBody` / `drawHead` 增加分支。
4. 在剧情里 `{ t: 'show', who: 'new_id', expr: 'normal', pos: 'center' }`。
5. UI 会自动读取 `GameData.CHARS`；不需要改 UI。

角色网格固定为 **90×135 逻辑像素**，绘制后按 4 倍最近邻放大。不要直接改画布尺寸，否则会破坏舞台比例。

---

## 8. 添加背景

所有背景在 `js/art/backgrounds.js` 的 `Backgrounds.scenes`。

### 最小示例

```js
my_room(ctx, t) {
  P.gradBand(ctx, 0, 0, W, H, '#2a2030', '#0d0a10', 20);
  P.rect(ctx, 100, 180, 440, 120, '#3a2a2a');
  P.glow(ctx, 320, 160, 120, '#ffcf8a', 0.2, 1);
}
```

- 画布固定 **640×360**。
- `P` 是 `PX` 的别名，提供 `rect`、`ellipse`、`poly`、`line`、`gradBand`、`glow`、`cloud`、`dither` 等。
- `backgrounds.js` 内还有 `sky`、`sea`、`stars`、`moon`、`lighthouse`、`townline` 等场景辅助函数，可以在同一文件的新场景里直接调用。
- `t` 是秒数；可以用于海浪、雨、光束、闪烁。
- 帧率约 20fps；不要每帧做重计算。
- 不要使用图片素材。

然后在场景里：

```js
{ bg: 'my_room' }
```

静态测试会检查 `my_room` 是否存在于 `Backgrounds.scenes`。

---

## 9. 添加音乐与音效

### BGM

1. 把 mp3 放进 `assets/music/`。
2. 在 `js/audio.js` 的 `TRACKS` 增加 key：

   ```js
   const TRACKS = {
     // ...
     my_theme: 'my_theme.mp3'
   };
   ```

3. 场景里写：

   ```js
   music: 'my_theme'
   ```

文件名包含空格/中文也没关系，浏览器会自动 URL 编码；但必须和 `TRACKS` 的值完全一致。

### 合成音效

在 `js/audio.js` 的 `sfx` 对象里加函数：

```js
my_sfx() {
  tone(440, 'sine', 0.05, 0.01, 0.2);
}
```

剧情里：

```js
{ t: 'sfx', name: 'my_sfx' }
```

静态测试会检查剧情里的 `sfx` 名字是否存在。

### 注意

- 全局模块名 `Audio` 和浏览器 `Audio` 构造函数同名；**不要写 `new Audio()`**，用 `document.createElement('audio')`。
- 音乐是外部素材；新增/替换前确认授权。
- `file://` 下音乐会被 CORS 拦，测试统一用 HTTP。

---

## 10. 添加地图地点

地图数据在 `js/story.js` 的 `Story.LOCATIONS`：

```js
diner: {
  id: 'diner',
  name: '潮风食堂',
  sub: '刨冰与旧事',
  scene: 'loc_diner',
  x: 31,
  y: 63,
  desc: '千夏的店。靠窗的位置，永远留着两碗刨冰。'
}
```

- `x` / `y` 是地图容器内的百分比（0–100）。
- `scene` 必须是已存在的场景。
- 地图会自动生成光点；不需要改 HTML。

当前设计是 **4 个地点 × 每天 2 次 × 2 天**。如果新增第 5 个地点，需要同时调整：

- `ch2_map` 的 `visits >= 2` 逻辑或增加天数；
- 静态测试 `expected exactly 4 map locations`；
- README 中的说明。

只替换现有地点则只需改 `LOCATIONS` 和对应场景。

---

## 11. 添加收音机频率

`js/minigames.js` 的 `STATIONS`：

```js
{
  freq: 82.4,
  id: 'keeper_log',
  title: '灯塔日志',
  kicker: 'SIGNAL 01 · 23:47',
  text: '八月三十一日。暴风雨。\n...'
}
```

- `freq` 必须在 76.0–92.0 之间，建议保留 1 位小数。
- `id` 是记忆碎片 id，必须存在于 `GameData.FRAGMENTS`。
- 完成条件使用 `STATIONS.length`；新增频率会自动要求全部调出。
- 静态测试会解析 `id: '...', title:` 形式，所以保持这两个字段在同一对象里。
- 调频 UI 的刻度、LED、波形会自动工作，不需要改 CSS。

如果新增频率对应的新碎片，请继续看第 12 节。

---

## 12. 记忆碎片、结局与计数

### 碎片

定义在 `js/state.js`：

```js
ema: {
  name: '绘马上的名字',
  glyph: '願',
  desc: '「希望明年、后年，每一年都能一起看灯。」'
}
```

获取方式：

```js
{ t: 'frag', id: 'ema' }
```

或选项/dialog `effects`；或收音机 `STATIONS` 的 `id`。

**当前设计硬编码了 8 段记忆。** 新增第 9 段需要同步修改：

- `GameData.FRAGMENTS`
- 获取剧情
- `UI.updateTitleMeta()` 的 `x/8`
- `UI.openMemories()` 的 `x/8`
- `UI.openNotebook()` 的 `x/8`
- README 的“八段”
- `scripts/test-static.mjs` 里的 `expected 8 fragments`
- TRUE 结局条件（它会要求所有碎片）

如果只是改一段记忆的名字/描述，只改 `FRAGMENTS` 即可，风险低。

### 结局

定义在 `js/state.js` 的 `GameData.ENDINGS`，触发在剧情：

```js
{ t: 'ending', id: 'B' }
```

新增结局需要：

1. `ENDINGS` 增加条目；
2. 剧情里有 `{ t: 'ending', id: 'X' }`；
3. 如果改变最终选项，更新 `ch4_storm` 的 choices 和 `README`；
4. 静态测试会检查每个结局都有 trigger。

### 章节

`GameData.CHAPTERS` 决定章节卡文案。当前 `chapter 5` 是结局段，`Engine.autoSave()` 对 `chapter >= 5` 不自动存档；如果你把普通剧情放到 5，要注意这一点。

---

## 13. UI、主题与设置

- 颜色、字体、面板、按钮主要在 `css/base.css` 的 CSS 变量和 `css/overlays.css`。
- 标题画面 `css/title.css`；对话框/选项 `css/game.css`。
- 新面板优先复用 `UI.modal()`、`UI.toast()`、`UI.confirmDialog()`。
- 动效要考虑设置里的「减少动态效果」`reduceMotion`。
- 舞台固定 1280×720，JS 按窗口等比缩放；不要写死视口像素。
- 手机横屏是主要移动端场景；竖屏会显示提示。

如果新增设置项：

1. `js/save.js` 的 `defaultSettings()` 加默认值；
2. `UI.openSettings()` 加一行控件；
3. 如果影响引擎，读 `Save.settings`；
4. 测试刷新后设置是否保留。

---

## 14. 存档系统

### localStorage key

| key | 内容 |
| --- | --- |
| `lighthouse.global.v1` | 跨周目碎片、结局、已读文本、NG+ |
| `lighthouse.settings.v1` | 音量、文字速度、自动间隔、开关 |
| `lighthouse.slot.0.v1` … `slot.5.v1` | 6 个手动存档 |
| `lighthouse.auto.v1` | 自动存档 |

### 一个存档里有什么

`Engine.makeSavePayload()` 生成：

```js
{
  state: { chapter, scene, line, bond, fragments, flags, day, visits, ... },
  scene, line,
  chapterTitle, sceneTitle, preview,
  thumb,          // 320×180 JPEG dataURL
  backlog, cast,
  bg, music
}
```

读档时：

- 恢复 `State`；
- 恢复背景、音乐、立绘；
- 从保存的 `scene + line` 重新显示该行，不重复应用已经生效的 effects。

### 修改存档时注意

- 保持 `v1` key；要改结构就写迁移，不要直接换 key 把旧档废掉。
- 自动存档不应在 chapter 5（结局段）产生。
- 缩略图只画当前 canvas；不要引入跨域图片，否则 `toDataURL` 会被污染。

---

## 15. 测试、提交与 CI

### 必须遵守

- 每完成一个连贯变更，立刻 commit。
- commit 前 `npm test` 全绿。
- 禁止 `--no-verify`。
- pre-commit hook 还会检查：未暂存改动、未跟踪文件、依赖是否安装。
- 首次 clone 后执行 `npm run setup` 启用 hook。

### 测试分两层

**静态检查** `npm run test:static`：

- HTML 引用的 CSS/JS 存在；
- 全部 JS 语法可解析；
- 56 个场景的 bg/music/sfx/frag/who/next/choice/if 目标存在；
- 从 START 可达所有场景；
- 8 碎片、4 结局、4 地图地点、6 存档位、音频文件、README 截图。

**浏览器 smoke** `npm run test:e2e`：

- 标题 → 新游戏 → 序章；
- 设置；
- 存档/读档；
- 记录、手记；
- 地图 → 地点；
- 收音机三段信号；
- 844×390 移动端布局。

新增功能时：

1. 先让静态检查通过；
2. 关键交互加进 e2e（或者至少在 commit body 里写清手工验证步骤）；
3. 完整跑 `npm test`。

### 提交示例

```bash
npm test
git add js/story.js scripts/test-static.mjs
git commit -m "feat: add the breakwater dusk scene"
git status --short   # 必须干净
```

提交信息格式：

```text
<type>: <summary>
```

`type`：`feat` / `fix` / `docs` / `test` / `refactor` / `chore`。

### CI

`.github/workflows/ci.yml` 会在 push / PR 时：

1. `npm ci`
2. `npx playwright install --with-deps chromium`
3. `npm test`

---

## 16. 部署到 GitHub Pages

当前线上地址：

**https://kejunfang.github.io/LastStation-Deepseek/**

### 这个项目怎么部署

项目是纯静态站点，入口 `index.html` 在仓库根目录；不需要构建。

如果使用当前仓库：

1. GitHub → Settings → Pages
2. Source 选择 **Deploy from a branch**
3. Branch 选 `main`，目录选 `/ (root)`
4. Save
5. 等 1–2 分钟，访问上面的 URL

### Fork 后要改什么

- 你的地址会变成：

  ```text
  https://<你的用户名>.github.io/<仓库名>/
  ```

- 把 README 最上面的游玩链接改成你的地址。
- 如果仓库名不是 `LastStation-Deepseek`，路径也会变；页面内部全部使用相对路径，不需要改代码。
- 更新后浏览器可能缓存旧文件，强制刷新（Cmd/Ctrl+Shift+R）。

### 注意事项

- GitHub Pages 适合这种静态站点；不需要 Node 服务器。
- 音乐总大小约 35MB，在 GitHub Pages 限制内；首次加载会花一点时间。
- 仓库必须是公开的（或使用支持私有 Pages 的账户）。
- 不要把 `node_modules/` 或 `test-results/` 提交上去；`.gitignore` 已处理。
- `file://` 只适合本地开发；线上必须走 HTTP/HTTPS。

### 验证部署

```bash
curl -I https://kejunfang.github.io/LastStation-Deepseek/
curl -I https://kejunfang.github.io/LastStation-Deepseek/assets/music/title_theme.mp3
```

两个都返回 200 即正常。

---

## 17. 调试技巧

浏览器 Console 里可以直接访问 `window.LH`：

```js
LH.State.data            // 当前周目状态
LH.Save.global           // 跨周目碎片/结局/NG+
LH.Save.settings         // 设置
LH.Engine.sceneId        // 当前场景
LH.Engine.lineIndex      // 当前行
LH.Engine.debugJump('ch1_lighthouse')  // 直接跳到场景（会跳过章节卡）
LH.Engine.enterScene('ch2_map', { noCard: true })
```

常用排查：

- **看不到新场景**：从 START 是否可达？`next` 写对了吗？
- **立绘不出现**：`who` 在 `GameData.CHARS` 里吗？`show` 行执行了吗？
- **背景是黑的**：`bg` 名字是否拼错？`Backgrounds.scenes` 里有吗？
- **音乐不响**：点过画面了吗？`TRACKS` key 对吗？控制台有 CORS/404 吗？
- **存档坏了**：检查 localStorage 的 key；测试时可用 `localStorage.clear()` 重置。
- **测试失败**：先看 `test-results/e2e-failure.png`，再单独跑 `npm run test:static` 缩小范围。

不要通过修改测试来让错误的场景通过；测试是在帮你找断链。

---

## 18. 常见坑

1. **`new Audio()`**：全局模块叫 `Audio`，会遮蔽浏览器构造函数。用 `document.createElement('audio')`。
2. **环境音淡出**：`ambNodes` 是 `{ src, f, g, lfo }`，用 `ambNodes.g.gain`。
3. **`chapter: -1`**：这是序章章节卡的触发值，不要改成 0。
4. **`keepCast`**：连续场景（`ch1_tour`、`diner_*`、`ch4_*`）默认会清空立绘；要保留就写 `keepCast: true`。
5. **结局段自动存档**：`autoSave()` 对 `chapter >= 5` 直接 return，避免把玩家困在结局。
6. **map / radio 的 overlay 锁**：`UI.setOverlayLock(true)` 期间 Esc/X 不应关闭。
7. **Skip 只跳已读**：未读文本默认会停下；设置里可开「跳过未读」。
8. **脚本顺序**：`index.html` 的顺序是依赖顺序；新增模块要放在依赖它的模块之前。
9. **`file://` 音乐**：会被 CORS 拦；用 HTTP。
10. **8 / 4 / 4 / 6 是硬编码约定**：8 碎片、4 结局、4 地点、6 存档；改数量要同步 UI、README、测试和结局条件。

---

## 19. 提交前检查清单

- [ ] 任务开始时已运行 `karpathy-guidelines` skill（如果是 AI Agent）。
- [ ] 只包含一个逻辑变更。
- [ ] `npm test` 全绿。
- [ ] 新场景从 START 可达，没有断链。
- [ ] 新碎片/结局有获取/触发路径，且相关计数已同步。
- [ ] 新交互的 happy path 已加入 e2e 或已手工验证并写进 commit body。
- [ ] README / 本教学在行为变化后已更新。
- [ ] 没有提交 `node_modules/`、`test-results/`、`.DS_Store`。
- [ ] commit message 符合 `<type>: <summary>`。
- [ ] 提交后 `git status --short` 干净。

---

## 最后

如果你想加一段自己的剧情，最推荐的第一步是：

1. 复制一个现有场景；
2. 改 `id`、`title`、`text`；
3. 从现有场景的 `next` 或选项接过去；
4. `npm run test:static`；
5. 浏览器里点一遍；
6. `npm test`；
7. commit。

不需要一次做很大。这个项目最初也是这样一段一段长出来的。
