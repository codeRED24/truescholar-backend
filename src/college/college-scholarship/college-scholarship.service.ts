import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, Like } from 'typeorm';
import { CollegeScholarship } from './college-scholarship.entity';
import { CreateCollegeScholarshipDto } from './dto/create-college-scholarship.dto';
import { UpdateCollegeScholarshipDto } from './dto/update-college-scholarship.dto';
import { CollegeInfo } from '../college-info/college-info.entity';
@Injectable()
export class CollegeScholarshipService {
  constructor(
    @InjectRepository(CollegeScholarship)
    private readonly collegeScholarshipRepository: Repository<CollegeScholarship>,
    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>,
  ) {}

  async findAll(custom_id?: string): Promise<CollegeScholarship[]> {
    if (custom_id) {
      return this.collegeScholarshipRepository.find({
        where: {
          custom_id: Like(`%${custom_id}%`),
        },
      });
    }
    return this.collegeScholarshipRepository.find();
  }

  async findOne(id: number): Promise<CollegeScholarship> {
    const scholarship = await this.collegeScholarshipRepository.findOne({
      where: { college_scholarship_id: id },
    });
    if (!scholarship) {
      throw new NotFoundException(
        `College scholarship with ID ${id} not found`,
      );
    }
    return scholarship;
  }

  // POST
  async create(
    createCollegeScholarshipDto: CreateCollegeScholarshipDto,
  ): Promise<CollegeScholarship> {
    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: createCollegeScholarshipDto.college_id },
    });

    if (!college) {
      throw new NotFoundException(
        `College with ID ${createCollegeScholarshipDto.college_id} not found`,
      );
    }

    const scholarship = this.collegeScholarshipRepository.create(
      createCollegeScholarshipDto,
    );
    try {
      return await this.collegeScholarshipRepository.save(scholarship);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        throw new ConflictException('Custom ID must be unique');
      }
      throw error;
    }
  }

  // Patch
  async update(
    id: number,
    updateCollegeScholarshipDto: UpdateCollegeScholarshipDto,
  ): Promise<{ message: string; data?: CollegeScholarship }> {
    const scholarship = await this.findOne(id);
    if (!scholarship) {
      throw new NotFoundException(
        `College scholarship with ID ${id} not found`,
      );
    }
    await this.collegeScholarshipRepository.update(
      id,
      updateCollegeScholarshipDto,
    );
    const updatedScholarship = await this.findOne(id);

    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: updateCollegeScholarshipDto.college_id },
    });
    if (!college) {
      throw new NotFoundException(
        `College with ID ${updateCollegeScholarshipDto.college_id} not found`,
      );
    }

    return {
      message: `College scholarship with ID ${id} updated successfully`,
      data: updatedScholarship,
    };
  }

  async delete(id: number): Promise<{ message: string }> {
    const result = await this.collegeScholarshipRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `College scholarship with ID ${id} not found`,
      );
    }
    return {
      message: `College scholarship with ID ${id} deleted successfully`,
    };
  }
  // GET /college-content/by-college?cid=7000007
  async findByCollegeId(collegeId: number): Promise<CollegeScholarship[]> {
    const contents = await this.collegeScholarshipRepository.find({
      where: { college_id: collegeId },
    });

    if (!contents || contents.length === 0) {
      throw new NotFoundException(
        `No content found for College ID ${collegeId}`,
      );
    }

    return contents;
  }
}
