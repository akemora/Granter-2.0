import { GrantRegion } from './grant-region.enum';
import { GrantStatus } from '../../common/enums/grant-status.enum';
import { IsArray, IsEnum, IsISO8601, IsNumber, IsOptional, IsString, IsUrl, Min, MinLength } from 'class-validator';

export class CreateGrantDto {
  @IsString()
  @MinLength(5)
  title!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsISO8601()
  deadline!: string;

  @IsOptional()
  @IsUrl()
  officialUrl?: string;

  @IsEnum(GrantRegion)
  region!: GrantRegion;

  @IsOptional()
  @IsEnum(GrantStatus)
  status?: GrantStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sectors?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  beneficiaries?: string[];

  @IsString()
  sourceId!: string;
}
