// tools/probe.mjs — 快速求值探针：node tools/probe.mjs --url ... --expr "JS"
import { spawn } from 'node:child_process';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
    return acc;
  }, []),
);
const PORT = 9334;
const CH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const chrome = spawn(CH, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--window-size=${Number(args.w ?? 1440)},${Number(args.h ?? 900)}`, `--remote-debugging-port=${PORT}`, '--user-data-dir=' + process.env.TEMP + '/dsh-chrome-probe', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
for (let i = 0; i < 60 && !ws; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    const page = list.find((t) => t.type === 'page');
    if (page) ws = new WebSocket(page.webSocketDebuggerUrl);
  } catch {}
  if (!ws) await sleep(150);
}
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
  }
});
const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const id = ++seq;
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });
await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url: args.url });
await sleep(5000);
const r = await send('Runtime.evaluate', { expression: args.expr, returnByValue: true, awaitPromise: true });
console.log(JSON.stringify(r.result.value, null, 2), r.exceptionDetails ? '\nEXC: ' + JSON.stringify(r.exceptionDetails) : '');
ws.close();
chrome.kill();
process.exit(0);
