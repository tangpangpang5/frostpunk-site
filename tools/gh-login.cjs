// 一次性 GitHub 设备码登录：打印 user_code，轮询拿 token 存到 .gh-token（不进仓库）
const CLIENT = 'Iv1.b507a08c87ecfe98';
const fs = require('node:fs');

async function post(url, body) {
  const form = new URLSearchParams(body).toString();
  const res = await fetch(url, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  return res.json();
}

(async () => {
  const start = await post('https://github.com/login/device/code', {
    client_id: CLIENT,
    scope: 'repo workflow',
  });
  if (!start.user_code) {
    console.log('START_FAILED', JSON.stringify(start));
    process.exit(1);
  }
  console.log('CODE=' + start.user_code);
  console.log('SCOPE=' + (start.scope || '(none)'));
  console.log('URL=' + start.verification_uri);
  const deadline = Date.now() + (start.expires_in ?? 900) * 1000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, (start.interval ?? 5) * 1000));
    const tok = await post('https://github.com/login/oauth/access_token', {
      client_id: CLIENT,
      device_code: start.device_code,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    });
    if (tok.access_token) {
      fs.writeFileSync('.gh-token', tok.access_token, { mode: 0o600 });
      console.log('OK token saved');
      process.exit(0);
    }
    if (tok.error === 'authorization_pending') continue;
    if (tok.error === 'slow_down') continue;
    console.log('AUTH_FAILED', JSON.stringify(tok));
    process.exit(1);
  }
  console.log('EXPIRED');
  process.exit(1);
})();
