import { PartialType } from '@nestjs/mapped-types';
import { CreateFacultiesDto } from './create-faculties.dto';

export class UpdateFacultiesDto extends PartialType(CreateFacultiesDto) {}
