// Détection des nouveaux épisodes : reprend la numérotation de tools/update-episodes.ps1.
'use strict';
const { db, staticEpisodes, episodeMeta, writeExport } = require('./db');

const RSS_URL = process.env.WT_RSS_URL || 'https://anchor.fm/s/2d912044/podcast/rss';
const YT_FEED = process.env.WT_YT_FEED === undefined ? 'https://www.youtube.com/feeds/videos.xml?channel_id=UCSgQIvviSJxLwGPS3sgcnlA' : process.env.WT_YT_FEED;

function decode(s) {
  return s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}
function tag(xml, name) {
  const m = xml.match(new RegExp('<' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + name + '>'));
  if (!m) return '';
  const cdata = m[1].match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return cdata ? cdata[1] : decode(m[1]);
}
function attr(xml, name, attribute) {
  const m = xml.match(new RegExp('<' + name + '\\s[^>]*' + attribute + '="([^"]*)"'));
  return m ? decode(m[1]) : '';
}

function numbering(rawTitle, tagSeason, tagEpisode) {
  let season = 0, episode = 0, part = 0, kind = 'episode', title = rawTitle.trim(), m;
  if (/^SNDTE\d+\s*-\s*/.test(title)) {
    kind = 'special'; title = title.replace(/^SNDTE\d+\s*-\s*/, '');
    episode = /souverainet/i.test(title) ? 1 : 2;
  } else if (/^S1467\s*-\s*/.test(title)) {
    season = 14; episode = 7; title = title.replace(/^S1467\s*-\s*/, '');
  } else if ((m = title.match(/^S(\d+)(?:P\d+)?E(\d+)(?:P(\d+))?(?:\s*-\s*P(\d+))?\s*[-:]\s*/))) {
    season = Number(m[1]); episode = Number(m[2]); part = Number(m[3] || m[4] || 0);
    title = title.slice(m[0].length);
  } else {
    season = Number(tagSeason || 1); episode = Number(tagEpisode || 0);
    if (/^Annonce\s*-\s*/.test(title)) { kind = 'annonce'; title = title.replace(/^Annonce\s*-\s*/, ''); }
    if (/^WOLOF TECH\s*-\s*FLASH\s*-\s*/.test(title)) { kind = 'flash'; title = title.replace(/^WOLOF TECH\s*-\s*FLASH\s*-\s*/, ''); }
    if (/^Comment .pargner/i.test(title)) episode = 2;
    if ((m = title.match(/_Partie_?0?(\d)/i))) { part = Number(m[1]); title = title.replace(/\s*_Partie_?\d+/, ''); }
  }
  let id = season === 0 ? 'SNDE' + episode : kind === 'annonce' ? 'S' + season + 'A' + episode : 'S' + season + 'E' + episode;
  if (part) id += 'P' + part;
  return { id, season, episode, part, kind, title: title.trim() };
}

function cleanDescription(html) {
  let t = decode(html.replace(/<\/p>|<br\s*\/?>|<\/li>/gi, '\n').replace(/<[^>]+>/g, ''));
  const cut = t.match(/^\s*(Support the show|Chers auditeurs|Vocalcast|Participez a la rubrique|Pour participer au VOCALCAST|Wolof Tech sur les r|Nous contacter|Sponsors\s*:|Send us a text).*$/im);
  if (cut && cut.index > 40) t = t.slice(0, cut.index);
  t = t.replace(/Chers auditeurs[\s\S]*$/, '');
  // Coordonnées personnelles des invités : elles ne sont pas republiées sur le site.
  t = t.replace(/(?:\+?221\s*)?\b7[05678](?:[ .]?\d){7}\b/g, '').replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '');
  return t.replace(/[ \t]+/g, ' ').split('\n').map((l) => l.trim()).filter((l) => l && !/^(Whatsapp|Contacts)\s*:?\s*$/i.test(l)).join('\n');
}
function summary(text) {
  const flat = text.split('\n').slice(0, 3).join(' ');
  if (flat.length <= 170) return flat;
  const cut = flat.slice(0, 170);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
}
function duration(raw) {
  if (raw.includes(':')) return raw;
  const s = Number(raw) || 0;
  return [Math.floor(s / 3600), Math.floor(s % 3600 / 60), s % 60].map((v) => String(v).padStart(2, '0')).join(':');
}

