import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import { UserService } from "./users.service";
import { UpdateUserDto } from "./dto/update-users.dto";
import { ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AnyFilesInterceptor, File } from "@nest-lab/fastify-multer";

@ApiTags("users")
@Controller("users")
@UseInterceptors(ClassSerializerInterceptor)
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
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({ summary: "Update User" })
  async update(
    @Param("id") id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFiles() files: Array<File>
  ) {
    const file = files && files.length > 0 ? files[0] : undefined;
    const result = await this.userService.update(id, updateUserDto, file);
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

  @Get("profile/:id")
  async getProfileById(@Param("id") id: number) {
    const profile = await this.userService.getProfile(id);
    return {
      message: "Profile retrieved",
      data: profile,
    };
  }
}
