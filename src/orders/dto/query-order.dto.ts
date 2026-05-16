import { IsIn, IsOptional } from 'class-validator';
import { ORDER_STATUS } from '../../common/constants/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryOrderDto extends PaginationDto {
  @IsOptional()
  @IsIn([...ORDER_STATUS])
  status?: string;
}
