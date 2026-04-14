import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/jwt-auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from 'express';
import { User } from 'src/users/entities/user.entity';

@Controller('boards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

@Post()
@Roles('admin', 'user')
async create(@Body() createBoardDto: CreateBoardDto, @Req() req: Request) {
  const user = req.user as User;
  return this.boardsService.create(createBoardDto, user);
}

  @Get()
  @Roles('admin', 'user')
  findAll(@Req() req: Request) {
    const user = req.user as any;
    return this.boardsService.findAll(user);
  }

  @Get(':id')
  @Roles('admin', 'user')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as any;
    return this.boardsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles('admin', 'user')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBoardDto, @Req() req: Request) {
    const user = req.user as any;
    return this.boardsService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles('admin', 'user')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as any;
    return this.boardsService.remove(id, user);
  }
}
