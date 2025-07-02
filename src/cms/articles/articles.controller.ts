import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  Put,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { ArticlesService } from "./articles.service";
import { CreateArticleCMSDto } from "./dto/create-article.dto";
import { UpdateArticleCMSDto } from "./dto/update-article.dto";
import { filterArticleDTO } from "./dto/filter-article.dto";
import { JwtCmsAuthGuard } from "../auth/jwt.cmsAuth.guard";
import { RolesGuard } from "../auth/utils/roles.guard";
import { Roles } from "../auth/utils/roles.decorator";
import { File, FileInterceptor } from "@nest-lab/fastify-multer";

@Controller("cms-articles")
@UseGuards(JwtCmsAuthGuard)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post("/create")
  @UseInterceptors(FileInterceptor("og_featured_img"))
  create(
    @Body(ValidationPipe) createArticleCMSDto: CreateArticleCMSDto,
    @Req() req: any,
    @UploadedFile() og_featured_img?: File
  ) {
    const user_id = req.user?.userId;
    return this.articlesService.create(createArticleCMSDto, user_id, og_featured_img);
  }

  @Get("/all")
  findAll(@Query(ValidationPipe) filter: filterArticleDTO) {
    const {
      title,
      is_active,
      status,
      author_name,
      article_id,
      page = 1,
      limit = 10,
    } = filter;
    return this.articlesService.getAll(
      {
        title,
        is_active,
        status,
        author_name,
        article_id,
      },
      page || 1,
      limit || 10
    );
  }

  @Get("/:article_id")
  findOne(@Param("article_id") article_id: number) {
    return this.articlesService.getOne(article_id);
  }

  @Put("/update/:article_id")
  @UseInterceptors(FileInterceptor("og_featured_img"))
  async update(
    @Param("article_id") article_id: number,
    @Body() updateArticleCMSDto: UpdateArticleCMSDto,
    @Req() req: any,
    @UploadedFile() og_featured_img?: File
  ) {
    const user_id = req.user?.userId;
    return this.articlesService.update(
      article_id,
      updateArticleCMSDto,
      user_id,
      og_featured_img
    );
  }

  @UseGuards(RolesGuard)
  @Roles("admin")
  @Delete("/delete/:article_id")
  async remove(@Param("article_id") article_id: number, @Req() req: any) {
    const user_id = req.user?.userId;
    return this.articlesService.remove(article_id, user_id);
  }

  @Get("/search")
  async searchExam(
    @Query("article_name") article_name: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20
  ) {
    return this.articlesService.searchArticle(
      article_name,
      page || 1,
      limit || 20
    );
  }
}
