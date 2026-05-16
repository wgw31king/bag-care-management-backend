/** 获取 Asia/Shanghai 下的 YYYY-MM-DD */
export function shanghaiDateString(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** 解析 YYYY-MM-DD，无效则返回今日（上海） */
export function parseDateQuery(value?: string): string {
  if (!value) {
    return shanghaiDateString();
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return shanghaiDateString();
  }
  return value;
}
