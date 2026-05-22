"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATETIME_STRING_REGEX = void 0;
exports.IsDateTimeString = IsDateTimeString;
const class_validator_1 = require("class-validator");
exports.DATETIME_STRING_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
function IsDateTimeString(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isDateTimeString',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value) {
                    return typeof value === 'string' && exports.DATETIME_STRING_REGEX.test(value);
                },
                defaultMessage(args) {
                    return `${args.property} 格式应为 YYYY-MM-DD HH:mm:ss`;
                },
            },
        });
    };
}
//# sourceMappingURL=datetime-string.validator.js.map