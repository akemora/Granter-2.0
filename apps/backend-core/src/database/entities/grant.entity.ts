import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Check, ManyToOne, JoinColumn, Index } from 'typeorm';
import { SourceEntity } from './source.entity';
import { GrantStatus } from '../../common/enums/grant-status.enum';

const numericColumnTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity('grants')
@Check('chk_grants_amount', 'amount > 0')
@Index('IDX_grants_region', ['region'])
@Index('IDX_grants_createdAt', ['createdAt'])
@Index('IDX_grants_status', ['status'])
export class GrantEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true, transformer: numericColumnTransformer })
  amount?: number | null;

  @Column({ type: 'date', nullable: true })
  deadline?: Date | null;

  @Column({ name: 'official_url', type: 'varchar', length: 600, nullable: true })
  officialUrl?: string | null;

  @Column({ length: 64 })
  region!: string;

  @Column({ type: 'varchar', length: 20, default: GrantStatus.OPEN })
  status!: GrantStatus;

  @Column({ type: 'simple-array', nullable: true })
  sectors?: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  beneficiaries?: string[] | null;

  @Column({ type: 'uuid', name: 'source_id', nullable: true })
  sourceId?: string | null;

  @ManyToOne(() => SourceEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'source_id' })
  source?: SourceEntity | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
