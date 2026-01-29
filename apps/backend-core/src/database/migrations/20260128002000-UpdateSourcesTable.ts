import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateSourcesTable20260128002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('sources', [
      new TableColumn({
        name: 'type',
        type: 'varchar',
        length: '16',
        default: "'HTML'",
      }),
      new TableColumn({
        name: 'metadata',
        type: 'jsonb',
        isNullable: true,
      }),
      new TableColumn({
        name: 'last_run',
        type: 'timestamptz',
        isNullable: true,
      }),
      new TableColumn({
        name: 'updated_at',
        type: 'timestamptz',
        default: 'now()',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('sources', 'updated_at');
    await queryRunner.dropColumn('sources', 'last_run');
    await queryRunner.dropColumn('sources', 'metadata');
    await queryRunner.dropColumn('sources', 'type');
  }
}
