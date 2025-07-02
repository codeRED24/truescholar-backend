import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { ArticlesService } from "./articles.service";
import { CreateArticleDto } from "./dto/create-articles.dto";
import { UpdateArticleDto } from "./dto/update-articles.dto";
import { Article } from "./articles.entity";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";

@ApiTags("articles")
@Controller("articles")
// @UseGuards(JwtAuthGuard)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @ApiOperation({ summary: "Create an article" }) // Describes the operation
  @ApiResponse({ status: 201, description: "Article created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(@Body() createArticleDto: CreateArticleDto): Promise<Article> {
    return this.articlesService.create(createArticleDto);
  }


  @Get()
  @ApiOperation({ summary: "Get all articles or filter by author_id and tag with pagination" })
  @ApiResponse({ status: 200, description: "List of all articles." })
  async findAll(
    @Query('author_id') author_id?: number,
    @Query('page') page: number = 1,
    @Query('pageSize') limit: number = 16,
    @Query('tag') tag?: string, 
  ): Promise<any> {
    return this.articlesService.findAll(author_id, page, limit, tag);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an article by ID" })
  @ApiResponse({ status: 200, description: "Article details." })
  @ApiResponse({ status: 404, description: "Article not found." })
  findOne(@Param("id") id: number): Promise<Article> {
    return this.articlesService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an article" })
  @ApiResponse({ status: 200, description: "Article updated successfully." })
  @ApiResponse({ status: 404, description: "Article not found." })
  update(
    @Param("id") id: number,
    @Body() updateArticleDto: UpdateArticleDto
  ): Promise<{ message: string; data?: Article }> {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an article" })
  @ApiResponse({ status: 200, description: "Article deleted successfully." })
  @ApiResponse({ status: 404, description: "Article not found." })
  delete(@Param("id") id: number): Promise<{ message: string }> {
    return this.articlesService.delete(id);
  }

  @Get("/listing")
  @ApiOperation({
    summary:
      "Get article listing with basic_info, college_content, and exam_content",
  })
  @ApiResponse({
    status: 200,
    description: "Article listing fetched successfully.",
  })
  getArticleListing(): Promise<any> {
    return this.articlesService.getArticleListing();
  }
}
