# Mettre le site Wolof Tech sur un VPS OVH

Remplacez `VOTRE_IP` par l'adresse du VPS et `votre-domaine.sn` par le domaine choisi.

## 1. Avant de commencer

- Le serveur récupère le code sur GitHub : la version voulue, avec le dossier `deploy/`, doit y être publiée.
- Commandez un VPS avec **Ubuntu 24.04** (2 vCores, 4 Go de RAM, 40 Go). OVH envoie son adresse IP et son mot de passe par e-mail.
- Commencez par un sous-domaine d'essai, par exemple `nouveau.votre-domaine.sn`. Le site actuel reste ainsi en place tant que le nouveau n'est pas validé.

## 2. Se connecter au VPS

Depuis PowerShell, sur votre ordinateur :

```bash
ssh ubuntu@VOTRE_IP
```

Changez le mot de passe si le système le demande. Si vous avez choisi Debian, l'utilisateur est `debian` au lieu de `ubuntu`, ici et dans la suite.

## 3. Installer le site

Sur le VPS :

```bash
curl -fsSL https://github.com/diagoibrahima/woloftech/archive/refs/heads/main.tar.gz | tar -xz
```

```bash
sudo bash woloftech-main/deploy/installer.sh votre-domaine.sn
```

Pour plusieurs noms, ajoutez-les à la suite : `votre-domaine.sn www.votre-domaine.sn`.

Ouvrez ensuite `http://VOTRE_IP/` : le site doit s'afficher. L'administration ne permet pas encore de se connecter, c'est normal : elle exige HTTPS.

## 4. Transférer vos contenus

Sur votre ordinateur, **arrêtez d'abord le site local** (Ctrl + C dans son terminal), puis dans PowerShell, depuis le dossier `version-senegal` :

```bash
ssh ubuntu@VOTRE_IP mkdir -p transfert
```

```bash
scp -r backend/data ubuntu@VOTRE_IP:transfert/data
```

```bash
scp -r assets/uploads ubuntu@VOTRE_IP:transfert/uploads
```

Puis sur le VPS :

```bash
sudo bash /opt/woloftech/deploy/importer-donnees.sh
```

Vos épisodes, panels, photos, commentaires et votre mot de passe d'administration sont maintenant sur le serveur. Une fois le site vérifié, supprimez la copie de transfert avec `rm -rf ~/transfert`.

## 5. Faire pointer le domaine

Chez le gestionnaire du domaine, créez un enregistrement DNS de type **A** :

| Nom | Type | Valeur |
|---|---|---|
| le domaine ou le sous-domaine | A | VOTRE_IP |

La prise en compte peut prendre de quelques minutes à quelques heures. Pour vérifier :

```bash
nslookup votre-domaine.sn
```

## 6. Activer HTTPS

Quand le domaine répond avec la bonne adresse, sur le VPS (cette commande accepte les conditions de Let's Encrypt) :

```bash
sudo bash /opt/woloftech/deploy/activer-https.sh votre-adresse@exemple.com votre-domaine.sn
```

## 7. Vérifications finales

- [ ] `https://votre-domaine.sn/` s'affiche avec le cadenas.
- [ ] Connexion à `https://votre-domaine.sn/admin/` et ajout d'une photo.
- [ ] Publication d'un commentaire de test sur un épisode.
- [ ] Une question orale à Banga (le micro exige HTTPS).
- [ ] Les nouveaux épisodes arrivent : lancer la vérification du flux dans l'administration.

## Au quotidien

Installer la dernière version publiée sur GitHub (une sauvegarde est faite juste avant) :

```bash
sudo bash /opt/woloftech/deploy/mettre-a-jour.sh
```

Voir l'état du site et son journal :

```bash
sudo systemctl status woloftech
```

```bash
sudo journalctl -u woloftech -n 50
```

Redémarrer le site :

```bash
sudo systemctl restart woloftech
```

## Sauvegardes

Chaque nuit à 3 h 30, la base et les photos sont copiées dans `/var/backups/woloftech/`, avec 14 jours d'historique. Ces copies restent sur le même serveur : téléchargez-en une de temps en temps, ou activez l'option de sauvegarde d'OVH. Si le VPS disparaît, elles disparaissent avec lui.

Pour lancer une sauvegarde à la main :

```bash
sudo bash /opt/woloftech/deploy/sauvegarder.sh
```

## Sécurité

- Le mot de passe d'administration vient de votre site local : choisissez-en un long avant la mise en ligne.
- Préférez une clé SSH au mot de passe pour vous connecter au VPS.
- Le serveur installe seul les correctifs de sécurité du système. Pour Node.js, relancez `installer.sh` après avoir retiré `/usr/local/bin/node` si une mise à jour est annoncée.
