import { Module } from "@nestjs/common";
import { StateService } from "./state.service";
import { StateController } from "./state.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { State } from "./state.entity";
import { CountryModule } from "../../helper_entities/country/country.module";

@Module({
  imports: [TypeOrmModule.forFeature([State]), CountryModule],
  providers: [StateService],
  controllers: [StateController],
  // exports: [StateService],
  exports: [TypeOrmModule],
})
export class StateModule {}
