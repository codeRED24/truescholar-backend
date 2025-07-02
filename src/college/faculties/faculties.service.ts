import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Faculties } from './faculties.entity';
import { CreateFacultiesDto } from './dto/create-faculties.dto';
import { UpdateFacultiesDto } from './dto/update-faculties.dto';

@Injectable()
export class FacultiesService {
  constructor(
    @InjectRepository(Faculties)
    private facultiesRepository: Repository<Faculties>,
  ) {}

  // Create a new faculty
  async create(createFacultiesDto: CreateFacultiesDto): Promise<Faculties> {
    const faculty = this.facultiesRepository.create(createFacultiesDto);
    try {
      return await this.facultiesRepository.save(faculty);
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

  // Get all faculties
  findAll(): Promise<Faculties[]> {
    return this.facultiesRepository.find();
  }

  // Get a single faculty by ID
  async findOne(id: number): Promise<Faculties> {
    const faculty = await this.facultiesRepository.findOne({
      where: { faculty_id: id },
    });
    if (!faculty) {
      throw new NotFoundException(`Faculty with ID "${id}" not found`);
    }
    return faculty;
  }

  // Update a faculty by ID
  async update(
    id: number,
    updateFacilitiesDto: UpdateFacultiesDto,
  ): Promise<{ message: string; data?: Faculties }> {
    const faculty = await this.findOne(id);
    if (!faculty) {
      throw new NotFoundException(`Faculty with ID "${id}" not found`);
    }
    await this.facultiesRepository.update(id, updateFacilitiesDto);
    const updatedFaculty = await this.findOne(id);
    return {
      message: `Faculty with ID "${id}" updated successfully`,
      data: updatedFaculty,
    };
  }

  // Remove a faculty by ID
  async remove(id: number): Promise<{ message: string }> {
    const result = await this.facultiesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Faculty with ID "${id}" not found`);
    }
    return { message: `Faculty with ID "${id}" deleted successfully` };
  }

  // GET /college-faculties/by-college?cid=7000007
  async findByCollegeId(collegeId: number): Promise<Faculties[]> {
    const contents = await this.facultiesRepository.find({
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
