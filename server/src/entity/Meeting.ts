import {
  CreateDateColumn,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ObjectType, Field, ID, InputType } from "type-graphql";

import { User } from "./User";

@ObjectType()
@InputType()
export class MeetingInput {
  @Field(() => String, { description: "The title of the meeting" })
  @Column()
  title: string;

  @Field(() => String, { description: "Date of the meeting" })
  @Column({ type: "date" })
  date: string;
}

@Entity()
@ObjectType()
export class Meeting extends MeetingInput {
  @Field(() => ID, { description: "Auto-generated uuid for the meeting" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => User, { description: "The user that owns the meeting" })
  @ManyToOne(() => User, (user) => user.meetings)
  user: Promise<User>;

  @Field(() => Boolean, { description: "Is this an archived or an active meeting" })
  @Column({ default: false })
  archived: boolean;

  @Field(() => Number, {
    description: "The number of exports that have been generated for this meeting",
  })
  @Column({ default: 0 })
  exportsCount: number;

  @Field(() => Number, {
    description: "The number of exports that have been added for this meeting",
  })
  @Column({ default: 0 })
  numberOfAttendants: number;

  @Field(() => String)
  @CreateDateColumn()
  created: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updated: Date;
}