function parseFeed(xml) {
  return (xml.match(/<item>[\s\S]*?<\/item>/g) || []).map((item) => {
    const n = numbering(tag(item, 'title'), tag(item, 'itunes:season'), tag(item, 'itunes:episode'));
    const desc = cleanDescription(tag(item, 'description'));
    return {
      ...n,
      date: new Date(tag(item, 'pubDate')).toISOString().slice(0, 10),
      duration: duration(tag(item, 'itunes:duration')),
      summary: summary(desc),
      description: desc,
      audio: attr(item, 'enclosure', 'url'),
      spotify: tag(item, 'link').replace('podcasters.spotify.com', 'creators.spotify.com'),
      video: '',
      image: attr(item, 'itunes:image', 'href') || 'assets/logo.png'
    };
  });
}

const STOP = new Set(['les', 'des', 'une', 'dans', 'pour', 'avec', 'sur', 'que', 'qui', 'est', 'aux', 'par', 'son', 'ses', 'ces', 'quoi', 'comment', 'parlons', 'nous', 'vous', 'wolof', 'tech', 'woloftech', 'episode', 'saison']);
function tokens(s) {
  const words = s.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase().match(/[a-z0-9]{3,}/g) || [];
  return [...new Set(words)].filter((w) => !STOP.has(w));
}
// Proposition seulement : l'épisode reste à vérifier dans l'administration.
function findVideo(episode, videos, used) {
  const wanted = tokens(episode.title);
  let best = '', bestScore = 0;
  videos.forEach((v) => {
    if (used.has(v.id)) return;
    const have = tokens(v.title);
    if (!have.length || !wanted.length) return;
    const score = wanted.filter((w) => have.includes(w)).length / Math.min(wanted.length, have.length);
    if (score > bestScore) { bestScore = score; best = v.id; }
  });
  return bestScore >= 0.75 ? best : '';
}
async function youtubeFeed() {
  if (!YT_FEED) return [];
  try {
    const xml = await (await fetch(YT_FEED, { signal: AbortSignal.timeout(20000) })).text();
    return (xml.match(/<entry>[\s\S]*?<\/entry>/g) || []).map((e) => ({ id: tag(e, 'yt:videoId'), title: tag(e, 'title') }));
  } catch { return []; }
}

async function checkRss() {
  const res = await fetch(RSS_URL, { signal: AbortSignal.timeout(30000), headers: { 'User-Agent': 'WolofTech-Backend' } });
  if (!res.ok) throw new Error('Flux RSS indisponible (' + res.status + ')');
  const items = parseFeed(await res.text());
  if (!items.length) throw new Error('Flux RSS vide ou illisible');

  const known = staticEpisodes();
  const meta = episodeMeta();
  const ids = new Set(known.map((e) => e.id).concat(meta.filter((m) => m.detected).map((m) => m.id)));
  const audios = new Set(known.map((e) => e.audio));
  const fresh = items.filter((e) => !ids.has(e.id) && !audios.has(e.audio));
  if (fresh.length) {
    const videos = await youtubeFeed();
    const used = new Set(known.map((e) => e.video).concat(meta.map((m) => m.video)).filter(Boolean));
    const upsert = db.prepare(`INSERT INTO episode_meta (id, video, pending, detected, detected_at) VALUES (?, ?, 1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET pending = 1, detected = excluded.detected, detected_at = excluded.detected_at`);
    fresh.forEach((e) => {
      e.video = findVideo(e, videos, used);
      if (e.video) used.add(e.video);
      upsert.run(e.id, e.video, JSON.stringify(e), Date.now());
    });
    writeExport();
  }
  return { total: items.length, nouveaux: fresh.map((e) => ({ id: e.id, title: e.title })) };
}

module.exports = { checkRss, parseFeed, numbering };
