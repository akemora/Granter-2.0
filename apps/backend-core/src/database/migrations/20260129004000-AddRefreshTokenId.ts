import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRefreshTokenId20260129004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'refresh_tokens',
      new TableColumn({
        name: 'token_id',
        type: 'uuid',
        isNullable: false,
        default: 'uuid_generate_v4()',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('refresh_tokens', 'token_id');
  }
}
