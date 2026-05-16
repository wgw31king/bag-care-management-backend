import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryWashServiceDto extends PaginationDto {
  @IsOptional()
  @IsIn(['0', '1'])
  enabled?: string;
}
