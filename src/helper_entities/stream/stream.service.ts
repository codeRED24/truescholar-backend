import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, QueryFailedError } from "typeorm";
import { Stream } from "./stream.entity";
import { CreateStreamDto } from "./dto/create-stream.dto";
import { UpdateStreamDto } from "./dto/update-stream.dto";

@Injectable()
export class StreamService {
  constructor(
    @InjectRepository(Stream)
    private readonly streamRepository: Repository<Stream>
  ) {}

  // GET ALL
  async findAll(stream_name?: string): Promise<Stream[]> {
    if (stream_name) {
      return this.streamRepository.find({
        where: {
          stream_name: Like(`%${stream_name}%`),
        },
      });
    }
    return this.streamRepository.find({
      order: {
        kapp_score: "DESC",
      },
    });
  }

  // GET /stream/:id

  async findOne(id: number): Promise<Stream> {
    const stream = await this.streamRepository.findOne({
      where: { stream_id: id },
    });
    if (!stream) {
      throw new NotFoundException(`Stream with ID ${id} not found`);
    }
    return stream;
  }

  // POST;
  async create(createStreamDto: CreateStreamDto): Promise<Stream> {
    const stream = this.streamRepository.create(createStreamDto);
    try {
      return await this.streamRepository.save(stream);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("Custom ID must be unique");
      }
      throw error;
    }
  }

  // Patch
  async update(
    id: number,
    updateStreamDto: UpdateStreamDto
  ): Promise<{ message: string; data?: Stream }> {
    const stream = await this.findOne(id);
    if (!stream) {
      throw new NotFoundException(`Stream with ID ${id} not found`);
    }
    await this.streamRepository.update(id, updateStreamDto);
    const updatedStream = await this.findOne(id);
    return {
      message: `Stream with ID ${id} updated successfully`,
      data: updatedStream,
    };
  }

  // Delete
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.streamRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Stream with ID ${id} not found`);
    }
    return { message: `Stream with ID ${id} deleted successfully` };
  }

  async bulkCreate(createStreamDtos: CreateStreamDto[]): Promise<Stream[]> {
    const streams = this.streamRepository.create(createStreamDtos);
    try {
      return await this.streamRepository.save(streams);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("One or more streams must have unique IDs");
      }
      throw error;
    }
  }
}
