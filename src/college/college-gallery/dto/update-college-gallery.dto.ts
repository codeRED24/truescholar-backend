import { PartialType } from '@nestjs/mapped-types';
import { CreateCollegeGalleryDto } from './create-college-gallery.dto';

export class UpdateCollegeGalleryDto extends PartialType(
  CreateCollegeGalleryDto,
) {}
