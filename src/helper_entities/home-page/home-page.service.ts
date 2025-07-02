import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan, DataSource } from "typeorm";
import { CollegeInfo } from "../../college/college-info/college-info.entity";
import { Stream } from "../../helper_entities/stream/stream.entity";
import { City } from "../cities/city.entity";
import { State } from "../state/state.entity";
import { CollegeRanking } from "../../college/college-ranking/college-ranking.entity";
import { CollegeWiseFees } from "../../college/college-wise-fees/college-wise-fees.entity";
import { CollegeWiseCourse } from "../../college/college-wise-course/college_wise_course.entity";
import { CoursesSectionDto } from "./dto/home-page-response.dto";
import { CitySectionDto } from "./dto/home-page-response.dto";
import { Article } from "../../articles_modules/articles/articles.entity";
import { Exam } from "../../exams_module/exams/exams.entity";
import { InstituteType } from "../../common/enums";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
import { AppService } from "../../app.service";
import { OnlineCollegesDTO } from "./dto/home-page-response.dto";
import { LessThan } from "typeorm";
import {
  HomePageResponseDto,
  TopCollegesSectionDto,
  StreamSectionDto,
} from "./dto/home-page-response.dto";

export class RecommendedCollegeDto extends CollegeInfo {
  ranking_section: {
    max_rank: number | null;
    min_rank: number | null;
  };
  min_tuition_fees: number | null;
  max_tuition_fees: number | null;
  no_of_courses: number | null;
}

@Injectable()
export class HomePageService {
  constructor(
    private readonly appService: AppService,
    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>,
    @InjectRepository(Stream)
    private readonly streamRepository: Repository<Stream>,
    @InjectRepository(CollegeRanking)
    private collegeRankingRepository: Repository<CollegeRanking>,
    @InjectRepository(CollegeWiseFees)
    private collegeWiseFeesRepository: Repository<CollegeWiseFees>,
    @InjectRepository(CollegeWiseCourse)
    private collegeWiseCourseRepository: Repository<CollegeWiseCourse>,
    @InjectRepository(City)
    private cityRepository: Repository<City>,
    @InjectRepository(State)
    private stateRepository: Repository<State>,
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    @InjectRepository(CourseGroup)
    private courseGroupRepository: Repository<CourseGroup>,

    private readonly dataSource: DataSource
  ) {}

  async checkRedisConnection(): Promise<void> {
    try {
      await this.appService.isRedisConnected();
    } catch (error) {
      console.log("Redis is not connected. Error:", error.message);
    }
  }

  private async getCourseCount(collegeId: number): Promise<number> {
    const result = await this.collegeWiseCourseRepository
      .createQueryBuilder("course")
      .select("COUNT(course.college_wise_course_id)", "courseCount")
      .where("course.college_id = :collegeId", { collegeId })
      .groupBy("course.college_id")
      .getRawOne();
    return result ? parseInt(result.courseCount, 10) : 0;
  }

  private async getLatestNIRFRanking(
    collegeId: number
  ): Promise<number | null> {
    const latestRanking = await this.collegeRankingRepository.findOne({
      where: {
        college_id: collegeId,
        ranking_agency_id: 5,
      },
      order: { year: "DESC" },
    });

    return latestRanking ? latestRanking.rank : null;
  }

  private async getMinMaxFeesByStream(
    collegeId: number,
    streamId: number
  ): Promise<{ minFees: number | null; maxFees: number | null }> {
    // Fetch fees based on streamId
    const queryBuilder = this.collegeWiseFeesRepository
      .createQueryBuilder("fees")
      .where("fees.college_id = :collegeId", { collegeId });

    if (streamId > 0) {
      queryBuilder
        .innerJoinAndSelect("fees.courseGroup", "courseGroup")
        .andWhere("courseGroup.stream_id = :streamId", { streamId });
    }

    const minFees = await queryBuilder
      .select("MIN(fees.tution_fees_min_amount)", "minFees")
      .getRawOne();

    const maxFees = await queryBuilder
      .select("MAX(fees.tution_fees_max_amount)", "maxFees")
      .getRawOne();

    return {
      minFees: minFees ? parseInt(minFees.minFees, 10) : null,
      maxFees: maxFees ? parseInt(maxFees.maxFees, 10) : null,
    };
  }

