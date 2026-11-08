#!/usr/bin/env bash
# Prépare un VPS Ubuntu ou Debian neuf et y lance le site.
# Usage : sudo bash deploy/installer.sh woloftech.sn [www.woloftech.sn]
set -euo pipefail

ICI=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=commun.sh
source "$ICI/commun.sh"
exiger_root

if [ "$#" -lt 1 ]; then
  echo "Indiquez le domaine : sudo bash deploy/installer.sh votre-domaine.sn" >&2
  exit 1
fi
for domaine in "$@"; do
  if ! [[ "$domaine" =~ ^[A-Za-z0-9.-]+$ ]]; then
    echo "Domaine invalide : $domaine" >&2
    exit 1
  fi
done

echo "== Paquets du système"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx rsync sqlite3 curl xz-utils ufw unattended-upgrades
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'FIN'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
FIN

echo "== Node.js 26"
NODE_ACTUEL=$(command -v node >/dev/null 2>&1 && node -v || true)
if [[ "$NODE_ACTUEL" != v26.* ]]; then
  case "$(uname -m)" in
    x86_64) ARCH=x64 ;;
    aarch64) ARCH=arm64 ;;
    *) echo "Processeur non pris en charge : $(uname -m)" >&2; exit 1 ;;
  esac
  BASE=https://nodejs.org/dist/latest-v26.x
  TMP_NODE=$(mktemp -d)
  curl -fsSL "$BASE/SHASUMS256.txt" -o "$TMP_NODE/SHASUMS256.txt"
  FICHIER=$(awk -v f="linux-$ARCH.tar.xz" 'index($2, f) { print $2; exit }' "$TMP_NODE/SHASUMS256.txt")
  curl -fsSL "$BASE/$FICHIER" -o "$TMP_NODE/$FICHIER"
  # Le fichier téléchargé doit correspondre à l'empreinte publiée par Node.js.
  (cd "$TMP_NODE" && awk -v f="$FICHIER" '$2 == f' SHASUMS256.txt | sha256sum -c -)
  install -d /usr/local/lib/nodejs
  tar -xJf "$TMP_NODE/$FICHIER" -C /usr/local/lib/nodejs
  ln -sfn "/usr/local/lib/nodejs/${FICHIER%.tar.xz}/bin/node" /usr/local/bin/node
  rm -rf "$TMP_NODE"
fi
/usr/local/bin/node -v

echo "== Compte du service et code du site"
if ! id "$UTILISATEUR" >/dev/null 2>&1; then
  useradd --system --no-create-home --home-dir /nonexistent --shell /usr/sbin/nologin "$UTILISATEUR"
fi
deployer_code "$(cd "$ICI/.." && pwd)"
if [ ! -f /etc/woloftech.env ]; then
  install -m 600 "$APP/deploy/woloftech.env.example" /etc/woloftech.env
fi

echo "== Nginx"
sed "s/__DOMAINES__/$*/" "$APP/deploy/nginx-woloftech.conf" > /etc/nginx/sites-available/woloftech
ln -sfn /etc/nginx/sites-available/woloftech /etc/nginx/sites-enabled/woloftech
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl restart nginx

echo "== Sauvegarde quotidienne, à 3 h 30"
install -d -m 700 "$SAUVEGARDES"
cat > /etc/cron.d/woloftech <<'FIN'
30 3 * * * root /bin/bash /opt/woloftech/deploy/sauvegarder.sh > /dev/null
FIN

echo "== Pare-feu"
# Garde ouvert le port SSH réellement utilisé, pour ne pas perdre l'accès au serveur.
PORT_SSH=$(sshd -T 2>/dev/null | awk '/^port / { print $2; exit }' || true)
ufw allow "${PORT_SSH:-22}/tcp"
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "== Démarrage du site"
systemctl enable woloftech
systemctl restart woloftech
verifier_site

echo
echo "Installation terminée. Suite : transférer vos données, puis activer HTTPS (voir GUIDE-OVH.md)."
