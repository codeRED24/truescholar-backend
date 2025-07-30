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
} from "@nestjs/common";
import { CollegeInfoService } from "./college-info.service";
import { CreateCollegeInfoDto } from "./dto/create-college-info.dto";
import { UpdateCollegeInfoDto } from "./dto/update-college-info.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import {
  CollegeGroupedResponseDto,
  CollegeGroupedHighlightsResponseDto,
  CollegeGroupedScholarshipResponseDto,
  CollegeNewsResponseDto,
  CollegeWiseNewsResponseDto,
} from "./dto/college-grouped-response.dto";
import { CutOffDto } from "./dto/cutoff-response.dto";
import { RankingDto } from "./dto/ranking-response.dto";
import { InfrastructureDto } from "./dto/infrastructure-response.dto";
import { CollegeListingResponseDto } from "./dto/college-listing.dto";
import { StreamListingDto } from "./dto/stream-listing.dto";
import { CityListingDto } from "./dto/city-listing.dto";
import { CutoffDto } from "../../helper_entities/college-comparision/dto/college-comparision.dto";

@ApiTags("college-info")
@Controller("college-info")
export class CollegeInfoController {
  constructor(private readonly collegeInfoService: CollegeInfoService) {}

  @Get("search")
  async searchColleges(@Query("q") query: string) {
    return this.collegeInfoService.searchColleges(query);
  }

  @Get()
  @ApiOperation({ summary: "Get all college info" })
  @ApiQuery({
    name: "college_name",
    required: false,
    description: "Name of the college",
  })
  @ApiQuery({
    name: "city_id",
    required: false,
    description: "ID of the city",
  })
  @ApiQuery({
    name: "state_id",
    required: false,
    description: "ID of the state",
  })
  @ApiQuery({
    name: "country_id",
    required: false,
    description: "ID of the country",
  })
  @ApiQuery({
    name: "stream_name",
    required: false,
    description: "ID of the stream",
  })
  @ApiQuery({
    name: "is_active",
    required: false,
    description: "Filter colleges by active status (true or false)",
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number",
    schema: { default: 1 },
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of colleges to fetch",
    schema: { default: 100 },
  })
  @ApiResponse({ status: 200, description: "List of college info." })
  findAll(
    @Query("college_name") college_name?: string,
    @Query("city_name") city_name?: string,
    @Query("state_name") state_name?: string,
    // @Query("country_id") country_id?: number,
    @Query("type_of_institute") type_of_institute?: string,
    @Query("stream_name") stream_name?: string,
    @Query("is_active") is_active?: boolean,
    @Query("fee_range") fee_range?: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 51000
  ): Promise<CollegeListingResponseDto> {
    // console.log({
    //   city_name,
    //   state_name,
    //   // country_id,
    //   type_of_institute,
    //   stream_name,
    //   fee_range,
    //   is_active,
    //   page,
    //   limit,
    // });
    const citiesArray = city_name
      ? city_name.split(",").map((s) => s.trim())
      : undefined;
    const statesArray = state_name
      ? state_name.split(",").map((s) => s.trim())
      : undefined;
    const streamsArray = stream_name
      ? stream_name.split(",").map((s) => s.trim())
      : undefined;
    const typeOfInstituteArray = type_of_institute
      ? type_of_institute.split(",").map((s) => s.trim())
      : undefined;
    const feeRangeArray = fee_range
      ? fee_range.split(",").map((s) => s.trim())
      : undefined;

    // console.log({
    //   citiesArray,
    //   statesArray,
    //   streamsArray,
    //   typeOfInstituteArray,
    //   feeRangeArray,
    // });
    return this.collegeInfoService.findAll(
      college_name,
      citiesArray,
      statesArray,
      // country_id,
      typeOfInstituteArray,
      streamsArray,
      feeRangeArray,
      is_active,
      page,
      limit
    );
  }

