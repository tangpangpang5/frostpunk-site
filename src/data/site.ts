/**
 * 站点内容源。
 *
 * 模板占位符规则（来自 README）：`{{variable_name}}` 必须原样保留，
 * 不重命名、不删除、不替换为具体值。
 * 因此这里分两层：
 *   PLACEHOLDERS —— 模板层，原样保留双花括号，供后续注入；
 *   demo         —— 演示层，本轮用于渲染的真实排版数据。
 * 替换真实资料时只改 `demo`，或改 build 时的注入脚本。
 */

export const PLACEHOLDERS = {
  domain: '{{domain}}',
  author_name: '{{author_name}}',
  slogan: '{{slogan}}',
  github_handle: '{{github_handle}}',
  email: '{{email}}',
  city: '{{city}}',
  start_date: '{{start_date}}',
} as const;

export type EraId = '1886' | '1920';

export const SITE = {
  title: '新伦敦 · 个人控制台',
  tagline: 'THE GENERATOR MUST NOT FAIL',
  domain: '{{domain}}',
  author: '顾寒',
  authorEn: 'GU HAN',
  handle: '{{github_handle}}',
  email: '{{email}}',
  city: '新伦敦',
  slogan: '在绝对零度里，维持一行代码的燃烧。',
  manifesto:
    '把每一次提交当成一次供暖调度：热量有限，必须送到最冷的地方。',
  startDate: '2018-03-14',
  role: '前端架构师 / 图形与交互动效',
  status: '正在维持 126% 的供暖效率',
} as const;

export const NAV = [
  { id: 'core', href: '/', label: '主控台', en: 'CORE', sub: 'core' },
  { id: 'telemetry', href: '/telemetry', label: '遥测', en: 'TELEMETRY', sub: 'telemetry' },
  { id: 'archive', href: '/archive', label: '档案', en: 'ARCHIVE', sub: 'archive' },
  { id: 'foundry', href: '/foundry', label: '工坊', en: 'FOUNDRY', sub: 'foundry' },
  { id: 'acoustic', href: '/acoustic', label: '声学', en: 'ACOUSTIC', sub: 'acoustic' },
] as const;

export type NavId = (typeof NAV)[number]['id'];

export const ETHOS = [
  {
    key: '进步',
    en: 'PROGRESS',
    icon: 'gear',
    line: '我们把设计稿当成契约，把性能预算当成法律。',
    body: '从煤炭时代到石油时代，工具会换，约束不会。先量，再改。',
    law: '允许有生产力的抽象',
  },
  {
    key: '择优',
    en: 'MERIT',
    icon: 'cog',
    line: '只在能被测量的地方做优化。',
    body: '我会为一个 3ms 的布局抖动重写整个组件，也会为一个没人用的开关删掉三百行。',
    law: '保留可回滚的删除',
  },
  {
    key: '理性',
    en: 'REASON',
    icon: 'eye',
    line: '复杂系统需要更少的抽象，而不是更多。',
    body: '深模块、窄接口、清晰的接缝——代码应当像能量塔一样，一眼看得懂热量从哪来、往哪去。',
    law: '拒绝无法解释的状态',
  },
] as const;

export const TRAITS = [
  { key: '与有荣焉', body: '十年 Web 前端，做过百万日活的可视化平台与中后台。' },
  { key: '一等市民', body: '专攻渲染管线、交互动效与设计系统，痴迷 60fps 的确定性。' },
  { key: '效忠派', body: '相信可维护性是一种道德，而不是一种取舍。' },
] as const;

export const SKILLS = [
  { name: 'TypeScript', value: 96, note: '类型即法律' },
  { name: 'CSS 架构', value: 94, note: '令牌 / 层叠 / 容器查询' },
  { name: 'Canvas / WebGL', value: 88, note: '粒子 / 噪声 / 着色器' },
  { name: 'Astro / Vite', value: 90, note: '静态优先，零 JS 基线' },
  { name: '性能预算', value: 92, note: 'LCP 1.2s 以内' },
  { name: 'Cloudflare', value: 82, note: 'Pages / Workers / 缓存' },
] as const;

