import {
  CreateDateColumn,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ObjectType, Field, ID, InputType } from "type-graphql";

import { User } from "./User";
import { EntryOutput } from "../entity_meeting/Entry";

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
  @JoinColumn({ name: "userId" })
  @ManyToOne(() => User, (user) => user.meetings)
  user: Promise<User>;

  @Field()
  @Column({ nullable: false })
  userId: string;

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

  @Field(() => Boolean, {
    description: "Indicates whether the logged in user has can decrypt the meeting's data",
  })
  canDecrypt: boolean;
}

@ObjectType()
export class Attendants {
  @Field(() => [EntryOutput])
  list: EntryOutput[];

  @Field()
  error: string;
}
