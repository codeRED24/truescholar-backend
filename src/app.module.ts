import { CollegeSearchModule } from "./college/college-search/college-search.module";
import { CompareModule } from "./college/compare/compare.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CitiesModule } from "./helper_entities/cities/cities.module";
import { CountryModule } from "./helper_entities/country/country.module";
import { StateModule } from "./helper_entities/state/state.module";
import { FacilitiesModule } from "./college/facilities/facilities.module";
import { FacultiesModule } from "./college/faculties/faculties.module";
import { StreamModule } from "./helper_entities/stream/stream.module";
import { ArticlesModule } from "./articles_modules/articles/articles.module";
import { ExamsModule } from "./exams_module/exams/exams.module";
import { CoursesModule } from "./courses_module/courses/courses.module";
import { AuthModule } from "./authentication_module/auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./authentication_module/users/users.module";
import { CollegeInfoModule } from "./college/college-info/college-info.module";
import { CollegeContentModule } from "./college/college-content/college-content.module";
import { CollegeGalleryModule } from "./college/college-gallery/college-gallery.module";
import { CollegeVideoModule } from "./college/college-video/college-video.module";
import { CollegeWiseFeesModule } from "./college/college-wise-fees/college-wise-fees.module";
import { CollegeWisePlacementModule } from "./college/college-wise-placement/college-wise-placement.module";
import { CollegeScholarshipModule } from "./college/college-scholarship/college-scholarship.module";
import { CollegeHostelCampusModule } from "./college/college-hostel-and-campus/college-hostel-and-campus.module";
import { CollegeDatesModule } from "./college/college-dates/college-dates.module";
import { CollegeCutoffModule } from "./college/college-cutoff/college-cutoff.module";
import { CollegeRankingModule } from "./college/college-ranking/college-ranking.module";
import { RankingAgencyModule } from "./college/ranking-agency/ranking-agency.module";
import { CourseGroupModule } from "./courses_module/course-group/course-group.module";
import { SpecializationModule } from "./specializations/specialization/specialization.module";
import { ExamContentModule } from "./exams_module/exam-content/exam-content.module";
import { ExamDateModule } from "./exams_module/exam-dates/exam-dates.module";
import { AuthorModule } from "./articles_modules/author/author.module";
import { CollegeWiseCourseModule } from "./college/college-wise-course/college-wise-course.module";
import { CollegeExamModule } from "./college/college_exam/college_exam.module";
import { MyElasticsearchModule } from "./elasticsearch/elasticsearch.module";
import { ExamFAQModule } from "./exams_module/exam-faq/exam-faq.module";
import { LeadFormModule } from "./helper_entities/lead-form/lead-form.module";
import { NpsRatingModule } from "./helper_entities/nps-rating/nps-rating.module";
import { NewsletterModule } from "./helper_entities/newsletter/newsletter.module";
import { ContactUsModule } from "./helper_entities/contact-us/contact-us.module";
import { HomePageModule } from "./helper_entities/home-page/home-page.module";
import { CollegeComparisionModule } from "./helper_entities/college-comparision/college-comparision.module";
import { ListingContentModule } from "./helper_entities/listing-content/listing-content.module";
import * as dotenv from "dotenv";
dotenv.config();
import { ExamDocumentModule } from "./helper_entities/exams-document/exams-document.module";
import { CmsModule } from "./cms/cms.module";
import { ScheduleModule } from "@nestjs/schedule";
import { SitemapModule } from "./sitemaps/sitemap.module";
import { AppDataSource } from "./data-source"; // Import DataSource
import { FastifyMulterModule } from "@nest-lab/fastify-multer";

@Module({
  imports: [
    CollegeSearchModule,
    CompareModule,
    TypeOrmModule.forRoot(AppDataSource.options), // Use DataSource options
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST_NEST,
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      migrations: [__dirname + "/../migrations/*.{js,ts}"],
      synchronize: false, // Set this to false when using migrations
      migrationsRun: true, // Auto-run migrations on app start
    }),
    FastifyMulterModule,
    MyElasticsearchModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CitiesModule,
    CountryModule,
    StateModule,
    FacilitiesModule,
    FacultiesModule,
    StreamModule,
    ArticlesModule,
    ExamsModule,
    CoursesModule,
    AuthModule,
    UserModule,
    CollegeInfoModule,
    CollegeContentModule,
    CollegeGalleryModule,
    CollegeVideoModule,
    CollegeWiseFeesModule,
    CollegeWisePlacementModule,
    CollegeScholarshipModule,
    CollegeHostelCampusModule,
    CollegeDatesModule,
    CollegeCutoffModule,
    CollegeRankingModule,
    RankingAgencyModule,
    CourseGroupModule,
    SpecializationModule,
    ExamContentModule,
    ExamDateModule,
    AuthorModule,
    CollegeWiseCourseModule,
    CollegeExamModule,
    ExamFAQModule,
    LeadFormModule,
    NpsRatingModule,
    NewsletterModule,
    ContactUsModule,
    HomePageModule,
    CollegeComparisionModule,
    ListingContentModule,
    ExamDocumentModule,
    // CmsModule,
    ScheduleModule.forRoot(),
    SitemapModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
