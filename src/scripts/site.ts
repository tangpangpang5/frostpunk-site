/**
 * 全局行为：纪元闸门 / 时钟 / 环境音 / 揭示 / Tabs / 抽屉 / 导航闸门。
 * 无框架依赖；所有效果在 prefers-reduced-motion 下退化为瞬时状态。
 */

const reduced = () =>
  document.documentElement.dataset.motion === 'reduced' ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string) => Array.from(document.querySelectorAll<T>(sel));

/* ------------------------------------------------------------------ 纪元 */
const gate = $('#gate');
const eraBtn = $('#era-switch');
const eraLabel = $('#era-label');

function applyEra(era: '1886' | '1920', persist = true) {
  document.documentElement.dataset.era = era;
  if (eraLabel) eraLabel.textContent = era;
  eraBtn?.setAttribute('aria-pressed', String(era === '1920'));
  eraBtn?.setAttribute('aria-label', era === '1886' ? '切换到 1920 白霜纪元' : '切换到 1886 煤炭纪元');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', era === '1886' ? '#0b0e11' : '#e9edee');
  if (persist) {
    try {
      localStorage.setItem('nl-era', era);
    } catch {
      /* 忽略 */
    }
  }
  document.dispatchEvent(new CustomEvent('era:change', { detail: era }));
}

eraBtn?.addEventListener('click', () => {
  const next = document.documentElement.dataset.era === '1920' ? '1886' : '1920';
  if (!gate) {
    applyEra(next);
    return;
  }
  if (gate.classList.contains('is-open')) return;

  const rect = eraBtn.getBoundingClientRect();
  gate.style.setProperty('--gx', `${((rect.left + rect.width / 2) / window.innerWidth) * 100}%`);
  gate.style.setProperty('--gy', `${((rect.top + rect.height / 2) / window.innerHeight) * 100}%`);

  if (reduced()) {
    applyEra(next);
    return;
  }

  gate.classList.add('is-open');
  window.setTimeout(() => applyEra(next), 150);
  window.setTimeout(() => gate.classList.remove('is-open'), 420);
});

applyEra(document.documentElement.dataset.era === '1920' ? '1920' : '1886', false);

/* ------------------------------------------------------------------ 时钟 */
const clocks = Array.from(document.querySelectorAll<HTMLElement>('#hud-clock, [data-clock]'));
const temp = $('#hud-temp');

function tickClock() {
  if (!clocks.length) return;
  const now = new Date();
  const text = now.toLocaleTimeString('zh-CN', { hour12: false });
  for (const c of clocks) c.textContent = text;
}
tickClock();
window.setInterval(tickClock, 1000);

if (temp) {
  window.setInterval(
    () => {
      const base = -30 + Math.round((Math.random() - 0.5) * 2);
      temp.innerHTML = `${base}<i>°C</i>`;
    },
    9000,
  );
}

/* ---------------------------------------------------------------- 环境音 */
type AudioRig = { ctx: AudioContext; master: GainNode };
let rig: AudioRig | null = null;

function buildAudio(): AudioRig {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // 低频发电机基音
  const hum = ctx.createOscillator();
  hum.type = 'sine';
  hum.frequency.value = 55;
  const humGain = ctx.createGain();
  humGain.gain.value = 0.045;
  hum.connect(humGain).connect(master);
  hum.start();

  const hum2 = ctx.createOscillator();
  hum2.type = 'triangle';
  hum2.frequency.value = 82.4;
  const hum2Gain = ctx.createGain();
  hum2Gain.gain.value = 0.012;
  hum2.connect(hum2Gain).connect(master);
  hum2.start();

  // 布朗噪声：风与蒸汽
  const len = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.2;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 420;
  lp.Q.value = 0.6;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.5;
  noise.connect(lp).connect(noiseGain).connect(master);
  noise.start();

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 160;
  lfo.connect(lfoGain).connect(lp.frequency);
  lfo.start();

  return { ctx, master };
}

