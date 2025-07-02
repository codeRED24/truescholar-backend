import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, QueryFailedError } from "typeorm";
import { CollegeWisePlacement } from "./college-wise-placement.entity";
import { CreateCollegeWisePlacementDto } from "./dto/create-collegewiseplacement.dto";
import { UpdateCollegeWisePlacementDto } from "./dto/update-collegewiseplacement.dto";
import { CollegeInfo } from "../college-info/college-info.entity";
@Injectable()
export class CollegeWisePlacementService {
  constructor(
    @InjectRepository(CollegeWisePlacement)
    private readonly collegeWisePlacementRepository: Repository<CollegeWisePlacement>,
    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>
  ) {}

  // GET ALL
  async findAll(custom_id?: string): Promise<CollegeWisePlacement[]> {
    return this.collegeWisePlacementRepository.find();
  }

  // GET /collegewiseplacement/:id
  async findOne(id: number): Promise<CollegeWisePlacement> {
    const collegeWisePlacement =
      await this.collegeWisePlacementRepository.findOne({
        where: { collegewise_placement_id: id },
      });
    if (!collegeWisePlacement) {
      throw new NotFoundException(
        `College-wise placement with ID ${id} not found`
      );
    }
    return collegeWisePlacement;
  }

  // POST
  async create(
    createCollegeWisePlacementDto: CreateCollegeWisePlacementDto
  ): Promise<CollegeWisePlacement> {
    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: createCollegeWisePlacementDto.college_id },
    });

    if (!college) {
      throw new NotFoundException(
        `College with ID ${createCollegeWisePlacementDto.college_id} not found`
      );
    }

    const collegeWisePlacement = this.collegeWisePlacementRepository.create(
      createCollegeWisePlacementDto
    );
    try {
      return await this.collegeWisePlacementRepository.save(
        collegeWisePlacement
      );
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("College-wise placement ID must be unique");
      }
      throw error;
    }
  }

  // PATCH /collegewiseplacement/:id
  async update(
    id: number,
    updateCollegeWisePlacementDto: UpdateCollegeWisePlacementDto
  ): Promise<{ message: string; data?: CollegeWisePlacement }> {
    const collegeWisePlacement = await this.findOne(id);
    if (!collegeWisePlacement) {
      throw new NotFoundException(
        `College-wise placement with ID ${id} not found`
      );
    }
    await this.collegeWisePlacementRepository.update(
      id,
      updateCollegeWisePlacementDto
    );
    const updatedCollegeWisePlacement = await this.findOne(id);

    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: updateCollegeWisePlacementDto.college_id },
    });
    if (!college) {
      throw new NotFoundException(
        `College with ID ${updateCollegeWisePlacementDto.college_id} not found`
      );
    }

    return {
      message: `College-wise placement with ID ${id} updated successfully`,
      data: updatedCollegeWisePlacement,
    };
  }

  // DELETE /collegewiseplacement/:id
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.collegeWisePlacementRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `College-wise placement with ID ${id} not found`
      );
    }
    return {
      message: `College-wise placement with ID ${id} deleted successfully`,
    };
  }

  // GET /college-content/by-college?cid=7000007
  async findByCollegeId(collegeId: number): Promise<CollegeWisePlacement[]> {
    const contents = await this.collegeWisePlacementRepository.find({
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
