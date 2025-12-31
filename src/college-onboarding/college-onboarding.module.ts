import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BulkImportController } from "./bulk-import.controller";
import { BulkImportService } from "./bulk-import.service";
import { LinkRequestController } from "./link-request.controller";
import { LinkRequestService } from "./link-request.service";
import { InvitationController } from "./invitation.controller";
import { CollegeLinkRequest } from "./entities/college-link-request.entity";
import { Invitation } from "../authentication_module/better-auth/entities/invitation.entity";
import { Member } from "../authentication_module/better-auth/entities/member.entity";
import { CollegeInfo } from "../college/college-info/college-info.entity";
import { User } from "../authentication_module/better-auth/entities/users.entity";
import { CaslModule } from "../casl";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CollegeLinkRequest,
      Invitation,
      Member,
      CollegeInfo,
      User,
    ]),
    CaslModule,
  ],
  controllers: [
    BulkImportController,
    LinkRequestController,
    InvitationController,
  ],
  providers: [BulkImportService, LinkRequestService],
  exports: [BulkImportService, LinkRequestService],
})
export class CollegeOnboardingModule {}
