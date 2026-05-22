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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const storage_interface_1 = require("../storage/storage.interface");
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILES = 9;
let UploadService = class UploadService {
    storage;
    config;
    constructor(storage, config) {
        this.storage = storage;
        this.config = config;
    }
    async saveImages(files) {
        if (!files?.length) {
            throw new common_1.BadRequestException('请选择至少一张图片');
        }
        if (files.length > MAX_FILES) {
            throw new common_1.BadRequestException(`单次最多上传 ${MAX_FILES} 张图片`);
        }
        const maxBytes = Number(this.config.get('MAX_UPLOAD_SIZE_MB', 5)) * 1024 * 1024;
        const urls = [];
        for (const file of files) {
            if (!ALLOWED_MIME.has(file.mimetype)) {
                throw new common_1.BadRequestException('仅支持 jpeg/png/webp 图片');
            }
            if (file.size > maxBytes) {
                throw new common_1.BadRequestException(`单张图片不能超过 ${this.config.get('MAX_UPLOAD_SIZE_MB', 5)}MB`);
            }
            const url = await this.storage.save({
                buffer: file.buffer,
                originalname: file.originalname,
                mimetype: file.mimetype,
            });
            urls.push(url);
        }
        if (urls.length === 1) {
            return { url: urls[0], urls };
        }
        return { urls };
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(storage_interface_1.STORAGE_PROVIDER)),
    __metadata("design:paramtypes", [Object, config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map