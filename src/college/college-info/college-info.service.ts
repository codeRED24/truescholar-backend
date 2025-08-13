import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateCollegeInfoDto } from "./dto/create-college-info.dto";
import { UpdateCollegeInfoDto } from "./dto/update-college-info.dto";
import { CollegeInfo } from "./college-info.entity";
import { City } from "../../helper_entities/cities/city.entity";
import { State } from "../../helper_entities/state/state.entity";
import { Country } from "../../helper_entities/country/country.entity";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { CollegeContentDto } from "../college-content/dto/create-college-content.dto";
import { Author } from "../../articles_modules/author/author.entity";
import { CollegeInfoWithCounts } from "./college-info-with-counts.interface";
import { CollegeCutoff } from "../college-cutoff/college_cutoff.entity";
import {
  CollegeGroupedResponseDto,
  CollegeGroupedHighlightsResponseDto,
  CollegeGroupedScholarshipResponseDto,
  CollegeNewsResponseDto,
  CollegeWiseNewsResponseDto,
} from "./dto/college-grouped-response.dto";
import { CollegeSitemapResponseDto } from "./dto/sitemap-response.dto";
import {
  CoursesAndFeesResponseDto,
  CoursesFiltersResponseDto,
} from "./dto/courses-and-fees-response.dto";
import { Stream } from "../../helper_entities/stream/stream.entity";
import { AdmissionProcessDto } from "./dto/admission-process-response.dto";
import { PlacementDto } from "./dto/placement-response.dto";
import { CutOffDto } from "./dto/cutoff-response.dto";
import { RankingDto } from "./dto/ranking-response.dto";
import { InfrastructureDto } from "./dto/infrastructure-response.dto";
import { CollegeListingDto } from "./dto/college-listing.dto";
import { CollegeWiseCourse } from "../college-wise-course/college_wise_course.entity";
import { CollegeWiseFees } from "../college-wise-fees/college-wise-fees.entity";
import { CollegeWisePlacement } from "../college-wise-placement/college-wise-placement.entity";
import { CollegeListingResponseDto } from "./dto/college-listing.dto";
import { StreamListingDto } from "./dto/stream-listing.dto";
import { CityListingDto } from "./dto/city-listing.dto";
import { CollegeRanking } from "../college-ranking/college-ranking.entity";
import { Facilities } from "../facilities/facilities.entity";
import { RankingAgency } from "../ranking-agency/ranking_agency.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
import { FeesDto } from "./dto/fees-response.dto";
import { CollegeExam } from "../college_exam/college_exam.entity";
import { ExamSectionDto } from "./dto/infrastructure-response.dto";
import { CollegeDates } from "../college-dates/college-dates.entity";
import { CollegeContent } from "../college-content/college-content.entity";
import { DataSource } from "typeorm";
import { tryCatchWrapper } from "../../config/application.errorHandeler";
import { mapContentBySilos } from "./college-info.helper";
import { ILike } from "typeorm";

@Injectable()
export class CollegeInfoService {
  private readonly logger = new Logger(CollegeInfoService.name);

  constructor(
    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    private readonly elasticsearchService: ElasticsearchService,
    @InjectRepository(Stream)
    private readonly streamRepository: Repository<Stream>,
    @InjectRepository(CollegeWiseCourse)
    private readonly collegeWiseCourseRepository: Repository<CollegeWiseCourse>,
    @InjectRepository(CollegeWiseFees)
    private readonly collegeWiseFeesRepository: Repository<CollegeWiseFees>,
    @InjectRepository(CollegeWisePlacement)
    private readonly collegeWisePlacementRepository: Repository<CollegeWisePlacement>,
    @InjectRepository(CollegeCutoff)
    private readonly CollegeCutoffRepository: Repository<CollegeCutoff>,
    @InjectRepository(CollegeRanking)
    private readonly collegeRankingRepository: Repository<CollegeRanking>,
    @InjectRepository(Facilities)
    private readonly facilitiesRepository: Repository<Facilities>,
    @InjectRepository(RankingAgency)
    private readonly rankingAgencyRepository: Repository<RankingAgency>,
    @InjectRepository(CollegeDates)
    private readonly collegeDatesRepository: Repository<CollegeDates>,
    @InjectRepository(CourseGroup)
    private readonly courseGroupRepository: Repository<CourseGroup>,
    @InjectRepository(CollegeExam)
    private readonly collegeExamRepository: Repository<CollegeExam>,
    @InjectRepository(CollegeContent)
    private readonly collegeContentRepository: Repository<CollegeContent>,
    private readonly dataSource: DataSource
  ) {}

  // Index College Data in Elasticsearch
  async indexCollegeData(collegeInfo: CollegeInfo) {
    try {
      const result = await this.elasticsearchService.index({
        index: "colleges",
        id: collegeInfo.college_id.toString(),
        document: { ...collegeInfo },
      });
      this.logger.log(`Indexed college data in Elasticsearch: ${result}`);
    } catch (error) {
      this.logger.error("Error indexing college data", error);
    }
  }

  // Search Colleges in Elasticsearch
  async searchColleges(query: string) {
    try {
      const result = await this.elasticsearchService.search({
        index: "colleges",
        query: { match: { college_name: query } },
      });

      this.logger.log(`Search result: ${JSON.stringify(result.hits.hits)}`);
      return result.hits.hits.map((hit) => hit._source);
    } catch (error) {
      this.logger.error("Error searching colleges", error);
      throw new Error("Failed to search colleges");
    }
  }

  private getFeeRangeConditions(
    feeRanges: string[]
  ): { min: number; max?: number }[] {
    const conditions: { min: number; max?: number }[] = [];

    feeRanges.forEach((range) => {
      if (this.feeRanges[range]) {
        conditions.push(this.feeRanges[range]);
      }
    });

    return conditions;
  }

  feeRanges = {
    below50k: {
      min: 0,
      max: 49999,
    },
    "50k150k": {
      min: 50000,
      max: 149999,
    },
    "150k300k": {
      min: 150000,
      max: 299999,
    },
    "300k500k": {
      min: 300000,
      max: 499999,
    },
    above500k: {
      min: 500000,
    },
  };

