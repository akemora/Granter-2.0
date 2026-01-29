import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SearchFiltersDto } from './search-filters.dto';

export class SearchQueryDto extends SearchFiltersDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  take?: number = 20;
}
