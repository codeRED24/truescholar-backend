import { Module } from "@nestjs/common";
import { CmsAuthModule } from "./auth/auth.module";
import { CmsLocationModule } from "./location/location.module";
import { CmsStreamModule } from "./stream/stream.module";
import { CmsExamModule } from "./exam/exam.module";
import { CmsCollegeModule } from "./colleges/college.module";
import { LogsModule } from "./cms-logs/logs.module";
import { ArticlesModule } from "./articles/articles.module";
import { CmsAuthorsModule } from "./cms-authors/cms-authors.module";
import { CmsBulkUploadSeoModule } from "./bulk-upload/bulk-upload.module";
import { CmsCollegeExamMappingModule } from "./college-exam-mapping/college-exam-mapping.module";
import { CmsTemplatizationModule } from "./templatization/templatization.module";
import { CmsCourseModule } from "./course/course.module";

@Module({
  imports: [
    CmsAuthModule,
    CmsStreamModule,
    CmsLocationModule,
    CmsExamModule,
    CmsCollegeModule,
    LogsModule,
    ArticlesModule,
    CmsAuthorsModule,
    CmsBulkUploadSeoModule,
    CmsCollegeExamMappingModule,
    CmsTemplatizationModule,
    CmsCourseModule
  ],
})
export class CmsModule {}
