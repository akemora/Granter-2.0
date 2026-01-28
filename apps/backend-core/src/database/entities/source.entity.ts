import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Index,
} from "typeorm";

@Entity("sources")
@Index("idx_sources_url", ["url"], { unique: true })
@Index("IDX_sources_active", ["active"])
@Index("IDX_sources_region_active", ["region", "active"])
export class SourceEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ length: 400 })
  url!: string;

  @Column({ length: 64 })
  region!: string;

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
