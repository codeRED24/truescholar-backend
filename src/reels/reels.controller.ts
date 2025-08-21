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
} from "@nestjs/common";
import { ReelsService } from "./reels.service";
import { CreateReelDto } from "./dto/create-reel.dto";
import { UpdateReelDto } from "./dto/update-reel.dto";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";
import { AnyFilesInterceptor } from "@nest-lab/fastify-multer";

@Controller("reels")
export class ReelsController {
  constructor(private readonly reelsService: ReelsService) {}

  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        user_id: { type: "number" },
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
    @Req() req: any
  ) {
    // Delegate file handling and creation to service
    return this.reelsService.create(createReelDto, files, req);
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
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateReelDto: UpdateReelDto
  ) {
    return this.reelsService.update(id, updateReelDto);
  }

  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.reelsService.remove(id);
  }
}
