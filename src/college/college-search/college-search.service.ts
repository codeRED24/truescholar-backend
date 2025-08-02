import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { CollegeInfo } from "../college-info/college-info.entity";

@Injectable()
export class CollegeSearchService {
  constructor(
    @InjectRepository(CollegeInfo)
    private readonly collegeRepository: Repository<CollegeInfo>
  ) {}

  async searchColleges(query: string) {
    const results = await this.collegeRepository.find({
      where: [
        { college_name: ILike(`%${query}%`), is_active: true },
        { search_names: ILike(`%${query}%`), is_active: true },
        { short_name: ILike(`%${query}%`), is_active: true },
        { location: ILike(`%${query}%`), is_active: true },
      ],
      select: ["college_id", "college_name", "slug", "location", "kapp_rating"],
    });

    const colleges = results.map((college) => ({
      college_id: college.college_id,
      college_name: college.college_name,
      location: college.location,
      kapp_rating: college.kapp_rating ?? null,
      slug: college.slug,
    }));

    return { success: true, data: { colleges } };
  }
}
