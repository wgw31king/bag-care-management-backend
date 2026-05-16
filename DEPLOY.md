# 部署说明（bag-wash-manage-backend）

## 环境变量（生产 `.env`，勿提交 git）

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 连接串 |
| `JWT_SECRET` | 强随机字符串 |
| `JWT_EXPIRES_IN` | 如 `7d` |
| `PORT` | 应用端口，默认 3001 |
| `UPLOAD_DIR` | 本地上传目录（仅 `STORAGE_DRIVER=local`） |
| `PUBLIC_BASE_URL` | 对外访问域名，如 `https://api.example.com` |
| `STORAGE_DRIVER` | `local` 或 `oss` |
| `MAX_UPLOAD_SIZE_MB` | 默认 5 |

OSS（实现 `OssStorageService` 后）：

- `OSS_ENDPOINT`、`OSS_BUCKET`、`OSS_ACCESS_KEY`、`OSS_SECRET_KEY`

## 构建与迁移

```bash
npm ci
npm run build
npx prisma migrate deploy
npm run prisma:seed   # 仅首次或测试环境
node dist/main.js
```

推荐使用 **pm2** 或 systemd 守护进程。

## Nginx 反代示例

```nginx
server {
  listen 443 ssl http2;
  server_name api.example.com;

  ssl_certificate     /path/fullchain.pem;
  ssl_certificate_key /path/privkey.pem;

  client_max_body_size 10m;

  location /api/ {
    proxy_pass http://127.0.0.1:3001/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /uploads/ {
    alias /var/www/bagwash/uploads/;
    expires 30d;
    add_header Cache-Control "public";
  }
}
```

前端静态站点单独部署；`VITE_API_BASE_URL=https://api.example.com/api`。

## 上传目录权限

```bash
mkdir -p /var/www/bagwash/uploads
chown -R www-data:www-data /var/www/bagwash/uploads
chmod 750 /var/www/bagwash/uploads
```

## 安全 checklist

- [ ] 修改默认 `admin` 密码
- [ ] `JWT_SECRET` 足够长且唯一
- [ ] 数据库仅内网可达
- [ ] HTTPS 全站
- [ ] `.env` 在 `.gitignore` 中

## 性能（订单 1 万+）

- 已建索引：`phone`、`status`、`orderTime`、`deletedAt`
- 列表务必走服务端分页，避免一次拉全表
- 本地压测示例：`ab -n 100 -c 10 -H "Authorization: Bearer ..." "http://localhost:3001/api/orders?page=1&pageSize=20"`
