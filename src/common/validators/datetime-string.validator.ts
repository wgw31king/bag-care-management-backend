import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/** 与前端表单一致：YYYY-MM-DD HH:mm:ss */
export const DATETIME_STRING_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export function IsDateTimeString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateTimeString',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && DATETIME_STRING_REGEX.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} 格式应为 YYYY-MM-DD HH:mm:ss`;
        },
      },
    });
  };
}
