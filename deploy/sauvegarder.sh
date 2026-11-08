#!/usr/bin/env bash
# Sauvegarde la base et les photos, et garde 14 jours d'historique.
# Lancé chaque nuit ; peut aussi se lancer à la main avec sudo.
set -euo pipefail

ICI=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=commun.sh
source "$ICI/commun.sh"
exiger_root

DATE=$(date +%F-%H%M)
install -d -m 700 "$SAUVEGARDES"

# .backup donne une copie cohérente même pendant que le site écrit dans la base.
if [ -f "$APP/backend/data/woloftech.db" ]; then
  sqlite3 "$APP/backend/data/woloftech.db" ".backup '$SAUVEGARDES/base-$DATE.db'"
fi
tar -czf "$SAUVEGARDES/photos-$DATE.tar.gz" -C "$APP/assets" uploads

find "$SAUVEGARDES" -maxdepth 1 -type f -mtime +14 -delete
echo "Sauvegarde terminée : $SAUVEGARDES ($DATE)"
