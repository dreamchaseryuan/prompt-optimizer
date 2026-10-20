# UI 设计系统升级实现方案 — 深色工作室（Dark Studio）

> 作者：架构师高见远（software-architect-2）
> 依据：`.impeccable.md` 设计上下文 + 代码实地勘察（所有结论均有文件路径:行号）
> 策略：设计系统升级——功能逻辑与组件 API 不动，重写 token / 主题 / 布局样式 / 关键页面视觉

---

## 0. 现状勘察结论（设计的事实基础）

### 0.1 Naive UI 主题体系
- **唯一定义点**：`packages/ui/src/config/naive-theme.ts`（1444 行）。共 **6 套主题**：`light` / `dark` / `blue` / `classic` / `green` / `purple`，每套 = `naiveTheme`（Naive 内置 lightTheme/darkTheme）+ `themeOverrides`（common + Button/Input/Card/Tabs/Radio/Dropdown/Modal/Popover/Tooltip/Switch/Checkbox/Progress/Slider/Pagination/Select peers）。
- **色值全部为 sRGB hex 硬编码**。当前主色 `#4f46e5`（浅）/ `#818cf8`（深）——典型 AI 味靛紫，hue ≈ 277，是本次要替换的核心。
- **切换机制**（必须保持）：
  - `switchTheme(themeId)` → `useGlobalSettings(pinia).updateThemeId()` 持久化（naive-theme.ts:1078-1087）
  - `'auto'` 模式走 `prefers-color-scheme` watch（naive-theme.ts:1042-1075）
  - `applyThemeId()` 同步 Tailwind：`document.documentElement.classList.toggle('dark', isDark)`（naive-theme.ts:991-1011，Tailwind `darkMode: 'class'`）
  - 消费端：`PromptOptimizerApp.vue:14-18` `<NConfigProvider :theme :theme-overrides>` + `PromptOptimizerApp.vue:215` `<NGlobalStyle />`（body 底色由它输出）
  - composable 包装：`composables/ui/useNaiveTheme.ts`
- **Naive 注入的 `--n-*` CSS 变量**是当前"事实 token 层"：壳层 `.app-shell`（MainLayout.vue:38）、`.app-sidebar`（AppSidebar.vue:344-345）、`workspace.css:7` 全在消费 `var(--n-body-color)` / `var(--n-card-color)` / `var(--n-border-color)` 等。这些变量由 NConfigProvider 元素从 common token 自动派生——**换 themeOverrides 色板即可整体生效，壳层无需改取值方式**（但建议迁移到自有 token，见 §3）。

### 0.2 全局样式与字体
- `packages/ui/src/styles/`：`index.css`（Tailwind v4 `@import "tailwindcss"` + `@config` 指向旧 v3 配置 + 4px 滚动条）、`common.css`、`workspace.css`（高特异性 `.app-shell .app-content` 前缀覆盖：卡片去阴影加边框、紧凑 header、编辑器 13.5px）、`scrollbar.css`。
- `tailwind.config.js`：`primary/background/card` 等颜色映射指向 `--color-*` 变量，但**这些变量在应用内没有任何定义点**（仅在 `utils/favorite-share-export.ts` 的导出 HTML 模板里定义）——Tailwind 语义色实际是悬空引用，样式上无人依赖，可安全忽略/顺手清理。
- **字体：零声明**。无 webfont、无全局 font-family（依赖 Naive 默认栈）；等宽字体在 8+ 个组件里各写各的（Consolas/Menlo/Monaco/monospace 随机组合，见 grep 结果：XmlRenderer.vue、TextDiff.vue、InlineDiff.vue、VersionCompareModal.vue、DataManager.vue 等）。`web/index.html` 无字体加载。

