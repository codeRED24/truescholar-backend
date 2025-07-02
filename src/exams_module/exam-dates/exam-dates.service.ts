import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, QueryFailedError } from "typeorm";
import { ExamDate } from "./exam_dates.entity";
import { CreateExamDateDto } from "./dto/create-exam_date.dto";
import { UpdateExamDateDto } from "./dto/update-exam_date.dto";
import { Exam } from "../exams/exams.entity";

@Injectable()
export class ExamDateService {
  constructor(
    @InjectRepository(ExamDate)
    private readonly examDateRepository: Repository<ExamDate>,
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>
  ) {}

  // GET ALL
  async findAll(title?: string): Promise<ExamDate[]> {
    if (title) {
      return this.examDateRepository.find({
        where: {
          title: Like(`%${title}%`),
        },
      });
    }
    return this.examDateRepository.find();
  }

  // GET /exam_dates/:id
  async findOne(id: number): Promise<ExamDate> {
    const examDate = await this.examDateRepository.findOne({
      where: { exam_date_id: id },
    });
    if (!examDate) {
      throw new NotFoundException(`Exam Date with ID ${id} not found`);
    }
    return examDate;
  }

  // POST
  async create(createExamDateDto: CreateExamDateDto): Promise<ExamDate> {
    const exam = await this.examRepository.findOne({
      where: { exam_id: createExamDateDto.exam_id },
    });

    if (!exam) {
      throw new NotFoundException(
        `Exam with ID ${createExamDateDto.exam_id} not found`
      );
    }

    const examDate = this.examDateRepository.create(createExamDateDto);
    try {
      return await this.examDateRepository.save(examDate);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("Exam Date ID must be unique");
      }
      throw error;
    }
  }

  // PATCH /exam_dates/:id
  async update(
    id: number,
    updateExamDateDto: UpdateExamDateDto
  ): Promise<{ message: string; data?: ExamDate }> {
    const examDate = await this.findOne(id);
    if (!examDate) {
      throw new NotFoundException(`Exam Date with ID ${id} not found`);
    }
    await this.examDateRepository.update(id, updateExamDateDto);
    const updatedExamDate = await this.findOne(id);

    const exam = await this.examRepository.findOne({
      where: { exam_id: updateExamDateDto.exam_id },
    });
    if (!exam) {
      throw new NotFoundException(
        `Exam with ID ${updateExamDateDto.exam_id} not found`
      );
    }

    return {
      message: `Exam Date with ID ${id} updated successfully`,
      data: updatedExamDate,
    };
  }

  // DELETE /exam_dates/:id
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.examDateRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Exam Date with ID ${id} not found`);
    }
    return { message: `Exam Date with ID ${id} deleted successfully` };
  }

  // GET /exam-date/by-exam?cid=7000007
  async findByExamId(examId: number): Promise<ExamDate[]> {
    const contents = await this.examDateRepository.find({
      where: { exam_id: examId },
    });

    if (!contents || contents.length === 0) {
      throw new NotFoundException(`No content found for Exam ID ${examId}`);
    }

    return contents;
  }
}
