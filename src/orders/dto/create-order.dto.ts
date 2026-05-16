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
import { ORDER_STATUS, WASH_SERVICES } from '../../common/constants/enums';

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
  defectImages?: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsIn([...WASH_SERVICES], { each: true })
  washServices: string[];

  @IsString()
  @IsNotEmpty()
  orderTime: string;

  @IsString()
  @IsNotEmpty()
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

  @IsIn([...ORDER_STATUS])
  status: string;
}
