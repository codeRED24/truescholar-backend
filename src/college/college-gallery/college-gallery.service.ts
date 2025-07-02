import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, QueryFailedError } from 'typeorm';
import { CollegeGallery } from './college-gallery.entity';
import { CreateCollegeGalleryDto } from './dto/create-college-gallery.dto';
import { UpdateCollegeGalleryDto } from './dto/update-college-gallery.dto';
import { CollegeInfo } from '../college-info/college-info.entity';
@Injectable()
export class CollegeGalleryService {
  constructor(
    @InjectRepository(CollegeGallery)
    private readonly collegeGalleryRepository: Repository<CollegeGallery>,
    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>,
  ) {}

  // GET ALL
  // async findAll(custom_id?: string): Promise<CollegeGallery[]> {
  //   if (custom_id) {
  //     return this.collegeGalleryRepository.find({
  //       where: {
  //         custom_id: Like(`%${custom_id}%`),
  //       },
  //     });
  //   }
  //   return this.collegeGalleryRepository.find();
  // }

  async findAll(): Promise<CollegeGallery[]> {
    return this.collegeGalleryRepository.find();
  }
  // GET /college-gallery/:id
  async findOne(id: number): Promise<CollegeGallery> {
    const gallery = await this.collegeGalleryRepository.findOne({
      where: { college_gallery_id: id },
    });
    if (!gallery) {
      throw new NotFoundException(`College gallery with ID ${id} not found`);
    }
    return gallery;
  }

  // POST
  async create(
    createCollegeGalleryDto: CreateCollegeGalleryDto,
  ): Promise<CollegeGallery> {
    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: createCollegeGalleryDto.college_id },
    });

    if (!college) {
      throw new NotFoundException(
        `College with ID ${createCollegeGalleryDto.college_id} not found`,
      );
    }

    const gallery = this.collegeGalleryRepository.create({
      ...createCollegeGalleryDto,
      college,
    });
    try {
      return await this.collegeGalleryRepository.save(gallery);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        throw new ConflictException('Gallery ID must be unique');
      }
      throw error;
    }
  }

  // PATCH /college-gallery/:id
  async update(
    id: number,
    updateCollegeGalleryDto: UpdateCollegeGalleryDto,
  ): Promise<{ message: string; data?: CollegeGallery }> {
    const gallery = await this.findOne(id);
    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: updateCollegeGalleryDto.college_id },
    });
    if (!college) {
      throw new NotFoundException(
        `College with ID ${updateCollegeGalleryDto.college_id} not found`,
      );
    }

    if (!gallery) {
      throw new NotFoundException(`College gallery with ID ${id} not found`);
    }

    const updatedEntity = {
      ...gallery,
      ...updateCollegeGalleryDto,
      college,
    };
    await this.collegeGalleryRepository.save(updatedEntity);
    const updatedGallery = await this.findOne(id);
    return {
      message: `College gallery with ID ${id} updated successfully`,
      data: updatedGallery,
    };
  }

  // DELETE /college-gallery/:id
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.collegeGalleryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`College gallery with ID ${id} not found`);
    }
    return { message: `College gallery with ID ${id} deleted successfully` };
  }

  // GET /college-content/by-college?cid=7000007
  async findByCollegeId(collegeId: number): Promise<CollegeGallery[]> {
    const gallery = await this.collegeGalleryRepository.find({
      where: { college_id: collegeId },
    });

    if (!gallery || gallery.length === 0) {
      throw new NotFoundException(
        `No gallery found for College ID ${collegeId}`,
      );
    }

    return gallery;
  }
}
