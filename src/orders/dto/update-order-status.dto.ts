import { IsIn } from 'class-validator';
import { ORDER_STATUS } from '../../common/constants/enums';

export class UpdateOrderStatusDto {
  @IsIn([...ORDER_STATUS])
  status: string;
}
