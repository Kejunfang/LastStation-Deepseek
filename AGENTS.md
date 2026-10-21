# AGENTS.md — 《灯塔不眠》项目工作协议

本文件是这个仓库的**唯一工作约定**，面向所有后续维护者与 AI Agent。
在这里工作，视为你已同意并必须执行第 0 节的硬性规则。

---

## 0. 硬性规则（不可跳过）

### 规则 1：每完成一个变更，立刻提交一次

- 一次「变更」= 一个连贯的功能、修复或文档更新，不是每敲一行代码。
- 一个变更完成并通过测试后，**立即 `git commit`**；不要攒着多个不相关的改动一起提交。
- 一个变更涉及多个文件是正常的（例如新剧情要同时改 `story.js` 和测试）；仍然只提交这一个逻辑变更。
- 提交后运行 `git status --short`，工作区必须是干净的。若不干净，把剩下的部分作为新的变更继续测试、提交。

### 规则 2：提交前必须自己测试；全部通过才允许提交

- 每次提交前必须运行完整测试：

  ```bash
  npm test
  ```

  它包含：
  1. `test-static`：项目结构、JS 语法、场景图、资源/音频/碎片/结局引用；
  2. `test-e2e`：真实浏览器打开游戏，走标题 → 序章 → 设置 → 存档/读档 → 记录 → 手记 → 地图 → 收音机 → 移动端布局。
- **测试未全部通过时，绝不允许 commit。** 先修，再重跑，直到全绿。
- **禁止 `git commit --no-verify`、禁止跳过 hook、禁止只提交一半再补。**
- 提交时 pre-commit hook 会再次自动运行 `npm test`，并额外检查：
  - 是否存在未暂存的改动；
  - 是否存在未跟踪的文件；
  - 依赖是否安装。
  任何一项不满足都会阻止提交。

### 提交信息格式

```text
<type>: <一句话说明>

<可选的变更原因 / 影响范围 / 测试说明>
```

`type` 使用：`feat`、`fix`、`docs`、`test`、`refactor`、`chore`。

示例：

```text
feat: add the shrine memory scene and ema fragment

Adds loc_shrine branches, the ema fragment, and a static scene-graph check.
npm test passes (static + browser smoke).
```

---

## 1. 项目是什么

《灯塔不眠 / The Lighthouse Never Sleeps》是一部**原创日系海岸视觉小说**：

- 舞台：汐见町，八月的最后一周，白鹭灯塔。
- 一周目 20–35 分钟，4 个结局（A / B / C / TRUE）+ 二周目。
- 8 段记忆碎片、羁绊值、地图探索、旧收音机调频。
- 纯原生 HTML / CSS / JavaScript；无框架、无构建步骤、无后端。
- 所有画面（背景、角色、地图、调频刻度）都由 Canvas 代码实时绘制，**没有任何图片素材**。
- 唯一的外部素材是 `assets/music/` 中的 8 首背景音乐（参考项目提供，公开发布前需确认授权）。

不要把它改成 React/Vue/打包工程，除非用户明确要求。

---

## 2. 技术架构

### 2.1 入口与全局模块

`index.html` 按固定顺序加载经典脚本（无 ES module、无 bundler）：

```text
pixel.js → backgrounds.js → characters.js → util.js → save.js → audio.js
→ state.js → story.js → ui.js → minigames.js → engine.js → main.js
```

每个文件都是一个 IIFE，把模块挂到 `window` 上：

| 全局 | 文件 | 职责 |
| --- | --- | --- |
| `PX` | `js/art/pixel.js` | 1px 逻辑网格绘制原语 |
| `Backgrounds` | `js/art/backgrounds.js` | 640×360 程序化场景 |
| `Characters` | `js/art/characters.js` | 90×135 角色立绘、表情、眨眼 |
| `U` | `js/util.js` | DOM、存储、文本标记解析、舞台缩放 |
| `Save` | `js/save.js` | localStorage：全局进度、6 手动栏、自动档、设置 |
| `Audio` | `js/audio.js` | BGM 双轨交叉淡入、合成 SFX、环境音、底噪 |
| `GameData` / `State` | `js/state.js` | 角色/碎片/结局/章节定义；当前周目状态 |
| `Story` | `js/story.js` | 全部场景、选项、地点数据 |
| `UI` | `js/ui.js` | 标题、对话、角色舞台、面板、卡片、画廊 |
| `Mini` | `js/minigames.js` | 汐见町地图、收音机调频 |
| `Engine` | `js/engine.js` | 场景执行、打字机、Auto/Skip、存档、结局 |
| `Main` | `js/main.js` | 启动、标题切换、全局键盘/点击 |

