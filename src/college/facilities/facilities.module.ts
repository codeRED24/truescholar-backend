import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilitiesService } from './facilities.service';
import { FacilitiesController } from './facilities.controller';
import { Facilities } from './facilities.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Facilities])],
  providers: [FacilitiesService],
  controllers: [FacilitiesController],
  exports: [TypeOrmModule],
})
export class FacilitiesModule {}
