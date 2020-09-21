import {
  CreateDateColumn,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

import { User } from "./User";

@Entity()
@ObjectType()
export class Meeting {
  @Field(() => ID, { description: "Auto-generated uuid for the meeting" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => String, { description: "The title of the meeting" })
  @Column()
  title: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.meetings)
  user: Promise<User>;

  @Field(() => Boolean)
  @Column({ default: false })
  archived: boolean;

  @Field(() => String)
  @CreateDateColumn()
  created: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updated: Date;
}