### 2.2 数据流

```text
Story.scenes[sceneId].lines[]
        ↓
Engine.process() 逐行执行
        ↓
say → UI 文本框 + 打字机；choice → UI 选项；map/radio → Mini
        ↓
State (bond / fragments / flags) + Save (global + slots)
        ↓
UI / Audio / Backgrounds / Characters
```

- 存档以**行号**恢复：保存的是 `sceneId + line index + State 快照 + backlog + cast + bg + music`。
- 当前周目状态在 `State.data`；跨周目碎片、结局、已读文本、设置由 `Save.global` 持有。
- `State.addFragment()` 同时写本周目与全局；TRUE 结局判定使用全局八段记忆。

### 2.3 关键不变量

- 8 个碎片 id 定义在 `js/state.js`；每个都必须有获取路径。
- 4 个结局 id：`A`、`B`、`C`、`TRUE`；每个都必须有 `{ t: 'ending' }` 行。
- 4 个地图地点，坐标 0–100；每个 `scene` 必须存在。
- 6 个手动存档 + `auto`。
- localStorage key 版本为 v1：
  - `lighthouse.global.v1`
  - `lighthouse.settings.v1`
  - `lighthouse.slot.N.v1`
  - `lighthouse.auto.v1`
  不要无故改 key；要改必须写迁移。
- BGM key 在 `js/audio.js` 的 `TRACKS`；剧情里的 `music` 必须使用 key。
- `bg` 名字必须在 `Backgrounds.scenes` 中。

---

## 3. 运行与开发

```bash
npm install          # 只装 Playwright 测试依赖，游戏本身零依赖
npm run setup        # 让 git 使用 .githooks/pre-commit（每个 clone 只需一次）
npm test             # 静态检查 + 浏览器 smoke
npm run serve        # http://127.0.0.1:8000
```

也可以：

```bash
python3 -m http.server 8000
```

`file://` 直接打开可以玩，但 Chrome/Safari 会拦截本地 mp3，BGM 静音；这是浏览器限制，不是项目 bug。

测试依赖：

- Node.js >= 20。
- 本机 Chrome（`channel: 'chrome'`），或执行 `npx playwright install chromium` 使用 Playwright 自带 Chromium。
- CI 见 `.github/workflows/ci.yml`。

---

## 4. 测试体系

### 4.1 `npm run test:static`

不启动浏览器，验证：

- `index.html` 引用的 CSS/JS 文件全部存在；
- 所有 JS 文件语法可解析；
- 56 个场景的 `bg` / `music` / `sfx` / `frag` / `who` / `next` / `choice.next` / `if.then` / `if.else` 目标全部存在；
- 从 `START` 出发所有场景可达（防止写了场景却接不上）；
- 8 个碎片都有获取路径，4 个结局都有 trigger；
- 地图 4 个地点、坐标、场景；
- 音频文件存在且非空；
- README 引用的截图存在；
- 存档 key 与 6 个栏位约定存在。

**新增剧情或分支后，必须让静态测试通过，而不是改测试去绕过错误。**

### 4.2 `npm run test:e2e`

启动内置静态服务器 + Playwright：

1. 标题加载；
2. 新游戏 → 章节卡 → 序章推进；
3. 设置面板；
4. 存档（写 slot 0）与读档面板（6+auto）；
5. 历史记录、手记；
6. 地图 overlay → 点击地点 → 进入 `loc_*`；
7. 收音机：调至 82.4 / 85.7 / 88.1，三张记忆卡，完成并进入 `ch3_after`；
8. 844×390 移动端舞台尺寸。

测试失败时截图会写到 `test-results/`（已 gitignore）。

**新增交互时，优先把关键路径加进 e2e，而不是只手工点一遍。**

---

## 5. 提交工作流（严格执行）

每次工作循环：

