// tools/capture.mjs — 用 CDP 驱动无头 Chrome：整页截图 / 滚动到某处 / 点击 / 收集控制台错误
// 用法：
//   node tools/capture.mjs --url http://127.0.0.1:4399/ --out shots/x.png [--w 1440] [--h 900]
//        [--full] [--scroll 1200] [--click "selector"] [--wait 800] [--era 1920]
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
    return acc;
  }, []),
);

const CH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const W = Number(args.w ?? 1440);
const H = Number(args.h ?? 900);
const PORT = 9333;

const chrome = spawn(CH, [
  '--headless=new',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  '--disable-lcd-text',
  `--window-size=${W},${H}`,
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=' + process.env.TEMP + '/dsh-chrome-shot',
  'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await r.json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(150);
  }
  throw new Error('no devtools target');
}

const wsUrl = await target();
const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => {
  ws.addEventListener('open', res, { once: true });
  ws.addEventListener('error', rej, { once: true });
});

let seq = 0;
const pending = new Map();
const errors = [];
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { res, rej } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
  }
  if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description ?? ''));
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error')
    errors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
});

const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const id = ++seq;
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });

const url = new URL(args.url);
if (args.era) url.searchParams.set('era', args.era);
await send('Page.navigate', { url: url.toString() });
await sleep(Number(args.wait ?? 2600));

if (args.click) {
  const r = await send('Runtime.evaluate', { expression: `(()=>{const el=document.querySelector(${JSON.stringify(args.click)}); if(!el) return 'missing'; el.click(); return 'ok';})()`, returnByValue: true });
  if (r.result.value !== 'ok') errors.push('click target missing: ' + args.click);
  await sleep(900);
}

if (args.scroll) {
  await send('Runtime.evaluate', { expression: `window.scrollTo({top:${Number(args.scroll)},behavior:'instant'}); window.scrollY`, returnByValue: true });
  await sleep(500);
}

if (args.anchor) {
  await send('Runtime.evaluate', { expression: `document.querySelector(${JSON.stringify(args.anchor)})?.scrollIntoView({block:'start'}); window.scrollY`, returnByValue: true });
  await sleep(700);
}

let clip;
if (args.full) {
  // 先滚动一遍，触发 IntersectionObserver 的 reveal，否则整页截图下半部分是空的
  await send('Runtime.evaluate', {
    expression: `(async()=>{const H=${H};const max=document.body.scrollHeight;for(let y=0;y<max;y+=H*0.6){window.scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,90));}window.scrollTo({top:0,behavior:'instant'});return max})()`,
    awaitPromise: true,
    returnByValue: true,
  });
  await sleep(900);
  const m = await send('Page.getLayoutMetrics');
  const size = m.cssContentSize ?? m.contentSize;
  clip = { x: 0, y: 0, width: W, height: Math.ceil(size.height), scale: 1 };
}

const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !!clip, ...(clip ? { clip } : {}) });
mkdirSync(dirname(args.out), { recursive: true });
const { writeFileSync } = await import('node:fs');
writeFileSync(args.out, Buffer.from(shot.data, 'base64'));
console.log('saved', args.out, clip ? `full ${clip.height}px` : `${W}x${H}`, errors.length ? `\nJS errors: ${errors.slice(0, 5).join(' | ')}` : '\nno JS errors');

ws.close();
chrome.kill();
process.exit(0);
