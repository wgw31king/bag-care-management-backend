import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { PERMISSIONS, STAFF_STATUS } from '../../common/constants/enums';

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
  @IsIn([...PERMISSIONS], { each: true })
  permissions: string[];

  /** 可选：为员工创建登录账号（非 admin） */
  @IsOptional()
  @IsString()
  @MinLength(2)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
