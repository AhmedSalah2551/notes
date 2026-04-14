import {Controller, Post, Get, Patch, Delete, Param, Body, ParseIntPipe, UseGuards, Req, ForbiddenException} from '@nestjs/common';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/jwt-auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Request } from 'express';
import { User } from 'src/users/entities/user.entity';

@Controller('lists')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ListsController {
  constructor(private readonly listsService: ListsService) { }

  @Post(':boardId')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() dto: CreateListDto,
    @Req() req
  ) {
    return this.listsService.create(boardId, dto, req.user);
  }

  @Get('board/:boardId')
  @Roles('admin', 'user')
  findAllByBoard(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Req() req: Request,
  ) {
    return this.listsService.findAllByBoard(boardId, req.user as any);
  }

  @Get(':id')
  @Roles('admin', 'user')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const list = await this.listsService.findOne(id);
    const currentUser = req.user as any;

    if (list.board.user.id !== currentUser.id && currentUser.role !== 'admin') {
      throw new ForbiddenException('You are not allowed to access this list');
    }

    return {
      list: { id: list.id, title: list.title },
      board: { id: list.board.id, title: list.board.title },
      user: { id: list.board.user.id, email: list.board.user.email, role: list.board.user.role },
    };
  }

  @Patch(':id')
  @Roles('admin', 'user')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.listsService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles('admin', 'user')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as any;
    return this.listsService.remove(id, user);
  }

}
