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
  UseGuards,
  Req,
} from "@nestjs/common";
import { UserService } from "./users.service";
import { ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AnyFilesInterceptor, File } from "@nest-lab/fastify-multer";
import { UpdateUserDto } from "./dto/update-users.dto";
import { OwnerGuard } from "../../common/guards/owner.guard";
import { RefreshAuthGuard } from "../auth/refresh-auth.guard";
import { Request } from "express";
import { UserPayload } from "../../common/interfaces/user-payload.interface";

@ApiTags("users")
@Controller("users")
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  @UseGuards(RefreshAuthGuard, OwnerGuard)
  async findOne(@Param("id") id: number) {
    const user = await this.userService.findUserById(id);
    return {
      message: `User retrieved successfully`,
      data: user,
    };
  }

  @Patch(":id")
  @UseGuards(RefreshAuthGuard, OwnerGuard)
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
  @UseGuards(RefreshAuthGuard, OwnerGuard)
  async remove(@Param("id") id: number) {
    const result = await this.userService.remove(id);
    return result;
  }

  // The following endpoints (by-email, by-phone) are not protected by OwnerGuard
  // as they are typically used for lookup, not direct resource access/modification.
  // If these should also be restricted to the authenticated user's own data,
  // additional logic would be needed (e.g., checking if the email/phone matches req.user.email/phone).

  @Get("by-email/:email")
  @UseGuards(RefreshAuthGuard)
  async findOneByEmail(@Param("email") email: string) {
    const user = await this.userService.findUserByEmail(email);
    return {
      message: `User with email ${email} retrieved successfully`,
      data: user,
    };
  }

  @Get("by-phone/:phone")
  @UseGuards(RefreshAuthGuard)
  async findOneByPhone(@Param("phone") phone: string) {
    const user = await this.userService.findOneByPhone(phone);
    return {
      message: `User with phone ${phone} retrieved successfully`,
      data: user,
    };
  }

  @Get("profile/:id")
  @UseGuards(RefreshAuthGuard, OwnerGuard)
  async getProfileById(@Param("id") id: number) {
    const profile = await this.userService.getProfile(id);
    return {
      message: "Profile retrieved",
      data: profile,
    };
  }

  // Add an endpoint to get the current user's profile without an ID parameter
  @Get("profile")
  @UseGuards(RefreshAuthGuard)
  async getCurrentUserProfile(@Req() req: Request) {
    const user = req.user as UserPayload;
    const profile = await this.userService.getProfile(user.userId);
    return {
      message: "Current user profile retrieved",
      data: profile,
    };
  }
}