const soundBtn = $('#sound-toggle');
soundBtn?.addEventListener('click', async () => {
  if (!rig) rig = buildAudio();
  const on = soundBtn.getAttribute('aria-pressed') !== 'true';
  soundBtn.setAttribute('aria-pressed', String(on));
  await rig.ctx.resume();
  rig.master.gain.cancelScheduledValues(rig.ctx.currentTime);
  rig.master.gain.linearRampToValueAtTime(on ? 0.5 : 0, rig.ctx.currentTime + (on ? 1.4 : 0.6));
});

/* ------------------------------------------------------------ 滚动揭示 */
const revealEls = $$('.reveal');
// 站内跳转时整页重载，再播一遍入场淡入会让"加载"显得很长；只在本会话第一次进入时播
let firstEntry = true;
try {
  firstEntry = sessionStorage.getItem('nl-visited') !== '1';
  sessionStorage.setItem('nl-visited', '1');
} catch {
  /* 隐私模式：每次都当作首次 */
}

if (firstEntry && 'IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
  );
  revealEls.forEach((el) => io.observe(el));

  // 深链/锚点跳转时 IO 可能错过首帧，补一次可见性扫描
  const sweep = () => {
    for (const el of revealEls) {
      if (el.classList.contains('is-in')) continue;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in');
    }
  };
  window.addEventListener('load', () => window.setTimeout(sweep, 400));
  window.addEventListener('hashchange', () => window.setTimeout(sweep, 120));
} else {
  revealEls.forEach((el) => el.classList.add('is-in'));
}

/* ------------------------------------------------------------- HUD 吸顶 */
const hud = $('#hud');
if (hud) {
  const onScroll = () => hud.classList.toggle('is-stuck', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* -------------------------------------------------------------- 移动菜单 */
const menu = $('#mobile-menu');
const menuBtn = $('#menu-toggle');
const menuClose = $('#menu-close');

function setMenu(open: boolean) {
  if (!menu || !menuBtn) return;
  menu.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
}

menuBtn?.addEventListener('click', () => setMenu(menu?.hidden ?? true));
menuClose?.addEventListener('click', () => setMenu(false));

/* ----------------------------------------------------------------- Tabs */
$$<HTMLElement>('[data-tabs]').forEach((group) => {
  const tabs = Array.from(group.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panelRoot = document.getElementById(group.dataset.tabs ?? '');
  const panels = panelRoot ? Array.from(panelRoot.querySelectorAll<HTMLElement>('[data-panel]')) : [];

  const select = (key: string) => {
    tabs.forEach((t) => {
      const on = t.dataset.tab === key;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => {
      p.hidden = p.dataset.panel !== key;
    });
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab.dataset.tab ?? ''));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      next.focus();
      select(next.dataset.tab ?? '');
    });
  });

  const first = tabs.find((t) => t.getAttribute('aria-selected') === 'true') ?? tabs[0];
  if (first) select(first.dataset.tab ?? '');
});

/* --------------------------------------------------------------- 抽屉层 */
function openSheet(id: string) {
  const dlg = document.getElementById(id) as HTMLDialogElement | null;
  if (dlg && !dlg.open) dlg.showModal();
}
function closeSheet(dlg: HTMLDialogElement | null) {
  dlg?.close();
}

$$<HTMLDialogElement>('dialog.sheet').forEach((dlg) => {
  dlg.addEventListener('click', (e) => {
    const r = dlg.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) dlg.close();
  });
  dlg.querySelectorAll<HTMLElement>('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => dlg.close());
  });
});

