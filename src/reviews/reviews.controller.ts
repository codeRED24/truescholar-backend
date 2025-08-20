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
import { FileUploadService } from "../utils/file-upload/fileUpload.service";

@ApiTags("reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly fileUploadService: FileUploadService
  ) {}

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
    // Extract files by fieldname (if provided)
    const profilePic = files?.find((f) => f.fieldname === "profile_picture");
    const degreeCert = files?.find((f) => f.fieldname === "degree_certificate");
    const markSheet = files?.find((f) => f.fieldname === "mark_sheet");
    const studentId = files?.find((f) => f.fieldname === "student_id");
    const collegeImages = files?.filter(
      (f) => f.fieldname === "college_images"
    );

    // Upload each file to S3 (if present) and set URL fields on DTO
    if (profilePic) {
      // @ts-ignore - multer File shape from fastify-multer
      const url = await this.fileUploadService.uploadFile(
        profilePic as any,
        "reviews/profile_pictures"
      );
      createReviewDto.profile_picture_url = url;
    }

    if (degreeCert) {
      const url = await this.fileUploadService.uploadFile(
        degreeCert as any,
        "reviews/documents"
      );
      createReviewDto.degree_certificate_url = url;
    }

    if (markSheet) {
      const url = await this.fileUploadService.uploadFile(
        markSheet as any,
        "reviews/documents"
      );
      createReviewDto.mark_sheet_url = url;
    }

    if (studentId) {
      const url = await this.fileUploadService.uploadFile(
        studentId as any,
        "reviews/student-ids"
      );
      createReviewDto.student_id_url = url;
    }

    if (collegeImages && collegeImages.length) {
      const urls: string[] = [];
      for (const img of collegeImages) {
        const url = await this.fileUploadService.uploadFile(
          img as any,
          "reviews/college_images"
        );
        urls.push(url);
      }
      createReviewDto.college_images_urls = urls;
    }

    if (req?.user?.userId && !createReviewDto.user_id) {
      createReviewDto.user_id = req.user.userId;
    }

    return this.reviewsService.create(createReviewDto);
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
