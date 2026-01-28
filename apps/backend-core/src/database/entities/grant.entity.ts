import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Check,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { SourceEntity } from "./source.entity";

@Entity("grants")
@Check("chk_grants_amount", "amount > 0")
@Index("IDX_grants_region", ["region"])
@Index("IDX_grants_createdAt", ["createdAt"])
export class GrantEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 120 })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: "date" })
  deadline!: Date;

  @Column({ length: 64 })
  region!: string;

  @ManyToOne(() => SourceEntity, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "source_id" })
  source!: SourceEntity;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
