import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Data Transfer Object for search filter parameters.
 * All filters are optional and can be combined for flexible querying.
 */
export class SearchFiltersDto {
  /**
   * Full-text search term to match against title and description
   */
  @IsOptional()
  @IsString()
  query?: string;

  /**
   * Array of region codes to filter by (e.g., ES, EU, INT)
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regions?: string[];

  /**
   * Array of sectors to filter by
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sectors?: string[];

  /**
   * Minimum grant amount (inclusive)
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minAmount?: number;

  /**
   * Maximum grant amount (inclusive)
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxAmount?: number;

  /**
   * Deadline must be after this date (ISO 8601 format)
   */
  @IsOptional()
  @IsDateString()
  deadlineAfter?: string;

  /**
   * Deadline must be before this date (ISO 8601 format)
   */
  @IsOptional()
  @IsDateString()
  deadlineBefore?: string;

  /**
   * Filter by grant status (e.g., active, closed, pending)
   */
  @IsOptional()
  @IsString()
  status?: string;
}