  async findAll(
    college_name?: string,
    city_name?: string[],
    state_name?: string[],
    // country_id?: number,
    type_of_institute?: string[],
    stream_name?: string[],
    fee_range?: string[],
    is_active?: boolean,
    page: number = 1,
    limit: number = 51000
  ): Promise<CollegeListingResponseDto> {
    const offset = (page - 1) * limit;

    // Helper function to apply common filters
    const applyFilters = (queryBuilder: any) => {
      // Apply subquery filter for active college content
      queryBuilder.where((qb) => {
        const subQuery = qb
          .subQuery()
          .select("1")
          .from("college_content", "cc")
          .where("cc.college_id = collegeInfo.college_id")
          .andWhere("cc.is_active = true")
          .getQuery();
        return `EXISTS (${subQuery})`;
      });

      // Apply parameter-based filters
      if (Array.isArray(city_name) && city_name.length > 0) {
        const normalizedCity = city_name[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        queryBuilder.andWhere(
          `REGEXP_REPLACE(LOWER(city.name), '[^a-z0-9]', '', 'g') ILIKE :city_name`,
          {
            city_name: `%${normalizedCity}%`,
          }
        );
      }

      if (Array.isArray(state_name) && state_name.length > 0) {
        const normalizedState = state_name[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        queryBuilder.andWhere(
          `REGEXP_REPLACE(LOWER(state.name), '[^a-z0-9]', '', 'g') ILIKE :state_name`,
          {
            state_name: `%${normalizedState}%`,
          }
        );
      }

      if (Array.isArray(type_of_institute) && type_of_institute.length > 0) {
        queryBuilder.andWhere(
          `REGEXP_REPLACE(LOWER(CAST(collegeInfo.type_of_institute AS TEXT)), '[^a-z0-9]', '', 'g') = :type_of_institute`,
          {
            type_of_institute: type_of_institute[0]
              .toLowerCase()
              .replace(/[^a-z0-9]/g, ""),
          }
        );
      }

      if (Array.isArray(stream_name) && stream_name.length > 0) {
        const normalizedStream = stream_name[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        queryBuilder.andWhere(
          `REGEXP_REPLACE(LOWER(stream.stream_name), '[^a-z0-9]', '', 'g') ILIKE :stream_name`,
          {
            stream_name: `%${normalizedStream}%`,
          }
        );
      }

      if (college_name) {
        queryBuilder.andWhere("collegeInfo.college_name LIKE :college_name", {
          college_name: `%${college_name}%`,
        });
      }

      // Handle is_active filter
      const activeStatus =
        is_active === undefined || is_active === null ? true : is_active;
      queryBuilder.andWhere("collegeInfo.is_active = :is_active", {
        is_active: activeStatus,
      });

      // Ensure city is active
      queryBuilder.andWhere("city.is_active = :isActive", { isActive: true });

      // fee range filter
      if (Array.isArray(fee_range) && fee_range.length > 0) {
        const feeConditions = this.getFeeRangeConditions(fee_range);

        if (feeConditions.length > 0) {
          // Build the fee filter conditions
          const feeFilterConditions: string[] = [];
          const feeFilterParams: any = {};

          feeConditions.forEach((condition, index) => {
            const paramMin = `feeMin${index}`;
            const paramMax = `feeMax${index}`;

            // console.log({ paramMin, paramMax, condition });

            if (condition.max !== undefined) {
              // Range has both min and max - check if college has ANY course in this range
              feeFilterConditions.push(
                `(cwf.total_min_fees >= :${paramMin} AND cwf.total_min_fees <= :${paramMax})`
              );
              feeFilterParams[paramMin] = condition.min;
              feeFilterParams[paramMax] = condition.max;
            } else {
              // Range has only min (above_500k case) - check if college has ANY course above this amount
              feeFilterConditions.push(`cwf.total_min_fees >= :${paramMin}`);
              feeFilterParams[paramMin] = condition.min;
            }
          });

          // Apply the fee filter using EXISTS with individual row checking (not aggregated)
          const feeSubQuery = `
      EXISTS (
        SELECT 1 
        FROM college_wise_fees cwf 
        WHERE cwf.college_id = collegeInfo.college_id 
          AND cwf.total_min_fees IS NOT NULL
          AND (${feeFilterConditions.join(" OR ")})
      )
    `;

          queryBuilder.andWhere(feeSubQuery, feeFilterParams);
        }
      }

      return queryBuilder;
    };

    // Base query builder with joins and selections
    const baseQueryBuilder = applyFilters(
      this.collegeInfoRepository
        .createQueryBuilder("collegeInfo")
        .leftJoinAndSelect("collegeInfo.city", "city")
        .leftJoinAndSelect("collegeInfo.state", "state")
        .leftJoinAndSelect("collegeInfo.primaryStream", "stream")
        .select([
          "collegeInfo.college_id",
          "collegeInfo.slug",
          "collegeInfo.college_name",
          "collegeInfo.city_id",
          "collegeInfo.state_id",
          "collegeInfo.primary_stream_id",
          "collegeInfo.type_of_institute",
          "collegeInfo.kapp_rating",
          "collegeInfo.parent_college_id",
          "collegeInfo.is_active",
          "collegeInfo.short_name",
          "collegeInfo.nacc_grade",
          "collegeInfo.UGC_approved",
          "collegeInfo.logo_img",
          "collegeInfo.banner_img",
          "city.name",
          "state.name",
          "stream.stream_name",
          "collegeInfo.is_university",
          "collegeInfo.affiliated_university_id",
          "collegeInfo.kapp_score",
          "collegeInfo.college_brochure",
          "city.slug",
          "state.slug",
          "stream.slug",
        ])
    );

    // Create paginated query builder
    const paginatedQueryBuilder = baseQueryBuilder
      .clone()
      .skip(offset)
      .take(limit)
      .orderBy("collegeInfo.kapp_score", "DESC");

    // Get total count and paginated results
    const [totalCollegesCount, colleges] = await Promise.all([
      baseQueryBuilder.getCount(),
      paginatedQueryBuilder.getMany(),
    ]);

    if (!colleges.length) {
      return {
        colleges: [],
        filter_section: {
          city_filter: [],
          state_filter: [],
          stream_filter: [],
          type_of_institute_filter: [],
          specialization_filter: [],
        },
        total_colleges_count: 0,
      };
    }

    // Extract college_ids for batch fetching related data
    const collegeIds = colleges.map((c) => c.college_id);
    const [
      rankingData,
      feeData,
      courseCountData,
      placementData,
      specializationData,
    ] = await Promise.all([
      this.collegeRankingRepository
        .createQueryBuilder("collegeRanking")
        .select("collegeRanking.college_id", "college_id")
        .addSelect("collegeRanking.ranking_agency_id", "ranking_agency_id")
        .addSelect("MAX(collegeRanking.rank)", "rank")
        .addSelect("MAX(collegeRanking.year)", "year")
        .where("collegeRanking.college_id IN (:...collegeIds)", { collegeIds })
        .andWhere("collegeRanking.ranking_agency_id IN (:...agencyIds)", {
          agencyIds: [1, 4, 5],
        })
        .groupBy("collegeRanking.college_id, collegeRanking.ranking_agency_id")
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

      this.collegeWisePlacementRepository
        .createQueryBuilder("placement")
        .select("placement.college_id", "college_id")
        .addSelect("MIN(placement.avg_package)", "min_salary")
        .addSelect("MAX(placement.avg_package)", "max_salary")
        .where("placement.college_id IN (:...collegeIds)", { collegeIds })
        .groupBy("placement.college_id")
        .getRawMany(),

      this.collegeWiseCourseRepository
        .createQueryBuilder("specialization")
        .select("specialization.college_id", "college_id")
        .addSelect("specialization.name", "specialization_name")
        .addSelect(
          "COUNT(specialization.college_wise_course_id)",
          "specialization_count"
        )
        .where("specialization.college_id IN (:...collegeIds)", {
          collegeIds,
        })
        .groupBy("specialization.college_id, specialization.name")
        .getRawMany(),
    ]);

    // Create lookup maps for faster data access
    const rankingMap = new Map<number, any>();
    rankingData.forEach(({ college_id, ranking_agency_id, rank }) => {
      if (!rankingMap.has(college_id)) {
        rankingMap.set(college_id, {});
      }
      rankingMap.get(college_id)[ranking_agency_id] = rank;
    });

    const feeMap = feeData.reduce((map, item) => {
      map[item.college_id] = item;
      return map;
    }, {});

    const courseCountMap = courseCountData.reduce((map, item) => {
      map[item.college_id] = item.course_count;
      return map;
    }, {});

    const placementMap = placementData.reduce((map, item) => {
      map[item.college_id] = item;
      return map;
    }, {});

    // Create specialization map
    const specializationMap = specializationData.reduce((map, item) => {
      const collegeId = item.college_id;
      if (!map[collegeId]) {
        map[collegeId] = {};
      }
      if (!map[collegeId][item.specialization_name]) {
        map[collegeId][item.specialization_name] = {
          name: item.specialization_name,
          count: 0,
        };
      }
      map[collegeId][item.specialization_name].count += parseInt(
        item.specialization_count,
        10
      );
      return map;
    }, {});

    // Helper function to map college data
    const mapCollegeData = (
      college: any,
      includeRelatedData: boolean = true
    ) => {
      const fees = includeRelatedData
        ? feeMap[college.college_id] || {
            min_tuition_fees: null,
            max_tuition_fees: null,
          }
        : { min_tuition_fees: null, max_tuition_fees: null };

      const no_of_courses = includeRelatedData
        ? courseCountMap[college.college_id] || 0
        : 0;

      const placement = includeRelatedData
        ? placementMap[college.college_id] || {
            min_salary: null,
            max_salary: null,
          }
        : { min_salary: null, max_salary: null };

      const rankings = includeRelatedData
        ? rankingMap.get(college.college_id) || {}
        : {};

      return {
        college_id: college.college_id,
        slug: college.slug,
        college_name: college.college_name,
        short_name: college.short_name,
        city_id: college.city_id,
        is_active: college.is_active,
        city_name: college.city ? college.city.name : null,
        state_id: college.state_id,
        state_name: college.state ? college.state.name : null,
        kapp_rating: college.kapp_rating,
        parent_college_id: college.parent_college_id,
        no_of_courses,
        nacc_grade: college.nacc_grade,
        UGC_approved: college.UGC_approved,
        college_logo: college.logo_img,
        banner_img: college.banner_img,
        primary_stream_id: college.primary_stream_id,
        type_of_institute: college.type_of_institute,
        is_university: college.is_university,
        affiliated_university_id: college.affiliated_university_id,
        affiliated_university_name: college.college_name,
        stream_name: college.primaryStream
          ? college.primaryStream.stream_name
          : null,
        min_salary: placement.min_salary,
        max_salary: placement.max_salary,
        min_fees: fees.min_tuition_fees,
        max_fees: fees.max_tuition_fees,
        kapp_score: college.kapp_score,
        city_slug: college.city ? college.city.slug : null,
        state_slug: college.state ? college.state.slug : null,
        stream_slug: college.primaryStream ? college.primaryStream.slug : null,
        college_brochure: college.college_brochure,
        rankings: includeRelatedData
          ? {
              nirf_ranking: rankings[5] || null,
              times_ranking: rankings[4] || null,
              india_today_ranking: rankings[1] || null,
            }
          : {
              nirf_ranking: null,
              times_ranking: null,
              india_today_ranking: null,
            },
      } as CollegeListingDto;
    };

    // Assemble final response with merged data
    const result = colleges.map((college) => mapCollegeData(college, true));

    // Sort the result
    const sortedResult = result.sort((a, b) => b.kapp_score - a.kapp_score);

    // Get all matching colleges for filter section
    const allMatchingColleges = await baseQueryBuilder.getMany();
    const allCollegesForFilter = allMatchingColleges.map((college) =>
      mapCollegeData(college, false)
    );

    const filterSection = this.buildCollegeFilterSection(
      allCollegesForFilter,
      specializationMap
    );

    // After building the filter section, determine the selected description
    let selectedDescription = null;

    // Check in priority order: stream > city > state
    if (stream_name && stream_name.length > 0) {
      // Find the first stream in the filter that has a description
      const selectedStream = await this.streamRepository.findOne({
        where: {
          stream_name: ILike(`%${stream_name[0]}%`),
        },
        select: ["description"],
      });
      if (selectedStream?.description) {
        selectedDescription = selectedStream.description;
      }
    }

    if (!selectedDescription && city_name && city_name.length > 0) {
      // Find the first city in the filter that has a description
      const selectedCity = await this.cityRepository.findOne({
        where: {
          name: ILike(`%${city_name[0]}%`),
        },
        select: ["description"],
      });
      if (selectedCity?.description) {
        selectedDescription = selectedCity.description;
      }
    }

    if (!selectedDescription && state_name && state_name.length > 0) {
      // Find the first state in the filter that has a description
      const selectedState = await this.stateRepository.findOne({
        where: {
          name: ILike(`%${state_name[0]}%`),
        },
        select: ["description"],
      });
      if (selectedState?.description) {
        selectedDescription = selectedState.description;
      }
    }

    return {
      filter_section: filterSection,
      colleges: sortedResult,
      total_colleges_count: totalCollegesCount,
      selected_description: selectedDescription || undefined,
    };
  }

  private buildCollegeFilterSection(
    colleges: CollegeListingDto[],
    specializationMap: any
  ): any {
    const cityMap: {
      [key: string]: {
        city_id: number;
        city_name: string;
        city_slug: string;
        count: number;
      };
    } = {};

    const stateMap: {
      [key: string]: {
        state_id: number;
        state_name: string;
        state_slug: string;
        count: number;
      };
    } = {};

    const streamMap: {
      [key: string]: {
        stream_id: number;
        stream_name: string;
        stream_slug: string;
        count: number;
      };
    } = {};
    const typeOfInstituteMap: { [key: string]: number } = {};

    colleges.forEach((college) => {
      // City filter
      if (college.city_id && college.city_name) {
        const cityKey = college.city_id;
        if (!cityMap[cityKey]) {
          cityMap[cityKey] = {
            city_id: college.city_id,
            city_name: college.city_name,
            city_slug: college.city_slug,
            count: 0,
          };
        }
        cityMap[cityKey].count++;
      }

      // State filter
      if (college.state_id && college.state_name) {
        const stateKey = college.state_id;
        if (!stateMap[stateKey]) {
          stateMap[stateKey] = {
            state_id: college.state_id,
            state_name: college.state_name,
            state_slug: college.state_slug,
            count: 0,
          };
        }
        stateMap[stateKey].count++;
      }

      // Stream filter
      if (college.primary_stream_id && college.stream_name) {
        const streamKey = college.primary_stream_id;
        if (!streamMap[streamKey]) {
          streamMap[streamKey] = {
            stream_id: college.primary_stream_id,
            stream_name: college.stream_name,
            stream_slug: college.stream_slug,
            count: 0,
          };
        }
        streamMap[streamKey].count++;
      }

      // Type of institute filter
      if (college.type_of_institute) {
        typeOfInstituteMap[college.type_of_institute] =
          (typeOfInstituteMap[college.type_of_institute] || 0) + 1;
      }
    });
    const specializationFilter = Object.entries(specializationMap)
      .flatMap(([collegeId, specializations]) =>
        Object.values(specializations).map((specialization) => ({
          name: specialization.name,
          count: specialization.count,
        }))
      )
      .sort((a, b) => b.count - a.count);

    const sortedCityFilter = Object.values(cityMap).sort(
      (a, b) => b.count - a.count
    );

    // Sort state filter by count in descending order
    const sortedStateFilter = Object.values(stateMap).sort(
      (a, b) => b.count - a.count
    );
    // Sort stream filter by count in descending order
    const sortedStreamFilter = Object.values(streamMap).sort(
      (a, b) => b.count - a.count
    );

    // Sort type of institute filter by count in descending order
    const sortedTypeOfInstituteFilter = Object.entries(typeOfInstituteMap)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);

    return {
      city_filter: sortedCityFilter,
      state_filter: sortedStateFilter,
      stream_filter: sortedStreamFilter,
      type_of_institute_filter: sortedTypeOfInstituteFilter,
      specialization_filter: specializationFilter,
    };
  }

  async findByPrimaryStreamLogic(
    college_name?: string,
    city_id?: number,
    state_id?: number,
    country_id?: number,
    primary_stream_id?: number,
    is_active?: boolean,
    page: number = 1,
    limit: number = 51000
  ): Promise<CollegeListingResponseDto> {
    const offset = (page - 1) * limit;

    // Initialize an empty array for filtered college IDs
    let filteredCollegeIds: number[] = [];
    if (primary_stream_id) {
      // Fetch course group IDs based on the primary_stream_id
      const courseGroupIds = await this.courseGroupRepository
        .createQueryBuilder("courseGroup")
        .select("courseGroup.course_group_id")
        .where("courseGroup.stream_id = :primary_stream_id", {
          primary_stream_id,
        })
        .getRawMany();

      const courseGroupIdList = courseGroupIds.map((cg) => cg.course_group_id);

      if (!courseGroupIdList.length) {
        console.warn(
          `No course groups found for stream_id: ${primary_stream_id}`
        );
        return {
          colleges: [],
          filter_section: {
            city_filter: [],
            state_filter: [],
            stream_filter: [],
            type_of_institute_filter: [],
            specialization_filter: [],
          },
          total_colleges_count: 0,
        };
      }

      // Fetch college IDs
      const collegeIds = await this.collegeWiseCourseRepository
        .createQueryBuilder("collegeWiseCourse")
        .select("DISTINCT collegeWiseCourse.college_id", "college_id")
        .where("collegeWiseCourse.course_group_id IN (:...courseGroupIdList)", {
          courseGroupIdList,
        })
        .getRawMany();

      filteredCollegeIds = collegeIds.map((ci) => ci.college_id);

      if (!filteredCollegeIds.length) {
        console.warn("No colleges found for the given course groups.");
        return {
          colleges: [],
          filter_section: {
            city_filter: [],
            state_filter: [],
            stream_filter: [],
            type_of_institute_filter: [],
            specialization_filter: [],
          },
          total_colleges_count: 0,
        };
      }
    }

    // Build the query for fetching college data
    const queryBuilder = this.collegeInfoRepository
      .createQueryBuilder("collegeInfo")
      .leftJoinAndSelect("collegeInfo.city", "city")
      .leftJoinAndSelect("collegeInfo.state", "state")
      .leftJoinAndSelect("collegeInfo.primaryStream", "stream")
      .select([
        "collegeInfo.college_id",
        "collegeInfo.slug",
        "collegeInfo.college_name",
        "collegeInfo.city_id",
        "collegeInfo.state_id",
        "collegeInfo.primary_stream_id",
        "collegeInfo.type_of_institute",
        "collegeInfo.kapp_rating",
        "collegeInfo.parent_college_id",
        "collegeInfo.is_active",
        "collegeInfo.short_name",
        "collegeInfo.nacc_grade",
        "collegeInfo.UGC_approved",
        "collegeInfo.logo_img",
        "collegeInfo.banner_img",
        "city.name",
        "state.name",
        "stream.stream_name",
        "collegeInfo.is_university",
        "collegeInfo.affiliated_university_id",
        "collegeInfo.kapp_score",
        "collegeInfo.college_brochure",
        "city.slug",
        "state.slug",
        "stream.slug",
      ])
      .skip(offset)
      .take(limit)
      .orderBy("collegeInfo.kapp_score", "DESC");

    // Apply filters based on parameters
    if (city_id)
      queryBuilder.andWhere("collegeInfo.city_id = :city_id", { city_id });
    if (state_id)
      queryBuilder.andWhere("collegeInfo.state_id = :state_id", { state_id });
    if (country_id)
      queryBuilder.andWhere("collegeInfo.country_id = :country_id", {
        country_id,
      });

    const activeFilter =
      is_active === undefined || is_active === null ? true : is_active;
    queryBuilder.andWhere("collegeInfo.is_active = :is_active", {
      is_active: activeFilter,
    });

    if (college_name) {
      queryBuilder.andWhere("collegeInfo.college_name LIKE :college_name", {
        college_name: `%${college_name}%`,
      });
    }

    queryBuilder.andWhere("city.is_active = :isActive", { isActive: true });

    // Apply primary_stream_id-specific filter
    if (primary_stream_id) {
      queryBuilder.andWhere(
        "collegeInfo.college_id IN (:...filteredCollegeIds)",
        {
          filteredCollegeIds,
        }
      );
    }

    // Execute the query and process results
    const colleges = await queryBuilder.getMany();
    if (!colleges.length) {
      return {
        colleges: [],
        filter_section: {
          city_filter: [],
          state_filter: [],
          stream_filter: [],
          type_of_institute_filter: [],
          specialization_filter: [],
        },
        total_colleges_count: 0,
      };
    }
    // Extract college_ids for batch fetching related data
    const collegeIds = colleges.map((c) => c.college_id);
    const [
      rankingData,
      feeData,
      courseCountData,
      placementData,
      specializationData,
    ] = await Promise.all([
      this.collegeRankingRepository
        .createQueryBuilder("collegeRanking")
        .select("collegeRanking.college_id", "college_id")
        .addSelect("collegeRanking.ranking_agency_id", "ranking_agency_id")
        .addSelect("MAX(collegeRanking.rank)", "rank")
        .addSelect("MAX(collegeRanking.year)", "year")
        .where("collegeRanking.college_id IN (:...collegeIds)", { collegeIds })
        .andWhere("collegeRanking.ranking_agency_id IN (:...agencyIds)", {
          agencyIds: [1, 4, 5],
        })
        .groupBy("collegeRanking.college_id, collegeRanking.ranking_agency_id")
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

      this.collegeWisePlacementRepository
        .createQueryBuilder("placement")
        .select("placement.college_id", "college_id")
        .addSelect("MIN(placement.avg_package)", "min_salary")
        .addSelect("MAX(placement.avg_package)", "max_salary")
        .where("placement.college_id IN (:...collegeIds)", { collegeIds })
        .groupBy("placement.college_id")
        .getRawMany(),

      this.collegeWiseCourseRepository
        .createQueryBuilder("specialization")
        .select("specialization.college_id", "college_id")
        .addSelect("specialization.name", "specialization_name")
        .addSelect(
          "COUNT(specialization.college_wise_course_id)",
          "specialization_count"
        )
        .where("specialization.college_id IN (:...collegeIds)", {
          collegeIds,
        })
        .groupBy("specialization.college_id, specialization.name")
        .getRawMany(),
    ]);

    // Create lookup maps for faster data access
    const rankingMap = new Map<number, any>();
    rankingData.forEach(({ college_id, ranking_agency_id, rank }) => {
      if (!rankingMap.has(college_id)) {
        rankingMap.set(college_id, {});
      }
      rankingMap.get(college_id)[ranking_agency_id] = rank;
    });

    const feeMap = feeData.reduce((map, item) => {
      map[item.college_id] = item;
      return map;
    }, {});

    const courseCountMap = courseCountData.reduce((map, item) => {
      map[item.college_id] = item.course_count;
      return map;
    }, {});
    const placementMap = placementData.reduce((map, item) => {
      map[item.college_id] = item;
      return map;
    }, {});
    // Create specialization map
    const specializationMap = specializationData.reduce((map, item) => {
      const collegeId = item.college_id;
      if (!map[collegeId]) {
        map[collegeId] = {};
      }
      if (!map[collegeId][item.name]) {
        map[collegeId][item.specialization_name] = {
          name: item.specialization_name,
          count: 0,
        };
      }
      map[collegeId][item.specialization_name].count += parseInt(
        item.specialization_count,
        10
      );
      return map;
    }, {});

    // Assemble final response with merged data
    const result = colleges.map((college) => {
      const fees = feeMap[college.college_id] || {
        min_tuition_fees: null,
        max_tuition_fees: null,
      };
      const no_of_courses = courseCountMap[college.college_id] || 0;
      const placement = placementMap[college.college_id] || {
        min_salary: null,
        max_salary: null,
      };
      const rankings = rankingMap.get(college.college_id) || {};
      return {
        college_id: college.college_id,
        slug: college.slug,
        college_name: college.college_name,
        short_name: college.short_name,
        city_id: college.city_id,
        is_active: college.is_active,
        city_name: college.city ? college.city.name : null,
        state_id: college.state_id,
        state_name: college.state ? college.state.name : null,
        kapp_rating: college.kapp_rating,
        parent_college_id: college.parent_college_id,
        no_of_courses,
        nacc_grade: college.nacc_grade,
        UGC_approved: college.UGC_approved,
        college_logo: college.logo_img,
        banner_img: college.banner_img,
        primary_stream_id: college.primary_stream_id,
        type_of_institute: college.type_of_institute,
        is_university: college.is_university,
        affiliated_university_id: college.affiliated_university_id,
        affiliated_university_name: college.college_name,
        stream_name: college.primaryStream
          ? college.primaryStream.stream_name
          : null,
        min_salary: placement.min_salary,
        max_salary: placement.max_salary,
        min_fees: fees.min_tuition_fees,
        max_fees: fees.max_tuition_fees,
        kapp_score: college.kapp_score,
        city_slug: college.city ? college.city.slug : null,
        state_slug: college.state ? college.state.slug : null,
        stream_slug: college.primaryStream ? college.primaryStream.slug : null,
        college_brochure: college.college_brochure,
        rankings: {
          nirf_ranking: rankings[5] || null,
          times_ranking: rankings[4] || null,
          india_today_ranking: rankings[1] || null,
        },
      } as CollegeListingDto;
    });
    // Build the filter_section
    const sortedResult = result.sort((a, b) => b.kapp_score - a.kapp_score);

    const filterSection = this.buildCollegeFilterSectionStreamColleges(
      sortedResult,
      specializationMap
    );

    return {
      filter_section: filterSection,
      colleges: sortedResult,
      total_colleges_count: colleges.length,
    };
  }

  private buildCollegeFilterSectionStreamColleges(
    colleges: CollegeListingDto[],
    specializationMap: any
  ): any {
    const typeOfInstituteMap: { [key: string]: number } = {};
    const cityCounts: {
      [key: number]: { name: string; slug: string; count: number };
    } = {};
    const stateCounts: {
      [key: number]: { name: string; slug: string; count: number };
    } = {};
    const streamCounts: {
      [key: number]: { name: string; slug: string; count: number };
    } = {};

    colleges.forEach((college) => {
      if (college.city_id) {
        if (!cityCounts[college.city_id]) {
          cityCounts[college.city_id] = {
            name: college.city_name || "Unknown",
            slug: college.city_slug || "unknown",
            count: 0,
          };
        }
        cityCounts[college.city_id].count += 1;
      }

      // State Filter
      if (college.state_id) {
        if (!stateCounts[college.state_id]) {
          stateCounts[college.state_id] = {
            name: college.state_name || "Unknown",
            slug: college.state_slug || "unknown",
            count: 0,
          };
        }
        stateCounts[college.state_id].count += 1;
      }
      // Type of institute filter
      if (college.type_of_institute) {
        typeOfInstituteMap[college.type_of_institute] =
          (typeOfInstituteMap[college.type_of_institute] || 0) + 1;
      }

      //stream filter
      // Stream Filter
      if (college.primary_stream_id) {
        if (!streamCounts[college.primary_stream_id]) {
          streamCounts[college.primary_stream_id] = {
            name: college.stream_name || "Unknown",
            slug: college.stream_slug || "unknown",
            count: 0,
          };
        }
        streamCounts[college.primary_stream_id].count += 1;
      }
    });

    // Specialization Count Map
    const specializationCountMap: { [key: string]: number } = {};

    Object.values(specializationMap).forEach((specializations) => {
      Object.values(specializations).forEach((specialization) => {
        specializationCountMap[specialization.name] =
          (specializationCountMap[specialization.name] || 0) +
          specialization.count;
      });
    });

    const specializationFilter = Object.entries(specializationCountMap)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const cityFilter = Object.entries(cityCounts).map(([cityId, data]) => ({
      city_id: +cityId,
      name: data.name,
      slug: data.slug,
      count: data.count,
    }));

    const stateFilter = Object.entries(stateCounts).map(([stateId, data]) => ({
      state_id: +stateId,
      name: data.name,
      slug: data.slug,
      count: data.count,
    }));

    const streamFilter = Object.entries(streamCounts).map(
      ([streamId, data]) => ({
        stream_id: +streamId,
        name: data.name,
        slug: data.slug,
        count: data.count,
      })
    );

    // Sort type of institute filter by count in descending order
    const sortedTypeOfInstituteFilter = Object.entries(typeOfInstituteMap)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);

    return {
      type_of_institute_filter: sortedTypeOfInstituteFilter,
      specialization_filter: specializationFilter,
      city_filter: cityFilter,
      state_filter: stateFilter,
      stream_filter: streamFilter,
    };
  }

  async findOne(id: number): Promise<CollegeInfoWithCounts> {
    const allowedSilos = [
      "info",
      "highlights",
      "news",
      "admission",
      "cutoff",
      "placement",
      "scholarship",
      "campus",
      "faculty",
      "facilities",
      "other",
    ];

    const collegeInfo = await this.collegeInfoRepository.findOne({
      where: { college_id: id },
      relations: [
        "city",
        "state",
        "country",
        "collegeContents",
        "collegegGallerys",
        "collegeVideos",
        "collegewisefees",
        "collegewisePlacements",
        "collegeScholarships",
        "collegeHostelCampuss",
        "collegeDates",
        "collegeCutoffs",
        "collegeRankings",
        "collegeExams",
        "collegeCourses",
        "faculties",
      ],
    });

    if (!collegeInfo) {
      throw new NotFoundException(`College info with ID ${id} not found`);
    }

    // Map collegeContents to the DTO format with filters for allowed silos and is_active
    const collegeContentDtos: CollegeContentDto[] = await Promise.all(
      collegeInfo.collegeContents
        .filter(
          (content) => content.is_active && allowedSilos.includes(content.silos)
        ) // Filter by is_active and allowed silos
        .map(async (content) => {
          const author = await this.authorRepository.findOne({
            where: { author_id: content.author_id },
          });
          return {
            silos: content.silos,
            title: content.title,
            description: content.description,
            updated_at: content.updated_at,
            is_active: content.is_active,
            seo_param: content.seo_param,
            meta_desc: content.meta_desc,
            author_name: author ? author.view_name : null,
            author_id: author ? author.author_id : null,
            author_img: author ? author.image : null,
          };
        })
    );

    const courseCounts = await this.collegeInfoRepository
      .createQueryBuilder("collegeInfo")
      .innerJoin("collegeInfo.collegeCourses", "collegeWiseCourse")
      .innerJoin("collegeWiseCourse.courses", "course")
      .select("course.course_name", "course_name")
      .addSelect("course.course_id", "course_id")
      .addSelect("COUNT(collegeWiseCourse.course_id)", "count")
      .where("collegeInfo.college_id = :id", { id })
      .groupBy("course.course_id, course.course_name")
      .getRawMany();

    // Return college info along with the filtered and mapped collegeContents and courseCounts
    return {
      ...collegeInfo,
      collegeContents: collegeContentDtos as any,
      courseCounts,
    };
  }

  // Create New College Info in PostgreSQL and Elasticsearch
  async create(
    createCollegeInfoDto: CreateCollegeInfoDto
  ): Promise<CollegeInfo> {
    // Validate location fields before proceeding
    await this.validateLocationFields(createCollegeInfoDto);
    const collegeInfo = this.collegeInfoRepository.create(createCollegeInfoDto);
    let savedCollegeInfo = await this.collegeInfoRepository.save(collegeInfo);
    if (
      savedCollegeInfo.slug &&
      !savedCollegeInfo.slug.includes(`-${savedCollegeInfo.college_id}`)
    ) {
      savedCollegeInfo.slug = savedCollegeInfo.slug.replace("-undefined", "");
      savedCollegeInfo.slug = `${savedCollegeInfo.slug}-${savedCollegeInfo.college_id}`;
      savedCollegeInfo =
        await this.collegeInfoRepository.save(savedCollegeInfo);
    }
    await this.indexCollegeData(savedCollegeInfo);
    return savedCollegeInfo;
  }

  // Update College Info in PostgreSQL and Elasticsearch
  async update(
    id: number,
    updateCollegeInfoDto: UpdateCollegeInfoDto
  ): Promise<CollegeInfo> {
    const collegeInfo = await this.findOne(id);
    await this.validateLocationFields(updateCollegeInfoDto);

    Object.assign(collegeInfo, updateCollegeInfoDto);
    const updatedCollegeInfo =
      await this.collegeInfoRepository.save(collegeInfo);

    // await this.updateElasticsearch(id, updatedCollegeInfo);
    return updatedCollegeInfo;
  }

  // Delete College Info from PostgreSQL and Elasticsearch
  async delete(id: number): Promise<void> {
    const result = await this.collegeInfoRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`College info with ID ${id} not found`);

    await this.deleteFromElasticsearch(id);
  }

