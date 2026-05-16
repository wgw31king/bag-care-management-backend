import { IsIn, IsOptional } from 'class-validator';
import { STAFF_STATUS } from '../../common/constants/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryStaffDto extends PaginationDto {
  @IsOptional()
  @IsIn([...STAFF_STATUS])
  status?: string;
}
