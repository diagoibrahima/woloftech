// Lancer avec : node --test backend/test/
'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');

const ROOT = path.resolve(__dirname, '..', '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wt-test-'));
const PORT = 18090;
const BASE = 'http://127.0.0.1:' + PORT;
const PASSWORD = 'mot-de-passe-de-test';
const ITEM = `<item><title><![CDATA[S16E1 - Episode de test sur les drones agricoles]]></title><description><![CDATA[<p>Sujet du jour, contact 77 123 45 67 et test@example.com</p>]]></description>
<link>https://podcasters.spotify.com/pod/show/woloftech/episodes/test</link><pubDate>Sun, 01 Nov 2026 10:00:00 GMT</pubDate>
<enclosure url="https://example.com/test.mp3" type="audio/mpeg"/><itunes:duration>01:02:03</itunes:duration><itunes:image href="https://example.com/test.jpg"/></item>`;
let child, feed, cookie = '', csrf = '';

function api(method, url, body, headers) {
  const opts = { method, headers: { Cookie: cookie, 'X-CSRF-Token': csrf, ...headers } };
  if (Buffer.isBuffer(body)) opts.body = body;
  else if (body !== undefined) { opts.body = JSON.stringify(body); opts.headers['Content-Type'] = 'application/json'; }
  return fetch(BASE + url, opts);
}

before(async () => {
  feed = http.createServer((req, res) => res.end('<rss><channel>' + ITEM + '</channel></rss>'));
  await new Promise((ok) => feed.listen(18091, '127.0.0.1', ok));
  child = spawn(process.execPath, [path.join(ROOT, 'backend', 'server.js')], {
    env: { ...process.env, PORT, WT_DB: path.join(tmp, 't.db'), WT_ADMIN_PASSWORD: PASSWORD, WT_NO_EXPORT: '1', WT_NO_RSS_TIMER: '1', WT_MIN_FORM_MS: '50', WT_RSS_URL: 'http://127.0.0.1:18091/', WT_YT_FEED: '' },
    stdio: 'ignore'
  });
  for (let i = 0; i < 50; i++) {
    try { await fetch(BASE + '/index.html'); return; } catch { await new Promise((ok) => setTimeout(ok, 100)); }
  }
  throw new Error('serveur non démarré');
});
after(async () => {
  child.kill();
  feed.close();
  await new Promise((ok) => setTimeout(ok, 300));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* fichier encore ouvert sous Windows */ }
});

