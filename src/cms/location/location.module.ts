import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import CmsLocationService from "./location.service";
import CmsLocationController from "./location.controller";
import { Country } from "../../helper_entities/country/country.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Country])],
  providers: [CmsLocationService],
  controllers: [CmsLocationController],
  exports: [TypeOrmModule],
})
export class CmsLocationModule {}
