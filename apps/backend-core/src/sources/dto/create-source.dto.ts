import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, IsUrl, MinLength, MaxLength } from 'class-validator';
import { SourceType } from '../../common/enums/source-type.enum';

export class CreateSourceDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name!: string;

  @IsUrl()
  @MaxLength(400)
  baseUrl!: string;

  @IsOptional()
  @IsEnum(SourceType)
  type?: SourceType;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  region?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
