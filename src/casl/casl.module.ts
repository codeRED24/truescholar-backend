import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CaslAbilityFactory } from "./casl-ability.factory";
import { PoliciesGuard } from "./policies.guard";
import { Member } from "../authentication_module/better-auth/entities/member.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Member])],
  providers: [CaslAbilityFactory, PoliciesGuard],
  exports: [CaslAbilityFactory, PoliciesGuard],
})
export class CaslModule {}
