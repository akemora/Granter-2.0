import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateGrantNotificationsTable20260128002300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'grant_notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'grant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'channel',
            type: 'varchar',
            length: '16',
            isNullable: false,
          },
          {
            name: 'recipient',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '16',
            isNullable: false,
          },
          {
            name: 'error',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'meta',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'sent_at',
            type: 'timestamptz',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            name: 'FK_grant_notifications_grant_id',
            columnNames: ['grant_id'],
            referencedTableName: 'grants',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'grant_notifications',
      new TableIndex({
        name: 'IDX_grant_notifications_grant_channel_recipient',
        columnNames: ['grant_id', 'channel', 'recipient'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('grant_notifications', 'IDX_grant_notifications_grant_channel_recipient');
    await queryRunner.dropTable('grant_notifications');
  }
}
