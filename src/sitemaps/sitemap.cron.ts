import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SitemapRepository } from './sitemap.repository';
import { SitemapService } from './sitemap.service';
import { generateNewsSitemap } from './sitemap.utils';
import { writeFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class SitemapCron {
//   constructor(
//     private readonly sitemapRepository: SitemapRepository,
//     private readonly sitemapService: SitemapService,
//   ) {}

//   @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
//   async generateNewsSitemap() {
//     try {
//       const articles = await this.sitemapRepository.getRecentNews();
//       const xml = generateNewsSitemap(articles);
//       const sitemapPath = join(__dirname, '../../public/sitemap-news.xml');
//       writeFileSync(sitemapPath, xml);
//       console.log('Sitemap generated successfully!');
//     } catch (error) {
//       console.error('Error generating sitemap:', error);
//     }
//   }
}