  /**
   * Get home page data api for accessing multiple sections together.
   */
  async getHomePageData(): Promise<HomePageResponseDto> {
    const streams = await this.streamRepository.find();
    const topCollegesSections: TopCollegesSectionDto[] = await Promise.all(
      streams.map(async (stream) => {
        const colleges = await this.dataSource.query(
          `
            SELECT * FROM college_info AS ci
            WHERE ci.is_active = TRUE
            AND ci.primary_stream_id = $1 
            AND EXISTS (
                SELECT 1 FROM college_content cc 
                WHERE cc.college_id = ci.college_id 
                AND cc.is_active = TRUE 
                AND cc.silos = 'info'
            )
            ORDER BY ci.kapp_score DESC
            LIMIT 15;
        `,
          [stream.stream_id]
        );

        // Collect all required IDs
        const collegeIds = colleges.map((college) => college.college_id);
        const cityIds = [
          ...new Set(colleges.map((college) => college.city_id)),
        ];
        const stateIds = [
          ...new Set(colleges.map((college) => college.state_id)),
        ];

        // Initialize empty maps to avoid undefined lookups
        const cityMap: Record<number, string> = {};
        const stateMap: Record<number, string> = {};
        const courseCountMap: Record<number, number> = {};
        const nirfRankingMap: Record<number, number> = {};
        const feesMap: Record<
          number,
          { minFees: number | null; maxFees: number | null }
        > = {};

        // Fetch related data only if arrays are non-empty
        if (cityIds.length > 0) {
          const cities = await this.cityRepository.findByIds(cityIds);
          Object.assign(
            cityMap,
            Object.fromEntries(cities.map((city) => [city.city_id, city.name]))
          );
        }

        if (stateIds.length > 0) {
          const states = await this.stateRepository.findByIds(stateIds);
          Object.assign(
            stateMap,
            Object.fromEntries(
              states.map((state) => [state.state_id, state.name])
            )
          );
        }

        if (collegeIds.length > 0) {
          const courseCounts = await this.collegeWiseCourseRepository
            .createQueryBuilder("course")
            .select("course.college_id", "collegeId")
            .addSelect("COUNT(course.college_wise_course_id)", "courseCount")
            .where("course.college_id IN (:...collegeIds)", { collegeIds })
            .groupBy("course.college_id")
            .getRawMany();
          Object.assign(
            courseCountMap,
            Object.fromEntries(
              courseCounts.map((c) => [
                c.collegeId,
                parseInt(c.courseCount, 10),
              ])
            )
          );

          const nirfRankings = await this.collegeRankingRepository
            .createQueryBuilder("ranking")
            .select("ranking.college_id", "collegeId")
            .addSelect("ranking.rank", "rank")
            .where("ranking.college_id IN (:...collegeIds)", { collegeIds })
            .andWhere("ranking.ranking_agency_id = :agencyId", { agencyId: 5 })
            .orderBy("ranking.year", "DESC")
            .getRawMany();
          Object.assign(
            nirfRankingMap,
            Object.fromEntries(nirfRankings.map((r) => [r.collegeId, r.rank]))
          );

          const minMaxFees = await this.collegeWiseFeesRepository
            .createQueryBuilder("fees")
            .select("fees.college_id", "collegeId")
            .addSelect("MIN(fees.tution_fees_min_amount)", "minFees")
            .addSelect("MAX(fees.tution_fees_max_amount)", "maxFees")
            .where("fees.college_id IN (:...collegeIds)", { collegeIds })
            .groupBy("fees.college_id")
            .getRawMany();
          Object.assign(
            feesMap,
            Object.fromEntries(
              minMaxFees.map((f) => [
                f.collegeId,
                {
                  minFees: parseInt(f.minFees, 10) || null,
                  maxFees: parseInt(f.maxFees, 10) || null,
                },
              ])
            )
          );
        }

        // Build the college-wise location data
        const collegeWiseLocation = colleges.map((college) => {
          return {
            college_id: college.college_id,
            college_name: college.college_name,
            short_name: college.short_name,
            slug: college.slug,
            city_id: college.city_id,
            city_name: cityMap[college.city_id] || null,
            state_id: college.state_id,
            state_name: stateMap[college.state_id] || null,
            country_id: college.country_id,
            location: college.location,
            logo_img: college.logo_img,
            banner_img: college.banner_img,
            kapp_score: college.kapp_score,
            primary_stream_id: college.primary_stream_id,
            kapp_rating: college.kapp_rating,
            nacc_grade: college.nacc_grade,
            type_of_institute: college.type_of_institute,
            founded_year: college.founded_year,
            course_count: courseCountMap[college.college_id] || 0,
            NIRF_ranking: nirfRankingMap[college.college_id] || null,
            min_tution_fees: feesMap[college.college_id]?.minFees || null,
            max_tution_fees: feesMap[college.college_id]?.maxFees || null,
          };
        });

        // Return the stream section even if there are no colleges
        return {
          stream_id: stream.stream_id,
          stream_name: stream.stream_name,
          slug: stream.slug,
          is_online: stream.is_online,
          colleges: collegeWiseLocation,
        };
      })
    );

    // Get top 15 colleges overall
    const topCollegesOverall = await this.dataSource.query(`
          SELECT * FROM college_info AS ci
          WHERE ci.is_active = TRUE
          AND EXISTS (
              SELECT 1 FROM college_content cc 
              WHERE cc.college_id = ci.college_id 
              AND cc.is_active = TRUE 
              AND cc.silos = 'info'
          )
          ORDER BY ci.kapp_score DESC
          LIMIT 15;
      `);

    const overallSection: TopCollegesSectionDto = {
      stream_id: 0,
      stream_name: "All Streams",
      slug: "empty-slug",
      is_online: true,
      colleges: await Promise.all(
        topCollegesOverall.map(async (college) => {
          const city = college.city_id
            ? await this.cityRepository.findOne({
                where: { city_id: college.city_id },
              })
            : null;

          const state = college.state_id
            ? await this.stateRepository.findOne({
                where: { state_id: college.state_id },
              })
            : null;

          const courseCount = await this.getCourseCount(college.college_id);
          const nirfRanking = await this.getLatestNIRFRanking(
            college.college_id
          );
          const { minFees, maxFees } = await this.getMinMaxFeesByStream(
            college.college_id,
            0
          );

          return {
            college_id: college.college_id,
            college_name: college.college_name,
            short_name: college.short_name,
            slug: college.slug,
            city_id: college.city_id,
            city_name: city ? city.name : null,
            state_id: college.state_id,
            state_name: state ? state.name : null,
            country_id: college.country_id,
            location: college.location,
            logo_img: college.logo_img,
            banner_img: college.banner_img,
            kapp_score: college.kapp_score,
            primary_stream_id: college.primary_stream_id,
            kapp_rating: college.kapp_rating,
            nacc_grade: college.nacc_grade,
            type_of_institute: college.type_of_institute,
            founded_year: college.founded_year,
            course_count: courseCount,
            NIRF_ranking: nirfRanking,
            min_tution_fees: minFees,
            max_tution_fees: maxFees,
          };
        })
      ),
    };

    const topCourseGroups = await this.courseGroupRepository.find({
      order: { kapp_score: "DESC" },
      take: 15,
    });

    const courseGroupsSection: CoursesSectionDto = {
      courses: topCourseGroups.map((courseGroup) => ({
        course_id: courseGroup.course_group_id,
        short_name: courseGroup.name,
        duration_in_months: courseGroup.duration_in_months,
        course_name: courseGroup.full_name,
        slug: courseGroup.slug,
        kap_score: courseGroup.kapp_score,
        level: courseGroup.level,
      })),
    };

    // Get top 15 cities sorted by kapp_score
    const topCities = await this.cityRepository
      .createQueryBuilder("city")
      .select([
        "city.city_id AS city_id",
        "city.name AS name",
        "city.slug AS slug",
        "city.logo_url AS logo_url",
        "city.kapp_score AS kapp_score",
      ])
      .orderBy("city.kapp_score", "DESC")
      .limit(15)
      .getRawMany();

    // Now fetch the college_count for each of these cities
    const cityIds = topCities.map((city) => city.city_id);

    const citiesWithCollegeCount = await this.cityRepository
      .createQueryBuilder("city")
      .select([
        "city.city_id AS city_id",
        "COUNT(college.college_id) AS college_count",
      ])
      .leftJoin(CollegeInfo, "college", "college.city_id = city.city_id")
      .where("city.city_id IN (:...cityIds)", { cityIds })
      .groupBy("city.city_id")
      .getRawMany();

    // Merge the results: Attach college_count to the topCities list
    const citiesSection: CitySectionDto[] = topCities.map((city) => {
      const collegeCount =
        citiesWithCollegeCount.find((c) => c.city_id === city.city_id)
          ?.college_count || 0;
      return {
        city_id: city.city_id,
        slug: city.slug,
        name: city.name,
        logo_url: city.logo_url,
        kapp_score: city.kapp_score,
        college_count: Number(collegeCount),
      };
    });

    // Fetch the latest 15 articles based on the updated_at field
    const recentArticles = await this.articleRepository
      .createQueryBuilder("article")
      .leftJoinAndSelect("article.author", "author")
      .select([
        "article.article_id AS article_id",
        "article.title AS title",
        "article.sub_title AS sub_title",
        "article.slug AS slug",
        "article.updated_at AS updated_at",
        "article.read_time AS read_time",
        "article.meta_desc AS meta_desc",
        "author.view_name AS view_name",
        "author.image AS image",
        "article.author_id AS author_id",
      ])
      .where("article.is_active = :isActive", { isActive: true })
      .orderBy("article.updated_at", "DESC")
      .limit(15)
      .getRawMany();

    // Map the articles to the desired structure
    const newsSection = recentArticles.map((article) => ({
      article_id: article.article_id,
      title: article.title,
      sub_title: article.sub_title,
      slug: article.slug,
      updated_at: article.updated_at,
      read_time: article.read_time,
      meta_desc: article.meta_desc,
      author_name: article.view_name,
      author_img: article.image,
      author_id: article.author_id,
    }));

    // Fetch upcoming exams
    const today = new Date().toISOString().split("T")[0];
    const upcomingExams = await this.examRepository.find({
      where: {
        exam_date: MoreThan(today),
        IsPublished: true,
      },
      order: {
        exam_date: "ASC",
      },
      take: 15,
    });

    const upcomingExamsDto = upcomingExams.map((exam) => {
      return {
        exam_id: exam.exam_id,
        slug: exam.slug,
        exam_name: exam.exam_name,
        exam_shortname: exam.exam_shortname,
        exam_logo: exam.exam_logo,
        exam_duration: exam.exam_duration,
        exam_subject: exam.exam_subject,
        exam_description: exam.exam_description,
        mode_of_exam: exam.mode_of_exam,
        level_of_exam: exam.level_of_exam,
        exam_fee_min: exam.exam_fee_min,
        exam_fee_max: exam.exam_fee_max,
        exam_date: exam.exam_date,
        official_website: exam.official_website,
        application_start_date: exam.application_start_date,
        application_end_date: exam.application_end_date,
      };
    });

    //Top private collges

    const topPrivateCollegesSections: TopCollegesSectionDto[] =
      await Promise.all(
        streams.map(async (stream) => {
          const privateColleges = await this.dataSource.query(
            `
              SELECT * FROM college_info AS ci
              WHERE ci.is_active = TRUE
              AND ci.type_of_institute = $1 
              AND ci.primary_stream_id = $2 
              AND EXISTS (
                  SELECT 1 FROM college_content cc 
                  WHERE cc.college_id = ci.college_id 
                  AND cc.is_active = TRUE 
                  AND cc.silos = 'info'
              )
              ORDER BY ci.kapp_score DESC
              LIMIT 15;
          `,
            [InstituteType.PRIVATEINSTITUTE, stream.stream_id]
          );

          const collegeWiseLocation = await Promise.all(
            privateColleges.map(async (college) => {
              const city = college.city_id
                ? await this.cityRepository.findOne({
                    where: { city_id: college.city_id },
                  })
                : null;
              const state = college.state_id
                ? await this.stateRepository.findOne({
                    where: { state_id: college.state_id },
                  })
                : null;
              const courseCount = await this.getCourseCount(college.college_id);
              const nirfRanking = await this.getLatestNIRFRanking(
                college.college_id
              );
              const { minFees, maxFees } = await this.getMinMaxFeesByStream(
                college.college_id,
                stream.stream_id
              );

              return {
                college_id: college.college_id,
                college_name: college.college_name,
                short_name: college.short_name,
                slug: college.slug,
                city_id: college.city_id,
                city_name: city ? city.name : null,
                state_id: college.state_id,
                state_name: state ? state.name : null,
                country_id: college.country_id,
                location: college.location,
                logo_img: college.logo_img,
                banner_img: college.banner_img,
                kapp_score: college.kapp_score,
                primary_stream_id: college.primary_stream_id,
                kapp_rating: college.kapp_rating,
                nacc_grade: college.nacc_grade,
                type_of_institute: college.type_of_institute,
                founded_year: college.founded_year,
                course_count: courseCount,
                NIRF_ranking: nirfRanking,
                min_tution_fees: minFees,
                max_tution_fees: maxFees,
              };
            })
          );
          return {
            stream_id: stream.stream_id,
            stream_name: stream.stream_name,
            slug: stream.slug,
            is_online: stream.is_online,
            colleges: collegeWiseLocation,
          };
        })
      );

    const topPrivateCollegesWithoutFilter = await this.dataSource.query(
      `
        SELECT * FROM college_info AS ci
        WHERE ci.is_active = TRUE
        AND ci.type_of_institute = $1 
        AND EXISTS (
            SELECT 1 FROM college_content cc 
            WHERE cc.college_id = ci.college_id 
            AND cc.is_active = TRUE 
            AND cc.silos = 'info'
        )
        ORDER BY ci.kapp_score DESC
        LIMIT 15;
    `,
      [InstituteType.PRIVATEINSTITUTE]
    );

    // You might want to transform this to match TopCollegesSectionDto
    const topPrivateCollegesWithoutFilterDto: TopCollegesSectionDto = {
      stream_id: 0,
      stream_name: "Top Private Colleges Without Filter",
      slug: "empty-slug",
      is_online: true,
      colleges: await Promise.all(
        topPrivateCollegesWithoutFilter.map(async (college) => {
          const city = college.city_id
            ? await this.cityRepository.findOne({
                where: { city_id: college.city_id },
              })
            : null;
          const state = college.state_id
            ? await this.stateRepository.findOne({
                where: { state_id: college.state_id },
              })
            : null;
          const courseCount = await this.getCourseCount(college.college_id);
          const nirfRanking = await this.getLatestNIRFRanking(
            college.college_id
          );
          const { minFees, maxFees } = await this.getMinMaxFeesByStream(
            college.college_id,
            0
          );
          return {
            college_id: college.college_id,
            college_name: college.college_name,
            short_name: college.short_name,
            slug: college.slug,
            city_id: college.city_id,
            city_name: city ? city.name : null,
            state_id: college.state_id,
            state_name: state ? state.name : null,
            country_id: college.country_id,
            location: college.location,
            logo_img: college.logo_img,
            banner_img: college.banner_img,
            kapp_score: college.kapp_score,
            primary_stream_id: college.primary_stream_id,
            kapp_rating: college.kapp_rating,
            nacc_grade: college.nacc_grade,
            type_of_institute: college.type_of_institute,
            founded_year: college.founded_year,
            course_count: courseCount,
            NIRF_ranking: nirfRanking,
            min_tution_fees: minFees,
            max_tution_fees: maxFees,
          };
        })
      ),
    };

    //stream section
    const streamSection: StreamSectionDto[] = streams.map((stream) => {
      return {
        stream_id: stream.stream_id,
        stream_name: stream.stream_name,
        slug: stream.slug,
      };
    });

    const onlineColleges: OnlineCollegesDTO[] =
      await this.collegeInfoRepository.find({
        where: { is_online: true },
        select: [
          "college_id",
          "college_name",
          "short_name",
          "slug",
          "logo_img",
          "location",
        ],
      });

    return {
      top_colleges: [overallSection, ...topCollegesSections],
      top_private_colleges_sections: [
        topPrivateCollegesWithoutFilterDto,
        ...topPrivateCollegesSections,
      ],
      courses_section: courseGroupsSection,
      top_cities: citiesSection,
      news_section: newsSection,
      upcoming_exams: upcomingExamsDto,
      stream_section: streamSection,
      online_section: onlineColleges,
    };
  }

