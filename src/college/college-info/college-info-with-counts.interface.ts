import { CollegeInfo } from './college-info.entity';

interface CourseCount {
  course_name: string;
  course_id: number;
  count: number;
}

// export interface CollegeInfoWithCounts extends CollegeInfo {
//   courseCounts: CourseCount[];
// }
export interface CollegeInfoWithCounts extends Omit<CollegeInfo, 'updateSlug'> {
  courseCounts: CourseCount[];
}
