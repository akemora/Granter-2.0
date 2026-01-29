import { IsUUID } from 'class-validator';

export class ScrapeAsyncRequestDto {
  @IsUUID()
  sourceId!: string;
}
