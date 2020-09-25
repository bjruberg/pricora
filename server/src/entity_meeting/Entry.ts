import { CreateDateColumn, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ObjectType, Field, ID, InputType } from "type-graphql";

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

@Entity()
@ObjectType()
export class Entry extends EntryInput {
  @Field(() => ID, { description: "Auto-generated uuid for the entry" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => String)
  @CreateDateColumn()
  created: Date;
}
