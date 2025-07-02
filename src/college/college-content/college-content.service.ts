import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, QueryFailedError } from "typeorm";
import { CollegeContent } from "./college-content.entity";
import { CollegeInfo } from "../college-info/college-info.entity";
import { CreateCollegeContentDto } from "./dto/create-college-content.dto";
import { UpdateCollegeContentDto } from "./dto/update-college-content.dto";

@Injectable()
export class CollegeContentService {
  constructor(
    @InjectRepository(CollegeContent)
    private readonly collegeContentRepository: Repository<CollegeContent>,
    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>
  ) {}

  // GET ALL
  async findAll(title?: string): Promise<CollegeContent[]> {
    const query = this.collegeContentRepository.createQueryBuilder("content");

    if (title) {
      return this.collegeContentRepository.find({
        where: {
          title: Like(`%${title}%`),
        },
      });
    }
    // return this.collegeContentRepository.find();
    return await query.getMany();
  }

  // GET /college-content/:id
  async findOne(id: number): Promise<CollegeContent> {
    const collegeContent = await this.collegeContentRepository.findOne({
      where: { college_content_id: id },
      // relations: ['college'],
    });
    if (!collegeContent) {
      throw new NotFoundException(`College content with ID ${id} not found`);
    }
    return collegeContent;
  }

  // POST
  async create(
    createCollegeContentDto: CreateCollegeContentDto
  ): Promise<CollegeContent> {
    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: createCollegeContentDto.college_id },
    });

    if (!college) {
      throw new NotFoundException(
        `College with ID ${createCollegeContentDto.college_id} not found`
      );
    }

    const collegeContent = this.collegeContentRepository.create(
      createCollegeContentDto
    );
    try {
      return await this.collegeContentRepository.save(collegeContent);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("College content ID must be unique");
      }
      throw error;
    }
  }

  // PATCH /college-content/:id
  async update(
    id: number,
    updateCollegeContentDto: UpdateCollegeContentDto
  ): Promise<{ message: string; data?: CollegeContent }> {
    const collegeContent = await this.findOne(id);
    if (!collegeContent) {
      throw new NotFoundException(`College content with ID ${id} not found`);
    }
    await this.collegeContentRepository.update(id, updateCollegeContentDto);
    const updatedCollegeContent = await this.findOne(id);

    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: updateCollegeContentDto.college_id },
    });
    if (!college) {
      throw new NotFoundException(
        `College with ID ${updateCollegeContentDto.college_id} not found`
      );
    }

    return {
      message: `College content with ID ${id} updated successfully`,
      data: updatedCollegeContent,
    };
  }

  // DELETE /college-content/:id
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.collegeContentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`College content with ID ${id} not found`);
    }
    return { message: `College content with ID ${id} deleted successfully` };
  }

  // GET /college-content/by-college?cid=7000007
  async findByCollegeId(collegeId: number): Promise<CollegeContent[]> {
    const contents = await this.collegeContentRepository.find({
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