### 0.3 布局壳层
- `components/MainLayout.vue`：fixed 全屏 `.app-shell` = 侧边栏插槽 + `.app-body`（48px `.app-topbar` + `.app-content`）。**顶栏 `backdrop-filter: saturate(1.4) blur(10px)`（MainLayout.vue:60-61）**——玻璃拟态禁区 + 性能风险点。
- `components/app-layout/AppSidebar.vue`：232px（折叠 60px），纯 scoped CSS。**导航图标全部是 emoji**（🖥️📝💬🔣🎨🖼️🗂️🎬🎞️⚡⭐🗂️📜⚙️💾🔢，AppSidebar.vue:239-293）——廉价感与跨平台渲染不一致的最大来源。active 态 = 主色 10% 底 + 主色字（472-476）。
- 标题在顶栏 slot（PromptOptimizerApp.vue currentPageTitle:496-513），字号 13px（MainLayout.vue:68）。

### 0.4 组件样式风格
- **51 个组件直接使用 NCard**；`Panel.vue` 就是裸 NCard 包装——"万物皆卡片"的根源。`workspace.css:11-14` 已全局把 NCard 改成"无阴影+细边框"，方向对但层级仍扁平。
- 卡片套卡片普遍：工作区（如 `basic-mode/BasicSystemWorkspace.vue`，1984 行）里 `TestSourceLinkedCard`/`InputPanel`/`OutputDisplay` 各自是容器，互相嵌套。
- `HistoryDrawer.vue:456-457` style 块为空——完全裸用 NModal+NCard 默认样式；空态是 48px emoji 📜（238 行）。
- `PromptPanel.vue:898-983` 有自研 pulse 动画（780ms/860ms，brightness/saturate 滤镜）——偏花哨，需收敛。
- **3 处 backdrop-filter**：MainLayout.vue、OutputDisplay.vue、image-mode/ImageMultiImageWorkspace.vue。
- 工作区组件大量 inline style + Tailwind utility 混用（如 BasicSystemWorkspace.vue:41-48）。

---

## 1. 设计 token 体系（核心产出）

### 1.1 架构：双层 token

```
┌─ 层 1：Naive UI themeOverrides（naive-theme.ts）─────────────┐
│  消费者：所有 Naive 组件（51 组件 × NCard / Input / Button…）  │
│  值：sRGB hex（由下方 oklch 色板换算，见 §5 兼容性说明）        │
├─ 层 2：自有 CSS token（新文件 styles/tokens.css）─────────────┤
│  消费者：壳层 CSS、workspace.css 补刀、自定义组件样式           │
│  值：oklch() + light-dark() 原生函数，html[color-scheme] 驱动  │
└──────────────────────────────────────────────────────────────┘
```

层 2 示例：
```css
:root { color-scheme: light dark; }
html.color-scheme-dark  { color-scheme: dark; }
html.color-scheme-light { color-scheme: light; }

:root {
  --ds-bg-canvas:  light-dark(oklch(0.965 0.006 300), oklch(0.170 0.012 300));
  --ds-bg-shell:   light-dark(oklch(0.945 0.008 300), oklch(0.205 0.014 300));
  --ds-bg-panel:   light-dark(oklch(0.990 0.004 300), oklch(0.240 0.016 300));
  --ds-bg-raised:  light-dark(oklch(1.000 0.000 0),   oklch(0.275 0.018 300));
  /* … 全表见下 */
}
```
`applyThemeId()` 里加一行同步（naive-theme.ts:991 内）：`document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'`（或加 class），使 `light-dark()` 随主题切换生效。**现有 `.dark` class / prefers-color-scheme / 持久化逻辑全部不动。**

### 1.2 oklch 色板表（双主题完整色阶）

设计语言：**暖深灰紫调底**（hue 300，chroma 极低 0.006–0.02，绝不纯黑纯白）；**品牌主色 = 深紫罗兰 Violet Ink**（hue 310，刻意偏离 AI 味靛紫 hue 277，向 wine/violet 方向拉）；语义色全部低饱和。

#### 深色主题（主战场）

