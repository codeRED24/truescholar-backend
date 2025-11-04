import { Controller, Get, Post, Body } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { ApiTags } from '@nestjs/swagger';
import { sendEmail } from '../../utils/email';

@ApiTags('newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Get()
  findAll() {
    return this.newsletterService.findAll();
  }

  @Post()
  async create(@Body() createNewsletterDto: CreateNewsletterDto) {
    const newsletter = await this.newsletterService.create(createNewsletterDto);
    if (process.env.TO_EMAIL) {
      sendEmail('New Newsletter Subscription', 'new-newsletter-subscription', {
        email: newsletter.email,
      });
    }
    return newsletter;
  }
}
