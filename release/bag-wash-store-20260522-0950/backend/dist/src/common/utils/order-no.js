"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderNo = generateOrderNo;
function generateOrderNo() {
    return `BW${Date.now().toString().slice(-10)}`;
}
//# sourceMappingURL=order-no.js.map