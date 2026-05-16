import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
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
}