export const PROJECTS = [
  {
    id: 'dispatch',
    name: '蒸汽调度台',
    en: 'GENERATOR DISPATCH',
    x: 52,
    y: 40,
    tier: 'core',
    year: '2025',
    stack: ['TypeScript', 'WebGL', 'D3'],
    desc: '实时调度可视化：把 20 万节点的城市供热网络压进一张 60fps 的画布。',
    metric: { label: '效率', value: '126%' },
    link: 'https://{{domain}}/foundry/dispatch',
    open: true,
  },
  {
    id: 'liquefier',
    name: '煤炭液化器',
    en: 'COAL LIQUEFIER',
    x: 74,
    y: 26,
    tier: 'branch',
    year: '2025',
    stack: ['Vite', 'esbuild', 'Rollup'],
    desc: '构建流水线：把冷启动从 42s 压到 6s，产物体积减半。',
    metric: { label: '效率', value: '143%' },
    link: 'https://{{domain}}/foundry/liquefier',
    open: true,
  },
  {
    id: 'heatgrid',
    name: '供暖网格',
    en: 'HEAT GRID',
    x: 30,
    y: 56,
    tier: 'branch',
    year: '2024',
    stack: ['CSS', 'Design Tokens', 'Astro'],
    desc: '一套令牌驱动的双纪元主题引擎，五个子域共用。',
    metric: { label: '效率', value: '118%' },
    link: 'https://{{domain}}/foundry/heatgrid',
    open: true,
  },
  {
    id: 'beacon',
    name: '破霜航标',
    en: 'FROSTBREAK BEACON',
    x: 22,
    y: 30,
    tier: 'leaf',
    year: '2024',
    stack: ['Workers', 'Cache API', 'DNS'],
    desc: '边缘路由与灰度：五个子域的静态产物走同一套缓存策略。',
    metric: { label: '效率', value: '132%' },
    link: 'https://{{domain}}/foundry/beacon',
    open: false,
  },
  {
    id: 'codex',
    name: '法典引擎',
    en: 'CODEX ENGINE',
    x: 78,
    y: 62,
    tier: 'leaf',
    year: '2023',
    stack: ['Astro', 'MDX', 'Shiki'],
    desc: '内容管线：Markdown 进，带 § 节号的档案页出，零运行时。',
    metric: { label: '效率', value: '109%' },
    link: 'https://{{domain}}/foundry/codex',
    open: true,
  },
  {
    id: 'deepwell',
    name: '深井探照灯',
    en: 'DEEPWELL SEARCH',
    x: 66,
    y: 78,
    tier: 'leaf',
    year: '2023',
    stack: ['WASM', 'Rust', 'IndexedDB'],
    desc: '站内检索：30KB 的 WASM 索引，离线可用，输入即结果。',
    metric: { label: '效率', value: '97%' },
    link: 'https://{{domain}}/foundry/deepwell',
    open: false,
  },
] as const;

export type BookStatus = '已读' | '在读' | '待读' | '搁置';

export const BOOKS = [
  {
    id: 'snow',
    title: '雪国',
    author: '川端康成',
    status: '已读' as BookStatus,
    rating: 5,
    notes: 12,
    year: '2024',
    quote: '穿过县界长长的隧道，便是雪国。',
    category: '文学',
  },
  {
    id: 'sapiens',
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    status: '已读' as BookStatus,
    rating: 4,
    notes: 9,
    year: '2023',
    quote: '我们相信共同的虚构故事，因此能大规模协作。',
    category: '历史',
  },
  {
    id: 'code-complete',
    title: '代码大全',
    author: 'Steve McConnell',
    status: '在读' as BookStatus,
    rating: 4,
    notes: 31,
    progress: 68,
    year: '2025',
    quote: '软件构建的本质是管理复杂度。',
    category: '工程',
  },
  {
    id: 'polar',
    title: '极地生存手册',
    author: 'Sir Ranulph Fiennes',
    status: '已读' as BookStatus,
    rating: 4,
    notes: 6,
    year: '2022',
    quote: '寒冷不是敌人，低估它才是。',
    category: '生存',
  },
  {
    id: 'darkness',
    title: '黑暗的左手',
    author: '厄休拉·勒古恩',
    status: '待读' as BookStatus,
    rating: 0,
    notes: 0,
    year: '—',
    quote: '唯一比寒冷更持久的东西，是习惯。',
    category: '小说',
  },
  {
    id: 'design-design',
    title: '设计中的设计',
    author: '原研哉',
    status: '在读' as BookStatus,
    rating: 5,
    notes: 14,
    progress: 42,
    year: '2025',
    quote: '设计不是创造新奇，而是重新发现日常。',
    category: '设计',
  },
  {
    id: 'artbook',
    title: 'Frostpunk 艺术设定集',
    author: '11 bit studios',
    status: '已读' as BookStatus,
    rating: 5,
    notes: 22,
    year: '2025',
    quote: '文明是一座由煤炭、信念与牺牲堆起来的塔。',
    category: '视觉',
  },
] as const;

