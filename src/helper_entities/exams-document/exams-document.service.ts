import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ExamDocument } from "./exams-document.entity";
import { CreateExamDocumentDto } from "./dto/create-exam-document.dto";
import { UpdateExamDocumentDto } from "./dto/update-exam-document.dto";
import { Exam } from "../../exams_module/exams/exams.entity";

@Injectable()
export class ExamDocumentService {
  constructor(
    @InjectRepository(ExamDocument)
    private readonly examDocumentRepository: Repository<ExamDocument>,
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
  ) {}

  /**
   * Retrieve all ExamDocuments with related Exam data.
   */
  async findAll(): Promise<ExamDocument[]> {
    return this.examDocumentRepository.find({ relations: ["exam"] });
  }

  /**
   * Retrieve a single ExamDocument by its ID.
   */
  async findOne(id: number): Promise<ExamDocument> {
    const document = await this.examDocumentRepository.findOne({
      where: { exam_document_id: id },
      relations: ["exam"],
    });
    if (!document) throw new NotFoundException("Exam Document not found");
    return document;
  }

  /**
   * Create a new ExamDocument and associate it with an Exam.
   */
  async create(dto: CreateExamDocumentDto): Promise<ExamDocument> {
    const exam = await this.examRepository.findOne({ where: { exam_id: dto.exam_id } });
    if (!exam) throw new NotFoundException("Exam not found");

    const document = this.examDocumentRepository.create({ ...dto, exam });
    return this.examDocumentRepository.save(document);
  }

  /**
   * Update an existing ExamDocument.
   */
  async update(id: number, dto: UpdateExamDocumentDto): Promise<ExamDocument> {
    const document = await this.findOne(id); // Ensures the document exists
    if (dto.exam_id) {
      const exam = await this.examRepository.findOne({ where: { exam_id: dto.exam_id } });
      if (!exam) throw new NotFoundException("Exam not found");
      document.exam = exam;
    }
    Object.assign(document, dto); // Update other fields
    return this.examDocumentRepository.save(document);
  }

  /**
   * Delete an ExamDocument by its ID.
   */
  async delete(id: number): Promise<void> {
    const result = await this.examDocumentRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException("Exam Document not found");
  }
}
