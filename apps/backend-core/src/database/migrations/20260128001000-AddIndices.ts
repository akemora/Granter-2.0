import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddIndices20260128001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ==================== GRANTS TABLE INDICES ====================

    // Index on 'region' column - for filtering by region
    // Optimization: SELECT * FROM grants WHERE region = 'X'
    await queryRunner.createIndex(
      'grants',
      new TableIndex({
        name: 'IDX_grants_region',
        columnNames: ['region'],
        isUnique: false,
      }),
    );

    // Index on 'sector' column - for filtering by sector
    // Note: This assumes a sector column exists; add if needed
    // Optimization: SELECT * FROM grants WHERE sector = 'X'
    // If sector column doesn't exist yet, this index will be added when sector is added to the table

    // Index on 'status' column - for filtering by status
    // Note: This assumes a status column exists; add if needed
    // Optimization: SELECT * FROM grants WHERE status = 'X'
    // If status column doesn't exist yet, this index will be added when status is added to the table

    // Index on 'created_at' column - for sorting by creation date
    // Optimization: SELECT * FROM grants ORDER BY created_at DESC
    // Using DESC for descending order (typical for showing newest first)
    await queryRunner.createIndex(
      'grants',
      new TableIndex({
        name: 'IDX_grants_createdAt',
        columnNames: ['created_at'],
        isUnique: false,
      }),
    );

    // Composite index on (status, created_at) - for combined filtering and sorting
    // Optimization: SELECT * FROM grants WHERE status = 'X' ORDER BY created_at DESC
    // Note: This assumes status column exists; will be added when status column is added
    // When added, uncomment this code:
    // await queryRunner.createIndex(
    //   "grants",
    //   new TableIndex({
    //     name: "IDX_grants_status_createdAt",
    //     columnNames: ["status", "created_at"],
    //     isUnique: false,
    //   }),
    // );

    // Full-text search index on (title, description) - for text search
    // Using PostgreSQL GIN index with tsvector for efficient full-text search
    // Optimization: SELECT * FROM grants WHERE to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('english', 'search_term')
    await queryRunner.query(`
      CREATE INDEX IDX_grants_fulltext
      ON grants
      USING GIN(to_tsvector('english', title || ' ' || description));
    `);

    // ==================== SOURCES TABLE INDICES ====================

    // Index on 'url' column - for unique URL lookups
    // Note: This is already created as a unique constraint in CreateSourcesTable migration
    // but we ensure it's properly indexed for fast lookups
    // Optimization: SELECT * FROM sources WHERE url = 'X'
    // The unique index from the entity decorator serves this purpose

    // Index on 'active' column - for filtering active sources
    // Optimization: SELECT * FROM sources WHERE active = true
    await queryRunner.createIndex(
      'sources',
      new TableIndex({
        name: 'IDX_sources_active',
        columnNames: ['active'],
        isUnique: false,
      }),
    );

    // Composite index on (region, active) - for filtering by region and active status
    // Optimization: SELECT * FROM sources WHERE region = 'X' AND active = true
    await queryRunner.createIndex(
      'sources',
      new TableIndex({
        name: 'IDX_sources_region_active',
        columnNames: ['region', 'active'],
        isUnique: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all indices in reverse order

    // Drop sources table indices
    await queryRunner.dropIndex('sources', 'IDX_sources_region_active');
    await queryRunner.dropIndex('sources', 'IDX_sources_active');

    // Drop grants table indices
    await queryRunner.dropIndex('grants', 'IDX_grants_fulltext');
    // Uncomment when status column is added:
    // await queryRunner.dropIndex("grants", "IDX_grants_status_createdAt");
    await queryRunner.dropIndex('grants', 'IDX_grants_createdAt');
    // Uncomment when sector column is added:
    // await queryRunner.dropIndex("grants", "IDX_grants_sector");
    // Uncomment when status column is added:
    // await queryRunner.dropIndex("grants", "IDX_grants_status");
    await queryRunner.dropIndex('grants', 'IDX_grants_region');
  }
}
