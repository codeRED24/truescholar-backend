import { Module } from '@nestjs/common';
import { CmsAuthorsService } from './cms-authors.service';
import { CmsAuthorsController } from './cms-authors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from '../../articles_modules/author/author.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Author])],
  controllers: [CmsAuthorsController],
  providers: [CmsAuthorsService],
  exports: [CmsAuthorsService],
})
export class CmsAuthorsModule {}
