import {Controller, Get, Param, ParseIntPipe, NotFoundException, UseGuards, Req, Patch, Delete, Body, ForbiddenException, HttpStatus} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/jwt-auth/roles.guard';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  async findAll() {
    return this.usersService.findAll();
  }

  
  @Get(':id')
  @Roles('admin', 'user')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = await this.usersService.findOne(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    const currentUser = req.user as any;
    if (currentUser.role === 'user' && currentUser.sub !== id) {
      throw new ForbiddenException('You cannot access other users data');
    }

    return user;
  }

  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<User>,
  ) {
    const updatedUser = await this.usersService.update(id, body);
    return {
      message: 'User updated successfully',
      statusCode: HttpStatus.OK,
      data: updatedUser,
    };
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.remove(id);
    return {
      message: `User with ID ${id} deleted successfully`,
      statusCode: HttpStatus.OK,
    };
  }

  @Get('email/:email')
  @Roles('admin')
  async findByEmail(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    return {
      message: 'User retrieved successfully',
      statusCode: HttpStatus.OK,
      data: user,
    };
  }
}
