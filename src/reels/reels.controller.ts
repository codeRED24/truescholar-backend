import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ReelsService } from "./reels.service";
import { CreateReelDto } from "./dto/create-reel.dto";
import { UpdateReelDto } from "./dto/update-reel.dto";
import { ApiBody, ApiConsumes, ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AnyFilesInterceptor } from "@nest-lab/fastify-multer";
import { sendEmail } from "../utils/email";
import { AuthGuard } from "../authentication_module/better-auth/guards/auth.guard";
import { User as UserDecorator } from "../authentication_module/better-auth/decorators/auth.decorators";
import { User } from "../authentication_module/better-auth/entities";

@Controller("reels")
@ApiTags("reels")
export class ReelsController {
  constructor(private readonly reelsService: ReelsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        reel: { type: "string", format: "binary" },
        college_id: { type: "number" },
        type: { type: "string" },
      },
    },
  })
  @UseInterceptors(AnyFilesInterceptor())
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body() createReelDto: CreateReelDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: any,
    @UserDecorator() user: User
  ) {
    const reel = await this.reelsService.create(
      createReelDto,
      files,
      req,
      user
    );
    if (process.env.TO_EMAIL) {
      sendEmail("New Reel Submitted", "new-reel", {
        user_id: user.id,
        college_id: reel.college_id,
        type: reel.type,
        user_name: user.name,
        user_email: user.email,
      });
    }
    return reel;
  }

  @Get()
  async findAll() {
    return this.reelsService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.reelsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateReelDto: UpdateReelDto
  ) {
    return this.reelsService.update(id, updateReelDto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.reelsService.remove(id);
  }
}
