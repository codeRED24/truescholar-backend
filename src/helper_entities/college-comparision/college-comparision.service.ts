// // college-comparision.service.ts
// import { Injectable } from "@nestjs/common";
// import { InjectRepository } from "@nestjs/typeorm";
// import { Repository } from "typeorm";
// import { CollegeInfo } from "../../college/college-info/college-info.entity";
// import { CollegeWiseFees } from "../../college/college-wise-fees/college-wise-fees.entity";
// import { CollegeWisePlacement } from "../../college/college-wise-placement/college-wise-placement.entity";
// import { CollegeWiseCourse } from "../../college/college-wise-course/college_wise_course.entity";
// import { City } from "../../helper_entities/cities/city.entity";
// import { CollegeCutoff } from "../../college/college-cutoff/college_cutoff.entity";
// import { CollegeExam } from "../../college/college_exam/college_exam.entity";
// import { CollegeDates } from "../../college/college-dates/college-dates.entity";
// import { CollegeHostelCampus } from "../../college/college-hostel-and-campus/college-hostel-and-campus.entity";
// import { CollegeScholarship } from "../../college/college-scholarship/college-scholarship.entity";
// import { CollegeGallery } from "../../college/college-gallery/college-gallery.entity";
// import { CollegeVideo } from "../../college/college-video/college-video.entity";
// import { CollegeRanking } from "../../college/college-ranking/college-ranking.entity";
// import { RankingAgency } from "../../college/ranking-agency/ranking_agency.entity";
// import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
// import {
//   CollegeComparisonDto,
//   BasicInfoDto,
//   AvgSectionDto,
//   CourseDto,
//   FeesDto,
//   ExamDto,
//   CutoffDto,
//   PlacementDto,
//   DatesDto,
//   InfrastructureDto,
//   ScholarshipDto,
//   GalleryDto,
//   VideoDto,
//   RankingDto,
//   CourseGroupDto,
// } from "./dto/college-comparision.dto";

// @Injectable()
// export class CollegeComparisionService {
//   constructor(
//     @InjectRepository(CollegeInfo)
//     private readonly collegeInfoRepository: Repository<CollegeInfo>,
//     @InjectRepository(CollegeWiseFees)
//     private readonly collegeWiseFeesRepository: Repository<CollegeWiseFees>,
//     @InjectRepository(CollegeWisePlacement)
//     private readonly collegeWisePlacementRepository: Repository<CollegeWisePlacement>,
//     @InjectRepository(CollegeWiseCourse)
//     private readonly collegeWiseCourseRepository: Repository<CollegeWiseCourse>,
//     @InjectRepository(City)
//     private readonly cityRepository: Repository<City>,
//     @InjectRepository(CollegeExam)
//     private readonly collegeExamRepository: Repository<CollegeExam>,
//     @InjectRepository(CollegeCutoff)
//     private readonly collegeCutoffRepository: Repository<CollegeCutoff>,
//     @InjectRepository(CollegeDates)
//     private readonly collegeDatesRepository: Repository<CollegeDates>,
//     @InjectRepository(CollegeHostelCampus)
//     private readonly collegeHostelCampusRepository: Repository<CollegeHostelCampus>,
//     @InjectRepository(CollegeScholarship)
//     private readonly collegeScholarshipRepository: Repository<CollegeScholarship>,
//     @InjectRepository(CollegeGallery)
//     private readonly collegeGalleryRepository: Repository<CollegeGallery>,
//     @InjectRepository(CollegeVideo)
//     private readonly collegeVideoRepository: Repository<CollegeVideo>,
//     @InjectRepository(CollegeRanking)
//     private readonly collegeRankingRepository: Repository<CollegeRanking>,
//     @InjectRepository(RankingAgency)
//     private readonly rankingAgencyRepository: Repository<RankingAgency>,
//     @InjectRepository(CourseGroup)
//     private readonly courseGroupRepository: Repository<CourseGroup>
//   ) {}
//   async getCollegeComparison(
//     college_id: number
//   ): Promise<CollegeComparisonDto> {
//     const college = await this.collegeInfoRepository.findOne({
//       where: { college_id },
//     });

//     if (!college) {
//       throw new Error(`College with ID ${college_id} not found.`);
//     }