/* ------------------------------------------------------------ 研究树节点 */
$$<HTMLElement>('[data-project]').forEach((node) => {
  const open = () => {
    const dlg = document.getElementById('project-sheet') as HTMLDialogElement | null;
    if (!dlg) return;
    const d = node.dataset;
    const set = (sel: string, value: string) => {
      const el = dlg.querySelector<HTMLElement>(sel);
      if (el) el.textContent = value;
    };
    set('[data-f="name"]', d.name ?? '');
    set('[data-f="en"]', d.en ?? '');
    set('[data-f="year"]', d.year ?? '');
    set('[data-f="desc"]', d.desc ?? '');
    set('[data-f="metric"]', d.metric ?? '');
    set('[data-f="stack"]', d.stack ?? '');
    set('[data-f="link"]', d.link ?? '');
    const link = dlg.querySelector<HTMLAnchorElement>('[data-f="href"]');
    if (link && d.link) link.href = d.link;
    const badge = dlg.querySelector<HTMLElement>('[data-f="state"]');
    if (badge) {
      badge.textContent = d.open === 'true' ? '已上线 · DEPLOYED' : '研究中 · IN RESEARCH';
      badge.classList.toggle('chip--live', d.open === 'true');
    }
    openSheet('project-sheet');
  };

  node.addEventListener('click', open);
  node.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });
});

/* ---------------------------------------------------------------- 书脊 */
$$<HTMLElement>('[data-book]').forEach((spine) => {
  const open = () => {
    const dlg = document.getElementById('book-sheet') as HTMLDialogElement | null;
    if (!dlg) return;
    const d = spine.dataset;
    const set = (sel: string, value: string) => {
      const el = dlg.querySelector<HTMLElement>(sel);
      if (el) el.textContent = value;
    };
    set('[data-f="title"]', d.title ?? '');
    set('[data-f="author"]', d.author ?? '');
    set('[data-f="status"]', d.status ?? '');
    set('[data-f="quote"]', d.quote ?? '');
    set('[data-f="notes"]', d.notes ?? '0');
    set('[data-f="category"]', d.category ?? '');
    set('[data-f="rating"]', '★'.repeat(Number(d.rating ?? 0)) + '☆'.repeat(Math.max(0, 5 - Number(d.rating ?? 0))));
    const meter = dlg.querySelector<HTMLElement>('[data-f="progress"]');
    if (meter) meter.style.width = `${d.progress ?? (d.status === '已读' ? 100 : 0)}%`;
    openSheet('book-sheet');
  };
  spine.addEventListener('click', open);
  spine.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });
});

/* -------------------------------------------------------------- 播放列表 */
const player = $('#player');
const ost = document.getElementById('ost') as HTMLAudioElement | null;
$$<HTMLElement>('[data-track]').forEach((row) => {
  row.addEventListener('click', () => {
    $$('[data-track]').forEach((r) => r.classList.toggle('is-active', r === row));
    const d = row.dataset;
    const set = (sel: string, value: string) => {
      const el = player?.querySelector<HTMLElement>(sel);
      if (el) el.textContent = value;
    };
    set('[data-f="title"]', d.title ?? '');
    set('[data-f="artist"]', d.artist ?? '');
    set('[data-f="mood"]', d.mood ?? '');
    set('[data-f="len"]', d.len ?? '0:00');
    const src = d.src ?? '';
    if (ost && src) {
      if (ost.getAttribute('src') !== src) ost.setAttribute('src', src);
      ost
        .play()
        .then(() => player?.classList.add('is-playing'))
        .catch(() => {
          /* 自动播放被拦截时保持静默，等用户点播放键 */
        });
    } else {
      player?.classList.add('is-playing');
    }
    document.querySelector('.disc')?.classList.add('is-playing');
    player?.querySelector('[data-play]')?.setAttribute('aria-pressed', 'true');
  });
});

$('#player [data-play]')?.addEventListener('click', (e) => {
  const btn = e.currentTarget as HTMLElement;
  const on = btn.getAttribute('aria-pressed') !== 'true';
  btn.setAttribute('aria-pressed', String(on));
  if (ost) {
    if (on) ost.play().catch(() => btn.setAttribute('aria-pressed', 'false'));
    else ost.pause();
  }
  document.querySelector('.disc')?.classList.toggle('is-playing', on);
  player?.classList.toggle('is-playing', on);
});

