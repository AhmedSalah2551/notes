import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async create(dto: CreateBoardDto, user: User) {
    const board = this.boardRepository.create({
      ...dto,
      user,
    });
    return this.boardRepository.save(board);
  }

  async findAll(user: User) {
    if (user.role === 'admin') {
      return this.boardRepository.find({ relations: ['user', 'lists'] });
    }
    return this.boardRepository.find({
      where: { user: { id: user.id } },
      relations: ['lists'],
    });
  }

 async findBoardEntity(id: number, user: User): Promise<Board> {
  const board = await this.boardRepository.findOne({
    where: { id },
    relations: ['user', 'lists'],
  });

  if (!board) throw new NotFoundException('Board not found');

  if (user.role !== 'admin' && board.user.id !== user.id) {
    throw new ForbiddenException('Access denied');
  }

  return board;
}

  async findOne(id: number, user: User) {
    const board = await this.findBoardEntity(id, user);

    return {
      board: {
        id: board.id,
        title: board.title,
      },
      user: {
        id: board.user.id,
        email: board.user.email,
        role: board.user.role,
      },
      lists: board.lists.map((list) => ({
        id: list.id,
        title: list.title,
      })),
    };
  }

  async update(id: number, dto: UpdateBoardDto, user: User) {
    const board = await this.findBoardEntity(id, user);
    Object.assign(board, dto);
    const updated = await this.boardRepository.save(board);

    return {
      message: 'Board updated successfully',
      board: {
        id: updated.id,
        title: updated.title,
      },
    };
  }

  async remove(id: number, user: User) {
    const board = await this.findBoardEntity(id, user);
    await this.boardRepository.remove(board);

    return { message: `Board deleted successfully` };
  }
}