  // Validate Location Fields (City, State, Country)
  private async validateLocationFields(
    dto: CreateCollegeInfoDto | UpdateCollegeInfoDto
  ) {
    if (dto.city_id) {
      const cityExists = await this.cityRepository.findOne({
        where: { city_id: dto.city_id },
      });
      if (!cityExists)
        throw new NotFoundException(`City with ID ${dto.city_id} not found`);
    }

    if (dto.state_id) {
      const stateExists = await this.stateRepository.findOne({
        where: { state_id: dto.state_id },
      });
      if (!stateExists)
        throw new NotFoundException(`State with ID ${dto.state_id} not found`);
    }

    if (dto.country_id) {
      const countryExists = await this.countryRepository.findOne({
        where: { country_id: dto.country_id },
      });
      if (!countryExists)
        throw new NotFoundException(
          `Country with ID ${dto.country_id} not found`
        );
    }

    if (dto.primary_stream_id) {
      const streamExists = await this.streamRepository.findOne({
        where: { stream_id: dto.primary_stream_id },
      });
      if (!streamExists)
        throw new NotFoundException(
          `Stream with ID ${dto.primary_stream_id} not found`
        );
    }
  }

  // Update College Info in Elasticsearch
  private async updateElasticsearch(
    id: number,
    updatedCollegeInfo: CollegeInfo
  ) {
    try {
      await this.elasticsearchService.update({
        index: "colleges",
        id: id.toString(),
        doc: { ...updatedCollegeInfo },
      });
      this.logger.log(`Updated college info with ID ${id} in Elasticsearch`);
    } catch (error) {
      if (error.meta.body.error.type === "document_missing_exception") {
        this.logger.warn(`Document with ID ${id} missing, re-indexing...`);
        await this.indexCollegeData(updatedCollegeInfo);
      } else {
        this.logger.error(`Error updating college info with ID ${id}`, error);
      }
    }
  }

  // Delete College Info from Elasticsearch
  private async deleteFromElasticsearch(id: number) {
    try {
      await this.elasticsearchService.delete({
        index: "colleges",
        id: id.toString(),
      });
      this.logger.log(`Deleted college info with ID ${id} from Elasticsearch`);
    } catch (error) {
      this.logger.error(`Error deleting college info with ID ${id}`, error);
    }
  }

  async getPopularCourses(collegeId: number): Promise<any[]> {
    // Query to fetch course details
    const coursesQuery = `WITH fees_data AS (
            SELECT
                fees.course_group_id,
                fees.college_id,
                fees.tution_fees_min_amount,
                fees.tution_fees_max_amount
            FROM college_wise_fees fees
            WHERE fees.college_id = $1
        ),
        placement_data AS (
            SELECT
                placement.college_id,
                MIN(placement.highest_package) AS min_salary,
                MAX(placement.highest_package) AS max_salary
            FROM college_wise_placement placement
            WHERE placement.college_id = $1
            GROUP BY placement.college_id
        )
        SELECT
            courseGroup.name AS course_group_name,
            courseGroup.slug AS course_group_slug,
            courseGroup.course_group_id AS course_group_id,
            courseGroup.full_name AS course_group_full_name,
            MIN(collegeWiseCourse.duration) AS min_duration,
            MAX(collegeWiseCourse.duration) AS max_duration,
            COUNT(DISTINCT collegeWiseCourse.college_wise_course_id) AS count,
            placement_data.min_salary,
            placement_data.max_salary,
            MIN(CASE
                WHEN fees_data.tution_fees_min_amount > 0 THEN fees_data.tution_fees_min_amount
                ELSE NULL
            END) AS min_fees,
            GREATEST(
                MAX(fees_data.tution_fees_min_amount),
                MAX(fees_data.tution_fees_max_amount)
            ) AS max_fees,
            ROUND(AVG(collegeWiseCourse.kapp_rating), 2) AS rating
        FROM
            college_info collegeInfo
        INNER JOIN
            college_wise_course collegeWiseCourse
            ON collegeInfo.college_id = collegeWiseCourse.college_id
        INNER JOIN
            course_group courseGroup
            ON collegeWiseCourse.course_group_id = courseGroup.course_group_id
        LEFT JOIN
            placement_data
            ON collegeInfo.college_id = placement_data.college_id
        LEFT JOIN
            fees_data
            ON courseGroup.course_group_id = fees_data.course_group_id
        WHERE
            collegeInfo.college_id = $1
        GROUP BY
            courseGroup.course_group_id,
            courseGroup.name,
            courseGroup.slug,
            courseGroup.full_name,
            placement_data.min_salary,
            placement_data.max_salary;
    `;

    // Query to fetch exams accepted by the college

    const examsQuery = `
    SELECT 
      college_exam.title, 
      college_exam.exam_id
    FROM 
      college_exam
    INNER JOIN 
      exam 
      ON college_exam.exam_id = exam.exam_id
    WHERE 
      college_exam.college_id = $1
  `;

    // Execute the queries with positional parameters
    const courses = await this.collegeInfoRepository.query(coursesQuery, [
      collegeId,
    ]);
    const exams = await this.collegeInfoRepository.query(examsQuery, [
      collegeId,
    ]);

    // Map the courses and attach exams
    return courses.map((course) => ({
      ...course,
      exam_accepted: exams.map(({ title, exam_id }) => ({ title, exam_id })),
    }));
  }

  async findOneGrouped(
    id: number,
    schema: boolean
  ): Promise<CollegeGroupedResponseDto> {
    try {
      const query = `
        SELECT 
          college_id,
          college_name,
          is_active,
          created_at,
          updated_at,
          short_name,
          search_names,
          parent_college_id,
          city_id,
          state_id,
          country_id,
          location,
          "PIN_code",
          latitude_longitude,
          college_email,
          college_phone,
          college_website,
          type_of_institute,
          affiliated_university_id,
          founded_year,
          logo_img,
          banner_img,
          total_student,
          campus_size,
          "UGC_approved",
          kapp_rating,
          kapp_score,
          primary_stream_id,
          nacc_grade,
          slug,
          girls_only,
          is_university,
          meta_desc,
          is_online,
          college_brochure
        FROM 
          college_info
        WHERE 
          college_id = $1
      `;

      const [collegeResult, contentResult] = await Promise.all([
        this.dataSource.query(query, [id]),
        this.dataSource.query(
          `SELECT * FROM college_content WHERE college_id = $1 AND is_active = true`,
          [id]
        ),
      ]);

      const collegeInfo = collegeResult.length > 0 ? collegeResult[0] : null;

      if (collegeInfo) {
        collegeInfo.collegeContents = contentResult;
      }

      if (!collegeInfo) {
        throw new NotFoundException(`College info with ID ${id} not found`);
      }

      // Create authorMap before using it
      const authorIds = [
        ...new Set(contentResult.map((content) => content.author_id)),
      ];
      const authors = await this.authorRepository.findByIds(authorIds);
      const authorMap = new Map(
        authors.map((author) => [
          author.author_id,
          { view_name: author.view_name || null, image: author.image || null },
        ])
      );

      if (schema) {
        const filteredInfo = contentResult
          .filter((content) => content.silos === "info")
          .slice(0, 1);

        const response: CollegeGroupedResponseDto = {
          college_information: {
            college_id: collegeInfo?.college_id,
            college_name: collegeInfo?.college_name,
            is_active: collegeInfo?.is_active,
            short_name: collegeInfo?.short_name,
            slug: collegeInfo?.slug,
            logo_img: collegeInfo?.logo_img,
          },
          info_section:
            filteredInfo.length > 0
              ? filteredInfo.map((content) => {
                  const author = authorMap.get(content.author_id) || {
                    view_name: "KollegeApply", // Default author name
                    image: null,
                  };
                  return {
                    title: content?.title,
                    seo_param: content?.seo_param,
                    meta_desc: content?.meta_desc,
                    silos: content?.silos,
                    author_name: author?.view_name,
                    author_image: author?.image,
                    author_id: content?.author_id,
                  };
                })
              : null,
        };
        return response;
      }

      const [
        courseCount,
        collegeContents,
        city,
        state,
        country,
        popularCourses,
        examSection,
      ] = await Promise.all([
        this.collegeWiseCourseRepository.count({ where: { college_id: id } }),
        this.collegeContentRepository.query(
          `
          SELECT 
            college_content_id,
            silos,
            title,
            seo_param,
            description,
            updated_at,
            meta_desc,
            author_id
          FROM 
            college_content
          WHERE 
            college_id = $1 AND is_active = true
          ORDER BY updated_at DESC
        `,
          [id]
        ),
        this.cityRepository.findOne({
          where: { city_id: collegeInfo.city_id },
        }),
        this.stateRepository.findOne({
          where: { state_id: collegeInfo.state_id },
        }),
        this.countryRepository.findOne({
          where: { country_id: collegeInfo.country_id },
        }),
        this.getPopularCourses(collegeInfo.college_id),
        this.getExamSection(id),
      ]);

      const groupContentsBySilos = (silos: string) => {
        return collegeContents
          .filter((content) => content.silos === silos)
          .sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
          .map((content) => {
            const author = authorMap.get(content.author_id) || {
              view_name: null,
              image: null,
            };
            return {
              id: content?.college_content_id,
              silos: content?.silos,
              title: content?.title,
              description: content?.description,
              seo_param: content?.seo_param,
              updated_at: content?.updated_at,
              is_active: true,
              author_name: author?.view_name,
              author_image: author?.image,
              author_id: content?.author_id,
              meta_desc: content?.meta_desc,
            };
          });
      };

      const dynamicFields = await this.generateDynamicFields(
        collegeInfo.collegeContents,
        collegeInfo.slug,
        collegeInfo.college_id
      );
      if (collegeInfo && collegeInfo.collegeContents) {
        delete collegeInfo.collegeContents;
      }

      // Collge info
      let collegeInfoSection = groupContentsBySilos("info")[0];

      if (!collegeInfoSection) {
        // Get the info from templized table if active.
        const templizedInfo = await this.dataSource.query(
          "SELECT * FROM templatization_college_content WHERE college_id = $1 AND silos = 'info' AND is_active = TRUE;",
          [id]
        );
        if (templizedInfo && templizedInfo.length) {
          collegeInfoSection = templizedInfo[0];
        }
      }

      const response: CollegeGroupedResponseDto = {
        college_information: {
          ...collegeInfo,
          city: city?.name || null,
          state: state?.name || null,
          country: country?.name || null,
          course_count: courseCount,
          ...dynamicFields,
          college_brochure: collegeInfo.college_brochure,
        },
        news_section: groupContentsBySilos("news"),
        info_section: [collegeInfoSection || null],
        popular_courses: popularCourses,
        exam_section: examSection,
      };

      return response;
    } catch (err) {
      console.log(err);
    }
  }

  async findOneGroupedHighlights(id: number, schema: boolean) {
    return tryCatchWrapper(async () => {
      // Return If Active Info article is absent.
      await this.checkCollegeInfoActivity(id);

      const query = `
      SELECT 
        college_id,
        college_name,
        is_active,
        created_at,
        updated_at,
        short_name,
        search_names,
        parent_college_id,
        city_id,
        state_id,
        country_id,
        location,
        "PIN_code",
        latitude_longitude,
        college_email,
        college_phone,
        college_website,
        type_of_institute,
        affiliated_university_id,
        founded_year,
        logo_img,
        banner_img,
        total_student,
        campus_size,
        "UGC_approved",
        kapp_rating,
        kapp_score,
        primary_stream_id,
        nacc_grade,
        slug,
        girls_only,
        is_university,
        meta_desc,
        is_online,
        college_brochure
      FROM 
        college_info
      WHERE 
        college_id = $1
    `;

      const [collegeResult, contentResult] = await Promise.all([
        this.dataSource.query(query, [id]),
        this.dataSource.query(
          `SELECT * FROM college_content WHERE college_id = $1 AND is_active = true`,
          [id]
        ),
      ]);

      const collegeInfo = collegeResult.length > 0 ? collegeResult[0] : null;

      if (collegeInfo) {
        collegeInfo.collegeContents = contentResult;
      }

      if (!collegeInfo) {
        throw new NotFoundException(`College info with ID ${id} not found`);
      }

      const [
        courseCount,
        collegeContents,
        collegeRankings,
        cityStateCountry,
        examSection,
      ] = await Promise.all([
        this.collegeWiseCourseRepository.count({ where: { college_id: id } }),
        this.collegeContentRepository.query(
          `
        SELECT 
          college_content_id,
          silos,
          title,
          seo_param,
          description,
          updated_at,
          meta_desc,
          author_id
        FROM 
          college_content
        WHERE 
          college_id = $1 AND is_active = true
          ORDER BY updated_at DESC
        `,
          [id]
        ),
        this.collegeRankingRepository.find({ where: { college_id: id } }),
        this.cityRepository.query(
          `
        SELECT 
          c.city_id, c.name AS city_name,
          s.state_id, s.name AS state_name,
          co.country_id, co.name AS country_name
        FROM 
          city c
        JOIN 
          state s ON c.state_id = s.state_id
        JOIN 
          country co ON s.country_id = co.country_id
        WHERE 
          c.city_id = $1
        `,
          [collegeInfo.city_id]
        ),
        this.getExamSection(id),
      ]);

      const authorIds = collegeInfo.collegeContents.map(
        (content) => content.author_id
      );
      const authors = await this.authorRepository.findByIds(authorIds);
      const authorMap = new Map(
        authors.map((author) => [author.author_id, author])
      );

      if (schema) {
        // **Return only essential details when `schema` is true**
        const filteredHighlight = contentResult
          .filter((content) => content.silos === "highlights")
          .slice(0, 1); // Get only the first highlight

        const response: CollegeGroupedHighlightsResponseDto = {
          college_information: {
            college_id: collegeInfo.college_id,
            college_name: collegeInfo.college_name,
            is_active: collegeInfo.is_active,
            short_name: collegeInfo.short_name,
            slug: collegeInfo.slug,
            logo_img: collegeInfo.logo_img,
          },
          highlight_section:
            filteredHighlight.length > 0
              ? filteredHighlight.map((content) => {
                  const author = authorMap.get(content.author_id) || {
                    view_name: "KollegeApply", // Default author name
                    image: null,
                  };

                  return {
                    title: content.title,
                    seo_param: content.seo_param,
                    meta_desc: content.meta_desc,
                    silos: content.silos,
                    author_name: author.view_name,
                    author_image: author.image,
                    author_id: content.author_id,
                  };
                })
              : null, // Return null if no highlight exists
        };
        return response;
      }

      const { city_name, state_name, country_name } = cityStateCountry[0];

      const groupContentsBySilos = (silos: string) => {
        return collegeContents
          .filter((content) => content.silos === silos)
          .sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
          .map((content) => {
            const author = authorMap.get(content.author_id) || {
              view_name: null,
              image: null,
            };
            return {
              id: content.college_content_id,
              silos: content.silos,
              title: content.title,
              description: content.description,
              seo_param: content.seo_param,
              updated_at: content.updated_at,
              is_active: true,
              author_name: author.view_name,
              author_image: author.image,
              author_id: content.author_id,
              meta_desc: content.meta_desc,
            };
          });
      };

      let news = mapContentBySilos(
        collegeInfo.collegeContents,
        "news",
        authorMap
      );
      news = this.getLatestUpdatedObjects(news);

      const dynamicFields = await this.generateDynamicFields(
        collegeInfo.collegeContents,
        collegeInfo.slug,
        collegeInfo.college_id
      );
      if (collegeInfo && collegeInfo.collegeContents) {
        delete collegeInfo.collegeContents;
      }
      const response: CollegeGroupedHighlightsResponseDto = {
        college_information: {
          ...collegeInfo,
          city: city_name || null,
          state: state_name || null,
          country: country_name || null,
          course_count: courseCount,
          college_brochure: collegeInfo.college_brochure,
          ...dynamicFields,
        },
        news_section: news,
        highlight_section: [groupContentsBySilos("highlights")[0] || null],
        exam_section: examSection,
      };

      return response;
    });
  }

