import {
  CreateDateColumn,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Configuration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userEncrytedDEK: string;

  @Column()
  adminEncrytedDEK: string;

  @Column()
  passwordSalt: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
