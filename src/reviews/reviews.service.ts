import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { Review } from "./entities/review.entity";
import { FileUploadService } from "../utils/file-upload/fileUpload.service";
import { User } from "../authentication_module/users/users.entity";

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly fileUploadService: FileUploadService
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    files: Array<Express.Multer.File> = [],
    req?: any
  ): Promise<any> {
    try {
      // If files are provided, upload and set URLs on DTO
      if (files && files.length) {
        const degreeCert = files?.find(
          (f) => f.fieldname === "degree_certificate"
        );
        const markSheet = files?.find((f) => f.fieldname === "mark_sheet");
        const studentId = files?.find((f) => f.fieldname === "student_id");
        const collegeImages = files?.filter(
          (f) => f.fieldname === "college_images"
        );

        if (degreeCert) {
          const url = await this.fileUploadService.uploadFile(
            degreeCert as any,
            "reviews/documents",
            createReviewDto.user_id
          );
          createReviewDto.degree_certificate_url = url;
        }

        if (markSheet) {
          const url = await this.fileUploadService.uploadFile(
            markSheet as any,
            "reviews/documents",
            createReviewDto.user_id
          );
          createReviewDto.mark_sheet_url = url;
        }

        if (studentId) {
          const url = await this.fileUploadService.uploadFile(
            studentId as any,
            "reviews/documents",
            createReviewDto.user_id
          );
          createReviewDto.student_id_url = url;
        }

        if (collegeImages && collegeImages.length) {
          const urls: string[] = [];
          for (const img of collegeImages) {
            const url = await this.fileUploadService.uploadFile(
              img as any,
              "reviews/college_images",
              createReviewDto.user_id
            );
            urls.push(url);
          }
          createReviewDto.college_images_urls = urls;
        }
      }

      if (req?.user?.userId && !createReviewDto.user_id) {
        console.log("Setting user_id from req.user:", req.user.userId);
        createReviewDto.user_id = req.user.userId;
      }

      // Create logic - include all fields from DTO
      const review = this.reviewRepository.create(createReviewDto);

      const savePromise = this.reviewRepository.save(review);
      const userPromise = createReviewDto.user_id
        ? this.userRepository.findOne({
            where: { id: createReviewDto.user_id },
            select: ["custom_code"],
          })
        : Promise.resolve(null);

      // Run all queries in parallel
      const [savedReview, user] = await Promise.all([savePromise, userPromise]);

      const result = { ...savedReview, custom_code: user?.custom_code ?? null };
      return result;
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  }

  async findAll(
    status?: string,
    skip = 0,
    take = 25
  ): Promise<{ data: Review[]; total: number }> {
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await this.reviewRepository.findAndCount({
      where,
      skip,
      take,
      order: { created_at: "DESC" },
    });

    return { data, total };
  }

  async findAllByCollege(
    collegeId: number,
    page = 1,
    limit = 10
  ): Promise<{ data: Review[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.reviewRepository.findAndCount({
      where: { college_id: collegeId, status: "approved" },
      relations: ["user"],
      order: { created_at: "DESC" },
      skip,
      take: limit,
    });
    return { data, total };
  }

  async getAggregatedRatings(collegeId: number): Promise<any> {
    const ratings = await this.reviewRepository
      .createQueryBuilder("review")
      .select(
        "ROUND(AVG(review.overall_satisfaction_rating), 1)",
        "overall_satisfaction_rating"
      )
      .addSelect(
        "ROUND(AVG(review.teaching_quality_rating), 1)",
        "teaching_quality_rating"
      )
      .addSelect(
        "ROUND(AVG(review.infrastructure_rating), 1)",
        "infrastructure_rating"
      )
      .addSelect("ROUND(AVG(review.library_rating), 1)", "library_rating")
      .addSelect(
        "ROUND(AVG(review.placement_support_rating), 1)",
        "placement_support_rating"
      )
      .addSelect(
        "ROUND(AVG(review.administrative_support_rating), 1)",
        "administrative_support_rating"
      )
      .addSelect("ROUND(AVG(review.hostel_rating), 1)", "hostel_rating")
      .addSelect(
        "ROUND(AVG(review.extracurricular_rating), 1)",
        "extracurricular_rating"
      )
      .where("review.college_id = :collegeId", { collegeId })
      .andWhere("review.status = :status", { status: "approved" })
      .getRawOne();

    const ratingBreakdown = await this.getRatingBreakdown(collegeId);

    return { ...ratings, ratingBreakdown };
  }

  async getRatingBreakdown(collegeId: number): Promise<any> {
    const ratingCounts = await this.reviewRepository
      .createQueryBuilder("review")
      .select(
        "review.overall_satisfaction_rating as stars, COUNT(*)::int as count"
      )
      .where("review.college_id = :collegeId", { collegeId })
      .andWhere("review.status = :status", { status: "approved" })
      .groupBy("review.overall_satisfaction_rating")
      .getRawMany();

    const totalReviews = ratingCounts.reduce(
      (acc, item) => acc + item.count,
      0
    );

    let ratingBreakdown;
    if (totalReviews === 0) {
      ratingBreakdown = Array.from({ length: 5 }, (_, i) => ({
        stars: 5 - i,
        percentage: 0,
      }));
    } else {
      ratingBreakdown = Array.from({ length: 5 }, (_, i) => {
        const stars = 5 - i;
        const item = ratingCounts.find((r) => r.stars === stars);
        return {
          stars,
          percentage: item ? Math.round((item.count / totalReviews) * 100) : 0,
        };
      });
    }

    return ratingBreakdown;
  }

  async findOne(id: number): Promise<Review | null> {
    return this.reviewRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateReviewDto: UpdateReviewDto
  ): Promise<Review | null> {
    await this.reviewRepository.update(id, updateReviewDto as any);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.reviewRepository.delete(id);
  }
}