test("les fichiers privés ne sont pas servis", async () => {
  for (const p of ['/backend/server.js', '/backend/data/t.db', '/.git/config', '/tools/serve.ps1', '/README.md', '/assets/..%2f..%2fbackend/server.js', '/%2e%2e/%2e%2e/secret']) {
    assert.strictEqual((await fetch(BASE + p)).status, 404, p);
  }
});
test("les en-têtes de sécurité sont présents", async () => {
  const csp = (await fetch(BASE + '/index.html')).headers.get('content-security-policy');
  assert.match(csp, /script-src 'self';/);
  assert.match((await fetch(BASE + '/index.html')).headers.get('permissions-policy'), /microphone=\(self\)/);
});
test("l'administration exige une connexion", async () => {
  assert.strictEqual((await api('GET', '/api/admin/guests')).status, 401);
  assert.strictEqual((await api('PUT', '/api/admin/settings', {})).status, 401);
});
test("un mauvais mot de passe est refusé", async () => {
  const r = await api('POST', '/api/admin/login', { username: 'admin', password: 'faux' });
  assert.strictEqual(r.status, 401);
});
test("la connexion donne un cookie protégé", async () => {
  const r = await api('POST', '/api/admin/login', { username: 'admin', password: PASSWORD });
  assert.strictEqual(r.status, 200);
  const set = r.headers.get('set-cookie');
  assert.match(set, /HttpOnly/);
  assert.match(set, /SameSite=Strict/);
  cookie = set.split(';')[0];
  csrf = (await r.json()).csrf;
});
test("sans jeton CSRF ou depuis une autre origine, l'écriture est refusée", async () => {
  const saved = csrf;
  csrf = '';
  assert.strictEqual((await api('POST', '/api/admin/shorts', { url: 'dQw4w9WgXcQ' })).status, 403);
  csrf = saved;
  assert.strictEqual((await api('POST', '/api/admin/shorts', { url: 'dQw4w9WgXcQ' }, { Origin: 'https://attaquant.example' })).status, 403);
});
test("un nouvel épisode du flux devient à compléter, sans coordonnées personnelles", async () => {
  const r = await (await api('POST', '/api/admin/rss/check')).json();
  assert.deepStrictEqual(r.nouveaux.map((e) => e.id), ['S16E1']);
  const { episodes } = await (await api('GET', '/api/admin/episodes')).json();
  assert.strictEqual(episodes.find((e) => e.id === 'S16E1').pending, true);
  const js = await (await fetch(BASE + '/data/contenu.js')).text();
  assert.match(js, /drones agricoles/);
  assert.ok(!js.includes('77 123 45 67'));
  assert.ok(!js.includes('test@example.com'));
  assert.deepStrictEqual((await (await api('POST', '/api/admin/rss/check')).json()).nouveaux, []);
});
test("invités et sponsors se rattachent à l'épisode détecté", async () => {
  const guest = await (await api('POST', '/api/admin/guests', { nom: 'Invité Test', secteur: 'ia', linkedin: 'https://linkedin.com/in/test' })).json();
  const r = await api('PUT', '/api/admin/episodes/S16E1', { guests: [guest.id], sponsors: [{ nom: 'Sponsor Test', url: 'https://example.com' }], video: 'https://youtu.be/dQw4w9WgXcQ', complete: true });
  assert.strictEqual(r.status, 200);
  const js = await (await fetch(BASE + '/data/contenu.js')).text();
  assert.match(js, /Sponsor Test/);
  assert.match(js, /dQw4w9WgXcQ/);
  const { guests } = await (await api('GET', '/api/admin/guests')).json();
  assert.deepStrictEqual(guests.find((g) => g.id === guest.id).episodes, ['S16E1']);
});
test("un lien dangereux est refusé", async () => {
  const r = await api('POST', '/api/admin/guests', { nom: 'X', secteur: 'ia', linkedin: 'javascript:alert(1)' });
  assert.strictEqual(r.status, 400);
  const s = await api('PUT', '/api/admin/episodes/S16E1', { sponsors: [{ nom: 'X', url: 'javascript:alert(1)' }] });
  assert.strictEqual(s.status, 400);
});
test("un short s'ajoute par lien, un autre lien est refusé", async () => {
  assert.strictEqual((await api('POST', '/api/admin/shorts', { url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ?feature=share', titre: 'Essai' })).status, 200);
  assert.strictEqual((await api('POST', '/api/admin/shorts', { url: 'https://exemple.com/video' })).status, 400);
  const { shorts } = await (await api('GET', '/api/admin/shorts')).json();
  assert.ok(shorts.some((s) => s.video === 'dQw4w9WgXcQ'));
});
test("un épisode peut recevoir plusieurs shorts, chacun lié à un seul épisode", async () => {
  for (const id of ['aaaaaaaaaaa', 'bbbbbbbbbbb', 'ccccccccccc']) {
    assert.strictEqual((await api('POST', '/api/admin/shorts', { url: 'https://youtube.com/shorts/' + id, episode: 'S15E5' })).status, 200);
  }
  const again = await api('POST', '/api/admin/shorts', { url: 'aaaaaaaaaaa', episode: 'S15E4' });
  assert.strictEqual(again.status, 400);
  assert.match((await again.json()).error, /S15E5/);
  assert.strictEqual((await api('POST', '/api/admin/shorts', { url: 'ddddddddddd', episode: 'S99E9' })).status, 400);
  const { shorts } = await (await api('GET', '/api/admin/shorts')).json();
  const mine = shorts.filter((s) => s.video.length === 11 && s.episode === 'S15E5' && /^(a|b|c)\1+$/.test(s.video));
  assert.deepStrictEqual(mine.map((s) => s.video), ['aaaaaaaaaaa', 'bbbbbbbbbbb', 'ccccccccccc']);
  const { episodes } = await (await api('GET', '/api/admin/episodes')).json();
  assert.ok(episodes.find((e) => e.id === 'S15E5').shorts >= 3);
  assert.match(await (await fetch(BASE + '/data/contenu.js')).text(), /"episode": "S15E5"/);
});
test("seule une vraie image est acceptée à l'envoi", async () => {
  assert.strictEqual((await api('POST', '/api/admin/upload', Buffer.from('<svg onload="alert(1)"/>'))).status, 400);
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const r = await (await api('POST', '/api/admin/upload', png)).json();
  assert.match(r.path, /^assets\/uploads\/[a-f0-9]+\.png$/);
  fs.rmSync(path.join(ROOT, r.path));
});
test("les photos du studio s'ajoutent, s'ordonnent et se retirent", async () => {
  const before = (await (await api('GET', '/api/admin/gallery')).json()).photos;
  assert.strictEqual(before.length, 16);
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const { path: image } = await (await api('POST', '/api/admin/upload', png)).json();
  assert.strictEqual((await api('POST', '/api/admin/gallery', { image: '../secret.png' })).status, 400);
  assert.strictEqual((await api('POST', '/api/admin/gallery', { image, alt: 'Nouvelle', largeur: 800, hauteur: 600 })).status, 200);
  const { photos } = await (await api('GET', '/api/admin/gallery')).json();
  assert.strictEqual(photos[0].image, image);
  assert.match(await (await fetch(BASE + '/data/contenu.js')).text(), /Nouvelle/);
  assert.strictEqual((await api('DELETE', '/api/admin/gallery/' + photos[0].id)).status, 200);
  assert.ok(!fs.existsSync(path.join(ROOT, image)));
  // Une photo d'origine quitte le diaporama, mais son fichier reste sur le disque.
  assert.strictEqual((await api('DELETE', '/api/admin/gallery/' + photos[1].id)).status, 200);
  assert.ok(fs.existsSync(path.join(ROOT, photos[1].image)));
});
test("les services et les réseaux se modifient, un lien dangereux est refusé", async () => {
  const { contact, services, reseaux } = await (await api('GET', '/api/admin/settings')).json();
  assert.deepStrictEqual(services.map((s) => s.id), ['conseil', 'panel', 'podcast']);
  const next = services.map((s) => ({ ...s, titre: s.titre + ' modifié' }));
  const bad = await api('PUT', '/api/admin/settings', { contact, services: next, reseaux: { podcast: { tiktok: 'javascript:alert(1)' }, auteur: reseaux.auteur } });
  assert.strictEqual(bad.status, 400);
  const ok = await api('PUT', '/api/admin/settings', { contact, services: next, reseaux: { podcast: { linkedin: '', tiktok: 'https://www.tiktok.com/@essai' }, auteur: reseaux.auteur } });
  assert.strictEqual(ok.status, 200);
  const js = await (await fetch(BASE + '/data/contenu.js')).text();
  assert.match(js, /modifié/);
  assert.match(js, /tiktok\.com\/@essai/);
});
test("un commentaire attend la modération et reste du texte", async () => {
  const { token } = await (await fetch(BASE + '/api/comments?episode=S15E5')).json();
  await new Promise((ok) => setTimeout(ok, 80));
  const texte = '<script>alert(1)</script> bon épisode';
  assert.strictEqual((await api('POST', '/api/comments', { episode: 'S15E5', nom: 'Awa', texte, token })).status, 200);
  assert.strictEqual((await (await fetch(BASE + '/api/comments?episode=S15E5')).json()).comments.length, 0);
  const { comments } = await (await api('GET', '/api/admin/comments?status=pending')).json();
  assert.strictEqual((await api('PUT', '/api/admin/comments/' + comments[0].id, { status: 'approved' })).status, 200);
  const pub = (await (await fetch(BASE + '/api/comments?episode=S15E5')).json()).comments;
  assert.strictEqual(pub[0].texte, texte);
  assert.ok(!('ip_hash' in pub[0]));
});
test("les robots et les envois trop rapides sont écartés", async () => {
  const { token } = await (await fetch(BASE + '/api/comments?episode=S15E5')).json();
  assert.strictEqual((await api('POST', '/api/comments', { episode: 'S15E5', nom: 'Bot', texte: 'trop vite', token })).status, 429);
  assert.strictEqual((await api('POST', '/api/comments', { episode: 'S15E5', nom: 'Bot', texte: 'faux jeton', token: '1.abc' })).status, 400);
  await api('POST', '/api/comments', { episode: 'S15E5', nom: 'Bot', texte: 'piege', website: 'http://spam', token });
  const { comments } = await (await api('GET', '/api/admin/comments?status=pending')).json();
  assert.ok(!comments.some((c) => c.nom === 'Bot'));
});
test("les envois répétés sont limités", async () => {
  let last = 0;
  for (let i = 0; i < 6; i++) {
    const { token } = await (await fetch(BASE + '/api/comments?episode=S15E5')).json();
    await new Promise((ok) => setTimeout(ok, 80));
    last = (await api('POST', '/api/comments', { episode: 'S15E5', nom: 'Awa', texte: 'message ' + i, token })).status;
  }
  assert.strictEqual(last, 429);
});
test("les tentatives de connexion répétées sont bloquées", async () => {
  let last = 0;
  for (let i = 0; i < 6; i++) last = (await api('POST', '/api/admin/login', { username: 'admin', password: 'faux' })).status;
  assert.strictEqual(last, 429);
});
