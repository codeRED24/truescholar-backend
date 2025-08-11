import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { CreateCollegeWiseCourseDto } from "./dto/create-college_wise_course.dto";
import { UpdateCollegeWiseCourseDto } from "./dto/update-college_wise_course.dto";
import { CollegeWiseCourse } from "./college_wise_course.entity";
import { CollegeInfo } from "../college-info/college-info.entity";
import { Course } from "../../courses_module/courses/courses.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
import { CollegeRanking } from "../college-ranking/college-ranking.entity";
import { CollegeWiseFees } from "../college-wise-fees/college-wise-fees.entity";
import { RankingAgency } from "../ranking-agency/ranking_agency.entity";
import { CollegeWisePlacement } from "../college-wise-placement/college-wise-placement.entity";
import { CollegeCutoff } from "../college-cutoff/college_cutoff.entity";
import { CollegeWiseCourseSection } from "./dto/create-college_wise_course.dto";
import { CollegeSection } from "./dto/create-college_wise_course.dto";
import { FilterSection } from "./dto/create-college_wise_course.dto";
import { BadRequestException } from "@nestjs/common";
import { Specialization } from "../../specializations/specialization/specialization.entity";
import { Stream } from "../../helper_entities/stream/stream.entity";
import { Author } from "../../articles_modules/author/author.entity";
import { UpdateSingleCourseDto } from "./dto/update-course.dto";

