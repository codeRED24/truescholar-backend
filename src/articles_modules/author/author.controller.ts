import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
  UseGuards,
} from "@nestjs/common";
import { AuthorService } from "./author.service";
import { CreateAuthorDto } from "./dto/create-author.dto";
import { UpdateAuthorDto } from "./dto/update-author.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";

@ApiTags("authors")
@Controller("authors")
// @UseGuards(JwtAuthGuard)
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Get()
  @ApiOperation({ summary: "Get all authors" })
  @ApiQuery({
    name: "author_name",
    required: false,
    description: "Name of the author",
  })
  @ApiResponse({ status: 200, description: "List of authors." })
  findAll(@Query("author_name") author_name?: string) {
    return this.authorService.findAll(author_name);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an author by ID" })
  @ApiResponse({ status: 200, description: "Author details." })
  @ApiResponse({ status: 404, description: "Author not found." })
  findOne(@Param("id") id: number) {
    return this.authorService.findOne(id);
  }

  @Get("author-data/:id")
  @ApiOperation({ summary: "Get all the content written by the author" })
  @ApiResponse({ status: 200, description: "Authors data" })
  @ApiResponse({ status: 404, description: "Author not found" })
  async getAuthorData(@Param("id") id: number) {
    return this.authorService.getAuthorData(id);
  }
  

  @Post()
  @ApiOperation({ summary: "Create a new author" })
  @ApiResponse({ status: 201, description: "Author created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(@Body(ValidationPipe) createAuthorDto: CreateAuthorDto) {
    return this.authorService.create(createAuthorDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an author" })
  @ApiResponse({ status: 200, description: "Author updated successfully." })
  @ApiResponse({ status: 404, description: "Author not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateAuthorDto: UpdateAuthorDto
  ) {
    return this.authorService.update(id, updateAuthorDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an author" })
  @ApiResponse({ status: 200, description: "Author deleted successfully." })
  @ApiResponse({ status: 404, description: "Author not found." })
  delete(@Param("id") id: number) {
    return this.authorService.delete(id);
  }
}