//     const city = await this.cityRepository.findOne({
//       where: { city_id: college.city_id },
//     });
//     if (!city) {
//       throw new Error(`City with ID ${college.city_id} not found.`);
//     }

//     const minFees = await this.collegeWiseFeesRepository
//       .createQueryBuilder("fees")
//       .select("MIN(fees.total_min_fees)", "min_fees")
//       .where("fees.college_id = :college_id", { college_id })
//       .getRawOne();

//     const maxFees = await this.collegeWiseFeesRepository
//       .createQueryBuilder("fees")
//       .select("MAX(fees.total_max_fees)", "max_fees")
//       .where("fees.college_id = :college_id", { college_id })
//       .getRawOne();

//     const noOfCourses = await this.collegeWiseCourseRepository
//       .createQueryBuilder("courses")
//       .where("courses.college_id = :college_id", { college_id })
//       .getCount();

//     const avgPlacement = await this.collegeWisePlacementRepository
//       .createQueryBuilder("placement")
//       .select("AVG(placement.avg_package)", "avg_placement")
//       .where("placement.college_id = :college_id", { college_id })
//       .getRawOne();

//     const placementPercentageAvg = await this.collegeWisePlacementRepository
//       .createQueryBuilder("placement")
//       .select("AVG(placement.placement_percentage)", "placement_percentage_avg")
//       .where("placement.college_id = :college_id", { college_id })
//       .getRawOne();

//     const basicInfo: BasicInfoDto = {
//       college_name: college.college_name,
//       college_id: college.college_id,
//       slug: college.slug,
//       city_id: college.city_id,
//       city_name: city.name,
//       nacc_grade: college.nacc_grade,
//       founded_year: college.founded_year,
//       girls_only: college.girls_only,
//       UGC_approved: college.UGC_approved,
//       type_of_university: college.type_of_institute,
//       kapp_rating: college.kapp_rating,
//       total_students: college.total_student,
//       avg_section: {
//         min_fees: minFees.min_fees,
//         max_fees: maxFees.max_fees,
//         no_of_courses: noOfCourses,
//         avg_placement: avgPlacement.avg_placement,
//         placement_percentage_avg:
//           placementPercentageAvg.placement_percentage_avg,
//       },
//     };

//     const courses = await this.collegeWiseCourseRepository.find({
//       where: { college_id },
//     });

//     const courseGroups = await this.courseGroupRepository.find();
//     const courseGroupMap = new Map(
//       courseGroups.map((group) => [
//         group.course_group_id,
//         {
//           full_name: group.full_name,
//           slug: group.slug,
//           duration: group.duration_in_months,
//         },
//       ])
//     );

//     const groupedCourses: Record<number, CourseGroupDto> = {};

//     // Iterate through all courses
//     for (const course of courses) {
//       const group_id = course.course_group_id;
//       const courseGroupData = courseGroupMap.get(group_id) || null;

//       if (!groupedCourses[group_id]) {
//         // Fetch fees, exam, and cutoff sections for each `course_group_id`
//         const fees_section: FeesDto[] = await this.collegeWiseFeesRepository
//           .find({
//             where: { course_group_id: group_id, college_id: college_id },
//           })
//           .then((fees) =>
//             fees.map((fee) => ({
//               college_id: fee.college_id,
//               college_wise_fees_id: fee.collegewise_fees_id,
//               min_hostel_fees: fee.min_hostel_fees,
//               max_hostel_fees: fee.max_hostel_fees,
//               total_min_fees: fee.total_min_fees,
//               total_max_fees: fee.total_max_fees,
//               year: fee.year,
//               college_wise_course_id: fee.collegewise_course_id,
//             }))
//           );

//         const exam_section: ExamDto[] = await this.collegeExamRepository
//           .find({ where: { course_group_id: group_id }, relations: ["exam"] })
//           .then((exams) =>
//             exams.map((exam) => ({
//               exam_id: exam.exam.exam_id,
//               exam_title: exam.title,
//               exam_description: exam.description,
//               reference_url: exam.refrence_url,
//             }))
//           );

//         const cutoff_section: CutoffDto[] = await this.collegeCutoffRepository
//           .find({ where: { course_group_id: group_id } })
//           .then((cutoffs) =>
//             cutoffs.map((cutoff) => ({
//               college_cutoff_id: cutoff.college_cutoff_id,
//               year: cutoff.year,
//               category: cutoff.category,
//               round: cutoff.round,
//               cutoff_type: cutoff.cutoff_type,
//               college_wise_course_id: cutoff.college_wise_course_id,
//             }))
//           );

