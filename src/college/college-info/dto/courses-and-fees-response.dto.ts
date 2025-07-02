import { CollegeContentDto } from "../../../college/college-content/dto/create-college-content.dto";
import { ExamSectionDto } from "./infrastructure-response.dto";
export class CoursesAndFeesResponseDto {
  college_information?: {
    college_id?: number;
    created_at?: Date;
    updated_at?: Date;
    is_active?: boolean | true;
    college_name?: string;
    short_name?: string;
    search_names?: string;
    parent_college_id?: number;
    city_id?: number;
    state_id?: number;
    country_id?: number;
    location?: string;
    PIN_code?: string;
    latitude_longitude?: string;
    college_email?: string;
    college_phone?: string;
    college_website?: string;
    type_of_institute?: string;
    affiliated_university_id?: number;
    founded_year?: string;
    logo_img?: string;
    banner_img?: string;
    total_student?: number;
    campus_size?: number;
    UGC_approved?: boolean;
    kapp_rating?: number;
    kapp_score?: number;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    nacc_grade?: string;
    slug?: string;
    girls_only?: boolean;
    is_university?: boolean;
    primary_stream?: number;
    meta_desc?: string;
    is_online?: boolean;
    college_brochure?: string;

  };
  news_section?: CollegeContentDto[];
  info_section?: CollegeContentDto[];
  exam_section?: ExamSectionDto[];
  dates_section?: {
    start_date: Date;
    end_date: Date;
    event: string;
    description: string;
  }[];

  courses_section?: {
    content_section?: CollegeContentDto[];
    groups?: {
      course_group_id?: number;
      course_group_name?: string;
      slug?: string;
      course_group_full_name?: string;
      min_fees?: number;
      max_fees?: number;
      min_salary?: number;
      max_salary?: number;
      duration?: string;
      duration_in_months?: number;
      kapp_score?: number;
      stream_id?: number;
      level?: string;
      course_count?: number;
      courses?: {
        course_name?: string;
        duration?: string;
        kapp_score?: any;
        kapp_rating?: any;
        is_online?: boolean;
        duration_type?: any;
        is_integrated_course?: boolean;
        degree_type?: any;
        seats_offered?: number;
        direct_fees?: number;
        direct_salary?: number;
      }[];
    }[];

    filter_section?: {
      stream_name_section: {
        value: number;
        label: string;
      }[];
      mode_section:{}[];
      course_group_full_name_section:{
        value: number;
        label: string;
        course_slug: string
      }[];
      speciaslisation_section?:{
        value: number;
        label: string
      }[];
      level_section: {
        label: string;
      }[];
    };
  };
}

export class CoursesFiltersResponseDto {
    filter_section?: {
      stream_name_section: {
        value: number;
        label: string;
      }[];
      mode_section:{}[];
      course_group_full_name_section:{
        value: number;
        label: string;
        course_slug: string
      }[];
      speciaslisation_section?:{
        value: number;
        label: string
      }[];
      level_section: {
        label: string;
      }[];
    };
  };
