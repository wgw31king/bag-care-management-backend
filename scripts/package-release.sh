#!/usr/bin/env bash
# Mac 打包：前后端合并为一个 zip，Windows 上执行「一键安装」完成部署
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND="${FRONTEND_DIR:-$ROOT/../bag-wash-manage}"
STAMP="$(date +%Y%m%d)"
OUT="$ROOT/release/bag-wash-store-$STAMP"
ZIP="$ROOT/release/bag-wash-store-$STAMP.zip"

if [[ ! -d "$FRONTEND" ]]; then
  echo "错误: 未找到前端项目 $FRONTEND"
  echo "用法: FRONTEND_DIR=/path/to/bag-wash-manage ./scripts/package-release.sh"
  exit 1
fi

echo "==> 清理旧产物"
rm -rf "$OUT" "$ZIP"
mkdir -p "$OUT/backend" "$OUT/frontend" "$OUT/uploads" "$OUT/deploy"

echo "==> 构建后端 $ROOT"
cd "$ROOT"
if [[ ! -d node_modules/@nestjs/core ]]; then
  npm ci
fi
npm run build
npx prisma generate

echo "==> 组装发布包（不含 node_modules）"
cd "$ROOT"
cp -R dist "$OUT/backend/dist"
cp -R prisma "$OUT/backend/prisma"
cp package.json package-lock.json "$OUT/backend/"
cp docker-compose.yml "$OUT/"
cp -R deploy/windows/. "$OUT/deploy/"
cp "$ROOT/deploy/windows/部署说明-Windows.txt" "$OUT/"

# 前端源码（排除 node_modules、dist、.git）
echo "==> 复制前端源码 $FRONTEND"
if command -v rsync >/dev/null 2>&1; then
  rsync -a \
    --exclude node_modules \
    --exclude dist \
    --exclude .git \
    "$FRONTEND/" "$OUT/frontend/"
else
  (cd "$FRONTEND" && tar cf - \
    --exclude=node_modules --exclude=dist --exclude=.git \
    .) | (cd "$OUT/frontend" && tar xf -)
fi

touch "$OUT/uploads/.gitkeep"

cat > "$OUT/backend/.env.example" <<'EOF'
DATABASE_URL="postgresql://bagwash:bagwash@localhost:5432/bagwash?schema=public"
JWT_SECRET="请改为随机长字符串"
JWT_EXPIRES_IN="7d"
PORT=3001
UPLOAD_DIR="uploads"
MAX_UPLOAD_SIZE_MB=5
STORAGE_DRIVER=local
FRONTEND_DIST="../frontend/dist"
EOF
cp "$OUT/backend/.env.example" "$OUT/backend/.env"

cat > "$OUT/frontend/.env.production" <<'EOF'
VITE_API_BASE_URL=/api
EOF

cd "$ROOT/release"
zip -r "$(basename "$ZIP")" "$(basename "$OUT")"
echo ""
echo "完成: $ZIP"
echo "包含: backend/ + frontend/ + deploy/一键安装脚本"
echo "客户 Windows: 安装 Node + Docker 后，运行 deploy\\00-一键安装.bat"
