import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrantEntity } from '../database/entities/grant.entity';
import { GrantsController } from './grants.controller';
import { GrantsService } from './grants.service';

@Module({
  imports: [TypeOrmModule.forFeature([GrantEntity])],
  controllers: [GrantsController],
  providers: [GrantsService],
  exports: [GrantsService],
})
export class GrantsModule {}
