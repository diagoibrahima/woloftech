#!/usr/bin/env bash
# Demande le certificat HTTPS gratuit, une fois que le domaine pointe vers ce serveur.
# Usage : sudo bash /opt/woloftech/deploy/activer-https.sh adresse@exemple.com woloftech.sn [www.woloftech.sn]
set -euo pipefail

ICI=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=commun.sh
source "$ICI/commun.sh"
exiger_root

if [ "$#" -lt 2 ]; then
  echo "Usage : sudo bash activer-https.sh adresse@exemple.com votre-domaine.sn" >&2
  exit 1
fi
EMAIL=$1
shift

OPTIONS=()
for domaine in "$@"; do
  OPTIONS+=(-d "$domaine")
done

certbot --nginx --non-interactive --agree-tos --no-eff-email --redirect -m "$EMAIL" "${OPTIONS[@]}"
systemctl reload nginx
echo "HTTPS est actif. Le certificat se renouvelle tout seul."
