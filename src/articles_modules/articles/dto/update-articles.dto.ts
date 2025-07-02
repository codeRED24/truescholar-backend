import { PartialType } from '@nestjs/mapped-types';
import { CreateArticleDto } from './create-articles.dto';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {}
