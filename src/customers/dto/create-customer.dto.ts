import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CUSTOMER_TAGS } from '../../common/constants/enums';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsString()
  wechat?: string;

  @IsOptional()
  @IsIn([...CUSTOMER_TAGS])
  tag?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}
