import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, QueryFailedError } from 'typeorm';
import { RankingAgency } from './ranking_agency.entity';
import { CreateRankingAgencyDto } from './dto/create-ranking_agency.dto';
import { UpdateRankingAgencyDto } from './dto/update-ranking_agency.dto';

@Injectable()
export class RankingAgencyService {
  constructor(
    @InjectRepository(RankingAgency)
    private readonly rankingAgencyRepository: Repository<RankingAgency>,
  ) {}

  // GET ALL
  async findAll(name?: string): Promise<RankingAgency[]> {
    if (name) {
      return this.rankingAgencyRepository.find({
        where: {
          name: Like(`%${name}%`),
        },
      });
    }
    return this.rankingAgencyRepository.find();
  }

  // GET /ranking_agency/:id
  async findOne(id: number): Promise<RankingAgency> {
    const rankingAgency = await this.rankingAgencyRepository.findOne({
      where: { ranking_agency_id: id },
    });
    if (!rankingAgency) {
      throw new NotFoundException(`Ranking agency with ID ${id} not found`);
    }
    return rankingAgency;
  }

  // POST
  async create(
    createRankingAgencyDto: CreateRankingAgencyDto,
  ): Promise<RankingAgency> {
    const rankingAgency = this.rankingAgencyRepository.create(
      createRankingAgencyDto,
    );
    try {
      return await this.rankingAgencyRepository.save(rankingAgency);
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

  // PATCH /ranking_agency/:id
  async update(
    id: number,
    updateRankingAgencyDto: UpdateRankingAgencyDto,
  ): Promise<{ message: string; data?: RankingAgency }> {
    const rankingAgency = await this.findOne(id);
    if (!rankingAgency) {
      throw new NotFoundException(`Ranking agency with ID ${id} not found`);
    }
    await this.rankingAgencyRepository.update(id, updateRankingAgencyDto);
    const updatedRankingAgency = await this.findOne(id);
    return {
      message: `Ranking agency with ID ${id} updated successfully`,
      data: updatedRankingAgency,
    };
  }

  // DELETE /ranking_agency/:id
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.rankingAgencyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Ranking agency with ID ${id} not found`);
    }
    return { message: `Ranking agency with ID ${id} deleted successfully` };
  }
}
