#!/usr/bin/env bash
# Installe sur le serveur la base et les photos envoyées depuis l'ordinateur.
# Attend <dossier>/data/woloftech.db et <dossier>/uploads/.
# Usage : sudo bash /opt/woloftech/deploy/importer-donnees.sh [dossier]
set -euo pipefail

ICI=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=commun.sh
source "$ICI/commun.sh"
exiger_root

DOSSIER=${1:-/home/${SUDO_USER:-ubuntu}/transfert}
if [ ! -f "$DOSSIER/data/woloftech.db" ]; then
  echo "Base introuvable : $DOSSIER/data/woloftech.db" >&2
  exit 1
fi
if [ ! -d "$DOSSIER/uploads" ]; then
  echo "Dossier de photos introuvable : $DOSSIER/uploads" >&2
  exit 1
fi

RESULTAT=$(sqlite3 "$DOSSIER/data/woloftech.db" 'PRAGMA integrity_check;')
if [ "$RESULTAT" != "ok" ]; then
  echo "La base reçue est abîmée : $RESULTAT" >&2
  exit 1
fi

systemctl stop woloftech

# La base présente sur le serveur est mise de côté, jamais effacée.
ANCIENNE="$SAUVEGARDES/avant-import-$(date +%F-%H%M%S)"
install -d -m 700 "$ANCIENNE"
find "$APP/backend/data" -maxdepth 1 -type f -exec mv -t "$ANCIENNE" {} +

cp "$DOSSIER"/data/woloftech.db* "$APP/backend/data/"
rsync -rlt "$DOSSIER"/uploads/ "$APP/assets/uploads/"
chown -R "$UTILISATEUR:$UTILISATEUR" "$APP/backend/data" "$APP/assets/uploads"

systemctl start woloftech
verifier_site

echo
echo "Données installées. Ancienne base gardée dans $ANCIENNE."
echo "Vérifiez le site, puis supprimez la copie de transfert : rm -rf $DOSSIER"
