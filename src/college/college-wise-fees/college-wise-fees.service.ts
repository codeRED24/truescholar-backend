import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, QueryFailedError } from "typeorm";
import { CollegeWiseFees } from "./college-wise-fees.entity";
import { CreateCollegeWiseFeesDto } from "./dto/create-collegewisefees.dto";
import { UpdateCollegeWiseFeesDto } from "./dto/update-collegewisefees.dto";
import { CollegeInfo } from "../college-info/college-info.entity";
import { CollegeWiseCourse } from "../college-wise-course/college_wise_course.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
@Injectable()
export class CollegeWiseFeesService {
  constructor(
    @InjectRepository(CollegeWiseFees)
    private readonly collegeWiseFeesRepository: Repository<CollegeWiseFees>,
    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>,
    @InjectRepository(CollegeWiseCourse)
    private readonly collegeWiseCourseRepository: Repository<CollegeWiseCourse>,
    @InjectRepository(CourseGroup)
    private readonly courseGroupRepository: Repository<CourseGroup>
  ) {}

  // GET ALL
  async findAll(collegewise_fees_id?: number): Promise<CollegeWiseFees[]> {
    if (collegewise_fees_id) {
      return this.collegeWiseFeesRepository.find({
        where: {
          collegewise_fees_id:
            // Like(`%${
            collegewise_fees_id,
          // }%`),
        },
      });
    }
    return this.collegeWiseFeesRepository.find();
  }

  // GET /collegewisefees/:id
  async findOne(id: number): Promise<CollegeWiseFees> {
    const collegeWiseFees = await this.collegeWiseFeesRepository.findOne({
      where: { collegewise_fees_id: id },
    });
    if (!collegeWiseFees) {
      throw new NotFoundException(`College wise fees with ID ${id} not found`);
    }
    return collegeWiseFees;
  }

  // POST
  async create(
    createCollegeWiseFeesDto: CreateCollegeWiseFeesDto
  ): Promise<CollegeWiseFees> {
    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: createCollegeWiseFeesDto.college_id },
    });

    if (!college) {
      throw new NotFoundException(
        `College with ID ${createCollegeWiseFeesDto.college_id} not found`
      );
    }

    const collegeCourse = await this.collegeWiseCourseRepository.findOne({
      where: {
        college_wise_course_id: createCollegeWiseFeesDto.collegewise_course_id,
      },
    });

    if (!collegeCourse) {
      throw new NotFoundException(
        `CollegeWiseCourse with ID ${createCollegeWiseFeesDto.collegewise_course_id} not found`
      );
    }

    const courseGroup = await this.courseGroupRepository.findOne({
      where: { course_group_id: createCollegeWiseFeesDto.course_group_id },
    });

    if (!courseGroup) {
      throw new NotFoundException(
        `CourseGroup with ID ${createCollegeWiseFeesDto.course_group_id} not found`
      );
    }

    const collegeWiseFees = this.collegeWiseFeesRepository.create(
      createCollegeWiseFeesDto
    );
    try {
      return await this.collegeWiseFeesRepository.save(collegeWiseFees);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("College wise fees ID must be unique");
      }
      throw error;
    }
  }

  // PATCH /collegewisefees/:id
  async update(
    id: number,
    updateCollegeWiseFeesDto: UpdateCollegeWiseFeesDto
  ): Promise<{ message: string; data?: CollegeWiseFees }> {
    const collegeWiseFees = await this.findOne(id);
    if (!collegeWiseFees) {
      throw new NotFoundException(`College wise fees with ID ${id} not found`);
    }
    await this.collegeWiseFeesRepository.update(id, updateCollegeWiseFeesDto);
    const updatedCollegeWiseFees = await this.findOne(id);

    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: updateCollegeWiseFeesDto.college_id },
    });
    if (!college) {
      throw new NotFoundException(
        `College with ID ${updateCollegeWiseFeesDto.college_id} not found`
      );
    }

    const courseGroup = await this.courseGroupRepository.findOne({
      where: { course_group_id: updateCollegeWiseFeesDto.course_group_id },
    });

    if (!courseGroup) {
      throw new NotFoundException(
        `CourseGroup with ID ${updateCollegeWiseFeesDto.course_group_id} not found`
      );
    }

    return {
      message: "College wise fees updated successfully",
      data: updatedCollegeWiseFees,
    };
  }
  catch(error) {
    if (
      error instanceof QueryFailedError &&
      error.message.includes("duplicate key value violates unique constraint")
    ) {
      throw new ConflictException("College wise fees ID must be unique");
    }
    throw error;
  }

  // DELETE /collegewisefees/:id
  async delete(id: number): Promise<{ message: string }> {
    const collegeWiseFees = await this.findOne(id);
    if (!collegeWiseFees) {
      throw new NotFoundException(`College wise fees with ID ${id} not found`);
    }
    await this.collegeWiseFeesRepository.remove(collegeWiseFees);
    return { message: "College wise fees deleted successfully" };
  }

  // GET /college-content/by-college?cid=7000007
  async findByCollegeId(collegeId: number): Promise<CollegeWiseFees[]> {
    const fees = await this.collegeWiseFeesRepository.find({
      where: { college_id: collegeId },
    });

    if (!fees || fees.length === 0) {
      throw new NotFoundException(`No Fees found for College ID ${collegeId}`);
    }

    return fees;
  }

  async createBulk(
    createCollegeWiseFeesDtos: CreateCollegeWiseFeesDto[]
  ): Promise<{ message: string; data: CollegeWiseFees[] }> {
    const createdFees: CollegeWiseFees[] = [];

    for (const createCollegeWiseFeesDto of createCollegeWiseFeesDtos) {
      const college = await this.collegeInfoRepository.findOne({
        where: { college_id: createCollegeWiseFeesDto.college_id },
      });

      if (!college) {
        throw new NotFoundException(
          `College with ID ${createCollegeWiseFeesDto.college_id} not found`
        );
      }

      const collegeCourse = await this.collegeWiseCourseRepository.findOne({
        where: {
          college_wise_course_id:
            createCollegeWiseFeesDto.collegewise_course_id,
        },
      });

      if (!collegeCourse) {
        throw new NotFoundException(
          `CollegeWiseCourse with ID ${createCollegeWiseFeesDto.collegewise_course_id} not found`
        );
      }

      const courseGroup = await this.courseGroupRepository.findOne({
        where: { course_group_id: createCollegeWiseFeesDto.course_group_id },
      });

      if (!courseGroup) {
        throw new NotFoundException(
          `CourseGroup with ID ${createCollegeWiseFeesDto.course_group_id} not found`
        );
      }

      const collegeWiseFees = this.collegeWiseFeesRepository.create(
        createCollegeWiseFeesDto
      );

      try {
        const savedFees =
          await this.collegeWiseFeesRepository.save(collegeWiseFees);
        createdFees.push(savedFees);
      } catch (error) {
        if (
          error instanceof QueryFailedError &&
          error.message.includes(
            "duplicate key value violates unique constraint"
          )
        ) {
          throw new ConflictException("College wise fees ID must be unique");
        }
        throw error;
      }
    }

    return {
      message: "College wise fees entries created successfully",
      data: createdFees,
    };
  }
}