  @Get("by-stream")
  @ApiOperation({ summary: "Get all college info" })
  @ApiQuery({
    name: "college_name",
    required: false,
    description: "Name of the college",
  })
  @ApiQuery({
    name: "city_id",
    required: false,
    description: "ID of the city",
  })
  @ApiQuery({
    name: "state_id",
    required: false,
    description: "ID of the state",
  })
  @ApiQuery({
    name: "country_id",
    required: false,
    description: "ID of the country",
  })
  @ApiQuery({
    name: "stream_id",
    required: false,
    description: "ID of the stream",
  })
  @ApiQuery({
    name: "is_active",
    required: false,
    description: "Filter colleges by active status (true or false)",
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number",
    schema: { default: 1 },
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of colleges to fetch",
    schema: { default: 100 },
  })
  @ApiResponse({ status: 200, description: "List of college info." })
  findByPrimaryStreamLogic(
    @Query("college_name") college_name?: string,
    @Query("city_id") city_id?: number,
    @Query("state_id") state_id?: number,
    @Query("country_id") country_id?: number,
    @Query("primary_stream_id") primary_stream_id?: number,
    @Query("is_active") is_active?: boolean,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 51000
  ): Promise<CollegeListingResponseDto> {
    return this.collegeInfoService.findByPrimaryStreamLogic(
      college_name,
      city_id,
      state_id,
      country_id,
      primary_stream_id,
      is_active,
      page,
      limit
    );
  }

  @Get(":id/grouped")
  @ApiOperation({ summary: "Get college info by ID" })
  @ApiResponse({ status: 200, description: "College info details." })
  @ApiResponse({ status: 404, description: "College info not found." })
  findOne(@Param("id") id: number) {
    return this.collegeInfoService.findOne(id);
  }

  @Get("info/:id")
  @ApiResponse({
    status: 200,
    description:
      "Grouped response with various sections for the given college.",
    type: CollegeGroupedResponseDto,
  })
  async findOneGrouped(
    @Param("id") id: number,
    @Query("schema") schema?: boolean // Optional query parameter
  ): Promise<CollegeGroupedResponseDto> {
    return this.collegeInfoService.findOneGrouped(id, schema);
  }

  @Get("highlights/:id")
  @ApiResponse({
    status: 200,
    description:
      "Grouped response with various sections for the given college.",
    type: CollegeGroupedHighlightsResponseDto,
  })
  async xfindOneGroupedHighlights(
    @Param("id") id: number,
    @Query("schema") schema?: boolean
  ) {
    return this.collegeInfoService.findOneGroupedHighlights(id, schema);
  }

  @Get("scholarship/:id")
  @ApiResponse({
    status: 200,
    description:
      "Grouped response with various sections for the given college.",
    type: CollegeGroupedScholarshipResponseDto,
  })
  async findOneGroupedScholarship(
    @Param("id") id: number,
    @Query("schema") schema?: boolean
  ) {
    return this.collegeInfoService.findOneGroupedScholarship(id, schema);
  }

