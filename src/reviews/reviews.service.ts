import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { Review } from "./entities/review.entity";
import { User } from "src/authentication_module/users/users.entity";

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<any> {
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
