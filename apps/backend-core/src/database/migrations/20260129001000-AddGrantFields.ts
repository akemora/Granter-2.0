import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddGrantFields20260129001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('grants');
    if (!table) {
      return;
    }

    if (!table.findColumnByName('status')) {
      await queryRunner.addColumn(
        'grants',
        new TableColumn({
          name: 'status',
          type: 'varchar',
          length: '20',
          default: "'open'",
          isNullable: false,
        }),
      );
    }

    if (!table.findColumnByName('sectors')) {
      await queryRunner.addColumn(
        'grants',
        new TableColumn({
          name: 'sectors',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    if (!table.findColumnByName('beneficiaries')) {
      await queryRunner.addColumn(
        'grants',
        new TableColumn({
          name: 'beneficiaries',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    const sourceColumn = table.findColumnByName('source_id');
    if (sourceColumn && !sourceColumn.isNullable) {
      await queryRunner.changeColumn(
        'grants',
        'source_id',
        new TableColumn({
          name: 'source_id',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    const statusIndex = table.indices.find((index) => index.name === 'IDX_grants_status');
    if (!statusIndex) {
      await queryRunner.createIndex(
        'grants',
        new TableIndex({
          name: 'IDX_grants_status',
          columnNames: ['status'],
        }),
      );
    }

    const existingForeignKey = table.foreignKeys.find((foreignKey) => foreignKey.columnNames.includes('source_id'));
    if (existingForeignKey) {
      await queryRunner.dropForeignKey('grants', existingForeignKey);
    }

    if (table.findColumnByName('source_id')) {
      await queryRunner.createForeignKey(
        'grants',
        new TableForeignKey({
          columnNames: ['source_id'],
          referencedTableName: 'sources',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('grants');
    if (!table) {
      return;
    }

    const existingForeignKey = table.foreignKeys.find((foreignKey) => foreignKey.columnNames.includes('source_id'));
    if (existingForeignKey) {
      await queryRunner.dropForeignKey('grants', existingForeignKey);
    }

    const statusIndex = table.indices.find((index) => index.name === 'IDX_grants_status');
    if (statusIndex) {
      await queryRunner.dropIndex('grants', statusIndex);
    }

    if (table.findColumnByName('beneficiaries')) {
      await queryRunner.dropColumn('grants', 'beneficiaries');
    }

    if (table.findColumnByName('sectors')) {
      await queryRunner.dropColumn('grants', 'sectors');
    }

    if (table.findColumnByName('status')) {
      await queryRunner.dropColumn('grants', 'status');
    }

    const sourceColumn = table.findColumnByName('source_id');
    if (sourceColumn && sourceColumn.isNullable) {
      await queryRunner.changeColumn(
        'grants',
        'source_id',
        new TableColumn({
          name: 'source_id',
          type: 'uuid',
          isNullable: false,
        }),
      );
    }

    if (table.findColumnByName('source_id')) {
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
  }
}
