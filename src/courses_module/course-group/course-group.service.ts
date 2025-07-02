import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, QueryFailedError } from "typeorm";
import { CourseGroup } from "./course_group.entity";
import { CreateCourseGroupDto } from "./dto/create-course_group.dto";
import { UpdateCourseGroupDto } from "./dto/update-course_group.dto";
import { Stream } from "../../helper_entities/stream/stream.entity";
import { CollegeWiseCourse } from "../../college/college-wise-course/college_wise_course.entity";
import { CollegeInfo } from "../../college/college-info/college-info.entity";
import { In } from "typeorm";

@Injectable()
export class CourseGroupService {
  constructor(
    @InjectRepository(CourseGroup)
    private readonly courseGroupRepository: Repository<CourseGroup>,
    @InjectRepository(Stream)
    private readonly streamRepository: Repository<Stream>,
    @InjectRepository(CollegeWiseCourse)
    private readonly collegeWiseCourseRepository: Repository<CollegeWiseCourse>,
    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>
  ) {}

  // GET ALL
  async findAll(name?: string): Promise<CourseGroup[]> {
    if (name) {
      return this.courseGroupRepository.find({
        where: {
          name: Like(`%${name}%`),
        },
      });
    }
    return this.courseGroupRepository.find();
  }

  // GET /course_group/:id
  async findOne(id: number): Promise<CourseGroup> {
    const courseGroup = await this.courseGroupRepository.findOne({
      where: { course_group_id: id },
    });
    if (!courseGroup) {
      throw new NotFoundException(`Course group with ID ${id} not found`);
    }
    return courseGroup;
  }

