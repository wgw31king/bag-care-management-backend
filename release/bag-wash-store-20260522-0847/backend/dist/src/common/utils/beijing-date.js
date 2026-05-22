"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BEIJING_TZ = void 0;
exports.beijingDateString = beijingDateString;
exports.parseDateQuery = parseDateQuery;
exports.addBeijingDays = addBeijingDays;
exports.BEIJING_TZ = 'Asia/Shanghai';
function beijingDateString(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: exports.BEIJING_TZ,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}
function parseDateQuery(value) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return beijingDateString();
    }
    return value;
}
function addBeijingDays(isoDate, days) {
    const anchor = new Date(`${isoDate}T12:00:00+08:00`);
    anchor.setTime(anchor.getTime() + days * 86400000);
    return beijingDateString(anchor);
}
//# sourceMappingURL=beijing-date.js.map