  async findOneGroupedScholarship(id: number, schema: boolean) {
    return tryCatchWrapper(async () => {
      // Return If Active Info article is absent.
      await this.checkCollegeInfoActivity(id);

      const query = `
      SELECT 
        college_id,
        college_name,
        is_active,
        created_at,
        updated_at,
        short_name,
        search_names,
        parent_college_id,
        city_id,
        state_id,
        country_id,
        location,
        "PIN_code",
        latitude_longitude,
        college_email,
        college_phone,
        college_website,
        type_of_institute,
        affiliated_university_id,
        founded_year,
        logo_img,
        banner_img,
        total_student,
        campus_size,
        "UGC_approved",
        kapp_rating,
        kapp_score,
        primary_stream_id,
        nacc_grade,
        slug,
        girls_only,
        is_university,
        meta_desc,
        is_online,
        college_brochure
      FROM 
        college_info
      WHERE 
        college_id = $1
    `;

      const [collegeResult, contentResult] = await Promise.all([
        this.dataSource.query(query, [id]),
        this.dataSource.query(
          `SELECT * FROM college_content WHERE college_id = $1 AND is_active = true Order by updated_at DESC`,
          [id]
        ),
      ]);

      const collegeInfo = collegeResult.length > 0 ? collegeResult[0] : null;

      if (collegeInfo) {
        collegeInfo.collegeContents = contentResult; // Assuming you want to add the content data here
      }

      if (!collegeInfo) {
        throw new NotFoundException(`College info with ID ${id} not found`);
      }

      const [
        courseCount,
        collegeContents,
        cityResult,
        stateResult,
        countryResult,
        examSection,
      ] = await Promise.all([
        this.collegeWiseCourseRepository.count({ where: { college_id: id } }),
        this.collegeContentRepository.query(
          `
        SELECT 
          college_content_id,
          silos,
          title,
          seo_param,
          description,
          updated_at,
          meta_desc,
          author_id
        FROM 
          college_content
        WHERE 
          college_id = $1 AND is_active = true
        `,
          [id]
        ),
        this.cityRepository.findOne({
          where: { city_id: collegeInfo.city_id },
        }),
        this.stateRepository.findOne({
          where: { state_id: collegeInfo.state_id },
        }),
        this.countryRepository.findOne({
          where: { country_id: collegeInfo.country_id },
        }),
        this.getExamSection(id),
      ]);

      const city_name = cityResult ? cityResult.name : null;
      const state_name = stateResult ? stateResult.name : null;
      const country_name = countryResult ? countryResult.name : null;
      const authorIds = collegeInfo.collegeContents.map(
        (content) => content.author_id
      );
      const authors = await this.authorRepository.findByIds(authorIds);
      const authorMap = new Map(
        authors.map((author) => [author.author_id, author])
      );

      if (schema) {
        const filteredScholarship = this.getLatestUpdatedObjects(
          collegeContents.filter((content) => content.silos === "scholarship")
        );

        const response: CollegeGroupedScholarshipResponseDto = {
          college_information: {
            college_id: collegeInfo.college_id,
            college_name: collegeInfo.college_name,
            is_active: collegeInfo.is_active,
            short_name: collegeInfo.short_name,
            slug: collegeInfo.slug,
            logo_img: collegeInfo.logo_img,
          },

          scholarship_section:
            filteredScholarship.length > 0
              ? filteredScholarship.map((content) => {
                  const author = authorMap.get(content.author_id) || {
                    view_name: "KollegeApply", // Default author name
                    image: null,
                  };

                  return {
                    title: content.title,
                    seo_param: content.seo_param,
                    meta_desc: content.meta_desc,
                    silos: content.silos,
                    author_name: author.view_name,
                    author_image: author.image,
                    author_id: content.author_id,
                  };
                })
              : null,
        };
        return response;
      }

      const groupContentsBySilos = (silos: string) => {
        return collegeContents
          .filter((content) => content.silos === silos)
          .sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
          .map((content) => {
            const author = authorMap.get(content.author_id) || {
              view_name: null,
              image: null,
            };
            return {
              id: content.college_content_id,
              silos: content.silos,
              title: content.title,
              description: content.description,
              seo_param: content.seo_param,
              updated_at: content.updated_at,
              is_active: true,
              author_name: author.view_name,
              author_image: author.image,
              author_id: content.author_id,
              meta_desc: content.meta_desc,
            };
          });
      };

      const dynamicFields = await this.generateDynamicFields(
        collegeInfo.collegeContents,
        collegeInfo.slug,
        collegeInfo.college_id
      );
      let news = mapContentBySilos(
        collegeInfo.collegeContents,
        "news",
        authorMap
      );
      news = this.getLatestUpdatedObjects(news);

      if (collegeInfo && collegeInfo.collegeContents) {
        delete collegeInfo.collegeContents;
      }
      const response: CollegeGroupedScholarshipResponseDto = {
        college_information: {
          ...collegeInfo,
          city: city_name || null,
          state: state_name || null,
          country: country_name || null,
          course_count: courseCount,
          ...dynamicFields,
          college_brochure: collegeInfo.college_brochure,
        },
        news_section: news,
        scholarship_section: [groupContentsBySilos("scholarship")[0] || null],
        exam_section: examSection,
      };

      return response;
    });
  }

