export class CollegeListingDto {
  college_id: number;
  college_name: string;
  short_name: string;
  city_id: number;
  kapp_rating?: number;
  parent_college_id: number;
  city_name?: any;
  no_of_courses?: number;
  naac_grade?: string;
  UGC_approved?: boolean;
  college_logo?: string;
  banner_img?: string;
  primary_stream_id?: number;
  min_salary?: number;
  max_salary?: number;
  min_fees?: number;
  max_fees?: number;
  stream_name?: string;
  is_active: boolean;
  type_of_institute?: string;
  state_id?: number;
  state_name?: string;
  is_university?: boolean;
  affiliated_university_id?: number;
  affiliated_university_name?: string;
  kapp_score?: number;
  city_slug: string;
  stream_slug: string;
  state_slug: string;
  nirf_ranking?: number;
  times_ranking?: number;
  india_today_ranking?: number;
  meta_desc?: string;
  is_online?: boolean;
  college_brochure: string;
}
export class CollegeFilterDto {
  city_filter: Array<{
    city_id: number;
    name: string;
    slug: string;
    count: number;
  }>;
  state_filter: Array<{
    state_id: number;
    name: string;
    slug: string;
    count: number;
  }>;
  stream_filter: Array<{
    stream_id: number;
    stream_name: string;
    slug: string;
    count: number;
  }>;
  type_of_institute_filter: Array<{
    value: string;
    count: number;
  }>;
  specialization_filter: Array<{
    name: string;
    count: number;
  }>;
  course_group_filter: Array<{
    course_group_id: number;
    course_group_name: string;
  }>;
}

export class CollegeListingResponseDto {
  filter_section: CollegeFilterDto;
  colleges: CollegeListingDto[];
  total_colleges_count: number;
  selected_description?: string;
}
