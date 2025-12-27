import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateReelDto } from "./dto/create-reel.dto";
import { UpdateReelDto } from "./dto/update-reel.dto";
import { Reel } from "./entities/reel.entity";
import { FileUploadService } from "../utils/file-upload/fileUpload.service";
import { User } from "better-auth/types";

@Injectable()
export class ReelsService {
  constructor(
    @InjectRepository(Reel)
    private readonly reelRepository: Repository<Reel>,
    private readonly fileUploadService: FileUploadService
  ) {}

  async create(
    createReelDto: CreateReelDto,
    files: Array<Express.Multer.File> = [],
    req?: any,
    user?: User
  ): Promise<any> {
    let reelUrl: string | undefined;

    if (files && files.length) {
      const reelVideo = files.find((f) => f.fieldname === "reel");
      if (reelVideo) {
        reelUrl = await this.fileUploadService.uploadFile(
          reelVideo as any,
          "reels",
          Number(user?.id)
        );
      }
    }

    const reel = this.reelRepository.create({
      reel_url: reelUrl,
      user_id: user?.id,
      college_id: createReelDto.college_id,
      type: createReelDto.type,
    });

    return await this.reelRepository.save(reel);
  }

  async findAll(): Promise<Reel[]> {
    return this.reelRepository.find({
      relations: ["user", "college"],
    });
  }

  async findOne(id: number): Promise<Reel> {
    const reel = await this.reelRepository.findOne({
      where: { id },
      relations: ["user", "college"],
    });
    if (!reel) throw new NotFoundException(`Reel with id ${id} not found`);
    return reel;
  }

  async update(id: number, updateReelDto: UpdateReelDto): Promise<Reel> {
    const reel = await this.findOne(id);
    Object.assign(reel, updateReelDto as any);
    return this.reelRepository.save(reel);
  }

  async remove(id: number): Promise<void> {
    const result = await this.reelRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Reel with id ${id} not found`);
  }
}
