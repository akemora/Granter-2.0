import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AdjustRefreshTokensIndexes20260129004100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('refresh_tokens', 'IDX_refresh_tokens_user');
    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({
        name: 'IDX_refresh_tokens_user',
        columnNames: ['user_id'],
        isUnique: false,
      }),
    );
    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({
        name: 'IDX_refresh_tokens_token',
        columnNames: ['token_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('refresh_tokens', 'IDX_refresh_tokens_token');
    await queryRunner.dropIndex('refresh_tokens', 'IDX_refresh_tokens_user');
    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({
        name: 'IDX_refresh_tokens_user',
        columnNames: ['user_id'],
        isUnique: true,
      }),
    );
  }
}
