import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { CollegeMemberService } from "./college-member.service";
import { AuthGuard } from "../authentication_module/better-auth/guards/auth.guard";
import { User } from "../authentication_module/better-auth/decorators/auth.decorators";
import { CollegeRole } from "../common/enums";

@ApiTags("User Memberships")
@Controller("memberships")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UserMembershipController {
  constructor(private readonly collegeMemberService: CollegeMemberService) {}

  @Get("me")
  @ApiOperation({ summary: "Get current user's college memberships" })
  @ApiQuery({ name: "role", required: false, enum: CollegeRole, description: "Filter by role" })
  @ApiResponse({ status: 200, description: "List of memberships" })
  async getMyMemberships(
    @User() user: { id: string },
    @Query("role") role?: CollegeRole
  ) {
    const memberships = await this.collegeMemberService.getMembershipsByUser(user.id);
    
    // Filter by role if specified
    if (role) {
      return memberships.filter(m => m.role === role);
    }
    
    return memberships;
  }
}
