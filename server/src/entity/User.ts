import {
  CreateDateColumn,
  Column,
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

  @Field(() => String)
  @Column({ nullable: true })
  firstName: string;

  @Field(() => String)
  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  lastLogin: number;

  @Column({ default: false })
  @Index()
  isAdmin: boolean;

  @OneToMany(() => Meeting, (meeting) => meeting.user)
  meetings: Promise<Meeting[]>;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
