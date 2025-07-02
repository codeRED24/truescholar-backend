import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Country } from './country.entity';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  async findAll(name?: string): Promise<Country[]> {
    if (name) {
      return this.countryRepository.find({
        where: {
          name: Like(`%${name}%`),
        },
      });
    }
    return this.countryRepository.find();
  }

  async findOne(id: number): Promise<Country> {
    return this.countryRepository.findOne({ where: { country_id: id } });
  }

  async create(createCountryDto: CreateCountryDto): Promise<Country> {
    const country = this.countryRepository.create(createCountryDto);
    return this.countryRepository.save(country);
  }

  async update(
    id: number,
    updateCountryDto: UpdateCountryDto,
  ): Promise<Country> {
    await this.countryRepository.update(id, updateCountryDto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.countryRepository.delete(id);
  }
}