| token | oklch | 换算 hex（≈） | 用途 |
|---|---|---|---|
| bg-canvas | `oklch(0.170 0.012 300)` | `#1a1720` | app 底（暖深灰，非纯黑） |
| bg-shell | `oklch(0.205 0.014 300)` | `#221e2a` | 侧边栏 / 顶栏 |
| bg-panel | `oklch(0.240 0.016 300)` | `#292434` | 卡片/面板 |
| bg-raised | `oklch(0.275 0.018 300)` | `#312b3d` | 输入框 / popover / raised |
| bg-hover | `oklch(0.310 0.020 300)` | `#3a3347` | hover 面 |
| fg-strong | `oklch(0.940 0.010 300)` | `#efedf2` | 大标题 / hero |
| fg-0 | `oklch(0.880 0.012 300)` | `#e2dfe7` | 正文 |
| fg-1 | `oklch(0.730 0.015 300)` | `#b7b1c0` | 次要 |
| fg-2 | `oklch(0.570 0.018 300)` | `#8c8499` | 辅助 / 占位弱 |
| fg-3 | `oklch(0.450 0.016 300)` | `#6b6478` | disabled / 装饰 |
| **primary** | `oklch(0.640 0.160 310)` | `#9d5fb8` | 主按钮底 / 强调（Violet Ink） |
| primary-hover | `oklch(0.690 0.150 310)` | `#b07ac7` | |
| primary-pressed | `oklch(0.580 0.160 310)` | `#8a4fa6` | |
| primary-suppl | `oklch(0.790 0.110 310)` | `#c99ade` | 深底上的链接/文字强调 |
| primary-tint | `oklch(0.640 0.160 310 / 14%)` | — | 选中底（用 color-mix） |
| success | `oklch(0.720 0.140 155)` | `#4ec07e` | |
| warning | `oklch(0.780 0.140 75)` | `#dfa243` | |
| error | `oklch(0.660 0.180 25)` | `#e2606c` | |
| info | `oklch(0.700 0.090 230)` | `#62a0d8` | |
| border | `oklch(0.300 0.018 300)` | `#37303f` | 1px 面板描边 |
| border-strong | `oklch(0.360 0.020 300)` | `#453d51` | hover 边 |
| divider | `oklch(0.255 0.014 300)` | `#2c2735` | 分隔线 |

#### 日间主题（同构反转，同 hue 系统）

| token | oklch | 换算 hex（≈） | 用途 |
|---|---|---|---|
| bg-canvas | `oklch(0.965 0.006 300)` | `#f4f2f6` | app 底（紫调纸灰） |
| bg-shell | `oklch(0.945 0.008 300)` | `#eeebf1` | 侧边栏 / 顶栏 |
| bg-panel | `oklch(0.990 0.004 300)` | `#fbfafc` | 卡片/面板 |
| bg-raised | `oklch(1.000 0.000 0)` | `#ffffff` | 输入框 / popover |
| bg-hover | `oklch(0.930 0.010 300)` | `#eae6ee` | hover 面 |
| fg-strong | `oklch(0.200 0.020 300)` | `#2b2433` | 大标题 / hero |
| fg-0 | `oklch(0.260 0.020 300)` | `#38313f` | 正文 |
| fg-1 | `oklch(0.430 0.020 300)` | `#675e71` | 次要 |
| fg-2 | `oklch(0.560 0.018 300)` | `#857c90` | 辅助 |
| fg-3 | `oklch(0.700 0.014 300)` | `#aaa2b2` | disabled |
| **primary** | `oklch(0.480 0.170 310)` | `#8a3aa9` | 主按钮底（深紫保对比） |
| primary-hover | `oklch(0.430 0.165 310)` | `#783196` | |
| primary-pressed | `oklch(0.380 0.150 310)` | `#672781` | |
| primary-suppl | `oklch(0.550 0.160 310)` | `#a24cc0` | 浅底上的链接/强调 |
| success | `oklch(0.520 0.140 155)` | `#1d9457` | |
| warning | `oklch(0.620 0.140 75)` | `#b57a1a` | |
| error | `oklch(0.550 0.190 25)` | `#c93a4b` | |
| info | `oklch(0.520 0.100 230)` | `#3b6ba3` | |
| border | `oklch(0.905 0.010 300)` | `#e0dce4` | |
| border-strong | `oklch(0.855 0.012 300)` | `#d2ccd8` | |
| divider | `oklch(0.930 0.008 300)` | `#e9e5ec` | |

