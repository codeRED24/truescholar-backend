import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-users.dto';
import { UpdateUserDto } from './dto/update-users.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.userService.create(createUserDto);
    return {
      message: 'User created successfully',
      data: newUser,
    };
  }

  @Get()
  async findAll(@Query('username') username?: string) {
    const users = await this.userService.findAll(username);
    return {
      message: 'Users retrieved successfully',
      data: users,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const user = await this.userService.findOne(id);
    return {
      message: `User with ID ${id} retrieved successfully`,
      data: user,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    const result = await this.userService.update(id, updateUserDto);
    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const result = await this.userService.remove(id);
    return result;
  }
}
