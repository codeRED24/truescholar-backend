import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CollegeMemberService } from "./college-member.service";
import { AddMemberDto, UpdateRoleDto } from "./dto";
import { AuthGuard } from "../authentication_module/better-auth/guards/auth.guard";
import { PoliciesGuard, CheckPolicies } from "../casl";

@ApiTags("College Members")
@Controller("colleges/:collegeId/members")
@UseGuards(AuthGuard, PoliciesGuard)
@ApiBearerAuth()
export class CollegeMemberController {
  constructor(private readonly collegeMemberService: CollegeMemberService) {}

  @Post()
  @CheckPolicies({ action: "create", subject: "Member" })
  @ApiOperation({ summary: "Add a member to a college" })
  @ApiResponse({ status: 201, description: "Member added successfully" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  @ApiResponse({ status: 404, description: "College or user not found" })
  @ApiResponse({ status: 409, description: "User is already a member" })
  async addMember(
    @Param("collegeId", ParseIntPipe) collegeId: number,
    @Body() dto: AddMemberDto
  ) {
    return this.collegeMemberService.addMember(collegeId, dto.userId, dto.role);
  }

  @Get()
  @CheckPolicies({ action: "read", subject: "Member" })
  @ApiOperation({ summary: "List all members of a college" })
  @ApiResponse({ status: 200, description: "List of members" })
  async getMembers(@Param("collegeId", ParseIntPipe) collegeId: number) {
    return this.collegeMemberService.getMembersByCollege(collegeId);
  }

  @Get(":userId")
  @CheckPolicies({ action: "read", subject: "Member" })
  @ApiOperation({ summary: "Get a specific membership" })
  @ApiResponse({ status: 200, description: "Membership details" })
  @ApiResponse({ status: 404, description: "Membership not found" })
  async getMembership(
    @Param("collegeId", ParseIntPipe) collegeId: number,
    @Param("userId") userId: string
  ) {
    return this.collegeMemberService.getMembership(collegeId, userId);
  }

  @Patch(":userId")
  @CheckPolicies({ action: "update", subject: "Member" })
  @ApiOperation({ summary: "Update a member's role" })
  @ApiResponse({ status: 200, description: "Role updated successfully" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  @ApiResponse({ status: 404, description: "Membership not found" })
  async updateRole(
    @Param("collegeId", ParseIntPipe) collegeId: number,
    @Param("userId") userId: string,
    @Body() dto: UpdateRoleDto
  ) {
    return this.collegeMemberService.updateRole(collegeId, userId, dto.role);
  }

  @Delete(":userId")
  @CheckPolicies({ action: "delete", subject: "Member" })
  @ApiOperation({ summary: "Remove a member from a college" })
  @ApiResponse({ status: 200, description: "Member removed successfully" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  @ApiResponse({ status: 404, description: "Membership not found" })
  async removeMember(
    @Param("collegeId", ParseIntPipe) collegeId: number,
    @Param("userId") userId: string
  ) {
    await this.collegeMemberService.removeMember(collegeId, userId);
    return { message: "Member removed successfully" };
  }
}
