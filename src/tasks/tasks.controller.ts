import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/jwt-auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Request } from 'express';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Post()
  @Roles('admin', 'user')
    create(@Body() dto: CreateTaskDto, @Req() req: Request) {
      const user = req.user as any;
      return this.tasksService.create(dto, user);
    }

  @Get()
  @Roles('admin', 'user')
    findAll(@Req() req: Request) {
      const user = req.user as any;
      return this.tasksService.findAll(user);
    }

  @Get(':id')
  @Roles('admin', 'user')
    findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
      const user = req.user as any;
      return this.tasksService.findOne(id, user);
    }

  @Patch(':id')
  @Roles('admin', 'user')
    update( @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskDto, @Req() req: Request,) 
    {
      const user = req.user as any;
      return this.tasksService.update(id, dto, user);
    }

  @Delete(':id')
  @Roles('admin', 'user')
    remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
      const user = req.user as any;
      return this.tasksService.remove(id, user);
    }
}
