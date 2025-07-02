export class ExamInfoDto {
  exam_information: ExamInformationDto;
  news_section: ExamContentDto[];
  about_exam: YearWiseExamInfo[];
}

export class ExamInformationDto {
  exam_id: number;
  exam_name: string;
  slug: string;
  exam_description?: string;
  exam_duration?: number;
  exam_subject?: string;
  mode_of_exam?: string;
  level_of_exam?: string;
  exam_fee_min?: string;
  exam_fee_max?: string;
  application_start_date?: string;
  application_end_date?: string;
  exam_date?: string;
  result_date?: string;
  official_website?: string;
  official_email?: string;
  official_mobile?: string;
  eligibilty_criteria?: string;
  eligibilty_description?: string;
  conducting_authority?: string;
  application_mode?: string;
  exam_logo?: string;
  last_update?: Date;
  exan_shortname?: string;
}

export class ExamContentDto {
  exam_content_id: number;
  exam_info?: string;
  admit_card?: string;
  silos?: string;
  updated_at: Date;
  description: string;
  meta_desc: string;
  author_id: number;
  author_img: string;
  author_name: string;
  view_name: string;
  title: string;
}

export class ExamDateDto {
  exam_date_id: number;
  title: string;
  start_date?: Date;
  end_date?: Date;
  updated_at: Date;
}

export class YearWiseExamInfo {
  year: string;
  exam_content: ExamContentDto[];
  exam_dates: ExamDateDto[];
}
