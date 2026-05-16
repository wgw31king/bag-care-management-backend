import { IsIn, IsOptional } from 'class-validator';
import { CUSTOMER_TAGS } from '../../common/constants/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryCustomerDto extends PaginationDto {
  @IsOptional()
  @IsIn([...CUSTOMER_TAGS])
  tag?: string;
}
