"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWashServiceDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_wash_service_dto_1 = require("./create-wash-service.dto");
class UpdateWashServiceDto extends (0, mapped_types_1.PartialType)(create_wash_service_dto_1.CreateWashServiceDto) {
}
exports.UpdateWashServiceDto = UpdateWashServiceDto;
//# sourceMappingURL=update-wash-service.dto.js.map