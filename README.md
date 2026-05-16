# 包包洗护门店管理系统 — 后端 API

NestJS + Prisma + PostgreSQL，为 Vue 3 前端提供 REST API。

## 快速开始

### 1. 环境

- Node.js 18+
- Docker（PostgreSQL）

### 2. 安装与数据库

```bash
cp .env.example .env
docker compose up -d
npm install
npx prisma migrate dev
npm run prisma:seed
```

默认管理员：`admin` / `admin123`

登录后 token 对应前端 `localStorage` 键名 `bagwash_token`，显示名 `bagwash_user`。

### 3. 启动

```bash
npm run start:dev
```

服务地址：`http://localhost:3001/api`

静态上传：`http://localhost:3001/uploads/<filename>`

## API 文档

- OpenAPI：[docs/openapi.yaml](docs/openapi.yaml)
- ER 说明：[docs/er-diagram.md](docs/er-diagram.md)

## 统一响应

```json
{ "code": 0, "message": "ok", "data": {} }
```

分页 `data`：

```json
{ "list": [], "total": 0, "page": 1, "pageSize": 10 }
```

## curl 示例

```bash
# 登录
curl -s -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'

# 将返回的 token 填入
export TOKEN="<jwt>"

# 订单列表
curl -s "http://localhost:3001/api/orders?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN"

# 仪表盘
curl -s http://localhost:3001/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"

# 上传瑕疵图
curl -s -X POST http://localhost:3001/api/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/image.jpg"
```

## 模块

| 路径 | 说明 |
|------|------|
| `/auth/login` | 登录 |
| `/auth/logout` | 登出 |
| `/auth/me` | 当前用户 |
| `/orders` | 订单 CRUD |
| `/customers` | 客户 CRUD |
| `/services` | 洗护服务配置 |
| `/staff` | 员工与权限 |
| `/dashboard/stats` | 仪表盘统计 |
| `/files/upload` | 瑕疵图片上传 |

## 前端联调

前端项目（只读参考）：`/Users/wahhh/bag-wash-manage`

建议配置：

```env
VITE_API_BASE=http://localhost:3001/api
```

请求头：`Authorization: Bearer <token>`