//         // Initialize the groupedCourses entry for the group_id
//         groupedCourses[group_id] = {
//           course_group_id: group_id,
//           course_group_name: courseGroupData ? courseGroupData.full_name : null,
//           duration_in_months: courseGroupData ? courseGroupData.duration : null,
//           slug: courseGroupData ? courseGroupData.slug : null,
//           fees_section,
//           exam_section,
//           cutoff_section,
//           courses: [],
//         };
//       }

//       groupedCourses[group_id].courses.push({
//         course_id: course.college_wise_course_id,
//         course_name: course.name,
//         total_seats: course.total_seats,
//       });
//     }
//     const courses_section = Object.values(groupedCourses);

//     //placement section
//     const placements: CollegeWisePlacement[] =
//       await this.collegeWisePlacementRepository.find({
//         where: { college_id: college_id },
//       });

//     const placement_section: PlacementDto[] = placements.map((placement) => ({
//       college_wise_placement_id: placement.collegewise_placement_id,
//       college_id: placement.college_id,
//       max_salary: placement.highest_package,
//       avg_salary: placement.avg_package,
//       year: placement.year,
//       placement_percentage: placement.placement_percentage,
//     }));

//     //for dates

//     const dates: CollegeDates[] = await this.collegeDatesRepository.find({
//       where: { college_id: college_id },
//     });

//     const dates_section: DatesDto[] = dates.map((date) => ({
//       college_dates_id: date.college_dates_id,
//       college_id: date.college_id,
//       start_date: date.start_date,
//       end_date: date.end_date,
//       event: date.event,
//       description: date.description,
//       reference_url: date.refrence_url,
//     }));

//     //infrastucture section

//     const infrastructures: CollegeHostelCampus[] =
//       await this.collegeHostelCampusRepository.find({
//         where: { college_id: college_id },
//       });

//     const infrastructure_section: InfrastructureDto[] = infrastructures.map(
//       (infra) => ({
//         college_hostelcampus_id: infra.college_hostelcampus_id,
//         college_id: infra.college_id,
//         description: infra.description,
//         reference_url: infra.refrence_url,
//       })
//     );

//     //scholariship section
//     const scholarships: CollegeScholarship[] =
//       await this.collegeScholarshipRepository.find({
//         where: { college_id: college_id },
//       });

//     const scholarship_section: ScholarshipDto[] = scholarships.map(
//       (scholarship) => ({
//         college_scholarship_id: scholarship.college_scholarship_id,
//         college_id: scholarship.college_id,
//         reference_url: scholarship.refrence_url,
//       })
//     );

//     //Gallery section
//     const galleries: CollegeGallery[] =
//       await this.collegeGalleryRepository.find({
//         where: { college_id: college_id },
//       });

//     const gallery_section: GalleryDto[] = galleries.map((gallery) => ({
//       college_gallery_id: gallery.college_gallery_id,
//       media_URL: gallery.media_URL,
//       tag: gallery.tag,
//       alt_text: gallery.alt_text,
//       is_active: gallery.is_active,
//     }));

//     //Video section
//     const videos: CollegeVideo[] = await this.collegeVideoRepository.find({
//       where: { college_id: college_id },
//     });

//     const video_section: VideoDto[] = videos.map((video) => ({
//       college_video_id: video.college_video_id,
//       video_URL: video.media_URL,
//       alt_text: video.alt_text,
//       thumbnail_URL: video.thumbnail_URL,
//       reference_url: video.refrence_url,
//     }));

//     //Ranking section
//     const rankings: CollegeRanking[] = await this.collegeRankingRepository.find(
//       {
//         where: { college_id: college_id },
//       }
//     );
//     const agencies = await this.rankingAgencyRepository.find();
//     const agencyMap = new Map(
//       agencies.map((agency) => [
//         agency.ranking_agency_id,
//         { name: agency.name, logo: agency.logo },
//       ])
//     );

