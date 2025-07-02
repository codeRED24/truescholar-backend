import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamFAQDto } from './dto/create-exam-faq.dto';
import { UpdateExamFAQDto } from './dto/update-exam-faq.dto';
import { Exam } from '../exams/exams.entity';
import { ExamFAQ } from './exam-faq.entity';

@Injectable()
export class ExamFAQService {
  constructor(
    @InjectRepository(ExamFAQ)
    private readonly examFAQRepository: Repository<ExamFAQ>,
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
  ) {}

  // GET all FAQs
  async findAll(): Promise<ExamFAQ[]> {
    return this.examFAQRepository.find();
  }

  // GET one FAQ by id
  async findOne(id: number): Promise<ExamFAQ> {
    const faq = await this.examFAQRepository.findOne({
      where: { exam_faq_id: id },
    });
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return faq;
  }

  // create
  async create(createExamFaqDto: CreateExamFAQDto): Promise<ExamFAQ> {
    const exam = await this.examRepository.findOne({
      where: { exam_id: createExamFaqDto.exam_id },
    });
    if (!exam) {
      throw new NotFoundException(
        `Exam with ID ${createExamFaqDto.exam_id} not found`,
      );
    }

    const faq = this.examFAQRepository.create(createExamFaqDto);
    faq.exam = exam; // Set the relation with the Exam
    return this.examFAQRepository.save(faq);
  }

  // UPDATE
  async update(
    id: number,
    updateExamFaqDto: UpdateExamFAQDto,
  ): Promise<ExamFAQ> {
    const faq = await this.findOne(id);
    if (updateExamFaqDto.exam_id) {
      const exam = await this.examRepository.findOne({
        where: { exam_id: updateExamFaqDto.exam_id },
      });
      if (!exam) {
        throw new NotFoundException(
          `Exam with ID ${updateExamFaqDto.exam_id} not found`,
        );
      }
      faq.exam = exam;
    }
    Object.assign(faq, updateExamFaqDto);
    return this.examFAQRepository.save(faq);
  }

  // DELETE an FAQ by id
  async delete(id: number): Promise<void> {
    const result = await this.examFAQRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
  }
}
