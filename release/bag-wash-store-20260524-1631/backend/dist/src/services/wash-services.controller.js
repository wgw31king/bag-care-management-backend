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
exports.WashServicesController = void 0;
const common_1 = require("@nestjs/common");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const create_wash_service_dto_1 = require("./dto/create-wash-service.dto");
const query_wash_service_dto_1 = require("./dto/query-wash-service.dto");
const update_wash_service_dto_1 = require("./dto/update-wash-service.dto");
const wash_services_service_1 = require("./wash-services.service");
let WashServicesController = class WashServicesController {
    services;
    constructor(services) {
        this.services = services;
    }
    findAll(query) {
        return this.services.findAll(query);
    }
    findOne(id) {
        return this.services.findOne(id);
    }
    create(dto) {
        return this.services.create(dto);
    }
    update(id, dto) {
        return this.services.update(id, dto);
    }
    remove(id) {
        return this.services.remove(id);
    }
};
exports.WashServicesController = WashServicesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_wash_service_dto_1.QueryWashServiceDto]),
    __metadata("design:returntype", void 0)
], WashServicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WashServicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_wash_service_dto_1.CreateWashServiceDto]),
    __metadata("design:returntype", void 0)
], WashServicesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_wash_service_dto_1.UpdateWashServiceDto]),
    __metadata("design:returntype", void 0)
], WashServicesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WashServicesController.prototype, "remove", null);
exports.WashServicesController = WashServicesController = __decorate([
    (0, common_1.Controller)('services'),
    (0, permissions_decorator_1.RequirePermissions)('service'),
    __metadata("design:paramtypes", [wash_services_service_1.WashServicesService])
], WashServicesController);
//# sourceMappingURL=wash-services.controller.js.map