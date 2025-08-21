import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  ValidationPipe,
  UseInterceptors,
  UploadedFiles,
  Req,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { AnyFilesInterceptor } from "@nest-lab/fastify-multer";

@ApiTags("reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        user_id: { type: "number" },
        profile_picture: { type: "string", format: "binary" },
        degree_certificate: { type: "string", format: "binary" },
        mark_sheet: { type: "string", format: "binary" },
        college_images: {
          type: "array",
          items: { type: "string", format: "binary" },
        },
        student_id: { type: "string", format: "binary" },
        college_id: { type: "number" },
        course_id: { type: "number" },
        college_location: { type: "string" },
        pass_year: { type: "number" },
        review_title: { type: "string" },
        linkedin_profile: { type: "string" },
        college_admission_comment: { type: "string" },
        campus_experience_comment: { type: "string" },
        placement_journey_comment: { type: "string" },
        academic_experience_comment: { type: "string" },
        campus_experience_rating: { type: "number" },
        placement_journey_rating: { type: "number" },
        academic_experience_rating: { type: "number" },
        college_admission_rating: { type: "number" },
      },
    },
  })
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({ summary: "Create a review" })
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: any
  ) {
    // Delegate file handling and creation to service
    return this.reviewsService.create(createReviewDto, files, req);
  }

  @Get()
  @ApiOperation({ summary: "Get all reviews" })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "skip", required: false })
  @ApiQuery({ name: "take", required: false })
  findAll(
    @Query("status") status?: string,
    @Query("skip", ParseIntPipe) skip = 0,
    @Query("take", ParseIntPipe) take = 25
  ) {
    return this.reviewsService.findAll(status, skip, take);
  }

  @Get(":id")
  findOne(@Param("id", new ParseIntPipe()) id: number) {
    return this.reviewsService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", new ParseIntPipe()) id: number,
    @Body(new ValidationPipe({ whitelist: true }))
    updateReviewDto: UpdateReviewDto
  ) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Delete(":id")
  remove(@Param("id", new ParseIntPipe()) id: number) {
    return this.reviewsService.remove(id);
  }
}
