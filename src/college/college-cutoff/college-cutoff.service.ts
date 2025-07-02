import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, QueryFailedError } from "typeorm";
import { CollegeCutoff } from "./college_cutoff.entity";
import { CreateCollegeCutoffDto } from "./dto/create-college_cutoff.dto";
import { UpdateCollegeCutoffDto } from "./dto/update-college_cutoff.dto";
import { CollegeInfo } from "../college-info/college-info.entity";
import { Exam } from "../../exams_module/exams/exams.entity";
import { CollegeWiseCourse } from "../college-wise-course/college_wise_course.entity";
@Injectable()
export class CollegeCutoffService {
  constructor(
    @InjectRepository(CollegeCutoff)
    private readonly collegeCutoffRepository: Repository<CollegeCutoff>,
    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>,
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
    @InjectRepository(CollegeWiseCourse)
    private readonly collegeWiseCourseRepository: Repository<CollegeWiseCourse>
  ) {}

  async findAll(): Promise<CollegeCutoff[]> {
    return this.collegeCutoffRepository.find();
  }

  async findOne(id: number): Promise<CollegeCutoff> {
    const collegeCutoff = await this.collegeCutoffRepository.findOne({
      where: { college_cutoff_id: id },
    });
    if (!collegeCutoff) {
      throw new NotFoundException(`College cutoff with ID ${id} not found`);
    }
    return collegeCutoff;
  }

  // POST
  async create(
    createCollegeCutoffDto: CreateCollegeCutoffDto
  ): Promise<CollegeCutoff> {
    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: createCollegeCutoffDto.college_id },
    });

    if (!college) {
      throw new NotFoundException(
        `College with ID ${createCollegeCutoffDto.college_id} not found`
      );
    }

    const exam = await this.examRepository.findOne({
      where: { exam_id: createCollegeCutoffDto.exam_id },
    });

    if (!exam) {
      throw new NotFoundException(
        `Exam with ID ${createCollegeCutoffDto.exam_id} not found`
      );
    }
    const collegeWiseCourse = await this.collegeWiseCourseRepository.findOne({
      where: {
        college_wise_course_id: createCollegeCutoffDto.college_wise_course_id,
      },
    });

    if (!collegeWiseCourse) {
      throw new NotFoundException(
        `College Wise Course with ID ${createCollegeCutoffDto.college_wise_course_id} not found`
      );
    }

    const collegeCutoff = this.collegeCutoffRepository.create({
      ...createCollegeCutoffDto,
      collegeWiseCourse,
    });
    try {
      return await this.collegeCutoffRepository.save(collegeCutoff);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("College cutoff ID must be unique");
      }
      throw error;
    }
  }

  // PATCH
  async update(
    id: number,
    updateCollegeCutoffDto: UpdateCollegeCutoffDto
  ): Promise<{ message: string; data?: CollegeCutoff }> {
    const collegeCutoff = await this.findOne(id);

    await this.collegeCutoffRepository.update(id, updateCollegeCutoffDto);
    const updatedCollegeCutoff = await this.findOne(id);

    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: updateCollegeCutoffDto.college_id },
    });
    if (!college) {
      throw new NotFoundException(
        `College with ID ${updateCollegeCutoffDto.college_id} not found`
      );
    }

    const exam = await this.examRepository.findOne({
      where: { exam_id: updateCollegeCutoffDto.exam_id },
    });
    if (!exam) {
      throw new NotFoundException(
        `Exam with ID ${updateCollegeCutoffDto.exam_id} not found`
      );
    }
    return {
      message: `College cutoff with ID ${id} updated successfully`,
      data: updatedCollegeCutoff,
    };
  }

  // Delete API

  async delete(id: number): Promise<{ message: string }> {
    const result = await this.collegeCutoffRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`College cutoff with ID ${id} not found`);
    }
    return { message: `College cutoff with ID ${id} deleted successfully` };
  }

  // GET /college-content/by-college?cid=7000007
  async findByCollegeId(collegeId: number): Promise<CollegeCutoff[]> {
    const contents = await this.collegeCutoffRepository.find({
      where: { college_id: collegeId },
    });

    if (!contents || contents.length === 0) {
      throw new NotFoundException(
        `No content found for College ID ${collegeId}`
      );
    }

    return contents;
  }
  // GET /exam-content/by-exam?cid=7000007
  async findByExamId(examId: number): Promise<CollegeCutoff[]> {
    const contents = await this.collegeCutoffRepository.find({
      where: { exam_id: examId },
    });

    if (!contents || contents.length === 0) {
      throw new NotFoundException(`No content found for Exam ID ${examId}`);
    }

    return contents;
  }
}