**对比度承诺**：两主题下 fg-0/bg-canvas ≥ 10:1，fg-1 ≥ 5.5:1，primary 按钮白字 ≥ 4.5:1（hex 换算后须用工具复核 WCAG AA，见任务 B6）。

#### Neutra 主题收敛（决策）
现 6 套主题中 `blue/classic/green/purple` 为历史遗留。方案：**保留配置对象不删除**（兼容 `switchTheme` API 与已持久化的用户偏好），但 `applyThemeId` 增加映射：读到的 legacy id → 落到 light/dark；`ThemeToggleUI` 下拉只展示 light/dark/auto。这样 API 零破坏、UI 收敛、死配置可在后续版本清理。

### 1.3 Naive UI themeOverrides 完整键位清单

在现有覆盖集（naive-theme.ts:25-218 结构）基础上增补。**common 层**（light/dark 各一份，值取上表 hex）：

```
primaryColor / primaryColorHover / primaryColorPressed / primaryColorSuppl
successColor(+Hover/Pressed/Suppl)  warningColor(...)  errorColor(...)  infoColor(...)
bodyColor(card→canvas)  cardColor(panel)  modalColor(panel)  popoverColor(raised)
tableColor / tableColorHover  inputColor(raised)  actionColor(shell)  hoverColor
textColorBase / textColor1 / textColor2 / textColor3 / textColorDisabled
placeholderColor  iconColor(+Hover/Pressed/Disabled)
borderColor / borderColorModal  dividerColor
borderRadius: '8px'  borderRadiusSmall: '6px'
fontWeightStrong: '600'
fontFamily: 系统栈（见 §1.4）  fontFamilyMono: 等宽栈（见 §1.4）
boxShadow1/2/3（见 §1.6）  scrollbarColor(+Hover)
closeIconColor(...)  clearColor(...)
```

**组件层必改键**（新增项以 ➕ 标注，现有项换值）：
- **Button**：现有全部键保留换值；➕ `ghostColorPrimary`/`ghostColorHoverPrimary`/`ghostColorPressedPrimary`（当前 ghost 派生依赖主色混色，显式给出避免派生误差）
- **Input/Select(InternalSelection)**：现有键换值；聚焦改为 **2px 主色环** `boxShadowFocus: 0 0 0 2px <primary 35%>`（3px→2px，更克制）
- **Card**：换值；`borderRadius: '8px'`（10→8 收敛）；`boxShadow: 'none'`（阴影全部交给边框与色阶；modal 内卡片除外）
- **Modal/Popover/Dropdown/Drawer**：换值；阴影统一用 shadow-token（§1.6）；`Drawer: { color }` ➕ 补 `borderColor`
- **Tabs/Radio**：换值；Radio 按钮组 active 改 `buttonTextColorActive: fg-0` + `buttonColorActive: bg-hover`（弱主色、强调文字层级）
- ➕ **Tag**：`colorPrimaryBackdrop`、`textColor*`、`borderRadius: '4px'`（Tag 是历史/来源标签的主要载体，当前完全走默认蓝紫，是"AI 味"重灾区）
- ➕ **Empty**：`iconColor: fg-3`、`textColor: fg-2`（消 emoji 空态的默认蓝）
- ➕ **Dialog**：`borderRadius: '12px'`、icon 色对齐语义色
- ➕ **Scrollbar**：`color: <fg-2 30%>`、`colorHover: <fg-2 50%>`
- ➕ **Spin/Progress/Slider/Switch/Checkbox/Pagination**：换主色即可（现有键保留）
- ➕ **Layout**（若历史组件残留使用）与 **Divider**：`dividerColor`

**themeOverrides 中所有色值一律填 hex**（oklch 换算表已给）。原因见 §5.1。

### 1.4 字体方案