//     const ranking_section: RankingDto[] = rankings.map((ranking) => {
//       const agencyInfo = agencyMap.get(ranking.ranking_agency_id) || {
//         name: null,
//         logo: null,
//       };
//       return {
//         college_ranking_id: ranking.college_ranking_id,
//         college_id: ranking.college_id,
//         ranking_agency_id: ranking.ranking_agency_id,
//         ranking_agency_name: agencyInfo.name,
//         ranking_agency_logo: agencyInfo.logo,
//         agency: ranking.agency,
//         rank: ranking.rank,
//         year: ranking.year,
//         description: ranking.description,
//       };
//     });

//     return {
//       basic_info: basicInfo,
//       courses_section,
//       placement_section,
//       dates_section,
//       infrastructure_section,
//       scholarship_section,
//       gallery_section,
//       video_section,
//       ranking_section,
//     };
//   }
// }





// college-comparision.service.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CollegeInfo } from "../../college/college-info/college-info.entity";
import { CollegeWiseFees } from "../../college/college-wise-fees/college-wise-fees.entity";
import { CollegeWisePlacement } from "../../college/college-wise-placement/college-wise-placement.entity";
import { CollegeWiseCourse } from "../../college/college-wise-course/college_wise_course.entity";
import { City } from "../../helper_entities/cities/city.entity";
import { CollegeCutoff } from "../../college/college-cutoff/college_cutoff.entity";
import { CollegeExam } from "../../college/college_exam/college_exam.entity";
import { CollegeDates } from "../../college/college-dates/college-dates.entity";
import { CollegeHostelCampus } from "../../college/college-hostel-and-campus/college-hostel-and-campus.entity";
import { CollegeScholarship } from "../../college/college-scholarship/college-scholarship.entity";
import { CollegeGallery } from "../../college/college-gallery/college-gallery.entity";
import { CollegeVideo } from "../../college/college-video/college-video.entity";
import { CollegeRanking } from "../../college/college-ranking/college-ranking.entity";
import { RankingAgency } from "../../college/ranking-agency/ranking_agency.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
import {
  CollegeComparisonDto,
  BasicInfoDto,
  AvgSectionDto,
  CourseDto,
  FeesDto,
  ExamDto,
  CutoffDto,
  PlacementDto,
  DatesDto,
  InfrastructureDto,
  ScholarshipDto,
  GalleryDto,
  VideoDto,
  RankingDto,
  CourseGroupDto,
} from "./dto/college-comparision.dto";

