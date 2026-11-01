# Wolof Tech, version Sénégal

Seconde version du site : noir et blanc, fond gris très clair, avec le vert, le jaune et le rouge du drapeau en accents. Seules les couleurs changent : les contenus et les fonctions sont ceux de la première version.

Le dossier est autonome : il se publie seul. Ses données sont dans `data/`, et le thème se trouve à la fin de `assets/style.css`.

Pour un nouvel épisode, lancer le script depuis ce dossier :

```bash
powershell -ExecutionPolicy Bypass -File tools\update-episodes.ps1
```

## Mise à jour automatique

Une fois le dossier publié sur GitHub, .github/workflows/mise-a-jour.yml vérifie chaque jour à 6 h UTC s'il y a un nouvel épisode, l'ajoute et republie le site. Il se lance aussi depuis l'onglet Actions (Run workflow) et à chaque modification.

Le résumé de chaque exécution indique ce qui reste à faire : vérifier la vidéo choisie, ajouter l'invité dans data/invites.js, décrire une nouvelle saison dans data/saisons.js. Les vidéos déjà associées ne changent plus : pour en corriger une, ajouter son identifiant dans $videoOverrides, en tête de 	ools/update-episodes.ps1.