**决策：中文走精致系统栈，不引中文 webfont**（MiSans/HarmonyOS Sans/霞鹜文楷均 5–15MB 级或许可审查成本，收益低）；**自托管 2 个极小 latin woff2 作性格点缀**（合计 < 60KB，本地打包无 CDN 依赖）：

| 角色 | 字体 | 回退链 | 用途 |
|---|---|---|---|
| 正文 UI | （系统栈） | `system-ui, -apple-system, "Segoe UI", "PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei UI", sans-serif` | 全部界面文本 |
| 展示/数字 | **Space Grotesk**（500/700 两档） | `"Space Grotesk", system-ui, sans-serif` | 版本号 V0/V1、计数徽标、品牌字标、空态大字、页头 hero 数字 |
| 等宽 | **IBM Plex Mono**（400/500） | `"IBM Plex Mono", ui-monospace, "Cascadia Code", Consolas, monospace` | 提示词代码块、变量名、JSON/XML 渲染、Diff（统一替换现有 8 处硬编码） |

落地：woff2 放 `packages/ui/src/assets/fonts/`，`@font-face` 写进 `tokens.css`（`font-display: swap`）；Naive common 的 `fontFamily/fontFamilyMono` 与全局 `body` 栈同步；替换组件内 8+ 处散装 mono 为 `var(--n-font-family-mono)`。

### 1.5 间距 / 圆角 / 阴影 token

```
--ds-space-1: 4px   --ds-space-2: 8px   --ds-space-3: 12px
--ds-space-4: 16px  --ds-space-6: 24px  --ds-space-10: 40px
节奏规则：组件内部 8/12；同区块内组件间 16；区块间 24；大区块组间 40（层级跳跃 ≥2x，禁止 12/14/16/18 均匀铺）
--ds-radius-sm: 6px   （tag、小按钮内件）
--ds-radius-md: 8px   （按钮、输入、卡片、面板）
--ds-radius-lg: 12px  （modal、drawer、popover）
--ds-shadow-overlay: 深色 0 8px 24px oklch(0.1 0.02 300 / 45%), 0 32px 80px oklch(0.1 0.02 300 / 55%)
                     日间 0 8px 24px oklch(0.3 0.02 300 / 8%),  0 32px 80px oklch(0.3 0.02 300 / 12%)
原则：平面元素零阴影（边框+色阶表达层级）；阴影只属于浮层（modal/popover/dropdown/drawer/tooltip）
```

### 1.6 动效 token

```
--ds-ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1)     ← 默认
--ds-ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1)     ← 大位移入场
--ds-dur-fast: 150ms   （hover/active/按压）
--ds-dur-base: 200ms   （普通状态变化、折叠）
--ds-dur-slow: 300ms   （modal/drawer 入场、页面切换）
--ds-stagger: 50ms     （入场编排步进）
禁：ease-out-back/elastic、>300ms、<100ms 的装饰动画
```

---

## 2. 布局与关键页面改造点

### 2.1 App 壳（MainLayout.vue）
1. **顶栏去玻璃**：删 `backdrop-filter`（MainLayout.vue:60-61），改实色 `var(--ds-bg-shell)` + 底边 `var(--ds-divider)`。48px 高度保留。
2. **顶栏标题降级**：13px/600 保持，但颜色 fg-1——顶栏是"仪表"，不是 hero；页面焦点交给工作区页头（§2.3）。
3. **内容区节奏**：`app-content-inner` 的 padding（MainLayout.vue:95）改为 `24px clamp(20px, 2.5vw, 48px) 48px`（底部大留白，形成"呼吸底边"）。
4. **入场编排**：`app-shell` 子元素一次性 stagger（sidebar 0ms → topbar 50ms → content 100ms；`opacity 0→1` + `translateY(4px)→0`，各 300ms ease-out-expo；仅首挂载，用 CSS animation + `prefers-reduced-motion` 关停）。

