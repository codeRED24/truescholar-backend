export class CollegeInfoDto {
  college_id: number;
  college_name: string;
  short_name?: string;
  slug?: string;
  city_id?: number;
  state_id?: number;
  country_id?: number;
  location?: string;
  logo_img?: string;
  banner_img?: string;
  kapp_score?: number;
  primary_stream_id?: number;
  kapp_rating?: number;
  nacc_grage?: string;
  city_name?: string;
  state_name?: string;
  type_of_institute?: string;
  founded_year?: string;
  course_count?: number;
  NIRF_ranking?: number;
  min_tution_fees?: number;
  max_tution_fees?: number;
}

export class CourseInfoDto {
  course_id: number;
  course_name: string;
  duration_in_months?: number;
  short_name?: string;
  slug: string;
  kap_score?: number;
  level?: string;
}

export class CoursesSectionDto {
  courses: CourseInfoDto[];
}

export class TopCollegesSectionDto {
  stream_id: number;
  stream_name: string;
  slug: string;
  is_online: boolean;
  colleges: CollegeInfoDto[];
}

export class CitySectionDto {
  city_id: number;
  name: string;
  logo_url: string;
  college_count: number;
  kapp_score: number;
}

export class NewsSectionDto {
  article_id: number;
  title: string;
  sub_title: string;
  meta_desc?: string;
  slug: string;
  updated_at: Date;
  read_time?: number;
  author_name?: string;
  author_img?: string;
  author_id?: number;
}
export class ExamSectionDto {
  exam_id: number;
  exam_name: string;
  exam_shortname: string;
  slug: string;
  exam_logo: string;
  exam_duration?: number;
  exam_subject?: string;
  exam_description?: string;
  mode_of_exam?: string;
  level_of_exam?: string;
  exam_fee_min?: string;
  exam_fee_max?: string;
  exam_date?: string;
  official_website?: string;
  application_start_date?: string;
  application_end_date?: string;
}
export class StreamSectionDto {
  stream_id: number;
  stream_name: string;
  slug: string;
}

export class OnlineCollegesDTO {
  college_id: number;
  college_name: string;
  short_name?: string;
  location?: string;
  logo_img?: string;
  slug?: string;
}

export class HomePageResponseDto {
  top_colleges: TopCollegesSectionDto[];
  top_private_colleges_sections: TopCollegesSectionDto[];
  courses_section?: CoursesSectionDto;
  top_cities: CitySectionDto[];
  news_section?: NewsSectionDto[];
  upcoming_exams?: ExamSectionDto[];
  stream_section?: StreamSectionDto[];
  online_section?: OnlineCollegesDTO[];
}
