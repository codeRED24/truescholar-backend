export class ExamListingDto {
  exam_name: string;
  slug: string;
  exam_id: number;
  exam_logo: string;
  level_of_exam: string;
  exam_description: string;
  exam_duration: number;
  mode_of_exam: string;
  kapp_score: number;
  is_active: boolean;
  exam_shortname: string;
  application_start_date: string;
  application_end_date: string;
  exam_date: string;
  result_date: string;
  conducting_authority: string;
  exam_fee_min: string;
  exam_fee_max: string;
}

export class ExamListingResponseDto {
  exams?: ExamListingDto[];
  data?: {
    level_of_exam?: { value: string; count: number }[];
    mode_of_exam?: { value: string; count: number }[];
    conducting_authority?: { value: string; count: number }[];
    exam_duration?: { value: number; count: number }[];
    exam_min_fees?: { value: string; count: number }[];
    exam_max_fees?: { value: string; count: number }[];
  };
  total?: number;
  limit?: number;
  page?: number;
}

export class ExamFiltersResponseDto {
  code?: number;
  status?: string;
  message?: string;
  data?: {
    exam_cateogory?: { value: string; count: number }[];
    exam_streams?: { value: string; count: number }[];
    // exam_level?: { value: string; count: number }[];
  };
}
