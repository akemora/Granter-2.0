import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('user_profiles')
export class UserProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'simple-array' })
  keywords!: string[];

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  minAmount?: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxAmount?: number | null;

  @Column({ type: 'simple-array' })
  regions!: string[];

  @Column({ default: false })
  emailNotifications!: boolean;

  @Column({ default: false })
  telegramNotifications!: boolean;

  @Column({ nullable: true })
  email?: string | null;

  @Column({ nullable: true })
  telegramChatId?: string | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
