import { PartialType } from '@nestjs/mapped-types';
import { CreateFacilitiesDto } from './create-facilities.dto';

export class UpdateFacilitiesDto extends PartialType(CreateFacilitiesDto) {}
