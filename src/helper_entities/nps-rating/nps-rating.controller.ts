import { Controller, Get, Post, Body } from '@nestjs/common';
import { NpsRatingService } from './nps-rating.service';
import { CreateNpsRatingDto } from './dto/create-nps-rating.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('nps-rating')
@Controller('nps-rating')
export class NpsRatingController {
  constructor(private readonly npsRatingService: NpsRatingService) {}

  @Get()
  findAll() {
    return this.npsRatingService.findAll();
  }

  @Post()
  create(@Body() createNpsRatingDto: CreateNpsRatingDto) {
    return this.npsRatingService.create(createNpsRatingDto);
  }
}
