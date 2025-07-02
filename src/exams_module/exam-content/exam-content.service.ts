import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository, InjectDataSource } from "@nestjs/typeorm";
import { Repository, DataSource, QueryFailedError, Like } from "typeorm";
import { ExamContent } from "./exam_content.entity";
import { CreateExamContentDto } from "./dto/create-exam_content.dto";
import { UpdateExamContentDto } from "./dto/update-exam_content.dto";
import { Exam } from "../exams/exams.entity";
import { Author } from "../../articles_modules/author/author.entity";
@Injectable()
export class ExamContentService {
  constructor(
    @InjectRepository(ExamContent)
    private readonly examContentRepository: Repository<ExamContent>,
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  // GET ALL
  async findAll(): Promise<ExamContent[]> {
    return this.examContentRepository.find();
  }

  // GET /exam_content/:id
  async findOne(id: number): Promise<ExamContent> {
    const examContent = await this.examContentRepository.findOne({
      where: { exam_content_id: id },
    });
    if (!examContent) {
      throw new NotFoundException(`Exam content with ID ${id} not found`);
    }
    return examContent;
  }

  // POST
  async create(
    createExamContentDto: CreateExamContentDto
  ): Promise<ExamContent> {
    const exam = await this.examRepository.findOne({
      where: { exam_id: createExamContentDto.exam_id },
    });

    if (!exam) {
      throw new NotFoundException(
        `Exam with ID ${createExamContentDto.exam_id} not found`
      );
    }
    const author = await this.authorRepository.findOne({
      where: { author_id: createExamContentDto.author_id },
    });

    if (!author) {
      throw new NotFoundException(
        `Author with ID ${createExamContentDto.author_id} not found`
      );
    }

    const examContent = this.examContentRepository.create({
      ...createExamContentDto,
      exam,
      author,
    });

    try {
      return await this.examContentRepository.save(examContent);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("Custom ID must be unique");
      }
      throw error;
    }
  }

  // PATCH /exam_content/:id
  async update(
    id: number,
    updateExamContentDto: UpdateExamContentDto
  ): Promise<{ message: string; data?: ExamContent }> {
    const examContent = await this.findOne(id);
    if (!examContent) {
      throw new NotFoundException(`Exam content with ID ${id} not found`);
    }
    await this.examContentRepository.update(id, updateExamContentDto);
    const updatedExamContent = await this.findOne(id);

    const exam = await this.examRepository.findOne({
      where: { exam_id: updateExamContentDto.exam_id },
    });
    if (!exam) {
      throw new NotFoundException(
        `Exam with ID ${updateExamContentDto.exam_id} not found`
      );
    }

    return {
      message: `Exam content with ID ${id} updated successfully`,
      data: updatedExamContent,
    };
  }

  // DELETE /exam_content/:id
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.examContentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Exam content with ID ${id} not found`);
    }
    return { message: `Exam content with ID ${id} deleted successfully` };
  }

  // GET /exam-content/by-exam?cid=7000007
  async findByExamId(examId: number): Promise<ExamContent[]> {
    const contents = await this.examContentRepository.find({
      where: { exam_id: examId },
    });

    if (!contents || contents.length === 0) {
      throw new NotFoundException(`No content found for Exam ID ${examId}`);
    }

    return contents;
  }

  //Bulk POST
  async bulkCreate(
    createExamContentsDto: CreateExamContentDto[]
  ): Promise<{ message: string; created: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let createdCount = 0;
      const newExamContents = [];
      for (const dto of createExamContentsDto) {
        const exam = await queryRunner.manager.findOne(Exam, {
          where: { exam_id: dto.exam_id },
        });
        if (!exam) {
          throw new NotFoundException(`Exam with ID ${dto.exam_id} not found`);
        }
        const author = await queryRunner.manager.findOne(Author, {
          where: { author_id: dto.author_id },
        });
        if (!author) {
          throw new NotFoundException(
            `Author with ID ${dto.author_id} not found`
          );
        }
        const examContent = this.examContentRepository.create({
          ...dto,
          exam,
          author,
        });
        newExamContents.push(examContent);
      }
      await queryRunner.manager.save(ExamContent, newExamContents);
      createdCount = newExamContents.length;
      // Commit the transaction
      await queryRunner.commitTransaction();
      return {
        message: "Exam contents created successfully",
        created: createdCount,
      };
    } catch (error) {
      // Rollback in case of an error
      await queryRunner.rollbackTransaction();
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("Custom ID must be unique");
      }
      throw error;
    } finally {
      // Release the query runner after finishing
      await queryRunner.release();
    }
  }
}
