import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseGroupDto } from './create-course_group.dto';

export class UpdateCourseGroupDto extends PartialType(CreateCourseGroupDto) {}
