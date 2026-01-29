import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableCheck } from 'typeorm';

export class CreateGrantsTable20260127000300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'grants',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '150',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'numeric',
            precision: 12,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'deadline',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'region',
            type: 'varchar',
            length: '64',
            isNullable: false,
          },
          {
            name: 'source_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createCheckConstraint(
      'grants',
      new TableCheck({
        name: 'chk_grants_amount_positive',
        expression: 'amount > 0',
      }),
    );

    await queryRunner.createForeignKey(
      'grants',
      new TableForeignKey({
        columnNames: ['source_id'],
        referencedTableName: 'sources',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('grants');
    const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.includes('source_id'));
    if (foreignKey) {
      await queryRunner.dropForeignKey('grants', foreignKey);
    }

    await queryRunner.dropTable('grants');
  }
}
