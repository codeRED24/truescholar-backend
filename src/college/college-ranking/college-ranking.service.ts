import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, QueryFailedError } from "typeorm";
import { CollegeRanking } from "./college-ranking.entity";
import { CreateCollegeRankingDto } from "./dto/create-college-ranking.dto";
import { UpdateCollegeRankingDto } from "./dto/update-college-ranking.dto";
import { CollegeInfo } from "../college-info/college-info.entity";
import { Stream } from "../../helper_entities/stream/stream.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
@Injectable()
export class CollegeRankingService {
  constructor(
    @InjectRepository(CollegeRanking)
    private readonly collegeRankingRepository: Repository<CollegeRanking>,
    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>,
    @InjectRepository(Stream)
    private readonly streamRepository: Repository<Stream>,
    @InjectRepository(CourseGroup)
    private readonly courseGroupRepository: Repository<CourseGroup>
  ) {}

  // GET ALL
  async findAll(): Promise<CollegeRanking[]> {
    return this.collegeRankingRepository.find();
  }

  // GET /college-ranking/:id
  async findOne(id: number): Promise<CollegeRanking> {
    const ranking = await this.collegeRankingRepository.findOne({
      where: { college_ranking_id: id },
    });
    if (!ranking) {
      throw new NotFoundException(`College Ranking with ID ${id} not found`);
    }
    return ranking;
  }
  // POST
  async create(
    createCollegeRankingDto: CreateCollegeRankingDto
  ): Promise<CollegeRanking> {
    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: createCollegeRankingDto.college_id },
    });

    const stream = await this.streamRepository.findOne({
      where: { stream_id: createCollegeRankingDto.stream_id },
    });
    const courseGroup = await this.courseGroupRepository.findOne({
      where: { course_group_id: createCollegeRankingDto.course_group_id },
    });

    if (!college) {
      throw new NotFoundException(
        `College with ID ${createCollegeRankingDto.college_id} not found`
      );
    }

    if (!stream) {
      throw new NotFoundException(
        `Stream with ID ${createCollegeRankingDto.stream_id} Not found`
      );
    }
    if (!courseGroup) {
      throw new NotFoundException(
        `Course Group with ID ${createCollegeRankingDto.course_group_id} not found`
      );
    }
    const ranking = this.collegeRankingRepository.create({
      ...createCollegeRankingDto,
      college,
      stream,
      courseGroup,
    });
    try {
      return await this.collegeRankingRepository.save(ranking);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("College Ranking ID must be unique");
      }
      throw error;
    }
  }

  // PATCH /college-ranking/:id
  async update(
    id: number,
    updateCollegeRankingDto: UpdateCollegeRankingDto
  ): Promise<{ message: string; data?: CollegeRanking }> {
    const ranking = await this.findOne(id);
    if (!ranking) {
      throw new NotFoundException(`College Ranking with ID ${id} not found`);
    }
    await this.collegeRankingRepository.update(id, updateCollegeRankingDto);
    const updatedRanking = await this.findOne(id);

    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: updateCollegeRankingDto.college_id },
    });

    const stream = await this.streamRepository.findOne({
      where: { stream_id: updateCollegeRankingDto.stream_id },
    });

    if (!college) {
      throw new NotFoundException(
        `College with ID ${updateCollegeRankingDto.college_id} not found`
      );
    }

    if (!stream) {
      throw new NotFoundException(
        `Stream with ID ${updateCollegeRankingDto.stream_id} Not found`
      );
    }

    const updatedEntity = {
      ...college,
      ...updateCollegeRankingDto,
      stream,
    };
    await this.collegeRankingRepository.save(updatedEntity);
    return {
      message: `College Ranking with ID ${id} updated successfully`,
      data: updatedRanking,
    };
  }

  // DELETE /college-ranking/:id
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.collegeRankingRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`College Ranking with ID ${id} not found`);
    }
    return { message: `College Ranking with ID ${id} deleted successfully` };
  }

  // GET /college-content/by-college?cid=7000007
  async findByCollegeId(collegeId: number): Promise<CollegeRanking[]> {
    const contents = await this.collegeRankingRepository.find({
      where: { college_id: collegeId },
    });

    if (!contents || contents.length === 0) {
      throw new NotFoundException(
        `No content found for College ID ${collegeId}`
      );
    }

    return contents;
  }

  //Bulk API to send Ranking's data.
  // async createBulk(
  //   createCollegeRankingDtos: CreateCollegeRankingDto[]
  // ): Promise<CollegeRanking[]> {
  //   const rankingsToSave: CollegeRanking[] = [];

  //   for (const dto of createCollegeRankingDtos) {
  //     const college = await this.collegeInfoRepository.findOne({
  //       where: { college_id: dto.college_id },
  //     });
  //     const stream = await this.streamRepository.findOne({
  //       where: { stream_id: dto.stream_id },
  //     });
  //     const courseGroup = await this.courseGroupRepository.findOne({
  //       where: { course_group_id: dto.course_group_id },
  //     });

  //     if (!college) {
  //       throw new NotFoundException(
  //         `College with ID ${dto.college_id} not found`
  //       );
  //     }

  //     if (!stream) {
  //       throw new NotFoundException(
  //         `Stream with ID ${dto.stream_id} not found`
  //       );
  //     }

  //     if (!courseGroup) {
  //       throw new NotFoundException(
  //         `Course Group with ID ${dto.course_group_id} not found`
  //       );
  //     }

  //     const ranking = this.collegeRankingRepository.create({
  //       ...dto,
  //       college,
  //       stream,
  //       courseGroup,
  //     });
  //     rankingsToSave.push(ranking);
  //   }

  //   try {
  //     return await this.collegeRankingRepository.save(rankingsToSave);
  //   } catch (error) {
  //     if (
  //       error instanceof QueryFailedError &&
  //       error.message.includes("duplicate key value violates unique constraint")
  //     ) {
  //       throw new ConflictException(
  //         "One or more College Ranking IDs must be unique"
  //       );
  //     }
  //     throw error;
  //   }
  // }

  async createBulk(
    createCollegeRankingDtos: CreateCollegeRankingDto[]
  ): Promise<CollegeRanking[]> {
    const collegeIds = createCollegeRankingDtos.map((dto) => dto.college_id);
    const streamIds = createCollegeRankingDtos.map((dto) => dto.stream_id);
    const courseGroupIds = createCollegeRankingDtos.map(
      (dto) => dto.course_group_id
    );

    // Batch fetch all necessary colleges, streams, and course groups
    const colleges = await this.collegeInfoRepository.findByIds(collegeIds);
    const streams = await this.streamRepository.findByIds(streamIds);
    const courseGroups =
      await this.courseGroupRepository.findByIds(courseGroupIds);

    // Convert arrays to maps for quick lookup
    const collegeMap = new Map(
      colleges.map((college) => [college.college_id, college])
    );
    const streamMap = new Map(
      streams.map((stream) => [stream.stream_id, stream])
    );
    const courseGroupMap = new Map(
      courseGroups.map((group) => [group.course_group_id, group])
    );

    const rankingsToSave: CollegeRanking[] = [];

    for (const dto of createCollegeRankingDtos) {
      const college = collegeMap.get(dto.college_id);
      const stream = streamMap.get(dto.stream_id);
      const courseGroup = courseGroupMap.get(dto.course_group_id);

      if (!college) {
        throw new NotFoundException(
          `College with ID ${dto.college_id} not found`
        );
      }
      if (!stream) {
        throw new NotFoundException(
          `Stream with ID ${dto.stream_id} not found`
        );
      }
      if (!courseGroup) {
        throw new NotFoundException(
          `Course Group with ID ${dto.course_group_id} not found`
        );
      }

      const ranking = this.collegeRankingRepository.create({
        ...dto,
        college,
        stream,
        courseGroup,
      });
      rankingsToSave.push(ranking);
    }

    try {
      // Save all rankings in one go
      return await this.collegeRankingRepository.save(rankingsToSave);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException(
          "One or more College Ranking IDs must be unique"
        );
      }
      throw error;
    }
  }
}
