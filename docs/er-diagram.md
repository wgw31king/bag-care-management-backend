# 包包洗护门店管理系统 — ER 说明

## 实体关系

- **users** 与 **staff**：一对一可选关联（`users.staff_id` → `staff.id`），用于登录账号绑定员工权限。
- **customers** 与 **orders**：一对多（`orders.customer_id` 可选；亦按 `phone` 逻辑关联）。
- **wash_services**：独立配置表，与订单 `washServices[]` 为逻辑关联（英文 code 校验，无 FK）。

## 字段要点

| 表 | 关键字段 | 说明 |
|----|----------|------|
| orders | order_no (UK), status, wash_services (JSON), defect_images (JSON), created_at (BigInt ms) | 订单号服务端 `BW` + 时间戳末 10 位 |
| customers | phone (UK), tag, order_count, last_visit | 由订单聚合维护 |
| staff | status, permissions (JSON) | status: `在职` \| `停用` |
| wash_services | sort, enabled | 列表按 sort 升序 |

## 枚举（字符串存储）

- 订单 status: `pending_receive`, `washing`, `repairing`, `finished`, `wait_pickup`, `picked_up`
- 洗护 washServices: `fine_wash`, `deep_stain`, `hardware_polish`, `color_restore`, `care`
- 客户 tag: `普通`, `VIP`, `储值`
- 权限 permissions: `dashboard`, `order`, `customer`, `service`, `staff`, `finance`

## 聚合规则

订单创建/更新/删除后，按 `phone` 刷新对应客户：

- `orderCount` = 该手机号订单数
- `lastVisit` = 最新 `orderTime` 的日期部分 `YYYY-MM-DD`
