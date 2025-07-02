import { Module } from "@nestjs/common";
import { ContactUsController } from "./contact-us.controller";
import { ContactUsService } from "./contact-us.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ContactUs } from "./contact-us.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
@Module({
  imports: [TypeOrmModule.forFeature([ContactUs, CourseGroup])],
  controllers: [ContactUsController],
  providers: [ContactUsService],
})
export class ContactUsModule {}