### 2.2 侧边栏（AppSidebar.vue）——视觉重构核心
1. **emoji 图标 → SVG 线性图标**：新建 `components/icons/nav-icons.ts`（12–14 个 16px、stroke 1.5、currentColor 的 path 常量），替换 AppSidebar.vue:59/79 的 `{{ item.icon }}`。这是"AI 味"最大的单点消除。分组结构（workspaceSections:235-265 / toolItems:285-293）与 i18n 不动，仅图标字段类型从 emoji string 换为图标名。
2. **底色反转**：sidebar 底 = `bg-shell`（比 canvas 亮一阶的深灰紫），与内容区形成"操纵台 vs 舞台"两区，而非同底+边线的均质。
3. **active 态重塑**（替换 472-476）：`background: var(--ds-bg-panel)` 实底 + 文字 fg-0 加粗 + **左侧 2px 主色指示条**（absolute 定位小条，进入动画 200ms ease-out-quart）+ 图标变 primary-suppl。hover = `bg-hover` 弱化底。放弃"主色 10% 大色块"（那个很 AI）。
4. **分组标题**（434-441）：11px→10.5px、letter-spacing 0.08em、fg-3；分组间留白 14px→20px（上密下疏的节奏）。
5. **品牌区**（376-421）：产品名 13px→14px + Space Grotesk 700（仅 latin 字符生效，中文自动回退系统栈）；logo 26px 保留。
6. 底部辅助区、折叠逻辑（60px）、持久化 key 不动。

### 2.3 工作区页头与"卡片 → 对比"语言
**一屏一焦点**：每个工作区顶部新增（视觉层，不改 DOM 结构——在 `workspace-page-tools` 行上做样式强化，见 workspace.css:37）：
- 页头 hero 行：模式名 18–20px / 700 / fg-strong（Space Grotesk 混排拉丁数字），下方 12px fg-2 说明文字；与下方内容间距 24px。
- `workspace-page-tools` 从"工具条"弱化为页头右侧的图标按钮组（无容器、无底色）。

**卡片语言转换策略**（对象 → 处置）：
| 现状 | 处置 | 视觉 |
|---|---|---|
| 工作区外层容器（TestSourceLinkedCard 等包裹层） | **保留容器，换质感** | `bg-panel` + 1px border + radius-md + 零阴影 |
| 卡片内的子卡片（InputPanel/OutputDisplay 内部 NCard） | **降级为面板内分区** | 去边框去底色，用 12px 留白 + 分隔线（`divider`）分区 |
| 工具行、版本行、元信息行 | **彻底去容器** | 纯留白排版，hover 才出现 `bg-hover` |
| Modal / Drawer / Dropdown | **保留强容器** | `bg-raised` + radius-lg + overlay 阴影 |
| 空态（HistoryDrawer 等 NEmpty + emoji） | **去 emoji，改排版** | fg-3 大字号（Space Grotesk 数字）+ 一行 fg-2 说明，无插画 |

实施优先用 **CSS 层**（`workspace.css` 已有 `.app-shell .app-content` 特异性前缀模式）：`.n-card .n-card` 规则直接让嵌套内卡透明化，避免逐个改 51 个组件的 template——这是"组件 API 不动"约束下成本最低的路径。逐组件改 template 仅保留给 3 个门面组件（见任务 B4）。

### 2.4 门面组件（仅这 3 个做 template 级改造）
1. `InputPanel.vue`：输入区成为全屏 hero——textarea 字号 13.5→14px、行高 1.7、placeholder fg-3；模型/模板选择行降级为输入框下方的"元信息行"（去卡片化）。
2. `OutputDisplay.vue`：优化结果区 = 等宽栈 + 14px；流式输出时 caret 主色闪烁；复制/编辑按钮浮出式（hover 才显现，200ms）。
3. `HistoryDrawer.vue`：列表项从 NCard 流改"行式列表"（分隔线 + 留白 + hover 底），来源 Tag 收敛为单色描边 tag。

---

## 3. 动效方案（状态变化微交互清单）

