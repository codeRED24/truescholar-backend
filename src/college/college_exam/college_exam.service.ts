import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, QueryFailedError } from "typeorm";
import { CollegeExam } from "./college_exam.entity";
import { CreateCollegeExamDto } from "./dto/create-college_exam.dto";
import { UpdateCollegeExamDto } from "./dto/update-college_exam.dto";
import { CollegeInfo } from "../college-info/college-info.entity";
import { Exam } from "../../exams_module/exams/exams.entity";
@Injectable()
export class CollegeExamService {
  constructor(
    @InjectRepository(CollegeExam)
    private readonly collegeExamRepository: Repository<CollegeExam>,
    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>,
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>
  ) {}

  // FIND ALL
  // async findAll(): Promise<CollegeExam[]> {
  //   return this.collegeExamRepository.find();
  // }
  async findAllWithFilters(
    examId?: number,
    collegeId?: number
  ): Promise<CollegeExam[]> {
    const query = this.collegeExamRepository.createQueryBuilder("collegeExam");

    if (examId) {
      query.andWhere("collegeExam.exam_id = :examId", { examId });
    }

    if (collegeId) {
      query.andWhere("collegeExam.college_id = :collegeId", { collegeId });
    }

    return query.getMany();
  }

  // GET/:ID
  async findOne(id: number): Promise<CollegeExam> {
    const collegeExam = await this.collegeExamRepository.findOne({
      where: { college_exam_id: id },
    });
    if (!collegeExam) {
      throw new NotFoundException(`College Exam with ID ${id} not found`);
    }
    return collegeExam;
  }

  // POST
  async create(
    createCollegeExamDto: CreateCollegeExamDto
  ): Promise<CollegeExam> {
    // CHECK IF USER HAS ENTERED CORRECT EXAM_ID
    const { exam_id } = createCollegeExamDto;
    const examExists = await this.examRepository.findOneBy({ exam_id });
    if (!examExists) {
      throw new BadRequestException(`Exam with ID ${exam_id} does not exist.`);
    }

    // CHECK IF USER HAS ENTERED CORRECT COLLEGE_ID
    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: createCollegeExamDto.college_id },
    });

    if (!college) {
      throw new NotFoundException(
        `College with ID ${createCollegeExamDto.college_id} not found`
      );
    }

    const collegeExam = this.collegeExamRepository.create(createCollegeExamDto);
    try {
      return await this.collegeExamRepository.save(collegeExam);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("College Exam ID must be unique");
      }
      throw error;
    }
  }

  // PATCH
  async update(
    id: number,
    updateCollegeExamDto: UpdateCollegeExamDto
  ): Promise<{ message: string; data?: CollegeExam }> {
    const { exam_id } = updateCollegeExamDto;

    // Check if the provided exam_id exists in the Exam table
    const examExists = await this.examRepository.findOneBy({ exam_id });
    if (!examExists) {
      throw new BadRequestException(`Exam with ID ${exam_id} does not exist.`);
    }

    const collegeExam = await this.findOne(id);
    if (!collegeExam) {
      throw new NotFoundException(`College Exam with ID ${id} not found`);
    }
    // Check if the provided exam_id exists in the Exam table
    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: updateCollegeExamDto.college_id },
    });

    if (!college) {
      throw new NotFoundException(
        `College with ID ${updateCollegeExamDto.college_id} not found`
      );
    }

    await this.collegeExamRepository.update(id, updateCollegeExamDto);
    const updatedCollegeExam = await this.findOne(id);

    return {
      message: `College Exam with ID ${id} updated successfully`,
      data: updatedCollegeExam,
    };
  }

  // DELETE/:ID
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.collegeExamRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`College Exam with ID ${id} not found`);
    }
    return { message: `College Exam with ID ${id} deleted successfully` };
  }

  // GET /college-exam/by-college?cid=7000007
  async findByCollegeId(collegeId: number): Promise<CollegeExam[]> {
    const contents = await this.collegeExamRepository.find({
      where: { college_id: collegeId },
    });

    if (!contents || contents.length === 0) {
      throw new NotFoundException(
        `No content found for College ID ${collegeId}`
      );
    }

    return contents;
  }
}