export const PLAYLIST = [
  {
    id: 'dreadnought',
    name: '老无畏舰',
    en: 'OLD DREADNOUGHT',
    x: 30,
    y: 34,
    track: 'The City Must Survive',
    artist: 'Frostpunk OST · Piotr Musiał',
    src: '/audio/09-the-city-must-survive.mp3',
    len: '4:12',
    bpm: 62,
    mood: '风暴前的静默',
  },
  {
    id: 'newlondon',
    name: '新伦敦',
    en: 'NEW LONDON',
    x: 52,
    y: 22,
    track: 'The Last Autumn',
    artist: 'Frostpunk OST · Piotr Musiał',
    len: '3:48',
    bpm: 58,
    mood: '炉火与汽笛',
  },
  {
    id: 'winterhouse',
    name: '冬屋',
    en: 'WINTER HOUSE',
    x: 68,
    y: 46,
    track: 'Frostpunk Theme',
    artist: 'Frostpunk OST · Piotr Musiał',
    src: '/audio/01-frostpunk-theme.mp3',
    len: '3:19',
    bpm: 54,
    mood: '荒原上的低频',
  },
  {
    id: 'outpost',
    name: '冻原哨站',
    en: 'TUNDRA OUTPOST',
    x: 44,
    y: 62,
    track: 'He Was a Good Stalker',
    artist: 'S.T.A.L.K.E.R. OST',
    len: '5:06',
    bpm: 60,
    mood: '巡逻的脚步',
  },
  {
    id: 'furnace',
    name: '熔炉',
    en: 'THE FURNACE',
    x: 74,
    y: 70,
    track: 'S.T.A.Y.',
    artist: 'Interstellar · Hans Zimmer',
    len: '6:37',
    bpm: 48,
    mood: '过载前的暖流',
  },
  {
    id: 'abyss',
    name: '白色深渊',
    en: 'WHITE ABYSS',
    x: 26,
    y: 74,
    track: 'Into The Storm',
    artist: 'Frostpunk OST · Piotr Musiał',
    src: '/audio/08-into-the-storm.mp3',
    len: '4:47',
    bpm: 44,
    mood: '极夜里的呼吸',
  },
] as const;

export const DISTRIBUTION = [
  { key: 'heat', num: 4, label: '热能与燃料', en: 'COMMITS', metric: '提交' },
  { key: 'material', num: 5, label: '材料', en: 'WRITING', metric: '写作' },
  { key: 'food', num: 6, label: '食物', en: 'READING', metric: '阅读' },
  { key: 'labor', num: 7, label: '劳动力', en: 'MAINTAIN', metric: '维护' },
  { key: 'zone', num: 8, label: '区域效应', en: 'EXPERIMENTS', metric: '实验' },
  { key: 'build', num: 9, label: '建筑', en: 'SHIPPED', metric: '上线' },
] as const;

/** 确定性的伪随机，保证每次构建生成的“贡献热力”一致。 */
export function seeded(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export const CONTRIBUTIONS = (() => {
  const weeks = 53;
  const days = 7;
  const grid: number[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: number[] = [];
    for (let d = 0; d < days; d++) {
      const r = seeded(w * 7 + d + 3);
      // 越靠近当下越“热”，模拟持续供暖
      const recency = w / weeks;
      const v = r * (0.35 + recency * 1.15);
      col.push(v < 0.12 ? 0 : v < 0.34 ? 1 : v < 0.58 ? 2 : v < 0.82 ? 3 : 4);
    }
    grid.push(col);
  }
  return grid;
})();

export const STATS = {
  commits: 1763,
  streak: 41,
  repos: 27,
  efficiency: 126,
  weeks: 241,
  city: '新伦敦',
};

export const ARCHIVE_TABS = [
  { key: 'read', label: '已读', en: 'READ' },
  { key: 'reading', label: '在读', en: 'READING' },
  { key: 'stack', label: '待读', en: 'TO READ' },
  { key: 'all', label: '全部', en: 'ALL' },
] as const;

export const TIMELINE = [
  { year: '2018', text: '抵达新伦敦，接手第一座锅炉（jQuery 年代的中后台）。' },
  { year: '2020', text: '把设计系统从 0 推到 1，五条产品线共用一套令牌。' },
  { year: '2022', text: '第一次为 60fps 写下性能预算，并把它写进 CI。' },
  { year: '2024', text: '开始做“双纪元”主题引擎：暗黑与白霜共用一套语义变量。' },
  { year: '2026', text: '这座站点点火。五个子域，一台能量塔。' },
] as const;