import { CreateCollegeWiseCoursesDto } from "../../college/college-wise-course/dto/create-college_wise_courses.dto";
import { CollegeDates } from "../college-dates/college-dates.entity";
@Injectable()
export class CollegeWiseCourseService {
  constructor(
    @InjectRepository(CollegeWiseCourse)
    private readonly collegeWiseCourseRepository: Repository<CollegeWiseCourse>,
    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Specialization)
    private readonly specializationRepo: Repository<Specialization>,
    @InjectRepository(CourseGroup)
    private readonly courseGroupRepository: Repository<CourseGroup>,
    @InjectRepository(Stream)
    private readonly streamRepository: Repository<Stream>,
    @InjectRepository(CollegeRanking)
    private readonly collegeRankingRepository: Repository<CollegeRanking>,
    @InjectRepository(CollegeWiseFees)
    private readonly collegeWiseFeesRepository: Repository<CollegeWiseFees>,
    @InjectRepository(RankingAgency)
    private readonly rankingAgencyRepository: Repository<RankingAgency>,
    @InjectRepository(CollegeWisePlacement)
    private readonly collegePlacementRepository: Repository<CollegeWisePlacement>,
    @InjectRepository(CollegeCutoff)
    private readonly collegeCutoffRepository: Repository<CollegeCutoff>,
    @InjectRepository(CollegeDates)
    private readonly collegeDatesRepository: Repository<CollegeDates>
  ) {}

  async findAll(name?: string): Promise<CollegeWiseCourse[]> {
    if (name) {
      return this.collegeWiseCourseRepository.find({ where: { name } });
    }
    return this.collegeWiseCourseRepository.find();
  }

  async findOne(id: number): Promise<CollegeWiseCourse> {
    const course = await this.collegeWiseCourseRepository.findOne({
      where: { college_wise_course_id: id },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }
  // POST
  async create(
    createCollegeWiseCourseDto: CreateCollegeWiseCourseDto
  ): Promise<CollegeWiseCourse> {
    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: createCollegeWiseCourseDto.college_id },
    });

    if (!college) {
      throw new NotFoundException(
        `College with ID ${createCollegeWiseCourseDto.college_id} not found`
      );
    }

    if (createCollegeWiseCourseDto.course_group_id) {
      const courseGroup = await this.courseGroupRepository.findOne({
        where: { course_group_id: createCollegeWiseCourseDto.course_group_id },
      });

      if (!courseGroup) {
        throw new NotFoundException(
          `CourseGroup with ID ${createCollegeWiseCourseDto.course_group_id} not found`
        );
      }
    }

    const course = this.collegeWiseCourseRepository.create(
      createCollegeWiseCourseDto
    );
    return this.collegeWiseCourseRepository.save(course);
  }

  // PATCH
  async update(
    id: number,
    updateCollegeWiseCourseDto: UpdateCollegeWiseCourseDto
  ): Promise<CollegeWiseCourse> {
    const course = await this.findOne(id);

    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: updateCollegeWiseCourseDto.college_id },
    });
    if (!college) {
      throw new NotFoundException(
        `College with ID ${updateCollegeWiseCourseDto.college_id} not found`
      );
    }

    if (updateCollegeWiseCourseDto.course_group_id) {
      const courseGroup = await this.courseGroupRepository.findOne({
        where: { course_group_id: updateCollegeWiseCourseDto.course_group_id },
      });

      if (!courseGroup) {
        throw new NotFoundException(
          `CourseGroup with ID ${updateCollegeWiseCourseDto.course_group_id} not found`
        );
      }
    }

    Object.assign(course, updateCollegeWiseCourseDto);
    return this.collegeWiseCourseRepository.save(course);
  }
  async delete(id: number): Promise<void> {
    const result = await this.collegeWiseCourseRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }

  // GET /college-wise course/by-college?cid=7000007
  async findByCollegeId(
    collegeId: number,
    courseId?: number
  ): Promise<CollegeWiseCourse[]> {
    const queryBuilder =
      this.collegeWiseCourseRepository.createQueryBuilder("collegeWiseCourse");

    if (collegeId) {
      queryBuilder.andWhere("college-info.college_id = :collegeId", {
        collegeId,
      });
    }

    if (courseId) {
      queryBuilder.andWhere("course.course_id = :courseId", { courseId });
    }

    const results = await queryBuilder.getMany();

    if (!results.length) {
      throw new NotFoundException(
        `No content found for College ID ${collegeId}` +
          (courseId ? ` and Course ID ${courseId}` : "")
      );
    }

    return results;
  }

  // Returns basic college info and minimal data of college's courses
  async getCollegeBasicWithCourses(collegeId: number, course_id: number) {
    // Fetch basic college info
    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: collegeId, is_active: Not(false) },
      select: [
        "college_id",
        "college_name",
        "slug",
        "is_online",
        "type_of_institute",
        "founded_year",
        "total_student",
        "campus_size",
        "logo_img",
      ],
    });
    if (!college) {
      throw new NotFoundException(`College with ID ${collegeId} not found`);
    }

    let CollegesCourses;
    let coursesCount = 0;

    if (course_id) {
      // Fetch the filtered courses and total count in parallel
      const [courses, count] = await Promise.all([
        this.collegeWiseCourseRepository.find({
          where: [
            {
              college_wise_course_id: course_id,
              college_id: collegeId,
            },
          ],
          select: [
            "college_wise_course_id",
            "name",
            "course_id",
            "degree_type",
            "level",
            "duration",
            "eligibility",
            "is_online",
            "level",
            "course_format",
            "duration_type",
            "fees",
            "salary",
            "course_brochure",
            "syllabus",
            "total_seats",
          ],
        }),
        this.collegeWiseCourseRepository.count({
          where: { college_id: collegeId },
        }),
      ]);
      CollegesCourses = courses;
      coursesCount = count;
    } else {
      // Fetch all courses and count in parallel
      const [courses, count] = await Promise.all([
        this.collegeWiseCourseRepository.find({
          where: [{ college_id: collegeId }],
          select: [
            "college_wise_course_id",
            "name",
            // "course_id",
            // "degree_type",
            // "level",
            // "duration",
            // "eligibility",
            // "is_online",
            // "level",
            // "course_format",
            // "duration_type",
          ],
        }),
        this.collegeWiseCourseRepository.count({
          where: { college_id: collegeId },
        }),
      ]);
      CollegesCourses = courses;
      coursesCount = count;
    }

    return {
      success: true,
      data: {
        college: {
          ...college,
          CollegesCourses,
          coursesCount,
        },
      },
    };
  }

  //bulk create
  async createBulk(
    createCollegeWiseCoursesDto: CreateCollegeWiseCourseDto[]
  ): Promise<CollegeWiseCourse[]> {
    const createdCourses = [];
    for (const dto of createCollegeWiseCoursesDto) {
      const college = await this.collegeInfoRepository.findOne({
        where: { college_id: dto.college_id },
      });
      if (!college) {
        throw new NotFoundException(
          `College with ID ${dto.college_id} not found`
        );
      }
      if (dto.course_group_id) {
        const courseGroup = await this.courseGroupRepository.findOne({
          where: { course_group_id: dto.course_group_id },
        });
        if (!courseGroup) {
          throw new NotFoundException(
            `CourseGroup with ID ${dto.course_group_id} not found`
          );
        }
      }
      const course = this.collegeWiseCourseRepository.create(dto);
      createdCourses.push(course);
    }
    // Bulk save to the database
    return this.collegeWiseCourseRepository.save(createdCourses);
  }

  async getCourseDetails(id: number): Promise<any> {
    const collegeWiseCourse = await this.collegeWiseCourseRepository.findOne({
      where: { college_wise_course_id: id },
      relations: ["college", "courseGroup"],
    });

    if (!collegeWiseCourse) {
      throw new NotFoundException(
        `College-wise course with ID ${id} not found`
      );
    }

    const { college_id: collegeId, course_group_id: courseGroupId } =
      collegeWiseCourse;
    const college = await this.collegeInfoRepository.findOne({
      where: { college_id: collegeId },
      relations: ["collegeContents"],
    });

    if (!college) {
      throw new NotFoundException(`College with ID ${collegeId} not found`);
    }

    const [
      filteredCollegeRankings,
      filteredCollegeWiseFees,
      filteredCollegePlacements,
      filteredCollegeCutoffs,
      dynamicData,
    ] = await Promise.all([
      this.collegeRankingRepository.find({
        where: { college_id: collegeId, course_group_id: courseGroupId },
      }),
      this.collegeWiseFeesRepository.find({
        where: { college_id: collegeId, course_group_id: courseGroupId },
      }),
      this.collegePlacementRepository.find({
        where: { college_id: collegeId },
      }),
      this.collegeCutoffRepository.find({
        where: { college_id: collegeId, course_group_id: courseGroupId },
      }),
      this.generateDynamicFields(
        college.collegeContents,
        college.slug,
        college.college_id
      ),
    ]);

    // Fetch `RankingAgency` details for the filtered rankings
    const rankingAgencyIds = filteredCollegeRankings.map(
      (ranking) => ranking.ranking_agency_id
    );
    const rankingAgencies =
      await this.rankingAgencyRepository.findByIds(rankingAgencyIds);

    // Map `rankingAgency` details to the filtered rankings
    const rankingsWithAgencyDetails = filteredCollegeRankings.map((ranking) => {
      const agency = rankingAgencies.find(
        (agency) => agency.ranking_agency_id === ranking.ranking_agency_id
      );
      return {
        ...ranking,
        ranking_agency_name: agency?.name || null,
        ranking_agency_image: agency?.logo || null,
        ranking_agency_short_name: agency?.short_name || null,
      };
    });

    // Fetch `courseGroup` with minimal data
    const courseGroup = await this.courseGroupRepository.findOne({
      where: { course_group_id: courseGroupId },
    });

    if (!courseGroup) {
      throw new NotFoundException(
        `Course group with ID ${courseGroupId} not found`
      );
    }

    // Remove `collegeContents` and structure `dynamicFields` correctly
    const { collegeContents, ...collegeCleaned } = college;
    const { dynamic_fields, additional_fields } = dynamicData;

    return {
      college_information: {
        ...collegeCleaned,
        dynamic_fields,
        additional_fields,
      },
      college_wise_course: collegeWiseCourse,
      course_group_section: courseGroup,
      college_rankings_section: rankingsWithAgencyDetails,
      college_wise_fees_section: filteredCollegeWiseFees,
      college_placement_section: filteredCollegePlacements,
      college_cutoff_section: filteredCollegeCutoffs,
      placement_count: filteredCollegePlacements.length,
      cutoff_count: filteredCollegeCutoffs.length,
    };
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
      this.collegePlacementRepository.count({
        where: { college_id: collegeId },
      }),
      this.collegeWiseFeesRepository.count({
        where: { college_id: collegeId },
      }),
      this.collegeRankingRepository.count({ where: { college_id: collegeId } }),
      this.collegeDatesRepository.count({ where: { college_id: collegeId } }),
      this.collegeCutoffRepository.count({ where: { college_id: collegeId } }),
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

  async findAllWithDetails(): Promise<any> {
    const data = await this.collegeWiseCourseRepository
      .createQueryBuilder("cwc")
      .leftJoinAndSelect("cwc.college", "college")
      .leftJoinAndSelect("cwc.courseGroup", "courseGroup")
      .select([
        // Fields for college_wise_course_section
        "cwc.college_wise_course_id",
        "cwc.name",
        "cwc.salary",
        "cwc.fees",
        "cwc.kapp_rating",
        "cwc.course_brochure",
        "cwc.total_seats",
        "cwc.duration",
        "cwc.duration_type",
        "cwc.is_integrated_course",
        "cwc.degree_type",
        "cwc.level",
        "cwc.eligibility",
        "cwc.course_id",
        "cwc.college.college_id",
        "cwc.course_group_id",
        "courseGroup.name AS course_group_name",

        // Fields for college_section
        "college.college_id",
        "college.college_name AS college_name",
        "college.slug AS college_slug",
        "college.logo_img AS college_logo",
        "college.type_of_institute AS college_type",
        "college.college_brochure AS college_brochure ",
        "college.is_online AS is_online",
      ])
      .where("cwc.is_online = :isOnline", { isOnline: true })
      .andWhere("cwc.is_active = :isActive", { isActive: true })
      .getRawMany();

    const college_wise_course_section = data.map((item) => ({
      college_wise_course_id: item.cwc_college_wise_course_id,
      name: item.cwc_name,
      salary: item.cwc_salary,
      fees: item.cwc_fees,
      kapp_rating: item.cwc_kapp_rating,
      course_brochure: item.cwc_course_brochure,
      total_seats: item.cwc_total_seats,
      duration: item.cwc_duration,
      duration_type: item.cwc_duration_type,
      is_integrated: item.cwc_is_integrated_course,
      degree_type: item.cwc_degree_type,
      level: item.cwc_level,
      eligibility: item.cwc_eligibility,
      course_id: item.cwc_course_id,
      course_group_id: item.cwc_course_group_id,
      course_group_name: item.course_group_name,
      college_id: item.college_id,
    }));

    const college_section = [
      ...new Map(
        data
          .filter((item) => item.college_id) // Ensure only rows with college_id are considered
          .map((item) => [
            item.college_id,
            {
              college_id: item.college_id,
              college_name: item.college_name,
              college_slug: item.college_slug,
              college_logo: item.college_logo,
              college_type: item.college_type,
              college_brochure: item.college_brochure,
              is_online: item.is_online,
            },
          ])
      ).values(),
    ];
    const filter_section = {
      degree_type: [...new Set(data.map((item) => item.cwc_degree_type))],
      college_type: [...new Set(data.map((item) => item.college_type))],
      course_group_name: [
        ...new Set(data.map((item) => item.course_group_name)),
      ],
    };

    return {
      college_wise_course_section,
      college_section,
      filter_section,
    };
  }

  async createCollegeWiseCourse(dto: CreateCollegeWiseCoursesDto) {
    if (!dto.college_id) {
      throw new BadRequestException("college_id is required");
    }

    const existingCourse = await this.collegeWiseCourseRepository.findOne({
      where: { college_id: dto.college_id },
      select: ["course_group_id"],
    });

    if (!existingCourse || !existingCourse.course_group_id) {
      throw new BadRequestException(
        "No course_group_id found for this college_id"
      );
    }

    dto.course_group_id = existingCourse.course_group_id;

    const newCourse = this.collegeWiseCourseRepository.create(dto);
    return this.collegeWiseCourseRepository.save(newCourse);
  }

  async getCoursesWithDetails(
    page: number,
    limit: number,
    college_id?: number
  ) {
    const query = this.collegeWiseCourseRepository
      .createQueryBuilder("cwc")
      .select([
        "cwc.college_wise_course_id",
        "cwc.course_id",
        "cwc.is_active",
        "course.course_name",
        "course.course_mode",
      ])
      .leftJoin("cwc.courses", "course")
      .where("cwc.course_id IS NOT NULL")
      .andWhere("cwc.is_active = :isActive", { isActive: true });

    // Add condition if college_id is provided
    if (college_id) {
      query.andWhere("cwc.college_id = :collegeId", { collegeId: college_id });
    }

    const [data, total] = await query
      .orderBy("cwc.college_wise_course_id", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findCourseDetails(course_id: number) {
    const courseDetails = await this.collegeWiseCourseRepository.findOne({
      where: { course_id },
      relations: ["courseGroup", "author", "courses"],
    });

    if (!courseDetails) {
      return { message: "Course not found" };
    }

    const course = await this.courseRepository.findOne({
      where: { course_id },
    });

    if (!course) {
      return { message: "Course data missing in courses table" };
    }

    const { course_group_id, specialization_id, stream_id } = course;

    const courseGroup = await this.courseGroupRepository.findOne({
      where: { course_group_id },
    });

    const specialization = await this.specializationRepo.findOne({
      where: { specialization_id },
    });

    const stream = await this.streamRepository.findOne({
      where: { stream_id },
    });

    const collegeFees = await this.collegeWiseFeesRepository.findOne({
      where: { college_id: courseDetails.college_id },
    });

    return {
      short_name: course.short_name,
      course_type: course.course_type,
      is_active: courseDetails.is_active ?? null,
      course_group_name: courseGroup.full_name ?? "",
      level: courseDetails.level ?? null,
      duration: courseDetails.duration ?? null,
      total_seats: courseDetails.total_seats ?? null,
      eligibility: courseDetails.eligibility ?? null,
      kapp_rating: courseDetails.kapp_rating ?? null,
      refrence_url: courseDetails.refrence_url ?? null,
      description: courseDetails.description ?? null,
      course_group: courseGroup ? courseGroup.name : null,
      specialization: specialization ? specialization.full_name : null,
      stream_name: stream ? stream.stream_name : null,
      fees: collegeFees
        ? {
            // tution_fees: collegeFees.tution_fees_max_amount ?? null,
            // hostel_fees: collegeFees.hostel_fees ?? null,
            // admission_fees: collegeFees.admission_fees ?? null,
            // exam_fees: collegeFees.exam_fees ?? null,
            // category: collegeFees.category ?? null,
            // type: collegeFees.type ?? null,
            year: collegeFees.year,
            other_fees: collegeFees.other_fees,
          }
        : null,
    };
  }

  async updateCourseDetails(
    course_id: number,
    updateData: UpdateSingleCourseDto
  ) {
    const course = await this.collegeWiseCourseRepository.findOne({
      where: { course_id },
    });

    if (!course) {
      throw new NotFoundException("Course not found");
    }

    let fees = await this.collegeWiseFeesRepository.findOne({
      where: { college_id: course.college_id },
    });

    Object.assign(course, updateData);
    await this.collegeWiseCourseRepository.save(course);

    if (fees) {
      Object.assign(fees, {
        year: updateData.year ?? fees.year,
        // tution_fees: updateData.tution_fees ?? fees.tution_fees,
        // hostel_fees: updateData.hostel_fees ?? fees.hostel_fees,
        // admission_fees: updateData.admission_fees ?? fees.admission_fees,
        // exam_fees: updateData.exam_fees ?? fees.exam_fees,
        other_fees: updateData.other_fees ?? fees.other_fees,
        // category: updateData.category ?? fees.category,
        // type: updateData.type ?? fees.type,
      });

      await this.collegeWiseFeesRepository.save(fees);
    }

    return {
      message: "Course and Fees updated successfully",
      updatedFields: updateData,
    };
  }
}
