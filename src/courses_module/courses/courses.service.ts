import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, QueryFailedError } from "typeorm";
import { Course } from "./courses.entity";
import { CreateCourseDto } from "./dto/create-courses.dto";
import { UpdateCourseDto } from "./dto/update-courses.dto";
import { Specialization } from "../../specializations/specialization/specialization.entity";
import { CourseGroup } from "../course-group/course_group.entity";
import { DataSource } from "typeorm";
import { CourseContent } from "../../cms/course/course-content/course-content.entity";

import { tryCatchWrapper } from "../../config/application.errorHandeler";
import { ILike } from "typeorm";
@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Specialization)
    private readonly specializationRepository: Repository<Specialization>,
    @InjectRepository(CourseGroup)
    private readonly courseGroupRepository: Repository<CourseGroup>,
    private readonly dataSource: DataSource,
    @InjectRepository(CourseContent)
    private readonly courseContentRepository: Repository<CourseContent>
  ) {}

  // GET ALL
  async findAll(course_name?: string, spec_id?: number): Promise<Course[]> {
    const whereConditions: any = {};

    if (course_name) {
      whereConditions.course_name = Like(`%${course_name}%`);
    }

    if (spec_id) {
      whereConditions.specialization_id = spec_id;
    }

    return this.courseRepository.find({
      where: whereConditions,
    });
  }

  // GET /courses/:id
  async findOne(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { course_id: id },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  // POST: Create a new course
  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    // Check if the provided specialization exists
    const specialization = await this.specializationRepository.findOne({
      where: { specialization_id: createCourseDto.specialization_id },
    });

    if (!specialization) {
      throw new NotFoundException(
        `Specialization with ID ${createCourseDto.specialization_id} not found`
      );
    }

    // Check if the provided course_group_id exists
    const courseGroup = await this.courseGroupRepository.findOne({
      where: { course_group_id: createCourseDto.course_group_id },
    });

    if (!courseGroup) {
      throw new NotFoundException(
        `CourseGroup with ID ${createCourseDto.course_group_id} not found`
      );
    }

    // Create course with valid course_group_id
    const course = this.courseRepository.create({
      ...createCourseDto,
      specialization_id: specialization.specialization_id,
      course_group_id: courseGroup.course_group_id,
    });

    try {
      return await this.courseRepository.save(course);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("Course ID must be unique");
      }
      throw error;
    }
  }
  // PATCH /courses/:id
  async update(
    id: number,
    updateCourseDto: UpdateCourseDto
  ): Promise<{ message: string; data?: Course }> {
    const course = await this.findOne(id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // Check if the provided course_group_id exists
    if (updateCourseDto.course_group_id) {
      const courseGroup = await this.courseGroupRepository.findOne({
        where: { course_group_id: updateCourseDto.course_group_id },
      });

      if (!courseGroup) {
        throw new NotFoundException(
          `CourseGroup with ID ${updateCourseDto.course_group_id} not found`
        );
      }
    }

    try {
      await this.courseRepository.update(id, updateCourseDto);
      const updatedCourse = await this.findOne(id);
      return { message: "Course updated successfully", data: updatedCourse };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("Course ID must be unique");
      }
      throw error;
    }
  }

  // DELETE /courses/:id
  async delete(id: number): Promise<{ message: string }> {
    const course = await this.findOne(id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    await this.courseRepository.delete(id);
    return { message: "Course deleted successfully" };
  }

  // Create BULK API

  async createBulk(createCourseDtos: CreateCourseDto[]): Promise<Course[]> {
    const courses: Course[] = [];

    for (const createCourseDto of createCourseDtos) {
      // Check if the provided specialization exists
      const specialization = await this.specializationRepository.findOne({
        where: { specialization_id: createCourseDto.specialization_id },
      });

      if (!specialization) {
        throw new NotFoundException(
          `Specialization with ID ${createCourseDto.specialization_id} not found`
        );
      }

      const courseGroup = await this.courseGroupRepository.findOne({
        where: { course_group_id: createCourseDto.course_group_id },
      });

      if (!courseGroup) {
        throw new NotFoundException(
          `CourseGroup with ID ${createCourseDto.course_group_id} not found`
        );
      }

      const course = this.courseRepository.create({
        ...createCourseDto,
        specialization_id: specialization.specialization_id,
        course_group_id: courseGroup.course_group_id,
      });

      courses.push(course);
    }

    try {
      return await this.courseRepository.save(courses);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("One or more Course IDs must be unique");
      }
      throw error;
    }
  }

  async getCourseContentBySilo(slug: string, silo_name: string) {
    return tryCatchWrapper(async () => {
      const course = await this.dataSource.query(
        `SELECT course_id, course_name, short_name, slug, description, duration, created_at, updated_at 
         FROM courses 
         WHERE slug = $1;`,
        [slug]
      );

      if (!course || !course.length) {
        throw new NotFoundException(`Course with slug ${slug} not found`);
      }

      const course_id = course[0].course_id;

      const [latestContent, distinctSilos] = await Promise.all([
        this.dataSource.query(
          `
            SELECT cc.*, 
                   a.author_name 
            FROM course_content AS cc
            LEFT JOIN author AS a ON cc.author_id = a.author_id
            WHERE cc.course_id = $1 
            AND cc.silos = $2 
            AND cc.is_active = true 
            ORDER BY cc.updated_at DESC 
            LIMIT 1;
          `,
          [course_id, silo_name]
        ),
        this.dataSource.query(
          "SELECT DISTINCT(silos) FROM course_content WHERE course_id = $1 AND is_active = true;",
          [course_id]
        ),
      ]);

      let eligibilityData;
      if (silo_name === "info") {
        eligibilityData = await this.dataSource.query(
          "SELECT eligibility FROM courses WHERE course_id = $1;",
          [course_id]
        );
      }

      return {
        courseInformation: {
          ...course[0],
        },
        courseContent: latestContent.length > 0 ? latestContent[0] : null,
        distinctSilos,
        ...(eligibilityData && {
          eligibility: eligibilityData[0]?.eligibility,
        }),
      };
    });
  }

  async getInfoWithSilos(courseId: number) {
    const infoRecords = await this.courseContentRepository.find({
      where: { course_id: courseId, silos: "info", is_active: true },
    });

    const allSilos = await this.courseContentRepository
      .createQueryBuilder("content")
      .select("DISTINCT content.silos", "silos")
      .where("content.course_id = :courseId", { courseId })
      .andWhere("content.is_active = true")
      .getRawMany();

    return {
      infoRecords,
      allSilos: allSilos.map((s) => s.silos),
    };
  }

  async getAllCourses(page: number = 1, limit: number = 9, search?: string) {
    const skip = (page - 1) * limit;

    const whereClause = search ? { course_name: ILike(`%${search}%`) } : {};

    const [data, total] = await this.courseRepository.findAndCount({
      select: [
        "course_id",
        "course_name",
        // "course_mode"
      ],
      where: whereClause,
      order: { course_id: "ASC" },
      take: limit,
      skip: skip,
    });

    return {
      data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getInfoBySlug(slug: string) {
    const course = await this.dataSource.query(
      `SELECT course_id, short_name FROM courses WHERE slug = $1;`,
      [slug]
    );

    if (course.length === 0) {
      return { message: "Course not found" };
    }

    const course_id = course[0].course_id;
    const short_name = course[0].short_name;

    const infoRecords = await this.dataSource.query(
      `SELECT * FROM course_content 
       WHERE course_id = $1 
       AND silos = 'overview' 
       AND is_active = true;`,
      [course_id]
    );

    const allSilos = await this.dataSource.query(
      `SELECT DISTINCT silos FROM course_content 
       WHERE course_id = $1 
       AND silos <> 'overview';`,
      [course_id]
    );

    return {
      infoRecords: infoRecords.map((record) => ({
        ...record,
        short_name,
      })),
      allSilos: allSilos.map((s: { silos: string }) => s.silos),
    };
  }
}
