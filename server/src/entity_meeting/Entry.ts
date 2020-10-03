import { CreateDateColumn, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ObjectType, Field, ID, InputType } from "type-graphql";

@ObjectType()
@InputType()
export class EntryInput {
  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  email: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  firstName: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  lastName: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  address: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  phone: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  zip: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  city: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  country: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: "text" })
  random: string;
}

@ObjectType()
export class EntryOutput extends EntryInput {
  @Field(() => ID, { description: "Auto-generated uuid for the entry" })
  id: string;

  @Field(() => String)
  @CreateDateColumn()
  created: string;
}

@Entity()
export class Entry extends EntryOutput {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  encryptedRowSecret: string;

  @Column()
  encryptionIV: string;
}
