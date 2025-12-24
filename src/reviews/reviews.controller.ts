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
  DefaultValuePipe,
  UseGuards,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AnyFilesInterceptor } from "@nest-lab/fastify-multer";
import { sendEmail } from "src/utils/email";
import { AuthGuard } from "../authentication_module/better-auth/guards/auth.guard";
import { User as UserDecorator } from "../authentication_module/better-auth/decorators/auth.decorators";
import { User } from "../authentication_module/better-auth/entities";

@ApiTags("reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        user_id: { type: "string" },
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
        // Financial Information
        annual_tuition_fees: { type: "number" },
        hostel_fees: { type: "number" },
        other_charges: { type: "number" },
        scholarship_availed: { type: "boolean" },
        scholarship_name: { type: "string" },
        scholarship_amount: { type: "number" },
        // Detailed Feedback Fields
        overall_satisfaction_rating: { type: "number" },
        overall_experience_feedback: { type: "string" },
        teaching_quality_rating: { type: "number" },
        teaching_quality_feedback: { type: "string" },
        infrastructure_rating: { type: "number" },
        infrastructure_feedback: { type: "string" },
        library_rating: { type: "number" },
        library_feedback: { type: "string" },
        placement_support_rating: { type: "number" },
        placement_support_feedback: { type: "string" },
        administrative_support_rating: { type: "number" },
        administrative_support_feedback: { type: "string" },
        hostel_rating: { type: "number" },
        hostel_feedback: { type: "string" },
        extracurricular_rating: { type: "number" },
        extracurricular_feedback: { type: "string" },
        improvement_suggestions: { type: "string" },
      },
    },
  })
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({ summary: "Create a review" })
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: any,
    @UserDecorator() user: User
  ) {
    try {
      // Delegate file handling and creation to service
      const result = await this.reviewsService.create(
        createReviewDto,
        files,
        req
      );

      // Send notification email to admin
      if (process.env.TO_EMAIL) {
        sendEmail("New Review Submission", "new-review", {
          user_id: user.id,
          user: user.name || user.email,
          college_id: createReviewDto.college_id,
          course_id: createReviewDto.course_id,
          review_title: createReviewDto.review_title,
        });
      }

      // Send confirmation email to the user who submitted the review
      if (user?.email) {
        sendEmail(
          "Thank You for Your Review - TrueScholar",
          "review-submission-user",
          {
            user_name: user.name || user.email,
            current_year: new Date().getFullYear(),
          },
          user.email
        );
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get("college/:college_id")
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  findAllByCollege(
    @Param("college_id") college_id: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10
  ) {
    return this.reviewsService.findAllByCollege(+college_id, page, limit);
  }

  @Get("/college/:collegeId/ratings")
  @ApiOperation({ summary: "Get aggregated ratings for a college" })
  getAggregatedRatings(@Param("collegeId", ParseIntPipe) collegeId: number) {
    return this.reviewsService.getAggregatedRatings(collegeId);
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

  @Get("user/:userId")
  @ApiOperation({ summary: "Get all reviews by a user" })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "skip", required: false })
  @ApiQuery({ name: "take", required: false })
  findAllByUser(
    @Param("userId") userId: string,
    @Query("status") status?: string,
    @Query("skip", new DefaultValuePipe(0), ParseIntPipe) skip = 0,
    @Query("take", new DefaultValuePipe(10), ParseIntPipe) take = 10
  ) {
    return this.reviewsService.findAllByUser(userId, status, skip, take);
  }
}
