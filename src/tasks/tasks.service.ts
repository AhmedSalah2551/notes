import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListsService } from 'src/lists/lists.service';
import { Task } from './entities/task.entity';
import { User } from 'src/users/entities/user.entity';
import { Board } from 'src/boards/entities/board.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly listsService: ListsService,
  ) {}

  async create(dto: CreateTaskDto, user: User) {
    const list = await this.listsService.findOne(dto.listId);
    if (!list) throw new NotFoundException('List not found');

    const task = this.taskRepository.create({
      ...dto,
      user,
      list,
    });

    this.taskRepository.save(task);
    
    return {
      message: "task created successfully",
      task: {id: task.id, title: task.title, descibtion: task.description, completed: task.completed, createAt: task.createdAt, updatedAt: task.updatedAt},
      board: {id: task.list.board.id, title: task.list.board.title},
      list: {id: task.list.id, title: task.list.title},
      user: {id: task.user.id, email: task.user.email, role: task.user.role}
    }
  }

  async findAll(user: User) {
    if (user.role === 'admin') {
      return this.taskRepository.find({ relations: ['user', 'list'] });
    }

    return this.taskRepository.find({
      where: { user: { id: user.id } },
      relations: ['list'],
    });
  }

  async findOneByEntity(id: number, user: User) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['user', 'list'],
    });

    if (!task) throw new NotFoundException('Task not found');

    if (user.role !== 'admin' && task.user.id !== user.id) {
      throw new ForbiddenException('You cannot access this task');
    }

    return task;
  }

  async findOne(id: number, user: User) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['user', 'list'],
    });

    if (!task) throw new NotFoundException('Task not found');

    if (user.role !== 'admin' && task.user.id !== user.id) {
      throw new ForbiddenException('You cannot access this task');
    }

    return {
      task: {id: task.id, title: task.title, descibtion: task.description, completed: task.completed, createAt: task.createdAt, updatedAt: task.updatedAt},
      list: {id: task.list.id, title: task.list.title},
      user: {id: task.user.id, email: task.user.email, role: task.user.role}
    };
  }

  async update(id: number, dto: UpdateTaskDto, user: User) {
    const task = await this.findOneByEntity(id, user);
    Object.assign(task, dto);

    this.taskRepository.save(task);

    return {
      message: "task updated successfully",
    } 
  }

  async remove(id: number, user: User) {
    const task = await this.findOneByEntity(id, user);

    this.taskRepository.remove(task);

    return {
      message: "task deleted successfully"
    };
  }
}
