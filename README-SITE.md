# 新伦敦 · 个人控制台（Frostpunk 双纪元博客）

一个把 Frostpunk 的界面语言搬进真实技术博客的 Astro 站点：一台能量塔，五个子域，两个纪元。

- **五个路由**：`/`（主控台 core）、`/telemetry/`（遥测）、`/archive/`（档案）、`/foundry/`（工坊）、`/acoustic/`（声学）
- **两个纪元**：`data-era="1886"`（暗黑煤烟 / 黄铜 / 泼墨）与 `data-era="1920"`（白霜磨砂纸 / `§` / 金色裂缝），HUD 右上旋钮全站切换
- **零位图**：护目镜、派系徽记、研究树、冻原地形、热力图、书架全部是 SVG / CSS 程序生成，仓库里没有一张图片资源

## 快速开始

```bash
npm install --ignore-scripts --no-audit --no-fund   # 本机沙箱禁止 npm 跑带管道的 postinstall
npm run dev          # http://localhost:4321
npm run build        # 产物在 dist/
npm run preview      # 预览构建产物
```

> `npm install` 走的是 `.npmrc` 里配置的镜像与长超时；若在公司网络下失败，改 `registry` 再装。

## 目录

```
src/
  data/site.ts          全部内容（占位符层 + 演示层）
  layouts/BaseLayout    字体、五个 CSS、首帧脚本、HUD、启动画面、页脚
  components/           Hud / Rail / Splash / Goggle / Portrait / Icon / Sheets
  styles/               tokens（双纪元变量）· base · components · pages-core · pages-machines
  pages/                五个路由 + rss.xml.ts + 404.astro
  scripts/site.ts       纪元切换、闸门转场、时钟、WebAudio、抽屉、Lenis
public/                 robots.txt · _headers · audio/（放真实 mp3）
tools/capture.mjs       CDP 无头截图（整页 / 定位 / 点击 / 指定纪元）
tools/probe.mjs         CDP 页面内求值探针
shots/                  本轮的验收截图
```

## 双纪元怎么用

| 入口 | 作用 |
| --- | --- |
| HUD 右上竖胶囊 | 切换 1886 / 1920，写入 `localStorage.nl-era`，闸门动画 760ms |
| `?era=1920` | 深链直达某一纪元（分享 / 截图用） |
| `?nofx=1` | 跳过启动画面（截图 / 自动化用） |

`prefers-reduced-motion: reduce` 时闸门、齿轮、噪点漂移、Lenis 全部降级为瞬时；首屏脚本在样式生效前就把 `data-era` / `data-motion` 写到 `<html>`，不会闪。

## 占位符（保留原样，未擅自填真值）

`{{domain}}` `{{author_name}}` `{{slogan}}` `{{github_handle}}` `{{email}}` `{{city}}` `{{start_date}}` `{{audio_url}}`

替换方式（演示值集中在 `src/data/site.ts` 的 `SITE` / `PLACEHOLDERS`）：

```bash
# 例：只换域名与 GitHub 账号，保留其余占位符
perl -0pi -e 's/\{\{domain\}\}/example.com/g; s/\{\{github_handle\}\}/yourname/g' src/data/site.ts
npm run build
```

`grep -ro '{{[a-z_]*}}' dist | sort | uniq -c` 可核对产物里还剩哪些占位符。

## 接入真实音频

1. 把 mp3 放进 `public/audio/`（文件名英文短横线）。
2. 在 `src/data/site.ts` 的 `PLAYLIST` 每首补 `audio: '/audio/xxx.mp3'`。
3. `src/pages/acoustic.astro` 的播放器已监听 `data-track`，把 `<audio>` 的 `src` 指向该字段即可。

现在所有播放动作只驱动界面状态，页面里的「音槽」区块对此明确标注，不假装有声音。环境混音（炉火 / 风雪 / 齿轮）由 WebAudio 实时合成，不需要文件。

## 部署（Cloudflare Pages）

```bash
npx wrangler pages deploy dist --project-name frostpunk-site
```

