import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { State } from './state.entity';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { Country } from '../country/country.entity';
@Injectable()
export class StateService {
  constructor(
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,

    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  async findAll(name?: string): Promise<State[]> {
    if (name) {
      return this.stateRepository.find({
        where: {
          name: Like(`%${name}%`),
        },
      });
    }
    return this.stateRepository.find();
  }

  async findOne(id: number): Promise<State> {
    return this.stateRepository.findOne({
      where: { state_id: id },
    });
  }

  async create(
    createStateDto: CreateStateDto | CreateStateDto[],
  ): Promise<State | State[]> {
    // Handle single or multiple state creation
    if (Array.isArray(createStateDto)) {
      const states = await Promise.all(
        createStateDto.map(async (dto) => {
          const country = await this.countryRepository.findOne({
            where: { country_id: dto.country },
          });

          if (!country) {
            throw new NotFoundException(
              `Country with ID ${dto.country} not found`,
            );
          }

          const state = this.stateRepository.create({
            ...dto,
            country,
          });

          return state;
        }),
      );

      return this.stateRepository.save(states);
    } else {
      const country = await this.countryRepository.findOne({
        where: { country_id: createStateDto.country },
      });

      if (!country) {
        throw new NotFoundException(
          `Country with ID ${createStateDto.country} not found`,
        );
      }

      const state = this.stateRepository.create({
        ...createStateDto,
        country,
      });

      return this.stateRepository.save(state); // Save single state
    }
  }

  async update(id: number, updateStateDto: UpdateStateDto): Promise<State> {
    const country = await this.countryRepository.findOne({
      where: { country_id: updateStateDto.country },
    });

    if (!country) {
      throw new NotFoundException(
        `Country with ID ${updateStateDto.country} not found`,
      );
    }

    await this.stateRepository.update(id, {
      ...updateStateDto,
      country,
    });

    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.stateRepository.delete(id);
  }
}
