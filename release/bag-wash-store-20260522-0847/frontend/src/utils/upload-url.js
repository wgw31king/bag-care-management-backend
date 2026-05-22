/**
 * 上传图片存库为相对路径 /uploads/xxx.jpg，展示时需拼到 API 源站。
 * VITE_API_BASE_URL 示例：http://localhost:3001/api 或 /api（走 Vite 代理）
 */
function getApiOrigin() {
  const base = import.meta.env.VITE_API_BASE_URL || '/api'
  if (typeof window !== 'undefined' && base.startsWith('/')) {
    return window.location.origin
  }
  try {
    const u = new URL(base)
    const path = u.pathname.replace(/\/api\/?$/, '')
    return `${u.protocol}//${u.host}${path}`.replace(/\/$/, '') || u.origin
  } catch {
    return typeof window !== 'undefined' ? window.location.origin : ''
  }
}

/** 用于 img / el-upload 展示的完整地址 */
export function resolveUploadUrl(url) {
  if (!url || typeof url !== 'string') return ''
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url
  if (url.startsWith('/')) return `${getApiOrigin()}${url}`
  return url
}

/** 提交订单时仅存相对路径，便于迁移与换域名 */
export function toStoredUploadUrl(url) {
  if (!url || typeof url !== 'string') return ''
  if (url.startsWith('data:')) return ''
  const origin = getApiOrigin()
  if (origin && url.startsWith(origin)) {
    const path = url.slice(origin.length)
    return path.startsWith('/') ? path : `/${path}`
  }
  if (url.startsWith('/uploads/')) return url
  try {
    const u = new URL(url)
    if (u.pathname.startsWith('/uploads/')) return u.pathname
  } catch {
    /* ignore */
  }
  return url
}
