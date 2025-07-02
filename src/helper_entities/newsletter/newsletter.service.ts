import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Newsletter } from './newsletter.entity';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(Newsletter)
    private readonly newsletterRepository: Repository<Newsletter>,
  ) {}

  findAll(): Promise<Newsletter[]> {
    return this.newsletterRepository.find();
  }

  create(createNewsletterDto: CreateNewsletterDto): Promise<Newsletter> {
    const newsletter = this.newsletterRepository.create(createNewsletterDto);
    return this.newsletterRepository.save(newsletter);
  }
}
