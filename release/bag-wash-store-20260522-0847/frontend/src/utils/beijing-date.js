/** 北京时间（UTC+8），IANA 时区 Asia/Shanghai */
export const BEIJING_TZ = 'Asia/Shanghai'

/** 北京时间下的 YYYY-MM-DD */
export function beijingDateString(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BEIJING_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function beijingToday() {
  return beijingDateString()
}

/** 北京时间下的 YYYY-MM-DD HH:mm:ss */
export function beijingNowDateTime(date = new Date()) {
  const day = beijingDateString(date)
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: BEIJING_TZ,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
  return `${day} ${time}`
}

/** 在北京时间日历上偏移若干天 */
export function addBeijingDays(isoDate, days) {
  const anchor = new Date(`${isoDate}T12:00:00+08:00`)
  anchor.setTime(anchor.getTime() + days * 86400000)
  return beijingDateString(anchor)
}

/** 最近 n 个北京时间自然日（含今天），升序 */
export function lastNDaysInBeijing(n = 7) {
  const today = beijingToday()
  return Array.from({ length: n }, (_, i) => addBeijingDays(today, i - (n - 1)))
}

export function formatDateLabel(isoDate) {
  const today = beijingToday()
  if (isoDate === today) return '今日'
  if (isoDate === addBeijingDays(today, -1)) return '昨日'
  return isoDate
}
