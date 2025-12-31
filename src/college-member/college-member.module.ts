import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollegeMemberController } from "./college-member.controller";
import { CollegeMemberService } from "./college-member.service";
import { Member } from "../authentication_module/better-auth/entities/member.entity";
import { CollegeInfo } from "../college/college-info/college-info.entity";
import { User } from "../authentication_module/better-auth/entities/users.entity";
import { CaslModule } from "../casl";

@Module({
  imports: [TypeOrmModule.forFeature([Member, CollegeInfo, User]), CaslModule],
  controllers: [CollegeMemberController],
  providers: [CollegeMemberService],
  exports: [CollegeMemberService],
})
export class CollegeMemberModule {}
