(function () {
  'use strict';

  var EPISODES = window.WT_EPISODES || [];
  var SAISONS = window.WT_SAISONS || [];
  var SERIES = window.WT_SERIES || [];
  var INVITES = window.WT_INVITES || [];
  var SECTEURS = window.WT_SECTEURS || [];
  var SITE = window.WT_SITE;
  var CONTACT = window.WT_CONTACT || {};
  var SERVICES = window.WT_SERVICES || [];
  var PANELS = window.WT_PANELS || [];
  var GALLERY = window.WT_GALLERY || [];
  var EPISODE_PHOTOS = window.WT_EPISODE_PHOTOS || {};
  var RESEAUX = window.WT_RESEAUX || {};
  if (RESEAUX.podcast) { SITE.liens.linkedin = RESEAUX.podcast.linkedin; SITE.liens.tiktok = RESEAUX.podcast.tiktok; }
  if (RESEAUX.auteur) { SITE.animateur.linkedin = RESEAUX.auteur.linkedin; SITE.animateur.tiktok = RESEAUX.auteur.tiktok; }
  var META = window.WT_EPISODE_META || {};
  var SHORTS = window.WT_SHORTS || Object.keys(SITE.teasers || {}).map(function (id) { return { video: SITE.teasers[id], titre: '', episode: id }; });
  var byId = {};
  // Épisodes détectés par le backend, pas encore intégrés à episodes.js.
  (window.WT_EPISODES_EXTRA || []).forEach(function (x) {
    if (!EPISODES.some(function (e) { return e.id === x.id; })) EPISODES.push(x);
  });
  EPISODES.forEach(function (e) {
    byId[e.id] = e;
    var extra = META[e.id];
    if (extra) {
      if (extra.video) e.video = extra.video;
      e.sponsors = extra.sponsors || [];
    }
    // Une saison pas encore décrite dans saisons.js doit quand même s'afficher.
    if (e.season > 0 && !SAISONS.some(function (s) { return s.numero === e.season; })) {
      SAISONS.push({ numero: e.season, titre: 'Saison ' + e.season, description: '', sponsors: [] });
    }
  });

  // Les erreurs d'image ne remontent pas : on les capte à la descente.
  document.addEventListener('error', function (ev) {
    var img = ev.target;
    if (img.tagName !== 'IMG' || !img.dataset.fallback) return;
    var next = img.dataset.fallback;
    delete img.dataset.fallback;
    img.src = next;
  }, true);

  var ICONS = {
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.4"/><circle cx="17.6" cy="6.4" r="1.2" fill="currentColor" stroke="none"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    spotify: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
    rss: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.6" fill="currentColor" stroke="none"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5v17l14-8.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h4.5v18H6zM13.5 3H18v18h-4.5z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    caret: '<svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 9l7 7 7-7"/></svg>'
  };
  var SOCIAL_NAMES = { linkedin: 'LinkedIn', tiktok: 'TikTok', instagram: 'Instagram', facebook: 'Facebook', x: 'X' };

  function esc(s) {
    // L'espace insécable garde la ponctuation française sur la même ligne que le mot précédent.
    return String(s == null ? '' : s).replace(/ ([:;?!])/g, ' $1').replace(/(\d) (\d{3})\b/g, '$1 $2').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function formatDate(iso) {
    var p = iso.split('-');
    var months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return Number(p[2]) + ' ' + months[Number(p[1]) - 1] + ' ' + p[0];
  }
  function secondsOf(e) {
    return e.duration.split(':').map(Number).reduce(function (t, v) { return t * 60 + v; }, 0);
  }
  function formatDuration(e) {
    var s = secondsOf(e), h = Math.floor(s / 3600), m = Math.round(s % 3600 / 60);
    if (m === 60) { h++; m = 0; }
    return h ? h + ' h ' + String(m).padStart(2, '0') : m + ' min';
  }
  function clock(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = String(sec % 60).padStart(2, '0');
    return h ? h + ':' + String(m).padStart(2, '0') + ':' + s : m + ':' + s;
  }
  function totalHours() {
    return Math.round(EPISODES.reduce(function (t, e) { return t + secondsOf(e); }, 0) / 3600);
  }
  function code(e) {
    var parts = [e.season === 0 ? 'Série spéciale' : 'Saison ' + e.season];
    if (e.kind === 'annonce') parts.push('annonce');
    else if (e.episode === 0) parts.push('présentation');
    else parts.push('épisode ' + e.episode);
    if (e.part) parts.push('partie ' + e.part);
    if (e.kind === 'flash') parts.push('flash');
    return parts.join(', ');
  }
  function shortCode(e) {
    return e.id.replace(/^SNDE/, 'Spécial ').replace(/^S(\d+)E/, 'S$1 E').replace(/^S(\d+)A/, 'S$1 A').replace(/P(\d)$/, ' P$1');
  }
  function epUrl(e) { return 'episode.html?e=' + encodeURIComponent(e.id.toLowerCase()); }
  function guestsOf(e) { return INVITES.filter(function (g) { return g.episodes.indexOf(e.id) !== -1; }); }
  function guestNames(e) { return guestsOf(e).map(function (g) { return g.nom; }).join(', '); }
  function slug(g) { return norm(g.nom + '-' + g.secteur).replace(/[^a-z0-9]+/g, '-'); }
  function guestLink(g) { return 'communaute.html#' + slug(g); }
  function seasonInfo(n) {
    return SAISONS.concat(SERIES).filter(function (s) { return s.numero === n; })[0] || { numero: n, titre: 'Saison ' + n, description: '', sponsors: [] };
  }
  function seasonEpisodes(n) {
    return EPISODES.filter(function (e) { return e.season === n; }).sort(function (a, b) {
      return (b.episode - a.episode) || (b.part - a.part) || (a.kind === 'annonce' ? 1 : -1);
    });
  }
  function seasonOrder() {
    // Du plus récent au plus ancien, la série spéciale juste après la saison en cours.
    var list = SAISONS.slice().sort(function (a, b) { return b.numero - a.numero; });
    return list.slice(0, 1).concat(SERIES, list.slice(1));
  }
  function socials(p) {
    return ['linkedin', 'tiktok', 'instagram', 'facebook', 'x'].filter(function (k) { return p[k]; }).map(function (k) {
      return '<a class="social" href="' + esc(p[k]) + '" target="_blank" rel="noopener" aria-label="' + esc(p.nom) + ' sur ' + SOCIAL_NAMES[k] + '" title="' + SOCIAL_NAMES[k] + '">' + ICONS[k] + '</a>';
    }).join('');
  }
  function playBtn(e) {
    return '<button class="play-big" type="button" data-play="' + e.id + '" aria-label="Écouter : ' + esc(e.title) + '">' + ICONS.play + '</button>';
  }

  /* L'onde est décorative : elle varie selon l'épisode mais ne reflète pas le son réel. */
  function waveHtml(e, count) {
    var seed = 0, i;
    for (i = 0; i < e.id.length; i++) seed = (seed * 31 + e.id.charCodeAt(i)) >>> 0;
    function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
    var bars = '';
    for (i = 0; i < count; i++) {
      var h = 22 + 42 * Math.abs(Math.sin(i * 0.33 + seed % 7)) + 36 * rnd();
      bars += '<i style="--h:' + Math.min(100, Math.round(h)) + '%;--i:' + i + '"></i>';
    }
    return '<div class="wave" data-wave="' + e.id + '"><div class="bars" aria-hidden="true">' + bars + '</div><div class="bars on" aria-hidden="true">' + bars + '</div>' +
      '<input type="range" min="0" max="1000" value="0" data-seek="' + e.id + '" aria-label="Position dans l\'épisode : ' + esc(e.title) + '"></div>';
  }

  function shortDuration(e) { return e.duration.replace(/^00:/, '').replace(/^0(\d)/, '$1'); }
  function miniListen(e) {
    return '<button class="mini" type="button" data-play="' + e.id + '" aria-label="Écouter : ' + esc(e.title) + '" title="Écouter en audio">' + ICONS.play + '</button>';
  }
  // Miniature YouTube : hqdefault est en 4:3 avec des bandes noires, le cadre 16:9 les retire.
  function thumbBtn(e) {
    // Vidéo pas encore trouvée : la miniature mène à la page de l'épisode, avec l'audio.
    if (!e.video) {
      return '<a class="thumb" href="' + epUrl(e) + '" aria-label="' + esc(e.title) + '"><img src="' + esc(e.image) + '" alt="" loading="lazy" width="480" height="270">' +
        '<span class="go">' + ICONS.play + '</span><span class="dur">' + esc(shortDuration(e)) + '</span></a>';
    }
    var src = e.video ? 'https://i.ytimg.com/vi/' + esc(e.video) + '/hqdefault.jpg' : esc(e.image);
    return '<button class="thumb" type="button" data-watch="' + esc(e.video) + '" data-title="' + esc(e.title) + '" aria-label="Regarder la vidéo : ' + esc(e.title) + '">' +
      '<img src="' + src + '" alt="" loading="lazy" width="480" height="270" data-fallback="' + esc(e.image) + '">' +
      '<span class="go">' + ICONS.play + '</span><span class="dur">' + esc(shortDuration(e)) + '</span></button>';
  }
  function vidCard(e) {
    var who = guestNames(e);
    return '<article class="vid-card">' + thumbBtn(e) +
      '<span class="where">' + esc(code(e)) + '</span><h3><a href="' + epUrl(e) + '">' + esc(e.title) + '</a></h3>' +
      '<div class="foot"><span>' + (who ? 'Avec ' + esc(who) : esc(formatDuration(e))) + '</span>' + miniListen(e) + '</div></article>';
  }

  /* ---------- Fenêtre vidéo ---------- */
  function initWatch() {
    var dlg = document.createElement('dialog');
    dlg.className = 'watch';
    dlg.innerHTML = '<button class="shut" type="button" aria-label="Fermer la vidéo">' + ICONS.close + '</button><div class="frame"></div>';
    document.body.appendChild(dlg);
    var frame = dlg.querySelector('.frame');
    function shut() { dlg.close(); }
    dlg.addEventListener('close', function () { frame.innerHTML = ''; });
    dlg.querySelector('.shut').addEventListener('click', shut);
    dlg.addEventListener('click', function (ev) { if (ev.target === dlg) shut(); });
    document.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-watch]');
      if (!b || !b.dataset.watch) return;
      Player.pause();
      dlg.classList.toggle('tall', b.dataset.tall === '1');
      frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(b.dataset.watch) + '?autoplay=1&rel=0" title="' + esc(b.dataset.title) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
      dlg.showModal();
    });
  }

  /* ---------- Diaporama ---------- */
  function initGalleries() {
    document.querySelectorAll('[data-gallery]').forEach(function (root) {
      var track = root.querySelector('.track'), prev = root.querySelector('[data-prev]'), next = root.querySelector('[data-next]');
      function step() { return Math.max(240, track.clientWidth * 0.7); }
      function update() {
        prev.disabled = track.scrollLeft < 4;
        next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
      }
      prev.addEventListener('click', function () { track.scrollBy({ left: -step() }); });
      next.addEventListener('click', function () { track.scrollBy({ left: step() }); });
      track.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      window.addEventListener('load', update);
      track.querySelectorAll('img').forEach(function (i) { i.addEventListener('load', update); });
      update();
    });
  }
  function galleryHtml(title, photos) {
    if (!photos.length) return '';
    var arrow = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>'; };
    return '<section class="on-saffron" data-gallery aria-label="' + esc(title) + '" style="padding-block:clamp(20px,3vw,40px) clamp(50px,7vw,90px)"><div class="wrap gallery-head"><h2>' + esc(title) + '</h2>' +
      '<div class="arrows"><button class="arrow" type="button" data-prev aria-label="Photos précédentes">' + arrow('M15 5l-7 7 7 7') + '</button>' +
      '<button class="arrow" type="button" data-next aria-label="Photos suivantes">' + arrow('M9 5l7 7-7 7') + '</button></div></div>' +
      '<div class="track" tabindex="0" role="group" aria-label="Photos, faites défiler pour voir la suite">' + photos.map(function (p) {
        return '<img src="' + esc(p.image) + '" alt="' + esc(p.alt) + '"' + (p.largeur && p.hauteur ? ' width="' + p.largeur + '" height="' + p.hauteur + '"' : '') + ' loading="lazy">';
      }).join('') + '</div></section>';
  }

  /* ---------- Lecteur audio, présent sur toutes les pages ---------- */
  var Player = (function () {
    var KEY = 'wt-player';
    var audio = new Audio();
    audio.preload = 'none';
    var current = null, pendingTime = null, triedDirect = false, failed = false, rates = [1, 1.25, 1.5, 2], rate = 0, dragging = false, lastSave = 0;
    var bar;

    function save() {
      try {
        if (current) localStorage.setItem(KEY, JSON.stringify({ id: current.id, t: audio.currentTime || pendingTime || 0 }));
        else localStorage.removeItem(KEY);
      } catch (err) { /* le stockage peut être bloqué : la lecture continue sans reprise */ }
    }
    function duration() { return audio.duration || (current ? secondsOf(current) : 0); }
    function time() { return pendingTime != null ? pendingTime : audio.currentTime; }

    function load(e, startAt) {
      current = e; triedDirect = false; failed = false;
      pendingTime = startAt || null;
      audio.src = e.audio;
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({ title: e.title, artist: 'Wolof Tech', artwork: [{ src: e.image, sizes: '480x480', type: 'image/jpeg' }] });
      }
      renderBar();
      sync();
      save();
    }
    function play() { audio.play().catch(function () {}); }
    function toggle(id) {
      if (!current || current.id !== id) { load(byId[id]); play(); return; }
      if (audio.paused) play(); else audio.pause();
    }
    function seekTo(id, ratio) {
      if (!current || current.id !== id) load(byId[id]);
      var t = ratio * duration();
      if (audio.readyState > 0) audio.currentTime = t; else pendingTime = t;
      sync();
    }
    function stop() {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      current = null; pendingTime = null;
      save();
      renderBar();
      sync();
    }
    function renderBar() {
      if (!bar) return;
      bar.hidden = !current;
      document.body.classList.toggle('has-player', !!current);
      if (!current) return;
      bar.querySelector('img').src = current.image;
      var link = bar.querySelector('.what a');
      link.href = epUrl(current);
      link.textContent = current.title;
    }
    function sync() {
      var playing = current && !audio.paused;
      document.querySelectorAll('[data-play]').forEach(function (b) {
        var on = playing && b.dataset.play === current.id;
        if (b.dataset.state !== String(on)) {
          b.dataset.state = String(on);
          b.innerHTML = on ? ICONS.pause : ICONS.play;
          var title = byId[b.dataset.play] ? byId[b.dataset.play].title : '';
          b.setAttribute('aria-label', (on ? 'Mettre en pause : ' : 'Écouter : ') + title);
        }
      });
      var ratio = current && duration() ? Math.min(1, time() / duration()) : 0;
      document.querySelectorAll('.wave').forEach(function (w) {
        var mine = current && w.dataset.wave === current.id;
        w.classList.toggle('playing', !!(mine && playing));
        w.querySelector('.on').style.clipPath = 'inset(0 ' + (100 - (mine ? ratio : 0) * 100) + '% 0 0)';
        var input = w.querySelector('input');
        if (!dragging) input.value = mine ? ratio * 1000 : 0;
        input.setAttribute('aria-valuetext', mine ? clock(time()) : '0:00');
      });
      document.querySelectorAll('[data-time]').forEach(function (el) {
        var mine = current && el.dataset.time === current.id;
        var total = byId[el.dataset.time] ? secondsOf(byId[el.dataset.time]) : 0;
        el.textContent = mine ? clock(time()) + ' / ' + clock(duration()) : clock(total);
      });
      if (bar && current) {
        var range = bar.querySelector('.range');
        if (!dragging) range.value = ratio * 1000;
        if (!failed) bar.querySelector('.sub').textContent = clock(time()) + ' / ' + clock(duration());
      }
    }

    function init() {
      bar = document.createElement('section');
      bar.className = 'player';
      bar.hidden = true;
      bar.setAttribute('aria-label', 'Lecteur audio');
      bar.innerHTML = '<input class="range" type="range" min="0" max="1000" value="0" aria-label="Position dans l\'épisode">' +
        '<div class="wrap"><img alt="" width="54" height="54">' +
        '<div class="what"><a href="#"></a><span class="sub"></span></div>' +
        '<button class="ctl skip15" type="button" data-skip="-15" aria-label="Reculer de 15 secondes">−15 s</button>' +
        '<button class="play-big" type="button" data-bar-toggle aria-label="Lecture">' + ICONS.play + '</button>' +
        '<button class="ctl skip15" type="button" data-skip="15" aria-label="Avancer de 15 secondes">+15 s</button>' +
        '<button class="ctl rate" type="button" data-rate aria-label="Vitesse de lecture">1x</button>' +
        '<button class="ctl" type="button" data-stop aria-label="Fermer le lecteur">' + ICONS.close + '</button></div>';
      document.body.appendChild(bar);

      document.addEventListener('click', function (ev) {
        var b = ev.target.closest('[data-play],[data-skip],[data-rate],[data-stop],[data-bar-toggle]');
        if (!b) return;
        if (b.dataset.play) { ev.preventDefault(); toggle(b.dataset.play); }
        else if (b.hasAttribute('data-bar-toggle')) toggle(current.id);
        else if (b.dataset.skip) {
          var t = Math.max(0, time() + Number(b.dataset.skip));
          if (audio.readyState > 0) audio.currentTime = t; else pendingTime = t;
          sync();
        }
        else if (b.hasAttribute('data-rate')) {
          rate = (rate + 1) % rates.length;
          audio.playbackRate = rates[rate];
          b.textContent = rates[rate] + 'x';
        }
        else if (b.hasAttribute('data-stop')) stop();
      });
      document.addEventListener('input', function (ev) {
        var el = ev.target;
        if (el.dataset.seek) { dragging = true; seekTo(el.dataset.seek, el.value / 1000); dragging = false; }
        else if (el.classList.contains('range') && current) { dragging = true; seekTo(current.id, el.value / 1000); dragging = false; }
      });

      audio.addEventListener('loadedmetadata', function () {
        if (pendingTime != null) { audio.currentTime = pendingTime; pendingTime = null; }
        failed = false;
        sync();
      });
      audio.addEventListener('play', function () {
        bar.querySelector('[data-bar-toggle]').innerHTML = ICONS.pause;
        bar.querySelector('[data-bar-toggle]').setAttribute('aria-label', 'Pause');
        sync();
      });
      audio.addEventListener('pause', function () {
        bar.querySelector('[data-bar-toggle]').innerHTML = ICONS.play;
        bar.querySelector('[data-bar-toggle]').setAttribute('aria-label', 'Lecture');
        sync();
        save();
      });
      audio.addEventListener('timeupdate', function () {
        sync();
        if (Date.now() - lastSave > 4000) { lastSave = Date.now(); save(); }
      });
      // Le lien du flux passe par anchor.fm, qui compte l'écoute mais échoue parfois : on se rabat alors sur le fichier MP3.
      audio.addEventListener('error', function () {
        // Une erreur de l'ancienne source peut arriver après le changement : audio.error est alors vide.
        if (!current || !audio.getAttribute('src') || !audio.error) return;
        var direct = decodeURIComponent(current.audio.replace(/^.*?\/play\/\d+\//, ''));
        if (!triedDirect && /^https:/.test(direct)) {
          triedDirect = true;
          audio.src = direct;
          play();
        } else {
          failed = true;
          bar.querySelector('.sub').textContent = 'Lecture impossible ici : ouvrez l\'épisode sur Spotify.';
        }
      });
      window.addEventListener('pagehide', save);

      // Reprise après un changement de page : le navigateur impose un clic pour relancer le son.
      try {
        var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
        if (saved && byId[saved.id]) load(byId[saved.id], saved.t);
      } catch (err) { /* rien à reprendre */ }
    }
    return { init: init, sync: sync, pause: function () { audio.pause(); } };  })();

  /* ---------- Shorts : fil vertical, on pousse vers le haut pour passer au suivant ---------- */
  function shortsOf(id) { return SHORTS.filter(function (s) { return s.episode === id; }); }
  function shortsFeedHtml(full, list) {
    var arrow = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>'; };
    return '<div class="shorts' + (full ? ' full' : ' inline') + '" data-shorts="' + (full ? 'full' : 'inline') + '">' +
      '<div class="shorts-feed" tabindex="0" role="group" aria-label="Shorts : faites défiler vers le haut pour voir le suivant">' + list.map(function (s, i) {
        var ep = byId[s.episode];
        var ownTitle = s.titre && !(ep && s.titre === ep.title);
        return '<article class="short" data-video="' + esc(s.video) + '" data-title="' + esc(s.titre || 'Short Wolof Tech') + '">' +
          '<img src="https://i.ytimg.com/vi/' + esc(s.video) + '/hqdefault.jpg" alt="" width="480" height="360"' + (i ? ' loading="lazy"' : '') + '>' +
          '<div class="short-frame"></div>' +
          '<button class="short-tap" type="button" aria-label="Lire : ' + esc(s.titre || 'short ' + (i + 1)) + '"><span class="play-big">' + ICONS.play + '</span></button>' +
          '<div class="short-info"><span class="badge">Short ' + (i + 1) + ' / ' + list.length + '</span>' + (ownTitle ? '<p>' + esc(s.titre) + '</p>' : '') +
          (ep ? '<a class="short-ep" href="' + epUrl(ep) + '">' + esc(shortCode(ep)) + ' : ' + esc(ep.title) + '</a>' : '') + '</div>' +
          '<button class="short-sound" type="button" hidden>Activer le son</button></article>';
      }).join('') + '</div>' +
      (list.length > 1 ? '<div class="short-arrows"><button class="arrow" type="button" data-short-go="-1" aria-label="Short précédent">' + arrow('M5 15l7-7 7 7') + '</button>' +
        '<button class="arrow" type="button" data-short-go="1" aria-label="Short suivant">' + arrow('M5 9l7 7 7-7') + '</button></div>' +
        '<p class="short-hint" aria-hidden="true">' + arrow('M5 15l7-7 7 7') + 'Poussez vers le haut</p>' : '') +
      '</div>';
  }
  // Une couche transparente reste au-dessus du lecteur : sans elle, YouTube capte le geste et le fil ne défile plus.
  function initShorts() {
    document.querySelectorAll('[data-shorts]').forEach(function (root) {
      var feed = root.querySelector('.shorts-feed');
      var slides = Array.prototype.slice.call(root.querySelectorAll('.short'));
      var full = root.dataset.shorts === 'full';
      var started = full, muted = full, active = null;

      function send(slide, func) {
        var f = slide.querySelector('iframe');
        if (f && f.contentWindow) f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: [] }), 'https://www.youtube-nocookie.com');
      }
      function setLabel(slide) {
        var sound = slide.querySelector('.short-sound');
        sound.hidden = !slide.querySelector('iframe');
        sound.textContent = muted ? 'Activer le son' : 'Couper le son';
      }
      function start(slide) {
        Player.pause();
        var id = encodeURIComponent(slide.dataset.video);
        slide.querySelector('.short-frame').innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&mute=' + (muted ? 1 : 0) + '&controls=0&playsinline=1&rel=0&loop=1&playlist=' + id + '&enablejsapi=1&origin=' + encodeURIComponent(location.origin) + '" title="' + esc(slide.dataset.title) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" tabindex="-1"></iframe>';
        slide.classList.add('playing');
        slide.classList.remove('paused');
        setLabel(slide);
      }
      function stop(slide) {
        slide.querySelector('.short-frame').innerHTML = '';
        slide.classList.remove('playing', 'paused');
        setLabel(slide);
      }
      function activate(slide) {
        if (slide === active) return;
        if (active) stop(active);
        active = slide;
        if (started) start(slide);
      }
      var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) activate(en.target); });
      }, { root: feed, threshold: 0.6 });
      slides.forEach(function (s) { seen.observe(s); });
      function go(step) {
        var next = slides[Math.max(0, Math.min(slides.length - 1, slides.indexOf(active || slides[0]) + step))];
        feed.scrollTo({ top: next.offsetTop - slides[0].offsetTop });
      }
      root.addEventListener('click', function (ev) {
        var nav = ev.target.closest('[data-short-go]');
        if (nav) { go(Number(nav.dataset.shortGo)); return; }
        var slide = ev.target.closest('.short');
        if (!slide) return;
        if (ev.target.closest('.short-sound')) {
          muted = !muted;
          send(slide, muted ? 'mute' : 'unMute');
          setLabel(slide);
          return;
        }
        if (!ev.target.closest('.short-tap')) return;
        if (!slide.querySelector('iframe')) {
          started = true; muted = false; active = slide;
          start(slide);
        } else {
          send(slide, slide.classList.toggle('paused') ? 'pauseVideo' : 'playVideo');
        }
      });
      feed.addEventListener('keydown', function (ev) {
        if (ev.key === 'ArrowDown') { ev.preventDefault(); go(1); }
        if (ev.key === 'ArrowUp') { ev.preventDefault(); go(-1); }
      });
    });
  }
  function renderShorts() {
    // Avec ?e=, seulement les shorts de cet épisode ; sinon tous, du plus récent épisode au plus ancien.
    var param = (new URLSearchParams(location.search).get('e') || '').toUpperCase();
    var dateOf = function (s) { return byId[s.episode] ? byId[s.episode].date : ''; };
    var list = param ? shortsOf(param) : SHORTS.slice().sort(function (a, b) {
      var x = dateOf(a), y = dateOf(b);
      return x === y ? 0 : x < y ? 1 : -1;
    });
    document.getElementById('main').innerHTML = list.length
      ? '<h1 class="visually-hidden">Les shorts Wolof Tech</h1>' + shortsFeedHtml(true, list)
      : '<section class="page-hero"><div class="wrap"><h1>Shorts</h1><p class="lead">' + (param ? 'Pas encore de short pour cet épisode. <a href="shorts.html">Voir tous les shorts</a>' : 'Les prochains shorts arrivent bientôt.') + '</p></div></section>';
  }

  /* ---------- Banga, l'agent virtuel : répond aux visiteurs et retrouve les épisodes ---------- */
  // Tout se passe dans le navigateur : aucune question n'est envoyée au serveur.
  var ASK_STOP = ' a ai alors banga as au aussi aux avec avez avoir bien bonjour c ca ce cela ces cet cette cherche chercher comment comprendre d dans de des dis donne donner du elle elles en episode episodes est et etre explique expliquer fait faire hello il ils j je l la le les leur leurs m ma mais me mes moi mon montre montrer n ne nous on ont ou parle parlent parler parlez pas peut peux podcast pour pourquoi pouvez plus par qu que quel quelle quelles quels qui quoi recherche s sa salut savoir se ses si son sont stp sujet sujets sur svp t ta tes tres ton tous tout toute toutes trouve trouver tu un une veux voudrais aimerais apprendre vos votre vous woloftech wolof y ya lancer creer gagner utiliser fonctionne marche ligne tech techs technologie technologies '.split(' ').reduce(function (o, w) { if (w) o[w] = 1; return o; }, {});
  // Pour trouver un épisode même quand il emploie un autre mot que la question.
  var ASK_NEAR = {
    ia: ['intelligence artificielle', 'machine learning', 'chatgpt'], chatgpt: ['intelligence artificielle'], robot: ['robotique', 'intelligence artificielle'],
    satellite: ['starlink'], starlink: ['satellite'],
    pirate: ['cybersecurite', 'hacker', 'hacking'], piratage: ['cybersecurite', 'hacker', 'hacking'], hacker: ['cybersecurite', 'piratage'], arnaque: ['cybersecurite', 'fraude', 'escroquerie', 'cybercriminalite'], fraude: ['arnaque', 'cybersecurite', 'cybercriminalite'], securite: ['cybersecurite'], cyber: ['cybersecurite', 'cybercriminalite'],
    argent: ['mobile money', 'fintech', 'finance', 'banque', 'paiement', 'epargne'], banque: ['fintech', 'finance', 'bancaire', 'mobile money'], paiement: ['mobile money', 'fintech'], wave: ['mobile money', 'fintech'], orange: ['mobile money', 'telecom'], epargne: ['mobile money', 'finance'],
    startup: ['entrepreneuriat', 'entrepreneur', 'start up'], entreprise: ['entrepreneuriat', 'entrepreneur', 'startup'], entrepreneur: ['entrepreneuriat', 'startup'], business: ['entrepreneuriat', 'startup'],
    telephone: ['smartphone', 'mobile'], smartphone: ['telephone', 'mobile'], application: ['mobile', 'developpement'], appli: ['application', 'mobile'], site: ['web', 'internet'], internet: ['web', 'satellite', 'fibre', 'reseau'], nuage: ['cloud'], cloud: ['nuage'],
    code: ['developpement', 'programmation', 'developpeur'], coder: ['developpement', 'programmation', 'developpeur'], programmer: ['programmation', 'developpement'], programmation: ['developpement', 'developpeur'], informaticien: ['developpeur', 'informatique'],
    ordinateur: ['informatique', 'pc'], donnees: ['data', 'base de donnees'], data: ['donnees'], crypto: ['blockchain', 'bitcoin', 'cryptomonnaie'], bitcoin: ['blockchain', 'cryptomonnaie'], blockchain: ['bitcoin', 'cryptomonnaie'],
    environnement: ['ecologie', 'green', 'climat', 'dechets'], ecologie: ['environnement', 'green', 'climat'], climat: ['environnement', 'ecologie'], agriculture: ['agritech', 'agricole', 'agriculteur'], champ: ['agriculture', 'agricole'], sante: ['medecine', 'medical', 'hopital'], medecin: ['sante', 'medecine'],
    femme: ['femmes', 'filles', 'feminin'], fille: ['femmes', 'feminin'], ecole: ['education', 'enseignement', 'formation'], education: ['enseignement', 'ecole', 'formation'], etudiant: ['education', 'universite', 'formation'], formation: ['education', 'apprentissage'], emploi: ['travail', 'carriere', 'metier', 'recrutement'], travail: ['emploi', 'carriere', 'metier'], metier: ['emploi', 'carriere'], jeu: ['gaming', 'esport'], jeux: ['gaming', 'esport'], reseaux: ['facebook', 'tiktok', 'instagram', 'community manager']
  };
  var askIndex = null;
  function askHay(s) { return ' ' + norm(s).replace(/[^a-z0-9]+/g, ' ').trim() + ' '; }
  function askStem(w) { return w.length > 4 && /[sx]$/.test(w) ? w.slice(0, -1) : w; }
  function askWords(q) {
    return askHay(q).trim().split(' ').filter(function (w) { return w && !ASK_STOP[w]; }).map(askStem).filter(function (w, i, all) { return all.indexOf(w) === i; });
  }
  // Mot long : il compte aussi à l'intérieur d'un autre (« securite » dans « cybersecurite »).
  function askCount(hay, term) {
    var count = function (n) { return hay.split(n).length - 1; };
    if (term.indexOf(' ') !== -1 || term.length < 4) return count(' ' + term + ' ') + count(' ' + term + 's ');
    return term.length >= 6 ? count(term) : count(' ' + term);
  }
  function askBuild() {
    return EPISODES.map(function (e) {
      var guests = guestsOf(e), season = seasonInfo(e.season);
      return {
        e: e, title: askHay(e.title),
        who: askHay(guests.map(function (g) { return g.nom + ' ' + (g.role || ''); }).join(' ')),
        theme: askHay(season.titre + ' ' + guests.map(function (g) { return (SECTEURS.filter(function (s) { return s.id === g.secteur; })[0] || {}).nom || ''; }).join(' ')),
        text: askHay(e.description || e.summary || '')
      };
    });
  }
  function askSearch(q) {
    askIndex = askIndex || askBuild();
    var concepts = askWords(q).map(function (w) {
      return { word: w, terms: [[w, 1]].concat((ASK_NEAR[w] || []).map(function (t) { return [t, 0.7]; })) };
    });
    function points(row, c) {
      return c.terms.reduce(function (best, t) {
        var inText = askCount(row.text, t[0]);
        var value = (askCount(row.title, t[0]) ? 10 : 0) + (askCount(row.who, t[0]) ? 8 : 0) + (askCount(row.theme, t[0]) ? 3 : 0) + (inText ? 2 + Math.min(inText, 4) - 1 : 0);
        return Math.max(best, value * t[1]);
      }, 0);
    }
    // Un mot présent partout compte moins qu'un mot rare.
    concepts.forEach(function (c) {
      var found = askIndex.filter(function (row) { return points(row, c) > 0; }).length;
      c.rarity = Math.log((askIndex.length + 1) / (found + 1)) + 0.3;
    });
    var phrase = concepts.map(function (c) { return c.word; }).join(' ');
    var hits = askIndex.map(function (row) {
      var met = 0;
      var exact = concepts.length > 1 && [row.title, row.who, row.theme, row.text].some(function (h) { return askCount(h, phrase); });
      var score = concepts.reduce(function (t, c) {
        var p = points(row, c);
        if (p) met++;
        return t + p * c.rarity;
      }, 0);
      return { row: row, e: row.e, met: met, score: score * (exact ? 3 : 1) * (met === concepts.length ? 1.6 : 1) * (row.e.kind === 'annonce' ? 0.6 : 1) };
    }).filter(function (h) {
      return h.score > 0 && h.met >= Math.ceil(concepts.length / 2);
    }).sort(function (a, b) {
      return b.met - a.met || b.score - a.score || (a.e.date < b.e.date ? 1 : -1);
    });
    var bestMet = hits.length ? hits[0].met : 0, bestScore = hits.length ? hits[0].score : 0;
    hits = hits.filter(function (h) { return h.met === bestMet && h.score >= bestScore * 0.25; });
    return { concepts: concepts, hits: hits };
  }
  // La phrase de la description qui contient le sujet, sans les liens ni les coordonnées.
  function askExcerpt(e, concepts) {
    var parts = String(e.description || '').split(/\n+|(?<=[.!?…])\s+|\p{Extended_Pictographic}+/u).map(function (p) {
      return p.replace(/\s+/g, ' ').trim();
    }).filter(function (p) {
      return p.length > 40 && !/https?:|www\.|@|\d{2}[ .]?\d{3}[ .]?\d{2}|twitter|linkedin|facebook|instagram|tiktok|youtube/i.test(p);
    });
    var words = [];
    concepts.forEach(function (c) { c.terms.forEach(function (t) { words.push(t[0]); }); });
    var best = parts.filter(function (p) {
      var h = askHay(p);
      return words.some(function (w) { return askCount(h, w); });
    })[0] || e.summary || '';
    best = best.replace(/^[^\p{L}\d«"]+/u, '');
    return best.length > 190 ? best.slice(0, 187).replace(/\s+\S*$/, '') + '…' : best;
  }
  function bangaHitHtml(e, concepts) {
    return '<article class="banga-hit">' + thumbBtn(e) + '<div><span class="where">' + esc(shortCode(e)) + '</span>' +
      '<h3><a href="' + epUrl(e) + '">' + esc(e.title) + '</a></h3>' +
      '<p>' + esc(askExcerpt(e, concepts)) + '</p>' +
      '<div class="banga-acts"><a class="btn btn-main" href="' + epUrl(e) + '">Voir l\'épisode</a>' + miniListen(e) + '</div></div></article>';
  }
  // Les questions sur le podcast lui-même, avant toute recherche dans les épisodes.
  function bangaFaq(h) {
    var L = SITE.liens, A = SITE.animateur;
    var link = function (href, label) { return [href, label]; };
    if (/\b(qui es tu|tu es qui|qui etes vous|vous etes qui|t appelles|ton nom|c est quoi banga|qui est banga)\b/.test(h)) {
      return { text: 'Je suis Banga, l\'agent virtuel de Wolof Tech. Je réponds aux questions des visiteurs et je retrouve les épisodes qui parlent du sujet que vous cherchez.' };
    }
    if (/\bcombien\b.*\b(episodes?|invites?|saisons?)\b/.test(h)) {
      return { text: 'Wolof Tech compte ' + EPISODES.length + ' épisodes, ' + SAISONS.length + ' saisons et ' + INVITES.length + ' invités.', links: [link('episodes.html', 'Tous les épisodes')] };
    }
    if (/\b(qui (est|anime|presente|a cree)\b.*\b(animateur|auteur|createur|fondateur|podcast|wolof ?tech)|(animateur|createur|fondateur|auteur) du podcast)\b/.test(h)) {
      return { text: 'Wolof Tech est animé par ' + A.nom + ', que les auditeurs connaissent sous le nom d\'' + A.surnom + '.', links: [link('a-propos.html', 'Découvrir l\'auteur')] };
    }
    if (/\b(c est quoi|qu est ce que|parle moi de|presente moi)( le podcast)? (wolof ?tech|le podcast)\b/.test(h)) {
      return { text: 'Wolof Tech est le podcast qui démystifie la technologie et amplifie la culture numérique, en wolof, avec des experts invités. Il existe depuis juillet 2020.', links: [link('episodes.html', 'Tous les épisodes')] };
    }
    if (/\b(soutenir|soutien|faire un don|sponsoriser)\b/.test(h)) {
      return { text: 'Merci ! Votre soutien aide à produire de nouveaux épisodes.', links: [link(L.soutenir, 'Soutenir le podcast')] };
    }
    if (/\b(me contacter|vous contacter|te contacter|contacter|contact|joindre|numero de telephone|whatsapp|vos services|tes services|prestations?|inviter elibrahim|animer (un|mon|notre) (panel|debat|evenement))\b/.test(h)) {
      return { text: 'Conseil, animation de débats et accompagnement podcast : tout est présenté sur la page Services, avec les moyens de contact.', links: [link('services.html#contact', 'Voir les services')] };
    }
    if (/\b(ou|comment) (je peux |puis je |peut on |on peut )?(ecouter|regarder|suivre|m abonner|s abonner)\b/.test(h) && askWords(h.replace(/\b(ecouter|regarder|suivre|abonner)\b/g, '')).length === 0) {
      return { text: 'Tous les épisodes sont sur YouTube et Spotify. Vous pouvez aussi les écouter directement ici, sur le site.', links: [link(L.youtube, 'YouTube'), link(L.spotify, 'Spotify'), link('episodes.html', 'Sur le site')] };
    }
    return null;
  }
  function initBanga() {
    if (document.body.dataset.page === 'shorts') return;
    var face = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3v5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="20" cy="4" r="2.6" fill="var(--red)"/><rect x="6" y="9" width="28" height="23" rx="8" fill="currentColor"/><rect x="2" y="16" width="4" height="9" rx="2" fill="var(--green)"/><rect x="34" y="16" width="4" height="9" rx="2" fill="var(--green)"/><circle class="banga-eye" cx="14.5" cy="19" r="3.2" fill="var(--saffron)"/><circle class="banga-eye" cx="25.5" cy="19" r="3.2" fill="var(--saffron)"/><path d="M14 26c3.5 2.2 8.500 2.200 12 0" fill="none" stroke="var(--saffron)" stroke-width="2.2" stroke-linecap="round"/></svg>';
    var mic = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
    var send = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    var IDLE = 'Posez votre question…';
    var root = document.createElement('div');
    root.className = 'banga';
    root.innerHTML =
      '<button class="banga-open" type="button" aria-expanded="false" aria-controls="banga-panel" aria-label="Discuter avec Banga, l\'agent virtuel">' + face + '<span>Banga</span></button>' +
      '<section class="banga-panel" id="banga-panel" role="dialog" aria-label="Banga, agent virtuel de Wolof Tech" hidden>' +
      '<header class="banga-top">' + face + '<div><b>Banga</b><small>Agent virtuel de Wolof Tech</small></div>' +
      '<button class="banga-close" type="button" aria-label="Fermer Banga">' + ICONS.close + '</button></header>' +
      '<div class="banga-log" role="log" aria-live="polite"></div>' +
      '<form class="banga-form"><input type="text" name="q" maxlength="200" autocomplete="off" aria-label="Votre question" placeholder="' + IDLE + '">' +
      '<button class="banga-mic" type="button" aria-pressed="false" aria-label="Parler à Banga" title="Parler à Banga" hidden>' + mic + '</button>' +
      '<button class="banga-send" type="submit" aria-label="Envoyer" title="Envoyer">' + send + '</button></form>' +
      '<p class="banga-note" hidden>À l\'oral, votre voix passe par le service vocal de votre navigateur. Banga comprend le français.</p>' +
      '</section>';
    document.body.appendChild(root);
    var opener = root.querySelector('.banga-open'), panel = root.querySelector('.banga-panel'), log = root.querySelector('.banga-log');
    var form = root.querySelector('.banga-form'), input = form.q, micBtn = root.querySelector('.banga-mic');
    var KEY = 'wt-banga', PAGE = 3, last = null, started = false, history = [], rec = null;

    function add(cls, html) {
      var el = document.createElement('div');
      el.className = cls;
      el.innerHTML = html;
      log.appendChild(el);
      return el;
    }
    function say(text) { add('banga-msg bot', esc(text)); }
    function hush() { if (window.speechSynthesis) speechSynthesis.cancel(); }
    function speak(text) {
      if (!window.speechSynthesis) return;
      hush();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'fr-FR';
      speechSynthesis.speak(u);
    }
    function dropMore() { var m = log.querySelector('[data-more]'); if (m) m.remove(); }
    function showMore(spoken) {
      var page = last.hits.slice(last.shown, last.shown + PAGE);
      page.forEach(function (h) { log.insertAdjacentHTML('beforeend', bangaHitHtml(h.e, last.concepts)); });
      last.shown += page.length;
      Player.sync();
      if (last.shown < last.hits.length) add('banga-acts', '<button class="btn" type="button" data-ask-more>Voir d\'autres épisodes (' + (last.hits.length - last.shown) + ')</button>').dataset.more = '1';
      if (spoken && page[0]) speak('Je vous propose : ' + page[0].e.title);
    }
    function answer(q, spoken) {
      var h = askHay(q).trim();
      function reply(text) { say(text); if (spoken) speak(text); }
      if (/^(encore|autres?|la suite|suite|d autres|autre chose|encore d autres|montre m en d autres)( episodes?)?$/.test(h)) {
        if (last && last.shown < last.hits.length) { say('Voici la suite.'); showMore(spoken); }
        else reply(last ? 'C\'est tout ce que j\'ai trouvé sur ce sujet. Essayez avec un autre mot.' : 'Dites-moi d\'abord quel sujet vous intéresse.');
        return;
      }
      if (/\b(merci|jerejef|jerejeuf)\b/.test(h) && askWords(q.replace(/merci|jerejef|jerejeuf/gi, '')).length === 0) { reply('Avec plaisir ! Posez-moi une autre question quand vous voulez.'); return; }
      var faq = bangaFaq(h);
      if (faq) {
        reply(faq.text);
        if (faq.links) add('banga-acts', faq.links.map(function (l) {
          return '<a class="btn" href="' + esc(l[0]) + '"' + (/^https/.test(l[0]) ? ' target="_blank" rel="noopener"' : '') + '>' + esc(l[1]) + '</a>';
        }).join(''));
        return;
      }
      if (/\b(dernier|derniere|derniers|nouveau|nouvel|recent|recents)\b/.test(h) && /\bepisodes?\b/.test(h)) {
        var recent = EPISODES.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
        last = { concepts: [], hits: recent.slice(0, 9).map(function (e) { return { e: e }; }), shown: 0 };
        say('Voici les épisodes les plus récents.');
        showMore(spoken);
        return;
      }
      var found = askSearch(q);
      if (!found.concepts.length) { reply('Bonjour ! Dites-moi un sujet, un mot ou le nom d\'un invité, et je cherche l\'épisode qui en parle.'); return; }
      if (!found.hits.length) {
        last = null;
        reply('Je n\'ai trouvé aucun épisode qui parle clairement de « ' + q + ' ». Essayez un mot plus simple, ou parcourez tous les épisodes.');
        add('banga-acts', '<a class="btn" href="episodes.html">Tous les épisodes</a>');
        return;
      }
      last = { concepts: found.concepts, hits: found.hits, shown: 0 };
      say(found.hits.length === 1 ? 'J\'ai trouvé un épisode qui en parle.' : 'J\'ai trouvé ' + found.hits.length + ' épisodes qui en parlent. Voici les plus proches.');
      showMore(spoken);
    }
    function ask(q, spoken, replay) {
      q = q.trim();
      if (!q) return;
      hush();
      dropMore();
      var mine = add('banga-msg me', esc(q));
      answer(q, spoken);
      if (!replay) {
        history = history.concat(q).slice(-6);
        try { sessionStorage.setItem(KEY, JSON.stringify(history)); } catch (e) { /* conversation non conservée */ }
      }
      // La question reste en haut de la fenêtre : la réponse se lit juste en dessous.
      log.scrollTop = mine.offsetTop - 8;
    }
    function start() {
      if (started) return;
      started = true;
      say('Bonjour, je suis Banga ! Dites-moi un sujet et je vous amène aux épisodes qui en parlent.');
      add('banga-chips', ['Intelligence artificielle', 'Mobile Money', 'Se protéger des arnaques', 'Soutenir le podcast'].map(function (s) {
        return '<button class="chip" type="button" data-ask="' + esc(s) + '">' + esc(s) + '</button>';
      }).join(''));
      // La conversation suit le visiteur d'une page à l'autre.
      try { history = JSON.parse(sessionStorage.getItem(KEY)) || []; } catch (e) { history = []; }
      history.forEach(function (q) { ask(q, false, true); });
    }
    function setOpen(on) {
      panel.hidden = !on;
      opener.hidden = on;
      opener.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (on) {
        start();
        log.scrollTop = log.scrollHeight;
        // Sur téléphone, le clavier ne s'ouvre que si le visiteur touche le champ.
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) input.focus();
      } else {
        hush();
        if (rec) rec.abort();
        opener.focus();
      }
    }
    opener.addEventListener('click', function () { setOpen(true); });
    root.querySelector('.banga-close').addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !panel.hidden && !document.querySelector('dialog[open]')) setOpen(false);
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var q = input.value;
      input.value = '';
      ask(q, false);
    });
    log.addEventListener('click', function (ev) {
      var chip = ev.target.closest('[data-ask]');
      if (chip) ask(chip.dataset.ask, false);
      if (ev.target.closest('[data-ask-more]')) { dropMore(); showMore(false); }
    });
    window.addEventListener('pagehide', function () {
      if (rec) rec.abort();
      hush();
    });

    var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    micBtn.hidden = false;
    root.querySelector('.banga-note').hidden = false;
    function setListening(on) {
      micBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      input.placeholder = on ? 'Je vous écoute…' : IDLE;
    }
    micBtn.addEventListener('click', function () {
      hush();
      if (rec) { rec.stop(); return; }
      var heard = '', current = new Recognition();
      rec = current;
      current.lang = 'fr-FR';
      current.interimResults = true;
      current.onresult = function (ev) {
        heard = Array.prototype.map.call(ev.results, function (r) { return r[0].transcript; }).join(' ');
        input.value = heard;
      };
      current.onerror = function (ev) {
        heard = '';
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') say('Je n\'ai pas accès au micro. Autorisez-le dans votre navigateur, ou écrivez votre question.');
        else if (ev.error === 'no-speech') say('Je n\'ai rien entendu. Réessayez, ou écrivez votre question.');
        else if (ev.error !== 'aborted') say('Le service vocal ne répond pas. Vous pouvez écrire votre question.');
        log.scrollTop = log.scrollHeight;
      };
      current.onend = function () {
        rec = null;
        setListening(false);
        input.value = '';
        if (heard.trim()) ask(heard, true);
      };
      try { current.start(); setListening(true); }
      catch (err) { rec = null; say('Le micro n\'a pas pu démarrer. Vous pouvez écrire votre question.'); }
    });
  }

  /* ---------- Panels et invitations, hors du studio ---------- */
  function panelCard(p) {
    var where = [p.lieu, p.date].filter(Boolean).join(', ');
    var inner = (p.image ? '<img src="' + esc(p.image) + '" alt="" loading="lazy" width="640" height="420">' : '') +
      '<div class="panel-txt">' + (p.type ? '<span class="tag">' + esc(p.type) + '</span>' : '') + '<h3>' + esc(p.titre) + '</h3>' +
      (where ? '<p class="soft">' + esc(where) + '</p>' : '') + (p.description ? '<p class="soft">' + esc(p.description) + '</p>' : '') + '</div>';
    return p.lien ? '<a class="panel-card" href="' + esc(p.lien) + '" target="_blank" rel="noopener">' + inner + '</a>' : '<article class="panel-card">' + inner + '</article>';
  }
  // Sur l'accueil : les 10 plus récents en carrousel, et un lien vers la page qui les montre tous.
  function panelsHtml() {
    if (!PANELS.length) return '';
    var arrow = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>'; };
    return '<section class="block" data-gallery aria-label="Panels et invitations"><div class="wrap"><div class="head-row"><div><h2>Panels et invitations</h2>' +
      '<p class="soft panels-lead">En dehors du podcast : les invitations, les panels animés et les événements où j\'ai pris le micro.</p></div>' +
      '<div class="arrows"><button class="arrow" type="button" data-prev aria-label="Panels précédents">' + arrow('M15 5l-7 7 7 7') + '</button>' +
      '<button class="arrow" type="button" data-next aria-label="Panels suivants">' + arrow('M9 5l7 7-7 7') + '</button></div></div></div>' +
      '<div class="track panel-track" tabindex="0" role="group" aria-label="Panels, faites défiler pour voir la suite">' + PANELS.slice(0, 10).map(panelCard).join('') + '</div>' +
      '<div class="wrap btn-row panels-more"><a class="btn btn-main" href="panels.html">Voir tous les panels et invitations (' + PANELS.length + ')</a>' +
      '<a class="btn" href="services.html#panel">Besoin de ma touche personnelle pour votre événement ?</a></div></section>';
  }
  function renderPanels() {
    document.getElementById('main').innerHTML =
      '<section class="page-hero with-photo"><img src="assets/photos/panels-hero.jpg" alt="" width="1600" height="1066" style="object-position:50% 45%"><div class="wrap"><h1>Panels et invitations</h1><p class="lead">En dehors du podcast : les invitations, les panels animés, les formations et les événements où j\'ai pris le micro.</p></div></section>' +
      '<section class="block" style="padding-top:clamp(30px,4vw,56px)"><div class="wrap">' +
      (PANELS.length ? '<div class="panels">' + PANELS.map(panelCard).join('') + '</div>' : '<p class="soft">Les premières invitations arrivent bientôt.</p>') +
      '<div class="btn-row panels-more"><a class="btn btn-main" href="services.html#panel">Besoin de ma touche personnelle pour votre événement ?</a></div></div></section>';
  }

  /* ---------- Services ---------- */
  function renderServices() {
    var A = SITE.animateur;
    var contacts = [];
    if (CONTACT.telephone) contacts.push(['tel:' + CONTACT.telephone.replace(/[^\d+]/g, ''), 'Téléphone', CONTACT.telephone]);
    if (CONTACT.whatsapp) contacts.push(['https://wa.me/' + CONTACT.whatsapp.replace(/\D/g, ''), 'WhatsApp', CONTACT.whatsapp]);
    if (CONTACT.email) contacts.push(['mailto:' + CONTACT.email, 'E-mail', CONTACT.email]);
    // Le bouton mène au moyen de contact le plus direct parmi ceux renseignés.
    var direct = contacts.filter(function (c) { return c[1] === 'WhatsApp'; })[0] || contacts.filter(function (c) { return c[1] === 'E-mail'; })[0] || contacts[0];
    var talk = direct ? direct[0] : SITE.liens.whatsapp;
    var external = function (href) { return /^https/.test(href) ? ' target="_blank" rel="noopener"' : ''; };
    // « Libellé : texte » : le libellé ressort en gras.
    function labelled(t) {
      var i = t.indexOf(' : ');
      return i > 0 && i < 70 ? '<b>' + esc(t.slice(0, i)) + '&nbsp;:</b> ' + esc(t.slice(i + 3)) : esc(t);
    }
    function icon(d) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
    }
    var ICON = {
      conseil: icon('<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12.500h5"/>'),
      panel: icon('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/>'),
      podcast: icon('<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.500"/><rect x="17" y="14" width="4" height="6" rx="1.500"/>')
    };
    var check = icon('<path d="M5 12.500l4.500 4.500L19 7.500"/>');
    var approach = [
      ['Ancrage culturel', 'Utiliser les langues locales comme vecteurs de transmission de la connaissance pour briser les barrières de la complexité.'],
      ['Pédagogie de terrain', 'Traduire des concepts abstraits (numérique, finance, innovation) en exemples concrets du quotidien, accessibles à tous les publics.'],
      ['Standard professionnel', 'Allier rigueur technique, maîtrise de la production audiovisuelle et sens du storytelling.']
    ];
    var infos = [['Langues', 'Wolof et français'], ['Podcast', 'Wolof Tech, depuis juillet 2020']];
    document.getElementById('main').innerHTML =
      '<section class="sv-hero"><img class="sv-hero-photo" src="assets/photos/services-hero.jpg" alt="' + esc(A.nom) + ' au micro dans son studio, casque sur les oreilles" width="941" height="1237" fetchpriority="high"><div class="wrap"><div class="sv-hero-txt">' +
      '<p class="sv-kicker">' + esc(A.nom) + '</p><h1>Faire comprendre l\'innovation à tous, sans barrière.</h1>' +
      '<p class="sv-lead">Fort de plusieurs années d\'expérience dans la médiation technologique et la production audiovisuelle, j\'accompagne les entreprises, institutions et organisations à vulgariser leurs produits, services et savoirs pour toucher toutes les communautés, y compris le monde rural et les publics non scolarisés.</p>' +
      '<div class="btn-row"><a class="btn sv-main" href="#contact">Discutons de votre projet</a><a class="btn" href="#services">Voir mes services</a></div>' +
      '<ul class="sv-stats"><li><b data-count="' + EPISODES.length + '">' + EPISODES.length + '</b> épisodes</li><li><b data-count="' + INVITES.length + '">' + INVITES.length + '</b> invités</li><li><b data-count="' + totalHours() + '">' + totalHours() + '</b> heures de contenus</li></ul>' +
      '</div></div></section>' +

      '<section class="sv-sec"><div class="wrap sv-about"><img class="sv-fade" src="assets/photos/services-portrait.jpg" alt="Portrait de ' + esc(A.nom) + ' au micro" width="1122" height="1108" loading="lazy">' +
      '<div class="sv-fade"><p class="sv-kicker">À propos</p><h2>Rendre la technologie compréhensible par tous</h2><p class="sv-text">' + esc(A.bio[0]) + '</p>' +
      '<ul class="sv-checks">' + ['Médiation technologique', 'Production audiovisuelle', 'Transmission en langues locales', 'Animation de débats'].map(function (t) { return '<li>' + check + esc(t) + '</li>'; }).join('') + '</ul>' +
      '<dl class="sv-info">' + infos.map(function (x) { return '<div><dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('') + '</dl></div></div></section>' +

      '<section class="sv-sec sv-alt" id="services"><div class="wrap"><div class="sv-head"><p class="sv-kicker">Mes services</p><h2>Ce que je peux faire pour vous</h2></div>' +
      '<div class="sv-cards">' + SERVICES.map(function (s) {
        return '<article class="sv-card" id="' + esc(s.id) + '"><span class="sv-icon">' + (ICON[s.id] || ICON.conseil) + '</span><h3>' + esc(s.titre) + '</h3>' +
          '<dl><dt>Pour qui&nbsp;?</dt><dd>' + esc(s.pourQui) + '</dd><dt>Le problème résolu</dt><dd>' + esc(s.probleme) + '</dd><dt>' + esc(s.solutionTitre) + '</dt></dl>' +
          '<ul>' + s.solution.map(function (l) { return '<li>' + labelled(l) + '</li>'; }).join('') + '</ul></article>';
      }).join('') + '</div></div></section>' +

      '<section class="sv-sec"><div class="wrap"><div class="sv-head"><p class="sv-kicker">Mon approche</p><h2>Une méthodologie unique basée sur l\'inclusion et la simplicité</h2></div>' +
      '<div class="sv-steps">' + approach.map(function (a) {
        return '<div class="sv-card sv-step"><h3>' + esc(a[0]) + '</h3><p>' + esc(a[1]) + '</p></div>';
      }).join('') + '</div></div></section>' +

      (PANELS.length ? '<section class="sv-sec sv-alt"><div class="wrap"><div class="sv-head"><p class="sv-kicker">Réalisations</p><h2>Sur scène et sur le terrain</h2></div>' +
        '<div class="sv-works">' + PANELS.slice(0, 6).map(function (p) {
          var where = [p.lieu, p.date].filter(Boolean).join(', ');
          var inner = (p.image ? '<img src="' + esc(p.image) + '" alt="" loading="lazy" width="640" height="420">' : '') + '<div>' + (p.type ? '<span>' + esc(p.type) + '</span>' : '') + '<h3>' + esc(p.titre) + '</h3>' + (where ? '<p>' + esc(where) + '</p>' : '') + '</div>';
          return p.lien ? '<a class="sv-card sv-work" href="' + esc(p.lien) + '" target="_blank" rel="noopener">' + inner + '</a>' : '<article class="sv-card sv-work">' + inner + '</article>';
        }).join('') + '</div></div></section>' : '') +

      '<section class="sv-cta" id="contact"><img src="assets/photos/table.jpg" alt="" loading="lazy" width="1400" height="788"><div class="wrap"><h2>Vous avez un projet, un produit à faire comprendre ou un événement à propulser&nbsp;?</h2>' +
      '<a class="btn sv-main" href="' + esc(talk) + '"' + external(talk) + '>Discutons de votre projet</a>' +
      (contacts.length
        ? '<ul class="sv-contacts">' + contacts.map(function (c) {
            return '<li><a href="' + esc(c[0]) + '"' + external(c[0]) + '><small>' + c[1] + '</small>' + esc(c[2]) + '</a></li>';
          }).join('') + '</ul>'
        : '<p>Mes coordonnées seront bientôt affichées ici. En attendant, retrouvez-moi sur la chaîne WhatsApp.</p>') +
      '</div></section>';
    if (location.hash) scrollToHash();
  }

  /* ---------- Animations : rien n'est masqué si le visiteur préfère réduire les mouvements ---------- */
  function initMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var targets = '.platforms, .latest > *, .head-row, .vid-card, .more-row, .facts .why, .gallery-head, .track, .panel-card, .support-box, .sv-fade, .sv-card, .duo > *, .index li, .join, .season, .people-sec h2, .person, .bio, .bio-socials, .mosaic img, .comments .wrap, .ep-video, .audio-strip, .ep-layout > *';
    var rise = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        rise.unobserve(en.target);
        en.target.classList.add('in');
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll(targets).forEach(function (el) {
      var rank = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--d', (rank % 4) * 70 + 'ms');
      el.classList.add('reveal');
      // Une fois apparu, l'élément retrouve ses propres effets de survol.
      el.addEventListener('animationend', function done(ev) {
        if (ev.target !== el) return;
        el.removeEventListener('animationend', done);
        el.classList.remove('reveal', 'in');
      });
      rise.observe(el);
    });

    var counters = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        counters.unobserve(en.target);
        var el = en.target, end = Number(el.dataset.count), begin = performance.now();
        // La largeur finale reste réservée : le texte autour ne bouge pas pendant le comptage.
        el.style.minWidth = el.offsetWidth + 'px';
        (function tick(now) {
          var p = Math.min(1, (now - begin) / 1400);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
          else el.style.minWidth = '';
        })(begin);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(function (el) { counters.observe(el); });

    // Sur l'accueil, les cartes flottantes suivent légèrement la souris.
    var hero = document.querySelector('.hero');
    if (hero && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var frame = 0;
      hero.addEventListener('pointermove', function (ev) {
        if (frame) return;
        frame = requestAnimationFrame(function () {
          frame = 0;
          var box = hero.getBoundingClientRect();
          hero.style.setProperty('--mx', ((ev.clientX - box.left) / box.width - 0.5).toFixed(3));
          hero.style.setProperty('--my', ((ev.clientY - box.top) / box.height - 0.5).toFixed(3));
        });
      });
      hero.addEventListener('pointerleave', function () {
        hero.style.setProperty('--mx', 0);
        hero.style.setProperty('--my', 0);
      });
    }
  }

  /* ---------- En-tête : bande transparente au défilement et menu du téléphone ---------- */
  function initHeader() {
    var head = document.querySelector('.site-head'), btn = head.querySelector('.menu-btn');
    function onScroll() { head.classList.toggle('scrolled', window.scrollY > 12); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    function setMenu(open) {
      head.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    }
    btn.addEventListener('click', function () { setMenu(!head.classList.contains('menu-open')); });
    document.addEventListener('click', function (ev) {
      if (head.classList.contains('menu-open') && !head.contains(ev.target)) setMenu(false);
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && head.classList.contains('menu-open')) { setMenu(false); btn.focus(); }
    });
    head.querySelector('.nav').addEventListener('click', function (ev) {
      if (ev.target.closest('a')) setMenu(false);
    });
    window.matchMedia('(min-width: 761px)').addEventListener('change', function (ev) {
      if (ev.matches) setMenu(false);
    });
  }

  /* ---------- Gabarit commun ---------- */
  function renderChrome() {
    var page = document.body.dataset.page;
    var links = [['episodes', 'episodes.html', 'Épisodes'], ['shorts', 'shorts.html', 'Shorts'], ['communaute', 'communaute.html', 'Communauté'], ['services', 'services.html', 'Services'], ['auteur', 'a-propos.html', 'Host']];
    document.getElementById('head').innerHTML =
      '<a class="skip" href="#main">Aller au contenu</a>' +
      '<header class="site-head"><div class="wrap">' +
      // Sur l'accueil, le mot WolofTech laisse la place au logo dès que la page défile.
      '<a class="brand' + (page === 'accueil' ? ' brand-home' : '') + '" href="index.html" aria-label="Podcast Wolof Tech, accueil"><span class="brand-word" aria-hidden="true">WOLOF TECH</span><img src="assets/logo.png" alt="" width="500" height="500"></a>' +
      '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Ouvrir le menu"><span></span><span></span><span></span></button>' +
      '<nav class="nav" id="site-nav" aria-label="Navigation principale">' + links.map(function (l) {
        return '<a href="' + l[1] + '"' + (page === l[0] ? ' aria-current="page"' : '') + '>' + l[2] + '</a>';
      }).join('') + '</nav></div></header>';
    var L = SITE.liens;
    document.getElementById('foot').innerHTML =
      '<footer class="site-foot"><div class="wrap">' +
      '<img src="assets/logo.png" alt="" width="500" height="500" loading="lazy">' +
      '<div><ul class="foot-links">' +
      '<li><a href="episodes.html">Épisodes</a></li><li><a href="shorts.html">Shorts</a></li><li><a href="communaute.html">Communauté</a></li><li><a href="services.html">Services</a></li><li><a href="a-propos.html">Host</a></li>' +
      '<li><a href="' + L.whatsapp + '" target="_blank" rel="noopener">Chaîne WhatsApp</a></li>' +
      '<li><a href="' + L.soutenir + '" target="_blank" rel="noopener">Soutenir le podcast</a></li></ul>' +
      '<p>Wolof Tech, une production de la Maison du Podcast.</p></div>' +
      '<div class="socials">' + [['youtube', L.youtube, 'YouTube'], ['spotify', L.spotify, 'Spotify'], ['linkedin', L.linkedin, 'LinkedIn'], ['tiktok', L.tiktok, 'TikTok'], ['x', L.x, 'X'], ['facebook', L.facebook, 'Facebook'], ['rss', L.rss, 'Flux RSS']].filter(function (s) { return s[1]; }).map(function (s) {
        return '<a class="social" href="' + esc(s[1]) + '" target="_blank" rel="noopener" aria-label="Wolof Tech sur ' + s[2] + '" title="' + s[2] + '">' + ICONS[s[0]] + '</a>';
      }).join('') + '</div></div></footer>';
  }

  /* ---------- Accueil ---------- */
  function renderHome() {
    var sorted = EPISODES.slice().sort(function (a, b) { return b.date < a.date ? -1 : 1; });
    var latest = sorted[0];
    var recent = sorted.filter(function (e) { return e.kind === 'episode' && e.season !== 0 && e !== latest; }).slice(0, 6);
    var L = SITE.liens, A = SITE.animateur;
    var guests = guestsOf(latest), who = guests.map(function (g) { return g.nom; }).join(', ');
    var teaser = (SITE.teasers || {})[latest.id];

    function watchLatest(label) {
      return latest.video
        ? '<button class="btn btn-main" type="button" data-watch="' + esc(latest.video) + '" data-title="' + esc(latest.title) + '">' + label + '</button>'
        : '<a class="btn btn-main" href="' + epUrl(latest) + '">Écouter le dernier épisode</a>';
    }
    var latestShorts = shortsOf(latest.id);
    var teaserHtml = latestShorts.length ? shortsFeedHtml(false, latestShorts) : !teaser && !latest.video
      ? '<div class="teaser"><img src="' + esc(latest.image) + '" alt=""></div>'
      : teaser
      ? '<div class="teaser"><button type="button" data-watch="' + esc(teaser) + '" data-tall="1" data-title="' + esc('Teaser : ' + latest.title) + '" aria-label="Regarder le teaser : ' + esc(latest.title) + '">' +
        '<img src="https://i.ytimg.com/vi/' + esc(teaser) + '/hqdefault.jpg" alt="" loading="lazy" data-fallback="' + esc(latest.image) + '"><span class="badge">Teaser</span><span class="play-big">' + ICONS.play + '</span></button></div>'
      : '<div class="teaser"><button type="button" data-watch="' + esc(latest.video) + '" data-title="' + esc(latest.title) + '" aria-label="Regarder : ' + esc(latest.title) + '">' +
        '<img src="https://i.ytimg.com/vi/' + esc(latest.video) + '/maxresdefault.jpg" alt="" loading="lazy" data-fallback="' + esc(latest.image) + '"><span class="play-big">' + ICONS.play + '</span></button></div>';

    document.getElementById('main').innerHTML =
      '<section class="hero"><div class="wrap"><div>' +
      '<h1>La tech <em>pour tous</em></h1>' +
      '<p class="lead">Dans le podcast WolofTech, nous démystifions la technologie et amplifions la culture numérique.</p>' +
      '<div class="btn-row">' + watchLatest('Regarder le dernier épisode') +
      '<a class="btn" href="episodes.html">Tous les épisodes</a></div></div>' +
      '<div class="stage"><img src="assets/photos/hero-1600.jpg" alt="' + esc(A.nom) + ' au micro dans le studio Wolof Tech, avec le bureau, l\'interface audio et les documents de l\'émission" width="1600" height="1067" fetchpriority="high">' +
      '<img class="stage-logo" src="assets/logo.png" alt="Logo du podcast Wolof Tech" width="500" height="500">' +
      (guests.length ? '<a class="guest-card" href="' + epUrl(latest) + '"><img src="' + esc(latest.image) + '" alt="" width="58" height="58"><div><b>' + esc(guests[0].nom) + '</b><span>Invité du dernier épisode</span><u>Voir l\'épisode</u></div></a>' : '') +
      '<div class="pill">' + playBtn(latest) + waveHtml(latest, 34) + '</div>' +
      '</div></div></section>' +

      '<div class="wrap"><div class="platforms"><p>Écoutez et abonnez-vous</p><div>' +
      '<a href="' + L.youtube + '" target="_blank" rel="noopener">' + ICONS.youtube + 'YouTube</a>' +
      '<a href="' + L.spotify + '" target="_blank" rel="noopener">' + ICONS.spotify + 'Spotify</a>' +
      '<a href="' + L.rss + '" target="_blank" rel="noopener">' + ICONS.rss + 'Flux RSS</a></div></div></div>' +


      '<section class="block"><div class="wrap latest' + (teaser || latestShorts.length ? '' : ' wide') + '">' + teaserHtml + '<div>' +
      '<span class="kicker">Dernier épisode, ' + esc(code(latest).toLowerCase()) + '</span>' +
      '<h2>' + esc(latest.title) + '</h2>' +
      (guests.length ? '<div class="tags">' + guests.map(function (g) { return '<a class="tag" href="' + guestLink(g) + '">' + esc(g.nom) + '</a>'; }).join('') + '</div>' : '') +
      '<p class="sum">' + esc(latest.summary) + '</p>' +
      '<div class="btn-row">' + watchLatest('Regarder l\'épisode, ' + esc(formatDuration(latest))) +
      '<a class="btn" href="' + epUrl(latest) + '">Détails et audio</a></div>' +
      '</div></div></section>' +

      '<section class="block" style="padding-top:0"><div class="wrap"><div class="head-row"><h2>Les derniers épisodes en vidéo</h2><a class="btn" href="' + L.youtube + '" target="_blank" rel="noopener">' + ICONS.youtube + 'La chaîne YouTube</a></div>' +
      '<div class="vid-grid">' + recent.map(vidCard).join('') + '</div>' +
      '<div class="more-row"><a class="btn btn-main" href="episodes.html">Voir plus</a></div></div></section>' +

      tickerHtml() +

      '<section class="on-saffron facts"><div class="wrap">' +
      '<p class="count"><span data-count="' + EPISODES.length + '">' + EPISODES.length + '</span> épisodes, <span data-count="' + INVITES.length + '">' + INVITES.length + '</span> invités et <span data-count="' + totalHours() + '">' + totalHours() + '</span> heures de tech en wolof.</p>' +
      '<p class="why">Depuis juillet 2020, avec une conviction : le wolof peut être une langue d\'enseignement et de communication pour accéder à l\'information et aux nouvelles technologies.</p>' +
      '</div></section>' +

      galleryHtml('Dans le studio et sur le terrain', GALLERY) +

      '<section class="support"><div class="wrap"><div class="support-box"><div><h2>Soutenir le podcast</h2>' +
      '<p>Votre soutien aide à produire de nouveaux épisodes et à garder la tech accessible à tous, en wolof.</p></div>' +
      '<a class="btn btn-main" href="' + L.soutenir + '" target="_blank" rel="noopener">Soutenir le podcast</a></div></div></section>' +

      panelsHtml() +

      '<section class="block"><div class="wrap duo">' +
      '<img class="photo" src="assets/photos/panel.jpg" alt="Quatre personnes en discussion sur une terrasse, badges autour du cou" loading="lazy">' +
      '<div><h2>' + INVITES.length + ' personnes sont passées au micro</h2>' +
      '<p class="soft">Développeurs, chercheuses, entrepreneurs, responsables d\'institutions : retrouvez-les par secteur d\'activité, avec leurs contacts.</p>' +
      '<div class="chips">' + SECTEURS.slice(0, 6).map(function (s) {
        return '<a class="chip" href="communaute.html#secteur-' + s.id + '">' + esc(s.nom) + '</a>';
      }).join('') + '</div><a class="btn btn-main" href="communaute.html">Voir toute la communauté</a></div>' +
      '</div></section>' +

      '<section class="block" style="padding-top:0"><div class="wrap"><h2 style="margin-bottom:clamp(22px,3vw,38px)">' + SAISONS.length + ' saisons, un sujet à la fois</h2>' +
      '<ul class="index">' + seasonOrder().map(function (s) {
        return '<li><a href="episodes.html#saison-' + s.numero + '"><b aria-hidden="true">' + (s.numero || 'Sp') + '</b>' +
          '<span class="t">' + esc(s.titre.replace('Série spéciale : ', 'Spécial : ')) + '<span class="visually-hidden"> (' + (s.numero ? 'saison ' + s.numero : 'série spéciale') + ')</span></span>' +
          '<span class="n">' + seasonEpisodes(s.numero).length + ' ép.</span></a></li>';
      }).join('') + '</ul></div></section>' +

      '<section class="block" style="padding-top:0"><div class="wrap duo">' +
      '<div><h2>' + esc(A.nom) + '</h2><p class="soft" style="font-size:1.15rem">' + esc(A.bio[0]) + '</p>' +
      '<a class="btn" href="a-propos.html">Découvrir l\'auteur</a></div>' +
      '<img class="photo" src="assets/photos/auteur.jpg" alt="Portrait de ' + esc(A.nom) + ' dans le studio" loading="lazy" width="1100" height="733">' +
      '</div></section>' +

      '<section style="padding-bottom:clamp(40px,6vw,80px)"><div class="wrap"><div class="join"><div class="txt">' +
      '<h2>Ne ratez aucun épisode</h2><p>Abonnez-vous à la chaîne YouTube et rejoignez la chaîne WhatsApp pour voir les épisodes en avant-première.</p>' +
      '<div class="btn-row"><a class="btn btn-main" href="' + L.youtube + '" target="_blank" rel="noopener">' + ICONS.youtube + 'S\'abonner sur YouTube</a>' +
      '<a class="btn" href="' + L.whatsapp + '" target="_blank" rel="noopener">Rejoindre sur WhatsApp</a></div></div>' +
      '<img src="assets/photos/banniere.jpg" alt="" loading="lazy" width="1100" height="733"></div></div></section>';
  }

  // Bandeau défilant : la liste est doublée pour que la boucle ne se voie pas.
  function tickerHtml() {
    var items = SECTEURS.map(function (s) { return '<span>' + esc(s.nom) + '</span>'; }).join('');
    return '<div class="ticker" aria-hidden="true"><div>' + items + items + '</div></div>';
  }

  /* ---------- Épisodes par saison ---------- */
  function renderEpisodes() {
    var order = seasonOrder();
    var hero = '<section class="page-hero with-photo"><img src="assets/photos/table.jpg" alt="" width="1400" height="788"><div class="wrap">' +
      '<h1>Tous les épisodes</h1><p class="lead">' + SAISONS.length + ' saisons et ' + EPISODES.length + ' épisodes, chacun en audio et en vidéo.</p></div></section>';

    var tools = '<div class="tools"><div class="wrap"><div class="line">' +
      '<label class="visually-hidden" for="q">Rechercher un épisode ou un invité</label>' +
      '<input id="q" class="search" type="search" placeholder="Chercher un sujet ou un invité">' +
      '<label class="visually-hidden" for="jump">Aller à une saison</label>' +
      '<select id="jump" class="jump"><option value="">Aller à une saison</option>' + order.map(function (s) {
        return '<option value="saison-' + s.numero + '">' + (s.numero ? 'Saison ' + s.numero : 'Série spéciale') + '</option>';
      }).join('') + '</select></div></div></div>';

    var body = order.map(function (s, i) {
      var eps = seasonEpisodes(s.numero);
      return '<details class="season" id="saison-' + s.numero + '"' + (i === 0 ? ' open' : '') + '>' +
        '<summary><div class="num" aria-hidden="true">' + (s.numero || 'Sp') + '</div><div>' +
        '<p class="count">' + (s.numero ? 'Saison ' + s.numero : 'Hors saison') + ', ' + eps.length + ' épisodes</p>' +
        '<h2>' + esc(s.titre) + '</h2><p class="desc">' + esc(s.description) + '</p>' + sponsorHtml(s) + '</div>' + ICONS.caret + '</summary>' +
        '<ol class="ep-list" reversed>' + eps.map(row).join('') + '</ol></details>';
    }).join('');

    document.getElementById('main').innerHTML = hero + tools + '<div class="wrap" style="padding-bottom:60px">' + body + '<p class="empty" id="none" hidden>Aucun épisode ne correspond à cette recherche. Essayez un autre mot ou le nom d\'un invité.</p></div>';

    function row(e) {
      var hay = norm(e.title + ' ' + e.summary + ' ' + guestNames(e));
      var tags = guestsOf(e).map(function (g) { return '<span class="tag">' + esc(g.nom) + '</span>'; }).join('');
      return '<li class="ep-row" data-hay="' + esc(hay) + '">' + thumbBtn(e) + '<div>' +
        '<span class="where">' + esc(code(e)) + '</span><h3><a href="' + epUrl(e) + '">' + esc(e.title) + '</a></h3>' +
        (tags ? '<div class="tags">' + tags + '</div>' : '') + '</div>' +
        '<div class="side-info"><span>' + esc(formatDate(e.date)) + '</span>' + miniListen(e) + '</div></li>';
    }

    var q = document.getElementById('q'), none = document.getElementById('none');
    var seasons = Array.prototype.slice.call(document.querySelectorAll('.season'));
    // Le chargement différé ne se déclenche pas toujours dans une saison qu'on vient d'ouvrir.
    seasons.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) d.querySelectorAll('img').forEach(function (i) { i.loading = 'eager'; });
      });
    });
    q.addEventListener('input', function () {
      var v = norm(q.value.trim()), any = false;
      seasons.forEach(function (d) {
        var hits = 0;
        d.querySelectorAll('.ep-row').forEach(function (li) {
          var ok = !v || li.dataset.hay.indexOf(v) !== -1;
          li.style.display = ok ? '' : 'none';
          if (ok) hits++;
        });
        d.style.display = hits ? '' : 'none';
        if (hits) any = true;
        d.open = v ? hits > 0 : d === seasons[0];
      });
      none.hidden = any;
    });

    function openTarget(id) {
      var el = id && document.getElementById(id);
      if (el) { el.open = true; el.scrollIntoView(); }
    }
    document.getElementById('jump').addEventListener('change', function () { openTarget(this.value); });
    if (location.hash) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) target.open = true;
      scrollToHash();
    }
    window.addEventListener('hashchange', function () { openTarget(location.hash.slice(1)); });
  }

  function sponsorHtml(s) {
    if (!s.sponsors || !s.sponsors.length) return '';
    return '<p class="sponsors">Sponsors : ' + s.sponsors.map(function (p) {
      return p.url ? '<a class="tag" href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.nom) + '</a>' : '<span class="tag">' + esc(p.nom) + '</span>';
    }).join(' ') + '</p>';
  }

  /* ---------- Page d'un épisode ---------- */
  function renderEpisode() {
    var param = new URLSearchParams(location.search).get('e') || '';
    var e = byId[param.toUpperCase()];
    var main = document.getElementById('main');
    if (!e) {
      main.innerHTML = '<section class="page-hero"><div class="wrap"><h1>Épisode introuvable</h1><p class="lead">Ce lien ne correspond à aucun épisode. <a href="episodes.html">Voir tous les épisodes</a></p></div></section>';
      return;
    }
    document.title = e.title + ' | Wolof Tech';
    var s = seasonInfo(e.season);
    var guests = guestsOf(e);
    var list = seasonEpisodes(e.season);
    var idx = list.indexOf(e);
    var newer = list[idx - 1], older = list[idx + 1];
    var epShorts = shortsOf(e.id);
    var epPhotos = EPISODE_PHOTOS[e.id] || [];

    main.innerHTML =
      '<div class="wrap"><div class="ep-title">' +
      '<a class="where" href="episodes.html#saison-' + e.season + '">' + esc(code(e)) + '</a>' +
      '<h1>' + esc(e.title) + '</h1>' +
      (guests.length ? '<div class="tags">' + guests.map(function (g) { return '<a class="tag" href="' + guestLink(g) + '">' + esc(g.nom) + '</a>'; }).join('') + '</div>' : '') +
      '</div>' +
      (e.video ? '<div class="ep-video">' + videoHtml(e) + '</div>' : '') +
      '<div class="audio-strip"><p>Version audio<span class="ep-links"><span>' + esc(formatDate(e.date)) + '</span>' +
      '<a href="' + esc(e.spotify) + '" target="_blank" rel="noopener">Ouvrir sur Spotify</a>' +
      (e.video ? '<a href="https://www.youtube.com/watch?v=' + esc(e.video) + '" target="_blank" rel="noopener">Ouvrir sur YouTube</a>' : '') + '</span></p>' +
      '<div class="main-player">' + playBtn(e) + waveHtml(e, 110) + '<span class="time" data-time="' + e.id + '"></span></div></div></div>' +

      '<div class="wrap block ep-layout" style="padding-top:clamp(30px,4vw,52px)"><div class="ep-text" style="margin-top:0"><h2>À propos de cet épisode</h2>' + descriptionHtml(e.description) + photosHtml(epPhotos) + '</div>' +

      '<aside class="side">' +
      (epShorts.length ? '<section class="side-shorts"><h2>Shorts de l\'épisode</h2>' + shortsFeedHtml(false, epShorts) +
        '<p><a href="shorts.html?e=' + encodeURIComponent(e.id.toLowerCase()) + '">Voir en plein écran</a></p></section>' : '') +
      (guests.length ? '<section><h2>' + (guests.length > 1 ? 'Les invités' : "L'invité") + '</h2>' + guests.map(function (g) { return personCard(g, false); }).join('') + '</section>' : '') +
      (e.sponsors && e.sponsors.length ? '<section><h2>Sponsors de l\'épisode</h2>' + sponsorHtml({ sponsors: e.sponsors }) + '</section>' : '') +
      '<section><h2><a href="episodes.html#saison-' + e.season + '">' + esc(s.titre) + '</a></h2><p class="soft">' + esc(s.description) + '</p>' + sponsorHtml(s) + '</section>' +
      '<section>' +
      (older ? '<a class="next" href="' + epUrl(older) + '"><small>Épisode précédent</small>' + esc(older.title) + '</a>' : '') +
      (newer ? '<a class="next" href="' + epUrl(newer) + '"><small>Épisode suivant</small>' + esc(newer.title) + '</a>' : '') +
      '</section></aside></div>' +
      '<section class="comments" id="commentaires" hidden></section>';

    initComments(e);
    initPhotoViewer(epPhotos);
    var box = document.querySelector('.video');
    if (box) {
      box.querySelector('button').addEventListener('click', function () {
        Player.pause();
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + box.dataset.video + '?autoplay=1&rel=0';
        f.title = box.dataset.title;
        f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        f.allowFullscreen = true;
        f.referrerPolicy = 'strict-origin-when-cross-origin';
        box.innerHTML = '';
        box.appendChild(f);
      });
    }
  }
  /* ---------- Photothèque d'un épisode : mosaïque et visionneuse ---------- */
  function photoAlt(p) { return p.alt || 'Photo de l\'enregistrement de l\'épisode'; }
  function photosHtml(photos) {
    if (!photos.length) return '';
    return '<section class="ep-photos-sec"><h2>Photos de l\'enregistrement</h2><div class="ep-photos" data-n="' + Math.min(photos.length, 5) + '">' + photos.map(function (p, i) {
      return '<button class="ep-photo" type="button" data-photo="' + i + '" aria-label="Agrandir la photo ' + (i + 1) + ' sur ' + photos.length + ' : ' + esc(photoAlt(p)) + '"><img src="' + esc(p.image) + '" alt=""' + (p.largeur && p.hauteur ? ' width="' + p.largeur + '" height="' + p.hauteur + '"' : '') + ' loading="lazy"></button>';
    }).join('') + '</div></section>';
  }
  function initPhotoViewer(photos) {
    if (!photos.length) return;
    var arrow = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>'; };
    var dlg = document.createElement('dialog');
    dlg.className = 'viewer';
    dlg.setAttribute('aria-label', 'Photos de l\'enregistrement');
    dlg.innerHTML = '<button class="viewer-shut" type="button" aria-label="Fermer">' + ICONS.close + '</button>' +
      '<button class="viewer-nav prev" type="button" aria-label="Photo précédente">' + arrow('M15 5l-7 7 7 7') + '</button>' +
      '<figure><img alt=""><figcaption aria-live="polite"></figcaption></figure>' +
      '<button class="viewer-nav next" type="button" aria-label="Photo suivante">' + arrow('M9 5l7 7-7 7') + '</button>';
    document.body.appendChild(dlg);
    var img = dlg.querySelector('img'), caption = dlg.querySelector('figcaption'), at = 0;
    dlg.classList.toggle('single', photos.length === 1);
    function show(i) {
      at = (i + photos.length) % photos.length;
      var p = photos[at];
      img.src = p.image;
      img.alt = photoAlt(p);
      caption.textContent = (photos.length > 1 ? (at + 1) + ' / ' + photos.length + (p.alt ? ' · ' : '') : '') + p.alt;
      // La photo suivante est déjà prête quand on avance.
      new Image().src = photos[(at + 1) % photos.length].image;
    }
    document.querySelector('.ep-photos').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-photo]');
      if (!b) return;
      show(Number(b.dataset.photo));
      dlg.showModal();
    });
    dlg.querySelector('.viewer-shut').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('.prev').addEventListener('click', function () { show(at - 1); });
    dlg.querySelector('.next').addEventListener('click', function () { show(at + 1); });
    dlg.addEventListener('click', function (ev) {
      if (ev.target === dlg || ev.target.tagName === 'FIGURE') dlg.close();
    });
    dlg.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowLeft') show(at - 1);
      if (ev.key === 'ArrowRight') show(at + 1);
    });
    dlg.addEventListener('close', function () { img.removeAttribute('src'); });
    // Sur téléphone, on glisse pour changer de photo.
    var startX = null;
    dlg.addEventListener('touchstart', function (ev) { startX = ev.touches.length === 1 ? ev.touches[0].clientX : null; }, { passive: true });
    dlg.addEventListener('touchend', function (ev) {
      if (startX === null) return;
      var dx = ev.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- Commentaires : le formulaire n'apparaît que si le backend répond ---------- */
  function initComments(e) {
    var box = document.getElementById('commentaires');
    function load() {
      return fetch('api/comments?episode=' + encodeURIComponent(e.id)).then(function (r) {
        if (!r.ok) throw new Error('indisponible');
        return r.json();
      });
    }
    function listHtml(items) {
      if (!items.length) return '<p class="soft">Soyez la première personne à réagir à cet épisode.</p>';
      return '<ul class="comment-list">' + items.map(function (c) {
        return '<li><b>' + esc(c.nom) + '</b><time>' + esc(formatDate(new Date(c.created).toISOString().slice(0, 10))) + '</time><p>' + esc(c.texte) + '</p></li>';
      }).join('') + '</ul>';
    }
    load().then(function (data) {
      var token = data.token;
      box.hidden = false;
      box.innerHTML = '<div class="wrap"><h2>Commentaires <span>' + data.comments.length + '</span></h2><div class="comment-grid">' +
        '<div>' + listHtml(data.comments) + '</div>' +
        '<form class="comment-form" novalidate><label for="c-nom">Votre nom</label><input id="c-nom" name="nom" maxlength="60" autocomplete="name" required>' +
        '<label for="c-texte">Votre commentaire</label><textarea id="c-texte" name="texte" rows="5" maxlength="1000" required></textarea>' +
        '<div class="c-trap" aria-hidden="true"><label for="c-site">Ne pas remplir</label><input id="c-site" name="website" tabindex="-1" autocomplete="off"></div>' +
        '<p class="soft c-note">Les commentaires sont relus avant publication. Ne partagez pas de coordonnées personnelles.</p>' +
        '<button class="btn btn-main" type="submit">Envoyer</button><p class="c-status" role="status"></p></form></div></div>';
      var form = box.querySelector('form'), status = box.querySelector('.c-status');
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        if (!form.nom.value.trim() || !form.texte.value.trim()) { status.textContent = 'Indiquez votre nom et votre commentaire.'; return; }
        var send = form.querySelector('button');
        send.disabled = true;
        fetch('api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ episode: e.id, nom: form.nom.value, texte: form.texte.value, website: form.website.value, token: token })
        }).then(function (r) {
          return r.json().then(function (out) { return { ok: r.ok, out: out }; });
        }).then(function (res) {
          status.textContent = res.ok ? res.out.message : res.out.error;
          if (res.ok) form.texte.value = '';
          return load();
        }).then(function (fresh) { token = fresh.token; }).catch(function () {
          status.textContent = 'Envoi impossible pour le moment. Réessayez plus tard.';
        }).then(function () { send.disabled = false; });
      });
    }).catch(function () { /* site sans backend : pas de commentaires */ });
  }

  function videoHtml(e) {
    return '<div class="video" data-video="' + esc(e.video) + '" data-title="' + esc(e.title) + '"><button type="button" aria-label="Regarder la vidéo : ' + esc(e.title) + '">' +
      '<img src="https://i.ytimg.com/vi/' + esc(e.video) + '/maxresdefault.jpg" alt="" width="1280" height="720" data-fallback="https://i.ytimg.com/vi/' + esc(e.video) + '/hqdefault.jpg"><span class="play-big">' + ICONS.play + '</span></button></div>';
  }
  function descriptionHtml(text) {
    var lines = text.split('\n').filter(Boolean).map(function (l) {
      return '<p>' + esc(l).replace(/https?:\/\/[^\s<]+/g, function (u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + u + '</a>'; }) + '</p>';
    });
    if (lines.length <= 5) return lines.join('');
    return lines.slice(0, 4).join('') + '<details><summary>Lire la suite</summary>' + lines.slice(4).join('') + '</details>';
  }
  // Sans photo envoyée depuis l'administration, chacun garde toujours le même avatar par défaut.
  function avatarOf(g) {
    if (g.avatar) return g.avatar;
    var sum = 0, i;
    for (i = 0; i < g.nom.length; i++) sum += g.nom.charCodeAt(i);
    return 'assets/avatars/defaut-' + (sum % 3 + 1) + '.svg';
  }
  function personCard(g, withEpisodes) {
    var eps = g.episodes.map(function (id) { return byId[id]; }).filter(Boolean);
    var hay = norm(g.nom + ' ' + g.role + ' ' + eps.map(function (e) { return e.title; }).join(' '));
    var links = socials(g) + (withEpisodes ? eps.map(function (e) {
      return '<a class="ep-pill" href="' + epUrl(e) + '" title="' + esc(e.title) + '">' + esc(shortCode(e)) + '</a>';
    }).join('') : '');
    return '<article class="person"' + (withEpisodes ? ' id="' + slug(g) + '" data-hay="' + esc(hay) + '"' : '') + '>' +
      '<img class="avatar" src="' + esc(avatarOf(g)) + '" alt="" width="76" height="76" loading="lazy"><h3>' + esc(g.nom) + '</h3><p class="role">' + esc(g.role) + '</p>' +
      (links ? '<div class="links">' + links + '</div>' : '') + '</article>';
  }

  /* ---------- Communauté ---------- */
  function renderCommunaute() {
    var counts = {};
    INVITES.forEach(function (g) { counts[g.secteur] = (counts[g.secteur] || 0) + 1; });
    var hero = '<section class="page-hero with-photo"><img src="assets/photos/agile-tour.jpg" alt="" width="1100" height="733" style="object-position:50% 30%"><div class="wrap">' +
      '<h1>La communauté</h1><p class="lead">' + INVITES.length + ' personnes passées au micro de Wolof Tech, classées par secteur d\'activité. Retrouvez leurs contacts et les épisodes où les écouter.</p></div></section>';
    var tools = '<div class="tools"><div class="wrap">' +
      '<label class="visually-hidden" for="q">Rechercher une personne</label><input id="q" class="search" type="search" placeholder="Chercher un nom, une entreprise ou un sujet">' +
      '<div class="chips scroll-chips"><button class="chip" type="button" data-s="" aria-pressed="true">Tous <small>' + INVITES.length + '</small></button>' +
      SECTEURS.map(function (s) {
        return '<button class="chip" type="button" data-s="' + s.id + '" aria-pressed="false">' + esc(s.nom) + ' <small>' + (counts[s.id] || 0) + '</small></button>';
      }).join('') + '</div></div></div>';
    var body = SECTEURS.map(function (s) {
      var people = INVITES.filter(function (g) { return g.secteur === s.id; }).sort(function (a, b) { return b.episodes.length - a.episodes.length; });
      return '<section class="people-sec" id="secteur-' + s.id + '" data-s="' + s.id + '"><h2>' + esc(s.nom) + ' <span>' + people.length + '</span></h2><div class="people">' +
        people.map(function (g) { return personCard(g, true); }).join('') + '</div></section>';
    }).join('');
    document.getElementById('main').innerHTML = hero + tools + '<div class="wrap" style="padding-bottom:70px">' + body + '<p class="empty" id="none" hidden>Personne ne correspond à cette recherche. Essayez un autre nom ou un autre secteur.</p></div>';

    var q = document.getElementById('q'), none = document.getElementById('none'), active = '';
    var chips = document.querySelectorAll('.chip[data-s]');
    function apply() {
      var v = norm(q.value.trim()), any = false;
      document.querySelectorAll('.people-sec').forEach(function (sec) {
        var hits = 0;
        sec.querySelectorAll('.person').forEach(function (p) {
          var ok = !v || p.dataset.hay.indexOf(v) !== -1;
          p.style.display = ok ? '' : 'none';
          if (ok) hits++;
        });
        var show = hits > 0 && (!active || sec.dataset.s === active);
        sec.style.display = show ? '' : 'none';
        if (show) any = true;
      });
      none.hidden = any;
    }
    q.addEventListener('input', apply);
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        active = c.dataset.s;
        chips.forEach(function (o) { o.setAttribute('aria-pressed', String(o === c)); });
        apply();
      });
    });
    if (location.hash) scrollToHash();
  }

  // Le contenu est créé après le chargement : le navigateur ne peut pas suivre l'ancre seul.
  function scrollToHash() {
    function go() {
      var el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView();
    }
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go);
  }

  /* ---------- Auteur ---------- */
  function renderAuteur() {
    var A = SITE.animateur;
    document.getElementById('main').innerHTML =
      '<section class="page-hero"><div class="wrap"><h1>' + esc(A.nom) + '</h1><p class="lead">' + esc(A.role) + '</p></div></section>' +
      '<section class="block" style="padding-top:clamp(30px,4vw,56px)"><div class="wrap duo" style="grid-template-columns:minmax(0,.7fr) minmax(0,1.3fr);align-items:start">' +
      '<img class="bio-photo" src="' + esc(A.photo) + '" alt="Portrait de ' + esc(A.nom) + '" width="800" height="800">' +
      '<div><div class="bio">' + A.bio.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
      '<div class="bio-socials">' + socials(A) + '</div>' +
      '<div class="btn-row"><a class="btn btn-main" href="episodes.html">Écouter le podcast</a><a class="btn" href="' + SITE.liens.soutenir + '" target="_blank" rel="noopener">Soutenir le projet</a></div>' +
      '</div></div></section>' +
      '<section class="block" style="padding-top:0"><div class="wrap"><h2 style="margin-bottom:clamp(20px,3vw,34px)">Du studio au terrain</h2><div class="mosaic">' +
      '<img class="c" src="assets/photos/regie.jpg" alt="Enregistrement en studio, vu depuis la régie" loading="lazy">' +
      '<img class="d" src="assets/photos/coulisses.jpg" alt="Les coulisses d\'un tournage : caméra, lumière et table d\'enregistrement" loading="lazy">' +
      '<img class="d" src="assets/photos/geste.jpg" alt="Échange au micro dans le studio Wolof Tech" loading="lazy">' +
      '<img class="c" src="assets/photos/direct.jpg" alt="Enregistrement en public lors d\'un événement tech" loading="lazy">' +
      '</div></div></section>';
  }

  renderChrome();
  initHeader();
  ({ accueil: renderHome, episodes: renderEpisodes, episode: renderEpisode, communaute: renderCommunaute, auteur: renderAuteur, panels: renderPanels, shorts: renderShorts, services: renderServices })[document.body.dataset.page]();
  Player.init();
  initWatch();
  initGalleries();
  initShorts();
  initBanga();
  initMotion();
  Player.sync();
})();
