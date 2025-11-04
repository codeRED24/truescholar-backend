import { Controller, Get, Post, Body } from '@nestjs/common';
import { NpsRatingService } from './nps-rating.service';
import { CreateNpsRatingDto } from './dto/create-nps-rating.dto';
import { ApiTags } from '@nestjs/swagger';
import { sendEmail } from '../../utils/email';

@ApiTags('nps-rating')
@Controller('nps-rating')
export class NpsRatingController {
  constructor(private readonly npsRatingService: NpsRatingService) {}

  @Get()
  findAll() {
    return this.npsRatingService.findAll();
  }

  @Post()
  async create(@Body() createNpsRatingDto: CreateNpsRatingDto) {
    const npsRating = await this.npsRatingService.create(createNpsRatingDto);
    if (process.env.TO_EMAIL) {
      sendEmail('New NPS Rating', 'new-nps-rating', {
        score: npsRating.rating,
        feedback: npsRating.feedback_query,
        name: npsRating.name,
        email: npsRating.email,
        mobile_no: npsRating.mobile_no,
      });
    }
    return npsRating;
  }
}
