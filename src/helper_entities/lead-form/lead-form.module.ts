import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LeadFormService } from "./lead-form.service";
import { LeadFormController } from "./lead-form.controller";
import { LeadForm } from "./lead-form.entity";
import { CollegeInfo } from "../../college/college-info/college-info.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
import { City } from "../../helper_entities/cities/city.entity";
@Module({
  imports: [
    TypeOrmModule.forFeature([LeadForm, CollegeInfo, CourseGroup, City]),
  ],
  controllers: [LeadFormController],
  providers: [LeadFormService],
})
export class LeadFormModule {}
