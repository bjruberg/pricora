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
  @Column({ default: false, nullable: true })
  requirePasswordChange: boolean;

  @OneToMany(() => Meeting, (meeting) => meeting.user)
  meetings: Promise<Meeting[]>;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
