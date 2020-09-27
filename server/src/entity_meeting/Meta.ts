import {
  CreateDateColumn,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Field } from "type-graphql";

@Entity()
export class Meta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cipher: string;

  @Column({ type: "text" })
  encryptionKey: string;

  @Column({ type: "date" })
  date: string;

  @Field(() => String, { description: "The title of the meeting" })
  @Column({ nullable: true })
  title: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
