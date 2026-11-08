# Réglages et fonctions partagés par les scripts d'installation.
APP=/opt/woloftech
UTILISATEUR=woloftech
SAUVEGARDES=/var/backups/woloftech
ARCHIVE=https://github.com/diagoibrahima/woloftech/archive/refs/heads/main.tar.gz

exiger_root() {
  if [ "$(id -u)" -ne 0 ]; then
    echo "Lancez ce script avec sudo." >&2
    exit 1
  fi
}

# Copie le code sans toucher à la base, aux photos envoyées ni au contenu généré.
deployer_code() {
  local source_code=$1
  install -d -m 755 "$APP"
  rsync -rltp --delete --chmod=D755,F644 \
    --exclude=/.git/ --exclude=/.github/ \
    --exclude=/backend/data/ --exclude=/assets/uploads/ --exclude=/data/contenu.js \
    "$source_code"/ "$APP"/
  install -d -m 750 "$APP/backend/data"
  install -d -m 755 "$APP/assets/uploads"
  chown -R "$UTILISATEUR:$UTILISATEUR" "$APP/backend/data" "$APP/assets/uploads" "$APP/data"
  install -m 644 "$APP/deploy/woloftech.service" /etc/systemd/system/woloftech.service
  systemctl daemon-reload
}

verifier_site() {
  local essai
  for essai in $(seq 1 20); do
    if curl -fsS -o /dev/null http://127.0.0.1:8090/; then
      echo "Le site répond."
      return 0
    fi
    sleep 1
  done
  echo "Le site ne répond pas. Dernières lignes du journal :" >&2
  journalctl -u woloftech -n 30 --no-pager >&2
  return 1
}