`wrangler.toml` 已写死 `pages_build_output_dir = "dist"`、`compatibility_date = "2026-11-01"`。若走 Git 集成，构建命令 `npm run build`、输出目录 `dist`，Node 20+。

## 验收与已知限制

- 截图在 `shots/`：`core-top` `core-profile` `core-shelf` `full-telemetry` `full-archive` `full-foundry` `full-acoustic` `e1920-*` `m-core`。
- 整页截图（`--full`）由 CDP 分块拼接，偶发一条横向接缝；**这是截图工具的现象，不是页面 bug**，视口截图与真实浏览器里没有。
- 人像没有照片可用，程序化人像两次都穿帮（表情僵、剪影像墓碑），最终改成「派系徽记」；若要真人像，替换 `Portrait.astro` 里的 SVG 即可，尺寸 300×400。
- 字体只引了 Noto Serif SC 的 400 / 700 两档（每档 101 个 unicode-range 切片）；需要 900 时自行加 `@fontsource/noto-serif-sc/900.css`，产物体积会明显上升。
- 所有内容为演示数据：统计、热力图、书籍、曲目、日志都是写死的，接真实数据时改 `src/data/site.ts` 与 `telemetry.astro` 里的数组即可。

## 浏览器

Chrome / Edge 120+、Safari 17+、Firefox 121+。用到 `color-mix()`、`clip-path`、`text-wrap`、`View Transitions`（有降级）、`@container`（未用）。IE 与旧 Android WebView 不支持。

## 去模板化修订（2026-11-15 第二轮）

新增 `src/styles/refine.css`（最后一个 CSS 导入，只做覆盖，不动原组件）：
- 章节编号 `01 —` 由 CSS counter 生成，标题与英文名同行对齐，去掉独立 em 副标题；
- 章节头改为制表线，取消滚动淡入；
- 首屏去掉四格读数与双按钮，改成一行事实 + 两个文字链接；统计块改 1.55fr 首卡突出；
- 工坊卡去描边改上沿细线；
- 页头去掉与描边标题重复的编号行；描边英文大字改成标题下方 `—— ENGLISH` 一行小签。
- 1920 研究树单独调黑烟浓度与节点对比。
- `src/scripts/site.ts` 增加 reveal 兜底扫描：锚点跳转 / 加载后补一次可见性检查，避免内容残留 opacity:0。

评审包：`docs/gemini-review.md`（可整段粘给 Gemini，附三张截图）。

截图注意：headless Chrome 整页/遮罩渲染会在纹理上留接缝，那是截图伪影，真实浏览器（bsk 会话）已验证无接缝。

## 部署（GitHub → Cloudflare Pages）

仓库：`tangpangpang5/frostpunk-site`（public）。源码 38 个文件、约 400KB；`dist/`、`node_modules/`、`shots/`、
`public/audio/*.mp3` 都不入库。

Cloudflare Pages 连接 Git 时填：

| 项 | 值 |
| --- | --- |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| 环境变量 | `NODE_VERSION=22`（仓库里的 `.nvmrc` 也写了 22） |

> 首次构建若报 `npm install` 的 peer 警告，不用管；本地验证用的是
> `npm install --ignore-scripts --no-audit --no-fund`，CI 里带脚本执行是正常的。

## 音频与版权

`public/audio/` 下放的是从本地 Steam 音轨拷来的三首 OST，**已被 `.gitignore` 排除**，不会进公开仓库，
所以线上站点的播放键只会改界面状态、不出声。要在线上听，二选一：

- 接受版权风险：删掉 `.gitignore` 里 `public/audio/*.mp3` 那行，再提交音轨；
- 换免版权音源：把 `src/data/site.ts` 里 `PLAYLIST[].src` 指向自己的 CC0/CC-BY 文件。

播放器逻辑在 `src/scripts/site.ts` 的 `#ost` 分支：点曲目行 → 设置 `src` → `play()`；
被浏览器自动播放策略拦住时静默失败，等用户点播放键。
