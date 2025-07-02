import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { CollegeVideo } from './college-video.entity';
import { CreateCollegeVideoDto } from './dto/create-college-video.dto';
import { UpdateCollegeVideoDto } from './dto/update-college-video.dto';
import { CollegeInfo } from '../college-info/college-info.entity';
@Injectable()
export class CollegeVideoService {
  constructor(
    @InjectRepository(CollegeVideo)
    private readonly collegeVideoRepository: Repository<CollegeVideo>,
    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>,
  ) {}

  // GET ALL
  async findAll(): Promise<CollegeVideo[]> {
    return this.collegeVideoRepository.find();
  }

  // GET /college-video/:id
  async findOne(id: number): Promise<CollegeVideo> {
    const collegeVideo = await this.collegeVideoRepository.findOne({
      where: { college_video_id: id },
    });
    if (!collegeVideo) {
      throw new NotFoundException(`College video with ID ${id} not found`);
    }
    return collegeVideo;
  }

  // POST
  async create(
    createCollegeVideoDto: CreateCollegeVideoDto,
  ): Promise<CollegeVideo> {
    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: createCollegeVideoDto.college_id },
    });

    if (!college) {
      throw new NotFoundException(
        `College with ID ${createCollegeVideoDto.college_id} not found`,
      );
    }

    const collegeVideo = this.collegeVideoRepository.create(
      createCollegeVideoDto,
    );
    try {
      return await this.collegeVideoRepository.save(collegeVideo);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        throw new ConflictException('College video ID must be unique');
      }
      throw error;
    }
  }

  // PATCH /college-video/:id
  async update(
    id: number,
    updateCollegeVideoDto: UpdateCollegeVideoDto,
  ): Promise<{ message: string; data?: CollegeVideo }> {
    const collegeVideo = await this.findOne(id);
    if (!collegeVideo) {
      throw new NotFoundException(`College video with ID ${id} not found`);
    }
    await this.collegeVideoRepository.update(id, updateCollegeVideoDto);
    const updatedCollegeVideo = await this.findOne(id);

    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: updateCollegeVideoDto.college_id },
    });
    if (!college) {
      throw new NotFoundException(
        `College with ID ${updateCollegeVideoDto.college_id} not found`,
      );
    }
    return {
      message: `College video with ID ${id} updated successfully`,
      data: updatedCollegeVideo,
    };
  }

  // DELETE /college-video/:id
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.collegeVideoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`College video with ID ${id} not found`);
    }
    return { message: `College video with ID ${id} deleted successfully` };
  }

  // GET /college-videos/by-college?cid=7000007
  async findByCollegeId(collegeId: number): Promise<CollegeVideo[]> {
    const videos = await this.collegeVideoRepository.find({
      where: { college_id: collegeId },
    });

    if (!videos || videos.length === 0) {
      throw new NotFoundException(
        `No content found for College ID ${collegeId}`,
      );
    }

    return videos;
  }
}
