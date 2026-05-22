/** 订单状态（与业务文案一致） */
export const ORDER_STATUS = {
  PENDING_RECEIVE: 'pending_receive',
  WASHING: 'washing',
  REPAIRING: 'repairing',
  FINISHED: 'finished',
  WAIT_PICKUP: 'wait_pickup',
  PICKED_UP: 'picked_up',
}

export const ORDER_STATUS_OPTIONS = [
  { value: ORDER_STATUS.PENDING_RECEIVE, label: '待接收' },
  { value: ORDER_STATUS.WASHING, label: '洗护中' },
  { value: ORDER_STATUS.REPAIRING, label: '修复中' },
  { value: ORDER_STATUS.FINISHED, label: '已完工' },
  { value: ORDER_STATUS.WAIT_PICKUP, label: '待取件' },
  { value: ORDER_STATUS.PICKED_UP, label: '已取件' },
]

/** Element Plus tag 类型映射 */
export const ORDER_STATUS_TAG_TYPE = {
  [ORDER_STATUS.PENDING_RECEIVE]: 'info',
  [ORDER_STATUS.WASHING]: 'primary',
  [ORDER_STATUS.REPAIRING]: 'warning',
  [ORDER_STATUS.FINISHED]: 'success',
  [ORDER_STATUS.WAIT_PICKUP]: 'warning',
  [ORDER_STATUS.PICKED_UP]: 'success',
}

export function getStatusLabel(value) {
  return ORDER_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value
}

/** 洗护项目（多选） */
export const WASH_SERVICE_OPTIONS = [
  { value: 'fine_wash', label: '精洗' },
  { value: 'deep_stain', label: '深度去污' },
  { value: 'hardware_polish', label: '五金抛光' },
  { value: 'color_restore', label: '补色修复' },
  { value: 'care', label: '保养护理' },
]

export function getWashServiceLabels(values) {
  if (!values?.length) return '—'
  return values
    .map((v) => WASH_SERVICE_OPTIONS.find((o) => o.value === v)?.label ?? v)
    .join('、')
}
