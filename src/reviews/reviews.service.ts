import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { Review } from "./entities/review.entity";
import { User } from "src/authentication_module/users/users.entity";
import { FileUploadService } from "../utils/file-upload/fileUpload.service";

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
    // If files are provided, upload and set URLs on DTO
    if (files && files.length) {
      const profilePic = files?.find((f) => f.fieldname === "profile_picture");
      const degreeCert = files?.find(
        (f) => f.fieldname === "degree_certificate"
      );
      const markSheet = files?.find((f) => f.fieldname === "mark_sheet");
      const studentId = files?.find((f) => f.fieldname === "student_id");
      const collegeImages = files?.filter(
        (f) => f.fieldname === "college_images"
      );

      if (profilePic) {
        const url = await this.fileUploadService.uploadFile(
          profilePic as any,
          "reviews/profile_pictures",
          createReviewDto.user_id
        );
        createReviewDto.profile_picture_url = url;
      }

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
      createReviewDto.user_id = req.user.userId;
    }

    // Original create logic
    const { profile_picture_url, ...cleanData } = createReviewDto;
    const review = this.reviewRepository.create(cleanData);

    const savePromise = this.reviewRepository.save(review);
    const userPromise = createReviewDto.user_id
      ? this.userRepository.findOne({
          where: { id: createReviewDto.user_id },
          select: ["custom_code"],
        })
      : Promise.resolve(null);

    const updateUserPromise =
      createReviewDto.user_id && createReviewDto.profile_picture_url
        ? this.userRepository.update(
            { id: createReviewDto.user_id },
            { user_img_url: createReviewDto.profile_picture_url }
          )
        : Promise.resolve(null);

    // Run all queries in parallel
    const [savedReview, user, _] = await Promise.all([
      savePromise,
      userPromise,
      updateUserPromise,
    ]);

    return { ...savedReview, custom_code: user?.custom_code ?? null };
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
