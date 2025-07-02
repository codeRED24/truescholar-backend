import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { CollegeHostelCampus } from './college-hostel-and-campus.entity';
import { CreateCollegeHostelCampusDto } from './dto/create-college-hostelcampus.dto';
import { UpdateCollegeHostelCampusDto } from './dto/update-college-hostelcampus.dto';
import { CollegeInfo } from '../college-info/college-info.entity';

@Injectable()
export class CollegeHostelCampusService {
  constructor(
    @InjectRepository(CollegeHostelCampus)
    private readonly collegeHostelCampusRepository: Repository<CollegeHostelCampus>,
    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>,
  ) {}

  // GET ALL
  async findAll(): Promise<CollegeHostelCampus[]> {
    return this.collegeHostelCampusRepository.find();
  }

  // GET /college-hostelcampus/:id
  async findOne(id: number): Promise<CollegeHostelCampus> {
    const record = await this.collegeHostelCampusRepository.findOne({
      where: { college_hostelcampus_id: id },
    });
    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }
    return record;
  }

  // POST
  async create(
    createCollegeHostelCampusDto: CreateCollegeHostelCampusDto,
  ): Promise<CollegeHostelCampus> {
    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: createCollegeHostelCampusDto.college_id },
    });

    if (!college) {
      throw new NotFoundException(
        `College with ID ${createCollegeHostelCampusDto.college_id} not found`,
      );
    }

    const record = this.collegeHostelCampusRepository.create(
      createCollegeHostelCampusDto,
    );
    try {
      return await this.collegeHostelCampusRepository.save(record);
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

  // PATCH /college-hostelcampus/:id
  async update(
    id: number,
    updateCollegeHostelCampusDto: UpdateCollegeHostelCampusDto,
  ): Promise<{ message: string; data?: CollegeHostelCampus }> {
    const record = await this.findOne(id);
    await this.collegeHostelCampusRepository.update(
      id,
      updateCollegeHostelCampusDto,
    );
    const updatedRecord = await this.findOne(id);

    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: updateCollegeHostelCampusDto.college_id },
    });
    if (!college) {
      throw new NotFoundException(
        `College with ID ${updateCollegeHostelCampusDto.college_id} not found`,
      );
    }
    return {
      message: `Record with ID ${id} updated successfully`,
      data: updatedRecord,
    };
  }

  // DELETE /college-hostelcampus/:id
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.collegeHostelCampusRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }
    return { message: `Record with ID ${id} deleted successfully` };
  }

  // GET /college-content/by-college?cid=7000007
  async findByCollegeId(collegeId: number): Promise<CollegeHostelCampus[]> {
    const contents = await this.collegeHostelCampusRepository.find({
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
