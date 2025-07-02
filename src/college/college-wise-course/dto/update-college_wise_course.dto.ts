import { PartialType } from '@nestjs/mapped-types';
import { CreateCollegeWiseCourseDto } from './create-college_wise_course.dto';

export class UpdateCollegeWiseCourseDto extends PartialType(
  CreateCollegeWiseCourseDto,
) {}
