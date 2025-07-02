import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, QueryFailedError } from 'typeorm';
import { Specialization } from './specialization.entity';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { UpdateSpecializationDto } from './dto/update-specialization.dto';
import { ILike } from "typeorm";

@Injectable()
export class SpecializationService {
  constructor(
    @InjectRepository(Specialization)
    private readonly specializationRepository: Repository<Specialization>,
  ) {}

  // GET ALL
  async findAll(name?: string): Promise<Specialization[]> {
    if (name) {
      return this.specializationRepository.find({
        where: {
          name: Like(`%${name}%`),
        },
      });
    }
    return this.specializationRepository.find();
  }

  // GET /specializations/:id
  async findOne(id: number): Promise<Specialization> {
    const specialization = await this.specializationRepository.findOne({
      where: { specialization_id: id },
    });
    if (!specialization) {
      throw new NotFoundException(`Specialization with ID ${id} not found`);
    }
    return specialization;
  }

  // POST
  async create(
    createSpecializationDto: CreateSpecializationDto,
  ): Promise<Specialization> {
    const specialization = this.specializationRepository.create({
      ...createSpecializationDto,
    });

    try {
      return await this.specializationRepository.save(specialization);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        throw new ConflictException('Specialization ID must be unique');
      }
      throw error;
    }
  }
  // PATCH /specializations/:id
  async update(
    id: number,
    updateSpecializationDto: UpdateSpecializationDto,
  ): Promise<{ message: string; data?: Specialization }> {
    const specialization = await this.findOne(id);
    if (!specialization) {
      throw new NotFoundException(`Specialization with ID ${id} not found`);
    }

    await this.specializationRepository.update(id, {
      ...updateSpecializationDto,
    });

    const updatedSpecialization = await this.findOne(id);
    return {
      message: `Specialization with ID ${id} updated successfully`,
      data: updatedSpecialization,
    };
  }

  // DELETE /specializations/:id
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.specializationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Specialization with ID ${id} not found`);
    }
    return { message: `Specialization with ID ${id} deleted successfully` };
  }

  async bulkCreate(
    createSpecializationDtos: CreateSpecializationDto[],
  ): Promise<{ message: string; data?: Specialization[] }> {
    const specializations: Specialization[] = [];

    for (const dto of createSpecializationDtos) {
      const specialization = this.specializationRepository.create({
        ...dto,
      });
      specializations.push(specialization);
    }

    try {
      const savedSpecializations =
        await this.specializationRepository.save(specializations);
      return {
        message: 'Specializations created successfully',
        data: savedSpecializations,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        throw new ConflictException(
          'One or more specialization entries are duplicates',
        );
      }
      throw error;
    }
  }
  
  
  async getAllSpecializationIdsAndNames(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
  
    const whereCondition = search
      ? { full_name: ILike(`${search}%`) } 
      : {};
  
    return this.specializationRepository.find({
      select: ["specialization_id", "full_name"],
      where: whereCondition,
      skip,
      take: limit,
    });
  }
  
}