/* ------------------------------------------------------------ 页面闸门 */
if (!reduced()) {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    const link = target?.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('/') || href.startsWith('//')) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target === '_blank') return;
    if (href.startsWith('/#') || href.includes('#')) return;
    if (!gate) return;
    e.preventDefault();
    gate.style.setProperty('--gx', `${(e.clientX / window.innerWidth) * 100}%`);
    gate.style.setProperty('--gy', `${(e.clientY / window.innerHeight) * 100}%`);
    gate.classList.add('is-open');
    window.setTimeout(() => {
      window.location.href = href;
    }, 180);
  });
}

/* -------------------------------------------------------------- 平滑滚动 */
(async () => {
  if (reduced()) return;
  try {
    const { default: Lenis } = await import('lenis');
    const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 1, smoothWheel: true });
    const raf = (time: number) => {
      lenis.raf(time);
      window.requestAnimationFrame(raf);
    };
    window.requestAnimationFrame(raf);
    lenis.on('scroll', () => hud?.classList.toggle('is-stuck', window.scrollY > 24));
  } catch {
    /* 依赖未安装时退回原生滚动 */
  }
})();

/* ------------------------------------------------------------ 工坊控制 */
const workshop = $('[data-overdrive]');
const setOverdrive = (on: boolean) => {
  if (!workshop) return;
  workshop.dataset.overdrive = on ? 'on' : 'off';
  const eff = workshop.querySelector<HTMLElement>('[data-eff]');
  if (eff) eff.textContent = on ? '158%' : '126%';
  const status = workshop.querySelector<HTMLElement>('[data-wstatus]');
  if (status) status.textContent = on ? '状态：过载 / 温度超限' : '状态：稳态运行';
  const box = workshop.querySelector<HTMLInputElement>('[data-capsule="overload"]');
  if (box) box.checked = on;
  workshop.querySelector('[data-wbtn="boost"]')?.classList.toggle('is-active', on);
};

$$<HTMLInputElement>('[data-capsule]').forEach((box) => {
  box.addEventListener('change', () => {
    if (box.dataset.capsule === 'overload') setOverdrive(box.checked);
    if (box.dataset.capsule === 'line') {
      const status = workshop?.querySelector<HTMLElement>('[data-wstatus]');
      if (status) status.textContent = box.checked ? '状态：产线已接合' : '状态：产线断开';
    }
  });
});

$$<HTMLElement>('[data-wbtn]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const kind = btn.dataset.wbtn;
    const status = workshop?.querySelector<HTMLElement>('[data-wstatus]');
    if (kind === 'boost') setOverdrive(workshop?.dataset.overdrive !== 'on');
    if (kind === 'cycle' && status) status.textContent = '状态：正在重启产线…';
    if (kind === 'halt' && status) {
      status.textContent = '状态：已停机，等待点火';
      setOverdrive(false);
    }
  });
});

/* -------------------------------------------------------------- 声部混音 */
$$<HTMLInputElement>('[data-mix]').forEach((box) => {
  box.addEventListener('change', () => {
    document.body.classList.toggle(`mix-${box.dataset.mix}`, box.checked);
    const count = document.querySelectorAll('[data-mix]:checked').length;
    const out = $('[data-mix-count]');
    if (out) out.textContent = String(count);
  });
});

/* ------------------------------------------------------------ 时代联动 */
document.addEventListener('era:change', () => {
  // 纪元切换时，热力格、书脊等纯装饰元素的过渡由 CSS 变量接管；
  // 这里只同步 meta 与 os 主题。
  document.documentElement.classList.toggle('era-1920', document.documentElement.dataset.era === '1920');
});