  async getHeaderFooterData(): Promise<any> {
    const allStreamsWithColleges = await this.streamRepository.find({
      select: ["stream_id", "stream_name"],
    });

    const overStreamSection = await Promise.all(
      allStreamsWithColleges.map(async (stream) => {
        const colleges = await this.collegeInfoRepository.find({
          where: { primary_stream_id: stream.stream_id },
          order: { kapp_score: "DESC" },
          take: 10,
        });
        const formattedColleges = await Promise.all(
          colleges.map(async (college) => {
            const city = college.city_id
              ? await this.cityRepository.findOne({
                  where: { city_id: college.city_id },
                })
              : null;

            return {
              college_id: college.college_id,
              slug: college.slug,
              college_name: college.college_name,
              city_id: college.city_id,
              city_name: city ? city.name : null,
              college_short_name: college.short_name,
              kapp_score: college.kapp_score,
              short_name: college.short_name,
            };
          })
        );

        const exams = await this.examRepository.find({
          where: {
            stream_id: stream.stream_id,
            is_active: "true", // Ensuring only active exams are fetched
          },
          order: { kapp_score: "DESC" },
          take: 10,
        });
        const formattedExams = await Promise.all(
          exams.map(async (exam) => {
            return {
              exam_id: exam.exam_id,
              slug: exam.slug,
              exam_shortname: exam.exam_shortname,
              kapp_score: exam.kapp_score,
              exam_name: exam.exam_name,
            };
          })
        );

        return {
          stream_id: stream.stream_id,
          stream_name: stream.stream_name,
          colleges: formattedColleges,
          exams: formattedExams,
        };
      })
    );

    // Fetch university section (colleges with is_university = true)
    const universitySection = await this.collegeInfoRepository.find({
      where: { is_university: true },
      order: { kapp_score: "DESC" },
      take: 10,
    });
    const formattedUniversities = universitySection.map((college) => ({
      college_id: college.college_id,
      slug: college.slug,
      college_name: college.college_name,
      college_short_name: college.short_name,
      kapp_score: college.kapp_score,
      short_name: college.short_name,
    }));

    const footerColleges = await this.collegeInfoRepository.find({
      order: { kapp_score: "DESC" },
      take: 5,
    });
    const formattedFooterColleges = footerColleges.map((college) => ({
      college_id: college.college_id,
      slug: college.slug,
      college_name: college.college_name,
      college_short_name: college.short_name,
      kapp_score: college.kapp_score,
      short_name: college.short_name,
    }));
    const examsSection = await this.examRepository.find({
      order: { kapp_score: "DESC" },
      take: 10,
    });
    const formattedExams = examsSection.map((exam) => ({
      exam_id: exam.exam_id,
      slug: exam.slug,
      exam_name: exam.exam_name,
      kapp_score: exam.kapp_score,
      exam_shortname: exam.exam_shortname,
      conducting_authority: exam.conducting_authority,
      level_of_exam: exam.level_of_exam,
    }));

    // Fetch course section (top 20 courses based on kapp_score)
    const courseSection = await this.courseGroupRepository.find({
      order: { kapp_score: "DESC" },
      take: 20,
      select: ["course_group_id", "slug", "kapp_score", "name", "full_name"],
    });
    const formattedCourses = courseSection.map((course) => ({
      course_group_id: course.course_group_id,
      slug: course.slug,
      name: course.name,
      duration_in_months: course.duration_in_months,
      kapp_score: course.kapp_score,
      full_name: course.full_name,
    }));

    //cities
    const citiesSection = await this.cityRepository.find({
      order: { kapp_score: "DESC" },
      take: 10,
      select: ["city_id", "name"],
    });
    const formattedCities = citiesSection.map((city) => ({
      city_id: city.city_id,
      city_name: city.name,
    }));

    //streams
    const streamsSection = await this.streamRepository.find({
      order: { kapp_score: "DESC" },
      select: ["stream_id", "stream_name"],
    });
    const allStreams = await streamsSection.map((stream) => ({
      stream_id: stream.stream_id,
      stream_name: stream.stream_name,
    }));
    const collegesByStream = await Promise.all(
      allStreams.map(async (stream) => {
        const colleges = await this.collegeInfoRepository.find({
          where: { primary_stream_id: stream.stream_id },
          order: { kapp_score: "DESC" },
          take: 5,
        });
        const formattedColleges = colleges.map((college) => ({
          college_id: college.college_id,
          slug: college.slug,
          college_name: college.college_name,
          city_id: college.city_id,
          college_short_name: college.short_name,
          kapp_score: college.kapp_score,
        }));

        return {
          stream_id: stream.stream_id,
          stream_name: stream.stream_name,
          colleges: formattedColleges,
        };
      })
    );
    return {
      over_stream_section: overStreamSection,
      colleges_by_stream: collegesByStream,
      university_section: formattedUniversities,
      course_section: formattedCourses,
      cities_section: formattedCities,
      stream_section: allStreams,
      footer_colleges: formattedFooterColleges,
      exams_section: formattedExams,
    };
  }

