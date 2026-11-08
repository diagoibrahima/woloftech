// Base de données du backend et export vers data/contenu.js, le fichier lu par le site.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const DB_FILE = process.env.WT_DB || path.join(__dirname, 'data', 'woloftech.db');
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
const db = new DatabaseSync(DB_FILE);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, salt TEXT NOT NULL, hash TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE, csrf TEXT NOT NULL, expires INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY, nom TEXT NOT NULL, role TEXT NOT NULL DEFAULT '', secteur TEXT NOT NULL,
    episodes TEXT NOT NULL DEFAULT '[]', linkedin TEXT NOT NULL DEFAULT '', instagram TEXT NOT NULL DEFAULT '',
    facebook TEXT NOT NULL DEFAULT '', x TEXT NOT NULL DEFAULT '', avatar TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS episode_meta (
    id TEXT PRIMARY KEY, sponsors TEXT NOT NULL DEFAULT '[]', video TEXT NOT NULL DEFAULT '',
    pending INTEGER NOT NULL DEFAULT 0, detected TEXT, detected_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS shorts (id INTEGER PRIMARY KEY, video TEXT UNIQUE NOT NULL, titre TEXT NOT NULL DEFAULT '', pos INTEGER NOT NULL DEFAULT 0, episode TEXT NOT NULL DEFAULT '');
  CREATE TABLE IF NOT EXISTS panels (
    id INTEGER PRIMARY KEY, titre TEXT NOT NULL, type TEXT NOT NULL DEFAULT '', lieu TEXT NOT NULL DEFAULT '', date TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '', lien TEXT NOT NULL DEFAULT '', pos INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY, image TEXT NOT NULL, alt TEXT NOT NULL DEFAULT '', largeur INTEGER NOT NULL DEFAULT 0, hauteur INTEGER NOT NULL DEFAULT 0, pos INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS episode_photos (
    id INTEGER PRIMARY KEY, episode TEXT NOT NULL, image TEXT NOT NULL, alt TEXT NOT NULL DEFAULT '', largeur INTEGER NOT NULL DEFAULT 0, hauteur INTEGER NOT NULL DEFAULT 0, pos INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY, episode TEXT NOT NULL, nom TEXT NOT NULL, texte TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', created INTEGER NOT NULL, ip_hash TEXT
  );
  CREATE INDEX IF NOT EXISTS comments_episode ON comments(episode, status);
`);

// Lit un fichier data/*.js du site sans passer par un navigateur.
function readSiteData(file) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'data', file), 'utf8'), sandbox);
  return sandbox.window;
}
const staticEpisodes = () => readSiteData('episodes.js').WT_EPISODES || [];
const secteurs = () => readSiteData('invites.js').WT_SECTEURS || [];

function getSetting(key, fallback) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? JSON.parse(row.value) : fallback;
}
function setSetting(key, value) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, JSON.stringify(value));
}

const SERVICES = [
  {
    id: 'conseil', titre: 'Conseil et vulgarisation de produits et services', image: 'assets/photos/table-duo.jpg',
    pourQui: 'Les entreprises, ONG, institutions et agences qui lancent un produit ou un service innovant (technologie, finance, santé, agriculture, etc.).',
    probleme: 'Vos clients ou la population ne comprennent pas la valeur de votre offre à cause du jargon technique ou de barrières linguistiques.',
    solutionTitre: 'Ma méthodologie',
    solution: [
      'Co-conception de stratégies de communication adaptées aux réalités locales.',
      "Traduction et transmission des savoirs dans d'autres langues (notamment en wolof et langues nationales) d'une manière pédagogique, visuelle et extrêmement simple.",
      'Adaptation des messages pour le grand public et le monde rural.'
    ]
  },
  {
    id: 'panel', titre: 'Animation de débats, modération et packages événementiels', image: 'assets/photos/panel.jpg',
    pourQui: 'Les organisateurs de conférences, panels, lancements de produits ou événements institutionnels.',
    probleme: "Animer un débat technique sans le rendre ennuyeux, et réussir à capturer l'événement sous tous ses angles.",
    solutionTitre: 'Le package complet',
    solution: [
      'Animation sur mesure : modération de débats engageants, dynamiques et accessibles.',
      "Mise en exergue de l'événement (médias et vidéo) : prise en charge ou supervision de la captation vidéo et audio professionnelle pour prolonger l'impact de l'événement bien après qu'il soit terminé."
    ]
  },
  {
    id: 'podcast', titre: 'Formation et accompagnement podcast (création et studio)', image: 'assets/photos/coulisses.jpg',
    pourQui: 'Les professionnels, entrepreneurs, passionnés ou équipes de communication qui souhaitent lancer leur propre média audio.',
    probleme: 'Ne pas savoir par où commencer techniquement, matériellement ou éditorialement.',
    solutionTitre: 'Ma solution',
    solution: [
      "Formations pratiques (de la conception éditoriale à l'enregistrement et au mixage).",
      'Conseils sur le choix du matériel (microphones, traitement acoustique, plateformes de diffusion).',
      'Accompagnement de A à Z pour structurer et lancer son podcast avec un standard professionnel.'
    ]
  }
];

// Photos déjà présentes sur l'accueil : image, description, largeur, hauteur.
const GALLERY = [
  ['conversation', 'Un invité et une invitée échangent autour de la table du studio', 1400, 933],
  ['sourire', 'Un invité sourit au micro, tablette devant lui', 1100, 733],
  ['coulisses', "Les coulisses d'un tournage : caméra, lumière et table d'enregistrement", 1100, 825],
  ['portrait-invitee', 'Une invitée sourit au micro', 800, 1200],
  ['table-duo', "Échange entre deux personnes de part et d'autre de la table du studio", 1100, 733],
  ['panel', 'Quatre personnes en discussion sur une terrasse, badges autour du cou', 1400, 931],
  ['ecoute', "Au micro, casque sur les oreilles, devant l'étagère du studio", 800, 1200],
  ['table', 'Conversation autour de la grande table du studio', 1400, 788],
  ['agile-tour', "Deux intervenants sur scène à l'Agile Tour Dakar 2023", 1100, 733],
  ['notes', 'Une invitée prend des notes au micro', 1100, 619],
  ['direct', "Enregistrement en public lors d'un événement tech", 800, 1201],
  ['invite', 'Un invité regarde vers la caméra, micro et tablette devant lui', 1100, 733],
  ['remise', "Remise d'un souvenir à un invité à la fin de l'enregistrement", 1100, 733],
  ['regie', 'Enregistrement en studio, vu depuis la régie', 800, 1067],
  ['au-micro', 'Au micro, ordinateur portable ouvert sur le bureau', 800, 1200],
  ['banniere', 'Au micro, le regard sur ses notes', 1100, 733]
];

// Base créée avant le lien entre shorts et épisodes : le teaser retrouve son épisode.
function migrate() {
  if (db.prepare('PRAGMA table_info(shorts)').all().some((c) => c.name === 'episode')) return;
  db.exec("ALTER TABLE shorts ADD COLUMN episode TEXT NOT NULL DEFAULT ''");
  const teasers = readSiteData('site.js').WT_SITE.teasers || {};
  Object.entries(teasers).forEach(([id, video]) => {
    db.prepare('UPDATE shorts SET episode = ? WHERE video = ?').run(id, video);
  });
}

// Première ouverture : la base reprend ce que le site contient déjà.
function seed() {
  if (getSetting('seeded', false)) return;
  const insertGuest = db.prepare('INSERT INTO guests (nom, role, secteur, episodes, linkedin, instagram, facebook, x) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  (readSiteData('invites.js').WT_INVITES || []).forEach((g) => {
    insertGuest.run(g.nom, g.role || '', g.secteur, JSON.stringify(g.episodes || []), g.linkedin || '', g.instagram || '', g.facebook || '', g.x || '');
  });
  const titles = Object.fromEntries(staticEpisodes().map((e) => [e.id, e.title]));
  const teasers = readSiteData('site.js').WT_SITE.teasers || {};
  Object.entries(teasers).forEach(([id, video], i) => {
    db.prepare('INSERT OR IGNORE INTO shorts (video, titre, pos, episode) VALUES (?, ?, ?, ?)').run(video, titles[id] || '', i, id);
  });
  const insertPanel = db.prepare('INSERT INTO panels (titre, type, lieu, date, image, pos) VALUES (?, ?, ?, ?, ?, ?)');
  insertPanel.run('Agile Tour Dakar 2023', 'Sur scène', 'Dakar', '2023', 'assets/photos/agile-tour.jpg', 0);
  insertPanel.run('Échange entre intervenants', 'Panel', '', '', 'assets/photos/panel.jpg', 1);
  insertPanel.run('Enregistrement en public', 'Événement', '', '', 'assets/photos/direct.jpg', 2);
  setSetting('contact', { telephone: '', email: '', whatsapp: '' });
  setSetting('services', SERVICES);
  setSetting('seeded', true);
}

// Ajouts à une base déjà créée : chaque étape ne s'applique qu'une fois.
function upgrade() {
  if (!getSetting('gallerySeeded', false)) {
    const insert = db.prepare('INSERT INTO gallery (image, alt, largeur, hauteur, pos) VALUES (?, ?, ?, ?, ?)');
    GALLERY.forEach((p, i) => insert.run('assets/photos/' + p[0] + '.jpg', p[1], p[2], p[3], i));
    setSetting('gallerySeeded', true);
  }
  if (getSetting('services', []).some((s) => !s.solution)) setSetting('services', SERVICES);
  if (!getSetting('reseaux', null)) {
    // Comptes d'elibrahim : les seuls connus pour LinkedIn et TikTok, à remplacer depuis /admin/ si le podcast a les siens.
    const a = readSiteData('site.js').WT_SITE.animateur;
    const perso = { linkedin: a.linkedin, tiktok: 'https://www.tiktok.com/@elibdiago' };
    setSetting('reseaux', { podcast: perso, auteur: perso });
  }
}

function secret() {
  let s = getSetting('secret', '');
  if (!s) { s = crypto.randomBytes(32).toString('hex'); setSetting('secret', s); }
  return s;
}

const parseGuest = (g) => ({ ...g, episodes: JSON.parse(g.episodes) });
const allGuests = () => db.prepare('SELECT * FROM guests ORDER BY nom COLLATE NOCASE').all().map(parseGuest);
const allShorts = () => db.prepare('SELECT * FROM shorts ORDER BY pos, id').all();
const allPanels = () => db.prepare('SELECT * FROM panels ORDER BY pos, id').all();
const allGallery = () => db.prepare('SELECT * FROM gallery ORDER BY pos, id').all();
const allEpisodePhotos = () => db.prepare('SELECT * FROM episode_photos ORDER BY pos, id').all();

function episodeMeta() {
  return db.prepare('SELECT * FROM episode_meta').all().map((m) => ({ ...m, sponsors: JSON.parse(m.sponsors), detected: m.detected ? JSON.parse(m.detected) : null }));
}

// Le JSON reste valable dans une balise script : aucun « < » ne peut la refermer.
function buildExport() {
  const known = new Set(staticEpisodes().map((e) => e.id));
  const meta = {};
  const extra = [];
  episodeMeta().forEach((m) => {
    if (m.sponsors.length || m.video) meta[m.id] = { sponsors: m.sponsors, video: m.video };
    if (m.detected && !known.has(m.id)) extra.push({ ...m.detected, video: m.video });
  });
  const guests = allGuests().map((g) => {
    const out = { nom: g.nom, role: g.role, secteur: g.secteur, episodes: g.episodes };
    ['linkedin', 'instagram', 'facebook', 'x', 'avatar'].forEach((k) => { if (g[k]) out[k] = g[k]; });
    return out;
  });
  const photos = {};
  allEpisodePhotos().forEach(({ id, pos, episode, ...p }) => { (photos[episode] = photos[episode] || []).push(p); });
  const values = {
    WT_INVITES: guests,
    WT_SHORTS: allShorts().map((s) => ({ video: s.video, titre: s.titre, episode: s.episode })),
    WT_PANELS: allPanels().map(({ id, pos, ...p }) => p),
    WT_GALLERY: allGallery().map(({ id, pos, ...p }) => p),
    WT_EPISODE_PHOTOS: photos,
    WT_RESEAUX: getSetting('reseaux', {}),
    WT_CONTACT: getSetting('contact', {}),
    WT_SERVICES: getSetting('services', []),
    WT_EPISODE_META: meta,
    WT_EPISODES_EXTRA: extra
  };
  const lines = Object.entries(values).map(([k, v]) => 'window.' + k + ' = ' + JSON.stringify(v, null, 1).replace(/</g, '\\u003c') + ';');
  return '// Fichier généré par le backend : modifier ces contenus depuis /admin/.\n' + lines.join('\n') + '\n';
}

function writeExport() {
  if (process.env.WT_NO_EXPORT) return;
  const file = path.join(ROOT, 'data', 'contenu.js');
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, buildExport());
  fs.renameSync(tmp, file);
}

migrate();
seed();
upgrade();
// Au-delà de 30 jours, l'empreinte d'adresse IP ne sert plus à limiter les envois.
db.prepare('UPDATE comments SET ip_hash = NULL WHERE created < ?').run(Date.now() - 30 * 864e5);

module.exports = { ROOT, DB_FILE, db, staticEpisodes, secteurs, getSetting, setSetting, secret, allGuests, allShorts, allPanels, allGallery, allEpisodePhotos, episodeMeta, buildExport, writeExport };
