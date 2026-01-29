import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateGrantsTable20260128002100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'grants',
      'amount',
      new TableColumn({
        name: 'amount',
        type: 'numeric',
        precision: 12,
        scale: 2,
        isNullable: true,
      }),
    );

    await queryRunner.changeColumn(
      'grants',
      'deadline',
      new TableColumn({
        name: 'deadline',
        type: 'date',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'grants',
      new TableColumn({
        name: 'official_url',
        type: 'varchar',
        length: '600',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('grants', 'official_url');

    await queryRunner.changeColumn(
      'grants',
      'deadline',
      new TableColumn({
        name: 'deadline',
        type: 'date',
        isNullable: false,
      }),
    );

    await queryRunner.changeColumn(
      'grants',
      'amount',
      new TableColumn({
        name: 'amount',
        type: 'numeric',
        precision: 12,
        scale: 2,
        isNullable: false,
      }),
    );
  }
}