  // POST
  async create(
    createCourseGroupDto: CreateCourseGroupDto
  ): Promise<CourseGroup> {
    const stream = await this.streamRepository.findOne({
      where: { stream_id: createCourseGroupDto.stream_id },
    });

    if (!stream) {
      throw new NotFoundException(
        `Stream with ID ${createCourseGroupDto.stream_id} Not Found`
      );
    }

    const courseGroup = this.courseGroupRepository.create({
      ...createCourseGroupDto,
      stream,
    });
    try {
      return await this.courseGroupRepository.save(courseGroup);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("Course group ID must be unique");
      }
      throw error;
    }
  }

  // PATCH /course_group/:id
  async update(
    id: number,
    updateCourseGroupDto: UpdateCourseGroupDto
  ): Promise<{ message: string; data?: CourseGroup }> {
    const courseGroup = await this.findOne(id);
    if (!courseGroup) {
      throw new NotFoundException(`Course group with ID ${id} not found`);
    }
    await this.courseGroupRepository.update(id, updateCourseGroupDto);
    const updatedCourseGroup = await this.findOne(id);
    return {
      message: `Course group with ID ${id} updated successfully`,
      data: updatedCourseGroup,
    };
  }

  // DELETE /course_group/:id
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.courseGroupRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Course group with ID ${id} not found`);
    }
    return { message: `Course group with ID ${id} deleted successfully` };
  }

  // Create Bulk API:
  async createBulk(
    createCourseGroupsDto: CreateCourseGroupDto[]
  ): Promise<{ message: string; data: CourseGroup[] }> {
    const createdCourseGroups: CourseGroup[] = [];

    // Using transaction for bulk insertion
    const queryRunner =
      this.courseGroupRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      for (const createCourseGroupDto of createCourseGroupsDto) {
        const stream = await this.streamRepository.findOne({
          where: { stream_id: createCourseGroupDto.stream_id },
        });

        if (!stream) {
          throw new NotFoundException(
            `Stream with ID ${createCourseGroupDto.stream_id} not found`
          );
        }

        const courseGroup = this.courseGroupRepository.create({
          ...createCourseGroupDto,
          stream,
        });

        try {
          const savedCourseGroup = await queryRunner.manager.save(courseGroup);
          createdCourseGroups.push(savedCourseGroup);
        } catch (error) {
          if (
            error instanceof QueryFailedError &&
            error.message.includes(
              "duplicate key value violates unique constraint"
            )
          ) {
            throw new ConflictException(`Course group with ID must be unique`);
          }
          throw error;
        }
      }

      // Commit the transaction if all inserts are successful
      await queryRunner.commitTransaction();

      return {
        message: "Course groups created successfully",
        data: createdCourseGroups,
      };
    } catch (error) {
      // Rollback the transaction in case of any failure
      await queryRunner.rollbackTransaction();
      throw new BadRequestException("Failed to create course groups");
    } finally {
      // Release the query runner after completion
      await queryRunner.release();
    }
  }

  // async getCourseGroupListing(courseGroupId: number) {
  //   // Fetch basic info from CourseGroup table
  //   const courseGroup = await this.courseGroupRepository.findOne({
  //     where: { course_group_id: courseGroupId },
  //   });

  //   if (!courseGroup) {
  //     throw new NotFoundException(
  //       `Course group with ID ${courseGroupId} not found`
  //     );
  //   }

  //   // Fetch related college courses
  //   const collegeWiseCourses = await this.collegeWiseCourseRepository.find({
  //     where: { course_group_id: courseGroupId },
  //   });

  //   // Group by course name
  //   const uniqueCollegeIds = new Set<number>();
  //   const collegeSection = [];

  //   for (const collegeWiseCourse of collegeWiseCourses) {
  //     const college = await this.collegeInfoRepository.findOne({
  //       where: { college_id: collegeWiseCourse.college_id },
  //     });

  //     // If the college exists and has not been added already
  //     if (college && !uniqueCollegeIds.has(college.college_id)) {
  //       const stream = await this.streamRepository.findOne({
  //         where: { stream_id: college.primary_stream_id },
  //       });

  //       // Add the college to the section
  //       collegeSection.push({
  //         college_name: college.college_name,
  //         college_id: college.college_id,
  //         primary_stream_id: college.primary_stream_id,
  //         primary_stream_name: stream ? stream.stream_name : null,
  //         location: college.location,
  //         email: college.college_email,
  //         website: college.college_website,
  //         phone: college.college_phone,
  //         logo: college.logo_img,
  //         banner: college.banner_img,
  //         slug: college.slug,
  //       });

  //       // Mark this college as added
  //       uniqueCollegeIds.add(college.college_id);
  //     }
  //   }

  //   // Constructing the response
  //   return {
  //     basic_info: {
  //       name: courseGroup.name,
  //       slug: courseGroup.slug,
  //       level: courseGroup.level,
  //       type: courseGroup.type,
  //       full_name: courseGroup.full_name,
  //       duration_in_months: courseGroup.duration_in_months,
  //       description: courseGroup.description,
  //     },
  //     college_section: collegeSection,
  //   };
  // }

  async getCourseGroupListing(courseGroupId: number) {
    // Fetch basic info from CourseGroup table
    const courseGroup = await this.courseGroupRepository.findOne({
      where: { course_group_id: courseGroupId },
    });

    if (!courseGroup) {
      throw new NotFoundException(
        `Course group with ID ${courseGroupId} not found`
      );
    }

    // Fetch related college courses
    const collegeWiseCourses = await this.collegeWiseCourseRepository.find({
      where: { course_group_id: courseGroupId },
    });

    if (collegeWiseCourses.length === 0) {
      return {
        basic_info: {
          name: courseGroup.name,
          slug: courseGroup.slug,
          level: courseGroup.level,
          type: courseGroup.type,
          full_name: courseGroup.full_name,
          duration_in_months: courseGroup.duration_in_months,
          description: courseGroup.description,
        },
        college_section: [],
      };
    }

    // Extract unique college IDs
    const collegeIds = Array.from(
      new Set(collegeWiseCourses.map((course) => course.college_id))
    );

    // Fetch all colleges in a single query
    const colleges = await this.collegeInfoRepository.findByIds(collegeIds);

    // Fetch all streams in a single query
    const streamIds = Array.from(
      new Set(colleges.map((college) => college.primary_stream_id))
    );
    const streams = await this.streamRepository.findByIds(streamIds);

    // Map streams by ID for quick lookup
    const streamMap = new Map(
      streams.map((stream) => [stream.stream_id, stream.stream_name])
    );

    // Construct the college section
    const collegeSection = colleges.map((college) => ({
      college_name: college.college_name,
      college_id: college.college_id,
      primary_stream_id: college.primary_stream_id,
      primary_stream_name: streamMap.get(college.primary_stream_id) || null,
      location: college.location,
      email: college.college_email,
      website: college.college_website,
      phone: college.college_phone,
      logo: college.logo_img,
      banner: college.banner_img,
      slug: college.slug,
    }));

    // Construct and return the response
    return {
      basic_info: {
        name: courseGroup.name,
        slug: courseGroup.slug,
        level: courseGroup.level,
        type: courseGroup.type,
        full_name: courseGroup.full_name,
        duration_in_months: courseGroup.duration_in_months,
        description: courseGroup.description,
      },
      college_section: collegeSection,
    };
  }

  // async getCourseGroupListing(courseGroupId: number) {
  //   // Fetch basic info from CourseGroup table
  //   const courseGroup = await this.courseGroupRepository.findOne({
  //     where: { course_group_id: courseGroupId },
  //   });

  //   if (!courseGroup) {
  //     throw new NotFoundException(
  //       `Course group with ID ${courseGroupId} not found`
  //     );
  //   }

  //   // Fetch related college courses
  //   const collegeWiseCourses = await this.collegeWiseCourseRepository.find({
  //     where: { course_group_id: courseGroupId },
  //   });

  //   if (collegeWiseCourses.length === 0) {
  //     return {
  //       basic_info: {
  //         name: courseGroup.name,
  //         slug: courseGroup.slug,
  //         level: courseGroup.level,
  //         type: courseGroup.type,
  //         full_name: courseGroup.full_name,
  //         duration_in_months: courseGroup.duration_in_months,
  //         description: courseGroup.description,
  //       },
  //       college_section: [],
  //     };
  //   }

  //   // Extract unique college IDs and fetch all colleges
  //   const collegeIds = [
  //     ...new Set(collegeWiseCourses.map((course) => course.college_id)),
  //   ];
  //   const collegesPromise = this.collegeInfoRepository.find({
  //     where: { college_id: In(collegeIds) },
  //   });

  //   // Fetch all streams related to colleges
  //   const colleges = await collegesPromise;
  //   const streamIds = [
  //     ...new Set(colleges.map((college) => college.primary_stream_id)),
  //   ];
  //   const streamsPromise = this.streamRepository.find({
  //     where: { stream_id: In(streamIds) },
  //   });

  //   const [streams] = await Promise.all([streamsPromise]);

  //   // Map streams by ID for quick lookup
  //   const streamMap = new Map(
  //     streams.map((stream) => [stream.stream_id, stream.stream_name])
  //   );

  //   // Construct the college section
  //   const collegeSection = colleges.map((college) => ({
  //     college_name: college.college_name,
  //     college_id: college.college_id,
  //     primary_stream_id: college.primary_stream_id,
  //     primary_stream_name: streamMap.get(college.primary_stream_id) || null,
  //     location: college.location,
  //     email: college.college_email,
  //     website: college.college_website,
  //     phone: college.college_phone,
  //     logo: college.logo_img,
  //     banner: college.banner_img,
  //     slug: college.slug,
  //   }));

  //   // Construct and return the response
  //   return {
  //     basic_info: {
  //       name: courseGroup.name,
  //       slug: courseGroup.slug,
  //       level: courseGroup.level,
  //       type: courseGroup.type,
  //       full_name: courseGroup.full_name,
  //       duration_in_months: courseGroup.duration_in_months,
  //       description: courseGroup.description,
  //     },
  //     college_section: collegeSection,
  //   };
  // }


  async getAllCourseGroupIdsAndNames(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
  
    let query = this.courseGroupRepository
      .createQueryBuilder("courseGroup")
      .select(["courseGroup.course_group_id", "courseGroup.name"])
      .skip(skip)
      .take(limit);
  
    if (search) {
      query = query.where("LOWER(courseGroup.name) LIKE LOWER(:search)", { search: `${search}%` });
    }
  
    return query.getMany();
  }
  
  
}