| 触发 | 动效 | 参数 |
|---|---|---|
| 侧边栏 nav hover | bg 淡入 | 120ms ease-out-quart |
| 侧边栏 nav 激活切换 | 左指示条滑入 + bg 切换 | 200ms ease-out-quart |
| 侧边栏折叠/展开 | width 过渡（已有 0.16s，改用 token） | 200ms ease-out-quart |
| 工作区路由切换（RouterView） | fade + translateY(6px) | 250ms ease-out-expo（首次可 stagger 50ms） |
| 按钮 hover/active | 底色 / 轻微下沉(0.5px) | 150ms |
| Input/Select focus | 2px 主色环 scale-in | 150ms |
| Modal/Drawer 入场 | scale(0.98→1)+fade / translateX | 250ms ease-out-quart（Naive 自带，仅换 easing token 需 CSS 补刀） |
| Dropdown/Popover | fade + 4px 下移 | 150ms |
| 优化中（流式输出） | caret 主色闪烁 1s steps(2) + 面板顶缘 2px 主色进度线（indeterminate 缓动） | 持续 |
| 优化完成 | 结果区内容 fade-in | 200ms，一次性 |
| 版本标签切换（PromptPanel:898-927） | **删除** brightness/saturate pulse 双动画，收敛为：选中环 150ms + 切换内容 fade 200ms | — |
| 复制成功 | 按钮图标瞬变 + fg 回落 | 150ms，无位移 |
| Toast | 上移 8px + fade 入场 | 200ms ease-out-quart |
| 全局 | `@media (prefers-reduced-motion: reduce)` 全部动画时长归零 | — |

---

## 4. 风险与兼容

1. **Naive UI 内部色彩派生需要可解析色值**：seemly 的 `fade()/composite()/changeColor()` 只认 hex/rgb。若直接传 `oklch()` 字符串，未显式覆盖的派生 token 会产出非法值。**对策**：themeOverrides 一律 hex（本方案已给出 oklch↔hex 双列）；oklch 只活在自有 CSS token 层。同时 §1.3 把 hover/pressed/suppl/ghost 全部显式覆盖，不给派生逻辑留入口。
2. **覆盖不到的组件细节**（Tag/Empty/Collapse/Timeline/Notification 等）：沿用 `workspace.css` 的高特异性前缀模式，新增 `styles/naive-fixes.css` 统一补刀（保持 `.app-shell .app-content` 前缀或全局 body 级）。
3. **亮暗切换机制**：持久化 store、auto/watch、`.dark` class、`NGlobalStyle` 全部不动；新增仅 `color-scheme` 同步一行。light-dark() 在 Chrome 123+/Electron 新内核可用；**桌面端 Electron 内核需确认 ≥123**（packages/desktop 构建配置），否则层 2 token 回退方案：tokens.css 同时输出静态双值 + `.dark` class 选择器（Tailwind class 已在同步，回退成本为零）——工程师实现时先探内核版本再定。
4. **避免大范围 DOM 改动**：除 §2.4 三个门面组件外全部走 CSS；E2E `data-testid` 一律不碰（AppSidebar nav 的 testid 由 path 派生，图标改动不影响）。
5. **性能**：删除现存 3 处 backdrop-filter；禁止新增 blur/大面积渐变/box-shadow 动画（只动 transform/opacity/color）；webfont 仅 2 个 latin 小包 + swap。
6. **legacy 主题映射**：blue/classic/green/purple → light/dark 映射写在 `applyThemeId` 入口，老用户 localStorage 无感迁移（§1.2 Neutra 决策）。
7. **回归面**：Tailwind v4 `@import` + `@config` 混用现状不动，避免构建链回归；tokens.css 插在 `index.css` import 首位。

---

## 5. 有序任务列表（工程师执行批次）

> 每批独立可验收、可合入；依赖关系标注。构建命令按环境约定（corepack pnpm）。

- **B0 基线与守卫**（无依赖，先行）
  1. 双主题 × 6 个关键页面截图基线（basic/system、basic/user、pro/multi、image/text2image、video/text2video、favorites）。
  2. 跑通现有 E2E（playwright）确认绿灯，作为视觉改动的行为守卫。
  3. 确认 desktop Electron 内核版本（light-dark() 可用性 → 决定层 2 token 实现路线，见 §4.3）。
