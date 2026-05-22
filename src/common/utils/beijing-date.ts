/** 北京时间（UTC+8），IANA 时区 Asia/Shanghai */
export const BEIJING_TZ = 'Asia/Shanghai';

/** 北京时间下的 YYYY-MM-DD */
export function beijingDateString(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BEIJING_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** 解析 YYYY-MM-DD，无效则返回今日（北京时间） */
export function parseDateQuery(value?: string): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return beijingDateString();
  }
  return value;
}

/** 在北京时间日历上偏移若干天 */
export function addBeijingDays(isoDate: string, days: number): string {
  const anchor = new Date(`${isoDate}T12:00:00+08:00`);
  anchor.setTime(anchor.getTime() + days * 86400000);
  return beijingDateString(anchor);
}
