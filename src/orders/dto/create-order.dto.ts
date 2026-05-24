import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ORDER_STATUS } from '../../common/constants/enums';
import { IsDateTimeString } from '../../common/validators/datetime-string.validator';
import { NoBase64DataUrl } from '../../common/validators/no-base64-url.validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsString()
  wechatNote?: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  style: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  material: string;

  @IsString()
  @IsNotEmpty()
  defectDesc: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @NoBase64DataUrl()
  defectImages?: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  washServices: string[];

  @IsString()
  @IsNotEmpty()
  @IsDateTimeString()
  orderTime: string;

  @IsString()
  @IsNotEmpty()
  @IsDateTimeString()
  expectPickupTime: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  @Min(0)
  prepay: number;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsIn([...ORDER_STATUS])
  status?: string;
}
