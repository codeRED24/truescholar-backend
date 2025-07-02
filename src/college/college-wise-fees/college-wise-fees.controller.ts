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
  ParseIntPipe,
} from "@nestjs/common";
import { CollegeWiseFeesService } from "./college-wise-fees.service";
import { CreateCollegeWiseFeesDto } from "./dto/create-collegewisefees.dto";
import { UpdateCollegeWiseFeesDto } from "./dto/update-collegewisefees.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";

@ApiTags("collegewisefees")
@Controller("collegewisefees")
// @UseGuards(JwtAuthGuard)
export class CollegeWiseFeesController {
  constructor(
    private readonly collegeWiseFeesService: CollegeWiseFeesService
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all college wise fees" })
  @ApiQuery({
    name: "collegewise_fees_id",
    required: false,
    description: "collegewise_fees_id ID of the fees",
  })
  @ApiResponse({ status: 200, description: "List of college wise fees." })
  findAll(@Query("collegewise_fees_id") collegewise_fees_id?: number) {
    return this.collegeWiseFeesService.findAll(collegewise_fees_id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get college wise fees by ID" })
  @ApiResponse({ status: 200, description: "College wise fees details." })
  @ApiResponse({ status: 404, description: "College wise fees not found." })
  findOne(@Param("id") id: number) {
    return this.collegeWiseFeesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create new college wise fees" })
  @ApiResponse({
    status: 201,
    description: "College wise fees created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(
    @Body(ValidationPipe) createCollegeWiseFeesDto: CreateCollegeWiseFeesDto
  ) {
    return this.collegeWiseFeesService.create(createCollegeWiseFeesDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update college wise fees" })
  @ApiResponse({
    status: 200,
    description: "College wise fees updated successfully.",
  })
  @ApiResponse({ status: 404, description: "College wise fees not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateCollegeWiseFeesDto: UpdateCollegeWiseFeesDto
  ) {
    return this.collegeWiseFeesService.update(id, updateCollegeWiseFeesDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete college wise fees" })
  @ApiResponse({
    status: 200,
    description: "College wise fees deleted successfully.",
  })
  @ApiResponse({ status: 404, description: "College wise fees not found." })
  delete(@Param("id") id: number) {
    return this.collegeWiseFeesService.delete(id);
  }

  // Get the college_content data by using college_id
  @Get("by-college")
  @ApiOperation({ summary: "Get college wise fees by College ID" })
  @ApiQuery({
    name: "cid",
    required: true,
    description: "College ID to fetch related college_wise_fees",
  })
  @ApiResponse({ status: 200, description: "List of college content." })
  async findByCollegeId(@Query("cid", ParseIntPipe) collegeId: number) {
    return this.collegeWiseFeesService.findByCollegeId(collegeId);
  }

  @Post("bulk")
  @ApiOperation({ summary: "Create multiple college wise fees entries" })
  @ApiResponse({
    status: 201,
    description: "College wise fees entries created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  createBulk(
    @Body(ValidationPipe) createCollegeWiseFeesDtos: CreateCollegeWiseFeesDto[]
  ) {
    return this.collegeWiseFeesService.createBulk(createCollegeWiseFeesDtos);
  }
}