- **B1 Token 层**（依赖 B0）
  1. 新建 `styles/tokens.css`：§1.2 色板全表 + §1.5/1.6 token（含 `.dark` class 回退路线，若内核 <123）。
  2. `applyThemeId()` 加 color-scheme 同步（naive-theme.ts:991）。
  3. 全局字体栈落地（tokens.css body + @font-face；Naive common `fontFamily/fontFamilyMono` 待 B2 一起）；替换 8 处散装 mono。
  验收：切主题时 html color-scheme 正确；现有界面无视觉回归（仅字体微变）。
- **B2 Naive themeOverrides 重写**（依赖 B1）
  1. `naive-theme.ts` light/dark 两套 overrides 按 §1.2 hex + §1.3 键位清单重写（含新增 Tag/Empty/Dialog/Scrollbar/Divider）。
  2. legacy 主题映射收敛（§1.2 决策）+ ThemeToggleUI 下拉收敛 light/dark/auto。
  验收：全应用两主题下无一处残留 `#4f46e5/#818cf8`；旧偏好用户无感迁移；E2E 绿。
- **B3 壳层改造**（依赖 B2）
  1. MainLayout：顶栏去 backdrop-filter、实色化、内容区 padding 节奏（§2.1）。
  2. AppSidebar：SVG 图标系统替换 emoji（新建 nav-icons.ts）、active 态指示条、分组节奏、品牌字标（§2.2）。
  3. 壳层 stagger 入场 + reduced-motion 关停。
  验收：AI Slop Test 抽查——侧边栏不再是"emoji + 蓝紫胶囊"；性能面板无 blur 合成层。
- **B4 工作区视觉**（依赖 B2，可与 B3 并行）
  1. `workspace.css` 扩展：卡片→面板/分区语言（嵌套卡透明化规则）、页头 hero、间距节奏（§2.3）。
  2. 三个门面组件 template 级改造：InputPanel / OutputDisplay / HistoryDrawer（§2.4）。
  验收：任一工作区截图满足"一屏一焦点"；卡片不嵌套；空态无 emoji。
- **B5 动效统一**（依赖 B3/B4）
  1. §3 微交互清单逐项落地（含 RouterView transition、流式输出反馈、PromptPanel 动画收敛）。
  验收：全部动画在 token 内；reduced-motion 生效；无回弹/无 >300ms。
- **B6 双主题验收**（依赖 B5，收口）
  1. WCAG AA 对比度全表复核（重点 primary 按钮、fg-1、Tag）。
  2. AI Slop Test 终审：双主题全页面截图走查，逐条对照禁区清单（渐变/玻璃/发光/卡片套卡片/回弹）。
  3. 性能走查：无 backdrop-filter、无大面积合成层、字体加载无 CLS。
  4. legacy 主题用户迁移冒烟 + E2E 全量回归。

---

## 6. 明确"不做什么"（约束边界）

1. **不动**：组件 props/emits/API、业务逻辑、composable、store、路由结构、i18n、持久化格式、E2E 选择器（data-testid）。
2. **不做**：任何渐变（品牌也不渐变）、玻璃拟态/backdrop-filter、霓虹发光、新增卡片、卡片套卡片、圆角+通用阴影组合、Inter/Roboto、标题上方大图标、回弹缓动。
3. **不引入**：新 UI 库、CSS-in-JS、UnoCSS、CSS 框架迁移（Tailwind 保持现状用法）；中文 webfont。
4. **不重设计** legacy 主题（blue/classic/green/purple）色板——只做映射收敛。
5. **不改** `index.html` 的 config.js 注入结构、Docker/构建产物形态；不新增运行时依赖（webfont 文件为本地资源）。
6. **不批量改** 51 个用 NCard 组件的 template（除 §2.4 三处门面）——一切优先 CSS 层解决。
7. 单批次不做超过一个门面组件，改完即跑 E2E，避免大爆炸合并。
