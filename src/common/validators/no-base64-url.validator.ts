import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/** 拒绝 data:image/...;base64, 预览，订单只存已上传 URL */
export function NoBase64DataUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'noBase64DataUrl',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (value === undefined || value === null) return true;
          if (!Array.isArray(value)) return false;
          return value.every(
            (u) =>
              typeof u === 'string' &&
              u.length > 0 &&
              !u.startsWith('data:'),
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} 须为已上传图片 URL，不支持 base64`;
        },
      },
    });
  };
}
