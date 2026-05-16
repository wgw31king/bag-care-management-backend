export const ORDER_STATUS = [
  'pending_receive',
  'washing',
  'repairing',
  'finished',
  'wait_pickup',
  'picked_up',
] as const;

export const WASH_SERVICES = [
  'fine_wash',
  'deep_stain',
  'hardware_polish',
  'color_restore',
  'care',
] as const;

export const CUSTOMER_TAGS = ['普通', 'VIP', '储值'] as const;

export const STAFF_STATUS = ['在职', '停用'] as const;

export const PERMISSIONS = [
  'dashboard',
  'order',
  'customer',
  'service',
  'staff',
  'finance',
] as const;

export type OrderStatus = (typeof ORDER_STATUS)[number];
export type WashServiceCode = (typeof WASH_SERVICES)[number];
export type CustomerTag = (typeof CUSTOMER_TAGS)[number];
export type StaffStatus = (typeof STAFF_STATUS)[number];
export type Permission = (typeof PERMISSIONS)[number];
