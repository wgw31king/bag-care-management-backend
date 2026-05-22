# 前后端合并打包 → Windows 一键安装

## 一、Mac 上打包（一次打出完整安装包）

### 目录要求

```
~/bag-wash-manage-backend/   # 后端
~/bag-wash-manage/           # 前端（与后端同级）
```

### 执行

```bash
cd ~/bag-wash-manage-backend
chmod +x scripts/package-release.sh
./scripts/package-release.sh
```

前端路径不同时：

```bash
FRONTEND_DIR=/path/to/bag-wash-manage ./scripts/package-release.sh
```

### 产物 `bag-wash-store-YYYYMMDD.zip`

```
bag-wash-store-xxx/
├── backend/              # 已编译 dist + prisma + package.json
├── frontend/             # 前端完整源码（无 node_modules）
├── uploads/
├── docker-compose.yml
├── deploy/
│   ├── 00-一键安装.bat    # 客户首次运行
│   ├── 01-启动系统.bat
│   └── 02-停止数据库.bat
└── 部署说明-Windows.txt
```

**不在 Mac 上打包 node_modules**；Windows 安装脚本里自动 `npm ci`。

---

## 二、客户 Windows 准备

安装并启动：

1. **Node.js 20 LTS**（64 位）
2. **Docker Desktop**

解压 zip 到例如 `D:\bag-wash-store`（路径尽量无中文）。

---

## 三、客户一键安装（仅首次）

双击 **`deploy\00-一键安装.bat`**，自动完成：

| 步骤 | 内容 |
|------|------|
| 1 | `docker compose up -d` 启动 PostgreSQL |
| 2 | `backend` → `npm ci`、Prisma 迁移、seed（admin/admin） |
| 3 | `frontend` → `npm ci`、`npm run build` |
| 4 | 生成 `frontend/dist`，供后端托管 |

完成后双击 **`deploy\01-启动系统.bat`**，浏览器打开 **http://localhost:3001**。

---

## 四、日常使用

| 操作 | 脚本 |
|------|------|
| 开机启动系统 | `deploy\01-启动系统.bat` |
| 关闭系统 | 关掉启动窗口 |
| 长期停用数据库 | `deploy\02-停止数据库.bat` |

---

## 五、环境变量（`backend\.env`）

安装脚本会复制 `.env.example`。关键项：

```env
FRONTEND_DIST="../frontend/dist"
PORT=3001
```

前端构建使用 `frontend\.env.production`：`VITE_API_BASE_URL=/api`

---

## 六、备份

- 数据库：Docker 卷 `bagwash_pg_data`
- 图片：`uploads\` 目录

---

## 七、改代码后重新发给客户

1. Mac 修改 `bag-wash-manage` 或后端后重新 `./scripts/package-release.sh`
2. 客户覆盖解压（保留 `uploads` 与 Docker 数据卷）
3. 再运行一次 `00-一键安装.bat`（或仅 `frontend` 下 `npm run build` + 重启）
