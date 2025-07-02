import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, QueryFailedError } from 'typeorm';
import { CollegeDates } from './college-dates.entity';
import { CreateCollegeDatesDto } from './dto/create-college-dates.dto';
import { UpdateCollegeDatesDto } from './dto/update-college-dates.dto';
import { CollegeInfo } from '../college-info/college-info.entity';
@Injectable()
export class CollegeDatesService {
  constructor(
    @InjectRepository(CollegeDates)
    private readonly collegeDatesRepository: Repository<CollegeDates>,
    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>,
  ) {}

  // GET ALL
  async findAll(college_dates_id?: number): Promise<CollegeDates[]> {
    if (college_dates_id) {
      return this.collegeDatesRepository.find({
        where: {
          college_dates_id:
            // Like(`%${
            college_dates_id,
          // }%`),
        },
      });
    }
    return this.collegeDatesRepository.find();
  }

  // GET /college-dates/:id
  async findOne(id: number): Promise<CollegeDates> {
    const collegeDate = await this.collegeDatesRepository.findOne({
      where: { college_dates_id: id },
    });
    if (!collegeDate) {
      throw new NotFoundException(`College date with ID ${id} not found`);
    }
    return collegeDate;
  }

  // POST
  async create(
    createCollegeDatesDto: CreateCollegeDatesDto,
  ): Promise<CollegeDates> {
    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: createCollegeDatesDto.college_id },
    });

    if (!college) {
      throw new NotFoundException(
        `College with ID ${createCollegeDatesDto.college_id} not found`,
      );
    }

    const collegeDate = this.collegeDatesRepository.create(
      createCollegeDatesDto,
    );
    try {
      return await this.collegeDatesRepository.save(collegeDate);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        throw new ConflictException('College date ID must be unique');
      }
      throw error;
    }
  }

  // PATCH /college-dates/:id
  async update(
    id: number,
    updateCollegeDatesDto: UpdateCollegeDatesDto,
  ): Promise<{ message: string; data?: CollegeDates }> {
    const collegeDate = await this.findOne(id);
    if (!collegeDate) {
      throw new NotFoundException(`College date with ID ${id} not found`);
    }
    await this.collegeDatesRepository.update(id, updateCollegeDatesDto);
    const updatedCollegeDate = await this.findOne(id);

    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: updateCollegeDatesDto.college_id },
    });
    if (!college) {
      throw new NotFoundException(
        `College with ID ${updateCollegeDatesDto.college_id} not found`,
      );
    }

    return {
      message: `College date with ID ${id} updated successfully`,
      data: updatedCollegeDate,
    };
  }

  // DELETE /college-dates/:id
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.collegeDatesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`College date with ID ${id} not found`);
    }
    return { message: `College date with ID ${id} deleted successfully` };
  }

  // GET /college-content/by-college?cid=7000007
  async findByCollegeId(collegeId: number): Promise<CollegeDates[]> {
    const contents = await this.collegeDatesRepository.find({
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
