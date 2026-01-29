import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddUserIdToProfiles20260129002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('user_profiles');
    if (!table) {
      return;
    }

    await queryRunner.query("DELETE FROM user_profiles WHERE id = 'default-profile'");

    const idColumn = table.findColumnByName('id');
    if (idColumn && idColumn.type !== 'uuid') {
      await queryRunner.query('ALTER TABLE user_profiles ALTER COLUMN id TYPE uuid USING gen_random_uuid()');
      await queryRunner.query('ALTER TABLE user_profiles ALTER COLUMN id SET DEFAULT gen_random_uuid()');
    }

    if (!table.findColumnByName('user_id')) {
      await queryRunner.addColumn(
        'user_profiles',
        new TableColumn({
          name: 'user_id',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    const updatedTable = await queryRunner.getTable('user_profiles');
    if (!updatedTable) {
      return;
    }

    const existingIndex = updatedTable.indices.find((index) => index.name === 'idx_profiles_user');
    if (!existingIndex) {
      await queryRunner.createIndex(
        'user_profiles',
        new TableIndex({
          name: 'idx_profiles_user',
          columnNames: ['user_id'],
          isUnique: true,
        }),
      );
    }

    const existingForeignKey = updatedTable.foreignKeys.find((foreignKey) =>
      foreignKey.columnNames.includes('user_id'),
    );
    if (!existingForeignKey) {
      await queryRunner.createForeignKey(
        'user_profiles',
        new TableForeignKey({
          columnNames: ['user_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('user_profiles');
    if (!table) {
      return;
    }

    const existingForeignKey = table.foreignKeys.find((foreignKey) => foreignKey.columnNames.includes('user_id'));
    if (existingForeignKey) {
      await queryRunner.dropForeignKey('user_profiles', existingForeignKey);
    }

    const existingIndex = table.indices.find((index) => index.name === 'idx_profiles_user');
    if (existingIndex) {
      await queryRunner.dropIndex('user_profiles', existingIndex);
    }

    if (table.findColumnByName('user_id')) {
      await queryRunner.dropColumn('user_profiles', 'user_id');
    }

    const idColumn = table.findColumnByName('id');
    if (idColumn && idColumn.type === 'uuid') {
      await queryRunner.query('ALTER TABLE user_profiles ALTER COLUMN id DROP DEFAULT');
      await queryRunner.query('ALTER TABLE user_profiles ALTER COLUMN id TYPE varchar');
    }
  }
}
