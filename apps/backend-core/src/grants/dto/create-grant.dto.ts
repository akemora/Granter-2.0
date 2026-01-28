import { GrantRegion } from "./grant-region.enum";
import {
  IsEnum,
  IsISO8601,
  IsNumber,
  IsString,
  Min,
  MinLength,
} from "class-validator";

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

  @IsEnum(GrantRegion)
  region!: GrantRegion;

  @IsString()
  sourceId!: string;
}
