#!/usr/bin/env bash
set -euo pipefail
# Run on the campus host as root with the reviewed source snapshot directory.
# No accounts are created here. Accounts use the separate password-stdin CLI.
source_dir="${1:?Usage: install-admin.sh SOURCE_DIRECTORY RELEASE_ID}"
release_id="${2:?A unique release ID is required}"
[[ "$release_id" =~ ^[a-zA-Z0-9][a-zA-Z0-9._-]{0,100}$ ]] || exit 2
[[ $(id -u) == 0 ]] || { echo 'Run the installer as root.' >&2; exit 2; }
test -f "$source_dir/server/app.py"
test -f "$source_dir/src/data/peopleContent.generated.json"
python3 -c 'import ensurepip' 2>/dev/null || {
    echo 'Install the distribution python3-venv package before running this installer.' >&2
    exit 2
}
base=/opt/mc2-admin
release="$base/releases/$release_id"
test ! -e "$release"
id mc2admin >/dev/null 2>&1 || useradd --system --home-dir /var/lib/mc2-admin --no-create-home --shell /usr/sbin/nologin --gid www-data mc2admin
install -d -m 755 "$base/releases"
install -d -m 750 -o mc2admin -g www-data /var/lib/mc2-admin /var/lib/mc2-admin/photos
install -d -m 700 -o mc2admin -g www-data /var/lib/mc2-admin/backups
install -d -m 755 "$release"
cp -a "$source_dir/server" "$release/server"
chown -R root:root "$release/server"
find "$release/server" -type d -name __pycache__ -prune -exec rm -r {} +
find "$release/server" -type d -exec chmod 755 {} +
find "$release/server" -type f -exec chmod 644 {} +
python3 -m venv "$release/venv"
if [[ -n "${MC2_WHEELHOUSE:-}" ]]; then
    "$release/venv/bin/pip" install --no-index --find-links "$MC2_WHEELHOUSE" -r "$release/server/requirements.txt"
else
    "$release/venv/bin/pip" install -r "$release/server/requirements.txt"
fi
cp "$source_dir/src/data/peopleContent.generated.json" "$release/seed-people.json"
chmod 644 "$release/seed-people.json"
if [[ ! -f /etc/mc2-admin.env ]]; then
    install -m 600 /dev/null /etc/mc2-admin.env
    cat > /etc/mc2-admin.env <<'ENV'
MC2_DATA_DIR=/var/lib/mc2-admin
MC2_ORIGIN=https://mc2.hkust-gz.edu.cn
MC2_TRUST_LOCAL_PROXY=1
ENV
fi
previous=''
if [[ -L "$base/current" ]]; then
    previous=$(readlink -f "$base/current")
fi
if [[ -f /var/lib/mc2-admin/admin.sqlite3 ]]; then
    (cd "$release" && runuser -u mc2admin -- "$release/venv/bin/python" -m server.cli backup)
fi
(cd "$release" && runuser -u mc2admin -- "$release/venv/bin/python" -m server.cli init --seed "$release/seed-people.json")
unit_path=/etc/systemd/system/mc2-admin.service
unit_backup="$release/previous-mc2-admin.service"
was_enabled=$(systemctl is-enabled mc2-admin.service 2>/dev/null || true)
if [[ -f "$unit_path" ]]; then
    cp -p "$unit_path" "$unit_backup"
fi
install -m 644 "$source_dir/deploy/mc2-admin.service" /etc/systemd/system/mc2-admin.service
ln -s "$release" "$base/current.next"
mv -Tf "$base/current.next" "$base/current"
healthy=0
# Keep restart errors inside the condition: set -e must not skip rollback.
if systemctl daemon-reload && systemctl enable mc2-admin.service && systemctl restart mc2-admin.service; then
    for attempt in {1..15}; do
        if curl --connect-timeout 1 --max-time 2 -fsS -H 'Host: mc2.hkust-gz.edu.cn' http://127.0.0.1:2027/api/healthz >/dev/null; then
            healthy=1
            break
        fi
        sleep 1
    done
fi
if [[ "$healthy" == 0 ]]; then
    systemctl stop mc2-admin.service || true
    if [[ -n "$previous" ]]; then
        ln -s "$previous" "$base/current.rollback"
        mv -Tf "$base/current.rollback" "$base/current"
    else
        # This symlink was created by the failed first installation only.
        [[ $(readlink -f "$base/current") != "$release" ]] || rm "$base/current"
    fi
    if [[ -f "$unit_backup" ]]; then
        install -m 644 "$unit_backup" "$unit_path"
        systemctl daemon-reload
        if [[ "$was_enabled" != enabled ]]; then
            systemctl disable mc2-admin.service || true
        fi
        systemctl restart mc2-admin.service || {
            echo 'Previous unit/code restored but restart failed; operator inspection required.' >&2
            exit 1
        }
    else
        systemctl disable mc2-admin.service || true
        rm "$unit_path"
        systemctl daemon-reload
    fi
    echo 'API health check failed; previous code restored when available. Database backup retained.' >&2
    exit 1
fi
echo "API release $release_id is healthy. Persistent content and accounts were preserved."
