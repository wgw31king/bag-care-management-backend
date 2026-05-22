import { ValidationOptions } from 'class-validator';
export declare const DATETIME_STRING_REGEX: RegExp;
export declare function IsDateTimeString(validationOptions?: ValidationOptions): (object: object, propertyName: string) => void;
