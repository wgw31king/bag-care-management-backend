import { IsOptional, Matches } from 'class-validator';

export class QueryDashboardDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date 格式应为 YYYY-MM-DD' })
  date?: string;
}
