import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NpsRating } from './nps-rating.entity';
import { CreateNpsRatingDto } from './dto/create-nps-rating.dto';

@Injectable()
export class NpsRatingService {
  constructor(
    @InjectRepository(NpsRating)
    private readonly npsRatingRepository: Repository<NpsRating>,
  ) {}

  findAll(): Promise<NpsRating[]> {
    return this.npsRatingRepository.find();
  }

  create(createNpsRatingDto: CreateNpsRatingDto): Promise<NpsRating> {
    const npsRating = this.npsRatingRepository.create(createNpsRatingDto);
    return this.npsRatingRepository.save(npsRating);
  }
}
