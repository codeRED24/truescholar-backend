import { Controller, Get, Res, Param } from "@nestjs/common";
import { Response } from "express";
import { SitemapService } from "../sitemaps/sitemap.service";
import { join } from "path";
import { existsSync, createReadStream } from "fs";

@Controller("sitemap")
export class SitemapController {
  private sitemapDirectory = join(process.cwd(), "public"); // Dynamic directory path

  constructor(private readonly sitemapService: SitemapService) {}

  /**
   * Generates and returns the Google News sitemap dynamically.
   */
  @Get("news.xml")
  async getNewsSitemap(@Res() res: Response): Promise<void> {
    try {
      const sitemap = await this.sitemapService.generateNewsSitemap();
      res.header("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating news sitemap:", error);
      res.status(500).send("❌ Internal server error.");
    }
  }

  /**
   * Generates and returns the updates sitemap dynamically.
   */
  @Get("latest-updates.xml")
  async getUpdatesSitemap(@Res() res: Response): Promise<void> {
    try {
      const sitemap = await this.sitemapService.generateUpdatesSitemap();
      res.header("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating updates sitemap:", error);
      res.status(500).send("❌ Internal server error.");
    }
  }

  @Get("index-updates.xml")
  async getSitemapIndex(@Res() res: Response): Promise<void> {
    try {
      const sitemap = await this.sitemapService.generateSitemapIndex();
      // const filePath = join(process.cwd(), "public", "index-updates.xml");

      res.header("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (err) {
      console.log(err);
    }
  }

  @Get("sitemap-articles_:index.xml")
  async getArticleSitemap(
    @Param("index") index: string,
    @Res() res: Response
  ): Promise<void> {
    try {
      const sitemapIndex = parseInt(index, 10); // Convert the string index to a number
      const sitemap =
        await this.sitemapService.generateArticleSitemaps(sitemapIndex);

      res.header("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error generating sitemap");
    }
  }

  @Get("sitemap-news_:index.xml")
  async getNewSitemap(
    @Param("index") index: string,
    @Res() res: Response
  ): Promise<void> {
    try {
      const sitemapIndex = parseInt(index, 10); // Convert the string index to a number
      const sitemap =
        await this.sitemapService.generateNewsSitemaps(sitemapIndex);

      res.header("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error generating sitemap");
    }
  }

  @Get("sitemap-college-:silos-:index.xml")
  async getCollegeContentSitemap(
    @Param("silos") silos: string,
    @Param("index") index: string,
    @Res() res: Response
  ): Promise<void> {
    try {
      // console.log(`Silos: ${silos}, Index: ${index}`); // Debugging the parameters
      const sitemapIndex = parseInt(index, 10); // Convert the string index to a number
      const sitemap = await this.sitemapService.generateCollegeContentSitemaps(
        sitemapIndex,
        silos
      );

      res.header("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (err) {
      console.error("Error generating sitemap:", err);
      res.status(500).send("Error generating sitemap");
    }
  }

  @Get("sitemap-exam-:silos-:index.xml")
  async getExamContentSitemap(
    @Param("silos") silos: string,
    @Param("index") index: string,
    @Res() res: Response
  ): Promise<void> {
    try {
      console.log(`Silos: ${silos}, Index: ${index}`); // Debugging the parameters
      const sitemapIndex = parseInt(index, 10); // Convert the string index to a number
      const sitemap = await this.sitemapService.generateExamContentSitemaps(
        sitemapIndex,
        silos
      );

      res.header("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (err) {
      console.error("Error generating exam sitemap:", err);
      res.status(500).send("Error generating exam sitemap");
    }
  }
}
