export class CollegeComparisonDto {
  basic_info: BasicInfoDto;
  courses_section;
  placement_section: PlacementDto[];
  dates_section: DatesDto[];
  infrastructure_section: InfrastructureDto[];
  scholarship_section: ScholarshipDto[];
  gallery_section: GalleryDto[];
  video_section: VideoDto[];
  ranking_section: RankingDto[];
}

export class CourseGroupDto {
  course_group_id: number;
  course_group_name: string;
  duration_in_months: number;
  slug: string;
  fees_section: FeesDto[];
  exam_section: ExamDto[];
  cutoff_section: CutoffDto[];
  courses: SimpleCourseDto[];
}

export class SimpleCourseDto {
  course_id: number;
  course_name: string;
  total_seats: number;
}

export class BasicInfoDto {
  college_name: string;
  college_id: number;
  slug: string;
  city_id: number;
  city_name: string;
  founded_year: string;
  girls_only: boolean;
  nacc_grade: string;
  UGC_approved: boolean;
  type_of_university: string;
  kapp_rating: number;
  total_students: number;
  avg_section: AvgSectionDto;
}

export class AvgSectionDto {
  min_fees: number;
  max_fees: number;
  no_of_courses: number;
  avg_placement: number;
  placement_percentage_avg: number;
}

export class CourseDto {
  course_id: number;
  course_group_id: number;
  course_name: string;
  fees_section: FeesDto[];
  exam_section: ExamDto[];
  cutoff_section: CutoffDto[];
}
export class CutoffDto {
  college_cutoff_id: number;
  college_wise_course_id: number;
  college_id?: number;
  exam_id?: number;
  year?: number;
  category?: string;
  refrence_url?: string;
  round?: string;
  Quota?: string;
  gender?: string;
  cutoff_round?: string;
}

export class PlacementDto {
  college_wise_placement_id: number;
  year: number;
  college_id: number;
  avg_salary: number;
  max_salary: number;
  placement_percentage: number;
}

export class FeesDto {
  college_id: number;
  college_wise_fees_id: number;
  college_wise_course_id: number;
  min_hostel_fees: number;
  max_hostel_fees: number;
  total_min_fees: number;
  total_max_fees: number;
  year: number;
}

export class ExamDto {
  exam_id: number;
  exam_title: string;
  exam_description?: string;
  reference_url?: string;
}

export class DatesDto {
  college_dates_id: number;
  college_id: number;
  start_date: Date;
  end_date: Date;
  event?: string;
  description?: string;
  reference_url?: string;
}

export class InfrastructureDto {
  college_hostelcampus_id: number;
  college_id: number;
  description?: string;
  reference_url?: string;
}

export class ScholarshipDto {
  college_scholarship_id: number;
  college_id: number;
  reference_url?: string;
}

export class GalleryDto {
  college_gallery_id: number;
  media_URL?: string;
  tag?: string;
  alt_text?: string;
  is_active: boolean;
  reference_url?: string;
}

export class VideoDto {
  college_video_id: number;
  video_url?: string;
  alt_text?: string;
  thumbnail_URL?: string;
  reference_url?: string;
}

export class RankingDto {
  college_ranking_id: number;
  college_id: number;
  ranking_agency_id: number;
  ranking_agency_name: string;
  ranking_agency_logo: string;
  agency?: string;
  rank?: number;
  year?: number;
  description?: string;
}
