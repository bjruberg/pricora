import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MeetingToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false, unique: false })
  meetingId: string;

  @CreateDateColumn()
  created: Date;
}
