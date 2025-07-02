import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CitiesService } from "./cities.service";
import { CitiesController } from "./cities.controller";
import { City } from "./city.entity";
import { StateModule } from "../state/state.module";
import { CountryModule } from "../country/country.module";
@Module({
  imports: [
    TypeOrmModule.forFeature([City]),
    StateModule,
    CountryModule,
  ],
  controllers: [CitiesController],
  providers: [CitiesService],
})
export class CitiesModule {}