  async getHomePageSearch(): Promise<any> {
    const collegeSearchResults = await this.collegeInfoRepository.find({
      where: { is_active: true },
      select: ["college_name", "short_name", "slug", "college_id"],
    });
    const examSearchResults = await this.examRepository.find({
      where: { is_active: "true" },
      select: ["exam_id", "exam_name", "slug", "exam_shortname"],
    });
    const courseGroupSearchResults = await this.courseGroupRepository.find({
      where: { is_active: true },
      select: ["name", "slug", "course_group_id", "full_name"],
    });

    const articlesSearchResults = await this.articleRepository.find({
      where: { is_active: true },
      select: ["article_id", "title", "slug", "tags"],
    });

    return {
      college_search: collegeSearchResults,
      exam_search: examSearchResults,
      course_group_search: courseGroupSearchResults,
      articles_search: articlesSearchResults,
    };
  }

  async getOnlinePage(): Promise<any> {
    const top10Streams = await this.streamRepository.find({
      where: { is_online: true },
      select: ["stream_id", "stream_name", "logo_url", "slug", "kapp_score"],
      order: { kapp_score: "DESC" },
      take: 50,
    });

    const top10Colleges = await this.collegeInfoRepository.find({
      where: { is_online: true },
      select: [
        "college_id",
        "college_name",
        "logo_img",
        "slug",
        "primary_stream_id",
        "short_name",
        "kapp_score",
      ],
      order: { kapp_score: "DESC" },
      take: 50,
    });

    const top10Articles = await this.articleRepository.find({
      where: { tags: "online_news" },
      select: [
        "title",
        "meta_desc",
        "tags",
        "updated_at",
        "img1_url",
        "img2_url",
        "slug",
        "article_id",
      ],
      order: { updated_at: "DESC" },
    });

    //course logic
    const onlineCourses = await this.collegeWiseCourseRepository
      .createQueryBuilder("college_wise_course")
      .where("college_wise_course.is_online = :isOnline", { isOnline: true })
      .leftJoinAndSelect("college_wise_course.courseGroup", "courseGroup")
      .leftJoinAndSelect("courseGroup.stream", "stream")
      .leftJoinAndSelect("college_wise_course.college", "collegeInfo")
      .select([
        "college_wise_course.college_id",
        "college_wise_course.name",
        "college_wise_course.description",
        "college_wise_course.total_seats",
        "college_wise_course.kapp_score",
        "courseGroup.course_group_id",
        "courseGroup.name",
        "courseGroup.full_name",
        "stream.stream_id",
        "stream.stream_name",
        "collegeInfo.college_name",
        "collegeInfo.slug",
        "collegeInfo.short_name",
      ])
      .getRawMany();

    const groupedData = onlineCourses.reduce((result, course) => {
      const {
        college_wise_course_college_id: collegeId,
        college_wise_course_name: courseName,
        college_wise_course_description: description,
        college_wise_course_total_seats: totalSeats,
        college_wise_course_kapp_score: kappScore,
        courseGroup_course_group_id: courseGroupId,
        courseGroup_name: courseGroupName,
        courseGroup_full_name: coursegroupFullName,
        stream_stream_id: streamId,
        stream_stream_name: streamName,
        collegeInfo_college_name: collegeName,
        collegeInfo_slug: slug,
        collegeInfo_short_name: shortName,
      } = course;

      if (!result[collegeId]) {
        result[collegeId] = {
          college_id: parseInt(collegeId, 10),
          college_name: collegeName,
          slug,
          short_name: shortName,
          courses: [],
        };
      }

      // Check if a course with the same name already exists
      if (!result[collegeId].courses.some((c) => c.name === courseName)) {
        result[collegeId].courses.push({
          name: courseName,
          description,
          total_seats: totalSeats,
          kapp_score: kappScore,
          course_group_id: courseGroupId,
          course_group_name: courseGroupName,
          coursegroup_full_name: coursegroupFullName,
          stream_id: streamId,
          stream_name: streamName,
        });
      }

      return result;
    }, {});

    const coursesdata = Object.values(groupedData);

    return {
      streams: top10Streams,
      colleges: top10Colleges,
      articles: top10Articles,
      coursesData: coursesdata,
    };
  }

