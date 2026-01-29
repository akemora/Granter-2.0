import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Index, UpdateDateColumn } from 'typeorm';
import { SourceType } from '../../common/enums/source-type.enum';

@Entity('sources')
@Index('idx_sources_url', ['url'], { unique: true })
@Index('IDX_sources_active', ['active'])
@Index('IDX_sources_region_active', ['region', 'active'])
export class SourceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ length: 400 })
  url!: string;

  @Column({ length: 16, default: SourceType.HTML })
  type!: SourceType;

  @Column({ length: 64, default: 'ES' })
  region!: string;

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;

  @Column({ type: 'timestamptz', name: 'last_run', nullable: true })
  lastRun?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
