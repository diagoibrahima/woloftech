(function () {
  'use strict';

  var app = document.getElementById('app');
  var csrf = '';
  var provisional = false;
  var tab = 'episodes';
  var ytThumb = function (id) { return 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/hqdefault.jpg'; };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function toast(message, bad) {
    var t = document.getElementById('toast');
    t.textContent = message;
    t.className = 'on' + (bad ? ' bad' : '');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { t.className = ''; }, 3500);
  }
  function api(method, url, body, raw) {
    var headers = { 'X-CSRF-Token': csrf };
    var opts = { method: method, headers: headers, credentials: 'same-origin' };
    if (raw) { opts.body = raw; }
    else if (body !== undefined) { headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    return fetch('../api/admin/' + url, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        if (r.status === 401 && url !== 'login' && url !== 'me') { renderLogin(); throw new Error('Connexion requise.'); }
        if (!r.ok) throw new Error(data.error || 'Erreur.');
        return data;
      });
    });
  }
  function fail(err) { toast(err.message || 'Le backend ne répond pas.', true); }
  function field(label, name, value, type, cls) {
    return '<div class="' + (cls || '') + '"><label for="f-' + name + '">' + esc(label) + '</label><input id="f-' + name + '" name="' + name + '" type="' + (type || 'text') + '" value="' + esc(value) + '"></div>';
  }
  function formData(form) {
    var out = {};
    new FormData(form).forEach(function (v, k) { if (typeof v === 'string') out[k] = v; });
    return out;
  }
  // Une photo de téléphone dépasse vite la limite d'envoi : elle est réduite avant de partir.
  function prepareImage(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('Fichier illisible : ' + file.name)); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error('Format non reconnu : ' + file.name + '. Envoyez une image JPEG, PNG ou WebP.')); };
        img.onload = function () {
          var w = img.naturalWidth, h = img.naturalHeight, scale = Math.min(1, 1600 / Math.max(w, h));
          if (scale === 1 && file.size <= 1500000) { resolve({ blob: file, w: w, h: h }); return; }
          var canvas = document.createElement('canvas');
          canvas.width = Math.round(w * scale); canvas.height = Math.round(h * scale);
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(function (blob) { resolve({ blob: blob, w: canvas.width, h: canvas.height }); }, 'image/jpeg', 0.85);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function uploadInto(input, hidden, preview) {
    input.addEventListener('change', function () {
      if (!input.files[0]) return;
      prepareImage(input.files[0]).then(function (p) { return api('POST', 'upload', undefined, p.blob); }).then(function (r) {
        hidden.value = r.path;
        if (preview) preview.src = '../' + r.path;
        toast('Image envoyée. Pensez à enregistrer.');
      }).catch(fail);
    });
  }

  /* ---------- Connexion ---------- */
  function renderLogin() {
    app.innerHTML = '<main><form class="card login"><img src="../assets/logo.png" alt=""><h2>Administration Wolof Tech</h2>' +
      '<label for="u">Identifiant</label><input id="u" name="username" type="text" autocomplete="username" required value="admin">' +
      '<label for="p">Mot de passe</label><input id="p" name="password" type="password" autocomplete="current-password" required>' +
      '<button class="btn main" type="submit">Se connecter</button><p class="error" role="alert"></p></form></main>';
    app.querySelector('form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      api('POST', 'login', formData(ev.target)).then(function (r) {
        csrf = r.csrf; provisional = r.provisional;
        renderShell();
      }).catch(function (err) { app.querySelector('.error').textContent = err.message; });
    });
  }

  /* ---------- Structure ---------- */
  var TABS = [['episodes', 'Épisodes'], ['guests', 'Invités'], ['shorts', 'Shorts'], ['panels', 'Panels et invitations'], ['gallery', 'Photos du studio'], ['comments', 'Commentaires'], ['settings', 'Services et réseaux'], ['account', 'Compte']];
  function renderShell() {
    app.innerHTML = '<header class="top"><h1>Wolof Tech</h1><nav class="tabs" aria-label="Sections"></nav><a href="../index.html" target="_blank" rel="noopener">Voir le site</a>' +
      '<button class="btn small" style="color:#fff;border-color:#fff" type="button" id="logout">Déconnexion</button></header><main id="view"></main>';
    document.getElementById('logout').addEventListener('click', function () {
      api('POST', 'logout').then(renderLogin).catch(fail);
    });
    show(tab);
  }
  function renderTabs() {
    return api('GET', 'overview').then(function (o) {
      var counts = { episodes: o.pendingEpisodes, comments: o.pendingComments };
      var nav = app.querySelector('.tabs');
      if (!nav) return;
      nav.innerHTML = TABS.map(function (t) {
        return '<button type="button" data-tab="' + t[0] + '"' + (t[0] === tab ? ' aria-current="page"' : '') + '>' + t[1] + (counts[t[0]] ? '<span class="count">' + counts[t[0]] + '</span>' : '') + '</button>';
      }).join('');
      nav.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.tab); }); });
    });
  }
  function show(name) {
    tab = name;
    renderTabs().catch(fail);
    var view = document.getElementById('view');
    view.innerHTML = '<p class="empty">Chargement…</p>';
    ({ episodes: viewEpisodes, guests: viewGuests, shorts: viewShorts, panels: viewPanels, gallery: viewGallery, comments: viewComments, settings: viewSettings, account: viewAccount })[name](view);
  }

  /* ---------- Épisodes ---------- */
  function viewEpisodes(view, query) {
    Promise.all([api('GET', 'episodes'), api('GET', 'guests')]).then(function (res) {
      var episodes = res[0].episodes, guests = res[1].guests, secteurs = res[1].secteurs, last = res[0].lastCheck;
      var pending = episodes.filter(function (e) { return e.pending; });
      view.innerHTML = '<div class="head"><div><h2>Épisodes</h2><p class="note">' + (last ? 'Flux lu le ' + esc(new Date(last.when).toLocaleString('fr-FR')) + ' : ' + last.total + ' épisodes.' : 'Flux pas encore lu.') + ' Vérification automatique toutes les 6 heures.</p></div>' +
        '<button class="btn main" type="button" id="check">Vérifier le flux maintenant</button></div>' +
        '<h3 style="margin:0 0 8px">À compléter (' + pending.length + ')</h3><div class="card list">' + (pending.length ? pending.map(row).join('') : '<p class="empty">Aucun nouvel épisode à compléter.</p>') + '</div>' +
        '<h3 style="margin:18px 0 8px">Tous les épisodes</h3><input id="search" type="search" aria-label="Chercher un épisode" placeholder="Chercher un titre ou un code, par exemple S15E5" value="' + esc(query || '') + '" style="margin-bottom:10px"><div class="card list" id="all"></div>';
      function row(e) {
        var names = guests.filter(function (g) { return e.guests.indexOf(g.id) !== -1; }).map(function (g) { return g.nom; }).join(', ');
        return '<div class="item"><span class="badge">' + esc(e.id) + '</span><div><div class="title">' + esc(e.title) + '</div><div class="sub">' + esc(e.date) + ' · ' + (names ? esc(names) : 'aucun invité') + (e.sponsors.length ? ' · ' + e.sponsors.length + ' sponsor(s)' : '') + (e.shorts ? ' · ' + e.shorts + ' short(s)' : '') + (e.video ? '' : ' · pas de vidéo') + '</div></div>' +
          '<div class="row"><button class="btn small" type="button" data-edit="' + esc(e.id) + '">Renseigner</button></div></div>';
      }
      function list() {
        var q = view.querySelector('#search').value.trim().toLowerCase();
        var hits = episodes.filter(function (e) { return !q || (e.id + ' ' + e.title).toLowerCase().indexOf(q) !== -1; });
        view.querySelector('#all').innerHTML = hits.slice(0, 40).map(row).join('') || '<p class="empty">Aucun épisode trouvé.</p>';
      }
      list();
      view.querySelector('#search').addEventListener('input', list);
      view.querySelector('#check').addEventListener('click', function (ev) {
        ev.target.disabled = true;
        api('POST', 'rss/check').then(function (r) {
          toast(r.nouveaux.length ? r.nouveaux.length + ' nouvel(s) épisode(s) détecté(s).' : 'Aucun nouvel épisode.');
          show('episodes');
        }).catch(function (err) { fail(err); ev.target.disabled = false; });
      });
      view.addEventListener('click', function handler(ev) {
        var b = ev.target.closest('[data-edit]');
        if (!b) return;
        view.removeEventListener('click', handler);
        editEpisode(view, episodes.filter(function (e) { return e.id === b.dataset.edit; })[0], guests, secteurs);
      });
    }).catch(fail);
  }

  function editEpisode(view, ep, guests, secteurs) {
    var chosen = ep.guests.slice();
    var spons = ep.sponsors.map(function (s) { return { nom: s.nom, url: s.url }; });
    view.innerHTML = '<div class="head"><div><span class="badge">' + esc(ep.id) + '</span><h2 style="margin-top:6px">' + esc(ep.title) + '</h2></div><button class="btn" type="button" id="back">Retour à la liste</button></div>' +
      '<div class="card"><h3>Invités de l\'épisode</h3><div class="chips" id="chosen" style="margin-top:10px"></div>' +
      '<label for="pick">Ajouter un invité existant</label><input id="pick" type="text" list="guest-list" placeholder="Tapez un nom"><datalist id="guest-list">' + guests.map(function (g) { return '<option value="' + esc(g.nom) + '">'; }).join('') + '</datalist>' +
      '<details style="margin-top:12px"><summary>Créer un nouvel invité</summary><form id="new-guest" class="fields" style="margin-top:10px">' +
      field('Nom', 'nom', '') + field('Rôle', 'role', '') +
      '<div><label for="f-secteur">Secteur</label><select id="f-secteur" name="secteur">' + secteurs.map(function (s) { return '<option value="' + esc(s.id) + '">' + esc(s.nom) + '</option>'; }).join('') + '</select></div>' +
      '<div class="wide"><button class="btn small" type="submit">Créer et ajouter</button> <span class="note">Photo et réseaux se règlent ensuite dans l\'onglet Invités.</span></div></form></details></div>' +
      '<div class="card"><h3 style="margin-bottom:10px">Sponsors de l\'épisode</h3><div id="sponsors"></div><button class="btn small" type="button" id="add-sponsor">Ajouter un sponsor</button></div>' +
      '<div class="card"><h3>Shorts de l\'épisode</h3><p class="note" style="margin-bottom:10px">Autant que vous voulez : sur le site, on glisse vers le haut pour passer au suivant. Chaque ajout est enregistré tout de suite.</p><div id="ep-shorts"></div>' +
      '<label for="ep-links" style="margin-top:10px">Liens YouTube Shorts, un par ligne</label><textarea id="ep-links" rows="3" placeholder="https://youtube.com/shorts/..."></textarea>' +
      '<button class="btn small" type="button" id="add-shorts" style="margin-top:8px">Ajouter les shorts</button></div>' +
      '<div class="card">' + field('Vidéo YouTube (lien ou identifiant)', 'video', ep.video, 'text') + (ep.pending && ep.video ? '<p class="note">Vidéo proposée d\'après le titre : à vérifier. <a href="https://www.youtube.com/watch?v=' + esc(ep.video) + '" target="_blank" rel="noopener">Ouvrir</a></p>' : '') + '</div>' +
      '<div class="row"><button class="btn main" type="button" id="save-done">Enregistrer' + (ep.pending ? ' et marquer complet' : '') + '</button>' + (ep.pending ? '<button class="btn" type="button" id="save-later">Enregistrer, à finir plus tard</button>' : '') + '</div>';

    function drawGuests() {
      var box = view.querySelector('#chosen');
      box.innerHTML = chosen.map(function (id) {
        var g = guests.filter(function (x) { return x.id === id; })[0];
        return g ? '<span class="chip">' + esc(g.nom) + '<button type="button" data-remove="' + id + '" aria-label="Retirer ' + esc(g.nom) + '">×</button></span>' : '';
      }).join('') || '<span class="note">Aucun invité pour le moment.</span>';
    }
    function drawSponsors() {
      view.querySelector('#sponsors').innerHTML = spons.map(function (s, i) {
        return '<div class="sponsor-line"><input type="text" aria-label="Nom du sponsor" placeholder="Nom" data-s="' + i + '" data-k="nom" value="' + esc(s.nom) + '"><input type="url" aria-label="Lien du sponsor" placeholder="https://" data-s="' + i + '" data-k="url" value="' + esc(s.url) + '"><button class="btn small danger" type="button" data-drop="' + i + '">Retirer</button></div>';
      }).join('');
    }
    var epShorts = [];
    function drawShorts() {
      return api('GET', 'shorts').then(function (res) {
        epShorts = res.shorts.filter(function (s) { return s.episode === ep.id; });
        var box = view.querySelector('#ep-shorts');
        if (box) box.innerHTML = epShorts.map(function (s, i) {
          return '<div class="item"><img class="thumb tall" src="' + ytThumb(s.video) + '" alt=""><div><div class="title">Short ' + (i + 1) + (s.titre ? ' : ' + esc(s.titre) : '') + '</div><div class="sub"><a href="https://www.youtube.com/shorts/' + esc(s.video) + '" target="_blank" rel="noopener">Voir sur YouTube</a></div></div>' +
            '<div class="row">' + moveButtons(i, epShorts.length) + '<button class="btn small" type="button" data-title="' + s.id + '">Titre</button><button class="btn small danger" type="button" data-del="' + s.id + '">Retirer</button></div></div>';
        }).join('') || '<p class="note">Aucun short pour cet épisode.</p>';
      }).catch(fail);
    }
    view.querySelector('#ep-shorts').addEventListener('click', function (ev) {
      var b = ev.target.closest('button');
      if (!b) return;
      if (b.dataset.move) api('PUT', 'shorts/order', { ids: moved(epShorts, Number(b.dataset.i), Number(b.dataset.move)) }).then(drawShorts).catch(fail);
      if (b.dataset.del) api('DELETE', 'shorts/' + b.dataset.del).then(drawShorts).catch(fail);
      if (b.dataset.title) {
        var s = epShorts.filter(function (x) { return x.id === Number(b.dataset.title); })[0];
        var titre = prompt('Titre du short', s.titre);
        if (titre !== null) api('PUT', 'shorts/' + s.id, { titre: titre }).then(drawShorts).catch(fail);
      }
    });
    view.querySelector('#add-shorts').addEventListener('click', function () {
      var area = view.querySelector('#ep-links');
      var links = area.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
      var refused = [], added = 0;
      // Un lien refusé reste dans la zone de saisie, les autres sont bien ajoutés.
      links.reduce(function (chain, url) {
        return chain.then(function () {
          return api('POST', 'shorts', { url: url, episode: ep.id }).then(function () { added++; }).catch(function (err) { refused.push({ url: url, error: err.message }); });
        });
      }, Promise.resolve()).then(function () {
        area.value = refused.map(function (r) { return r.url; }).join('\n');
        if (refused.length) toast(refused[0].error, true);
        else if (added) toast(added + ' short(s) ajouté(s).');
        return drawShorts();
      });
    });
    drawGuests(); drawSponsors(); drawShorts();
    view.querySelector('#back').addEventListener('click', function () { show('episodes'); });
    view.querySelector('#chosen').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-remove]');
      if (b) { chosen = chosen.filter(function (id) { return id !== Number(b.dataset.remove); }); drawGuests(); }
    });
    view.querySelector('#pick').addEventListener('change', function (ev) {
      var g = guests.filter(function (x) { return x.nom === ev.target.value; })[0];
      if (g && chosen.indexOf(g.id) === -1) { chosen.push(g.id); drawGuests(); }
      ev.target.value = '';
    });
    view.querySelector('#new-guest').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var data = formData(ev.target);
      api('POST', 'guests', data).then(function (r) {
        guests.push({ id: r.id, nom: data.nom });
        chosen.push(r.id);
        ev.target.reset();
        drawGuests();
        toast('Invité créé.');
      }).catch(fail);
    });
    view.querySelector('#sponsors').addEventListener('input', function (ev) {
      if (ev.target.dataset.k) spons[ev.target.dataset.s][ev.target.dataset.k] = ev.target.value;
    });
    view.querySelector('#sponsors').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-drop]');
      if (b) { spons.splice(Number(b.dataset.drop), 1); drawSponsors(); }
    });
    view.querySelector('#add-sponsor').addEventListener('click', function () { spons.push({ nom: '', url: '' }); drawSponsors(); });
    function save(complete) {
      api('PUT', 'episodes/' + encodeURIComponent(ep.id), {
        guests: chosen, sponsors: spons.filter(function (s) { return s.nom.trim() || s.url.trim(); }),
        video: view.querySelector('#f-video').value, complete: complete, pending: !complete && ep.pending
      }).then(function () { toast('Épisode enregistré.'); show('episodes'); }).catch(fail);
    }
    view.querySelector('#save-done').addEventListener('click', function () { save(true); });
    var later = view.querySelector('#save-later');
    if (later) later.addEventListener('click', function () { save(false); });
  }

  /* ---------- Invités ---------- */
  function defaultAvatar(g) {
    var sum = 0, i;
    for (i = 0; i < g.nom.length; i++) sum += g.nom.charCodeAt(i);
    return '../assets/avatars/defaut-' + (sum % 3 + 1) + '.svg';
  }
  function viewGuests(view) {
    api('GET', 'guests').then(function (res) {
      var guests = res.guests, secteurs = res.secteurs;
      var sectorName = function (id) { var s = secteurs.filter(function (x) { return x.id === id; })[0]; return s ? s.nom : id; };
      view.innerHTML = '<div class="head"><h2>Invités (' + guests.length + ')</h2><button class="btn main" type="button" id="add">Ajouter un invité</button></div>' +
        '<input id="search" type="search" aria-label="Chercher un invité" placeholder="Chercher un nom" style="margin-bottom:10px"><div class="card list" id="list"></div>';
      function draw() {
        var q = view.querySelector('#search').value.trim().toLowerCase();
        view.querySelector('#list').innerHTML = guests.filter(function (g) { return !q || g.nom.toLowerCase().indexOf(q) !== -1; }).map(function (g) {
          return '<div class="item"><img class="thumb round" src="' + (g.avatar ? '../' + esc(g.avatar) : defaultAvatar(g)) + '" alt="" loading="lazy"><div><div class="title">' + esc(g.nom) + '</div><div class="sub">' + esc(g.role) + (g.role ? ' · ' : '') + esc(sectorName(g.secteur)) + ' · ' + g.episodes.length + ' épisode(s)</div></div>' +
            '<div class="row"><button class="btn small" type="button" data-edit="' + g.id + '">Modifier</button></div></div>';
        }).join('') || '<p class="empty">Aucun invité trouvé.</p>';
      }
      draw();
      view.querySelector('#search').addEventListener('input', draw);
      view.querySelector('#add').addEventListener('click', function () { editGuest(view, { nom: '', role: '', secteur: secteurs[0].id, linkedin: '', instagram: '', facebook: '', x: '', avatar: '' }, secteurs); });
      view.querySelector('#list').addEventListener('click', function (ev) {
        var b = ev.target.closest('[data-edit]');
        if (b) editGuest(view, guests.filter(function (g) { return g.id === Number(b.dataset.edit); })[0], secteurs);
      });
    }).catch(fail);
  }
  function editGuest(view, g, secteurs) {
    view.innerHTML = '<div class="head"><h2>' + (g.id ? esc(g.nom) : 'Nouvel invité') + '</h2><button class="btn" type="button" id="back">Retour à la liste</button></div>' +
      '<form class="card"><div class="row" style="margin-bottom:14px"><img class="thumb round" id="preview" style="width:96px;height:96px" alt="" src="' + (g.avatar ? '../' + esc(g.avatar) : (g.nom ? defaultAvatar(g) : '../assets/avatars/defaut-1.svg')) + '">' +
      '<div><label for="file">Avatar (JPEG, PNG ou WebP)</label><input id="file" type="file" accept="image/jpeg,image/png,image/webp"><input type="hidden" name="avatar" value="' + esc(g.avatar) + '">' +
      (g.avatar ? '<div style="margin-top:6px"><button class="btn small" type="button" id="reset">Revenir à l\'avatar par défaut</button></div>' : '') + '</div></div>' +
      '<div class="fields">' + field('Nom', 'nom', g.nom) + field('Rôle', 'role', g.role) +
      '<div><label for="f-secteur">Secteur</label><select id="f-secteur" name="secteur">' + secteurs.map(function (s) { return '<option value="' + esc(s.id) + '"' + (s.id === g.secteur ? ' selected' : '') + '>' + esc(s.nom) + '</option>'; }).join('') + '</select></div>' +
      field('LinkedIn', 'linkedin', g.linkedin, 'url') + field('Instagram', 'instagram', g.instagram, 'url') + field('Facebook', 'facebook', g.facebook, 'url') + field('X', 'x', g.x, 'url') + '</div>' +
      '<div class="row"><button class="btn main" type="submit">Enregistrer</button>' + (g.id ? '<button class="btn danger" type="button" id="del">Supprimer cet invité</button>' : '') + '</div></form>';
    var form = view.querySelector('form');
    uploadInto(view.querySelector('#file'), form.avatar, view.querySelector('#preview'));
    view.querySelector('#back').addEventListener('click', function () { show('guests'); });
    var reset = view.querySelector('#reset');
    if (reset) reset.addEventListener('click', function () { form.avatar.value = ''; view.querySelector('#preview').src = defaultAvatar(g); });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      (g.id ? api('PUT', 'guests/' + g.id, formData(form)) : api('POST', 'guests', formData(form))).then(function () { toast('Invité enregistré.'); show('guests'); }).catch(fail);
    });
    var del = view.querySelector('#del');
    if (del) del.addEventListener('click', function () {
      if (!confirm('Supprimer ' + g.nom + ' ? Cette action est définitive.')) return;
      api('DELETE', 'guests/' + g.id).then(function () { toast('Invité supprimé.'); show('guests'); }).catch(fail);
    });
  }

  /* ---------- Listes ordonnées ---------- */
  function moveButtons(i, total) {
    return '<button class="btn small" type="button" data-move="-1" data-i="' + i + '"' + (i === 0 ? ' disabled' : '') + ' aria-label="Monter">↑</button>' +
      '<button class="btn small" type="button" data-move="1" data-i="' + i + '"' + (i === total - 1 ? ' disabled' : '') + ' aria-label="Descendre">↓</button>';
  }
  function moved(list, i, step) {
    var ids = list.map(function (x) { return x.id; });
    var j = i + step, tmp = ids[i];
    ids[i] = ids[j]; ids[j] = tmp;
    return ids;
  }

  /* ---------- Shorts ---------- */
  function viewShorts(view) {
    Promise.all([api('GET', 'shorts'), api('GET', 'episodes')]).then(function (all) {
      var shorts = all[0].shorts, episodes = all[1].episodes;
      function options(current) {
        return '<option value="">Aucun épisode</option>' + episodes.map(function (e) {
          return '<option value="' + esc(e.id) + '"' + (e.id === current ? ' selected' : '') + '>' + esc(e.id + ' : ' + e.title.slice(0, 60)) + '</option>';
        }).join('');
      }
      view.innerHTML = '<div class="head"><div><h2>Shorts</h2><p class="note">Tous les shorts du site. Le plus simple est de les ajouter depuis la fiche de l\'épisode, dans l\'onglet Épisodes.</p></div></div>' +
        '<form class="card fields"><div class="wide"><label for="f-url">Lien du short</label><input id="f-url" name="url" type="text" placeholder="https://youtube.com/shorts/..." required></div>' +
        '<div class="wide"><label for="f-episode">Épisode</label><select id="f-episode" name="episode">' + options('') + '</select></div>' +
        field('Titre (facultatif)', 'titre', '', 'text', 'wide') + '<div class="wide"><button class="btn main" type="submit">Ajouter le short</button></div></form>' +
        '<div class="card list">' + (shorts.map(function (s, i) {
          return '<div class="item"><img class="thumb tall" src="' + ytThumb(s.video) + '" alt=""><div><div class="title">' + esc(s.titre || 'Sans titre') + '</div><div class="sub"><a href="https://www.youtube.com/shorts/' + esc(s.video) + '" target="_blank" rel="noopener">Voir sur YouTube</a></div><select aria-label="Épisode de ce short" data-episode="' + s.id + '" style="margin-top:6px">' + options(s.episode) + '</select></div>' +
            '<div class="row">' + moveButtons(i, shorts.length) + '<button class="btn small" type="button" data-title="' + s.id + '">Titre</button><button class="btn small danger" type="button" data-del="' + s.id + '">Retirer</button></div></div>';
        }).join('') || '<p class="empty">Aucun short pour le moment.</p>') + '</div>';
      view.querySelector('.list').addEventListener('change', function (ev) {
        if (ev.target.dataset.episode) api('PUT', 'shorts/' + ev.target.dataset.episode, { episode: ev.target.value }).then(function () { toast('Short rattaché.'); }).catch(fail);
      });
      view.querySelector('form').addEventListener('submit', function (ev) {
        ev.preventDefault();
        api('POST', 'shorts', formData(ev.target)).then(function () { toast('Short ajouté.'); show('shorts'); }).catch(fail);
      });
      view.querySelector('.list').addEventListener('click', function (ev) {
        var b = ev.target.closest('button');
        if (!b) return;
        if (b.dataset.move) api('PUT', 'shorts/order', { ids: moved(shorts, Number(b.dataset.i), Number(b.dataset.move)) }).then(function () { show('shorts'); }).catch(fail);
        if (b.dataset.del) api('DELETE', 'shorts/' + b.dataset.del).then(function () { toast('Short retiré.'); show('shorts'); }).catch(fail);
        if (b.dataset.title) {
          var s = shorts.filter(function (x) { return x.id === Number(b.dataset.title); })[0];
          var titre = prompt('Titre du short', s.titre);
          if (titre !== null) api('PUT', 'shorts/' + s.id, { titre: titre }).then(function () { show('shorts'); }).catch(fail);
        }
      });
    }).catch(fail);
  }

  /* ---------- Panels ---------- */
  function viewPanels(view) {
    api('GET', 'panels').then(function (res) {
      var panels = res.panels;
      view.innerHTML = '<div class="head"><div><h2>Panels et invitations</h2><p class="note">Vos activités en dehors du podcast : invitations, animations de panel, conférences. Elles s\'affichent sur la page d\'accueil, juste après « Soutenir le podcast ».</p></div><button class="btn main" type="button" id="add">Ajouter une activité</button></div>' +
        '<div class="card list">' + (panels.map(function (p, i) {
          return '<div class="item"><img class="thumb" src="' + (p.image ? '../' + esc(p.image) : '../assets/favicon.png') + '" alt=""><div><div class="title">' + esc(p.titre) + '</div><div class="sub">' + esc([p.type, p.lieu, p.date].filter(Boolean).join(' · ')) + '</div></div>' +
            '<div class="row">' + moveButtons(i, panels.length) + '<button class="btn small" type="button" data-edit="' + p.id + '">Modifier</button></div></div>';
        }).join('') || '<p class="empty">Aucune carte pour le moment.</p>') + '</div>';
      view.querySelector('#add').addEventListener('click', function () { editPanel(view, { titre: '', type: '', lieu: '', date: '', description: '', image: '', lien: '' }); });
      view.querySelector('.list').addEventListener('click', function (ev) {
        var b = ev.target.closest('button');
        if (!b) return;
        if (b.dataset.move) api('PUT', 'panels/order', { ids: moved(panels, Number(b.dataset.i), Number(b.dataset.move)) }).then(function () { show('panels'); }).catch(fail);
        if (b.dataset.edit) editPanel(view, panels.filter(function (p) { return p.id === Number(b.dataset.edit); })[0]);
      });
    }).catch(fail);
  }
  function editPanel(view, p) {
    view.innerHTML = '<div class="head"><h2>' + (p.id ? esc(p.titre) : 'Nouvelle activité') + '</h2><button class="btn" type="button" id="back">Retour à la liste</button></div>' +
      '<form class="card"><div class="row" style="margin-bottom:14px"><img class="thumb" id="preview" style="width:150px;height:100px" alt="" src="' + (p.image ? '../' + esc(p.image) : '../assets/favicon.png') + '">' +
      '<div><label for="file">Photo (JPEG, PNG ou WebP)</label><input id="file" type="file" accept="image/jpeg,image/png,image/webp"><input type="hidden" name="image" value="' + esc(p.image) + '"></div></div>' +
      '<div class="fields">' + field('Titre', 'titre', p.titre) +
      '<div><label for="f-type">Type d\'activité</label><input id="f-type" name="type" type="text" list="panel-types" placeholder="Choisissez ou écrivez" value="' + esc(p.type) + '"><datalist id="panel-types">' + ['Invitation', 'Animation de panel', 'Conférence', 'Formation', 'Événement'].map(function (t) { return '<option value="' + t + '">'; }).join('') + '</datalist></div>' +
      field('Lieu', 'lieu', p.lieu) + field('Date', 'date', p.date) + field('Lien (facultatif)', 'lien', p.lien, 'url') +
      '<div class="wide"><label for="f-description">Description</label><textarea id="f-description" name="description" rows="3">' + esc(p.description) + '</textarea></div></div>' +
      '<div class="row"><button class="btn main" type="submit">Enregistrer</button>' + (p.id ? '<button class="btn danger" type="button" id="del">Supprimer</button>' : '') + '</div></form>';
    var form = view.querySelector('form');
    uploadInto(view.querySelector('#file'), form.image, view.querySelector('#preview'));
    view.querySelector('#back').addEventListener('click', function () { show('panels'); });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      (p.id ? api('PUT', 'panels/' + p.id, formData(form)) : api('POST', 'panels', formData(form))).then(function () { toast('Carte enregistrée.'); show('panels'); }).catch(fail);
    });
    var del = view.querySelector('#del');
    if (del) del.addEventListener('click', function () {
      if (!confirm('Supprimer cette carte ?')) return;
      api('DELETE', 'panels/' + p.id).then(function () { toast('Carte supprimée.'); show('panels'); }).catch(fail);
    });
  }

  /* ---------- Photos du studio ---------- */
  function viewGallery(view) {
    api('GET', 'gallery').then(function (res) {
      var photos = res.photos;
      view.innerHTML = '<div class="head"><div><h2>Dans le studio et sur le terrain</h2><p class="note">' + photos.length + ' photo(s) dans le diaporama de l\'accueil. Une nouvelle photo arrive en premier.</p></div></div>' +
        '<div class="card"><label for="files">Ajouter des photos (JPEG, PNG ou WebP, plusieurs à la fois si besoin)</label><input id="files" type="file" multiple accept="image/jpeg,image/png,image/webp"></div>' +
        '<div class="card list">' + (photos.map(function (p, i) {
          return '<div class="item"><img class="thumb" src="../' + esc(p.image) + '" alt="" loading="lazy"><div><label for="alt-' + p.id + '">Description de la photo</label><input id="alt-' + p.id + '" type="text" maxlength="200" data-alt="' + p.id + '" value="' + esc(p.alt) + '"></div>' +
            '<div class="row">' + moveButtons(i, photos.length) + '<button class="btn small danger" type="button" data-del="' + p.id + '">Retirer</button></div></div>';
        }).join('') || '<p class="empty">Aucune photo : la section n\'apparaît pas sur le site.</p>') + '</div>';
      view.querySelector('#files').addEventListener('change', function (ev) {
        var files = Array.prototype.slice.call(ev.target.files), added = 0, failure = null;
        ev.target.disabled = true;
        // Envoi une par une : une photo refusée n'empêche pas les suivantes.
        files.reduce(function (chain, file) {
          return chain.then(function () {
            return prepareImage(file).then(function (p) {
              return api('POST', 'upload', undefined, p.blob).then(function (r) {
                return api('POST', 'gallery', { image: r.path, largeur: p.w, hauteur: p.h });
              });
            }).then(function () { added++; }).catch(function (err) { failure = err; });
          });
        }, Promise.resolve()).then(function () {
          if (failure) fail(failure);
          else toast(added + ' photo(s) ajoutée(s).');
          viewGallery(view);
        });
      });
      var list = view.querySelector('.list');
      list.addEventListener('change', function (ev) {
        if (ev.target.dataset.alt) api('PUT', 'gallery/' + ev.target.dataset.alt, { alt: ev.target.value }).then(function () { toast('Description enregistrée.'); }).catch(fail);
      });
      list.addEventListener('click', function (ev) {
        var b = ev.target.closest('button');
        if (!b) return;
        if (b.dataset.move) api('PUT', 'gallery/order', { ids: moved(photos, Number(b.dataset.i), Number(b.dataset.move)) }).then(function () { viewGallery(view); }).catch(fail);
        if (b.dataset.del && confirm('Retirer cette photo du diaporama ?')) api('DELETE', 'gallery/' + b.dataset.del).then(function () { toast('Photo retirée.'); viewGallery(view); }).catch(fail);
      });
    }).catch(fail);
  }

  /* ---------- Commentaires ---------- */
  function viewComments(view, status) {
    status = status || 'pending';
    var labels = { pending: 'En attente', approved: 'Publiés', rejected: 'Refusés' };
    api('GET', 'comments?status=' + status).then(function (res) {
      view.innerHTML = '<div class="head"><div><h2>Commentaires</h2><p class="note">Rien n\'est visible sur le site avant votre validation.</p></div><div class="row">' + Object.keys(labels).map(function (k) {
        return '<button class="btn small' + (k === status ? ' main' : '') + '" type="button" data-status="' + k + '">' + labels[k] + '</button>';
      }).join('') + '</div></div>' + (res.comments.map(function (c) {
        return '<div class="card"><div class="title"><b>' + esc(c.nom) + '</b> · <span class="note">' + esc(new Date(c.created).toLocaleString('fr-FR')) + ' · ' + esc(c.episode) + ', ' + esc(c.episodeTitle) + '</span></div><p class="comment-text">' + esc(c.texte) + '</p><div class="row">' +
          (c.status !== 'approved' ? '<button class="btn small main" type="button" data-set="approved" data-id="' + c.id + '">Publier</button>' : '') +
          (c.status !== 'rejected' ? '<button class="btn small" type="button" data-set="rejected" data-id="' + c.id + '">Refuser</button>' : '') +
          '<button class="btn small danger" type="button" data-del="' + c.id + '">Supprimer</button></div></div>';
      }).join('') || '<div class="card empty">Aucun commentaire ici.</div>');
      view.onclick = function (ev) {
        var b = ev.target.closest('button');
        if (!b) return;
        if (b.dataset.status) { view.onclick = null; viewComments(view, b.dataset.status); }
        if (b.dataset.set) api('PUT', 'comments/' + b.dataset.id, { status: b.dataset.set }).then(function () { renderTabs(); viewComments(view, status); }).catch(fail);
        if (b.dataset.del && confirm('Supprimer définitivement ce commentaire ?')) api('DELETE', 'comments/' + b.dataset.del).then(function () { renderTabs(); viewComments(view, status); }).catch(fail);
      };
    }).catch(fail);
  }

  /* ---------- Services et contacts ---------- */
  function viewSettings(view) {
    api('GET', 'settings').then(function (res) {
      var c = res.contact, net = res.reseaux, netP = net.podcast || {}, netA = net.auteur || {};
      view.innerHTML = '<div class="head"><h2>Services et réseaux</h2></div><form><div class="card"><h3 style="margin-bottom:6px">Réseaux sociaux</h3><p class="note" style="margin-bottom:12px">Le pied de page utilise les liens du podcast, la page de l\'auteur les vôtres. Un champ vide masque l\'icône.</p><div class="fields">' +
        field('LinkedIn du podcast', 'podcastLinkedin', netP.linkedin, 'url') + field('TikTok du podcast', 'podcastTiktok', netP.tiktok, 'url') + field('LinkedIn de l\'auteur', 'auteurLinkedin', netA.linkedin, 'url') + field('TikTok de l\'auteur', 'auteurTiktok', netA.tiktok, 'url') + '</div></div>' +
        '<div class="card"><h3 style="margin-bottom:6px">Mes contacts</h3><p class="note" style="margin-bottom:12px">Ces coordonnées seront visibles publiquement sur la page Services. Un champ vide n\'est pas affiché.</p><div class="fields">' +
        field('Téléphone', 'telephone', c.telephone, 'tel') + field('WhatsApp (avec l\'indicatif, par exemple +221…)', 'whatsapp', c.whatsapp, 'tel') + field('E-mail', 'email', c.email, 'email') + '</div></div>' +
        res.services.map(function (s) {
          var box = function (label, key, html) { return '<label for="s-' + esc(s.id) + '-' + key + '" style="margin-top:10px">' + label + '</label>' + html.replace('@', 'id="s-' + esc(s.id) + '-' + key + '" data-k="' + key + '"'); };
          return '<div class="card" data-service="' + esc(s.id) + '">' +
            box('Titre du service', 'titre', '<input type="text" @ value="' + esc(s.titre) + '">') +
            box('Pour qui ?', 'pourQui', '<textarea rows="2" @>' + esc(s.pourQui) + '</textarea>') +
            box('Le problème résolu', 'probleme', '<textarea rows="2" @>' + esc(s.probleme) + '</textarea>') +
            box('Titre de la solution', 'solutionTitre', '<input type="text" @ value="' + esc(s.solutionTitre) + '">') +
            box('Solution, un point par ligne (« Libellé : texte » met le libellé en gras)', 'solution', '<textarea rows="5" @>' + esc(s.solution.join('\n')) + '</textarea>') + '</div>';
        }).join('') + '<button class="btn main" type="submit">Enregistrer</button></form>';
      view.querySelector('form').addEventListener('submit', function (ev) {
        ev.preventDefault();
        var f = formData(ev.target);
        api('PUT', 'settings', {
          contact: { telephone: f.telephone, whatsapp: f.whatsapp, email: f.email },
          reseaux: { podcast: { linkedin: f.podcastLinkedin, tiktok: f.podcastTiktok }, auteur: { linkedin: f.auteurLinkedin, tiktok: f.auteurTiktok } },
          services: Array.prototype.map.call(view.querySelectorAll('[data-service]'), function (box) {
            var value = function (k) { return box.querySelector('[data-k=' + k + ']').value; };
            return { id: box.dataset.service, titre: value('titre'), pourQui: value('pourQui'), probleme: value('probleme'), solutionTitre: value('solutionTitre'), solution: value('solution').split('\n') };
          })
        }).then(function () { toast('Enregistré.'); }).catch(fail);
      });
    }).catch(fail);
  }

  /* ---------- Compte ---------- */
  function viewAccount(view) {
    view.innerHTML = '<div class="head"><h2>Compte</h2></div>' +
      (provisional ? '<div class="card warn">Vous utilisez encore le mot de passe provisoire : remplacez-le ci-dessous.</div>' : '') +
      '<form class="card"><div class="fields">' + field('Mot de passe actuel', 'current', '', 'password') + field('Nouveau mot de passe (10 caractères au moins)', 'next', '', 'password') + '</div><button class="btn main" type="submit">Changer le mot de passe</button></form>';
    view.querySelector('form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      api('POST', 'password', formData(ev.target)).then(function () {
        provisional = false;
        toast('Mot de passe changé.');
        show('account');
      }).catch(fail);
    });
  }

  api('GET', 'me').then(function (r) {
    csrf = r.csrf; provisional = r.provisional;
    renderShell();
  }).catch(renderLogin);
})();
