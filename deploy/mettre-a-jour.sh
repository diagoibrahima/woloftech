#!/usr/bin/env bash
# Installe la dernière version publiée sur GitHub, sans toucher à la base ni aux photos.
# Usage : sudo bash /opt/woloftech/deploy/mettre-a-jour.sh
set -euo pipefail

ICI=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=commun.sh
source "$ICI/commun.sh"
exiger_root

TMP_CODE=$(mktemp -d)
trap 'rm -rf "$TMP_CODE"' EXIT

curl -fsSL "$ARCHIVE" | tar -xz -C "$TMP_CODE" --strip-components=1
if [ ! -f "$TMP_CODE/backend/server.js" ]; then
  echo "L'archive reçue ne contient pas le site : rien n'a été modifié." >&2
  exit 1
fi
/usr/local/bin/node --check "$TMP_CODE/backend/server.js"

bash "$ICI/sauvegarder.sh"
deployer_code "$TMP_CODE"
systemctl restart woloftech
verifier_site
echo "Mise à jour terminée."
