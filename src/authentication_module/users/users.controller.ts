import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { UserService } from "./users.service";
import { UpdateUserDto } from "./dto/update-users.dto";
import { ApiTags } from "@nestjs/swagger";
import { RegisterUserDto } from "../auth/dto/register-users.dto";

@ApiTags("users")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  async findOne(@Param("id") id: number) {
    const user = await this.userService.findOne(id);
    return {
      message: `User with ID ${id} retrieved successfully`,
      data: user,
    };
  }

  @Patch(":id")
  async update(@Param("id") id: number, @Body() updateUserDto: UpdateUserDto) {
    const result = await this.userService.update(id, updateUserDto);
    return result;
  }

  @Delete(":id")
  async remove(@Param("id") id: number) {
    const result = await this.userService.remove(id);
    return result;
  }

  @Get("by-email/:email")
  async findOneByEmail(@Param("email") email: string) {
    const user = await this.userService.findOneByEmail(email);
    return {
      message: `User with email ${email} retrieved successfully`,
      data: user,
    };
  }

  @Get("by-phone/:phone")
  async findOneByPhone(@Param("phone") phone: string) {
    const user = await this.userService.findOneByPhone(phone);
    return {
      message: `User with phone ${phone} retrieved successfully`,
      data: user,
    };
  }
}
