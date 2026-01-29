import { IsOptional, IsString, IsNumber, IsArray, IsDateString, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { GrantStatus } from '../../common/enums/grant-status.enum';

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
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : undefined))
  @IsArray()
  @IsString({ each: true })
  regions?: string[];

  /**
   * Array of sectors to filter by
   */
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : undefined))
  @IsArray()
  @IsString({ each: true })
  sectors?: string[];

  /**
   * Array of beneficiaries to filter by
   */
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : undefined))
  @IsArray()
  @IsString({ each: true })
  beneficiaries?: string[];

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
   * Filter by grant status (open, closed, upcoming, expired)
   */
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  @IsEnum(GrantStatus)
  status?: GrantStatus;
}
