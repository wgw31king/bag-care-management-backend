# 阶段 9：前端对接指南（`/Users/wahhh/bag-wash-manage`）

> 本文档仅说明改造点，**不在此前端仓库自动改代码**。

## 环境变量

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## 1. `src/api/request.js`

- 使用 axios，`baseURL: import.meta.env.VITE_API_BASE_URL`
- 请求拦截：从 `localStorage.bagwash_token` 读取并设置 `Authorization: Bearer <token>`
- 响应拦截：`code !== 0` 时 `ElMessage.error(message)`；HTTP **401** 清除 token 并 `router.push('/login')`

## 2. Stores 改造（保留对外方法名）

| Store | 主要 API |
|-------|----------|
| `auth.js` | `POST /auth/login` → `setSession(token, displayName)`；`POST /auth/logout`；`GET /auth/me` |
| `order.js` | CRUD + `PATCH /orders/:id/status`；列表用服务端 `page/pageSize/total` |
| `customer.js` | CRUD + `tag`/`keyword` 查询 |
| `service.js` | CRUD `services`；注意列表项含 `code` 字段 |
| `staff.js` | CRUD `staff`；`status`: `在职` \| `离职` |

## 3. 列表页分页

`OrderList.vue` / `CustomerList.vue` / `ServiceConfig.vue` / `StaffManage.vue`：

- 删除 `filtered.slice` 前端分页
- `el-pagination` 的 `total` 使用接口返回的 `data.total`
- 翻页/搜索时请求 `page`、`pageSize`、`keyword`（及 `status`/`tag`/`enabled`）

## 4. `OrderFormDialog.vue` 上传

将 `el-upload` 的 `http-request` 改为：

```js
// 伪代码
const formData = new FormData()
formData.append('file', options.file) // 多图可循环或一次传多张同名字段
const { data } = await request.post('/upload/images', formData)
// data.urls 或 data.url 写入 form.defectImages
```

**不要**再使用 `FileReader` 转 base64。保存订单时 `defectImages` 仅传 URL。

## 5. `Dashboard.vue`

```js
const { data } = await request.get('/dashboard/summary', { params: { date: '2026-05-17' } })
// data.todayCount, washingCount, waitPickupCount, doneCount, revenue, prepay
```

可选：`GET /dashboard/revenue-trend?range=7d` 替换「模拟汇总」文案。

## 6. `vite.config.js` proxy（可选）

```js
server: {
  proxy: {
    '/api': { target: 'http://localhost:3001', changeOrigin: true },
  },
},
```

## 7. 手动测试清单

- [ ] 登录成功/失败提示；错误密码不泄露用户是否存在
- [ ] 登录后刷新页面 token 仍有效；过期 401 跳转登录
- [ ] 订单：新增、编辑、删、状态 PATCH、关键字/状态筛选、分页
- [ ] 上传瑕疵图后 URL 可预览；提交订单不含 `data:` URL
- [ ] 客户：CRUD；有订单客户不可删
- [ ] 服务配置：CRUD、enabled 筛选、sort 排序
- [ ] 员工：CRUD；无 `staff` 权限账号访问员工页 403
- [ ] 仪表盘数字与订单状态一致
