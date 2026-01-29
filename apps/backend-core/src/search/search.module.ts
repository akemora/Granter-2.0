import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrantEntity } from '../database/entities/grant.entity';
import { SourceEntity } from '../database/entities/source.entity';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

/**
 * Module for search functionality.
 *
 * Provides:
 * - Full-text search with PostgreSQL capabilities
 * - Advanced filtering by multiple criteria
 * - Optimized query execution using database indices
 */
@Module({
  imports: [TypeOrmModule.forFeature([GrantEntity, SourceEntity])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
