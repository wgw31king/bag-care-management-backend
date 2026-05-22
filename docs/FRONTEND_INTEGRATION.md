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

**不要**再使用 `FileReader` 转 base64。保存订单时 `defectImages` 仅传相对路径 URL（如 `/uploads/xxx.jpg`）。

展示图片时用 `resolveUploadUrl()`（`src/utils/upload-url.js`）拼到 API 源站，例如 `http://localhost:3001/uploads/xxx.jpg`；开发环境也可在 `vite.config.js` 代理 `/uploads`。

## 5. 员工登录与切换用户

- **新建**员工：登录账号与初始密码**必填且须同时提交**（后端 `CreateStaffDto` 强制）。
- **编辑**已有员工：管理员可只改资料/只改账号/只改密码；密码留空表示不改。无账号的旧员工补建登录仍须账号+密码同时填。
- 右上角 **切换用户**：`GET /api/auth/switchable-users` 列出在职且已绑账号的员工；输入对方密码后走 `POST /api/auth/login` 换 JWT，菜单按 `permissions` 隐藏。
- **员工管理**仅 `isManager`（`admin` 或岗位「店长」）可访问 ` /api/staff/*`；普通员工即使勾选旧版「员工权限」也不可编辑。
- 可分配权限仅：`dashboard`、`order`、`customer`、`service`（无 `finance`、`staff`）。
- 店长角色（`role === 店长`）登录后 `isManager: true`，业务接口仍拥有全部模块权限。

## 6. `Dashboard.vue`

```js
const { data } = await request.get('/dashboard/summary', { params: { date: '2026-05-17' } })
// data.todayCount、revenue、prepay 均按 date 当日（orderTime 日期前缀，北京时间 UTC+8）统计
// washingCount、waitPickupCount、doneCount 为全库实时状态计数
// 前端日期工具：utils/beijing-date.js，与后端 common/utils/beijing-date.ts 一致
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
