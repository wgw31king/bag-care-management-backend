"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decimalToNumber = decimalToNumber;
exports.toOrderJson = toOrderJson;
exports.toWashServiceJson = toWashServiceJson;
const library_1 = require("@prisma/client/runtime/library");
function decimalToNumber(value) {
    if (value instanceof library_1.Decimal) {
        return value.toNumber();
    }
    return Number(value);
}
function toOrderJson(order) {
    return {
        ...order,
        amount: decimalToNumber(order.amount),
        prepay: decimalToNumber(order.prepay),
        createdAt: Number(order.createdAt),
        defectImages: order.defectImages ?? [],
        washServices: order.washServices ?? [],
    };
}
function toWashServiceJson(row) {
    return {
        ...row,
        code: row.code ?? null,
        price: decimalToNumber(row.price),
    };
}
//# sourceMappingURL=serialize.js.map