import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  Check,
  OneToOne,
} from 'typeorm';
import { UserProfileEntity } from './user-profile.entity';

@Entity('users')
@Index('idx_users_email', ['email'], { unique: true })
@Check('chk_password_length', 'char_length(password_hash) >= 60')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 254 })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 128 })
  passwordHash!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToOne(() => UserProfileEntity, (profile) => profile.user)
  profile?: UserProfileEntity;

  @BeforeInsert()
  normalizeEmail(): void {
    this.email = this.email.toLowerCase().trim();
  }
}
