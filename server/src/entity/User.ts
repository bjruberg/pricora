import {
  CreateDateColumn,
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

import { Meeting } from "./Meeting";

@Entity()
@ObjectType()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  encryptedSecretWithIV: string;

  @Column()
  passwordDeviationSalt: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  firstName: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  lastLogin: Date;

  @Field()
  @Column({ default: false })
  @Index()
  isAdmin: boolean;

  @Field()
  @Column({ default: false })
  primaryAdmin: boolean;

  @Field()
  @Column({ default: false, nullable: true })
  requirePasswordChange: boolean;

  @Field(() => [Meeting])
  @OneToMany(() => Meeting, (meeting) => meeting.user)
  meetings: Promise<Meeting[]>;

  @Field(() => String)
  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Field(() => String, { nullable: true })
  @DeleteDateColumn()
  deletedAt?: Date;
}
