import { User } from "src/users/entities/user.entity";
import { List } from '../../lists/entities/list.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => User, (user) => user.boards, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => List, (list) => list.board)
  lists: List[];
}
