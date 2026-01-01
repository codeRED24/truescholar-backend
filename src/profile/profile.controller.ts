import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor, File } from "@nest-lab/fastify-multer";
import { ProfileService } from "./profile.service";
import {
  UpdateProfileDto,
  ExperienceEntryDto,
  EducationEntryDto,
} from "./profile.dto";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/authentication_module/better-auth/guards/auth.guard";
import { User as UserDecorator } from "../authentication_module/better-auth/decorators/auth.decorators";
import { User } from "better-auth/types";
import { FileUploadService } from "src/utils/file-upload/fileUpload.service";

@Controller("profile")
@ApiTags("Profile")
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly fileUploadService: FileUploadService
  ) {}

  /**
   * Get current user's profile
   * GET /profile
   */
  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getProfile(@UserDecorator() user: User) {
    const profile = await this.profileService.getOrCreateProfile(user.id);
    return { profile };
  }

  /**
   * Update current user's profile
   * PUT /profile
   */
  @Put()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async updateProfile(
    @UserDecorator() user: User,
    @Body(new ValidationPipe({ transform: true })) updateDto: UpdateProfileDto
  ) {
    const profile = await this.profileService.updateProfile(user.id, updateDto);
    return { profile };
  }

  /**
   * Upload profile avatar
   * POST /profile/avatar
   */
  @Post("avatar")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("avatar"))
  async uploadAvatar(@UserDecorator() user: User, @UploadedFile() file: File) {
    if (!file) {
      return { error: "No file uploaded" };
    }

    // Upload to S3
    const imageUrl = await this.fileUploadService.uploadFile(
      file,
      "profile-avatars",
      user.id
    );

    // Update user's image field via profile service
    await this.profileService.updateUserImage(user.id, imageUrl);

    return { imageUrl };
  }

  /**
   * Delete profile avatar
   * DELETE /profile/avatar
   */
  @Delete("avatar")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async deleteAvatar(@UserDecorator() user: User) {
    await this.profileService.updateUserImage(user.id, null);
    return { success: true };
  }

  // ===== Experience Endpoints =====

  @Post("experience")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async addExperience(
    @UserDecorator() user: User,
    @Body(new ValidationPipe({ transform: true }))
    experienceDto: ExperienceEntryDto
  ) {
    const profile = await this.profileService.addExperience(
      user.id,
      experienceDto
    );
    return { profile };
  }

  @Put("experience/:id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async updateExperience(
    @UserDecorator() user: User,
    @Param("id") experienceId: string,
    @Body(new ValidationPipe({ transform: true }))
    updates: Partial<ExperienceEntryDto>
  ) {
    const profile = await this.profileService.updateExperience(
      user.id,
      experienceId,
      updates
    );
    return { profile };
  }

  @Delete("experience/:id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async deleteExperience(
    @UserDecorator() user: User,
    @Param("id") experienceId: string
  ) {
    const profile = await this.profileService.deleteExperience(
      user.id,
      experienceId
    );
    return { profile };
  }

  // ===== Education Endpoints =====

  @Post("education")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async addEducation(
    @UserDecorator() user: User,
    @Body(new ValidationPipe({ transform: true }))
    educationDto: EducationEntryDto
  ) {
    const profile = await this.profileService.addEducation(
      user.id,
      educationDto
    );
    return { profile };
  }

  @Put("education/:id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async updateEducation(
    @UserDecorator() user: User,
    @Param("id") educationId: string,
    @Body(new ValidationPipe({ transform: true }))
    updates: Partial<EducationEntryDto>
  ) {
    const profile = await this.profileService.updateEducation(
      user.id,
      educationId,
      updates
    );
    return { profile };
  }

  @Delete("education/:id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async deleteEducation(
    @UserDecorator() user: User,
    @Param("id") educationId: string
  ) {
    const userId = user.id;
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const profile = await this.profileService.deleteEducation(
      userId,
      educationId
    );
    return { profile };
  }
}
