import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SourceEntity } from './source.entity';

@Entity('scraper_logs')
export class ScraperLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => SourceEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'source_id' })
  source!: SourceEntity;

  @Column({ length: 64 })
  status!: string;

  @Column({ type: 'jsonb', nullable: true })
  result?: Record<string, unknown>;

  @Column({ name: 'timestamp', type: 'timestamptz' })
  timestamp!: Date;
}
