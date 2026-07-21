#!/usr/bin/env node
// Elite Tours - post-deploy live check
//
// Verifies the website and API are actually up and serving the right content.
// Exits 0 when everything passes, 1 otherwise — so CI can gate on it.
//
// Usage:
//   node tools/check-live.js                          # single pass against production
//   node tools/check-live.js --wait 10                # poll for up to 10 minutes
//   SITE_URL=http://localhost:8000 API_URL=http://localhost:5001 node tools/check-live.js
//
// Defaults: SITE_URL=https://elitetours.co.ke  API_URL=https://api.elitetours.co.ke

const SITE_URL = (process.env.SITE_URL || 'https://elitetours.co.ke').replace(/\/$/, '');
const API_URL = (process.env.API_URL || 'https://api.elitetours.co.ke').replace(/\/$/, '');

const waitArgIndex = process.argv.indexOf('--wait');
const WAIT_MINUTES = waitArgIndex > -1 ? parseFloat(process.argv[waitArgIndex + 1]) || 5 : 0;
const RETRY_INTERVAL_MS = 30 * 1000;

const PAGE_CHECKS = [
  { path: '/', mustContain: 'Elite Tours', name: 'Homepage' },
  { path: '/experiences.html', mustContain: 'Experiences', name: 'Experiences page' },
  { path: '/services.html', mustContain: 'Full-Package', name: 'Services page' },
  { path: '/login.html', mustContain: 'Log', name: 'Login page' },
  { path: '/signup.html', mustContain: 'Account', name: 'Signup page' },
  { path: '/sitemap.xml', mustContain: 'elitetours.co.ke', name: 'Sitemap' }
];

const API_CHECKS = [
  { path: '/health', name: 'API health', verify: (body) => body.includes('success') || body.includes('running') },
  {
    path: '/api/experiences?limit=1',
    name: 'API experiences endpoint',
    verify: (body) => {
      try {
        const json = JSON.parse(body);
        return json.success === true;
      } catch (e) {
        return false;
      }
    }
  }
];

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'EliteTours-LiveCheck/1.0' }
    });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body };
  } finally {
    clearTimeout(timer);
  }
}

async function runCheck(base, check) {
  const url = `${base}${check.path}`;
  try {
    const { ok, status, body } = await fetchText(url);
    if (!ok) return { ...check, url, pass: false, reason: `HTTP ${status}` };

    if (check.mustContain && !body.includes(check.mustContain)) {
      return { ...check, url, pass: false, reason: `response missing "${check.mustContain}"` };
    }
    if (check.verify && !check.verify(body)) {
      return { ...check, url, pass: false, reason: 'unexpected response body' };
    }
    return { ...check, url, pass: true };
  } catch (error) {
    const reason = error.name === 'AbortError' ? 'timed out (15s)'
      : error.cause?.code || error.message;
    return { ...check, url, pass: false, reason };
  }
}

// SKIP_API=true checks the static site only — for while the backend
// isn't hosted yet. Flip it off once api.elitetours.co.ke is deployed.
const SKIP_API = process.env.SKIP_API === 'true';

async function runAllChecks() {
  const results = [];
  for (const check of PAGE_CHECKS) results.push(await runCheck(SITE_URL, check));
  if (!SKIP_API) {
    for (const check of API_CHECKS) results.push(await runCheck(API_URL, check));
  }
  return results;
}

function printResults(results) {
  console.log('');
  for (const r of results) {
    const icon = r.pass ? '✅' : '❌';
    console.log(`  ${icon} ${r.name.padEnd(26)} ${r.url}${r.pass ? '' : `  -> ${r.reason}`}`);
  }
  console.log('');
}

async function main() {
  console.log('Elite Tours live check');
  console.log(`  Site: ${SITE_URL}`);
  console.log(SKIP_API ? '  API:  (skipped - SKIP_API=true)' : `  API:  ${API_URL}`);
  if (WAIT_MINUTES) console.log(`  Polling for up to ${WAIT_MINUTES} minute(s)...`);

  const deadline = Date.now() + WAIT_MINUTES * 60 * 1000;
  let attempt = 0;

  for (;;) {
    attempt += 1;
    const results = await runAllChecks();
    const failed = results.filter((r) => !r.pass);

    if (!failed.length) {
      printResults(results);
      console.log(`✅ All ${results.length} checks passed - elitetours.co.ke is LIVE.`);
      process.exit(0);
    }

    if (Date.now() >= deadline) {
      printResults(results);
      console.log(`❌ ${failed.length}/${results.length} checks failing after ${attempt} attempt(s).`);
      if (failed.every((f) => /ENOTFOUND|EAI_AGAIN/.test(f.reason || ''))) {
        console.log('   DNS is not resolving yet - check that the domain\'s A/CNAME records point at your host.');
      }
      process.exit(1);
    }

    console.log(`  attempt ${attempt}: ${failed.length}/${results.length} failing (${failed[0].name}: ${failed[0].reason}) - retrying in 30s`);
    await new Promise((r) => setTimeout(r, RETRY_INTERVAL_MS));
  }
}

main().catch((error) => {
  console.error('Live check crashed:', error);
  process.exit(1);
});
