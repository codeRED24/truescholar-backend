import { Module } from '@nestjs/common';
import { NpsRatingController } from './nps-rating.controller';
import { NpsRatingService } from './nps-rating.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NpsRating } from './nps-rating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NpsRating])],
  controllers: [NpsRatingController],
  providers: [NpsRatingService],
})
export class NpsRatingModule {}
