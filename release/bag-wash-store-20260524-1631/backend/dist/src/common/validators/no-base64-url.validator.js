"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoBase64DataUrl = NoBase64DataUrl;
const class_validator_1 = require("class-validator");
function NoBase64DataUrl(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'noBase64DataUrl',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value) {
                    if (value === undefined || value === null)
                        return true;
                    if (!Array.isArray(value))
                        return false;
                    return value.every((u) => typeof u === 'string' &&
                        u.length > 0 &&
                        !u.startsWith('data:'));
                },
                defaultMessage(args) {
                    return `${args.property} 须为已上传图片 URL，不支持 base64`;
                },
            },
        });
    };
}
//# sourceMappingURL=no-base64-url.validator.js.map