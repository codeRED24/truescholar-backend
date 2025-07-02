import { PartialType } from '@nestjs/mapped-types';
import { CreateCollegeVideoDto } from './create-college-video.dto';

export class UpdateCollegeVideoDto extends PartialType(CreateCollegeVideoDto) {}
