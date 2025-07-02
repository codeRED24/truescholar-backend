import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, QueryFailedError } from "typeorm";
import { Facilities } from "./facilities.entity";
import { CreateFacilitiesDto } from "./dto/create-facilities.dto";
import { UpdateFacilitiesDto } from "./dto/update-facilities.dto";

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(Facilities)
    private readonly facilitiesRepository: Repository<Facilities>
  ) {}

  // GET ALL
  async findAll(name?: string): Promise<Facilities[]> {
    if (name) {
      return this.facilitiesRepository.find({
        where: {
          name: Like(`%${name}%`),
        },
      });
    }
    return this.facilitiesRepository.find();
  }

  // GET /facilities/:id
  async findOne(id: number): Promise<Facilities> {
    const facilities = await this.facilitiesRepository.findOne({
      where: { id },
    });
    if (!facilities) {
      throw new NotFoundException(`Facilities with ID "${id}" not found`);
    }
    return facilities;
  }

  // POST /facilities
  async create(createFacilitiesDto: CreateFacilitiesDto): Promise<Facilities> {
    const facilities = this.facilitiesRepository.create(createFacilitiesDto);
    try {
      return await this.facilitiesRepository.save(facilities);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("Facilities ID must be unique");
      }
      throw error;
    }
  }

  // PATCH /facilities/:id
  async update(
    id: number,
    updateFacilitiesDto: UpdateFacilitiesDto
  ): Promise<{ message: string; data?: Facilities }> {
    const facilities = await this.findOne(id);
    if (!facilities) {
      throw new NotFoundException(`Facilities with ID "${id}" not found`);
    }
    await this.facilitiesRepository.update(id, updateFacilitiesDto);
    const updatedFacilities = await this.findOne(id);
    return {
      message: `Facilities with ID "${id}" updated successfully`,
      data: updatedFacilities,
    };
  }

  // DELETE /facilities/:id
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.facilitiesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Facilities with ID "${id}" not found`);
    }
    return { message: `Facilities with ID "${id}" deleted successfully` };
  }
}