  @Post()
  @ApiOperation({ summary: "Create new college info" })
  @ApiResponse({
    status: 201,
    description: "College info created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(@Body(ValidationPipe) createCollegeInfoDto: CreateCollegeInfoDto) {
    return this.collegeInfoService.create(createCollegeInfoDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update college info" })
  @ApiResponse({
    status: 200,
    description: "College info updated successfully.",
  })
  @ApiResponse({ status: 404, description: "College info not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateCollegeInfoDto: UpdateCollegeInfoDto
  ) {
    return this.collegeInfoService.update(id, updateCollegeInfoDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete college info" })
  @ApiResponse({
    status: 200,
    description: "College info deleted successfully.",
  })
  @ApiResponse({ status: 404, description: "College info not found." })
  delete(@Param("id") id: number) {
    return this.collegeInfoService.delete(id);
  }

  @Get("courses-and-fees/:id")
  async getCoursesAndFees(
    @Param("id") id: number,
    @Query("schema") schema?: boolean
  ) {
    return this.collegeInfoService.getCoursesAndFees(id, schema);
  }

  @Get("courses-filters/:id")
  async getCoursesFilters(
    @Param("id") id: number,
    @Query("stream_name") stream_name?: string,
    @Query("level") level?: string,
    @Query("mode") mode?: string,
    @Query("course_group_full_name") course_group_full_name?: string
  ) {
    return this.collegeInfoService.getCoursesFilters(
      id,
      stream_name,
      level,
      mode,
      course_group_full_name
    );
  }

  @Get("fees/:id")
  async getFees(@Param("id") id: number, @Query("schema") schema?: boolean) {
    return this.collegeInfoService.getFees(id, schema);
  }

  @Get("faq/:id")
  async getFaq(@Param("id") id: number, @Query("schema") schema?: boolean) {
    return this.collegeInfoService.getFaqData(id, schema);
  }

  @Get("admission-process/:id")
  async getAdmissionProcess(
    @Param("id") id: number,
    @Query("schema") schema?: boolean
  ) {
    return this.collegeInfoService.getAdmissionProcess(id, schema);
  }

  @Get("placement-process/:id")
  async getPlacementProcess(@Param("id") id: number) {
    return this.collegeInfoService.getPlacementProcess(id);
  }

  @Get("cutoffs/:id")
  async getCutOffProcess(
    @Param("id") id: number,
    @Query("schema") schema?: boolean
  ): Promise<CutOffDto> {
    const response = await this.collegeInfoService.getCutOffProcess(id, schema);
    return response;
  }

  @Get("/cutoffs-data/:id")
  async getCutOffData(
    @Param("id") id: number,
    @Query("schema") schema?: boolean
  ): Promise<CutoffDto> {
    return this.collegeInfoService.getCutOffData(id, schema);
  }

  @Get("cutoffs-filters/:id")
  async getCutoffsFilters(
    @Param("id") id: number,
    @Query("exam_id") exam_id?: number,
    @Query("category_section") category?: string,
    @Query("quota_section") quota?: string,
    @Query("round_section") round?: string,
    @Query("gender_section") gender?: string
  ) {
    return this.collegeInfoService.getCutoffsFilters(
      id,
      exam_id,
      round,
      gender,
      category,
      quota
    );
  }

  @Get("filtered-cutoffs/:id")
  async getCutoffsData(
    @Param("id") id: number,
    @Query("exam_id") exam_id?: number,
    @Query("category_section") category?: string,
    @Query("quota_section") quota?: string,
    @Query("round_section") round?: string,
    @Query("gender_section") gender?: string,
    @Query("page") page: number = 1
  ): Promise<any> {
    return this.collegeInfoService.getFilteredCutOffData(
      id,
      exam_id,
      category,
      quota,
      round,
      gender,
      page
    );
  }

  @Get("rankings/:id")
  async getRankings(
    @Param("id") id: number,
    @Query("schema") schema?: boolean // Optional query parameter
  ): Promise<RankingDto> {
    return this.collegeInfoService.getRankings(id, schema);
  }

  @Get("infrastructure/:id")
  async getInfrastructure(
    @Param("id") id: number,
    @Query("schema") schema?: boolean // Optional query parameter
  ): Promise<InfrastructureDto> {
    return this.collegeInfoService.getInfrastructure(id, schema);
  }

  @Get("/news/:id")
  async getNews(
    @Param("id") id: number,
    @Query("schema") schema?: boolean
  ): Promise<CollegeNewsResponseDto> {
    return this.collegeInfoService.getNews(id, schema);
  }

  @Get("/college-wise-news/:college_content_id")
  async getCollegeWiseNews(
    @Param("college_content_id") college_content_id: number,
    @Query("schema") schema?: boolean
  ): Promise<CollegeWiseNewsResponseDto> {
    return this.collegeInfoService.getCollegeWiseNews(
      college_content_id,
      schema
    );
  }

  // Creating BULK API
  @Post("bulk")
  @ApiOperation({ summary: "Create new college info in bulk" })
  @ApiResponse({
    status: 201,
    description: "Bulk college info created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  createBulk(
    @Body(ValidationPipe) createCollegeInfoDtos: CreateCollegeInfoDto[]
  ) {
    return this.collegeInfoService.createBulk(createCollegeInfoDtos);
  }

  @Get("stream-listing")
  @ApiOperation({ summary: "Get stream listing with college count" })
  @ApiResponse({
    status: 200,
    description: "List of streams with college count.",
  })
  async getStreamListing(): Promise<StreamListingDto[]> {
    return this.collegeInfoService.getStreamListing();
  }

  @Get("cities-listing")
  @ApiOperation({ summary: "Get city listing with college count" })
  @ApiResponse({ status: 200, description: "City listing with college count." })
  async getCityListing(): Promise<CityListingDto[]> {
    return this.collegeInfoService.getCityListing();
  }
}
