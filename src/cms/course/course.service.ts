import {
    Injectable,
    ConflictException,
    NotFoundException,
    BadGatewayException,
    BadRequestException
  } from "@nestjs/common";
  import { InjectRepository } from "@nestjs/typeorm";
  import { Repository, Like, QueryFailedError, DataSource } from "typeorm";
  import { CreateCourseDto } from "./dto/create-course.dto";
  import { Course } from "../../courses_module/courses/courses.entity";
import { Stream } from "../../helper_entities/stream/stream.entity";
import { UpdateCourseDto } from "../course/dto/update-course.dto";
import { CourseLevels } from "../../common/enums";
import { tryCatchWrapper } from "../../config/application.errorHandeler";

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Stream)
    private readonly streamRepository: Repository<Stream>,

    private readonly dataSource: DataSource
  ) {}

  // POST: Create a new course
  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const { stream_id, duration_value, ...courseData } = createCourseDto;

    if (stream_id) {
      const stream = await this.streamRepository.findOne({
        where: { stream_id },
      });
      if (!stream) {
        throw new NotFoundException(`Stream with ID ${stream_id} not found`);
      }
    }

    const newCourse = this.courseRepository.create({
      ...courseData,
      stream_id,
      is_active: false,
      duration_value,
    });

    try {
      return await this.courseRepository.save(newCourse);
    } catch (error) {
      throw new ConflictException("Error while creating the course");
    }
  }

  async getAllCourses(filters: {
    page: number;
    limit: number;
    streamId?: string;
    specializationId?: string;
    courseLevel?: CourseLevels;
    isActive?: boolean;
    courseName?: string;
  }) {
    const {
      page,
      limit,
      streamId,
      specializationId,
      courseLevel,
      isActive,
      courseName,
    } = filters;
    const skip = (page - 1) * limit;

    let query = this.courseRepository
      .createQueryBuilder("c")
      .select([
        "c.course_id",
        "c.course_name",
        "c.is_active",
        "c.course_level",
        "c.stream_id",
        "c.specialization_id",
      ])
      .orderBy("c.course_name", "ASC")
      .skip(skip)
      .take(limit);

    if (streamId) {
      query = query.andWhere("c.stream_id IN (:...streamId)", {
        streamId: streamId.split(","),
      });
    }

    if (specializationId) {
      query = query.andWhere("c.specialization_id IN (:...specializationId)", {
        specializationId: specializationId.split(","),
      });
    }

    if (courseLevel && Object.values(CourseLevels).includes(courseLevel)) {
      query = query.andWhere("c.course_level = :courseLevel", { courseLevel });
    }

    if (isActive !== undefined) {
      query = query.andWhere("c.is_active = :isActive", { isActive });
    }

    if (courseName) {
      query = query.andWhere("LOWER(c.course_name) LIKE LOWER(:courseName)", {
        courseName: `%${courseName}%`,
      });
    }

    const [coursesResult, totalCourses] = await Promise.all([
      query.getMany(),
      query.getCount(),
    ]);

    return {
      success: true,
      message: "Data fetched successfully",
      data: coursesResult,
      total: totalCourses,
    };
  }

  async updateCourse(
    updateCourseDto: UpdateCourseDto,
    course_id: number,
    user_id: number
  ): Promise<Course> {
    const { stream_id, duration_value, ...courseData } = updateCourseDto;

    // Check for active info silos
    if (updateCourseDto.is_active) {
      const infoArticle = await this.dataSource.query(
        "SELECT silos from course_content WHERE course_id = $1 AND silos = $2 AND is_active = $3;",
        [course_id, "overview", true]
      );
      if (!infoArticle?.length) {
        throw new BadRequestException(
          "To activate the course, an active overview article is mandatory."
        );
      }
    }

    const course = await this.courseRepository.findOne({
      where: { course_id },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${course_id} not found`);
    }

    if (stream_id) {
      const stream = await this.streamRepository.findOne({
        where: { stream_id },
      });
      if (!stream) {
        throw new NotFoundException(`Stream with ID ${stream_id} not found`);
      }
    }

    Object.assign(course, {
      ...courseData,
      stream_id,
      duration_value,
      updated_by: user_id,
      updated_at: new Date(),
    });

    try {
      return await this.courseRepository.save(course);
    } catch (error) {
      throw new ConflictException("Error while updating the course");
    }
  }

  async searchCourse(course_name: string, page?: number, limit?: number) {
    return tryCatchWrapper(async () => {
      const params: any[] = [];
      if (course_name) params.push(`%${course_name}%`);
      let paginationClause = "";

      // Add LIMIT and OFFSET only if page and limit are provided
      if (page && limit) {
        const offset = (page - 1) * limit;
        params.push(limit, offset);
        paginationClause = `LIMIT $${params.length - 1} OFFSET $${params.length}`;
      }

      // Main query
      const query = `
        SELECT course_id, course_name
        FROM courses
        ${course_name ? "WHERE course_name ILIKE $1" : ""}
        ${paginationClause};
      `;

      const result = await this.dataSource.query(query, params);

      return {
        success: true,
        message: "Data fetched successfully",
        data: result,
      };
    });
  }

  async getCourseByCollegeId(college_id: number, course_name?: string) {
    return tryCatchWrapper(async () => {
        const college = await this.dataSource.query(
            "SELECT college_id FROM college_info WHERE college_id = $1",
            [college_id]
        );

        if (!college.length) {
            throw new BadRequestException(
                `College with ID ${college_id} not found.`
            );
        }

        let query = `
            SELECT DISTINCT(cw.course_id), c.course_name
            FROM college_wise_course AS cw
            LEFT JOIN courses AS c 
            ON cw.course_id = c.course_id
            WHERE cw.college_id = $1 
            AND cw.is_active = true 
            AND c.is_active = true
        `;

        const params: any[] = [college_id];

        if (course_name) {
            query += ` AND c.course_name ILIKE $${params.length + 1}`;
            params.push(`%${course_name}%`);
        }

        const courseGroupContentData = await this.dataSource.query(query, params);

        return {
            success: true,
            message: `Courses for College with ID ${college_id} fetched successfully`,
            result: courseGroupContentData,
        };
    });
}

  
   
  }
  
    
    
    
     
  