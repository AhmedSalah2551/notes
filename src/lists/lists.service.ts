import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { List } from './entities/list.entity';
import { Repository } from 'typeorm';
import { BoardsService } from 'src/boards/boards.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private listRepository: Repository<List>,
    private boardsService: BoardsService,
  ) { }

  async create(boardId: number, dto: CreateListDto, user: User) {
    const board = await this.boardsService.findBoardEntity(boardId, user);
    if (!board) throw new NotFoundException('Board not found');

    const list = this.listRepository.create({ ...dto, board });

    const savedList = await this.listRepository.save(list);

    return {
      message: 'List created successfully',
      list: {
        id: savedList.id,
        title: savedList.title,
        board: { id: board.id, title: board.title },
      },
    };
  }

  async findAllByBoard(boardId: number, user: User) {
    const board = await this.boardsService.findOne(boardId, user);
    if (!board) throw new NotFoundException('Board not found');

    if (user.role !== 'admin' && board.user.id !== user.id) {
      throw new ForbiddenException('You cannot access this board');
    }

    return this.listRepository.find({
      where: { board: { id: boardId } },
      relations: ['board', 'tasks'],
    });
  }

  async findOne(id: number): Promise<List> {
    const list = await this.listRepository.findOne({
      where: { id },
      relations: ['board', 'board.user', 'tasks'],
    });

    if (!list) throw new NotFoundException('List not found');
    return list;
  }

  async update(listId: number, dto: UpdateListDto, user: User) {
    const list = await this.listRepository.findOne({
      where: { id: listId },
      relations: ['board', 'board.user'],
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }
    if (user.role !== 'admin' && list.board.user.id !== user.id) {
      throw new ForbiddenException('You are not allowed to update this list');
    }

    Object.assign(list, dto);
    
    await this.listRepository.save(list)

    return {
      message: 'List updated successfully'
    };
  }

  async remove(id: number, user: User) {
    const list = await this.findOne(id); 
    this.listRepository.remove(list)
    return { message: 'List removed successfully' };
  }

}