@Injectable()
export class CollegeComparisionService {
  constructor(
    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>,
    @InjectRepository(CollegeWiseFees)
    private readonly collegeWiseFeesRepository: Repository<CollegeWiseFees>,
    @InjectRepository(CollegeWisePlacement)
    private readonly collegeWisePlacementRepository: Repository<CollegeWisePlacement>,
    @InjectRepository(CollegeWiseCourse)
    private readonly collegeWiseCourseRepository: Repository<CollegeWiseCourse>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(CollegeExam)
    private readonly collegeExamRepository: Repository<CollegeExam>,
    @InjectRepository(CollegeCutoff)
    private readonly collegeCutoffRepository: Repository<CollegeCutoff>,
    @InjectRepository(CollegeDates)
    private readonly collegeDatesRepository: Repository<CollegeDates>,
    @InjectRepository(CollegeHostelCampus)
    private readonly collegeHostelCampusRepository: Repository<CollegeHostelCampus>,
    @InjectRepository(CollegeScholarship)
    private readonly collegeScholarshipRepository: Repository<CollegeScholarship>,
    @InjectRepository(CollegeGallery)
    private readonly collegeGalleryRepository: Repository<CollegeGallery>,
    @InjectRepository(CollegeVideo)
    private readonly collegeVideoRepository: Repository<CollegeVideo>,
    @InjectRepository(CollegeRanking)
    private readonly collegeRankingRepository: Repository<CollegeRanking>,
    @InjectRepository(RankingAgency)
    private readonly rankingAgencyRepository: Repository<RankingAgency>,
    @InjectRepository(CourseGroup)
    private readonly courseGroupRepository: Repository<CourseGroup>
  ) {}
  async getCollegeComparison(college_id: number): Promise<CollegeComparisonDto> {
    const college = await this.collegeInfoRepository.findOne({ where: { college_id } });
    if (!college) throw new Error(`College with ID ${college_id} not found.`);
  
    const city = await this.cityRepository.findOne({ where: { city_id: college.city_id } });
    if (!city) throw new Error(`City with ID ${college.city_id} not found.`);
  
    // Use Promise.all to fetch fees, exams, and cutoffs in parallel
    const [minFees, maxFees, noOfCourses, avgPlacement, placementPercentageAvg, courses, courseGroups] = await Promise.all([
      this.collegeWiseFeesRepository
        .createQueryBuilder('fees')
        .select('MIN(fees.total_min_fees)', 'min_fees')
        .where('fees.college_id = :college_id', { college_id })
        .getRawOne(),
      this.collegeWiseFeesRepository
        .createQueryBuilder('fees')
        .select('MAX(fees.total_max_fees)', 'max_fees')
        .where('fees.college_id = :college_id', { college_id })
        .getRawOne(),
      this.collegeWiseCourseRepository
        .createQueryBuilder('courses')
        .where('courses.college_id = :college_id', { college_id })
        .getCount(),
      this.collegeWisePlacementRepository
        .createQueryBuilder('placement')
        .select('AVG(placement.avg_package)', 'avg_placement')
        .where('placement.college_id = :college_id', { college_id })
        .getRawOne(),
      this.collegeWisePlacementRepository
        .createQueryBuilder('placement')
        .select('AVG(placement.placement_percentage)', 'placement_percentage_avg')
        .where('placement.college_id = :college_id', { college_id })
        .getRawOne(),
      this.collegeWiseCourseRepository.find({ where: { college_id } }),
      this.courseGroupRepository.find(),
    ]);
  
    const courseGroupMap = new Map(courseGroups.map(group => [group.course_group_id, group]));
  
    // Fetch all fees, exams, and cutoffs for all course groups in bulk
    const fees = await this.collegeWiseFeesRepository
      .createQueryBuilder('fees')
      .select([
        'fees.college_wise_course_id',
        'fees.total_min_fees',
        'fees.total_max_fees',
        'fees.year',
        'fees.course_group_id',
      ])
      .where('fees.college_id = :college_id', { college_id })
      .andWhere('fees.course_group_id IN (:...courseGroupIds)', { courseGroupIds: Array.from(courseGroupMap.keys()) })
      .getMany();
  
    const exams = await this.collegeExamRepository
      .createQueryBuilder('exam')
      .select([
        'exam.exam_id',
        'exam.title',
        'exam.description',
        'exam.refrence_url',
        'exam.course_group_id',
      ])
      .where('exam.course_group_id IN (:...courseGroupIds)', { courseGroupIds: Array.from(courseGroupMap.keys()) })
      .getMany();
  
    const cutoffs = await this.collegeCutoffRepository
      .createQueryBuilder('cutoff')
      .select([
        'cutoff.college_cutoff_id',
        'cutoff.year',
        'cutoff.category',
        'cutoff.round',
        'cutoff.cutoff_type',
        'cutoff.course_group_id',
      ])
      .where('cutoff.course_group_id IN (:...courseGroupIds)', { courseGroupIds: Array.from(courseGroupMap.keys()) })
      .getMany();
  
    const basicInfo: BasicInfoDto = {
      college_name: college.college_name,
      college_id: college.college_id,
      slug: college.slug,
      city_id: college.city_id,
      city_name: city.name,
      nacc_grade: college.nacc_grade,
      founded_year: college.founded_year,
      girls_only: college.girls_only,
      UGC_approved: college.UGC_approved,
      type_of_university: college.type_of_institute,
      kapp_rating: college.kapp_rating,
      total_students: college.total_student,
      avg_section: {
        min_fees: minFees.min_fees,
        max_fees: maxFees.max_fees,
        no_of_courses: noOfCourses,
        avg_placement: avgPlacement.avg_placement,
        placement_percentage_avg: placementPercentageAvg.placement_percentage_avg,
      },
    };
  
    // Group the data and format it
    const groupedCourses = courses.reduce((acc, course) => {
      const groupId = course.course_group_id;
      const groupData = courseGroupMap.get(groupId);
      if (!acc[groupId]) {
        acc[groupId] = {
          course_group_id: groupId,
          course_group_name: groupData ? groupData.full_name : null,
          duration_in_months: groupData ? groupData.duration_in_months : null,
          slug: groupData ? groupData.slug : null,
          courses: [],
          fees_section: fees.filter(fee => fee.course_group_id === groupId),
          exam_section: exams.filter(exam => exam.course_group_id === groupId),
          cutoff_section: cutoffs.filter(cutoff => cutoff.course_group_id === groupId),
        };
      }
      acc[groupId].courses.push({
        course_id: course.college_wise_course_id,
        course_name: course.name,
        total_seats: course.total_seats,
      });
      return acc;
    }, {});
  
    const courses_section = Object.values(groupedCourses);

    //placement section
    const placements: CollegeWisePlacement[] =
      await this.collegeWisePlacementRepository.find({
        where: { college_id: college_id },
      });

    const placement_section: PlacementDto[] = placements.map((placement) => ({
      college_wise_placement_id: placement.collegewise_placement_id,
      college_id: placement.college_id,
      max_salary: placement.highest_package,
      avg_salary: placement.avg_package,
      year: placement.year,
      placement_percentage: placement.placement_percentage,
    }));

    //for dates

    const dates: CollegeDates[] = await this.collegeDatesRepository.find({
      where: { college_id: college_id },
    });

    const dates_section: DatesDto[] = dates.map((date) => ({
      college_dates_id: date.college_dates_id,
      college_id: date.college_id,
      start_date: date.start_date,
      end_date: date.end_date,
      event: date.event,
      description: date.description,
      reference_url: date.refrence_url,
    }));

    //infrastucture section

    const infrastructures: CollegeHostelCampus[] =
      await this.collegeHostelCampusRepository.find({
        where: { college_id: college_id },
      });

    const infrastructure_section: InfrastructureDto[] = infrastructures.map(
      (infra) => ({
        college_hostelcampus_id: infra.college_hostelcampus_id,
        college_id: infra.college_id,
        description: infra.description,
        reference_url: infra.refrence_url,
      })
    );

    //scholariship section
    const scholarships: CollegeScholarship[] =
      await this.collegeScholarshipRepository.find({
        where: { college_id: college_id },
      });

    const scholarship_section: ScholarshipDto[] = scholarships.map(
      (scholarship) => ({
        college_scholarship_id: scholarship.college_scholarship_id,
        college_id: scholarship.college_id,
        reference_url: scholarship.refrence_url,
      })
    );

    //Gallery section
    const galleries: CollegeGallery[] =
      await this.collegeGalleryRepository.find({
        where: { college_id: college_id },
      });

    const gallery_section: GalleryDto[] = galleries.map((gallery) => ({
      college_gallery_id: gallery.college_gallery_id,
      media_URL: gallery.media_URL,
      tag: gallery.tag,
      alt_text: gallery.alt_text,
      is_active: gallery.is_active,
    }));

    //Video section
    const videos: CollegeVideo[] = await this.collegeVideoRepository.find({
      where: { college_id: college_id },
    });

    const video_section: VideoDto[] = videos.map((video) => ({
      college_video_id: video.college_video_id,
      video_URL: video.media_URL,
      alt_text: video.alt_text,
      thumbnail_URL: video.thumbnail_URL,
      reference_url: video.refrence_url,
    }));

    //Ranking section
    const rankings: CollegeRanking[] = await this.collegeRankingRepository.find(
      {
        where: { college_id: college_id },
      }
    );
    const agencies = await this.rankingAgencyRepository.find();
    const agencyMap = new Map(
      agencies.map((agency) => [
        agency.ranking_agency_id,
        { name: agency.name, logo: agency.logo },
      ])
    );

    const ranking_section: RankingDto[] = rankings.map((ranking) => {
      const agencyInfo = agencyMap.get(ranking.ranking_agency_id) || {
        name: null,
        logo: null,
      };
      return {
        college_ranking_id: ranking.college_ranking_id,
        college_id: ranking.college_id,
        ranking_agency_id: ranking.ranking_agency_id,
        ranking_agency_name: agencyInfo.name,
        ranking_agency_logo: agencyInfo.logo,
        agency: ranking.agency,
        rank: ranking.rank,
        year: ranking.year,
        description: ranking.description,
      };
    });

    return {
      basic_info: basicInfo,
      courses_section,
      placement_section,
      dates_section,
      infrastructure_section,
      scholarship_section,
      gallery_section,
      video_section,
      ranking_section,
    };
  }
}
