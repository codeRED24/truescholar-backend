import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { City } from "./city.entity";
import { CreateCityDto } from "./dto/create-city.dto";
import { UpdateCityDto } from "./dto/update-city.dto";
import { State } from "../state/state.entity";
import { Country } from "../country/country.entity";

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,

    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,

    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  async findAll(name?: string): Promise<City[]> {
    const cities = name
    ? await this.cityRepository.find({ where: { name: Like(`%${name}%`) } })
    : await this.cityRepository.find();

  if (!cities || cities.length === 0) {
    throw new NotFoundException("No cities found");
  }
  return cities;
  }

  async findOne(id: number): Promise<City> {
    return this.cityRepository.findOne({ where: { city_id: id } });
  }

  //CREATE
  async create(
    createCityDto: CreateCityDto | CreateCityDto[]
  ): Promise<City | City[]> {
    if (Array.isArray(createCityDto)) {
      const cities = await Promise.all(
        createCityDto.map(async (dto) => {
          const state = await this.stateRepository.findOne({
            where: { state_id: dto.state },
          });

          if (!state) {
            throw new NotFoundException(`State with ID ${dto.state} not found`);
          }

          const country = await this.countryRepository.findOne({
            where: { country_id: dto.country },
          });

          if (!country) {
            throw new NotFoundException(
              `Country with ID ${dto.country} not found`
            );
          }

          const city = this.cityRepository.create({
            ...dto,
            state,
            country,
          });

          return city;
        })
      );

      return this.cityRepository.save(cities);
    } else {
      const state = await this.stateRepository.findOne({
        where: { state_id: createCityDto.state },
      });

      if (!state) {
        throw new NotFoundException(
          `State with ID ${createCityDto.state} not found`
        );
      }

      const country = await this.countryRepository.findOne({
        where: { country_id: createCityDto.country },
      });

      if (!country) {
        throw new NotFoundException(
          `Country with ID ${createCityDto.country} not found`
        );
      }

      const city = this.cityRepository.create({
        ...createCityDto,
        state,
        country,
      });

      return this.cityRepository.save(city); // Save single city
    }
  }

  // PATCH
  async update(id: number, updateCityDto: UpdateCityDto): Promise<City> {
    const state = await this.stateRepository.findOne({
      where: { state_id: updateCityDto.state },
    });

    if (!state) {
      throw new NotFoundException(
        `State with ID ${updateCityDto.state} not found`
      );
    }

    const country = await this.countryRepository.findOne({
      where: { country_id: updateCityDto.country },
    });

    if (!country) {
      throw new NotFoundException(
        `Country with ID ${updateCityDto.country} not found`
      );
    }

    await this.cityRepository.update(id, {
      ...updateCityDto,
      state,
      country,
    });

    return this.findOne(id);
  }

  // DELETE STATE
  async delete(id: number): Promise<void> {
    await this.cityRepository.delete(id);
  }
}
