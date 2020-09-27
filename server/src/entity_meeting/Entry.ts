import { CreateDateColumn, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ObjectType, Field, ID, InputType } from "type-graphql";

@ObjectType()
@InputType()
export class EntryInput {
  @Field(() => String)
  @Column()
  firstName: string;

  @Field(() => String)
  @Column()
  lastName: string;

  @Field(() => String)
  @Column()
  address: string;

  @Field(() => String)
  @Column()
  zip: string;

  @Field(() => String)
  @Column()
  city: string;

  @Field(() => String)
  @Column()
  country: string;
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