  async getRecommendedColleges(
    collegeId: number
  ): Promise<RecommendedCollegeDto[]> {
    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: collegeId },
      select: ["primary_stream_id", "kapp_score"],
    });

    if (!college) {
      throw new Error("College not found or inactive");
    }

    const { primary_stream_id, kapp_score } = college;

    const collegesAbove = await this.collegeInfoRepository.find({
      where: {
        is_active: true,
        primary_stream_id: primary_stream_id,
        kapp_score: MoreThan(kapp_score),
      },
      order: { kapp_score: "ASC" },
      take: 5,
    });

    const collegesBelow = await this.collegeInfoRepository.find({
      where: {
        is_active: true,
        primary_stream_id: primary_stream_id,
        kapp_score: LessThan(kapp_score),
      },
      order: { kapp_score: "DESC" },
      take: 5,
    });

    const recommendedColleges = [...collegesAbove, ...collegesBelow];
    const collegeIds = recommendedColleges.map((c) => c.college_id);

    const [rankingData, feeData, courseCountData] = await Promise.all([
      this.collegeRankingRepository
        .createQueryBuilder("collegeRanking")
        .select("collegeRanking.college_id", "college_id")
        .addSelect("MAX(collegeRanking.rank)", "max_rank")
        .addSelect("MIN(collegeRanking.rank)", "min_rank")
        .where("collegeRanking.college_id IN (:...collegeIds)", { collegeIds })
        .groupBy("collegeRanking.college_id")
        .getRawMany(),

      this.collegeWiseFeesRepository
        .createQueryBuilder("fees")
        .select("fees.college_id", "college_id")
        .addSelect("MIN(fees.total_min_fees)", "min_tuition_fees")
        .addSelect("MAX(fees.total_max_fees)", "max_tuition_fees")
        .where("fees.college_id IN (:...collegeIds)", { collegeIds })
        .groupBy("fees.college_id")
        .getRawMany(),

      this.collegeWiseCourseRepository
        .createQueryBuilder("course")
        .select("course.college_id", "college_id")
        .addSelect("COUNT(course.college_wise_course_id)", "course_count")
        .where("course.college_id IN (:...collegeIds)", { collegeIds })
        .groupBy("course.college_id")
        .getRawMany(),
    ]);

    const rankingMap = rankingData.reduce((map, item) => {
      map[item.college_id] = {
        max_rank: item.max_rank,
        min_rank: item.min_rank,
      };
      return map;
    }, {});

    const feeMap = feeData.reduce((map, item) => {
      map[item.college_id] = {
        min_tuition_fees: item.min_tuition_fees,
        max_tuition_fees: item.max_tuition_fees,
      };
      return map;
    }, {});

    const courseCountMap = courseCountData.reduce((map, item) => {
      map[item.college_id] = item.course_count;
      return map;
    }, {});

    const result = recommendedColleges.map((college) => {
      const ranking = rankingMap[college.college_id] || {
        max_rank: null,
        min_rank: null,
      };
      const fees = feeMap[college.college_id] || {
        min_tuition_fees: null,
        max_tuition_fees: null,
      };
      const courseCount = courseCountMap[college.college_id] || 0;

      return {
        ...college,
        ranking_section: ranking,
        min_tuition_fees: fees.min_tuition_fees,
        max_tuition_fees: fees.max_tuition_fees,
        min_rank: ranking.min_rank,
        max_rank: ranking.max_rank,
        no_of_courses: courseCount,
      };
    });

    return result;
  }
}
