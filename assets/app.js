(function () {
  'use strict';

  var EPISODES = window.WT_EPISODES || [];
  var SAISONS = window.WT_SAISONS || [];
  var SERIES = window.WT_SERIES || [];
  var INVITES = window.WT_INVITES || [];
  var SECTEURS = window.WT_SECTEURS || [];
  var SITE = window.WT_SITE;
  var byId = {};
  EPISODES.forEach(function (e) {
    byId[e.id] = e;
    // Une saison pas encore décrite dans saisons.js doit quand même s'afficher.
    if (e.season > 0 && !SAISONS.some(function (s) { return s.numero === e.season; })) {
      SAISONS.push({ numero: e.season, titre: 'Saison ' + e.season, description: '', sponsors: [] });
    }
  });

  var ICONS = {
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.4"/><circle cx="17.6" cy="6.4" r="1.2" fill="currentColor" stroke="none"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    spotify: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
    rss: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.6" fill="currentColor" stroke="none"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5v17l14-8.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h4.5v18H6zM13.5 3H18v18h-4.5z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    caret: '<svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 9l7 7 7-7"/></svg>'
  };
  var SOCIAL_NAMES = { linkedin: 'LinkedIn', instagram: 'Instagram', facebook: 'Facebook', x: 'X' };

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
    return ['linkedin', 'instagram', 'facebook', 'x'].filter(function (k) { return p[k]; }).map(function (k) {
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
      '<img src="' + src + '" alt="" loading="lazy" width="480" height="270" onerror="this.onerror=null;this.src=\'' + esc(e.image) + '\'">' +
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
    var arrow = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>'; };
    return '<section class="on-saffron" data-gallery aria-label="' + esc(title) + '" style="padding-block:clamp(20px,3vw,40px) clamp(50px,7vw,90px)"><div class="wrap gallery-head"><h2>' + esc(title) + '</h2>' +
      '<div class="arrows"><button class="arrow" type="button" data-prev aria-label="Photos précédentes">' + arrow('M15 5l-7 7 7 7') + '</button>' +
      '<button class="arrow" type="button" data-next aria-label="Photos suivantes">' + arrow('M9 5l7 7-7 7') + '</button></div></div>' +
      '<div class="track" tabindex="0" role="group" aria-label="Photos, faites défiler pour voir la suite">' + photos.map(function (p) {
        return '<img src="assets/photos/' + p[0] + '.jpg" alt="' + esc(p[1]) + '" width="' + p[2] + '" height="' + p[3] + '" loading="lazy">';
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

  /* ---------- Gabarit commun ---------- */
  function renderChrome() {
    var page = document.body.dataset.page;
    var links = [['episodes', 'episodes.html', 'Épisodes'], ['communaute', 'communaute.html', 'Communauté'], ['auteur', 'a-propos.html', "L'auteur"]];
    document.getElementById('head').innerHTML =
      '<a class="skip" href="#main">Aller au contenu</a>' +
      '<header class="site-head"><div class="wrap">' +
      '<a class="brand" href="index.html"><img src="assets/logo.png" alt="Podcast Wolof Tech, accueil" width="500" height="500"></a>' +
      '<nav class="nav" aria-label="Navigation principale">' + links.map(function (l) {
        return '<a href="' + l[1] + '"' + (page === l[0] ? ' aria-current="page"' : '') + '>' + l[2] + '</a>';
      }).join('') + '</nav></div></header>';
    var L = SITE.liens;
    document.getElementById('foot').innerHTML =
      '<footer class="site-foot"><div class="wrap">' +
      '<img src="assets/logo.png" alt="" width="500" height="500" loading="lazy">' +
      '<div><ul class="foot-links">' +
      '<li><a href="episodes.html">Épisodes</a></li><li><a href="communaute.html">Communauté</a></li><li><a href="a-propos.html">L\'auteur</a></li>' +
      '<li><a href="' + L.whatsapp + '" target="_blank" rel="noopener">Chaîne WhatsApp</a></li>' +
      '<li><a href="' + L.soutenir + '" target="_blank" rel="noopener">Soutenir le podcast</a></li></ul>' +
      '<p>Wolof Tech, une production de la Maison du Podcast.</p></div>' +
      '<div class="socials">' + [['youtube', L.youtube, 'YouTube'], ['spotify', L.spotify, 'Spotify'], ['x', L.x, 'X'], ['facebook', L.facebook, 'Facebook'], ['rss', L.rss, 'Flux RSS']].map(function (s) {
        return '<a class="social" href="' + s[1] + '" target="_blank" rel="noopener" aria-label="Wolof Tech sur ' + s[2] + '" title="' + s[2] + '">' + ICONS[s[0]] + '</a>';
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
    var teaserHtml = !teaser && !latest.video
      ? '<div class="teaser"><img src="' + esc(latest.image) + '" alt=""></div>'
      : teaser
      ? '<div class="teaser"><button type="button" data-watch="' + esc(teaser) + '" data-tall="1" data-title="' + esc('Teaser : ' + latest.title) + '" aria-label="Regarder le teaser : ' + esc(latest.title) + '">' +
        '<img src="https://i.ytimg.com/vi/' + esc(teaser) + '/hqdefault.jpg" alt="" loading="lazy" onerror="this.onerror=null;this.src=\'' + esc(latest.image) + '\'"><span class="badge">Teaser</span><span class="play-big">' + ICONS.play + '</span></button></div>'
      : '<div class="teaser"><button type="button" data-watch="' + esc(latest.video) + '" data-title="' + esc(latest.title) + '" aria-label="Regarder : ' + esc(latest.title) + '">' +
        '<img src="https://i.ytimg.com/vi/' + esc(latest.video) + '/maxresdefault.jpg" alt="" loading="lazy" onerror="this.onerror=null;this.src=\'' + esc(latest.image) + '\'"><span class="play-big">' + ICONS.play + '</span></button></div>';

    document.getElementById('main').innerHTML =
      '<section class="hero"><div class="wrap"><div>' +
      '<h1>La tech, en <em>wolof.</em></h1>' +
      '<p class="lead">Dalal ak jàmm. À chaque épisode, un expert vient expliquer un sujet pour que tout le monde le comprenne.</p>' +
      '<div class="btn-row">' + watchLatest('Regarder le dernier épisode') +
      '<a class="btn" href="episodes.html">Tous les épisodes</a></div></div>' +
      '<div class="stage"><img src="assets/photos/hero-1600.jpg" alt="' + esc(A.nom) + ' au micro dans le studio Wolof Tech, avec le bureau, l\'interface audio et les documents de l\'émission" width="1600" height="1067" fetchpriority="high">' +
      '<div class="topics" aria-hidden="true"><span>IA</span><span>Fintech</span><span>Cybersécurité</span></div>' +
      (guests.length ? '<a class="guest-card" href="' + epUrl(latest) + '"><img src="' + esc(latest.image) + '" alt="" width="58" height="58"><div><b>' + esc(guests[0].nom) + '</b><span>Invité du dernier épisode</span><u>Voir l\'épisode</u></div></a>' : '') +
      '<div class="pill">' + playBtn(latest) + waveHtml(latest, 34) + '</div>' +
      '</div></div></section>' +

      '<div class="wrap"><div class="platforms"><p>Écoutez et abonnez-vous</p><div>' +
      '<a href="' + L.youtube + '" target="_blank" rel="noopener">' + ICONS.youtube + 'YouTube</a>' +
      '<a href="' + L.spotify + '" target="_blank" rel="noopener">' + ICONS.spotify + 'Spotify</a>' +
      '<a href="' + L.rss + '" target="_blank" rel="noopener">' + ICONS.rss + 'Flux RSS</a></div></div></div>' +

      '<section class="block"><div class="wrap latest' + (teaser ? '' : ' wide') + '">' + teaserHtml + '<div>' +
      '<span class="kicker">Dernier épisode, ' + esc(code(latest).toLowerCase()) + '</span>' +
      '<h2>' + esc(latest.title) + '</h2>' +
      (guests.length ? '<div class="tags">' + guests.map(function (g) { return '<a class="tag" href="' + guestLink(g) + '">' + esc(g.nom) + '</a>'; }).join('') + '</div>' : '') +
      '<p class="sum">' + esc(latest.summary) + '</p>' +
      '<div class="btn-row">' + watchLatest('Regarder l\'épisode, ' + esc(formatDuration(latest))) +
      '<a class="btn" href="' + epUrl(latest) + '">Détails et audio</a></div>' +
      '</div></div></section>' +

      '<section class="block" style="padding-top:0"><div class="wrap"><div class="head-row"><h2>Les derniers épisodes en vidéo</h2><a class="btn" href="' + L.youtube + '" target="_blank" rel="noopener">' + ICONS.youtube + 'La chaîne YouTube</a></div>' +
      '<div class="vid-grid">' + recent.map(vidCard).join('') + '</div></div></section>' +

      '<section class="on-saffron facts"><div class="wrap">' +
      '<p class="count">' + EPISODES.length + ' épisodes, ' + INVITES.length + ' invités et ' + totalHours() + ' heures de tech en wolof.</p>' +
      '<p class="why">Depuis juillet 2020, avec une conviction : le wolof peut être une langue d\'enseignement et de communication pour accéder à l\'information et aux nouvelles technologies.</p>' +
      '</div></section>' +

      galleryHtml('Dans le studio et sur le terrain', [
        ['conversation', 'Un invité et une invitée échangent autour de la table du studio', 1400,933],
        ['sourire', 'Un invité sourit au micro, tablette devant lui', 1100,733],
        ['coulisses', 'Les coulisses d\'un tournage : caméra, lumière et table d\'enregistrement', 1100,825],
        ['portrait-invitee', 'Une invitée sourit au micro', 800,1200],
        ['table-duo', 'Échange entre deux personnes de part et d\'autre de la table du studio', 1100,733],
        ['panel', 'Quatre personnes en discussion sur une terrasse, badges autour du cou', 1400,931],
        ['ecoute', 'Au micro, casque sur les oreilles, devant l\'étagère du studio', 800,1200],
        ['table', 'Conversation autour de la grande table du studio', 1400,788],
        ['agile-tour', 'Deux intervenants sur scène à l\'Agile Tour Dakar 2023', 1100,733],
        ['notes', 'Une invitée prend des notes au micro', 1100,619],
        ['direct', 'Enregistrement en public lors d\'un événement tech', 800,1201],
        ['invite', 'Un invité regarde vers la caméra, micro et tablette devant lui', 1100,733],
        ['remise', 'Remise d\'un souvenir à un invité à la fin de l\'enregistrement', 1100,733],
        ['regie', 'Enregistrement en studio, vu depuis la régie', 800,1067],
        ['au-micro', 'Au micro, ordinateur portable ouvert sur le bureau', 800,1200],
        ['banniere', 'Au micro, le regard sur ses notes', 1100,733]
      ]) +

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

      '<div class="wrap block ep-layout" style="padding-top:clamp(30px,4vw,52px)"><div class="ep-text" style="margin-top:0"><h2>À propos de cet épisode</h2>' + descriptionHtml(e.description) + '</div>' +

      '<aside class="side">' +
      (guests.length ? '<section><h2>' + (guests.length > 1 ? 'Les invités' : "L'invité") + '</h2>' + guests.map(function (g) { return personCard(g, false); }).join('') + '</section>' : '') +
      '<section><h2><a href="episodes.html#saison-' + e.season + '">' + esc(s.titre) + '</a></h2><p class="soft">' + esc(s.description) + '</p>' + sponsorHtml(s) + '</section>' +
      '<section>' +
      (older ? '<a class="next" href="' + epUrl(older) + '"><small>Épisode précédent</small>' + esc(older.title) + '</a>' : '') +
      (newer ? '<a class="next" href="' + epUrl(newer) + '"><small>Épisode suivant</small>' + esc(newer.title) + '</a>' : '') +
      '</section></aside></div>';

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
  function videoHtml(e) {
    return '<div class="video" data-video="' + esc(e.video) + '" data-title="' + esc(e.title) + '"><button type="button" aria-label="Regarder la vidéo : ' + esc(e.title) + '">' +
      '<img src="https://i.ytimg.com/vi/' + esc(e.video) + '/maxresdefault.jpg" alt="" width="1280" height="720" onerror="this.onerror=null;this.src=\'https://i.ytimg.com/vi/' + esc(e.video) + '/hqdefault.jpg\'"><span class="play-big">' + ICONS.play + '</span></button></div>';
  }
  function descriptionHtml(text) {
    var lines = text.split('\n').filter(Boolean).map(function (l) {
      return '<p>' + esc(l).replace(/https?:\/\/[^\s<]+/g, function (u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + u + '</a>'; }) + '</p>';
    });
    if (lines.length <= 5) return lines.join('');
    return lines.slice(0, 4).join('') + '<details><summary>Lire la suite</summary>' + lines.slice(4).join('') + '</details>';
  }
  function personCard(g, withEpisodes) {
    var words = g.nom.replace(/^(Dr|Pr)\s+/, '').split(/\s+/).map(function (w) { return w[0]; }).filter(Boolean);
    var initials = (words[0] + (words.length > 1 ? words[words.length - 1] : '')).toUpperCase();
    var eps = g.episodes.map(function (id) { return byId[id]; }).filter(Boolean);
    var hay = norm(g.nom + ' ' + g.role + ' ' + eps.map(function (e) { return e.title; }).join(' '));
    var links = socials(g) + (withEpisodes ? eps.map(function (e) {
      return '<a class="ep-pill" href="' + epUrl(e) + '" title="' + esc(e.title) + '">' + esc(shortCode(e)) + '</a>';
    }).join('') : '');
    return '<article class="person"' + (withEpisodes ? ' id="' + slug(g) + '" data-hay="' + esc(hay) + '"' : '') + '>' +
      '<div class="avatar" aria-hidden="true">' + esc(initials) + '</div><h3>' + esc(g.nom) + '</h3><p class="role">' + esc(g.role) + '</p>' +
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
  ({ accueil: renderHome, episodes: renderEpisodes, episode: renderEpisode, communaute: renderCommunaute, auteur: renderAuteur })[document.body.dataset.page]();
  Player.init();
  initWatch();
  initGalleries();
  Player.sync();
})();
