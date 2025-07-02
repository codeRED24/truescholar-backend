import { CollegeContentDto } from "../../college-content/dto/create-college-content.dto";
import { ExamSectionDto } from "./infrastructure-response.dto";

export class AdmissionProcessDto {
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
  dates_section?: {
    start_date?: Date;
    end_date?: Date;
    event?: string;
    description?: string;
  }[];
  exam_section?: ExamSectionDto[];
  admission_process?: {
    content?: CollegeContentDto[];
    // cutoff_group: {
    //   college_wise_course_id: number;
    //   course_name: string;
    //   cutoff: {
    //     exam_id: number;
    //     exam_name: string;
    //     category: string;
    //     gender?: string;
    //     Quota?: string;
    //     cutoff_round: string;
    //   }[];
    // }[];
  };
}
