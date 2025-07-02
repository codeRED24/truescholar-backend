export class ArticleListingDto {
  basic_info: any[];
  college_content: CollegeArticleContentDto[];
  exam_content: ExamArticleContentDto[];
}
export class CollegeArticleContentDto {
  college_id: number;
  title: string;
  meta_desc?: string;
  img1_url?: string;
  img2_url?: string;
  author_id?: number;
  author_name?: string;
}
export class ExamArticleContentDto {
  exam_id: number;
  title: string;
  meta_desc?: string;
  img1_url?: string;
  img2_url?: string;
  author_id?: number;
  author_name?: string;
}
