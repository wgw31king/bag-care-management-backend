"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path_1 = require("path");
let LocalStorageService = class LocalStorageService {
    uploadDir;
    publicBaseUrl;
    constructor(config) {
        this.uploadDir = (0, path_1.join)(process.cwd(), config.get('UPLOAD_DIR', 'uploads'));
        this.publicBaseUrl = config.get('PUBLIC_BASE_URL', '').replace(/\/$/, '');
        if (!(0, fs_1.existsSync)(this.uploadDir)) {
            (0, fs_1.mkdirSync)(this.uploadDir, { recursive: true });
        }
    }
    async save(file) {
        const ext = (0, path_1.extname)(file.originalname) || this.extFromMime(file.mimetype);
        const filename = `${(0, crypto_1.randomUUID)()}${ext}`;
        (0, fs_1.writeFileSync)((0, path_1.join)(this.uploadDir, filename), file.buffer);
        const path = `/uploads/${filename}`;
        return this.publicBaseUrl ? `${this.publicBaseUrl}${path}` : path;
    }
    extFromMime(mime) {
        const map = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp',
        };
        return map[mime] ?? '.jpg';
    }
};
exports.LocalStorageService = LocalStorageService;
exports.LocalStorageService = LocalStorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LocalStorageService);
//# sourceMappingURL=local-storage.service.js.map