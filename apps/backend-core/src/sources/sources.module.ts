import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcesService } from './sources.service';
import { SourcesController } from './sources.controller';
import { SourceEntity } from '../database/entities/source.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SourceEntity])],
  controllers: [SourcesController],
  providers: [SourcesService],
  exports: [SourcesService],
})
export class SourcesModule {}