```bash
# 1. 明确一个变更
git status --short

# 2. 实现
#    ... edits ...

# 3. 自己先测
npm test

# 4. 全绿后暂存（包括测试/文档）
git add -A

# 5. 再次确认没有遗漏
git status --short

# 6. 提交（hook 会再跑一遍 npm test）
git commit -m "feat: ..."

# 7. 确认工作区干净
git status --short
```

如果第 3 步失败：

```bash
# 修到全绿，再从第 3 步重来；不要 commit。
```

如果 hook 报告 unstaged/untracked：说明暂存内容不是完整变更，先整理干净再提交。

**不要把多个不相关变更塞进一个 commit。**
**不要在测试失败时提交。**
**不要用 `--no-verify`。**

---

## 6. 修改指南

### 改剧情

- 只改 `js/story.js` 的场景数据，或在 `js/state.js` 增加碎片/结局定义。
- 新场景必须有 `id`、`chapter`、`title`、`lines`；有下一场景则写 `next`，否则用 `ending` 行结束。
- 新增选项必须给 `next`；条件选项用 `if` 或 `locked` 函数。
- 同步更新：
  - `GameData.CHAPTERS`（若新增章节）
  - 碎片获取路径（若新增碎片）
  - `README.md` 的结局条件（如涉及）
  - 静态测试会自动检查目标和可达性。

### 改画面

- 背景加到 `Backgrounds.scenes`，用 640×360、`P` 绘制原语；不要引入图片。
- 角色在 `Characters` 中扩展；保持 90×135 逻辑网格，4× 最近邻放大。
- 文字/UI 用 CSS 变量和现有 panel 组件；不要另起一套视觉语言。
- 动效要支持 `reduceMotion`（设置里的减少动态效果）。

### 改音频

- 新 BGM：把 mp3 放入 `assets/music/`，在 `TRACKS` 增加 key，剧情用该 key。
- 新 SFX：在 `sfx` 对象加合成函数；`playSfx` 名称必须存在于静态测试解析出的集合。
- 注意 `Audio` 是全局模块名，**不要写 `new Audio()`**；用 `document.createElement('audio')`。

### 改存档

- 保持 v1 key 兼容；如果必须加字段，用默认值合并，不要破坏旧档。
- 存档缩略图由 `UI.captureThumb()` 生成；不要引入跨域图片导致 canvas 污染。
- 自动存档不应该在 chapter 5（结局段）产生，避免把玩家困在结局里。

---

## 7. 常见坑（真实踩过）

1. **全局 `Audio` 与浏览器 `Audio` 构造函数同名**：`new Audio()` 会报 “Audio is not a constructor”。用 `document.createElement('audio')`。
2. **环境音节点字段**：`ambNodes` 是 `{ src, f, g, lfo }`，淡出时用 `ambNodes.g.gain`，不是 `ambNodes.gain`。
3. **`chapter: -1` 是故意的**：新游戏时用于触发序章章节卡；不要“修正”成 0，否则序章没有章节卡。
4. **场景切换默认清空立绘**：连续场景（如 `ch1_tour`、`diner_*`、`ch4_*`）用 `keepCast: true` 保持角色，否则会闪一下。
5. **自动存档不能在结局段**：`autoSave()` 对 `chapter >= 5` 直接 return。
6. **radio / map 是强制 overlay**：`UI.setOverlayLock(true)` 期间 Esc/X 不应关闭；完成或选择地点时才释放。
7. **跳过逻辑只跳已读**：`Save.settings.skipUnread` 控制“跳过未读”；新剧情测试时不要假设 Skip 会一路到底。
8. **脚本章序**：`index.html` 的顺序是依赖顺序；新增模块要放在依赖它的模块之前。
9. **音乐在 `file://` 下会被 CORS 拦**；这是浏览器行为，测试统一走 HTTP。

---

## 8. 完成定义（Definition of Done）

提交前逐项确认：

- [ ] 只包含一个逻辑变更，没有顺手夹带无关修改。
- [ ] `npm test` 全绿（static + e2e）。
- [ ] 新剧情/新分支的场景目标、碎片、结局都被静态测试覆盖。
- [ ] 新交互的 happy path 已加进 e2e 或手动验证并在 commit body 说明。
- [ ] README / AGENTS 在行为或流程变化后已更新。
- [ ] 没有 `node_modules/`、`test-results/`、`.DS_Store` 被暂存。
- [ ] commit message 符合 `<type>: <summary>`。
- [ ] 提交后 `git status --short` 干净。
