import { CreateDateColumn, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ObjectType, Field, ID, InputType } from "type-graphql";

@ObjectType()
@InputType()
export class EntryInput {
  @Field(() => String)
  @Column({ nullable: true })
  email: string;

  @Field(() => String)
  @Column({ nullable: true })
  firstName: string;

  @Field(() => String)
  @Column({ nullable: true })
  lastName: string;

  @Field(() => String)
  @Column({ nullable: true })
  address: string;

  @Field(() => String)
  @Column({ nullable: true })
  phone: string;

  @Field(() => String)
  @Column({ nullable: true })
  zip: string;

  @Field(() => String)
  @Column({ nullable: true })
  city: string;

  @Field(() => String)
  @Column({ nullable: true })
  country: string;

  @Field(() => String)
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
