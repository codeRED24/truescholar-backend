import { CollegeContentDto } from "../../college-content/dto/create-college-content.dto";

export class InfrastructureDto {
  college_information: {
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
    course_count?: number;
    meta_desc?: string;
    is_online?: boolean;
    college_brochure?: string;

  };
  news_section?: CollegeContentDto[];
  infrastructure?: {
    content?: CollegeContentDto[];
    hostel_and_campus?: {
      description: string;
      reference_url?: string;
    }[];
    college_gallery?: {
      media_URL: string;
      tag: string;
      alt_text: string;
      reference_url?: string;
    }[];
    college_video?: {
      media_URL: string;
      tag: string;
      alt_text: string;
      thumbnail_URL: string;
      reference_url?: string;
    }[];
    exam_section?: ExamSectionDto[];
  };
}

export class ExamSectionDto {
  exam_id: number;
  title: string;
  name: string;
  duration: number;
  application_start_date: string;
  application_end_date: string;
}
