import { PartialType } from '@nestjs/mapped-types';
import { CreateCollegeDatesDto } from './create-college-dates.dto';

export class UpdateCollegeDatesDto extends PartialType(CreateCollegeDatesDto) {}
