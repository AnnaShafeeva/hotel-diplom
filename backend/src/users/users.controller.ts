import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchUserParamsDto } from './dto/search-user.params';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ManagerGuard } from '../auth/guards/manager.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/api/client/register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create({
      ...dto,
      passwordHash: dto.password,
      role: 'client',
    });

    const { passwordHash, ...response } = user;
    return response;
  }

  @Post('/api/admin/users')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async adminCreate(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create({
      ...dto,
      passwordHash: dto.password,
      role: dto.role || 'client',
    });

    const { passwordHash, ...response } = user;
    return response;
  }

  @Get('/api/admin/users')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async listAdmin(@Query() query: SearchUserParamsDto) {
    const users = await this.usersService.findAll(query);
    return users.map(({ passwordHash, ...data }) => data);
  }

  @Get('/api/manager/users')
  @UseGuards(JwtAuthGuard, ManagerGuard)
  async listManager(@Query() query: SearchUserParamsDto) {
    const users = await this.usersService.findAll(query);
    return users.map(({ passwordHash, role, ...data }) => data);
  }

  @Get('/api/admin/users/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...response } = user;
    return response;
  }
}
