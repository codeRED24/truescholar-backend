import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SpecializationService } from "./specialization.service";
import { SpecializationController } from "./specialization.controller";
import { Specialization } from "./specialization.entity";
import { Stream } from "../../helper_entities/stream/stream.entity";
@Module({
  imports: [TypeOrmModule.forFeature([Specialization, Stream])],
  providers: [SpecializationService],
  controllers: [SpecializationController],
  exports: [TypeOrmModule],
})
export class SpecializationModule {}
