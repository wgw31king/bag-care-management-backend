import { IsIn, IsOptional } from 'class-validator';

export class QueryRevenueTrendDto {
  @IsOptional()
  @IsIn(['7d', '30d'])
  range?: '7d' | '30d';
}
