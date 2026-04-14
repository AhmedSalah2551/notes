import { Board } from "src/boards/entities/board.entity";
import { Task } from "src/tasks/entities/task.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class User {
 @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @Column({  type: 'text', nullable: true })
  refreshToken?: string | null;

  @OneToMany(() => Board, (board) => board.user)
  boards: Board[];

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];
}
