# 洗护服务：订单枚举 code vs 门店定价表

## 两套概念

| 维度 | 订单字段 `washServices[]` | 表 `wash_services` |
|------|---------------------------|---------------------|
| 用途 | 订单勾选的洗护项目（固定枚举） | 门店可配置的定价/工时 |
| 取值 | `fine_wash` 等 5 个 **code** | `code` 可选关联 + `name` 中文名 |
| 前端 | `constants/order.js` → `WASH_SERVICE_OPTIONS` | `stores/service.js` 列表 CRUD |

## 枚举 code（勿改）

与前端 `WASH_SERVICE_OPTIONS` 一致：

- `fine_wash` — 精洗
- `deep_stain` — 深度去污
- `hardware_polish` — 五金抛光
- `color_restore` — 补色修复
- `care` — 保养护理

## 数据库 `wash_services.code`

- 可选唯一字段，seed 已与上表 5 项对齐。
- 订单保存时 **只校验枚举 code**，不强制 FK 到配置表。
- 门店可在配置表调整 `price`/`durationMin`，订单历史仍保留下单时的 code 数组。

## 前端展示

订单列表/详情用 `getWashServiceLabels(code[])` 将 code 译为中文；配置页展示 `wash_services.name` 与价格。
