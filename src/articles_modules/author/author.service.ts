import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, QueryFailedError } from 'typeorm';
import { Author } from './author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { CollegeContent } from '../../college/college-content/college-content.entity';
import { ExamContent } from '../../exams_module/exam-content/exam_content.entity';
import { Article } from '../articles/articles.entity';
import { Exam } from '../../exams_module/exams/exams.entity';
import { CollegeInfo } from '../../college/college-info/college-info.entity';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectRepository(CollegeContent)
    private readonly collegeContentRepository: Repository<CollegeContent>,
    @InjectRepository(ExamContent)
    private readonly examContentRepository: Repository<ExamContent>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>
  ) {}

  // GET ALL
  async findAll(author_name?: string): Promise<Author[]> {
    if (author_name) {
      return this.authorRepository.find({
        where: {
          author_name: Like(`%${author_name}%`),
        },
      });
    }
    return this.authorRepository.find();
  }

  // GET /authors/:id
  async findOne(id: number): Promise<Author> {
    const author = await this.authorRepository.findOne({
      where: { author_id: id },
    });
    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
    return author;
  }

  // POST
  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const author = this.authorRepository.create(createAuthorDto);
    try {
      return await this.authorRepository.save(author);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        throw new ConflictException('Author ID must be unique');
      }
      throw error;
    }
  }

  // PATCH /authors/:id
  async update(
    id: number,
    updateAuthorDto: UpdateAuthorDto,
  ): Promise<{ message: string; data?: Author }> {
    const author = await this.findOne(id);
    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
    await this.authorRepository.update(id, updateAuthorDto);
    const updatedAuthor = await this.findOne(id);
    return {
      message: `Author with ID ${id} updated successfully`,
      data: updatedAuthor,
    };
  }

  // DELETE /authors/:id
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.authorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
    return { message: `Author with ID ${id} deleted successfully` };
  }

  async getAuthorData(authorId: number): Promise<any> {
    const author = await this.authorRepository.findOne({
      where: { author_id: authorId },
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${authorId} not found`);
    }

    const collegeContent = await this.collegeContentRepository
    .createQueryBuilder('collegeContent')
    .leftJoinAndSelect('collegeContent.college', 'college') 
    .where('collegeContent.author_id = :authorId', { authorId })
    .select([
      'collegeContent.updated_at',
      'collegeContent.img1_url',
      'collegeContent.college_content_id',
      'collegeContent.meta_desc',
      'collegeContent.title',
      'college.college_id',
      'college.college_name',
      'college.slug',
    ])
    .getMany();

  // Fetch all Exam Content and join with Exam data
  const examContent = await this.examContentRepository
    .createQueryBuilder('examContent')
    .leftJoinAndSelect('examContent.exam', 'exam')
    .where('examContent.author_id = :authorId', { authorId })
    .select([
      'examContent.updated_at',
      'examContent.img1_url',
      'examContent.exam_content_id',
      'examContent.meta_desc',
      'exam.exam_id',
      'exam.exam_name',
      'exam.slug',
    ])
    .getMany();

    const articles = await this.articleRepository.find({
      where: { author_id: authorId },
      select: ['updated_at', 'img1_url', 'article_id', 'meta_desc', 'title'],
    });

    // Calculate article count
    const articleCount = 
      collegeContent.length + examContent.length + articles.length;

    return {
      author_details: {
        view_name: author.view_name,
        author_id: author.author_id,
        email: author.email,
        image: author.image,
        about: author.about,
        article_count: articleCount,
      },
      content_written: {
        exam_written: examContent,
        college_written: collegeContent,
        articles_written: articles,
      },
    };
  }
}
