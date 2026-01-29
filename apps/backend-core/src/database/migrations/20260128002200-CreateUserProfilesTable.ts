import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserProfilesTable20260128002200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_profiles',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'keywords',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'min_amount',
            type: 'numeric',
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'max_amount',
            type: 'numeric',
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'regions',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'email_notifications',
            type: 'boolean',
            default: false,
          },
          {
            name: 'telegram_notifications',
            type: 'boolean',
            default: false,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'telegram_chat_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_profiles');
  }
}