  private async generateDynamicFields(
    contents: any[],
    slug: string,
    collegeId: number
  ) {
    if (!contents) {
      console.error("Invalid collegeContents:", contents);
      return {};
    }

    const baseUrl = `https://www.kollegeapply.com/colleges/${slug}`;
    const silosMapping = {
      info: `${baseUrl}`,
      highlights: `${baseUrl}/highlights`,
      courses: `${baseUrl}/courses`,
      fees: `${baseUrl}/fees`,
      admission: `${baseUrl}/admission-process`,
      cutoff: `${baseUrl}/cutoff`,
      placement: `${baseUrl}/placement`,
      ranking: `${baseUrl}/ranking`,
      scholarship: `${baseUrl}/scholarship`,
      facilities: `${baseUrl}/facilities`,
      faq: `${baseUrl}/faq`,
      news: `${baseUrl}/news`,
    };

    // Initialize all fields as false
    const fields = Object.keys(silosMapping).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});

    // Update fields based on active contents
    contents
      .filter((content) => content.is_active && silosMapping[content.silos])
      .forEach((content) => {
        fields[content.silos] = true;
      });
    // Fetch additional fields in parallel
    const [
      collegeWiseCourseCount,
      collegeWisePlacementCount,
      collegeWiseFeesCount,
      collegeRankingCount,
      collegeDatesCount,
      collegeCutoffCount,
    ] = await Promise.all([
      this.collegeWiseCourseRepository.count({
        where: { college_id: collegeId },
      }),
      this.collegeWisePlacementRepository.count({
        where: { college_id: collegeId },
      }),
      this.collegeWiseFeesRepository.count({
        where: { college_id: collegeId },
      }),
      this.collegeRankingRepository.count({ where: { college_id: collegeId } }),
      this.collegeDatesRepository.count({ where: { college_id: collegeId } }),
      this.CollegeCutoffRepository.count({ where: { college_id: collegeId } }),
    ]);
    // Standardize additional fields
    const additionalFields = {
      college_wise_course_present: collegeWiseCourseCount > 0,
      college_wise_placement_present: collegeWisePlacementCount > 0,
      college_wise_fees_present: collegeWiseFeesCount > 0,
      college_ranking_present: collegeRankingCount > 0,
      college_dates_present: collegeDatesCount > 0,
      college_cutoff_present: collegeCutoffCount > 0,
    };

    // Return consistent output
    return {
      dynamic_fields: fields,
      additional_fields: additionalFields,
    };
  }

  // End fixation
  async getFaqData(id: number, schema: boolean) {
    return tryCatchWrapper(async () => {
      // Return If Active Info article is absent.
      await this.checkCollegeInfoActivity(id);

      const collegeFaqData = await this.collegeInfoRepository.findOne({
        where: { college_id: id },
        relations: ["collegeContents"],
      });

      if (!collegeFaqData) {
        throw new NotFoundException(`college with ID ${id} not found`);
      }

      const courseCount = await this.collegeWiseCourseRepository.count({
        where: { college_id: id },
      });
      const dynamicFields = await this.generateDynamicFields(
        collegeFaqData.collegeContents,
        collegeFaqData.slug,
        collegeFaqData.college_id
      );

      const authorIds = collegeFaqData.collegeContents.map(
        (content) => content.author_id
      );
      const authors = await this.authorRepository.findByIds(authorIds);
      const authorMap = new Map(
        authors.map((author) => [author.author_id, author])
      );

      // Using the function for different silos:
      let faqData = await mapContentBySilos(
        collegeFaqData.collegeContents,
        "faq",
        authorMap
      );
      faqData = this.getLatestUpdatedObjects(faqData);
      let news_section = await mapContentBySilos(
        collegeFaqData.collegeContents,
        "news",
        authorMap
      );
      news_section = this.getLatestUpdatedObjects(news_section);

      // Fetch city and state names
      let cityName = null;
      let stateName = null;
      if (collegeFaqData.city_id) {
        const cityRow = await this.cityRepository.findOne({
          where: { city_id: collegeFaqData.city_id },
        });
        cityName = cityRow?.name || null;
      }
      if (collegeFaqData.state_id) {
        const stateRow = await this.stateRepository.findOne({
          where: { state_id: collegeFaqData.state_id },
        });
        stateName = stateRow?.name || null;
      }

      return {
        college_information: {
          college_id: collegeFaqData.college_id,
          created_at: collegeFaqData.created_at,
          updated_at: collegeFaqData.updated_at,
          is_active: collegeFaqData.is_active,
          college_name: collegeFaqData.college_name,
          short_name: collegeFaqData.short_name,
          search_names: collegeFaqData.search_names,
          parent_college_id: collegeFaqData.parent_college_id,
          city_id: collegeFaqData.city_id,
          state_id: collegeFaqData.state_id,
          country_id: collegeFaqData.country_id,
          city: cityName,
          state: stateName,
          country: collegeFaqData.country?.name || null,
          location: collegeFaqData.location,
          PIN_code: collegeFaqData.PIN_code,
          latitude_longitude: collegeFaqData.latitude_longitude,
          college_email: collegeFaqData.college_email,
          college_phone: collegeFaqData.college_phone,
          college_website: collegeFaqData.college_website,
          type_of_institute: collegeFaqData.type_of_institute,
          affiliated_university_id: collegeFaqData.affiliated_university_id,
          founded_year: collegeFaqData.founded_year,
          logo_img: collegeFaqData.logo_img,
          banner_img: collegeFaqData.banner_img,
          total_student: collegeFaqData.total_student,
          campus_size: collegeFaqData.campus_size,
          UGC_approved: collegeFaqData.UGC_approved,
          kapp_rating: collegeFaqData.kapp_rating,
          kapp_score: collegeFaqData.kapp_score,
          primary_stream_id: collegeFaqData.primary_stream_id || null,
          nacc_grade: collegeFaqData.nacc_grade,
          slug: collegeFaqData.slug,
          girls_only: collegeFaqData.girls_only,
          is_university: collegeFaqData.is_university,
          course_count: courseCount,
          meta_desc: collegeFaqData.meta_desc,
          is_online: collegeFaqData.is_online,
          college_brochure: collegeFaqData.college_brochure,
          ...dynamicFields,
        },
        news_section,
        faqData,
      };
    });
  }

  // For fees
  async getFees(id: number, schema: boolean) {
    return tryCatchWrapper(async () => {
      // Return If Active Info article is absent.
      await this.checkCollegeInfoActivity(id);

      const [collegeInfo, authors, feesWithGroup, examSection, courseCount] =
        await Promise.all([
          this.collegeInfoRepository.findOne({
            where: { college_id: id },
            relations: ["collegeContents", "collegewisefees"],
          }),
          this.authorRepository.find(),
          this.collegeWiseFeesRepository
            .createQueryBuilder("fees")
            .innerJoinAndSelect("fees.courseGroup", "courseGroup")
            .where("fees.college_id = :collegeId", { collegeId: id })
            .select([
              "fees.collegewise_fees_id AS fee_id",
              "fees.quota AS fee_type",
              "fees.total_min_fees AS total_min_fees",
              "fees.total_max_fees AS total_max_fees",
              "fees.tution_fees_description AS description",
              "fees.tution_fees_min_amount AS total_tution_fees_min",
              "fees.tution_fees_max_amount AS total_tution_fees_max",
              "fees.min_one_time_fees AS min_one_time_fees",
              "fees.max_one_time_fees AS max_one_time_fees",
              "fees.min_hostel_fees AS min_hostel_fees",
              "fees.max_hostel_fees AS max_hostel_fees",
              "fees.max_other_fees AS max_other_fees",
              "fees.min_other_fees AS min_other_fees",
              "fees.duration AS duration",
              "fees.kapp_score AS kapp_score",
              "courseGroup.course_group_id AS course_group_id",
              "courseGroup.name AS course_group_name",
              "courseGroup.full_name AS course_group_full_name",
            ])
            .orderBy("fees.updated_at", "DESC")
            .getRawMany(),
          this.getExamSection(id),
          this.collegeWiseCourseRepository.count({
            where: { college_id: id },
          }),
        ]);

      if (!collegeInfo) {
        throw new NotFoundException(`College info with ID ${id} not found`);
      }

      const authorsMap = new Map(
        authors.map((author) => [
          author.author_id,
          { view_name: author.view_name || null, image: author.image || null },
        ])
      );

      const processedContent = collegeInfo.collegeContents
        .filter((content) => content.is_active)
        .map((content) => {
          const author = authorsMap.get(content.author_id) || {
            view_name: null,
            image: null,
          };
          return {
            id: content.college_content_id,
            silos: content.silos,
            title: content.title,
            description: content.description,
            seo_param: content.seo_param,
            updated_at: content.updated_at,
            is_active: content.is_active,
            author_name: author.view_name,
            author_image: author.image,
            author_id: content.author_id,
            meta_desc: content.meta_desc,
          };
        });

      const newsContent = this.getLatestUpdatedObjects(
        processedContent.filter((content) => content.silos === "news")
      );
      const feesContent = this.getLatestUpdatedObjects(
        processedContent.filter((content) => content.silos === "fees")
      );

      if (schema) {
        const filteredFees = feesContent
          .filter((content) => content.silos === "fees")
          .slice(0, 1);

        const response: FeesDto = {
          college_information: {
            college_id: collegeInfo.college_id,
            college_name: collegeInfo.college_name,
            is_active: collegeInfo.is_active,
            short_name: collegeInfo.short_name,
            slug: collegeInfo.slug,
            logo_img: collegeInfo.logo_img,
          },
          fees_section: {
            content:
              filteredFees.length > 0
                ? filteredFees.map((content) => ({
                    title: content.title,
                    silos: content.silos,
                    meta_desc: content.meta_desc,
                    author_name: content.author_name,
                    author_image: content.author_image,
                    author_id: content.author_id,
                  }))
                : null,
          },
        };

        return response;
      }

      const dynamicFields = await this.generateDynamicFields(
        collegeInfo.collegeContents,
        collegeInfo.slug,
        collegeInfo.college_id
      );

      const fees = feesWithGroup.map((fee) => ({
        fee_id: fee.fee_id,
        fee_type: fee.fee_type,
        total_min_fees: fee.total_min_fees,
        total_max_fees: fee.total_max_fees,
        description: fee.description,
        total_tution_fees_min: fee.total_tution_fees_min,
        total_tution_fees_max: fee.total_tution_fees_max,
        min_one_time_fees: fee.min_one_time_fees,
        max_one_time_fees: fee.max_one_time_fees,
        max_hostel_fees: fee.max_hostel_fees,
        min_hostel_fees: fee.min_hostel_fees,
        min_other_fees: fee.min_other_fees,
        max_other_fees: fee.max_other_fees,
        duration: fee.duration,
        kapp_score: fee.kapp_score,
        course_group_id: fee.course_group_id,
        course_group_name: fee.course_group_name,
        course_group_full_name: fee.course_group_full_name,
      }));

      // Fetch city and state names
      let cityName = null;
      let stateName = null;
      if (collegeInfo.city_id) {
        const cityRow = await this.cityRepository.findOne({
          where: { city_id: collegeInfo.city_id },
        });
        cityName = cityRow?.name || null;
      }
      if (collegeInfo.state_id) {
        const stateRow = await this.stateRepository.findOne({
          where: { state_id: collegeInfo.state_id },
        });
        stateName = stateRow?.name || null;
      }

      return {
        college_information: {
          college_id: collegeInfo.college_id,
          created_at: collegeInfo.created_at,
          updated_at: collegeInfo.updated_at,
          is_active: collegeInfo.is_active,
          college_name: collegeInfo.college_name,
          short_name: collegeInfo.short_name,
          search_names: collegeInfo.search_names,
          parent_college_id: collegeInfo.parent_college_id,
          city_id: collegeInfo.city_id,
          state_id: collegeInfo.state_id,
          country_id: collegeInfo.country_id,
          location: collegeInfo.location,
          PIN_code: collegeInfo.PIN_code,
          latitude_longitude: collegeInfo.latitude_longitude,
          college_email: collegeInfo.college_email,
          college_phone: collegeInfo.college_phone,
          college_website: collegeInfo.college_website,
          type_of_institute: collegeInfo.type_of_institute,
          affiliated_university_id: collegeInfo.affiliated_university_id,
          founded_year: collegeInfo.founded_year,
          logo_img: collegeInfo.logo_img,
          banner_img: collegeInfo.banner_img,
          total_student: collegeInfo.total_student,
          campus_size: collegeInfo.campus_size,
          UGC_approved: collegeInfo.UGC_approved,
          kapp_rating: collegeInfo.kapp_rating,
          kapp_score: collegeInfo.kapp_score,
          city: cityName,
          state: stateName,
          country: collegeInfo.country?.name || null,
          nacc_grade: collegeInfo.nacc_grade,
          slug: collegeInfo.slug,
          girls_only: collegeInfo.girls_only,
          is_university: collegeInfo.is_university,
          primary_stream: collegeInfo.primary_stream_id,
          course_count: courseCount,
          meta_desc: collegeInfo.meta_desc,
          is_online: collegeInfo.is_online,
          college_brochure: collegeInfo.college_brochure,
          ...dynamicFields,
        },
        news_section: newsContent,
        exam_section: examSection,
        fees_section: {
          content: feesContent,
          fees: fees,
        },
      };
    });
  }

  //Optimisation 22 jan
  async getCoursesAndFees(id: number, schema: boolean) {
    return tryCatchWrapper(async () => {
      // Return If Active Info article is absent.
      await this.checkCollegeInfoActivity(id);

      const [
        collegeInfo,
        collegeContents,
        authors,
        courseGroups,
        allCourses,
        collegeDates,
      ] = await Promise.all([
        this.dataSource.query(
          `SELECT * FROM college_info WHERE college_id = $1 LIMIT 1`,
          [id]
        ),
        this.dataSource.query(
          `SELECT * FROM college_content WHERE college_id = $1 AND is_active = true ORDER BY updated_at DESC`,
          [id]
        ),
        this.dataSource.query(
          `SELECT author_id, view_name, image FROM author WHERE author_id = ANY(
            SELECT DISTINCT author_id FROM college_content WHERE college_id = $1 AND is_active = true
          )`,
          [id]
        ),
        this.dataSource.query(
          `
            SELECT
              cg.course_group_id, cg.name AS course_group_name, cg.slug, cg.full_name AS course_group_full_name,
              cg.level, MIN(cwc.duration) AS min_duration, MAX(cwc.duration) AS max_duration,
              MIN(placement.highest_package) AS min_salary, MAX(placement.highest_package) AS max_salary,
              MAX(cg.duration_in_months) AS duration_in_months, MAX(cg.stream_id) AS stream_id, s.stream_name,
              MAX(cg.kapp_score) AS kapp_score, MIN(f.tution_fees_min_amount) AS min_fees,
              GREATEST(MAX(CASE WHEN f.tution_fees_min_amount > 0 THEN f.tution_fees_min_amount ELSE NULL END),
              MAX(CASE WHEN f.tution_fees_max_amount > 0 THEN f.tution_fees_max_amount ELSE NULL END)) AS max_fees,
              MAX(cwc.course_format) AS mode
            FROM college_wise_course cwc
            INNER JOIN course_group cg ON cwc.course_group_id = cg.course_group_id
            LEFT JOIN college_wise_fees f ON f.course_group_id = cg.course_group_id AND f.college_id = $1
            LEFT JOIN college_wise_placement placement ON placement.college_id = $1
            LEFT JOIN stream s ON cg.stream_id = s.stream_id
            WHERE cwc.college_id = $1
            GROUP BY cg.course_group_id, cg.name, cg.slug, cg.full_name, cg.level, s.stream_id
            ORDER BY kapp_score DESC
          `,
          [id]
        ),
        this.dataSource.query(
          `
            SELECT cwc.name AS course_name, cwc.course_group_id, cwc.is_online, cwc.duration_type, cwc.is_active,
            cwc.is_integrated_course, cwc.college_wise_course_id, cwc.degree_type, cwc.total_seats AS seats_offered,
            ARRAY_AGG(cwc.course_brochure) AS course_brochure, MIN(cwc.duration) AS duration,
            MAX(cwc.kapp_score) AS kapp_score, MAX(cwc.kapp_rating) AS kapp_rating, MAX(cwc.fees) AS direct_fees,
            MAX(cwc.salary) AS direct_salary
            FROM college_wise_course cwc
            WHERE cwc.college_id = $1 and cwc.is_active=true
            GROUP BY cwc.name, cwc.course_group_id, cwc.college_wise_course_id, cwc.is_online, cwc.duration_type,
            cwc.is_integrated_course, cwc.degree_type, cwc.total_seats
            ORDER BY MAX(cwc.kapp_score) DESC
          `,
          [id]
        ),
        this.dataSource.query(
          `SELECT start_date, end_date, event, description FROM college_dates WHERE college_id = $1`,
          [id]
        ),
      ]);

      // Fetch city and state names
      let cityName = null;
      let stateName = null;
      if (collegeInfo.length) {
        const cityRow = await this.cityRepository.findOne({
          where: { city_id: collegeInfo[0].city_id },
        });
        const stateRow = await this.stateRepository.findOne({
          where: { state_id: collegeInfo[0].state_id },
        });
        cityName = cityRow?.name || null;
        stateName = stateRow?.name || null;
      }

      if (!collegeInfo.length) {
        throw new NotFoundException(`College info with ID ${id} not found`);
      }

      const college = collegeInfo[0];
      const courseCount = await this.collegeWiseCourseRepository.count({
        where: { college_id: id },
      });
      const examSection = await this.getExamSection(id);
      const authorsMap = new Map<
        number,
        { view_name: string | null; image: string | null }
      >(
        authors.map((author: Author) => [
          author.author_id,
          { view_name: author.view_name ?? null, image: author.image ?? null },
        ])
      );

      const processedContents = collegeContents.map((content: any) => {
        const author = authorsMap.get(content.author_id) || {
          view_name: null,
          image: null,
        };
        return {
          id: content.college_content_id,
          silos: content.silos,
          title: content.title,
          description: content.description,
          updated_at: content.updated_at,
          is_active: content.is_active,
          author_name: author.view_name,
          author_image: author.image,
          author_id: content.author_id,
          meta_desc: content.meta_desc,
          seo_param: content.seo_param,
        };
      });

      const groupedCourses = courseGroups.map((group) => ({
        ...group,
        courses: allCourses.filter(
          (course) => course.course_group_id === group.course_group_id
        ),
        course_count: allCourses.filter(
          (course) => course.course_group_id === group.course_group_id
        ).length,
      }));

      if (schema) {
        // Select only the first document from collegeContents that belongs to "courses" silos
        const filteredCourses = this.getLatestUpdatedObjects(
          collegeContents.filter((content) => content.silos === "courses")
        );

        const response: CoursesAndFeesResponseDto = {
          college_information: {
            college_id: collegeInfo[0].college_id,
            college_name: collegeInfo[0].college_name,
            is_active: collegeInfo[0].is_active,
            short_name: collegeInfo[0].short_name,
            slug: collegeInfo[0].slug,
            logo_img: collegeInfo[0].logo_img,
          },
          courses_section:
            filteredCourses.length > 0
              ? filteredCourses.map((content) => ({
                  title: content.title,
                  seo_param: content.seo_param,
                  meta_desc: content.meta_desc,
                  silos: content.silos,
                  author_name: content.author_name,
                  author_image: content.author_image,
                  author_id: content.author_id,
                }))
              : null, // Return null if no courses content is found
        };

        return response;
      }

      const dynamicFields = await this.generateDynamicFields(
        collegeContents,
        collegeInfo[0].slug,
        collegeInfo[0].college_id
      );

      // Add city and state fields to the response, similar to findOneGrouped
      const response: CoursesAndFeesResponseDto = {
        college_information: {
          ...college,
          course_count: courseCount,
          city: cityName,
          state: stateName,
          ...dynamicFields,
        },
        news_section: this.getLatestUpdatedObjects(
          processedContents.filter((content) => content.silos === "news")
        ),
        exam_section: examSection,
        dates_section: collegeDates,
        courses_section: {
          content_section: this.getLatestUpdatedObjects(
            processedContents.filter((content) => content.silos === "courses")
          ),
          groups: groupedCourses,
        },
      };

      return response;
    });
  }

  async getCoursesFilters(
    id: number,
    stream_name?: string,
    level?: string,
    mode?: string,
    course_group_full_name?: string
  ) {
    return tryCatchWrapper(async () => {
      const filters: string[] = [`cwc.college_id = $1`];
      const queryParams: any[] = [id];

      function addFilter(param: string | undefined, column: string) {
        if (param) {
          const values = param.split(",").map((val) => val.trim()); // Convert CSV string to array
          const placeholders = values
            .map((_, i) => `$${queryParams.length + i + 1}`)
            .join(", ");
          filters.push(`${column} IN (${placeholders})`);
          queryParams.push(...values);
        }
      }

      addFilter(stream_name, "s.stream_name");
      addFilter(level, "cg.level");
      addFilter(mode, "cwc.course_format");
      addFilter(course_group_full_name, "cg.full_name");

      const filterQuery = filters.length
        ? `WHERE ${filters.join(" AND ")}`
        : "";

      const [collegeInfo, courseGroups, allCourses, streams] =
        await Promise.all([
          this.dataSource.query(
            `SELECT * FROM college_info WHERE college_id = $1 LIMIT 1`,
            [id]
          ),
          this.dataSource.query(
            `
          SELECT
            cg.course_group_id, 
            cg.name AS course_group_name, 
            cg.slug, 
            cg.full_name AS course_group_full_name,
            cg.level, 
            MIN(cwc.duration) AS min_duration, 
            MAX(cwc.duration) AS max_duration,
            MIN(placement.highest_package) AS min_salary, 
            MAX(placement.highest_package) AS max_salary,
            MAX(cg.duration_in_months) AS duration_in_months, 
            MAX(cg.stream_id) AS stream_id, 
            s.stream_name,
            MAX(cg.kapp_score) AS kapp_score, 
            MIN(f.tution_fees_min_amount) AS min_fees,
            GREATEST(
              MAX(CASE WHEN f.tution_fees_min_amount > 0 THEN f.tution_fees_min_amount ELSE NULL END),
              MAX(CASE WHEN f.tution_fees_max_amount > 0 THEN f.tution_fees_max_amount ELSE NULL END)
            ) AS max_fees,
            MAX(cwc.course_format) AS mode
          FROM college_wise_course cwc
          INNER JOIN course_group cg ON cwc.course_group_id = cg.course_group_id
          LEFT JOIN college_wise_fees f ON f.course_group_id = cg.course_group_id AND f.college_id = $1
          LEFT JOIN college_wise_placement placement ON placement.college_id = $1
          LEFT JOIN stream s ON cg.stream_id = s.stream_id
          ${filterQuery}
          GROUP BY cg.course_group_id, cg.name, cg.slug, cg.full_name, cg.level, s.stream_id
          ORDER BY kapp_score DESC
          `,
            queryParams
          ),
          this.dataSource.query(
            `
          SELECT cwc.name AS course_name, cwc.course_group_id, cwc.is_online, cwc.duration_type, cwc.is_active,
          cwc.is_integrated_course, cwc.college_wise_course_id, cwc.degree_type, cwc.total_seats AS seats_offered,
          ARRAY_AGG(cwc.course_brochure) AS course_brochure, MIN(cwc.duration) AS duration,
          MAX(cwc.kapp_score) AS kapp_score, MAX(cwc.kapp_rating) AS kapp_rating, MAX(cwc.fees) AS direct_fees,
          MAX(cwc.salary) AS direct_salary
          FROM college_wise_course cwc
          WHERE cwc.college_id = $1 AND cwc.is_active=true
          GROUP BY cwc.name, cwc.course_group_id, cwc.college_wise_course_id, cwc.is_online, cwc.duration_type,
          cwc.is_integrated_course, cwc.degree_type, cwc.total_seats
          ORDER BY MAX(cwc.kapp_score) DESC
          `,
            [id]
          ),
          this.dataSource.query(
            `
          SELECT DISTINCT s.stream_id, s.stream_name
          FROM stream s
          INNER JOIN course_group cg ON s.stream_id = cg.stream_id
          INNER JOIN college_wise_course cwc ON cg.course_group_id = cwc.course_group_id
          ${filterQuery}
          `,
            queryParams
          ),
        ]);

      if (!collegeInfo.length) {
        throw new NotFoundException(`College info with ID ${id} not found`);
      }

      const streamSection = streams.map((stream: any) => ({
        label: stream.stream_name,
      }));

      const uniqueLevels = [
        ...new Set(courseGroups.map((group) => group.level).filter(Boolean)),
      ].map((level) => ({ label: String(level) }));

      const uniqueModes = [
        ...new Set(courseGroups.map((group) => group.mode).filter(Boolean)),
      ].map((mode) => ({ label: String(mode) }));

      const courseSection = courseGroups.map((course: any) => ({
        label: course.course_group_full_name,
      }));

      const response: CoursesFiltersResponseDto = {
        filter_section: {
          stream_name_section: streamSection,
          level_section: uniqueLevels,
          mode_section: uniqueModes,
          course_group_full_name_section: courseSection,
        },
      };

      return response;
    });
  }

  async checkCollegeInfoActivity(college_id: number) {
    const result = await this.dataSource.query(
      `SELECT 1 
       FROM college_content cc
       JOIN college_info ci ON cc.college_id = ci.college_id
       WHERE cc.college_id = $1 
       AND ci.is_active = TRUE
       AND cc.silos = 'info' 
       AND cc.is_active = TRUE;`,
      [college_id]
    );

    if (!result?.length) {
      throw new BadRequestException("This college is not active.");
    }
  }

  getLatestUpdatedObjects(data: { [key: string]: any }) {
    if (!data || data.length === 0) return [];

    // Find the maximum updated_at timestamp
    const maxUpdatedAt = Math.max(
      ...data.map((obj) => new Date(obj.updated_at).getTime())
    );

    // Filter objects that have the maximum updated_at timestamp
    return data.filter(
      (obj) => new Date(obj.updated_at).getTime() === maxUpdatedAt
    );
  }

  //admission-process
  async getAdmissionProcess(id: number, schema: boolean) {
    return tryCatchWrapper(async () => {
      // Return If Active Info article is absent.
      await this.checkCollegeInfoActivity(id);

      const collegeInfo = await this.collegeInfoRepository
        .createQueryBuilder("college")
        .leftJoinAndSelect("college.city", "city")
        .leftJoinAndSelect("college.state", "state")
        .leftJoinAndSelect("college.country", "country")
        .leftJoinAndSelect(
          "college.collegeContents",
          "content",
          "content.is_active = true"
        )
        .leftJoinAndSelect("college.collegeDates", "date")
        .where("college.college_id = :id", { id })
        .getOne();

      if (!collegeInfo) {
        throw new NotFoundException(`College info with ID ${id} not found`);
      }

      const dynamicFields = await this.generateDynamicFields(
        collegeInfo.collegeContents,
        collegeInfo.slug,
        collegeInfo.college_id
      );

      const authorIds = collegeInfo.collegeContents.map(
        (content) => content.author_id
      );
      const authors = await this.authorRepository.findByIds(authorIds);
      const authorMap = new Map(
        authors.map((author) => [author.author_id, author])
      );

      let newsContent = await mapContentBySilos(
        collegeInfo.collegeContents,
        "news",
        authorMap
      );
      newsContent = this.getLatestUpdatedObjects(newsContent);
      let admissionContent = await mapContentBySilos(
        collegeInfo.collegeContents,
        "admission",
        authorMap
      );

      // Helper to filter the silos whose updated date is maximum.
      admissionContent = this.getLatestUpdatedObjects(admissionContent);

      const collegeDates = collegeInfo.collegeDates.map((date) => ({
        start_date: date.start_date,
        end_date: date.end_date,
        event: date.event,
        description: date.description,
      }));

      const [examSection, courseCount] = await Promise.all([
        this.getExamSection(id),
        this.collegeWiseCourseRepository
          .createQueryBuilder()
          .where("college_id = :id", { id })
          .getCount(),
      ]);

      if (schema) {
        const filteredAdmission = admissionContent
          .filter((content) => content.silos === "admission")
          .slice(0, 1);

        const response: AdmissionProcessDto = {
          college_information: {
            college_id: collegeInfo.college_id,
            college_name: collegeInfo.college_name,
            is_active: collegeInfo.is_active,
            short_name: collegeInfo.short_name,
            slug: collegeInfo.slug,
            logo_img: collegeInfo.logo_img,
          },

          admission_process: {
            content:
              filteredAdmission.length > 0
                ? filteredAdmission.map((content) => ({
                    title: content.title,
                    silos: content.silos,
                    meta_desc: content.meta_desc,
                    author_name: content.author_name,
                    author_image: content.author_image,
                    author_id: content.author_id,
                  }))
                : null,
          },
        };
        return response;
      }

      const response: AdmissionProcessDto = {
        college_information: {
          college_id: collegeInfo.college_id,
          created_at: collegeInfo.created_at,
          updated_at: collegeInfo.updated_at,
          is_active: collegeInfo.is_active,
          college_name: collegeInfo.college_name,
          short_name: collegeInfo.short_name,
          search_names: collegeInfo.search_names,
          parent_college_id: collegeInfo.parent_college_id,
          city_id: collegeInfo.city_id,
          state_id: collegeInfo.state_id,
          country_id: collegeInfo.country_id,
          location: collegeInfo.location,
          PIN_code: collegeInfo.PIN_code,
          latitude_longitude: collegeInfo.latitude_longitude,
          college_email: collegeInfo.college_email,
          college_phone: collegeInfo.college_phone,
          college_website: collegeInfo.college_website,
          type_of_institute: collegeInfo.type_of_institute,
          affiliated_university_id: collegeInfo.affiliated_university_id,
          founded_year: collegeInfo.founded_year,
          logo_img: collegeInfo.logo_img,
          banner_img: collegeInfo.banner_img,
          total_student: collegeInfo.total_student,
          campus_size: collegeInfo.campus_size,
          UGC_approved: collegeInfo.UGC_approved,
          kapp_rating: collegeInfo.kapp_rating,
          kapp_score: collegeInfo.kapp_score,
          city: collegeInfo.city?.name || null,
          state: collegeInfo.state?.name || null,
          country: collegeInfo.country?.name || null,
          nacc_grade: collegeInfo.nacc_grade,
          slug: collegeInfo.slug,
          girls_only: collegeInfo.girls_only,
          is_university: collegeInfo.is_university,
          primary_stream: collegeInfo.primary_stream_id,
          course_count: courseCount,
          meta_desc: collegeInfo.meta_desc,
          is_online: collegeInfo.is_online,
          college_brochure: collegeInfo.college_brochure,
          ...dynamicFields,
        },
        news_section: newsContent,
        dates_section: collegeDates,
        exam_section: examSection,
        admission_process: {
          content: admissionContent,
        },
      };

      return response;
    });
  }

  // Placement Process
  async getPlacementProcess(id: number): Promise<PlacementDto> {
    try {
      // Return If Active Info article is absent.
      await this.checkCollegeInfoActivity(id);

      const collegeInfo = await this.collegeInfoRepository.findOne({
        where: { college_id: id },
        relations: ["collegeContents", "collegewisePlacements"],
      });

      if (!collegeInfo) {
        throw new NotFoundException(`College info with ID ${id} not found`);
      }

      const authorIds = collegeInfo.collegeContents.map(
        (content) => content.author_id
      );
      const authors = await this.authorRepository.findByIds(authorIds);
      const authorMap = new Map(
        authors.map((author) => [author.author_id, author])
      );
      let newsContent = mapContentBySilos(
        collegeInfo.collegeContents,
        "news",
        authorMap
      );
      newsContent = this.getLatestUpdatedObjects(newsContent);
      let placementContent = mapContentBySilos(
        collegeInfo.collegeContents,
        "placement",
        authorMap
      );
      placementContent = this.getLatestUpdatedObjects(placementContent);

      const placementMap: { [year: number]: any } = {};
      collegeInfo.collegewisePlacements.forEach((placement) => {
        if (!placementMap[placement.year]) {
          placementMap[placement.year] = {
            year: placement.year,
            highest_package: [],
            avg_package: [],
            median_package: [],
            placement_percentage: [],
            top_recruiters: new Set<string>(),
          };
        }

        const { particulars, category, title_value } = placement;

        if (category === "primary") {
          if (particulars === "Average Package") {
            placementMap[placement.year].avg_package.push(Number(title_value));
          } else if (particulars === "Median Package") {
            placementMap[placement.year].median_package.push(
              Number(title_value)
            );
          } else if (particulars === "Highest Package") {
            placementMap[placement.year].highest_package.push(
              Number(title_value)
            );
          } else if (particulars === "Placement Rate") {
            placementMap[placement.year].placement_percentage.push(
              Number(title_value)
            );
          }
        }

        if (placement.top_recruiters) {
          placement.top_recruiters.split(",").forEach((recruiter) => {
            placementMap[placement.year].top_recruiters.add(recruiter.trim());
          });
        }
      });

      const placements = Object.values(placementMap).map((placement: any) => ({
        year: placement.year,
        highest_package: placement.highest_package.length
          ? placement.highest_package.reduce((sum, val) => sum + val, 0) /
            placement.highest_package.length
          : 0,
        avg_package: placement.avg_package.length
          ? placement.avg_package.reduce((sum, val) => sum + val, 0) /
            placement.avg_package.length
          : 0,
        median_package: placement.median_package.length
          ? placement.median_package.reduce((sum, val) => sum + val, 0) /
            placement.median_package.length
          : 0,
        placement_percentage: placement.placement_percentage.length
          ? placement.placement_percentage.reduce((sum, val) => sum + val, 0) /
            placement.placement_percentage.length
          : 0,
        top_recruiters: Array.from(placement.top_recruiters).join(", "),
      }));

      const [examSection, courseCount] = await Promise.all([
        this.getExamSection(id),
        this.collegeWiseCourseRepository.count({ where: { college_id: id } }),
      ]);

      const placementSection = collegeInfo.collegewisePlacements.reduce(
        (groups, placement) => {
          const year = placement.year;
          if (!groups[year]) {
            groups[year] = [];
          }
          groups[year].push(placement);
          return groups;
        },
        {} as Record<number, any[]>
      );
      const dynamicFields = await this.generateDynamicFields(
        collegeInfo.collegeContents,
        collegeInfo.slug,
        collegeInfo.college_id
      );
      // Fetch city and state names
      let cityName = null;
      let stateName = null;
      if (collegeInfo.city_id) {
        const cityRow = await this.cityRepository.findOne({
          where: { city_id: collegeInfo.city_id },
        });
        cityName = cityRow?.name || null;
      }
      if (collegeInfo.state_id) {
        const stateRow = await this.stateRepository.findOne({
          where: { state_id: collegeInfo.state_id },
        });
        stateName = stateRow?.name || null;
      }

      const response: PlacementDto = {
        college_information: {
          college_id: collegeInfo.college_id,
          created_at: collegeInfo.created_at,
          updated_at: collegeInfo.updated_at,
          is_active: collegeInfo.is_active,
          college_name: collegeInfo.college_name,
          short_name: collegeInfo.short_name,
          search_names: collegeInfo.search_names,
          parent_college_id: collegeInfo.parent_college_id,
          city_id: collegeInfo.city_id,
          state_id: collegeInfo.state_id,
          country_id: collegeInfo.country_id,
          city: cityName,
          state: stateName,
          country: collegeInfo?.country?.name,
          course_count: courseCount,
          nacc_grade: collegeInfo.nacc_grade, // Add nacc_grade
          slug: collegeInfo.slug, // Add slug
          college_brochure: collegeInfo.college_brochure, // Add college_brochure
          banner_img: collegeInfo.banner_img, // Add banner_img
          logo_img: collegeInfo.logo_img, // Add
          kapp_rating: collegeInfo.kapp_rating, // Add
          founded_year: collegeInfo.founded_year, // Add
          location: collegeInfo.location, // Add
          affiliated_university_id: collegeInfo.affiliated_university_id, // Add
          girls_only: collegeInfo.girls_only, // Add
          is_university: collegeInfo.is_university, // Add
          is_online: collegeInfo.is_online, // Add
          type_of_institute: collegeInfo.type_of_institute, // Add
          ...dynamicFields,
        },
        news_section: newsContent,
        exam_section: examSection,
        placement_process: {
          content: placementContent,
          placements,
          placementSection,
        },
      };

      return response;
    } catch (err) {
      console.log(err);
    }
  }

  async getCutOffData(id: number, schema: boolean): Promise<any> {
    try {
      const examQuery = `SELECT DISTINCT e.exam_id, e.exam_name, e.exam_shortname, e.slug
      FROM college_cutoff cc
      JOIN exam e ON cc.exam_id = e.exam_id
      WHERE cc.college_id = $1;`;
      const examResults = await this.collegeInfoRepository.query(examQuery, [
        id,
      ]);

      const groupedByExam = {};

      for (const exam of examResults) {
        const yearQuery = `SELECT DISTINCT year FROM college_cutoff
        WHERE college_id = $1 AND exam_id = $2
        ORDER BY year DESC LIMIT 3;`;
        const yearResults = await this.collegeInfoRepository.query(yearQuery, [
          id,
          exam.exam_id,
        ]);
        const recentYears = yearResults.map((row) => row.year);

        const filterQuery = `SELECT DISTINCT category, "Quota", round, gender FROM college_cutoff
        WHERE college_id = $1 AND exam_id = $2;`;
        const filterResults = await this.collegeInfoRepository.query(
          filterQuery,
          [id, exam.exam_id]
        );

        const filters = {
          category: Array.from(
            new Set(filterResults.map((f) => f.category).filter(Boolean))
          ),
          quota: Array.from(
            new Set(filterResults.map((f) => f.Quota).filter(Boolean))
          ),
          round: Array.from(
            new Set(filterResults.map((f) => f.round).filter(Boolean))
          ),
          gender: Array.from(
            new Set(filterResults.map((f) => f.gender).filter(Boolean))
          ),
        };

        const defaultQuery = `WITH CommonCategories AS (
        SELECT category FROM college_cutoff 
        WHERE college_id = $1 AND exam_id = $2
        GROUP BY category 
        ORDER BY COUNT(college_cutoff_id) DESC LIMIT 1
      ),
      CommonQuotas AS (
        SELECT "Quota" FROM college_cutoff 
        WHERE college_id = $1 AND exam_id = $2
        GROUP BY "Quota" 
        ORDER BY COUNT(college_cutoff_id) DESC LIMIT 1
      ),
      CommonRounds AS (
        SELECT round FROM college_cutoff 
        WHERE college_id = $1 AND exam_id = $2
        GROUP BY round 
        ORDER BY COUNT(college_cutoff_id) DESC LIMIT 1
      ),
      CommonGenders AS (
        SELECT gender FROM college_cutoff 
        WHERE college_id = $1 AND exam_id = $2
        GROUP BY gender 
        ORDER BY COUNT(college_cutoff_id) DESC LIMIT 1
      )
      SELECT 
        (SELECT category FROM CommonCategories) AS most_common_category,
        (SELECT "Quota" FROM CommonQuotas) AS most_common_quota,
        (SELECT round FROM CommonRounds) AS most_common_round,
        (SELECT gender FROM CommonGenders) AS most_common_gender;`;

        const defaultResults = await this.collegeInfoRepository.query(
          defaultQuery,
          [id, exam.exam_id]
        );
        const defaultParams = defaultResults[0] || {};

        const category = defaultParams.most_common_category;
        const quota = defaultParams.most_common_quota;
        const round = defaultParams.most_common_round;
        const gender = defaultParams.most_common_gender;

        const cutoffQuery = `SELECT cc.*, cg.course_group_id, cg.name as course_group_name
        FROM college_cutoff cc
        LEFT JOIN course_group cg ON cc.course_group_id = cg.course_group_id
        WHERE cc.college_id = $1 AND cc.exam_id = $2
          AND cc.category = $3 AND cc."Quota" = $4
          AND cc.round = $5 AND cc.gender = $6
          AND cc.year = ANY($7)
        ORDER BY cc.year DESC;`;
        const rawResults = await this.collegeInfoRepository.query(cutoffQuery, [
          id,
          exam.exam_id,
          category,
          quota,
          round,
          gender,
          recentYears,
        ]);

        if (!groupedByExam[exam.exam_id]) {
          groupedByExam[exam.exam_id] = {
            exam_id: exam.exam_id,
            exam_name: exam.exam_name,
            shortname: exam.exam_shortname,
            slug: exam.slug,
            default_filters: { category, quota, round, gender },
            filters,
            cutoffs: [],
          };
        }

        const cutoffsByCourse = {};
        rawResults.forEach((row) => {
          if (!cutoffsByCourse[row.course_full_name]) {
            cutoffsByCourse[row.course_full_name] = {
              course_group_id: row.course_group_id,
              course_name: row.course_group_name,
              category: row.category,
              quota: row.Quota,
              round: row.round,
              gender: row.gender,
              reference_url: row.refrence_url,
              course_full_name: row.course_full_name,
              cutoff_type: row.cutoff_type,
              ranks: Object.fromEntries(
                recentYears.map((year) => [year, null])
              ),
            };
          }
          cutoffsByCourse[row.course_full_name].ranks[row.year] =
            row.closing_rank;
        });

        groupedByExam[exam.exam_id].cutoffs = Object.values(cutoffsByCourse)
          .filter((course: { ranks: Record<number, number | null> }) =>
            Object.values(course.ranks).some((rank) => rank !== null)
          )
          .slice(0, 5); // Limits to 5 courses per exam
      }

      return {
        cutoffs_data: {
          grouped_by_exam: Object.values(groupedByExam),
        },
      };
    } catch (error) {
      console.error("Error fetching cut off data:", error);
      throw error;
    }
  }

  async getCutoffsFilters(
    collegeId: number,
    examId?: number,
    round?: string,
    gender?: string,
    category?: string,
    quota?: string
  ) {
    return tryCatchWrapper(async () => {
      const filters: string[] = ["c.college_id = $1"];
      const queryParams: any[] = [collegeId];

      function addFilter(param: string | undefined | number, column: string) {
        if (param) {
          if (typeof param === "number") {
            filters.push(`${column} = $${queryParams.length + 1}`);
            queryParams.push(param);
          } else {
            const values = param.split(",").map((val) => val.trim());
            const placeholders = values
              .map((_, i) => `$${queryParams.length + i + 1}`)
              .join(", ");
            filters.push(`${column} IN (${placeholders})`);
            queryParams.push(...values);
          }
        }
      }

      addFilter(examId, "c.exam_id");
      addFilter(round, "c.round");
      addFilter(gender, "c.gender");
      addFilter(category, "c.category");
      addFilter(quota, 'c."Quota"');

      const filterQuery = filters.length
        ? `WHERE ${filters.join(" AND ")}`
        : "";

      const query = `
        SELECT 
          e.exam_id, 
          e.exam_name,
          json_agg(DISTINCT c.round) FILTER (WHERE c.round IS NOT NULL) AS rounds,
          json_agg(DISTINCT c.gender) FILTER (WHERE c.gender IS NOT NULL) AS genders,
          json_agg(DISTINCT c.category) FILTER (WHERE c.category IS NOT NULL) AS categories,
          json_agg(DISTINCT c."Quota") FILTER (WHERE c."Quota" IS NOT NULL) AS quotas
        FROM college_cutoff c
        JOIN exam e ON c.exam_id = e.exam_id
        ${filterQuery}
        GROUP BY e.exam_id, e.exam_name;
      `;

      const result = await this.dataSource.query(query, queryParams);

      const filterSections = result.map((row) => ({
        exam_id: row.exam_id,
        exam_name: row.exam_name,
        category_section:
          row.categories?.map((c: string) => ({ label: c })) || [],
        quota_section: row.quotas?.map((q: string) => ({ label: q })) || [],
        round_section: row.rounds?.map((r: string) => ({ label: r })) || [],
        gender_section: row.genders?.map((g: string) => ({ label: g })) || [],
      }));

      return { filter_section: filterSections };
    });
  }

  async getFilteredCutOffData(
    id: number,
    exam_id?: number,
    category?: string,
    quota?: string,
    round?: string,
    gender?: string,
    page: number = 1,
    limit: number = 5
  ): Promise<any> {
    try {
      // Fetch most common filters if not provided
      const defaultQuery = `WITH CommonCategories AS (
        SELECT category FROM college_cutoff 
        WHERE college_id = $1 AND exam_id = $2 
        GROUP BY category 
        ORDER BY COUNT(college_cutoff_id) DESC LIMIT 1
      ),
      CommonQuotas AS (
        SELECT "Quota" FROM college_cutoff 
        WHERE college_id = $1 AND exam_id = $2 
        GROUP BY "Quota" 
        ORDER BY COUNT(college_cutoff_id) DESC LIMIT 1
      ),
      CommonRounds AS (
        SELECT round FROM college_cutoff 
        WHERE college_id = $1 AND exam_id = $2 
        GROUP BY round 
        ORDER BY COUNT(college_cutoff_id) DESC LIMIT 1
      ),
      CommonGenders AS (
        SELECT gender FROM college_cutoff 
        WHERE college_id = $1 AND exam_id = $2 
        GROUP BY gender 
        ORDER BY COUNT(college_cutoff_id) DESC LIMIT 1
      )
      SELECT 
        (SELECT category FROM CommonCategories) AS most_common_category,
        (SELECT "Quota" FROM CommonQuotas) AS most_common_quota,
        (SELECT round FROM CommonRounds) AS most_common_round,
        (SELECT gender FROM CommonGenders) AS most_common_gender;`;

      const defaultResults = await this.collegeInfoRepository.query(
        defaultQuery,
        [id, exam_id]
      );
      const defaultParams = defaultResults[0] || {};
      category = category ?? defaultParams.most_common_category;
      quota = quota ?? defaultParams.most_common_quota;
      round = round ?? defaultParams.most_common_round;
      gender = gender ?? defaultParams.most_common_gender;

      let conditionQuery = "";
      const params: (string | number)[] = [id];

      if (exam_id) {
        params.push(exam_id);
        conditionQuery += ` AND cc.exam_id = $${params.length}`;
      }
      if (category) {
        params.push(category);
        conditionQuery += ` AND cc.category = $${params.length}`;
      }
      if (quota) {
        params.push(quota);
        conditionQuery += ` AND cc."Quota" = $${params.length}`;
      }
      if (round) {
        params.push(round);
        conditionQuery += ` AND cc.round = $${params.length}`;
      }
      if (gender) {
        params.push(gender);
        conditionQuery += ` AND cc.gender = $${params.length}`;
      }

      // Fetch the most recent years dynamically for the given conditions
      const yearsQuery = `
        SELECT DISTINCT cc.year 
        FROM college_cutoff cc 
        WHERE cc.college_id = $1 ${conditionQuery}
        ORDER BY cc.year DESC LIMIT 3;
      `;

      const yearsResult = await this.collegeInfoRepository.query(
        yearsQuery,
        params
      );
      const availableYears = yearsResult.map((row) => row.year);

      if (availableYears.length === 0) {
        throw new NotFoundException(
          `No cutoff data found for the given filters.`
        );
      }

      // Fetch cutoff data only for available years
      const query = `
        SELECT cc.year, cc.course_full_name, cc.closing_rank, 
               cc.category, cc."Quota", cc.round, cc.cutoff_type, cc.gender, 
               cc.refrence_url, cc.course_group_id, cg.name as course_name
        FROM college_cutoff cc
        LEFT JOIN course_group cg ON cc.course_group_id = cg.course_group_id
        WHERE cc.college_id = $1 ${conditionQuery}
        AND cc.year IN (${availableYears.join(",")}) -- Only fetch existing recent years
        ORDER BY cc.year DESC, cc.course_full_name, cc.round DESC
      `;

      const rawResults = await this.collegeInfoRepository.query(query, params);

      if (!rawResults || rawResults.length === 0) {
        throw new NotFoundException(
          `No cutoff data found for the given filters.`
        );
      }

      // Group data by course_full_name
      const cutoffsByCourse: Record<string, any> = {};
      rawResults.forEach((row) => {
        if (!cutoffsByCourse[row.course_full_name]) {
          cutoffsByCourse[row.course_full_name] = {
            course_group_id: row.course_group_id,
            course_name: row.course_name,
            category: row.category,
            quota: row.Quota,
            round: row.round,
            gender: row.gender,
            reference_url: row.refrence_url,
            course_full_name: row.course_full_name,
            cutoff_type: row.cutoff_type,
            ranks: Object.fromEntries(
              availableYears.map((year) => [year, null])
            ),
          };
        }
        cutoffsByCourse[row.course_full_name].ranks[row.year] =
          row.closing_rank;
      });

      // Filter out courses where all three ranks are null
      const filteredCutoffs = Object.values(cutoffsByCourse).filter((course) =>
        Object.values(course.ranks).some((rank) => rank !== null)
      );

      // Apply Pagination
      const paginatedCutoffs = filteredCutoffs.slice(
        (page - 1) * limit,
        page * limit
      );

      return {
        college_id: id,
        applied_filters: { exam_id, category, quota, round, gender },
        cutoffs: paginatedCutoffs,
      };
    } catch (error) {
      console.error("Error fetching filtered cutoff data:", error);
      throw error;
    }
  }

  async getCutOffProcess(id: number, schema: boolean): Promise<CutOffDto> {
    try {
      // Return If Active Info article is absent.
      await this.checkCollegeInfoActivity(id);

      const [collegeInfo, collegeContents, collegeDates] = await Promise.all([
        this.dataSource.query(
          `
          SELECT
            ci.*, c.name AS city, s.name AS state, co.name AS country
          FROM college_info ci
          LEFT JOIN city c ON ci.city_id = c.city_id
          LEFT JOIN state s ON ci.state_id = s.state_id
          LEFT JOIN country co ON ci.country_id = co.country_id
          WHERE ci.college_id = $1
          LIMIT 1
          `,
          [id]
        ),
        this.dataSource.query(
          "SELECT * FROM college_content WHERE college_id = $1 AND is_active = true ORDER BY updated_at DESC",
          [id]
        ),
        this.dataSource.query(
          "SELECT * FROM college_dates WHERE college_id = $1",
          [id]
        ),
      ]);
      if (!collegeInfo.length) {
        throw new NotFoundException(`College info with ID ${id} not found`);
      }
      const authorIds = [
        ...new Set(collegeContents.map((content) => content.author_id)),
      ];
      const authorsQuery = `
        SELECT *
        FROM author
        WHERE author_id IN (${authorIds.map((_, i) => `$${i + 1}`).join(", ")})
      `;
      let authors = [];
      if (authorIds.length !== 0) {
        authors = await this.dataSource.query(authorsQuery, authorIds);
      }
      const authorMap = new Map(
        authors.map((author) => [author.author_id, author])
      );

      // Using the function for different silos:
      let newsContent = await mapContentBySilos(
        collegeContents,
        "news",
        authorMap
      );
      newsContent = this.getLatestUpdatedObjects(newsContent);
      let cutoffContent = await mapContentBySilos(
        collegeContents,
        "cutoff",
        authorMap
      );
      cutoffContent = this.getLatestUpdatedObjects(cutoffContent);

      const [dynamicFields, courseCount] = await Promise.all([
        this.generateDynamicFields(
          collegeContents,
          collegeInfo[0].slug,
          collegeInfo[0].college_id
        ),
        this.collegeWiseCourseRepository.count({ where: { college_id: id } }),
      ]);

      if (schema) {
        const filteredCutoff = cutoffContent
          .filter((content) => content.silos === "cutoff")
          .slice(0, 1);
        const response: CutOffDto = {
          college_information: {
            college_id: collegeInfo[0].college_id,
            college_name: collegeInfo[0].college_name,
            is_active: collegeInfo[0].is_active,
            short_name: collegeInfo[0].short_name,
            slug: collegeInfo[0].slug,
            logo_img: collegeInfo[0].logo_img,
          },
          cutoff_content:
            filteredCutoff.length > 0
              ? filteredCutoff.map((content) => ({
                  title: content.title,
                  silos: content.silos,
                  meta_desc: content.meta_desc,
                  author_name: content.author_name,
                  author_image: content.author_image,
                  author_id: content.author_id,
                }))
              : null,
        };
        return response;
      }
      const response: CutOffDto = {
        college_information: {
          college_id: collegeInfo[0].college_id,
          created_at: collegeInfo[0].created_at,
          updated_at: collegeInfo[0].updated_at,
          is_active: collegeInfo[0].is_active,
          college_name: collegeInfo[0].college_name,
          short_name: collegeInfo[0].short_name,
          search_names: collegeInfo[0].search_names,
          parent_college_id: collegeInfo[0].parent_college_id,
          city_id: collegeInfo[0].city_id,
          state_id: collegeInfo[0].state_id,
          country_id: collegeInfo[0].country_id,
          location: collegeInfo[0].location,
          PIN_code: collegeInfo[0].PIN_code,
          latitude_longitude: collegeInfo[0].latitude_longitude,
          college_email: collegeInfo[0].college_email,
          college_phone: collegeInfo[0].college_phone,
          college_website: collegeInfo[0].college_website,
          type_of_institute: collegeInfo[0].type_of_institute,
          affiliated_university_id: collegeInfo[0].affiliated_university_id,
          founded_year: collegeInfo[0].founded_year,
          logo_img: collegeInfo[0].logo_img,
          banner_img: collegeInfo[0].banner_img,
          total_student: collegeInfo[0].total_student,
          campus_size: collegeInfo[0].campus_size,
          UGC_approved: collegeInfo[0].UGC_approved,
          kapp_rating: collegeInfo[0].kapp_rating,
          kapp_score: collegeInfo[0].kapp_score,
          city: collegeInfo[0].city || null,
          state: collegeInfo[0].state || null,
          country: collegeInfo[0].country || null,
          nacc_grade: collegeInfo[0].nacc_grade,
          slug: collegeInfo[0].slug,
          girls_only: collegeInfo[0].girls_only,
          is_university: collegeInfo[0].is_university,
          primary_stream: collegeInfo[0].primary_stream_id,
          course_count: courseCount,
          meta_desc: collegeInfo[0].meta_desc,
          is_online: collegeInfo[0].is_online,
          college_brochure: collegeInfo[0].college_brochure,
          ...dynamicFields,
        },
        news_section: newsContent,
        cutoff_content: cutoffContent,
        college_dates: collegeDates,
      };
      return response;
    } catch (err) {
      console.error(err);
      throw new Error("Error fetching cutoff process data");
    }
  }

  // Rankings
  async getFilteredContent(
    collegeInfo: any,
    silosType: string
  ): Promise<any[]> {
    return Promise.all(
      collegeInfo.collegeContents
        .filter((content) => content.is_active && content.silos === silosType)
        .map(async (content) => {
          const author = await this.authorRepository.findOne({
            where: { author_id: content.author_id },
          });
          return {
            silos: content.silos,
            title: content.title,
            description: content.description,
            updated_at: content.updated_at,
            is_active: content.is_active,
            seo_param: content.seo_param,
            author_name: author ? author.view_name : null,
            author_image: author ? author.image : null,
            meta_desc: content.meta_desc,
          };
        })
    );
  }

  async getRankings(id: number, schema: boolean): Promise<RankingDto> {
    // Return If Active Info article is absent.
    await this.checkCollegeInfoActivity(id);

    // Fetch college information with related data
    const collegeInfo = await this.collegeInfoRepository.findOne({
      where: { college_id: id },
      relations: [
        "collegeRankings",
        "collegeRankings.stream",
        "collegeRankings.courseGroup",
        "collegeContents",
      ],
    });

    if (!collegeInfo) {
      throw new NotFoundException(`College info with ID ${id} not found`);
    }

    // Batch fetch ranking agencies for all rankings at once
    const rankingAgencyIds = collegeInfo.collegeRankings.map(
      (ranking) => ranking.ranking_agency_id
    );
    const rankingAgencies =
      await this.rankingAgencyRepository.findByIds(rankingAgencyIds);

    // Create a map of ranking agency IDs for quick lookup
    const rankingAgencyMap = rankingAgencies.reduce((map, agency) => {
      map[agency.ranking_agency_id] = agency;
      return map;
    }, {});

    // Map the rankings with their respective agency info
    const rankingsWithAgencies = collegeInfo.collegeRankings.map((ranking) => {
      const rankingAgency = rankingAgencyMap[ranking.ranking_agency_id] || {};

      return {
        year: ranking.year,
        rankings: {
          rank: ranking.rank,
          agency_logo: rankingAgency.logo || "Unknown",
          agency: rankingAgency.name || "Unknown",
          ranking_agency_short_name: rankingAgency.short_name || "Unknown",
          rank_title: ranking.rank_title,
          rank_subtitle: ranking.rank_subtitle,
          refrence_url: ranking.refrence_url,
          stream_name: ranking.stream ? ranking.stream.stream_name : null,
          stream_id: ranking.stream_id,
          max_rank: ranking.max_rank,
          course_group_id: ranking.courseGroup
            ? ranking.courseGroup.course_group_id
            : null,
        },
      };
    });

    // Group rankings by year
    const groupedByYear = rankingsWithAgencies.reduce(
      (group, ranking) => {
        const year = ranking.year;

        if (!group[year]) {
          group[year] = {
            year,
            rankings: [],
          };
        }

        group[year].rankings.push(ranking.rankings);
        return group;
      },
      {} as Record<number, { year: number; rankings: any[] }>
    );

    const groupedRankings = Object.values(groupedByYear);

    // Fetch other sections in parallel
    const [
      examSection,
      infoContent,
      rankingsContent,
      newsContent,
      dynamicFields,
      courseCount,
    ] = await Promise.all([
      this.getExamSection(id),
      this.getFilteredContent(collegeInfo, "info"),
      this.getFilteredContent(collegeInfo, "ranking"),
      this.getFilteredContent(collegeInfo, "news"),
      this.generateDynamicFields(
        collegeInfo.collegeContents,
        collegeInfo.slug,
        collegeInfo.college_id
      ),
      this.collegeWiseCourseRepository.count({ where: { college_id: id } }),
    ]);

    if (schema) {
      const filteredInfo = collegeInfo.collegeContents
        .filter((content) => content.silos === "ranking")
        .slice(0, 1);
      const authorIds = [
        ...new Set(rankingsContent.map((content) => content.author_id)),
      ];

      const authorsQuery = `
            SELECT * 
            FROM author
            WHERE author_id IN (${authorIds.map((_, i) => `$${i + 1}`).join(", ")})
          `;
      const authors = await this.dataSource.query(authorsQuery, authorIds);

      const authorsMap = authors.reduce((map, author) => {
        map[author.author_id] = author;
        return map;
      }, {});
      const response: RankingDto = {
        college_information: {
          college_id: collegeInfo?.college_id,
          college_name: collegeInfo?.college_name,
          is_active: collegeInfo?.is_active,
          short_name: collegeInfo?.short_name,
          slug: collegeInfo?.slug,
          logo_img: collegeInfo?.logo_img,
        },
        rankings:
          filteredInfo.length > 0
            ? {
                content: filteredInfo.map((content) => {
                  const author = authorsMap[content.author_id] || {
                    view_name: "KollegeApply", // Default author name
                    image: null,
                  };

                  return {
                    title: content.title,
                    seo_param: content.seo_param,
                    meta_desc: content.meta_desc,
                    silos: content.silos,
                    author_name: author.view_name,
                    author_image: author.image,
                    author_id: content.author_id,
                  };
                }),
                grouped_by_year: [], // Ensure this key exists to match the RankingDto structure
              }
            : { content: null, grouped_by_year: [] },
      };
      return response;
    }

    // Fetch city and state names
    let cityName = null;
    let stateName = null;
    if (collegeInfo.city_id) {
      const cityRow = await this.cityRepository.findOne({
        where: { city_id: collegeInfo.city_id },
      });
      cityName = cityRow?.name || null;
    }
    if (collegeInfo.state_id) {
      const stateRow = await this.stateRepository.findOne({
        where: { state_id: collegeInfo.state_id },
      });
      stateName = stateRow?.name || null;
    }

    const response: RankingDto = {
      college_information: {
        college_id: collegeInfo.college_id,
        created_at: collegeInfo.created_at,
        updated_at: collegeInfo.updated_at,
        is_active: collegeInfo.is_active,
        college_name: collegeInfo.college_name,
        short_name: collegeInfo.short_name,
        search_names: collegeInfo.search_names,
        parent_college_id: collegeInfo.parent_college_id,
        city_id: collegeInfo.city_id,
        state_id: collegeInfo.state_id,
        country_id: collegeInfo.country_id,
        city: cityName,
        state: stateName,
        country: collegeInfo.country?.name || null,
        location: collegeInfo.location,
        PIN_code: collegeInfo.PIN_code,
        latitude_longitude: collegeInfo.latitude_longitude,
        college_email: collegeInfo.college_email,
        college_phone: collegeInfo.college_phone,
        college_website: collegeInfo.college_website,
        type_of_institute: collegeInfo.type_of_institute,
        affiliated_university_id: collegeInfo.affiliated_university_id,
        founded_year: collegeInfo.founded_year,
        logo_img: collegeInfo.logo_img,
        banner_img: collegeInfo.banner_img,
        total_student: collegeInfo.total_student,
        campus_size: collegeInfo.campus_size,
        UGC_approved: collegeInfo.UGC_approved,
        kapp_rating: collegeInfo.kapp_rating,
        kapp_score: collegeInfo.kapp_score,
        nacc_grade: collegeInfo.nacc_grade,
        slug: collegeInfo.slug,
        girls_only: collegeInfo.girls_only,
        is_university: collegeInfo.is_university,
        primary_stream: collegeInfo.primary_stream_id,
        course_count: courseCount,
        meta_desc: collegeInfo.meta_desc,
        is_online: collegeInfo.is_online,
        college_brochure: collegeInfo.college_brochure,
        ...dynamicFields,
      },
      news_section: this.getLatestUpdatedObjects(newsContent),
      info_section: this.getLatestUpdatedObjects(infoContent),
      exam_section: examSection,
      rankings: {
        content: this.getLatestUpdatedObjects(rankingsContent),
        grouped_by_year: groupedRankings,
      },
    };

    return response;
  }

  async getExamSection(collegeId: number): Promise<ExamSectionDto[]> {
    const exams = await this.collegeExamRepository
      .createQueryBuilder("collegeExam")
      .leftJoinAndSelect("collegeExam.exam", "exam")
      .where("collegeExam.college_id = :collegeId", { collegeId })
      .select([
        "collegeExam.exam_id",
        "collegeExam.title",
        "exam.exam_name",
        "exam.exam_duration",
        "exam.application_start_date",
        "exam.application_end_date",
      ])
      .getRawMany();

    return exams.map((exam) => ({
      exam_id: exam.collegeExam_exam_id,
      title: exam.collegeExam_title,
      name: exam.exam_exam_name,
      duration: exam.exam_exam_duration,
      application_start_date: exam.exam_application_start_date,
      application_end_date: exam.exam_application_end_date,
    }));
  }

  // Infrastructure
  async getInfrastructure(
    id: number,
    schema: boolean
  ): Promise<InfrastructureDto> {
    try {
      // Return If Active Info article is absent.
      await this.checkCollegeInfoActivity(id);

      const collegeInfoQuery = `
        SELECT
          ci.college_id, ci.created_at, ci.updated_at, ci.is_active, ci.college_name, ci.short_name, ci.search_names,
          ci.parent_college_id, ci.city_id, ci.state_id, ci.country_id, ci.location, ci."PIN_code", ci.latitude_longitude,
          ci.college_email, ci.college_phone, ci.college_website, ci.type_of_institute, ci.affiliated_university_id,
          ci.founded_year, ci.logo_img, ci.banner_img, ci.total_student, ci.campus_size, ci."UGC_approved", ci.kapp_rating,
          ci.kapp_score, ci.nacc_grade, ci.slug, ci.girls_only, ci.is_university, ci.primary_stream_id, ci.meta_desc,
          ci.is_online, ci.college_brochure, c.name AS city_name, s.name AS state_name, co.name AS country_name
        FROM college_info ci
        LEFT JOIN city c ON ci.city_id = c.city_id
        LEFT JOIN state s ON ci.state_id = s.state_id
        LEFT JOIN country co ON ci.country_id = co.country_id
        WHERE ci.college_id = $1
      `;
      const collegeInfo = await this.dataSource.query(collegeInfoQuery, [id]);
      if (!collegeInfo.length) {
        throw new NotFoundException(`College info with ID ${id} not found`);
      }
      const [
        collegeContents,
        collegeHostelCampuses,
        collegeGallery,
        collegeVideos,
      ] = await Promise.all([
        this.dataSource.query(
          "SELECT * FROM college_content WHERE college_id = $1 AND is_active = true ORDER BY updated_at DESC",
          [id]
        ),
        this.dataSource.query(
          "SELECT * FROM college_hostel_campus WHERE college_id = $1",
          [id]
        ),
        this.dataSource.query(
          "SELECT * FROM college_gallery WHERE college_id = $1",
          [id]
        ),
        this.dataSource.query(
          "SELECT * FROM college_video WHERE college_id = $1",
          [id]
        ),
      ]);
      const authorIds = [
        ...new Set(collegeContents.map((content) => content.author_id)),
      ];
      const authorsQuery = `
        SELECT *
        FROM author
        WHERE author_id IN (${authorIds.map((_, i) => `$${i + 1}`).join(", ")})
      `;
      const authors = await this.dataSource.query(authorsQuery, authorIds);
      const authorsMap = authors.reduce((map, author) => {
        map[author.author_id] = author;
        return map;
      }, {});
      const newsContent = [];
      const infrastructureContent = [];
      collegeContents.forEach((content) => {
        const author = authorsMap[content.author_id];
        const contentData = {
          id: content.college_content_id,
          silos: content.silos,
          title: content.title,
          description: content.description,
          updated_at: content.updated_at,
          is_active: content.is_active,
          author_name: author ? author.view_name : null,
          author_id: author ? author.author_id : null,
          author_image: author ? author.image : null,
          meta_desc: content.meta_desc,
        };
        if (content.silos === "news") newsContent.push(contentData);
        if (content.silos === "facilities")
          infrastructureContent.push(contentData);
      });
      const dynamicFields = await this.generateDynamicFields(
        collegeContents,
        collegeInfo[0].slug,
        collegeInfo[0].college_id
      );
      const hostelAndCampus = collegeHostelCampuses.map((hostel) => ({
        description: hostel.description,
        reference_url: hostel.refrence_url,
      }));
      const galleryData = collegeGallery.map((gallery) => ({
        media_URL: gallery.media_URL,
        tag: gallery.tag,
        alt_text: gallery.alt_text,
        reference_url: gallery.refrence_url,
      }));
      const videoData = collegeVideos.map((video) => ({
        media_URL: video.media_URL,
        tag: video.tag,
        alt_text: video.alt_text,
        thumbnail_URL: video.thumbnail_URL,
        reference_url: video.refrence_url,
      }));
      const examSection = await this.getExamSection(id);
      const courseCount = await this.collegeWiseCourseRepository.count({
        where: { college_id: id },
      });
      if (schema) {
        const filteredInfo = this.getLatestUpdatedObjects(
          collegeContents.filter((content) => content.silos === "facilities")
        );
        const response: InfrastructureDto = {
          college_information: {
            college_id: collegeInfo?.[0]?.college_id,
            college_name: collegeInfo?.[0]?.college_name,
            is_active: collegeInfo?.[0]?.is_active,
            short_name: collegeInfo?.[0]?.short_name,
            slug: collegeInfo?.[0]?.slug,
            logo_img: collegeInfo?.[0]?.logo_img,
          },
          infrastructure:
            filteredInfo.length > 0
              ? filteredInfo.map((content) => {
                  const author = authorsMap[content.author_id] || {
                    view_name: "KollegeApply", // Default author name
                    image: null,
                  };
                  return {
                    title: content?.title,
                    seo_param: content?.seo_param,
                    meta_desc: content?.meta_desc,
                    silos: content?.silos,
                    author_name: author?.view_name,
                    author_image: author?.image,
                    author_id: content?.author_id,
                  };
                })
              : null,
        };
        return response;
      }
      const response: InfrastructureDto = {
        college_information: {
          college_id: collegeInfo[0].college_id,
          created_at: collegeInfo[0].created_at,
          updated_at: collegeInfo[0].updated_at,
          is_active: collegeInfo[0].is_active,
          college_name: collegeInfo[0].college_name,
          short_name: collegeInfo[0].short_name,
          search_names: collegeInfo[0].search_names,
          parent_college_id: collegeInfo[0].parent_college_id,
          city_id: collegeInfo[0].city_id,
          state_id: collegeInfo[0].state_id,
          country_id: collegeInfo[0].country_id,
          location: collegeInfo[0].location,
          PIN_code: collegeInfo[0].PIN_code,
          latitude_longitude: collegeInfo[0].latitude_longitude,
          college_email: collegeInfo[0].college_email,
          college_phone: collegeInfo[0].college_phone,
          college_website: collegeInfo[0].college_website,
          type_of_institute: collegeInfo[0].type_of_institute,
          affiliated_university_id: collegeInfo[0].affiliated_university_id,
          founded_year: collegeInfo[0].founded_year,
          logo_img: collegeInfo[0].logo_img,
          banner_img: collegeInfo[0].banner_img,
          total_student: collegeInfo[0].total_student,
          campus_size: collegeInfo[0].campus_size,
          UGC_approved: collegeInfo[0].UGC_approved,
          kapp_rating: collegeInfo[0].kapp_rating,
          kapp_score: collegeInfo[0].kapp_score,
          city: collegeInfo[0].city_name || null,
          state: collegeInfo[0].state_name || null,
          country: collegeInfo[0].country_name || null,
          nacc_grade: collegeInfo[0].nacc_grade,
          slug: collegeInfo[0].slug,
          girls_only: collegeInfo[0].girls_only,
          is_university: collegeInfo[0].is_university,
          primary_stream: collegeInfo[0].primary_stream_id,
          course_count: courseCount,
          meta_desc: collegeInfo[0].meta_desc,
          is_online: collegeInfo[0].is_online,
          college_brochure: collegeInfo[0].college_brochure,
          ...dynamicFields,
        },
        news_section: this.getLatestUpdatedObjects(newsContent),
        infrastructure: {
          content: this.getLatestUpdatedObjects(infrastructureContent),
          hostel_and_campus: hostelAndCampus,
          college_gallery: galleryData,
          college_video: videoData,
          exam_section: examSection,
        },
      };
      return response;
    } catch (err) {
      console.log(err);
      throw new Error("An error occurred while fetching infrastructure data.");
    }
  }

  async getNews(id: number, schema: boolean): Promise<CollegeNewsResponseDto> {
    try {
      // Return If Active Info article is absent.
      await this.checkCollegeInfoActivity(id);

      const collegeInfoQuery = `
        SELECT
          ci.college_id, ci.created_at, ci.updated_at, ci.is_active, ci.college_name, ci.short_name, ci.search_names,
          ci.parent_college_id, ci.city_id, ci.state_id, ci.country_id, ci.location, ci."PIN_code", ci.latitude_longitude,
          ci.college_email, ci.college_phone, ci.college_website, ci.type_of_institute, ci.affiliated_university_id,
          ci.founded_year, ci.logo_img, ci.banner_img, ci.total_student, ci.campus_size, ci."UGC_approved", ci.kapp_rating,
          ci.kapp_score, ci.nacc_grade, ci.slug, ci.girls_only, ci.is_university, ci.primary_stream_id, ci.meta_desc,
          ci.is_online, ci.college_brochure, c.name AS city_name, s.name AS state_name, co.name AS country_name
        FROM college_info ci
        LEFT JOIN city c ON ci.city_id = c.city_id
        LEFT JOIN state s ON ci.state_id = s.state_id
        LEFT JOIN country co ON ci.country_id = co.country_id
        WHERE ci.college_id = $1
      `;
      const collegeInfo = await this.dataSource.query(collegeInfoQuery, [id]);
      if (!collegeInfo.length) {
        throw new NotFoundException(`College info with ID ${id} not found`);
      }
      const [collegeContents] = await Promise.all([
        this.dataSource.query(
          `SELECT * FROM college_content 
           WHERE college_id = $1 AND is_active = true 
           ORDER BY updated_at DESC`,
          [id]
        ),
      ]);

      const authorIds = collegeContents.map((content) => content.author_id);
      const authors = await this.authorRepository.findByIds(authorIds);
      const authorMap = new Map(
        authors.map((author) => [author.author_id, author])
      );

      let newsContent = mapContentBySilos(collegeContents, "news", authorMap);
      newsContent = this.getLatestUpdatedObjects(newsContent);

      if (schema) {
        const filteredNew = newsContent
          .filter((content) => content.silos === "news")
          .slice(0, 1);
        const response: CollegeNewsResponseDto = {
          college_information: {
            college_id: collegeInfo[0].college_id,
            college_name: collegeInfo[0].college_name,
            is_active: collegeInfo[0].is_active,
            short_name: collegeInfo[0].short_name,
            slug: collegeInfo[0].slug,
            logo_img: collegeInfo[0].logo_img,
          },
          news_section:
            filteredNew.length > 0
              ? filteredNew.map((content) => {
                  return {
                    title: content[0].title,
                    silos: content[0].silos,
                    meta_desc: content[0].meta_desc,
                    author_name: content[0].author_name,
                    author_image: content[0].author_image,
                    author_id: content[0].author_id,
                  };
                })
              : null,
        };
        return response;
      }
      const dynamicFields = await this.generateDynamicFields(
        collegeContents,
        collegeInfo[0].slug,
        collegeInfo[0].college_id
      );

      const courseCount = await this.collegeWiseCourseRepository.count({
        where: { college_id: id },
      });
      const response: CollegeNewsResponseDto = {
        college_information: {
          college_id: collegeInfo[0].college_id,
          created_at: collegeInfo[0].created_at,
          updated_at: collegeInfo[0].updated_at,
          is_active: collegeInfo[0].is_active,
          college_name: collegeInfo[0].college_name,
          short_name: collegeInfo[0].short_name,
          search_names: collegeInfo[0].search_names,
          parent_college_id: collegeInfo[0].parent_college_id,
          city_id: collegeInfo[0].city_id,
          state_id: collegeInfo[0].state_id,
          country_id: collegeInfo[0].country_id,
          location: collegeInfo[0].location,
          PIN_code: collegeInfo[0].PIN_code,
          latitude_longitude: collegeInfo[0].latitude_longitude,
          college_email: collegeInfo[0].college_email,
          college_phone: collegeInfo[0].college_phone,
          college_website: collegeInfo[0].college_website,
          type_of_institute: collegeInfo[0].type_of_institute,
          affiliated_university_id: collegeInfo[0].affiliated_university_id,
          founded_year: collegeInfo[0].founded_year,
          logo_img: collegeInfo[0].logo_img,
          banner_img: collegeInfo[0].banner_img,
          total_student: collegeInfo[0].total_student,
          campus_size: collegeInfo[0].campus_size,
          UGC_approved: collegeInfo[0].UGC_approved,
          kapp_rating: collegeInfo[0].kapp_rating,
          kapp_score: collegeInfo[0].kapp_score,
          city: collegeInfo[0].city_name || null,
          state: collegeInfo[0].state_name || null,
          country: collegeInfo[0].country_name || null,
          primary_stream_id: collegeInfo[0].primary_stream_id,
          nacc_grade: collegeInfo[0].nacc_grade,
          slug: collegeInfo[0].slug,
          girls_only: collegeInfo[0].girls_only,
          is_university: collegeInfo[0].is_university,
          course_count: courseCount,
          meta_desc: collegeInfo[0].meta_desc,
          is_online: collegeInfo[0].is_online,
          college_brochure: collegeInfo[0].college_brochure,
          ...dynamicFields,
        },
        news_section: newsContent,
      };
      return response;
    } catch (err) {
      console.log(err);
      throw new Error("An error occurred while fetching infrastructure data.");
    }
  }

  async getCollegeWiseNews(
    college_content_id: number,
    schema: boolean
  ): Promise<CollegeWiseNewsResponseDto> {
    try {
      const newsQuery = `
              SELECT 
        cc.college_content_id, cc.silos, cc.title, cc.description, 
        cc.updated_at, cc.is_active, cc.meta_desc, cc.author_id, 
        a.author_name, a.image,  -- ✅ Added a comma here
        cc.college_id
      FROM college_content cc
      LEFT JOIN author a ON cc.author_id = a.author_id
      WHERE cc.college_content_id = $1 AND cc.silos = 'news'
      ORDER BY cc.updated_at DESC;
      `;
      const newsContent = await this.collegeContentRepository.query(newsQuery, [
        college_content_id,
      ]);

      if (!newsContent.length) {
        throw new NotFoundException(
          `News with ID ${college_content_id} not found`
        );
      }

      const { college_id } = newsContent[0];

      const collegeInfoQuery = `
        SELECT 
          ci.college_id, ci.created_at, ci.updated_at, ci.is_active, ci.college_name, ci.short_name, ci.search_names,
          ci.parent_college_id, ci.city_id, ci.state_id, ci.country_id, ci.location, ci."PIN_code", ci.latitude_longitude,
          ci.college_email, ci.college_phone, ci.college_website, ci.type_of_institute, ci.affiliated_university_id,
          ci.founded_year, ci.logo_img, ci.banner_img, ci.total_student, ci.campus_size, ci."UGC_approved", ci.kapp_rating,
          ci.kapp_score, ci.nacc_grade, ci.slug, ci.girls_only, ci.is_university, ci.primary_stream_id, ci.meta_desc,
          ci.is_online, ci.college_brochure, c.name AS city_name, s.name AS state_name, co.name AS country_name
        FROM college_info ci
        LEFT JOIN city c ON ci.city_id = c.city_id
        LEFT JOIN state s ON ci.state_id = s.state_id
        LEFT JOIN country co ON ci.country_id = co.country_id
        WHERE ci.college_id = $1
      `;
      const collegeInfo = await this.dataSource.query(collegeInfoQuery, [
        college_id,
      ]);

      const [collegeContents] = await Promise.all([
        this.dataSource.query(
          "SELECT * FROM college_content WHERE college_id = $1 AND is_active = true ",
          [college_id]
        ),
      ]);

      if (!collegeInfo.length) {
        throw new NotFoundException(`College with ID ${college_id} not found`);
      }

      if (schema) {
        const filteredCourseByNews = newsContent
          .filter((content) => content.silos === "news")
          .slice(0, 1);

        const response: CollegeWiseNewsResponseDto = {
          college_information: {
            college_id: collegeInfo[0].college_id,
            college_name: collegeInfo[0].college_name,
            is_active: collegeInfo[0].is_active,
            short_name: collegeInfo[0].short_name,
            slug: collegeInfo[0].slug,
            logo_img: collegeInfo[0].logo_img,
          },
          news_section:
            filteredCourseByNews.length > 0
              ? filteredCourseByNews.map((content) => {
                  return {
                    title: content.title,
                    silos: content.silos,
                    meta_desc: content.meta_desc,
                    author_name: content.author_name,
                    author_image: content.image,
                    author_id: content.author_id,
                  };
                })
              : null,
        };

        return response;
      }

      const dynamicFields = await this.generateDynamicFields(
        collegeContents,
        collegeInfo[0].slug,
        collegeInfo[0].college_id
      );

      const courseCount = await this.collegeWiseCourseRepository.count({
        where: { college_id: college_id },
      });

      const response: CollegeWiseNewsResponseDto = {
        college_information: {
          college_id: collegeInfo[0].college_id,
          created_at: collegeInfo[0].created_at,
          updated_at: collegeInfo[0].updated_at,
          is_active: collegeInfo[0].is_active,
          college_name: collegeInfo[0].college_name,
          short_name: collegeInfo[0].short_name,
          search_names: collegeInfo[0].search_names,
          parent_college_id: collegeInfo[0].parent_college_id,
          city_id: collegeInfo[0].city_id,
          state_id: collegeInfo[0].state_id,
          country_id: collegeInfo[0].country_id,
          location: collegeInfo[0].location,
          PIN_code: collegeInfo[0].PIN_code,
          latitude_longitude: collegeInfo[0].latitude_longitude,
          college_email: collegeInfo[0].college_email,
          college_phone: collegeInfo[0].college_phone,
          college_website: collegeInfo[0].college_website,
          type_of_institute: collegeInfo[0].type_of_institute,
          affiliated_university_id: collegeInfo[0].affiliated_university_id,
          founded_year: collegeInfo[0].founded_year,
          logo_img: collegeInfo[0].logo_img,
          banner_img: collegeInfo[0].banner_img,
          total_student: collegeInfo[0].total_student,
          campus_size: collegeInfo[0].campus_size,
          UGC_approved: collegeInfo[0].UGC_approved,
          kapp_rating: collegeInfo[0].kapp_rating,
          kapp_score: collegeInfo[0].kapp_score,
          city: collegeInfo[0].city_name || null,
          state: collegeInfo[0].state_name || null,
          country: collegeInfo[0].country_name || null,
          primary_stream_id: collegeInfo[0].primary_stream_id,
          nacc_grade: collegeInfo[0].nacc_grade,
          slug: collegeInfo[0].slug,
          girls_only: collegeInfo[0].girls_only,
          is_university: collegeInfo[0].is_university,
          course_count: courseCount,
          meta_desc: collegeInfo[0].meta_desc,
          is_online: collegeInfo[0].is_online,
          college_brochure: collegeInfo[0].college_brochure,
          ...dynamicFields,
        },
        news_section: newsContent,
      };

      return response;
    } catch (err) {
      console.error("Error fetching news by ID:", err);
      throw new Error("An error occurred while fetching news.");
    }
  }

  async createBulk(
    createCollegeInfoDtos: CreateCollegeInfoDto[]
  ): Promise<CollegeInfo[]> {
    const batchSize = 5000;
    const totalRecords = createCollegeInfoDtos.length;
    const savedCollegeInfos: CollegeInfo[] = [];

    // Start a single transaction for the bulk operation
    await this.collegeInfoRepository.manager.transaction(
      async (entityManager) => {
        for (let i = 0; i < totalRecords; i += batchSize) {
          const batch = createCollegeInfoDtos.slice(i, i + batchSize);

          // Validate all location fields in parallel
          await Promise.all(
            batch.map((dto) => this.validateLocationFields(dto))
          );

          // Use create and save in bulk
          const collegeInfos = this.collegeInfoRepository.create(batch);

          // Use entityManager to bulk save inside the transaction
          const savedBatch = await entityManager.save(
            CollegeInfo,
            collegeInfos
          );

          // Handle slug updates in batch without real-time saving
          savedBatch.forEach((collegeInfo) => {
            if (
              collegeInfo.slug &&
              !collegeInfo.slug.includes(`-${collegeInfo.college_id}`)
            ) {
              collegeInfo.slug = collegeInfo.slug.replace("-undefined", "");
              collegeInfo.slug = `${collegeInfo.slug}-${collegeInfo.college_id}`;
            }
          });

          // Update slugs in bulk after the main insertion
          await entityManager.save(CollegeInfo, savedBatch);

          // Collect the saved colleges for return
          savedCollegeInfos.push(...savedBatch);
        }
      }
    );

    return savedCollegeInfos;
  }

  // Bulk Index College Data in Elasticsearch
  private async indexCollegesInBulk(collegeInfos: CollegeInfo[]) {
    try {
      const bulkBody = [];
      collegeInfos.forEach((collegeInfo) => {
        bulkBody.push(
          {
            index: {
              _index: "colleges",
              _id: collegeInfo.college_id.toString(),
            },
          },
          { ...collegeInfo }
        );
      });

      const result = await this.elasticsearchService.bulk({ body: bulkBody });
      this.logger.log(
        `Indexed ${collegeInfos.length} colleges in Elasticsearch: ${result.items.length}`
      );
    } catch (error) {
      this.logger.error("Error bulk indexing college data", error);
    }
  }

  async getStreamListing(): Promise<StreamListingDto[]> {
    // Step 1: Fetch college count by stream
    const query = `
        SELECT 
          collegeInfo.primary_stream_id, 
          COUNT(collegeInfo.college_id) as college_count
        FROM 
          college_info as collegeInfo
        GROUP BY 
          collegeInfo.primary_stream_id
        ORDER BY 
          college_count DESC;
      `;

    const result = await this.collegeInfoRepository.query(query);
    const streamIds = result.map((item) => item.primary_stream_id);
    const streams = await this.streamRepository.findByIds(streamIds);
    const combinedResult = result.map((item) => {
      const stream = streams.find(
        (s) => s.stream_id === item.primary_stream_id
      );
      return {
        primary_stream_id: item.primary_stream_id,
        primary_stream_name: stream ? stream.stream_name : null,
        college_count: Number(item.college_count),
        logo_url: stream ? stream.logo_url : null,
        kapp_score: stream ? stream.kapp_score : 0,
      } as StreamListingDto;
    });

    //Sort by kapp_score in descending order
    combinedResult.sort((a, b) => b.kapp_score - a.kapp_score);

    return combinedResult;
  }

  // city listing
  async getCityListing(): Promise<CityListingDto[]> {
    // Fetch cities and join with the college_info table to count the colleges
    const cities = await this.cityRepository
      .createQueryBuilder("city")
      .leftJoinAndSelect("city.college_infos", "college_info")
      .select([
        "city.city_id as city_id",
        "city.name as city_name",
        "city.logo_url as logo_url",
        "city.kapp_score as kapp_score",
        "COUNT(college_info.college_id) as college_count",
      ])
      .groupBy("city.city_id")
      .orderBy("city.kapp_score", "DESC")
      .getRawMany();

    // Map data to CityListingDto
    return cities.map((city) => ({
      city_id: city.city_id,
      city_name: city.city_name,
      college_count: parseInt(city.college_count, 10),
      logo_url: city.logo_url || null,
      kapp_score: city.kapp_score || "0",
    }));
  }

  // Get college sitemap data with available tabs (fixed version)
  async getCollegeSitemapData(
    page: number = 1,
    limit: number = 5000
  ): Promise<CollegeSitemapResponseDto> {
    const offset = (page - 1) * limit;

    const query = `
      SELECT DISTINCT
        ci.college_id,
        ci.slug,
        ci.college_name
      FROM 
        college_info ci
      JOIN college_content cc ON ci.college_id = cc.college_id
      WHERE 
        ci.is_active = true
        AND ci.slug IS NOT NULL
        AND cc.is_active = true
        AND cc.silos = 'info'
      ORDER BY ci.college_id
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT ci.college_id) as total
      FROM college_info ci
      JOIN college_content cc ON ci.college_id = cc.college_id
      WHERE ci.is_active = true 
        AND ci.slug IS NOT NULL
        AND cc.is_active = true
        AND cc.silos = 'info'
    `;

    const [colleges, countResult] = await Promise.all([
      this.dataSource.query(query, [limit, offset]),
      this.dataSource.query(countQuery),
    ]);

    const total = parseInt(countResult[0]?.total || "0", 10);

    // Get all college IDs for batch queries
    const collegeIds = colleges.map((c) => c.college_id);

    if (collegeIds.length === 0) {
      return { colleges: [], total };
    }

    // Batch fetch all content and counts
    const [
      contentResults,
      courseCountResults,
      placementCountResults,
      feesCountResults,
      rankingCountResults,
      datesCountResults,
      cutoffCountResults,
    ] = await Promise.all([
      this.dataSource.query(
        `
        SELECT college_id, silos 
        FROM college_content 
        WHERE college_id = ANY($1) AND is_active = true
      `,
        [collegeIds]
      ),
      this.dataSource.query(
        `
        SELECT college_id, COUNT(*) as count 
        FROM college_wise_course 
        WHERE college_id = ANY($1) 
        GROUP BY college_id
      `,
        [collegeIds]
      ),
      this.dataSource.query(
        `
        SELECT college_id, COUNT(*) as count 
        FROM college_wise_placement 
        WHERE college_id = ANY($1) 
        GROUP BY college_id
      `,
        [collegeIds]
      ),
      this.dataSource.query(
        `
        SELECT college_id, COUNT(*) as count 
        FROM college_wise_fees 
        WHERE college_id = ANY($1) 
        GROUP BY college_id
      `,
        [collegeIds]
      ),
      this.dataSource.query(
        `
        SELECT college_id, COUNT(*) as count 
        FROM college_ranking 
        WHERE college_id = ANY($1) 
        GROUP BY college_id
      `,
        [collegeIds]
      ),
      this.dataSource.query(
        `
        SELECT college_id, COUNT(*) as count 
        FROM college_dates 
        WHERE college_id = ANY($1) 
        GROUP BY college_id
      `,
        [collegeIds]
      ),
      this.dataSource.query(
        `
        SELECT college_id, COUNT(*) as count 
        FROM college_cutoff 
        WHERE college_id = ANY($1) 
        GROUP BY college_id
      `,
        [collegeIds]
      ),
    ]);

    // Create lookup maps for efficient access
    const contentMap = new Map<number, Set<string>>();
    contentResults.forEach((row) => {
      if (!contentMap.has(row.college_id)) {
        contentMap.set(row.college_id, new Set());
      }
      contentMap.get(row.college_id)?.add(row.silos);
    });

    const createCountMap = (results: any[]) => {
      const map = new Map<number, number>();
      results.forEach((row) => map.set(row.college_id, parseInt(row.count)));
      return map;
    };

    const courseCountMap = createCountMap(courseCountResults);
    const placementCountMap = createCountMap(placementCountResults);
    const feesCountMap = createCountMap(feesCountResults);
    const rankingCountMap = createCountMap(rankingCountResults);
    const datesCountMap = createCountMap(datesCountResults);
    const cutoffCountMap = createCountMap(cutoffCountResults);

    // Process each college
    const collegesWithTabs = colleges.map((college) => {
      const collegeId = college.college_id;
      const activeSilos = contentMap.get(collegeId) || new Set();

      const availableTabs = ["info"]; // Info tab is always available

      // Content-based tabs
      if (activeSilos.has("highlight")) availableTabs.push("highlights");
      if (
        activeSilos.has("courses") ||
        (courseCountMap.get(collegeId) || 0) > 0
      ) {
        availableTabs.push("courses");
      }
      if (activeSilos.has("fees") || (feesCountMap.get(collegeId) || 0) > 0) {
        availableTabs.push("fees");
      }
      if (activeSilos.has("admission")) availableTabs.push("admission-process");
      if (
        activeSilos.has("cutoff") ||
        (cutoffCountMap.get(collegeId) || 0) > 0
      ) {
        availableTabs.push("cutoffs");
      }
      if (
        activeSilos.has("placement") ||
        (placementCountMap.get(collegeId) || 0) > 0
      ) {
        availableTabs.push("placements");
      }
      if (
        activeSilos.has("ranking") ||
        (rankingCountMap.get(collegeId) || 0) > 0
      ) {
        availableTabs.push("rankings");
      }
      if (activeSilos.has("scholarship")) availableTabs.push("scholarship");
      if (activeSilos.has("facility")) availableTabs.push("facilities");
      if (activeSilos.has("faq")) availableTabs.push("faq");
      if (activeSilos.has("news")) availableTabs.push("news");

      return {
        college_id: college.college_id,
        slug: college.slug,
        available_tabs: availableTabs,
      };
    });

    return {
      colleges: collegesWithTabs,
      total,
    };
  }
}
