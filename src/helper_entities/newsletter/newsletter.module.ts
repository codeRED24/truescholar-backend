import { Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Newsletter } from './newsletter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Newsletter])],
  controllers: [NewsletterController],
  providers: [NewsletterService],
})
export class NewsletterModule {}
