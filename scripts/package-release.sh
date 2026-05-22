#!/usr/bin/env bash
# 前后端合并打包（Mac 开发机 → Windows 门店一键安装）
#
# 默认路径：
#   后端  /Users/wahhh/bag-wash-manage-backend
#   前端  /Users/wahhh/bag-wash-manage
#
# 用法：
#   ./scripts/package-release.sh
#   BACKEND_DIR=... FRONTEND_DIR=... ./scripts/package-release.sh

set -euo pipefail

BACKEND="${BACKEND_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
FRONTEND="${FRONTEND_DIR:-/Users/wahhh/bag-wash-manage}"
STAMP="$(date +%Y%m%d-%H%M)"
OUT="$BACKEND/release/bag-wash-store-$STAMP"
ZIP="$BACKEND/release/bag-wash-store-$STAMP.zip"

echo "=========================================="
echo "  包包洗护 - 合并打包"
echo "  后端: $BACKEND"
echo "  前端: $FRONTEND"
echo "=========================================="

if [[ ! -f "$BACKEND/package.json" ]]; then
  echo "错误: 后端目录无效 $BACKEND"
  exit 1
fi
if [[ ! -f "$FRONTEND/package.json" ]]; then
  echo "错误: 前端目录无效 $FRONTEND"
  echo "请设置 FRONTEND_DIR=/Users/wahhh/bag-wash-manage"
  exit 1
fi

echo "==> 清理旧产物"
rm -rf "$BACKEND/release"/bag-wash-store-*
rm -rf "$OUT" "$ZIP"
mkdir -p "$OUT/backend" "$OUT/frontend" "$OUT/uploads" "$OUT/deploy"

echo "==> 构建后端"
cd "$BACKEND"
if [[ ! -d node_modules/@nestjs/core ]] || [[ ! -f node_modules/.bin/nest ]]; then
  echo "    安装后端依赖..."
  npm ci
fi
npm run build
npx prisma generate

echo "==> 复制后端到发布包"
cp -R dist "$OUT/backend/dist"
cp -R prisma "$OUT/backend/prisma"
cp package.json package-lock.json "$OUT/backend/"
cp docker-compose.yml "$OUT/"
cp -R "$BACKEND/deploy/windows/." "$OUT/deploy/"
cp "$BACKEND/deploy/windows/部署说明-Windows.txt" "$OUT/"

echo "==> 复制前端源码（排除 node_modules / dist / .git）"
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

cp "$BACKEND/解压必读.txt" "$OUT/"

cat > "$OUT/安装.bat" <<'EOF'
@echo off
cd /d "%~dp0"
call deploy\install.bat
EOF
cat > "$OUT/启动.bat" <<'EOF'
@echo off
cd /d "%~dp0"
call deploy\start.bat
EOF

cat > "$OUT/版本说明.txt" <<EOF
包包洗护门店系统 合并安装包
打包时间: $(date '+%Y-%m-%d %H:%M:%S')
后端路径: $BACKEND
前端路径: $FRONTEND

目录:
  backend/   后端（dist + prisma）
  frontend/  前端源码（安装时 npm build）
  deploy/    Windows 脚本

解压后见 解压必读.txt
首次: deploy\\install.bat
启动: deploy\\start.bat
访问: http://localhost:3001
账号: admin / admin
EOF

echo "==> 压缩 zip（根目录直接是 backend/frontend/deploy，避免双层文件夹）"
cd "$OUT"
zip -rq "$ZIP" .

echo ""
echo "=========================================="
echo "  打包完成"
echo "  文件夹: $OUT"
echo "  ZIP:     $ZIP"
echo "  大小:    $(du -sh "$ZIP" | cut -f1)"
echo "=========================================="
echo "发给客户后: 解压 → 安装 Node + Docker → deploy\\install.bat"
