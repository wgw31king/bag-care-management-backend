import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ASSIGNABLE_PERMISSIONS, STAFF_STATUS } from '../../common/constants/enums';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsOptional()
  @IsIn([...STAFF_STATUS])
  status?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsIn([...ASSIGNABLE_PERMISSIONS], { each: true })
  permissions: string[];

  /** 新建员工须同时提供登录账号与初始密码 */
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
