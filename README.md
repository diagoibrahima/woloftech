# Wolof Tech, version Sénégal

## Backend

Le backend sert le site, l'administration et les commentaires. Il ne demande que Node.js 24 ou plus récent, sans dépendance à installer.

```bash
node backend/server.js
```

- Site : http://127.0.0.1:8090/
- Administration : http://127.0.0.1:8090/admin/ (identifiant `admin`)
- Tests : `node --test backend/test/`

Au premier lancement, le mot de passe provisoire est écrit dans `backend/data/premier-mot-de-passe.txt`. Ce fichier disparaît quand le mot de passe est changé dans l'onglet Compte.

Le flux RSS est lu au démarrage puis toutes les 6 heures, tant que le backend tourne. Chaque nouvel épisode apparaît dans « À compléter » pour y ajouter invités, sponsors et vidéo.

Chaque enregistrement réécrit `data/contenu.js`, le fichier que lisent les pages : invités et avatars, shorts, panels et invitations, photos du studio, services, contacts, réseaux sociaux, sponsors et épisodes détectés. Publier ce fichier et `assets/uploads/` suffit à mettre à jour un hébergement statique comme GitHub Pages. Les commentaires, eux, exigent un backend en ligne : sans lui, leur section ne s'affiche pas.

`backend/data/` contient la base et n'entre jamais dans le dépôt : à sauvegarder séparément.

Pour une mise en ligne, placer le backend derrière un proxy HTTPS, avec `HOST`, `PORT`, `WT_TRUST_PROXY=1` et `WT_COOKIE_SECURE=1`.

## Site

Seconde version du site : noir et blanc, fond gris très clair, avec le vert, le jaune et le rouge du drapeau en accents. Seules les couleurs changent : les contenus et les fonctions sont ceux de la première version.

Le dossier est autonome : il se publie seul. Ses données sont dans `data/`, et le thème se trouve à la fin de `assets/style.css`.

Pour un nouvel épisode, lancer le script depuis ce dossier :

```bash
powershell -ExecutionPolicy Bypass -File tools\update-episodes.ps1
```

## Mise à jour automatique

Une fois le dossier publié sur GitHub, .github/workflows/mise-a-jour.yml vérifie chaque jour à 6 h UTC s'il y a un nouvel épisode, l'ajoute et republie le site. Il se lance aussi depuis l'onglet Actions (Run workflow) et à chaque modification.

Le résumé de chaque exécution indique ce qui reste à faire : vérifier la vidéo choisie, ajouter l'invité dans data/invites.js, décrire une nouvelle saison dans data/saisons.js. Les vidéos déjà associées ne changent plus : pour en corriger une, ajouter son identifiant dans $videoOverrides, en tête de 	ools/update-episodes.ps1.

## Banga, l'agent virtuel

Banga s'affiche en bas à droite de toutes les pages, sauf les shorts. Tout son code est dans `assets/app.js` : il répond aux questions courantes sur le podcast et cherche dans les titres, descriptions et invités des épisodes, directement dans le navigateur. Il fonctionne donc aussi sur un hébergement statique. À l'oral, il utilise le service vocal du navigateur, en français.
