import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GrantEntity } from './grant.entity';

export enum NotificationChannel {
  Email = 'email',
  Telegram = 'telegram',
}

export enum NotificationStatus {
  Sent = 'sent',
  Failed = 'failed',
}

@Entity('grant_notifications')
@Index('IDX_grant_notifications_grant_channel_recipient', ['grantId', 'channel', 'recipient'])
export class GrantNotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'grant_id', type: 'uuid' })
  grantId!: string;

  @ManyToOne(() => GrantEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grant_id' })
  grant!: GrantEntity;

  @Column({ type: 'varchar', length: 16 })
  channel!: NotificationChannel;

  @Column({ type: 'varchar', length: 255 })
  recipient!: string;

  @Column({ type: 'varchar', length: 16 })
  status!: NotificationStatus;

  @Column({ type: 'text', nullable: true })
  error?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt?: Date | null;
}
