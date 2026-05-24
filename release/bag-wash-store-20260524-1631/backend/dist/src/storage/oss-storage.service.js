"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OssStorageService = void 0;
const common_1 = require("@nestjs/common");
let OssStorageService = class OssStorageService {
    async save() {
        throw new common_1.NotImplementedException('OSS 存储未配置，请实现 OssStorageService 或设置 STORAGE_DRIVER=local');
    }
};
exports.OssStorageService = OssStorageService;
exports.OssStorageService = OssStorageService = __decorate([
    (0, common_1.Injectable)()
], OssStorageService);
//# sourceMappingURL=oss-storage.service.js.map