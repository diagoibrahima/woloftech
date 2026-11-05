// Backend Wolof Tech, sans dépendance externe : sert le site, l'administration et l'API.
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const store = require('./db');
const { checkRss } = require('./rss');
const { ROOT, db, writeExport, getSetting, setSetting } = store;

const PORT = Number(process.env.PORT || 8090);
const HOST = process.env.HOST || '127.0.0.1';
const TRUST_PROXY = process.env.WT_TRUST_PROXY === '1';
const SESSION_MS = 12 * 3600 * 1000;
const FIRST_PASSWORD_FILE = path.join(__dirname, 'data', 'premier-mot-de-passe.txt');

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

/* ---------- Mots de passe et sessions ---------- */
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex');
}
function setPassword(adminId, password) {
  const salt = crypto.randomBytes(16).toString('hex');
  db.prepare('UPDATE admins SET salt = ?, hash = ? WHERE id = ?').run(salt, hashPassword(password, salt), adminId);
}
function createFirstAdmin() {
  if (db.prepare('SELECT id FROM admins LIMIT 1').get()) return;
  const given = process.env.WT_ADMIN_PASSWORD;
  const password = given || crypto.randomBytes(12).toString('base64url');
  const salt = crypto.randomBytes(16).toString('hex');
  db.prepare('INSERT INTO admins (username, salt, hash) VALUES (?, ?, ?)').run('admin', salt, hashPassword(password, salt));
  if (!given) {
    fs.writeFileSync(FIRST_PASSWORD_FILE, password + '\n', { mode: 0o600 });
    console.log('Compte créé : identifiant admin. Mot de passe provisoire dans ' + FIRST_PASSWORD_FILE);
  }
}
function same(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
function sha256(s) { return crypto.createHash('sha256').update(s).digest('hex'); }
function clientIp(req) {
  if (TRUST_PROXY && req.headers['x-forwarded-for']) return req.headers['x-forwarded-for'].split(',')[0].trim();
  return req.socket.remoteAddress || '';
}
function cookie(req, name) {
  const found = (req.headers.cookie || '').split(';').map((c) => c.trim()).find((c) => c.startsWith(name + '='));
  return found ? found.slice(name.length + 1) : '';
}
function sessionOf(req) {
  const token = cookie(req, 'wt_session');
  if (!token) return null;
  return db.prepare('SELECT * FROM sessions WHERE token_hash = ? AND expires > ?').get(sha256(token), Date.now()) || null;
}
function cookieFlags(req) {
  const secure = process.env.WT_COOKIE_SECURE === '1' || (TRUST_PROXY && req.headers['x-forwarded-proto'] === 'https');
  return 'Path=/; HttpOnly; SameSite=Strict' + (secure ? '; Secure' : '');
}

// Trop d'échecs de connexion depuis une même adresse : on bloque 15 minutes.
const loginFails = new Map();
function loginBlocked(ip) {
  const f = loginFails.get(ip);
  if (!f) return false;
  if (f.until < Date.now()) { loginFails.delete(ip); return false; }
  return f.count >= 5;
}
function loginFailed(ip) {
  const f = loginFails.get(ip) || { count: 0, until: 0 };
  f.count++; f.until = Date.now() + 15 * 60000;
  loginFails.set(ip, f);
}

/* ---------- Validation ---------- */
function text(v, max, label, required) {
  const s = String(v == null ? '' : v).normalize('NFC').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();
  if (required && !s) throw new HttpError(400, label + ' est obligatoire.');
  if (s.length > max) throw new HttpError(400, label + ' est trop long (' + max + ' caractères au plus).');
  return s;
}
function url(v, label) {
  const s = text(v, 500, label);
  if (!s) return '';
  let u;
  try { u = new URL(s); } catch { throw new HttpError(400, label + " n'est pas un lien valide."); }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new HttpError(400, label + ' doit commencer par https://');
  return u.href;
}
function localImage(v) {
  const s = text(v, 200, 'Image');
  if (s && !/^assets\/(uploads|photos)\/[\w.-]+\.(jpe?g|png|webp)$/i.test(s)) throw new HttpError(400, 'Image invalide.');
  return s;
}
function youtubeId(v) {
  const s = text(v, 300, 'Le lien', true);
  const m = s.match(/^[\w-]{11}$/) || s.match(/(?:youtube(?:-nocookie)?\.com\/(?:shorts\/|watch\?(?:[^#]*&)?v=|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (!m) throw new HttpError(400, 'Ce lien YouTube n\'est pas reconnu. Exemple : https://youtube.com/shorts/8jdlbru14Xw');
  return m[1] || m[0];
}
function optionalVideo(v) { return String(v || '').trim() ? youtubeId(v) : ''; }
function sponsors(list) {
  if (!Array.isArray(list) || list.length > 20) throw new HttpError(400, 'Liste de sponsors invalide.');
  return list.map((p) => ({ nom: text(p.nom, 120, 'Le nom du sponsor', true), url: url(p.url, 'Le lien du sponsor') }));
}
function guestFields(b) {
  const secteur = text(b.secteur, 40, 'Le secteur', true);
  if (!store.secteurs().some((s) => s.id === secteur)) throw new HttpError(400, 'Secteur inconnu.');
  return {
    nom: text(b.nom, 120, 'Le nom', true), role: text(b.role, 200, 'Le rôle'), secteur,
    linkedin: url(b.linkedin, 'Le lien LinkedIn'), instagram: url(b.instagram, 'Le lien Instagram'),
    facebook: url(b.facebook, 'Le lien Facebook'), x: url(b.x, 'Le lien X'), avatar: localImage(b.avatar)
  };
}
function panelFields(b) {
  return {
    titre: text(b.titre, 160, 'Le titre', true), type: text(b.type, 60, 'Le type'), lieu: text(b.lieu, 120, 'Le lieu'),
    date: text(b.date, 40, 'La date'), description: text(b.description, 600, 'La description'),
    image: localImage(b.image), lien: url(b.lien, 'Le lien')
  };
}
function serviceFields(s) {
  const lines = Array.isArray(s.solution) ? s.solution : [];
  if (lines.length > 12) throw new HttpError(400, 'Trop de points dans la solution (12 au plus).');
  return {
    titre: text(s.titre, 120, 'Le titre du service', true), pourQui: text(s.pourQui, 500, 'Le champ « Pour qui »', true),
    probleme: text(s.probleme, 500, 'Le problème résolu', true), solutionTitre: text(s.solutionTitre, 80, 'Le titre de la solution', true),
    solution: lines.map((l) => text(l, 500, 'Un point de la solution')).filter(Boolean)
  };
}
function networks(r) {
  return { linkedin: url(r && r.linkedin, 'Le lien LinkedIn'), tiktok: url(r && r.tiktok, 'Le lien TikTok') };
}
// Une image envoyée qui ne sert plus quitte aussi le site : son adresse ne doit pas rester accessible.
function removeUnusedUpload(image) {
  if (!/^assets\/uploads\//.test(image)) return;
  const used = db.prepare('SELECT (SELECT COUNT(*) FROM gallery WHERE image = ?1) + (SELECT COUNT(*) FROM panels WHERE image = ?1) + (SELECT COUNT(*) FROM guests WHERE avatar = ?1) AS n').get(image).n;
  if (!used) fs.rmSync(path.join(ROOT, 'assets', 'uploads', path.basename(image)), { force: true });
}
function allEpisodes() {
  const meta = Object.fromEntries(store.episodeMeta().map((m) => [m.id, m]));
  const list = store.staticEpisodes().map((e) => e.id);
  const episodes = store.staticEpisodes();
  Object.values(meta).forEach((m) => { if (m.detected && !list.includes(m.id)) episodes.push(m.detected); });
  const guests = store.allGuests();
  const shorts = store.allShorts();
  return episodes.map((e) => {
    const m = meta[e.id] || {};
    return {
      id: e.id, title: e.title, date: e.date, season: e.season, video: m.video || e.video || '',
      sponsors: m.sponsors || [], pending: !!m.pending, guests: guests.filter((g) => g.episodes.includes(e.id)).map((g) => g.id),
      shorts: shorts.filter((s) => s.episode === e.id).length
    };
  }).sort((a, b) => (a.date < b.date ? 1 : -1));
}

function shortEpisode(v) {
  const id = text(v, 20, "L'épisode");
  if (id && !allEpisodes().some((e) => e.id === id)) throw new HttpError(400, 'Épisode introuvable.');
  return id;
}

/* ---------- Jeton du formulaire de commentaire ---------- */
const commentSecret = () => store.secret();
function formToken() {
  const t = String(Date.now());
  return t + '.' + crypto.createHmac('sha256', commentSecret()).update(t).digest('hex');
}
function checkFormToken(token) {
  const [t, sig] = String(token || '').split('.');
  if (!t || !sig || !same(sig, crypto.createHmac('sha256', commentSecret()).update(t).digest('hex'))) return 'invalid';
  const age = Date.now() - Number(t);
  if (age > 2 * 3600 * 1000) return 'expired';
  return age < Number(process.env.WT_MIN_FORM_MS || 3000) ? 'fast' : 'ok';
}

/* ---------- Routes ---------- */
const routes = [];
const route = (method, pattern, admin, handler) => routes.push({ method, pattern, admin, handler });
const reorder = (table, ids) => {
  if (!Array.isArray(ids)) throw new HttpError(400, 'Ordre invalide.');
  const stmt = db.prepare('UPDATE ' + table + ' SET pos = ? WHERE id = ?');
  ids.forEach((id, i) => stmt.run(i, Number(id)));
};

// Commentaires publics : seuls ceux validés dans l'administration sortent de la base.
route('GET', /^\/api\/comments$/, false, ({ query }) => {
  const episode = text(query.get('episode'), 20, "L'épisode", true).toUpperCase();
  const comments = db.prepare("SELECT id, nom, texte, created FROM comments WHERE episode = ? AND status = 'approved' ORDER BY created DESC LIMIT 200").all(episode);
  return { comments, token: formToken() };
});
route('POST', /^\/api\/comments$/, false, ({ body, req }) => {
  const message = 'Merci, votre commentaire sera publié après relecture.';
  // Champ invisible rempli : c'est un robot, on ne lui dit pas qu'il a été repéré.
  if (body.website) return { ok: true, message };
  const check = checkFormToken(body.token);
  if (check === 'fast') throw new HttpError(429, 'Patientez quelques secondes avant de réessayer.');
  if (check !== 'ok') throw new HttpError(400, 'Le formulaire a expiré. Rechargez la page.');
  const episode = text(body.episode, 20, "L'épisode", true).toUpperCase();
  if (!allEpisodes().some((e) => e.id === episode)) throw new HttpError(404, 'Épisode introuvable.');
  const nom = text(body.nom, 60, 'Le nom', true);
  const texte = text(body.texte, 1000, 'Le commentaire', true);
  if (texte.length < 2) throw new HttpError(400, 'Le commentaire est trop court.');
  if ((texte.match(/https?:\/\/|www\./gi) || []).length > 2) throw new HttpError(400, 'Trop de liens dans le commentaire.');
  const ipHash = crypto.createHmac('sha256', commentSecret()).update(clientIp(req)).digest('hex');
  const recent = db.prepare('SELECT COUNT(*) AS n FROM comments WHERE ip_hash = ? AND created > ?').get(ipHash, Date.now() - 600000).n;
  if (recent >= 5) throw new HttpError(429, 'Trop de commentaires envoyés. Réessayez dans quelques minutes.');
  if (db.prepare('SELECT id FROM comments WHERE ip_hash = ? AND texte = ? LIMIT 1').get(ipHash, texte)) return { ok: true, message };
  db.prepare('INSERT INTO comments (episode, nom, texte, created, ip_hash) VALUES (?, ?, ?, ?, ?)').run(episode, nom, texte, Date.now(), ipHash);
  return { ok: true, message };
});

route('POST', /^\/api\/admin\/login$/, false, ({ body, req, res }) => {
  const ip = clientIp(req);
  if (loginBlocked(ip)) throw new HttpError(429, 'Trop de tentatives. Réessayez dans 15 minutes.');
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(String(body.username || ''));
  // Le calcul a lieu même sans compte : le temps de réponse ne révèle pas les identifiants.
  const hash = hashPassword(String(body.password || ''), admin ? admin.salt : 'absent');
  if (!admin || !same(hash, admin.hash)) {
    loginFailed(ip);
    throw new HttpError(401, 'Identifiant ou mot de passe incorrect.');
  }
  loginFails.delete(ip);
  const token = crypto.randomBytes(32).toString('hex');
  const csrf = crypto.randomBytes(24).toString('hex');
  db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());
  db.prepare('INSERT INTO sessions (token_hash, admin_id, csrf, expires) VALUES (?, ?, ?, ?)').run(sha256(token), admin.id, csrf, Date.now() + SESSION_MS);
  res.setHeader('Set-Cookie', 'wt_session=' + token + '; ' + cookieFlags(req) + '; Max-Age=' + SESSION_MS / 1000);
  return { csrf, provisional: fs.existsSync(FIRST_PASSWORD_FILE) };
});
route('GET', /^\/api\/admin\/me$/, true, ({ session }) => ({ csrf: session.csrf, provisional: fs.existsSync(FIRST_PASSWORD_FILE) }));
route('POST', /^\/api\/admin\/logout$/, true, ({ session, req, res }) => {
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(session.token_hash);
  res.setHeader('Set-Cookie', 'wt_session=; ' + cookieFlags(req) + '; Max-Age=0');
  return { ok: true };
});
route('POST', /^\/api\/admin\/password$/, true, ({ body, session }) => {
  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(session.admin_id);
  if (!same(hashPassword(String(body.current || ''), admin.salt), admin.hash)) throw new HttpError(400, 'Mot de passe actuel incorrect.');
  if (String(body.next || '').length < 10) throw new HttpError(400, 'Choisissez au moins 10 caractères.');
  setPassword(admin.id, String(body.next));
  db.prepare('DELETE FROM sessions WHERE admin_id = ? AND token_hash != ?').run(admin.id, session.token_hash);
  fs.rmSync(FIRST_PASSWORD_FILE, { force: true });
  return { ok: true };
});

route('GET', /^\/api\/admin\/overview$/, true, () => ({
  pendingEpisodes: allEpisodes().filter((e) => e.pending).length,
  pendingComments: db.prepare("SELECT COUNT(*) AS n FROM comments WHERE status = 'pending'").get().n,
  lastCheck: getSetting('lastRssCheck', null)
}));
route('GET', /^\/api\/admin\/episodes$/, true, () => ({ episodes: allEpisodes(), lastCheck: getSetting('lastRssCheck', null) }));
route('POST', /^\/api\/admin\/rss\/check$/, true, async () => runRssCheck());
route('PUT', /^\/api\/admin\/episodes\/([\w]+)$/, true, ({ params, body }) => {
  const id = params[0];
  if (!allEpisodes().some((e) => e.id === id)) throw new HttpError(404, 'Épisode introuvable.');
  const list = sponsors(body.sponsors || []);
  const video = optionalVideo(body.video);
  const selected = new Set((body.guests || []).map(Number));
  db.prepare(`INSERT INTO episode_meta (id, sponsors, video, pending) VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET sponsors = excluded.sponsors, video = excluded.video, pending = excluded.pending`)
    .run(id, JSON.stringify(list), video, body.complete ? 0 : (body.pending ? 1 : 0));
  const update = db.prepare('UPDATE guests SET episodes = ? WHERE id = ?');
  store.allGuests().forEach((g) => {
    const has = g.episodes.includes(id);
    if (has && !selected.has(g.id)) update.run(JSON.stringify(g.episodes.filter((e) => e !== id)), g.id);
    if (!has && selected.has(g.id)) update.run(JSON.stringify([id].concat(g.episodes)), g.id);
  });
  writeExport();
  return { ok: true };
});

route('GET', /^\/api\/admin\/guests$/, true, () => ({ guests: store.allGuests(), secteurs: store.secteurs() }));
route('POST', /^\/api\/admin\/guests$/, true, ({ body }) => {
  const g = guestFields(body);
  const r = db.prepare('INSERT INTO guests (nom, role, secteur, linkedin, instagram, facebook, x, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(g.nom, g.role, g.secteur, g.linkedin, g.instagram, g.facebook, g.x, g.avatar);
  writeExport();
  return { id: Number(r.lastInsertRowid) };
});
route('PUT', /^\/api\/admin\/guests\/(\d+)$/, true, ({ params, body }) => {
  const g = guestFields(body);
  const r = db.prepare('UPDATE guests SET nom=?, role=?, secteur=?, linkedin=?, instagram=?, facebook=?, x=?, avatar=? WHERE id=?')
    .run(g.nom, g.role, g.secteur, g.linkedin, g.instagram, g.facebook, g.x, g.avatar, Number(params[0]));
  if (!r.changes) throw new HttpError(404, 'Invité introuvable.');
  writeExport();
  return { ok: true };
});
route('DELETE', /^\/api\/admin\/guests\/(\d+)$/, true, ({ params }) => {
  db.prepare('DELETE FROM guests WHERE id = ?').run(Number(params[0]));
  writeExport();
  return { ok: true };
});

route('GET', /^\/api\/admin\/shorts$/, true, () => ({ shorts: store.allShorts() }));
route('POST', /^\/api\/admin\/shorts$/, true, ({ body }) => {
  const video = youtubeId(body.url);
  const existing = db.prepare('SELECT episode FROM shorts WHERE video = ?').get(video);
  if (existing) throw new HttpError(400, existing.episode ? 'Ce short est déjà lié à l\'épisode ' + existing.episode + '.' : 'Ce short est déjà dans la liste.');
  const episode = shortEpisode(body.episode);
  // Dans un épisode, les shorts gardent l'ordre d'ajout.
  const pos = db.prepare('SELECT COALESCE(MAX(pos), -1) + 1 AS n FROM shorts').get().n;
  db.prepare('INSERT INTO shorts (video, titre, pos, episode) VALUES (?, ?, ?, ?)').run(video, text(body.titre, 160, 'Le titre'), pos, episode);
  writeExport();
  return { ok: true };
});
route('PUT', /^\/api\/admin\/shorts\/order$/, true, ({ body }) => { reorder('shorts', body.ids); writeExport(); return { ok: true }; });
route('PUT', /^\/api\/admin\/shorts\/(\d+)$/, true, ({ params, body }) => {
  const short = db.prepare('SELECT * FROM shorts WHERE id = ?').get(Number(params[0]));
  if (!short) throw new HttpError(404, 'Short introuvable.');
  const titre = body.titre === undefined ? short.titre : text(body.titre, 160, 'Le titre');
  const episode = body.episode === undefined ? short.episode : shortEpisode(body.episode);
  db.prepare('UPDATE shorts SET titre = ?, episode = ? WHERE id = ?').run(titre, episode, short.id);
  writeExport();
  return { ok: true };
});
route('DELETE', /^\/api\/admin\/shorts\/(\d+)$/, true, ({ params }) => {
  db.prepare('DELETE FROM shorts WHERE id = ?').run(Number(params[0]));
  writeExport();
  return { ok: true };
});

route('GET', /^\/api\/admin\/panels$/, true, () => ({ panels: store.allPanels() }));
route('POST', /^\/api\/admin\/panels$/, true, ({ body }) => {
  const p = panelFields(body);
  const pos = db.prepare('SELECT COALESCE(MAX(pos), -1) + 1 AS n FROM panels').get().n;
  db.prepare('INSERT INTO panels (titre, type, lieu, date, description, image, lien, pos) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(p.titre, p.type, p.lieu, p.date, p.description, p.image, p.lien, pos);
  writeExport();
  return { ok: true };
});
route('PUT', /^\/api\/admin\/panels\/order$/, true, ({ body }) => { reorder('panels', body.ids); writeExport(); return { ok: true }; });
route('PUT', /^\/api\/admin\/panels\/(\d+)$/, true, ({ params, body }) => {
  const p = panelFields(body);
  db.prepare('UPDATE panels SET titre=?, type=?, lieu=?, date=?, description=?, image=?, lien=? WHERE id=?')
    .run(p.titre, p.type, p.lieu, p.date, p.description, p.image, p.lien, Number(params[0]));
  writeExport();
  return { ok: true };
});
route('DELETE', /^\/api\/admin\/panels\/(\d+)$/, true, ({ params }) => {
  const panel = db.prepare('SELECT image FROM panels WHERE id = ?').get(Number(params[0]));
  db.prepare('DELETE FROM panels WHERE id = ?').run(Number(params[0]));
  if (panel) removeUnusedUpload(panel.image);
  writeExport();
  return { ok: true };
});

route('GET', /^\/api\/admin\/gallery$/, true, () => ({ photos: store.allGallery() }));
route('POST', /^\/api\/admin\/gallery$/, true, ({ body }) => {
  const image = localImage(body.image);
  if (!image) throw new HttpError(400, "L'image est obligatoire.");
  const size = (v) => { const n = Math.round(Number(v)); return n > 0 && n <= 20000 ? n : 0; };
  // Une nouvelle photo arrive en tête du diaporama.
  const pos = db.prepare('SELECT COALESCE(MIN(pos), 1) - 1 AS n FROM gallery').get().n;
  db.prepare('INSERT INTO gallery (image, alt, largeur, hauteur, pos) VALUES (?, ?, ?, ?, ?)').run(image, text(body.alt, 200, 'La description'), size(body.largeur), size(body.hauteur), pos);
  writeExport();
  return { ok: true };
});
route('PUT', /^\/api\/admin\/gallery\/order$/, true, ({ body }) => { reorder('gallery', body.ids); writeExport(); return { ok: true }; });
route('PUT', /^\/api\/admin\/gallery\/(\d+)$/, true, ({ params, body }) => {
  const r = db.prepare('UPDATE gallery SET alt = ? WHERE id = ?').run(text(body.alt, 200, 'La description'), Number(params[0]));
  if (!r.changes) throw new HttpError(404, 'Photo introuvable.');
  writeExport();
  return { ok: true };
});
route('DELETE', /^\/api\/admin\/gallery\/(\d+)$/, true, ({ params }) => {
  const photo = db.prepare('SELECT image FROM gallery WHERE id = ?').get(Number(params[0]));
  db.prepare('DELETE FROM gallery WHERE id = ?').run(Number(params[0]));
  if (photo) removeUnusedUpload(photo.image);
  writeExport();
  return { ok: true };
});

route('GET', /^\/api\/admin\/comments$/, true, ({ query }) => {
  const status = ['pending', 'approved', 'rejected'].includes(query.get('status')) ? query.get('status') : 'pending';
  const titles = Object.fromEntries(allEpisodes().map((e) => [e.id, e.title]));
  const comments = db.prepare('SELECT id, episode, nom, texte, status, created FROM comments WHERE status = ? ORDER BY created DESC LIMIT 300').all(status);
  return { comments: comments.map((c) => ({ ...c, episodeTitle: titles[c.episode] || c.episode })) };
});
route('PUT', /^\/api\/admin\/comments\/(\d+)$/, true, ({ params, body }) => {
  if (!['approved', 'rejected', 'pending'].includes(body.status)) throw new HttpError(400, 'Statut invalide.');
  db.prepare('UPDATE comments SET status = ? WHERE id = ?').run(body.status, Number(params[0]));
  return { ok: true };
});
route('DELETE', /^\/api\/admin\/comments\/(\d+)$/, true, ({ params }) => {
  db.prepare('DELETE FROM comments WHERE id = ?').run(Number(params[0]));
  return { ok: true };
});

route('GET', /^\/api\/admin\/settings$/, true, () => ({ contact: getSetting('contact', {}), services: getSetting('services', []), reseaux: getSetting('reseaux', {}) }));
route('PUT', /^\/api\/admin\/settings$/, true, ({ body }) => {
  const c = body.contact || {};
  const email = text(c.email, 160, "L'e-mail");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "L'e-mail n'est pas valide.");
  const phone = (v, label) => {
    const s = text(v, 30, label);
    if (s && !/^\+?[\d\s.()-]{6,}$/.test(s)) throw new HttpError(400, label + " n'est pas un numéro valide.");
    return s;
  };
  setSetting('contact', { telephone: phone(c.telephone, 'Le téléphone'), email, whatsapp: phone(c.whatsapp, 'Le WhatsApp') });
  const current = getSetting('services', []);
  setSetting('services', current.map((s) => {
    const next = (body.services || []).find((n) => n.id === s.id) || s;
    return { id: s.id, image: s.image, ...serviceFields(next) };
  }));
  const r = body.reseaux || {};
  setSetting('reseaux', { podcast: networks(r.podcast), auteur: networks(r.auteur) });
  writeExport();
  return { ok: true };
});

// Le type du fichier se lit dans ses premiers octets, jamais dans son nom. Le SVG est exclu : il peut contenir du code.
function imageExtension(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.length > 12 && buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  return '';
}
route('POST', /^\/api\/admin\/upload$/, true, ({ raw }) => {
  const ext = imageExtension(raw);
  if (!ext) throw new HttpError(400, 'Envoyez une image JPEG, PNG ou WebP.');
  const dir = path.join(ROOT, 'assets', 'uploads');
  fs.mkdirSync(dir, { recursive: true });
  const name = crypto.randomBytes(12).toString('hex') + '.' + ext;
  fs.writeFileSync(path.join(dir, name), raw);
  return { path: 'assets/uploads/' + name };
});

async function runRssCheck() {
  const result = await checkRss();
  const when = new Date().toISOString();
  setSetting('lastRssCheck', { when, total: result.total, nouveaux: result.nouveaux.length });
  return { ...result, when };
}

/* ---------- Serveur ---------- */
const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; media-src https:; frame-src https://www.youtube-nocookie.com https://www.youtube.com; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
  'X-Content-Type-Options': 'nosniff',
  // YouTube refuse ses lecteurs (erreur 153) si l'origine du site n'est pas transmise.
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Le micro sert uniquement à poser une question à l'oral sur l'accueil.
  'Permissions-Policy': 'camera=(), microphone=(self), geolocation=()'
};
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const PRIVATE = new Set(['backend', 'tools', 'readme.md']);

function sendJson(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new HttpError(413, 'Envoi trop volumineux.')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}

async function handleApi(req, res, parsed) {
  const pathname = parsed.pathname;
  const match = routes.map((r) => ({ r, m: req.method === r.method && pathname.match(r.pattern) })).find((x) => x.m);
  if (!match) throw new HttpError(404, 'Introuvable.');
  const { r, m } = match;
  const mutating = req.method !== 'GET';
  if (mutating && !sameOrigin(req)) throw new HttpError(403, 'Origine refusée.');
  let session = null;
  if (r.admin) {
    session = sessionOf(req);
    if (!session) throw new HttpError(401, 'Connexion requise.');
    if (mutating && !same(req.headers['x-csrf-token'] || '', session.csrf)) throw new HttpError(403, 'Jeton de sécurité invalide.');
  }
  const isUpload = pathname === '/api/admin/upload';
  const raw = mutating ? await readBody(req, isUpload ? 3 * 1024 * 1024 : 64 * 1024) : Buffer.alloc(0);
  let body = {};
  if (mutating && !isUpload && raw.length) {
    if (!/^application\/json/i.test(req.headers['content-type'] || '')) throw new HttpError(415, 'Format refusé.');
    try { body = JSON.parse(raw.toString('utf8')); } catch { throw new HttpError(400, 'Requête illisible.'); }
    if (!body || typeof body !== 'object') throw new HttpError(400, 'Requête illisible.');
  }
  sendJson(res, 200, await r.handler({ req, res, params: m.slice(1), query: parsed.searchParams, body, raw, session }));
}

function serveStatic(req, res, parsed) {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
  let rel;
  try { rel = decodeURIComponent(parsed.pathname); } catch { res.writeHead(400); res.end(); return; }
  if (rel === '/data/contenu.js') {
    res.writeHead(200, { 'Content-Type': MIME['.js'], 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : store.buildExport());
    return;
  }
  if (rel === '/admin') { res.writeHead(302, { Location: '/admin/' }); res.end(); return; }
  if (rel.endsWith('/')) rel += 'index.html';
  const parts = rel.split('/').filter(Boolean);
  const file = path.resolve(ROOT, parts.join(path.sep));
  const blocked = parts.some((p) => p.startsWith('.') || p === '..' || p.includes('\\')) || PRIVATE.has((parts[0] || '').toLowerCase());
  if (blocked || !file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile() || !MIME[path.extname(file).toLowerCase()]) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Page introuvable');
    return;
  }
  const headers = { 'Content-Type': MIME[path.extname(file).toLowerCase()], 'Cache-Control': 'no-cache' };
  if (parts[0] === 'admin') headers['X-Robots-Tag'] = 'noindex';
  res.writeHead(200, headers);
  if (req.method === 'HEAD') { res.end(); return; }
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  Object.entries(SECURITY_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  const parsed = new URL(req.url, 'http://local');
  try {
    if (parsed.pathname.startsWith('/api/')) await handleApi(req, res, parsed);
    else serveStatic(req, res, parsed);
  } catch (err) {
    if (res.headersSent) { res.end(); return; }
    if (err instanceof HttpError) { sendJson(res, err.status, { error: err.message }); return; }
    console.error(err);
    sendJson(res, 500, { error: 'Erreur du serveur.' });
  }
});

createFirstAdmin();
writeExport();
server.listen(PORT, HOST, () => {
  console.log('Site : http://' + HOST + ':' + PORT + '/');
  console.log('Administration : http://' + HOST + ':' + PORT + '/admin/');
});

// Vérifie le flux au démarrage, puis toutes les 6 heures.
function scheduledCheck() {
  runRssCheck()
    .then((r) => console.log(new Date().toISOString() + ' flux lu : ' + r.total + ' épisodes, ' + r.nouveaux.length + ' nouveau(x)'))
    .catch((err) => console.error('Vérification du flux impossible : ' + err.message));
}
if (!process.env.WT_NO_RSS_TIMER) {
  scheduledCheck();
  setInterval(scheduledCheck, Number(process.env.WT_RSS_HOURS || 6) * 3600 * 1000).unref();
}
