#!/usr/bin/env bash
set -Eeuo pipefail

# Mặc định = đường dẫn trên server. Local test: chạy `APP_DIR=/tmp/sit-test ./deploy.sh`
APP_DIR="${APP_DIR:-/home/dev/dev/sit}"
BRANCH="${BRANCH:-prod}"

# Chỉ vá PATH khi pnpm chưa có sẵn (server Ubuntu cần; máy mac thường đã có)
# ponytail: dò bản node nvm đã cài thay vì hardcode số phiên bản (v22, v24...) để khỏi hỏng khi nvm nâng cấp
if ! command -v pnpm >/dev/null 2>&1; then
  NVM_NODE_BIN="$(ls -d "$HOME"/.nvm/versions/node/*/bin 2>/dev/null | sort -V | tail -1)"
  export PATH="$HOME/.local/share/pnpm:$NVM_NODE_BIN:$PATH"
fi

echo "==> Deploy school-of-information-technology | dir=$APP_DIR branch=$BRANCH"
cd "$APP_DIR"

# Repo là private nên fetch qua HTTPS cần auth. Dùng GH_TOKEN (secrets.GITHUB_TOKEN từ
# workflow) qua header tạm thời cho riêng lệnh fetch này — không ghi token xuống .git/config.
GIT_AUTH_ARGS=()
if [ -n "${GH_TOKEN:-}" ]; then
  AUTH_HEADER="AUTHORIZATION: basic $(printf 'x-access-token:%s' "$GH_TOKEN" | base64 | tr -d '\n')"
  GIT_AUTH_ARGS=(-c "http.https://github.com/.extraheader=$AUTH_HEADER")
fi

git "${GIT_AUTH_ARGS[@]}" fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"   # ponytail: đồng bộ tuyệt đối với remote, xóa mọi thay đổi local

pnpm install --frozen-lockfile
pnpm build   # build cả backend + app + dashboard (root package.json)

# startOrReload: lần đầu -> start, các lần sau -> reload. Skip nếu máy test chưa cài pm2.
# ponytail: server dùng chung 1 pm2 daemon với nhiều app khác -> lọc bảng, chỉ in sit-*
# ({ grep || true; } để grep không match cũng không làm fail pipeline vì pipefail)
if command -v pm2 >/dev/null 2>&1; then
  pm2 startOrReload ecosystem.config.js --update-env | { grep -vE '^[┌│├└]' || true; }
  pm2 save
  pm2 list --no-color | { grep -E '│ name|sit-' || true; }
else
  echo "==> (bỏ qua pm2 — chưa cài, ok khi test build local)"
fi

echo "==> Done."
